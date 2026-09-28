import { describe, expect, it } from 'vitest';

import { festival } from '../../src/data/festival';
import { allPerformances } from '../../src/features/agenda/selectors';
import { validateFestival } from '../../src/lib/validation';
import type { Performance } from '../../src/types/festival';

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

  it('keeps both Fogones nights and their midnight civil dates', () => {
    expect(festival.fogones.days.map((day) => day.acts.length)).toEqual([9, 8]);
    const fogonesActs = festival.fogones.days.flatMap((day) => [
      ...(day.acts as readonly Performance[]),
    ]);
    const acts = new Map(fogonesActs.map((act) => [act.name, act]));
    expect(acts).toHaveLength(17);
    expect(acts.get('Canto a Don José')).toMatchObject({
      editorialDate: '2026-10-17',
      civilDate: '2026-10-18',
    });
    expect(acts.get('Chacho Ramos')).toMatchObject({
      editorialDate: '2026-10-17',
      civilDate: '2026-10-18',
    });
    expect(acts.get('DJ Gustavo Olazábal')).toMatchObject({
      editorialDate: '2026-10-18',
      civilDate: '2026-10-19',
    });
  });

  it('keeps the confirmed parade schedule and location', () => {
    expect(festival.parade).toEqual({
      date: '2026-10-11',
      time: '11:00',
      place: 'Avenida Varela',
      city: 'Minas',
    });
  });

  it('keeps the complete interior program grouped with stable IDs and civil dates', () => {
    expect(festival.interior.culturalDays).toHaveLength(13);
    expect(festival.interior.sports).toHaveLength(11);
    expect(festival.interior.cinema).toHaveLength(4);

    const culturalActs = festival.interior.culturalDays.flatMap((day) => [...day.acts]);
    const sportSessions = festival.interior.sports.flatMap((event) => [
      ...('sessions' in event ? event.sessions : []),
    ]);
    const scheduledEntries = [...culturalActs, ...sportSessions, ...festival.interior.cinema];
    const ids = scheduledEntries.map((entry) => entry.id);

    expect(culturalActs).toHaveLength(37);
    expect(new Set(ids).size).toBe(ids.length);
    expect(
      scheduledEntries.every(
        (entry) =>
          entry.editorialDate === entry.civilDate && /^2026-10-\d{2}$/.test(entry.civilDate),
      ),
    ).toBe(true);
    expect(festival.interior.culturalDays.at(-1)?.place).toBe('Zapicán');
    expect(festival.interior.cinema.map((screening) => screening.time)).toEqual([
      '18:30',
      '19:00',
      '18:30',
      '19:30',
    ]);
  });
});
