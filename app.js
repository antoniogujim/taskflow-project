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
const STORAGE_KEY_RESET = "ultimo-reset";

// Elementos del banner de avisos del sistema
const BANNER = document.getElementById("banner-aviso");
const BANNER_TEXTO = document.getElementById("banner-mensaje");
const BANNER_CERRAR = document.getElementById("banner-cerrar");

// Contadores del panel lateral de resumen
const RESUMEN_TOTAL = document.getElementById("resumen-total");
const RESUMEN_COMPLETADOS = document.getElementById("resumen-completados");
const RESUMEN_PENDIENTES = document.getElementById("resumen-pendientes");
const RESUMEN_BARRA = document.getElementById("resumen-barra");
const RESUMEN_PROGRESO_TEXTO = document.getElementById("resumen-progreso-texto");

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
		habito: "Meditar",
		tiempo: "10 minutos",
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
				`${perdidos} hábito${perdidos > 1 ? "s no pudieron" : " no pudo"} recuperarse por estar corrupto${perdidos > 1 ? "s" : ""}. El resto se ha cargado correctamente.`,
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

/*
 * Referencia a la función salirModo* de la tarjeta que está en un estado alterado
 * (edición o confirmación de borrado). Solo puede haber una activa en cada momento.
 * Al entrar en cualquier modo, se llama primero a esta función para cerrar
 * el estado anterior antes de abrir el nuevo.
 */
let cerrarEstadoActivo = null;

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

/**
 * Comprueba si el día actual (en hora local) es distinto al del último reset registrado.
 * Si lo es, pone todos los hábitos a completado: false, persiste el cambio y
 * actualiza la fecha del último reset.
 *
 * Usa toLocaleDateString('sv') para obtener la fecha en hora local del usuario
 * en formato YYYY-MM-DD. Esto evita el problema de toISOString(), que devuelve
 * la fecha en UTC y puede adelantar el día a partir de las 23:00 en España.
 */
function comprobarResetDiario() {
	const hoy = new Date().toLocaleDateString("sv");
	const ultimoReset = localStorage.getItem(STORAGE_KEY_RESET);

	if (ultimoReset === hoy) return;

	// Es un día nuevo: resetear todos los hábitos y guardar la fecha de hoy
	habitos.forEach(function (h) {
		h.completado = false;
	});

	guardarHabitos();
	localStorage.setItem(STORAGE_KEY_RESET, hoy);
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

// Límites de caracteres: deben coincidir con los atributos maxlength del HTML
const MAX_NOMBRE = 50;
const MAX_DURACION = 30;

/**
 * Valida todos los campos del formulario antes de añadir un hábito.
 * Comprueba que ningún campo esté vacío tras eliminar espacios en blanco,
 * y que no supere el límite de caracteres definido en las constantes MAX_*.
 * La validación de longitud máxima actúa como segunda barrera por si alguien
 * desactiva los atributos maxlength del HTML desde las herramientas del navegador.
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
	} else if (nombre.length > MAX_NOMBRE) {
		mostrarError(INPUT_NOMBRE, ERROR_NOMBRE, `El nombre no puede superar los ${MAX_NOMBRE} caracteres.`);
		esValido = false;
	}

	if (!duracion) {
		mostrarError(INPUT_DURACION, ERROR_DURACION, "La duración es obligatoria.");
		esValido = false;
	} else if (duracion.length > MAX_DURACION) {
		mostrarError(INPUT_DURACION, ERROR_DURACION, `La duración no puede superar los ${MAX_DURACION} caracteres.`);
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
	RESUMEN_TOTAL.textContent = total;
	RESUMEN_COMPLETADOS.textContent = completados;
	RESUMEN_PENDIENTES.textContent = total - completados;

	// Barra de progreso
	const porcentaje = total === 0 ? 0 : Math.round((completados / total) * 100);
	RESUMEN_BARRA.style.width = porcentaje + "%";
	RESUMEN_PROGRESO_TEXTO.textContent = completados + " / " + total;

	// Color progresivo: gris (sin hábitos) → rojo → amarillo → verde
	RESUMEN_BARRA.className = "h-3 rounded-full transition-all duration-300 " + (
		total === 0        ? "bg-gray-400" :
		porcentaje === 100 ? "bg-green-500" :
		porcentaje >= 50   ? "bg-yellow-400" :
		                     "bg-red-400"
	);
}

/**
 * Muestra u oculta el mensaje de estado vacío según el estado de la lista y la búsqueda activa.
 * Se llama tras cualquier operación que modifique el número de hábitos (añadir, eliminar).
 *
 * Tres casos posibles:
 * 1. Sin hábitos en absoluto → mensaje "Aún no tienes hábitos".
 * 2. Hay hábitos pero ninguno coincide con la búsqueda activa → mensaje "Sin resultados".
 * 3. Hay hábitos visibles o no hay búsqueda activa → ocultar el mensaje.
 *
 * Sin este chequeo, eliminar el último hábito visible con una búsqueda activa
 * dejaba la pantalla en blanco sin ningún mensaje explicativo.
 */
function actualizarEstadoVacio() {
	if (habitos.length === 0) {
		// Sin hábitos: mostrar mensaje por defecto independientemente de la búsqueda
		LISTA_VACIA.textContent = MENSAJE_LISTA_VACIA_DEFAULT;
		LISTA_VACIA.hidden = false;
		return;
	}

	const textoBuscado = INPUT_BUSQUEDA.value.toLowerCase();
	if (textoBuscado) {
		// Hay hábitos pero puede que ninguno coincida con la búsqueda activa
		const hayVisibles = Array.from(LISTA_HABITOS.querySelectorAll("li")).some(function (item) {
			return !item.hidden;
		});
		if (!hayVisibles) {
			LISTA_VACIA.textContent = "No se encontraron hábitos que coincidan con la búsqueda.";
			LISTA_VACIA.hidden = false;
		} else {
			LISTA_VACIA.hidden = true;
		}
	} else {
		// Sin búsqueda activa y con hábitos: ocultar el mensaje
		LISTA_VACIA.hidden = true;
	}
}

/**
 * Crea una tarjeta de hábito clonando el <template id="habito-template"> del HTML,
 * rellena sus campos con los datos del hábito recibido, registra los eventos
 * de completar, editar y eliminar, y añade el elemento al <ul> de la página.
 *
 * La tarjeta tiene tres estados excluyentes entre sí:
 *
 *   Normal       → fondo verde, botones Editar + Eliminar visibles.
 *   Edición      → fondo azul, inputs pre-rellenos, botones Guardar + Cancelar.
 *   Confirmación → fondo amarillo, botones Confirmar + Cancelar para borrado.
 *
 * Las transiciones entre estados se realizan animando opacity y pointer-events
 * sobre los wrappers de botones, que están superpuestos en posición absoluta
 * dentro de un contenedor de tamaño fijo. Esto evita cualquier desplazamiento
 * del layout al cambiar de estado.
 *
 * @param {{ habito: string, tiempo: string, completado: boolean, id: string, createdAt: string }} habito
 *   Objeto con los datos del hábito a renderizar.
 */
function crearHabito(habito) {
	// Clona el template con todos sus nodos hijo (true = clonado profundo)
	const clon = TEMPLATE_HABITO.content.cloneNode(true);
	const li = clon.querySelector("li");
	const cardDiv = li.querySelector("div");

	// ─ Elementos de estado normal ──────────────────────────────────────────────
	const nombreLabel = clon.querySelector(".nombre-label");
	const nombreEl = clon.querySelector(".nombre");
	const checkbox = clon.querySelector(".completado");
	const tiempoEl = clon.querySelector(".tiempo");
	const streakBadge = clon.querySelector(".streak-badge");

	// ─ Elementos de estado edición ─────────────────────────────────────────────
	const nombreEdicion = clon.querySelector(".nombre-edicion");
	const nombreInput = clon.querySelector(".nombre-input");
	const errorNombreEdicion = clon.querySelector(".error-nombre-edicion");
	const tiempoEdicion = clon.querySelector(".tiempo-edicion");
	const tiempoInput = clon.querySelector(".tiempo-input");
	const errorTiempoEdicion = clon.querySelector(".error-tiempo-edicion");

	// ─ Wrappers de botones ─────────────────────────────────────────────────────
	const wrapAcciones = clon.querySelector(".btn-acciones-wrap");
	const wrapEdicion = clon.querySelector(".btn-edicion-wrap");
	const wrapConfirmacion = clon.querySelector(".btn-confirmacion-wrap");

	// ─ Botones ─────────────────────────────────────────────────────────────────
	const btnEditar = clon.querySelector(".editar");
	const btnEliminar = clon.querySelector(".eliminar");
	const btnGuardar = clon.querySelector(".btn-guardar");
	const btnCancelarEdicion = clon.querySelector(".btn-cancelar-edicion");
	const btnConfirmar = clon.querySelector(".btn-confirmar");
	const btnCancelar = clon.querySelector(".btn-cancelar");

	// Asigna los datos del hábito a los elementos del clon
	li.dataset.id = habito.id;
	nombreEl.textContent = habito.habito;

	// Asigna el texto de duración y genera el aria-label con el valor real incluido,
	// para que los lectores de pantalla anuncien "Duración: 30 minutos" y no solo "Duración:".
	tiempoEl.textContent = habito.tiempo;
	tiempoEl.setAttribute("aria-label", "Duración: " + habito.tiempo);

	// aria-label descriptivos para que los lectores de pantalla identifiquen el hábito afectado
	btnEditar.setAttribute("aria-label", "Editar hábito: " + habito.habito);
	btnEliminar.setAttribute("aria-label", "Eliminar hábito: " + habito.habito);
	btnGuardar.setAttribute("aria-label", "Guardar cambios de: " + habito.habito);
	btnCancelarEdicion.setAttribute("aria-label", "Cancelar edición de: " + habito.habito);
	btnConfirmar.setAttribute("aria-label", "Confirmar eliminación de: " + habito.habito);
	btnCancelar.setAttribute("aria-label", "Cancelar eliminación de: " + habito.habito);

	// Restaura el estado visual del checkbox si el hábito ya estaba completado al cargar
	checkbox.checked = habito.completado || false;
	if (habito.completado) {
		nombreEl.classList.add("opacity-50", "line-through");
	}

	// Muestra el badge de racha si ya tiene una al cargar
	actualizarStreakBadge();

	// Timeout activo durante el modo de confirmación de borrado
	let timeoutConfirmacion = null;

	// Timeout de inactividad en modo edición: se reinicia con cada tecla en los inputs
	let timeoutEdicion = null;

	/*
	 * Actualiza el badge de racha: lo muestra con el texto correcto si streakActual > 0,
	 * o lo oculta si no hay racha activa.
	 */
	function actualizarStreakBadge() {
		if ((habito.streakActual || 0) > 0) {
			streakBadge.textContent = "Racha: " + habito.streakActual + (habito.streakActual === 1 ? " día" : " días");
			streakBadge.classList.remove("hidden");
		} else {
			streakBadge.classList.add("hidden");
		}
	}

	// ─── Modo edición ──────────────────────────────────────────────────────────

	/*
	 * Entra en modo edición:
	 * - Cambia el fondo de la tarjeta a azul.
	 * - Oculta el label con checkbox+nombre y el span de duración.
	 * - Muestra los inputs pre-rellenos con los valores actuales.
	 * - Anima la salida de los botones normales y la entrada de Guardar/Cancelar.
	 * - Pone el foco en el input del nombre.
	 *
	 * Los divs de edición usan "hidden" como clase inicial en el HTML.
	 * Al mostrarlos se añade "flex" explícitamente para que el layout
	 * en columna (flex-col) funcione correctamente sin conflicto con "hidden".
	 */
	function entrarModoEdicion() {
		if (cerrarEstadoActivo) cerrarEstadoActivo();

		cardDiv.classList.add("bg-blue-100", "border-blue-400", "dark:bg-blue-900/20", "dark:border-blue-600");
		cardDiv.classList.remove(
			"bg-base-claro",
			"border-black",
			"dark:bg-dark-tarjeta",
			"dark:border-gray-500",
			"hover:bg-base",
			"hover:-translate-y-0.5",
			"dark:hover:bg-base-oscuro",
		);

		// Ocultar elementos de texto, mostrar inputs
		nombreLabel.classList.add("hidden");
		streakBadge.classList.add("hidden");
		nombreEdicion.classList.remove("hidden");
		nombreEdicion.classList.add("flex");
		tiempoEl.classList.add("hidden");
		tiempoEdicion.classList.remove("hidden");
		tiempoEdicion.classList.add("flex");

		// Pre-rellenar inputs con los valores actuales del hábito
		nombreInput.value = habito.habito;
		tiempoInput.value = habito.tiempo;

		// Animar botones
		wrapAcciones.style.opacity = "0";
		wrapAcciones.style.pointerEvents = "none";
		wrapEdicion.style.opacity = "1";
		wrapEdicion.style.pointerEvents = "auto";

		nombreInput.focus();

		// Arranca el contador de inactividad: 30s sin interacción cancela la edición
		timeoutEdicion = setTimeout(salirModoEdicion, 30000);

		cerrarEstadoActivo = salirModoEdicion;
	}

	/*
	 * Sale del modo edición sin guardar cambios:
	 * Revierte todos los cambios visuales y limpia los posibles errores de validación.
	 * Se llama desde el botón "Cancelar" de edición.
	 */
	function salirModoEdicion() {
		clearTimeout(timeoutEdicion);
		cerrarEstadoActivo = null;

		cardDiv.classList.remove("bg-blue-100", "border-blue-400", "dark:bg-blue-900/20", "dark:border-blue-600");
		cardDiv.classList.add(
			"bg-base-claro",
			"border-black",
			"dark:bg-dark-tarjeta",
			"dark:border-gray-500",
			"hover:bg-base",
			"hover:-translate-y-0.5",
			"dark:hover:bg-base-oscuro",
		);

		// Restaurar elementos de texto, ocultar inputs
		nombreLabel.classList.remove("hidden");
		actualizarStreakBadge();
		nombreEdicion.classList.add("hidden");
		nombreEdicion.classList.remove("flex");
		tiempoEl.classList.remove("hidden");
		tiempoEdicion.classList.add("hidden");
		tiempoEdicion.classList.remove("flex");

		// Limpiar cualquier error de validación que haya quedado visible
		limpiarError(nombreInput, errorNombreEdicion);
		limpiarError(tiempoInput, errorTiempoEdicion);

		// Animar botones
		wrapEdicion.style.opacity = "0";
		wrapEdicion.style.pointerEvents = "none";
		wrapAcciones.style.opacity = "1";
		wrapAcciones.style.pointerEvents = "auto";
	}

	/*
	 * Valida los inputs de edición y, si son correctos, actualiza el objeto del hábito
	 * y los elementos del DOM sin tocar id, createdAt, completado ni ningún otro campo.
	 * El check de duplicados excluye el propio hábito (por id) para que guardar
	 * el mismo nombre no lance un falso error de "ya existe".
	 */
	function guardarEdicion() {
		const nuevoNombre = nombreInput.value.trim();
		const nuevaDuracion = tiempoInput.value.trim();
		let esValido = true;

		if (!nuevoNombre) {
			mostrarError(nombreInput, errorNombreEdicion, "El nombre del hábito es obligatorio.");
			esValido = false;
		} else if (nuevoNombre.length > MAX_NOMBRE) {
			mostrarError(nombreInput, errorNombreEdicion, `El nombre no puede superar los ${MAX_NOMBRE} caracteres.`);
			esValido = false;
		}

		if (!nuevaDuracion) {
			mostrarError(tiempoInput, errorTiempoEdicion, "La duración es obligatoria.");
			esValido = false;
		} else if (nuevaDuracion.length > MAX_DURACION) {
			mostrarError(tiempoInput, errorTiempoEdicion, `La duración no puede superar los ${MAX_DURACION} caracteres.`);
			esValido = false;
		}

		if (!esValido) return;

		// Excluye el propio hábito del check para que renombrar "Meditar" → "Meditar" no falle
		const yaExiste = habitos.some(function (h) {
			return h.id !== habito.id && h.habito.toLowerCase() === nuevoNombre.toLowerCase();
		});
		if (yaExiste) {
			mostrarError(nombreInput, errorNombreEdicion, "Ya existe un hábito con este nombre.");
			return;
		}

		// Actualiza solo nombre y duración; el resto del objeto permanece intacto
		habito.habito = nuevoNombre;
		habito.tiempo = nuevaDuracion;

		// Refleja los nuevos valores en el DOM
		nombreEl.textContent = nuevoNombre;
		tiempoEl.textContent = nuevaDuracion;
		tiempoEl.setAttribute("aria-label", "Duración: " + nuevaDuracion);

		// Actualiza los aria-label de los botones que incluyen el nombre del hábito
		btnEditar.setAttribute("aria-label", "Editar hábito: " + nuevoNombre);
		btnEliminar.setAttribute("aria-label", "Eliminar hábito: " + nuevoNombre);
		btnGuardar.setAttribute("aria-label", "Guardar cambios de: " + nuevoNombre);
		btnCancelarEdicion.setAttribute("aria-label", "Cancelar edición de: " + nuevoNombre);
		btnConfirmar.setAttribute("aria-label", "Confirmar eliminación de: " + nuevoNombre);
		btnCancelar.setAttribute("aria-label", "Cancelar eliminación de: " + nuevoNombre);

		guardarHabitos();

		// Si hay una búsqueda activa, se limpia para que el hábito renombrado
		// siempre sea visible tras guardar, igual que al añadir un hábito nuevo.
		if (INPUT_BUSQUEDA.value) {
			INPUT_BUSQUEDA.value = "";
			LISTA_HABITOS.querySelectorAll("li").forEach(function (item) {
				item.hidden = false;
			});
		}

		salirModoEdicion();
	}

	// ─── Modo confirmación de borrado ──────────────────────────────────────────

	/*
	 * Entra en modo de confirmación de borrado:
	 * - Cambia el fondo de la tarjeta a amarillo de alerta.
	 * - Anima la salida de los botones normales y la entrada de Confirmar/Cancelar.
	 * - Arranca un timeout de 10 segundos tras el que vuelve al estado normal.
	 */
	function entrarModoConfirmacion() {
		if (cerrarEstadoActivo) cerrarEstadoActivo();

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

		checkbox.classList.add("invisible");
		nombreLabel.classList.add("pointer-events-none");

		// Animar botones
		wrapAcciones.style.opacity = "0";
		wrapAcciones.style.pointerEvents = "none";
		wrapConfirmacion.style.opacity = "1";
		wrapConfirmacion.style.pointerEvents = "auto";

		timeoutConfirmacion = setTimeout(salirModoConfirmacion, 10000);

		cerrarEstadoActivo = salirModoConfirmacion;
	}

	/*
	 * Sale del modo de confirmación sin eliminar:
	 * Revierte todos los cambios visuales y cancela el timeout pendiente.
	 * Se llama desde el botón "Cancelar" y también desde el propio timeout.
	 */
	function salirModoConfirmacion() {
		clearTimeout(timeoutConfirmacion);
		cerrarEstadoActivo = null;

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

		checkbox.classList.remove("invisible");
		nombreLabel.classList.remove("pointer-events-none");

		// Animar botones
		wrapConfirmacion.style.opacity = "0";
		wrapConfirmacion.style.pointerEvents = "none";
		wrapAcciones.style.opacity = "1";
		wrapAcciones.style.pointerEvents = "auto";
	}

	// ─── Eventos de la tarjeta ─────────────────────────────────────────────────

	btnEditar.addEventListener("click", entrarModoEdicion);
	btnCancelarEdicion.addEventListener("click", salirModoEdicion);
	btnGuardar.addEventListener("click", guardarEdicion);

	// Enter guarda, Escape cancela desde cualquier input de edición
	nombreInput.addEventListener("keydown", function (e) {
		if (e.key === "Enter") { e.preventDefault(); guardarEdicion(); }
		if (e.key === "Escape") salirModoEdicion();
	});
	tiempoInput.addEventListener("keydown", function (e) {
		if (e.key === "Enter") { e.preventDefault(); guardarEdicion(); }
		if (e.key === "Escape") salirModoEdicion();
	});

	// Limpia el error del campo en cuanto el usuario empieza a corregirlo
	nombreInput.addEventListener("input", function () {
		if (nombreInput.value.trim()) limpiarError(nombreInput, errorNombreEdicion);
		clearTimeout(timeoutEdicion);
		timeoutEdicion = setTimeout(salirModoEdicion, 30000);
	});
	tiempoInput.addEventListener("input", function () {
		if (tiempoInput.value.trim()) limpiarError(tiempoInput, errorTiempoEdicion);
		clearTimeout(timeoutEdicion);
		timeoutEdicion = setTimeout(salirModoEdicion, 30000);
	});

	btnEliminar.addEventListener("click", entrarModoConfirmacion);
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
	 * sobre el nombre del hábito, actualiza la racha y persiste el cambio.
	 *
	 * Al marcar:
	 *   - Si fechaUltimaCompletacion es ayer → incrementa la racha.
	 *   - Si es hoy → ya contó, no cambia nada (doble click accidental).
	 *   - Si es más antigua o null → reinicia la racha a 1.
	 *
	 * Al desmarcar:
	 *   - Decrementa la racha en 1 (mínimo 0).
	 *   - Deja fechaUltimaCompletacion en ayer para que, si se vuelve a marcar
	 *     hoy, la racha se recupere correctamente. Si no se vuelve a marcar,
	 *     el día siguiente la racha se romperá al verificar la fecha.
	 */
	checkbox.addEventListener("change", function () {
		const hoy = new Date().toLocaleDateString("sv");
		const ayer = new Date();
		ayer.setDate(ayer.getDate() - 1);
		const fechaAyer = ayer.toLocaleDateString("sv");

		if (checkbox.checked) {
			if (habito.fechaUltimaCompletacion !== hoy) {
				if (habito.fechaUltimaCompletacion === fechaAyer) {
					habito.streakActual = (habito.streakActual || 0) + 1;
				} else {
					habito.streakActual = 1;
				}
				habito.fechaUltimaCompletacion = hoy;
			}
		} else {
			if (habito.fechaUltimaCompletacion === hoy) {
				habito.streakActual = Math.max(0, (habito.streakActual || 0) - 1);
				habito.fechaUltimaCompletacion = habito.streakActual === 0 ? null : fechaAyer;
			}
		}

		habito.completado = checkbox.checked;
		nombreEl.classList.toggle("opacity-50", checkbox.checked);
		nombreEl.classList.toggle("line-through", checkbox.checked);
		actualizarStreakBadge();
		guardarHabitos();
		actualizarResumen();
	});

	LISTA_HABITOS.appendChild(clon);
}

// ─── Inicialización ───────────────────────────────────────────────────────────

// Resetea los hábitos si es un día nuevo (hora local) antes de renderizar
comprobarResetDiario();

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

	// Si hay una búsqueda activa, se limpia para que el nuevo hábito sea visible.
	// Ocultar el hábito recién añadido sería confuso: el usuario pulsa "Añadir" y no ve nada.
	if (INPUT_BUSQUEDA.value) {
		INPUT_BUSQUEDA.value = "";
		LISTA_HABITOS.querySelectorAll("li").forEach(function (item) {
			item.hidden = false;
		});
	}

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
			const nombreItem = item.querySelector(".nombre").textContent.toLowerCase();
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

// Sincroniza aria-pressed y aria-label con el estado del modo oscuro ya aplicado por el <head>
// Los iconos luna/sol se gestionan con clases de Tailwind (dark:hidden / hidden dark:block)
// directamente en el HTML, sin necesidad de manipulación desde JS.
const BTN_DARK = document.getElementById("toggle_dark");

if (document.documentElement.classList.contains("dark")) {
	BTN_DARK.setAttribute("aria-pressed", "true");
	BTN_DARK.setAttribute("aria-label", "Activar modo claro");
}

/**
 * Evento "click" del botón de modo oscuro:
 * Alterna la clase "dark" en <html>, actualiza aria-pressed y aria-label
 * para reflejar la acción disponible, y persiste la preferencia en localStorage.
 */
BTN_DARK.addEventListener("click", function () {
	const esModoOscuro = document.documentElement.classList.toggle("dark");
	this.setAttribute("aria-pressed", esModoOscuro);
	this.setAttribute("aria-label", esModoOscuro ? "Activar modo claro" : "Activar modo oscuro");
	localStorage.setItem(STORAGE_KEY_DARK, esModoOscuro);
});

// ─── Footer ───────────────────────────────────────────────────────────────────

// Actualiza el año del copyright automáticamente para que nunca quede desactualizado
document.getElementById("año-actual").textContent = new Date().getFullYear();
