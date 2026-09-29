document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const navigation = document.querySelector('.nav-links');
  const year = document.querySelector('#year');

  if (year) year.textContent = new Date().getFullYear();

  if (toggle && navigation) {
    toggle.addEventListener('click', () => {
      const open = navigation.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navigation.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navigation.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });

  revealItems.forEach(item => observer.observe(item));
});
