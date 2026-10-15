document.querySelectorAll<HTMLElement>('[data-trip-planner]').forEach((planner) => {
  planner.querySelector('[data-trip-generate]')?.addEventListener('click', () => {
    const focus = Number(planner.querySelector<HTMLSelectElement>('[data-trip-focus]')?.value ?? 0);
    const stay = Number(planner.querySelector<HTMLSelectElement>('[data-trip-stay]')?.value ?? 0);
    const focusResult = planner.querySelector<HTMLElement>('[data-trip-focus-result]');
    const stayResult = planner.querySelector<HTMLElement>('[data-trip-stay-result]');
    if (focusResult)
      focusResult.textContent =
        [planner.dataset.treatment, planner.dataset.birth, planner.dataset.explore][focus] ?? '';
    if (stayResult)
      stayResult.textContent =
        [planner.dataset.simple, planner.dataset.comfort, planner.dataset.family][stay] ?? '';
    planner
      .querySelector<HTMLElement>('.hd-checklist')
      ?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'nearest',
      });
  });
});

export {};
