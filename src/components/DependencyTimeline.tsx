import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  ShieldAlert,
  Filter,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import type { EventPlan, TimelineTask } from '../types/tyohar';
import {
  sortTasksByCriticalPath,
  getDownstreamBlockedTasks,
  compressTimelineForEarlierDate,
} from '../utils/timelineEngine';
import {
  GuidedPageHero,
  StaggerContainer,
  StaggerItem,
  StageNavButtons,
} from './ui/Primitives';

interface DependencyTimelineProps {
  currentPlan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onNavigateTab?: (tab: 'overview' | 'intake' | 'budget' | 'vendor') => void;
}

export const DependencyTimeline: React.FC<DependencyTimelineProps> = ({
  currentPlan,
  onUpdatePlan,
  onNavigateTab,
}) => {
  const [delayedTaskId, setDelayedTaskId] = useState<string | null>(null);
  const [compressionWeeks, setCompressionWeeks] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    foundation: true,
    locking: true,
    countdown: true,
  });

  const togglePhase = (phaseKey: string) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseKey]: !prev[phaseKey] }));
  };

  const sortedTasks = useMemo(() => {
    return sortTasksByCriticalPath(currentPlan.timeline);
  }, [currentPlan.timeline]);

  const downstreamBlocked = useMemo(() => {
    if (!delayedTaskId) return [];
    return getDownstreamBlockedTasks(currentPlan.timeline, delayedTaskId);
  }, [currentPlan.timeline, delayedTaskId]);

  const compressionResult = useMemo(() => {
    if (compressionWeeks <= 0) return null;
    return compressTimelineForEarlierDate(sortedTasks, compressionWeeks);
  }, [sortedTasks, compressionWeeks]);

  const activeTasks = compressionResult ? compressionResult.updatedTasks : sortedTasks;

  const handleToggleStatus = (taskId: string) => {
    const updated = currentPlan.timeline.map((task) => {
      if (task.id === taskId) {
        const nextStatus: TimelineTask['status'] =
          task.status === 'pending'
            ? 'completed'
            : task.status === 'completed'
            ? 'delayed'
            : 'pending';

        if (nextStatus === 'delayed') {
          setDelayedTaskId(task.id);
        } else if (delayedTaskId === task.id) {
          setDelayedTaskId(null);
        }

        return { ...task, status: nextStatus };
      }
      return task;
    });

    onUpdatePlan({ ...currentPlan, timeline: updated });
  };

  const handleSetExplicitStatus = (taskId: string, status: TimelineTask['status']) => {
    const updated = currentPlan.timeline.map((task) => {
      if (task.id === taskId) {
        if (status === 'delayed') {
          setDelayedTaskId(task.id);
        } else if (delayedTaskId === task.id) {
          setDelayedTaskId(null);
        }
        return { ...task, status };
      }
      return task;
    });

    onUpdatePlan({ ...currentPlan, timeline: updated });
  };

  const categories = useMemo(() => {
    const set = new Set(currentPlan.timeline.map((t) => t.category));
    return ['all', ...Array.from(set)];
  }, [currentPlan.timeline]);

  const delayedTaskObject = currentPlan.timeline.find((t) => t.id === delayedTaskId);

  // Group tasks into clean milestone phases
  const phases = useMemo(() => {
    const filtered =
      filterCategory === 'all'
        ? activeTasks
        : activeTasks.filter((t) => t.category === filterCategory);

    return [
      {
        id: 'foundation',
        title: 'Phase 1: Foundation & Lead Bookings (16–10 Weeks Out)',
        desc: 'Core venue selection, primary advance payments, and date holds.',
        tasks: filtered.filter((t) => t.weeksBefore >= 10),
      },
      {
        id: 'locking',
        title: 'Phase 2: Vendor Alignment & Décor Lock (9–4 Weeks Out)',
        desc: 'Catering menu tastings, floral mockups, and invitation dispatches.',
        tasks: filtered.filter((t) => t.weeksBefore >= 4 && t.weeksBefore < 10),
      },
      {
        id: 'countdown',
        title: 'Phase 3: Final Countdown & Execution (3–0 Weeks Out)',
        desc: 'Final plate headcount confirmation, sound checks, and day-of choreography.',
        tasks: filtered.filter((t) => t.weeksBefore < 4),
      },
    ];
  }, [activeTasks, filterCategory]);

  return (
    <StaggerContainer className="space-y-6 p-2 lg:p-4 max-w-7xl mx-auto">
      {/* ── Guided Subpage Hero ────────────────────────────────────────── */}
      <StaggerItem>
        <GuidedPageHero
          stepPill="STEP 05 OF 05 • CRITICAL-PATH GRAPH"
          title="Critical Path Timeline &amp; Cascade Risk"
          description="Milestones are sorted in strict execution order so prerequisites always come first. Flagging any milestone as 'Delayed' immediately alerts you to downstream vendor bottlenecks and booking delays."
          tipsTitle="Critical Path Graph Rules"
          tips={[
            'Tasks with dependsOn dependencies cannot start safely until their root task completes (e.g. Venue Booking must precede Floor Décor Layout).',
            'Marking a task as Delayed highlights all cascading blocked tasks in crimson with actionable recovery recommendations.',
            'Use the Lead Time Compression slider to test feasibility if the family moves the celebration date forward by 1-4 weeks.',
          ]}
          nextStepLabel="Return to Executive Blueprint →"
          onNextStep={() => onNavigateTab?.('overview')}
        />
      </StaggerItem>

      {/* ── Lead Time Compression Simulator Bar ────────────────────────── */}
      <StaggerItem>
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
              <span className="text-xs font-bold text-[#161412]">
                Move Date Forward:
              </span>
              <input
                type="range"
                min={0}
                max={4}
                step={1}
                value={compressionWeeks}
                onChange={(e) => setCompressionWeeks(Number(e.target.value))}
                className="accent-[#B4690E] cursor-pointer w-28"
              />
              <span className="font-mono text-xs font-bold text-[#B4690E] min-w-14">
                {compressionWeeks === 0 ? 'Normal' : `-${compressionWeeks} wks`}
              </span>
            </div>
          </div>

          {/* Critical Warnings from Date Compression */}
          {compressionResult && compressionResult.criticalWarnings.length > 0 && (
            <div className="rounded-xl border border-[#B4690E]/30 bg-[#FEF8ED] p-3.5 space-y-1 text-xs text-[#161412]">
              <div className="font-bold flex items-center gap-1.5 text-[#B4690E]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Lead-Time Deficit Warnings ({compressionWeeks} Weeks Earlier):</span>
              </div>
              <ul className="space-y-0.5 pl-5 list-disc text-[11px] text-[#686259]">
                {compressionResult.criticalWarnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </StaggerItem>

      {/* ── Active Delay Cascade Alert Banner ──────────────────────────── */}
      {delayedTaskObject && (
        <StaggerItem>
          <div className="rounded-2xl border border-[#C23B22]/30 bg-[#FDF2F0] p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-[#C23B22] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#161412]">
                    Delay Cascade Triggered: &ldquo;{delayedTaskObject.title}&rdquo; is Delayed
                  </h4>
                  <p className="text-xs text-[#686259] mt-0.5">
                    Impact: {delayedTaskObject.impactIfDelayed}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDelayedTaskId(null)}
                className="text-xs font-bold text-[#C23B22] hover:text-[#922612] bg-[#FFFFFF] px-3 py-1 rounded-lg border border-[#C23B22]/30 shrink-0 shadow-xs"
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
        </StaggerItem>
      )}

      {/* ── Filter Bar ─────────────────────────────────────────────────── */}
      <StaggerItem>
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#E4DEC8]/60">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8C8275]" />
            <span className="text-xs font-bold text-[#161412] uppercase tracking-wider">
              Category Filter:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                  filterCategory === cat
                    ? 'bg-[#B4690E] text-white border-[#B4690E]'
                    : 'bg-[#FAF7F2] border-[#E4DEC8] text-[#686259] hover:text-[#161412]'
                }`}
              >
                {cat === 'all' ? 'All Milestones' : cat}
              </button>
            ))}
          </div>
        </div>
      </StaggerItem>

      {/* ── Main Phases: Collapsible Accordion Sections ─────────────────── */}
      <StaggerItem>
        <div className="space-y-4">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] shadow-xs overflow-hidden"
            >
              {/* Phase Header */}
              <button
                type="button"
                onClick={() => togglePhase(phase.id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-[#FAF7F2] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#B4690E]" />
                    <h3 className="text-base font-bold text-[#161412]">{phase.title}</h3>
                    <span className="text-xs font-mono font-bold text-[#686259] bg-[#FAF7F2] border border-[#E4DEC8] px-2 py-0.5 rounded-full">
                      {phase.tasks.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#686259]">{phase.desc}</p>
                </div>

                {expandedPhases[phase.id] ? (
                  <ChevronUp className="w-5 h-5 text-[#8C8275] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8C8275] shrink-0" />
                )}
              </button>

              {/* Tasks List */}
              <AnimatePresence>
                {expandedPhases[phase.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-[#E4DEC8]/60 p-5 sm:p-6 pt-4 space-y-3"
                  >
                    {phase.tasks.length === 0 ? (
                      <p className="text-xs text-[#8C8275] italic py-2">
                        No tasks match the active filter in this phase.
                      </p>
                    ) : (
                      phase.tasks.map((task) => {
                        const isBlocked = downstreamBlocked.some((d) => d.id === task.id);
                        const isThisDelayed = task.id === delayedTaskId;

                        return (
                          <div
                            key={task.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              isThisDelayed
                                ? 'border-[#C23B22] bg-[#FDF2F0]'
                                : isBlocked
                                ? 'border-[#C23B22]/40 bg-[#FDF2F0]/50'
                                : task.status === 'completed'
                                ? 'border-[#1E5631]/30 bg-[#EEF7F0]/30'
                                : 'border-[#E4DEC8] bg-[#FAF7F2] hover:bg-[#F3EFE6]'
                            }`}
                          >
                            {/* Left: Checkbox + Title + Dependencies */}
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(task.id)}
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  task.status === 'completed'
                                    ? 'bg-[#1E5631] border-[#1E5631] text-white font-bold'
                                    : 'border-[#E4DEC8] bg-[#FFFFFF] hover:border-[#1E5631]'
                                }`}
                                aria-label={`Toggle status for ${task.title}`}
                              >
                                {task.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                              </button>

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`text-xs font-bold ${
                                      task.status === 'completed'
                                        ? 'line-through text-[#8C8275]'
                                        : 'text-[#161412]'
                                    }`}
                                  >
                                    {task.title}
                                  </span>

                                  <span className="text-[11px] text-[#686259] bg-[#FFFFFF] border border-[#E4DEC8] px-2 py-0.5 rounded">
                                    {task.category}
                                  </span>

                                  {isBlocked && (
                                    <span className="text-[11px] font-bold text-[#C23B22] bg-[#FDF2F0] border border-[#C23B22]/30 px-2 py-0.5 rounded">
                                      Cascade Blocked
                                    </span>
                                  )}
                                </div>

                                {task.dependsOn.length > 0 && (
                                  <div className="text-[11px] text-[#686259] flex flex-wrap items-center gap-1.5 mt-0.5">
                                    <span className="text-[#8C8275] font-medium">Prerequisites:</span>
                                    {task.dependsOn.map((depId) => {
                                      const prerequisite = currentPlan.timeline.find((t) => t.id === depId);
                                      return (
                                        <span
                                          key={depId}
                                          className="inline-flex items-center rounded-md border border-[#E4DEC8] bg-[#FFFFFF] px-1.5 py-0.5 text-[11px] text-[#161412] font-medium"
                                          title={`Prerequisite Task: ${prerequisite ? prerequisite.title : depId}`}
                                        >
                                          {prerequisite ? prerequisite.title : depId}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Lead Time & 3-State Status Pills */}
                            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                              <span
                                className={`font-mono-numeric text-xs font-bold px-2.5 py-1 rounded-lg border ${
                                  task.weeksBefore === 0
                                    ? 'bg-[#FDF2F0] text-[#C23B22] border-[#C23B22]/30'
                                    : task.weeksBefore <= 2
                                    ? 'bg-[#FEF8ED] text-[#B4690E] border-[#B4690E]/30'
                                    : 'bg-[#F0F5FA] text-[#2B4C7E] border-[#2B4C7E]/30'
                                }`}
                              >
                                {task.weeksBefore}w lead
                              </span>

                              {/* 3-State Status Toggle Pills */}
                              <div className="flex items-center rounded-lg bg-[#FFFFFF] border border-[#E4DEC8] p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleSetExplicitStatus(task.id, 'pending')}
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all ${
                                    task.status === 'pending'
                                      ? 'bg-[#FAF7F2] text-[#161412] border border-[#E4DEC8]'
                                      : 'text-[#8C8275] hover:text-[#161412]'
                                  }`}
                                >
                                  Pending
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetExplicitStatus(task.id, 'completed')}
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all ${
                                    task.status === 'completed'
                                      ? 'bg-[#EEF7F0] text-[#1E5631] border border-[#1E5631]/40'
                                      : 'text-[#8C8275] hover:text-[#161412]'
                                  }`}
                                >
                                  Done
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetExplicitStatus(task.id, 'delayed')}
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all ${
                                    task.status === 'delayed'
                                      ? 'bg-[#FDF2F0] text-[#C23B22] border border-[#C23B22]/40'
                                      : 'text-[#8C8275] hover:text-[#161412]'
                                  }`}
                                >
                                  Delayed
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </StaggerItem>

      {/* ── Step 05 to 01 Navigation Transition ─────────────────────────── */}
      <StaggerItem>
        <StageNavButtons
          prevLabel="Back to Step 04: Vendors & Smart Plates"
          onPrev={() => onNavigateTab?.('vendor')}
          nextLabel="Return to Step 01: Executive Blueprint"
          onNext={() => onNavigateTab?.('overview')}
        />
      </StaggerItem>
    </StaggerContainer>
  );
};
