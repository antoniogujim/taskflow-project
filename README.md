# Seguidor de Hábitos

Aplicación web para registrar y hacer seguimiento de hábitos diarios. Permite añadir, editar, eliminar, buscar y marcar hábitos como completados, con persistencia de datos en el navegador.

## Características

- Añadir hábitos con nombre y duración
- **Editar hábitos existentes**: cambia el nombre y la duración sin eliminar ni recrear el hábito (el `id`, `createdAt` y estado completado se preservan)
- Eliminar hábitos con confirmación en dos pasos (sin borrados accidentales)
- Marcar hábitos como completados con checkbox y feedback visual
- **Reset diario automático**: al abrir la app en un nuevo día, todos los hábitos vuelven a pendiente automáticamente
- **Un solo estado activo por tarjeta**: si una tarjeta está en modo edición o confirmación y se abre otra, la primera se cierra automáticamente
- **Barra de progreso diaria** en el panel lateral: muestra visualmente los hábitos completados sobre el total, con color progresivo (rojo → amarillo → verde) y contador numérico `X / Y`
- **Contador de racha por hábito**: badge a la derecha del nombre en escritorio y en móvil. El nombre siempre queda centrado en móvil mediante un grid de 3 columnas `[1fr auto 1fr]`, independientemente de si el checkbox o el badge son visibles
- Panel lateral de resumen con contadores de total, completados y pendientes, accesible mediante `aria-live`
- Filtro de búsqueda en tiempo real con debounce y mensaje de "sin resultados" cuando no hay coincidencias
- Al añadir o renombrar un hábito con búsqueda activa, el filtro se limpia automáticamente para que el hábito sea visible
- **Botón "Completar todos" / "Desmarcar todos"**: junto al buscador, completa o desmarca todos los hábitos visibles en un clic. Si hay una búsqueda activa, solo afecta a los resultados filtrados. Se deshabilita automáticamente cuando no hay hábitos visibles
- Validación de formulario con mensajes de error por campo, incluyendo detección de nombres duplicados
- Validación de longitud máxima en JS como segunda barrera (independiente del `maxlength` del HTML)
- Foco automático en el campo nombre tras añadir un hábito, para facilitar añadir varios seguidos
- Persistencia de datos mediante localStorage (incluye estado de completado y fecha del último reset)
- Recuperación robusta de datos corruptos en localStorage con avisos al usuario
- Hábitos de ejemplo al iniciar por primera vez
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
- Persistencia del modo oscuro entre sesiones
- Efectos hover con contraste garantizado en tarjetas y botones en ambos modos de color
- Sombras y esquinas redondeadas en tarjetas, inputs y botones
- Plantilla HTML (`<template>`) para renderizar hábitos desde el DOM
- Labels accesibles en todos los inputs, incluyendo label `sr-only` en el buscador para lectores de pantalla
- `aria-label` dinámico en la duración de cada hábito para que los lectores de pantalla anuncien el valor completo
- `role="list"` y `role="listitem"` para garantizar la semántica de lista en Safari con VoiceOver
- Identificadores únicos generados con `crypto.randomUUID()` para evitar colisiones
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
└── server/               # Backend Express (Fase B)
    ├── package.json      # Dependencias del backend
    ├── .env              # Variables de entorno (no incluido en git)
    └── src/
        └── config/
            └── env.js    # Carga y validación de variables de entorno
```

## Instalación

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

## Uso

1. Abre `index.html` en el navegador
2. Usa el formulario para añadir un nuevo hábito con su nombre y duración. Al añadirlo el foco vuelve al campo nombre automáticamente
3. Marca el checkbox de un hábito para marcarlo como completado
4. Pulsa "Editar" en una tarjeta para modificar su nombre o duración sin perder ningún otro dato
5. Pulsa "Eliminar hábito" para iniciar la eliminación — la tarjeta cambia a amarillo y aparecen los botones "Confirmar" y "Cancelar". Si no decides en 10 segundos, el hábito permanece
6. Usa el campo de búsqueda para filtrar hábitos por nombre. El botón "Completar todos" junto al buscador marca de golpe todos los visibles; si todos ya están completados, el botón cambia a "Desmarcar todos"
7. Consulta el panel lateral para ver el resumen de hábitos del día
8. Los hábitos se guardan automáticamente y persisten al recargar la página
9. Al abrir la app en un nuevo día, los hábitos se resetean automáticamente a pendiente
10. Usa el botón con icono de luna/sol para alternar entre tema claro y oscuro (la preferencia se guarda)

## Validación del formulario

El formulario valida los campos antes de añadir un hábito:

| Campo             | Regla                             |
| ----------------- | --------------------------------- |
| Nombre del hábito | Obligatorio, máximo 50 caracteres |
| Duración          | Obligatoria, máximo 30 caracteres |

- Si un campo está vacío al enviar, se muestra un mensaje de error debajo del campo.
- Si ambos campos están vacíos, ambos errores se muestran simultáneamente.
- El error de cada campo desaparece en cuanto el usuario empieza a escribir en él.
- Los campos solo aceptan texto con contenido real (espacios en blanco no son válidos).
- No se pueden añadir dos hábitos con el mismo nombre (la comparación ignora mayúsculas y minúsculas).
- El límite de caracteres se valida también en JS, independientemente del atributo `maxlength` del HTML.

## Sistema de edición de hábitos

Al pulsar "Editar" en una tarjeta:

1. El fondo de la tarjeta cambia a **azul** mediante una transición animada.
2. El nombre y la duración se convierten en campos de texto editables, pre-rellenos con los valores actuales.
3. Aparecen los botones **Guardar** y **Cancelar** en lugar de Editar/Eliminar.
4. Si no hay interacción durante **30 segundos**, la tarjeta vuelve sola a su estado normal (igual que cancelar).
5. Cualquier tecla en cualquiera de los dos campos reinicia el contador de inactividad.

Solo se modifican `nombre` y `duración`. El `id`, `createdAt` y estado `completado` del hábito permanecen intactos, lo que garantiza compatibilidad con futuras funciones como el contador de racha.

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

Al abrir la app, se comprueba si el día actual (en hora local del usuario) es distinto al del último uso registrado. Si lo es, todos los hábitos vuelven a `completado: false` antes de renderizarse, garantizando que cada día comienza con la lista en blanco.

- La fecha se calcula en **hora local** para evitar resets prematuros en zonas horarias con UTC+.
- La fecha del último reset se guarda en localStorage bajo la clave `ultimo-reset`.
- El reset ocurre antes del renderizado, por lo que el usuario nunca ve el estado del día anterior.

## Robustez de localStorage

La aplicación gestiona todos los posibles estados de los datos guardados:

| Estado de localStorage                        | Comportamiento                                                  |
| --------------------------------------------- | --------------------------------------------------------------- |
| No existe                                     | Primera visita: se cargan los hábitos de ejemplo                |
| Array vacío `[]`                              | El usuario eliminó todos sus hábitos: se respeta la lista vacía |
| JSON inválido                                 | Se eliminan los datos corruptos y se cargan los ejemplos        |
| JSON válido pero no es array                  | Se trata como corrupción total                                  |
| Array con todos los elementos inválidos       | Se trata como corrupción total                                  |
| Array con algunos elementos inválidos         | Se conservan los válidos y se informa de cuántos se perdieron   |
| `setItem` falla (modo privado, storage lleno) | Se avisa de que los datos no se guardarán durante la sesión     |

Los avisos se muestran en una barra desplegable bajo la cabecera, con un botón para cerrarla. Los errores recuperables se muestran en ámbar; los problemas persistentes de guardado, en rojo.

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
- JavaScript vanilla (manipulación del DOM, localStorage, template cloning, `crypto.randomUUID`)

### Backend
- Node.js con Express
- dotenv para gestión de variables de entorno
- nodemon para recarga automática en desarrollo

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
