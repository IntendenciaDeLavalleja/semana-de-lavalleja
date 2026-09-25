import type { Festival } from '../types/festival';

export function validateFestival(data: Festival): string[] {
  const errors: string[] = [];
  const expectedCounts = [5, 6, 6, 8, 7];
  const ids = new Set<string>();

  if (data.days.length !== 5) errors.push('La programación debe contener cinco jornadas.');
  data.days.forEach((day, index) => {
    if (day.acts.length !== expectedCounts[index]) {
      errors.push(`La jornada ${day.date} debe contener ${expectedCounts[index]} actuaciones.`);
    }
    for (const act of day.acts) {
      if (ids.has(act.id)) errors.push(`ID duplicado: ${act.id}`);
      ids.add(act.id);
      if (!/^\d{2}:\d{2}$/.test(act.time)) errors.push(`Horario inválido: ${act.id}`);
      if (!/^2026-10-\d{2}$/.test(act.civilDate)) errors.push(`Fecha civil inválida: ${act.id}`);
    }
  });
  if (ids.size !== 32) errors.push(`Se esperaban 32 actuaciones y se encontraron ${ids.size}.`);
  return errors;
}
