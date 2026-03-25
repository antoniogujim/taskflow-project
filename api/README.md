# Backend — Seguidor de Hábitos

REST API construida con Node.js y Express que gestiona los datos de hábitos de la aplicación. Sigue una arquitectura en tres capas (rutas → controladores → servicios) y se despliega como función serverless en Vercel.

## Estructura

```
api/
├── index.js              # Entrada del servidor, middlewares y arranque
├── config/
│   ├── env.js            # Carga y validación de variables de entorno
│   └── swagger.js        # Configuración de swagger-jsdoc (spec base, schemas)
├── routes/
│   └── habito.routes.js  # Conecta verbos HTTP con los controladores
├── controllers/
│   └── habito.controller.js  # Gestiona peticiones y respuestas HTTP
└── services/
    └── habito.service.js     # Lógica de negocio pura (sin HTTP)
```

### Responsabilidad de cada capa

| Capa         | Archivo                   | Responsabilidad                                                                 |
| ------------ | ------------------------- | ------------------------------------------------------------------------------- |
| Rutas        | `habito.routes.js`        | Declara qué verbo HTTP y ruta corresponden a cada controlador                   |
| Controladores | `habito.controller.js`   | Extrae datos del `req`, llama al servicio y construye el `res` con el código HTTP correcto |
| Servicios    | `habito.service.js`       | Contiene toda la lógica de negocio (validaciones, mutaciones del array de datos). No sabe nada de HTTP |

Esta separación permite probar la lógica de negocio de forma aislada, sin necesidad de levantar el servidor.

## Tecnologías

| Librería        | Uso                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| **express**     | Framework HTTP: define rutas, middlewares y gestiona el ciclo petición-respuesta                         |
| **dotenv**      | Carga las variables del archivo `.env` en `process.env` al arrancar el servidor                          |
| **cors**        | Habilita las peticiones cross-origin (CORS) para que el frontend pueda comunicarse con el backend        |
| **nodemon**     | Reinicia el servidor automáticamente al detectar cambios en los archivos (solo en desarrollo)            |
| **swagger-jsdoc** | Genera la especificación OpenAPI 3.0 leyendo los comentarios JSDoc de las rutas y la config de `swagger.js` |

## Arranque

```bash
# Desarrollo (con recarga automática)
npm run dev

# Producción
node api/index.js
```

El servidor escucha por defecto en el puerto definido en la variable de entorno `PORT` (valor por defecto: `3000`).

## Variables de entorno

El servidor lee sus variables de entorno a través de `config/env.js`, que las carga con `dotenv` y lanza un error explícito si alguna obligatoria no está definida.

| Variable | Obligatoria | Valor por defecto | Descripción                                   |
| -------- | ----------- | ----------------- | --------------------------------------------- |
| `PORT`   | No          | `3000`            | Puerto en el que escucha el servidor en local |

Crea un archivo `.env` en la raíz del proyecto con las variables necesarias:

```
PORT=3000
```

> En Vercel no es necesario definir `PORT`: la plataforma asigna el puerto automáticamente y la variable no se usa en el entorno serverless.

## Despliegue en Vercel

El proyecto usa la [estructura recomendada por Vercel para Express](https://vercel.com/docs/frameworks/backend/express):

- La carpeta `api/` es detectada automáticamente por Vercel como funciones serverless. El archivo `api/index.js` se convierte en el punto de entrada de la función.
- Los archivos estáticos del frontend se sirven desde `public/` a través del CDN de Vercel.
- El `vercel.json` de la raíz configura dos cosas:
  - `outputDirectory: "public"` — indica a Vercel que sirva `public/` como raíz web.
  - Un rewrite que redirige todas las peticiones `/api/*` a la función serverless Express, de forma que el frontend puede llamar a `/api/v1/habitos` tanto en local como en producción sin cambiar ninguna URL.

```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/index.js" }]
}
```

> **Por qué no `swagger-ui-express`:** este paquete sirve la UI de Swagger como middleware de Express, lo que entra en conflicto con el sistema de rewrites de Vercel. La solución adoptada es servir la UI como página estática en `public/api-docs/api-docs.html` (carga la librería desde CDN) y exponer solo la spec como JSON en `GET /api/swagger-spec`.

## Middlewares globales

El servidor registra dos middlewares globales además de los de Express:

- **Manejador de errores**: captura cualquier excepción lanzada en controladores o servicios. Mapea el tipo de error a su código HTTP correspondiente (`NOT_FOUND` → `404`, `DUPLICATE` → `409`, cualquier otro → `500`) y devuelve siempre JSON, nunca HTML ni stack traces al cliente. Los errores los lanza el servicio como objetos con un campo `type` (p. ej. `{ type: 'NOT_FOUND', message: '...' }`), lo que permite al middleware identificarlos sin depender de clases de error personalizadas.
- **Catch-all de rutas**: registrado al final, captura cualquier ruta no reconocida por Express y devuelve un `404` en JSON en lugar de la página de error HTML por defecto.

## API Endpoints

El servidor corre por defecto en `http://localhost:3000`. Todos los endpoints están bajo el prefijo `/api/v1/habitos`.

La documentación interactiva está disponible en `/api-docs` (Swagger UI):
- **Local:** `http://localhost:3000/api-docs`
- **Producción:** `https://taskflow-project-rust.vercel.app/api-docs`

| Método | Endpoint                          | Descripción                                                             | Body (JSON)                                       | Respuesta                               |
| ------ | --------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------- |
| GET    | `/api/v1/habitos`                 | Devuelve todos los hábitos                                              | —                                                 | `200` array JSON                        |
| POST   | `/api/v1/habitos`                 | Crea un nuevo hábito                                                    | `{ "habito": "Meditar", "tiempo": "10 minutos" }` | `201` objeto creado                     |
| POST   | `/api/v1/habitos/reset`           | Resetea todos los hábitos a `completado: false` y rompe rachas antiguas | —                                                 | `204` sin contenido                     |
| PATCH  | `/api/v1/habitos/completar-todos` | Marca o desmarca los hábitos cuyos IDs se reciben                       | `{ "completado": true, "ids": ["id1", "id2"] }`   | `200` array con los hábitos modificados |
| PATCH  | `/api/v1/habitos/:id/completar`   | Marca o desmarca un hábito y actualiza su racha                         | `{ "completado": true }`                          | `200` objeto actualizado                |
| PATCH  | `/api/v1/habitos/:id`             | Edita el nombre y la duración de un hábito                              | `{ "habito": "Leer", "tiempo": "30 minutos" }`    | `200` objeto actualizado                |
| DELETE | `/api/v1/habitos/:id`             | Elimina el hábito con ese ID                                            | —                                                 | `204` sin contenido                     |
| DELETE | `/api/v1/habitos`                 | Elimina todos los hábitos de la lista                                   | —                                                 | `204` sin contenido                     |

> **Nota sobre el orden de rutas en Express:** las rutas específicas (`/reset`, `/completar-todos`) deben registrarse **antes** que las rutas con parámetros dinámicos (`/:id`). Si se registran después, Express interpreta el segmento literal como un ID y nunca llega al controlador correcto.

### Códigos de error

| Código | Motivo                                                                                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | Body ausente o no válido; campos `habito` o `tiempo` faltantes, vacíos, con solo espacios, o de tipo incorrecto (se requiere string); `completado` no es booleano; `ids` ausente o no es un array |
| `404`  | No existe ningún hábito con ese ID, o la ruta solicitada no existe                                                                                                                                |
| `409`  | Ya existe un hábito con el mismo nombre                                                                                                                                                           |
| `500`  | Error interno no controlado del servidor                                                                                                                                                          |

### Ejemplo de objeto hábito

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "habito": "Meditar",
  "tiempo": "10 minutos",
  "completado": false,
  "createdAt": "2026-03-20T10:00:00.000Z",
  "streakActual": 3,
  "fechaReferenciaRacha": "2026-03-19"
}
```

| Campo                | Tipo      | Descripción                                                          |
| -------------------- | --------- | -------------------------------------------------------------------- |
| `id`                 | string    | UUID generado con `crypto.randomUUID()` (módulo nativo de Node.js)   |
| `habito`             | string    | Nombre del hábito                                                    |
| `tiempo`             | string    | Duración estimada                                                    |
| `completado`         | boolean   | Si el hábito ha sido completado hoy                                  |
| `createdAt`          | string    | Fecha ISO de creación                                                |
| `streakActual`       | number    | Días consecutivos completado                                         |
| `fechaReferenciaRacha` | string  | Última fecha en que se completó el hábito (formato `YYYY-MM-DD`)     |

> **Nota:** los datos se almacenan en memoria. Al reiniciar el servidor, los hábitos vuelven a los ejemplos predefinidos.

### Lógica de racha

| Acción                   | Efecto sobre `streakActual`            | Efecto sobre `fechaReferenciaRacha`              |
| ------------------------ | -------------------------------------- | ------------------------------------------------ |
| Marcar como completado   | +1 si la referencia era ayer; si no, se reinicia a 1 | Se actualiza a hoy                  |
| Desmarcar                | -1 (mínimo 0)                          | `null` si la racha llega a 0; `ayer` si queda racha (para que marcar hoy de nuevo la recupere) |
| Reset diario (nuevo día) | Se pone a 0 si la referencia es anterior a ayer | Se pone a `null`                    |

## Swagger

La especificación OpenAPI se genera con `swagger-jsdoc` a partir de:

- Los comentarios JSDoc en `habito.routes.js` (descripciones de cada endpoint, parámetros, cuerpos y respuestas)
- La configuración base en `config/swagger.js` (info, versión, schemas reutilizables)

La spec se expone como JSON en `GET /api/swagger-spec`. La UI de Swagger se sirve como página estática en `public/api-docs/api-docs.html`, que carga la librería desde CDN y pide la spec a ese endpoint. Este enfoque evita los problemas de routing de Vercel con `swagger-ui-express`.

## Persistencia

Los datos se almacenan en un array en memoria dentro de `habito.service.js`. Esto significa que:

- Los datos **no sobreviven** al reinicio del servidor.
- En Vercel, cada función serverless puede tener su propia instancia en memoria.
- Para producción real sería necesario conectar una base de datos (SQLite, PostgreSQL, etc.).

Al arrancar, el servicio precarga un conjunto de hábitos de ejemplo para que la app no aparezca vacía en la primera visita.

## Pruebas de integración

Se han realizado pruebas manuales en seis fases sobre los endpoints, con un total de **49 casos cubiertos**. Los resultados completos están en [`docs/pruebas-integracion.md`](../docs/pruebas-integracion.md).

| Fase | Enfoque                                                                                       | Resultado                          |
| ---- | --------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1ª   | Endpoints básicos (GET, POST, DELETE). Se detectaron 2 errores y 5 comportamientos a revisar  | 2 errores corregidos               |
| 2ª   | Revalidación tras correcciones. Nuevos casos: validación de `tiempo`, tipos y duplicados       | Todos correctos                    |
| 3ª   | Nuevos endpoints: `PATCH /:id`, `PATCH /:id/completar`, `POST /reset`. Lógica de racha        | 1 error corregido                  |
| 4ª   | Nuevo endpoint `PATCH /completar-todos`. Se detectó el problema de orden de rutas en Express  | Problema de orden resuelto         |
| 5ª   | Revalidación de `PATCH /completar-todos` tras reestructurarlo para recibir array `ids`        | Todos correctos                    |
| 6ª   | Nuevo endpoint `DELETE /habitos` para vaciar la lista completa                                | Todos correctos                    |

### Correcciones aplicadas tras la 1ª fase

| Problema                                                 | Solución                                                                               |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| POST sin body devolvía 500                               | Guarda defensiva en el controlador que detecta body nulo y devuelve 400                |
| DELETE sin ID devolvía HTML                              | Middleware catch-all que captura rutas no encontradas y devuelve JSON 404              |
| Campos extra se guardaban                                | El servicio extrae solo `habito` y `tiempo` por nombre; el resto se descarta           |
| Espacios en blanco se aceptaban como válidos             | Validación con `.trim()` antes de crear el hábito                                      |
| Tipos incorrectos (número, booleano, array) se aceptaban | Validación con `typeof` para exigir string en `habito` y `tiempo`                      |
| `tiempo` no era obligatorio                              | Añadida validación equivalente a la de `habito` para el campo `tiempo`                 |
| Se podían crear hábitos duplicados                       | Comprobación en el servicio con `.some()` antes de insertar; devuelve 409 si ya existe |

### Correcciones aplicadas tras la 3ª fase

| Problema                                        | Solución                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| `PATCH /completar` sin body podía causar un 500 | Guarda defensiva añadida al controlador `complete`, igual que en `create` y `update` |
