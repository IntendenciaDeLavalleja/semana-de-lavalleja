import { describe, expect, it } from 'vitest';

import { allPerformances } from '../../src/features/agenda/selectors';
import {
  createCalendar,
  escapeIcsText,
  foldIcsLine,
  utcStart,
} from '../../src/features/calendar/ics';

describe('ICS export', () => {
  const performances = allPerformances;

  it('uses the real UTC instant for rescheduled and midnight performances', () => {
    const vale = performances.find((act) => act.name === 'DJ Vale León')!;
    const diego = performances.find((act) => act.name === 'DJ Diego Falco')!;
    const luana = performances.find((act) => act.name === 'Luana')!;
    expect(utcStart(vale)).toBe('20261013T023000Z');
    expect(utcStart(diego)).toBe('20261010T020000Z');
    expect(utcStart(luana)).toBe('20261011T030000Z');
  });

  it('generates one VEVENT per performance without invented end times', () => {
    const calendar = createCalendar(performances);
    expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(33);
    expect(calendar).not.toContain('DTEND');
    expect(calendar.endsWith('\r\n')).toBe(true);
    expect(calendar).toContain('UID:2026-10-0115-dj-emilio-caceres@semana-de-lavalleja');
  });

  it('escapes text and folds by UTF-8 octets', () => {
    expect(escapeIcsText('A, B; C\\D\nE')).toBe('A\\, B\\; C\\\\D\\nE');
    const folded = foldIcsLine(`SUMMARY:${'Á'.repeat(50)}`);
    expect(folded).toContain('\r\n ');
    expect(folded.split('\r\n').every((line) => new TextEncoder().encode(line).length <= 75)).toBe(
      true,
    );
  });
});
