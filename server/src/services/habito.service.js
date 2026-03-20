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

// Crea un nuevo hábito con los campos que acepta el servidor.
// Se extraen explícitamente solo habito y tiempo del body del cliente
// para evitar que este inyecte campos que no le corresponden (id, createdAt, completado).
// Con el spread anterior ({ id: randomUUID(), ...data }), si el cliente mandaba
// un id propio en el body, sobreescribía el UUID generado aquí porque ...data iba después.
// id y createdAt los genera el servidor (fuente de verdad); completado siempre empieza en false.
function crearHabito(data) {
    // Comprueba si ya existe un hábito con el mismo nombre antes de crearlo
    const existe = habitos.some((h) => h.habito === data.habito);
    if (existe) {
        throw new Error('DUPLICATE');
    }

    const habito = {
        id: randomUUID(),
        habito: data.habito,
        tiempo: data.tiempo,
        completado: false,
        createdAt: new Date().toISOString(),
    };
    habitos.push(habito);
    return habito;
}

// Elimina el hábito cuyo ID coincida con el recibido
// Si no existe, lanza un error que el middleware global capturará
// El mensaje 'NOT_FOUND' es evaluado por el middleware para devolver un 404
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
