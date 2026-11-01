/**
 * @file TimelinePhaseAccordion.tsx
 * @description Collapsible milestone phases (Foundation, Locking, Countdown) with category
 * filtering, prerequisite badges, lead time status, and explicit 3-state toggles.
 */

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Layers, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { TimelineTask } from '../../types/tyohar';

interface MilestonePhase {
  id: string;
  title: string;
  desc: string;
  tasks: TimelineTask[];
}

interface TimelinePhaseAccordionProps {
  categories: string[];
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  phases: MilestonePhase[];
  expandedPhases: Record<string, boolean>;
  onTogglePhase: (phaseId: string) => void;
  delayedTaskId: string | null;
  downstreamBlocked: TimelineTask[];
  allTasks: TimelineTask[];
  onToggleTaskStatus: (taskId: string) => void;
  onSetExplicitStatus: (taskId: string, status: TimelineTask['status']) => void;
}

export const TimelinePhaseAccordion: React.FC<TimelinePhaseAccordionProps> = ({
  categories,
  filterCategory,
  setFilterCategory,
  phases,
  expandedPhases,
  onTogglePhase,
  delayedTaskId,
  downstreamBlocked,
  allTasks,
  onToggleTaskStatus,
  onSetExplicitStatus,
}) => {
  return (
    <div className="space-y-4">
      {/* Category Filter Bar */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#E4DEC8]/60">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8C8275]" aria-hidden="true" />
          <span className="text-xs font-bold text-[#161412] uppercase tracking-wider">
            Category Filter:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Timeline Category Filters">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              aria-pressed={filterCategory === cat}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
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

      {/* Main Phases Accordion Sections */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] shadow-xs overflow-hidden"
          >
            {/* Phase Header */}
            <button
              type="button"
              onClick={() => onTogglePhase(phase.id)}
              aria-expanded={expandedPhases[phase.id]}
              className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
                  <h3 className="text-base font-bold text-[#161412]">{phase.title}</h3>
                  <span className="text-xs font-mono font-bold text-[#686259] bg-[#FAF7F2] border border-[#E4DEC8] px-2 py-0.5 rounded-full">
                    {phase.tasks.length}
                  </span>
                </div>
                <p className="text-xs text-[#686259]">{phase.desc}</p>
              </div>

              {expandedPhases[phase.id] ? (
                <ChevronUp className="w-5 h-5 text-[#8C8275] shrink-0" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C8275] shrink-0" aria-hidden="true" />
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
                              onClick={() => onToggleTaskStatus(task.id)}
                              aria-label={`Toggle completion status for ${task.title}`}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                                task.status === 'completed'
                                  ? 'bg-[#1E5631] border-[#1E5631] text-white font-bold'
                                  : 'border-[#E4DEC8] bg-[#FFFFFF] hover:border-[#1E5631]'
                              }`}
                            >
                              {task.status === 'completed' && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
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
                                    const prerequisite = allTasks.find((t) => t.id === depId);
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
                            <div className="flex items-center rounded-lg bg-[#FFFFFF] border border-[#E4DEC8] p-0.5" role="group" aria-label={`Status for ${task.title}`}>
                              <button
                                type="button"
                                onClick={() => onSetExplicitStatus(task.id, 'pending')}
                                aria-pressed={task.status === 'pending'}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                                  task.status === 'pending'
                                    ? 'bg-[#FAF7F2] text-[#161412] border border-[#E4DEC8]'
                                    : 'text-[#8C8275] hover:text-[#161412]'
                                }`}
                              >
                                Pending
                              </button>
                              <button
                                type="button"
                                onClick={() => onSetExplicitStatus(task.id, 'completed')}
                                aria-pressed={task.status === 'completed'}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                                  task.status === 'completed'
                                    ? 'bg-[#EEF7F0] text-[#1E5631] border border-[#1E5631]/40'
                                    : 'text-[#8C8275] hover:text-[#161412]'
                                }`}
                              >
                                Done
                              </button>
                              <button
                                type="button"
                                onClick={() => onSetExplicitStatus(task.id, 'delayed')}
                                aria-pressed={task.status === 'delayed'}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
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
    </div>
  );
};

