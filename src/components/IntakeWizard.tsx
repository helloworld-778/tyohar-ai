/**
 * @file IntakeWizard.tsx
 * @description Orchestrator for Celebration Intake Studio, Priority Weight Calibration,
 * Multi-Generational Demographics Balancing, and Physical Layout Diagnostics.
 */

import React, { useState } from 'react';
import { Sparkles, Sliders, Users, RefreshCw, Info } from 'lucide-react';
import type {
  EventPlan,
  EventType,
  PriorityWeights,
} from '../types/tyohar';
import { callTyoharAI } from '../services/aiClient';
import { recalculateBudgetAllocations } from '../utils/budgetEngine';
import {
  GuidedPageHero,
  AnimatedTabs,
  StaggerContainer,
  StaggerItem,
  StageNavButtons,
} from './ui/Primitives';
import { IntakeCoreParams } from './intake/IntakeCoreParams';
import { IntakePriorityMatrix } from './intake/IntakePriorityMatrix';
import { IntakeDemographicsPanel } from './intake/IntakeDemographicsPanel';
import { IntakeDiagnosticsPanel } from './intake/IntakeDiagnosticsPanel';

interface IntakeWizardProps {
  currentPlan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onNavigateTab?: (tab: 'overview' | 'budget' | 'vendor' | 'timeline') => void;
}

export const IntakeWizard: React.FC<IntakeWizardProps> = ({
  currentPlan,
  onUpdatePlan,
  onNavigateTab,
}) => {
  const [activeStep, setActiveStep] = useState<'core' | 'vibe'>('core');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFoodType, setSelectedFoodType] = useState<string>('Vegetarian');
  const [visionNotes, setVisionNotes] = useState<string>('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const updateField = <K extends keyof EventPlan>(field: K, value: EventPlan[K]) => {
    onUpdatePlan({ ...currentPlan, [field]: value });
  };

  const handlePriorityChange = (key: keyof PriorityWeights, value: number) => {
    const updatedWeights: PriorityWeights = {
      ...currentPlan.priorityWeights,
      [key]: value,
    };
    const updatedCategories = recalculateBudgetAllocations(
      currentPlan.totalBudgetINR,
      currentPlan.guestCount,
      updatedWeights,
      currentPlan.budgetCategories,
    );
    onUpdatePlan({
      ...currentPlan,
      priorityWeights: updatedWeights,
      budgetCategories: updatedCategories,
    });
  };

  const handleGuestCountChange = (count: number) => {
    const updatedCategories = recalculateBudgetAllocations(
      currentPlan.totalBudgetINR,
      count,
      currentPlan.priorityWeights,
      currentPlan.budgetCategories,
    );
    onUpdatePlan({
      ...currentPlan,
      guestCount: count,
      budgetCategories: updatedCategories,
    });
  };

  const handleBudgetChange = (budget: number) => {
    const updatedCategories = recalculateBudgetAllocations(
      budget,
      currentPlan.guestCount,
      currentPlan.priorityWeights,
      currentPlan.budgetCategories,
    );
    onUpdatePlan({
      ...currentPlan,
      totalBudgetINR: budget,
      budgetCategories: updatedCategories,
    });
  };

  const handleDemographicChange = (
    key: 'kidsPercent' | 'adultsPercent' | 'seniorsPercent',
    value: number,
  ) => {
    const clampedVal = Math.max(0, Math.min(100, value));
    onUpdatePlan({
      ...currentPlan,
      demographics: {
        ...currentPlan.demographics,
        [key]: clampedVal,
      },
    });
  };

  const handleAutoBalanceDemographics = () => {
    const kids = currentPlan.demographics.kidsPercent;
    const seniors = currentPlan.demographics.seniorsPercent;
    const remainingForAdults = Math.max(10, 100 - kids - seniors);
    onUpdatePlan({
      ...currentPlan,
      demographics: {
        ...currentPlan.demographics,
        adultsPercent: remainingForAdults,
      },
    });
  };

  const toggleAccessibilityNeed = (tag: string) => {
    const existing = currentPlan.demographics.accessibilityNeeds;
    const updated = existing.includes(tag)
      ? existing.filter((item) => item !== tag)
      : [...existing, tag];

    onUpdatePlan({
      ...currentPlan,
      demographics: {
        ...currentPlan.demographics,
        accessibilityNeeds: updated,
      },
    });
  };

  const handleRegeneratePlan = async () => {
    setIsGenerating(true);
    setStatusFeedback(null);

    try {
      const response = await callTyoharAI('GENERATE_CUSTOM_PLAN', {
        eventType: currentPlan.eventType,
        totalBudgetINR: currentPlan.totalBudgetINR,
        guestCount: currentPlan.guestCount,
        weeksUntilEvent: currentPlan.timeline.length > 0 ? currentPlan.timeline[0].weeksBefore : 12,
        priorityWeights: currentPlan.priorityWeights,
        demographics: currentPlan.demographics,
        description: `Food preference: ${selectedFoodType}. ${visionNotes ? visionNotes + '. ' : ''}${currentPlan.demographics.accessibilityNeeds.join(', ')}`,
      });

      if (response.success && response.result) {
        const res = response.result as {
          budgetCategories?: EventPlan['budgetCategories'];
          vendorPackages?: EventPlan['vendorPackages'];
          timeline?: EventPlan['timeline'];
          vibeAudit?: EventPlan['vibeAudit'];
          smartPlate?: EventPlan['smartPlate'];
        };

        const updated: EventPlan = {
          ...currentPlan,
          budgetCategories: res.budgetCategories ?? currentPlan.budgetCategories,
          vendorPackages: res.vendorPackages ?? currentPlan.vendorPackages,
          timeline: res.timeline ?? currentPlan.timeline,
          vibeAudit: res.vibeAudit ?? currentPlan.vibeAudit,
          smartPlate: res.smartPlate ?? currentPlan.smartPlate,
        };

        onUpdatePlan(updated);
        setStatusFeedback(
          response.isFallback
            ? 'Personalized plan updated using Deterministic Math Engine.'
            : 'Personalized plan regenerated successfully with Gemini AI.',
        );
      }
    } catch {
      setStatusFeedback('Failed to regenerate plan. Keeping current plan intact.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <StaggerContainer className="space-y-6 p-2 lg:p-4 max-w-7xl mx-auto">
      {/* ── Guided Subpage Hero ────────────────────────────────────────── */}
      <StaggerItem>
        <GuidedPageHero
          stepPill="STEP 02 OF 05 • INTAKE & VIBE MATRIX"
          title="Adaptive Personalization Studio"
          description="Define the core event parameters, rank your cultural priority weights, and calibrate the multi-generational demographic split so your celebration feels effortless for every age group."
          tipsTitle="Intake & Weight Calibration Tips"
          tips={[
            'Priority weights (1–5) strictly dictate automated budget cuts if a vendor quote surges: Priority 1 items are trimmed first, protecting Priority 5 items.',
            'Adjusting guest demographics instantly recalculates quiet acoustic zones, early kids counters, and low-sugar dessert allocations.',
            'Regenerating plan incorporates regional dietary etiquettes into custom Gemini AI vendor packages.',
          ]}
          nextStepLabel="Review Budget Ledger →"
          onNextStep={() => onNavigateTab?.('budget')}
        />
      </StaggerItem>

      {/* ── Sub-Navigation Tabs ────────────────────────────────────────── */}
      <StaggerItem>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <AnimatedTabs
            tabs={[
              {
                id: 'core',
                label: '1. Event Core & Priority Weights',
                icon: <Sliders className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />,
              },
              {
                id: 'vibe',
                label: '2. Multi-Gen Demographics & Vibe Matrix',
                icon: <Users className="w-4 h-4 text-[#2B4C7E]" aria-hidden="true" />,
                badge: `${currentPlan.demographics.accessibilityNeeds.length} Rules`,
              },
            ]}
            activeTab={activeStep}
            onChange={(id) => setActiveStep(id as 'core' | 'vibe')}
          />

          <button
            type="button"
            onClick={handleRegeneratePlan}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl bg-[#161412] hover:bg-[#2C2724] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B4690E]" aria-hidden="true" />
                <span>Synthesizing with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#B4690E]" aria-hidden="true" />
                <span>Regenerate AI Plan &amp; Menu</span>
              </>
            )}
          </button>
        </div>

        {statusFeedback && (
          <div className="mt-3 rounded-xl border border-[#B4690E]/30 bg-[#FEF8ED] p-3 text-xs text-[#161412] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#B4690E] shrink-0" aria-hidden="true" />
            <span>{statusFeedback}</span>
          </div>
        )}
      </StaggerItem>

      {/* ── View 1: Event Core & Priority Weights ───────────────────────── */}
      {activeStep === 'core' && (
        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <IntakeCoreParams
                name={currentPlan.name}
                eventType={currentPlan.eventType}
                selectedFoodType={selectedFoodType}
                guestCount={currentPlan.guestCount}
                totalBudgetINR={currentPlan.totalBudgetINR}
                visionNotes={visionNotes}
                onUpdateName={(name) => updateField('name', name)}
                onUpdateEventType={(type: EventType) => updateField('eventType', type)}
                onUpdateFoodType={setSelectedFoodType}
                onUpdateGuestCount={handleGuestCountChange}
                onUpdateBudget={handleBudgetChange}
                onUpdateVisionNotes={setVisionNotes}
              />
            </div>

            <div className="lg:col-span-7">
              <IntakePriorityMatrix
                priorityWeights={currentPlan.priorityWeights}
                budgetCategories={currentPlan.budgetCategories}
                onPriorityChange={handlePriorityChange}
              />
            </div>
          </div>
        </StaggerItem>
      )}

      {/* ── View 2: Multi-Gen Demographics & Vibe Matrix ─────────────────── */}
      {activeStep === 'vibe' && (
        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <IntakeDemographicsPanel
                demographics={currentPlan.demographics}
                onDemographicChange={handleDemographicChange}
                onAutoBalance={handleAutoBalanceDemographics}
              />
            </div>

            <div className="lg:col-span-7">
              <IntakeDiagnosticsPanel
                accessibilityNeeds={currentPlan.demographics.accessibilityNeeds}
                vibeAudit={currentPlan.vibeAudit}
                onToggleAccessibilityNeed={toggleAccessibilityNeed}
              />
            </div>
          </div>
        </StaggerItem>
      )}

      {/* ── Step 02 to 03 Navigation Transition ─────────────────────────── */}
      <StaggerItem>
        <StageNavButtons
          prevLabel="Back to Step 01: Blueprint"
          onPrev={() => onNavigateTab?.('overview')}
          nextLabel="Proceed to Step 03: Budget Ledger"
          onNext={() => onNavigateTab?.('budget')}
        />
      </StaggerItem>
    </StaggerContainer>
  );
};
