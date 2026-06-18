# Guion de defensa — Rick and Morty Store

**Duración:** ~10 min presentación + 5 min preguntas.
**URL en vivo:** https://d2mb47m6hnir3o.cloudfront.net

---

## Checklist PREVIO a la defensa (hacelo el día anterior)

- [ ] Abrir la URL pública y verificar que el sitio carga.
- [ ] Probar el CRUD completo en el navegador (crear / listar / eliminar una reseña).
- [ ] Tener abierta la consola de DynamoDB (`restrepo-review` → Explore items) para mostrar la persistencia.
- [ ] Tener el diagrama de arquitectura a mano (`diagrama-arquitectura.svg`).
- [ ] Tener el repo de GitHub abierto.
- [ ] Verificar que el Learner Lab / sesión AWS esté activa (si aplica).
- [ ] Cerrar pestañas innecesarias; dejar listas: sitio, consola DynamoDB, GitHub, diagrama.

---

## Estructura de la presentación

### 1. Qué construí (1 min)
"Un e-commerce estático con un módulo de reseñas que implementa un CRUD real sobre AWS, 100% serverless. Los usuarios crean, ven y eliminan reseñas, y los datos persisten en DynamoDB."

### 2. Demo en vivo (3-4 min)
1. Abrir la URL pública → mostrar el sitio cargando por HTTPS.
2. Ir a **Reseñas** → mostrar la lista (esto es un `GET /reviews`).
3. **Crear** una reseña con el formulario y las estrellas → aparece en la lista (`POST`).
4. Cambiar a la consola de **DynamoDB** → refrescar → mostrar la reseña recién creada (persistencia real).
5. Volver al sitio → **Eliminar** la reseña → desaparece (`DELETE`).
6. Refrescar DynamoDB → ya no está.

### 3. Arquitectura (3 min) — mostrar el diagrama
Recorrer el flujo: "El navegador pide el sitio a **CloudFront** (HTTPS), que lo sirve desde un **bucket S3 privado** vía OAC. El JavaScript llama con `fetch()` a **API Gateway**, que invoca una **Lambda** en Python, que lee y escribe en **DynamoDB**. La Lambda usa un **rol IAM**, sin credenciales en el código."

### 4. Problemas y soluciones (2 min)
- Permisos restringidos en cuenta compartida (no se podían crear roles) → se usó un rol provisto por la cátedra.
- Faltaba el Default root object en CloudFront → se configuró `index.html`.
- (Bonus QA) Suite automatizada de API con 8 casos, 8/8 PASS.

---

## Preguntas probables y respuestas

**¿Por qué elegiste serverless y no EC2?**
Porque el frontend ya era estático (encaja directo en S3+CloudFront), no hay que administrar servidores, el costo en reposo es casi cero, y la IP no cambia como en EC2.

**¿Dónde se guardan los datos?**
En DynamoDB, tabla `restrepo-review`. Cada reseña es un item con `id` (UUID), `name`, `review`, `rating` y `createdAt`.

**¿Cómo genera el `id`?**
La Lambda lo crea con `uuid.uuid4()` al recibir el POST. El cliente no lo manda.

**¿Cómo se conecta la Lambda a DynamoDB sin credenciales?**
Mediante un rol IAM de ejecución (`lab-lambda-exec`) que tiene permisos de DynamoDB. boto3 toma esas credenciales temporales automáticamente. No hay Access Keys en el código.

**¿Qué es OAC / por qué el bucket es privado?**
Origin Access Control: permite que solo CloudFront lea el bucket. El bucket no es público; nadie puede acceder a los archivos salteando CloudFront. Es la buena práctica de seguridad.

**¿Qué es CORS y por qué lo necesitás?**
Porque el navegador, al pedir desde el dominio de CloudFront a otro dominio (el de API Gateway), bloquea la llamada salvo que la API declare que la permite. CORS habilita esa llamada cross-origin.

**¿Cómo manejás un POST inválido?**
La Lambda valida que vengan `name`, `review` y `rating`; si falta alguno devuelve 400. Lo probé en la suite automatizada (TC-API-REVIEWS-06).

**¿Cuánto cuesta?**
Prácticamente $0 con la capa gratuita: Lambda (1M req/mes gratis), DynamoDB on-demand (centavos), CloudFront Free plan, S3 (pocos MB).

**¿Qué pasa si CloudFront tarda o falla en la demo?**
Mostrar el código, los logs en CloudWatch y explicar el flujo esperado. Saber diagnosticar suma.

---

## Una línea para cerrar
"Todo el sistema lo construí combinando los laboratorios del curso: S3+CloudFront, Lambda y la API CRUD con DynamoDB. Puedo explicar cada pieza y mostrarla funcionando."
