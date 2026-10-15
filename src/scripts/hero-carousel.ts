document.querySelectorAll<HTMLElement>('[data-hero-carousel]').forEach((hero) => {
  const images = Array.from(hero.querySelectorAll<HTMLImageElement>('[data-hero-image]'));
  const tabs = Array.from(hero.querySelectorAll<HTMLButtonElement>('[data-hero-tab]'));
  const caption = hero.querySelector<HTMLElement>('[data-hero-caption]');
  const title = hero.querySelector<HTMLElement>('[data-hero-title]');
  const status = hero.querySelector<HTMLElement>('[data-hero-status]');
  const pauseButton = hero.querySelector<HTMLButtonElement>('[data-hero-pause]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0,
    paused = reduced.matches,
    visible = true;
  let timer: ReturnType<typeof setInterval> | undefined;
  function syncTimer() {
    clearInterval(timer);
    if (!paused && visible && !document.hidden && !hero.contains(document.activeElement))
      timer = setInterval(() => show(active + 1, false), 4000);
  }
  function show(index: number, manual = true) {
    active = (index + images.length) % images.length;
    images.forEach((img, i) => {
      img.classList.toggle('is-active', i === active);
      if (i === active) {
        img.removeAttribute('aria-hidden');
        img.loading = 'eager';
      } else img.setAttribute('aria-hidden', 'true');
    });
    tabs.forEach((tab, i) => {
      tab.classList.toggle('is-active', i === active);
      tab.setAttribute('aria-pressed', String(i === active));
    });
    if (caption) caption.textContent = tabs[active].dataset.caption ?? '';
    if (title) title.textContent = tabs[active].dataset.title ?? '';
    if (manual && status)
      status.textContent = `${active + 1} / ${images.length} · ${tabs[active].textContent}`;
    syncTimer();
  }
  function syncPause() {
    if (pauseButton) {
      pauseButton.textContent = paused ? '▶' : 'Ⅱ';
      pauseButton.setAttribute('aria-pressed', String(paused));
      pauseButton.setAttribute(
        'aria-label',
        (paused ? pauseButton.dataset.playLabel : pauseButton.dataset.pauseLabel) ?? '',
      );
    }
    syncTimer();
  }
  pauseButton?.addEventListener('click', () => {
    paused = !paused;
    syncPause();
  });
  tabs.forEach((tab, i) => tab.addEventListener('click', () => show(i)));
  hero.querySelector('[data-hero-prev]')?.addEventListener('click', () => show(active - 1));
  hero.querySelector('[data-hero-next]')?.addEventListener('click', () => show(active + 1));
  hero.addEventListener('focusin', syncTimer);
  hero.addEventListener('focusout', () => setTimeout(syncTimer, 0));
  document.addEventListener('visibilitychange', syncTimer);
  reduced.addEventListener('change', () => {
    paused = reduced.matches;
    syncPause();
  });
  if ('IntersectionObserver' in window)
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncTimer();
      },
      { threshold: 0.15 },
    ).observe(hero);
  hero.addEventListener('keydown', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('button')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(active + (event.key === 'ArrowRight' ? 1 : -1));
      tabs[active].focus();
    }
  });
  let touchStart: number | null = null;
  hero.addEventListener(
    'touchstart',
    (event) => {
      touchStart = event.touches[0]?.clientX ?? null;
    },
    { passive: true },
  );
  hero.addEventListener(
    'touchend',
    (event) => {
      if (touchStart === null) return;
      const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
      if (Math.abs(delta) > 55) show(active + (delta < 0 ? 1 : -1));
      touchStart = null;
    },
    { passive: true },
  );
  syncPause();
});

export {};
