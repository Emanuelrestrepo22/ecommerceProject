function getCharacters(done) {
    fetch("https://rickandmortyapi.com/api/character")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => done(data))
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}

// Renderizar carrusel
function renderCarousel(data) {
    const carouselInner = document.querySelector("#carouselExample .carousel-inner");
    if (!carouselInner) return;

    let htmlContent = "";
    data.results.forEach((personaje, index) => {
        htmlContent += `
        <div class="carousel-item ${index === 0 ? "active" : ""}">
            <img src="${personaje.image}" class="d-block w-100" alt="${personaje.name}">
            <div class="carousel-caption d-none d-md-block">
                <h5>${personaje.name}</h5>
                <p>${personaje.status}</p>
            </div>
        </div>`;
    });
    carouselInner.innerHTML = htmlContent;
}

// Renderizar lista de productos
function renderProductList(data) {
    const productosContainer = document.querySelector("#productosContainer");
    if (!productosContainer) return;

    let htmlContent = "";
    data.results.forEach(personaje => {
        htmlContent += `
        <div class="card">
            <img src="${personaje.image}" alt="${personaje.name}" class="card-imagen">
            <h3 class="card-titulo">${personaje.name}</h3>
            <p class="card-descripcion">Estado: ${personaje.status}</p>
            <p class="card-precio">ID: ${personaje.id}</p>
            <button class="card-boton">Agregar al carrito</button>
        </div>`;
    });
    productosContainer.innerHTML = htmlContent;
}

// Ejecutar en las páginas correspondientes
getCharacters(data => {
    if (document.querySelector("#carouselExample")) {
        renderCarousel(data);
    }
    if (document.querySelector("#productosContainer")) {
        renderProductList(data);
    }
});



// para card de card.html
// Obtener el ID del producto desde la URL
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id"); // Ejemplo: ?id=3
}

// Función para obtener los detalles del producto desde la API
function getProductDetails(productId) {
    fetch(`https://rickandmortyapi.com/api/character/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => renderProductDetails(data))
        .catch(error => {
            console.error("Error al cargar los detalles del producto:", error);
            document.querySelector(".product-container").innerHTML = `
                <p class="error-message">No se pudo cargar la información del producto. Intenta nuevamente más tarde.</p>`;
        });
}

// Renderizar los detalles del producto en la página
function renderProductDetails(product) {
    const productContainer = document.querySelector(".product-container");

    if (!productContainer) return;

    productContainer.innerHTML = `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h2 class="product-name">${product.name}</h2>
                <p class="product-status"><strong>Estado:</strong> ${product.status}</p>
                <p class="product-species"><strong>Especie:</strong> ${product.species}</p>
                <p class="product-gender"><strong>Género:</strong> ${product.gender}</p>
                <p class="product-origin"><strong>Origen:</strong> ${product.origin.name}</p>
            </div>
        </div>
    `;
}

// Lógica principal
const productId = getProductIdFromURL();
if (productId) {
    getProductDetails(productId);
} else {
    document.querySelector(".product-container").innerHTML = `
        <p class="error-message">No se encontró un producto para mostrar.</p>`;
}

function renderProductList(data) {
    const productosContainer = document.querySelector("#productosContainer");
    if (!productosContainer) return;

    let htmlContent = "";
    data.results.forEach(personaje => {
        htmlContent += `
        <div class="card">
            <img src="${personaje.image}" alt="${personaje.name}" class="card-imagen">
            <h3 class="card-titulo">${personaje.name}</h3>
            <p class="card-descripcion">Estado: ${personaje.status}</p>
            <a href="product-card-page.html?id=${personaje.id}" class="card-boton">Ver detalles </a>
        </div>`;
    });
    productosContainer.innerHTML = htmlContent;
}






