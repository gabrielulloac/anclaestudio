# Ancla Estudio — sitio web

Sitio estático (HTML + CSS + JS, sin dependencias ni build).

- `index.html` — contenido y secciones
- `styles.css` — estilos (colores y tipografías en `:root`)
- `script.js` — menú móvil, filtro de proyectos, animaciones y formulario
- `assets/logo.svg`, `favicon.svg` — marca

Para verlo: abre `index.html` en el navegador, o `python3 -m http.server` y visita http://localhost:8000.

Se puede publicar tal cual en GitHub Pages, Netlify o Vercel.

## Figue — ilustraciones en vivo (`figue/`)

Sitio de Figue (@figue_enpapel). Abrir `figue/index.html`.

- Fotos de la galería: guárdalas en `figue/img/` y reemplaza cada `<div class="shot__ph">…</div>` por `<img src="img/archivo.jpg" alt="descripción">`.
- El formulario de reserva arma el mensaje, lo copia y abre el chat de Instagram (`IG_USER` en `figue/script.js`).
