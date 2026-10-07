# Página web oficial de la Semana de Lavalleja

La página web oficial de la Semana de Lavalleja es desarrollada por la Oficina de TI de la Intendencia de Lavalleja. Aquí se puede conocer la programación, descubrir las actividades y prepararse para vivir una de las celebraciones más importantes del departamento.

## La Semana de Lavalleja

La Semana de Lavalleja, también conocida como **la Fiesta de Nuestros Pueblos**, celebra la identidad, la cultura y las tradiciones del departamento. Cada edición reúne a vecinos y visitantes en torno a espectáculos musicales, propuestas de los pueblos, el desfile tradicional y la Noche de los Fogones.

La 53.ª edición se realiza del **8 al 18 de octubre de 2026**. Los espectáculos del Parque Rodó de Minas tienen lugar del 8 al 12; el desfile tradicional recorre Avenida Varela el domingo 11, y los Fogones se celebran en el Cerro Artigas los días 17 y 18. La entrada es gratuita.

## El sitio

El sitio ofrece la programación y la información de la celebración, con navegación por jornadas y la posibilidad de guardar actuaciones favoritas en el dispositivo, sin crear una cuenta. Está diseñado para consultarse tanto en computadoras como en teléfonos.

## Tecnologías

- **Astro** para generar un sitio rápido y renderizado como páginas estáticas.
- **React** para los controles interactivos de agenda y navegación.
- **TypeScript** para el desarrollo con tipos.
- **Tailwind CSS** y CSS para los estilos y la identidad visual.
- **Nano Stores** para compartir el estado de la agenda entre componentes.
- **Vitest** y **Playwright** para pruebas unitarias y de extremo a extremo.

## Desarrollo

Requisitos: Node.js 22.22.3 LTS y npm 11 o compatible con Node 22.

```sh
npm ci
npm run dev
```

Para ejecutar las comprobaciones del proyecto:

```sh
npm run verify
```
