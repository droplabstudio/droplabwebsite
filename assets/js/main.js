// Droplab Studio — interactions. The page still works without JS.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----------------------------------------------------------
   Hero: ASCII liquid drop field
   Metaballs rendered as characters. The main drop wobbles,
   satellites orbit and merge, a droplet falls from the bottom,
   and one blob follows the cursor (seen through a glass lens).
   ---------------------------------------------------------- */
(() => {
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('.hero__field');
  if (!hero || !canvas) return;
  const ctx = canvas.getContext('2d');
  const lens = hero.querySelector('.lens');
  const outX = hero.querySelector('[data-x]');
  const outY = hero.querySelector('[data-y]');

  const RAMP = ' .,:;-=+*x%#&@'; // light → dense
  const FONT_SIZE = 12;
  const LINE = 13;
  const INK = '#111111';
  const MID = '#8c8c88';
  const FAINT = '#c9c9c4';

  let W = 0, H = 0, dpr = 1, cw = 7.2, cols = 0, rows = 0;
  let running = false, visible = true, raf = 0;
  const start = performance.now();

  const mouse = { x: 0.62, y: 0.42, tx: 0.62, ty: 0.42, r: 0, tr: 0, inside: false };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${FONT_SIZE}px "Geist Mono", ui-monospace, Menlo, monospace`;
    ctx.textBaseline = 'top';
    cw = ctx.measureText('M').width || 7.2;
    cols = Math.ceil(W / cw);
    rows = Math.ceil(H / LINE);
    if (!running) draw(reduceMotion ? 12 : (performance.now() - start) / 1000);
  }

  function balls(t) {
    const S = Math.min(W * 1.5, H * 1.15);
    const cx = W * (W > 760 ? 0.56 : 0.5);
    const cy = H * 0.47;
    const R = S * 0.13;
    const wob = Math.sin(t * 0.9) * 0.04;
    const list = [
      // teardrop: body + a tapering chain for the tip
      [cx + S * 0.01 * Math.sin(t * 0.6), cy + S * 0.01 * Math.cos(t * 0.8), R],
      [cx + R * wob * 2, cy - R * 1.05, R * 0.56],
      [cx + R * wob * 4, cy - R * 1.7, R * 0.3],
      [cx + R * wob * 6, cy - R * 2.15, R * 0.14],
      // satellites
      [cx + S * 0.29 * Math.cos(t * 0.31), cy + S * 0.13 * Math.sin(t * 0.47), S * 0.05],
      [cx - S * 0.26 * Math.cos(t * 0.23 + 2), cy + S * 0.2 * Math.sin(t * 0.19 + 1), S * 0.038],
      [cx + S * 0.34 * Math.sin(t * 0.17 + 4), cy - S * 0.12 * Math.cos(t * 0.29), S * 0.028],
    ];
    // falling droplet
    const p = (t * 0.11) % 1;
    list.push([cx + S * 0.01 * Math.sin(t * 2), cy + R * 0.7 + S * p * 0.42, S * 0.04 * Math.sqrt(Math.sin(Math.PI * p))]);
    // cursor blob
    if (mouse.r > 0.001) list.push([mouse.x * W, mouse.y * H, S * 0.06 * mouse.r]);
    return list;
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const bs = balls(t);
    const n = bs.length;
    const lines = { ink: [], mid: [], faint: [] };

    for (let j = 0; j < rows; j++) {
      const y = j * LINE + LINE / 2;
      let sInk = '', sMid = '', sFaint = '';
      for (let i = 0; i < cols; i++) {
        const x = i * cw + cw / 2;
        let f = 0, hl = 0;
        for (let k = 0; k < n; k++) {
          const b = bs[k];
          const dx = x - b[0], dy = y - b[1];
          const r2 = b[2] * b[2];
          const q = r2 / (dx * dx + dy * dy + 1);
          f += q * q; // sharper falloff keeps blobs crisp
          // specular highlight up-left of each blob
          const hx = x - (b[0] - b[2] * 0.38), hy = y - (b[1] - b[2] * 0.42);
          hl += Math.exp(-(hx * hx + hy * hy) / (r2 * 0.05 + 1));
        }

        let ch = ' ', tone = 0; // 0 none, 1 faint, 2 mid, 3 ink
        if (f >= 1) {
          const depth = 1 - 1 / Math.sqrt(f);
          let v = 0.18 + depth * 0.95 - Math.min(hl, 1) * 1.1;
          v = Math.max(0, Math.min(0.92, v));
          ch = RAMP[1 + Math.floor(v * (RAMP.length - 2))] || '.';
          tone = v > 0.5 ? 3 : 2;
        } else if (f > 0.3) {
          const v = (f - 0.3) / 0.7;
          ch = RAMP[1 + Math.floor(v * 3)];
          tone = 2;
        } else if (i % 12 === 0 && j % 6 === 0) {
          ch = '+';
          tone = 1;
        }

        sInk += tone === 3 ? ch : ' ';
        sMid += tone === 2 ? ch : ' ';
        sFaint += tone === 1 ? ch : ' ';
      }
      lines.ink.push(sInk); lines.mid.push(sMid); lines.faint.push(sFaint);
    }

    const paint = (arr, color) => {
      ctx.fillStyle = color;
      for (let j = 0; j < arr.length; j++) ctx.fillText(arr[j], 0, j * LINE);
    };
    paint(lines.faint, FAINT);
    paint(lines.mid, MID);
    paint(lines.ink, INK);
  }

  function frame(now) {
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    mouse.r += (mouse.tr - mouse.r) * 0.06;
    draw((now - start) / 1000);
    raf = requestAnimationFrame(frame);
  }

  function play() {
    if (running || reduceMotion || !visible) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    mouse.tx = px / rect.width;
    mouse.ty = py / rect.height;
    mouse.tr = 1;
    if (e.pointerType === 'mouse') {
      hero.classList.add('is-hover');
      if (lens) lens.style.transform = `translate(${px}px, ${py}px)`;
    }
    if (outX) outX.textContent = mouse.tx.toFixed(3);
    if (outY) outY.textContent = mouse.ty.toFixed(3);
    if (reduceMotion) { mouse.x = mouse.tx; mouse.y = mouse.ty; mouse.r = 1; draw(12); }
  });
  hero.addEventListener('pointerleave', () => {
    mouse.tr = 0;
    hero.classList.remove('is-hover');
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? play() : pause();
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));

  window.addEventListener('resize', resize);
  resize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  play();
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
  const els = document.querySelectorAll('.project, .statement, .principles li, .words figure');
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
   Header glass once scrolled; dock hidden over hero/contact
   ---------------------------------------------------------- */
(() => {
  const top = document.querySelector('.top');
  const dock = document.querySelector('.dock');
  const onScroll = () => top && top.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (!dock || !('IntersectionObserver' in window)) return;
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
