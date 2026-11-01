/**
 * @file StudioSidebar.tsx
 * @description Collapsible left sidebar navigation in the Editorial Bahi-Khata theme,
 * housing the preset switcher, active event indicators, subpage tabs, and BYOK connectivity status.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  LayoutDashboard,
  Sliders,
  IndianRupee,
  Utensils,
  Clock,
  Download,
  Printer,
  RotateCcw,
} from 'lucide-react';
import type { EventPlan } from '../../types/tyohar';
import {
  PRESET_WEDDING,
  PRESET_COMMUNITY,
  PRESET_BIRTHDAY,
  ALL_PRESETS,
} from '../../data/presets';
import { BrandLogo } from '../ui/BrandLogo';

export type Subpage = 'overview' | 'intake' | 'budget' | 'vendor' | 'timeline';

interface StudioSidebarProps {
  currentPlan: EventPlan;
  activeSubpage: Subpage;
  setActiveSubpage: (subpage: Subpage) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  onNavigateLanding: () => void;
  onSelectPreset: (preset: EventPlan) => void;
  onResetToPresetDefault: () => void;
  onExportJSON: () => void;
  onPrint: () => void;
  hasApiKey: boolean;
  onOpenKeyModal: () => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  currentPlan,
  activeSubpage,
  setActiveSubpage,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  onNavigateLanding,
  onSelectPreset,
  onResetToPresetDefault,
  onExportJSON,
  onPrint,
  hasApiKey,
  onOpenKeyModal,
}) => {
  const totalEstimated = currentPlan.budgetCategories.reduce((sum, c) => sum + c.estimatedCost, 0);
  const isOverBudget = totalEstimated > currentPlan.totalBudgetINR;
  const delayedTasks = currentPlan.timeline.filter((t) => t.status === 'delayed').length;

  const navItems = [
    {
      id: 'overview' as Subpage,
      label: 'Overview & Blueprint',
      icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" />,
      badge: 'Executive',
    },
    {
      id: 'intake' as Subpage,
      label: 'Intake & Vibe Matrix',
      icon: <Sliders className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'budget' as Subpage,
      label: 'Budget & Trade-Offs',
      icon: <IndianRupee className="w-4 h-4" aria-hidden="true" />,
      badge: isOverBudget ? 'Deficit' : undefined,
    },
    {
      id: 'vendor' as Subpage,
      label: 'Vendor, Plates & RFQ',
      icon: <Utensils className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'timeline' as Subpage,
      label: 'Critical Path Timeline',
      icon: <Clock className="w-4 h-4" aria-hidden="true" />,
      badge: delayedTasks > 0 ? `${delayedTasks} Alert` : undefined,
    },
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#161412]/50 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Collapsible Left Sidebar */}
      <aside
        aria-label="Studio Navigation Sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col justify-between border-r border-[#E4DEC8] bg-[#F3EFE6] p-4 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Section */}
        <div className="space-y-5">
          {/* Logo & Back to Landing */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4DEC8]">
            <BrandLogo size="sm" subtitle="Planner Studio" />

            <button
              type="button"
              onClick={onNavigateLanding}
              aria-label="Return to Landing Page"
              title="Return to Landing Page"
              className="flex items-center gap-1 text-[11px] font-bold text-[#686259] hover:text-[#161412] rounded-md p-1 hover:bg-[#FFFFFF] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Home</span>
            </button>
          </div>

          {/* Active Event Switcher Card */}
          <div className="rounded-md border border-[#E4DEC8] bg-[#FFFFFF] p-3 text-xs space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#686259]">
                Active Event
              </span>
              <span className="px-2 py-0.5 rounded-sm bg-[#F3EFE6] text-[#B4690E] text-[11px] font-bold uppercase tracking-wider border border-[#E4DEC8]">
                {currentPlan.eventType}
              </span>
            </div>

            <h3 className="font-serif-heading font-bold text-[#161412] text-sm truncate">
              {currentPlan.name}
            </h3>

            {/* Preset Quick Dropdown */}
            <label htmlFor="sidebar-preset-select" className="sr-only">
              Select Celebration Preset Archetype
            </label>
            <select
              id="sidebar-preset-select"
              value={currentPlan.name}
              onChange={(e) => {
                const found = ALL_PRESETS.find((p) => p.name === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="w-full px-2 py-1.5 text-xs bg-[#FAF7F2] border border-[#E4DEC8] rounded-md text-[#161412] focus:border-[#B4690E] focus:outline-hidden"
            >
              <option value={PRESET_WEDDING.name}>Royal Vivah (₹8L)</option>
              <option value={PRESET_COMMUNITY.name}>Campus Utsav (₹50k)</option>
              <option value={PRESET_BIRTHDAY.name}>Family Jubilee (₹25k)</option>
            </select>

            {/* Quick 1-Click Vibe Switcher */}
            <div className="grid grid-cols-3 gap-1 pt-0.5" role="group" aria-label="Celebration Archetype Shortcuts">
              <button
                type="button"
                onClick={() => onSelectPreset(PRESET_WEDDING)}
                aria-label="Switch to Royal Vivah Wedding Preset"
                className={`py-1 text-[11px] font-bold rounded-sm border transition-colors ${
                  currentPlan.eventType === 'wedding'
                    ? 'bg-[#C23B22] text-white border-[#C23B22]'
                    : 'bg-[#FAF7F2] text-[#686259] border-[#E4DEC8] hover:text-[#161412]'
                }`}
              >
                Vivah
              </button>
              <button
                type="button"
                onClick={() => onSelectPreset(PRESET_BIRTHDAY)}
                aria-label="Switch to Milestone Birthday Jubilee Preset"
                className={`py-1 text-[11px] font-bold rounded-sm border transition-colors ${
                  currentPlan.eventType === 'birthday'
                    ? 'bg-[#B4690E] text-white border-[#B4690E]'
                    : 'bg-[#FAF7F2] text-[#686259] border-[#E4DEC8] hover:text-[#161412]'
                }`}
              >
                Jubilee
              </button>
              <button
                type="button"
                onClick={() => onSelectPreset(PRESET_COMMUNITY)}
                aria-label="Switch to Campus Community Utsav Preset"
                className={`py-1 text-[11px] font-bold rounded-sm border transition-colors ${
                  currentPlan.eventType === 'community'
                    ? 'bg-[#1E5631] text-white border-[#1E5631]'
                    : 'bg-[#FAF7F2] text-[#686259] border-[#E4DEC8] hover:text-[#161412]'
                }`}
              >
                Utsav
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#E4DEC8]">
              <button
                type="button"
                onClick={onResetToPresetDefault}
                aria-label="Reset active celebration plan to preset baseline defaults"
                className="text-[11px] text-[#686259] hover:text-[#B4690E] flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>Reset to Preset Default</span>
              </button>
            </div>
          </div>

          {/* 5 Dedicated Subpage Navigation Links */}
          <nav aria-label="Studio Subpage Navigation" className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeSubpage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSubpage(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'text-[#FAF7F2]'
                      : 'text-[#686259] hover:text-[#161412] hover:bg-[#FFFFFF]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-pill"
                      className="absolute inset-0 rounded-md bg-[#161412] shadow-xs"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.28 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#B4690E]' : 'text-[#686259]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`relative z-10 rounded-sm px-2 py-0.5 text-[10px] font-bold ${
                        item.badge.includes('Deficit') || item.badge.includes('Alert')
                          ? 'bg-[#C23B22]/15 text-[#C23B22] border border-[#C23B22]/30'
                          : isActive
                          ? 'bg-[#B4690E] text-white'
                          : 'bg-[#E4DEC8] text-[#161412]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-[#E4DEC8]">
          {/* AI Connection Status Pill */}
          <div className="flex items-center justify-between rounded-md bg-[#FFFFFF] px-3 py-2 text-[11px] border border-[#E4DEC8] shadow-xs">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  hasApiKey ? 'bg-[#1E5631] animate-pulse' : 'bg-[#B4690E]'
                }`}
                aria-hidden="true"
              />
              <span className="font-medium text-[#161412]">
                {hasApiKey ? 'BYOK Connected' : 'Deterministic Ready'}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenKeyModal}
              aria-label="Configure Gemini AI Studio API Key"
              className="text-[11px] font-bold text-[#B4690E] hover:underline"
            >
              Edit Key
            </button>
          </div>

          {/* Utility Buttons */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={onExportJSON}
              aria-label="Export active celebration plan as JSON"
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-[#E4DEC8] bg-[#FFFFFF] text-[#161412] hover:border-[#B4690E] transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              aria-label="Print execution brief"
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-[#E4DEC8] bg-[#FFFFFF] text-[#161412] hover:border-[#B4690E] transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

