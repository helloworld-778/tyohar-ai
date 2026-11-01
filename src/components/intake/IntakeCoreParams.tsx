/**
 * @file IntakeCoreParams.tsx
 * @description Core parameters card capturing celebration title, event type, cuisine style,
 * guest headcount, total budget ceiling, and aesthetic vision notes.
 */

import React from 'react';
import { Calendar } from 'lucide-react';
import type { EventType } from '../../types/tyohar';
import { INPUT_LIMITS, BUDGET_NUDGE_STEP_INR } from '../../constants/config';

interface IntakeCoreParamsProps {
  name: string;
  eventType: EventType;
  selectedFoodType: string;
  guestCount: number;
  totalBudgetINR: number;
  visionNotes: string;
  onUpdateName: (name: string) => void;
  onUpdateEventType: (type: EventType) => void;
  onUpdateFoodType: (food: string) => void;
  onUpdateGuestCount: (count: number) => void;
  onUpdateBudget: (budget: number) => void;
  onUpdateVisionNotes: (notes: string) => void;
}

export const IntakeCoreParams: React.FC<IntakeCoreParamsProps> = ({
  name,
  eventType,
  selectedFoodType,
  guestCount,
  totalBudgetINR,
  visionNotes,
  onUpdateName,
  onUpdateEventType,
  onUpdateFoodType,
  onUpdateGuestCount,
  onUpdateBudget,
  onUpdateVisionNotes,
}) => {
  return (
    <div className="rounded-2xl border border-[#E4DEC8] bg-[#FFFFFF] p-6 shadow-xs space-y-5">
      <div className="border-b border-[#E4DEC8]/60 pb-4">
        <h3 className="text-base font-bold text-[#161412] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#B4690E]" aria-hidden="true" />
          <span>Celebration Details</span>
        </h3>
        <p className="text-xs text-[#686259] mt-0.5">
          General scale and timeline parameters.
        </p>
      </div>

      {/* Event Title */}
      <div>
        <label htmlFor="intake-event-title" className="block text-xs font-bold text-[#161412] mb-1.5">
          Event Title
        </label>
        <input
          id="intake-event-title"
          type="text"
          value={name}
          onChange={(e) => onUpdateName(e.target.value)}
          className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] focus:border-[#B4690E] focus:outline-hidden"
        />
      </div>

      {/* Event Type & Cuisine Preference */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="intake-event-type" className="block text-xs font-bold text-[#161412] mb-1.5">
            Celebration Type
          </label>
          <select
            id="intake-event-type"
            value={eventType}
            onChange={(e) => onUpdateEventType(e.target.value as EventType)}
            className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] focus:border-[#B4690E] focus:outline-hidden"
          >
            <option value="wedding">Vivah (Wedding)</option>
            <option value="community">Community Utsav</option>
            <option value="birthday">Milestone Birthday</option>
          </select>
        </div>

        <div>
          <label htmlFor="intake-food-style" className="block text-xs font-bold text-[#161412] mb-1.5">
            Food Style
          </label>
          <select
            id="intake-food-style"
            value={selectedFoodType}
            onChange={(e) => onUpdateFoodType(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] focus:border-[#B4690E] focus:outline-hidden"
          >
            <option value="Vegetarian">Pure Vegetarian</option>
            <option value="Jain-Satvik">Jain / Satvik Focus</option>
            <option value="Non-Veg">Veg + Non-Veg Counters</option>
            <option value="Multi-Cuisine">Multi-Cuisine Regional</option>
          </select>
        </div>
      </div>

      {/* Guest Count & Budget (INR) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="intake-guest-count" className="block text-xs font-bold text-[#161412] mb-1.5">
            Invited Guests
          </label>
          <input
            id="intake-guest-count"
            type="number"
            min={INPUT_LIMITS.MIN_GUEST_COUNT}
            max={INPUT_LIMITS.MAX_GUEST_COUNT}
            value={guestCount}
            onChange={(e) => {
              const count = Math.max(INPUT_LIMITS.MIN_GUEST_COUNT, parseInt(e.target.value, 10) || INPUT_LIMITS.MIN_GUEST_COUNT);
              onUpdateGuestCount(count);
            }}
            className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] font-mono-numeric focus:border-[#B4690E] focus:outline-hidden"
          />
        </div>

        <div>
          <label htmlFor="intake-total-budget" className="block text-xs font-bold text-[#161412] mb-1.5">
            Total Budget (INR)
          </label>
          <input
            id="intake-total-budget"
            type="number"
            step={BUDGET_NUDGE_STEP_INR}
            min={INPUT_LIMITS.MIN_BUDGET_INR}
            value={totalBudgetINR}
            onChange={(e) => {
              const budget = Math.max(INPUT_LIMITS.MIN_BUDGET_INR, parseInt(e.target.value, 10) || INPUT_LIMITS.MIN_BUDGET_INR);
              onUpdateBudget(budget);
            }}
            className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] font-mono-numeric focus:border-[#B4690E] focus:outline-hidden"
          />
        </div>
      </div>

      <div>
        <label htmlFor="intake-vision-notes" className="block text-xs font-bold text-[#161412] mb-1.5">
          Vision &amp; Aesthetic Notes
        </label>
        <textarea
          id="intake-vision-notes"
          rows={3}
          value={visionNotes}
          onChange={(e) => onUpdateVisionNotes(e.target.value)}
          placeholder="e.g. Traditional Marwari wedding with rich musical night..."
          className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-xl text-[#161412] placeholder:text-[#8C8275] focus:border-[#B4690E] focus:outline-hidden"
        />
      </div>
    </div>
  );
};

