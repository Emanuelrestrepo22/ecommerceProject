// URL de la API
const API_URL = "https://rickandmortyapi.com/api/character";

// Variable global para el carrito
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Función para obtener productos desde la API
async function getCharacters() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        if (document.querySelector("#productosContainer")) {
            renderProductList(data);
        }
        if (document.querySelector("#productosDestacados")) {
            renderFeaturedProducts(data);
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}

// Renderizar lista de productos
function renderProductList(data) {
    const container = document.querySelector("#productosContainer");
    if (!container) return;

    container.innerHTML = ""; // Limpiar contenido anterior
    data.results.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// Renderizar productos destacados (primeros 5)
function renderFeaturedProducts(data) {
    const container = document.querySelector("#productosDestacados");
    if (!container) return;

    container.innerHTML = ""; // Limpiar contenido anterior
    data.results.slice(0, 5).forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// Crear tarjeta de producto
function createProductCard(product) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>Estado: ${product.status}</p>
        <p>Precio: $1000</p>
        <button class="add-to-cart" data-id="${product.id}">Agregar al carrito</button>
    `;
    card.querySelector(".add-to-cart").addEventListener("click", () => {
        addToCart({
            id: product.id,
            title: product.name,
            image: product.image,
            price: 1000,
            cantidad: 1
        });
    });
    return card;
}

// Agregar al carrito
function addToCart(product) {
    const existing = carrito.find(item => item.id === product.id);
    if (existing) {
        existing.cantidad++;
    } else {
        carrito.push(product);
    }
    saveCart();
    renderCart(); // Renderizar carrito después de agregar
    updateCartTotal(); // Actualizar el total del carrito
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Actualizar total del carrito
function updateCartTotal() {
    const carritoTotal = document.querySelector("#carrito-total");
    if (!carritoTotal) return;

    const total = carrito.reduce((acc, item) => acc + item.price * item.cantidad, 0);
    carritoTotal.textContent = `$${total.toFixed(2)}`;
}

// Renderizar carrito en la página
function renderCart() {
    const carritoContainer = document.querySelector("#carritoContainer");
    if (!carritoContainer) return;

    carritoContainer.innerHTML = ""; // Limpiar contenido anterior
    if (carrito.length === 0) {
        carritoContainer.innerHTML = "<p class='text-center'>El carrito está vacío. Agrega productos para comenzar.</p>";
        updateCartTotal();
        return;
    }

    carrito.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("col-md-6", "mb-3");
        div.innerHTML = `
            <div class="card h-100">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${item.image}" class="img-fluid rounded-start" alt="${item.title}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                            <p class="card-text">Cantidad: ${item.cantidad}</p>
                            <p class="card-text"><small class="text-muted">Precio unitario: $${item.price.toFixed(2)}</small></p>
                            <p class="card-text"><strong>Subtotal: $${(item.price * item.cantidad).toFixed(2)}</strong></p>
                            <button class="btn btn-danger" onclick="removeFromCart(${item.id})">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        carritoContainer.appendChild(div);
    });

    updateCartTotal(); // Actualizar total después de renderizar
}

// Eliminar producto del carrito
function removeFromCart(productId) {
    carrito = carrito.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

// Renderizar reseñas dinámicas
function renderReviews() {
    const carouselInner = document.querySelector("#reviewsCarousel .carousel-inner");
    if (!carouselInner) return;

    const reviewsData = [
        { name: "Juan Pérez", review: "¡Increíble tienda! Los productos son de excelente calidad.", rating: 5 },
        { name: "María López", review: "El servicio al cliente fue excepcional. Muy recomendado.", rating: 4 },
        { name: "Carlos García", review: "Gran variedad de productos y precios competitivos.", rating: 4.5 },
        { name: "Ana Rodríguez", review: "Rápida entrega y buen servicio. Volveré a comprar.", rating: 5 }
    ];

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

// Inicializar la página
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    if (path.includes("index.html")) {
        getCharacters();
        renderReviews();
    } else if (path.includes("product-list-page.html")) {
        getCharacters();
    } else if (path.includes("product-card-page.html")) {
        const productId = new URLSearchParams(window.location.search).get("id");
        if (productId) getProductDetails(productId);
    } else if (path.includes("cart.html")) {
        renderCart();
    }
});
