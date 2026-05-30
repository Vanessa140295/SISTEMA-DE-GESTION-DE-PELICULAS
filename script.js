/**
 * SISTEMA DE GESTIÓN DE PELÍCULAS - EDICIÓN PRO
 * Programación Web - Corte #3
 */

// --- ESTADO GLOBAL DE LA APLICACIÓN ---
let peliculas = JSON.parse(localStorage.getItem('peliculas')) || [];

// --- ELEMENTOS DEL DOM ---
const formulario = document.getElementById('movie-form');
const inputId = document.getElementById('movie-id');
const inputTitulo = document.getElementById('title');
const inputDirector = document.getElementById('director');
const inputAnio = document.getElementById('year');
const selectCategoria = document.getElementById('category');
const inputImagen = document.getElementById('image-url'); // NUEVO
const selectPuntuacion = document.getElementById('rating'); // NUEVO

const btnGuardar = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');
const tituloFormulario = document.getElementById('form-title');

const contenedorPeliculas = document.getElementById('movies-container');
const contadorPeliculas = document.getElementById('movie-counter');
const inputBusqueda = document.getElementById('search-input');
const selectFiltroCategoria = document.getElementById('filter-category');
const selectOrdenamiento = document.getElementById('sort-movies'); // NUEVO

// Póster por defecto por si el usuario no pone un enlace válido
const IMAGEN_POR_DEFECTO = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop";

// --- EVENTOS (LISTENERS) ---
document.addEventListener('DOMContentLoaded', () => {
    renderizarCatalogo();
    
    inputBusqueda.addEventListener('input', renderizarCatalogo);
    selectFiltroCategoria.addEventListener('change', renderizarCatalogo);
    selectOrdenamiento.addEventListener('change', renderizarCatalogo); // NUEVO
});

formulario.addEventListener('submit', procesarFormulario);
btnCancel.addEventListener('click', limpiarFormulario);

// --- FUNCIONES CORE ---

function procesarFormulario(e) {
    e.preventDefault();

    if (!validarFormulario()) return;

    // Validación y saneamiento de URL de imagen
    let urlImg = inputImagen.value.trim();
    if (urlImg === "") {
        urlImg = IMAGEN_POR_DEFECTO;
    }

    const datosPelicula = {
        id: inputId.value ? parseInt(inputId.value) : Date.now(),
        titulo: inputTitulo.value.trim(),
        director: inputDirector.value.trim(),
        anio: parseInt(inputAnio.value),
        categoria: selectCategoria.value,
        imagen: urlImg, // NUEVO
        puntuacion: parseInt(selectPuntuacion.value) // NUEVO
    };

    if (inputId.value) {
        peliculas = peliculas.map(p => p.id === datosPelicula.id ? datosPelicula : p);
    } else {
        peliculas.push(datosPelicula);
    }

    guardarEnLocalStorage();
    renderizarCatalogo();
    limpiarFormulario();
}

function validarFormulario() {
    let esValido = true;
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

    if (inputTitulo.value.trim().length < 2) {
        document.getElementById('error-title').textContent = "El título debe contener mínimo 2 caracteres.";
        esValido = false;
    }

    if (inputDirector.value.trim().length < 3) {
        document.getElementById('error-director').textContent = "El nombre del director debe contener mínimo 3 caracteres.";
        esValido = false;
    }

    const anioVal = parseInt(inputAnio.value);
    if (isNaN(anioVal) || anioVal < 1900 || anioVal > 2026) {
        document.getElementById('error-year').textContent = "El año debe estar en un rango válido entre 1900 y 2026.";
        esValido = false;
    }

    if (!selectCategoria.value) {
        document.getElementById('error-category').textContent = "La categoría debe seleccionarse obligatoriamente.";
        esValido = false;
    }

    // Validación opcional/básica de URL de imagen si el usuario escribió algo
    const urlVal = inputImagen.value.trim();
    if (urlVal !== "" && !urlVal.startsWith('http://') && !urlVal.startsWith('https://')) {
        document.getElementById('error-image').textContent = "Por favor ingresa una URL válida (http:// o https://).";
        esValido = false;
    }

    return esValido;
}

function renderizarCatalogo() {
    contenedorPeliculas.innerHTML = '';

    const textoBusqueda = inputBusqueda.value.toLowerCase().trim();
    const categoriaFiltro = selectFiltroCategoria.value;
    const criterioOrden = selectOrdenamiento.value;

    // 1. Filtrar las películas primero
    let peliculasFiltradas = peliculas.filter(pelicula => {
        const coincideTitulo = pelicula.titulo.toLowerCase().includes(textoBusqueda);
        const coincideCategoria = (categoriaFiltro === 'Todas' || pelicula.categoria === categoriaFiltro);
        return coincideTitulo && coincideCategoria;
    });

    // 2. NUEVO: Ordenar los resultados filtrados basados en la selección
    if (criterioOrden === 'recent') {
        peliculasFiltradas.sort((a, b) => b.anio - a.anio); // Año descendente
    } else if (criterioOrden === 'oldest') {
        peliculasFiltradas.sort((a, b) => a.anio - b.anio); // Año ascendente
    } else if (criterioOrden === 'rating') {
        peliculasFiltradas.sort((a, b) => b.puntuacion - a.puntuacion); // Puntuación descendente
    }

    // Actualizar el contador de registros
    contadorPeliculas.textContent = peliculasFiltradas.length;

    if (peliculasFiltradas.length === 0) {
        contenedorPeliculas.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No se encontraron películas.</p>`;
        return;
    }

    // 3. Renderizar las tarjetas con las imágenes y las estrellas
    peliculasFiltradas.forEach(pelicula => {
        const tarjeta = document.createElement('div');
        tarjeta.className = `movie-card ${pelicula.categoria}`;

        // Convertir la puntuación numérica en caracteres de estrellas
        const estrellas = '⭐'.repeat(pelicula.puntuacion);

        tarjeta.innerHTML = `
            <img class="movie-poster" src="${escapeHTML(pelicula.imagen)}" alt="Póster de ${escapeHTML(pelicula.titulo)}" onerror="this.src='${IMAGEN_POR_DEFECTO}'">
            <div class="movie-card-content">
                <div>
                    <h3>${escapeHTML(pelicula.titulo)}</h3>
                    <p><strong>Director:</strong> ${escapeHTML(pelicula.director)}</p>
                    <p><strong>Año:</strong> ${pelicula.anio}</p>
                    <div class="rating-display">${estrellas}</div>
                    <span class="category-tag">${pelicula.categoria}</span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-card btn-edit" onclick="cargarParaEditar(${pelicula.id})">Editar</button>
                    <button class="btn btn-card btn-delete" onclick="eliminarPelicula(${pelicula.id})">Eliminar</button>
                </div>
            </div>
        `;
        contenedorPeliculas.appendChild(tarjeta);
    });
}

window.cargarParaEditar = function(id) {
    const pelicula = peliculas.find(p => p.id === id);
    if (!pelicula) return;

    inputId.value = pelicula.id;
    inputTitulo.value = pelicula.titulo;
    inputDirector.value = pelicula.director;
    inputAnio.value = pelicula.anio;
    selectCategoria.value = pelicula.categoria;
    inputImagen.value = pelicula.imagen === IMAGEN_POR_DEFECTO ? "" : pelicula.imagen;
    selectPuntuacion.value = pelicula.puntuacion;

    tituloFormulario.textContent = "Modificar Película";
    btnGuardar.textContent = "Actualizar Cambios";
    btnCancel.classList.remove('hidden');
    
    inputTitulo.focus();
};

window.eliminarPelicula = function(id) {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
        peliculas = peliculas.filter(p => p.id !== id);
        guardarEnLocalStorage();
        renderizarCatalogo();
        
        if (parseInt(inputId.value) === id) {
            limpiarFormulario();
        }
    }
};

function guardarEnLocalStorage() {
    localStorage.setItem('peliculas', JSON.stringify(peliculas));
}

function limpiarFormulario() {
    formulario.reset();
    inputId.value = '';
    tituloFormulario.textContent = "Registrar Nueva Película";
    btnGuardar.textContent = "Guardar Película";
    btnCancel.classList.add('hidden');
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
