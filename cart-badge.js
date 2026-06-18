// ============================================================
// cart-badge.js — Contador (badge) del carrito en el navbar
// Vanilla JS, sin dependencias. Se carga en todas las páginas
// con navbar. NO declara la global `carrito` (la declaran
// index.js/cart.js): lee localStorage fresco dentro de funciones
// con scope propio para evitar redeclaración (SyntaxError).
// ============================================================
(function () {
  "use strict";

  // Lee el carrito persistido y devuelve la suma de cantidades.
  // Tolerante a datos corruptos o ausentes: ante error, total 0.
  function getCartCount() {
    try {
      const raw = localStorage.getItem("carrito");
      const items = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(items)) return 0;
      return items.reduce(function (acc, item) {
        const n = Number(item && item.cantidad);
        return acc + (Number.isFinite(n) && n > 0 ? n : 0);
      }, 0);
    } catch (e) {
      return 0;
    }
  }

  // Inyecta el ícono 🛒 y el <span> del badge dentro del link
  // <a href="cart.html"> del navbar, una sola vez. Idempotente.
  function ensureBadgeElements() {
    const cartLink = document.querySelector('.nav-list a[href="cart.html"]');
    if (!cartLink) return null;

    let badge = cartLink.querySelector(".cart-badge");
    if (badge) return badge; // ya inyectado

    // Reescribe el contenido del link conservando el texto "Carrito".
    const label = (cartLink.textContent || "Carrito").trim();
    cartLink.classList.add("cart-link");
    cartLink.innerHTML =
      '<span class="cart-icon" aria-hidden="true">🛒</span>' +
      '<span class="cart-link-text">' + label + "</span>" +
      '<span class="cart-badge" hidden aria-hidden="true">0</span>';

    return cartLink.querySelector(".cart-badge");
  }

  // Actualiza el badge según el estado persistido.
  function renderCartBadge() {
    const badge = ensureBadgeElements();
    if (!badge) return;

    const count = getCartCount();
    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.hidden = false;
      badge.removeAttribute("aria-hidden");
      badge.setAttribute("aria-label", count + " productos en el carrito");
    } else {
      badge.textContent = "0";
      badge.hidden = true;
      badge.setAttribute("aria-hidden", "true");
      badge.removeAttribute("aria-label");
    }
  }

  // Exponer por si se quiere invocar manualmente.
  window.renderCartBadge = renderCartBadge;

  // Estado inicial al cargar la página.
  document.addEventListener("DOMContentLoaded", renderCartBadge);

  // Actualización en vivo en la misma pestaña (lo dispara saveCart()).
  window.addEventListener("cart:updated", renderCartBadge);

  // Sincronización entre pestañas: 'storage' se dispara en las OTRAS
  // pestañas cuando cambia localStorage.
  window.addEventListener("storage", function (e) {
    if (!e || e.key === null || e.key === "carrito") {
      renderCartBadge();
    }
  });
})();
