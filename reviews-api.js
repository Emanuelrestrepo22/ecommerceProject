// =====================================================================
// CRUD de reseñas contra la API (API Gateway -> Lambda -> DynamoDB)
// Usa la constante API_URL definida en config.js (debe cargarse antes).
// =====================================================================

// --- Referencias del DOM ---
const reviewForm = document.querySelector("#reviewForm");
const reviewsList = document.querySelector("#reviewsList");
const statusBox = document.querySelector("#statusBox");

// Muestra un mensaje de estado al usuario (info / error / ok)
function showStatus(message, type = "info") {
  if (!statusBox) return;
  const colors = { info: "#0d6efd", error: "#dc3545", ok: "#198754" };
  statusBox.textContent = message;
  statusBox.style.color = colors[type] || colors.info;
}

// Aviso si todavía no configuramos la API (antes de la Fase 3)
function apiConfigured() {
  if (!API_URL) {
    showStatus("API_URL no configurada todavía. Completala en config.js (Fase 3).", "error");
    return false;
  }
  return true;
}

// --- READ: traer todas las reseñas ---
async function loadReviews() {
  if (!apiConfigured()) return;
  showStatus("Cargando reseñas...");
  try {
    const res = await fetch(`${API_URL}/reviews`);
    if (!res.ok) throw new Error(`GET /reviews -> ${res.status}`);
    const reviews = await res.json();
    renderReviews(reviews);
    showStatus(`${reviews.length} reseña(s) cargada(s).`, "ok");
  } catch (err) {
    console.error(err);
    showStatus(`Error al cargar reseñas: ${err.message}`, "error");
  }
}

// Pinta la lista de reseñas con su botón de eliminar
function renderReviews(reviews) {
  if (!reviewsList) return;
  if (!Array.isArray(reviews) || reviews.length === 0) {
    reviewsList.innerHTML = `<p class="text-center text-muted">Todavía no hay reseñas. ¡Sé el primero!</p>`;
    return;
  }
  reviewsList.innerHTML = reviews
    .map(
      (r) => `
      <div class="review-card">
        <div class="review-card-head">
          <strong>${escapeHtml(r.name)}</strong>
          <span class="review-rating">${"⭐".repeat(Math.round(r.rating || 0))} (${r.rating})</span>
        </div>
        <p class="review-text">${escapeHtml(r.review)}</p>
        <button class="btn btn-sm btn-danger" data-id="${r.id}" onclick="deleteReview('${r.id}')">
          Eliminar
        </button>
      </div>`
    )
    .join("");
}

// --- CREATE: enviar una nueva reseña ---
async function createReview(event) {
  event.preventDefault();
  if (!apiConfigured()) return;

  const name = document.querySelector("#rName").value.trim();
  const review = document.querySelector("#rText").value.trim();
  const rating = Number(document.querySelector("#rRating").value);

  if (!name || !review || !rating) {
    showStatus("Completá nombre, reseña y calificación.", "error");
    return;
  }

  showStatus("Enviando reseña...");
  try {
    const res = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, review, rating }),
    });
    if (!res.ok) throw new Error(`POST /reviews -> ${res.status}`);
    reviewForm.reset();
    resetStars();
    showStatus("Reseña creada.", "ok");
    loadReviews();
  } catch (err) {
    console.error(err);
    showStatus(`Error al crear reseña: ${err.message}`, "error");
  }
}

// --- DELETE: eliminar una reseña por id ---
async function deleteReview(id) {
  if (!apiConfigured()) return;
  if (!confirm("¿Eliminar esta reseña?")) return;
  showStatus("Eliminando...");
  try {
    const res = await fetch(`${API_URL}/reviews/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`DELETE /reviews/${id} -> ${res.status}`);
    showStatus("Reseña eliminada.", "ok");
    loadReviews();
  } catch (err) {
    console.error(err);
    showStatus(`Error al eliminar: ${err.message}`, "error");
  }
}

// --- Widget de estrellas: hover y selección de izquierda a derecha ---
function setupStarRating() {
  const container = document.querySelector("#starRating");
  const hidden = document.querySelector("#rRating");
  if (!container || !hidden) return;
  const stars = Array.from(container.querySelectorAll(".star"));

  // Pinta como "activas" las estrellas hasta el valor dado
  function paint(value) {
    stars.forEach((star) => {
      const v = Number(star.dataset.value);
      star.classList.toggle("active", v <= value);
    });
  }

  stars.forEach((star) => {
    const value = Number(star.dataset.value);
    star.addEventListener("mouseenter", () => paint(value));
    star.addEventListener("click", () => {
      hidden.value = value;
      container.dataset.selected = value;
      paint(value);
    });
  });

  // Al salir del contenedor, vuelve a la selección actual (o vacío)
  container.addEventListener("mouseleave", () => paint(Number(hidden.value) || 0));
}

// Reinicia las estrellas tras enviar el formulario
function resetStars() {
  const container = document.querySelector("#starRating");
  if (!container) return;
  container.dataset.selected = "";
  container.querySelectorAll(".star").forEach((s) => s.classList.remove("active"));
}

// Evita inyección de HTML al renderizar texto del usuario
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
  if (reviewForm) reviewForm.addEventListener("submit", createReview);
  setupStarRating();
  loadReviews();
});
