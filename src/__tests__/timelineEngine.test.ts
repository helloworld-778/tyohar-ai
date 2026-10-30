import { describe, it, expect } from 'vitest';
import {
  sortTasksByCriticalPath,
  getDownstreamBlockedTasks,
  compressTimelineForEarlierDate,
} from '../utils/timelineEngine';
import type { TimelineTask } from '../types/tyohar';

describe('Deterministic Timeline & Critical Path Engine', () => {
  describe('sortTasksByCriticalPath', () => {
    it('sorts tasks topologically by prerequisites and chronologically by weeksBefore descending', () => {
      const tasks: TimelineTask[] = [
        {
          id: 'task-layout',
          title: 'Final Catering Layout',
          category: 'Food & Catering',
          weeksBefore: 3,
          status: 'pending',
          dependsOn: ['task-tasting'],
          impactIfDelayed: 'Caterer cannot finalize live counter positioning.',
        },
        {
          id: 'task-venue',
          title: 'Lock Venue Booking',
          category: 'Venue',
          weeksBefore: 16,
          status: 'pending',
          dependsOn: [],
          impactIfDelayed: 'All downstream event planning blocked.',
        },
        {
          id: 'task-tasting',
          title: 'Menu Tasting & Selection',
          category: 'Food & Catering',
          weeksBefore: 8,
          status: 'pending',
          dependsOn: ['task-venue'],
          impactIfDelayed: 'Chef menu preps delayed.',
        },
        {
          id: 'task-decor',
          title: 'Decor Blueprint & Fabric Selection',
          category: 'Décor & Flowers',
          weeksBefore: 10,
          status: 'pending',
          dependsOn: ['task-venue'],
          impactIfDelayed: 'Fabrication lead times missed.',
        },
      ];

      const sorted = sortTasksByCriticalPath(tasks);
      const sortedIds = sorted.map((t) => t.id);

      // Venue Booking (root, 16w) must come first
      expect(sortedIds[0]).toBe('task-venue');

      // Menu Tasting depends on Venue -> must come after Venue
      expect(sortedIds.indexOf('task-tasting')).toBeGreaterThan(sortedIds.indexOf('task-venue'));

      // Decor depends on Venue -> must come after Venue
      expect(sortedIds.indexOf('task-decor')).toBeGreaterThan(sortedIds.indexOf('task-venue'));

      // Final Catering Layout depends on Menu Tasting -> must come after Menu Tasting
      expect(sortedIds.indexOf('task-layout')).toBeGreaterThan(sortedIds.indexOf('task-tasting'));
    });

    it('orders independent tasks with same in-degree by weeksBefore descending', () => {
      const tasks: TimelineTask[] = [
        { id: 't-short', title: 'Task Short Lead', category: 'General', weeksBefore: 2, status: 'pending', dependsOn: [], impactIfDelayed: '' },
        { id: 't-long', title: 'Task Long Lead', category: 'General', weeksBefore: 12, status: 'pending', dependsOn: [], impactIfDelayed: '' },
        { id: 't-mid', title: 'Task Mid Lead', category: 'General', weeksBefore: 6, status: 'pending', dependsOn: [], impactIfDelayed: '' },
      ];

      const sorted = sortTasksByCriticalPath(tasks);
      expect(sorted.map((t) => t.id)).toEqual(['t-long', 't-mid', 't-short']);
    });

    it('survives circular dependency graphs gracefully without infinite looping or throwing', () => {
      const cyclicTasks: TimelineTask[] = [
        { id: 'c1', title: 'Cycle 1', category: 'A', weeksBefore: 6, status: 'pending', dependsOn: ['c2'], impactIfDelayed: '' },
        { id: 'c2', title: 'Cycle 2', category: 'B', weeksBefore: 4, status: 'pending', dependsOn: ['c1'], impactIfDelayed: '' },
      ];

      expect(() => sortTasksByCriticalPath(cyclicTasks)).not.toThrow();
      const result = sortTasksByCriticalPath(cyclicTasks);
      expect(result.length).toBe(2);
    });
  });

  describe('getDownstreamBlockedTasks', () => {
    it('verifies that delaying a root task (Venue Booking) flags all multi-tier downstream tasks (Decor Blueprint, Menu Tasting, Final Catering Layout)', () => {
      const weddingTimeline: TimelineTask[] = [
        { id: 'venue-booking', title: 'Lock Venue Booking', category: 'Venue', weeksBefore: 16, status: 'delayed', dependsOn: [], impactIfDelayed: 'Blocks everything' },
        { id: 'decor-blueprint', title: 'Decor Blueprint & Theme', category: 'Décor & Flowers', weeksBefore: 12, status: 'pending', dependsOn: ['venue-booking'], impactIfDelayed: 'Cannot order structures' },
        { id: 'menu-tasting', title: 'Menu Tasting & Chef Contract', category: 'Food & Catering', weeksBefore: 10, status: 'pending', dependsOn: ['venue-booking'], impactIfDelayed: 'Food tasting blocked' },
        { id: 'catering-layout', title: 'Final Catering Layout', category: 'Food & Catering', weeksBefore: 4, status: 'pending', dependsOn: ['menu-tasting'], impactIfDelayed: 'Counter layout blocked' },
        { id: 'photo-prewedding', title: 'Pre-Wedding Photo Shoot', category: 'Photography & Video', weeksBefore: 6, status: 'pending', dependsOn: [], impactIfDelayed: 'Independent shoot' },
      ];

      // Delaying venue-booking
      const blocked = getDownstreamBlockedTasks(weddingTimeline, 'venue-booking');
      const blockedIds = blocked.map((t) => t.id);

      // Direct dependencies: Decor Blueprint & Menu Tasting
      expect(blockedIds).toContain('decor-blueprint');
      expect(blockedIds).toContain('menu-tasting');

      // Indirect 2nd-tier dependency: Final Catering Layout depends on Menu Tasting
      expect(blockedIds).toContain('catering-layout');

      // Independent task should NOT be flagged
      expect(blockedIds).not.toContain('photo-prewedding');

      // The delayed root task itself should not be in the downstream blocked list
      expect(blockedIds).not.toContain('venue-booking');
    });

    it('returns an empty array when no downstream tasks depend on the delayed item', () => {
      const tasks: TimelineTask[] = [
        { id: 'task-a', title: 'Root', category: 'Venue', weeksBefore: 10, status: 'pending', dependsOn: [], impactIfDelayed: '' },
        { id: 'task-b', title: 'Leaf Task', category: 'Music', weeksBefore: 2, status: 'delayed', dependsOn: ['task-a'], impactIfDelayed: '' },
      ];

      const blocked = getDownstreamBlockedTasks(tasks, 'task-b');
      expect(blocked).toEqual([]);
    });
  });

  describe('compressTimelineForEarlierDate', () => {
    it('shifts tasks when an event moves up by 2 weeks and flags critical bottlenecks', () => {
      const tasks: TimelineTask[] = [
        { id: 't-venue', title: 'Lock Venue Booking', category: 'Venue', weeksBefore: 12, status: 'pending', dependsOn: [], impactIfDelayed: '' },
        { id: 't-decor', title: 'Order Stage Structures', category: 'Décor & Flowers', weeksBefore: 6, status: 'pending', dependsOn: ['t-venue'], impactIfDelayed: '' },
        { id: 't-tasting', title: 'Final Menu Tasting', category: 'Food & Catering', weeksBefore: 2, status: 'pending', dependsOn: ['t-venue'], impactIfDelayed: '' },
        { id: 't-rehearsal', title: 'Sound Rehearsal', category: 'Entertainment & Music', weeksBefore: 1, status: 'pending', dependsOn: ['t-decor'], impactIfDelayed: '' },
      ];

      // Compress by 2 weeks
      const result = compressTimelineForEarlierDate(tasks, 2);

      expect(result.updatedTasks.length).toBe(4);

      // 12 weeks - 2 = 10 weeks
      expect(result.updatedTasks.find((t) => t.id === 't-venue')?.weeksBefore).toBe(10);
      // 6 weeks - 2 = 4 weeks
      expect(result.updatedTasks.find((t) => t.id === 't-decor')?.weeksBefore).toBe(4);
      // 2 weeks - 2 = 0 weeks (tight: event week)
      expect(result.updatedTasks.find((t) => t.id === 't-tasting')?.weeksBefore).toBe(0);
      // 1 week - 2 = -1 week -> clamped to 0 weeks with critical past-due warning!
      expect(result.updatedTasks.find((t) => t.id === 't-rehearsal')?.weeksBefore).toBe(0);

      // Verify human-readable diagnostic warnings
      const warningsText = result.criticalWarnings.join(' ');
      expect(warningsText).toContain('CRITICAL');
      expect(warningsText).toContain('Sound Rehearsal');
      expect(warningsText).toContain('TIGHT');
      expect(warningsText).toContain('Final Menu Tasting');
    });

    it('returns identical copy when weeksReduced is zero', () => {
      const tasks: TimelineTask[] = [
        { id: 't1', title: 'Milestone', category: 'Venue', weeksBefore: 4, status: 'pending', dependsOn: [], impactIfDelayed: '' },
      ];

      const result = compressTimelineForEarlierDate(tasks, 0);
      expect(result.criticalWarnings).toEqual([]);
      expect(result.updatedTasks).toEqual(tasks);
    });
  });
});

