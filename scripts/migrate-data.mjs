import { mkdir, readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../Semana-de-Lavalleja-53.html', import.meta.url), 'utf8');
const scripts = [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(
  (match) => match[1],
);
const dataScript = scripts.find((script) => script.includes('window.FESTIVAL ='));

if (!dataScript) throw new Error('window.FESTIVAL was not found in the reference template.');

const context = { window: {} };
vm.runInNewContext(dataScript, context);
const legacy = context.window.FESTIVAL;

const pad = (value) => String(value).padStart(2, '0');
const slug = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const nextCivilDate = (date) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
};

const migrated = {
  edition: legacy.edition,
  year: legacy.year,
  month: legacy.month,
  start: legacy.start,
  end: legacy.end,
  place: legacy.place,
  timezone: 'America/Montevideo',
  instagram: legacy.instagram,
  facebook: legacy.facebook,
  days: legacy.days.map((day) => {
    const editorialDate = `${legacy.year}-${pad(legacy.month)}-${pad(day.day)}`;
    return {
      day: day.day,
      date: editorialDate,
      weekday: day.weekday,
      short: day.short,
      theme: day.theme,
      line: day.line,
      feature: day.feature,
      note: day.note,
      acts: day.acts.map(([time, name, category]) => ({
        id: `${legacy.year}-${pad(day.day)}-${time.replace(':', '')}-${slug(name)}`,
        editorialDate,
        civilDate: Number(time.slice(0, 2)) < 6 ? nextCivilDate(editorialDate) : editorialDate,
        time,
        name,
        ...(category ? { category } : {}),
      })),
    };
  }),
};

const output =
  `/* Generated once from the approved HTML template by scripts/migrate-data.mjs. */\n` +
  `import type { Festival } from '../types/festival';\n\n` +
  `export const festival = ${JSON.stringify(migrated, null, 2)} as const satisfies Festival;\n`;

await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(new URL('../src/data/festival.ts', import.meta.url), output);
console.log(
  `Migrated ${migrated.days.length} days and ${migrated.days.flatMap((day) => day.acts).length} performances.`,
);
