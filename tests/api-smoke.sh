#!/usr/bin/env bash
# =====================================================================
# Suite de smoke tests de la API de reseñas (CRUD end-to-end)
# Proyecto: Rick and Morty Store — Arquitectura en la nube (AWS)
#
# Prueba GET / POST / DELETE contra la API real (API Gateway -> Lambda
# -> DynamoDB) con aserciones y casos negativos. Self-cleaning: borra
# las reseñas que crea.
#
# Uso:
#   API_URL=https://xxxx.execute-api.us-east-1.amazonaws.com ./tests/api-smoke.sh
#
# Nota: usa 'curl -k' (omite validación de certificado) para atravesar
# proxies con inspección SSL en redes corporativas. En redes normales
# es seguro quitar el -k.
# =====================================================================
set -u

API="${API_URL:-https://tvsz0deee9.execute-api.us-east-1.amazonaws.com}"
CURL="curl -sk"
pass=0; fail=0

chk() { # esperado  obtenido  descripcion
  if [ "$1" = "$2" ]; then
    echo "  PASS  $3"
    pass=$((pass + 1))
  else
    echo "  FAIL  $3 (esperado=$1, obtenido=$2)"
    fail=$((fail + 1))
  fi
}

echo "===== Suite API CRUD reseñas — $API ====="

# ---------------------------------------------------------------------
echo ""
echo "[TC-API-REVIEWS-01] GET /reviews responde 200"
code=$($CURL -o /dev/null -w "%{http_code}" "$API/reviews")
chk 200 "$code" "GET lista responde 200"

# ---------------------------------------------------------------------
echo ""
echo "[TC-API-REVIEWS-02] POST /reviews crea (201) y devuelve id"
resp=$($CURL -X POST "$API/reviews" -H "Content-Type: application/json" \
  -d '{"name":"QA Bot","review":"Reseña automatizada","rating":4}' -w "\n%{http_code}")
code=$(echo "$resp" | tail -1)
id=$(echo "$resp" | head -1 | grep -o '"id": "[^"]*"' | head -1 | sed 's/.*: "//;s/"//')
chk 201 "$code" "POST responde 201"
[ -n "$id" ] && { echo "  PASS  POST devuelve id=$id"; pass=$((pass + 1)); } \
             || { echo "  FAIL  POST no devolvió id"; fail=$((fail + 1)); }

# ---------------------------------------------------------------------
echo ""
echo "[TC-API-REVIEWS-03] GET /reviews contiene la reseña creada"
$CURL "$API/reviews" | grep -q "$id" \
  && { echo "  PASS  la reseña aparece en la lista"; pass=$((pass + 1)); } \
  || { echo "  FAIL  la reseña creada no aparece"; fail=$((fail + 1)); }

# ---------------------------------------------------------------------
echo ""
echo "[TC-API-REVIEWS-04] DELETE /reviews/{id} responde 200"
code=$($CURL -o /dev/null -w "%{http_code}" -X DELETE "$API/reviews/$id")
chk 200 "$code" "DELETE responde 200"

# ---------------------------------------------------------------------
echo ""
echo "[TC-API-REVIEWS-05] GET /reviews ya NO contiene la reseña borrada"
$CURL "$API/reviews" | grep -q "$id" \
  && { echo "  FAIL  la reseña sigue presente"; fail=$((fail + 1)); } \
  || { echo "  PASS  la reseña fue eliminada"; pass=$((pass + 1)); }

# ---------------------------------------------------------------------
echo ""
echo "[TC-API-REVIEWS-06] POST sin campos responde 400 (negativo)"
code=$($CURL -o /dev/null -w "%{http_code}" -X POST "$API/reviews" \
  -H "Content-Type: application/json" -d '{}')
chk 400 "$code" "POST vacío rechazado con 400"

# ---------------------------------------------------------------------
echo ""
echo "[TC-API-REVIEWS-07] Ruta inexistente responde 404 (negativo)"
code=$($CURL -o /dev/null -w "%{http_code}" "$API/noexiste")
chk 404 "$code" "ruta desconocida responde 404"

# ---------------------------------------------------------------------
echo ""
echo "===== RESULTADO: $pass PASS / $fail FAIL ====="
[ "$fail" -eq 0 ]
