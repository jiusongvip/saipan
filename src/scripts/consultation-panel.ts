const panel = document.querySelector<HTMLElement>('[data-consult-panel]');
const launcher = document.querySelector<HTMLButtonElement>('[data-consult-open]');
document.querySelector('[data-consult-close]')?.addEventListener('click', () => {
  if (panel && launcher) {
    panel.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }
});
launcher?.addEventListener('click', () => {
  if (panel) {
    panel.hidden = false;
    launcher.hidden = true;
    launcher.setAttribute('aria-expanded', 'true');
    panel.querySelector<HTMLButtonElement>('[data-consult-close]')?.focus();
  }
});
panel?.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    if (launcher) {
      panel.hidden = true;
      launcher.hidden = false;
      launcher.setAttribute('aria-expanded', 'false');
    }
  }),
);

export {};
