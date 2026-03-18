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

// Montamos el router bajo el prefijo /api/v1/habitos
// Todas las rutas definidas en habito.routes.js serán accesibles desde aquí
app.use('/api/v1/habitos', habitoRouter);

// Arranca el servidor en el puerto definido en .env
// El callback confirma en consola que el servidor está listo
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});
