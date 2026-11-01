/**
 * @file OverviewDashboard.tsx
 * @description Orchestrator for Celebration Command Executive Blueprint, KPI Metric Cards,
 * Interactive AI Ideas & Vibe Remixer, Proportional Budget Ledger, and Priority Actions.
 */

import React, { useMemo, useState } from 'react';
import type { EventPlan, TimelineTask } from '../types/tyohar';
import {
  GuidedPageHero,
  StaggerContainer,
  StaggerItem,
  StageNavButtons,
} from './ui/Primitives';
import { callTyoharAI } from '../services/aiClient';
import { getSubThemes, getCuratedIdeas } from '../data/ideasCatalog';
import { OverviewWorkflowStepper } from './overview/OverviewWorkflowStepper';
import { OverviewMetricsGrid } from './overview/OverviewMetricsGrid';
import { OverviewIdeasMixer, type IdeaCardItem } from './overview/OverviewIdeasMixer';
import { OverviewBudgetLedgerBar } from './overview/OverviewBudgetLedgerBar';
import { OverviewActionItems } from './overview/OverviewActionItems';
import { Sparkles } from 'lucide-react';

interface OverviewDashboardProps {
  currentPlan: EventPlan;
  onNavigateTab: (tab: 'intake' | 'budget' | 'vendor' | 'timeline') => void;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  currentPlan,
  onNavigateTab,
  onUpdatePlan,
}) => {
  // ── Sub-Theme State for Interactive Remixing ──────────────────────────────
  const [activeSubTheme, setActiveSubTheme] = useState<string>('default');
  const [customIdeaPrompt, setCustomIdeaPrompt] = useState('');
  const [isSynthesizingIdea, setIsSynthesizingIdea] = useState(false);
  const [customPinnedIdeas, setCustomPinnedIdeas] = useState<IdeaCardItem[]>([]);

  // Aggregate Metrics
  const totalEstimated = useMemo(() => {
    return currentPlan.budgetCategories.reduce((sum, c) => sum + c.estimatedCost, 0);
  }, [currentPlan.budgetCategories]);

  const overage = Math.max(0, totalEstimated - currentPlan.totalBudgetINR);
  const budgetUsagePercent = Math.round(
    (totalEstimated / Math.max(1, currentPlan.totalBudgetINR)) * 100,
  );

  const completedTasks = currentPlan.timeline.filter((t) => t.status === 'completed').length;
  const delayedTasks = currentPlan.timeline.filter((t) => t.status === 'delayed').length;

  const urgentTasks = useMemo(() => {
    return [...currentPlan.timeline]
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => a.weeksBefore - b.weeksBefore)
      .slice(0, 3);
  }, [currentPlan.timeline]);

  const handleToggleTaskStatus = (taskId: string) => {
    const updated = currentPlan.timeline.map((t) => {
      if (t.id === taskId) {
        const next: TimelineTask['status'] = t.status === 'pending' ? 'completed' : 'pending';
        return { ...t, status: next };
      }
      return t;
    });
    onUpdatePlan({ ...currentPlan, timeline: updated });
  };

  const subThemes = useMemo(() => {
    return getSubThemes(currentPlan.eventType);
  }, [currentPlan.eventType]);

  const currentIdeaCards = useMemo(() => {
    return getCuratedIdeas(currentPlan.eventType, activeSubTheme);
  }, [currentPlan.eventType, activeSubTheme]);

  const allIdeas = useMemo(() => {
    return [...customPinnedIdeas, ...currentIdeaCards];
  }, [customPinnedIdeas, currentIdeaCards]);

  const isIdeaAdded = (ideaId: string) => {
    return currentPlan.timeline.some((t) => t.id === `idea-${ideaId}`);
  };

  const handleToggleIdeaToPlan = (idea: IdeaCardItem) => {
    const taskId = `idea-${idea.id}`;
    const alreadyAdded = isIdeaAdded(idea.id);

    if (alreadyAdded) {
      const updatedTimeline = currentPlan.timeline.filter((t) => t.id !== taskId);
      const updatedCategories = currentPlan.budgetCategories.map((cat) => {
        if (cat.name.toLowerCase().includes(idea.category.toLowerCase().substring(0, 4))) {
          return {
            ...cat,
            estimatedCost: Math.max(0, cat.estimatedCost - idea.costINR),
          };
        }
        return cat;
      });

      onUpdatePlan({
        ...currentPlan,
        budgetCategories: updatedCategories,
        timeline: updatedTimeline,
      });
    } else {
      const newTask: TimelineTask = {
        id: taskId,
        title: idea.title,
        category: idea.category,
        weeksBefore: 4,
        status: 'pending',
        dependsOn: [],
        impactIfDelayed: `Delays execution of "${idea.title}"`,
      };

      const updatedCategories = currentPlan.budgetCategories.map((cat) => {
        if (cat.name.toLowerCase().includes(idea.category.toLowerCase().substring(0, 4))) {
          return {
            ...cat,
            estimatedCost: cat.estimatedCost + idea.costINR,
            notes: `${cat.notes ? cat.notes + ' • ' : ''}[Added: ${idea.title}]`,
          };
        }
        return cat;
      });

      onUpdatePlan({
        ...currentPlan,
        budgetCategories: updatedCategories,
        timeline: [newTask, ...currentPlan.timeline],
      });
    }
  };

  const handleSynthesizeCustomIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdeaPrompt.trim()) return;

    setIsSynthesizingIdea(true);
    try {
      const response = await callTyoharAI('GENERATE_CUSTOM_PLAN', {
        eventType: currentPlan.eventType,
        totalBudgetINR: currentPlan.totalBudgetINR,
        guestCount: currentPlan.guestCount,
        description: `Custom concept requested: ${customIdeaPrompt}`,
      });

      const newId = `custom-${Date.now()}`;
      const synthesized: IdeaCardItem = {
        id: newId,
        category: 'Food & Catering',
        title: customIdeaPrompt.trim(),
        desc: response.isFallback
          ? 'Custom concept synthesized with authentic cultural benchmarks and dietary coordination.'
          : 'Gemini AI generated bespoke execution concept aligned with your celebration profile.',
        costINR: Math.round(currentPlan.guestCount * 75),
        icon: Sparkles,
      };

      setCustomPinnedIdeas([synthesized, ...customPinnedIdeas]);
      setCustomIdeaPrompt('');
    } finally {
      setIsSynthesizingIdea(false);
    }
  };

  return (
    <StaggerContainer className="space-y-6 p-2 lg:p-4 max-w-7xl mx-auto">
      {/* ── Guided Subpage Hero ────────────────────────────────────────── */}
      <StaggerItem>
        <GuidedPageHero
          stepPill="STEP 01 OF 05 • EXECUTIVE BLUEPRINT"
          title={`Celebration Command: ${currentPlan.name}`}
          description="A single live mission-control ledger aggregating your fiscal allocations, guest turnout curves, upcoming critical-path deadlines, and multi-generational acoustic balance."
          tipsTitle="Executive Overview Tips"
          tips={[
            'The Smart Plate calculation eliminates 15-20% customary food waste while safeguarding against social embarrassment.',
            'Milestones are mapped with prerequisite constraints so delaying early decisions flags cascading risks immediately.',
            'Press ⌘K anytime to simulate real-world curveballs (+50 guests, cost overruns, moved dates) in-place.',
          ]}
          nextStepLabel="Configure Intake Studio →"
          onNextStep={() => onNavigateTab('intake')}
        />
      </StaggerItem>

      {/* ── Interactive 4-Step Workflow Stepper ──────────────────────────── */}
      <StaggerItem>
        <OverviewWorkflowStepper onNavigateTab={onNavigateTab} />
      </StaggerItem>

      {/* ── 4 Executive MetricStatCards ─────────────────────────────────── */}
      <StaggerItem>
        <OverviewMetricsGrid
          currentPlan={currentPlan}
          totalEstimated={totalEstimated}
          overage={overage}
          budgetUsagePercent={budgetUsagePercent}
          completedTasks={completedTasks}
          delayedTasks={delayedTasks}
        />
      </StaggerItem>

      {/* ── Interactive AI Celebration Ideas & Remixer Studio ────────────── */}
      <StaggerItem>
        <OverviewIdeasMixer
          subThemes={subThemes}
          activeSubTheme={activeSubTheme}
          customIdeaPrompt={customIdeaPrompt}
          isSynthesizingIdea={isSynthesizingIdea}
          allIdeas={allIdeas}
          isIdeaAdded={isIdeaAdded}
          onSelectSubTheme={setActiveSubTheme}
          onPromptChange={setCustomIdeaPrompt}
          onSubmitCustomIdea={handleSynthesizeCustomIdea}
          onToggleIdeaToPlan={handleToggleIdeaToPlan}
        />
      </StaggerItem>

      {/* ── 2-Column Split: Budget Bar & Priority Actions ───────────────── */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7">
            <OverviewBudgetLedgerBar
              categories={currentPlan.budgetCategories}
              totalBudgetINR={currentPlan.totalBudgetINR}
              onNavigateBudget={() => onNavigateTab('budget')}
            />
          </div>

          <div className="lg:col-span-5">
            <OverviewActionItems
              urgentTasks={urgentTasks}
              totalTasksCount={currentPlan.timeline.length}
              vibeAuditItem={currentPlan.vibeAudit[0]}
              onNavigateTimeline={() => onNavigateTab('timeline')}
              onToggleTaskStatus={handleToggleTaskStatus}
            />
          </div>
        </div>
      </StaggerItem>

      {/* ── Step 01 to 02 Navigation Transition ─────────────────────────── */}
      <StaggerItem>
        <StageNavButtons
          nextLabel="Proceed to Step 02: Intake & Vibe Studio"
          onNext={() => onNavigateTab('intake')}
        />
      </StaggerItem>
    </StaggerContainer>
  );
};
