'use client';
import { useMemo, useState } from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

function compileExpr(expr: string): ((x: number) => number) | null {
  try {
    const cleaned = expr
      .trim()
      .toLowerCase()
      .replace(/\^/g, '**')
      .replace(/\bpi\b/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      .replace(/\b(sin|cos|tan|abs|sqrt|log|exp|pow|min|max|floor|ceil)\b/g, 'Math.$1');

    if (/[^0-9x+\-*/().,\s_mathpieincostabqrlexpwfg]/.test(cleaned.replace(/Math\./g, ''))) {
      return null;
    }
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `return (${cleaned});`) as (x: number) => number;
    void fn(1);
    return fn;
  } catch {
    return null;
  }
}

export function MathGraphPlayground({
  onAskSocratic,
}: {
  onAskSocratic?: (prompt: string) => void;
}) {
  const [exprA, setExprA] = useState('x^2 - 4');
  const [exprB, setExprB] = useState('2*x - 1');
  const [range, setRange] = useState(8);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const width = 560;
  const height = 300;

  const { pathA, pathB, validA, validB } = useMemo(() => {
    const fnA = compileExpr(exprA);
    const fnB = exprB.trim() ? compileExpr(exprB) : null;

    const toSvg = (x: number, y: number) => {
      const sx = ((x + range) / (2 * range)) * width;
      const sy = height - ((y + range) / (2 * range)) * height;
      return [sx, sy];
    };

    const buildPath = (fn: ((x: number) => number) | null) => {
      if (!fn) return '';
      let d = '';
      let penDown = false;
      const steps = 220;
      for (let i = 0; i <= steps; i++) {
        const x = -range + (i / steps) * (2 * range);
        let y = NaN;
        try {
          y = fn(x);
        } catch {
          y = NaN;
        }
        if (!Number.isFinite(y) || Math.abs(y) > range * 3) {
          penDown = false;
          continue;
        }
        const [sx, sy] = toSvg(x, y);
        d += `${penDown ? 'L' : 'M'} ${sx.toFixed(1)} ${sy.toFixed(1)} `;
        penDown = true;
      }
      return d;
    };

    return {
      pathA: buildPath(fnA),
      pathB: buildPath(fnB),
      validA: Boolean(fnA),
      validB: !exprB.trim() || Boolean(fnB),
    };
  }, [exprA, exprB, range]);

  const evalHover = (expr: string) => {
    if (hoverX === null) return '—';
    const fn = compileExpr(expr);
    if (!fn) return '—';
    try {
      const v = fn(hoverX);
      return Number.isFinite(v) ? v.toFixed(2) : 'undef';
    } catch {
      return 'undef';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            Interactive STEM Function & Curve Plotter
          </h3>
          <p className="text-xs text-slate-500">
            Plot curves like <code className="bg-slate-100 px-1 rounded">sin(x)</code>,{' '}
            <code className="bg-slate-100 px-1 rounded">x^2 - 4</code>, or{' '}
            <code className="bg-slate-100 px-1 rounded">exp(-0.3*x)*cos(2*x)</code> and inspect intersections.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Domain: ±{range}</span>
          <input
            type="range"
            min={4}
            max={20}
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="accent-indigo-600"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-medium text-indigo-700 block mb-1">f(x) — Indigo Curve</label>
          <input
            value={exprA}
            onChange={(e) => setExprA(e.target.value)}
            placeholder="x^2 - 4"
            className={`w-full border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 ${
              validA ? 'border-slate-200 focus:ring-indigo-400' : 'border-red-300 bg-red-50'
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-emerald-700 block mb-1">g(x) — Emerald Comparison</label>
          <input
            value={exprB}
            onChange={(e) => setExprB(e.target.value)}
            placeholder="2*x - 1 (optional)"
            className={`w-full border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 ${
              validB ? 'border-slate-200 focus:ring-emerald-400' : 'border-red-300 bg-red-50'
            }`}
          />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-64 cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const frac = (e.clientX - rect.left) / rect.width;
            setHoverX(Number((-range + frac * 2 * range).toFixed(2)));
          }}
          onMouseLeave={() => setHoverX(null)}
        >
          {/* Grid lines */}
          {[-0.75, -0.5, -0.25, 0.25, 0.5, 0.75].map((f) => (
            <g key={f}>
              <line
                x1={(0.5 + f / 2) * width}
                y1={0}
                x2={(0.5 + f / 2) * width}
                y2={height}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <line
                x1={0}
                y1={(0.5 + f / 2) * height}
                x2={width}
                y2={(0.5 + f / 2) * height}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
            </g>
          ))}
          {/* Axes */}
          <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="#94a3b8" strokeWidth={1.5} />

          {/* Curves */}
          {pathA && <path d={pathA} fill="none" stroke="#4f46e5" strokeWidth={2.5} />}
          {pathB && <path d={pathB} fill="none" stroke="#059669" strokeWidth={2.2} strokeDasharray="6 3" />}
        </svg>

        <div className="px-4 py-2 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-4 font-mono">
            <span>x = {hoverX !== null ? hoverX : 'hover graph'}</span>
            <span className="text-indigo-700">f(x) = {evalHover(exprA)}</span>
            {exprB.trim() && <span className="text-emerald-700">g(x) = {evalHover(exprB)}</span>}
          </div>
          {onAskSocratic && (
            <button
              type="button"
              onClick={() =>
                onAskSocratic(
                  `I am plotting f(x) = ${exprA}${exprB.trim() ? ` and g(x) = ${exprB}` : ''}. Guide me Socratic-style to analyze its slope, roots, and intersections without giving me the algebraic answer.`,
                )
              }
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Analyze Curve with Socratic Tutor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
