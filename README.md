# Seguidor de Hábitos

Aplicación web para registrar y hacer seguimiento de hábitos diarios. Permite añadir, eliminar y buscar hábitos, con persistencia de datos en el navegador.

## Características

- Añadir hábitos con nombre y duración
- Eliminar hábitos individualmente
- Filtro de búsqueda en tiempo real
- Persistencia de datos mediante localStorage
- Hábitos de ejemplo al iniciar por primera vez
- Diseño responsive para móvil y escritorio
- Modo oscuro con botón de alternancia
- Transiciones y efectos hover/focus en botones e inputs

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

## Uso

1. Abre `index.html` en el navegador
2. Usa el formulario para añadir un nuevo hábito con su nombre y duración
3. Pulsa "Eliminar hábito" para borrar un hábito de la lista
4. Usa el campo de búsqueda para filtrar hábitos por nombre
5. Los hábitos se guardan automáticamente y persisten al recargar la página
6. Usa el botón "Modo oscuro" para alternar entre tema claro y oscuro

## Tecnologías

- HTML5
- Tailwind CSS v4 (utility classes, dark mode, tema personalizado)
- JavaScript (manipulación del DOM, localStorage)

## Proximas actualizaciones

- Se añadirán nuevas funcionalidades de seguimiento
