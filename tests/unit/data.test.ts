import { describe, expect, it } from 'vitest';

import { festival } from '../../src/data/festival';
import { allPerformances } from '../../src/features/agenda/selectors';
import { validateFestival } from '../../src/lib/validation';
import type { Performance } from '../../src/types/festival';

describe('festival data', () => {
  it('keeps the approved counts, order and unique stable IDs', () => {
    expect(festival.days.map((day) => day.date)).toEqual([
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
      '2026-10-12',
    ]);
    expect(festival.days.map((day) => day.acts.length)).toEqual([5, 6, 8, 7, 6]);
    expect(allPerformances).toHaveLength(32);
    expect(validateFestival(festival)).toEqual([]);
  });

  it('matches the rescheduled Parque Rodó lineups and keeps returning performance IDs', () => {
    const lineup = (date: string) =>
      festival.days.find((day) => day.date === date)?.acts.map((act) => `${act.time} ${act.name}`);
    expect(lineup('2026-10-08')).toEqual([
      '18:00 Raúl Jaimés',
      '19:00 Gonzalo Rezk',
      '20:00 Milongas Extremas',
      '21:30 Abel Pintos',
      '23:30 Valen Vargas',
    ]);
    expect(lineup('2026-10-09')).toEqual([
      '18:00 La Cápsula',
      '19:00 Pie Grande',
      '20:00 La Triple Nelson',
      '21:30 Buitres',
      '23:00 Turf',
      '00:30 DJ Diego Falco',
    ]);
    expect(lineup('2026-10-10')).toEqual([
      '16:00 Stefy y Los Borbotones',
      '17:00 Los Suplentes',
      '18:00 The La Planta',
      '19:30 Herederos',
      '21:00 Banda Departamental',
      '22:15 Ángela Leiva',
      '00:00 Luana',
      '01:15 DJ Emilio Cáceres',
    ]);
    expect(lineup('2026-10-11')).toEqual([
      '16:00 Espacio Artístico',
      '17:00 Los Sabrosos',
      '18:00 Martín Piña',
      '19:30 Natalia Ortega y su Banda',
      '20:30 Matías Valdez',
      '22:00 Damas Gratis',
      '23:30 DJ Nahuel Pereira',
    ]);
    expect(lineup('2026-10-12')).toEqual([
      '18:00 Lorena Abreu',
      '19:00 La 80-20',
      '20:00 La Misma Cuadra',
      '21:30 Daianna',
      '22:30 La Penúltima',
      '23:30 DJ Vale León',
    ]);
    const acts = new Map(allPerformances.map((act) => [act.name, act]));
    expect(acts.get('Raúl Jaimés')?.id).toBe('2026-07-1800-raul-jaimes');
    expect(acts.get('Valen Vargas')?.id).toBe('2026-08-2130-valen-vargas');
    expect(acts.get('Lorena Abreu')?.id).toBe('2026-08-1800-lorena-abreu');
    expect(acts.get('DJ Vale León')?.id).toBe('2026-08-0030-dj-vale-leon');
    expect(acts.has('Pablo Sotelo')).toBe(false);
    expect(acts.has('Daiana Aparicio')).toBe(false);
  });

  it('keeps announced notes separate from timed performances', () => {
    expect(festival.days[0].note).toContain('Escuela de Canto YCEV');
    expect(festival.days[1].note).toContain('Escuela de Canto Natalia Ortega');
    expect(festival.days[2].note).toContain('Academia de canto DAI');
    expect(allPerformances.some((act) => act.name.includes('Escuela de Canto'))).toBe(false);
  });

  it('assigns explicit civil dates to every midnight performance', () => {
    const acts = new Map(allPerformances.map((act) => [act.name, act]));
    expect(acts.get('DJ Vale León')).toMatchObject({
      editorialDate: '2026-10-12',
      civilDate: '2026-10-12',
      time: '23:30',
    });
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
