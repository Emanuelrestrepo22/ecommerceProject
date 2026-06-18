# Guion de defensa — Rick and Morty Store

**Duración:** ~10 min presentación + 5 min preguntas.
**URL en vivo:** https://d2mb47m6hnir3o.cloudfront.net

---

## Checklist PREVIO a la defensa (hacelo el día anterior)

- [ ] Abrir la URL pública y verificar que el sitio carga.
- [ ] Probar el CRUD completo en el navegador (crear / listar / eliminar una reseña).
- [ ] Probar el contador de carrito: agregar productos y ver el badge 🛒 subir en el navbar.
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
7. **Mostrar el contador de carrito:** ir a **Productos**, agregar 2-3 al carrito y señalar cómo el badge 🛒 del navbar sube **en vivo** sin recargar; navegar a otra página para mostrar que el contador persiste.

### 3. Arquitectura (3 min) — mostrar el diagrama
Recorrer el flujo: "El navegador pide el sitio a **CloudFront** (HTTPS), que lo sirve desde un **bucket S3 privado** vía OAC. El JavaScript llama con `fetch()` a **API Gateway**, que invoca una **Lambda** en Python, que lee y escribe en **DynamoDB**. La Lambda usa un **rol IAM**, sin credenciales en el código."

### 4. Problemas y soluciones (2 min)
- Permisos restringidos en cuenta compartida (no se podían crear roles) → se usó un rol provisto por la cátedra.
- Faltaba el Default root object en CloudFront → se configuró `index.html`.
- (Bonus QA) Suite automatizada de API con 8 casos, 8/8 PASS.

---

## Flujo del feature: contador de carrito (cómo lo hicimos)

Feature client-side (UC-04): un badge 🛒 en el navbar que muestra la cantidad de productos del carrito y se actualiza en vivo.

**Cómo lo desarrollamos (paso a paso):**
1. Se creó `cart-badge.js`: lee `localStorage["carrito"]`, suma las `cantidad` y pinta el badge.
2. Para actualizar **en vivo**, la función `saveCart()` (en `index.js`/`cart.js`) dispara un evento `cart:updated`; `cart-badge.js` lo escucha y repinta. También escucha `storage` para sincronizar entre pestañas.
3. Se incluyó el script en las 7 páginas y se estiló el badge en `css/styles.css`.
4. Trazabilidad: UC-04, RF-C01..03 y BDD en el documento funcional (cap. 20); casos `TC-UI-CART-01..04` en `tests/README.md`; registro en `CHANGELOG.md`.

**Cómo lo desplegamos (proceso MANUAL que usamos):**
1. Regenerar la carpeta `dist/` con los archivos del sitio.
2. Subir el contenido de `dist/` al bucket S3 `restrepo-ecommerce-frontend` (sobrescribe).
3. Crear una invalidación `/*` en CloudFront para limpiar la caché.
4. Verificar la URL pública.

> Punto honesto para la defensa: este despliegue es **manual** y propenso a error (hay que acordarse de subir y de invalidar). Es justamente la principal **deuda técnica** del proyecto (ver abajo).

---

## Deuda técnica y mejoras futuras (cómo DEBERÍA hacerse)

Conviene mencionarlas: demuestra criterio de ingeniería y conciencia de los límites del alcance.

| Deuda técnica | Situación actual | Mejora propuesta |
|---------------|------------------|------------------|
| **CI/CD del despliegue** | Subida manual a S3 + invalidación manual de CloudFront | Pipeline en **Jenkins** que automatice el deploy ante cada push a `main` |
| Infraestructura como código | Recursos creados a mano por consola | Terraform / CloudFormation para reproducibilidad |
| Observabilidad | Logs básicos en CloudWatch | Métricas y alarmas (latencia, errores 5xx) |
| Tests de UI automatizados | `TC-UI-CART` manuales | E2E con Playwright en el pipeline |

**Propuesta concreta de CI/CD con Jenkins (deploy directo):**
Un `Jenkinsfile` con un pipeline que, al detectar un push a `main`, ejecute:

```groovy
pipeline {
  agent any
  stages {
    stage('Checkout')  { steps { checkout scm } }
    stage('Build')     { steps { sh 'rm -rf dist && mkdir dist && cp *.html *.js reviews.json dist/ && cp -r css img dist/' } }
    stage('Test')      { steps { sh 'bash tests/api-smoke.sh' } }     // gate de calidad
    stage('Deploy S3') { steps { sh 'aws s3 sync dist/ s3://restrepo-ecommerce-frontend --delete' } }
    stage('Invalidate'){ steps { sh 'aws cloudfront create-invalidation --distribution-id E1XU4VXVD4GQM6 --paths "/*"' } }
  }
}
```

**Por qué es mejor:** elimina el error humano (siempre sube e invalida), corre los tests como *quality gate* antes de publicar, deja trazabilidad de cada deploy y permite rollback. Las credenciales AWS se guardarían en el *Credentials Store* de Jenkins, nunca en el repo.

> Nota de alcance: la consigna pide el sistema desplegado y funcionando (cumplido). El CI/CD con Jenkins es una **mejora recomendada fuera del alcance obligatorio**, declarada como deuda técnica.

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

**¿Cómo desplegás los cambios? ¿Es automático?**
Hoy es manual: regenero `dist/`, subo a S3 y creo una invalidación `/*` en CloudFront. Lo tengo identificado como **deuda técnica**: lo ideal es un pipeline de **CI/CD en Jenkins** que ante cada push a `main` corra los tests, haga `aws s3 sync` y la invalidación automáticamente. Así se elimina el error humano y queda trazabilidad de cada deploy.

**¿Por qué el carrito no usa DynamoDB como las reseñas?**
Por decisión de alcance: el carrito es una mejora de UX del lado del cliente (`localStorage`), no requiere backend. El módulo que cumple el requisito de CRUD persistente de la consigna es el de reseñas. Documenté esta separación en el alcance del documento funcional.

---

## Una línea para cerrar
"Todo el sistema lo construí combinando los laboratorios del curso: S3+CloudFront, Lambda y la API CRUD con DynamoDB. Puedo explicar cada pieza y mostrarla funcionando."
