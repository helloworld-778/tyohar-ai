import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  LayoutDashboard,
  Sliders,
  IndianRupee,
  Utensils,
  Clock,
  Key,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import type { EventPlan } from './types/tyohar';
import {
  PRESET_WEDDING,
  PRESET_COMMUNITY,
  PRESET_BIRTHDAY,
  ALL_PRESETS,
} from './data/presets';
import { LandingHero } from './components/LandingHero';
import { ChaosMutatorBar } from './components/ChaosMutatorBar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { IntakeWizard } from './components/IntakeWizard';
import { BudgetDashboard } from './components/BudgetDashboard';
import { VendorOptimizer } from './components/VendorOptimizer';
import { DependencyTimeline } from './components/DependencyTimeline';
import { SlideOverDrawer, EventBackdrop, JourneyBar } from './components/ui/Primitives';
import { BrandLogo } from './components/ui/BrandLogo';
import {
  setBYOKApiKey,
  getBYOKApiKey,
  clearBYOKApiKey,
} from './services/aiClient';

type Subpage = 'overview' | 'intake' | 'budget' | 'vendor' | 'timeline';

const STORAGE_KEY = 'tyohar_active_plan_draft';

export default function App() {
  // ── High-Level Navigation State ────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'landing' | 'studio'>('landing');
  const [activeSubpage, setActiveSubpage] = useState<Subpage>('overview');

  // Load draft from localStorage with deterministic fallback to PRESET_WEDDING
  const [currentPlan, setCurrentPlan] = useState<EventPlan>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            parsed.name &&
            typeof parsed.totalBudgetINR === 'number' &&
            Array.isArray(parsed.budgetCategories)
          ) {
            return parsed;
          }
        }
      }
    } catch {
      // Storage disabled or quota exceeded
    }
    return PRESET_WEDDING;
  });

  const [planHistory, setPlanHistory] = useState<EventPlan[]>([]);
  const [isAutosaved, setIsAutosaved] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Autosave to localStorage on every change to currentPlan
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPlan));
        setIsAutosaved(true);
      }
    } catch {
      // Silently catch quota or disabled storage
    }
  }, [currentPlan]);

  // Discrete mutation with undo history support
  const updatePlanWithHistory = (newPlan: EventPlan) => {
    setPlanHistory((prev) => [currentPlan, ...prev.slice(0, 9)]);
    setCurrentPlan(newPlan);
  };

  // Undo handler
  const handleUndo = () => {
    if (planHistory.length === 0) return;
    const [previous, ...rest] = planHistory;
    setPlanHistory(rest);
    setCurrentPlan(previous);
    showToast('Reverted to previous plan state');
  };

  // Preset switcher with undo preservation
  const handleSelectPreset = (preset: EventPlan) => {
    setPlanHistory((prev) => [currentPlan, ...prev.slice(0, 9)]);
    setCurrentPlan(JSON.parse(JSON.stringify(preset)));
    showToast(`Switched to ${preset.name}`);
  };

  // Reset to default preset
  const handleResetToPresetDefault = () => {
    const basePreset = ALL_PRESETS.find((p) => p.eventType === currentPlan.eventType) || PRESET_WEDDING;
    setPlanHistory((prev) => [currentPlan, ...prev.slice(0, 9)]);
    setCurrentPlan(JSON.parse(JSON.stringify(basePreset)));
    showToast(`Reset ${basePreset.name} to fresh preset defaults`);
  };

  // ── BYOK Key Modal State ───────────────────────────────────────────────────
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getBYOKApiKey() || '');
  const [hasApiKey, setHasApiKey] = useState(Boolean(getBYOKApiKey()));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // ── Subpage Navigation Configuration ───────────────────────────────────────
  const navItems = [
    {
      id: 'overview' as Subpage,
      label: 'Overview & Blueprint',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: 'Executive',
    },
    {
      id: 'intake' as Subpage,
      label: 'Intake & Vibe Matrix',
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: 'budget' as Subpage,
      label: 'Budget & Trade-Offs',
      icon: <IndianRupee className="w-4 h-4" />,
      badge: currentPlan.budgetCategories.reduce((s, c) => s + c.estimatedCost, 0) > currentPlan.totalBudgetINR ? 'Deficit' : undefined,
    },
    {
      id: 'vendor' as Subpage,
      label: 'Vendor, Plates & RFQ',
      icon: <Utensils className="w-4 h-4" />,
    },
    {
      id: 'timeline' as Subpage,
      label: 'Critical Path Timeline',
      icon: <Clock className="w-4 h-4" />,
      badge: currentPlan.timeline.filter((t) => t.status === 'delayed').length > 0
        ? `${currentPlan.timeline.filter((t) => t.status === 'delayed').length} Alert`
        : undefined,
    },
  ];

  const totalEstimated = currentPlan.budgetCategories.reduce((sum, c) => sum + c.estimatedCost, 0);
  const overage = Math.max(0, totalEstimated - currentPlan.totalBudgetINR);
  const delayedTasks = currentPlan.timeline.filter((t) => t.status === 'delayed').length;

  return (
    <div
      data-vibe={currentPlan.eventType}
      className="min-h-screen bg-[#FAF7F2] text-[#161412] flex flex-col font-sans selection:bg-[#B4690E] selection:text-white"
    >
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
            {/* Mobile Sidebar Backdrop */}
            {isMobileSidebarOpen && (
              <div
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-[#161412]/50 backdrop-blur-xs lg:hidden"
                aria-hidden="true"
              />
            )}

            {/* ── Collapsible Left Sidebar (Sandstone Architectural Well) ──────── */}
            <aside
              className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col justify-between border-r border-[#E4DEC8] bg-[#F3EFE6] p-4 transition-transform duration-200 lg:static lg:translate-x-0 ${
                isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
              }`}
            >
              {/* Top Section */}
              <div className="space-y-5">
                {/* Logo & Back to Landing */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E4DEC8]">
                  <BrandLogo size="sm" subtitle="Planner Studio" />

                  <button
                    type="button"
                    onClick={() => setViewMode('landing')}
                    title="Return to Landing Page"
                    className="flex items-center gap-1 text-[11px] font-bold text-[#686259] hover:text-[#161412] rounded-md p-1 hover:bg-[#FFFFFF] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Home</span>
                  </button>
                </div>

                {/* Active Event Switcher Card */}
                <div className="rounded-md border border-[#E4DEC8] bg-[#FFFFFF] p-3 text-xs space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#686259]">
                      Active Event
                    </span>
                    <span className="px-2 py-0.5 rounded-sm bg-[#F3EFE6] text-[#B4690E] text-[11px] font-bold uppercase tracking-wider border border-[#E4DEC8]">
                      {currentPlan.eventType}
                    </span>
                  </div>

                  <h3 className="font-serif-heading font-bold text-[#161412] text-sm truncate">
                    {currentPlan.name}
                  </h3>

                  {/* Preset Quick Dropdown */}
                  <select
                    value={currentPlan.name}
                    onChange={(e) => {
                      const found = ALL_PRESETS.find((p) => p.name === e.target.value);
                      if (found) handleSelectPreset(found);
                    }}
                    className="w-full px-2 py-1.5 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-md text-[#161412] focus:border-[#B4690E] focus:outline-hidden"
                  >
                    <option value={PRESET_WEDDING.name}>Royal Vivah (₹8L)</option>
                    <option value={PRESET_COMMUNITY.name}>Campus Utsav (₹50k)</option>
                    <option value={PRESET_BIRTHDAY.name}>Family Jubilee (₹25k)</option>
                  </select>

                  {/* Quick 1-Click Vibe Switcher */}
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(PRESET_WEDDING)}
                      className={`py-1 text-[11px] font-bold rounded-sm border transition-colors ${
                        currentPlan.eventType === 'wedding'
                          ? 'bg-[#C23B22] text-white border-[#C23B22]'
                          : 'bg-[#FAF7F2] text-[#686259] border-[#E4DEC8] hover:text-[#161412]'
                      }`}
                    >
                      Vivah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(PRESET_BIRTHDAY)}
                      className={`py-1 text-[11px] font-bold rounded-sm border transition-colors ${
                        currentPlan.eventType === 'birthday'
                          ? 'bg-[#B4690E] text-white border-[#B4690E]'
                          : 'bg-[#FAF7F2] text-[#686259] border-[#E4DEC8] hover:text-[#161412]'
                      }`}
                    >
                      Jubilee
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(PRESET_COMMUNITY)}
                      className={`py-1 text-[11px] font-bold rounded-sm border transition-colors ${
                        currentPlan.eventType === 'community'
                          ? 'bg-[#1E5631] text-white border-[#1E5631]'
                          : 'bg-[#FAF7F2] text-[#686259] border-[#E4DEC8] hover:text-[#161412]'
                      }`}
                    >
                      Utsav
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E4DEC8]">
                    <button
                      type="button"
                      onClick={handleResetToPresetDefault}
                      className="text-[11px] text-[#686259] hover:text-[#B4690E] flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Preset Default</span>
                    </button>
                  </div>
                </div>

                {/* 5 Dedicated Subpage Navigation Links */}
                <nav aria-label="Studio Subpage Navigation" className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = activeSubpage === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveSubpage(item.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`relative flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                          isActive
                            ? 'text-[#FAF7F2]'
                            : 'text-[#686259] hover:text-[#161412] hover:bg-[#FFFFFF]'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-sidebar-pill"
                            className="absolute inset-0 rounded-md bg-[#161412] shadow-xs"
                            transition={{ type: 'spring', bounce: 0.15, duration: 0.28 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2.5">
                          <span className={isActive ? 'text-[#B4690E]' : 'text-[#686259]'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </span>
                        {item.badge && (
                          <span
                            className={`relative z-10 rounded-sm px-2 py-0.5 text-[10px] font-bold ${
                              item.badge.includes('Deficit') || item.badge.includes('Alert')
                                ? 'bg-[#C23B22]/15 text-[#C23B22] border border-[#C23B22]/30'
                                : isActive
                                ? 'bg-[#B4690E] text-white'
                                : 'bg-[#E4DEC8] text-[#161412]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Sidebar Footer */}
              <div className="space-y-3 pt-4 border-t border-[#E4DEC8]">
                {/* AI Connection Status Pill */}
                <div className="flex items-center justify-between rounded-md bg-[#FFFFFF] px-3 py-2 text-[11px] border border-[#E4DEC8] shadow-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        hasApiKey ? 'bg-[#1E5631] animate-pulse' : 'bg-[#B4690E]'
                      }`}
                    />
                    <span className="font-medium text-[#161412]">
                      {hasApiKey ? 'BYOK Connected' : 'Deterministic Ready'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(true)}
                    className="text-[11px] font-bold text-[#B4690E] hover:underline"
                  >
                    Edit Key
                  </button>
                </div>

                {/* Utility Buttons */}
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={handleExportPlanJSON}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-[#E4DEC8] bg-[#FFFFFF] text-[#161412] hover:border-[#B4690E] transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintExecutionBrief}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-[#E4DEC8] bg-[#FFFFFF] text-[#161412] hover:border-[#B4690E] transition-colors shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* ── Main Canvas Area (Ivory Ledger) ─────────────────────────── */}
            <div className="relative flex flex-1 flex-col overflow-y-auto bg-[#FAF7F2]">
              {/* Event-Adaptive Animated Vector Backdrop */}
              <EventBackdrop eventType={currentPlan.eventType} />

              {/* Architectural Bahi-Khata Top Command Bar with ⌘K Trigger & Undo */}
              <ChaosMutatorBar
                currentPlan={currentPlan}
                onPlanMutated={(updatedPlan, _diff) => updatePlanWithHistory(updatedPlan)}
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
                      Budget: ₹{currentPlan.totalBudgetINR.toLocaleString('en-IN')} • {currentPlan.guestCount} Guests
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Execution Plan Generated on {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
                    </p>
                  </div>
                </div>

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

      {/* ── SlideOverDrawer for BYOK API Key Configuration ───────────────── */}
      <SlideOverDrawer
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        title="Gemini AI Key Configuration (BYOK)"
        description="Session-isolated client key storage with deterministic fallback"
        icon={<Key className="w-5 h-5" />}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-md border border-[#E4DEC8] bg-[#F3EFE6] p-4 space-y-2 text-[#161412]">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1E5631] shrink-0 mt-0.5" />
              <p>
                <strong>Zero Permanent Storage:</strong> Your key is stored strictly in your browser&apos;s <code className="text-[#B4690E] bg-white px-1 py-0.5 rounded border border-[#E4DEC8]">sessionStorage</code> and is discarded when this tab closes.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2B4C7E] shrink-0 mt-0.5" />
              <p>
                <strong>100% Offline Safety:</strong> If no key is entered or quota runs out, Tyohar AI automatically relies on its deterministic math and graph algorithms.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="gemini-key-input" className="block font-bold text-[#161412] mb-1.5">
              Google AI Studio API Key
            </label>
            <input
              id="gemini-key-input"
              type="password"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-md focus:border-[#B4690E] text-[#161412] font-mono focus:outline-hidden"
            />
            <p className="mt-1 flex items-center justify-between text-[11px] text-[#686259]">
              <span>Free keys from Google AI Studio</span>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B4690E] hover:underline flex items-center gap-1 font-semibold"
              >
                Get Free Key <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E4DEC8]">
            <button
              type="button"
              onClick={() => {
                setApiKeyInput('');
                clearBYOKApiKey();
                setHasApiKey(false);
                showToast('Custom key cleared');
                setShowKeyModal(false);
              }}
              className="font-bold text-[#C23B22] hover:text-[#9E2A15] transition-colors"
            >
              Remove Custom Key
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 rounded-md border border-[#E4DEC8] text-[#686259] hover:text-[#161412]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-md bg-[#161412] hover:bg-[#24201C] text-[#FAF7F2] font-bold text-xs shadow-xs transition-colors"
              >
                Save &amp; Activate
              </button>
            </div>
          </div>
        </div>
      </SlideOverDrawer>

      {/* Screen Reader Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {toastMessage}
      </div>
    </div>
  );
}
