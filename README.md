# 53.ª Semana de Lavalleja

Migración estática del sitio aprobado a Astro con islas React. Conserva el recorrido vertical, las cinco escenas, la identidad visual y la agenda local sin cuentas.

## Requisitos

- Node.js 22.22.3 LTS (`.nvmrc` y `.node-version`)
- npm 11 o compatible con Node 22
- Para E2E: `npx playwright install chromium webkit`

Versiones base fijadas: Astro 7.3.5, React 19.3.0, TypeScript 5.9.3, Tailwind CSS 4.3.3, Nano Stores 1.5.3, Vitest 5.0.1, Playwright 1.63.0 y ESLint 10.11.0. Las versiones completas y exactas están en `package.json` y `package-lock.json`.

## Desarrollo

```sh
npm ci
npm run dev
```

El servidor escucha en `0.0.0.0:4321`, por lo que puede abrirse desde otro dispositivo de la red local usando la IP informada por Astro.

Comandos disponibles:

```sh
npm run build
npm run preview
npm run check
npm run lint
npm run format:check
npm run test
npm run test:e2e
npm run test:seo
npm run verify
```

## Edición de contenido

- Programación y fechas civiles: `src/data/festival.ts`. El archivo fue generado desde el `window.FESTIVAL` del template mediante `scripts/migrate-data.mjs` y desde ahora es la fuente única.
- Redes: `src/config/social.ts`.
- Metadatos y fecha editorial: `src/config/site.ts`.
- Colores, tipografías y composición aprobada: `src/styles/legacy.css`; mejoras nuevas y páginas editoriales: `src/styles/global.css`.
- Movimiento: `src/features/motion/controller.ts` y `src/features/motion/preferences.ts`.
- Logos e ilustraciones: `public/brand`, `public/partners` y `public/images`.
- Información pendiente de Pueblos, academias y Fogones: `src/data/festival.ts` y las secciones `Pueblos.astro`, `Fogones.astro` y `Visit.astro`. No se deben inventar fechas ni horarios.

No se incorporó daisyUI: los controles del diseño aprobado ya tenían un sistema visual específico y agregar un tema global no aportaba funcionalidad suficiente para justificar el peso y el riesgo de colisiones. Tailwind CSS 4 está configurado mediante `@tailwindcss/vite` sin preflight; el arte especializado permanece en CSS.

## SEO y publicación

El build local usa canonicals de `http://localhost:4321/` y `noindex`. Para una imagen indexable:

```sh
SITE_URL=https://dominio-real.uy SITE_INDEXABLE=true npm run build
```

`SITE_URL` debe ser HTTPS y no puede ser localhost cuando `SITE_INDEXABLE=true`. Ambas variables se resuelven durante el build; cambiarlas exige reconstruir la imagen.

La publicación Docker usa Nginx sin privilegios en el puerto interno `8080`. Véase `docs/deployment-coolify.md`.

## Documentación

- `docs/migration.md`: mapa del template a la arquitectura actual.
- `docs/assets.md`: procedencia y limitaciones de recursos.
- `docs/architecture.md`: datos, islas, estado y animación.
- `docs/deployment-coolify.md`: Docker y Coolify.
- `docs/validation.md`: comprobaciones y resultados reales.

La copia inalterada del archivo aprobado está en `reference/Semana-de-Lavalleja-53.html`; no se publica en `dist/` ni en la imagen final.
