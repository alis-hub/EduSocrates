'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  PenTool,
  Eraser,
  Square,
  Circle,
  Share2,
  Trash2,
  Check,
  Users,
  Sparkles,
  Maximize2,
  Highlighter,
} from 'lucide-react';

const COLORS = [
  { name: 'Navy', hex: '#1E225B' },
  { name: 'Amber', hex: '#F5921D' },
  { name: 'Teal', hex: '#249EA0' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Rose', hex: '#EF4444' },
];

export function PeerWhiteboardsInteractiveDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#1E225B');
  const [copiedLink, setCopiedLink] = useState(false);

  // Simulated peer cursor coordinates
  const [peer1Pos, setPeer1Pos] = useState({ x: 380, y: 120 });
  const [peer2Pos, setPeer2Pos] = useState({ x: 180, y: 220 });

  // Animate peer cursors slightly to simulate active collaboration
  useEffect(() => {
    const interval = setInterval(() => {
      setPeer1Pos((prev) => ({
        x: Math.min(500, Math.max(300, prev.x + (Math.random() * 20 - 10))),
        y: Math.min(220, Math.max(90, prev.y + (Math.random() * 16 - 8))),
      }));
      setPeer2Pos((prev) => ({
        x: Math.min(260, Math.max(100, prev.x + (Math.random() * 16 - 8))),
        y: Math.min(260, Math.max(160, prev.y + (Math.random() * 20 - 10))),
      }));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Initialize canvas with grid and a pre-drawn sample diagram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = 360;

    drawBackgroundGrid(ctx, canvas.width, canvas.height);
    drawSampleSTEMDiagram(ctx);
  }, []);

  const drawBackgroundGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#F1EFEA';
    ctx.lineWidth = 1;

    // Draw coordinate grid lines
    const gridSize = 24;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawSampleSTEMDiagram = (ctx: CanvasRenderingContext2D) => {
    // Draw a sample free-body diagram and formula
    ctx.save();

    // Box on ramp
    ctx.strokeStyle = '#1E225B';
    ctx.lineWidth = 2.5;

    // Ramp line
    ctx.beginPath();
    ctx.moveTo(60, 260);
    ctx.lineTo(260, 160);
    ctx.stroke();

    // Box
    ctx.fillStyle = '#FAF9F5';
    ctx.strokeStyle = '#249EA0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(130, 180, 50, 35);
    ctx.fill();
    ctx.stroke();

    // Force vectors
    ctx.strokeStyle = '#EF4444'; // Weight vector (mg down)
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(155, 197);
    ctx.lineTo(155, 255);
    ctx.stroke();

    ctx.strokeStyle = '#10B981'; // Normal force
    ctx.beginPath();
    ctx.moveTo(155, 197);
    ctx.lineTo(135, 155);
    ctx.stroke();

    // Text annotations
    ctx.fillStyle = '#1E225B';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('N (Normal)', 110, 150);
    ctx.fillText('mg (Gravity)', 160, 255);
    ctx.fillText('θ = 30°', 90, 250);

    // Equation annotation by peer
    ctx.fillStyle = '#F5921D';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('Σ F_y = N - mg·cos(θ) = 0', 310, 140);
    ctx.fillText('N = (4)(9.8)·cos(30°) = 33.9 N', 310, 165);

    ctx.restore();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    if (selectedTool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 20;
    } else if (selectedTool === 'highlighter') {
      ctx.strokeStyle = selectedColor === '#1E225B' ? 'rgba(245, 146, 29, 0.4)' : `${selectedColor}66`;
      ctx.lineWidth = 14;
      ctx.lineCap = 'square';
    } else {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawBackgroundGrid(ctx, canvas.width, canvas.height);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-2xl shadow-xl overflow-hidden text-left">
      {/* ─── Top Room Title Bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E7E3D8] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-[#1E225B]">
            Room #gm-study-2026: AP Physics 1 FBDs
          </span>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Users className="w-3 h-3 text-[#249EA0]" />
            3 active collaborators
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-xs font-semibold text-[#1E225B] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Room Link</span>
              </>
            )}
          </button>
          <Link
            href="/hub?tab=whiteboards"
            className="text-xs font-bold text-white bg-[#1E225B] hover:bg-[#141740] px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span>Open Real Room</span>
            <Maximize2 className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ─── Whiteboard Toolbar ─────────────────────────────────────────── */}
      <div className="bg-[#F1EFEA] border-b border-[#E7E3D8] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Tool Mode Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedTool('pen')}
            className={`p-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              selectedTool === 'pen'
                ? 'bg-[#1E225B] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
            title="Pen Tool"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pen</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTool('highlighter')}
            className={`p-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              selectedTool === 'highlighter'
                ? 'bg-[#1E225B] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlighter</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTool('eraser')}
            className={`p-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              selectedTool === 'eraser'
                ? 'bg-[#1E225B] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>

          <button
            type="button"
            onClick={clearCanvas}
            className="p-2 rounded-lg text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 transition-colors ml-1"
            title="Clear Board"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-semibold mr-1">Ink Color:</span>
          {COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => {
                setSelectedColor(c.hex);
                if (selectedTool === 'eraser') setSelectedTool('pen');
              }}
              style={{ backgroundColor: c.hex }}
              className={`w-5 h-5 rounded-full transition-transform ${
                selectedColor === c.hex ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : 'hover:scale-110'
              }`}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* ─── Canvas Viewport with Simulated Collaborator Cursors ─────────── */}
      <div className="relative w-full h-[360px] cursor-crosshair overflow-hidden select-none bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block"
        />

        {/* Simulated Peer Cursor 1 */}
        <div
          className="absolute pointer-events-none transition-all duration-700 ease-out z-10"
          style={{ transform: `translate(${peer1Pos.x}px, ${peer1Pos.y}px)` }}
        >
          <div className="w-3 h-3 border-2 border-white rounded-full bg-[#F5921D] shadow-sm -translate-x-1/2 -translate-y-1/2" />
          <div className="bg-[#F5921D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap ml-2 -mt-2">
            Sarah (Peer)
          </div>
        </div>

        {/* Simulated Peer Cursor 2 */}
        <div
          className="absolute pointer-events-none transition-all duration-700 ease-out z-10"
          style={{ transform: `translate(${peer2Pos.x}px, ${peer2Pos.y}px)` }}
        >
          <div className="w-3 h-3 border-2 border-white rounded-full bg-[#249EA0] shadow-sm -translate-x-1/2 -translate-y-1/2" />
          <div className="bg-[#249EA0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap ml-2 -mt-2">
            Elena (AP Tutor)
          </div>
        </div>
      </div>

      {/* ─── Bottom Footer Instruction Bar ──────────────────────────────── */}
      <div className="bg-white border-t border-[#E7E3D8] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Interactive Canvas:</span>
          <span>Click &amp; drag with your mouse/finger to test drawing live on the grid!</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Sub-50ms WebSocket Sync • Zero Software Downloads
        </div>
      </div>
    </div>
  );
}
