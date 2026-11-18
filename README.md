# Ancla Estudio — sitio web

Sitio estático (HTML + CSS + JS, sin dependencias ni build).

- `index.html` — contenido y secciones
- `styles.css` — estilos (colores y tipografías en `:root`)
- `script.js` — menú móvil, filtro de proyectos, animaciones y formulario
- `assets/logo.svg`, `favicon.svg` — marca

Para verlo: abre `index.html` en el navegador, o `python3 -m http.server` y visita http://localhost:8000.

Se puede publicar tal cual en GitHub Pages, Netlify o Vercel.

## Figue (`figue/`)

Sitio de Figue, artista: ilustración para productos, textiles y papelería (@figue_ilustraciones) y retratos en acuarela en vivo para eventos (@figue_enpapel). Abrir `figue/index.html`.

- Fotos de la galería: guárdalas en `figue/img/` y reemplaza cada `<div class="shot__ph">…</div>` por `<img src="img/archivo.jpg" alt="descripción">`. El atributo `data-cat` (`productos` o `eventos`) define el filtro.
- El formulario arma el mensaje, lo copia y enlaza al chat de Instagram de la cuenta que corresponde (`IG` en `figue/script.js`).
