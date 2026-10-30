// ─────────────────────────────────────────────────────────────────────────────
// Tyohar AI — Deterministic Timeline & Critical-Path Engine
// Pure graph logic — no network calls, no GenAI, 100% testable with Vitest.
// ─────────────────────────────────────────────────────────────────────────────

import type { TimelineTask } from '../types/tyohar';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Critical-Path Sort (Topological + Chronological)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sorts tasks in execution order:
 *   1. Primary key  — `weeksBefore` descending (earliest prep first).
 *   2. Tie-breaker  — dependency order (Kahn's topological sort) so that
 *      a task never appears before any of its prerequisites.
 *
 * If the dependency graph contains a cycle the function still returns a
 * best-effort sort rather than throwing, to keep the UI functional.
 */
export function sortTasksByCriticalPath(tasks: TimelineTask[]): TimelineTask[] {
  if (tasks.length === 0) return [];

  // Build adjacency list and in-degree map
  const taskMap = new Map<string, TimelineTask>();
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>(); // parent → children

  for (const task of tasks) {
    taskMap.set(task.id, task);
    inDegree.set(task.id, 0);
    adjacency.set(task.id, []);
  }

  for (const task of tasks) {
    for (const depId of task.dependsOn) {
      if (taskMap.has(depId)) {
        adjacency.get(depId)!.push(task.id);
        inDegree.set(task.id, (inDegree.get(task.id) ?? 0) + 1);
      }
    }
  }

  // Kahn's algorithm — seed queue with zero-in-degree nodes sorted by weeksBefore desc
  const queue: TimelineTask[] = tasks
    .filter((t) => (inDegree.get(t.id) ?? 0) === 0)
    .sort((a, b) => b.weeksBefore - a.weeksBefore);

  const sorted: TimelineTask[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    sorted.push(current);

    const children = adjacency.get(current.id) ?? [];
    for (const childId of children) {
      const newDeg = (inDegree.get(childId) ?? 1) - 1;
      inDegree.set(childId, newDeg);
      if (newDeg === 0) {
        const child = taskMap.get(childId)!;
        // Insert child in sorted position (weeksBefore desc) within queue
        let inserted = false;
        for (let i = 0; i < queue.length; i++) {
          if (child.weeksBefore > queue[i].weeksBefore) {
            queue.splice(i, 0, child);
            inserted = true;
            break;
          }
        }
        if (!inserted) queue.push(child);
      }
    }
  }

  // Best-effort: append any cycle-trapped tasks at the end
  for (const task of tasks) {
    if (!visited.has(task.id)) {
      sorted.push(task);
    }
  }

  return sorted;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Downstream Blocked Tasks (Cascade Risk Finder)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively finds every task that directly or indirectly depends on the
 * specified delayed task. Used to highlight cascade risks in the timeline UI.
 *
 * @param tasks          Full task list.
 * @param delayedTaskId  The ID of the task marked 'delayed'.
 * @returns An array of downstream tasks (excluding the delayed task itself).
 */
export function getDownstreamBlockedTasks(
  tasks: TimelineTask[],
  delayedTaskId: string,
): TimelineTask[] {
  const taskMap = new Map<string, TimelineTask>();
  const childrenOf = new Map<string, string[]>(); // parent → direct children

  for (const task of tasks) {
    taskMap.set(task.id, task);
  }

  // Build reverse adjacency: for each task, record which other tasks depend on it
  for (const task of tasks) {
    for (const depId of task.dependsOn) {
      if (!childrenOf.has(depId)) {
        childrenOf.set(depId, []);
      }
      childrenOf.get(depId)!.push(task.id);
    }
  }

  // BFS from the delayed task
  const blocked: TimelineTask[] = [];
  const visited = new Set<string>();
  const queue: string[] = [delayedTaskId];
  visited.add(delayedTaskId);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = childrenOf.get(currentId) ?? [];

    for (const childId of children) {
      if (!visited.has(childId)) {
        visited.add(childId);
        const childTask = taskMap.get(childId);
        if (childTask) {
          blocked.push(childTask);
          queue.push(childId);
        }
      }
    }
  }

  return blocked;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Timeline Compression (Date-Forward Shift)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * When an event date moves earlier by `weeksReduced`, this function shifts
 * every task's `weeksBefore` proportionally downward and flags critical
 * bottlenecks — tasks that would be scheduled at ≤ 0 weeks (i.e. too late).
 *
 * @param tasks          Full task list.
 * @param weeksReduced   How many weeks the event moved earlier (positive int).
 * @returns Updated tasks and an array of human-readable critical warnings.
 */
export function compressTimelineForEarlierDate(
  tasks: TimelineTask[],
  weeksReduced: number,
): { updatedTasks: TimelineTask[]; criticalWarnings: string[] } {
  const reduction = Math.max(0, Math.round(weeksReduced));
  const criticalWarnings: string[] = [];

  if (reduction === 0) {
    return { updatedTasks: tasks.map((t) => ({ ...t })), criticalWarnings };
  }

  const updatedTasks = tasks.map((task) => {
    const newWeeks = task.weeksBefore - reduction;
    const updated: TimelineTask = { ...task, weeksBefore: Math.max(0, newWeeks) };

    if (newWeeks < 0) {
      criticalWarnings.push(
        `⚠ CRITICAL: "${task.title}" (${task.category}) was scheduled ${task.weeksBefore}w before the event but now has ${Math.abs(newWeeks)}w deficit. ` +
          `This task is past-due under the new timeline and requires immediate action.`,
      );
    } else if (newWeeks === 0) {
      criticalWarnings.push(
        `⚡ TIGHT: "${task.title}" (${task.category}) is now scheduled on event week itself (0 weeks lead time). Confirm with vendor/team immediately.`,
      );
    } else if (newWeeks <= 1 && task.weeksBefore > 2) {
      criticalWarnings.push(
        `🔶 COMPRESSED: "${task.title}" compressed from ${task.weeksBefore}w → ${newWeeks}w lead time. Verify feasibility with assigned owner.`,
      );
    }

    return updated;
  });

  // Add a summary warning if many tasks are affected
  const criticalCount = criticalWarnings.filter((w) =>
    w.startsWith('⚠'),
  ).length;
  if (criticalCount >= 3) {
    criticalWarnings.unshift(
      `🚨 ${criticalCount} tasks are past-due after compressing by ${reduction} weeks. Consider negotiating a partial date shift or parallelising tasks.`,
    );
  }

  return { updatedTasks, criticalWarnings };
}

