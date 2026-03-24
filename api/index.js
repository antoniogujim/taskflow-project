// Cargamos las variables de entorno antes que cualquier otra cosa
require('./config/env');

// Express es el framework que crea y gestiona el servidor HTTP
const express = require('express');

// Cors permite que el front (distinto puerto) pueda comunicarse con el backend
// Sin esto el navegador bloquearía las peticiones por política de seguridad
const cors = require('cors');

// Creamos la instancia principal de la aplicación Express
const app = express();

// Habilitamos CORS para todas las rutas
app.use(cors());

// Permite leer el cuerpo de las peticiones en formato JSON (req.body)
app.use(express.json());

// Importamos el router de hábitos con todas sus rutas definidas
const habitoRouter = require('./routes/habito.routes');

// Swagger: sirve el spec JSON para que la página estática de documentación lo consuma
const swaggerSpec = require('./config/swagger');
app.get('/api/swagger-spec', (req, res) => res.json(swaggerSpec));

// Montamos el router bajo el prefijo /api/v1/habitos
// Todas las rutas definidas en habito.routes.js serán accesibles desde aquí
app.use('/api/v1/habitos', habitoRouter);

// Middleware de manejo de errores — debe ir al final, después de todas las rutas
// Express lo identifica por tener 4 parámetros (err, req, res, next)
// Se activa cuando cualquier controlador llama a next(error)
// Evalúa el mensaje del error para decidir qué código HTTP devolver:
// - 'NOT_FOUND' → 404 (error del cliente, recurso inexistente)
// - cualquier otro → 500 (fallo no controlado, se registra la traza completa)
// En los 500 nunca se filtra el error real al cliente para no exponer detalles técnicos

// Middleware catch-all: captura cualquier petición que no haya coincidido con ninguna ruta anterior.
// Express ejecuta los middlewares en orden; si ninguno gestionó la petición, llega aquí.
// Sin este middleware, Express generaría y enviaría su propia respuesta HTML directamente,
// sin pasar por el manejador de errores ni por ningún otro middleware nuestro.
// Debe ir después de todas las rutas y antes del manejador de errores.
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

function manejadorErrores(err, req, res, next) {
    if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Hábito no encontrado' });
    }

    if (err.message === 'DUPLICATE') {
        return res.status(409).json({ error: 'Este hábito ya existe' });
    }

    // Registramos la traza completa del error en consola para poder depurarlo
    // pero enviamos al cliente un mensaje genérico sin detalles técnicos
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
}

app.use(manejadorErrores);

// En Vercel el servidor corre como función serverless: no hay puerto ni proceso
// continuo. Vercel importa este módulo y gestiona el ciclo HTTP por nosotros,
// así que solo exportamos la app. En local sí arrancamos el servidor con listen().
if (!process.env.VERCEL) {
    app.listen(process.env.PORT, () => {
        console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
    });
}

module.exports = app;
