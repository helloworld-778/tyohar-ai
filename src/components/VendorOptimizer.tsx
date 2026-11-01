/**
 * @file VendorOptimizer.tsx
 * @description Orchestrator for Celebration Vendor Studio, Smart Plate Headcount Calculator,
 * 3-Tier Catering Packages, Quote Contract Auditor, WhatsApp RFQ Negotiator, and Execution Checklist.
 */

import React, { useState } from 'react';
import {
  Utensils,
  FileSearch,
  MessageCircle,
  Sparkles,
  RefreshCw,
  CheckSquare,
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
  StaggerContainer,
  StaggerItem,
  StageNavButtons,
} from './ui/Primitives';
import { getDefaultVendorQuotes, DEFAULT_CHECKLIST_ITEMS } from '../data/vendorCatalog';
import { SmartPlatePanel } from './vendor/SmartPlatePanel';
import { PackagesTierPanel } from './vendor/PackagesTierPanel';
import { QuoteAuditorPanel } from './vendor/QuoteAuditorPanel';
import { WhatsAppRfqPanel } from './vendor/WhatsAppRfqPanel';
import { ExecutionChecklistPanel, type VendorChecklistItem } from './vendor/ExecutionChecklistPanel';

interface VendorOptimizerProps {
  currentPlan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onNavigateTab?: (tab: 'overview' | 'intake' | 'budget' | 'timeline') => void;
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

  const [vendorQuotes, setVendorQuotes] = useState<VendorQuoteItem[]>(() =>
    getDefaultVendorQuotes(currentPlan.eventType, currentPlan.guestCount),
  );

  // ── Panel C State: WhatsApp RFQ ───────────────────────────────────────────
  const [whatsappLanguage, setWhatsappLanguage] = useState<'english' | 'hinglish'>('hinglish');
  const [selectedRfqCategory, setSelectedRfqCategory] = useState<string>('Food & Catering');
  const [copiedToast, setCopiedToast] = useState(false);

  // ── Panel D State: Interactive Execution Checklist ────────────────────────
  const [checklistItems, setChecklistItems] = useState<VendorChecklistItem[]>(
    DEFAULT_CHECKLIST_ITEMS,
  );

  const toggleChecklistItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    );
  };

  const completedChecklistCount = checklistItems.filter((item) => item.completed).length;

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
                icon: <Utensils className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />,
              },
              {
                id: 'auditor',
                label: '2. Quote Auditor & Hidden Fees',
                icon: <FileSearch className="w-4 h-4 text-[#2B4C7E]" aria-hidden="true" />,
                badge: vendorQuotes.length,
              },
              {
                id: 'whatsapp',
                label: '3. WhatsApp RFQ Negotiator',
                icon: <MessageCircle className="w-4 h-4 text-[#1E5631]" aria-hidden="true" />,
              },
              {
                id: 'checklist',
                label: '4. Execution Checklist',
                icon: <CheckSquare className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />,
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
              aria-label="Re-synthesize 3 catering package tiers"
              className="flex items-center gap-2 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] px-4 py-2 text-xs font-bold text-[#161412] shadow-xs hover:bg-[#F3EFE6] disabled:opacity-50 transition-all shrink-0 cursor-pointer"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B4690E]" aria-hidden="true" />
                  <span>Synthesizing Menus...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#B4690E]" aria-hidden="true" />
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
            <SmartPlatePanel
              eventType={currentPlan.eventType}
              guestCount={currentPlan.guestCount}
              perPlateBenchmark={perPlateBenchmark}
              isPeakAuspicious={isPeakAuspicious}
              smartPlate={smartPlate}
              turnoutOverride={turnoutOverride}
              onUpdateGuestCount={(count) =>
                onUpdatePlan({ ...currentPlan, guestCount: count })
              }
              onUpdatePerPlateBenchmark={setPerPlateBenchmark}
              onTogglePeakAuspicious={setIsPeakAuspicious}
              onUpdateTurnoutOverride={setTurnoutOverride}
            />

            <PackagesTierPanel
              packages={currentPlan.vendorPackages}
              selectedPackageMode={selectedPackageMode}
              onSelectMode={setSelectedPackageMode}
            />
          </div>
        </StaggerItem>
      )}

      {/* ── TAB 2: Quote Auditor & Hidden Fees ─────────────────────────── */}
      {activeTab === 'auditor' && (
        <StaggerItem>
          <QuoteAuditorPanel
            rawQuoteInput={rawQuoteInput}
            isAuditing={isAuditing}
            auditFeedback={auditFeedback}
            vendorQuotes={vendorQuotes}
            onQuoteInputChange={setRawQuoteInput}
            onSubmitAudit={handleAuditNewQuote}
          />
        </StaggerItem>
      )}

      {/* ── TAB 3: WhatsApp RFQ Studio ─────────────────────────────────── */}
      {activeTab === 'whatsapp' && (
        <StaggerItem>
          <WhatsAppRfqPanel
            categories={currentPlan.budgetCategories}
            selectedCategory={selectedRfqCategory}
            language={whatsappLanguage}
            copiedToast={copiedToast}
            messageText={generateWhatsAppMessage()}
            onSelectCategory={setSelectedRfqCategory}
            onSelectLanguage={setWhatsappLanguage}
            onCopy={handleCopyWhatsApp}
          />
        </StaggerItem>
      )}

      {/* ── TAB 4: Interactive Vendor Execution Checklist ──────────────── */}
      {activeTab === 'checklist' && (
        <StaggerItem>
          <ExecutionChecklistPanel
            items={checklistItems}
            onToggleItem={toggleChecklistItem}
          />
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
