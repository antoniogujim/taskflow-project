// ─── Limpieza de datos obsoletos ──────────────────────────────────────────────

// Elimina la clave "Lista_de_habitos" que se usaba para persistir los hábitos
// en localStorage antes de migrar al backend. Si el navegador la tiene como
// basura de versiones anteriores, la borramos para no dejar datos huérfanos.
// Es una IIFE (función que se ejecuta inmediatamente): los paréntesis exteriores
// la convierten en expresión y los () del final la invocan al momento, sin necesidad
// de llamarla explícitamente desde ningún otro sitio.
(function limpiarDatosObsoletos() {
	const CLAVES_OBSOLETAS = ["Lista_de_habitos"];
	CLAVES_OBSOLETAS.forEach(function (clave) {
		if (localStorage.getItem(clave) !== null) {
			localStorage.removeItem(clave);
		}
	});
})();

// ─── Referencias al DOM ───────────────────────────────────────────────────────

// Formulario principal para añadir nuevos hábitos
const FORM_HABITO = document.getElementById("nuevo_habito");

// Campo de búsqueda para filtrar la lista en tiempo real
const INPUT_BUSQUEDA = document.getElementById("busqueda");

// Botón para completar todos los hábitos visibles
const BTN_COMPLETAR_TODOS = document.getElementById("completar-todos");

// Select para ordenar la lista de hábitos
const SELECT_ORDENAR = document.getElementById("ordenar-habitos");

// Plantilla HTML clonada por crearTarjeta() para generar cada tarjeta de hábito
const TEMPLATE_HABITO = document.getElementById("habito-template");

// Lista <ul> donde se insertan las tarjetas de hábitos
const LISTA_HABITOS = document.getElementById("lista-habitos");

// Región de anuncios para lectores de pantalla
const ANUNCIO_ARIA = document.getElementById("anuncio-aria");

// Párrafo de estado vacío: visible cuando no hay hábitos o la búsqueda no da resultados
const LISTA_VACIA = document.getElementById("lista-vacia");

// Texto original del mensaje de lista vacía, usado para restaurarlo al limpiar la búsqueda
const MENSAJE_LISTA_VACIA_DEFAULT = LISTA_VACIA.textContent;

// Campos del formulario y sus párrafos de error asociados
const INPUT_NOMBRE = document.getElementById("nombre_habito");
const INPUT_DURACION = document.getElementById("duracion_habito");
const ERROR_NOMBRE = document.getElementById("error-nombre");
const ERROR_DURACION = document.getElementById("error-duracion");

// Botón de envío del formulario: se deshabilita durante la petición al servidor
// para evitar envíos duplicados si el usuario pulsa varias veces mientras espera.
const BTN_ANADIR = FORM_HABITO.querySelector('[type="submit"]');

// Claves de localStorage: definidas una sola vez para evitar errores de tipeo silenciosos
const STORAGE_KEY_DARK = "modo-oscuro";
const STORAGE_KEY_RESET = "ultimo-reset";

// Elementos del banner de avisos del sistema
const BANNER = document.getElementById("banner-aviso");
const BANNER_TEXTO = document.getElementById("banner-mensaje");
const BANNER_CERRAR = document.getElementById("banner-cerrar");

// Botón del aside que abre el modal de confirmación para vaciar la lista
const BTN_VACIAR = document.getElementById("vaciar-habitos");

// Elementos del modal de confirmación de vaciado
const MODAL_VACIAR = document.getElementById("modal-vaciar");
const MODAL_VACIAR_BACKDROP = document.getElementById("modal-vaciar-backdrop");
const MODAL_VACIAR_CANCELAR = document.getElementById("modal-vaciar-cancelar");
const MODAL_VACIAR_CONFIRMAR = document.getElementById("modal-vaciar-confirmar");

// Contadores del panel lateral de resumen
const RESUMEN_TOTAL = document.getElementById("resumen-total");
const RESUMEN_COMPLETADOS = document.getElementById("resumen-completados");
const RESUMEN_PENDIENTES = document.getElementById("resumen-pendientes");
const RESUMEN_BARRA = document.getElementById("resumen-barra");
const RESUMEN_PROGRESO_TEXTO = document.getElementById("resumen-progreso-texto");

// ─── Banner de avisos ─────────────────────────────────────────────────────────

// El tipo "aviso" (ámbar) se usaba para errores recuperables de localStorage
// (datos corruptos, elementos inválidos, fallo al guardar).
// Tras migrar al servidor, todos los errores visibles al usuario son de red y son críticos,
// por lo que solo se usa el tipo "error" (rojo). El bloque "aviso" se comenta
// en lugar de eliminar por si en el futuro aparecen casos no críticos
// (avisos informativos, conexión lenta, etc.).
const ESTILOS_BANNER = {
	/*
	aviso: {
		fondo: "bg-amber-50 dark:bg-amber-900/20",
		borde: "border-amber-400 dark:border-amber-600",
		texto: "text-amber-800 dark:text-amber-300",
		ring: "focus:ring-amber-500",
	},
	*/
	error: {
		fondo: "bg-red-50 dark:bg-red-900/20",
		borde: "border-red-400 dark:border-red-600",
		texto: "text-red-700 dark:text-red-400",
		ring: "focus:ring-red-500",
	},
	// Usado para avisos informativos que no requieren acción del usuario,
	// como el reset diario automático. Se cierra solo tras 6 segundos.
	exito: {
		fondo: "bg-green-50 dark:bg-green-900/20",
		borde: "border-green-400 dark:border-green-600",
		texto: "text-green-700 dark:text-green-400",
		ring: "focus:ring-green-500",
	},
};

// Referencia a los estilos del tipo activo, necesaria para limpiarlos al cerrar
let estilosActivosBanner = null;

// Referencia al timeout de auto-cierre del banner: se guarda para poder
// cancelarlo si el usuario cierra el banner manualmente antes de que expire.
let timeoutAutoCierreBanner = null;

/**
 * Muestra la barra de aviso debajo del header con el mensaje y el estilo
 * correspondiente al tipo producido.
 * La animación de despliegue se consigue transitando max-h-0 → max-h-32
 * y opacity-0 → opacity-100, evitando así el uso de display:none que bloquea CSS transitions.
 *
 * @param {string} mensaje          - Texto descriptivo del problema ocurrido.
 * @param {"error"|"exito"} tipo    - "error" para problemas (rojo), "exito" para avisos informativos (verde).
 * @param {boolean} [autoCerrar]    - Si es true, el banner se cierra automáticamente tras 6 segundos.
 */
function mostrarBanner(mensaje, tipo, autoCerrar = false) {
	// Cancela cualquier auto-cierre pendiente de un banner anterior
	clearTimeout(timeoutAutoCierreBanner);

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

	// Si se pide auto-cierre, lanza un timeout de 6 segundos.
	// La referencia se guarda para cancelarlo si el usuario cierra el banner antes.
	if (autoCerrar) {
		timeoutAutoCierreBanner = setTimeout(function () {
			BANNER_CERRAR.click();
		}, 6000);
	}
}

/*
 * Cierra el banner al pulsar el botón ✕:
 * Invierte la animación (max-h-32 → max-h-0, opacity-100 → opacity-0).
 * Una vez completada la transición (300 ms), limpia las clases de color
 * para dejar el elemento en su estado inicial limpio.
 */
BANNER_CERRAR.addEventListener("click", function () {
	// Cancela el auto-cierre si el usuario pulsa la ✕ antes de que expire
	clearTimeout(timeoutAutoCierreBanner);

	BANNER.classList.remove("max-h-32", "opacity-100");
	BANNER.classList.add("max-h-0", "opacity-0");
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

// Array local que refleja el estado del servidor.
// Se rellena al arrancar con la respuesta de obtenerHabitos().
let habitos = [];

/*
 * Referencia a la función salirModo* de la tarjeta que está en un estado alterado
 * (edición o confirmación de borrado). Solo puede haber una activa en cada momento.
 * Al entrar en cualquier modo, se llama primero a esta función para cerrar
 * el estado anterior antes de abrir el nuevo.
 */
let cerrarEstadoActivo = null;

/**
 * Comprueba si el día actual (en hora local) es distinto al del último reset registrado.
 * Si lo es, pone todos los hábitos a completado: false, persiste el cambio y
 * actualiza la fecha del último reset.
 *
 * Usa toLocaleDateString('sv') para obtener la fecha en hora local del usuario
 * en formato YYYY-MM-DD. Esto evita el problema de toISOString(), que devuelve
 * la fecha en UTC y puede adelantar el día a partir de las 23:00 en España.
 */
async function comprobarResetDiario() {
	const hoy = new Date().toLocaleDateString("sv");

	// Guardamos la fecha del último reset en localStorage — no los hábitos.
	// Es el único dato que el frontend necesita recordar entre sesiones para saber
	// si es un día nuevo sin tener que preguntarle al servidor cada vez que se abre la app.
	// Sin esto, resetearHabitos() se llamaría en cada visita, borrando completados
	// y rachas que el usuario ya marcó ese mismo día.
	const ultimoReset = localStorage.getItem(STORAGE_KEY_RESET);

	if (ultimoReset === hoy) return;

	// Es un día nuevo: el servidor resetea completado a false y rompe rachas antiguas
	await resetearHabitos();

	// Re-sincronizamos el array local con el servidor tras el reset.
	// Sin esto, renderizarHabitos() mostraría los datos de ayer porque el array
	// local se cargó antes del reset y no refleja los cambios del servidor.
	habitos = await obtenerHabitos();

	localStorage.setItem(STORAGE_KEY_RESET, hoy);

	// Solo muestra el banner si el usuario ya había entrado antes (ultimoReset !== null).
	// En la primera visita no hay nada que haya sido reseteado, así que el aviso
	// sería incorrecto y confuso.
	if (ultimoReset !== null) {
		mostrarBanner("Nuevo día, hábitos reseteados. ¡A por ello!", "exito", true);
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
	// Usamos invisible en lugar de hidden para que el <p> siempre ocupe su espacio
	// en el layout. Con hidden (display:none) el elemento desaparece y al aparecer
	// empuja todo el contenido hacia abajo causando un salto visual.
	errorEl.classList.remove("invisible");
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
	errorEl.classList.add("invisible");
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
	RESUMEN_BARRA.setAttribute("aria-valuenow", porcentaje);
	RESUMEN_PROGRESO_TEXTO.textContent = completados + " / " + total;

	// Color progresivo: gris (sin hábitos) → rojo → amarillo → verde
	RESUMEN_BARRA.className =
		"h-3 rounded-full transition-all duration-300 " +
		(total === 0
			? "bg-gray-400"
			: porcentaje === 100
				? "bg-green-500"
				: porcentaje >= 50
					? "bg-yellow-400"
					: "bg-red-400");

	// Deshabilita "Vaciar lista" cuando no hay hábitos: la acción no tiene sentido
	// si la lista ya está vacía, igual que "Completar todos" se deshabilita en ese caso.
	BTN_VACIAR.disabled = total === 0;

	actualizarBotonCompletarTodos();
}

/**
 * Actualiza el botón "Completar todos" / "Desmarcar todos" según el estado actual.
 * - Sin visibles → deshabilitado.
 * - Todos completados → "Desmarcar todos/buscados" habilitado.
 * - Hay pendientes → "Completar todos/buscados" habilitado.
 * Si hay una búsqueda activa, el texto refleja que la acción afecta solo
 * a los hábitos filtrados, no a la lista entera.
 */
function actualizarBotonCompletarTodos() {
	const visibles = Array.from(LISTA_HABITOS.querySelectorAll("li")).filter(function (item) {
		return !item.hidden;
	});
	if (visibles.length === 0) {
		BTN_COMPLETAR_TODOS.disabled = true;
		BTN_COMPLETAR_TODOS.textContent = "Completar todos";
		SELECT_ORDENAR.disabled = true;
		return;
	}
	SELECT_ORDENAR.disabled = false;
	const hayPendientes = visibles.some(function (item) {
		return !item.querySelector(".completado").checked;
	});

	// Si el campo de búsqueda tiene texto, la acción solo afecta a los resultados visibles.
	// El sufijo "buscados" avisa al usuario de que no está actuando sobre la lista entera.
	const sufijo = INPUT_BUSQUEDA.value.trim() ? "buscados" : "todos";
	BTN_COMPLETAR_TODOS.disabled = false;
	BTN_COMPLETAR_TODOS.textContent = hayPendientes ? "Completar " + sufijo : "Desmarcar " + sufijo;
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
function crearTarjeta(habito) {
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

	// IDs únicos para los párrafos de error de edición, necesarios para aria-describedby
	errorNombreEdicion.id = "error-nombre-edicion-" + habito.id;
	errorTiempoEdicion.id = "error-tiempo-edicion-" + habito.id;
	nombreInput.setAttribute("aria-describedby", errorNombreEdicion.id);
	tiempoInput.setAttribute("aria-describedby", errorTiempoEdicion.id);

	// aria-label descriptivos para que los lectores de pantalla identifiquen el hábito afectado
	btnEditar.setAttribute("aria-label", "Editar hábito: " + habito.habito);
	btnEliminar.setAttribute("aria-label", "Eliminar hábito: " + habito.habito);
	btnGuardar.setAttribute("aria-label", "Guardar cambios de: " + habito.habito);
	btnCancelarEdicion.setAttribute("aria-label", "Cancelar edición de: " + habito.habito);
	btnConfirmar.setAttribute("aria-label", "Confirmar eliminación de: " + habito.habito);
	btnCancelar.setAttribute("aria-label", "Cancelar eliminación de: " + habito.habito);

	// Los grupos de edición y confirmación empiezan ocultos: bloquear su foco por teclado
	btnGuardar.tabIndex = -1;
	btnCancelarEdicion.tabIndex = -1;
	btnConfirmar.tabIndex = -1;
	btnCancelar.tabIndex = -1;

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
		btnEditar.tabIndex = -1;
		btnEliminar.tabIndex = -1;
		wrapEdicion.style.opacity = "1";
		wrapEdicion.style.pointerEvents = "auto";
		btnGuardar.tabIndex = 0;
		btnCancelarEdicion.tabIndex = 0;

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
		btnGuardar.tabIndex = -1;
		btnCancelarEdicion.tabIndex = -1;
		wrapAcciones.style.opacity = "1";
		wrapAcciones.style.pointerEvents = "auto";
		btnEditar.tabIndex = 0;
		btnEliminar.tabIndex = 0;

		// Si hay búsqueda activa, re-aplicar el filtro para que refleje el estado real
		if (INPUT_BUSQUEDA.value) aplicarFiltro();
	}

	/*
	 * Valida los inputs de edición y, si son correctos, actualiza el objeto del hábito
	 * y los elementos del DOM sin tocar id, createdAt, completado ni ningún otro campo.
	 * El check de duplicados excluye el propio hábito (por id) para que guardar
	 * el mismo nombre no lance un falso error de "ya existe".
	 */
	async function guardarEdicion() {
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
			mostrarError(
				tiempoInput,
				errorTiempoEdicion,
				`La duración no puede superar los ${MAX_DURACION} caracteres.`,
			);
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

		// Informa al usuario de que la petición está en curso.
		btnGuardar.textContent = "Guardando...";

		try {
			// El servidor actualiza el hábito y devuelve el objeto completo ya modificado.
			// Usamos los datos devueltos para actualizar el objeto local — así el frontend
			// siempre refleja exactamente lo que tiene el servidor.
			const habitoActualizado = await editarHabito(habito.id, nuevoNombre, nuevaDuracion);
			habito.habito = habitoActualizado.habito;
			habito.tiempo = habitoActualizado.tiempo;

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

			renderizarHabitos();

			// Si hay una búsqueda activa, se limpia para que el hábito renombrado
			// siempre sea visible tras guardar, igual que al añadir un hábito nuevo.
			if (INPUT_BUSQUEDA.value) {
				INPUT_BUSQUEDA.value = "";
				LISTA_HABITOS.querySelectorAll("li").forEach(function (item) {
					item.hidden = false;
				});
			}

			ANUNCIO_ARIA.textContent = "Hábito actualizado: " + nuevoNombre + ".";
			salirModoEdicion();
		} catch (e) {
			// Si el servidor falla, la tarjeta se queda en modo edición para que
			// el usuario pueda reintentar sin perder los cambios que escribió.
			mostrarBanner("No se pudo guardar el hábito. Inténtalo de nuevo.", "error");
		} finally {
			// Se ejecuta siempre: en éxito el botón vuelve a quedar oculto tras salirModoEdicion(),
			// en error se queda visible para que el usuario pueda reintentar. En ambos casos
			// el texto debe estar restaurado para la próxima vez que entre en modo edición.
			btnGuardar.textContent = "Guardar";
		}
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
		btnEditar.tabIndex = -1;
		btnEliminar.tabIndex = -1;
		wrapConfirmacion.style.opacity = "1";
		wrapConfirmacion.style.pointerEvents = "auto";
		btnConfirmar.tabIndex = 0;
		btnCancelar.tabIndex = 0;

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
		btnConfirmar.tabIndex = -1;
		btnCancelar.tabIndex = -1;
		wrapAcciones.style.opacity = "1";
		wrapAcciones.style.pointerEvents = "auto";
		btnEditar.tabIndex = 0;
		btnEliminar.tabIndex = 0;
	}

	// ─── Eventos de la tarjeta ─────────────────────────────────────────────────

	btnEditar.addEventListener("click", entrarModoEdicion);
	btnCancelarEdicion.addEventListener("click", salirModoEdicion);
	btnGuardar.addEventListener("click", guardarEdicion);

	// Enter guarda, Escape cancela desde cualquier input de edición
	nombreInput.addEventListener("keydown", function (e) {
		if (e.key === "Enter") {
			e.preventDefault();
			guardarEdicion();
		}
		if (e.key === "Escape") salirModoEdicion();
	});
	tiempoInput.addEventListener("keydown", function (e) {
		if (e.key === "Enter") {
			e.preventDefault();
			guardarEdicion();
		}
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
	btnConfirmar.addEventListener("click", async function () {
		clearTimeout(timeoutConfirmacion);

		// Informa al usuario de que la petición está en curso.
		btnConfirmar.textContent = "Eliminando...";

		try {
			// Primero le decimos al servidor que elimine el hábito.
			// Solo si responde con éxito actualizamos el DOM y el array local.
			// Así evitamos que la tarjeta desaparezca visualmente si el servidor falla.
			await eliminarHabito(habito.id);

			// Mover foco al siguiente hábito, al anterior, o al buscador si no queda ninguno
			const siguienteLi = li.nextElementSibling || li.previousElementSibling;
			li.remove();
			habitos = habitos.filter(function (h) {
				return h.id !== habito.id;
			});
			actualizarResumen();
			actualizarEstadoVacio();

			// Anunciar la eliminación y mover el foco
			ANUNCIO_ARIA.textContent = "Hábito \"" + habito.habito + "\" eliminado.";
			if (siguienteLi) {
				const btnSiguiente = siguienteLi.querySelector(".eliminar");
				if (btnSiguiente) btnSiguiente.focus();
			} else {
				INPUT_BUSQUEDA.focus();
			}
		} catch (e) {
			// Si el servidor falla, restauramos el texto del botón y devolvemos
			// la tarjeta a su estado normal para que el usuario pueda reintentar.
			btnConfirmar.textContent = "Confirmar";
			salirModoConfirmacion();
			mostrarBanner("No se pudo eliminar el hábito. Inténtalo de nuevo.", "error");
		}
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
	checkbox.addEventListener("change", async function () {
		// Guardamos el estado anterior por si el servidor falla y hay que revertir.
		// En ese momento checkbox.checked ya tiene el nuevo valor (el navegador lo cambió),
		// así que el estado previo es el contrario.
		const estadoPrevio = !checkbox.checked;

		// Bloquea el checkbox mientras dura la petición para evitar clicks simultáneos
		// que enviarían peticiones contradictorias al servidor antes de recibir respuesta.
		checkbox.disabled = true;
		checkbox.setAttribute("aria-busy", "true");

		try {
			// El servidor calcula la racha y devuelve el hábito completo actualizado.
			const habitoActualizado = await completarHabito(habito.id, checkbox.checked);

			habito.completado = habitoActualizado.completado;
			habito.streakActual = habitoActualizado.streakActual;
			habito.fechaReferenciaRacha = habitoActualizado.fechaReferenciaRacha;

			nombreEl.classList.toggle("opacity-50", checkbox.checked);
			nombreEl.classList.toggle("line-through", checkbox.checked);
			actualizarStreakBadge();
			if ((habito.streakActual || 0) > 0) {
				ANUNCIO_ARIA.textContent = "Racha actualizada: " + habito.streakActual + (habito.streakActual === 1 ? " día" : " días");
			}
			actualizarResumen();
		} catch (err) {
			// Si el servidor falla, revertimos el checkbox al estado anterior
			// para que la UI refleje la realidad del servidor.
			checkbox.checked = estadoPrevio;
			mostrarBanner("No se pudo actualizar el hábito. Inténtalo de nuevo.", "error");
		} finally {
			// Se ejecuta siempre: el checkbox sigue en el DOM tanto en éxito como en error,
			// así que siempre hay que desbloquearlo para que el usuario pueda volver a usarlo.
			checkbox.disabled = false;
			checkbox.removeAttribute("aria-busy");
		}
	});

	LISTA_HABITOS.appendChild(clon);
}

// ─── Inicialización ───────────────────────────────────────────────────────────

// Carga los hábitos del servidor, comprueba el reset diario y renderiza la lista.
// Es async porque obtenerHabitos() hace una petición de red — hay que esperar
// la respuesta antes de renderizar, de lo contrario la lista aparecería vacía.
async function inicializar() {
	// Muestra "Cargando..." mientras espera la respuesta del servidor.
	// actualizarEstadoVacio() lo sobreescribirá con el mensaje correcto al terminar.
	LISTA_VACIA.textContent = "Cargando hábitos...";
	LISTA_VACIA.hidden = false;

	try {
		habitos = await obtenerHabitos();
		await comprobarResetDiario();
		renderizarHabitos();
		actualizarResumen();
		// Restaura el mensaje por defecto si la lista está vacía,
		// o lo oculta si hay hábitos — sobreescribe el "Cargando..." inicial
		actualizarEstadoVacio();
	} catch (e) {
		// Si el servidor no responde, informa al usuario en dos sitios:
		// en la lista (donde esperaba ver los hábitos) y en el banner superior
		LISTA_VACIA.textContent = "No se pudo conectar con el servidor. Comprueba que está arrancado.";
		mostrarBanner("Error al cargar los hábitos. El servidor no está disponible.", "error");
	}
}

inicializar();

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
FORM_HABITO.addEventListener("submit", async function (evento) {
	evento.preventDefault();

	// Detiene la ejecución si algún campo no supera la validación
	if (!validarFormulario()) return;

	const nombre = INPUT_NOMBRE.value.trim();
	const duracion = INPUT_DURACION.value.trim();

	// Primera barrera: comprobación local de duplicados para feedback inmediato.
	// El servidor también lo valida y devuelve 409, pero esta comprobación evita
	// un viaje de red innecesario y muestra el error sin esperar respuesta.
	const yaExiste = habitos.some(function (h) {
		return h.habito.toLowerCase() === nombre.toLowerCase();
	});
	if (yaExiste) {
		mostrarError(INPUT_NOMBRE, ERROR_NOMBRE, "Ya existe un hábito con este nombre.");
		return;
	}

	// Bloquea el botón mientras dura la petición para evitar envíos duplicados.
	// El texto cambia para que el usuario sepa que algo está ocurriendo.
	BTN_ANADIR.disabled = true;
	BTN_ANADIR.setAttribute("aria-busy", "true");
	BTN_ANADIR.textContent = "Añadiendo...";

	try {
		// El servidor crea el hábito y devuelve el objeto completo con id, createdAt,
		// streakActual y fechaReferenciaRacha ya generados. Lo añadimos al array local
		// para que renderizarHabitos() lo muestre sin necesidad de otro GET.
		const nuevoHabito = await crearHabito(nombre, duracion);
		const id = nuevoHabito.id;
		habitos.push(nuevoHabito);

		renderizarHabitos();

		// Resalta brevemente la tarjeta recién añadida para que el usuario la identifique
		const tarjetaNueva = LISTA_HABITOS.querySelector("[data-id='" + id + "']");
		if (tarjetaNueva) {
			requestAnimationFrame(function () {
				tarjetaNueva.scrollIntoView({ behavior: "smooth", block: "nearest" });
			});
			const cardDiv = tarjetaNueva.querySelector("div");
			cardDiv.classList.add("!bg-lime-300", "dark:!bg-emerald-700/50");
			setTimeout(function () {
				cardDiv.classList.add("!duration-1000");
				cardDiv.classList.remove("!bg-lime-300", "dark:!bg-emerald-700/50");
				setTimeout(function () {
					cardDiv.classList.remove("!duration-1000");
				}, 1000);
			}, 1500);
		}

		// Si hay una búsqueda activa, se limpia para que el nuevo hábito sea visible.
		// Ocultar el hábito recién añadido sería confuso: el usuario pulsa "Añadir" y no ve nada.
		if (INPUT_BUSQUEDA.value) {
			INPUT_BUSQUEDA.value = "";
			LISTA_HABITOS.querySelectorAll("li").forEach(function (item) {
				item.hidden = false;
			});
		}

		actualizarResumen();
		actualizarEstadoVacio();

		ANUNCIO_ARIA.textContent = "Hábito \"" + nombre + "\" añadido correctamente.";

		// Limpia todos los campos del formulario de una sola vez
		FORM_HABITO.reset();
		// Elimina los posibles estados de error visuales que pudieran quedar tras el reset
		limpiarError(INPUT_NOMBRE, ERROR_NOMBRE);
		limpiarError(INPUT_DURACION, ERROR_DURACION);
	} catch (e) {
		// Si el servidor falla, el formulario se queda relleno para que el usuario pueda reintentar
		mostrarBanner("No se pudo crear el hábito. Inténtalo de nuevo.", "error");
		return;
	} finally {
		// Se ejecuta siempre, tanto si la petición tuvo éxito como si falló.
		// Restaura el botón para que el usuario pueda volver a intentarlo.
		BTN_ANADIR.disabled = false;
		BTN_ANADIR.removeAttribute("aria-busy");
		BTN_ANADIR.textContent = "Añadir Hábito";
	}

	// Devuelve el foco al primer campo para facilitar añadir varios hábitos seguidos
	INPUT_NOMBRE.focus();
});

/**
 * Vacía la lista del DOM y vuelve a renderizar todos los hábitos
 * respetando el orden de fecha activo (ordenFechaAsc).
 */
function renderizarHabitos() {
	LISTA_HABITOS.innerHTML = "";
	const orden = SELECT_ORDENAR.value;
	// .slice() crea una copia del array para no mutar el original al ordenar.
	// habitos siempre mantiene el orden de inserción; el orden visual solo afecta al DOM.
	habitos
		.slice()
		.sort(function (a, b) {
			const da = new Date(a.createdAt).getTime();
			const db = new Date(b.createdAt).getTime();
			if (orden === "fecha-asc") return da - db;
			if (orden === "nombre-asc") return a.habito.localeCompare(b.habito);
			if (orden === "nombre-desc") return b.habito.localeCompare(a.habito);
			return db - da; // fecha-desc por defecto
		})
		.forEach(crearTarjeta);
	actualizarEstadoVacio();
}

/**
 * Filtra la lista visible según el texto actual del buscador.
 * Oculta con `hidden` los <li> cuyo nombre no contenga el texto buscado.
 * Si la búsqueda está vacía, delega en actualizarEstadoVacio() para mostrar
 * el mensaje correcto. Si hay texto pero ningún resultado, muestra el mensaje
 * de "sin coincidencias". Actualiza el botón de completar todos al final
 * para que solo tenga en cuenta los hábitos visibles.
 */
function aplicarFiltro() {
	const textoBuscado = INPUT_BUSQUEDA.value.toLowerCase();
	const items = LISTA_HABITOS.querySelectorAll("li");

	items.forEach(function (item) {
		const nombreItem = item.querySelector(".nombre").textContent.toLowerCase();
		item.hidden = !nombreItem.includes(textoBuscado);
	});

	if (textoBuscado === "") {
		actualizarEstadoVacio();
	} else {
		const visibles = Array.from(items).filter(function (item) {
			return !item.hidden;
		});
		if (visibles.length === 0 && habitos.length > 0) {
			LISTA_VACIA.textContent = "No se encontraron hábitos que coincidan con la búsqueda.";
			LISTA_VACIA.hidden = false;
		} else {
			LISTA_VACIA.hidden = true;
			if (visibles.length > 0) {
				ANUNCIO_ARIA.textContent = visibles.length === 1
					? "1 hábito encontrado."
					: visibles.length + " hábitos encontrados.";
			}
		}
	}

	actualizarBotonCompletarTodos();
}

let timeoutBusqueda = null;

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
INPUT_BUSQUEDA.addEventListener("input", function () {
	clearTimeout(timeoutBusqueda);
	timeoutBusqueda = setTimeout(aplicarFiltro, 200);
});

BTN_COMPLETAR_TODOS.addEventListener("click", async function () {
	const visibles = Array.from(LISTA_HABITOS.querySelectorAll("li")).filter(function (item) {
		return !item.hidden;
	});
	const hayPendientes = visibles.some(function (item) {
		return !item.querySelector(".completado").checked;
	});

	const ids = visibles.map(function (item) {
		return item.dataset.id;
	});

	// Informa al usuario de que la petición está en curso con el texto correcto
	// según la acción: completar o desmarcar todos los hábitos visibles.
	BTN_COMPLETAR_TODOS.disabled = true;
	BTN_COMPLETAR_TODOS.setAttribute("aria-busy", "true");
	BTN_COMPLETAR_TODOS.textContent = hayPendientes ? "Completando..." : "Desmarcando...";

	// Deshabilita los checkboxes individuales para evitar peticiones simultáneas
	// que colisionarían con el PATCH de completar-todos mientras está en curso.
	const checkboxesVisibles = visibles.map(function (item) {
		return item.querySelector(".completado");
	});
	checkboxesVisibles.forEach(function (cb) { cb.disabled = true; });

	try {
		const actualizados = await completarTodosHabitos(hayPendientes, ids);
		// El servidor devuelve solo los hábitos modificados (los visibles).
		// Actualizamos cada uno en el array local en lugar de reemplazarlo entero,
		// para no perder los hábitos que no estaban visibles por el filtro de búsqueda.
		actualizados.forEach(function (actualizado) {
			const index = habitos.findIndex(function (h) { return h.id === actualizado.id; });
			if (index !== -1) habitos[index] = actualizado;
		});
		renderizarHabitos();
		aplicarFiltro();
		actualizarResumen();
		const hayBusqueda = INPUT_BUSQUEDA.value.trim();
		const sufijo = hayBusqueda ? "buscados" : "todos";
		ANUNCIO_ARIA.textContent = hayPendientes
			? "Hábitos " + sufijo + " completados."
			: "Hábitos " + sufijo + " desmarcados.";
	} catch (e) {
		// En error los checkboxes siguen en el DOM — hay que rehabilitarlos
		// para que el usuario pueda seguir interactuando con ellos.
		checkboxesVisibles.forEach(function (cb) { cb.disabled = false; });
		mostrarBanner("No se pudo actualizar los hábitos. Inténtalo de nuevo.", "error");
	} finally {
		// Se ejecuta siempre. actualizarBotonCompletarTodos() recalcula el texto
		// y el estado correcto del botón tanto en éxito como en error.
		BTN_COMPLETAR_TODOS.removeAttribute("aria-busy");
		actualizarBotonCompletarTodos();
	}
});

// ─── Vaciar lista ─────────────────────────────────────────────────────────────

// Abre el modal de confirmación al pulsar "Vaciar lista"
BTN_VACIAR.addEventListener("click", function () {
	MODAL_VACIAR.hidden = false;
	// Mueve el foco al botón cancelar al abrir (acción segura por defecto)
	MODAL_VACIAR_CANCELAR.focus();
});

// Cierra el modal sin hacer nada al pulsar "Cancelar" o el backdrop
function cerrarModalVaciar() {
	MODAL_VACIAR.hidden = true;
	// Devuelve el foco al botón que abrió el modal
	BTN_VACIAR.focus();
}
MODAL_VACIAR_CANCELAR.addEventListener("click", cerrarModalVaciar);
// Pulsar fuera del cuadro (en el backdrop) también cancela
MODAL_VACIAR_BACKDROP.addEventListener("click", cerrarModalVaciar);

// Escape cierra el modal
document.addEventListener("keydown", function (e) {
	if (e.key === "Escape" && !MODAL_VACIAR.hidden) cerrarModalVaciar();
});

// Focus trap: mantiene el foco dentro del modal mientras está abierto
MODAL_VACIAR.addEventListener("keydown", function (e) {
	if (e.key !== "Tab") return;
	const focusables = [MODAL_VACIAR_CANCELAR, MODAL_VACIAR_CONFIRMAR].filter(function (btn) {
		return !btn.disabled;
	});
	if (focusables.length === 0) return;
	const primero = focusables[0];
	const ultimo = focusables[focusables.length - 1];
	if (e.shiftKey && document.activeElement === primero) {
		e.preventDefault();
		ultimo.focus();
	} else if (!e.shiftKey && document.activeElement === ultimo) {
		e.preventDefault();
		primero.focus();
	}
});

/**
 * Confirma el vaciado: llama al servidor, limpia el estado local y cierra el modal.
 * El botón se deshabilita durante la petición para evitar dobles clics.
 */
MODAL_VACIAR_CONFIRMAR.addEventListener("click", async function () {
	// Bloqueamos ambos botones mientras dura la petición para evitar
	// que el usuario pulse varias veces o cancele a mitad
	MODAL_VACIAR_CONFIRMAR.disabled = true;
	MODAL_VACIAR_CONFIRMAR.setAttribute("aria-busy", "true");
	MODAL_VACIAR_CONFIRMAR.textContent = "Vaciando...";
	MODAL_VACIAR_CANCELAR.disabled = true;

	try {
		// TODO: eliminar esta línea — solo sirve para probar el estado de carga
		await new Promise(resolve => setTimeout(resolve, 3000));
		await vaciarHabitos();

		// Vaciamos el array local para sincronizar el frontend con el servidor
		// sin necesidad de hacer otra petición GET.
		// Aquí habitos = [] funcionaría igual porque nadie más guarda una referencia
		// a este array. Usamos length = 0 por coherencia con el service del backend,
		// donde sí importa mutar el array en lugar de reemplazarlo.
		habitos.length = 0;

		// Re-renderizamos la lista (quedará vacía) y actualizamos el resumen a 0
		renderizarHabitos();
		actualizarResumen();
		cerrarModalVaciar();
	} catch (e) {
		mostrarBanner("No se pudo vaciar la lista. Inténtalo de nuevo.", "error");
		cerrarModalVaciar();
	} finally {
		// Restauramos el botón confirmar para la próxima vez que se abra el modal
		MODAL_VACIAR_CONFIRMAR.disabled = false;
		MODAL_VACIAR_CONFIRMAR.removeAttribute("aria-busy");
		MODAL_VACIAR_CONFIRMAR.textContent = "Sí, vaciar";
		MODAL_VACIAR_CANCELAR.disabled = false;
	}
});

SELECT_ORDENAR.addEventListener("change", function () {
	renderizarHabitos();
	aplicarFiltro();
	const etiqueta = SELECT_ORDENAR.options[SELECT_ORDENAR.selectedIndex].text;
	ANUNCIO_ARIA.textContent = "Lista ordenada por: " + etiqueta;
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
