import type { APIRoute } from 'astro';
import { festival } from '../data/festival';
import type { Performance } from '../types/festival';

export const prerender = true;

export const GET: APIRoute = () => {
  const lines = [
    '# Programación · 53.ª Semana de Lavalleja',
    '',
    'Parque Rodó, Minas · 7 al 11 de octubre de 2026 · Entrada gratuita',
    '',
  ];
  for (const day of festival.days) {
    lines.push(`## ${day.weekday} ${day.day} de octubre`, '');
    for (const act of day.acts as readonly Performance[]) {
      const category = act.category ? ` — ${act.category}` : '';
      const civil = act.civilDate !== day.date ? ` (fecha civil: ${act.civilDate})` : '';
      lines.push(`- ${act.time} — ${act.name}${category}${civil}`);
    }
    if (day.note) lines.push('', `> ${day.note}`);
    lines.push('');
  }
  lines.push('## Noche de los Fogones · Cerro Artigas', '', '17 y 18 de octubre de 2026', '');
  for (const day of festival.fogones.days) {
    lines.push(`### ${day.weekday} ${day.day} de octubre`, '');
    for (const act of day.acts as readonly Performance[]) {
      const civil = act.civilDate !== day.date ? ` (fecha civil: ${act.civilDate})` : '';
      lines.push(`- ${act.time} — ${act.name}${civil}`);
    }
    lines.push('');
  }
  lines.push(
    'Los horarios de madrugada se muestran dentro de la noche editorial anunciada; la fecha civil se aclara cuando cambia de día.',
    '',
  );
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
