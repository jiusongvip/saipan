document.querySelectorAll<HTMLElement>('[data-consult-panel]').forEach((panel) => {
  const launcher = document.querySelector<HTMLButtonElement>('[data-consult-open]');
  const close = panel.querySelector<HTMLButtonElement>('[data-consult-close]');
  if (!launcher) return;
  const setOpen = (open: boolean) => {
    panel.hidden = !open;
    launcher.hidden = open;
    launcher.setAttribute('aria-expanded', String(open));
  };
  close?.addEventListener('click', () => {
    setOpen(false);
    launcher.focus();
  });
  launcher.addEventListener('click', () => {
    setOpen(true);
    close?.focus();
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      launcher.focus();
    }
  });
  panel
    .querySelectorAll('a')
    .forEach((link) => link.addEventListener('click', () => setOpen(false)));
});
export {};
