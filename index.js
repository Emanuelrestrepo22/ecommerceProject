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
            renderProductList(data.results);
        }
        if (document.querySelector("#productosDestacados")) {
            renderFeaturedProducts(data.results);
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}

// Renderizar lista de productos
function renderProductList(products) {
    const container = document.querySelector("#productosContainer");
    if (!container) return;

    container.innerHTML = ""; // Limpiar contenido anterior
    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// Mostrar productos en la consola
function logProductsToConsole(data) {
    console.log("Lista de productos disponibles:");
    data.results.forEach(product => {
        console.log(`ID: ${product.id}`);
        console.log(`Nombre: ${product.name}`);
        console.log(`Estado: ${product.status}`);
        console.log(`Especie: ${product.species}`);
        console.log(`Género: ${product.gender}`);
        console.log(`Imagen: ${product.image}`);
        console.log("------------------------------");
    });
}

// Actualizar llamada a la API existente para incluir la lógica de impresión
async function getCharactersWithLogging() {
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
        logProductsToConsole(data); // Imprimir productos en la consola
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}

// Reemplaza la función original `getCharacters` con esta nueva
document.addEventListener("DOMContentLoaded", () => {
    getCharactersWithLogging();
});
// Renderizar git addproductos destacados (primeros 5) para el index
function renderFeaturedProducts(products) {
    const container = document.querySelector("#productosDestacados");
    if (!container) return;

    container.innerHTML = ""; // Limpiar contenido anterior
    products.slice(0, 5).forEach(product => {
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
        <button class="btn btn-danger view-details" data-id="${product.id}">Ver Detalles</button>
        <button class="btn btn-danger add-to-cart" data-id="${product.id}">Agregar al carrito</button>
    `;

    // Ver detalles
    card.querySelector(".view-details").addEventListener("click", () => {
        redirectToDetailsPage(product.id);
    });

    // Agregar al carrito
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

// Redirigir a la página de detalles con el ID del producto
function redirectToDetailsPage(productId) {
    window.location.href = `product-detail-page.html?id=${productId}`;
}

// Renderizar detalles del producto en la página de detalles
async function renderProductDetails() {
    const productId = new URLSearchParams(window.location.search).get("id");
    if (!productId) {
        console.error("No se encontró un ID de producto en la URL.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${productId}`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const product = await response.json();

        const container = document.querySelector(".product-container");
        if (!container) return;

        container.innerHTML = `
            <div class="card mx-auto p-4" style="max-width: 600px;">
                <img src="${product.image}" alt="${product.name}" class="card-img-top">
                <div class="card-body">
                    <h2 class="card-title">${product.name}</h2>
                    <p><strong>Estado:</strong> ${product.status}</p>
                    <p><strong>Especie:</strong> ${product.species}</p>
                    <p><strong>Género:</strong> ${product.gender}</p>
                    <p><strong>Origen:</strong> ${product.origin.name}</p>
                    <button class="btn btn-danger" onclick="addToCart({
                        id: ${product.id},
                        title: '${product.name}',
                        image: '${product.image}',
                        price: 1000,
                        cantidad: 1
                    })">Agregar al carrito</button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error al cargar los detalles del producto:", error);
        document.querySelector(".product-container").innerHTML = `<p class="text-danger">Error al cargar los detalles del producto.</p>`;
    }
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
    renderCart();
    updateCartTotal();
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

// Renderizar carrito
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

    updateCartTotal();
}

// Eliminar del carrito
function removeFromCart(productId) {
    carrito = carrito.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

// Inicializar la página
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    if (path.includes("index.html")) {
        getCharacters();
    } else if (path.includes("product-list-page.html")) {
        getCharacters();
    } else if (path.includes("product-detail-page.html")) {
        renderProductDetails();
    } else if (path.includes("cart.html")) {
        renderCart();
    }
});

//para resolver problema responsivo de mi navbar
document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const mainNav = document.getElementById("main-nav");

    // Toggle the menu for mobile view
    menuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("active");
    });

    // Close the menu when a link is clicked (optional, for single-page applications)
    const navLinks = document.querySelectorAll(".nav-list a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("active");
        });
    });
});
