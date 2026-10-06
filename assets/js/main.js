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
   Work: first row only, "View all" expands the rest.
   Links to a hidden project (like the hero's) open the list first.
   ---------------------------------------------------------- */
(() => {
  const work = document.querySelector('.work');
  const btn = document.querySelector('.work__toggle');
  if (!work || !btn) return;
  const set = (open) => {
    work.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? 'Show less' : 'View all';
  };
  btn.hidden = false;
  btn.addEventListener('click', () => {
    const open = !work.classList.contains('is-open');
    set(open);
    if (!open) work.scrollIntoView({ block: 'start' });
  });
  const reveal = (hash) => {
    const el = /^#p-[\w-]+$/.test(hash) && document.querySelector(hash);
    if (el && el.offsetParent === null) { set(true); el.scrollIntoView(); }
  };
  document.querySelectorAll('a[href^="#p-"]').forEach((a) => a.addEventListener('click', () => reveal(a.getAttribute('href'))));
  window.addEventListener('hashchange', () => reveal(location.hash));
  reveal(location.hash);
})();

/* ----------------------------------------------------------
   About statement: reads "Droplab Studio / is a digital lab…" only once it
   is pinned under the header brand, so it shows from that point on
   ---------------------------------------------------------- */
(() => {
  const st = document.querySelector('.about__lead .statement');
  if (!st) return;
  let queued = false;
  const check = () => {
    queued = false;
    const pinTop = parseFloat(getComputedStyle(st).top) || 0;
    // measure the container: the statement's own box moves while it slides in
    st.classList.toggle('is-pinned', st.parentElement.getBoundingClientRect().top <= pinTop + 1);
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  check();
})();

/* ----------------------------------------------------------
   Reveal on scroll
   ---------------------------------------------------------- */
(() => {
  const els = document.querySelectorAll('.focus__item, .project, .words figure');
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

  // the same buttons close the form again if it's already open
  document.querySelectorAll('[data-open-contact]').forEach((b) => b.addEventListener('click', () => (panel.hidden ? open() : close())));
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
   Header: glass once scrolled.
   Dock: hidden over the hero and contact sections.
   ---------------------------------------------------------- */
(() => {
  const top = document.querySelector('.top');
  const dock = document.querySelector('.dock');
  const onScroll = () => top && top.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (!('IntersectionObserver' in window)) return;

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
