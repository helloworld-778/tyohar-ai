/**
 * @file QuoteAuditorPanel.tsx
 * @description Vendor Quote Auditor parsing raw WhatsApp/PDF contract text
 * to flag excluded GST, overtime charges, and missing operational commitments.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { VendorQuoteItem } from '../../types/tyohar';
import { formatINR } from '../../utils/formatters';

interface QuoteAuditorPanelProps {
  rawQuoteInput: string;
  isAuditing: boolean;
  auditFeedback: string | null;
  vendorQuotes: VendorQuoteItem[];
  onQuoteInputChange: (val: string) => void;
  onSubmitAudit: (e: React.FormEvent) => void;
}

export const QuoteAuditorPanel: React.FC<QuoteAuditorPanelProps> = ({
  rawQuoteInput,
  isAuditing,
  auditFeedback,
  vendorQuotes,
  onQuoteInputChange,
  onSubmitAudit,
}) => {
  const [expandedQuoteInclusions, setExpandedQuoteInclusions] = useState<Record<string, boolean>>({});

  const toggleInclusions = (id: string) => {
    setExpandedQuoteInclusions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Raw Quote Paste Card */}
      <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
        <div className="border-b border-[#E4DEC8]/60 pb-3">
          <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-[#2B4C7E]" aria-hidden="true" />
            <span>Paste Raw WhatsApp / PDF / Email Quote for Contract Audit</span>
          </h3>
          <p className="text-xs text-[#686259] mt-0.5">
            Gemini analyzes unstructured text to detect excluded 18% GST, overtime clauses, generator diesel charges, and missing cleanup commitments.
          </p>
        </div>

        <form onSubmit={onSubmitAudit} className="space-y-3">
          <label htmlFor="raw-vendor-quote-input" className="sr-only">
            Raw Vendor Quote Message Text
          </label>
          <textarea
            id="raw-vendor-quote-input"
            rows={4}
            value={rawQuoteInput}
            onChange={(e) => onQuoteInputChange(e.target.value)}
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
                aria-label="Audit vendor quote clauses and flag hidden fees"
                className="flex items-center gap-2 rounded-xl bg-[#161412] hover:bg-[#2C2724] px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isAuditing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B4690E]" aria-hidden="true" />
                    <span>Auditing Contract Clauses...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#B4690E]" aria-hidden="true" />
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
                  {formatINR(quote.quotedTotalINR)}
                </span>
              </div>

              {/* Hidden Charges Flagged */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#C23B22] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#C23B22]" aria-hidden="true" />
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
                  <HelpCircle className="w-3.5 h-3.5 text-[#B4690E]" aria-hidden="true" />
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
                  aria-expanded={Boolean(expandedQuoteInclusions[quote.id])}
                  className="text-xs font-bold text-[#686259] hover:text-[#161412] flex items-center gap-1 cursor-pointer"
                >
                  <span>
                    {expandedQuoteInclusions[quote.id] ? 'Hide' : 'Show'} Inclusions (
                    {quote.inclusions.length})
                  </span>
                  {expandedQuoteInclusions[quote.id] ? (
                    <ChevronUp className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
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
  );
};

