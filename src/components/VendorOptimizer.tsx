import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  FileSearch,
  MessageCircle,
  Copy,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckSquare,
  FileText,
  Zap,
  VolumeX,
  HeartHandshake,
  CalendarCheck,
} from 'lucide-react';
import type {
  EventPlan,
  VendorPackageOption,
  OptimizationMode,
  VendorQuoteItem,
} from '../types/tyohar';
import { calculateSmartPlateBuffer } from '../utils/budgetEngine';
import { callTyoharAI } from '../services/aiClient';
import {
  GuidedPageHero,
  AnimatedTabs,
  AnimatedCurrency,
  AnimatedNumber,
  StaggerContainer,
  StaggerItem,
  StageNavButtons,
} from './ui/Primitives';

interface VendorOptimizerProps {
  currentPlan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onNavigateTab?: (tab: 'overview' | 'intake' | 'budget' | 'timeline') => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

export const VendorOptimizer: React.FC<VendorOptimizerProps> = ({
  currentPlan,
  onUpdatePlan,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'auditor' | 'whatsapp' | 'checklist'>('packages');

  // ── Panel A State: Synthesizer & Smart Plate ──────────────────────────────
  const [selectedPackageMode, setSelectedPackageMode] = useState<OptimizationMode | 'all'>('all');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPeakAuspicious, setIsPeakAuspicious] = useState(false);
  const [perPlateBenchmark, setPerPlateBenchmark] = useState<number>(() => {
    if (currentPlan.eventType === 'wedding') return 1400;
    if (currentPlan.eventType === 'community') return 60;
    return 200;
  });
  const [isSurplusOpen, setIsSurplusOpen] = useState(true);
  const [turnoutOverride, setTurnoutOverride] = useState<number | null>(null);

  const baseSmartPlate = calculateSmartPlateBuffer(
    currentPlan.guestCount,
    currentPlan.eventType,
    isPeakAuspicious,
    perPlateBenchmark,
  );

  const activeTurnoutPercent = turnoutOverride ?? baseSmartPlate.expectedTurnoutPercent;
  const guaranteedBasePlates = Math.ceil((currentPlan.guestCount * activeTurnoutPercent) / 100);
  const bufferRatio = currentPlan.eventType === 'wedding' ? 0.10 : currentPlan.eventType === 'birthday' ? 0.065 : 0.125;
  const bufferPlates = Math.ceil(guaranteedBasePlates * bufferRatio);
  const platesNotOrdered = Math.max(0, currentPlan.guestCount - guaranteedBasePlates - bufferPlates);
  const estimatedSavingsINR = platesNotOrdered * perPlateBenchmark;

  const smartPlate = {
    ...baseSmartPlate,
    expectedTurnoutPercent: activeTurnoutPercent,
    guaranteedBasePlates,
    bufferPlates,
    estimatedSavingsINR,
  };

  // ── Panel B State: Quote Auditor ──────────────────────────────────────────
  const [rawQuoteInput, setRawQuoteInput] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditFeedback, setAuditFeedback] = useState<string | null>(null);
  const [expandedQuoteInclusions, setExpandedQuoteInclusions] = useState<Record<string, boolean>>({});

  const toggleInclusions = (id: string) => {
    setExpandedQuoteInclusions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [vendorQuotes, setVendorQuotes] = useState<VendorQuoteItem[]>([
    {
      id: 'quote-1',
      vendorName: 'Royal Rasoi Banquets & Caterers',
      category: 'Food & Catering',
      quotedTotalINR: currentPlan.eventType === 'wedding' ? 320000 : 35000,
      guestsCovered: currentPlan.guestCount,
      inclusions: [
        'Welcome mocktail bar (3 varieties)',
        '3 Live Counters (Chaat, Pasta, Tandoor)',
        'Multi-cuisine buffet with 12 dishes',
        'Traditional brassware & chafing dishes',
        '20 uniformed service staff',
      ],
      hiddenChargesFlagged: [
        '18% GST not included in quote (adds ₹57,600 extra)',
        'Waiter overtime ₹1,500/hr charged after 11:00 PM',
        'Transport & loading fee of ₹8,000 extra outside city limits',
        'Crockery breakage deposit of ₹15,000 refundable after 7 days',
      ],
      missingClarifications: [
        'Is kitchen deep-cleaning & garbage disposal included?',
        'What is the rate per plate for last-minute walk-in guests exceeding guarantee?',
        'Is there a separate dedicated Jain / Satvik preparation counter?',
      ],
      valueScore: 78,
    },
    {
      id: 'quote-2',
      vendorName: 'Annapurna Satvik Hospitality',
      category: 'Food & Catering',
      quotedTotalINR: currentPlan.eventType === 'wedding' ? 275000 : 28000,
      guestsCovered: currentPlan.guestCount,
      inclusions: [
        'Pure vegetarian & Satvik options clearly labelled',
        '2 Live Counters (Chaat & Dosa)',
        'Stainless steel thali service & buffet',
        '14 service staff + 2 supervisory captains',
        'Zero-waste composting handover packaging',
      ],
      hiddenChargesFlagged: [
        'Generator diesel backup extra at ₹3,500 if power trips',
        'Live stall gas cylinder rental ₹1,200 per burner',
      ],
      missingClarifications: [
        'Do they provide extra takeaway containers for surplus food redistribution?',
        'Does the price include paper napkins and bottled water dispensers?',
      ],
      valueScore: 89,
    },
  ]);

  // ── Panel C State: WhatsApp RFQ ───────────────────────────────────────────
  const [whatsappLanguage, setWhatsappLanguage] = useState<'english' | 'hinglish'>('hinglish');
  const [selectedRfqCategory, setSelectedRfqCategory] = useState<string>('Food & Catering');
  const [copiedToast, setCopiedToast] = useState(false);

  // ── Panel D State: Interactive Execution Checklist ────────────────────────
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    {
      id: 'chk-1',
      title: 'Advance Token & Official GST Receipt Archived',
      description: 'Ensure token advance does not exceed 25% of total quote prior to final menu tasting.',
      category: 'Contract & Payments',
      icon: FileText,
      completed: true,
    },
    {
      id: 'chk-2',
      title: 'Dedicated Generator Diesel Backup & Fuel Policy Locked',
      description: 'Verify written contract states fuel cost is vendor liability during power cuts.',
      category: 'Operations',
      icon: Zap,
      completed: true,
    },
    {
      id: 'chk-3',
      title: 'Police NOC & Late-Night Sound Clearance Verified',
      description: 'Confirm 10:00 PM decibel zoning permit is active with local municipal authority.',
      category: 'Compliance',
      icon: VolumeX,
      completed: false,
    },
    {
      id: 'chk-4',
      title: 'Zero-Waste NGO Food Redistribution Contact Confirmed',
      description: 'Pre-schedule pickup with Robin Hood Army / Feeding India for surplus buffer trays.',
      category: 'Surplus Protocol',
      icon: HeartHandshake,
      completed: true,
    },
    {
      id: 'chk-5',
      title: 'Final Headcount Plate Lock-in Date Signed',
      description: 'Agree on deadline (48 hours prior) for final plate count adjustment without penalties.',
      category: 'Catering Lock',
      icon: CalendarCheck,
      completed: false,
    },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    );
  };

  const completedChecklistCount = checklistItems.filter((item) => item.completed).length;

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleRegeneratePackages = async () => {
    setIsSynthesizing(true);
    try {
      const response = await callTyoharAI('OPTIMIZE_VENDOR_MENU', {
        guestCount: currentPlan.guestCount,
        foodType: 'Vegetarian',
        budgetINR: currentPlan.totalBudgetINR * 0.4,
        description: `Event type: ${currentPlan.eventType}. Prioritize multi-generational dietary separation.`,
      });

      if (response.success && response.result) {
        const res = response.result as { vendorPackages?: VendorPackageOption[] };
        if (res.vendorPackages && res.vendorPackages.length > 0) {
          onUpdatePlan({ ...currentPlan, vendorPackages: res.vendorPackages });
        }
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleAuditNewQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawQuoteInput.trim()) return;
    setIsAuditing(true);
    setAuditFeedback(null);

    try {
      const response = await callTyoharAI('AUDIT_VENDOR_QUOTES', {
        rawQuoteText: rawQuoteInput,
        category: 'Food & Catering',
        guestCount: currentPlan.guestCount,
      });

      if (response.success && response.result) {
        const item = response.result as unknown as VendorQuoteItem;
        const newQuote: VendorQuoteItem = {
          ...item,
          id: `quote-${Date.now()}`,
          vendorName: item.vendorName || 'Audited Vendor Quote',
        };
        setVendorQuotes([newQuote, ...vendorQuotes]);
        setRawQuoteInput('');
        setAuditFeedback(
          response.isFallback
            ? 'Quote audited with deterministic compliance checks.'
            : 'Quote audited successfully with Gemini AI.',
        );
      }
    } catch {
      setAuditFeedback('Failed to audit quote. Please verify the input format.');
    } finally {
      setIsAuditing(false);
    }
  };

  const filteredPackages =
    selectedPackageMode === 'all'
      ? currentPlan.vendorPackages
      : currentPlan.vendorPackages.filter((p) => p.mode === selectedPackageMode);

  // Generate WhatsApp RFQ Text
  const generateWhatsAppMessage = () => {
    if (whatsappLanguage === 'hinglish') {
      return `Namaste! 🙏\n\nHum ${currentPlan.name} organize kar rahe hain for ${currentPlan.guestCount} invited guests.\n\nSmart catering calculations ke hisaab se hamara base requirement hai:\n• Guaranteed Base: ${smartPlate.guaranteedBasePlates} plates\n• Negotiated Buffer: ${smartPlate.bufferPlates} plates (on-demand prep, billed only if consumed)\n\nHum aapse ${selectedRfqCategory} ke liye competitive all-inclusive quote chahte hain.\n\nPlease clarify in writing:\n1. Kya aapke quoted price mein 18% GST included hai?\n2. Raat ko 11 PM ke baad service staff ke overtime charges kya hain?\n3. Generator diesel backup and transport fees included hai ya extra?\n\nKripya apna detailed menu break-up aur per-plate rate share karein. Dhanyawaad!`;
    }

    return `Hello,\n\nWe are currently planning "${currentPlan.name}" for ${currentPlan.guestCount} invited guests.\n\nBased on our Smart Plate headcount model, our requirement is:\n• Guaranteed Base Commitment: ${smartPlate.guaranteedBasePlates} plates\n• On-Demand Buffer: ${smartPlate.bufferPlates} plates (prepared on standby, billed only if consumed)\n\nWe would like to request an all-inclusive formal quotation for ${selectedRfqCategory}.\n\nPlease specifically clarify:\n1. Is 18% GST fully included in the quoted rate?\n2. What are the overtime rates for service staff post-11:00 PM?\n3. Are transportation, generator diesel, and crockery breakage deposits bundled?\n\nPlease share your detailed package brochure and menu highlights. Thank you!`;
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <StaggerContainer className="space-y-6 p-2 lg:p-4 max-w-7xl mx-auto">
      {/* ── Guided Subpage Hero ────────────────────────────────────────── */}
      <StaggerItem>
        <GuidedPageHero
          stepPill="STEP 04 OF 05 • VENDOR & SMART PLATE OPTIMIZER"
          title="Vendors, Smart Plates &amp; RFQ Studio"
          description="Protect your celebration from the twin perils of Indian events: the 15-20% catering over-ordering trap and hidden vendor fee surprises (GST, overtime, diesel surcharges)."
          tipsTitle="Smart Plate & Quote Rules"
          tips={[
            'The Smart Plate formula contracts guaranteed plates at expected turnout (85-92%) and negotiates buffer plates on standby, billed only if consumed.',
            'Surplus protocol triggers automatically whenever the buffer exceeds 15 plates to divert food to community food banks.',
            'Our WhatsApp RFQ intentionally conceals your maximum budget ceiling so vendors cannot inflate rates.',
          ]}
          nextStepLabel="Lock Critical Path Timeline →"
          onNextStep={() => onNavigateTab?.('timeline')}
        />
      </StaggerItem>

      {/* ── Studio Sub-Navigation Tabs ─────────────────────────────────── */}
      <StaggerItem>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <AnimatedTabs
            tabs={[
              {
                id: 'packages',
                label: '1. Smart Plate & AI Packages',
                icon: <Utensils className="w-4 h-4 text-[#B4690E]" />,
              },
              {
                id: 'auditor',
                label: '2. Quote Auditor & Hidden Fees',
                icon: <FileSearch className="w-4 h-4 text-[#2B4C7E]" />,
                badge: vendorQuotes.length,
              },
              {
                id: 'whatsapp',
                label: '3. WhatsApp RFQ Negotiator',
                icon: <MessageCircle className="w-4 h-4 text-[#1E5631]" />,
              },
              {
                id: 'checklist',
                label: '4. Execution Checklist',
                icon: <CheckSquare className="w-4 h-4 text-[#B4690E]" />,
                badge: `${completedChecklistCount}/${checklistItems.length}`,
              },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'packages' | 'auditor' | 'whatsapp' | 'checklist')}
          />

          {activeTab === 'packages' && (
            <button
              type="button"
              onClick={handleRegeneratePackages}
              disabled={isSynthesizing}
              className="flex items-center gap-2 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] px-4 py-2 text-xs font-bold text-[#161412] shadow-xs hover:bg-[#F3EFE6] disabled:opacity-50 transition-all shrink-0"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B4690E]" />
                  <span>Synthesizing Menus...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#B4690E]" />
                  <span>Re-Synthesize 3 Tier Packages</span>
                </>
              )}
            </button>
          )}
        </div>
      </StaggerItem>

      {/* ── TAB 1: Smart Plate & Packages ──────────────────────────────── */}
      {activeTab === 'packages' && (
        <StaggerItem>
          <div className="space-y-6">
            {/* Shagun & Surplus Smart Plate Card */}
            <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 lg:p-8 shadow-xs">
              <div className="border-b border-[#E4DEC8]/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#B4690E]" />
                    <span>Shagun &amp; Surplus Smart Plate Calculator</span>
                  </h3>
                  <p className="text-xs text-[#686259] mt-0.5">
                    Prevents social embarrassment while halting 15-20% routine catering food waste.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5631] bg-[#EEF7F0] border border-[#1E5631]/30 px-3 py-1 rounded-full">
                    Saves ~₹{smartPlate.estimatedSavingsINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
                {/* Left Side (5 cols): Interactive Controls */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#161412] mb-1.5">
                      Invited Guest Count
                    </label>
                    <input
                      type="number"
                      min="10"
                      value={currentPlan.guestCount}
                      onChange={(e) =>
                        onUpdatePlan({
                          ...currentPlan,
                          guestCount: Math.max(10, parseInt(e.target.value, 10) || 10),
                        })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] font-mono-numeric focus:border-[#B4690E] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#161412] mb-1.5">
                      Per-Plate Benchmark Rate (INR)
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="50"
                      value={perPlateBenchmark}
                      onChange={(e) =>
                        setPerPlateBenchmark(Math.max(10, parseInt(e.target.value, 10) || 10))
                      }
                      className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] font-mono-numeric focus:border-[#B4690E] focus:outline-hidden"
                    />
                  </div>

                  {/* Auspicious Weekend Bump */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
                    <input
                      type="checkbox"
                      checked={isPeakAuspicious}
                      onChange={(e) => setIsPeakAuspicious(e.target.checked)}
                      className="mt-0.5 accent-[#B4690E] h-4 w-4 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#161412] block">
                        Peak Auspicious Weekend (Saya / Shubh Mahurat)
                      </span>
                      <span className="text-[11px] text-[#686259] leading-tight block mt-0.5">
                        Adds +3% turnout bump to account for higher RSVP adherence on auspicious dates.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Right Side (7 cols): Segmented Gauge & Stats */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#161412]">
                        Catering Plate Split ({smartPlate.expectedTurnoutPercent}% Turnout Model)
                      </span>
                      <span className="font-mono text-[#1E5631] font-bold">
                        Guaranteed + Buffer = Total Capacity
                      </span>
                    </div>

                    {/* Interactive Expected Turnout Override Slider */}
                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E4DEC8] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#161412]">
                          Turnout Calibration Override:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#B4690E] text-xs">
                            {activeTurnoutPercent}% Turnout
                          </span>
                          {turnoutOverride !== null && (
                            <button
                              type="button"
                              onClick={() => setTurnoutOverride(null)}
                              className="text-[10px] text-[#686259] hover:text-[#B4690E] underline"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="range"
                        min={65}
                        max={100}
                        value={activeTurnoutPercent}
                        onChange={(e) => setTurnoutOverride(Number(e.target.value))}
                        className="w-full accent-[#B4690E] cursor-pointer h-1.5 bg-[#E4DEC8] rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-[#8C8275] font-mono">
                        <span>65% (Conservative)</span>
                        <span>85% (Indian Standard)</span>
                        <span>100% (Naive 100%)</span>
                      </div>
                    </div>

                    {/* Segmented Gauge */}
                    <div className="h-6 w-full rounded-xl bg-[#F3EFE6] p-1 overflow-hidden flex gap-1 border border-[#E4DEC8]">
                      <div
                        className="h-full bg-[#1E5631] rounded-lg flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
                        style={{
                          width: `${(smartPlate.guaranteedBasePlates / currentPlan.guestCount) * 100}%`,
                        }}
                      >
                        {smartPlate.guaranteedBasePlates} Guaranteed
                      </div>
                      <div
                        className="h-full bg-[#B4690E] rounded-lg flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
                        style={{
                          width: `${(smartPlate.bufferPlates / currentPlan.guestCount) * 100}%`,
                        }}
                      >
                        +{smartPlate.bufferPlates} Buffer
                      </div>
                    </div>

                    {/* Gauge Stats Legend */}
                    <div className="grid grid-cols-3 gap-3 text-center pt-2">
                      <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#1E5631]/30">
                        <span className="text-[11px] text-[#1E5631] font-bold block uppercase">
                          Guaranteed Base
                        </span>
                        <span className="font-mono-numeric text-base font-extrabold text-[#161412]">
                          <AnimatedNumber value={smartPlate.guaranteedBasePlates} />
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#B4690E]/30">
                        <span className="text-[11px] text-[#B4690E] font-bold block uppercase">
                          Negotiated Buffer
                        </span>
                        <span className="font-mono-numeric text-base font-extrabold text-[#161412]">
                          +<AnimatedNumber value={smartPlate.bufferPlates} />
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E4DEC8]">
                        <span className="text-[11px] text-[#686259] font-bold block uppercase">
                          Estimated Savings
                        </span>
                        <span className="font-mono-numeric text-base font-extrabold text-[#1E5631]">
                          <AnimatedCurrency amount={smartPlate.estimatedSavingsINR} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Zero-Waste Surplus Protocol */}
                  <div className="rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsSurplusOpen(!isSurplusOpen)}
                      className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-[#161412] hover:bg-[#F3EFE6] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#1E5631]" />
                        <span>3-Step Zero-Waste Surplus Protocol (Buffer &gt; 15 Plates)</span>
                      </span>
                      {isSurplusOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#686259]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#686259]" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isSurplusOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4 space-y-2 text-xs text-[#686259] border-t border-[#E4DEC8]/60 pt-3"
                        >
                          {smartPlate.surplusRedistributionPlan.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="font-mono font-bold text-[#B4690E] text-xs">
                                0{idx + 1}.
                              </span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Package Tiers Comparison Cards */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E4DEC8]/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#161412]">
                  AI-Synthesized Menu Packages ({currentPlan.vendorPackages.length} Tiers)
                </h3>

                {/* Filter Mode Pills */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[#686259] text-[11px]">Filter:</span>
                  {(['all', 'minimize_cost', 'balanced', 'maximize_variety'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedPackageMode(m)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all ${
                        selectedPackageMode === m
                          ? 'bg-[#B4690E] text-white border-[#B4690E]'
                          : 'bg-[#FAF7F2] border-[#E4DEC8] text-[#686259] hover:text-[#161412]'
                      }`}
                    >
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPackages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between hover:border-[#B4690E]/60 transition-all space-y-5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-[#FEF8ED] border border-[#B4690E]/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#B4690E]">
                          {pkg.mode.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-[#8C8275] font-mono">Tier 0{idx + 1}</span>
                      </div>

                      <h4 className="mt-3 text-base font-bold text-[#161412]">{pkg.title}</h4>

                      {/* Rates */}
                      <div className="mt-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#E4DEC8]">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] text-[#686259]">Rate / Person</span>
                          <span className="font-mono-numeric text-base font-bold text-[#161412]">
                            ₹{pkg.estimatedPerPersonINR.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-[#E4DEC8]/60">
                          <span className="text-[11px] text-[#8C8275]">Estimated Total</span>
                          <span className="font-mono-numeric text-xs font-bold text-[#686259]">
                            ₹{pkg.totalEstimatedINR.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Menu Highlights */}
                      <div className="mt-4 space-y-1.5">
                        <span className="text-[11px] font-bold text-[#161412] block">
                          Menu Highlights:
                        </span>
                        <ul className="text-xs text-[#686259] space-y-1">
                          {pkg.menuHighlights.map((m, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#B4690E]">•</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Trade-Offs / Advantages */}
                      <div className="mt-4 pt-3 border-t border-[#E4DEC8]/60 space-y-1 text-xs">
                        <div className="text-[#1E5631] text-[11px]">
                          <strong>Pro:</strong> {pkg.pros[0]}
                        </div>
                        <div className="text-[#686259] text-[11px]">
                          <strong>Trade-off:</strong> {pkg.tradeOffs[0]}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E4DEC8]/60 flex items-center justify-between text-[11px] text-[#8C8275]">
                      <span>Estimated Market Benchmark (Unconfirmed)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </StaggerItem>
      )}

      {/* ── TAB 2: Quote Auditor & Hidden Fees ─────────────────────────── */}
      {activeTab === 'auditor' && (
        <StaggerItem>
          <div className="space-y-6">
            {/* Raw Quote Paste Card */}
            <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
              <div className="border-b border-[#E4DEC8]/60 pb-3">
                <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-[#2B4C7E]" />
                  <span>Paste Raw WhatsApp / PDF / Email Quote for Contract Audit</span>
                </h3>
                <p className="text-xs text-[#686259] mt-0.5">
                  Gemini analyzes unstructured text to detect excluded 18% GST, overtime clauses, generator diesel charges, and missing cleanup commitments.
                </p>
              </div>

              <form onSubmit={handleAuditNewQuote} className="space-y-3">
                <textarea
                  rows={4}
                  value={rawQuoteInput}
                  onChange={(e) => setRawQuoteInput(e.target.value)}
                  placeholder="Paste vendor message here, e.g.: 'Namaste sir, 250 plates package @ 1200/- includes 4 live counters, welcome drinks. Service staff included. GST extra. Transport extra outside ring road...'"
                  className="w-full p-3.5 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] placeholder:text-[#8C8275] focus:border-[#B4690E] focus:outline-hidden"
                />

                <div className="flex items-center justify-between">
                  {auditFeedback && (
                    <span className="text-xs text-[#B4690E] font-medium">
                      {auditFeedback}
                    </span>
                  )}
                  <div className="ml-auto flex gap-2">
                    <button
                      type="submit"
                      disabled={isAuditing || !rawQuoteInput.trim()}
                      className="flex items-center gap-2 rounded-xl bg-[#161412] hover:bg-[#2C2724] px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition-colors"
                    >
                      {isAuditing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B4690E]" />
                          <span>Auditing Contract Clauses...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#B4690E]" />
                          <span>Audit &amp; Score Quote</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Audited Quotes Comparison Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4DEC8]/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#161412]">
                  Audited Vendor Quotes ({vendorQuotes.length} Contracts Evaluated)
                </h3>
                <span className="text-xs text-[#686259]">
                  Scores calculated on transparency and hidden-fee exposure
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {vendorQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-5"
                  >
                    {/* Header with Value Score Gauge */}
                    <div className="flex items-start justify-between gap-3 border-b border-[#E4DEC8]/60 pb-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#B4690E] bg-[#FEF8ED] border border-[#B4690E]/30 px-2 py-0.5 rounded-md">
                          {quote.category}
                        </span>
                        <h4 className="mt-2 text-base font-bold text-[#161412]">{quote.vendorName}</h4>
                        <span className="text-xs text-[#686259]">
                          {quote.guestsCovered} Guests Covered
                        </span>
                      </div>

                      {/* Value Score Circle */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl border font-mono font-extrabold text-sm ${
                            quote.valueScore >= 80
                              ? 'border-[#1E5631]/40 bg-[#EEF7F0] text-[#1E5631]'
                              : 'border-[#B4690E]/40 bg-[#FEF8ED] text-[#B4690E]'
                          }`}
                        >
                          {quote.valueScore}
                        </div>
                        <span className="text-[11px] font-bold uppercase text-[#686259] mt-1">
                          Value Score
                        </span>
                      </div>
                    </div>

                    {/* Quoted Total */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E4DEC8]">
                      <span className="text-xs text-[#686259]">Quoted Total:</span>
                      <span className="font-mono-numeric text-base font-bold text-[#161412]">
                        ₹{quote.quotedTotalINR.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Hidden Charges Flagged */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#C23B22] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#C23B22]" />
                        <span>Hidden Surcharges &amp; Exclusions Detected:</span>
                      </span>
                      <ul className="space-y-1.5">
                        {quote.hiddenChargesFlagged.map((charge, i) => (
                          <li
                            key={i}
                            className="p-2 rounded-lg bg-[#FDF2F0] border border-[#C23B22]/30 text-[#C23B22] text-xs flex items-start gap-2"
                          >
                            <span className="font-bold">•</span>
                            <span>{charge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Missing Clarifications */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#B4690E] flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#B4690E]" />
                        <span>Required Written Clarifications:</span>
                      </span>
                      <ul className="space-y-1 text-xs text-[#686259]">
                        {quote.missingClarifications.map((clr, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#B4690E]">•</span>
                            <span>{clr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Collapsible Inclusions */}
                    <div className="pt-2 border-t border-[#E4DEC8]/60">
                      <button
                        type="button"
                        onClick={() => toggleInclusions(quote.id)}
                        className="text-xs font-bold text-[#686259] hover:text-[#161412] flex items-center gap-1"
                      >
                        <span>
                          {expandedQuoteInclusions[quote.id] ? 'Hide' : 'Show'} Inclusions (
                          {quote.inclusions.length})
                        </span>
                        {expandedQuoteInclusions[quote.id] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedQuoteInclusions[quote.id] && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-1 text-xs text-[#686259] bg-[#FAF7F2] p-3 rounded-xl border border-[#E4DEC8]"
                          >
                            {quote.inclusions.map((inc, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-[#1E5631] font-bold">✓</span>
                                <span>{inc}</span>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </StaggerItem>
      )}

      {/* ── TAB 3: WhatsApp RFQ Studio ─────────────────────────────────── */}
      {activeTab === 'whatsapp' && (
        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (5 cols): Controls */}
            <div className="lg:col-span-5 rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E4DEC8]/60 pb-4">
                <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#1E5631]" />
                  <span>WhatsApp RFQ Negotiator</span>
                </h3>
                <p className="text-xs text-[#686259] mt-0.5">
                  Pre-crafted inquiries that mandate written transparency before signing advances.
                </p>
              </div>

              {/* Language Selection Toggle */}
              <div>
                <label className="block text-xs font-bold text-[#161412] mb-2">
                  Language Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWhatsappLanguage('hinglish')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      whatsappLanguage === 'hinglish'
                        ? 'bg-[#EEF7F0] border-[#1E5631]/40 text-[#1E5631]'
                        : 'bg-[#FAF7F2] border-[#E4DEC8] text-[#686259] hover:text-[#161412]'
                    }`}
                  >
                    🇮🇳 Hinglish (Natural Indian)
                  </button>

                  <button
                    type="button"
                    onClick={() => setWhatsappLanguage('english')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      whatsappLanguage === 'english'
                        ? 'bg-[#EEF7F0] border-[#1E5631]/40 text-[#1E5631]'
                        : 'bg-[#FAF7F2] border-[#E4DEC8] text-[#686259] hover:text-[#161412]'
                    }`}
                  >
                    🌐 Formal English
                  </button>
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-[#161412] mb-2">
                  Target Vendor Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentPlan.budgetCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedRfqCategory(cat.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        selectedRfqCategory === cat.name
                          ? 'bg-[#B4690E] text-white border-[#B4690E]'
                          : 'bg-[#FAF7F2] border-[#E4DEC8] text-[#686259] hover:text-[#161412]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategic Advice Card */}
              <div className="rounded-xl border border-[#B4690E]/30 bg-[#FEF8ED] p-4 text-xs text-[#161412] space-y-2">
                <span className="font-bold text-[#B4690E] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#B4690E]" />
                  Crucial Negotiation Rule:
                </span>
                <p className="text-[11px] leading-relaxed text-[#686259]">
                  This message <strong>strictly conceals your maximum budget ceiling</strong>. Exposing your total budget causes vendors to inflate rates to capture 100% of your allocated funds.
                </p>
              </div>
            </div>

            {/* Right Column (7 cols): WhatsApp Mobile Phone Frame */}
            <div className="lg:col-span-7 rounded-2xl border border-[#E4DEC8] bg-[#FAF7F2] p-6 shadow-xs relative overflow-hidden">
              {/* WhatsApp Mockup Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E4DEC8]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1E5631] flex items-center justify-center font-bold text-white text-xs">
                    TY
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#161412] block">Vendor Inquiry</span>
                    <span className="text-[11px] text-[#1E5631] font-medium">Ready to dispatch</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E5631] hover:bg-[#163E23] text-white text-xs font-bold shadow-xs transition-all"
                >
                  {copiedToast ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy RFQ'}</span>
                </button>
              </div>

              {/* Chat Bubble Area */}
              <div className="mt-5 space-y-4 font-sans text-xs">
                <div className="ml-auto max-w-xl rounded-2xl rounded-tr-xs bg-[#005c4b] p-4 text-[#F0FDF4] shadow-xs space-y-3 leading-relaxed whitespace-pre-line">
                  {generateWhatsAppMessage()}
                  <div className="text-right text-[11px] text-emerald-200/70 font-mono">
                    10:30 AM ✓✓
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>
      )}

      {/* ── TAB 4: Interactive Vendor Execution Checklist ──────────────── */}
      {activeTab === 'checklist' && (
        <StaggerItem>
          <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4DEC8]/60 gap-3">
              <div>
                <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#B4690E]" />
                  <span>Interactive Vendor Execution Checklist</span>
                </h3>
                <p className="text-xs text-[#686259] mt-0.5">
                  Critical contractual verifications, compliance checks, and lock-in milestones before wedding/event day.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#161412] bg-[#FAF7F2] border border-[#E4DEC8] px-3 py-1 rounded-lg">
                  {completedChecklistCount} of {checklistItems.length} Verified ({Math.round((completedChecklistCount / checklistItems.length) * 100)}%)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {checklistItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                      item.completed
                        ? 'bg-[#EEF7F0]/40 border-[#1E5631]/30'
                        : 'bg-[#FAF7F2] border-[#E4DEC8] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    <motion.div
                      animate={{ scale: item.completed ? [1, 1.25, 1] : 1 }}
                      transition={{ duration: 0.2 }}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        item.completed
                          ? 'bg-[#1E5631] border-[#1E5631] text-white shadow-xs'
                          : 'border-[#E4DEC8] bg-[#FFFFFF]'
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5" />}
                    </motion.div>

                    <div className="space-y-1 grow">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-[#B4690E]" />
                        <h4
                          className={`text-xs font-bold ${
                            item.completed ? 'line-through text-[#686259]' : 'text-[#161412]'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E4DEC8] text-[#8C8275]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#686259] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </StaggerItem>
      )}

      {/* ── Step 04 to 05 Navigation Transition ─────────────────────────── */}
      <StaggerItem>
        <StageNavButtons
          prevLabel="Back to Step 03: Budget Ledger"
          onPrev={() => onNavigateTab?.('budget')}
          nextLabel="Proceed to Step 05: Critical Path Timeline"
          onNext={() => onNavigateTab?.('timeline')}
        />
      </StaggerItem>
    </StaggerContainer>
  );
};
