// ─── Referencias al DOM ───────────────────────────────────────────────────────
const FORM_HABITO = document.getElementById("nuevo_habito");

const INPUT_BUSQUEDA = document.getElementById("busqueda");

// Plantilla HTML que se clona para cada hábito de la lista
const TEMPLATE_HABITO = document.getElementById("habito-template");

// ─── Datos ────────────────────────────────────────────────────────────────────

// Comprueba si ya hay hábitos guardados en localStorage
const HABITOS_EN_STORAGE = localStorage.getItem("Lista_de_habitos") != null;

// Si hay datos guardados los recupera; si no, carga una lista de ejemplo
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

// ─── Funciones ────────────────────────────────────────────────────────────────

/**
 * Actualiza los contadores del panel de resumen lateral.
 * Recalcula total, completados y pendientes a partir del array habitos.
 */
function actualizarResumen() {
	const total = habitos.length;
	const completados = habitos.filter(function (h) {
		return h.completado;
	}).length;
	document.getElementById("resumen-total").textContent = total;
	document.getElementById("resumen-completados").textContent = completados;
	document.getElementById("resumen-pendientes").textContent = total - completados;
}

/**
 * Crea y añade un elemento de hábito al DOM usando el template definido en el HTML.
 * También registra los eventos de completar y eliminar en sus elementos correspondientes.
 * @param {{ habito: string, tiempo: string, completado: boolean, id: number, createdAt: string }} habito - Objeto con los datos del hábito.
 */
function crearHabito(habito) {
	// Clona el template y obtiene referencias a sus elementos internos
	const clon = TEMPLATE_HABITO.content.cloneNode(true);
	const li = clon.querySelector("li");
	const nombre = clon.querySelector(".nombre");
	const checkbox = clon.querySelector(".completado");

	// Rellena el contenido con los datos del hábito
	li.dataset.id = habito.id;
	nombre.textContent = habito.habito;
	clon.querySelector(".tiempo").textContent = habito.tiempo;
	clon.querySelector("button").setAttribute("aria-label", "Eliminar hábito: " + habito.habito);

	// Restaura el estado visual si el hábito ya estaba completado
	checkbox.checked = habito.completado || false;
	if (habito.completado) {
		nombre.classList.add("opacity-50");
	}

	// Marca o desmarca el hábito al cambiar el checkbox
	checkbox.addEventListener("change", function () {
		habito.completado = checkbox.checked;
		// Aplica o elimina la opacidad según el estado del checkbox
		li.querySelector(".nombre").classList.toggle("opacity-50", checkbox.checked);
		localStorage.setItem("Lista_de_habitos", JSON.stringify(habitos));
		actualizarResumen();
	});

	// Elimina el hábito del DOM y del array al pulsar el botón
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

// Renderiza todos los hábitos al cargar la página y actualiza el resumen
habitos.forEach(crearHabito);
actualizarResumen();

// ─── Eventos ──────────────────────────────────────────────────────────────────

/**
 * Maneja el envío del formulario para añadir un nuevo hábito.
 * Crea el objeto hábito, lo añade al array, lo renderiza y lo guarda en localStorage.
 * @param {SubmitEvent} evento - Evento de envío del formulario.
 */
FORM_HABITO.addEventListener("submit", function (evento) {
	evento.preventDefault();
	let nombre = document.getElementById("nombre_habito").value;
	let duracion = document.getElementById("duracion_habito").value;
	let id = Date.now(); // Usa el timestamp como identificador único
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
	// Limpia el formulario tras añadir el hábito
	document.getElementById("nombre_habito").value = "";
	document.getElementById("duracion_habito").value = "";
});

/**
 * Filtra la lista de hábitos visibles según el texto introducido en el buscador.
 * Oculta los elementos cuyo nombre no coincida con la búsqueda.
 */
INPUT_BUSQUEDA.addEventListener("input", function () {
	let textoBuscado = INPUT_BUSQUEDA.value.toLowerCase();
	const listaHabitos = document.querySelectorAll("ul li");
	listaHabitos.forEach(function (habito) {
		let nombre = habito.querySelector("h3").textContent.toLowerCase();
		// Muestra u oculta cada elemento según si su nombre incluye el texto buscado
		nombre.includes(textoBuscado) ? (habito.style.display = "") : (habito.style.display = "none");
	});
});

// ─── Modo oscuro ──────────────────────────────────────────────────────────────

/**
 * Aplica el modo oscuro guardado en localStorage al cargar la página.
 */
if (localStorage.getItem("modo-oscuro") === "true") {
	document.documentElement.classList.add("dark");
	document.getElementById("icono-luna").classList.add("hidden");
	document.getElementById("icono-sol").classList.remove("hidden");
}

/**
 * Alterna el modo oscuro añadiendo o eliminando la clase "dark" en el elemento raíz.
 * Intercambia los iconos de luna y sol y persiste la preferencia en localStorage.
 */
document.getElementById("toggle_dark").addEventListener("click", function () {
	const esModoOscuro = document.documentElement.classList.toggle("dark");
	document.getElementById("icono-luna").classList.toggle("hidden");
	document.getElementById("icono-sol").classList.toggle("hidden");
	localStorage.setItem("modo-oscuro", esModoOscuro);
});
