import type { Festival } from '../types/festival';

export function validateFestival(data: Festival): string[] {
  const errors: string[] = [];
  const expectedCounts = [5, 6, 6, 8, 7];
  const expectedFogonesCounts = [9, 8];
  const ids = new Set<string>();

  const validateActs = (
    days: readonly { date: string; acts: Festival['days'][number]['acts'] }[],
    counts: readonly number[],
    label: string,
  ) => {
    days.forEach((day, index) => {
      if (day.acts.length !== counts[index]) {
        errors.push(
          `La jornada ${day.date} de ${label} debe contener ${counts[index]} actuaciones.`,
        );
      }
      for (const act of day.acts) {
        if (ids.has(act.id)) errors.push(`ID duplicado: ${act.id}`);
        ids.add(act.id);
        if (!/^\d{2}:\d{2}$/.test(act.time)) errors.push(`Horario inválido: ${act.id}`);
        if (!/^2026-10-\d{2}$/.test(act.civilDate)) errors.push(`Fecha civil inválida: ${act.id}`);
        if (act.editorialDate !== day.date) errors.push(`Fecha editorial inválida: ${act.id}`);
      }
    });
  };

  if (data.days.length !== 5) errors.push('La programación debe contener cinco jornadas.');
  if (data.fogones.days.length !== 2) {
    errors.push('La programación de Fogones debe contener dos jornadas.');
  }
  validateActs(data.days, expectedCounts, 'Parque Rodó');
  validateActs(data.fogones.days, expectedFogonesCounts, 'Fogones');
  if (ids.size !== 49) errors.push(`Se esperaban 49 actuaciones y se encontraron ${ids.size}.`);
  return errors;
}
