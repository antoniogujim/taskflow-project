// Importamos el servicio para poder llamar a su lógica de negocio
const habitoService = require('../services/habito.service');

// Valida que los campos habito y tiempo del body sean correctos.
// Devuelve un mensaje de error si algo falla, o null si todo es válido.
// Se usa tanto en create como en update para no repetir la misma lógica.

function validarCamposHabito(body) {

    // Guarda defensiva: si no hay body o no es un objeto, paramos con 400
    // Sin esto, desestructurar req.body cuando es undefined lanzaría un TypeError
    // que llegaría al manejador de errores como 500.
    // El typeof cubre también el caso null: en JavaScript typeof null === 'object'
    // (bug histórico del lenguaje), así que el !body es necesario para descartarlo
    if (!body || typeof body !== 'object') {
        return 'El cuerpo de la petición es obligatorio';
    }

    const { habito, tiempo } = body;

    // Si faltan los dos campos a la vez, informamos de ambos en un solo mensaje
    if (!habito && !tiempo) {
        return 'El nombre del hábito y la duración son obligatorios';
    }

    // Si solo falta el nombre, informamos específicamente de ese campo
    if (!habito) {
        return 'El nombre del hábito es obligatorio';
    }

    // El nombre debe ser un texto, no un número, booleano, array u otro tipo
    if (typeof habito !== 'string') {
        return 'El nombre del hábito debe ser un texto';
    }

    // Un string con solo espacios se trata como vacío
    if (habito.trim() === '') {
        return 'El nombre del hábito es obligatorio';
    }

    // Si solo falta la duración, informamos específicamente de ese campo
    if (!tiempo) {
        return 'La duración es obligatoria';
    }

    // La duración debe ser un texto, no un número, booleano, array u otro tipo
    if (typeof tiempo !== 'string') {
        return 'La duración debe ser un texto';
    }

    // Un string con solo espacios se trata como vacío
    if (tiempo.trim() === '') {
        return 'La duración es obligatoria';
    }

    // null indica ausencia de error — no hay ningún mensaje que devolver.
    // Se usa null en lugar de false porque expresa "no hay nada aquí",
    // no una respuesta negativa. En el controlador: if (error) → solo entra si hay mensaje.
    return null;
}

// Devuelve todos los hábitos al cliente
function getAll(req, res) {
    const habitos = habitoService.obtenerTodos();
    res.status(200).json(habitos);
}

// Crea un nuevo hábito con los datos recibidos del cliente
function create(req, res) {
    // Delegamos la validación a la función compartida.
    // Si devuelve un mensaje, hay un error — lo enviamos con 400 y paramos.
    const errorValidacion = validarCamposHabito(req.body);
    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    // El servicio extrae solo los campos permitidos; campos extra del cliente se descartan
    const nuevoHabito = habitoService.crearHabito(req.body);
    res.status(201).json(nuevoHabito);
}

// Actualiza el nombre y la duración del hábito cuyo ID llega en la URL.
// Si el servicio lanza un error, se lo pasamos a next() para que el middleware
// de errores lo gestione — el controlador no necesita saber qué tipo de error es
function update(req, res, next) {
    // Reutilizamos la validación compartida — mismas reglas que al crear
    const errorValidacion = validarCamposHabito(req.body);
    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    // El ID identifica qué hábito modificar — viene en la URL, no en el body.
    // Las llaves {} son desestructuración: extraen la propiedad id de req.params
    // de forma más corta que escribir const id = req.params.id
    const { id } = req.params;

    try {
        const habitoActualizado = habitoService.editarHabito(id, req.body);
        // 200: éxito con contenido, devolvemos el hábito completo ya actualizado
        res.status(200).json(habitoActualizado);
    } catch (error) {
        next(error);
    }
}

// Marca o desmarca un hábito como completado y actualiza su racha
function complete(req, res, next) {
    const { id } = req.params;

    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'El cuerpo de la petición es obligatorio' });
    }

    const { completado } = req.body;

    // completado debe ser exactamente true o false — no vale un string "true" ni un número.
    // Cualquier herramienta externa (Postman, fetch desde consola) podría mandar cualquier valor,
    // por eso el servidor no puede confiar ciegamente en lo que llega del cliente.
    if (typeof completado !== 'boolean') {
        return res.status(400).json({ error: 'El valor de completado debe ser true o false' });
    }

    // El try/catch permite que si el servicio lanza un error (por ejemplo NOT_FOUND si el ID
    // no existe), el catch lo capture y lo pase al middleware de errores con next(error),
    // en lugar de que el servidor se rompa con un 500 inesperado.
    try {
        const habitoActualizado = habitoService.completarHabito(id, completado);
        res.status(200).json(habitoActualizado);
    } catch (error) {
        next(error);
    }
}

// Marca o desmarca los hábitos cuyos IDs llegan en el body y devuelve solo los actualizados.
// Recibe un array ids con los hábitos visibles en el frontend (respetando el filtro de búsqueda activo),
// de forma que solo se actualizan los que el usuario ve en pantalla, no todos.
function completeAll(req, res, next) {
    const { completado, ids } = req.body || {};

    if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'El campo ids es obligatorio y debe ser un array' });
    }

    if (typeof completado !== 'boolean') {
        return res.status(400).json({ error: 'El campo completado debe ser un booleano' });
    }

    if (ids.length === 0) {
        return res.status(200).json([]);
    }

    try {
        const habitosActualizados = habitoService.completarTodos(completado, ids);
        res.status(200).json(habitosActualizados);
    } catch (error) {
        next(error);
    }
}

// Resetea todos los hábitos a completado: false.
// Cuando conectemos el frontend, lo llamará al detectar que es un día nuevo.
// No necesita ID ni body — afecta a todos los hábitos a la vez.
function reset(req, res) {
    habitoService.resetearHabitos();
    // 204: éxito sin contenido — el reset se aplicó pero no hay nada que devolver
    res.status(204).send();
}

// Elimina el hábito cuyo ID llega en la URL (/api/v1/habitos/:id)
// Si el servicio lanza un error, se lo pasamos a next() para que el middleware
// de errores lo gestione — el controlador no necesita saber qué tipo de error es
function remove(req, res, next) {
    const { id } = req.params;

    try {
        habitoService.eliminarHabito(id);
        // 204: éxito sin contenido, el hábito ya no existe
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

// Elimina todos los hábitos de la colección.
// No necesita body ni parámetros — la operación afecta a todos sin excepción.
function vaciar(_req, res) {
    habitoService.vaciarHabitos();
    // 204: éxito sin contenido — la operación se completó pero no hay nada que devolver
    res.status(204).send();
}

// Exportamos los métodos para que el enrutador pueda asignarlos a cada verbo HTTP
module.exports = { getAll, create, update, complete, completeAll, reset, remove, vaciar };
