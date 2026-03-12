// ─── Referencias al DOM ───────────────────────────────────────────────────────

// Formulario principal para añadir nuevos hábitos
const FORM_HABITO = document.getElementById("nuevo_habito");

// Campo de búsqueda para filtrar la lista en tiempo real
const INPUT_BUSQUEDA = document.getElementById("busqueda");

// Plantilla HTML clonada por crearHabito() para generar cada tarjeta de hábito
const TEMPLATE_HABITO = document.getElementById("habito-template");

// Campos del formulario y sus párrafos de error asociados
const INPUT_NOMBRE   = document.getElementById("nombre_habito");
const INPUT_DURACION = document.getElementById("duracion_habito");
const ERROR_NOMBRE   = document.getElementById("error-nombre");
const ERROR_DURACION = document.getElementById("error-duracion");

// ─── Datos ────────────────────────────────────────────────────────────────────

// Comprueba si ya existen hábitos guardados en localStorage antes de leer el valor
const HABITOS_EN_STORAGE = localStorage.getItem("Lista_de_habitos") != null;

/*
 * Fuente de datos principal de la aplicación.
 * Si localStorage contiene datos previos, los recupera y parsea.
 * Si no, inicializa la lista con cuatro hábitos de ejemplo para la primera visita.
 * Los IDs de ejemplo usan Date.now() + offset para garantizar valores distintos
 * dentro de la misma ejecución.
 */
let habitos = HABITOS_EN_STORAGE
	? JSON.parse(localStorage.getItem("Lista_de_habitos"))
	: [
			{
				habito: "Habito",
				tiempo: "Temporalización",
				completado: false,
				id: Date.now(),
				createdAt: new Date().toISOString(),
			},
			{
				habito: "Leer",
				tiempo: "1 capítulo",
				completado: false,
				id: Date.now() + 1,
				createdAt: new Date().toISOString(),
			},
			{
				habito: "Correr",
				tiempo: "30 minutos",
				completado: false,
				id: Date.now() + 2,
				createdAt: new Date().toISOString(),
			},
			{
				habito: "Tomar vitaminas",
				tiempo: "Instantáneo",
				completado: false,
				id: Date.now() + 3,
				createdAt: new Date().toISOString(),
			},
		];

// ─── Validación ───────────────────────────────────────────────────────────────

/**
 * Muestra un mensaje de error debajo del campo indicado y marca su borde en rojo.
 * Las clases de borde rojo respetan el modo oscuro (dark:border-red-400).
 *
 * @param {HTMLInputElement} input   - Campo de formulario que ha fallado la validación.
 * @param {HTMLElement}      errorEl - Párrafo <p> donde se mostrará el mensaje de error.
 * @param {string}           mensaje - Texto descriptivo del error.
 */
function mostrarError(input, errorEl, mensaje) {
	errorEl.textContent = mensaje;
	errorEl.classList.remove("hidden");
	// Sustituye el borde estándar por el borde de error
	input.classList.add("border-red-600", "dark:border-red-400");
	input.classList.remove("border-black", "dark:border-gray-500");
}

/**
 * Oculta el mensaje de error de un campo y restaura su borde original.
 * Se llama al corregir el campo (evento "input") o al resetear el formulario.
 *
 * @param {HTMLInputElement} input   - Campo de formulario a limpiar.
 * @param {HTMLElement}      errorEl - Párrafo <p> de error a ocultar.
 */
function limpiarError(input, errorEl) {
	errorEl.textContent = "";
	errorEl.classList.add("hidden");
	// Restaura el borde estándar
	input.classList.remove("border-red-600", "dark:border-red-400");
	input.classList.add("border-black", "dark:border-gray-500");
}

/**
 * Valida todos los campos del formulario antes de añadir un hábito.
 * Comprueba que ningún campo esté vacío tras eliminar espacios en blanco.
 * Si hay varios errores, los muestra todos a la vez sin detener la validación
 * al primer fallo.
 *
 * @returns {boolean} true si todos los campos son válidos; false si alguno falla.
 */
function validarFormulario() {
	const nombre   = INPUT_NOMBRE.value.trim();
	const duracion = INPUT_DURACION.value.trim();
	let esValido   = true;

	if (!nombre) {
		mostrarError(INPUT_NOMBRE, ERROR_NOMBRE, "El nombre del hábito es obligatorio.");
		esValido = false;
	}

	if (!duracion) {
		mostrarError(INPUT_DURACION, ERROR_DURACION, "La duración es obligatoria.");
		esValido = false;
	}

	return esValido;
}

// Limpia el error del campo nombre en cuanto el usuario empieza a escribir en él
INPUT_NOMBRE.addEventListener("input", function () {
	if (INPUT_NOMBRE.value.trim()) {
		limpiarError(INPUT_NOMBRE, ERROR_NOMBRE);
	}
});

// Limpia el error del campo duración en cuanto el usuario empieza a escribir en él
INPUT_DURACION.addEventListener("input", function () {
	if (INPUT_DURACION.value.trim()) {
		limpiarError(INPUT_DURACION, ERROR_DURACION);
	}
});

// ─── Funciones ────────────────────────────────────────────────────────────────

/**
 * Recalcula y actualiza los tres contadores del panel lateral de resumen:
 * total de hábitos, completados y pendientes.
 * Se llama tras cualquier operación que modifique la lista (añadir, eliminar, completar).
 */
function actualizarResumen() {
	const total       = habitos.length;
	const completados = habitos.filter(function (h) {
		return h.completado;
	}).length;
	document.getElementById("resumen-total").textContent      = total;
	document.getElementById("resumen-completados").textContent = completados;
	document.getElementById("resumen-pendientes").textContent  = total - completados;
}

/**
 * Crea una tarjeta de hábito clonando el <template id="habito-template"> del HTML,
 * rellena sus campos con los datos del hábito recibido, registra los eventos
 * de completar y eliminar, y añade el elemento al <ul> de la página.
 *
 * @param {{ habito: string, tiempo: string, completado: boolean, id: number, createdAt: string }} habito
 *   Objeto con los datos del hábito a renderizar.
 */
function crearHabito(habito) {
	// Clona el template con todos sus nodos hijo (true = clonado profundo)
	const clon     = TEMPLATE_HABITO.content.cloneNode(true);
	const li       = clon.querySelector("li");
	const nombre   = clon.querySelector(".nombre");
	const checkbox = clon.querySelector(".completado");

	// Asigna los datos del hábito a los elementos del clon
	li.dataset.id = habito.id;
	nombre.textContent = habito.habito;
	clon.querySelector(".tiempo").textContent = habito.tiempo;
	// El aria-label incluye el nombre para que los lectores de pantalla identifiquen qué se elimina
	clon.querySelector("button").setAttribute("aria-label", "Eliminar hábito: " + habito.habito);

	// Restaura el estado visual del checkbox si el hábito ya estaba completado al cargar
	checkbox.checked = habito.completado || false;
	if (habito.completado) {
		nombre.classList.add("opacity-50");
	}

	/*
	 * Evento "change" del checkbox:
	 * Actualiza el estado "completado" en el array, aplica u elimina la opacidad
	 * sobre el nombre del hábito y persiste el cambio en localStorage.
	 */
	checkbox.addEventListener("change", function () {
		habito.completado = checkbox.checked;
		li.querySelector(".nombre").classList.toggle("opacity-50", checkbox.checked);
		localStorage.setItem("Lista_de_habitos", JSON.stringify(habitos));
		actualizarResumen();
	});

	/*
	 * Evento "click" del botón Eliminar:
	 * Elimina el <li> del DOM y filtra el hábito fuera del array,
	 * luego persiste el array actualizado y recalcula el resumen.
	 */
	clon.querySelector("button").addEventListener("click", function () {
		li.remove();
		habitos = habitos.filter(function (habitoGuardado) {
			return habitoGuardado.id !== habito.id;
		});
		localStorage.setItem("Lista_de_habitos", JSON.stringify(habitos));
		actualizarResumen();
	});

	document.querySelector("ul").appendChild(clon);
}

// ─── Inicialización ───────────────────────────────────────────────────────────

// Renderiza todos los hábitos cargados (de localStorage o de ejemplo) y actualiza el resumen
habitos.forEach(crearHabito);
actualizarResumen();

// ─── Eventos ──────────────────────────────────────────────────────────────────

/**
 * Evento "submit" del formulario:
 * Valida los campos antes de proceder. Si alguno está vacío, muestra el error
 * correspondiente y cancela la operación.
 * Si la validación pasa, crea el hábito, lo guarda y limpia el formulario.
 *
 * @param {SubmitEvent} evento - Evento de envío del formulario.
 */
FORM_HABITO.addEventListener("submit", function (evento) {
	evento.preventDefault();

	// Detiene la ejecución si algún campo no supera la validación
	if (!validarFormulario()) return;

	const nombre   = INPUT_NOMBRE.value.trim();
	const duracion = INPUT_DURACION.value.trim();
	const id       = Date.now(); // Identificador único basado en el timestamp actual

	habitos.push({
		habito: nombre,
		tiempo: duracion,
		completado: false,
		id: id,
		createdAt: new Date().toISOString(),
	});

	crearHabito(habitos[habitos.length - 1]);
	localStorage.setItem("Lista_de_habitos", JSON.stringify(habitos));
	actualizarResumen();

	// Limpia todos los campos del formulario de una sola vez
	FORM_HABITO.reset();
	// Elimina los posibles estados de error visuales que pudieran quedar tras el reset
	limpiarError(INPUT_NOMBRE, ERROR_NOMBRE);
	limpiarError(INPUT_DURACION, ERROR_DURACION);
});

/**
 * Evento "input" del buscador:
 * Recorre todos los <li> de la lista y oculta aquellos cuyo nombre
 * no contenga el texto introducido (búsqueda sin distinción de mayúsculas).
 */
INPUT_BUSQUEDA.addEventListener("input", function () {
	const textoBuscado  = INPUT_BUSQUEDA.value.toLowerCase();
	const listaHabitos = document.querySelectorAll("ul li");
	listaHabitos.forEach(function (habito) {
		const nombre = habito.querySelector("h3").textContent.toLowerCase();
		nombre.includes(textoBuscado)
			? (habito.style.display = "")
			: (habito.style.display = "none");
	});
});

// ─── Modo oscuro ──────────────────────────────────────────────────────────────

/*
 * Al cargar la página, comprueba si el usuario activó el modo oscuro
 * en una sesión anterior (valor "true" en localStorage bajo la clave "modo-oscuro").
 * Si es así, añade la clase "dark" al elemento raíz e intercambia los iconos.
 */
if (localStorage.getItem("modo-oscuro") === "true") {
	document.documentElement.classList.add("dark");
	document.getElementById("icono-luna").classList.add("hidden");
	document.getElementById("icono-sol").classList.remove("hidden");
}

/**
 * Evento "click" del botón de modo oscuro:
 * Alterna la clase "dark" en <html>, intercambia los iconos de luna y sol,
 * y persiste la preferencia en localStorage para mantenerla entre sesiones.
 */
document.getElementById("toggle_dark").addEventListener("click", function () {
	const esModoOscuro = document.documentElement.classList.toggle("dark");
	document.getElementById("icono-luna").classList.toggle("hidden");
	document.getElementById("icono-sol").classList.toggle("hidden");
	localStorage.setItem("modo-oscuro", esModoOscuro);
});
