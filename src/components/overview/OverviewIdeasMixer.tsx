/**
 * @file OverviewIdeasMixer.tsx
 * @description Interactive AI Celebration Ideas & Vibe Remixer component supporting
 * regional stylistic shifts, bespoke custom prompt synthesis, and dynamic budget injection.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, Check, Plus } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export interface IdeaCardItem {
  id: string;
  category: string;
  title: string;
  desc: string;
  costINR: number;
  icon: React.ComponentType<{ className?: string }>;
}

interface SubThemeOption {
  id: string;
  label: string;
  badge: string;
}

interface OverviewIdeasMixerProps {
  subThemes: SubThemeOption[];
  activeSubTheme: string;
  customIdeaPrompt: string;
  isSynthesizingIdea: boolean;
  allIdeas: IdeaCardItem[];
  isIdeaAdded: (id: string) => boolean;
  onSelectSubTheme: (id: string) => void;
  onPromptChange: (val: string) => void;
  onSubmitCustomIdea: (e: React.FormEvent) => void;
  onToggleIdeaToPlan: (idea: IdeaCardItem) => void;
}

export const OverviewIdeasMixer: React.FC<OverviewIdeasMixerProps> = ({
  subThemes,
  activeSubTheme,
  customIdeaPrompt,
  isSynthesizingIdea,
  allIdeas,
  isIdeaAdded,
  onSelectSubTheme,
  onPromptChange,
  onSubmitCustomIdea,
  onToggleIdeaToPlan,
}) => {
  return (
    <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-5 sm:p-6 shadow-[3px_3px_0px_#E4DEC8] space-y-5">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#E4DEC8]/60 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
            <h3 className="text-base font-bold text-[#161412]">
              Interactive AI Celebration Ideas &amp; Vibe Remixer
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E4DEC8] text-[#B4690E]">
              Live Dynamic Mixer
            </span>
          </div>
          <p className="text-xs text-[#686259] mt-0.5">
            Click sub-themes to remix styles, or click <strong>[+ Add to Plan]</strong> to inject custom concepts directly into your live budget and timeline.
          </p>
        </div>

        {/* Clickable Regional/Style Sub-Theme Pills */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0" role="group" aria-label="Celebration Style Themes">
          <span className="text-[11px] font-bold text-[#8C8275] uppercase tracking-wider mr-1">
            Remix Style:
          </span>
          {subThemes.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectSubTheme(st.id)}
              aria-pressed={activeSubTheme === st.id}
              className={`tactile-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeSubTheme === st.id
                  ? 'bg-[#161412] text-white border-[#161412]'
                  : 'bg-[#FAF7F2] text-[#686259] border-[#E4DEC8] hover:text-[#161412]'
              }`}
            >
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Inline Prompt Bar for Custom Concepts */}
      <form onSubmit={onSubmitCustomIdea} className="flex gap-2">
        <label htmlFor="custom-idea-input" className="sr-only">
          Prompt AI for custom celebration ideas
        </label>
        <input
          id="custom-idea-input"
          type="text"
          value={customIdeaPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="✨ Prompt AI for a custom theme, dish, or setup (e.g., 'Kashmiri Kahwa samovar counter' or 'Neon Dandiya arch')..."
          className="flex-1 px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-md text-[#161412] placeholder:text-[#8C8275] focus:border-[#B4690E] focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={isSynthesizingIdea || !customIdeaPrompt.trim()}
          aria-label="Synthesize celebration concept using AI"
          className="tactile-btn flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#B4690E] text-white text-xs font-bold disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
        >
          {isSynthesizingIdea ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Synthesize Idea</span>
            </>
          )}
        </button>
      </form>

      {/* Dynamic Interactive Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTheme}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {allIdeas.map((idea) => {
            const Icon = idea.icon;
            const added = isIdeaAdded(idea.id);

            return (
              <div
                key={idea.id}
                className={`tactile-card flex flex-col justify-between p-4 rounded-xl border transition-all ${
                  added
                    ? 'border-[#1E5631] bg-[#F4FBF7]'
                    : 'border-[#E4DEC8] bg-[#FAF7F2]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#E4DEC8] flex items-center justify-center text-[#B4690E] shrink-0">
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8275]">
                        {idea.category}
                      </span>
                    </div>
                    <span className="font-mono-numeric text-xs font-bold text-[#161412]">
                      {formatINR(idea.costINR)}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#161412] leading-snug">
                    {idea.title}
                  </h4>
                  <p className="text-[11px] text-[#686259] leading-relaxed">
                    {idea.desc}
                  </p>
                </div>

                {/* Interactive [+ Add to Plan] Toggle Button */}
                <div className="pt-3 mt-3 border-t border-[#E4DEC8]/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onToggleIdeaToPlan(idea)}
                    aria-label={added ? `Remove ${idea.title} from plan` : `Add ${idea.title} to plan budget`}
                    className={`tactile-btn flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all w-full justify-center cursor-pointer ${
                      added
                        ? 'bg-[#1E5631] text-white border-[#1E5631]'
                        : 'bg-[#FFFFFF] text-[#161412] border-[#E4DEC8] hover:border-[#B4690E]'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                        <span>In Plan (-{formatINR(idea.costINR)})</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-[#B4690E]" aria-hidden="true" />
                        <span>+ Add to Plan ({formatINR(idea.costINR)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

