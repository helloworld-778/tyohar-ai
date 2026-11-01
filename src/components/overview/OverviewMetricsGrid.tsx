/**
 * @file OverviewMetricsGrid.tsx
 * @description 4 Executive KPI stat cards summarizing Budget Target vs Estimate,
 * Smart Plate Headcount Turnout, Critical Path Milestones, and Demographic Balance.
 */

import React from 'react';
import { IndianRupee, Utensils, Clock, Heart } from 'lucide-react';
import type { EventPlan } from '../../types/tyohar';
import { MetricStatCard, AnimatedCurrency, AnimatedNumber } from '../ui/Primitives';
import { formatINR } from '../../utils/formatters';

interface OverviewMetricsGridProps {
  currentPlan: EventPlan;
  totalEstimated: number;
  overage: number;
  budgetUsagePercent: number;
  completedTasks: number;
  delayedTasks: number;
}

export const OverviewMetricsGrid: React.FC<OverviewMetricsGridProps> = ({
  currentPlan,
  totalEstimated,
  overage,
  budgetUsagePercent,
  completedTasks,
  delayedTasks,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricStatCard
        title="Target Budget vs Estimate"
        value={<AnimatedCurrency amount={currentPlan.totalBudgetINR} />}
        subtitle={`Estimated: ${formatINR(totalEstimated)}`}
        trend={overage > 0 ? `+${formatINR(overage)} Deficit` : 'On Target'}
        trendType={overage > 0 ? 'negative' : 'positive'}
        icon={<IndianRupee className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />}
        progressPercent={budgetUsagePercent}
      />

      <MetricStatCard
        title="Smart Plate Turnout"
        value={`${currentPlan.smartPlate.guaranteedBasePlates} + ${currentPlan.smartPlate.bufferPlates} Plt`}
        subtitle={`${currentPlan.guestCount} Invitees (${currentPlan.smartPlate.expectedTurnoutPercent}% Turnout)`}
        trend={`Saves ${formatINR(currentPlan.smartPlate.estimatedSavingsINR)}`}
        trendType="positive"
        icon={<Utensils className="w-4 h-4 text-[#2B4C7E]" aria-hidden="true" />}
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
        icon={<Clock className="w-4 h-4 text-[#C23B22]" aria-hidden="true" />}
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
        icon={<Heart className="w-4 h-4 text-[#1E5631]" aria-hidden="true" />}
      />
    </div>
  );
};

