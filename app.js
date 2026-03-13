// ─── Referencias al DOM ───────────────────────────────────────────────────────

// Formulario principal para añadir nuevos hábitos
const FORM_HABITO = document.getElementById("nuevo_habito");

// Campo de búsqueda para filtrar la lista en tiempo real
const INPUT_BUSQUEDA = document.getElementById("busqueda");

// Plantilla HTML clonada por crearHabito() para generar cada tarjeta de hábito
const TEMPLATE_HABITO = document.getElementById("habito-template");

// Lista <ul> donde se insertan las tarjetas de hábitos
const LISTA_HABITOS = document.getElementById("lista-habitos");

// Párrafo de estado vacío: visible cuando no hay hábitos o la búsqueda no da resultados
const LISTA_VACIA = document.getElementById("lista-vacia");

// Texto original del mensaje de lista vacía, usado para restaurarlo al limpiar la búsqueda
const MENSAJE_LISTA_VACIA_DEFAULT = LISTA_VACIA.textContent;

// Campos del formulario y sus párrafos de error asociados
const INPUT_NOMBRE = document.getElementById("nombre_habito");
const INPUT_DURACION = document.getElementById("duracion_habito");
const ERROR_NOMBRE = document.getElementById("error-nombre");
const ERROR_DURACION = document.getElementById("error-duracion");

// Claves de localStorage: definidas una sola vez para evitar errores de tipeo silenciosos
const STORAGE_KEY_HABITOS = "Lista_de_habitos";
const STORAGE_KEY_DARK = "modo-oscuro";

// Elementos del banner de avisos del sistema
const BANNER = document.getElementById("banner-aviso");
const BANNER_TEXTO = document.getElementById("banner-mensaje");
const BANNER_CERRAR = document.getElementById("banner-cerrar");

// ─── Banner de avisos ─────────────────────────────────────────────────────────

/*
 * Clases de estilo por tipo de aviso.
 * "aviso" (ámbar): situación recuperable, la app sigue funcionando con datos de ejemplo.
 * "error" (rojo):  problema persistente, los datos no se guardarán durante la sesión.
 */
const ESTILOS_BANNER = {
	aviso: {
		fondo: "bg-amber-50 dark:bg-amber-900/20",
		borde: "border-amber-400 dark:border-amber-600",
		texto: "text-amber-800 dark:text-amber-300",
		ring: "focus:ring-amber-500",
	},
	error: {
		fondo: "bg-red-50 dark:bg-red-900/20",
		borde: "border-red-400 dark:border-red-600",
		texto: "text-red-700 dark:text-red-400",
		ring: "focus:ring-red-500",
	},
};

// Referencia a los estilos del tipo activo, necesaria para limpiarlos al cerrar
let estilosActivosBanner = null;

/**
 * Muestra la barra de aviso debajo del header con el mensaje y el estilo
 * correspondiente al tipo de error producido.
 * La animación de despliegue se consigue transitando max-h-0 → max-h-32
 * y opacity-0 → opacity-100, evitando así el uso de display:none que bloquea CSS transitions.
 *
 * @param {string} mensaje        - Texto descriptivo del problema ocurrido.
 * @param {"aviso"|"error"} tipo  - "aviso" para problemas recuperables (ámbar),
 *                                  "error" para problemas persistentes (rojo).
 */
function mostrarBanner(mensaje, tipo) {
	// Si había un tipo anterior activo, limpia sus clases de color antes de aplicar las nuevas
	if (estilosActivosBanner) {
		BANNER.classList.remove(...estilosActivosBanner.fondo.split(" "), ...estilosActivosBanner.borde.split(" "));
	}

	estilosActivosBanner = ESTILOS_BANNER[tipo];

	/*
	 * classList.add/remove no acepta strings con espacios como un único token:
	 * lanzaría InvalidCharacterError. Se divide cada string en clases individuales
	 * con split(" ") y se pasan como argumentos separados con spread (...).
	 */
	BANNER.classList.add(...estilosActivosBanner.fondo.split(" "), ...estilosActivosBanner.borde.split(" "));
	BANNER.classList.remove("max-h-0", "opacity-0");
	BANNER.classList.add("max-h-32", "opacity-100");

	BANNER_TEXTO.className = "text-sm font-medium " + estilosActivosBanner.texto;
	BANNER_CERRAR.className = [
		"ml-4 shrink-0 font-bold text-base leading-none cursor-pointer focus:outline-none focus:ring-2 rounded-sm",
		estilosActivosBanner.texto,
		estilosActivosBanner.ring,
	].join(" ");

	BANNER_TEXTO.textContent = mensaje;
}

/*
 * Cierra el banner al pulsar el botón ✕:
 * Invierte la animación (max-h-32 → max-h-0, opacity-100 → opacity-0).
 * Una vez completada la transición (300 ms), limpia las clases de color
 * para dejar el elemento en su estado inicial limpio.
 */
BANNER_CERRAR.addEventListener("click", function () {
	BANNER.classList.remove("max-h-32", "opacity-100");
	BANNER.classList.add("max-h-0", "opacity-0");
	avisoPersistenciaVisible = false;

	// Espera a que la transición de cierre termine antes de limpiar los colores
	setTimeout(function () {
		if (estilosActivosBanner) {
			BANNER.classList.remove(...estilosActivosBanner.fondo.split(" "), ...estilosActivosBanner.borde.split(" "));
			estilosActivosBanner = null;
		}
		BANNER_TEXTO.textContent = "";
	}, 300);
});

// ─── Datos ────────────────────────────────────────────────────────────────────

/*
 * Hábitos de ejemplo usados en la primera visita o cuando los datos
 * guardados están corruptos y no se pueden recuperar.
 * Cada hábito recibe un UUID único generado con crypto.randomUUID() para
 * garantizar que no colisione con IDs de hábitos reales del usuario,
 * ya que todos los hábitos de la aplicación usan el mismo formato de ID.
 */
const HABITOS_EJEMPLO = [
	{
		habito: "Habito",
		tiempo: "Temporalización",
		completado: false,
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString(),
	},
	{
		habito: "Leer",
		tiempo: "1 capítulo",
		completado: false,
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString(),
	},
	{
		habito: "Correr",
		tiempo: "30 minutos",
		completado: false,
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString(),
	},
	{
		habito: "Tomar vitaminas",
		tiempo: "Instantáneo",
		completado: false,
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString(),
	},
];

/**
 * Comprueba que un elemento del array tenga los campos mínimos necesarios
 * para ser renderizado correctamente por crearHabito().
 * Los campos obligatorios son: habito (string no vacío), tiempo (string no vacío) e id.
 *
 * @param {*} h - Elemento a validar.
 * @returns {boolean} true si el elemento es un hábito válido.
 */
function esHabitoValido(h) {
	return (
		h !== null &&
		typeof h === "object" &&
		!Array.isArray(h) &&
		typeof h.habito === "string" &&
		h.habito.trim() !== "" &&
		typeof h.tiempo === "string" &&
		h.tiempo.trim() !== "" &&
		// Desde la migración a crypto.randomUUID(), los IDs son siempre strings.
		// Se rechaza cualquier valor que no sea un string no vacío (0, false, "", NaN, etc.)
		typeof h.id === "string" &&
		h.id.trim() !== ""
	);
}

/**
 * Carga los hábitos desde localStorage de forma segura.
 * Lee el valor una sola vez para evitar lecturas redundantes.
 *
 * - Si no hay datos guardados, devuelve null (primera visita → se usarán los hábitos de ejemplo).
 * - Si el array está vacío, lo devuelve tal cual (el usuario eliminó todos sus hábitos intencionalmente).
 * - Si el JSON es inválido o no es un array, muestra el banner de corrupción total y devuelve null.
 * - Si el array tiene elementos inválidos, los descarta y muestra un aviso con cuántos se perdieron.
 * - Si todos los elementos son inválidos, trata el caso como corrupción total y devuelve null.
 *
 * @returns {Array|null} Array de hábitos válidos, o null si no hay datos recuperables.
 */
function cargarHabitos() {
	const datos = localStorage.getItem(STORAGE_KEY_HABITOS);
	if (datos === null) return null;

	try {
		const parsed = JSON.parse(datos);
		// JSON válido pero no es un array: tratar igual que dato corrupto
		if (!Array.isArray(parsed)) {
			throw new TypeError("El dato guardado no es un array de hábitos.");
		}

		// Array vacío: el usuario eliminó todos sus hábitos intencionalmente
		if (parsed.length === 0) return [];

		const validos = parsed.filter(esHabitoValido);
		const perdidos = parsed.length - validos.length;

		// Ningún elemento es válido: corrupción total, cargar ejemplos
		if (validos.length === 0) {
			localStorage.removeItem(STORAGE_KEY_HABITOS);
			mostrarBanner(
				"Los datos guardados estaban corruptos y han sido eliminados. Se han cargado los hábitos de ejemplo.",
				"aviso",
			);
			return null;
		}

		// Algunos elementos son inválidos: conservar los válidos y avisar de los perdidos
		if (perdidos > 0) {
			mostrarBanner(
				perdidos +
					" hábito" +
					(perdidos > 1 ? "s no pudieron" : " no pudo") +
					" recuperarse por estar corrupto" +
					(perdidos > 1 ? "s" : "") +
					". El resto se ha cargado correctamente.",
				"aviso",
			);
		}

		return validos;
	} catch (e) {
		// JSON malformado o con formato inesperado: se elimina y se avisa al usuario
		localStorage.removeItem(STORAGE_KEY_HABITOS);
		mostrarBanner(
			"Los datos guardados estaban corruptos y han sido eliminados. Se han cargado los hábitos de ejemplo.",
			"aviso",
		);
		return null;
	}
}

/*
 * Fuente de datos principal de la aplicación.
 * Usa los datos de localStorage si son válidos; en caso contrario, los hábitos de ejemplo.
 * Al usar los de ejemplo tras un fallo, se sobreescribirá localStorage en el primer
 * guardado, eliminando definitivamente el dato corrupto.
 */
let habitos = cargarHabitos() ?? HABITOS_EJEMPLO;

/**
 * Persiste el array de hábitos en localStorage de forma segura.
 * Si el guardado falla (modo privado, almacenamiento lleno, etc.),
 * muestra un aviso rojo informando de que los cambios no se guardarán.
 * El aviso solo se muestra la primera vez que falla para no repetirse.
 */
let avisoPersistenciaVisible = false;

function guardarHabitos() {
	try {
		localStorage.setItem(STORAGE_KEY_HABITOS, JSON.stringify(habitos));
	} catch (e) {
		if (!avisoPersistenciaVisible) {
			mostrarBanner(
				"No es posible guardar los datos en este navegador. Los cambios se perderán al recargar la página.",
				"error",
			);
			avisoPersistenciaVisible = true;
		}
	}
}

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
	const nombre = INPUT_NOMBRE.value.trim();
	const duracion = INPUT_DURACION.value.trim();
	let esValido = true;

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
	const total = habitos.length;
	const completados = habitos.filter(function (h) {
		return h.completado;
	}).length;
	document.getElementById("resumen-total").textContent = total;
	document.getElementById("resumen-completados").textContent = completados;
	document.getElementById("resumen-pendientes").textContent = total - completados;
}

/**
 * Muestra u oculta el mensaje de estado vacío según haya hábitos en la lista.
 * También restaura el texto original del mensaje (puede haber sido cambiado
 * por el buscador cuando no hay resultados de búsqueda).
 * Se llama tras cualquier operación que modifique el número de hábitos.
 */
function actualizarEstadoVacio() {
	LISTA_VACIA.textContent = MENSAJE_LISTA_VACIA_DEFAULT;
	LISTA_VACIA.hidden = habitos.length > 0;
}

/**
 * Crea una tarjeta de hábito clonando el <template id="habito-template"> del HTML,
 * rellena sus campos con los datos del hábito recibido, registra los eventos
 * de completar y eliminar, y añade el elemento al <ul> de la página.
 *
 * El botón "Eliminar hábito" no borra directamente: primero entra en un modo
 * de confirmación que cambia el color de la tarjeta a amarillo y muestra dos
 * botones ("Confirmar" y "Cancelar"). Si el usuario no decide en 10 segundos,
 * la tarjeta vuelve a su estado normal automáticamente.
 *
 * @param {{ habito: string, tiempo: string, completado: boolean, id: string, createdAt: string }} habito
 *   Objeto con los datos del hábito a renderizar.
 */
function crearHabito(habito) {
	// Clona el template con todos sus nodos hijo (true = clonado profundo)
	const clon = TEMPLATE_HABITO.content.cloneNode(true);
	const li = clon.querySelector("li");
	const cardDiv = li.querySelector("div");
	const nombreEl = clon.querySelector(".nombre");
	const checkbox = clon.querySelector(".completado");

	// Referencias a los wrappers animados y a los tres botones de acción
	const wrapEliminar = clon.querySelector(".btn-eliminar-wrap");
	const wrapConfirmacion = clon.querySelector(".btn-confirmacion-wrap");
	const btnEliminar = clon.querySelector(".eliminar");
	const btnConfirmar = clon.querySelector(".btn-confirmar");
	const btnCancelar = clon.querySelector(".btn-cancelar");

	// Asigna los datos del hábito a los elementos del clon
	li.dataset.id = habito.id;
	nombreEl.textContent = habito.habito;
	clon.querySelector(".tiempo").textContent = habito.tiempo;

	// aria-label descriptivos para que los lectores de pantalla identifiquen el hábito afectado
	btnEliminar.setAttribute("aria-label", "Eliminar hábito: " + habito.habito);
	btnConfirmar.setAttribute("aria-label", "Confirmar eliminación de: " + habito.habito);
	btnCancelar.setAttribute("aria-label", "Cancelar eliminación de: " + habito.habito);

	// Restaura el estado visual del checkbox si el hábito ya estaba completado al cargar
	checkbox.checked = habito.completado || false;
	if (habito.completado) {
		nombreEl.classList.add("opacity-50");
	}

	// Timeout activo durante el modo de confirmación (se cancela al decidir o al expirar)
	let timeoutConfirmacion = null;

	/*
	 * Entra en modo de confirmación:
	 * - Cambia el fondo de la tarjeta a amarillo de alerta (con transición CSS).
	 * - Anima la salida del botón "Eliminar" y la entrada de "Confirmar" y "Cancelar".
	 * - Arranca un timeout de 10 segundos tras el que vuelve al estado normal.
	 *
	 * La animación usa inline styles sobre max-width y opacity porque los valores
	 * de animación (160px → 0, 0 → 200px) no son clases de Tailwind estándar
	 * y así evitamos depender de la recompilación del CSS.
	 */
	function entrarModoConfirmacion() {
		// Cambiar colores de la tarjeta
		cardDiv.classList.add("bg-yellow-100", "border-yellow-400", "dark:bg-yellow-900/20", "dark:border-yellow-600");
		cardDiv.classList.remove(
			"bg-base-claro",
			"border-black",
			"dark:bg-dark-tarjeta",
			"dark:border-gray-500",
			"hover:bg-base",
			"hover:-translate-y-0.5",
			"dark:hover:bg-base-oscuro",
		);

		// Animar salida del botón eliminar
		wrapEliminar.style.maxWidth = "0";
		wrapEliminar.style.opacity = "0";

		// Animar entrada de los botones de confirmación
		wrapConfirmacion.style.maxWidth = "200px";
		wrapConfirmacion.style.opacity = "1";

		// Vuelve solo al estado normal si el usuario no decide en 10 segundos
		timeoutConfirmacion = setTimeout(salirModoConfirmacion, 10000);
	}

	/*
	 * Sale del modo de confirmación sin eliminar:
	 * Revierte todos los cambios visuales y cancela el timeout pendiente.
	 * Se llama desde el botón "Cancelar" y también desde el propio timeout.
	 */
	function salirModoConfirmacion() {
		clearTimeout(timeoutConfirmacion);

		// Restaurar colores de la tarjeta
		cardDiv.classList.remove(
			"bg-yellow-100",
			"border-yellow-400",
			"dark:bg-yellow-900/20",
			"dark:border-yellow-600",
		);
		cardDiv.classList.add(
			"bg-base-claro",
			"border-black",
			"dark:bg-dark-tarjeta",
			"dark:border-gray-500",
			"hover:bg-base",
			"hover:-translate-y-0.5",
			"dark:hover:bg-base-oscuro",
		);

		// Animar vuelta al botón eliminar
		wrapConfirmacion.style.maxWidth = "0";
		wrapConfirmacion.style.opacity = "0";
		wrapEliminar.style.maxWidth = "160px";
		wrapEliminar.style.opacity = "1";
	}

	// El botón "Eliminar" activa el modo de confirmación, no borra directamente
	btnEliminar.addEventListener("click", entrarModoConfirmacion);

	// El botón "Cancelar" revierte al estado normal
	btnCancelar.addEventListener("click", salirModoConfirmacion);

	/*
	 * El botón "Confirmar" ejecuta el borrado definitivo:
	 * Cancela el timeout, elimina el <li> del DOM y filtra el hábito
	 * del array, luego persiste y recalcula el resumen.
	 */
	btnConfirmar.addEventListener("click", function () {
		clearTimeout(timeoutConfirmacion);
		li.remove();
		habitos = habitos.filter(function (h) {
			return h.id !== habito.id;
		});
		guardarHabitos();
		actualizarResumen();
		actualizarEstadoVacio();
	});

	/*
	 * Evento "change" del checkbox:
	 * Actualiza el estado "completado" en el array, aplica u elimina la opacidad
	 * sobre el nombre del hábito y persiste el cambio en localStorage.
	 */
	checkbox.addEventListener("change", function () {
		habito.completado = checkbox.checked;
		nombreEl.classList.toggle("opacity-50", checkbox.checked);
		guardarHabitos();
		actualizarResumen();
	});

	LISTA_HABITOS.appendChild(clon);
}

// ─── Inicialización ───────────────────────────────────────────────────────────

// Renderiza todos los hábitos cargados (de localStorage o de ejemplo) y actualiza el resumen
habitos.forEach(crearHabito);
actualizarResumen();
actualizarEstadoVacio();

// ─── Eventos ──────────────────────────────────────────────────────────────────

/**
 * Evento "submit" del formulario:
 * Valida los campos antes de proceder. Si alguno está vacío, muestra el error
 * correspondiente y cancela la operación.
 * Si la validación pasa, comprueba que no exista ya un hábito con el mismo nombre
 * (sin distinción de mayúsculas/minúsculas) antes de añadirlo.
 *
 * @param {SubmitEvent} evento - Evento de envío del formulario.
 */
FORM_HABITO.addEventListener("submit", function (evento) {
	evento.preventDefault();

	// Detiene la ejecución si algún campo no supera la validación
	if (!validarFormulario()) return;

	const nombre = INPUT_NOMBRE.value.trim();
	const duracion = INPUT_DURACION.value.trim();

	// Comprueba que no exista ya un hábito con el mismo nombre (case-insensitive).
	// Evita duplicados que confundirían al usuario y ensuciarían la lista.
	const yaExiste = habitos.some(function (h) {
		return h.habito.toLowerCase() === nombre.toLowerCase();
	});
	if (yaExiste) {
		mostrarError(INPUT_NOMBRE, ERROR_NOMBRE, "Ya existe un hábito con este nombre.");
		return;
	}

	const id = crypto.randomUUID(); // Identificador único e irrepetible

	habitos.push({
		habito: nombre,
		tiempo: duracion,
		completado: false,
		id: id,
		createdAt: new Date().toISOString(),
	});

	crearHabito(habitos[habitos.length - 1]);
	guardarHabitos();
	actualizarResumen();
	actualizarEstadoVacio();

	// Limpia todos los campos del formulario de una sola vez
	FORM_HABITO.reset();
	// Elimina los posibles estados de error visuales que pudieran quedar tras el reset
	limpiarError(INPUT_NOMBRE, ERROR_NOMBRE);
	limpiarError(INPUT_DURACION, ERROR_DURACION);

	// Devuelve el foco al primer campo para facilitar añadir varios hábitos seguidos
	INPUT_NOMBRE.focus();
});

/**
 * Evento "input" del buscador:
 * Recorre todos los <li> de la lista y oculta aquellos cuyo nombre
 * no contenga el texto introducido (búsqueda sin distinción de mayúsculas).
 *
 * Cuando la búsqueda no produce resultados pero sí hay hábitos en la lista,
 * muestra el mensaje de estado vacío con un texto específico de "sin resultados",
 * distinto del mensaje de lista completamente vacía.
 * Al limpiar la búsqueda, restaura el comportamiento normal del estado vacío.
 *
 * Usa debounce de 200ms: en lugar de filtrar en cada tecla, espera a que el
 * usuario pause antes de ejecutar la búsqueda, evitando consultas innecesarias al DOM.
 */
let timeoutBusqueda = null;

INPUT_BUSQUEDA.addEventListener("input", function () {
	clearTimeout(timeoutBusqueda);
	timeoutBusqueda = setTimeout(function () {
		const textoBuscado = INPUT_BUSQUEDA.value.toLowerCase();
		const items = LISTA_HABITOS.querySelectorAll("li");

		items.forEach(function (item) {
			const nombreItem = item.querySelector("h3").textContent.toLowerCase();
			// Usar `hidden` en lugar de style.display para excluir el elemento
			// del árbol de accesibilidad y evitar que lectores de pantalla lo lean
			item.hidden = !nombreItem.includes(textoBuscado);
		});

		if (textoBuscado === "") {
			// Sin búsqueda activa: restaura el mensaje original y el comportamiento normal
			actualizarEstadoVacio();
		} else {
			// Con búsqueda activa: muestra feedback si ningún hábito coincide
			const hayVisibles = Array.from(items).some(function (item) {
				return !item.hidden;
			});
			if (!hayVisibles && habitos.length > 0) {
				LISTA_VACIA.textContent = "No se encontraron hábitos que coincidan con la búsqueda.";
				LISTA_VACIA.hidden = false;
			} else {
				LISTA_VACIA.hidden = true;
			}
		}
	}, 200);
});

// ─── Modo oscuro ──────────────────────────────────────────────────────────────

/*
 * Nota: la inicialización del modo oscuro al cargar (aplicar la clase "dark" si
 * estaba activo) se realiza mediante un <script> inline en el <head> de index.html,
 * ANTES de que el CSS se aplique. Esto elimina el parpadeo (FOUC) que ocurría
 * cuando esta lógica estaba aquí, al final del body.
 *
 * Este listener solo gestiona el intercambio de iconos al cargar, ya que la
 * clase "dark" puede haber sido añadida por el script del <head>.
 */

// Sincroniza los iconos con el estado del modo oscuro ya aplicado por el <head>
if (document.documentElement.classList.contains("dark")) {
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
	localStorage.setItem(STORAGE_KEY_DARK, esModoOscuro);
});
