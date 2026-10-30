import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  subtitle?: string;
  inverted?: boolean; // For dark-ledger modal/drawer usage
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtitle,
  inverted = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const dimensionMap = {
    sm: { box: 'h-8 w-8', icon: 32, text: 'text-sm', sub: 'text-[11px]' },
    md: { box: 'h-10 w-10', icon: 40, text: 'text-lg', sub: 'text-xs' },
    lg: { box: 'h-12 w-12', icon: 48, text: 'text-2xl', sub: 'text-xs' },
  };

  const { box, icon, text, sub } = dimensionMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* ── Geometric Diya & Lotus Emblem Container ─────────────────────────── */}
      <div className={`relative flex items-center justify-center shrink-0 ${box}`}>
        {/* Crisp Architectural Ledger Container */}
        <div
          className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-md border transition-colors ${
            inverted
              ? 'border-white/20 bg-[#24201C]'
              : 'border-[#E4DEC8] bg-[#F3EFE6] shadow-xs'
          }`}
        >
          {!imageFailed ? (
            <img
              src="/tyohar-logo.png"
              alt="Tyohar AI Emblem"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-contain p-1 rounded-sm"
            />
          ) : (
            /* Multi-layered Geometric Diya & Artisanal Lotus Motif SVG */
            <svg
              width={icon}
              height={icon}
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full p-1"
            >
              {/* Diya Base Arch in Burnished Brass / Sindoor */}
              <path
                d="M8 27C11 36 21 40 24 40C27 40 37 36 40 27C34 31 28 32 24 32C20 32 14 31 8 27Z"
                fill="#C23B22"
              />

              {/* Diya Rim Highlight */}
              <path
                d="M10 27C15 30 20 31 24 31C28 31 33 30 38 27"
                stroke="#B4690E"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Central Sacred Flame */}
              <path
                d="M24 7C22 13 18 17 18 23C18 26.5 20.5 29 24 29C27.5 29 30 26.5 30 23C30 17 26 13 24 7Z"
                fill="#B4690E"
              />

              {/* Inner Core Flame */}
              <circle cx="24" cy="24" r="2.5" fill="#FAF7F2" />

              {/* AI Graph Nodes in Mehendi Emerald */}
              <circle cx="12" cy="14" r="1.5" fill="#1E5631" />
              <circle cx="36" cy="14" r="1.5" fill="#1E5631" />
              <line x1="12" y1="14" x2="20" y2="18" stroke="#1E5631" strokeWidth="0.8" strokeDasharray="1 1" />
              <line x1="36" y1="14" x2="28" y2="18" stroke="#1E5631" strokeWidth="0.8" strokeDasharray="1 1" />

              {/* Crown Spark */}
              <path
                d="M24 2L25 5L28 6L25 7L24 10L23 7L20 6L23 5L24 2Z"
                fill="#B4690E"
              />
            </svg>
          )}
        </div>
      </div>

      {/* ── Brand Typography ─────────────────────────────────── */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-serif-heading font-bold tracking-tight ${
                inverted ? 'text-[#FAF7F2]' : 'text-[#161412]'
              } ${text}`}
            >
              Tyohar
            </span>
            <span className="rounded-sm bg-[#B4690E] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              AI
            </span>
          </div>
          <span
            className={`mt-0.5 font-medium tracking-wide ${
              inverted ? 'text-slate-400' : 'text-[#686259]'
            } ${sub}`}
          >
            {subtitle || 'Celebration Co-Pilot'}
          </span>
        </div>
      )}
    </div>
  );
};
