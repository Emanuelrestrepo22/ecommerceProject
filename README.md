# 🛍️ Rick and Morty Store — E-commerce Serverless en AWS

Trabajo Práctico Final de la materia **Arquitectura de Sistemas en la Nube con AWS** (IFTS 16).
E-commerce estático (temática Rick and Morty) con un **módulo de reseñas que implementa un CRUD real sobre AWS**, 100% serverless.

🔗 **URL pública (en vivo):** https://d2mb47m6hnir3o.cloudfront.net
🔗 **API base:** https://tvsz0deee9.execute-api.us-east-1.amazonaws.com

---

## Arquitectura — Serverless (Opción C)

```
Navegador → CloudFront (HTTPS) → S3 (bucket privado, OAC)         [frontend estático]
                │ fetch()
                ▼
         API Gateway (HTTP API) → Lambda (Python) → DynamoDB       [CRUD de reseñas]
```

| Componente | Servicio AWS | Rol |
|------------|--------------|-----|
| Frontend estático | S3 + CloudFront | Hosting + HTTPS/CDN (bucket privado vía OAC) |
| API REST | API Gateway (HTTP API) | Rutas `GET/POST/DELETE /reviews` + CORS |
| Lógica | Lambda (Python + boto3) | CRUD de reseñas, enruta por `routeKey` |
| Base de datos | DynamoDB (`restrepo-review`) | Persistencia de reseñas (PK `id`) |
| Permisos | IAM (`lab-lambda-exec`) | Rol de ejecución, sin credenciales en el código |

---

## Funcionalidades

- **Reseñas (CRUD sobre AWS):** crear, listar y eliminar reseñas con persistencia en DynamoDB. Rating con widget de estrellas interactivo.
- **Catálogo de productos:** consume la [Rick and Morty API](https://rickandmortyapi.com/) para mostrar personajes como productos.
- **Carrito client-side:** agregar/quitar productos (localStorage) con **contador dinámico (badge 🛒)** en el navbar que se actualiza en vivo.
- **Diseño responsivo** (Bootstrap 5 + CSS propio) y formulario de contacto.

---

## Estructura del repositorio

```
ecommerceProject/
├── index.html, product-*.html, cart.html, review.html, form.html   # páginas
├── index.js, cart.js, reviews-api.js, review-and-form.js           # lógica frontend
├── cart-badge.js                                                   # contador de carrito
├── config.js                                                       # URL pública de la API (sin secretos)
├── css/ , img/                                                     # estilos y assets
├── lambda/lambda_function.py                                       # backend (Lambda Python)
├── tests/api-smoke.sh , tests/README.md                           # QA automatizado de la API
├── diagrama-arquitectura.drawio / .svg                            # diagrama de arquitectura
├── DOCUMENTO-FUNCIONAL.md                                          # documento funcional de definición
├── DEFENSA.md                                                      # guion de defensa
├── PLAN-AWS.md , CHANGELOG.md                                      # plan y registro de cambios
└── dist/                                                           # build a desplegar (gitignored)
```

---

## Despliegue (resumen)

1. **DynamoDB:** tabla `restrepo-review`, PK `id` (String), on-demand.
2. **Lambda:** `restrepo-review-api` (Python 3.13), código en `lambda/lambda_function.py`, var `TABLE_NAME=restrepo-review`, rol `lab-lambda-exec`.
3. **API Gateway:** HTTP API con `GET/POST/DELETE /reviews` → Lambda, CORS habilitado.
4. **Frontend:** pegar el Invoke URL en `config.js`, regenerar `dist/`, subir a S3 (`restrepo-ecommerce-frontend`).
5. **CloudFront:** distribución con OAC, default root object `index.html`, invalidar `/*` tras cada deploy.

Pasos detallados en [DOCUMENTO-FUNCIONAL.md](DOCUMENTO-FUNCIONAL.md) y [PLAN-AWS.md](PLAN-AWS.md).

---

## QA

Suite automatizada de la API (CRUD + negativos), self-cleaning:

```bash
API_URL=https://tvsz0deee9.execute-api.us-east-1.amazonaws.com bash tests/api-smoke.sh
```

Casos `TC-API-REVIEWS-01..07` (8/8 PASS) + casos manuales de UI `TC-UI-CART-01..04`. Detalle en [tests/README.md](tests/README.md).

---

## Tecnologías

HTML5, CSS3, JavaScript (ES6), Bootstrap 5 · Python (boto3) · AWS: S3, CloudFront, API Gateway, Lambda, DynamoDB, IAM.

---

## Deuda técnica

El despliegue es manual (subir a S3 + invalidar CloudFront). Mejora recomendada: **CI/CD con Jenkins** para deploy automático ante cada push a `main` (ver propuesta en [DEFENSA.md](DEFENSA.md)).
