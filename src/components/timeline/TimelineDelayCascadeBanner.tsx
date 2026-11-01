/**
 * @file TimelineDelayCascadeBanner.tsx
 * @description Urgent cascade warning banner rendered when a root milestone is delayed,
 * identifying all downstream blocked vendor tasks and logistical prerequisites.
 */

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { TimelineTask } from '../../types/tyohar';

interface TimelineDelayCascadeBannerProps {
  delayedTask: TimelineTask;
  downstreamBlocked: TimelineTask[];
  onDismiss: () => void;
}

export const TimelineDelayCascadeBanner: React.FC<TimelineDelayCascadeBannerProps> = ({
  delayedTask,
  downstreamBlocked,
  onDismiss,
}) => {
  return (
    <div
      role="region"
      aria-label="Timeline Delay Cascade Alert"
      className="rounded-2xl border border-[#C23B22]/30 bg-[#FDF2F0] p-5 shadow-xs space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-[#C23B22] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h4 className="text-sm font-bold text-[#161412]">
              Delay Cascade Triggered: &ldquo;{delayedTask.title}&rdquo; is Delayed
            </h4>
            <p className="text-xs text-[#686259] mt-0.5">
              Impact: {delayedTask.impactIfDelayed}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss delay cascade alert banner"
          className="text-xs font-bold text-[#C23B22] hover:text-[#922612] bg-[#FFFFFF] px-3 py-1 rounded-lg border border-[#C23B22]/30 shrink-0 shadow-xs cursor-pointer"
        >
          Dismiss Cascade View
        </button>
      </div>

      {/* Downstream Tasks Blocked */}
      <div className="rounded-xl border border-[#C23B22]/20 bg-[#FFFFFF] p-3.5 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#C23B22] block">
          Cascading Downstream Milestones Blocked ({downstreamBlocked.length}):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {downstreamBlocked.map((task) => (
            <div
              key={task.id}
              className="p-2 rounded-lg bg-[#FDF2F0] border border-[#C23B22]/20 text-[#161412] flex items-center justify-between"
            >
              <span className="font-semibold text-xs">{task.title}</span>
              <span className="text-[11px] text-[#C23B22] font-mono font-bold">
                {task.weeksBefore}w out
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

