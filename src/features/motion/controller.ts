import { navigate } from 'astro:transitions/client';

import { $activeDay } from '../agenda/store';
import { $motionPreference } from './preferences';

type Scene = {
  element: HTMLElement;
  card: HTMLElement;
  digits: HTMLElement[];
  rows: HTMLElement[];
  sun: HTMLElement;
  hills: HTMLElement;
  rgb: number[];
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => {
  const current = clamp(value);
  return current * current * (3 - 2 * current);
};
const afterStoryAnchors = new Set(['#pueblos', '#fogones', '#fogones-programacion', '#visita']);

function hexRgb(value: string): number[] {
  const hex = value.replace('#', '').trim();
  const full = hex.length === 3 ? [...hex].map((part) => part + part).join('') : hex;
  return [0, 2, 4].map((offset) => Number.parseInt(full.slice(offset, offset + 2), 16));
}

export function initFestivalMotion(): () => void {
  const story = document.querySelector<HTMLElement>('#recorrido');
  const stage = document.querySelector<HTMLElement>('.program-stage');
  const header = document.querySelector<HTMLElement>('#site-header');
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!story || !stage || !header || !hero) return () => undefined;

  const controller = new AbortController();
  const { signal } = controller;
  const heroCopy = document.querySelector<HTMLElement>('.hero-copy');
  const heroArt = document.querySelector<HTMLElement>('.hero-art');
  const heroHills = [...document.querySelectorAll<HTMLElement>('.hero .hill')];
  const progressBar = document.querySelector<HTMLElement>('.story-progress span');
  const chapterCount = document.querySelector<HTMLElement>('#chapter-count');
  const fogones = document.querySelector<HTMLElement>('#fogones');
  const mediaReduced = matchMedia('(prefers-reduced-motion: reduce)');
  const restRotations = [-1.3, 1, -1.1, 1.2, -1];
  const sceneElements = [...document.querySelectorAll<HTMLElement>('.day-scene')];
  const scenes: Scene[] = sceneElements.map((element) => ({
    element,
    card: element.querySelector<HTMLElement>('.lineup-card')!,
    digits: [...element.querySelectorAll<HTMLElement>('.big-date > span')],
    rows: [...element.querySelectorAll<HTMLElement>('.act-row')],
    sun: element.querySelector<HTMLElement>('.scene-sun')!,
    hills: element.querySelector<HTMLElement>('.scene-hills')!,
    rgb: hexRgb(getComputedStyle(element).getPropertyValue('--scene-bg')),
  }));
  const logicalEnd = scenes.length - 1 + 0.78;
  let reduced = false;
  let pinned = false;
  let active = -1;
  let framePending = false;
  let metrics = { start: 0, range: 1, heroHeight: hero.offsetHeight, nightTop: 0, nightHeight: 1 };

  function fitHeroWords() {
    document.querySelectorAll<HTMLElement>('.word-mask > span').forEach((word) => {
      word.style.fontSize = '';
      const available = word.parentElement?.clientWidth || 0;
      if (available > 0 && word.scrollWidth > available) {
        const size = Number.parseFloat(getComputedStyle(word).fontSize);
        word.style.fontSize = `${(size * available * 0.988) / word.scrollWidth}px`;
      }
    });
  }

  function measure() {
    fitHeroWords();
    const y = window.scrollY;
    metrics = {
      start: story!.getBoundingClientRect().top + y,
      range: Math.max(1, story!.offsetHeight - stage!.offsetHeight),
      heroHeight: hero!.offsetHeight,
      nightTop: fogones ? fogones.getBoundingClientRect().top + y : 0,
      nightHeight: fogones?.offsetHeight || 1,
    };
    requestFrame();
  }

  function setActive(index: number) {
    if (index === active) return;
    active = index;
    $activeDay.set(index);
    if (chapterCount) chapterCount.textContent = String(index + 1).padStart(2, '0');
    scenes.forEach((scene, sceneIndex) => {
      const isActive = !pinned || sceneIndex === index;
      scene.element.classList.toggle('is-active', isActive);
      scene.element.inert = !isActive;
      if (pinned && !isActive) scene.element.setAttribute('aria-hidden', 'true');
      else scene.element.removeAttribute('aria-hidden');
    });
  }

  function configure() {
    const preference = $motionPreference.get();
    reduced = preference === 'reduce' || (preference === 'system' && mediaReduced.matches);
    const viewportTooShort = innerWidth <= 620 ? innerHeight < 680 : innerHeight < 640;
    pinned = !reduced && !viewportTooShort;
    document.body.classList.add('js-ready');
    document.body.classList.toggle('js-motion', !reduced);
    document.body.classList.toggle('scroll-story', pinned);
    document.body.classList.toggle('is-static', !pinned);
    active = -1;
    scenes.forEach((scene) => {
      [scene.element, scene.card, scene.sun, scene.hills, ...scene.digits, ...scene.rows].forEach(
        (node) => node.removeAttribute('style'),
      );
      scene.element.inert = false;
      scene.element.removeAttribute('aria-hidden');
      if (!pinned) scene.element.classList.add('is-active');
    });
    if (!pinned) stage?.removeAttribute('style');
    if (reduced)
      document
        .querySelectorAll('.reveal')
        .forEach((element) => element.classList.add('is-visible'));
    measure();
  }

  function frame() {
    framePending = false;
    const y = window.scrollY;
    header?.classList.toggle('is-stuck', y > 55);

    if (!reduced && y < metrics.heroHeight + 40) {
      if (heroCopy) heroCopy.style.transform = `translate3d(0,${(y * 0.13).toFixed(1)}px,0)`;
      if (heroArt)
        heroArt.style.transform = `translate3d(0,${(y * 0.2).toFixed(1)}px,0) rotate(${(-4 + y * 0.004).toFixed(2)}deg)`;
      heroHills.forEach((hill, index) => {
        hill.style.transform = `translate3d(0,${(y * ([0.13, 0.065, 0.015][index] ?? 0)).toFixed(1)}px,0)`;
      });
    }

    if (pinned) {
      const progress = clamp((y - metrics.start) / metrics.range);
      const logical = progress * logicalEnd;
      const current = clamp(Math.floor(logical + 0.15), 0, scenes.length - 1);
      setActive(current);
      if (progressBar) progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
      const outgoing = clamp(Math.floor(logical), 0, scenes.length - 1);
      const incoming = Math.min(outgoing + 1, scenes.length - 1);
      const mix = smooth((logical - outgoing - 0.7) / 0.3);
      const outgoingScene = scenes[outgoing]!;
      const incomingScene = scenes[incoming]!;
      const color = outgoingScene.rgb.map((value, index) =>
        Math.round(value + ((incomingScene.rgb[index] ?? value) - value) * mix),
      );
      stage!.style.backgroundColor = `rgb(${color.join(',')})`;

      scenes.forEach((scene, index) => {
        const enter = index === 0 ? 1 : smooth((logical - (index - 0.3)) / 0.3);
        const exit = index === scenes.length - 1 ? 0 : smooth((logical - (index + 0.7)) / 0.3);
        const opacity = enter * (1 - exit);
        scene.element.style.visibility = opacity < 0.001 ? 'hidden' : 'visible';
        scene.element.style.opacity = opacity.toFixed(4);
        if (opacity < 0.001) return;
        scene.element.style.transform = `translate3d(0,${((1 - enter) * 24 - exit * 12).toFixed(2)}%,0) scale(${(1 - exit * 0.025).toFixed(4)})`;
        scene.card.style.transform = `translate3d(${((1 - enter) * 80 - exit * 28).toFixed(1)}px,${((1 - enter) * 54 - exit * 24).toFixed(1)}px,0) rotate(${((restRotations[index] ?? 0) + (1 - enter) * 9 - exit * 4).toFixed(2)}deg)`;
        scene.digits.forEach((digit, digitIndex) => {
          digit.style.transform = `translate3d(0,${((1 - enter) * (130 + digitIndex * 65) - exit * (110 - digitIndex * 30)).toFixed(1)}px,0)`;
        });
        scene.rows.forEach((row, rowIndex) => {
          const rowEnter =
            index === 0 ? 1 : smooth((logical - (index - 0.3 + rowIndex * 0.011)) / 0.22);
          row.style.transform = `translate3d(${((1 - rowEnter) * 28).toFixed(1)}px,${((1 - rowEnter) * 16).toFixed(1)}px,0)`;
          row.style.opacity = rowEnter.toFixed(4);
        });
        const drift = clamp(logical - index, -0.3, 1);
        scene.sun.style.transform = `translate3d(${(drift * 65).toFixed(1)}px,calc(-50% + ${(drift * 35).toFixed(1)}px),0)`;
        scene.hills.style.transform = `translate3d(${(-drift * 30).toFixed(1)}px,${(drift * 20).toFixed(1)}px,0)`;
      });
    } else {
      let current = 0;
      scenes.forEach((scene, index) => {
        if (scene.element.getBoundingClientRect().top < innerHeight * 0.48) current = index;
      });
      setActive(current);
    }
  }

  function requestFrame() {
    if (framePending || document.hidden) return;
    framePending = true;
    requestAnimationFrame(frame);
  }

  function goDay(index: number, behavior: ScrollBehavior = reduced ? 'auto' : 'smooth') {
    const selected = clamp(index, 0, scenes.length - 1);
    measure();
    const toolbarHeight = document.querySelector<HTMLElement>('.stage-toolbar')?.offsetHeight || 0;
    const top = pinned
      ? metrics.start + ((selected + 0.15) / logicalEnd) * metrics.range
      : scenes[selected]!.element.getBoundingClientRect().top +
        scrollY -
        header!.offsetHeight -
        toolbarHeight;
    window.scrollTo({ top, behavior });
    history.replaceState(history.state, '', `#dia-${String(7 + selected).padStart(2, '0')}`);
  }

  function alignAfterStoryAnchor() {
    if (signal.aborted) return;
    if (!afterStoryAnchors.has(location.hash)) return;
    const target = document.querySelector<HTMLElement>(location.hash);
    if (!target) return;
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    // The pinned journey changes the height before these anchors. Align the
    // document after that layout is active, never an ancestor scroll container.
    if (fogones && location.hash.startsWith('#fogones')) fogones.scrollTop = 0;
    window.scrollTo({
      top: window.scrollY + target.getBoundingClientRect().top - header!.offsetHeight,
      behavior: 'auto',
    });
    root.style.scrollBehavior = previousBehavior;
  }

  const revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      }),
    { threshold: 0.08, rootMargin: '0px 0px -20px 0px' },
  );
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  const emberField = document.querySelector<HTMLElement>('.ember-field');
  if (emberField && emberField.childElementCount === 0) {
    for (let index = 0; index < 24; index += 1) {
      const ember = document.createElement('i');
      ember.className = 'ember';
      ember.style.cssText = `--x:${16 + ((index * 29) % 69)}%;--duration:${8 + (index % 7)}s;--delay:${-index * 0.83}s;--drift:${(index % 2 ? 1 : -1) * (22 + index * 4)}px`;
      emberField.appendChild(ember);
    }
  }

  const unsubscribe = $motionPreference.subscribe(configure);
  window.addEventListener('scroll', requestFrame, { passive: true, signal });
  window.addEventListener('resize', configure, { passive: true, signal });
  window.addEventListener(
    'festival:go-day',
    ((event: CustomEvent<number>) => goDay(event.detail)) as EventListener,
    { signal },
  );
  document.querySelector<HTMLAnchorElement>('a[href="#fogones-programacion"]')?.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      void navigate('#fogones-programacion').then(alignAfterStoryAnchor);
    },
    { signal },
  );
  document.addEventListener('visibilitychange', () => !document.hidden && measure(), { signal });
  window.addEventListener('pageshow', alignAfterStoryAnchor, { signal });
  window.addEventListener('hashchange', alignAfterStoryAnchor, { signal });
  mediaReduced.addEventListener('change', configure, { signal });

  configure();
  document.fonts?.ready.then(() => {
    if (signal.aborted) return;
    measure();
    alignAfterStoryAnchor();
  });
  const initial = location.hash.match(/^#dia-(\d+)$/);
  if (initial) {
    const index = Number(initial[1]) - 7;
    if (index >= 0 && index < scenes.length) requestAnimationFrame(() => goDay(index, 'auto'));
  } else if (afterStoryAnchors.has(location.hash)) {
    requestAnimationFrame(alignAfterStoryAnchor);
  }

  return () => {
    controller.abort();
    unsubscribe();
    revealObserver.disconnect();
  };
}
