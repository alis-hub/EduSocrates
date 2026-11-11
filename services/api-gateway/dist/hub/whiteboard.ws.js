"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachWhiteboardWs = attachWhiteboardWs;
const crypto = __importStar(require("crypto"));
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const rooms = new Map();
const saveTimers = new Map();
const roomStates = new Map();
function encodeFrame(opcode, payload) {
    const len = payload.length;
    let header;
    if (len < 126) {
        header = Buffer.alloc(2);
        header[0] = 0x80 | opcode;
        header[1] = len;
    }
    else if (len < 65536) {
        header = Buffer.alloc(4);
        header[0] = 0x80 | opcode;
        header[1] = 126;
        header.writeUInt16BE(len, 2);
    }
    else {
        header = Buffer.alloc(10);
        header[0] = 0x80 | opcode;
        header[1] = 127;
        header.writeBigUInt64BE(BigInt(len), 2);
    }
    return Buffer.concat([header, payload]);
}
function sendJson(client, data) {
    if (client.socket.destroyed || !client.socket.writable)
        return;
    try {
        const payload = Buffer.from(JSON.stringify(data), 'utf8');
        client.socket.write(encodeFrame(0x1, payload));
    }
    catch {
    }
}
function broadcast(roomId, data, except) {
    const peers = rooms.get(roomId);
    if (!peers)
        return;
    for (const peer of peers) {
        if (peer !== except) {
            sendJson(peer, data);
        }
    }
}
function schedulePersist(db, roomId) {
    const existing = saveTimers.get(roomId);
    if (existing)
        clearTimeout(existing);
    const timer = setTimeout(async () => {
        saveTimers.delete(roomId);
        const state = roomStates.get(roomId);
        if (!state)
            return;
        try {
            await db.query(`UPDATE whiteboard_rooms SET canvas_state = $1::jsonb WHERE id = $2`, [JSON.stringify(state), roomId]);
        }
        catch {
        }
    }, 600);
    saveTimers.set(roomId, timer);
}
function decodeFrames(client, onMessage) {
    while (client.buffer.length >= 2) {
        const byte1 = client.buffer[0];
        const byte2 = client.buffer[1];
        const opcode = byte1 & 0x0f;
        const masked = (byte2 & 0x80) !== 0;
        let payloadLen = byte2 & 0x7f;
        let offset = 2;
        if (payloadLen === 126) {
            if (client.buffer.length < 4)
                return;
            payloadLen = client.buffer.readUInt16BE(2);
            offset = 4;
        }
        else if (payloadLen === 127) {
            if (client.buffer.length < 10)
                return;
            payloadLen = Number(client.buffer.readBigUInt64BE(2));
            offset = 10;
        }
        const maskLen = masked ? 4 : 0;
        const frameEnd = offset + maskLen + payloadLen;
        if (client.buffer.length < frameEnd)
            return;
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
            try {
                client.socket.write(encodeFrame(0x8, Buffer.alloc(0)));
                client.socket.end();
            }
            catch { }
            return;
        }
        if (opcode === 0x9) {
            try {
                client.socket.write(encodeFrame(0x0a, payload));
            }
            catch { }
            continue;
        }
        if (opcode === 0x1 || opcode === 0x0) {
            onMessage(payload.toString('utf8'));
        }
    }
}
function attachWhiteboardWs(httpServer, db) {
    if (!httpServer || typeof httpServer.on !== 'function')
        return;
    httpServer.on('upgrade', async (req, socket, head) => {
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
        const accept = crypto
            .createHash('sha1')
            .update(key + WS_GUID)
            .digest('base64');
        socket.write([
            'HTTP/1.1 101 Switching Protocols',
            'Upgrade: websocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Accept: ${accept}`,
            '\r\n',
        ].join('\r\n'));
        const client = {
            socket,
            roomId,
            userId: params.get('userId') || undefined,
            displayName: params.get('name') || 'Peer',
            buffer: head && head.length > 0 ? Buffer.from(head) : Buffer.alloc(0),
        };
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(client);
        if (!roomStates.has(roomId)) {
            try {
                const res = await db.query(`SELECT canvas_state FROM whiteboard_rooms WHERE id = $1`, [roomId]);
                const loaded = res[0]?.canvas_state;
                roomStates.set(roomId, {
                    strokes: Array.isArray(loaded?.strokes) ? loaded.strokes : [],
                    notes: Array.isArray(loaded?.notes) ? loaded.notes : [],
                });
            }
            catch {
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
        socket.on('data', (chunk) => {
            client.buffer = Buffer.concat([client.buffer, chunk]);
            decodeFrames(client, (text) => {
                try {
                    const msg = JSON.parse(text);
                    const state = roomStates.get(roomId) || { strokes: [], notes: [] };
                    if (msg.type === 'STROKE' && msg.stroke) {
                        state.strokes.push(msg.stroke);
                        roomStates.set(roomId, state);
                        broadcast(roomId, { type: 'STROKE', stroke: msg.stroke }, client);
                        schedulePersist(db, roomId);
                    }
                    else if (msg.type === 'NOTE_ADD' && msg.note) {
                        state.notes.push(msg.note);
                        roomStates.set(roomId, state);
                        broadcast(roomId, { type: 'NOTE_ADD', note: msg.note }, client);
                        schedulePersist(db, roomId);
                    }
                    else if (msg.type === 'SYNC_STATE' && msg.state) {
                        const nextState = {
                            strokes: Array.isArray(msg.state.strokes) ? msg.state.strokes : [],
                            notes: Array.isArray(msg.state.notes) ? msg.state.notes : [],
                        };
                        roomStates.set(roomId, nextState);
                        broadcast(roomId, { type: 'SYNC_STATE', state: nextState }, client);
                        schedulePersist(db, roomId);
                    }
                    else if (msg.type === 'CLEAR') {
                        const cleared = { strokes: [], notes: [] };
                        roomStates.set(roomId, cleared);
                        broadcast(roomId, { type: 'SYNC_STATE', state: cleared }, client);
                        schedulePersist(db, roomId);
                    }
                    else if (msg.type === 'CURSOR') {
                        broadcast(roomId, { ...msg, sender: client.displayName }, client);
                    }
                }
                catch {
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
//# sourceMappingURL=whiteboard.ws.js.map