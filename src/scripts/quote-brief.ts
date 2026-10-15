document.querySelectorAll<HTMLElement>('[data-quote-planner]').forEach((planner) => {
  const selects = Array.from(planner.querySelectorAll<HTMLSelectElement>('[data-quote-select]'));
  const values = Array.from(planner.querySelectorAll<HTMLElement>('[data-quote-value]'));
  function update() {
    selects.forEach((select, i) => {
      if (values[i]) values[i].textContent = select.value;
    });
    const status = planner.querySelector<HTMLElement>('[data-quote-status]');
    if (status) status.textContent = '';
  }
  selects.forEach((select) => select.addEventListener('change', update));
  planner.querySelector('[data-quote-generate]')?.addEventListener('click', () => {
    update();
    planner
      .querySelector<HTMLElement>('.pp-brief')
      ?.scrollIntoView({
        block: 'nearest',
        behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth',
      });
  });
  planner
    .querySelector<HTMLButtonElement>('[data-quote-copy]')
    ?.addEventListener('click', async (event) => {
      update();
      const button = event.currentTarget as HTMLButtonElement;
      const status = planner.querySelector<HTMLElement>('[data-quote-status]');
      const text = selects
        .map((select) => `${select.dataset.resultLabel}: ${select.value}`)
        .concat(
          Array.from(planner.querySelectorAll('.pp-brief li')).map((li) => li.textContent ?? ''),
        )
        .join('\n');
      try {
        await navigator.clipboard.writeText(text);
        if (status) status.textContent = button.dataset.copied ?? '';
      } catch {
        if (status) status.textContent = button.dataset.failed ?? '';
      }
    });
});

export {};
