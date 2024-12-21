// URL de la API
const API_URL = "https://rickandmortyapi.com/api/character";

// Variable global para el carrito
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Obtener productos desde la API
async function getCharacters() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        renderProductList(data);
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}

// Renderizar productos
function renderProductList(data) {
    const container = document.querySelector("#productosContainer");
    if (!container) return;

    container.innerHTML = ""; // Limpiar antes de agregar
    data.results.forEach(product => {
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
        container.appendChild(card);
    });
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
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Renderizar carrito
function renderCart() {
    const carritoContainer = document.querySelector("#carritoContainer");
    const carritoTotal = document.querySelector("#carrito-total");
    if (!carritoContainer || !carritoTotal) return;

    carritoContainer.innerHTML = ""; // Limpiar contenido del carrito

    let total = 0;

    carrito.forEach(product => {
        const item = document.createElement("div");
        item.classList.add("cart-item");
        item.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h4>${product.title}</h4>
            <p>Precio: $${product.price}</p>
            <p>Cantidad: ${product.cantidad}</p>
            <div class="cart-actions">
                <button class="btn btn-success add-one" data-id="${product.id}">+</button>
                <button class="btn btn-danger remove-one" data-id="${product.id}">-</button>
                <button class="btn btn-warning delete-item" data-id="${product.id}">Eliminar</button>
            </div>
        `;
        carritoContainer.appendChild(item);

        // Sumar total del carrito
        total += product.price * product.cantidad;

        // Eventos de las acciones del carrito
        item.querySelector(".add-one").addEventListener("click", () => updateQuantity(product.id, 1));
        item.querySelector(".remove-one").addEventListener("click", () => updateQuantity(product.id, -1));
        item.querySelector(".delete-item").addEventListener("click", () => removeFromCart(product.id));
    });

    // Actualizar total del carrito
    carritoTotal.textContent = `$${total.toFixed(2)}`;
}

// Actualizar cantidad de un producto en el carrito
function updateQuantity(productId, amount) {
    const product = carrito.find(item => item.id === productId);
    if (!product) return;

    product.cantidad += amount;

    if (product.cantidad <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        renderCart();
    }
}

// Eliminar producto del carrito
function removeFromCart(productId) {
    carrito = carrito.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    getCharacters();
    renderCart();
});
