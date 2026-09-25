import { describe, expect, it } from 'vitest';

import { festival } from '../../src/data/festival';
import { allPerformances } from '../../src/features/agenda/selectors';
import { validateFestival } from '../../src/lib/validation';

describe('festival data', () => {
  it('keeps the approved counts, order and unique stable IDs', () => {
    expect(festival.days.map((day) => day.acts.length)).toEqual([5, 6, 6, 8, 7]);
    expect(allPerformances).toHaveLength(32);
    expect(validateFestival(festival)).toEqual([]);
  });

  it('keeps announced notes separate from timed performances', () => {
    expect(festival.days[1].note).toContain('Horario no anunciado');
    expect(festival.days[2].note).toContain('Horario no anunciado');
    expect(festival.days[3].note).toContain('Horario no anunciado');
    expect(allPerformances.some((act) => act.name.includes('Escuela de Canto'))).toBe(false);
  });

  it('assigns explicit civil dates to every midnight performance', () => {
    const acts = new Map(allPerformances.map((act) => [act.name, act]));
    expect(acts.get('DJ Vale León')?.civilDate).toBe('2026-10-09');
    expect(acts.get('DJ Diego Falco')?.civilDate).toBe('2026-10-10');
    expect(acts.get('Luana')?.civilDate).toBe('2026-10-11');
    expect(acts.get('DJ Emilio Cáceres')?.civilDate).toBe('2026-10-11');
  });
});
