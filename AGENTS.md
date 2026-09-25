# Convenciones del proyecto

- Usar `src/data/festival.ts` como única fuente de programación. No duplicar artistas u horarios en componentes.
- Mantener IDs de actuaciones, `editorialDate` y `civilDate`; agregar pruebas para cualquier cambio de madrugada.
- Preservar la estética aprobada en `src/styles/legacy.css`. Las mejoras nuevas van en CSS acotado y no sustituyen el recorrido vertical.
- El contenido indexable debe seguir renderizado por Astro. React sólo para interacción y siempre compartiendo estado mediante Nano Stores.
- No usar `localStorage.clear()` ni cambiar namespaces sin una migración idempotente.
- Mantener funcionalidad sin JavaScript y con movimiento reducido.
- Antes de entregar: `npm run verify`. Para cambios visuales, revisar capturas de hero, cinco jornadas, Pueblos, Fogones y footer en escritorio y móvil.
