import { festival } from '../data/festival';

export const siteConfig = {
  name: '53.ª Semana de Lavalleja',
  shortName: 'Semana de Lavalleja',
  description: `Del ${festival.start} al ${festival.end} de octubre de ${festival.year}, Lavalleja está de fiesta. Programación del Parque Rodó, desfile y Noche de los Fogones.`,
  locale: 'es-UY',
  ogLocale: 'es_UY',
  country: 'Uruguay',
  region: 'Lavalleja',
  city: 'Minas',
  image: '/images/social/semana-lavalleja-og-2026-10-08.png',
  imageWidth: 1731,
  imageHeight: 909,
  lastModified: '2026-10-07',
} as const;
