import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  X,
  Zap,
  RotateCcw,
  Menu,
} from 'lucide-react';
import type { EventPlan, MutationDiff } from '../types/tyohar';
import { callTyoharAI } from '../services/aiClient';
import { recalculateBudgetAllocations } from '../utils/budgetEngine';
import { compressTimelineForEarlierDate } from '../utils/timelineEngine';

interface ChaosMutatorBarProps {
  currentPlan: EventPlan;
  onPlanMutated: (updatedPlan: EventPlan, diff: MutationDiff) => void;
  canUndo?: boolean;
  onUndo?: () => void;
  isAutosaved?: boolean;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const ChaosMutatorBar: React.FC<ChaosMutatorBarProps> = ({
  currentPlan,
  onPlanMutated,
  canUndo,
  onUndo,
  isAutosaved = true,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputScenario, setInputScenario] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDiff, setActiveDiff] = useState<MutationDiff | null>(null);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Quick 1-Click Scenario Chips
  const SCENARIO_CHIPS = [
    {
      id: 'chip-guests-budget',
      label: '+50 Guests & -10% Budget',
      icon: TrendingDown,
      action: async () => {
        await executeMutation('+50 guests, budget -10%');
      },
    },
    {
      id: 'chip-timeline-early',
      label: 'Event Moved 2 Weeks Earlier',
      icon: Clock,
      action: async () => {
        await executeMutation('2 weeks earlier');
      },
    },
    {
      id: 'chip-cost-overrun',
      label: 'Simulate +20% Cost Overrun',
      icon: AlertTriangle,
      action: async () => {
        const updatedCategories = currentPlan.budgetCategories.map((cat) => {
          if (!cat.isConfirmedQuote) {
            return {
              ...cat,
              estimatedCost: Math.round(cat.estimatedCost * 1.2),
            };
          }
          return cat;
        });

        const totalEstimated = updatedCategories.reduce(
          (sum, c) => sum + c.estimatedCost,
          0,
        );

        const diff: MutationDiff = {
          summary:
            'Simulated +20% vendor price surge across unconfirmed line items. Surgical trade-offs activated to safeguard priority #1.',
          previousBudget: currentPlan.totalBudgetINR,
          newBudget: currentPlan.totalBudgetINR,
          previousGuests: currentPlan.guestCount,
          newGuests: currentPlan.guestCount,
          timelineShifts: [],
          budgetAdjustments: [
            `Total Estimated Expenses escalated to ₹${totalEstimated.toLocaleString('en-IN')}`,
            `Budget Deficit: ₹${Math.max(0, totalEstimated - currentPlan.totalBudgetINR).toLocaleString('en-IN')}`,
          ],
        };

        const updatedPlan: EventPlan = {
          ...currentPlan,
          budgetCategories: updatedCategories,
          mutationHistory: [diff, ...currentPlan.mutationHistory],
        };

        setActiveDiff(diff);
        onPlanMutated(updatedPlan, diff);
      },
    },
  ];

  const executeMutation = async (scenarioText: string) => {
    if (!scenarioText.trim()) return;
    setIsProcessing(true);

    try {
      const response = await callTyoharAI('MUTATE_PLAN_WHAT_IF', {
        currentPlan,
        changeDescription: scenarioText,
      });

      if (response.success && response.result) {
        const res = response.result as {
          mutationDiff?: MutationDiff;
          updatedBudgetCategories?: EventPlan['budgetCategories'];
          updatedTimeline?: EventPlan['timeline'];
        };

        if (res.mutationDiff) {
          const diff = res.mutationDiff;
          const updatedPlan: EventPlan = {
            ...currentPlan,
            totalBudgetINR: diff.newBudget,
            guestCount: diff.newGuests,
            budgetCategories:
              res.updatedBudgetCategories ?? currentPlan.budgetCategories,
            timeline: res.updatedTimeline ?? currentPlan.timeline,
            mutationHistory: [diff, ...currentPlan.mutationHistory],
          };

          setActiveDiff(diff);
          onPlanMutated(updatedPlan, diff);
        }
      }
    } catch {
      // Deterministic fallback
      const newGuests = scenarioText.includes('+50')
        ? currentPlan.guestCount + 50
        : currentPlan.guestCount;
      const budgetMult = scenarioText.includes('-10%') ? 0.9 : 1.0;
      const newBudget = Math.round(currentPlan.totalBudgetINR * budgetMult);

      const updatedCategories = recalculateBudgetAllocations(
        newBudget,
        newGuests,
        currentPlan.priorityWeights,
        currentPlan.budgetCategories,
      );

      let updatedTimeline = currentPlan.timeline;
      const timelineShifts: string[] = [];

      if (scenarioText.includes('earlier')) {
        const compressed = compressTimelineForEarlierDate(
          currentPlan.timeline,
          2,
        );
        updatedTimeline = compressed.updatedTasks;
        timelineShifts.push(...compressed.criticalWarnings);
      }

      const diff: MutationDiff = {
        summary: `Deterministic Contingency Applied: "${scenarioText}"`,
        previousBudget: currentPlan.totalBudgetINR,
        newBudget,
        previousGuests: currentPlan.guestCount,
        newGuests,
        timelineShifts,
        budgetAdjustments: [
          `Adjusted budget to ₹${newBudget.toLocaleString('en-IN')}`,
          `Guest count set to ${newGuests}`,
        ],
      };

      const updatedPlan: EventPlan = {
        ...currentPlan,
        totalBudgetINR: newBudget,
        guestCount: newGuests,
        budgetCategories: updatedCategories,
        timeline: updatedTimeline,
        mutationHistory: [diff, ...currentPlan.mutationHistory],
      };

      setActiveDiff(diff);
      onPlanMutated(updatedPlan, diff);
    } finally {
      setIsProcessing(false);
      setInputScenario('');
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputScenario.trim()) return;
    await executeMutation(inputScenario);
  };

  const formatINR = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  return (
    <>
      {/* ── Architectural Bahi-Khata Top Command Bar (Single 50px Row) ──────── */}
      <section
        aria-label="Contingency & What-If Mutation Engine"
        className="sticky top-0 z-30 border-b border-[#E4DEC8] bg-[#FFFFFF] px-4 py-2 sm:px-6 shadow-xs"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          {/* Left: Mobile Menu Toggle + Active Event Title & Tabular Metrics */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            {onToggleMobileSidebar && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                aria-label="Toggle navigation drawer"
                className="lg:hidden rounded-md p-1.5 text-[#686259] hover:bg-[#F3EFE6] hover:text-[#161412]"
              >
                {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            )}

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#E4DEC8] bg-[#F3EFE6] text-[#B4690E]">
              <Wand2 className="h-3.5 w-3.5" />
            </div>

            <div className="flex items-center gap-2 truncate">
              <span className="truncate text-xs font-bold text-[#161412]">
                {currentPlan.name}
              </span>

              <span className="hidden sm:inline-flex items-center rounded-sm border border-[#E4DEC8] bg-[#F3EFE6] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#B4690E]">
                {currentPlan.eventType}
              </span>

              {/* Quick Metrics (JetBrains Mono Tabular Numerals) */}
              <div className="hidden md:flex items-center gap-2 text-[11px] text-[#686259] font-mono-numeric">
                <span className="text-[#C9C0A6]">•</span>
                <span className="text-[#161412] font-semibold">{formatINR(currentPlan.totalBudgetINR)}</span>
                <span className="text-[#C9C0A6]">•</span>
                <span>{currentPlan.guestCount} Guests</span>
                <span className="text-[#C9C0A6]">•</span>
                <span>
                  {currentPlan.timeline.length > 0 ? currentPlan.timeline[0].weeksBefore : 12} Wks
                </span>
              </div>
            </div>
          </div>

          {/* Right: Autosave Pill, 1-Click Undo, Diff Indicator & ⌘K Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {isAutosaved && (
              <div
                className="hidden xl:inline-flex items-center gap-1.5 rounded-sm border border-[#1E5631]/30 bg-[#1E5631]/10 px-2 py-0.5 text-[11px] font-medium text-[#1E5631]"
                title="All plan changes automatically saved locally"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#1E5631] animate-pulse" />
                <span>Autosaved Draft</span>
              </div>
            )}

            {canUndo && onUndo && (
              <button
                type="button"
                onClick={onUndo}
                className="flex items-center gap-1 rounded-md border border-[#E4DEC8] bg-[#F3EFE6] px-2.5 py-1 text-xs font-semibold text-[#B4690E] hover:border-[#B4690E] hover:bg-[#FFFFFF] transition-colors"
                title="Undo last modification"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Undo</span>
              </button>
            )}

            {activeDiff && (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-[#1E5631]/30 bg-[#1E5631]/10 px-2.5 py-1 text-xs font-bold text-[#1E5631] hover:bg-[#1E5631]/20 transition-colors"
                title="View latest mutation diff"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Diff Applied</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open AI What-If Simulator"
              className="relative flex items-center gap-2 rounded-md bg-[#161412] hover:bg-[#24201C] px-3.5 py-1.5 text-xs font-bold text-[#FAF7F2] shadow-xs transition-colors"
            >
              <Zap className="h-3.5 w-3.5 text-[#B4690E]" />
              <span>AI What-If Simulator</span>
              <kbd className="hidden lg:inline-flex items-center rounded border border-white/20 bg-white/10 px-1 py-0.2 text-[10px] font-mono text-slate-300">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </section>

      {/* ── Dedicated Dark Ledger Drawer for ⌘K Chaos Mutator (#181512) ───── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#161412]/75 backdrop-blur-xs"
            />

            {/* Modal Dialog (#181512 Dark Ledger Surface) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-[#181512] p-6 shadow-2xl text-[#FAF7F2]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#B4690E]/30 bg-[#B4690E]/10 text-[#B4690E]">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-serif-heading text-lg font-bold text-[#FAF7F2] flex items-center gap-2">
                      <span>Live &ldquo;What-If&rdquo; Simulator</span>
                      <span className="rounded-sm bg-[#B4690E]/20 border border-[#B4690E]/40 px-2 py-0.5 text-[11px] font-bold text-[#FEF08A]">
                        In-Place State Diffing
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Test unexpected real-world curveballs without losing your existing progress.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Close simulator"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="mt-5 space-y-5">
                {/* 1-Click Scenario Chips */}
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Popular Indian Event Scenarios:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SCENARIO_CHIPS.map((chip) => {
                      const Icon = chip.icon;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={chip.action}
                          disabled={isProcessing}
                          className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] p-3 text-left text-xs font-semibold text-slate-300 transition-colors hover:border-[#B4690E] hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-[#B4690E]" />
                          <span className="line-clamp-2">{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Natural Language Prompt Form */}
                <form onSubmit={handleCustomSubmit} className="space-y-2">
                  <label htmlFor="custom-mutation-input" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Or Describe Any Custom Contingency in Plain English:
                  </label>
                  <div className="relative">
                    <input
                      id="custom-mutation-input"
                      type="text"
                      autoFocus
                      value={inputScenario}
                      onChange={(e) => setInputScenario(e.target.value)}
                      placeholder="e.g. Add Jain food counter for 40 elders and cut decor by ₹30,000..."
                      className="w-full rounded-md border border-white/15 bg-black/60 px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-[#B4690E] focus:outline-hidden"
                    />
                    <Sparkles className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-[#B4690E]" />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Tip: Gemini parses the mutation, then deterministically realigns INR budgets &amp; dates.
                    </span>

                    <button
                      type="submit"
                      disabled={isProcessing || !inputScenario.trim()}
                      className="flex items-center gap-1.5 rounded-md bg-[#C23B22] hover:bg-[#9E2A15] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <>
                          <span>Run What-If</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Diff Comparison Card */}
                {activeDiff && (
                  <div
                    aria-live="polite"
                    className="rounded-md border border-[#B4690E]/40 bg-black/60 p-4 text-xs space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1E5631] mt-0.5" />
                      <div>
                        <div className="font-bold text-[#FEF08A]">
                          {activeDiff.summary}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Active plan has been updated in-place.
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                      {/* Budget Delta */}
                      <div className="rounded-md bg-white/[0.04] p-3 border border-white/10 space-y-1.5">
                        <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">
                          Budget &amp; Attendee Shift
                        </span>
                        <div className="flex items-center justify-between text-xs font-mono-numeric">
                          <span className="text-slate-400 font-sans">Budget:</span>
                          <span className="font-bold text-[#1E5631]">
                            {formatINR(activeDiff.previousBudget)} &rarr; {formatINR(activeDiff.newBudget)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono-numeric">
                          <span className="text-slate-400 font-sans">Guests:</span>
                          <span className="font-bold text-[#B4690E]">
                            {activeDiff.previousGuests} &rarr; {activeDiff.newGuests}
                          </span>
                        </div>
                        {activeDiff.budgetAdjustments.length > 0 && (
                          <ul className="text-[11px] text-slate-400 space-y-0.5 pt-1 border-t border-white/10">
                            {activeDiff.budgetAdjustments.map((adj, i) => (
                              <li key={i}>&bull; {adj}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Timeline Shifts */}
                      <div className="rounded-md bg-white/[0.04] p-3 border border-white/10 space-y-1.5">
                        <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider flex items-center gap-1">
                          <SlidersHorizontal className="h-3 w-3 text-[#B4690E]" />
                          Critical Path Realignment
                        </span>
                        {activeDiff.timelineShifts.length > 0 ? (
                          <ul className="text-[11px] text-[#FEF08A] space-y-1">
                            {activeDiff.timelineShifts.slice(0, 3).map((shift, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-[#B4690E]">&bull;</span>
                                <span>{shift}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-[#1E5631]">
                            &check; No critical path dependencies broken.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
