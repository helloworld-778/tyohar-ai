import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Sliders,
  Users,
  ShieldCheck,
  Volume2,
  Calendar,
  RefreshCw,
  Heart,
  Baby,
  UserCheck,
  Flame,
  Check,
  Info,
  Scale,
} from 'lucide-react';
import type {
  EventPlan,
  EventType,
  PriorityWeights,
  DemographicSplit,
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

  const ACCESSIBILITY_OPTIONS = [
    'Wheelchair Ramp & Elevator Access',
    'Low-Decibel Senior Acoustic Zone',
    'Dedicated Jain / Satvik Kitchen Station',
    'Early Kids Dining Counter (5:30 PM)',
    'Low-Sugar Dessert Section for Diabetics',
    'Eco-Friendly Sugarcane / Clay Dinnerware',
  ];

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

  const handleDemographicChange = (
    key: 'kidsPercent' | 'adultsPercent' | 'seniorsPercent',
    value: number,
  ) => {
    const clampedVal = Math.max(0, Math.min(100, value));
    const newDemo: DemographicSplit = {
      ...currentPlan.demographics,
      [key]: clampedVal,
    };
    onUpdatePlan({ ...currentPlan, demographics: newDemo });
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

  const demoTotal =
    currentPlan.demographics.kidsPercent +
    currentPlan.demographics.adultsPercent +
    currentPlan.demographics.seniorsPercent;

  const priorityLabels: Record<keyof PriorityWeights, { title: string; desc: string }> = {
    food: { title: 'Food & Catering', desc: 'Menu variety, live counters, dessert stations' },
    venue: { title: 'Venue & Banquet', desc: 'Location grandeur, lawns, air-conditioning' },
    decor: { title: 'Floral Décor & Lighting', desc: 'Stage design, photobooths, entrance arch' },
    photography: { title: 'Photography & Cinema', desc: 'Candid shoots, drone coverage, teaser reels' },
    entertainment: { title: 'Entertainment & DJ', desc: 'Sound setup, folk artists, choreographers' },
  };

  const getProtectionBadge = (weight: number) => {
    if (weight >= 5) {
      return {
        label: 'Priority 5/5 • 100% Protected from Automated Cuts',
        color: 'bg-[#EEF7F0] text-[#1E5631] border-[#1E5631]/30',
      };
    }
    if (weight === 4) {
      return {
        label: 'Priority 4/5 • High Defense against Cost Surges',
        color: 'bg-[#F0F5FA] text-[#2B4C7E] border-[#2B4C7E]/30',
      };
    }
    if (weight === 3) {
      return {
        label: 'Priority 3/5 • Balanced Market Proportionality',
        color: 'bg-[#FAF7F2] text-[#686259] border-[#E4DEC8]',
      };
    }
    if (weight === 2) {
      return {
        label: 'Priority 2/5 • Flexible for Trade-Off Rebalancing',
        color: 'bg-[#FEF8ED] text-[#B4690E] border-[#B4690E]/30',
      };
    }
    return {
      label: 'Priority 1/5 • Primary Target for Budget Cuts',
      color: 'bg-[#FDF2F0] text-[#C23B22] border-[#C23B22]/30',
    };
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
                icon: <Sliders className="w-4 h-4 text-[#B4690E]" />,
              },
              {
                id: 'vibe',
                label: '2. Multi-Gen Demographics & Vibe Matrix',
                icon: <Users className="w-4 h-4 text-[#2B4C7E]" />,
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
            className="flex items-center gap-2 rounded-xl bg-[#161412] hover:bg-[#2C2724] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 shrink-0"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B4690E]" />
                <span>Synthesizing with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#B4690E]" />
                <span>Regenerate AI Plan &amp; Menu</span>
              </>
            )}
          </button>
        </div>

        {statusFeedback && (
          <div className="mt-3 rounded-xl border border-[#B4690E]/30 bg-[#FEF8ED] p-3 text-xs text-[#161412] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#B4690E] shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}
      </StaggerItem>

      {/* ── View 1: Event Core & Priority Weights ───────────────────────── */}
      {activeStep === 'core' && (
        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (5 cols): Basic Parameters */}
            <div className="lg:col-span-5 rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-5">
              <div className="border-b border-[#E4DEC8]/60 pb-4">
                <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#B4690E]" />
                  <span>Celebration Details</span>
                </h3>
                <p className="text-xs text-[#686259] mt-0.5">
                  General scale and timeline parameters.
                </p>
              </div>

              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold text-[#161412] mb-1.5">
                  Event Title
                </label>
                <input
                  type="text"
                  value={currentPlan.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] focus:border-[#B4690E] focus:outline-hidden"
                />
              </div>

              {/* Event Type & Cuisine Preference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#161412] mb-1.5">
                    Celebration Type
                  </label>
                  <select
                    value={currentPlan.eventType}
                    onChange={(e) => updateField('eventType', e.target.value as EventType)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] focus:border-[#B4690E] focus:outline-hidden"
                  >
                    <option value="wedding">Vivah (Wedding)</option>
                    <option value="community">Community Utsav</option>
                    <option value="birthday">Milestone Birthday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161412] mb-1.5">
                    Food Style
                  </label>
                  <select
                    value={selectedFoodType}
                    onChange={(e) => setSelectedFoodType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] focus:border-[#B4690E] focus:outline-hidden"
                  >
                    <option value="Vegetarian">Pure Vegetarian</option>
                    <option value="Jain-Satvik">Jain / Satvik Focus</option>
                    <option value="Non-Veg">Veg + Non-Veg Counters</option>
                    <option value="Multi-Cuisine">Multi-Cuisine Regional</option>
                  </select>
                </div>
              </div>

              {/* Guest Count & Budget (INR) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#161412] mb-1.5">
                    Invited Guests
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={currentPlan.guestCount}
                    onChange={(e) => {
                      const count = Math.max(10, parseInt(e.target.value, 10) || 10);
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
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] font-mono-numeric focus:border-[#B4690E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161412] mb-1.5">
                    Total Budget (INR)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    min="10000"
                    value={currentPlan.totalBudgetINR}
                    onChange={(e) => {
                      const budget = Math.max(10000, parseInt(e.target.value, 10) || 10000);
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
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] font-mono-numeric focus:border-[#B4690E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#161412] mb-1.5">
                  Vision &amp; Aesthetic Notes
                </label>
                <textarea
                  rows={3}
                  value={visionNotes}
                  onChange={(e) => setVisionNotes(e.target.value)}
                  placeholder="e.g. Traditional Marwari wedding with rich musical night..."
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] placeholder:text-[#8C8275] focus:border-[#B4690E] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Right Column (7 cols): Priority Sliders */}
            <div className="lg:col-span-7 rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E4DEC8]/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#B4690E]" />
                    <span>Priority Weight Matrix (1 to 5)</span>
                  </h3>
                  <p className="text-xs text-[#686259] mt-0.5">
                    Dictates budget weighting and immunizes high-priority vendors from trade-offs.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#B4690E] bg-[#FEF8ED] border border-[#B4690E]/30 px-2.5 py-1 rounded-full">
                  1 = Flexible • 5 = Sacrosanct
                </span>
              </div>

              <div className="space-y-3.5">
                {(Object.keys(currentPlan.priorityWeights) as (keyof PriorityWeights)[]).map((key) => {
                  const weight = currentPlan.priorityWeights[key];
                  const info = priorityLabels[key];
                  const badge = getProtectionBadge(weight);

                  return (
                    <div
                      key={key}
                      className="p-3.5 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div>
                          <span className="text-xs font-bold text-[#161412] block">
                            {info.title}
                          </span>
                          <span className="text-[11px] text-[#686259]">
                            {info.desc}
                          </span>
                        </div>

                        {/* Expressive Protection Pill */}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-center shrink-0 ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Interactive Star/Rating Buttons */}
                      <div className="flex items-center justify-between gap-4 pt-1">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((lvl) => {
                            const isSelected = lvl <= weight;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handlePriorityChange(key, lvl)}
                                className={`h-7 w-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${
                                  isSelected
                                    ? 'bg-[#B4690E] text-white border-[#B4690E] shadow-xs'
                                    : 'bg-[#FFFFFF] border-[#E4DEC8] text-[#686259] hover:bg-[#F3EFE6] hover:text-[#161412]'
                                }`}
                              >
                                {lvl}
                              </button>
                            );
                          })}
                        </div>

                        {/* Proportional allocation snippet */}
                        <span className="text-xs font-mono font-bold text-[#161412]">
                          {currentPlan.budgetCategories.find((c) =>
                            c.name.toLowerCase().includes(key.substring(0, 4)),
                          )?.allocatedAmount
                            ? `₹${currentPlan.budgetCategories
                                .find((c) => c.name.toLowerCase().includes(key.substring(0, 4)))!
                                .allocatedAmount.toLocaleString('en-IN')}`
                            : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </StaggerItem>
      )}

      {/* ── View 2: Multi-Gen Demographics & Vibe Matrix ─────────────────── */}
      {activeStep === 'vibe' && (
        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (5 cols): Demographic Split & Stacked Bar */}
            <div className="lg:col-span-5 rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E4DEC8]/60 pb-4">
                <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2B4C7E]" />
                  <span>Demographic Mix</span>
                </h3>
                <p className="text-xs text-[#686259] mt-0.5">
                  Calibrates seating, acoustics, and dining cadence.
                </p>
              </div>

              {/* Stacked Bar with Clean Tone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#161412]">Generational Balance:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold ${
                        demoTotal === 100 ? 'text-[#1E5631]' : 'text-[#B4690E]'
                      }`}
                    >
                      Total: {demoTotal}%
                    </span>
                    {demoTotal !== 100 && (
                      <button
                        type="button"
                        onClick={handleAutoBalanceDemographics}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#B4690E] bg-[#FEF8ED] border border-[#B4690E]/30 px-2 py-0.5 rounded hover:bg-[#FDF2DE]"
                      >
                        <Scale className="w-3 h-3" />
                        <span>Balance to 100%</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="h-4 w-full rounded-full bg-[#F3EFE6] p-0.5 overflow-hidden flex border border-[#E4DEC8]">
                  <motion.div
                    animate={{ width: `${currentPlan.demographics.kidsPercent}%` }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                    className="h-full bg-[#2B4C7E] first:rounded-l-full"
                    title={`Kids: ${currentPlan.demographics.kidsPercent}%`}
                  />
                  <motion.div
                    animate={{ width: `${currentPlan.demographics.adultsPercent}%` }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                    className="h-full bg-[#B4690E]"
                    title={`Adults: ${currentPlan.demographics.adultsPercent}%`}
                  />
                  <motion.div
                    animate={{ width: `${currentPlan.demographics.seniorsPercent}%` }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                    className="h-full bg-[#1E5631] last:rounded-r-full"
                    title={`Seniors: ${currentPlan.demographics.seniorsPercent}%`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#686259] pt-1">
                  <span className="flex items-center gap-1 text-[#2B4C7E] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#2B4C7E]" /> Kids (
                    {currentPlan.demographics.kidsPercent}%)
                  </span>
                  <span className="flex items-center gap-1 text-[#B4690E] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#B4690E]" /> Adults (
                    {currentPlan.demographics.adultsPercent}%)
                  </span>
                  <span className="flex items-center gap-1 text-[#1E5631] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#1E5631]" /> Seniors (
                    {currentPlan.demographics.seniorsPercent}%)
                  </span>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-2 border-t border-[#E4DEC8]/60">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#2B4C7E] flex items-center gap-1">
                      <Baby className="w-3.5 h-3.5" /> Kids (0–12 yrs)
                    </span>
                    <span className="font-mono text-[#161412]">{currentPlan.demographics.kidsPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={currentPlan.demographics.kidsPercent}
                    onChange={(e) =>
                      handleDemographicChange('kidsPercent', parseInt(e.target.value, 10))
                    }
                    className="w-full accent-[#2B4C7E] h-1.5 bg-[#E4DEC8] rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#B4690E] flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Adults (13–59 yrs)
                    </span>
                    <span className="font-mono text-[#161412]">{currentPlan.demographics.adultsPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={currentPlan.demographics.adultsPercent}
                    onChange={(e) =>
                      handleDemographicChange('adultsPercent', parseInt(e.target.value, 10))
                    }
                    className="w-full accent-[#B4690E] h-1.5 bg-[#E4DEC8] rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#1E5631] flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" /> Seniors (60+ yrs)
                    </span>
                    <span className="font-mono text-[#161412]">{currentPlan.demographics.seniorsPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={currentPlan.demographics.seniorsPercent}
                    onChange={(e) =>
                      handleDemographicChange('seniorsPercent', parseInt(e.target.value, 10))
                    }
                    className="w-full accent-[#1E5631] h-1.5 bg-[#E4DEC8] rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Accommodations Checklist & Active Diagnostics */}
            <div className="lg:col-span-7 space-y-6">
              {/* Accommodations Card */}
              <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
                <div className="border-b border-[#E4DEC8]/60 pb-4">
                  <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1E5631]" />
                    <span>Dietary &amp; Accessibility Rules</span>
                  </h3>
                  <p className="text-xs text-[#686259] mt-0.5">
                    Check accommodations to auto-generate floor plans and catering briefs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ACCESSIBILITY_OPTIONS.map((opt) => {
                    const isChecked = currentPlan.demographics.accessibilityNeeds.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleAccessibilityNeed(opt)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                          isChecked
                            ? 'bg-[#FEF8ED] border-[#B4690E]/50 text-[#161412]'
                            : 'bg-[#FAF7F2] border-[#E4DEC8] text-[#686259] hover:border-[#B4690E]/30'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isChecked
                              ? 'bg-[#B4690E] border-[#B4690E] text-white font-bold'
                              : 'border-[#E4DEC8] bg-[#FFFFFF]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="leading-snug font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Physical Layout Diagnostics */}
              <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
                <div className="border-b border-[#E4DEC8]/60 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#B4690E]" />
                      <span>Physical Layout Diagnostics</span>
                    </h3>
                    <p className="text-xs text-[#686259] mt-0.5">
                      Proactive collision prevention between young dancers and elder dining.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5631] bg-[#EEF7F0] border border-[#1E5631]/30 px-2.5 py-0.5 rounded-full">
                    Auto-Resolved
                  </span>
                </div>

                <div className="space-y-3">
                  {currentPlan.vibeAudit.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#161412] flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4 text-[#B4690E]" />
                          {item.zone}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EEF7F0] text-[#1E5631] border border-[#1E5631]/30">
                          Fix Applied
                        </span>
                      </div>
                      <p className="text-[#686259] leading-relaxed">{item.frictionWarning}</p>
                      <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#1E5631]/30 text-[#1E5631] text-[11px] font-semibold">
                        &check; <strong>Layout Solution:</strong> {item.accommodationFix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
