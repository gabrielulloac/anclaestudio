(() => {
  const IG = { productos: 'figue_ilustraciones', eventos: 'figue_enpapel' };

  document.getElementById('year').textContent = new Date().getFullYear();

  // Nav
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Aparición al hacer scroll
  const targets = document.querySelectorAll('.section__head, .split > *, .event, .steps li, .shot');
  if ('IntersectionObserver' in window) {
    targets.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    targets.forEach((el) => io.observe(el));
  }

  // Filtro de galería
  const filters = document.querySelectorAll('.filter');
  const shots = document.querySelectorAll('.shot');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    const cat = btn.dataset.filter;
    filters.forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    shots.forEach((el) => {
      const show = cat === 'all' || el.dataset.cat === cat;
      el.classList.toggle('is-hidden', !show);
      if (show) el.classList.add('is-visible');
    });
  }));

  // Formulario: muestra campos según el servicio
  const form = document.getElementById('booking');
  const servicio = document.getElementById('servicio');
  const syncFields = () => {
    form.querySelectorAll('[data-only]').forEach((el) => { el.hidden = el.dataset.only !== servicio.value; });
  };
  servicio.addEventListener('change', syncFields);
  syncFields();
  document.getElementById('fecha').min = new Date().toISOString().slice(0, 10);

  // Enlaces "#eventos"/"#productos" en la sección de servicios preseleccionan el formulario
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
      status.textContent = 'Escribe tu nombre y cuéntame tu idea para preparar el mensaje.';
      status.className = 'form__status is-error';
      return;
    }

    const d = new FormData(form);
    const svc = servicio.value;
    const lines = [];
    if (svc === 'eventos') {
      lines.push(`¡Hola Figue! Soy ${d.get('nombre')} y quiero cotizar retratos en acuarela en vivo.`);
      lines.push(`• Evento: ${d.get('tipo')}`);
      if (d.get('fecha')) {
        const f = new Date(d.get('fecha') + 'T12:00').toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
        lines.push(`• Fecha: ${f}`);
      }
    } else {
      lines.push(`¡Hola Figue! Soy ${d.get('nombre')} y me interesa una ilustración para mi producto.`);
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
      ? `¡Mensaje copiado! Abre el chat de @${user} y pégalo. `
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
