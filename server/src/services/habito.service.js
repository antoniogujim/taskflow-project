// Importamos la función randomUUID del módulo nativo de Node.js
// La usamos para generar IDs únicos en lugar de un contador numérico
const { randomUUID } = require('crypto');

// Array en memoria que simula una base de datos
// Cuando el servidor se reinicia, se pierde todo (intencional por ahora)

let habitos = [
    {
        id: randomUUID(),
        habito: 'Meditar',
        tiempo: '10 minutos',
        completado: false,
        createdAt: new Date(Date.now()).toISOString(),
        streakActual: 0,
        fechaReferenciaRacha: null,
    },
    {
        id: randomUUID(),
        habito: 'Leer',
        tiempo: '1 capítulo',
        completado: false,
        createdAt: new Date(Date.now() + 1).toISOString(),
        streakActual: 0,
        fechaReferenciaRacha: null,
    },
    {
        id: randomUUID(),
        habito: 'Correr',
        tiempo: '30 minutos',
        completado: false,
        createdAt: new Date(Date.now() + 2).toISOString(),
        streakActual: 0,
        fechaReferenciaRacha: null,
    },
    {
        id: randomUUID(),
        habito: 'Tomar vitaminas',
        tiempo: 'Instantáneo',
        completado: false,
        createdAt: new Date(Date.now() + 3).toISOString(),
        streakActual: 0,
        fechaReferenciaRacha: null,
    },
];


// Busca un hábito por ID y devuelve su índice en el array.
// Si no existe, lanza NOT_FOUND para que el middleware de errores devuelva un 404.
// Se usa en todas las funciones que necesitan localizar un hábito concreto,
// evitando repetir el mismo findIndex y la misma comprobación en cada una.
function encontrarIndicePorId(id) {
    const index = habitos.findIndex((h) => h.id === id);
    if (index === -1) {
        throw new Error('NOT_FOUND');
    }
    return index;
}

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
        // La racha empieza en 0 porque el hábito aún no ha sido completado ningún día
        streakActual: 0,
        // Fecha auxiliar para calcular la racha — no es un historial real de completaciones.
        // null indica que el hábito nunca ha sido completado o que la racha se ha perdido.
        fechaReferenciaRacha: null,
    };
    habitos.push(habito);
    return habito;
}

// Actualiza el nombre y la duración de un hábito existente.
// Solo modifica habito y tiempo — el resto de campos permanece intacto.
function editarHabito(id, datos) {
    // Delegamos la búsqueda a la función compartida — lanza NOT_FOUND si no existe
    const index = encontrarIndicePorId(id);

    // Comprobamos si ya existe otro hábito con el mismo nombre (excluyendo el propio).
    // Sin excluirlo, guardar el mismo nombre sin cambios daría un falso error de duplicado.
    const existe = habitos.some((h) => h.id !== id && h.habito === datos.habito);
    if (existe) {
        throw new Error('DUPLICATE');
    }

    // Actualizamos solo los campos permitidos. El resto (id, createdAt, completado,
    // streakActual, fechaReferenciaRacha) queda intacto.
    habitos[index].habito = datos.habito;
    habitos[index].tiempo = datos.tiempo;

    // Devolvemos el hábito completo ya actualizado para que el controlador lo envíe al cliente.
    return habitos[index];
}

// Actualiza el estado completado de un hábito y gestiona la lógica de racha.
// completado viene del controlador, que lo extrae del body de la petición del cliente.
function completarHabito(id, completado) {
    const index = encontrarIndicePorId(id);
    const habito = habitos[index];

    // Calculamos hoy y ayer en hora local (formato YYYY-MM-DD).
    // Usamos toLocaleDateString('sv') para evitar problemas con UTC en zonas horarias con UTC+,
    // donde toISOString() puede devolver el día anterior a partir de cierta hora.
    // Sobreescribimos las variables: una vez tenemos los strings ya no necesitamos los objetos Date.
    let hoy = new Date();
    let ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    hoy = hoy.toLocaleDateString('sv');
    ayer = ayer.toLocaleDateString('sv');

    if (completado) {
        // Si la última referencia era ayer, la racha continúa — incrementamos.
        // En cualquier otro caso (más antigua, null, o hoy) la racha se reinicia a 1.
        if (habito.fechaReferenciaRacha === ayer) {
            habito.streakActual++;
        } else {
            habito.streakActual = 1;
        }
        // Siempre actualizamos la fecha a hoy al marcar, sin excepción
        habito.fechaReferenciaRacha = hoy;
    } else {
        // Al desmarcar, decrementamos la racha (mínimo 0).
        // Usamos -- prefijo para que decremente antes de que Math.max evalúe el valor.
        habito.streakActual = Math.max(0, --habito.streakActual);
        // Si la racha llega a 0, null indica racha perdida o no iniciada.
        // Si queda racha, ponemos ayer para que marcar hoy de nuevo recupere la racha correctamente.
        habito.fechaReferenciaRacha = habito.streakActual === 0 ? null : ayer;
    }

    habito.completado = completado;
    return habito;
}

// Resetea todos los hábitos a completado: false y rompe la racha de los que llevan
// más de un día sin completarse. Cuando conectemos el frontend, lo llamará al detectar
// que es un día nuevo. No lanza errores — si no hay hábitos, simplemente no hace nada.
function resetearHabitos() {
    let ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    ayer = ayer.toLocaleDateString('sv');

    habitos.forEach((h) => {
        h.completado = false;

        // Si la fecha de referencia no es de ayer ni de hoy, la racha se ha roto.
        // Esto cubre el caso de llevar varios días sin abrir la app.
        if (h.fechaReferenciaRacha !== null && h.fechaReferenciaRacha < ayer) {
            h.streakActual = 0;
            h.fechaReferenciaRacha = null;
        }
    });
}

// Elimina el hábito cuyo ID coincida con el recibido
// Si no existe, lanza un error que el middleware global capturará
// El mensaje 'NOT_FOUND' es evaluado por el middleware para devolver un 404
function eliminarHabito(id) {
    // Delegamos la búsqueda a la función compartida — lanza NOT_FOUND si no existe
    const index = encontrarIndicePorId(id);
    // splice(posicion, cuantos elementos eliminar)
    habitos.splice(index, 1);
}

// Exportamos las funciones para que otros archivos puedan importarlas
// Sin esto, Node trata el archivo como un módulo cerrado y nada es accesible desde fuera
module.exports = { obtenerTodos, crearHabito, editarHabito, completarHabito, resetearHabitos, eliminarHabito };
