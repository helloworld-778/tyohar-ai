import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export { EventBackdrop } from './EventBackdrop';

// ─────────────────────────────────────────────────────────────────────────────
// 1. SpotlightCard -> Architectural Ledger Card
// Clean, flat, grounded white paper card with exposed 1px hairline border
// ─────────────────────────────────────────────────────────────────────────────

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string; // Kept for backwards compatibility
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'tactile-card relative rounded-lg p-6',
        className,
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. BentoCard -> Editorial Ledger Feature Block
// ─────────────────────────────────────────────────────────────────────────────

interface BentoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  metric?: string;
  metricLabel?: string;
  className?: string;
  children?: React.ReactNode;
  gradient?: 'amber' | 'rose' | 'indigo' | 'emerald';
}

export const BentoCard: React.FC<BentoCardProps> = ({
  icon,
  title,
  description,
  badge,
  metric,
  metricLabel,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'tactile-card group relative flex flex-col justify-between overflow-hidden rounded-lg p-6',
        className,
      )}
    >
      {/* Top Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#E4DEC8] bg-[#F3EFE6] text-[#161412]">
            {icon}
          </div>
          {badge && (
            <span className="rounded-sm border border-[#E4DEC8] bg-[#F3EFE6] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#686259]">
              {badge}
            </span>
          )}
        </div>

        <h3 className="font-serif-heading mt-4 text-lg font-bold text-[#161412]">
          {title}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-[#686259]">{description}</p>
      </div>

      {/* Center Metric Callout if present */}
      {metric && (
        <div className="relative z-10 my-4 rounded-md border border-[#E4DEC8] bg-[#FAF7F2] p-3">
          <div className="font-mono-numeric text-2xl font-bold text-[#161412]">{metric}</div>
          {metricLabel && (
            <div className="text-[11px] font-medium text-[#686259] mt-0.5">{metricLabel}</div>
          )}
        </div>
      )}

      {/* Slot Content */}
      {children && <div className="relative z-10 mt-3">{children}</div>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. AnimatedTabs (Solid Architectural Pill Tabs)
// ─────────────────────────────────────────────────────────────────────────────

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-[#E4DEC8] bg-[#F3EFE6] p-1',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 rounded-sm px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 focus:outline-hidden',
              isActive ? 'text-[#FAF7F2]' : 'text-[#686259] hover:text-[#161412]',
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 rounded-sm bg-[#161412] shadow-xs"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'rounded-sm px-1.5 py-0.2 text-[10px] font-bold',
                    isActive
                      ? 'bg-[#B4690E] text-white'
                      : 'bg-[#E4DEC8] text-[#161412]',
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. MetricStatCard (Executive Ledger KPI widget)
// ─────────────────────────────────────────────────────────────────────────────

interface MetricStatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'warning';
  icon: React.ReactNode;
  progressPercent?: number;
  className?: string;
}

export const MetricStatCard: React.FC<MetricStatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendType = 'neutral',
  icon,
  progressPercent,
  className,
}) => {
  const trendColor = {
    positive: 'bg-[#1E5631]/10 text-[#1E5631] border-[#1E5631]/30',
    negative: 'bg-[#C23B22]/10 text-[#C23B22] border-[#C23B22]/30',
    warning: 'bg-[#B4690E]/10 text-[#B4690E] border-[#B4690E]/30',
    neutral: 'bg-[#F3EFE6] text-[#686259] border-[#E4DEC8]',
  }[trendType];

  return (
    <div
      className={cn(
        'tactile-card relative overflow-hidden rounded-lg p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#686259]">
          {title}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E4DEC8] bg-[#F3EFE6] text-[#161412]">
          {icon}
        </div>
      </div>

      <div className="font-mono-numeric mt-2 text-2xl font-bold tracking-tight text-[#161412]">
        {value}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        {subtitle && <span className="text-xs text-[#686259]">{subtitle}</span>}
        {trend && (
          <span
            className={cn(
              'rounded-sm border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide',
              trendColor,
            )}
          >
            {trend}
          </span>
        )}
      </div>

      {progressPercent !== undefined && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#F3EFE6]">
          <div
            className="h-full rounded-full bg-[#B4690E] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. SlideOverDrawer (Accessible Modal Drawer)
// ─────────────────────────────────────────────────────────────────────────────

interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  darkLedger?: boolean;
}

export const SlideOverDrawer: React.FC<SlideOverDrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  size = 'md',
  darkLedger = false,
}) => {
  const widthClass = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
  }[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#161412]/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'relative z-10 w-full overflow-hidden rounded-lg p-6 shadow-2xl',
              darkLedger
                ? 'border border-white/10 bg-[#181512] text-[#FAF7F2]'
                : 'border border-[#E4DEC8] bg-[#FFFFFF] text-[#161412]',
              widthClass,
            )}
          >
            {/* Header */}
            <div
              className={cn(
                'flex items-center justify-between border-b pb-4',
                darkLedger ? 'border-white/10' : 'border-[#E4DEC8]',
              )}
            >
              <div className="flex items-center gap-3">
                {icon && (
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-md border',
                      darkLedger
                        ? 'border-white/10 bg-white/5 text-[#B4690E]'
                        : 'border-[#E4DEC8] bg-[#F3EFE6] text-[#B4690E]',
                    )}
                  >
                    {icon}
                  </div>
                )}
                <div>
                  <h3
                    className={cn(
                      'font-serif-heading text-lg font-bold',
                      darkLedger ? 'text-[#FAF7F2]' : 'text-[#161412]',
                    )}
                  >
                    {title}
                  </h3>
                  {description && (
                    <p
                      className={cn(
                        'text-xs mt-0.5',
                        darkLedger ? 'text-slate-400' : 'text-[#686259]',
                      )}
                    >
                      {description}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  darkLedger
                    ? 'text-slate-400 hover:bg-white/10 hover:text-white'
                    : 'text-[#686259] hover:bg-[#F3EFE6] hover:text-[#161412]',
                )}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="mt-4 max-h-[75vh] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. AnimatedNumber & AnimatedCurrency
// Smooth spring/interpolation for currency and numbers rolling up/down
// ─────────────────────────────────────────────────────────────────────────────

interface AnimatedNumberProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const startVal = prevValue.current;
    const endVal = value;
    const duration = 400; // ms

    if (startVal === endVal) {
      setDisplayValue(endVal);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startVal + (endVal - startVal) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        prevValue.current = endVal;
        setDisplayValue(endVal);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString('en-IN');

  return (
    <span className={cn('font-mono-numeric tracking-tight', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export const AnimatedCurrency: React.FC<{
  amount: number;
  className?: string;
}> = ({ amount, className }) => {
  return <AnimatedNumber value={amount} prefix="₹" className={className} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. StaggerContainer & StaggerItem
// ─────────────────────────────────────────────────────────────────────────────

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  staggerDelay = 0.04,
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="exit"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.25, ease: 'easeOut' },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. GuidedPageHero (Compact ~48px Editorial Banner with Popover Accordion)
// ─────────────────────────────────────────────────────────────────────────────

export interface GuidedPageHeroProps {
  stepPill: string;
  title: string;
  description: string;
  tipsTitle?: string;
  tips?: string[];
  nextStepLabel?: string;
  onNextStep?: () => void;
  badge?: React.ReactNode;
}

export const GuidedPageHero: React.FC<GuidedPageHeroProps> = ({
  stepPill,
  title,
  description,
  tipsTitle = 'How this works',
  tips = [],
  nextStepLabel,
  onNextStep,
  badge,
}) => {
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="relative mb-5 overflow-hidden rounded-lg border border-[#E4DEC8] bg-[#FFFFFF] p-3.5 sm:p-4 shadow-xs">
      <div className="flex flex-col justify-between gap-3.5 md:flex-row md:items-center">
        {/* Left: Heading + Step Pill + 1-Line Description */}
        <div className="max-w-3xl space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-serif-heading text-lg font-bold tracking-tight text-[#161412] sm:text-xl">
              {title}
            </h1>
            <span className="rounded-sm border border-[#E4DEC8] bg-[#F3EFE6] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#B4690E]">
              {stepPill}
            </span>
            {badge}
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-[#686259]">
            {description}
          </p>
        </div>

        {/* Right: Quick Tips Toggle & Next Step CTA */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {tips.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTips(!showTips)}
              aria-expanded={showTips}
              className="flex items-center gap-1.5 rounded-md border border-[#E4DEC8] bg-[#F3EFE6] px-3 py-1.5 text-xs font-semibold text-[#161412] transition-colors hover:border-[#B4690E]"
            >
              <Lightbulb className="h-3.5 w-3.5 text-[#B4690E]" />
              <span>{tipsTitle}</span>
              {showTips ? (
                <ChevronUp className="h-3 w-3 text-[#686259]" />
              ) : (
                <ChevronDown className="h-3 w-3 text-[#686259]" />
              )}
            </button>
          )}

          {nextStepLabel && onNextStep && (
            <button
              type="button"
              onClick={onNextStep}
              className="flex items-center gap-1.5 rounded-md bg-[#161412] px-3.5 py-1.5 text-xs font-bold text-[#FAF7F2] shadow-xs transition-colors hover:bg-[#24201C]"
            >
              <span>{nextStepLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Tips Accordion */}
      <AnimatePresence>
        {showTips && tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-3.5 rounded-md border border-[#E4DEC8] bg-[#F3EFE6] p-3.5 text-xs text-[#161412]">
              <div className="mb-2 font-bold uppercase tracking-wider text-[#B4690E] flex items-center gap-1.5 text-[11px]">
                <Lightbulb className="h-3.5 w-3.5 text-[#B4690E]" />
                <span>Key Insights for this Section</span>
              </div>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#B4690E] font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. JourneyBar (Horizontal 5-Stage Interactive Journey Bar)
// ─────────────────────────────────────────────────────────────────────────────

export interface JourneyBarProps {
  activeStage: 'overview' | 'intake' | 'budget' | 'vendor' | 'timeline';
  onSelectStage: (stage: 'overview' | 'intake' | 'budget' | 'vendor' | 'timeline') => void;
  badges?: {
    overview?: string;
    intake?: string;
    budget?: string;
    vendor?: string;
    timeline?: string;
  };
}

export const JourneyBar: React.FC<JourneyBarProps> = ({
  activeStage,
  onSelectStage,
  badges = {},
}) => {
  const STAGES = [
    { id: 'overview' as const, step: '01', label: 'Blueprint', short: 'Blueprint' },
    { id: 'intake' as const, step: '02', label: 'Intake & Vibe', short: 'Intake' },
    { id: 'budget' as const, step: '03', label: 'Budget Ledger', short: 'Budget' },
    { id: 'vendor' as const, step: '04', label: 'Vendors & Plates', short: 'Vendors' },
    { id: 'timeline' as const, step: '05', label: 'Timeline Graph', short: 'Timeline' },
  ];

  return (
    <div
      role="navigation"
      aria-label="5-Stage Execution Journey"
      className="relative z-10 mx-auto w-full max-w-7xl overflow-x-auto pb-1"
    >
      <div className="flex items-center justify-between gap-1.5 rounded-lg border border-[#E4DEC8] bg-[#FFFFFF] p-1.5 shadow-[2px_2px_0px_#E4DEC8]">
        {STAGES.map((stg) => {
          const isActive = activeStage === stg.id;
          const badge = badges[stg.id];

          return (
            <button
              key={stg.id}
              type="button"
              onClick={() => onSelectStage(stg.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-md px-2.5 py-2 text-xs font-bold transition-colors whitespace-nowrap min-w-[100px] ${
                isActive
                  ? 'text-[#FAF7F2]'
                  : 'text-[#686259] hover:text-[#161412] hover:bg-[#F3EFE6]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="journey-active-spring"
                  className="absolute inset-0 rounded-md bg-[#161412] shadow-xs"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
              <span className={`relative z-10 font-mono text-[11px] ${isActive ? 'text-[#B4690E]' : 'text-[#8C8275]'}`}>
                {stg.step}
              </span>
              <span className="relative z-10 hidden sm:inline">{stg.label}</span>
              <span className="relative z-10 sm:hidden">{stg.short}</span>

              {badge && (
                <span
                  className={`relative z-10 rounded-sm px-1.5 py-0.2 text-[10px] font-bold ${
                    badge.includes('Alert') || badge.includes('Deficit')
                      ? 'bg-[#C23B22] text-white'
                      : isActive
                      ? 'bg-[#B4690E] text-white'
                      : 'bg-[#F3EFE6] text-[#686259] border border-[#E4DEC8]'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. StageNavButtons (Tactile Next / Previous Stage Navigation)
// ─────────────────────────────────────────────────────────────────────────────

export interface StageNavButtonsProps {
  onPrev?: () => void;
  prevLabel?: string;
  onNext?: () => void;
  nextLabel?: string;
  className?: string;
}

export const StageNavButtons: React.FC<StageNavButtonsProps> = ({
  onPrev,
  prevLabel = 'Previous Stage',
  onNext,
  nextLabel = 'Next Stage',
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-between pt-6 border-t border-[#E4DEC8]/80 gap-4 ${className}`}
    >
      {onPrev ? (
        <button
          type="button"
          onClick={onPrev}
          className="tactile-btn flex items-center gap-2 rounded-md bg-[#FFFFFF] px-4 py-2.5 text-xs font-bold text-[#161412] hover:bg-[#FAF7F2]"
        >
          <span>←</span>
          <span>{prevLabel}</span>
        </button>
      ) : (
        <div />
      )}

      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="tactile-btn flex items-center gap-2 rounded-md bg-[#161412] px-5 py-2.5 text-xs font-bold text-[#FAF7F2] hover:bg-[#24201C]"
        >
          <span>{nextLabel}</span>
          <span>→</span>
        </button>
      )}
    </div>
  );
};

