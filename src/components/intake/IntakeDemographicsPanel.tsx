/**
 * @file IntakeDemographicsPanel.tsx
 * @description Generational demographic split controls (Kids, Adults, Seniors)
 * with animated stacked bar and 100% auto-balancer.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Scale, Baby, UserCheck, Heart } from 'lucide-react';
import type { DemographicSplit } from '../../types/tyohar';

interface IntakeDemographicsPanelProps {
  demographics: DemographicSplit;
  onDemographicChange: (key: 'kidsPercent' | 'adultsPercent' | 'seniorsPercent', value: number) => void;
  onAutoBalance: () => void;
}

export const IntakeDemographicsPanel: React.FC<IntakeDemographicsPanelProps> = ({
  demographics,
  onDemographicChange,
  onAutoBalance,
}) => {
  const demoTotal =
    demographics.kidsPercent +
    demographics.adultsPercent +
    demographics.seniorsPercent;

  return (
    <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
      <div className="border-b border-[#E4DEC8]/60 pb-4">
        <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#2B4C7E]" aria-hidden="true" />
          <span>Demographic Mix</span>
        </h3>
        <p className="text-xs text-[#686259] mt-0.5">
          Calibrates seating, acoustics, and dining cadence.
        </p>
      </div>

      {/* Stacked Bar with Clean Tone */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#161412]">Generational Balance:</span>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs font-bold ${
                demoTotal === 100 ? 'text-[#1E5631]' : 'text-[#B4690E]'
              }`}
            >
              Total: {demoTotal}%
            </span>
            {demoTotal !== 100 && (
              <button
                type="button"
                onClick={onAutoBalance}
                aria-label="Auto-balance demographics to sum to 100%"
                className="flex items-center gap-1 text-[11px] font-bold text-[#B4690E] bg-[#FEF8ED] border border-[#B4690E]/30 px-2 py-0.5 rounded hover:bg-[#FDF2DE] cursor-pointer"
              >
                <Scale className="w-3 h-3" aria-hidden="true" />
                <span>Balance to 100%</span>
              </button>
            )}
          </div>
        </div>

        <div className="h-4 w-full rounded-full bg-[#F3EFE6] p-0.5 overflow-hidden flex border border-[#E4DEC8]">
          <motion.div
            animate={{ width: `${demographics.kidsPercent}%` }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="h-full bg-[#2B4C7E] first:rounded-l-full"
            title={`Kids: ${demographics.kidsPercent}%`}
          />
          <motion.div
            animate={{ width: `${demographics.adultsPercent}%` }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="h-full bg-[#B4690E]"
            title={`Adults: ${demographics.adultsPercent}%`}
          />
          <motion.div
            animate={{ width: `${demographics.seniorsPercent}%` }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="h-full bg-[#1E5631] last:rounded-r-full"
            title={`Seniors: ${demographics.seniorsPercent}%`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#686259] pt-1">
          <span className="flex items-center gap-1 text-[#2B4C7E] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#2B4C7E]" aria-hidden="true" /> Kids (
            {demographics.kidsPercent}%)
          </span>
          <span className="flex items-center gap-1 text-[#B4690E] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#B4690E]" aria-hidden="true" /> Adults (
            {demographics.adultsPercent}%)
          </span>
          <span className="flex items-center gap-1 text-[#1E5631] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#1E5631]" aria-hidden="true" /> Seniors (
            {demographics.seniorsPercent}%)
          </span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4 pt-2 border-t border-[#E4DEC8]/60">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <label htmlFor="demographics-kids-slider" className="text-[#2B4C7E] flex items-center gap-1 cursor-pointer">
              <Baby className="w-3.5 h-3.5" aria-hidden="true" /> Kids (0–12 yrs)
            </label>
            <span className="font-mono text-[#161412]">{demographics.kidsPercent}%</span>
          </div>
          <input
            id="demographics-kids-slider"
            type="range"
            min="0"
            max="60"
            value={demographics.kidsPercent}
            onChange={(e) =>
              onDemographicChange('kidsPercent', parseInt(e.target.value, 10))
            }
            className="w-full accent-[#2B4C7E] h-1.5 bg-[#E4DEC8] rounded-lg cursor-pointer"
            aria-label="Kids demographic percentage"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <label htmlFor="demographics-adults-slider" className="text-[#B4690E] flex items-center gap-1 cursor-pointer">
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" /> Adults (13–59 yrs)
            </label>
            <span className="font-mono text-[#161412]">{demographics.adultsPercent}%</span>
          </div>
          <input
            id="demographics-adults-slider"
            type="range"
            min="10"
            max="90"
            value={demographics.adultsPercent}
            onChange={(e) =>
              onDemographicChange('adultsPercent', parseInt(e.target.value, 10))
            }
            className="w-full accent-[#B4690E] h-1.5 bg-[#E4DEC8] rounded-lg cursor-pointer"
            aria-label="Adults demographic percentage"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <label htmlFor="demographics-seniors-slider" className="text-[#1E5631] flex items-center gap-1 cursor-pointer">
              <Heart className="w-3.5 h-3.5" aria-hidden="true" /> Seniors (60+ yrs)
            </label>
            <span className="font-mono text-[#161412]">{demographics.seniorsPercent}%</span>
          </div>
          <input
            id="demographics-seniors-slider"
            type="range"
            min="0"
            max="50"
            value={demographics.seniorsPercent}
            onChange={(e) =>
              onDemographicChange('seniorsPercent', parseInt(e.target.value, 10))
            }
            className="w-full accent-[#1E5631] h-1.5 bg-[#E4DEC8] rounded-lg cursor-pointer"
            aria-label="Seniors demographic percentage"
          />
        </div>
      </div>
    </div>
  );
};

