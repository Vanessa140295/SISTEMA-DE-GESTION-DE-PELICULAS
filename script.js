/**
 * SISTEMA DE GESTIÓN DE PELÍCULAS
 * Programación Web - Corte #3
 */

// --- ESTADO GLOBAL DE LA APLICACIÓN ---
// Se inicializa con los datos de localStorage o un arreglo vacío si no existen registros.
let peliculas = JSON.parse(localStorage.getItem('peliculas')) || [];

// --- ELEMENTOS DEL DOM ---
const formulario = document.getElementById('movie-form');
const inputId = document.getElementById('movie-id');
const inputTitulo = document.getElementById('title');
const inputDirector = document.getElementById('director');
const inputAnio = document.getElementById('year');
const selectCategoria = document.getElementById('category');

const btnGuardar = document.getElementById('btn-save');
const btnCancelar = document.getElementById('btn-cancel');
const tituloFormulario = document.getElementById('form-title');

const contenedorPeliculas = document.getElementById('movies-container');
const contadorPeliculas = document.getElementById('movie-counter');
const inputBusqueda = document.getElementById('search-input');
const selectFiltroCategoria = document.getElementById('filter-category');

// --- EVENTOS (LISTENERS) ---
document.addEventListener('DOMContentLoaded', () => {
    renderizarCatalogo(); // Muestra los datos persistidos al cargar la página
    
    // Escuchadores para búsquedas y filtros en tiempo real
    inputBusqueda.addEventListener('input', renderizarCatalogo);
    selectFiltroCategoria.addEventListener('change', renderizarCatalogo);
});

formulario.addEventListener('submit', procesarFormulario);
btnCancelar.addEventListener('click', limpiarFormulario);


// --- FUNCIONES CORE (CRUD & LÓGICA) ---

/**
 * Procesa el envío del formulario determinando si es una inserción (Create) o actualización (Update)
 */
function procesarFormulario(e) {
    e.preventDefault(); // Evita la recarga automática de la página

    // Ejecuta la validación personalizada obligatoria
    if (!validarFormulario()) return;

    // Crea el objeto con la estructura requerida
    const datosPelicula = {
        id: inputId.value ? parseInt(inputId.value) : Date.now(), // ID único basado en timestamp si es nueva
        titulo: inputTitulo.value.trim(),
        director: inputDirector.value.trim(),
        anio: parseInt(inputAnio.value),
        categoria: selectCategoria.value
    };

    if (inputId.value) {
        // --- MODO: ACTUALIZAR (UPDATE) ---
        peliculas = peliculas.map(p => p.id === datosPelicula.id ? datosPelicula : p);
    } else {
        // --- MODO: CREAR (CREATE) ---
        peliculas.push(datosPelicula);
    }

    guardarEnLocalStorage();
    renderizarCatalogo();
    limpiarFormulario();
}

/**
 * Valida minuciosamente cada campo bajo los requerimientos del taller
 */
function validarFormulario() {
    let esValido = true;

    // Limpiar mensajes de error previos
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

    // 1. Validación del Título (Mínimo 2 caracteres)
    const tituloVal = inputTitulo.value.trim();
    if (tituloVal.length < 2) {
        document.getElementById('error-title').textContent = "El título debe contener mínimo 2 caracteres.";
        esValido = false;
    }

    // 2. Validación del Director (Mínimo 3 caracteres)
    const directorVal = inputDirector.value.trim();
    if (directorVal.length < 3) {
        document.getElementById('error-director').textContent = "El nombre del director debe contener mínimo 3 caracteres.";
        esValido = false;
    }

    // 3. Validación del Año (Rango dinámico válido entre 1900 y 2026)
    const anioVal = parseInt(inputAnio.value);
    if (isNaN(anioVal) || anioVal < 1900 || anioVal > 2026) {
        document.getElementById('error-year').textContent = "El año debe estar en un rango válido entre 1900 y 2026.";
        esValido = false;
    }

    // 4. Validación de Categoría (Selección obligatoria)
    if (!selectCategoria.value) {
        document.getElementById('error-category').textContent = "La categoría debe seleccionarse obligatoriamente.";
        esValido = false;
    }

    return esValido;
}

/**
 * Renderiza dinámicamente las tarjetas de películas aplicando búsquedas y filtros en memoria
 */
function renderizarCatalogo() {
    // Limpia el visor para reconstruirlo
    contenedorPeliculas.innerHTML = '';

    const textoBusqueda = inputBusqueda.value.toLowerCase().trim();
    const categoriaFiltro = selectFiltroCategoria.value;

    // Filtrado dinámico en cascada (Filtro por título AND Filtro por categoría)
    const peliculasFiltradas = peliculas.filter(pelicula => {
        const coincideTitulo = pelicula.titulo.toLowerCase().includes(textoBusqueda);
        const coincideCategoria = (categoriaFiltro === 'Todas' || pelicula.categoria === categoriaFiltro);
        return coincideTitulo && coincideCategoria;
    });

    // Actualiza el contador dinámico en tiempo real
    contadorPeliculas.textContent = peliculasFiltradas.length;

    if (peliculasFiltradas.length === 0) {
        contenedorPeliculas.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No se encontraron películas que coincidan con los criterios establecidos.</p>`;
        return;
    }

    // Construcción del DOM usando literales de plantilla para alta legibilidad
    peliculasFiltradas.forEach(pelicula => {
        const tarjeta = document.createElement('div');
        tarjeta.className = `movie-card ${pelicula.categoria}`;

        tarjeta.innerHTML = `
            <div>
                <h3>${escapeHTML(pelicula.titulo)}</h3>
                <p><strong>Director:</strong> ${escapeHTML(pelicula.director)}</p>
                <p><strong>Año:</strong> ${pelicula.anio}</p>
                <span class="category-tag">${pelicula.categoria}</span>
            </div>
            <div class="card-actions">
                <button class="btn btn-card btn-edit" onclick="cargarParaEditar(${pelicula.id})">Editar</button>
                <button class="btn btn-card btn-delete" onclick="eliminarPelicula(${pelicula.id})">Eliminar</button>
            </div>
        `;
        contenedorPeliculas.appendChild(tarjeta);
    });
}

/**
 * Carga un registro existente en el formulario cambiando la interfaz a modo de Edición (Carga de Datos para Update)
 */
window.cargarParaEditar = function(id) {
    const pelicula = peliculas.find(p => p.id === id);
    if (!pelicula) return;

    // Poblar los inputs
    inputId.value = pelicula.id;
    inputTitulo.value = pelicula.titulo;
    inputDirector.value = pelicula.director;
    inputAnio.value = pelicula.anio;
    selectCategoria.value = pelicula.categoria;

    // Alterar interfaz visual para guiar al usuario
    tituloFormulario.textContent = "Modificar Película";
    btnGuardar.textContent = "Actualizar Cambios";
    btnCancelar.classList.remove('hidden');
    
    // Enfocar automáticamente el primer elemento
    inputTitulo.focus();
};

/**
 * Remueve de forma lógica el objeto seleccionado basándose en su ID único (Delete)
 */
window.eliminarPelicula = function(id) {
    if (confirm("¿Estás completamente seguro de que deseas eliminar este registro del catálogo?")) {
        peliculas = peliculas.filter(p => p.id !== id);
        guardarEnLocalStorage();
        renderizarCatalogo();
        
        // Si se elimina un elemento que se estaba editando en ese momento, limpia el formulario
        if (parseInt(inputId.value) === id) {
            limpiarFormulario();
        }
    }
};

/**
 * Sincroniza el arreglo del estado de la aplicación con la API de almacenamiento local (Persistencia)
 */
function guardarEnLocalStorage() {
    localStorage.setItem('peliculas', JSON.stringify(peliculas));
}

/**
 * Blanquea los inputs de control y regresa la interfaz a su estado por defecto de inserción
 */
function limpiarFormulario() {
    formulario.reset();
    inputId.value = '';
    
    // Restaurar los textos originales
    tituloFormulario.textContent = "Registrar Nueva Película";
    btnGuardar.textContent = "Guardar Película";
    btnCancelar.classList.add('hidden');
    
    // Limpiar mensajes de error vigentes
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}

/**
 * Función utilitaria de sanitización para prevenir vulnerabilidades de XSS al inyectar código dinámico
 */
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}