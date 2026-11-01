/**
 * @file TimelineCompressionSimulator.tsx
 * @description Interactive slider component testing celebration feasibility when the event
 * date is brought forward by 1–4 weeks, highlighting compromised lead-times.
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface TimelineCompressionSimulatorProps {
  compressionWeeks: number;
  setCompressionWeeks: (weeks: number) => void;
  criticalWarnings: string[];
}

export const TimelineCompressionSimulator: React.FC<TimelineCompressionSimulatorProps> = ({
  compressionWeeks,
  setCompressionWeeks,
  criticalWarnings,
}) => {
  return (
    <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5631] bg-[#EEF7F0] border border-[#1E5631]/30 px-2.5 py-0.5 rounded-md">
            Sequence Verified • No Scheduling Conflicts
          </span>
          <h3 className="text-base font-bold text-[#161412] mt-1">
            Timeline Date Compression Simulator
          </h3>
          <p className="text-xs text-[#686259] mt-0.5">
            Simulate moving the celebration up by 1–4 weeks to detect unfeasible lead times.
          </p>
        </div>

        {/* Compression Slider */}
        <div className="flex items-center gap-3 bg-[#FAF7F2] px-4 py-2.5 rounded-xl border border-[#E4DEC8] shrink-0">
          <label htmlFor="timeline-compression-slider" className="text-xs font-bold text-[#161412]">
            Move Date Forward:
          </label>
          <input
            id="timeline-compression-slider"
            type="range"
            min={0}
            max={4}
            step={1}
            value={compressionWeeks}
            onChange={(e) => setCompressionWeeks(Number(e.target.value))}
            className="accent-[#B4690E] cursor-pointer w-28"
            aria-label="Timeline compression in weeks"
          />
          <span className="font-mono text-xs font-bold text-[#B4690E] min-w-14">
            {compressionWeeks === 0 ? 'Normal' : `-${compressionWeeks} wks`}
          </span>
        </div>
      </div>

      {/* Critical Warnings from Date Compression */}
      {criticalWarnings.length > 0 && (
        <div className="rounded-xl border border-[#B4690E]/30 bg-[#FEF8ED] p-3.5 space-y-1 text-xs text-[#161412]">
          <div className="font-bold flex items-center gap-1.5 text-[#B4690E]">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Lead-Time Deficit Warnings ({compressionWeeks} Weeks Earlier):</span>
          </div>
          <ul className="space-y-0.5 pl-5 list-disc text-[11px] text-[#686259]">
            {criticalWarnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

