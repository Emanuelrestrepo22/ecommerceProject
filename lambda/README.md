# Lambda — restrepo-reviews-api

Función única que resuelve el CRUD de reseñas contra DynamoDB.

## Datos de despliegue

| Parámetro | Valor |
|-----------|-------|
| Nombre función | `restrepo-reviews-api` |
| Runtime | Python 3.13 |
| Handler | `lambda_function.lambda_handler` |
| Variable de entorno | `TABLE_NAME = restrepo-review` |
| Rol de ejecución | `lab-lambda-exec` (asignado por el instituto, con permisos DynamoDB) |
| Región | us-east-1 |

## Rutas (HTTP API, payload v2.0)

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/reviews` | listar reseñas |
| POST | `/reviews` | crear reseña (`{name, review, rating}`) |
| DELETE | `/reviews/{id}` | eliminar reseña |

## Notas
- Sin credenciales en el código: usa el rol IAM de ejecución de la Lambda.
- Los números de DynamoDB se serializan con `DecimalEncoder`.
- CORS habilitado para que el frontend (CloudFront) consuma la API.
