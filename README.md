# Seguidor de Hábitos

Aplicación web para registrar y hacer seguimiento de hábitos diarios. Permite añadir, eliminar y buscar hábitos, con persistencia de datos en el navegador.

## Características

- Añadir hábitos con nombre y duración
- Eliminar hábitos individualmente
- Filtro de búsqueda en tiempo real
- Persistencia de datos mediante localStorage
- Hábitos de ejemplo al iniciar por primera vez
- Diseño responsive para móvil y escritorio
- Modo oscuro con botón de alternancia e iconos SVG (luna/sol)
- Persistencia del modo oscuro entre sesiones
- Transiciones y efectos hover/focus en botones e inputs
- Sombras y esquinas redondeadas en tarjetas, inputs y botones
- Plantilla HTML (`<template>`) para renderizar hábitos desde el DOM

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
3. Pulsa "Eliminar hábito" para borrar un hábito de la lista
4. Usa el campo de búsqueda para filtrar hábitos por nombre
5. Los hábitos se guardan automáticamente y persisten al recargar la página
6. Usa el botón con icono de luna/sol para alternar entre tema claro y oscuro (la preferencia se guarda)

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

- Panel de estadísticas en el aside (total, completadas, pendientes)
- Validación del formulario
- Labels accesibles en los inputs
