import type { Performance } from '../../types/festival';

const EDITORIAL_STAMP = '20260925T000000Z';

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function utcStart(performance: Performance): string {
  const instant = new Date(`${performance.civilDate}T${performance.time}:00-03:00`);
  return instant
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.000Z$/, 'Z');
}

export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const segments: string[] = [];
  let current = '';
  let limit = 75;
  for (const character of line) {
    const next = current + character;
    if (encoder.encode(next).length > limit) {
      segments.push(current);
      current = character;
      limit = 74;
    } else {
      current = next;
    }
  }
  segments.push(current);
  return segments.join('\r\n ');
}

export function createCalendar(performances: readonly Performance[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Semana de Lavalleja//53a edicion//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  for (const performance of performances) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${performance.id}@semana-de-lavalleja`,
      `DTSTAMP:${EDITORIAL_STAMP}`,
      `DTSTART:${utcStart(performance)}`,
      `SUMMARY:${escapeIcsText(performance.name)}`,
      `LOCATION:${escapeIcsText('Parque Rodó, Minas, Lavalleja, Uruguay')}`,
      `DESCRIPTION:${escapeIcsText(`53.ª Semana de Lavalleja · Noche del ${performance.editorialDate}`)}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}

export function downloadCalendar(performances: readonly Performance[], suffix = 'grilla'): void {
  const blob = new Blob([createCalendar(performances)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `semana-lavalleja-53-${suffix}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}
