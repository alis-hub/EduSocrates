'use client';
import { useEffect, useRef, useState } from 'react';
import { api, getWsBaseUrl } from '@/lib/api';
import { Eraser, PenTool, StickyNote, Trash2, Users, Wifi, WifiOff } from 'lucide-react';

interface Stroke {
  color: string;
  width: number;
  points: Array<[number, number]>;
}

interface Note {
  id: string;
  text: string;
  x: number;
  y: number;
}

const COLORS = ['#1e293b', '#2563eb', '#dc2626', '#059669', '#9333ea'];

export function WhiteboardCanvas({
  roomId,
  initialState,
  userName = 'Learner',
}: {
  roomId: string;
  initialState?: { strokes?: Stroke[]; notes?: Note[] };
  userName?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);

  const [strokes, setStrokes] = useState<Stroke[]>(initialState?.strokes || []);
  const [notes, setNotes] = useState<Note[]>(initialState?.notes || []);
  const [color, setColor] = useState(COLORS[1]);
  const [lineWidth, setLineWidth] = useState(3);
  const [noteText, setNoteText] = useState('');
  const [connected, setConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(1);

  const redraw = (list: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of list) {
      if (!s.points || s.points.length === 0) continue;
      ctx.strokeStyle = s.color || '#1e293b';
      ctx.lineWidth = s.width || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(s.points[0][0], s.points[0][1]);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i][0], s.points[i][1]);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    redraw(strokes);
  }, [strokes]);

  useEffect(() => {
    let closed = false;
    const wsUrl = `${getWsBaseUrl()}/whiteboard/${roomId}?name=${encodeURIComponent(userName)}`;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!closed) setConnected(true);
      };
      ws.onclose = () => {
        if (!closed) setConnected(false);
      };
      ws.onerror = () => {
        if (!closed) setConnected(false);
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'INIT' && msg.state) {
            setStrokes(msg.state.strokes || []);
            setNotes(msg.state.notes || []);
            if (msg.peerCount) setPeerCount(msg.peerCount);
          } else if (msg.type === 'STROKE' && msg.stroke) {
            setStrokes((prev) => [...prev, msg.stroke]);
          } else if (msg.type === 'NOTE_ADD' && msg.note) {
            setNotes((prev) => [...prev, msg.note]);
          } else if (msg.type === 'SYNC_STATE' && msg.state) {
            setStrokes(msg.state.strokes || []);
            setNotes(msg.state.notes || []);
          } else if (msg.type === 'PEER_COUNT' && msg.peerCount) {
            setPeerCount(msg.peerCount);
          }
        } catch {}
      };
    } catch {
      setConnected(false);
    }

    return () => {
      closed = true;
      wsRef.current?.close();
    };
  }, [roomId, userName]);

  const sendOrPersist = (payload: any, nextStrokes: Stroke[], nextNotes: Note[]) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    } else {
      api.hub.updateWhiteboardState(roomId, { strokes: nextStrokes, notes: nextNotes }).catch(() => {});
    }
  };

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return [
      Math.round((e.clientX - rect.left) * scaleX),
      Math.round((e.clientY - rect.top) * scaleY),
    ];
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    const pt = getCoords(e);
    currentStrokeRef.current = { color, width: lineWidth, points: [pt] };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !currentStrokeRef.current) return;
    const pt = getCoords(e);
    currentStrokeRef.current.points.push(pt);
    redraw([...strokes, currentStrokeRef.current]);
  };

  const handleMouseUp = () => {
    if (!drawingRef.current || !currentStrokeRef.current) return;
    drawingRef.current = false;
    const finished = currentStrokeRef.current;
    currentStrokeRef.current = null;
    const nextStrokes = [...strokes, finished];
    setStrokes(nextStrokes);
    sendOrPersist({ type: 'STROKE', stroke: finished }, nextStrokes, notes);
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNote: Note = {
      id: `${Date.now()}`,
      text: noteText.trim(),
      x: 24 + (notes.length % 4) * 180,
      y: 24 + Math.floor(notes.length / 4) * 90,
    };
    const nextNotes = [...notes, newNote];
    setNotes(nextNotes);
    setNoteText('');
    sendOrPersist({ type: 'NOTE_ADD', note: newNote }, strokes, nextNotes);
  };

  const clearBoard = () => {
    setStrokes([]);
    setNotes([]);
    sendOrPersist({ type: 'CLEAR' }, [], []);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-800">Collaborative Stem Canvas</span>
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connected ? 'Live Sync' : 'HTTP Save Mode'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5" /> {peerCount} online
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                color === c ? 'border-slate-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <button
            type="button"
            onClick={() => setColor('#ffffff')}
            className={`px-2 py-1 text-xs rounded-lg border flex items-center gap-1 ${
              color === '#ffffff' ? 'bg-slate-200 border-slate-400' : 'bg-white border-slate-200'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" /> Eraser
          </button>
          <select
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
          >
            <option value={2}>Thin</option>
            <option value={4}>Medium</option>
            <option value={8}>Thick</option>
          </select>
          <button
            type="button"
            onClick={clearBoard}
            className="px-2.5 py-1 text-xs rounded-lg bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      <div className="relative bg-white">
        <canvas
          ref={canvasRef}
          width={960}
          height={440}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-[380px] cursor-crosshair block bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]"
        />
        {notes.map((n) => (
          <div
            key={n.id}
            style={{ left: Math.min(n.x, 700), top: Math.min(n.y, 280) }}
            className="absolute max-w-[170px] bg-amber-100 border border-amber-300 text-amber-950 text-xs p-2.5 rounded-lg shadow-sm pointer-events-none"
          >
            {n.text}
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex gap-2">
        <StickyNote className="w-4 h-4 text-amber-600 mt-2 shrink-0" />
        <input
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Pin a hypothesis or equation note onto the shared board..."
          className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="button"
          onClick={addNote}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
        >
          Pin Note
        </button>
      </div>
    </div>
  );
}
