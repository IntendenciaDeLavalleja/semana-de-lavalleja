import { initFestivalMotion } from '../motion/controller';

let cleanupCurrentPage: (() => void) | undefined;

function resetPageState() {
  cleanupCurrentPage?.();
  cleanupCurrentPage = undefined;
  document.body.classList.remove('js-motion', 'scroll-story', 'is-static');
}

function initCurrentPage() {
  resetPageState();
  document.body.classList.add('js-ready');

  const pageController = new AbortController();
  const header = document.querySelector<HTMLElement>('#site-header');
  const isFestivalJourney = Boolean(
    document.querySelector('#recorrido') && document.querySelector('.program-stage'),
  );

  let cleanupMotion: () => void = () => undefined;

  if (isFestivalJourney) {
    cleanupMotion = initFestivalMotion();
  } else {
    const updateHeader = () => header?.classList.toggle('is-stuck', window.scrollY > 55);
    updateHeader();
    window.addEventListener('scroll', updateHeader, {
      passive: true,
      signal: pageController.signal,
    });
  }

  cleanupCurrentPage = () => {
    pageController.abort();
    cleanupMotion();
  };
}

document.addEventListener('astro:before-swap', resetPageState);
document.addEventListener('astro:page-load', initCurrentPage);
