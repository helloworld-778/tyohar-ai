import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Utensils,
  TrendingDown,
  ShieldAlert,
  Wand2,
  CheckCircle2,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import type { EventPlan, EventType } from '../types/tyohar';
import {
  PRESET_WEDDING,
  PRESET_COMMUNITY,
  PRESET_BIRTHDAY,
} from '../data/presets';
import { SpotlightCard, BentoCard, EventBackdrop } from './ui/Primitives';
import { BrandLogo } from './ui/BrandLogo';

interface LandingHeroProps {
  onEnterStudio: () => void;
  onSelectPresetAndEnter: (preset: EventPlan) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onEnterStudio,
  onSelectPresetAndEnter,
}) => {
  const [selectedVibe, setSelectedVibe] = useState<EventType>('wedding');

  const handleLaunchVibe = () => {
    if (selectedVibe === 'wedding') onSelectPresetAndEnter(PRESET_WEDDING);
    else if (selectedVibe === 'birthday') onSelectPresetAndEnter(PRESET_BIRTHDAY);
    else onSelectPresetAndEnter(PRESET_COMMUNITY);
  };

  return (
    <div
      data-vibe={selectedVibe}
      className="relative min-h-screen bg-[#FAF7F2] text-[#161412] pb-24 overflow-hidden"
    >
      {/* ── Event-Adaptive Moving Vector Backdrop ───────────────────────────── */}
      <EventBackdrop eventType={selectedVibe} />

      {/* ── Top Architectural Navigation Bar ───────────────────────────────── */}
      <header className="sticky top-4 z-40 mx-auto max-w-5xl px-4">
        <nav
          aria-label="Landing Navigation"
          className="flex items-center justify-between rounded-md border border-[#E4DEC8] bg-[#FFFFFF] p-2.5 pl-4 shadow-xs"
        >
          {/* Logo */}
          <BrandLogo size="sm" subtitle="Celebration Co-Pilot" />

          {/* Nav Links (Desktop) */}
          <div className="hidden items-center gap-6 text-xs font-semibold text-[#686259] md:flex">
            <a href="#features" className="transition-colors hover:text-[#161412]">
              Architecture &amp; Features
            </a>
            <a href="#presets" className="transition-colors hover:text-[#161412]">
              Scenario Presets
            </a>
            <a href="#hybrid-ai" className="transition-colors hover:text-[#161412]">
              Hybrid Math Engine
            </a>
          </div>

          {/* Launch CTA */}
          <button
            type="button"
            onClick={onEnterStudio}
            className="flex items-center gap-1.5 rounded-md bg-[#161412] hover:bg-[#24201C] px-3.5 py-1.5 text-xs font-bold text-[#FAF7F2] shadow-xs transition-colors"
          >
            <span>Open Planner Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </nav>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-16 text-center sm:pt-24">
        {/* Editorial Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-sm border border-[#E4DEC8] bg-[#F3EFE6] px-3.5 py-1 text-xs font-bold text-[#B4690E]">
          <Sparkles className="h-3.5 w-3.5 text-[#B4690E]" />
          <span>GenAI + Deterministic Math Architecture for Indian Celebrations</span>
        </div>

        {/* Tactile 1-Click Celebration Vibe Switcher */}
        <div className="mt-4 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-md border border-[#E4DEC8] bg-[#FFFFFF] p-1 shadow-xs">
            <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-[#686259]">
              Celebration Vibe:
            </span>
            <button
              type="button"
              onClick={() => setSelectedVibe('wedding')}
              className={`rounded-sm px-2.5 py-1 text-xs font-bold transition-colors ${
                selectedVibe === 'wedding'
                  ? 'bg-[#C23B22] text-white'
                  : 'text-[#686259] hover:text-[#161412] hover:bg-[#F3EFE6]'
              }`}
            >
              Royal Vivah
            </button>
            <button
              type="button"
              onClick={() => setSelectedVibe('birthday')}
              className={`rounded-sm px-2.5 py-1 text-xs font-bold transition-colors ${
                selectedVibe === 'birthday'
                  ? 'bg-[#B4690E] text-white'
                  : 'text-[#686259] hover:text-[#161412] hover:bg-[#F3EFE6]'
              }`}
            >
              Family Jubilee
            </button>
            <button
              type="button"
              onClick={() => setSelectedVibe('community')}
              className={`rounded-sm px-2.5 py-1 text-xs font-bold transition-colors ${
                selectedVibe === 'community'
                  ? 'bg-[#1E5631] text-white'
                  : 'text-[#686259] hover:text-[#161412] hover:bg-[#F3EFE6]'
              }`}
            >
              Community Utsav
            </button>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          <span>Turn Celebration Chaos Into </span>
          <span className="font-serif-heading italic text-[#B4690E]">
            Executed Perfection.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#686259] sm:text-base">
          Stop over-ordering catering by 20% and unravelling vendor hidden fees. Tyohar AI
          unifies <strong>Gemini 2.5 Flash</strong> with <strong>deterministic algorithms</strong> for
          attendance buffer formulas, topological critical-path timelines, and surgical budget trade-offs.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleLaunchVibe}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#161412] hover:bg-[#24201C] px-6 py-3.5 text-sm font-bold text-[#FAF7F2] shadow-xs transition-colors sm:w-auto"
          >
            <span>Launch Interactive Studio</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 text-xs text-[#686259]">
            <span>Or test instant presets:</span>
            <button
              onClick={() => onSelectPresetAndEnter(PRESET_WEDDING)}
              className="rounded-md border border-[#E4DEC8] bg-[#FFFFFF] px-2.5 py-1 text-[#161412] hover:border-[#B4690E] transition-colors"
            >
              Wedding (₹8L)
            </button>
            <button
              onClick={() => onSelectPresetAndEnter(PRESET_COMMUNITY)}
              className="rounded-md border border-[#E4DEC8] bg-[#FFFFFF] px-2.5 py-1 text-[#161412] hover:border-[#1E5631] transition-colors"
            >
              Utsav (₹50k)
            </button>
          </div>
        </div>
      </section>

      {/* ── Editorial Feature Grid ────────────────────────────────────────── */}
      <section id="features" className="relative z-10 mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B4690E]">
            Engine Capabilities
          </span>
          <h2 className="font-serif-heading mt-1.5 text-3xl font-bold tracking-tight text-[#161412] sm:text-4xl">
            Surgical Real-World Problem Solving
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-[#686259]">
            Engineered around realistic Indian banquet dynamics, multi-generational guest cohorts, and vendor contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Smart Plate */}
          <BentoCard
            icon={<Utensils className="h-5 w-5 text-[#B4690E]" />}
            title="Smart Plate & Zero Waste"
            description="Calculates realistic Indian turnout (85–92%), negotiates buffer plates, and automates surplus redistribution."
            metric="88% Base + 9% Buffer"
            metricLabel="Realistic Turnout Formula"
          >
            <div className="flex items-center gap-2 rounded-sm bg-[#1E5631]/10 p-2 text-[11px] text-[#1E5631] border border-[#1E5631]/20">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Saves ₹9,600+ on unconsumed plates</span>
            </div>
          </BentoCard>

          {/* Card 2: 20% Over-Budget Resolver */}
          <BentoCard
            icon={<TrendingDown className="h-5 w-5 text-[#C23B22]" />}
            title="Surgical Trade-Off Resolver"
            description="When vendor quotes exceed budget, the engine cuts lowest-priority items first while 100% protecting your #1 priority."
            metric="Top Priority Shielded"
            metricLabel="Targeted Cost-Cutting"
          >
            <div className="flex items-center gap-2 rounded-sm bg-[#C23B22]/10 p-2 text-[11px] text-[#C23B22] border border-[#C23B22]/20">
              <Sliders className="h-3.5 w-3.5 shrink-0" />
              <span>Cuts Décor/DJ before touching Food</span>
            </div>
          </BentoCard>

          {/* Card 3: Live What-If Mutator */}
          <BentoCard
            icon={<Wand2 className="h-5 w-5 text-[#B4690E]" />}
            title="Live 'What-If' Mutator"
            description="Simulate contingencies (+50 guests, budget -10%, event moved 2 weeks earlier) with instant in-place state diffing."
            metric="In-Place State Diffs"
            metricLabel="No Lost User Progress"
          >
            <div className="flex items-center gap-2 rounded-sm bg-[#F3EFE6] p-2 text-[11px] text-[#161412] border border-[#E4DEC8]">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#B4690E]" />
              <span>Natural language contingency simulator</span>
            </div>
          </BentoCard>

          {/* Card 4: Quote Auditor & WhatsApp */}
          <BentoCard
            icon={<ShieldAlert className="h-5 w-5 text-[#1E5631]" />}
            title="Quote Auditor & WhatsApp RFQ"
            description="Detects 18% GST exclusions and post-11 PM overtime in raw text. Generates budget-blind WhatsApp RFQs."
            metric="Value Score 0–100"
            metricLabel="Hidden-Fee Protection"
          >
            <div className="flex items-center gap-2 rounded-sm bg-[#1E5631]/10 p-2 text-[11px] text-[#1E5631] border border-[#1E5631]/20">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Hinglish &amp; English budget-blind RFQs</span>
            </div>
          </BentoCard>
        </div>
      </section>

      {/* ── Scenario Presets Launchpad ────────────────────────────────────── */}
      <section id="presets" className="relative z-10 mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C23B22]">
            Ground-Truth Benchmarks
          </span>
          <h2 className="font-serif-heading mt-1.5 text-3xl font-bold tracking-tight text-[#161412] sm:text-4xl">
            Explore 3 Authentic Celebration Scenarios
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-[#686259]">
            Pre-loaded with accurate Indian market estimates, complete vendor quotes, and topological timelines.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Preset 1: Wedding */}
          <SpotlightCard
            onClick={() => onSelectPresetAndEnter(PRESET_WEDDING)}
            className="cursor-pointer group hover:border-[#C23B22]"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-sm bg-[#C23B22]/10 border border-[#C23B22]/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#C23B22]">
                Vivah Benchmark
              </span>
              <span className="font-mono-numeric text-xs font-bold text-[#686259]">16 Weeks Lead</span>
            </div>

            <h3 className="font-serif-heading mt-4 text-xl font-bold text-[#161412] group-hover:text-[#C23B22] transition-colors">
              {PRESET_WEDDING.name}
            </h3>
            <p className="mt-2 text-xs text-[#686259] leading-relaxed">
              Balancing an elaborate multi-cuisine buffet and live counters against seasonal floral décor constraints.
            </p>

            <div className="my-5 space-y-2 rounded-md bg-[#FAF7F2] border border-[#E4DEC8] p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#686259]">Target Budget:</span>
                <span className="font-mono-numeric font-bold text-[#C23B22]">₹8,00,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#686259]">Expected Guests:</span>
                <span className="font-bold text-[#161412]">200 Attendees</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#686259]">Smart Plate Split:</span>
                <span className="text-[#1E5631] font-semibold">176 Base + 18 Buffer</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-[#C23B22]">
              <span>Load Royal Vivah Plan</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </SpotlightCard>

          {/* Preset 2: Community Utsav */}
          <SpotlightCard
            onClick={() => onSelectPresetAndEnter(PRESET_COMMUNITY)}
            className="cursor-pointer group hover:border-[#1E5631]"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-sm bg-[#1E5631]/10 border border-[#1E5631]/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#1E5631]">
                Community Fest
              </span>
              <span className="font-mono-numeric text-xs font-bold text-[#686259]">4 Weeks Lead</span>
            </div>

            <h3 className="font-serif-heading mt-4 text-xl font-bold text-[#161412] group-hover:text-[#1E5631] transition-colors">
              {PRESET_COMMUNITY.name}
            </h3>
            <p className="mt-2 text-xs text-[#686259] leading-relaxed">
              Volunteer logistics, sound vendor permits, campus clearances, and high-volume street-food chaat counters.
            </p>

            <div className="my-5 space-y-2 rounded-md bg-[#FAF7F2] border border-[#E4DEC8] p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#686259]">Target Budget:</span>
                <span className="font-mono-numeric font-bold text-[#1E5631]">₹50,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#686259]">Expected Attendees:</span>
                <span className="font-bold text-[#161412]">300 Guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#686259]">Key Focus:</span>
                <span className="text-[#B4690E] font-semibold">PA Sound &amp; Volunteers</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-[#1E5631]">
              <span>Load Cultural Utsav Plan</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </SpotlightCard>

          {/* Preset 3: Milestone Birthday */}
          <SpotlightCard
            onClick={() => onSelectPresetAndEnter(PRESET_BIRTHDAY)}
            className="cursor-pointer group hover:border-[#B4690E]"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-sm bg-[#B4690E]/10 border border-[#B4690E]/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#B4690E]">
                Family Jubilee
              </span>
              <span className="font-mono-numeric text-xs font-bold text-[#686259]">2 Weeks Lead</span>
            </div>

            <h3 className="font-serif-heading mt-4 text-xl font-bold text-[#161412] group-hover:text-[#B4690E] transition-colors">
              {PRESET_BIRTHDAY.name}
            </h3>
            <p className="mt-2 text-xs text-[#686259] leading-relaxed">
              Multi-generational harmony with toddler activity zones, diabetic low-sugar desserts, and elder acoustic seating.
            </p>

            <div className="my-5 space-y-2 rounded-md bg-[#FAF7F2] border border-[#E4DEC8] p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#686259]">Target Budget:</span>
                <span className="font-mono-numeric font-bold text-[#B4690E]">₹25,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#686259]">Expected Guests:</span>
                <span className="font-bold text-[#161412]">60 Family Members</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#686259]">Special Setup:</span>
                <span className="text-[#C23B22] font-semibold">Satvik &amp; Low-Sugar</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-[#B4690E]">
              <span>Load Milestone Birthday Plan</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* ── Architecture Comparison Section ──────────────────────────────── */}
      <section id="hybrid-ai" className="relative z-10 mx-auto mt-24 max-w-5xl px-4 sm:px-6">
        <div className="rounded-lg border border-[#E4DEC8] bg-[#FFFFFF] p-8 shadow-xs">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1E5631]">
              Engineering Rigour
            </span>
            <h2 className="font-serif-heading mt-1.5 text-2xl font-bold text-[#161412] sm:text-3xl">
              Why Hybrid AI &gt; Naive Chatbots
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-[#686259]">
              Generic LLMs hallucinate Rupee math, produce circular timeline dependencies, and break under rate limits. Tyohar AI keeps critical computations deterministic.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-md border border-[#C23B22]/30 bg-[#C23B22]/5 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C23B22]">
                ✕ Failure Modes of Naive Chatbots
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-[#686259]">
                <li className="flex items-start gap-2">
                  <span className="text-[#C23B22] font-bold">&bull;</span>
                  <span>Hallucinates catering budgets that don&apos;t sum to the total budget limit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C23B22] font-bold">&bull;</span>
                  <span>Recommends cuts randomly without respecting the user&apos;s #1 priority.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C23B22] font-bold">&bull;</span>
                  <span>Creates circular dependency deadlocks in timeline task sequences.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C23B22] font-bold">&bull;</span>
                  <span>Crashes entirely when free API quotas or network timeouts hit.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-md border border-[#1E5631]/30 bg-[#1E5631]/5 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E5631]">
                ✓ Tyohar AI Hybrid Architecture
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-[#161412]">
                <li className="flex items-start gap-2">
                  <span className="text-[#1E5631] font-bold">&bull;</span>
                  <span>Deterministic proportional arithmetic guarantees exact Rupee allocations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1E5631] font-bold">&bull;</span>
                  <span>Surgical trade-offs target lowest-priority items first via priority graph sorting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1E5631] font-bold">&bull;</span>
                  <span>Topological sort and BFS cascade traversal guarantee valid lead times.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1E5631] font-bold">&bull;</span>
                  <span>Built-in deterministic fallback engine ensures 100% offline uptime.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
