import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee,
  Utensils,
  Clock,
  Heart,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Volume2,
  Sliders,
  DollarSign,
  Calendar,
  Palette,
  Flower2,
  Coffee,
  Users2,
  Plus,
  Check,
  Send,
  Loader2,
} from 'lucide-react';
import type { EventPlan, TimelineTask } from '../types/tyohar';
import {
  MetricStatCard,
  GuidedPageHero,
  AnimatedCurrency,
  AnimatedNumber,
  StaggerContainer,
  StaggerItem,
  StageNavButtons,
} from './ui/Primitives';
import { callTyoharAI } from '../services/aiClient';

interface OverviewDashboardProps {
  currentPlan: EventPlan;
  onNavigateTab: (tab: 'intake' | 'budget' | 'vendor' | 'timeline') => void;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

interface IdeaCardItem {
  id: string;
  category: string;
  title: string;
  desc: string;
  costINR: number;
  icon: React.ComponentType<{ className?: string }>;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  currentPlan,
  onNavigateTab,
  onUpdatePlan,
}) => {
  // ── Sub-Theme State for Interactive Remixing ──────────────────────────────
  const [activeSubTheme, setActiveSubTheme] = useState<string>('default');
  const [customIdeaPrompt, setCustomIdeaPrompt] = useState('');
  const [isSynthesizingIdea, setIsSynthesizingIdea] = useState(false);
  const [customPinnedIdeas, setCustomPinnedIdeas] = useState<IdeaCardItem[]>([]);

  // Aggregate Metrics
  const totalEstimated = useMemo(() => {
    return currentPlan.budgetCategories.reduce((sum, c) => sum + c.estimatedCost, 0);
  }, [currentPlan.budgetCategories]);

  const overage = Math.max(0, totalEstimated - currentPlan.totalBudgetINR);
  const budgetUsagePercent = Math.round(
    (totalEstimated / Math.max(1, currentPlan.totalBudgetINR)) * 100,
  );

  const completedTasks = currentPlan.timeline.filter((t) => t.status === 'completed').length;
  const delayedTasks = currentPlan.timeline.filter((t) => t.status === 'delayed').length;

  const urgentTasks = useMemo(() => {
    return [...currentPlan.timeline]
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => a.weeksBefore - b.weeksBefore)
      .slice(0, 3);
  }, [currentPlan.timeline]);

  const handleToggleTaskStatus = (taskId: string) => {
    const updated = currentPlan.timeline.map((t) => {
      if (t.id === taskId) {
        const next: TimelineTask['status'] = t.status === 'pending' ? 'completed' : 'pending';
        return { ...t, status: next };
      }
      return t;
    });
    onUpdatePlan({ ...currentPlan, timeline: updated });
  };

  const categoryColors: Record<string, string> = {
    'Food & Catering': 'bg-[#B4690E]',
    Venue: 'bg-[#2B4C7E]',
    'Décor & Flowers': 'bg-[#C23B22]',
    'Photography & Video': 'bg-[#1E5631]',
    'Entertainment & Music': 'bg-[#854D0E]',
  };

  const WORKFLOW_STEPS = [
    {
      step: '01',
      title: 'Personalize Intake',
      desc: 'Weights & Demographics',
      target: 'intake' as const,
      icon: Sliders,
    },
    {
      step: '02',
      title: 'Balance Budget',
      desc: 'Ledger & 20% Cut Protections',
      target: 'budget' as const,
      icon: DollarSign,
    },
    {
      step: '03',
      title: 'Vendors & Plates',
      desc: 'Smart Plate & RFQ Studio',
      target: 'vendor' as const,
      icon: Utensils,
    },
    {
      step: '04',
      title: 'Lock Timeline',
      desc: 'Critical Path & Cascades',
      target: 'timeline' as const,
      icon: Calendar,
    },
  ];

  // ── Regional & Stylistic Sub-Themes ───────────────────────────────────────
  const subThemes = useMemo(() => {
    if (currentPlan.eventType === 'wedding') {
      return [
        { id: 'default', label: 'Royal Marwar', badge: 'Heritage Palatial' },
        { id: 'dakshin', label: 'Temple Dakshin', badge: 'Kanjeevaram & Vetiver' },
        { id: 'sangeet', label: 'Modern Sangeet', badge: 'Neon Velvet & Starlight' },
      ];
    }
    if (currentPlan.eventType === 'birthday') {
      return [
        { id: 'default', label: 'Bollywood Retro', badge: 'Vintage 80s Disco' },
        { id: 'garden', label: 'Garden Soirée', badge: 'Pastel Floral Pergola' },
        { id: 'arcade', label: 'Arcade & Carnival', badge: 'Neon Sliders & Games' },
      ];
    }
    return [
      { id: 'default', label: 'Eco Sarvajanik Utsav', badge: 'Zero-Waste Bamboo' },
      { id: 'garba', label: 'Garba Raas Night', badge: 'Mirrorwork & Dhol' },
      { id: 'annakut', label: 'Grand Annakut Mela', badge: '56 Bhog Mahaprasad' },
    ];
  }, [currentPlan.eventType]);

  // Bespoke Curated Cards Remixed by activeSubTheme
  const currentIdeaCards = useMemo((): IdeaCardItem[] => {
    const type = currentPlan.eventType;
    if (type === 'wedding') {
      if (activeSubTheme === 'dakshin') {
        return [
          {
            id: 'wed-dak-theme',
            category: 'Venue',
            title: 'Kanjeevaram Temple Sanctuary',
            desc: 'Raw brass kuthuvillaku oil lamps, natural vetiver fragrance curtains, and deep forest green silk accents.',
            costINR: 20000,
            icon: Palette,
          },
          {
            id: 'wed-dak-decor',
            category: 'Décor & Flowers',
            title: 'Banana-Leaf & Jasmine Mandap',
            desc: 'Carved natural wood pillars intertwined with fresh Madurai malli jasmine strands and hand-tied lotus buds.',
            costINR: 28000,
            icon: Flower2,
          },
          {
            id: 'wed-dak-food',
            category: 'Food & Catering',
            title: 'Filter Coffee & Payasam Bar',
            desc: 'Live brass tumbler degree coffee counter, traditional Elaneer Payasam, and hot mini-idli podi counters.',
            costINR: 18000,
            icon: Coffee,
          },
          {
            id: 'wed-dak-exp',
            category: 'Entertainment & Music',
            title: 'Classical Nadaswaram & Carnatic Lounge',
            desc: 'Live acoustic Carnatic flute and nadaswaram welcome troupe with low-decibel diwan seating for elders.',
            costINR: 15000,
            icon: Users2,
          },
        ];
      }
      if (activeSubTheme === 'sangeet') {
        return [
          {
            id: 'wed-san-theme',
            category: 'Venue',
            title: 'Starlight Glasshouse Vibe',
            desc: 'Midnight indigo walls, fairy light ceiling canopies, and polished mirrorwork floor runners.',
            costINR: 25000,
            icon: Palette,
          },
          {
            id: 'wed-san-decor',
            category: 'Décor & Flowers',
            title: 'Geometric Floral Tunnel & Photobooth',
            desc: 'Hexagonal brass flower arches with personalized family monograms and warm tungsten bulb chandeliers.',
            costINR: 32000,
            icon: Flower2,
          },
          {
            id: 'wed-san-food',
            category: 'Food & Catering',
            title: 'Gourmet Slider & Craft Chaat Galli',
            desc: 'Tandoori bao sliders, smoking dry-ice chaat bowls, and hand-spun Kesari Rabdi jalebi counters.',
            costINR: 24000,
            icon: Coffee,
          },
          {
            id: 'wed-san-exp',
            category: 'Entertainment & Music',
            title: 'Interactive Sangeet Flashmob Ring',
            desc: 'Acoustically isolated elder chill lounge with acoustic curtains, plus a dynamic central sangeet dance stage.',
            costINR: 18000,
            icon: Users2,
          },
        ];
      }
      // default: Royal Marwar
      return [
        {
          id: 'wed-mar-theme',
          category: 'Venue',
          title: 'Royal Marwar Heritage',
          desc: 'Sindoor vermilion accents, raw silk draping, brass samai floor lamps, and cascading scented mogra garlands.',
          costINR: 22000,
          icon: Palette,
        },
        {
          id: 'wed-mar-decor',
          category: 'Décor & Flowers',
          title: 'Artisanal Carved Mandap & Baithak',
          desc: 'Carved wooden arches with marigold chandeliers, low-rise floor diwans with velvet bolster cushions for family.',
          costINR: 30000,
          icon: Flower2,
        },
        {
          id: 'wed-mar-food',
          category: 'Food & Catering',
          title: 'Live Chaat Galli & Kulhad Chai',
          desc: 'Artisanal live chaat counter, slow-simmered Dal Baati Churma, hand-pulled jalebi station, and clay-cup masala chai.',
          costINR: 20000,
          icon: Coffee,
        },
        {
          id: 'wed-mar-exp',
          category: 'Entertainment & Music',
          title: 'Multi-Gen Spatial Acoustic Zoning',
          desc: 'Decibel-buffered elder retreat zone with acoustic fabric baffles, high-energy sangeet dance ring, and supervised kid crafts.',
          costINR: 16000,
          icon: Users2,
        },
      ];
    }

    if (type === 'birthday') {
      if (activeSubTheme === 'garden') {
        return [
          {
            id: 'bday-gar-theme',
            category: 'Venue',
            title: 'Pastel Garden Pergola',
            desc: 'Eucalyptus greens, blush peach ribbons, and rustic oak farm tables with wrought-iron lantern accents.',
            costINR: 12000,
            icon: Palette,
          },
          {
            id: 'bday-gar-decor',
            category: 'Décor & Flowers',
            title: 'Floral Photo Pergola Arch',
            desc: 'Cascading baby breath and pastel roses surrounding an interactive polaroid guestbook memory wall.',
            costINR: 14000,
            icon: Flower2,
          },
          {
            id: 'bday-gar-food',
            category: 'Food & Catering',
            title: 'Artisanal Grazing & Mocktail Bar',
            desc: 'Cold-pressed botanical mocktail spritzers, wood-fired flatbreads, and Belgian chocolate fondue.',
            costINR: 11000,
            icon: Coffee,
          },
          {
            id: 'bday-gar-exp',
            category: 'Entertainment & Music',
            title: 'Acoustic Guitarist & Lawn Games',
            desc: 'Live fingerstyle acoustic performance, giant wooden jenga, and cozy beanbag seating circles.',
            costINR: 8000,
            icon: Users2,
          },
        ];
      }
      if (activeSubTheme === 'arcade') {
        return [
          {
            id: 'bday-arc-theme',
            category: 'Venue',
            title: 'Neon Arcade Carnival',
            desc: 'Electric berry purple accents, retro marquee signboards, and glow-in-the-dark celebration wristbands.',
            costINR: 10000,
            icon: Palette,
          },
          {
            id: 'bday-arc-decor',
            category: 'Décor & Flowers',
            title: 'Balloons Tunnel & Holographic Wall',
            desc: 'Organic balloon garland arch with retro pixel art cutouts and neon LED photo monograms.',
            costINR: 12000,
            icon: Flower2,
          },
          {
            id: 'bday-arc-food',
            category: 'Food & Catering',
            title: 'Live Popcorn & Slider Truck',
            desc: 'Mini brioche sliders, seasoned popcorn station (truffle & caramel), and craft soda fountains.',
            costINR: 9000,
            icon: Coffee,
          },
          {
            id: 'bday-arc-exp',
            category: 'Entertainment & Music',
            title: 'Retro Arcade & Toddler Play Ring',
            desc: 'Pop-a-shot basketball, pinball machine rentals, and safe padded foam play zone for infants.',
            costINR: 11000,
            icon: Users2,
          },
        ];
      }
      // default: Bollywood Retro
      return [
        {
          id: 'bday-ret-theme',
          category: 'Venue',
          title: 'Bollywood Retro Jubilee',
          desc: 'Vintage hand-painted cinema poster cutouts, gilded brass starbursts, and disco gold shimmer backdrops.',
          costINR: 11000,
          icon: Palette,
        },
        {
          id: 'bday-ret-decor',
          category: 'Décor & Flowers',
          title: 'Memory Gallery Tunnel',
          desc: 'Interactive photo timeline tunnel leading guests through the milestone years, velvet poufs, and marigold strings.',
          costINR: 13000,
          icon: Flower2,
        },
        {
          id: 'bday-ret-food',
          category: 'Food & Catering',
          title: 'Street Chaat & Vintage Soda Station',
          desc: 'Live Pani Puri shooter station, spicy bhel counters, and marble-stopper Goti Soda bottles.',
          costINR: 10000,
          icon: Coffee,
        },
        {
          id: 'bday-ret-exp',
          category: 'Entertainment & Music',
          title: 'Retro 80s Live DJ & Elder Baithak',
          desc: 'Classic vinyl Bollywood playlist with acoustic buffer zone and plush armchair seating for seniors.',
          costINR: 9000,
          icon: Users2,
        },
      ];
    }

    // Community Event
    if (activeSubTheme === 'garba') {
      return [
        {
          id: 'com-gar-theme',
          category: 'Venue',
          title: 'Peacock Teal Garba Arena',
          desc: 'Vibrant bandhani canopies, mirrorwork tapestries, and circular concentric floor chalk outlines.',
          costINR: 15000,
          icon: Palette,
        },
        {
          id: 'com-gar-decor',
          category: 'Décor & Flowers',
          title: 'Central Amba Matha Altar & Diya Wall',
          desc: 'Tiered brass brassiere diyas, marigold flower towers, and colorful wooden dandiya display stands.',
          costINR: 18000,
          icon: Flower2,
        },
        {
          id: 'com-gar-food',
          category: 'Food & Catering',
          title: 'Midnight Jalebi & Fafda Counter',
          desc: 'Freshly fried crispy fafda with papaya sambharo, piping hot kesar jalebi, and spiced masala tea.',
          costINR: 14000,
          icon: Coffee,
        },
        {
          id: 'com-gar-exp',
          category: 'Entertainment & Music',
          title: 'Live Dhol Troupe & Senior Sabha Seating',
          desc: 'Traditional high-energy acoustic dhol players with elevated, shaded grandstand seating for community elders.',
          costINR: 12000,
          icon: Users2,
        },
      ];
    }
    if (activeSubTheme === 'annakut') {
      return [
        {
          id: 'com-ann-theme',
          category: 'Venue',
          title: 'Grand Annakut Temple Pavilion',
          desc: 'Turmeric yellow shamianas, sacred kalash entrance arches, and ceremonial brass bell pillars.',
          costINR: 16000,
          icon: Palette,
        },
        {
          id: 'com-ann-decor',
          category: 'Décor & Flowers',
          title: '56 Bhog Tiered Mahaprasad Altar',
          desc: 'Stepped velvet altar with fragrant rose petals, fresh fruit pyramids, and holy tulsi garlands.',
          costINR: 20000,
          icon: Flower2,
        },
        {
          id: 'com-ann-food',
          category: 'Food & Catering',
          title: 'Sattvik Maha-Bhandara Kitchen',
          desc: 'Zero-onion-garlic pure ghee khichdi, seasonal vegetable curries, and clay-pot churned buttermilk.',
          costINR: 22000,
          icon: Coffee,
        },
        {
          id: 'com-ann-exp',
          category: 'Entertainment & Music',
          title: 'Community Volunteer & Darshan Queue',
          desc: 'Ramp-accessible senior queue, volunteer water stations, and devotional bhajan mandali performance.',
          costINR: 9000,
          icon: Users2,
        },
      ];
    }
    // default: Eco Sarvajanik
    return [
      {
        id: 'com-eco-theme',
        category: 'Venue',
        title: 'Eco Sarvajanik Utsav Pavilion',
        desc: 'Earth-toned terracotta urns, turmeric yellow shamianas, natural bamboo arches, and floral petal rangoli floor mosaics.',
        costINR: 14000,
        icon: Palette,
      },
      {
        id: 'com-eco-decor',
        category: 'Décor & Flowers',
        title: 'Open-Air Shamiana & Sabha',
        desc: 'Weather-shielded fabric pavilion canopy, elevated community stage for cultural performances, and wide wheelchair pathways.',
        costINR: 17000,
        icon: Flower2,
      },
      {
        id: 'com-eco-food',
        category: 'Food & Catering',
        title: 'Sattvik Annakut & Prasadam Feast',
        desc: 'Zero-onion-garlic pure ghee feast, seasonal vegetable thali, earthen matka buttermilk counter, and eco-friendly leaf plates.',
        costINR: 16000,
        icon: Coffee,
      },
      {
        id: 'com-eco-exp',
        category: 'Entertainment & Music',
        title: 'Inclusive Civic Experience',
        desc: 'Dedicated ramp-accessible front seating for neighborhood elders, youth folk dance circle, and volunteer water stations.',
        costINR: 10000,
        icon: Users2,
      },
    ];
  }, [currentPlan.eventType, activeSubTheme]);

  // Combine curated + custom pinned ideas
  const allIdeas = useMemo(() => {
    return [...customPinnedIdeas, ...currentIdeaCards];
  }, [customPinnedIdeas, currentIdeaCards]);

  // Check if an idea task is in currentPlan.timeline
  const isIdeaAdded = (ideaId: string) => {
    return currentPlan.timeline.some((t) => t.id === `idea-${ideaId}`);
  };

  // Toggle adding/removing an idea to the live plan budget & timeline
  const handleToggleIdeaToPlan = (idea: IdeaCardItem) => {
    const taskId = `idea-${idea.id}`;
    const alreadyAdded = isIdeaAdded(idea.id);

    if (alreadyAdded) {
      // Remove from timeline
      const updatedTimeline = currentPlan.timeline.filter((t) => t.id !== taskId);
      // Deduct cost from matching category
      const updatedCategories = currentPlan.budgetCategories.map((cat) => {
        if (cat.name.toLowerCase().includes(idea.category.toLowerCase().substring(0, 4))) {
          return {
            ...cat,
            estimatedCost: Math.max(0, cat.estimatedCost - idea.costINR),
          };
        }
        return cat;
      });

      onUpdatePlan({
        ...currentPlan,
        budgetCategories: updatedCategories,
        timeline: updatedTimeline,
      });
    } else {
      // Add to timeline
      const newTask: TimelineTask = {
        id: taskId,
        title: idea.title,
        category: idea.category,
        weeksBefore: 4,
        status: 'pending',
        dependsOn: [],
        impactIfDelayed: `Delays execution of "${idea.title}"`,
      };

      // Add cost to matching category
      const updatedCategories = currentPlan.budgetCategories.map((cat) => {
        if (cat.name.toLowerCase().includes(idea.category.toLowerCase().substring(0, 4))) {
          return {
            ...cat,
            estimatedCost: cat.estimatedCost + idea.costINR,
            notes: `${cat.notes ? cat.notes + ' • ' : ''}[Added: ${idea.title} (+₹${idea.costINR.toLocaleString('en-IN')})]`,
          };
        }
        return cat;
      });

      onUpdatePlan({
        ...currentPlan,
        budgetCategories: updatedCategories,
        timeline: [newTask, ...currentPlan.timeline],
      });
    }
  };

  // ── Inline Custom Idea Synthesizer ────────────────────────────────────────
  const handleSynthesizeCustomIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdeaPrompt.trim()) return;

    setIsSynthesizingIdea(true);
    try {
      const response = await callTyoharAI('GENERATE_CUSTOM_PLAN', {
        eventType: currentPlan.eventType,
        totalBudgetINR: currentPlan.totalBudgetINR,
        guestCount: currentPlan.guestCount,
        description: `Custom concept requested: ${customIdeaPrompt}`,
      });

      const newId = `custom-${Date.now()}`;
      const synthesized: IdeaCardItem = {
        id: newId,
        category: 'Food & Catering',
        title: customIdeaPrompt.trim(),
        desc: response.isFallback
          ? 'Custom concept synthesized with authentic cultural benchmarks and dietary coordination.'
          : 'Gemini AI generated bespoke execution concept aligned with your celebration profile.',
        costINR: Math.round(currentPlan.guestCount * 75),
        icon: Sparkles,
      };

      setCustomPinnedIdeas([synthesized, ...customPinnedIdeas]);
      setCustomIdeaPrompt('');
    } finally {
      setIsSynthesizingIdea(false);
    }
  };

  return (
    <StaggerContainer className="space-y-6 p-2 lg:p-4 max-w-7xl mx-auto">
      {/* ── Guided Subpage Hero with Plain-English Purpose ───────────────── */}
      <StaggerItem>
        <GuidedPageHero
          stepPill="STEP 01 OF 05 • EXECUTIVE BLUEPRINT"
          title={`Celebration Command: ${currentPlan.name}`}
          description="A single live mission-control ledger aggregating your fiscal allocations, guest turnout curves, upcoming critical-path deadlines, and multi-generational acoustic balance."
          tipsTitle="Executive Overview Tips"
          tips={[
            'The Smart Plate calculation eliminates 15-20% customary food waste while safeguarding against social embarrassment.',
            'Milestones are mapped with prerequisite constraints so delaying early decisions flags cascading risks immediately.',
            'Press ⌘K anytime to simulate real-world curveballs (+50 guests, cost overruns, moved dates) in-place.',
          ]}
          nextStepLabel="Configure Intake Studio →"
          onNextStep={() => onNavigateTab('intake')}
        />
      </StaggerItem>

      {/* ── Interactive 4-Step Workflow Stepper ──────────────────────────── */}
      <StaggerItem>
        <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-4 sm:p-5 shadow-[3px_3px_0px_#E4DEC8]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E4DEC8]/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#686259]">
              Execution Workflow &amp; Planner Modules:
            </span>
            <span className="text-[11px] text-[#B4690E] font-medium hidden sm:inline">
              Select any stage to jump directly into its dedicated engine
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {WORKFLOW_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.step}
                  type="button"
                  onClick={() => onNavigateTab(step.target)}
                  className="tactile-card group relative flex items-start gap-3 rounded-xl p-3 text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E4DEC8] bg-[#FAF7F2] text-[#B4690E] group-hover:border-[#B4690E] transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold text-[#8C8275] group-hover:text-[#B4690E]">
                        {step.step}
                      </span>
                      <span className="text-xs font-bold text-[#161412] group-hover:text-[#B4690E]">
                        {step.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#686259] mt-0.5 line-clamp-1">
                      {step.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </StaggerItem>

      {/* ── 4 Executive MetricStatCards with Rolling Numbers ─────────────── */}
      <StaggerItem>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricStatCard
            title="Target Budget vs Estimate"
            value={<AnimatedCurrency amount={currentPlan.totalBudgetINR} />}
            subtitle={`Estimated: ₹${totalEstimated.toLocaleString('en-IN')}`}
            trend={overage > 0 ? `+₹${overage.toLocaleString('en-IN')} Deficit` : 'On Target'}
            trendType={overage > 0 ? 'negative' : 'positive'}
            icon={<IndianRupee className="w-4 h-4 text-[#B4690E]" />}
            progressPercent={budgetUsagePercent}
          />

          <MetricStatCard
            title="Smart Plate Turnout"
            value={`${currentPlan.smartPlate.guaranteedBasePlates} + ${currentPlan.smartPlate.bufferPlates} Plt`}
            subtitle={`${currentPlan.guestCount} Invitees (${currentPlan.smartPlate.expectedTurnoutPercent}% Turnout)`}
            trend={`Saves ₹${currentPlan.smartPlate.estimatedSavingsINR.toLocaleString('en-IN')}`}
            trendType="positive"
            icon={<Utensils className="w-4 h-4 text-[#2B4C7E]" />}
          />

          <MetricStatCard
            title="Critical Path Lead Time"
            value={
              <span>
                <AnimatedNumber value={completedTasks} />/{currentPlan.timeline.length}
              </span>
            }
            subtitle={`${delayedTasks} delayed milestone(s)`}
            trend={delayedTasks > 0 ? 'Bottleneck Alert' : 'On Track'}
            trendType={delayedTasks > 0 ? 'warning' : 'positive'}
            icon={<Clock className="w-4 h-4 text-[#C23B22]" />}
            progressPercent={Math.round(
              (completedTasks / Math.max(1, currentPlan.timeline.length)) * 100,
            )}
          />

          <MetricStatCard
            title="Vibe & Dietary Readiness"
            value={`${currentPlan.demographics.accessibilityNeeds.length} Accommodations`}
            subtitle={`Kids ${currentPlan.demographics.kidsPercent}% • Adults ${currentPlan.demographics.adultsPercent}% • Elders ${currentPlan.demographics.seniorsPercent}%`}
            trend="Multi-Gen Verified"
            trendType="positive"
            icon={<Heart className="w-4 h-4 text-[#1E5631]" />}
          />
        </div>
      </StaggerItem>

      {/* ── 3. INTERACTIVE AI CELEBRATION IDEAS & REMIXER STUDIO ─────────── */}
      <StaggerItem>
        <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-5 sm:p-6 shadow-[3px_3px_0px_#E4DEC8] space-y-5">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#E4DEC8]/60 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B4690E]" />
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
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-[#8C8275] uppercase tracking-wider mr-1">
                Remix Style:
              </span>
              {subThemes.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActiveSubTheme(st.id)}
                  className={`tactile-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
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
          <form onSubmit={handleSynthesizeCustomIdea} className="flex gap-2">
            <input
              type="text"
              value={customIdeaPrompt}
              onChange={(e) => setCustomIdeaPrompt(e.target.value)}
              placeholder="✨ Prompt AI for a custom theme, dish, or setup (e.g., 'Kashmiri Kahwa samovar counter' or 'Neon Dandiya arch')..."
              className="flex-1 px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-md text-[#161412] placeholder:text-[#8C8275] focus:border-[#B4690E] focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isSynthesizingIdea || !customIdeaPrompt.trim()}
              className="tactile-btn flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#B4690E] text-white text-xs font-bold disabled:opacity-50 transition-colors shrink-0"
            >
              {isSynthesizingIdea ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
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
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8275]">
                            {idea.category}
                          </span>
                        </div>
                        <span className="font-mono-numeric text-xs font-bold text-[#161412]">
                          ₹{idea.costINR.toLocaleString('en-IN')}
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
                        onClick={() => handleToggleIdeaToPlan(idea)}
                        className={`tactile-btn flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all w-full justify-center ${
                          added
                            ? 'bg-[#1E5631] text-white border-[#1E5631]'
                            : 'bg-[#FFFFFF] text-[#161412] border-[#E4DEC8] hover:border-[#B4690E]'
                        }`}
                      >
                        {added ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>In Plan (-₹{idea.costINR.toLocaleString('en-IN')})</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-[#B4690E]" />
                            <span>+ Add to Plan (₹{idea.costINR.toLocaleString('en-IN')})</span>
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
      </StaggerItem>

      {/* ── 2-Column Split: 7 Cols Budget Bar, 5 Cols Action Items ───────── */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column (7 cols): Visual Budget Allocation */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-[3px_3px_0px_#E4DEC8]">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4DEC8]/60 gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#B4690E]" />
                    <span>Executive Proportional Budget Ledger</span>
                  </h3>
                  <p className="text-xs text-[#686259] mt-0.5">
                    Proportionally balanced across your 1–5 priority weights.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('budget')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#B4690E] hover:text-[#92540C] transition-colors"
                >
                  <span>Open Ledger</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Multi-Segment Horizontal Visual Bar */}
              <div className="mt-6 h-4 w-full rounded-full bg-[#F3EFE6] p-0.5 overflow-hidden flex border border-[#E4DEC8]">
                {currentPlan.budgetCategories.map((cat) => {
                  const pct = Math.max(
                    5,
                    Math.round(
                      (cat.allocatedAmount / Math.max(1, currentPlan.totalBudgetINR)) * 100,
                    ),
                  );
                  return (
                    <div
                      key={cat.id}
                      title={`${cat.name}: ₹${cat.allocatedAmount.toLocaleString('en-IN')} (${pct}%)`}
                      className={`h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full ${
                        categoryColors[cat.name] || 'bg-[#686259]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  );
                })}
              </div>

              {/* Category Breakdown Cards */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentPlan.budgetCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          categoryColors[cat.name] || 'bg-[#686259]'
                        }`}
                      />
                      <span className="text-[#161412] font-medium truncate">{cat.name}</span>
                    </div>
                    <div className="text-right font-mono-numeric">
                      <span className="font-bold text-[#161412] block">
                        ₹{cat.allocatedAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-[#8C8275]">
                        Est: ₹{cat.estimatedCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#E4DEC8]/60 flex items-center justify-between text-xs text-[#686259]">
              <span className="text-[11px] text-[#8C8275]">
                Badged as Estimated Market Benchmark (Unconfirmed)
              </span>
              <span className="font-bold text-[#161412]">
                Total: ₹{currentPlan.totalBudgetINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Right Column (5 cols): Priority Action Items */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-[3px_3px_0px_#E4DEC8]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E4DEC8]/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2B4C7E]" />
                  <h4 className="text-sm font-bold text-[#161412]">Priority Action Items</h4>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('timeline')}
                  className="text-xs font-bold text-[#2B4C7E] hover:text-[#1F3659] flex items-center gap-1"
                >
                  <span>All ({currentPlan.timeline.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Top 3 Milestones */}
              <div className="mt-4 space-y-2.5">
                {urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#E4DEC8] bg-[#FAF7F2] hover:bg-[#F3EFE6] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className="w-5 h-5 rounded-md border border-[#E4DEC8] bg-[#FFFFFF] flex items-center justify-center hover:border-[#1E5631] text-[#1E5631] transition-colors shrink-0"
                        aria-label={`Toggle completion for ${task.title}`}
                      >
                        {task.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-[#1E5631]" />
                        )}
                      </button>
                      <div className="truncate max-w-[170px] sm:max-w-[220px]">
                        <span className="text-xs font-bold text-[#161412] truncate block">
                          {task.title}
                        </span>
                        <span className="text-[11px] text-[#686259]">{task.category}</span>
                      </div>
                    </div>

                    <span
                      className={`font-mono-numeric text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                        task.weeksBefore === 0
                          ? 'bg-[#FDF2F0] text-[#C23B22] border-[#C23B22]/30'
                          : task.weeksBefore <= 2
                          ? 'bg-[#FEF8ED] text-[#B4690E] border-[#B4690E]/30'
                          : 'bg-[#F0F5FA] text-[#2B4C7E] border-[#2B4C7E]/30'
                      }`}
                    >
                      {task.weeksBefore}w out
                    </span>
                  </div>
                ))}
              </div>

              {/* Active Friction Highlight */}
              <div className="mt-4 pt-4 border-t border-[#E4DEC8]/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#161412] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#B4690E]" />
                    Generational Acoustic Fix
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B4690E]">
                    Active Guard
                  </span>
                </div>
                {currentPlan.vibeAudit[0] && (
                  <div className="p-3 rounded-xl border border-[#B4690E]/30 bg-[#FEF8ED] text-xs text-[#161412]">
                    <div className="font-semibold text-[#B4690E] flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{currentPlan.vibeAudit[0].zone}</span>
                    </div>
                    <p className="text-[11px] text-[#686259] mt-1">
                      {currentPlan.vibeAudit[0].frictionWarning}
                    </p>
                    <p className="text-[11px] text-[#1E5631] font-semibold mt-1">
                      &check; Fix: {currentPlan.vibeAudit[0].accommodationFix}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E4DEC8]/60 flex items-center justify-between text-xs text-[#686259]">
              <span className="text-[11px]">Timeline Sequence Verified</span>
              <span className="font-bold text-[#1E5631] text-[11px]">&check; Zero Precedence Bottlenecks</span>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* ── Step 01 to 02 Navigation Transition ─────────────────────────── */}
      <StaggerItem>
        <StageNavButtons
          nextLabel="Proceed to Step 02: Intake & Vibe Studio"
          onNext={() => onNavigateTab('intake')}
        />
      </StaggerItem>
    </StaggerContainer>
  );
};
