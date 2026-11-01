/**
 * @file DependencyTimeline.tsx
 * @description Orchestrator for Celebration Critical-Path Dependency Graph, Date Compression
 * Simulation, and Cascading Delay Bottleneck Analysis.
 */

import React, { useState, useMemo } from 'react';
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
import { TimelineCompressionSimulator } from './timeline/TimelineCompressionSimulator';
import { TimelineDelayCascadeBanner } from './timeline/TimelineDelayCascadeBanner';
import { TimelinePhaseAccordion } from './timeline/TimelinePhaseAccordion';

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
        <TimelineCompressionSimulator
          compressionWeeks={compressionWeeks}
          setCompressionWeeks={setCompressionWeeks}
          criticalWarnings={compressionResult?.criticalWarnings ?? []}
        />
      </StaggerItem>

      {/* ── Active Delay Cascade Alert Banner ──────────────────────────── */}
      {delayedTaskObject && (
        <StaggerItem>
          <TimelineDelayCascadeBanner
            delayedTask={delayedTaskObject}
            downstreamBlocked={downstreamBlocked}
            onDismiss={() => setDelayedTaskId(null)}
          />
        </StaggerItem>
      )}

      {/* ── Main Phases Accordion ──────────────────────────────────────── */}
      <StaggerItem>
        <TimelinePhaseAccordion
          categories={categories}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          phases={phases}
          expandedPhases={expandedPhases}
          onTogglePhase={togglePhase}
          delayedTaskId={delayedTaskId}
          downstreamBlocked={downstreamBlocked}
          allTasks={currentPlan.timeline}
          onToggleTaskStatus={handleToggleStatus}
          onSetExplicitStatus={handleSetExplicitStatus}
        />
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
