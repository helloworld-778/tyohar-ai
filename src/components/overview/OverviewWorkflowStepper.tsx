/**
 * @file OverviewWorkflowStepper.tsx
 * @description Interactive 4-step execution workflow stepper linking directly to the dedicated
 * planning engines (Intake Studio, Budget Ledger, Vendor & Smart Plates, and Critical Path Timeline).
 */

import React from 'react';
import { Sliders, DollarSign, Utensils, Calendar } from 'lucide-react';

interface OverviewWorkflowStepperProps {
  onNavigateTab: (tab: 'intake' | 'budget' | 'vendor' | 'timeline') => void;
}

export const OverviewWorkflowStepper: React.FC<OverviewWorkflowStepperProps> = ({
  onNavigateTab,
}) => {
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

  return (
    <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-4 sm:p-5 shadow-[3px_3px_0px_#E4DEC8]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E4DEC8]/60">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#686259]">
          Execution Workflow &amp; Planner Modules:
        </span>
        <span className="text-[11px] text-[#B4690E] font-medium hidden sm:inline">
          Select any stage to jump directly into its dedicated engine
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="group" aria-label="Planner Workflow Steps">
        {WORKFLOW_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <button
              key={step.step}
              type="button"
              onClick={() => onNavigateTab(step.target)}
              aria-label={`Jump to stage ${step.step}: ${step.title}`}
              className="tactile-card group relative flex items-start gap-3 rounded-xl p-3 text-left cursor-pointer"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E4DEC8] bg-[#FAF7F2] text-[#B4690E] group-hover:border-[#B4690E] transition-colors">
                <Icon className="h-4 w-4" aria-hidden="true" />
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
  );
};

