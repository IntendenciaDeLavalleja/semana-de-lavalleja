# Mapa de migración

## Línea de base

El sitio se migró desde el HTML aprobado, inspeccionado en navegador antes de implementar. El template de origen no se conserva en este repositorio. Contenía un bloque CSS, dos scripts, `window.FESTIVAL`, recursos `data:` y toda la interacción en una IIFE.

La grilla se transcribió a `src/data/festival.ts`, su única fuente actual; no se duplicó entre páginas ni depende de placas de programación.

| Template original                      | Implementación actual                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `<header>`, redes y navegación móvil   | `components/layout/Navbar.astro`, `layout/SocialLinks.astro`, `islands/MobileMenu.tsx`, `islands/AgendaTrigger.tsx` |
| Hero, sierras, sello y ticker          | `sections/Hero.astro` y CSS preservado                                                                              |
| Introducción “Cinco días”              | `sections/ProgramIntro.astro`                                                                                       |
| `window.FESTIVAL`                      | `data/festival.ts` tipado por `types/festival.ts`                                                                   |
| `#date-nav` generado con `innerHTML`   | `islands/DateNavigation.tsx`, SSR + hidratación                                                                     |
| `#day-scenes` generado con `innerHTML` | `ProgramStory.astro`, `DayScene.astro`, `DayLineup.tsx`                                                             |
| Favoritos en `Set` y una clave v1      | Nano Stores en `features/agenda/`, formato v2 y migración idempotente                                               |
| Diálogo generado por strings           | `islands/AgendaDialog.tsx` con HTML SSR, foco y confirmación                                                        |
| Cálculo universal “hora < 6”           | `civilDate` explícita en cada actuación                                                                             |
| Exportación ICS inline                 | `features/calendar/ics.ts`, CRLF, plegado UTF-8 y UIDs estables                                                     |
| Controlador monolítico                 | `features/motion/controller.ts`; React no se actualiza por frame                                                    |
| Pueblos, Fogones y visita              | `sections/Pueblos.astro`, `Fogones.astro`, `Visit.astro`                                                            |
| Footer y logos embebidos               | `layout/Footer.astro`, `brand/InstitutionalLogos.astro`, archivos independientes                                    |
| Recursos base64                        | `public/brand`, `public/images` y `public/partners`                                                                 |
| Una única URL                          | home, `/programacion/`, cinco rutas por fecha, 404 y salidas textuales                                              |

## Decisiones de fidelidad

El CSS aprobado se preservó como `src/styles/legacy.css`: mantiene tokens, breakpoints, tarjetas inclinadas, capas de paisaje, paleta, tipografías y composición. `global.css` añade fuentes locales, Tailwind 4 sin reset y estilos para funciones nuevas. No se incorporaron GSAP, smooth scroll ni captura de rueda.

El contenido de las cinco jornadas está presente en el HTML generado. JavaScript activa el pinning y las transformaciones; sin JavaScript o con movimiento reducido las escenas permanecen en flujo normal.
