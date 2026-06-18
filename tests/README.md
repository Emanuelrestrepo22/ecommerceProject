# QA — Pruebas automatizadas de la API de reseñas

**Objetivo:** validar de forma automatizada el CRUD de reseñas end-to-end (API Gateway → Lambda → DynamoDB).
**Alcance:** capa de API (HTTP). No cubre UI ni despliegue de CloudFront (ver suite E2E futura).
**Precondiciones:** API desplegada y accesible; variable `API_URL` apuntando al Invoke URL.
**Ambiente:** AWS us-east-1, cuenta IFTS. API: `restrepo-reviews-api`. Tabla: `restrepo-review`.

## Cómo ejecutar

```bash
# Con la URL por defecto embebida:
bash tests/api-smoke.sh

# O apuntando a otra URL:
API_URL=https://xxxx.execute-api.us-east-1.amazonaws.com bash tests/api-smoke.sh
```

> Nota: el script usa `curl -k` para atravesar la inspección SSL de la red corporativa. En una red sin proxy MITM, quitar el `-k`.

## Matriz de casos

| TC ID | Tipo | Acción | Resultado esperado |
|-------|------|--------|--------------------|
| TC-API-REVIEWS-01 | Happy | `GET /reviews` | 200 + array JSON |
| TC-API-REVIEWS-02 | Happy | `POST /reviews` con datos válidos | 201 + objeto con `id` (UUID) |
| TC-API-REVIEWS-03 | Happy | `GET /reviews` tras crear | la reseña creada aparece en la lista |
| TC-API-REVIEWS-04 | Happy | `DELETE /reviews/{id}` | 200 + confirmación |
| TC-API-REVIEWS-05 | Happy | `GET /reviews` tras borrar | la reseña ya no aparece |
| TC-API-REVIEWS-06 | Negativo | `POST /reviews` sin campos | 400 (validación) |
| TC-API-REVIEWS-07 | Negativo | `GET /noexiste` | 404 (ruta desconocida) |

**Cobertura:** CREATE, READ, DELETE + validación de input + ruteo. Persistencia verificada cruzando contra DynamoDB.
**Fuera de alcance:** UPDATE (no requerido por la consigna), auth (la API es pública por diseño del TP), carga/concurrencia.
**Última ejecución:** 8 PASS / 0 FAIL.
