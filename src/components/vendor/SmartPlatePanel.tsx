/**
 * @file SmartPlatePanel.tsx
 * @description Smart Plate headcount and buffer calculator preventing 15-20% catering food waste,
 * featuring Saya peak turnout adjustment and zero-waste surplus redistribution protocols.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import type { EventType, SmartPlateCalculation } from '../../types/tyohar';
import { AnimatedCurrency, AnimatedNumber } from '../ui/Primitives';
import { formatINR } from '../../utils/formatters';
import { INPUT_LIMITS } from '../../constants/config';

interface SmartPlatePanelProps {
  eventType: EventType;
  guestCount: number;
  perPlateBenchmark: number;
  isPeakAuspicious: boolean;
  smartPlate: SmartPlateCalculation;
  turnoutOverride: number | null;
  onUpdateGuestCount: (count: number) => void;
  onUpdatePerPlateBenchmark: (rate: number) => void;
  onTogglePeakAuspicious: (val: boolean) => void;
  onUpdateTurnoutOverride: (val: number | null) => void;
}

export const SmartPlatePanel: React.FC<SmartPlatePanelProps> = ({
  guestCount,
  perPlateBenchmark,
  isPeakAuspicious,
  smartPlate,
  turnoutOverride,
  onUpdateGuestCount,
  onUpdatePerPlateBenchmark,
  onTogglePeakAuspicious,
  onUpdateTurnoutOverride,
}) => {
  const [isSurplusOpen, setIsSurplusOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 lg:p-8 shadow-xs">
      <div className="border-b border-[#E4DEC8]/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
            <span>Shagun &amp; Surplus Smart Plate Calculator</span>
          </h3>
          <p className="text-xs text-[#686259] mt-0.5">
            Prevents social embarrassment while halting 15-20% routine catering food waste.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5631] bg-[#EEF7F0] border border-[#1E5631]/30 px-3 py-1 rounded-full">
            Saves ~{formatINR(smartPlate.estimatedSavingsINR)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
        {/* Left Side (5 cols): Interactive Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label htmlFor="smart-plate-guest-count" className="block text-xs font-bold text-[#161412] mb-1.5">
              Invited Guest Count
            </label>
            <input
              id="smart-plate-guest-count"
              type="number"
              min={INPUT_LIMITS.MIN_GUEST_COUNT}
              value={guestCount}
              onChange={(e) =>
                onUpdateGuestCount(Math.max(INPUT_LIMITS.MIN_GUEST_COUNT, parseInt(e.target.value, 10) || INPUT_LIMITS.MIN_GUEST_COUNT))
              }
              className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] font-mono-numeric focus:border-[#B4690E] focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="smart-plate-rate-input" className="block text-xs font-bold text-[#161412] mb-1.5">
              Per-Plate Benchmark Rate (INR)
            </label>
            <input
              id="smart-plate-rate-input"
              type="number"
              step="50"
              min={INPUT_LIMITS.MIN_PER_PLATE_INR}
              value={perPlateBenchmark}
              onChange={(e) =>
                onUpdatePerPlateBenchmark(Math.max(INPUT_LIMITS.MIN_PER_PLATE_INR, parseInt(e.target.value, 10) || INPUT_LIMITS.MIN_PER_PLATE_INR))
              }
              className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] font-mono-numeric focus:border-[#B4690E] focus:outline-hidden"
            />
          </div>

          {/* Auspicious Weekend Bump */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
            <input
              type="checkbox"
              checked={isPeakAuspicious}
              onChange={(e) => onTogglePeakAuspicious(e.target.checked)}
              className="mt-0.5 accent-[#B4690E] h-4 w-4 rounded cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-[#161412] block">
                Peak Auspicious Weekend (Saya / Shubh Mahurat)
              </span>
              <span className="text-[11px] text-[#686259] leading-tight block mt-0.5">
                Adds +3% turnout bump to account for higher RSVP adherence on auspicious dates.
              </span>
            </div>
          </label>
        </div>

        {/* Right Side (7 cols): Segmented Gauge & Stats */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] p-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#161412]">
                Catering Plate Split ({smartPlate.expectedTurnoutPercent}% Turnout Model)
              </span>
              <span className="font-mono text-[#1E5631] font-bold">
                Guaranteed + Buffer = Total Capacity
              </span>
            </div>

            {/* Interactive Expected Turnout Override Slider */}
            <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E4DEC8] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="smart-plate-turnout-slider" className="font-bold text-[#161412] cursor-pointer">
                  Turnout Calibration Override:
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#B4690E] text-xs">
                    {smartPlate.expectedTurnoutPercent}% Turnout
                  </span>
                  {turnoutOverride !== null && (
                    <button
                      type="button"
                      onClick={() => onUpdateTurnoutOverride(null)}
                      className="text-[10px] text-[#686259] hover:text-[#B4690E] underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <input
                id="smart-plate-turnout-slider"
                type="range"
                min={65}
                max={100}
                value={smartPlate.expectedTurnoutPercent}
                onChange={(e) => onUpdateTurnoutOverride(Number(e.target.value))}
                className="w-full accent-[#B4690E] cursor-pointer h-1.5 bg-[#E4DEC8] rounded-lg"
                aria-label="Expected guest turnout percentage override"
              />
              <div className="flex justify-between text-[10px] text-[#8C8275] font-mono">
                <span>65% (Conservative)</span>
                <span>85% (Indian Standard)</span>
                <span>100% (Naive 100%)</span>
              </div>
            </div>

            {/* Segmented Gauge */}
            <div className="h-6 w-full rounded-xl bg-[#F3EFE6] p-1 overflow-hidden flex gap-1 border border-[#E4DEC8]">
              <div
                className="h-full bg-[#1E5631] rounded-lg flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
                style={{
                  width: `${(smartPlate.guaranteedBasePlates / guestCount) * 100}%`,
                }}
              >
                {smartPlate.guaranteedBasePlates} Guaranteed
              </div>
              <div
                className="h-full bg-[#B4690E] rounded-lg flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
                style={{
                  width: `${(smartPlate.bufferPlates / guestCount) * 100}%`,
                }}
              >
                +{smartPlate.bufferPlates} Buffer
              </div>
            </div>

            {/* Gauge Stats Legend */}
            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#1E5631]/30">
                <span className="text-[11px] text-[#1E5631] font-bold block uppercase">
                  Guaranteed Base
                </span>
                <span className="font-mono-numeric text-base font-extrabold text-[#161412]">
                  <AnimatedNumber value={smartPlate.guaranteedBasePlates} />
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#B4690E]/30">
                <span className="text-[11px] text-[#B4690E] font-bold block uppercase">
                  Negotiated Buffer
                </span>
                <span className="font-mono-numeric text-base font-extrabold text-[#161412]">
                  +<AnimatedNumber value={smartPlate.bufferPlates} />
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E4DEC8]">
                <span className="text-[11px] text-[#686259] font-bold block uppercase">
                  Estimated Savings
                </span>
                <span className="font-mono-numeric text-base font-extrabold text-[#1E5631]">
                  <AnimatedCurrency amount={smartPlate.estimatedSavingsINR} />
                </span>
              </div>
            </div>
          </div>

          {/* Collapsible Zero-Waste Surplus Protocol */}
          <div className="rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSurplusOpen(!isSurplusOpen)}
              aria-expanded={isSurplusOpen}
              className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-[#161412] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1E5631]" aria-hidden="true" />
                <span>3-Step Zero-Waste Surplus Protocol (Buffer &gt; 15 Plates)</span>
              </span>
              {isSurplusOpen ? (
                <ChevronUp className="w-4 h-4 text-[#686259]" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#686259]" aria-hidden="true" />
              )}
            </button>

            <AnimatePresence>
              {isSurplusOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 space-y-2 text-xs text-[#686259] border-t border-[#E4DEC8]/60 pt-3"
                >
                  {smartPlate.surplusRedistributionPlan.map((step: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-[#B4690E] text-xs">
                        0{idx + 1}.
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
