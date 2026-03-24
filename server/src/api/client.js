// Usamos fetch nativo en lugar de axios porque el servidor ya devuelve
// códigos HTTP semánticos correctos (400, 404, 409, 500). Con response.ok
// podemos detectar cualquier error sin necesitar una librería externa.

// En local el servidor corre en un puerto distinto al del frontend, así que
// necesitamos la URL completa. En producción (Vercel) frontend y backend
// comparten dominio, por lo que basta con una ruta relativa.
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api/v1/habitos'
    : '/api/v1/habitos';

// Pide al servidor la lista completa de hábitos.
// async/await permite escribir código asíncrono como si fuera síncrono, sin callbacks.
async function obtenerHabitos() {
    // fetch hace la petición HTTP. Sin opciones adicionales, usa GET por defecto.
    const response = await fetch(API_URL);

    // response.ok es true si el código HTTP está entre 200 y 299.
    // Si el servidor devuelve 404 o 500, fetch no lanza error solo — hay que comprobarlo.
    if (!response.ok) throw new Error('Error al obtener los hábitos');

    // Convierte el cuerpo de la respuesta de texto JSON a un objeto JavaScript.
    return response.json();
}

// Envía un nuevo hábito al servidor para que lo cree y lo guarde.
async function crearHabito(habito, tiempo) {
    const response = await fetch(API_URL, {
        // Indicamos que es una petición POST — sin esto fetch usaría GET por defecto.
        method: 'POST',
        // Le decimos al servidor que el cuerpo es JSON, no un formulario ni otro formato.
        headers: { 'Content-Type': 'application/json' },
        // Convertimos el objeto JavaScript a texto JSON para enviarlo en la petición.
        body: JSON.stringify({ habito, tiempo }),
    });

    // Si el servidor devuelve un error (400, 409, 500...), lanzamos un error nosotros.
    if (!response.ok) throw new Error('Error al crear el hábito');

    // El servidor devuelve el hábito creado con su id y createdAt generados.
    return response.json();
}

// Elimina el hábito cuyo ID se indica.
async function eliminarHabito(id) {
    // El ID va en la URL, no en el body. Es la forma estándar de identificar
    // un recurso concreto en REST: DELETE /api/v1/habitos/:id.
    // Los backticks (`) activan los template literals: permiten meter variables
    // dentro de un string con ${}, más legible que concatenar con +.
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });

    // Si el servidor devuelve un error (404 si no existe, 500 si falla algo), lanzamos un error.
    if (!response.ok) throw new Error('Error al eliminar el hábito');

    // El servidor responde con 204 No Content: éxito pero sin cuerpo.
    // No llamamos a response.json() porque no hay nada que convertir — hacerlo lanzaría un error.
}

// Actualiza el nombre y la duración de un hábito existente.
async function editarHabito(id, habito, tiempo) {
    // El ID va en la URL para identificar qué hábito modificar.
    // El nuevo nombre y duración van en el body como JSON.
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habito, tiempo }),
    });

    // Si el servidor devuelve un error (400, 404, 409...), lanzamos un error nosotros.
    if (!response.ok) throw new Error('Error al editar el hábito');

    // El servidor devuelve el hábito completo con los datos actualizados.
    return response.json();
}

// Marca o desmarca un hábito como completado y actualiza su racha en el servidor.
async function completarHabito(id, completado) {
    // La ruta incluye /completar para diferenciarse del PATCH de editar que usa la misma base.
    const response = await fetch(`${API_URL}/${id}/completar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // completado es un booleano: true al marcar, false al desmarcar.
        body: JSON.stringify({ completado }),
    });

    // Si el servidor devuelve un error (400, 404...), lanzamos un error nosotros.
    if (!response.ok) throw new Error('Error al actualizar el hábito');

    // El servidor devuelve el hábito con streakActual y fechaReferenciaRacha actualizados.
    return response.json();
}

// Marca o desmarca todos los hábitos en una sola petición al servidor.
// Devuelve el array completo actualizado para sincronizar el estado local.
async function completarTodosHabitos(completado, ids) {
    const response = await fetch(`${API_URL}/completar-todos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completado, ids }),
    });

    if (!response.ok) throw new Error('Error al completar todos los hábitos');

    return response.json();
}

// Resetea todos los hábitos a completado: false y rompe rachas antiguas.
// Se llama al detectar que es un día nuevo.
async function resetearHabitos() {
    const response = await fetch(`${API_URL}/reset`, {
        method: 'POST',
    });

    // Si el servidor devuelve un error, lanzamos un error nosotros.
    if (!response.ok) throw new Error('Error al resetear los hábitos');

    // El servidor responde con 204 No Content — no hay nada que convertir.
}