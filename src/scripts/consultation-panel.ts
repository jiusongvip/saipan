document.querySelectorAll<HTMLElement>('[data-consult-panel]').forEach((panel) => {
  const launcher = document.querySelector<HTMLButtonElement>('[data-consult-open]');
  if (!launcher) return;
  const close = panel.querySelector<HTMLButtonElement>('[data-consult-close]');
  // Below 901px the card is an in-flow block, not an overlay, so it never auto-collapses.
  const overlay = window.matchMedia('(min-width:901px)');
  const hero = document.querySelector<HTMLElement>('[data-hero-carousel]');
  let decided = false;

  const setOpen = (open: boolean) => {
    panel.hidden = !open;
    launcher.hidden = open;
    launcher.setAttribute('aria-expanded', String(open));
  };

  close?.addEventListener('click', () => {
    decided = true;
    setOpen(false);
    launcher.focus();
  });
  launcher.addEventListener('click', () => {
    decided = true;
    setOpen(true);
    close?.focus();
  });
  panel.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => {
      decided = true;
      setOpen(false);
    }),
  );

  // The card may only overlap the hero photograph; as soon as its own top edge clears the
  // hero, it would be sitting on section copy instead.
  const autoCollapse = () => {
    if (decided || !overlay.matches || panel.hidden || !hero) return;
    if (panel.getBoundingClientRect().top >= hero.getBoundingClientRect().bottom) setOpen(false);
  };
  window.addEventListener('scroll', autoCollapse, { passive: true });
  window.addEventListener('resize', autoCollapse, { passive: true });
  autoCollapse();
});

export {};
