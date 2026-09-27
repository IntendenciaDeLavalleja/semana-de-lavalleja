import type { APIRoute } from 'astro';
import { getBuildSite } from '../lib/urls';

export const prerender = true;

export const GET: APIRoute = () => {
  const site = getBuildSite();
  const lines = [
    '# 53.ª Semana de Lavalleja',
    '',
    'La Fiesta de Nuestros Pueblos se realiza del 7 al 18 de octubre de 2026 en Lavalleja, Uruguay.',
    'La programación anunciada del Parque Rodó de Minas abarca del miércoles 7 al domingo 11, con entrada gratuita.',
    'La Noche de los Fogones se realiza el sábado 17 y el domingo 18 en el Cerro Artigas, con 17 actuaciones anunciadas y entrada gratuita.',
    'Las actividades de los pueblos y algunos horarios de academias permanecen pendientes de anuncio.',
    'Los horarios posteriores a medianoche se agrupan editorialmente en la noche anterior, pero la versión de calendario utiliza la fecha civil siguiente.',
    '',
    `- Programación web: ${new URL('programacion/', site.url)}`,
    `- Programación en Markdown: ${new URL('programacion.md', site.url)}`,
    '- Instagram: https://www.instagram.com/semanadelavalleja/',
    '- Facebook: https://www.facebook.com/p/Semana-de-Lavalleja-100084038534293/',
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
