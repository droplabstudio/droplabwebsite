// Droplab Studio — small enhancements. The site works without JS.
// Footer year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Mobile menu
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('mobile-menu');
if (toggle && menu) {
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
  };
  toggle.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

// Contact form: submit to Formspree without leaving the page
const form = document.querySelector('.form');
if (form) {
  const status = form.querySelector('.form__status');
  const button = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = 'Sending…';
    button.disabled = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Request failed');
      form.reset();
      status.classList.add('is-ok');
      status.textContent = "Thanks! We'll get back to you within 24 hours.";
    } catch {
      status.classList.add('is-err');
      status.textContent = 'Something went wrong. Email us at contact.droplab@gmail.com instead.';
    } finally {
      button.disabled = false;
    }
  });
}
