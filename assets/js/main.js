// Droplab Studio — interactions. The page still works without JS.

/* ----------------------------------------------------------
   Hero intro: rules draw left → right, then all text fades in
   ---------------------------------------------------------- */
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const START = 0.3;   // first rule starts drawing (s)
  const STAGGER = 0.14; // gap between rules (s)
  const DRAW = 1.1;    // time for one rule to cross the page (s); matches CSS

  const rows = hero.querySelectorAll('.irow');
  rows.forEach((row, i) => row.style.setProperty('--ld', (START + i * STAGGER).toFixed(2) + 's'));

  // text fades in once the last rule is fully drawn
  const textDelay = START + (rows.length - 1) * STAGGER + DRAW + 0.1;
  hero.style.setProperty('--d', textDelay.toFixed(2) + 's');

  // start on the next frame so the hidden state paints first
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-in')));

  // the rest of the page fades in after the hero text. Only real visitor input
  // reveals it early: browsers also fire scroll events on their own (restoring
  // the scroll position, mobile address bars), which shouldn't skip the intro.
  const FADE = 0.7; // hero text fade length (s); matches CSS
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INPUTS = ['wheel', 'touchmove', 'keydown'];
  const reveal = () => {
    document.documentElement.classList.add('intro-complete');
    INPUTS.forEach((type) => window.removeEventListener(type, reveal));
    document.removeEventListener('click', onClick);
  };
  const onClick = (e) => { if (e.target.closest('a[href^="#"], [data-open-contact]')) reveal(); };

  // a deep link to a section below the hero (like /#work) skips the intro;
  // other hashes (#top, or anything a preview tool adds) still play it
  let target = null;
  try { target = location.hash && document.querySelector(location.hash); } catch (err) { target = null; }
  const deepLink = target && !hero.contains(target) && target.closest('main') && target.id !== 'main';

  if (reduce || deepLink) {
    reveal();
  } else {
    // always start at the top so the intro plays in order
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (err) { /* sandboxed */ }
    window.scrollTo(0, 0);
    setTimeout(reveal, (textDelay + FADE) * 1000);
    INPUTS.forEach((type) => window.addEventListener(type, reveal, { passive: true }));
    document.addEventListener('click', onClick);
  }
})();

/* ----------------------------------------------------------
   Work index: highlight the project in view
   ---------------------------------------------------------- */
(() => {
  const links = [...document.querySelectorAll('.work__index a')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.remove('is-active'));
      const link = byId.get(entry.target.id);
      if (link) link.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('.project').forEach((p) => io.observe(p));
})();

/* ----------------------------------------------------------
   Reveal on scroll
   ---------------------------------------------------------- */
(() => {
  const els = document.querySelectorAll('.focus__item, .project, .statement, .principles li, .words figure');
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => io.observe(el));
})();

/* ----------------------------------------------------------
   Contact panel + form
   ---------------------------------------------------------- */
(() => {
  const panel = document.getElementById('contact-panel');
  const dock = document.querySelector('.dock');
  if (!panel) return;

  const open = () => {
    panel.hidden = false;
    if (dock) dock.classList.add('is-hidden');
    const first = panel.querySelector('input');
    if (first) first.focus({ preventScroll: true });
  };
  const close = () => {
    panel.hidden = true;
    if (dock) dock.classList.remove('is-hidden');
  };

  document.querySelectorAll('[data-open-contact]').forEach((b) => b.addEventListener('click', open));
  document.querySelectorAll('[data-close-contact]').forEach((b) => b.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });

  const form = panel.querySelector('.form');
  const status = form.querySelector('.form__status');
  const button = form.querySelector('.form__send');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status mono';
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
      status.textContent = "Thanks — we'll get back to you within 24 hours.";
    } catch {
      status.classList.add('is-err');
      status.textContent = 'Something went wrong. Email contact.droplab@gmail.com instead.';
    } finally {
      button.disabled = false;
    }
  });
})();

/* ----------------------------------------------------------
   Header: tucked away over the hero index, glass once scrolled.
   Dock: hidden over the hero and contact sections.
   ---------------------------------------------------------- */
(() => {
  const top = document.querySelector('.top');
  const dock = document.querySelector('.dock');
  const hero = document.querySelector('.hero');
  const onScroll = () => top && top.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (!('IntersectionObserver' in window)) return;

  if (top && hero) {
    top.classList.add('is-tucked');
    new IntersectionObserver(([entry]) => {
      top.classList.toggle('is-tucked', entry.isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  }

  if (!dock) return;
  const hidden = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? hidden.add(e.target) : hidden.delete(e.target)));
    dock.classList.toggle('is-away', hidden.size > 0);
  }, { threshold: 0.15 });
  document.querySelectorAll('.hero, .contact').forEach((el) => io.observe(el));
})();

/* Footer year */
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
