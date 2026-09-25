# Arquitectura

## Fuente editorial

`src/data/festival.ts` alimenta portada, recorrido, diálogo, páginas por día, Markdown, tests, JSON-LD e ICS. Cada actuación tiene:

- `id` estable compatible con la edición anterior;
- `editorialDate`, que identifica la noche de la grilla;
- `civilDate`, que evita depender de la zona horaria del equipo de build;
- hora, nombre y categoría anunciados.

## Islas

Astro renderiza el contenido editorial. Las islas React se limitan a menú, navegación por fechas, favoritos, agenda, calendario y preferencia de movimiento. Todas se hidratan con `client:load` porque son controles visibles o de primera interacción. Nano Stores sincroniza raíces React y pestañas; no hay una SPA raíz ni Context global.

El primer render de favoritos es vacío tanto en servidor como durante la primera hidratación. Tras montar, se expone el estado persistido para evitar inconsistencias.

## Persistencia

La clave actual es `semana-lavalleja:53:2026:agenda:v2` y guarda `{ version: 2, ids: string[] }`. Se valida JSON, versión, IDs, duplicados y actuaciones retiradas. La marca `semana-lavalleja:53:2026:migration:v2` impide reimportar favoritos v1 después de vaciar la agenda.

Un proxy seguro encapsula `localStorage`: si lectura o escritura falla, mantiene la selección en memoria y muestra una advertencia. No se ejecuta `localStorage.clear()`.

## Movimiento

`features/motion/controller.ts` conserva scroll nativo y usa un único `requestAnimationFrame` para transforms/opacidad. La jornada activa es un cambio discreto enviado a `$activeDay`; los frames no actualizan React. Los observers revelan secciones y se limpian durante HMR.

`prefers-reduced-motion`, la preferencia manual y pantallas bajas desactivan el pinning y dejan las cinco escenas en flujo. Los hashes `#dia-07` a `#dia-11` se mantienen.
