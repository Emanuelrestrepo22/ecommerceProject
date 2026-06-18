# Changelog

Registro de cambios del proyecto, para trazabilidad integral.

## 2026-06-18 — Contador dinámico de carrito en el navbar (UC-04)

**Tipo:** Feature (frontend / client-side).
**Resumen:** ícono 🛒 con badge numérico en el navbar que muestra la cantidad total de unidades del carrito y se actualiza en vivo al agregar productos.

**Trazabilidad:**
- Caso de uso: **UC-04** (Documento Funcional, cap. 20).
- Requisitos: RF-C01, RF-C02, RF-C03 · Reglas: RN-C01, RN-C02.
- Pruebas: **TC-UI-CART-01..04** (manuales, `tests/README.md`).

**Archivos:**
- `cart-badge.js` — **nuevo**: lógica del badge (IIFE, lee `localStorage`, eventos `cart:updated` y `storage`).
- `index.js`, `cart.js` — `saveCart()` dispara `window.dispatchEvent(new Event("cart:updated"))` (cambio aditivo).
- `css/styles.css` — sección 4.1: estilos del badge.
- `index.html`, `product-list-page.html`, `product-detail-page.html`, `product-card-page.html`, `cart.html`, `review.html`, `form.html` — inclusión de `<script src="./cart-badge.js">`.
- Documentación: `DOCUMENTO-FUNCIONAL.md` (cap. 20 + alcance), `tests/README.md`.

**Pendiente de despliegue:** re-subir los archivos a S3 (`restrepo-ecommerce-frontend`) e invalidar la caché de CloudFront para que el badge aparezca en la URL pública.

## 2026-06-17 — Despliegue serverless del CRUD de reseñas

CRUD de reseñas sobre AWS (S3 + CloudFront + API Gateway + Lambda + DynamoDB). Frontend con formulario de reseñas y rating de estrellas. Suite QA `TC-API-REVIEWS-01..07` (8/8 PASS). Documento técnico y diagrama de arquitectura.
