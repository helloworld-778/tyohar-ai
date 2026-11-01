/**
 * @file IntakeDiagnosticsPanel.tsx
 * @description Dietary and accessibility requirements checklist paired with
 * proactive multi-generational physical layout diagnostics.
 */

import React from 'react';
import { ShieldCheck, Volume2, Check } from 'lucide-react';
import type { GenerationVibeAudit } from '../../types/tyohar';
import { DEFAULT_ACCESSIBILITY_OPTIONS } from '../../constants/config';

interface IntakeDiagnosticsPanelProps {
  accessibilityNeeds: string[];
  vibeAudit: GenerationVibeAudit[];
  onToggleAccessibilityNeed: (tag: string) => void;
}

export const IntakeDiagnosticsPanel: React.FC<IntakeDiagnosticsPanelProps> = ({
  accessibilityNeeds,
  vibeAudit,
  onToggleAccessibilityNeed,
}) => {
  return (
    <div className="space-y-6">
      {/* Accommodations Card */}
      <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
        <div className="border-b border-[#E4DEC8]/60 pb-4">
          <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1E5631]" aria-hidden="true" />
            <span>Dietary &amp; Accessibility Rules</span>
          </h3>
          <p className="text-xs text-[#686259] mt-0.5">
            Check accommodations to auto-generate floor plans and catering briefs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Dietary & Accessibility Options">
          {DEFAULT_ACCESSIBILITY_OPTIONS.map((opt) => {
            const isChecked = accessibilityNeeds.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggleAccessibilityNeed(opt)}
                aria-pressed={isChecked}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-[#FEF8ED] border-[#B4690E]/50 text-[#161412]'
                    : 'bg-[#FAF7F2] border-[#E4DEC8] text-[#686259] hover:border-[#B4690E]/30'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isChecked
                      ? 'bg-[#B4690E] border-[#B4690E] text-white font-bold'
                      : 'border-[#E4DEC8] bg-[#FFFFFF]'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3" aria-hidden="true" />}
                </div>
                <span className="leading-snug font-medium">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Physical Layout Diagnostics */}
      <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
        <div className="border-b border-[#E4DEC8]/60 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
              <span>Physical Layout Diagnostics</span>
            </h3>
            <p className="text-xs text-[#686259] mt-0.5">
              Proactive collision prevention between young dancers and elder dining.
            </p>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5631] bg-[#EEF7F0] border border-[#1E5631]/30 px-2.5 py-0.5 rounded-full">
            Auto-Resolved
          </span>
        </div>

        <div className="space-y-3">
          {vibeAudit.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#161412] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
                  {item.zone}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EEF7F0] text-[#1E5631] border border-[#1E5631]/30">
                  Fix Applied
                </span>
              </div>
              <p className="text-[#686259] leading-relaxed">{item.frictionWarning}</p>
              <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#1E5631]/30 text-[#1E5631] text-[11px] font-semibold">
                &check; <strong>Layout Solution:</strong> {item.accommodationFix}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
