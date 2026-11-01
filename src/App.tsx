/**
 * @file App.tsx
 * @description Root application shell orchestrating the Flagship Architectural Landing Page
 * and the Full-Screen Editorial Bahi-Khata Planner Studio with ErrorBoundary and Code-Splitting.
 */

import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingHero } from './components/LandingHero';
import { ChaosMutatorBar } from './components/ChaosMutatorBar';
import { EventBackdrop, JourneyBar } from './components/ui/Primitives';
import { BrandLogo } from './components/ui/BrandLogo';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { StudioSidebar, type Subpage } from './components/layout/StudioSidebar';
import { ApiKeyModal } from './components/layout/ApiKeyModal';
import { useEventPlan } from './hooks/useEventPlan';
import {
  setBYOKApiKey,
  getBYOKApiKey,
  clearBYOKApiKey,
} from './services/aiClient';
import { formatINR } from './utils/formatters';

// Lazy-loaded studio modules for optimal initial bundle performance
const OverviewDashboard = lazy(() =>
  import('./components/OverviewDashboard').then((m) => ({ default: m.OverviewDashboard })),
);
const IntakeWizard = lazy(() =>
  import('./components/IntakeWizard').then((m) => ({ default: m.IntakeWizard })),
);
const BudgetDashboard = lazy(() =>
  import('./components/BudgetDashboard').then((m) => ({ default: m.BudgetDashboard })),
);
const VendorOptimizer = lazy(() =>
  import('./components/VendorOptimizer').then((m) => ({ default: m.VendorOptimizer })),
);
const DependencyTimeline = lazy(() =>
  import('./components/DependencyTimeline').then((m) => ({ default: m.DependencyTimeline })),
);

function SubpageLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Loading celebration module"
      className="p-8 space-y-4 max-w-7xl mx-auto animate-pulse"
    >
      <div className="h-28 bg-[#F3EFE6] rounded-2xl border border-[#E4DEC8]" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-[#F3EFE6] rounded-xl border border-[#E4DEC8]" />
        ))}
      </div>
      <div className="h-64 bg-[#F3EFE6] rounded-2xl border border-[#E4DEC8]" />
      <span className="sr-only">Loading celebration studio module...</span>
    </div>
  );
}

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Plan State Managed via useEventPlan Hook ────────────────────────────────
  const {
    currentPlan,
    setCurrentPlan,
    planHistory,
    isAutosaved,
    updatePlanWithHistory,
    handleUndo,
    handleSelectPreset,
    handleResetToPresetDefault,
  } = useEventPlan({ onNotify: showToast });

  // ── High-Level Navigation State ────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'landing' | 'studio'>('landing');
  const [activeSubpage, setActiveSubpage] = useState<Subpage>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── BYOK Key Modal State ───────────────────────────────────────────────────
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getBYOKApiKey() || '');
  const [hasApiKey, setHasApiKey] = useState(Boolean(getBYOKApiKey()));

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      setBYOKApiKey(trimmed);
      setHasApiKey(true);
      showToast('Custom Gemini API key saved in session storage');
    } else {
      clearBYOKApiKey();
      setHasApiKey(false);
      showToast('Custom key cleared. Deterministic math active');
    }
    setShowKeyModal(false);
  };

  const handleClearApiKey = () => {
    setApiKeyInput('');
    clearBYOKApiKey();
    setHasApiKey(false);
    showToast('Custom key cleared');
    setShowKeyModal(false);
  };

  const handleExportPlanJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(currentPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `tyohar-plan-${currentPlan.eventType}-${Date.now()}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Plan JSON exported successfully');
  };

  const handlePrintExecutionBrief = () => {
    window.print();
  };

  const totalEstimated = currentPlan.budgetCategories.reduce((sum, c) => sum + c.estimatedCost, 0);
  const overage = Math.max(0, totalEstimated - currentPlan.totalBudgetINR);
  const delayedTasks = currentPlan.timeline.filter((t) => t.status === 'delayed').length;

  return (
    <ErrorBoundary>
      <div
        data-vibe={currentPlan.eventType}
        className="min-h-screen bg-[#FAF7F2] text-[#161412] flex flex-col font-sans selection:bg-[#B4690E] selection:text-white"
      >
        {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#161412] focus:text-[#FAF7F2] focus:rounded-md focus:shadow-lg focus:outline-hidden"
        >
          Skip to main content
        </a>

        {/* ── View 1: Flagship Architectural Landing Page ────────────────────── */}
        <AnimatePresence mode="wait">
          {viewMode === 'landing' ? (
            <motion.div
              key="landing-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <LandingHero
                onEnterStudio={() => setViewMode('studio')}
                onSelectPresetAndEnter={(preset) => {
                  handleSelectPreset(preset);
                  setViewMode('studio');
                }}
              />
            </motion.div>
          ) : (
            /* ── View 2: Full-Screen Editorial Bahi-Khata App Shell ───────────── */
            <motion.div
              key="studio-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-screen overflow-hidden bg-[#FAF7F2]"
            >
              {/* Modular Collapsible Sidebar */}
              <StudioSidebar
                currentPlan={currentPlan}
                activeSubpage={activeSubpage}
                setActiveSubpage={setActiveSubpage}
                isMobileSidebarOpen={isMobileSidebarOpen}
                setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                onNavigateLanding={() => setViewMode('landing')}
                onSelectPreset={handleSelectPreset}
                onResetToPresetDefault={handleResetToPresetDefault}
                onExportJSON={handleExportPlanJSON}
                onPrint={handlePrintExecutionBrief}
                hasApiKey={hasApiKey}
                onOpenKeyModal={() => setShowKeyModal(true)}
              />

              {/* ── Main Canvas Area (Ivory Ledger) ─────────────────────────── */}
              <div
                id="main-content"
                tabIndex={-1}
                className="relative flex flex-1 flex-col overflow-y-auto bg-[#FAF7F2] focus:outline-hidden"
              >
                {/* Event-Adaptive Animated Vector Backdrop */}
                <EventBackdrop eventType={currentPlan.eventType} />

                {/* Architectural Bahi-Khata Top Command Bar with ⌘K Trigger & Undo */}
                <ChaosMutatorBar
                  currentPlan={currentPlan}
                  onPlanMutated={(updatedPlan) => updatePlanWithHistory(updatedPlan)}
                  canUndo={planHistory.length > 0}
                  onUndo={handleUndo}
                  isAutosaved={isAutosaved}
                  onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  isMobileSidebarOpen={isMobileSidebarOpen}
                />

                {/* Active Subpage Container */}
                <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                  {/* 5-Stage Interactive Journey Bar */}
                  <JourneyBar
                    activeStage={activeSubpage}
                    onSelectStage={(stage) => setActiveSubpage(stage)}
                    badges={{
                      overview: '01',
                      intake: `${currentPlan.demographics.accessibilityNeeds.length} Rules`,
                      budget: overage > 0 ? 'Deficit' : 'Balanced',
                      vendor: `${currentPlan.smartPlate.guaranteedBasePlates} Plt`,
                      timeline: delayedTasks > 0 ? `${delayedTasks} Alert` : 'Ready',
                    }}
                  />

                  {/* ── Print-Only Official Brief Header ───────────────────────── */}
                  <div className="hidden print:flex items-center justify-between pb-6 border-b-2 border-[#161412] mb-8 text-black">
                    <BrandLogo size="lg" showText={true} subtitle="Official Execution Brief" />
                    <div className="text-right">
                      <h1 className="text-xl font-bold font-serif">{currentPlan.name}</h1>
                      <p className="text-xs text-slate-800 font-mono">
                        Budget: {formatINR(currentPlan.totalBudgetINR)} • {currentPlan.guestCount} Guests
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Execution Plan Generated on {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
                      </p>
                    </div>
                  </div>

                  {/* Lazy-Loaded Subpage Views with Accessible Fallback Skeleton */}
                  <Suspense fallback={<SubpageLoadingFallback />}>
                    <AnimatePresence mode="wait">
                      {activeSubpage === 'overview' && (
                        <motion.div
                          key="overview-subpage"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <OverviewDashboard
                            currentPlan={currentPlan}
                            onNavigateTab={(tab) => setActiveSubpage(tab)}
                            onUpdatePlan={(updated) => setCurrentPlan(updated)}
                          />
                        </motion.div>
                      )}

                      {activeSubpage === 'intake' && (
                        <motion.div
                          key="intake-subpage"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <IntakeWizard
                            currentPlan={currentPlan}
                            onUpdatePlan={(updated) => setCurrentPlan(updated)}
                            onNavigateTab={(tab) => setActiveSubpage(tab)}
                          />
                        </motion.div>
                      )}

                      {activeSubpage === 'budget' && (
                        <motion.div
                          key="budget-subpage"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <BudgetDashboard
                            currentPlan={currentPlan}
                            onUpdatePlan={(updated) => setCurrentPlan(updated)}
                            onNavigateTab={(tab) => setActiveSubpage(tab)}
                          />
                        </motion.div>
                      )}

                      {activeSubpage === 'vendor' && (
                        <motion.div
                          key="vendor-subpage"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <VendorOptimizer
                            currentPlan={currentPlan}
                            onUpdatePlan={(updated) => setCurrentPlan(updated)}
                            onNavigateTab={(tab) => setActiveSubpage(tab)}
                          />
                        </motion.div>
                      )}

                      {activeSubpage === 'timeline' && (
                        <motion.div
                          key="timeline-subpage"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <DependencyTimeline
                            currentPlan={currentPlan}
                            onUpdatePlan={(updated) => setCurrentPlan(updated)}
                            onNavigateTab={(tab) => setActiveSubpage(tab)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Suspense>
                </main>

                {/* Studio Canvas Footer */}
                <footer className="border-t border-[#E4DEC8] bg-[#F3EFE6] py-5 text-center text-xs text-[#686259]">
                  <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#161412]">Tyohar AI</span>
                      <span>&bull;</span>
                      <span>The Editorial Bahi-Khata Architecture</span>
                    </div>
                    <div className="text-[11px] text-[#686259]">
                      All prices are <strong>Estimated Market Benchmarks (Unconfirmed)</strong> until locked with vendor contracts.
                    </div>
                  </div>
                </footer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modular BYOK API Key Drawer */}
        <ApiKeyModal
          isOpen={showKeyModal}
          onClose={() => setShowKeyModal(false)}
          apiKeyInput={apiKeyInput}
          setApiKeyInput={setApiKeyInput}
          onSave={handleSaveApiKey}
          onClear={handleClearApiKey}
        />

        {/* Screen Reader Live Region */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {toastMessage}
        </div>
      </div>
    </ErrorBoundary>
  );
}
