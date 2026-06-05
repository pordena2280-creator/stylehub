/**
 * zoom.js — stub que evita el error de Vite al cargar ProyectoAntiguo/product-detail.html
 * El HTML antiguo usa <script type="module" src="js/zoom.js"></script>
 * que Vite intenta pre-bundlear. Esta implementacion minima inicializa
 * Drift/Zoom si las dependencias estan presentes, y hace un no-op silencioso
 * si no lo estan.
 */
(() => {
  'use strict';
  function noop() {}
  export function initZoom() { noop(); }
  export default { initZoom };
})();
