/**
 * @file PackagesTierPanel.tsx
 * @description 3-Tier AI-synthesized vendor catering packages comparison (Minimize Cost,
 * Balanced, Maximize Variety) with mode filtering and trade-off highlights.
 */

import React from 'react';
import type { VendorPackageOption, OptimizationMode } from '../../types/tyohar';
import { formatINR } from '../../utils/formatters';

interface PackagesTierPanelProps {
  packages: VendorPackageOption[];
  selectedPackageMode: OptimizationMode | 'all';
  onSelectMode: (mode: OptimizationMode | 'all') => void;
}

export const PackagesTierPanel: React.FC<PackagesTierPanelProps> = ({
  packages,
  selectedPackageMode,
  onSelectMode,
}) => {
  const filteredPackages =
    selectedPackageMode === 'all'
      ? packages
      : packages.filter((p) => p.mode === selectedPackageMode);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E4DEC8]/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#161412]">
          AI-Synthesized Menu Packages ({packages.length} Tiers)
        </h3>

        {/* Filter Mode Pills */}
        <div className="flex items-center gap-1.5 text-xs" role="group" aria-label="Catering Package Tier Filters">
          <span className="text-[#686259] text-[11px]">Filter:</span>
          {(['all', 'minimize_cost', 'balanced', 'maximize_variety'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onSelectMode(m)}
              aria-pressed={selectedPackageMode === m}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                selectedPackageMode === m
                  ? 'bg-[#B4690E] text-white border-[#B4690E]'
                  : 'bg-[#FAF7F2] border-[#E4DEC8] text-[#686259] hover:text-[#161412]'
              }`}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPackages.map((pkg, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between hover:border-[#B4690E]/60 transition-all space-y-5"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#FEF8ED] border border-[#B4690E]/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#B4690E]">
                  {pkg.mode.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-[#8C8275] font-mono">Tier 0{idx + 1}</span>
              </div>

              <h4 className="mt-3 text-base font-bold text-[#161412]">{pkg.title}</h4>

              {/* Rates */}
              <div className="mt-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#E4DEC8]">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-[#686259]">Rate / Person</span>
                  <span className="font-mono-numeric text-base font-bold text-[#161412]">
                    {formatINR(pkg.estimatedPerPersonINR)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-[#E4DEC8]/60">
                  <span className="text-[11px] text-[#8C8275]">Estimated Total</span>
                  <span className="font-mono-numeric text-xs font-bold text-[#686259]">
                    {formatINR(pkg.totalEstimatedINR)}
                  </span>
                </div>
              </div>

              {/* Menu Highlights */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[11px] font-bold text-[#161412] block">
                  Menu Highlights:
                </span>
                <ul className="text-xs text-[#686259] space-y-1">
                  {pkg.menuHighlights.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#B4690E]" aria-hidden="true">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trade-Offs / Advantages */}
              <div className="mt-4 pt-3 border-t border-[#E4DEC8]/60 space-y-1 text-xs">
                <div className="text-[#1E5631] text-[11px]">
                  <strong>Pro:</strong> {pkg.pros[0]}
                </div>
                <div className="text-[#686259] text-[11px]">
                  <strong>Trade-off:</strong> {pkg.tradeOffs[0]}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4DEC8]/60 flex items-center justify-between text-[11px] text-[#8C8275]">
              <span>Estimated Market Benchmark (Unconfirmed)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

