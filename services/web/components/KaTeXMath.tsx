'use client';
import React from 'react';

const GREEK_AND_SYMBOLS: Record<string, string> = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\Delta': 'Δ',
  '\\theta': 'θ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\pi': 'π',
  '\\sigma': 'σ',
  '\\Sigma': 'Σ',
  '\\omega': 'ω',
  '\\Omega': 'Ω',
  '\\phi': 'φ',
  '\\times': '×',
  '\\cdot': '·',
  '\\div': '÷',
  '\\pm': '±',
  '\\le': '≤',
  '\\leq': '≤',
  '\\ge': '≥',
  '\\geq': '≥',
  '\\neq': '≠',
  '\\approx': '≈',
  '\\infty': '∞',
  '\\int': '∫',
  '\\sum': '∑',
  '\\partial': '∂',
  '\\nabla': '∇',
  '\\to': '→',
  '\\rightarrow': '→',
  '\\Rightarrow': '⇒',
};

function formatMathSegment(tex: string): string {
  let s = tex.trim();
  s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)');
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
  s = s.replace(/\\vec\{([^{}]+)\}/g, '$1⃗');
  s = s.replace(/\\text\{([^{}]+)\}/g, '$1');
  for (const [k, v] of Object.entries(GREEK_AND_SYMBOLS)) {
    s = s.split(k).join(v);
  }
  s = s.replace(/\^\{([^{}]+)\}/g, '^($1)');
  s = s.replace(/_\{([^{}]+)\}/g, '_$1');
  return s;
}

export function KaTeXMath({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;

  // Split by block math $$...$$, inline math $...$, or inline code `...`
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|`[^`\n]+?`|\*\*[^*]+?\*\*)/g);

  return (
    <span className={`whitespace-pre-wrap leading-relaxed ${className}`}>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
          return (
            <span
              key={i}
              className="block my-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-serif text-base text-slate-900 text-center"
            >
              {formatMathSegment(part.slice(2, -2))}
            </span>
          );
        }
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          return (
            <span
              key={i}
              className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-indigo-50 text-indigo-900 font-serif"
            >
              {formatMathSegment(part.slice(1, -1))}
            </span>
          );
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
