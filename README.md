# Seguidor de Hábitos

Aplicación web para registrar y hacer seguimiento de hábitos diarios. Permite añadir, eliminar, buscar y marcar hábitos como completados, con persistencia de datos en el navegador.

## Características

- Añadir hábitos con nombre y duración
- Eliminar hábitos individualmente
- Marcar hábitos como completados con checkbox y feedback visual
- Panel lateral de resumen con contadores de total, completados y pendientes
- Filtro de búsqueda en tiempo real
- Persistencia de datos mediante localStorage (incluye estado de completado)
- Recuperación robusta de datos corruptos en localStorage con avisos al usuario
- Hábitos de ejemplo al iniciar por primera vez
- Diseño responsive para móvil y escritorio
- Modo oscuro con botón de alternancia e iconos SVG (luna/sol)
- Persistencia del modo oscuro entre sesiones
- Transiciones y efectos hover/focus en botones e inputs
- Sombras y esquinas redondeadas en tarjetas, inputs y botones
- Plantilla HTML (`<template>`) para renderizar hábitos desde el DOM
- Labels accesibles en inputs y checkbox del formulario
- Validación de formulario con mensajes de error por campo

## Estructura del proyecto

```
taskflow-project/
├── index.html            # Estructura de la página
├── styles.css            # Estilos y variables de tema
├── app.js                # Lógica de la aplicación
├── tailwind.config.js    # Configuración de Tailwind CSS
├── postcss.config.mjs    # Configuración de PostCSS
├── package.json          # Dependencias del proyecto
└── dist/
    └── styles.css        # CSS compilado (generado por Tailwind)
```

## Instalación

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

## Uso

1. Abre `index.html` en el navegador
2. Usa el formulario para añadir un nuevo hábito con su nombre y duración
3. Marca el checkbox de un hábito para marcarlo como completado
4. Pulsa "Eliminar hábito" para borrar un hábito de la lista
5. Usa el campo de búsqueda para filtrar hábitos por nombre
6. Consulta el panel lateral para ver el resumen de hábitos del día
7. Los hábitos se guardan automáticamente y persisten al recargar la página
8. Usa el botón con icono de luna/sol para alternar entre tema claro y oscuro (la preferencia se guarda)

## Validación del formulario

El formulario valida los campos antes de añadir un hábito:

| Campo | Regla |
|---|---|
| Nombre del hábito | Obligatorio, máximo 50 caracteres |
| Duración | Obligatoria, máximo 30 caracteres |

- Si un campo está vacío al enviar, se muestra un mensaje de error debajo del campo.
- Si ambos campos están vacíos, ambos errores se muestran simultáneamente.
- El error de cada campo desaparece en cuanto el usuario empieza a escribir en él.
- Los campos solo aceptan texto con contenido real (espacios en blanco no son válidos).

## Robustez de localStorage

La aplicación gestiona todos los posibles estados de los datos guardados:

| Estado de localStorage | Comportamiento |
|---|---|
| No existe | Primera visita: se cargan los hábitos de ejemplo |
| Array vacío `[]` | El usuario eliminó todos sus hábitos: se respeta la lista vacía |
| JSON inválido | Se eliminan los datos corruptos y se cargan los ejemplos |
| JSON válido pero no es array | Se trata como corrupción total |
| Array con todos los elementos inválidos | Se trata como corrupción total |
| Array con algunos elementos inválidos | Se conservan los válidos y se informa de cuántos se perdieron |
| `setItem` falla (modo privado, storage lleno) | Se avisa de que los datos no se guardarán durante la sesión |

Los avisos se muestran en una barra desplegable bajo la cabecera, con un botón para cerrarla. Los errores recuperables se muestran en ámbar; los problemas persistentes de guardado, en rojo.

## Tecnologías

- HTML5 semántico (`header`, `main`, `aside`, `footer`, `template`)
- Tailwind CSS v4 (utility classes, dark mode, tema personalizado con variables `@theme`)
- JavaScript vanilla (manipulación del DOM, localStorage, template cloning)

## Variables de tema (styles.css)

| Variable | Valor | Uso |
|---|---|---|
| `--color-base` | `#537b50` | Color principal verde |
| `--color-base-oscuro` | `#3d5c3a` | Verde oscuro (hover) |
| `--color-base-claro` | `#6a9e66` | Verde claro (tarjetas) |
| `--color-fondo` | `#ced6c9` | Fondo general claro |
| `--color-fondo-claro` | `#dfe7d8` | Fondo aside claro |
| `--color-input` | `#d6d3d1` | Fondo de inputs |
| `--color-dark-superficie` | `#374151` | Superficie modo oscuro (inputs) |
| `--color-dark-fondo` | `#1f2937` | Fondo modo oscuro (header, aside, footer) |
| `--color-dark-tarjeta` | `#2d3d2b` | Fondo tarjetas modo oscuro |

## Próximas actualizaciones

- Reset diario del estado de completado
