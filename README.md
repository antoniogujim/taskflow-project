# Seguidor de Hábitos

Aplicación web para registrar y hacer seguimiento de hábitos diarios. Permite añadir, editar, eliminar, buscar y marcar hábitos como completados. El proyecto está compuesto por un frontend en HTML, CSS y JavaScript vanilla, y un backend REST API construido con Node.js y Express. El frontend se comunica con el backend a través de la Fetch API: todos los datos de hábitos se almacenan y gestionan en el servidor.

**Demo en producción:** https://taskflow-project-rust.vercel.app

## Prerrequisitos

- [Node.js](https://nodejs.org/) v22 o superior
- npm (incluido con Node.js)

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
- **Botón "Completar todos" / "Desmarcar todos"**: junto al buscador, completa o desmarca en un clic los hábitos visibles. Sin búsqueda activa el texto es "Completar/Desmarcar todos"; con búsqueda activa cambia a "Completar/Desmarcar buscados". Se deshabilita automáticamente cuando no hay hábitos visibles
- **Botón "Vaciar lista"**: en el panel lateral, elimina todos los hábitos de forma permanente. Abre un modal de confirmación antes de ejecutar la acción. Se deshabilita automáticamente cuando la lista está vacía
- **Selector de orden**: permite ordenar la lista por fecha de creación (reciente o antiguo primero) o por nombre (A→Z / Z→A). Compatible con el filtro de búsqueda. Se deshabilita automáticamente cuando no hay hábitos visibles
- **Resaltado de hábito nuevo**: al añadir un hábito, su tarjeta aparece brevemente destacada y hace scroll hasta ella si es necesario
- **Estados de red en UI**: todas las operaciones tienen feedback visual mientras la petición está en curso. Si el servidor no está disponible, se muestra un banner de error rojo bajo la cabecera
- **Banner de reset diario**: al detectar que es un día nuevo, se muestra un banner verde informativo que se cierra automáticamente tras 6 segundos
- Validación de formulario con mensajes de error por campo, sin salto de layout
- Detección de nombres duplicados (validada también en el servidor)
- Foco automático en el campo nombre tras añadir un hábito
- Hábitos de ejemplo precargados en el servidor para la primera visita
- Persistencia de modo oscuro entre sesiones mediante localStorage
- Diseño responsive para móvil y escritorio
- Modo oscuro con botón de alternancia e iconos SVG (luna/sol), sin parpadeo al cargar
- Efectos hover con contraste garantizado en tarjetas y botones en ambos modos de color
- Plantilla HTML (`<template>`) para renderizar hábitos desde el DOM
- **Accesibilidad**: navegación completa por teclado, soporte para lectores de pantalla con anuncios ARIA en todas las acciones (añadir, editar, eliminar, completar, buscar, ordenar), gestión de foco en modales y tras eliminar hábitos, botones ocultos bloqueados al tabulador, `aria-busy` durante peticiones al servidor y semántica HTML correcta en todos los elementos interactivos
- Favicon SVG con las iniciales "SH" en el color del tema

## Estructura del proyecto

```
taskflow-project/
├── public/               # Assets estáticos servidos por CDN en Vercel
│   ├── index.html        # Estructura de la página
│   ├── app.js            # Lógica de la aplicación
│   ├── client.js         # Funciones fetch del frontend (una por endpoint)
│   ├── favicon.svg       # Favicon con las iniciales SH
│   ├── api-docs/
│   │   └── api-docs.html # Swagger UI estático
│   └── dist/
│       └── styles.css    # CSS compilado (generado por Tailwind)
├── api/                  # Backend Express — ver api/README.md para documentación completa
├── styles.css            # Estilos fuente de Tailwind CSS
├── tailwind.config.js    # Configuración de Tailwind CSS
├── postcss.config.mjs    # Configuración de PostCSS
├── package.json          # Dependencias unificadas (frontend y backend)
├── vercel.json           # Configuración de builds y rewrites para Vercel
└── .env                  # Variables de entorno (no incluido en git)
```

> **Nota — Cambio de estructura (marzo 2026):** el proyecto se ha migrado a la estructura recomendada por la [documentación oficial de Vercel para Express](https://vercel.com/docs/frameworks/backend/express). Anteriormente el backend vivía en una carpeta `server/` con su propio `package.json`, y los archivos estáticos del frontend estaban en la raíz. Con el nuevo enfoque: los assets estáticos se sirven desde `public/`, el servidor Express se coloca en `api/` (detectada automáticamente por Vercel como funciones serverless), y todas las dependencias se unifican en un único `package.json` en la raíz.

## Scripts disponibles

| Script            | Comando           | Descripción                                                  |
| ----------------- | ----------------- | ------------------------------------------------------------ |
| `dev`             | `npm run dev`     | Arranca el servidor con nodemon (recarga automática)         |
| `build`           | `npm run build`   | Compila los estilos de Tailwind CSS a `public/dist/styles.css` |
| `watch`           | `npm run watch`   | Compila los estilos en modo watch (se recompilan al guardar) |

## Instalación

1. Instala las dependencias:
    ```bash
    npm install
    ```
2. Crea el archivo `.env` en la raíz con las variables necesarias:
    ```
    PORT=3000
    ```
3. Arranca el servidor en modo desarrollo:
    ```bash
    npm run dev
    ```
4. Compila los estilos (o usa modo watch para desarrollo):
    ```bash
    npm run build
    npm run watch
    ```
5. Abre `public/index.html` con un servidor local (como Live Server en VS Code). El servidor backend debe estar corriendo antes de abrir el frontend.

## Uso

1. Arranca el servidor backend (`npm run dev` desde la raíz del proyecto)
2. Abre `public/index.html` con un servidor local. La app carga los hábitos desde el servidor al iniciar
3. Usa el formulario para añadir un nuevo hábito con su nombre y duración
4. Marca el checkbox de un hábito para marcarlo como completado
5. Pulsa "Editar" en una tarjeta para modificar su nombre o duración sin perder ningún otro dato
6. Pulsa "Eliminar hábito" para iniciar la eliminación — la tarjeta cambia a amarillo y aparecen los botones "Confirmar" y "Cancelar". Si no decides en 10 segundos, el hábito permanece
7. Usa el campo de búsqueda para filtrar hábitos por nombre. El botón junto al buscador marca de golpe todos los visibles
8. Usa el botón "Vaciar lista" en el panel lateral para eliminar todos los hábitos. Se pedirá confirmación mediante un modal
9. Usa el selector de orden para reordenar la lista por fecha o por nombre
10. Consulta el panel lateral para ver el resumen de hábitos del día
11. Al abrir la app en un nuevo día, los hábitos se resetean automáticamente a pendiente
12. Usa el botón con icono de luna/sol para alternar entre tema claro y oscuro

## Validación del formulario

| Campo             | Regla                             |
| ----------------- | --------------------------------- |
| Nombre del hábito | Obligatorio, máximo 50 caracteres |
| Duración          | Obligatoria, máximo 30 caracteres |

- Los errores se muestran por campo sin desplazar el layout (el espacio está siempre reservado).
- El error de cada campo desaparece en cuanto el usuario empieza a escribir en él.
- Los campos solo aceptan texto con contenido real (espacios en blanco no son válidos).
- No se pueden añadir dos hábitos con el mismo nombre (comprobado en el servidor).

## Sistema de edición de hábitos

Al pulsar "Editar" en una tarjeta:

1. El fondo de la tarjeta cambia a **azul** mediante una transición animada.
2. El nombre y la duración se convierten en campos de texto editables, pre-rellenos con los valores actuales.
3. Aparecen los botones **Guardar** y **Cancelar** en lugar de Editar/Eliminar.
4. Si no hay interacción durante **30 segundos**, la tarjeta vuelve sola a su estado normal.

Solo se modifican `nombre` y `duración`. El `id`, `createdAt` y estado `completado` permanecen intactos.

## Sistema de eliminación con confirmación

Al pulsar "Eliminar hábito":

1. El fondo de la tarjeta cambia a **amarillo**.
2. Aparecen los botones **Confirmar** (rojo) y **Cancelar** (gris).
3. Si el usuario no pulsa ninguno en **10 segundos**, la tarjeta vuelve sola a su estado normal.

## Estados de tarjeta

| Estado       | Color de tarjeta           | Descripción                |
| ------------ | -------------------------- | -------------------------- |
| Normal       | Verde (`bg-base-claro`)    | Estado por defecto         |
| Edición      | Azul (`bg-blue-100`)       | Editando nombre o duración |
| Confirmación | Amarillo (`bg-yellow-100`) | Confirmando eliminación    |

Al activar un estado en una tarjeta, cualquier otro estado abierto en otra tarjeta se cierra automáticamente.

## Reset diario automático

Al abrir la app se comprueba si el día actual es distinto al del último reset. Si lo es, se llama al endpoint `POST /api/v1/habitos/reset` antes de renderizar.

- Pone todos los hábitos a `completado: false` y limpia las rachas rotas.
- La fecha del último reset se guarda en localStorage para evitar llamadas innecesarias.
- La fecha se calcula en **hora local** para evitar resets prematuros en zonas horarias con UTC+.
- Tras el reset se muestra un banner verde que se cierra solo tras 6 segundos.

## Sistema de colores

### Tarjetas en estado normal (hover)

| Modo   | Tarjeta (default → hover)      | Botón (default → hover)        |
| ------ | ------------------------------ | ------------------------------ |
| Claro  | `base-claro` → `base`          | `base-oscuro` → `dark-tarjeta` |
| Oscuro | `dark-tarjeta` → `base-oscuro` | `base` → `base-claro`          |

### Tarjetas en modo edición

| Modo   | Tarjeta          | Borde             |
| ------ | ---------------- | ----------------- |
| Claro  | `bg-blue-100`    | `border-blue-400` |
| Oscuro | `bg-blue-900/20` | `border-blue-600` |

### Tarjetas en modo confirmación

| Modo   | Tarjeta            | Borde               |
| ------ | ------------------ | ------------------- |
| Claro  | `bg-yellow-100`    | `border-yellow-400` |
| Oscuro | `bg-yellow-900/20` | `border-yellow-600` |

## Tecnologías

### Frontend

- HTML5 semántico (`header`, `main`, `aside`, `footer`, `template`)
- Tailwind CSS v4 (utility classes, dark mode, tema personalizado con variables `@theme`)
- JavaScript vanilla (manipulación del DOM, Fetch API, template cloning)

### Backend

El backend está construido con **Node.js** y **Express**, y utiliza las siguientes librerías:

- **dotenv** — carga las variables de entorno desde el archivo `.env`
- **cors** — habilita las peticiones cross-origin para que el frontend pueda comunicarse con el backend
- **nodemon** — recarga automática del servidor en desarrollo al detectar cambios
- **swagger-jsdoc** — genera la especificación OpenAPI a partir de comentarios JSDoc en el código

La documentación completa del backend (arquitectura, endpoints, pruebas de integración) está en [`api/README.md`](api/README.md).

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

| Mejora                     | Motivo                                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persistencia real de datos | Los hábitos se almacenan en memoria. Conectar una base de datos (SQLite, PostgreSQL, etc.) permitiría que los datos sobrevivan al reinicio del servidor. |
