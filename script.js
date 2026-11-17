(() => {
  // Año en el footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Borde del nav al hacer scroll
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menú móvil
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
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-visible'));
  }

  // Filtro de proyectos
  const filters = document.querySelectorAll('.filter');
  const projects = document.querySelectorAll('.project');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filters.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      projects.forEach((p) => {
        const show = cat === 'all' || p.dataset.cat === cat;
        p.classList.toggle('is-hidden', !show);
        if (show) p.classList.add('is-visible');
      });
    });
  });

  // Formulario de contacto: valida y abre el cliente de correo.
  // Para recibir mensajes sin mailto, conecta un servicio como Formspree o Netlify Forms.
  const form = document.getElementById('contact-form');
  const status = form.querySelector('.form__status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach((field) => {
      const ok = field.type === 'email'
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())
        : field.value.trim().length > 0;
      field.closest('.field').classList.toggle('has-error', !ok);
      field.setAttribute('aria-invalid', String(!ok));
      if (!ok) valid = false;
    });

    if (!valid) {
      status.textContent = 'Revisa los campos marcados.';
      status.className = 'form__status is-error';
      return;
    }

    const data = new FormData(form);
    const subject = `Nuevo proyecto: ${data.get('servicio')} — ${data.get('nombre')}`;
    const body = `Nombre: ${data.get('nombre')}\nEmail: ${data.get('email')}\nServicio: ${data.get('servicio')}\n\n${data.get('mensaje')}`;
    window.location.href = `mailto:hola@anclaestudio.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = '¡Gracias! Abrimos tu correo para enviar el mensaje.';
    status.className = 'form__status is-ok';
  });
})();
