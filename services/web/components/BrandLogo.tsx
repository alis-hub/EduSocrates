'use client';

interface BrandLogoProps {
  variant?: 'navbar' | 'horizontal' | 'vertical' | 'icon';
  showTagline?: boolean;
  showVersion?: boolean;
  className?: string;
}

export function BrandLogo({
  variant = 'navbar',
  showTagline = false,
  showVersion = false,
  className = '',
}: BrandLogoProps) {
  if (variant === 'horizontal') {
    return (
      <img
        src="/brand/logo-horizontal.jpg"
        alt="GuruMera — Discover the Why!"
        className={`object-contain mix-blend-multiply ${className || 'h-12 w-auto'}`}
      />
    );
  }

  if (variant === 'vertical') {
    return (
      <img
        src="/brand/logo-vertical.jpg"
        alt="GuruMera — Discover the Why!"
        className={`object-contain mix-blend-multiply mx-auto ${className || 'h-32 w-auto'}`}
      />
    );
  }

  if (variant === 'icon') {
    return (
      <img
        src="/brand/logo-icon.jpg"
        alt="GuruMera"
        className={`object-contain mix-blend-multiply ${className || 'w-8 h-8'}`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/brand/logo-icon.jpg"
        alt="GuruMera"
        className="w-9 h-9 object-contain mix-blend-multiply shrink-0"
      />
      <span className="flex flex-col leading-none">
        <span className="flex items-center gap-2">
          <span className="text-lg tracking-tight text-[#1E225B]">
            <strong className="font-extrabold">Guru</strong>
            <span className="font-normal">Mera</span>
          </span>
          {showVersion && (
            <span className="text-[11px] font-bold bg-[#F5921D]/15 text-[#DC7B0C] border border-[#F5921D]/30 px-2 py-0.5 rounded-full">
              v3.0
            </span>
          )}
        </span>
        {showTagline && (
          <span className="text-[10px] font-semibold tracking-wide text-[#F5921D] mt-0.5">
            – Discover the Why! –
          </span>
        )}
      </span>
    </span>
  );
}
