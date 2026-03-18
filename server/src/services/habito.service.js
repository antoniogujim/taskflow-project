// Importamos la función randomUUID del módulo nativo de Node.js
// La usamos para generar IDs únicos en lugar de un contador numérico
const { randomUUID } = require('crypto');

// Array en memoria que simula una base de datos
// Cuando el servidor se reinicia, se pierde todo (intencional por ahora)
let habitos = [];

// Devuelve todos los hábitos almacenados
function obtenerTodos() {
    return habitos;
}

// Crea un nuevo hábito con un ID único y los datos recibidos
// data contiene los campos que mande el cliente (habito, tiempo, etc.)
// Retorna el hábito creado para que el controlador pueda enviarlo al cliente
function crearHabito(data) {
    const habito = { id: randomUUID(), ...data };
    habitos.push(habito);
    return habito;
}

// Elimina el hábito cuyo ID coincida con el recibido
// Si no existe, lanza un error que el controlador capturará y convertirá en 404
function eliminarHabito(id) {
    const index = habitos.findIndex((h) => h.id === id);
    if (index === -1) {
        throw new Error('NOT_FOUND');
    }
    // splice(posicion, cuantos elementos eliminar)
    habitos.splice(index, 1);
}

// Exportamos las funciones para que otros archivos puedan importarlas
// Sin esto, Node trata el archivo como un módulo cerrado y nada es accesible desde fuera
module.exports = { obtenerTodos, crearHabito, eliminarHabito };
