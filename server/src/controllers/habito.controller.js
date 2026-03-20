// Importamos el servicio para poder llamar a su lógica de negocio
const habitoService = require('../services/habito.service');

// Devuelve todos los hábitos al cliente
function getAll(req, res) {
    const habitos = habitoService.obtenerTodos();
    res.status(200).json(habitos);
}

// Crea un nuevo hábito con los datos recibidos del cliente
function create(req, res) {

    // Guarda defensiva: si no hay body o no es un objeto, paramos con 400
    // Sin esto, desestructurar req.body cuando es undefined lanzaría un TypeError
    // que llegaría al manejador de errores como 500.
    // El typeof cubre también el caso null: en JavaScript typeof null === 'object'
    // (bug histórico del lenguaje), así que el !req.body es necesario para descartarlo

    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'El cuerpo de la petición es obligatorio' });
    }

    const { habito, tiempo } = req.body;

    // Si faltan los dos campos a la vez, informamos de ambos en un solo mensaje
    if (!habito && !tiempo) {
        return res.status(400).json({ error: 'El nombre del hábito y la duración son obligatorios' });
    }

    // Si solo falta el nombre, informamos específicamente de ese campo
    if (!habito) {
        return res.status(400).json({ error: 'El nombre del hábito es obligatorio' });
    }

    // El nombre debe ser un texto, no un número, booleano, array u otro tipo
    if (typeof habito !== 'string') {
        return res.status(400).json({ error: 'El nombre del hábito debe ser un texto' });
    }

    // Un string con solo espacios se trata como vacío
    if (habito.trim() === '') {
        return res.status(400).json({ error: 'El nombre del hábito es obligatorio' });
    }

    // Si solo falta la duración, informamos específicamente de ese campo
    if (!tiempo) {
        return res.status(400).json({ error: 'La duración es obligatoria' });
    }

    // La duración debe ser un texto, no un número, booleano, array u otro tipo
    if (typeof tiempo !== 'string') {
        return res.status(400).json({ error: 'La duración debe ser un texto' });
    }

    // Un string con solo espacios se trata como vacío
    if (tiempo.trim() === '') {
        return res.status(400).json({ error: 'La duración es obligatoria' });
    }

    // El servicio extrae solo los campos permitidos; campos extra del cliente se descartan
    const nuevoHabito = habitoService.crearHabito(req.body);
    res.status(201).json(nuevoHabito);
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

// Exportamos los métodos para que el enrutador pueda asignarlos a cada verbo HTTP
module.exports = { getAll, create, remove };
