# Despliegue en Coolify

## Configuración

1. Crear una aplicación desde el repositorio.
2. Elegir **Dockerfile** como build pack.
3. Usar la raíz del repositorio como contexto y `Dockerfile` como ruta.
4. Exponer el puerto interno **8080**. No agregar volumen ni base de datos.
5. Configurar como argumentos de build:
   - `SITE_URL=https://dominio-final`
   - `SITE_INDEXABLE=true` sólo cuando el dominio y HTTPS estén listos.
6. Configurar el healthcheck HTTP en `/health`, puerto 8080.
7. Asociar el dominio y dejar TLS en el proxy de Coolify.

Las variables se consumen en la etapa de build. Cambiarlas en runtime no modifica canonicals, robots, sitemap ni metadatos; hay que reconstruir y desplegar la imagen.

## Comprobaciones posteriores

- `/health` devuelve 200 y `ok`.
- `/programacion/2026-10-10/` abre y recarga directamente.
- una ruta inexistente devuelve 404 real con la página propia;
- `/robots.txt`, `/sitemap-index.xml`, `/llms.txt` y `/programacion.md` responden;
- `_astro/*` usa caché larga e immutable, mientras HTML y archivos editoriales revalidan;
- cabeceras CSP, `nosniff`, referrer y permisos no rompen las islas ni SVG;
- canonicals y sitemap usan el dominio final HTTPS.

## Operación y rollback

Revisar logs de build para `npm ci` y `astro build`, y logs de Nginx para 404 o errores. Para rollback, redeplegar la imagen/tag previo desde Coolify. No hay migración de base de datos. Los favoritos viven en el navegador y sobreviven a un redeploy mientras se conserve el mismo origen; no se sincronizan entre computadora y celular.

No se modificó DNS ni se desplegó a producción. La validación local de la imagen queda registrada en `docs/validation.md`.
