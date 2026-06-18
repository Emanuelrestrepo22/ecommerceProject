"""
Lambda: restrepo-reviews-api
CRUD de reseñas sobre DynamoDB para el frontend Rick and Morty Store.

Una sola función que enruta segun el routeKey del HTTP API (payload v2.0):
    GET    /reviews          -> listar todas las reseñas
    POST   /reviews          -> crear una reseña  (body JSON: name, review, rating)
    DELETE /reviews/{id}     -> eliminar una reseña por id

Persistencia: tabla DynamoDB (nombre en la variable de entorno TABLE_NAME).
No contiene credenciales: usa el rol IAM de ejecucion de la Lambda.
"""

import json
import os
import uuid
from decimal import Decimal
from datetime import datetime, timezone

import boto3

TABLE_NAME = os.environ.get("TABLE_NAME", "restrepo-review")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

# CORS: permite que el frontend (CloudFront) llame a la API desde el navegador.
CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
}


class DecimalEncoder(json.JSONEncoder):
    """DynamoDB devuelve numeros como Decimal; los convertimos para JSON."""

    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o % 1 == 0 else float(o)
        return super().default(o)


def response(status, body):
    return {
        "statusCode": status,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, cls=DecimalEncoder),
    }


def lambda_handler(event, context):
    route = event.get("routeKey", "")
    method = event.get("requestContext", {}).get("http", {}).get("method", "")

    try:
        # Preflight CORS del navegador
        if method == "OPTIONS":
            return response(200, {"ok": True})

        if route == "GET /reviews":
            return list_reviews()
        if route == "POST /reviews":
            return create_review(event)
        if route.startswith("DELETE /reviews"):
            review_id = (event.get("pathParameters") or {}).get("id")
            return delete_review(review_id)

        return response(404, {"message": f"Ruta no encontrada: {route}"})

    except Exception as e:  # noqa: BLE001 - registramos cualquier error inesperado
        print("ERROR:", str(e))
        return response(500, {"message": "Error interno", "detail": str(e)})


def list_reviews():
    """READ: devuelve todas las reseñas, mas nuevas primero."""
    result = table.scan()
    items = result.get("Items", [])
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return response(200, items)


def create_review(event):
    """CREATE: valida y guarda una reseña con id UUID."""
    body = json.loads(event.get("body") or "{}")
    name = (body.get("name") or "").strip()
    review_text = (body.get("review") or "").strip()
    rating = body.get("rating")

    if not name or not review_text or rating is None:
        return response(400, {"message": "Faltan campos: name, review, rating"})

    item = {
        "id": str(uuid.uuid4()),
        "name": name,
        "review": review_text,
        "rating": Decimal(str(rating)),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    table.put_item(Item=item)
    return response(201, item)


def delete_review(review_id):
    """DELETE: elimina una reseña por id."""
    if not review_id:
        return response(400, {"message": "Falta el id"})
    table.delete_item(Key={"id": review_id})
    return response(200, {"message": "Reseña eliminada", "id": review_id})
