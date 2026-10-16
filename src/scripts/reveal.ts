const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const items = Array.from(
  document.querySelectorAll<HTMLElement>(
    '[data-reveal], .hp-heading > *, .hp-plan > *, .hp-budget__grid > *, .hp-roadmap > li, .hp-documents',
  ),
);
if (!reduced.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = entry.target as HTMLElement;
        item.animate(
          [
            { opacity: 0, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: 550,
            easing: 'cubic-bezier(.16,.7,.2,1)',
            delay: Math.min(Number(item.style.getPropertyValue('--rd')) || 0, 3) * 65,
          },
        );
        observer.unobserve(item);
      });
    },
    { threshold: 0.08 },
  );
  items.forEach((item) => observer.observe(item));
}
export {};
