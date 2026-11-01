/**
 * @file OverviewActionItems.tsx
 * @description Urgent action items list featuring upcoming deadline milestones
 * and proactive multi-generational acoustic fixes.
 */

import React from 'react';
import { Clock, ChevronRight, CheckCircle2, ShieldAlert, Volume2 } from 'lucide-react';
import type { TimelineTask, GenerationVibeAudit } from '../../types/tyohar';

interface OverviewActionItemsProps {
  urgentTasks: TimelineTask[];
  totalTasksCount: number;
  vibeAuditItem?: GenerationVibeAudit;
  onNavigateTimeline: () => void;
  onToggleTaskStatus: (taskId: string) => void;
}

export const OverviewActionItems: React.FC<OverviewActionItemsProps> = ({
  urgentTasks,
  totalTasksCount,
  vibeAuditItem,
  onNavigateTimeline,
  onToggleTaskStatus,
}) => {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-[3px_3px_0px_#E4DEC8]">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#E4DEC8]/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2B4C7E]" aria-hidden="true" />
            <h4 className="text-sm font-bold text-[#161412]">Priority Action Items</h4>
          </div>
          <button
            type="button"
            onClick={onNavigateTimeline}
            aria-label="View all critical path milestones"
            className="text-xs font-bold text-[#2B4C7E] hover:text-[#1F3659] flex items-center gap-1 cursor-pointer"
          >
            <span>All ({totalTasksCount})</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Top 3 Milestones */}
        <div className="mt-4 space-y-2.5">
          {urgentTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] hover:bg-[#F3EFE6] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onToggleTaskStatus(task.id)}
                  className="w-5 h-5 rounded-md border border-[#E4DEC8] bg-[#FFFFFF] flex items-center justify-center hover:border-[#1E5631] text-[#1E5631] transition-colors shrink-0 cursor-pointer"
                  aria-label={`Toggle completion for ${task.title}`}
                >
                  {task.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-[#1E5631]" aria-hidden="true" />
                  )}
                </button>
                <div className="truncate max-w-[170px] sm:max-w-[220px]">
                  <span className="text-xs font-bold text-[#161412] truncate block">
                    {task.title}
                  </span>
                  <span className="text-[11px] text-[#686259]">{task.category}</span>
                </div>
              </div>

              <span
                className={`font-mono-numeric text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                  task.weeksBefore === 0
                    ? 'bg-[#FDF2F0] text-[#C23B22] border-[#C23B22]/30'
                    : task.weeksBefore <= 2
                    ? 'bg-[#FEF8ED] text-[#B4690E] border-[#B4690E]/30'
                    : 'bg-[#F0F5FA] text-[#2B4C7E] border-[#2B4C7E]/30'
                }`}
              >
                {task.weeksBefore}w out
              </span>
            </div>
          ))}
        </div>

        {/* Active Friction Highlight */}
        <div className="mt-4 pt-4 border-t border-[#E4DEC8]/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#161412] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#B4690E]" aria-hidden="true" />
              Generational Acoustic Fix
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B4690E]">
              Active Guard
            </span>
          </div>
          {vibeAuditItem && (
            <div className="p-3 rounded-xl border border-[#B4690E]/30 bg-[#FEF8ED] text-xs text-[#161412]">
              <div className="font-semibold text-[#B4690E] flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{vibeAuditItem.zone}</span>
              </div>
              <p className="text-[11px] text-[#686259] mt-1">
                {vibeAuditItem.frictionWarning}
              </p>
              <p className="text-[11px] text-[#1E5631] font-semibold mt-1">
                &check; Fix: {vibeAuditItem.accommodationFix}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E4DEC8]/60 flex items-center justify-between text-xs text-[#686259]">
        <span className="text-[11px]">Timeline Sequence Verified</span>
        <span className="font-bold text-[#1E5631] text-[11px]">&check; Zero Precedence Bottlenecks</span>
      </div>
    </div>
  );
};
