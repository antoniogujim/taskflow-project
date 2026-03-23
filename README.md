# Seguidor de Hábitos

Aplicación web para registrar y hacer seguimiento de hábitos diarios. Permite añadir, editar, eliminar, buscar y marcar hábitos como completados. El proyecto está compuesto por un frontend en HTML, CSS y JavaScript vanilla, y un backend REST API construido con Node.js y Express. El frontend se comunica con el backend a través de la Fetch API: todos los datos de hábitos se almacenan y gestionan en el servidor.

## Características

- Añadir hábitos con nombre y duración
- **Editar hábitos existentes**: cambia el nombre y la duración sin eliminar ni recrear el hábito (el `id`, `createdAt` y estado completado se preservan)
- Eliminar hábitos con confirmación en dos pasos (sin borrados accidentales)
- Marcar hábitos como completados con checkbox y feedback visual
- **Reset diario automático**: al abrir la app en un nuevo día, se llama al endpoint de reset del servidor antes de renderizar. Los hábitos vuelven a pendiente y las rachas rotas se limpian
- **Un solo estado activo por tarjeta**: si una tarjeta está en modo edición o confirmación y se abre otra, la primera se cierra automáticamente
- **Barra de progreso diaria** en el panel lateral: muestra visualmente los hábitos completados sobre el total, con color progresivo (rojo → amarillo → verde) y contador numérico `X / Y`
- **Contador de racha por hábito**: badge a la derecha del nombre en escritorio y en móvil. El nombre siempre queda centrado en móvil mediante un grid de 3 columnas `[1fr auto 1fr]`, independientemente de si el checkbox o el badge son visibles
- Panel lateral de resumen con contadores de total, completados y pendientes, accesible mediante `aria-live`
- Filtro de búsqueda en tiempo real con debounce y mensaje de "sin resultados" cuando no hay coincidencias
- Al añadir o renombrar un hábito con búsqueda activa, el filtro se limpia automáticamente para que el hábito sea visible
- **Botón "Completar todos" / "Desmarcar todos"**: junto al buscador, completa o desmarca todos los hábitos visibles en un clic. Si hay una búsqueda activa, solo afecta a los resultados filtrados. Se deshabilita automáticamente cuando no hay hábitos visibles
- **Selector de orden**: permite ordenar la lista por fecha de creación (reciente o antiguo primero) o por nombre (A→Z / Z→A). El orden se respeta al añadir nuevos hábitos y es compatible con el filtro de búsqueda: al cambiar el orden con una búsqueda activa, los hábitos se reordenan y el filtro se reaaplica automáticamente. Se deshabilita automáticamente cuando no hay hábitos visibles
- **Resaltado de hábito nuevo**: al añadir un hábito, su tarjeta aparece brevemente destacada en color lima (claro) o esmeralda (oscuro) y hace scroll hasta ella si es necesario. El color desaparece con una transición suave de 1 segundo
- **Estados de carga y error**: al iniciar la app se muestra "Cargando hábitos..." mientras se espera al servidor. Si el servidor no está disponible o falla cualquier operación, se muestra un banner de error rojo bajo la cabecera con un mensaje descriptivo
- Validación de formulario con mensajes de error por campo, sin salto de layout (el espacio para el error se reserva siempre con `visibility:hidden`)
- Los errores de validación incluyen detección de nombres duplicados (validada también en el servidor)
- Validación de longitud máxima en JS como segunda barrera (independiente del `maxlength` del HTML)
- Foco automático en el campo nombre tras añadir un hábito, para facilitar añadir varios seguidos
- Hábitos de ejemplo precargados en el servidor para la primera visita
- Persistencia de modo oscuro entre sesiones mediante localStorage
- Duración centrada horizontalmente en la tarjeta en escritorio mediante posicionamiento absoluto respecto al card
- Footer fijo al fondo de la página aunque el contenido sea escaso
- Formulario de nuevo hábito en fila (nombre + duración + botón) en la parte superior del contenido principal
- Cabecera de columnas (Hábito / Duración / Acciones) visible solo en escritorio, con línea separadora siempre visible
- En modo confirmación, el checkbox se oculta visualmente (mantiene espacio) y el label se desactiva para evitar cambios accidentales
- En móvil, los botones de acción se expanden a ancho completo (mitad cada uno)
- Diseño responsive para móvil y escritorio
- Modo oscuro con botón de alternancia e iconos SVG (luna/sol), sin parpadeo al cargar
- Iconos de modo oscuro gestionados con clases de Tailwind (`dark:hidden` / `hidden dark:block`) sin manipulación desde JS
- `aria-label` del botón de modo oscuro dinámico: describe la acción disponible ("Activar modo claro/oscuro")
- Efectos hover con contraste garantizado en tarjetas y botones en ambos modos de color
- Sombras y esquinas redondeadas en tarjetas, inputs y botones
- Plantilla HTML (`<template>`) para renderizar hábitos desde el DOM
- Labels accesibles en todos los inputs, incluyendo label `sr-only` en el buscador para lectores de pantalla
- `aria-label` dinámico en la duración de cada hábito para que los lectores de pantalla anuncien el valor completo
- `role="list"` y `role="listitem"` para garantizar la semántica de lista en Safari con VoiceOver
- Claves de localStorage centralizadas en constantes para evitar errores de tipeo silenciosos
- Favicon SVG con las iniciales "SH" en el color del tema
- Año del copyright en el footer generado dinámicamente

## Estructura del proyecto

```
taskflow-project/
├── index.html            # Estructura de la página
├── app.js                # Lógica de la aplicación
├── styles.css            # Estilos y variables de tema
├── favicon.svg           # Favicon con las iniciales SH
├── tailwind.config.js    # Configuración de Tailwind CSS
├── postcss.config.mjs    # Configuración de PostCSS
├── package.json          # Dependencias del frontend
├── dist/
│   └── styles.css        # CSS compilado (generado por Tailwind)
└── server/               # Backend Express
    ├── package.json      # Dependencias del backend
    ├── .env              # Variables de entorno (no incluido en git)
    ├── pruebas-integracion.md    # Registro de pruebas manuales de la API
    └── src/
        ├── index.js              # Entrada del servidor, middlewares y arranque
        ├── api/
        │   └── client.js         # Funciones fetch del frontend (una por endpoint)
        ├── config/
        │   └── env.js            # Carga y validación de variables de entorno
        ├── routes/
        │   └── habito.routes.js  # Conecta verbos HTTP con los controladores
        ├── controllers/
        │   └── habito.controller.js  # Gestiona peticiones y respuestas HTTP
        └── services/
            └── habito.service.js     # Lógica de negocio pura (sin HTTP)
```

## Instalación

### Backend

1. Entra en la carpeta del servidor:
    ```bash
    cd server
    ```
2. Instala las dependencias:
    ```bash
    npm install
    ```
3. Crea el archivo `.env` con las variables necesarias:
    ```
    PORT=3000
    ```
4. Arranca el servidor en modo desarrollo:
    ```bash
    npm run dev
    ```

### Frontend

1. Instala las dependencias:
    ```bash
    npm install
    ```
2. Compila los estilos:
    ```bash
    npm run build
    ```
    O en modo watch para desarrollo:
    ```bash
    npm run watch
    ```
3. Abre `index.html` con un servidor local (como Live Server en VS Code). El servidor backend debe estar corriendo antes de abrir el frontend.

## API Endpoints

El servidor corre por defecto en `http://localhost:3000`. Todos los endpoints están bajo el prefijo `/api/v1/habitos`.

| Método | Endpoint                          | Descripción                                        | Body (JSON)                                        | Respuesta           |
| ------ | --------------------------------- | -------------------------------------------------- | -------------------------------------------------- | ------------------- |
| GET    | `/api/v1/habitos`                 | Devuelve todos los hábitos                         | —                                                  | `200` array JSON    |
| POST   | `/api/v1/habitos`                 | Crea un nuevo hábito                               | `{ "habito": "Meditar", "tiempo": "10 minutos" }`  | `201` objeto creado |
| PATCH  | `/api/v1/habitos/:id`             | Edita el nombre y la duración de un hábito         | `{ "habito": "Leer", "tiempo": "30 minutos" }`     | `200` objeto actualizado |
| PATCH  | `/api/v1/habitos/:id/completar`   | Marca o desmarca un hábito y actualiza su racha    | `{ "completado": true }`                           | `200` objeto actualizado |
| POST   | `/api/v1/habitos/reset`           | Resetea todos los hábitos a `completado: false` y rompe rachas antiguas | —                         | `204` sin contenido |
| DELETE | `/api/v1/habitos/:id`             | Elimina el hábito con ese ID                       | —                                                  | `204` sin contenido |

### Códigos de error

| Código | Motivo                                      |
| ------ | ------------------------------------------- |
| `400`  | Body ausente o no válido; campos `habito` o `tiempo` faltantes, vacíos, con solo espacios, o de tipo incorrecto (se requiere string); `completado` no es booleano |
| `404`  | No existe ningún hábito con ese ID, o la ruta solicitada no existe |
| `409`  | Ya existe un hábito con el mismo nombre     |
| `500`  | Error interno no controlado del servidor    |

### Ejemplo de hábito

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

> **Nota:** los datos se almacenan en memoria. Al reiniciar el servidor, los hábitos vuelven a los ejemplos predefinidos.

## Pruebas de integración de la API

Se han realizado pruebas manuales en tres fases sobre los endpoints de la API, con un total de 35 casos cubiertos.

La primera fase detectó 2 errores y 5 comportamientos a revisar. La segunda fase aplicó las correcciones y añadió casos nuevos derivados de los cambios (validación de `tiempo`, tipos de dato, espacios en blanco y duplicados). La tercera fase cubrió los nuevos endpoints de editar (`PATCH /:id`), completar (`PATCH /:id/completar`) y reset (`POST /reset`), incluyendo la lógica de racha. Todos los casos de las tres fases resultaron correctos.

Los resultados están documentados en [`server/Pruebas-integracion.md`](server/Pruebas-integracion.md).

### Correcciones aplicadas tras la 1ª fase

| Problema | Solución |
| -------- | -------- |
| POST sin body devolvía 500 | Guarda defensiva en el controlador que detecta body nulo y devuelve 400 |
| DELETE sin ID devolvía HTML | Middleware catch-all que captura rutas no encontradas y devuelve JSON 404 |
| Campos extra se guardaban | El servicio extrae solo `habito` y `tiempo` por nombre; el resto se descarta |
| Espacios en blanco se aceptaban como válidos | Validación con `.trim()` antes de crear el hábito |
| Tipos incorrectos (número, booleano, array) se aceptaban | Validación con `typeof` para exigir string en `habito` y `tiempo` |
| `tiempo` no era obligatorio | Añadida validación equivalente a la de `habito` para el campo `tiempo` |
| Se podían crear hábitos duplicados | Comprobación en el servicio con `.some()` antes de insertar; devuelve 409 si ya existe |

### Correcciones aplicadas tras la 3ª fase

| Problema | Solución |
| -------- | -------- |
| `PATCH /completar` sin body podía causar un 500 | Guarda defensiva añadida al controlador `complete`, igual que en `create` y `update` |

## Uso

1. Arranca el servidor backend (`npm run dev` dentro de `/server`)
2. Abre `index.html` con un servidor local. La app carga los hábitos desde el servidor al iniciar
3. Usa el formulario para añadir un nuevo hábito con su nombre y duración. Al añadirlo el foco vuelve al campo nombre automáticamente
4. Marca el checkbox de un hábito para marcarlo como completado
5. Pulsa "Editar" en una tarjeta para modificar su nombre o duración sin perder ningún otro dato
6. Pulsa "Eliminar hábito" para iniciar la eliminación — la tarjeta cambia a amarillo y aparecen los botones "Confirmar" y "Cancelar". Si no decides en 10 segundos, el hábito permanece
7. Usa el campo de búsqueda para filtrar hábitos por nombre. El botón "Completar todos" junto al buscador marca de golpe todos los visibles; si todos ya están completados, el botón cambia a "Desmarcar todos"
8. Usa el selector de orden para reordenar la lista por fecha o por nombre. Los nuevos hábitos se insertan respetando el orden activo
9. Consulta el panel lateral para ver el resumen de hábitos del día
10. Al abrir la app en un nuevo día, los hábitos se resetean automáticamente a pendiente
11. Usa el botón con icono de luna/sol para alternar entre tema claro y oscuro (la preferencia se guarda)

## Validación del formulario

El formulario valida los campos antes de añadir un hábito:

| Campo             | Regla                             |
| ----------------- | --------------------------------- |
| Nombre del hábito | Obligatorio, máximo 50 caracteres |
| Duración          | Obligatoria, máximo 30 caracteres |

- Si un campo está vacío al enviar, se muestra un mensaje de error debajo del campo sin desplazar el resto del contenido (el espacio está siempre reservado).
- Si ambos campos están vacíos, ambos errores se muestran simultáneamente.
- El error de cada campo desaparece en cuanto el usuario empieza a escribir en él.
- Los campos solo aceptan texto con contenido real (espacios en blanco no son válidos).
- No se pueden añadir dos hábitos con el mismo nombre (comprobado en el servidor).
- El límite de caracteres se valida también en JS, independientemente del atributo `maxlength` del HTML.

## Sistema de edición de hábitos

Al pulsar "Editar" en una tarjeta:

1. El fondo de la tarjeta cambia a **azul** mediante una transición animada.
2. El nombre y la duración se convierten en campos de texto editables, pre-rellenos con los valores actuales.
3. Aparecen los botones **Guardar** y **Cancelar** en lugar de Editar/Eliminar.
4. Si no hay interacción durante **30 segundos**, la tarjeta vuelve sola a su estado normal (igual que cancelar).
5. Cualquier tecla en cualquiera de los dos campos reinicia el contador de inactividad.

Solo se modifican `nombre` y `duración`. El `id`, `createdAt` y estado `completado` del hábito permanecen intactos, lo que garantiza compatibilidad con el contador de racha.

La validación al guardar sigue las mismas reglas que el formulario de creación, con una excepción: el check de duplicados excluye el propio hábito, por lo que guardar el mismo nombre sin cambios no produce error.

## Sistema de eliminación con confirmación

Al pulsar "Eliminar hábito" la tarjeta no se borra directamente. En su lugar:

1. El fondo de la tarjeta cambia a **amarillo** mediante una transición animada.
2. Los botones de acción cambian con transición de opacidad y aparecen dos botones nuevos en fila:
    - **Confirmar** (rojo): borra el hábito de forma definitiva.
    - **Cancelar** (gris): descarta la acción y restaura la tarjeta.
3. Si el usuario no pulsa ninguno en **10 segundos**, la tarjeta vuelve sola a su estado normal.

El nombre y la duración del hábito permanecen visibles durante todo el proceso para que el usuario pueda verificar que está eliminando el hábito correcto.

## Estados de tarjeta

Cada tarjeta puede estar en uno de tres estados, visualmente distintos y mutuamente excluyentes. Al activar uno, cualquier otro estado abierto en otra tarjeta se cierra automáticamente.

| Estado        | Color de tarjeta              | Descripción                              |
| ------------- | ----------------------------- | ---------------------------------------- |
| Normal        | Verde (`bg-base-claro`)       | Estado por defecto                       |
| Edición       | Azul (`bg-blue-100`)          | Editando nombre o duración               |
| Confirmación  | Amarillo (`bg-yellow-100`)    | Confirmando eliminación                  |

## Reset diario automático

Al abrir la app, se comprueba si el día actual (en hora local del usuario) es distinto al del último reset registrado. Si lo es, se llama al endpoint `POST /api/v1/habitos/reset` antes de renderizar la lista.

- El reset pone todos los hábitos a `completado: false` y limpia las rachas que llevan más de un día sin completarse.
- La fecha del último reset se guarda en localStorage bajo la clave `ultimo-reset` para evitar llamadas innecesarias al servidor en cada recarga del mismo día.
- La fecha se calcula en **hora local** para evitar resets prematuros en zonas horarias con UTC+.
- El reset ocurre antes del renderizado, por lo que el usuario nunca ve el estado del día anterior.

## Sistema de colores

### Tarjetas en estado normal (hover)

| Modo   | Tarjeta (default → hover)      | Botón (default → hover)        |
| ------ | ------------------------------ | ------------------------------ |
| Claro  | `base-claro` → `base`          | `base-oscuro` → `dark-tarjeta` |
| Oscuro | `dark-tarjeta` → `base-oscuro` | `base` → `base-claro`          |

El botón siempre contrasta con la tarjeta independientemente del estado de hover de cada elemento.

### Tarjetas en modo edición

| Modo   | Tarjeta            | Borde               |
| ------ | ------------------ | ------------------- |
| Claro  | `bg-blue-100`      | `border-blue-400`   |
| Oscuro | `bg-blue-900/20`   | `border-blue-600`   |

### Tarjetas en modo confirmación

| Modo   | Tarjeta            | Borde               |
| ------ | ------------------ | ------------------- |
| Claro  | `bg-yellow-100`    | `border-yellow-400` |
| Oscuro | `bg-yellow-900/20` | `border-yellow-600` |

Los efectos hover de color verde se desactivan mientras la tarjeta está en modo edición o confirmación para no generar confusión visual.

## Tecnologías

### Frontend
- HTML5 semántico (`header`, `main`, `aside`, `footer`, `template`)
- Tailwind CSS v4 (utility classes, dark mode, tema personalizado con variables `@theme`)
- JavaScript vanilla (manipulación del DOM, Fetch API, template cloning)

### Backend
- Node.js con Express
- dotenv para gestión de variables de entorno
- nodemon para recarga automática en desarrollo
- Middleware global de manejo de errores: captura cualquier excepción no controlada, mapea `NOT_FOUND` a `404`, `DUPLICATE` a `409`, y cualquier otro fallo a `500` con mensaje genérico (sin filtrar detalles técnicos al cliente)
- Middleware catch-all: captura rutas no reconocidas por Express y devuelve JSON `404` en lugar de la página HTML de error por defecto

## Variables de tema (styles.css)

| Variable                  | Valor     | Uso                                       |
| ------------------------- | --------- | ----------------------------------------- |
| `--color-base`            | `#537b50` | Color principal verde                     |
| `--color-base-oscuro`     | `#3d5c3a` | Verde oscuro                              |
| `--color-base-claro`      | `#6a9e66` | Verde claro (tarjetas)                    |
| `--color-fondo`           | `#ced6c9` | Fondo general claro                       |
| `--color-fondo-claro`     | `#dfe7d8` | Fondo aside claro                         |
| `--color-input`           | `#d6d3d1` | Fondo de inputs                           |
| `--color-dark-superficie` | `#374151` | Superficie modo oscuro (inputs)           |
| `--color-dark-fondo`      | `#1f2937` | Fondo modo oscuro (header, aside, footer) |
| `--color-dark-tarjeta`    | `#2d3d2b` | Fondo tarjetas modo oscuro                |

## Próximas actualizaciones

| Mejora | Motivo |
| ------ | ------ |
| Endpoint `PATCH /api/v1/habitos/completar-todos` | El botón "Completar todos" actualmente dispara una petición al servidor por cada hábito visible. Con listas grandes esto no escala. La solución es un endpoint que marque o desmarque todos en una sola llamada. |
| Persistencia real de datos | Los hábitos se almacenan en memoria. Conectar una base de datos (SQLite, PostgreSQL, etc.) permitiría que los datos sobrevivan al reinicio del servidor. |
