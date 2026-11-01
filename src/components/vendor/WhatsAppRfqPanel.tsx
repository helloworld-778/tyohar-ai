/**
 * @file WhatsAppRfqPanel.tsx
 * @description WhatsApp RFQ Generator producing culturally resonant inquiries
 * in Hinglish and English that conceal total budget ceilings and mandate transparent cost breakdowns.
 */

import React from 'react';
import { MessageCircle, ShieldAlert, Check, Copy } from 'lucide-react';
import type { BudgetCategory } from '../../types/tyohar';

interface WhatsAppRfqPanelProps {
  categories: BudgetCategory[];
  selectedCategory: string;
  language: 'english' | 'hinglish';
  copiedToast: boolean;
  messageText: string;
  onSelectCategory: (category: string) => void;
  onSelectLanguage: (lang: 'english' | 'hinglish') => void;
  onCopy: () => void;
}

export const WhatsAppRfqPanel: React.FC<WhatsAppRfqPanelProps> = ({
  categories,
  selectedCategory,
  language,
  copiedToast,
  messageText,
  onSelectCategory,
  onSelectLanguage,
  onCopy,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column (5 cols): Controls */}
      <div className="lg:col-span-5 rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
        <div className="border-b border-[#E4DEC8]/60 pb-4">
          <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#1E5631]" aria-hidden="true" />
            <span>WhatsApp RFQ Negotiator</span>
          </h3>
          <p className="text-xs text-[#686259] mt-0.5">
            Pre-crafted inquiries that mandate written transparency before signing advances.
          </p>
        </div>

        {/* Language Selection Toggle */}
        <div>
          <span className="block text-xs font-bold text-[#161412] mb-2">
            Language Style
          </span>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="WhatsApp Language Style">
            <button
              type="button"
              onClick={() => onSelectLanguage('hinglish')}
              aria-pressed={language === 'hinglish'}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                language === 'hinglish'
                  ? 'bg-[#EEF7F0] border-[#1E5631]/40 text-[#1E5631]'
                  : 'bg-[#FAF7F2] border-[#E4DEC8] text-[#686259] hover:text-[#161412]'
              }`}
            >
              🇮🇳 Hinglish (Natural Indian)
            </button>

            <button
              type="button"
              onClick={() => onSelectLanguage('english')}
              aria-pressed={language === 'english'}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                language === 'english'
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
          <span className="block text-xs font-bold text-[#161412] mb-2">
            Target Vendor Category
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Vendor Categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                aria-pressed={selectedCategory === cat.name}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  selectedCategory === cat.name
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
            <ShieldAlert className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
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
            onClick={onCopy}
            aria-label="Copy RFQ message text to clipboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E5631] hover:bg-[#163E23] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            {copiedToast ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy RFQ'}</span>
          </button>
        </div>

        {/* Chat Bubble Area */}
        <div className="mt-5 space-y-4 font-sans text-xs">
          <div className="ml-auto max-w-xl rounded-2xl rounded-tr-xs bg-[#005c4b] p-4 text-[#F0FDF4] shadow-xs space-y-3 leading-relaxed whitespace-pre-line">
            {messageText}
            <div className="text-right text-[11px] text-emerald-200/70 font-mono">
              10:30 AM ✓✓
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

