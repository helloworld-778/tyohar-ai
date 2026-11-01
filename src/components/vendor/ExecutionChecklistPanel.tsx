/**
 * @file ExecutionChecklistPanel.tsx
 * @description Interactive vendor execution checklist tracking critical contractual verifications,
 * compliance checks, and lock-in milestones before event day.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Check } from 'lucide-react';

export interface VendorChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

interface ExecutionChecklistPanelProps {
  items: VendorChecklistItem[];
  onToggleItem: (id: string) => void;
}

export const ExecutionChecklistPanel: React.FC<ExecutionChecklistPanelProps> = ({
  items,
  onToggleItem,
}) => {
  const completedCount = items.filter((item) => item.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  return (
    <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4DEC8]/60 gap-3">
        <div>
          <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
            <span>Interactive Vendor Execution Checklist</span>
          </h3>
          <p className="text-xs text-[#686259] mt-0.5">
            Critical contractual verifications, compliance checks, and lock-in milestones before wedding/event day.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-[#161412] bg-[#FAF7F2] border border-[#E4DEC8] px-3 py-1 rounded-lg">
            {completedCount} of {items.length} Verified ({percentage}%)
          </span>
        </div>
      </div>

      <div className="space-y-3" role="group" aria-label="Vendor Verification Checklist Items">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggleItem(item.id)}
              aria-pressed={item.completed}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer ${
                item.completed
                  ? 'bg-[#EEF7F0]/40 border-[#1E5631]/30'
                  : 'bg-[#FAF7F2] border-[#E4DEC8] hover:bg-[#F3EFE6]'
              }`}
            >
              <motion.div
                animate={{ scale: item.completed ? [1, 1.25, 1] : 1 }}
                transition={{ duration: 0.2 }}
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  item.completed
                    ? 'bg-[#1E5631] border-[#1E5631] text-white shadow-xs'
                    : 'border-[#E4DEC8] bg-[#FFFFFF]'
                }`}
              >
                {item.completed && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
              </motion.div>

              <div className="space-y-1 grow">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-[#B4690E]" />
                  <h4
                    className={`text-xs font-bold ${
                      item.completed ? 'line-through text-[#686259]' : 'text-[#161412]'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E4DEC8] text-[#8C8275]">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-[#686259] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

