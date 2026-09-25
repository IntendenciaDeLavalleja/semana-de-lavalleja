# Reporte de validación

Validación local realizada el 25 de septiembre de 2026 en Windows con Docker Desktop 29.7.2. El host tenía Node 22.15.1; el proyecto y la etapa de build usan Node 22.22.3 porque satisface los requisitos actuales de Astro y `undici`.

## Código, datos y build

- `npm install`: lockfile actualizado, 0 vulnerabilidades reportadas.
- `npm run check`: Astro/TypeScript sin errores, advertencias ni sugerencias.
- `npm run lint`: correcto.
- `npm test`: 4 archivos y 13 pruebas unitarias aprobadas. Cubren los 32 horarios, IDs, orden, madrugadas, ICS, migración, deduplicación, almacenamiento bloqueado/escritura fallida y URLs de build.
- `npm run build`: correcto; 8 páginas estáticas, archivos de texto y `sitemap-index.xml`.
- `npm run test:seo`: 4 pruebas aprobadas. Verifican rutas públicas, 32 actuaciones en HTML/Markdown, canonicals distintos, `noindex` local, JSON-LD parseable y ausencia de dominios placeholder en la salida.

## Navegadores y accesibilidad

- `npm run test:e2e`: 23 pruebas aprobadas en Chromium y WebKit; 1 prueba visual omitida intencionalmente en WebKit porque las capturas comparativas se registran una sola vez con Chromium.
- Se verificaron selector 7 → 11, hashes directos, páginas por fecha, regreso al recorrido, recursos sin 404, consola sin errores, favoritos entre islas/pestañas/recarga, contexto independiente, exportación, impresión, confirmación de vaciado, menú/redes, JavaScript deshabilitado y movimiento reducido.
- axe-core/Playwright: portada y programación sin violaciones automáticas serias o críticas, en Chromium y WebKit. Se corrigieron semántica de las fechas y cinco contrastes de texto pequeño detectados por la auditoría.
- Zoom CSS al 200 %: marca, agenda y menú principal permanecen visibles y operables.
- Enlaces internos rastreables: todos respondieron con estado menor a 400.

Las capturas equivalentes de referencia y migración están en `test-results/visual-comparison/` para 360, 390, 768, 1024 y 1440 px, además de pantalla baja y orientación horizontal. Incluyen hero, introducción/programación, sábado 10, Pueblos, Fogones y Visita. La inspección manual confirmó correspondencia de composición; la migración suma iconos/nombres de Instagram y Facebook en escritorio sin alterar el recorrido.

## Lighthouse

Medición móvil local con Lighthouse 12.8.2 sobre `astro preview` y el build estático:

| Categoría        | Puntaje |
| ---------------- | ------: |
| Rendimiento      |      94 |
| Accesibilidad    |     100 |
| Buenas prácticas |      96 |
| SEO local        |      69 |

Métricas: FCP 1,4 s; LCP 3,0 s; Speed Index 1,4 s; TBT 0 ms; CLS 0,01.

El puntaje SEO local baja exclusivamente porque el build seguro de preview declara `noindex`. Repitiendo la categoría y excluyendo sólo `is-crawlable`, el resto de las auditorías SEO obtiene 100. No se generó un build indexable con un dominio inventado: el puntaje final debe repetirse con el dominio HTTPS real. Los reportes JSON están en `reports/lighthouse/mobile.json` y `reports/lighthouse/seo-without-indexing.json`. Una medición de laboratorio local no equivale a Core Web Vitals reales.

## Docker/Nginx

Se construyó `semana-lavalleja-53:local-test` desde cero con `npm ci` en Node 22.22.3 y runtime `nginx-unprivileged:1.29.4-alpine3.23`:

- proceso final como `uid=101(nginx)`, imagen de 24.577.714 bytes;
- healthcheck Docker en estado `healthy` y `/health` 200;
- home y `/programacion/2026-10-10/` 200, con hidratación y favorito funcional sin errores de consola;
- ruta inexistente 404 real; `reference/` 404 y `.env` denegado;
- robots, sitemap, llms y Markdown 200 con MIME esperado;
- HTML/editorial con revalidación; CSS hash con `max-age=31536000, immutable`;
- gzip activo y CSP, `nosniff`, referrer, frame y permissions headers heredados en las respuestas.

El contenedor temporal se eliminó tras la prueba; la imagen local permanece disponible.

## Pendiente fuera de este entorno

- dominio público HTTPS definitivo y valor `SITE_URL`;
- build/revisión Lighthouse indexable con `SITE_INDEXABLE=true` en ese dominio;
- despliegue remoto, DNS, TLS, logs y rollback en Coolify;
- prueba en teléfono físico (las pruebas realizadas son emulación de navegador);
- reemplazo de logos institucionales si se reciben originales oficiales de mayor calidad, según `docs/assets.md`.
