const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

if (reduced.matches || !('IntersectionObserver' in window)) {
  items.forEach((item) => item.classList.add('is-in'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );
  items.forEach((item) => observer.observe(item));
}

export {};
