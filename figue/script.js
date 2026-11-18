(() => {
  const IG = { productos: 'figue_ilustraciones', eventos: 'figue_enpapel' };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Títulos palabra por palabra ---------- */
  let wi = 0;
  const splitNode = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'w';
          const inner = document.createElement('span');
          inner.textContent = part;
          inner.style.setProperty('--i', wi++);
          w.appendChild(inner);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        splitNode(child);
      }
    });
  };
  document.querySelectorAll('[data-split]').forEach((el) => { wi = 0; splitNode(el); });

  /* ---------- Aparición al hacer scroll ---------- */
  const revealSel = '.section__head > p, .hero__lead, .hero__cta, .hero .label, .lead, .path, .col, .steps li, .shot, .swatch-card, .specs div, .faq details, .contact-list li, .form, .colorways__head, .gallery__more, .plate--event';
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  document.querySelectorAll(revealSel).forEach((el) => {
    // En teléfono, las tarjetas de un carrusel aparecen junto con su carrusel
    if (mobile && el.parentElement.classList.contains('swipe')) { el.classList.add('is-in'); return; }
    el.setAttribute('data-reveal', '');
    const sibs = [...el.parentElement.children].filter((s) => s.matches(revealSel));
    const idx = sibs.indexOf(el);
    if (idx > 0) el.style.setProperty('--rd', `${Math.min(idx, 6) * 90}ms`);
  });
  if (mobile) document.querySelectorAll('.swipe').forEach((el) => el.setAttribute('data-reveal', ''));
  const toWatch = document.querySelectorAll('[data-reveal], [data-split]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    toWatch.forEach((el) => io.observe(el));
  } else {
    toWatch.forEach((el) => el.classList.add('is-in'));
  }
  requestAnimationFrame(() => document.querySelector('.hero h1')?.classList.add('is-in'));

  /* ---------- Nav ---------- */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));

  /* ---------- Bucle: franja, parallax, nav ---------- */
  const track = document.querySelector('.marquee__track');
  const heroArt = document.querySelector('.hero__art');
  const stamp = document.querySelector('.stamp');
  let lastY = window.scrollY;
  let velocity = 0;
  let x = 0;

  const frame = () => {
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    velocity += (Math.abs(dy) - velocity) * 0.1;

    nav.classList.toggle('is-scrolled', y > 8);
    if (!menu.classList.contains('is-open')) {
      if (dy > 4 && y > 200) nav.classList.add('is-hidden');
      else if (dy < -4) nav.classList.remove('is-hidden');
    }

    if (!reduce) {
      if (track) {
        x -= 0.6 + velocity * 0.25;
        const half = track.scrollWidth / 2;
        if (-x >= half) x += half;
        track.style.transform = `translate3d(${x}px,0,0)`;
      }
      if (heroArt && y < window.innerHeight * 1.2) {
        heroArt.style.transform = `translate3d(0, ${y * -0.08}px, 0)`;
        if (stamp) stamp.style.translate = `0 ${y * -0.12}px`;
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  /* ---------- Cursor propio ---------- */
  const cursor = document.querySelector('.cursor');
  if (cursor && fine && !reduce) {
    const label = cursor.querySelector('span');
    let cx = -100, cy = -100, tx = -100, ty = -100;
    window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; cursor.classList.add('is-on'); }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor]');
      cursor.classList.toggle('is-big', !!t);
      if (t) label.textContent = t.dataset.cursor;
    });
    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }


  /* ---------- Carruseles para deslizar (teléfono) ---------- */
  const swipeUIs = [];
  document.querySelectorAll('.swipe').forEach((sw) => {
    const ui = document.createElement('div');
    ui.className = 'swipe-ui';
    ui.innerHTML = '<div class="swipe-ui__dots" role="group" aria-label="Elegir tarjeta"></div><span class="swipe-ui__hint">Desliza <span aria-hidden="true">→</span></span>';
    sw.after(ui);
    const dots = ui.querySelector('.swipe-ui__dots');
    const items = () => [...sw.children].filter((c) => !c.classList.contains('is-hidden'));
    const build = () => {
      dots.innerHTML = '';
      items().forEach((item, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Ir a la tarjeta ${i + 1}`);
        b.addEventListener('click', () => sw.scrollTo({ left: item.offsetLeft - sw.firstElementChild.offsetLeft, behavior: reduce ? 'auto' : 'smooth' }));
        dots.appendChild(b);
      });
      sync();
    };
    const sync = () => {
      const list = items();
      if (!list.length) return;
      const start = list[0].offsetLeft;
      let idx = 0;
      list.forEach((item, i) => { if (sw.scrollLeft >= item.offsetLeft - start - item.offsetWidth / 2) idx = i; });
      if (sw.scrollLeft + sw.clientWidth >= sw.scrollWidth - 4) idx = list.length - 1;
      [...dots.children].forEach((d, i) => d.setAttribute('aria-current', String(i === idx)));
      ui.querySelector('.swipe-ui__hint').style.visibility = idx === list.length - 1 ? 'hidden' : 'visible';
    };
    sw.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    window.addEventListener('resize', sync);
    build();
    swipeUIs.push({ sw, build });
  });

  /* ---------- Ver más (teléfono) ---------- */
  document.querySelectorAll('[data-collapse]').forEach((box) => {
    const n = Number(box.dataset.collapse);
    const kids = [...box.children];
    if (kids.length <= n) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'more-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = box.dataset.more;
    const set = (open) => {
      kids.forEach((k, i) => k.classList.toggle('is-extra', !open && i >= n));
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? box.dataset.less : box.dataset.more;
    };
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      set(open);
      if (open) kids[n].querySelector('summary, dt')?.focus?.();
      else box.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    });
    box.after(btn);
    set(false);
  });

  /* ---------- Botón fijo para cotizar (teléfono) ---------- */
  const cta = document.querySelector('.mobile-cta');
  if (cta && 'IntersectionObserver' in window) {
    let heroVisible = true, contactVisible = false;
    const upd = () => cta.classList.toggle('is-shown', !heroVisible && !contactVisible);
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; upd(); }).observe(document.querySelector('.hero__cta'));
    new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; upd(); }, { threshold: 0.05 }).observe(document.getElementById('contacto'));
    new IntersectionObserver(([e]) => { if (e.isIntersecting) { contactVisible = true; upd(); } }).observe(document.querySelector('.footer'));
  }

  /* ---------- Filtro de galería ---------- */
  const filters = document.querySelectorAll('.filter');
  const shots = document.querySelectorAll('.shot');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    const cat = btn.dataset.filter;
    filters.forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    shots.forEach((el) => {
      const show = cat === 'all' || el.dataset.cat === cat;
      el.classList.toggle('is-hidden', !show);
      if (show) el.classList.add('is-in');
    });
    swipeUIs.forEach(({ sw, build }) => { if (sw.classList.contains('gallery')) { sw.scrollLeft = 0; build(); } });
  }));

  /* ---------- Formulario ---------- */
  const form = document.getElementById('booking');
  const servicio = document.getElementById('servicio');
  const syncFields = () => {
    form.querySelectorAll('[data-only]').forEach((el) => { el.hidden = el.dataset.only !== servicio.value; });
  };
  servicio.addEventListener('change', syncFields);
  syncFields();
  document.getElementById('fecha').min = new Date().toISOString().slice(0, 10);

  document.querySelectorAll('.path').forEach((a) => a.addEventListener('click', () => {
    servicio.value = a.getAttribute('href').slice(1);
    syncFields();
  }));

  const status = form.querySelector('.form__status');
  const preview = form.querySelector('.form__preview');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach((f) => {
      const valid = f.value.trim() !== '';
      f.closest('.field').classList.toggle('has-error', !valid);
      f.setAttribute('aria-invalid', String(!valid));
      if (!valid) ok = false;
    });
    if (!ok) {
      status.textContent = 'Escribe tu nombre y los detalles del proyecto para preparar el mensaje.';
      status.className = 'form__status is-error';
      return;
    }

    const d = new FormData(form);
    const svc = servicio.value;
    const lines = [];
    if (svc === 'eventos') {
      lines.push(`Hola Figue, soy ${d.get('nombre')} y quiero cotizar retratos en acuarela en vivo.`);
      lines.push(`• Evento: ${d.get('tipo')}`);
      if (d.get('fecha')) {
        const f = new Date(d.get('fecha') + 'T12:00').toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
        lines.push(`• Fecha: ${f}`);
      }
    } else {
      lines.push(`Hola Figue, soy ${d.get('nombre')} y me interesa una ilustración para mi producto.`);
      lines.push(`• Producto: ${d.get('producto')}`);
    }
    if (d.get('lugar').trim()) lines.push(`• Ciudad: ${d.get('lugar').trim()}`);
    lines.push('', d.get('mensaje').trim());
    const msg = lines.join('\n');

    preview.textContent = msg;
    preview.hidden = false;

    let copied = false;
    try { await navigator.clipboard.writeText(msg); copied = true; } catch (_) { /* sin permiso */ }

    const user = IG[svc];
    status.textContent = copied
      ? `Mensaje copiado. Abre el chat de @${user} y pégalo. `
      : `Copia este mensaje y pégalo en el chat de @${user}. `;
    const a = document.createElement('a');
    a.href = `https://ig.me/m/${user}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Abrir chat de Instagram ↗';
    status.appendChild(a);
    status.className = 'form__status is-ok';
    if (!copied) {
      const r = document.createRange();
      r.selectNodeContents(preview);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    }
  });
})();
