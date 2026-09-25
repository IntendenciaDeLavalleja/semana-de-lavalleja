import { festival } from '../../data/festival';
import type { FestivalDay, Performance } from '../../types/festival';

const days: readonly FestivalDay[] = festival.days;
export const allPerformances: Performance[] = days.flatMap((day) => [...day.acts]);
export const performanceById = new Map<string, Performance>(
  allPerformances.map((performance) => [performance.id, performance]),
);
export const validPerformanceIds = new Set(performanceById.keys());

export function selectPerformances(ids: readonly string[]): Performance[] {
  const selected = new Set(ids);
  return allPerformances.filter((performance) => selected.has(performance.id));
}
