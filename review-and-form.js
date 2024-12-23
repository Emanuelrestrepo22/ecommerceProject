// Cargar reseñas desde un archivo JSON
async function fetchReviews() {
    try {
        const response = await fetch("reviews.json");
        if (!response.ok) throw new Error(`Error al cargar las reseñas: ${response.status}`);
        const reviewsData = await response.json();
        renderReviews(reviewsData);
    } catch (error) {
        console.error("Error al cargar las reseñas:", error);
    }
}

// Función para renderizar las reseñas en el carrusel
function renderReviews(reviewsData) {
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
document.addEventListener("DOMContentLoaded", fetchReviews);

//premisa formulario
function validateContactForm() {
    // Selecciona el formulario y sus campos
    const form = document.querySelector("#contactForm");
    const nombre = document.querySelector("#nombreCompleto");
    const email = document.querySelector("#exampleInputEmail1");
    const mensaje = document.querySelector("#mensaje");

    if (!form || !nombre || !email || !mensaje) {
        console.error("No se encontraron algunos campos del formulario en el DOM.");
        return false;
    }

    // Verifica si los campos están completos
    let isFormValid = true;
    const missingFields = [];

    if (!nombre.value.trim()) {
        isFormValid = false;
        missingFields.push("Nombre Completo");
    }

    if (!email.value.trim()) {
        isFormValid = false;
        missingFields.push("Correo Electrónico");
    }

    if (!mensaje.value.trim()) {
        isFormValid = false;
        missingFields.push("Mensaje");
    }

    // Muestra mensajes en la consola
    if (isFormValid) {
        console.log("Todos los campos están completos. El formulario está listo para enviarse.");
    } else {
        console.warn("Faltan los siguientes campos por completar:", missingFields.join(", "));
    }

    // Retorna el estado del formulario (true: válido, false: inválido)
    return isFormValid;
}

// Asignar evento al formulario
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#contactForm");
    if (form) {
        form.addEventListener("submit", (event) => {
            // Prevenir el envío del formulario si no está completo
            if (!validateContactForm()) {
                event.preventDefault(); // Evita el envío del formulario
            }
        });
    } else {
        console.error("Formulario de contacto no encontrado en el DOM.");
    }
});
