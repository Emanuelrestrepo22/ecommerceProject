# Documento Técnico — Rick and Morty Store

**Materia:** Arquitectura de Sistemas en la Nube con AWS — IFTS 16
**Alumno:** Emanuel Restrepo
**Modalidad:** Individual
**Arquitectura elegida:** Opción C — Serverless
**URL pública:** https://d2mb47m6hnir3o.cloudfront.net

---

## 1. Resumen del sistema

Aplicación web de e-commerce (temática Rick and Morty) con un módulo de **reseñas de clientes** que implementa un CRUD real sobre la nube de AWS. El usuario puede **crear** una reseña (nombre, texto y calificación con estrellas), **listar** todas las reseñas existentes y **eliminar** reseñas. Los datos persisten en DynamoDB.

El frontend (HTML/CSS/JavaScript) es estático y se sirve globalmente por CloudFront con HTTPS. La lógica de negocio corre en una función Lambda, expuesta mediante API Gateway. No hay servidores que administrar.

---

## 2. Arquitectura elegida y justificación

Se eligió la **Opción C (Serverless)** entre las tres propuestas por la cátedra. Justificación:

1. **Reutilización del frontend existente:** el proyecto ya era un sitio estático, exactamente lo que sirve S3 + CloudFront, sin necesidad de reescribirlo para meterlo en un servidor.
2. **Sin administración de infraestructura:** a diferencia de EC2 (Opciones A/B), no hay instancias que parchar, ni Nginx, ni SSH, ni IP pública que cambie al reiniciar.
3. **Costo mínimo en cuenta compartida:** Lambda y DynamoDB on-demand cobran por uso; en reposo el costo es prácticamente cero.
4. **Correspondencia con los laboratorios:** combina el Lab 3 (S3 + CloudFront), el Lab de Lambda y el Lab 4 (API CRUD).

---

## 3. Diagrama de arquitectura

Ver archivo `diagrama-arquitectura.drawio` (editable en https://draw.io) y `diagrama-arquitectura.svg`.

```
   Navegador del usuario
          │  HTTPS
          ▼
   ┌──────────────┐        ┌──────────────────────┐
   │  CloudFront  │◄───────│  S3 (bucket privado) │   Frontend estático
   │   (HTTPS/CDN)│  OAC   │  restrepo-ecommerce  │   HTML/CSS/JS
   └──────┬───────┘        └──────────────────────┘
          │  fetch() (JSON)
          ▼
   ┌──────────────────┐
   │   API Gateway    │   HTTP API
   │ GET/POST/DELETE  │   /reviews , /reviews/{id}
   └──────┬───────────┘
          │  invoca
          ▼
   ┌──────────────────┐
   │   Lambda (Python)│   restrepo-review-api
   │  enruta y opera  │   boto3
   └──────┬───────────┘
          │  read/write
          ▼
   ┌──────────────────┐
   │    DynamoDB      │   tabla restrepo-review (PK: id)
   └──────────────────┘
```

---

## 4. Flujo de datos (ejemplo: crear una reseña)

1. El usuario completa el formulario en `review.html` y presiona **Enviar**.
2. El JavaScript (`reviews-api.js`) hace `POST /reviews` a API Gateway con `{name, review, rating}`.
3. API Gateway invoca la Lambda, pasándole el evento HTTP.
4. La Lambda valida los datos, genera un `id` (UUID) y hace `put_item` en DynamoDB.
5. Devuelve `201` con la reseña creada; el frontend recarga la lista (`GET /reviews`).

---

## 5. Descripción de componentes

| Componente | Servicio | Qué hace | Por qué se eligió |
|------------|----------|----------|-------------------|
| Frontend | **S3** | Almacena los archivos del sitio (HTML/CSS/JS) | Hosting de estáticos barato y simple |
| CDN / HTTPS | **CloudFront** | Sirve el sitio por HTTPS con baja latencia; accede al bucket privado vía OAC | Da la URL pública segura sin exponer el bucket |
| API REST | **API Gateway (HTTP API)** | Expone las rutas `/reviews` y `/reviews/{id}` | Punto de entrada gestionado, con CORS |
| Lógica | **Lambda (Python)** | Una función que enruta GET/POST/DELETE y opera sobre la base | Sin servidores; paga por invocación |
| Base de datos | **DynamoDB** | Persiste las reseñas (NoSQL, clave `id`) | Requisito obligatorio; on-demand, escalable |
| Permisos | **IAM** | Rol `lab-lambda-exec` con acceso a DynamoDB | Principio de credenciales gestionadas (sin keys en código) |

### Endpoints

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/reviews` | Listar reseñas |
| POST | `/reviews` | Crear reseña |
| DELETE | `/reviews/{id}` | Eliminar reseña |

---

## 6. Instrucciones de despliegue (desde cero)

1. **DynamoDB:** crear tabla `restrepo-review`, partition key `id` (String), capacidad on-demand.
2. **Lambda:** crear función `restrepo-review-api` (Python 3.13), pegar `lambda/lambda_function.py`, variable de entorno `TABLE_NAME=restrepo-review`, rol de ejecución con permisos DynamoDB (`lab-lambda-exec`).
3. **API Gateway:** crear HTTP API; agregar rutas `GET /reviews`, `POST /reviews`, `DELETE /reviews/{id}`, todas integradas con la Lambda; habilitar CORS (origin `*`, métodos GET/POST/DELETE/OPTIONS, header `content-type`).
4. **Frontend:** pegar el Invoke URL del API en `config.js`; copiar los archivos del sitio a `dist/`.
5. **S3:** crear bucket privado `restrepo-ecommerce-frontend` (Block Public Access activado), subir el contenido de `dist/`.
6. **CloudFront:** crear distribución con origin = el bucket S3, Origin Access Control (OAC) habilitado, Default root object = `index.html`, Redirect HTTP→HTTPS. Actualizar la política del bucket (automático con OAC).
7. Esperar el despliegue y verificar la URL pública.

---

## 7. Seguridad y buenas prácticas

- **Bucket S3 privado:** Block Public Access activado; el acceso es solo vía CloudFront (OAC). El bucket no es accesible directamente.
- **Sin credenciales en el código:** la Lambda usa un rol IAM de ejecución; no hay Access Keys hardcodeadas.
- **HTTPS forzado:** CloudFront redirige HTTP a HTTPS.
- **Nombres claros con prefijo `restrepo-`** para identificar los recursos en la cuenta compartida.
- **Validación de input** en la Lambda (rechaza POST sin campos con 400).
- **Escape de HTML** en el frontend al renderizar texto del usuario (previene inyección).

---

## 8. Pruebas (QA)

Suite automatizada de API en `tests/api-smoke.sh` (8 casos, self-cleaning): CREATE, READ, DELETE, validación (400) y ruteo (404). Última ejecución: **8 PASS / 0 FAIL**. Detalle y trazabilidad en `tests/README.md`.

---

## 9. Costos

Con la **capa gratuita** de AWS y el uso de un TP, el costo es prácticamente **$0**:
- Lambda: 1M de invocaciones gratis/mes.
- DynamoDB on-demand: paga por request, centavos.
- CloudFront: plan Free ($0/month).
- S3: almacenamiento mínimo (unos pocos MB).

---

## 10. Problemas encontrados y soluciones

| Problema | Causa | Solución |
|----------|-------|----------|
| `iam:CreateRole not authorized` | Usuario sin permiso para crear roles en la cuenta compartida | Se usó un rol preexistente (`lab-lambda-exec`) provisto por la cátedra |
| `curl`/AWS CLI fallaban con error SSL | La red corporativa inspecciona TLS con un cert no confiable por la CLI | Para testing local se usó `curl -k`; el navegador funciona normal (confía en el cert del sistema) |
| La URL raíz daba error de acceso | Faltaba el Default root object en CloudFront | Se configuró `index.html` como Default root object |
| Path de ruta `/review` vs `/reviews` | Inconsistencia entre el path del API y el contrato | Se unificó todo en `/reviews` (plural) |
