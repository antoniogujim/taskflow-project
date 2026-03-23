# Herramientas de Backend y API

Documentación sobre las herramientas más utilizadas en el desarrollo y gestión de APIs REST.

---

## 1. Axios

**¿Qué es?**
Axios es una librería de JavaScript basada en promesas que actúa como cliente HTTP. Funciona tanto en el navegador como en aplicaciones Node.js, lo que la hace especialmente versátil.

**¿Para qué se usa?**
Se usa para hacer solicitudes HTTP (GET, POST, PUT, DELETE, etc.) hacia servidores externos o APIs REST. En pocas palabras: es el mecanismo que usa tu aplicación para hablar con otras aplicaciones o servicios a través de la red.

**Casos de uso principales**
- Consumir APIs REST externas desde tu servidor o frontend
- Enviar y recibir datos en formato JSON
- Autenticarse contra servicios enviando tokens en cabeceras
- Interceptar solicitudes o respuestas para añadir lógica común (por ejemplo, renovar tokens automáticamente)
- Gestionar errores de red de forma centralizada

**¿Por qué se usa?**
Es más cómoda que la alternativa nativa (`fetch`) porque convierte automáticamente las respuestas a JSON, maneja errores HTTP de forma más intuitiva, permite configurar valores globales (como la URL base o cabeceras comunes) y soporta cancelación de solicitudes. Su sistema de interceptores ahorra mucho código repetitivo en proyectos medianos y grandes.

---

## 2. Postman

**¿Qué es?**
Postman es una aplicación de escritorio (y web) con interfaz gráfica diseñada para interactuar con APIs. Es la herramienta de referencia para probar, documentar y automatizar el testeo de APIs, con más de 20 millones de usuarios en el mundo.

**¿Para qué se usa?**
Permite enviar solicitudes HTTP a cualquier API y ver la respuesta en tiempo real, sin necesidad de escribir código. Es el equivalente a tener una "consola visual" para tu API.

**Casos de uso principales**
- Probar endpoints mientras los desarrollas (antes de conectar el frontend)
- Crear colecciones organizadas de solicitudes para toda una API
- Definir variables de entorno (por ejemplo, una URL diferente para desarrollo y producción)
- Escribir pruebas automatizadas que verifican que las respuestas son correctas
- Compartir colecciones con el equipo para que todos trabajen con los mismos parámetros
- Simular respuestas de APIs que aún no existen (mock servers)

**¿Por qué se usa?**
Es la forma más rápida de verificar que un endpoint funciona correctamente sin depender de que el frontend esté listo. Elimina la necesidad de escribir scripts de prueba manualmente para cada solicitud. Además, sus colecciones sirven como documentación viva de la API que todo el equipo puede consultar y usar.

---

## 3. Sentry

**¿Qué es?**
Sentry es una plataforma de monitoreo de errores y rendimiento para aplicaciones en producción. Es de código abierto, aunque ofrece un servicio en la nube. Su función principal es detectar, registrar y alertar sobre errores que ocurren en tu aplicación cuando usuarios reales la están usando.

**¿Para qué se usa?**
Se integra en tu aplicación mediante una configuración sencilla y, a partir de ese momento, captura automáticamente cualquier error o excepción que ocurra, registrando el contexto completo: el stack trace, el usuario afectado, el entorno, los datos de la solicitud, etc.

**Casos de uso principales**
- Detectar errores en producción en tiempo real (antes de que los usuarios los reporten)
- Ver exactamente en qué línea del código ocurrió un error y con qué datos
- Agrupar errores similares para identificar los más críticos
- Monitorear el rendimiento: tiempos de respuesta lentos, consultas lentas a base de datos
- Recibir alertas por email o Slack cuando ocurre un error nuevo
- Llevar un registro histórico de errores para medir la estabilidad de la aplicación

**¿Por qué se usa?**
Sin Sentry, los errores en producción solo se descubren cuando un usuario se queja. Con Sentry, el desarrollador sabe que algo falló antes de que el usuario lo note, con toda la información necesaria para reproducirlo y corregirlo. Transforma el manejo de errores de reactivo a proactivo.

---

## 4. Swagger (OpenAPI)

**¿Qué es?**
Swagger es el conjunto de herramientas más popular construido alrededor del estándar OpenAPI Specification (OAS). OpenAPI es un formato (un archivo YAML o JSON) que describe de forma estandarizada cómo funciona una API REST: sus endpoints, parámetros, formatos de respuesta, códigos de error y mecanismos de autenticación. Swagger UI convierte ese archivo en una página web interactiva.

**¿Para qué se usa?**
Se usa para documentar APIs de forma que cualquier persona (backend, frontend, QA) pueda entender exactamente cómo funciona la API sin tener que leer el código fuente. Además, la documentación generada es interactiva: permite hacer solicitudes reales desde el navegador.

**Casos de uso principales**
- Generar automáticamente documentación navegable desde el código
- Servir como contrato entre equipos de backend y frontend
- Generar clientes de API en distintos lenguajes automáticamente (con Swagger Codegen)
- Usar la especificación como base para pruebas automatizadas de contrato
- Facilitar el onboarding de nuevos desarrolladores al proyecto
- Publicar documentación pública para APIs que usan terceros

**¿Por qué se usa?**
La documentación escrita a mano siempre queda desactualizada. Con Swagger integrado en el código, la documentación se actualiza sola cada vez que cambia el código. Que sea interactiva (se puede probar directamente desde el navegador) la hace mucho más útil que un simple README.

---

## Resumen comparativo

| Herramienta | Categoría | Momento de uso |
|-------------|-----------|----------------|
| **Axios** | Cliente HTTP (librería de código) | Durante el desarrollo, en el código de la aplicación |
| **Postman** | Pruebas manuales y automatizadas | Durante el desarrollo y QA, fuera del código |
| **Sentry** | Monitoreo de errores en producción | Una vez la aplicación está desplegada y en uso real |
| **Swagger** | Documentación interactiva de APIs | Durante el desarrollo y como referencia permanente |

Las cuatro herramientas son complementarias y es común usarlas juntas en un proyecto profesional.
