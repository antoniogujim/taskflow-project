const NUEVO_HABITO = document.getElementById("nuevo_habito");

const BUSCAR_HABITO = document.getElementById("busqueda");

const HAY_HABITOS = localStorage.getItem("Lista_de_habitos") != null;

let habitos = HAY_HABITOS
	? JSON.parse(localStorage.getItem("Lista_de_habitos"))
	: [
			{ habito: "Habito", tiempo: "Temporalización", id: Date.now() },
			{ habito: "Leer", tiempo: "1 capítulo", id: Date.now() + 1 },
			{ habito: "Correr", tiempo: "30 minutos", id: Date.now() + 2 },
			{ habito: "Tomar vitaminas", tiempo: "Instantáneo", id: Date.now() + 3 },
		];

function crearHabito(habito) {
	const NUEVO_LI = document.createElement("li");
	NUEVO_LI.dataset.id = habito.id;
	const NUEVO_DIV = document.createElement("div");
	NUEVO_DIV.className =
		"flex gap-6 justify-between items-center border border-black bg-base-claro p-4 shadow transition-all duration-300 hover:bg-base hover:shadow-md hover:scale-[1.02] dark:bg-gray-700 dark:border-gray-500";
	const NUEVO_H3 = document.createElement("h3");
	NUEVO_H3.textContent = habito.habito;
	const NUEVO_SPAN = document.createElement("span");
	NUEVO_SPAN.textContent = habito.tiempo;
	NUEVO_LI.appendChild(NUEVO_DIV);
	NUEVO_DIV.appendChild(NUEVO_H3);
	NUEVO_DIV.appendChild(NUEVO_SPAN);
	let selecionarUL = document.querySelector("ul");
	selecionarUL.appendChild(NUEVO_LI);
	const BUTTON = document.createElement("button");
	BUTTON.textContent = "Eliminar hábito";
	BUTTON.className =
		"border border-black px-2 py-1 cursor-pointer bg-base text-white hover:bg-base-oscuro transition-all duration-300 dark:bg-gray-700 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-base-oscuro";
	NUEVO_DIV.appendChild(BUTTON);
	BUTTON.addEventListener("click", function (evento) {
		NUEVO_LI.remove();
		habitos = habitos.filter(function (h) {
			return h.id != habito.id;
		});
		localStorage.setItem("Lista_de_habitos", JSON.stringify(habitos));
	});
}

habitos.forEach(crearHabito);

NUEVO_HABITO.addEventListener("submit", function (evento) {
	evento.preventDefault();
	let nombre = document.getElementById("nombre_habito").value;
	let duracion = document.getElementById("duracion_habito").value;
	let identificador = Date.now();
	habitos.push({
		habito: nombre,
		tiempo: duracion,
		id: identificador,
	});
	crearHabito(habitos[habitos.length - 1]);
	localStorage.setItem("Lista_de_habitos", JSON.stringify(habitos));
	document.getElementById("nombre_habito").value = "";
	document.getElementById("duracion_habito").value = "";
});

BUSCAR_HABITO.addEventListener("input", function (evento) {
	let textoBuscado = BUSCAR_HABITO.value.toLowerCase();
	const LISTA_HABITOS = document.querySelectorAll("ul li");
	LISTA_HABITOS.forEach(function (habito) {
		let nombre = habito.querySelector("h3").textContent.toLowerCase();
		nombre.includes(textoBuscado) ? (habito.style.display = "") : (habito.style.display = "none");
	});
});

document.getElementById("toggle_dark").addEventListener("click", function () {
	document.documentElement.classList.toggle("dark");
});
