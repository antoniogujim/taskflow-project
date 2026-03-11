# Prompt Engineering

---

## Notas adicionales al estudio de prompts

A lo largo de este estudio he utilizado la propia IA como punto de partida para generar prompts base por categoría. El objetivo era experimentar con ejemplos sólidos y bien estructurados, evitando los sesgos que introduce el desconocimiento inicial de cada técnica.

Al trabajar con cada prompt, he analizado su estructura: qué elementos lo componen, por qué funcionan, y qué variaciones ofrece para ajustar la petición. Este proceso ha resultado tan formativo como los propios resultados obtenidos.

Adicionalmente, he solicitado a la IA que mejorara la redacción de este documento, lo que ha permitido elevar el nivel de profesionalidad del texto y aplicar estructuras de navegación en Markdown que desconocía.

Cada ejemplo sigue la misma estructura: el **prompt utilizado**, la **respuesta obtenida directamente de la IA** sin editar, y las **conclusiones** extraídas sobre por qué el prompt funciona y qué técnica aplica.

Es importante aclarar que ninguna de las sugerencias emitidas por la IA ha sido implementada en el código. Este documento representa una fase de aprendizaje y exploración: su propósito es desarrollar criterio sobre cómo formular peticiones efectivas a un modelo de lenguaje. Los cambios y mejoras identificados se tendrán en cuenta y se aplicarán progresivamente en la aplicación a través de futuros commits.

---

## Sección 1 — Experimenta con prompts donde definas un rol

---

### Ejemplo 1

#### Prompt

> Eres un revisor de código en un equipo de alto rendimiento. Tu trabajo es ser crítico
> pero constructivo. Analiza este código como si fuera un PR real: comenta sobre legibilidad,
> mantenibilidad, edge cases no manejados y posibles vulnerabilidades de seguridad.

---

#### Respuesta obtenida

**Code Review: app.js + index.html**

##### Bugs / Edge Cases

**1. IDs duplicados en los hábitos por defecto** (`app.js:12-16`)

```js
{ id: Date.now() },
{ id: Date.now() + 1 },
```

`Date.now()` se llama en la misma ejecución síncrona, por lo que todos los offsets son arbitrarios y frágiles. Si el código se refactoriza y se añade un hábito más, el offset puede colisionar con uno generado después por `Date.now()` en el submit handler. Usar un contador incremental o `crypto.randomUUID()` es más robusto.

**2. No hay validación de inputs en el formulario** (`app.js:48-49`)

```js
let nombre = document.getElementById("nombre_habito").value;
let duracion = document.getElementById("duracion_habito").value;
```

Se permite añadir hábitos con nombre vacío, solo espacios, o con nombre extremadamente largo. El resultado: entradas vacías en la lista y en localStorage. El campo nombre debería tener al menos un `trim()` y comprobación de longitud mínima.

**3. `localStorage` puede fallar silenciosamente** (`app.js:34`, `app.js:57`)

En modo privado de Safari, o cuando el almacenamiento está lleno, `localStorage.setItem` lanza una excepción `QuotaExceededError`. No hay ningún `try/catch`. El usuario podría perder datos sin ningún mensaje de error.

---

##### Legibilidad / Mantenibilidad

**4. Mezcla de `let` y `const` sin criterio claro** (`app.js:48-50`)

`nombre`, `duracion` e `id` nunca se reasignan dentro del handler. Deberían ser `const`. Usar `let` donde no se necesita dificulta saber qué variables cambian.

**5. Selectores duplicados y query al DOM repetida** (`app.js:58-59`)

```js
document.getElementById("nombre_habito").value = "";
document.getElementById("duracion_habito").value = "";
```

Estos elementos ya están referenciados implícitamente en las líneas 48-49. Deberían guardarse en variables al inicio del handler (o como constantes al nivel de módulo) en lugar de volver a hacer la query.

**6. `document.querySelector("ul")` es demasiado genérico** (`app.js:36`)

Si en el futuro se añade otro `<ul>` al HTML (ej. en el aside de resumen), todos los hábitos se añadirán al primer `ul` encontrado. Debería usarse un ID o selector más específico, como `document.getElementById("lista-habitos")`.

**7. Nombre de propiedad inconsistente** (`app.js:27`, `app.js:51`)

El objeto hábito usa la clave `habito` para el nombre (`habito.habito`), lo que es redundante y confuso. Sería más claro nombrarlo `nombre` para diferenciarlo del objeto en sí.

---

##### Seguridad

**8. No hay XSS — esto está bien** (`app.js:27-28`)

Se usa `.textContent` en lugar de `.innerHTML` para insertar datos del usuario. Correcto.

**9. `localStorage` como única fuente de verdad sin sanitización**

Los datos en localStorage pueden ser manipulados directamente por el usuario desde DevTools. Si en el futuro se parsea el contenido de `habito` o `tiempo` de forma distinta (ej. `innerHTML`, `eval`, plantillas), esto se convierte en un vector XSS almacenado. No es un problema ahora, pero es una deuda técnica a tener en cuenta si la app escala.

---

##### HTML

**10. Campos del formulario sin `required` ni `maxlength`** (`index.html:41-52`)

El HTML no tiene ninguna restricción de validación nativa. Añadir `required` y `maxlength` daría una primera capa de defensa, complementaria a la validación en JS.

**11. El aside de resumen está vacío** (`index.html:62-65`)

```html
<p>Aqui mostraremos el porcentaje de habitos diarios cumplidos</p>
```

Placeholder sin implementar. Si esto es un PR real, debería estar en un issue/ticket separado o marcado con un `TODO`, no en producción.

---

##### Resumen ejecutivo

| Severidad | Problema                                        |
|-----------|-------------------------------------------------|
| Media     | Sin validación de inputs (bug silencioso)       |
| Media     | `localStorage.setItem` sin manejo de excepciones |
| Baja      | IDs con `Date.now()` frágiles                   |
| Baja      | `querySelector("ul")` demasiado genérico        |
| Baja      | `let` donde debería ser `const`                 |
| Info      | Propiedad `habito.habito` confusa               |
| Info      | Aside vacío en producción                       |

El código es funcional y tiene buenas prácticas base (uso de `<template>`, `textContent` en lugar de `innerHTML`, JSDoc). Los problemas principales son de robustez, no de arquitectura. Con los puntos 2 y 3 resueltos, este PR estaría listo para merge.

---

#### Conclusiones

##### Sobre el rol asignado en el prompt

Asignar un rol específico ("revisor de código en un equipo de alto rendimiento") guía el tono y la profundidad de la respuesta. El modelo adopta una perspectiva profesional y estructurada, distinta a la que daría con un prompt genérico como "revisa este código".

##### Sobre las categorías explícitas

Pedir explícitamente que se analice legibilidad, mantenibilidad, edge cases y seguridad hace que la respuesta cubra exactamente esas dimensiones, sin omitir ninguna. Sin esa especificación, el modelo podría centrarse solo en lo más obvio.

##### Sobre la calidad del output

La respuesta devuelve un formato accionable: problemas numerados, referencias a líneas de código, fragmentos de código relevantes y una tabla de severidad. Esto es directamente usable en un flujo de trabajo real de revisión de PRs.

##### Sobre los límites del enfoque

El modelo no ejecuta el código ni tiene acceso al repositorio completo, por lo que su análisis está limitado al fragmento proporcionado. Bugs que solo aparecen en runtime o en interacción con otras partes del sistema no serán detectados.

---

### Ejemplo 2

#### Prompt

> Actúa como un desarrollador senior con 15 años de experiencia en JavaScript y TypeScript. Revisa el siguiente código e identifica: problemas de rendimiento, malas prácticas, posibles bugs y sugiere refactorizaciones. Sé directo y justifica cada sugerencia.

---

#### Respuesta obtenida

**Problemas identificados**

##### Rendimiento

**1. Doble llamada a `localStorage.getItem`** (`app.js:7-10`)

```js
// MAL: lee localStorage dos veces
const HABITOS_EN_STORAGE = localStorage.getItem("Lista_de_habitos") != null;
let habitos = HABITOS_EN_STORAGE
    ? JSON.parse(localStorage.getItem("Lista_de_habitos"))  // segunda lectura innecesaria

// BIEN: una sola lectura
const raw = localStorage.getItem("Lista_de_habitos");
let habitos = raw ? JSON.parse(raw) : [...defaultHabitos];
```

**4. `document.querySelector("ul")` sin referencia cacheada** (`app.js:36`)

Cada llamada a `crearHabito` hace un query al DOM. Con una lista grande, es innecesario. Cachea el `<ul>` igual que haces con los otros elementos:

```js
const LISTA_HABITOS = document.querySelector("ul");
// luego:
LISTA_HABITOS.appendChild(clon);
```

**7. La búsqueda hace `querySelectorAll` en cada keystroke** (`app.js:68`)

Con una lista grande esto puede ser lento. Cachea la referencia o aplica debounce:

```js
// Opción simple: cachear referencia fuera del handler
// Opción robusta: debounce de ~150ms para no disparar en cada tecla
```

---

##### Bugs potenciales

**2. IDs colisionables con `Date.now()`** (`app.js:12-15`)

```js
{ id: Date.now() },
{ id: Date.now() + 1 },
```

`Date.now()` en el mismo tick da el mismo valor. El `+1`, `+2`, `+3` es un hack frágil. Usa `crypto.randomUUID()` o un contador incremental:

```js
const nuevoId = () => crypto.randomUUID();
```

**3. Sin manejo de errores en `JSON.parse`** (`app.js:10`)

Si localStorage contiene JSON corrupto, la app explota silenciosamente. Siempre envuelve en `try/catch`:

```js
let habitos;
try {
    habitos = raw ? JSON.parse(raw) : defaultHabitos;
} catch {
    habitos = defaultHabitos;
    localStorage.removeItem("Lista_de_habitos");
}
```

**6. Sin validación de inputs** (`app.js:48-59`)

Se puede añadir un hábito con nombre vacío. Añade validación mínima:

```js
if (!nombre || !duracion) return;
```

---

##### Redundancia / Malas prácticas

**5. `document.getElementById` repetido en el submit** (`app.js:48-49`, `58-59`)

Se llama 4 veces a `getElementById` para los mismos 2 inputs. Cachéalos al inicio o al menos dentro del handler:

```js
FORM_HABITO.addEventListener("submit", function (e) {
    e.preventDefault();
    const inputNombre = document.getElementById("nombre_habito");
    const inputDuracion = document.getElementById("duracion_habito");
    const nombre = inputNombre.value.trim();
    const duracion = inputDuracion.value.trim();
    // ...
    inputNombre.value = "";
    inputDuracion.value = "";
});
```

**8. Manipulación de `display` inline en lugar de clases CSS** (`app.js:71`)

```js
habito.style.display = "none"  // MAL: mezcla lógica con presentación

// BIEN: usa una clase CSS
habito.classList.toggle("hidden", !nombre.includes(textoBuscado));
```

---

##### Resumen de prioridades

| Prioridad | Issue                                     |
|-----------|-------------------------------------------|
| Alta      | `JSON.parse` sin `try/catch` (#3)         |
| Alta      | Validación de inputs vacíos (#6)          |
| Media     | Doble lectura de localStorage (#1)        |
| Media     | IDs con `Date.now()` (#2)                 |
| Baja      | Queries al DOM sin cachear (#4, #5, #7)   |
| Baja      | `style.display` inline (#8)              |

El código funciona, pero no es robusto. Los bugs críticos son el `JSON.parse` sin protección y la falta de validación en el formulario.

---

#### Conclusiones

##### Sobre añadir años de experiencia al rol

Especificar "15 años de experiencia en JavaScript y TypeScript" eleva el nivel técnico de la respuesta. El modelo prioriza problemas de rendimiento real (doble lectura de localStorage, queries al DOM por keystroke) que un revisor menos especializado podría ignorar.

##### Sobre pedir refactorizaciones concretas

Al incluir "sugiere refactorizaciones" en el prompt, el modelo no solo señala el problema sino que ofrece el código corregido directamente. Esto hace la respuesta inmediatamente accionable, sin necesidad de un segundo prompt.

##### Sobre la instrucción "sé directo"

El modificador "sé directo y justifica cada sugerencia" produce respuestas más densas y sin relleno. Cada punto identifica el problema, explica por qué es un problema y proporciona la solución, sin texto introductorio innecesario.

---

### Ejemplo 3

#### Prompt

> Eres un arquitecto de software senior. Necesito diseñar un botón para marcar los hábitos cumplidos. Dame: un diagrama en texto, las decisiones arquitectónicas clave con sus trade-offs, qué tecnologías usarías y qué evitarías, y los riesgos principales del diseño.

---

#### Respuesta obtenida

##### Diagrama de flujo: Botón "Marcar cumplido"

```
┌─────────────────────────────────────────────────────────┐
│  <li> [habito-template]                                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [✓] Completado  │ Leer          │ 1 capítulo    │  │
│  │   ^──────────────────────────────────────────────┐│  │
│  │   BOTÓN MARCAR   │ .nombre (h3)  │ .tiempo (span)││  │
│  └──────────────────┴───────────────┴────────────────┘│  │
│                                          [Eliminar]    │  │
└─────────────────────────────────────────────────────────┘

CLICK EN BOTÓN MARCAR
        │
        ▼
┌──────────────────────┐     ┌──────────────────────────┐
│  Toggle en objeto    │────▶│  habitos[] en memoria    │
│  habito.completado   │     │  { id, habito, tiempo,   │
│  true ↔ false        │     │    completado: boolean } │
└──────────────────────┘     └──────────────────────────┘
        │                                │
        ▼                                ▼
┌──────────────────────┐     ┌──────────────────────────┐
│  Actualizar DOM      │     │  localStorage.setItem()  │
│  · clase CSS en <li> │     │  (persistencia)          │
│  · texto del botón   │     └──────────────────────────┘
│  · ícono/color       │
└──────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│  Recalcular resumen en <aside>           │
│  completados / total → porcentaje        │
│  (ya existe el placeholder en el HTML)  │
└──────────────────────────────────────────┘
```

---

##### Decisiones arquitectónicas clave

**1. Dónde vive el estado `completado`**

- **Opción A — En el objeto del array `habitos[]`** *(recomendada)*
  Añadir `completado: false` al modelo de datos existente.
  Trade-off: simple, consistente con lo que ya existe, persiste en localStorage sin cambios estructurales.
  Contra: el array mezcla datos de identidad con estado diario.

- **Opción B — Array separado de IDs completados**
  `completadosHoy = [id1, id2, ...]` en localStorage con clave distinta.
  Trade-off: permite resetear el estado diario sin tocar la definición de hábitos.
  Contra: requiere coordinar dos estructuras; más complejo para el nivel actual del proyecto.

  **Decisión:** Opción A ahora, con la clave `completado` preparada para migrar a Opción B si se añade el reset diario.

**2. Dónde registrar el listener**

- **Opción A — En `crearHabito()`** *(recomendada)*
  Igual que el botón eliminar ya existente en `app.js:29`. Consistencia total con el patrón ya establecido, sin dependencias nuevas.

- **Opción B — Delegación de eventos en `<ul>`**
  Un solo listener en el padre, detecta clics por `closest()`.
  Trade-off: más eficiente con miles de items; innecesario aquí con <50 hábitos.

  **Decisión:** Opción A. No optimizar para un problema que no existe.

**3. Persistencia del estado**

El modelo de datos actual en `app.js:9-16` ya usa localStorage. Solo hay que añadir `completado: false` al objeto por defecto y llamar `localStorage.setItem()` al hacer toggle, igual que al eliminar (`app.js:34`).

Riesgo de migración: los hábitos ya guardados en localStorage no tienen la propiedad `completado`. Solución: usar `habito.completado ?? false` en vez de `habito.completado` directamente.

**4. Sincronización con el `<aside>` de resumen**

El HTML en `index.html:62-65` ya tiene el placeholder. La función de recálculo debe ejecutarse:
- Al cargar la página (después del `forEach`)
- Cada vez que cambia el estado de un hábito
- Al añadir o eliminar un hábito

---

##### Tecnologías: usar vs. evitar

| Usar | Evitar |
|------|--------|
| Vanilla JS (ya en uso) | React/Vue — overkill para este tamaño |
| Clases CSS de Tailwind (ya en uso) | Animaciones JS complejas — CSS `transition` es suficiente |
| `localStorage` (ya en uso) | `indexedDB` — innecesario para datos simples |
| `dataset` en `<li>` para el id | Buscar el hábito por texto — frágil |
| `aria-pressed` en el botón | Solo cambios visuales sin semántica — accesibilidad importa |

---

##### Riesgos principales

**1. Inconsistencia DOM ↔ Estado**
Si se modifica el DOM directamente sin actualizar `habitos[]` y localStorage, el estado se pierde al recargar. Regla: primero actualiza el array, luego el DOM, luego localStorage.

**2. Migración de datos existentes**
Usuarios con localStorage ya guardado no tienen `completado` en sus objetos. Sin `?? false` habrá `undefined` como estado inicial.

**3. Reset diario (futura feature)**
Si no se diseña con esto en mente ahora, el `completado` persistirá entre días. La Opción B de arquitectura lo resuelve limpiamente; vale la pena al menos nombrar la clave de localStorage con sufijo de fecha (`completadosHoy_2026-03-11`).

**4. Accesibilidad**
El botón debe tener `aria-pressed="true/false"` y cambiar su `textContent` o `aria-label` según el estado, para que sea usable con lectores de pantalla.

**5. Doble clic rápido**
Sin debounce o desactivación temporal del botón durante el toggle, un usuario rápido puede generar inconsistencias. Con localStorage síncrono no es grave, pero conviene tenerlo en cuenta si algún día se añade una API.

---

#### Conclusiones

##### Sobre pedir formatos de output específicos

Solicitar explícitamente "un diagrama en texto" hace que el modelo estructure la respuesta visualmente antes de entrar en detalle. Esto obliga a sintetizar el flujo completo antes de justificarlo, lo que produce una respuesta más ordenada que si se pidiera solo una explicación textual.

##### Sobre pedir trade-offs

Incluir "decisiones arquitectónicas clave con sus trade-offs" fuerza al modelo a presentar opciones en lugar de dar una única respuesta definitiva. El resultado es más útil porque expone el razonamiento detrás de cada elección, permitiendo tomar una decisión informada según el contexto del proyecto.

##### Sobre pedir tecnologías a evitar

Pedir explícitamente "qué evitarías" además de "qué usarías" produce una tabla de restricciones que ahorra tiempo real. Sin esa instrucción, el modelo tiende a listar solo lo recomendado y omite las alternativas descartadas, que son igualmente valiosas para no tomar decisiones equivocadas.

##### Sobre pedir riesgos

Incluir "riesgos principales del diseño" hace que el modelo anticipe problemas futuros (migración de datos, accesibilidad, reset diario) que no surgirían en un prompt de implementación directa. Es útil para detectar deuda técnica antes de escribir una sola línea de código.

---

## Sección 2 — Experimenta con prompts con ejemplos: few-shot prompting

---

### Ejemplo 4

#### Prompt

> Revisa fragmentos de código. Devuelve solo: problema, línea afectada y fix de una línea. Sin explicaciones extra.
>
> EJEMPLO:
> Código:
> Problema:
> Línea:
> Fix:

---

#### Respuesta obtenida

Sin problemas críticos detectados. El código es correcto. Un detalle menor:

```
Código:   HABITOS_EN_STORAGE se usa solo para el ternario, pero llama localStorage.getItem dos veces.
Problema: Doble llamada a localStorage.getItem
Línea:    9-10
Fix:      let habitos = JSON.parse(localStorage.getItem("Lista_de_habitos")) ?? [...]
```

---

#### Conclusiones

##### Sobre restringir el formato de respuesta

Definir una plantilla exacta (`Código / Problema / Línea / Fix`) hace que el output sea directamente parseable. Útil cuando la respuesta va a integrarse en un flujo automatizado o cuando se quiere escanear muchos problemas rápidamente sin leer texto.

##### Sobre pedir "sin explicaciones extra"

Esta instrucción elimina el relleno habitual del modelo. El resultado es más denso pero pierde contexto: en este caso el modelo detectó solo un problema menor y no incluyó el razonamiento de por qué es un problema, lo que puede dificultar entender si el fix es adecuado sin conocer el código de antemano.

##### Sobre el coste de la brevedad

Al limitar la respuesta a una línea de fix, se pierde información relevante: el fix propuesto (`?? [...]`) es incompleto y no maneja el caso de JSON corrupto. Un prompt más permisivo habría incluido el `try/catch`. Brevedad y completitud compiten directamente.

##### Sobre incluir un ejemplo de formato en el prompt

Proporcionar un ejemplo vacío de la estructura esperada (`Código: / Problema: / Línea: / Fix:`) es más efectivo que describirlo en prosa. El modelo replica exactamente el patrón visual sin ambigüedad.

---

### Ejemplo 5

#### Prompt

> Genera mensajes de commit en formato convencional. Aprende del tono y longitud de estos ejemplos:
>
> EJEMPLO:
> Cambio: Integracion y mejoras en el trabajo mediante IA
> Commit: Crear template y cambiar funcion en JS. Mejorar nombres de variables y constantes usando IA. Mejorar diseño con comandos de TAILWIND CSS para mejorar el diseño. Persistencia del modo oscuro y mejora de botón. Comprobacion y mejora responsive de la app. Actualizado el README Y añadidas nuevas variables css.
>
> EJEMPLO:
> Cambio: Estudiando AI y añadiendo footer
> Commit: Añado documentos necesarios para el estudio de la IA, y la compracacion detallada entre claude y chatGPT. Actualizacion del README. Añadido footer y comentarios JS en app.js

---

#### Respuesta obtenida

```
Cambio: Reestructurado documento de Prompt Engineering con ejemplos reales
Commit: Reescrito el documento de Prompt Engineering con contenido real. Añadidos cinco ejemplos con prompts, respuestas de IA y conclusiones. Eliminado el esqueleto inicial. Documentadas tecnicas de role prompting, restriccion de formato y few-shot prompting.
```

---

#### Conclusiones

##### Sobre el few-shot prompting

Proporcionar ejemplos reales del output esperado (en lugar de describirlo) es la técnica más precisa para controlar el estilo. El modelo infiere directamente el tono, la longitud y la estructura sin necesidad de instrucciones adicionales.

##### Sobre aprender el estilo del proyecto

Al usar commits reales del repositorio como ejemplos, el modelo replica convenciones propias del proyecto: frases en imperativo en español, enumeración de cambios separados por punto, sin prefijos como `feat:` o `fix:`. El output encaja con el historial existente.

##### Sobre la generalización de los ejemplos

Con solo dos ejemplos el modelo ya generaliza correctamente el patrón. No es necesario proporcionar muchos; basta con que los ejemplos sean representativos y consistentes entre sí.

##### Sobre los límites del few-shot para commits

El modelo genera el mensaje basándose en la descripción del cambio que se le da, no en el diff real. Si la descripción es vaga o incompleta, el commit resultante también lo será. Esta técnica controla el formato, no la precisión del contenido.

##### Sobre el contexto del prompt como fuente de verdad

Al probar este prompt sobre el propio archivo en edición, el modelo genera el commit basándose en el estado actual del documento, no en el estado final. El resultado describe los cambios hasta ese momento, pero no los que se añadirán después. Esto ilustra una limitación importante: el modelo solo puede trabajar con el contexto que recibe, y ese contexto puede estar incompleto si el trabajo aún no ha terminado.

---

## Sección 3 — Experimenta pidiendo razonamiento paso a paso

---

### Ejemplo 6

#### Prompt

> Antes de darme la respuesta final, razona en voz alta cada paso.
> Luego dame la conclusión.
>
> ¿Dónde puede romperse este código si el usuario borra manualmente el localStorage y recarga la página?

---

#### Respuesta obtenida

##### Razonamiento paso a paso

*Voy a recorrer cada interacción con localStorage en app.js y analizar qué pasa cuando el storage está vacío.*

**Punto 1 — Carga de hábitos** (`app.js:7-16`)

```js
const HABITOS_EN_STORAGE = localStorage.getItem("Lista_de_habitos") != null;

let habitos = HABITOS_EN_STORAGE
    ? JSON.parse(localStorage.getItem("Lista_de_habitos"))  // ← llamada 2
    : [ /* defaults */ ];
```

`getItem` sobre una clave inexistente devuelve `null` → `null != null` es `false` → `HABITOS_EN_STORAGE = false` → el ternario cae al bloque de defaults.

¿Se rompe? No. El fallback funciona. Pero hay un code smell: `getItem` se llama dos veces. Si entre esas dos llamadas el storage cambiara, la segunda podría devolver `null` y `JSON.parse(null)` lanzaría un `SyntaxError`.

**Punto 2 — Modo oscuro al cargar** (`app.js:78-82`)

```js
if (localStorage.getItem("modo-oscuro") === "true") {
    document.documentElement.classList.add("dark");
    ...
}
```

Con storage vacío → `null === "true"` es `false` → el bloque no se ejecuta. La página carga en modo claro aunque el usuario estuviera en oscuro.

¿Se rompe? No hay error JS, pero el estado visual se pierde silenciosamente.

**Punto 3 — Eliminar hábito** (`app.js:29-35`)

```js
clon.querySelector("button").addEventListener("click", function () {
    li.remove();
    habitos = habitos.filter(...);
    localStorage.setItem("Lista_de_habitos", JSON.stringify(habitos));
});
```

Opera sobre el array en memoria `habitos`. Funciona correctamente con storage vacío porque escribe de nuevo al hacer clic. ¿Se rompe? No.

**Punto 4 — Añadir hábito** (`app.js:46-60`)

```js
habitos.push({ habito: nombre, tiempo: duracion, id: id });
crearHabito(habitos[habitos.length - 1]);
localStorage.setItem("Lista_de_habitos", JSON.stringify(habitos));
```

Igual que el punto anterior: opera sobre el array en memoria y luego persiste. ¿Se rompe? No.

---

##### Conclusión

El código no lanza ningún error de JavaScript cuando se borra localStorage y se recarga. Los fallbacks están bien puestos.

Sin embargo, hay dos puntos donde el comportamiento se "rompe" de forma silenciosa:

| Punto | Archivo | Efecto |
|-------|---------|--------|
| Data loss | `app.js:9-16` | Los hábitos personalizados se pierden y se reemplazan por los defaults — el usuario pierde su historial |
| Dark mode reset | `app.js:78-82` | La preferencia de modo oscuro se pierde; la página carga siempre en modo claro |

El único riesgo técnico real está en el patrón de `app.js:7-10`: `getItem` se invoca dos veces (TOCTOU). En un navegador no es un problema práctico por el modelo single-threaded, pero si se refactorizara a un entorno con storage asíncrono o compartido, `JSON.parse(null)` en línea 10 lanzaría un `SyntaxError` fatal. Lo idiomático sería guardar el resultado en una variable y reutilizarlo.

---

#### Conclusiones

##### Sobre pedir razonamiento explícito

La instrucción "razona en voz alta cada paso" activa un análisis punto por punto en lugar de ir directamente a la conclusión. El modelo recorre cada interacción con localStorage de forma sistemática, lo que reduce el riesgo de que omita casos menos obvios.

##### Sobre la distinción entre errores y fallos silenciosos

El prompt orientado a "¿dónde puede romperse?" llevó al modelo a separar dos categorías: errores de JavaScript (que no ocurren) y pérdidas de estado silenciosas (que sí ocurren). Sin esa pregunta específica, un análisis genérico probablemente habría concluido simplemente que "el código funciona".

##### Sobre separar razonamiento y conclusión

Pedir primero el razonamiento y luego la conclusión produce una respuesta más verificable: se puede seguir la cadena lógica antes de aceptar el resultado final. Si el razonamiento contiene un error, es detectable antes de llegar a la conclusión.

##### Sobre preguntas de escenario concreto

Preguntar "¿qué pasa si el usuario borra localStorage?" es más preciso que "¿tiene bugs este código?". Las preguntas de escenario concreto acotan el espacio de análisis y producen respuestas más accionables que las preguntas abiertas.

---

### Ejemplo 7

#### Prompt

> Analiza este bug siguiendo exactamente estos pasos:
> 1. Describe qué hace el código actualmente
> 2. Identifica en qué condición falla
> 3. Explica por qué falla (causa raíz)
> 4. Propón el fix mínimo
> 5. Verifica mentalmente que el fix no rompe nada más
>
> Bug: al añadir un hábito con solo espacios en blanco, aparece en la lista como una entrada vacía.

---

#### Respuesta obtenida

**Análisis del bug**

**1. Qué hace el código actualmente**

El handler de submit toma el `value` del input directamente (`línea 48`), lo empuja al array `habitos` sin ninguna validación, y renderiza el hábito al DOM.

**2. Condición de fallo**

Cuando el usuario escribe solo espacios (` `, `\t`, etc.) en `#nombre_habito` y envía el formulario.

**3. Causa raíz**

La línea 48 no llama a `.trim()`. El string `"   "` es truthy, así que no hay ninguna guarda que detenga el flujo. El hábito se añade con un nombre en blanco visible.

**4. Fix mínimo**

Añadir `.trim()` al leer el valor y validar antes de continuar:

```js
FORM_HABITO.addEventListener("submit", function (evento) {
    evento.preventDefault();
    let nombre = document.getElementById("nombre_habito").value.trim(); // <-- trim
    let duracion = document.getElementById("duracion_habito").value;
    if (!nombre) return;  // <-- guarda
    ...
```

**5. Verificación mental**

- Entrada válida (`"Ejercicio"`) → `.trim()` no la modifica → flujo normal, sin cambios.
- Solo espacios → `nombre` queda `""` → `!nombre` es `true` → `return` antes de `push` → no se añade nada, no se toca localStorage ni el DOM.
- Espacios al inicio/final (`" Leer "`) → se normaliza a `"Leer"` → comportamiento mejorado de bonus.
- Nada se rompe: el `return` es antes de cualquier efecto secundario.

---

#### Conclusiones

##### Sobre estructurar el análisis con pasos numerados

Dar una lista numerada de pasos obliga al modelo a seguir un orden lógico fijo: primero entender, luego diagnosticar, luego proponer, luego verificar. Sin esta estructura, el modelo tiende a mezclar causa raíz y fix en el mismo párrafo, lo que dificulta revisar si el razonamiento es correcto.

##### Sobre pedir el fix mínimo

La instrucción "fix mínimo" acota el alcance de la respuesta. El modelo no reescribe el handler completo ni sugiere refactorizaciones adicionales; se limita a los dos cambios estrictamente necesarios (`.trim()` y la guarda). Esto reduce el ruido y facilita aplicar el fix con confianza.

##### Sobre la verificación mental como paso explícito

Incluir "verifica mentalmente que el fix no rompe nada más" como paso 5 hace que el modelo compruebe casos límite antes de cerrar la respuesta. En este caso detectó tres escenarios distintos (entrada válida, solo espacios, espacios mixtos) y confirmó el comportamiento esperado en cada uno, lo que equivale a un mini test manual integrado en la respuesta.

##### Sobre la pregunta final del modelo

La respuesta termina con "¿Aplico el fix?", lo que indica que el modelo interpretó correctamente el prompt como un análisis previo a la acción, no como una instrucción de implementar. Estructurar el prompt en fases (analizar → proponer → confirmar) preserva el control sobre cuándo se ejecutan los cambios.

---

## Sección 4 — Experimenta usando restricciones claras en la respuesta

---

### Ejemplo 8

#### Prompt

> Máximo 3 frases. Ni una más.
>
> ¿Cuál es el mayor riesgo de seguridad en este código y cómo se soluciona?

---

#### Respuesta obtenida

El mayor riesgo es XSS almacenado vía localStorage: si alguien inyecta un hábito con payload malicioso (`<img src=x onerror=alert(1)>`), se guarda en localStorage y se ejecuta en cada carga. El código ya lo mitiga correctamente usando `textContent` en lugar de `innerHTML` en `app.js:27-28`, por lo que en el estado actual no hay vulnerabilidad activa. Si en el futuro se cambia a `innerHTML`, el ataque sería inmediato.

---

#### Conclusiones

##### Sobre restricciones de longitud absolutas

"Máximo 3 frases. Ni una más." es más efectivo que "sé breve" o "responde de forma concisa". La restricción numérica concreta elimina la ambigüedad y el modelo la cumple exactamente. Resulta útil cuando se necesita una respuesta que quepa en un espacio fijo o que sea fácil de escanear de un vistazo.

##### Sobre la densidad informativa bajo restricción

Con solo 3 frases el modelo consiguió incluir: el nombre del ataque (XSS almacenado), el vector (localStorage), un ejemplo de payload, la mitigación actual y el riesgo futuro. La restricción forzó una síntesis que un prompt sin límite habría expandido en varios párrafos, sin añadir información esencial nueva.

##### Sobre el estado actual vs. deuda técnica

Al ser forzado a ser conciso, el modelo priorizó lo más relevante: distinguir entre "no hay vulnerabilidad activa ahora" y "existe una deuda técnica que la crearía en el futuro". Esta distinción, expresada en la tercera frase, es la información más accionable de la respuesta.

---

### Ejemplo 9

#### Prompt

> Si el código tiene bugs críticos: lista solo esos bugs, nada más.
> Si no tiene bugs críticos: da exactamente una sugerencia de mejora.
> Nunca hagas las dos cosas a la vez.

---

#### Respuesta obtenida

No hay bugs críticos.

Sugerencia: El `<ul>` de la lista de hábitos (`línea 39`) no tiene `id`, por lo que el JS de `app.js` probablemente lo selecciona con un selector frágil como `querySelector('ul')`. Añadir `id="lista-habitos"` lo haría más robusto y explícito.

---

#### Conclusiones

##### Sobre la lógica condicional en el prompt

Definir dos ramas de comportamiento mutuamente excluyentes ("si X haz A, si no haz B, nunca ambas") le da al modelo una estructura de decisión explícita. El resultado respeta exactamente la condición: detecta que no hay bugs críticos y devuelve una sola sugerencia, sin mezclar categorías.

##### Sobre "nunca hagas las dos cosas a la vez"

Esta restricción negativa es la clave del prompt. Sin ella, el modelo tendería a listar bugs menores junto a la sugerencia de mejora, diluyendo el output. La instrucción explícita de exclusión mutua elimina esa ambigüedad y mantiene la respuesta enfocada.

##### Sobre forzar una sola sugerencia

Pedir "exactamente una sugerencia" obliga al modelo a priorizar en lugar de enumerar. El resultado es la sugerencia más impactante, no una lista de opciones donde el usuario tendría que decidir cuál aplicar primero.

---

### Ejemplo 10

#### Prompt

> Responde SOLO con un objeto JSON válido. Sin markdown, sin explicaciones, sin texto extra.
> Esquema obligatorio: `{ "problema": string, "linea": number, "severidad": "alta"|"media"|"baja", "fix": string }`
>
> Analiza este fragmento y devuelve un array de objetos con ese esquema.

---

#### Respuesta obtenida

```json
[
  {
    "problema": "Input de duración usa type='text' en lugar de un tipo semántico apropiado, permitiendo cualquier valor sin validación nativa del navegador",
    "linea": 48,
    "severidad": "media",
    "fix": "Cambiar type='text' a type='text' con pattern o usar type='number' con min/max, o un input de tiempo con type='time'"
  },
  {
    "problema": "El <ul> de hábitos no tiene id ni aria-label, lo que dificulta su referencia en JS y la accesibilidad para lectores de pantalla",
    "linea": 39,
    "severidad": "media",
    "fix": "Añadir id='lista-habitos' y aria-label='Lista de hábitos' al elemento <ul>"
  },
  {
    "problema": "El <script> está dentro de <body> pero fuera del cierre </div> contenedor, y carece del atributo defer o type='module', bloqueando el renderizado",
    "linea": 87,
    "severidad": "alta",
    "fix": "Añadir atributo defer al script: <script src='app.js' defer></script>"
  },
  {
    "problema": "El input 'nombre_habito' no tiene atributo 'required', permitiendo enviar el formulario con el nombre vacío",
    "linea": 41,
    "severidad": "media",
    "fix": "Añadir required y maxlength al input: <input type='text' id='nombre_habito' required maxlength='100' ...>"
  },
  {
    "problema": "El botón Eliminar dentro del <template> no tiene aria-label descriptivo; 'Eliminar hábito' es genérico y no identifica qué hábito se elimina",
    "linea": 77,
    "severidad": "baja",
    "fix": "Asignar dinámicamente aria-label='Eliminar hábito: [nombre]' desde JavaScript al clonar la plantilla"
  }
]
```

---

#### Conclusiones

##### Sobre pedir JSON puro como output

Definir el formato de salida como JSON válido sin markdown ni texto extra convierte al modelo en una función: entrada de código, salida de datos estructurados directamente consumibles por otro programa. Esto habilita integración directa con scripts, pipelines de CI o herramientas de análisis sin necesidad de parsear texto libre.

##### Sobre definir el esquema con tipos y valores enumerados

Especificar `"severidad": "alta"|"media"|"baja"` fuerza al modelo a usar un vocabulario controlado. Sin esa restricción, el modelo podría usar términos variados ("crítico", "importante", "menor") que serían incompatibles entre ejecuciones. Los valores enumerados hacen el output predecible y comparable.

##### Sobre la exhaustividad con formato estructurado

Al tener que rellenar campos concretos (`problema`, `linea`, `severidad`, `fix`) por cada issue, el modelo es más exhaustivo que en texto libre. La estructura actúa como checklist implícito: si un problema no tiene número de línea o fix asociado, no puede incluirse, lo que filtra observaciones vagas.

##### Sobre el coste: el modelo añade número de línea aproximado

El campo `linea` requiere que el modelo localice el problema en el código. En algunos casos el número puede ser aproximado si el fragmento es largo o el modelo no tiene acceso al archivo completo. Es un punto de verificación manual obligatorio antes de confiar en los datos para automatización.

