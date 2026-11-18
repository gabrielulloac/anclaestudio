(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Títulos palabra por palabra ---------- */
  const splitNode = (node, counter) => {
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
          inner.style.setProperty('--i', counter.n++);
          w.appendChild(inner);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) splitNode(child, counter);
    });
  };
  document.querySelectorAll('[data-split]').forEach((el) => splitNode(el, { n: 0 }));

  /* ---------- Aparición al hacer scroll ---------- */
  const revealSel = '.about__text > p, .about__photo, .person, .pillar, .story, .section__head > p, .filters, .tabs, .packs, .panel__intro, .process li, .inc, .faq details, .contact-list li, .form';
  document.querySelectorAll(revealSel).forEach((el) => {
    if (mobile && el.parentElement.classList.contains('swipe')) { el.classList.add('is-in'); return; }
    el.setAttribute('data-reveal', '');
    const sibs = [...el.parentElement.children].filter((s) => s.matches(revealSel));
    const idx = sibs.indexOf(el);
    if (idx > 0) el.style.setProperty('--rd', `${Math.min(idx % 6, 5) * 80}ms`);
  });
  if (mobile) document.querySelectorAll('.swipe').forEach((el) => el.setAttribute('data-reveal', ''));
  const watch = document.querySelectorAll('[data-reveal], [data-split]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    watch.forEach((el) => io.observe(el));
  } else watch.forEach((el) => el.classList.add('is-in'));

  /* ---------- Nav ---------- */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    nav.classList.remove('is-hidden');
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (!menu.classList.contains('is-open')) {
      if (y - lastY > 6 && y > 300) nav.classList.add('is-hidden');
      else if (lastY - y > 6) nav.classList.remove('is-hidden');
    }
    lastY = y;
  }, { passive: true });

  /* ---------- Carrusel del inicio ---------- */
  const hero = document.querySelector('.hero');
  const slides = [...hero.querySelectorAll('.slide')];
  const dotsBox = hero.querySelector('.hero__dots');
  let current = 0;
  let timer = null;
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Foto ${i + 1} de ${slides.length}`);
    b.addEventListener('click', () => { go(i); restart(); });
    dotsBox.appendChild(b);
    return b;
  });
  const go = (i) => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      const on = k === current;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', String(!on));
      if (on) { const ph = s.querySelector('.ph'); ph.style.animation = 'none'; void ph.offsetWidth; ph.style.animation = ''; }
    });
    dots.forEach((d, k) => d.setAttribute('aria-current', String(k === current)));
  };
  const restart = () => {
    clearInterval(timer);
    if (!reduce) timer = setInterval(() => go(current + 1), 6000);
  };
  hero.querySelector('.hero__arrow--prev').addEventListener('click', () => { go(current - 1); restart(); });
  hero.querySelector('.hero__arrow--next').addEventListener('click', () => { go(current + 1); restart(); });
  let touchX = null;
  hero.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1)); restart(); }
    touchX = null;
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : restart()));
  go(0);
  restart();
  requestAnimationFrame(() => hero.querySelector('[data-split]')?.classList.add('is-in'));

  /* ---------- Carruseles para deslizar (teléfono) ---------- */
  document.querySelectorAll('.swipe').forEach((sw) => {
    const ui = document.createElement('div');
    ui.className = 'swipe-ui';
    ui.innerHTML = '<div class="swipe-ui__dots" role="group" aria-label="Elegir tarjeta"></div><span class="swipe-ui__hint">Desliza <span aria-hidden="true">→</span></span>';
    sw.after(ui);
    const box = ui.querySelector('.swipe-ui__dots');
    const items = [...sw.children];
    items.forEach((item, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Ir a la tarjeta ${i + 1}`);
      b.addEventListener('click', () => sw.scrollTo({ left: item.offsetLeft - items[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' }));
      box.appendChild(b);
    });
    const sync = () => {
      const start = items[0].offsetLeft;
      let idx = 0;
      items.forEach((item, i) => { if (sw.scrollLeft >= item.offsetLeft - start - item.offsetWidth / 2) idx = i; });
      if (sw.scrollLeft + sw.clientWidth >= sw.scrollWidth - 4) idx = items.length - 1;
      [...box.children].forEach((d, i) => d.setAttribute('aria-current', String(i === idx)));
      ui.querySelector('.swipe-ui__hint').style.visibility = idx === items.length - 1 ? 'hidden' : 'visible';
    };
    sw.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* ---------- Ver más ---------- */
  const collapsers = [];
  document.querySelectorAll('[data-collapse]').forEach((box) => {
    if (box.hasAttribute('data-mobile-only') && !mobile) return;
    const n = Number(box.dataset.collapse);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'more-btn';
    box.after(btn);
    let open = false;
    const apply = () => {
      const visible = [...box.children].filter((k) => !k.classList.contains('is-hidden'));
      [...box.children].forEach((k) => k.classList.remove('is-extra'));
      if (!open) visible.slice(n).forEach((k) => k.classList.add('is-extra'));
      btn.hidden = visible.length <= n;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? box.dataset.less : box.dataset.more;
    };
    btn.addEventListener('click', () => {
      open = !open;
      apply();
      if (open) box.querySelectorAll('.is-in, [data-reveal]').forEach((k) => k.classList.add('is-in'));
      else box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    });
    apply();
    collapsers.push({ box, reset: () => { open = false; apply(); } });
  });

  /* ---------- Filtro del portafolio ---------- */
  const filters = document.querySelectorAll('.filter');
  const stories = document.querySelectorAll('.story');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    const cat = btn.dataset.filter;
    filters.forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    stories.forEach((s) => {
      s.classList.toggle('is-hidden', !(cat === 'all' || s.dataset.cat === cat));
      s.classList.add('is-in');
    });
    collapsers.forEach((c) => { if (c.box.classList.contains('stories')) c.reset(); });
  }));

  /* ---------- Pestañas de servicios ---------- */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });
  // Al abrir un paquete, cerrar los otros del mismo panel
  document.querySelectorAll('.packs').forEach((list) => list.addEventListener('toggle', (e) => {
    if (e.target.open) list.querySelectorAll('details[open]').forEach((d) => { if (d !== e.target) d.open = false; });
  }, true));

  /* ---------- Botón fijo para cotizar (teléfono) ---------- */
  const cta = document.querySelector('.mobile-cta');
  if (cta && 'IntersectionObserver' in window) {
    let heroOn = true, contactOn = false, footOn = false;
    const upd = () => cta.classList.toggle('is-shown', !heroOn && !contactOn && !footOn);
    new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(([e]) => { contactOn = e.isIntersecting; upd(); }).observe(document.getElementById('contacto'));
    new IntersectionObserver(([e]) => { footOn = e.isIntersecting; upd(); }).observe(document.querySelector('.footer'));
  }

  /* ---------- Formulario: arma el mensaje para copiar ---------- */
  const form = document.getElementById('quote');
  const status = form.querySelector('.form__status');
  const preview = form.querySelector('.form__preview');
  document.getElementById('q-fecha').min = new Date().toISOString().slice(0, 10);
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
      status.textContent = 'Escribe tu nombre y qué necesitas para preparar el mensaje.';
      status.className = 'form__status is-error';
      return;
    }
    const d = new FormData(form);
    const lines = [`Hola, soy ${d.get('nombre')} y quiero cotizar: ${d.get('tipo')}.`];
    if (d.get('fecha')) lines.push(`• Fecha: ${new Date(d.get('fecha') + 'T12:00').toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    if (d.get('lugar').trim()) lines.push(`• Lugar: ${d.get('lugar').trim()}`);
    lines.push('', d.get('mensaje').trim());
    const msg = lines.join('\n');
    preview.textContent = msg;
    preview.hidden = false;
    let copied = false;
    try { await navigator.clipboard.writeText(msg); copied = true; } catch (_) { /* sin permiso */ }
    status.textContent = copied ? 'Mensaje copiado. Pégalo en WhatsApp o en un correo.' : 'Copia este mensaje y pégalo en WhatsApp o en un correo.';
    status.className = 'form__status';
  });
})();
