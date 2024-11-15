// Seleccionamos el contenedor donde se insertarán las cards
const cardContainer = document.getElementById('card-container');

// Función para crear la estructura HTML de cada card
function createCard(character) {
    // Creamos un div para cada card
    const card = document.createElement('div');
    card.classList.add('card');

    // Estructura HTML de la card
    card.innerHTML = `
        <img src="${character.image}" alt="${character.name}" class="card-imagen">
        <div class="card-info">
            <h3 class="card-titulo">${character.name}</h3>
            <p class="card-descripcion">Especie: ${character.species}</p>
            <p class="card-descripcion">Origen: ${character.origin.name}</p>
            <p class="card-status">Estado: ${character.status}</p>
            <button class="card-boton">Ver perfil</button>
        </div>
    `;

    // Añadimos la card al contenedor
    cardContainer.appendChild(card);
}

// Función para consumir la API y generar las cards
async function fetchCharacters() {
    try {
        const response = await fetch('https://rickandmortyapi.com/api/character');
        const data = await response.json();

        // Iteramos sobre cada personaje y creamos una card
        data.results.forEach(character => {
            createCard(character);
        });
    } catch (error) {
        console.error('Error al obtener los personajes:', error);
    }
}

// Llamamos a la función para cargar los personajes
fetchCharacters();
