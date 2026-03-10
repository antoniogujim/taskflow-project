const FORM_HABITO = document.getElementById("nuevo_habito");

const INPUT_BUSQUEDA = document.getElementById("busqueda");

const TEMPLATE_HABITO = document.getElementById("habito-template");

const HABITOS_EN_STORAGE = localStorage.getItem("Lista_de_habitos") != null;

let habitos = HABITOS_EN_STORAGE
	? JSON.parse(localStorage.getItem("Lista_de_habitos"))
	: [
			{ habito: "Habito", tiempo: "Temporalización", id: Date.now() },
			{ habito: "Leer", tiempo: "1 capítulo", id: Date.now() + 1 },
			{ habito: "Correr", tiempo: "30 minutos", id: Date.now() + 2 },
			{ habito: "Tomar vitaminas", tiempo: "Instantáneo", id: Date.now() + 3 },
		];

/**
 * Crea y añade un elemento de hábito al DOM usando el template definido en el HTML.
 * También registra el evento de eliminación en su botón correspondiente.
 * @param {{ habito: string, tiempo: string, id: number }} habito - Objeto con los datos del hábito.
 */
function crearHabito(habito) {
	const clon = TEMPLATE_HABITO.content.cloneNode(true);
	const li = clon.querySelector("li");
	li.dataset.id = habito.id;
	clon.querySelector(".nombre").textContent = habito.habito;
	clon.querySelector(".tiempo").textContent = habito.tiempo;
	clon.querySelector("button").addEventListener("click", function () {
		li.remove();
		habitos = habitos.filter(function (habitoGuardado) {
			return habitoGuardado.id !== habito.id;
		});
		localStorage.setItem("Lista_de_habitos", JSON.stringify(habitos));
	});
	document.querySelector("ul").appendChild(clon);
}

habitos.forEach(crearHabito);

/**
 * Maneja el envío del formulario para añadir un nuevo hábito.
 * Crea el objeto hábito, lo añade al array, lo renderiza y lo guarda en localStorage.
 * @param {SubmitEvent} evento - Evento de envío del formulario.
 */
FORM_HABITO.addEventListener("submit", function (evento) {
	evento.preventDefault();
	let nombre = document.getElementById("nombre_habito").value;
	let duracion = document.getElementById("duracion_habito").value;
	let id = Date.now();
	habitos.push({
		habito: nombre,
		tiempo: duracion,
		id: id,
	});
	crearHabito(habitos[habitos.length - 1]);
	localStorage.setItem("Lista_de_habitos", JSON.stringify(habitos));
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
		nombre.includes(textoBuscado) ? (habito.style.display = "") : (habito.style.display = "none");
	});
});

/**
 * Aplica el modo oscuro guardado en localStorage al cargar la página.
 */
if (localStorage.getItem("modo-oscuro") === "true") {
	document.documentElement.classList.add("dark");
	document.getElementById("icono-luna").classList.add("hidden");
	document.getElementById("icono-sol").classList.remove("hidden");
}

/**
 * Alterna el modo oscuro añadiendo o eliminando la clase "dark" en el elemento raíz del documento.
 * También intercambia los iconos de luna y sol según el modo activo, y persiste la preferencia.
 */
document.getElementById("toggle_dark").addEventListener("click", function () {
	const esModoOscuro = document.documentElement.classList.toggle("dark");
	document.getElementById("icono-luna").classList.toggle("hidden");
	document.getElementById("icono-sol").classList.toggle("hidden");
	localStorage.setItem("modo-oscuro", esModoOscuro);
});
