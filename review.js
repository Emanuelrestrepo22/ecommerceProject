// Reseñas simuladas (puedes reemplazar esto con datos de un API)
const reviewsData = [
    { name: "Juan Pérez", review: "¡Increíble tienda! Los productos son de excelente calidad.", rating: 5 },
    { name: "María López", review: "El servicio al cliente fue excepcional. Muy recomendado.", rating: 4 },
    { name: "Carlos García", review: "Gran variedad de productos y precios competitivos.", rating: 4.5 },
    { name: "Ana Rodríguez", review: "Rápida entrega y buen servicio. Volveré a comprar.", rating: 5 }
];

// Función para renderizar las reseñas en el carrusel
function renderReviews() {
    const carouselInner = document.querySelector("#reviewsCarousel .carousel-inner");

    if (!carouselInner) return;

    let htmlContent = "";
    reviewsData.forEach((review, index) => {
        htmlContent += `
        <div class="carousel-item ${index === 0 ? "active" : ""}">
            <div class="card text-center p-4 shadow-sm mx-auto" style="max-width: 600px;">
                <div class="card-body">
                    <h5 class="card-title">${review.name}</h5>
                    <p class="card-text">${review.review}</p>
                    <p class="card-text">
                        <small class="text-muted">Calificación: ${review.rating} ⭐</small>
                    </p>
                </div>
            </div>
        </div>`;
    });

    carouselInner.innerHTML = htmlContent;
}

// Llamar a la función para cargar las reseñas
renderReviews();
