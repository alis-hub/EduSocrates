import * as crypto from 'crypto';
import type { IncomingMessage } from 'http';
import type { Socket } from 'net';
import type { DatabaseService } from '../database/database.service';
import { PUBLIC_HUB_TENANT_ID } from '../database/database.service';

const MAX_FRAME_BYTES = 256 * 1024;
const MAX_BUFFER_BYTES = 512 * 1024;
const MAX_CLIENTS_PER_ROOM = 50;
const MAX_STROKES = 5000;
const MAX_NOTES = 500;
const MAX_MSGS_PER_SECOND = 60;

export interface WsAuth {
  /** Returns the verified access-token payload, or null if the token is invalid. */
  verifyToken: (token: string) => Promise<{ sub: string; schoolId: string } | null>;
  allowedOrigins: string[];
}

function reject(socket: Socket, status: string): void {
  try {
    socket.write(`HTTP/1.1 ${status}\r\nConnection: close\r\n\r\n`);
  } catch {}
  socket.destroy();
}

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

interface WsClient {
  socket: Socket;
  roomId: string;
  userId?: string;
  displayName?: string;
  buffer: Buffer;
  windowStart: number;
  windowCount: number;
}

const rooms = new Map<string, Set<WsClient>>();
const saveTimers = new Map<string, NodeJS.Timeout>();
const roomStates = new Map<string, { strokes: any[]; notes: any[] }>();

function encodeFrame(opcode: number, payload: Buffer): Buffer {
  const len = payload.length;
  let header: Buffer;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x80 | opcode;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

function sendJson(client: WsClient, data: unknown): void {
  if (client.socket.destroyed || !client.socket.writable) return;
  try {
    const payload = Buffer.from(JSON.stringify(data), 'utf8');
    client.socket.write(encodeFrame(0x1, payload));
  } catch {
    // Ignore broken pipe; cleanup happens on socket close
  }
}

function broadcast(roomId: string, data: unknown, except?: WsClient): void {
  const peers = rooms.get(roomId);
  if (!peers) return;
  for (const peer of peers) {
    if (peer !== except) {
      sendJson(peer, data);
    }
  }
}

function schedulePersist(db: DatabaseService, roomId: string): void {
  const existing = saveTimers.get(roomId);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(async () => {
    saveTimers.delete(roomId);
    const state = roomStates.get(roomId);
    if (!state) return;
    try {
      await db.query(
        `UPDATE whiteboard_rooms SET canvas_state = $1::jsonb WHERE id = $2`,
        [JSON.stringify(state), roomId],
      );
    } catch {
      // Room might not exist yet or transient DB hiccup
    }
  }, 600);
  saveTimers.set(roomId, timer);
}

function decodeFrames(client: WsClient, onMessage: (text: string) => void): void {
  while (client.buffer.length >= 2) {
    const byte1 = client.buffer[0];
    const byte2 = client.buffer[1];
    const opcode = byte1 & 0x0f;
    const masked = (byte2 & 0x80) !== 0;
    let payloadLen = byte2 & 0x7f;
    let offset = 2;

    if (payloadLen === 126) {
      if (client.buffer.length < 4) return;
      payloadLen = client.buffer.readUInt16BE(2);
      offset = 4;
    } else if (payloadLen === 127) {
      if (client.buffer.length < 10) return;
      payloadLen = Number(client.buffer.readBigUInt64BE(2));
      offset = 10;
    }

    // Browsers must mask client frames (RFC 6455); oversized frames are an abuse signal.
    if (!masked || payloadLen > MAX_FRAME_BYTES) {
      client.socket.destroy();
      client.buffer = Buffer.alloc(0);
      return;
    }

    const maskLen = masked ? 4 : 0;
    const frameEnd = offset + maskLen + payloadLen;
    if (client.buffer.length < frameEnd) return;

    let payload = client.buffer.subarray(offset + maskLen, frameEnd);
    if (masked) {
      const mask = client.buffer.subarray(offset, offset + 4);
      const unmasked = Buffer.allocUnsafe(payloadLen);
      for (let i = 0; i < payloadLen; i++) {
        unmasked[i] = payload[i] ^ mask[i % 4];
      }
      payload = unmasked;
    }

    client.buffer = client.buffer.subarray(frameEnd);

    if (opcode === 0x8) {
      // Close frame
      try {
        client.socket.write(encodeFrame(0x8, Buffer.alloc(0)));
        client.socket.end();
      } catch {}
      return;
    }
    if (opcode === 0x9) {
      // Ping -> Pong
      try {
        client.socket.write(encodeFrame(0x0a, payload));
      } catch {}
      continue;
    }
    if (opcode === 0x1 || opcode === 0x0) {
      onMessage(payload.toString('utf8'));
    }
  }
}

export function attachWhiteboardWs(httpServer: any, db: DatabaseService, auth: WsAuth): void {
  if (!httpServer || typeof httpServer.on !== 'function') return;

  httpServer.on('upgrade', async (req: IncomingMessage, socket: Socket, head: Buffer) => {
    const rawUrl = req.url || '';
    const match = rawUrl.match(/^\/api\/v1\/whiteboard\/([0-9a-fA-F-]{8,64})(?:\?(.*))?$/);
    if (!match) {
      socket.destroy();
      return;
    }

    const roomId = match[1];
    const params = new URLSearchParams(match[2] || '');
    const key = req.headers['sec-websocket-key'];
    if (!key || Array.isArray(key)) {
      socket.destroy();
      return;
    }

    // Browsers send Origin on WebSocket handshakes; only our own sites may connect.
    const origin = req.headers.origin;
    if (origin && auth.allowedOrigins.length && !auth.allowedOrigins.includes(origin)) {
      reject(socket, '403 Forbidden');
      return;
    }

    // Room must exist; private rooms need a valid token from a member of the room's school.
    let roomRow: { school_id: string } | undefined;
    try {
      const found = await db.query<{ school_id: string }>(
        `SELECT school_id FROM whiteboard_rooms WHERE id = $1 AND is_active = TRUE`,
        [roomId],
      );
      roomRow = found[0];
    } catch {
      reject(socket, '404 Not Found');
      return;
    }
    if (!roomRow) {
      reject(socket, '404 Not Found');
      return;
    }
    let authedUserId: string | undefined;
    const token = params.get('token');
    if (token) {
      const payload = await auth.verifyToken(token);
      if (payload) authedUserId = payload.sub;
      if (payload && roomRow.school_id !== PUBLIC_HUB_TENANT_ID && payload.schoolId !== roomRow.school_id) {
        reject(socket, '403 Forbidden');
        return;
      }
    }
    if (roomRow.school_id !== PUBLIC_HUB_TENANT_ID && !authedUserId) {
      reject(socket, '401 Unauthorized');
      return;
    }
    if ((rooms.get(roomId)?.size ?? 0) >= MAX_CLIENTS_PER_ROOM) {
      reject(socket, '503 Service Unavailable');
      return;
    }

    const accept = crypto
      .createHash('sha1')
      .update(key + WS_GUID)
      .digest('base64');

    socket.write(
      [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${accept}`,
        '\r\n',
      ].join('\r\n'),
    );

    const client: WsClient = {
      socket,
      roomId,
      userId: authedUserId,
      displayName: (params.get('name') || 'Peer').replace(/[^\p{L}\p{N} _.-]/gu, '').slice(0, 40) || 'Peer',
      buffer: head && head.length > 0 ? Buffer.from(head) : Buffer.alloc(0),
      windowStart: Date.now(),
      windowCount: 0,
    };

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId)!.add(client);

    // Hydrate room state if not cached
    if (!roomStates.has(roomId)) {
      try {
        const res = await db.query<{ canvas_state: any }>(
          `SELECT canvas_state FROM whiteboard_rooms WHERE id = $1`,
          [roomId],
        );
        const loaded = res[0]?.canvas_state;
        roomStates.set(roomId, {
          strokes: Array.isArray(loaded?.strokes) ? loaded.strokes : [],
          notes: Array.isArray(loaded?.notes) ? loaded.notes : [],
        });
      } catch {
        roomStates.set(roomId, { strokes: [], notes: [] });
      }
    }

    sendJson(client, {
      type: 'INIT',
      roomId,
      state: roomStates.get(roomId),
      peerCount: rooms.get(roomId)?.size || 1,
    });
    broadcast(roomId, { type: 'PEER_COUNT', peerCount: rooms.get(roomId)?.size || 1 }, client);

    socket.on('data', (chunk: Buffer) => {
      if (client.buffer.length + chunk.length > MAX_BUFFER_BYTES) {
        socket.destroy();
        return;
      }
      client.buffer = Buffer.concat([client.buffer, chunk]);
      decodeFrames(client, (text) => {
        const now = Date.now();
        if (now - client.windowStart >= 1000) {
          client.windowStart = now;
          client.windowCount = 0;
        }
        if (++client.windowCount > MAX_MSGS_PER_SECOND) return; // drop flood
        try {
          const msg = JSON.parse(text);
          const state = roomStates.get(roomId) || { strokes: [], notes: [] };
          if (msg.type === 'STROKE' && msg.stroke) {
            if (state.strokes.length >= MAX_STROKES) return;
            state.strokes.push(msg.stroke);
            roomStates.set(roomId, state);
            broadcast(roomId, { type: 'STROKE', stroke: msg.stroke }, client);
            schedulePersist(db, roomId);
          } else if (msg.type === 'NOTE_ADD' && msg.note) {
            if (state.notes.length >= MAX_NOTES) return;
            state.notes.push(msg.note);
            roomStates.set(roomId, state);
            broadcast(roomId, { type: 'NOTE_ADD', note: msg.note }, client);
            schedulePersist(db, roomId);
          } else if (msg.type === 'SYNC_STATE' && msg.state) {
            const nextState = {
              strokes: Array.isArray(msg.state.strokes) ? msg.state.strokes.slice(0, MAX_STROKES) : [],
              notes: Array.isArray(msg.state.notes) ? msg.state.notes.slice(0, MAX_NOTES) : [],
            };
            roomStates.set(roomId, nextState);
            broadcast(roomId, { type: 'SYNC_STATE', state: nextState }, client);
            schedulePersist(db, roomId);
          } else if (msg.type === 'CLEAR') {
            const cleared = { strokes: [], notes: [] };
            roomStates.set(roomId, cleared);
            broadcast(roomId, { type: 'SYNC_STATE', state: cleared }, client);
            schedulePersist(db, roomId);
          } else if (msg.type === 'CURSOR') {
            broadcast(
              roomId,
              { type: 'CURSOR', x: Number(msg.x) || 0, y: Number(msg.y) || 0, sender: client.displayName },
              client,
            );
          }
        } catch {
          // Ignore malformed JSON frames
        }
      });
    });

    const cleanup = () => {
      const peers = rooms.get(roomId);
      if (peers) {
        peers.delete(client);
        broadcast(roomId, { type: 'PEER_COUNT', peerCount: peers.size });
        if (peers.size === 0) {
          rooms.delete(roomId);
        }
      }
    };

    socket.on('close', cleanup);
    socket.on('error', cleanup);
  });
}
