// Importamos el servicio para poder llamar a su lógica de negocio
const habitoService = require('../services/habito.service');

// Devuelve todos los hábitos al cliente
function getAll(req, res) {
    const habitos = habitoService.obtenerTodos();
    res.status(200).json(habitos);
}

// Crea un nuevo hábito con los datos recibidos del cliente
function create(req, res) {
    const { habito } = req.body;

    // Validación: si no hay habito, rechazamos la petición
    if (!habito) {
        return res.status(400).json({ error: 'El nombre del hábito es obligatorio' });
    }

    // Pasamos el body completo al servicio para no perder campos extra
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
