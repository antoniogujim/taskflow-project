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
function remove(req, res) {
    const { id } = req.params;

    try {
        habitoService.eliminarHabito(id);
        // 204: éxito sin contenido, el hábito ya no existe
        res.status(204).send();
    } catch (error) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Hábito no encontrado' });
        }
    }
}

// Exportamos los métodos para que el enrutador pueda asignarlos a cada verbo HTTP
module.exports = { getAll, create, remove };
