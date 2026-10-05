// Droplab Studio — interactions. The page still works without JS.

/* ----------------------------------------------------------
   Hero intro: the sequence itself is pure CSS (see styles.css).
   Here we only make sure a fresh load starts at the top so it
   plays in order (unless the URL deep-links to a section).
   ---------------------------------------------------------- */
(() => {
  if (document.documentElement.classList.contains('skip-intro')) return;
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (err) { /* sandboxed */ }
  window.scrollTo(0, 0);
})();

/* ----------------------------------------------------------
   Section indexes (Focus, Work, About): highlight the item in view
   ---------------------------------------------------------- */
(() => {
  if (!('IntersectionObserver' in window)) return;
  document.querySelectorAll('.work__index').forEach((index) => {
    const links = [...index.querySelectorAll('a')];
    const targets = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => io.observe(t));
  });
})();

/* ----------------------------------------------------------
   Reveal on scroll
   ---------------------------------------------------------- */
(() => {
  const els = document.querySelectorAll('.project');
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
  document.querySelectorAll('.hero, .about, .contact').forEach((el) => io.observe(el));
})();

/* Footer year */
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
