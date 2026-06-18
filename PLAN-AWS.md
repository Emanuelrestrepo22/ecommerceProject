# Plan de Proyecto — Arquitectura en la Nube con AWS (IFTS 16)

Proyecto: **Rick and Morty Store** → CRUD de Reseñas sobre AWS Serverless.
Arquitectura elegida: **Opción C — Serverless** (S3 + CloudFront + API Gateway + Lambda + DynamoDB).
Región de trabajo: **us-east-1** (N. Virginia).

---

## Endpoints en producción (entrega)

| Recurso | Valor |
|---------|-------|
| **URL pública del sitio** | https://d2mb47m6hnir3o.cloudfront.net |
| API base (API Gateway) | https://tvsz0deee9.execute-api.us-east-1.amazonaws.com |
| Tabla DynamoDB | `restrepo-review` |
| Lambda | `restrepo-review-api` (rol `lab-lambda-exec`) |
| Bucket S3 (privado, OAC) | `restrepo-ecommerce-frontend` |
| Distribución CloudFront | `E1XU4VXVD4GQM6` |

## Decisión de arquitectura

Reutilizamos el frontend estático ya existente y le agregamos un backend serverless.
La entidad CRUD es **Reseña** (`review`): cubre crear / listar / eliminar.

```
Navegador
   │
   ▼
CloudFront (HTTPS)  ◄── S3 (bucket privado, OAC)   [frontend ya hecho]
   │ fetch()
   ▼
API Gateway (HTTP API)   POST /reviews · GET /reviews · DELETE /reviews/{id}
   │
   ▼
Lambda (Python + boto3)   create · list · delete
   │
   ▼
DynamoDB  tabla "restrepo-review" (PK: id)
```

| Componente | Servicio AWS | Por qué |
|------------|-------------|---------|
| Frontend estático | S3 + CloudFront | Ya está hecho en HTML/CSS/JS; CloudFront da HTTPS y CDN |
| API REST | API Gateway (HTTP API) | Expone las funciones sin servidor propio |
| Lógica de negocio | Lambda (Python) | Sin administrar servidores; paga por uso |
| Base de datos | DynamoDB | Requisito obligatorio de la consigna |

---

## Fases

### Fase 0 — Prerrequisitos
- [ ] Acceso a consola AWS (cuenta personal/educativa).
- [ ] Confirmar región **us-east-1**.
- [ ] (Opcional) Arreglar SSL del AWS CLI o trabajar 100% por consola web.

### Convención de nombres (cuenta compartida del instituto)
Prefijo `restrepo-` en todos los recursos:
- Tabla DynamoDB: `restrepo-review`
- Lambdas: `restrepo-createReview`, `restrepo-listReviews`, `restrepo-deleteReview`
- API Gateway: `restrepo-reviews-api`
- Bucket S3: `restrepo-ecommerce-frontend`

### Fase 1 — DynamoDB
- [ ] Crear tabla `restrepo-review`, partition key `id` (String), modo on-demand.
- [ ] Insertar un item de prueba manual.

### Fase 2 — Lambda + IAM
- [ ] Crear rol IAM para Lambda con acceso a DynamoDB.
- [ ] Lambda `createReview` (POST) → `put_item`.
- [ ] Lambda `listReviews` (GET) → `scan`.
- [ ] Lambda `deleteReview` (DELETE) → `delete_item`.
- [ ] Probar cada una con evento de test.

### Fase 3 — API Gateway
- [ ] HTTP API con rutas `POST /reviews`, `GET /reviews`, `DELETE /reviews/{id}`.
- [ ] Integrar cada ruta con su Lambda.
- [ ] Habilitar CORS.
- [ ] Probar con navegador / curl.

### Fase 4 — Frontend
- [ ] Reemplazar `fetch("reviews.json")` por `fetch(API_URL + "/reviews")`.
- [ ] Agregar form para crear reseña (POST).
- [ ] Agregar botón eliminar (DELETE).
- [ ] Probar local contra la API real.

### Fase 5 — Despliegue frontend
- [ ] Bucket S3 privado, subir archivos.
- [ ] Distribución CloudFront con OAC + HTTPS.
- [ ] Verificar URL pública end-to-end.

### Fase 6 — Documentación
- [ ] Diagrama de arquitectura (draw.io / Excalidraw).
- [ ] Documento técnico 3–6 págs: componentes, decisiones, pasos de despliegue.
- [ ] Subir al repo. **Sin credenciales en el código.**

### Fase 7 — Defensa
- [ ] Ensayar demo: crear → listar → eliminar → verificar en DynamoDB.
- [ ] Repaso buenas prácticas (bucket privado, rol IAM acotado, sin keys).
- [ ] Checklist contra rúbrica (Funcionalidad 30 / Arquitectura 25 / Defensa 20 / Doc 15 / BBPP 10).

---

## Mapeo a la rúbrica

| Criterio | Pts | Cómo lo cubrimos |
|----------|----:|------------------|
| Funcionalidad | 30 | CRUD reseñas end-to-end con datos en DynamoDB |
| Arquitectura | 25 | Serverless coherente (Opción C de la consigna) |
| Defensa oral | 20 | Demo en vivo + explicar cada pieza |
| Documentación | 15 | Diagrama + doc técnico + pasos despliegue |
| Buenas prácticas | 10 | Bucket privado, IAM mínimo, sin secretos |
