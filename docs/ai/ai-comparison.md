# Comparativa de Herramientas de IA

Este documento recoge una comparativa entre dos inteligencias artificiales a la hora de consultar dudas o conceptos.

Se analizan aspectos como la calidad de las respuestas, la facilidad de uso y los casos en los que cada herramienta destaca o falla. El objetivo es tener una referencia clara para decidir qué herramienta usar según la tarea.

## Herramientas comparadas

- **ChatGPT** (OpenAI)
- **Claude Code** (Anthropic)


## Análisis de las respuestas

> EJEMPLO 1: PROMPT: "Explicame que son las closures"

### ChatGPT

- Empieza con una definición formal y directa antes de mostrar código.
- Usa metáforas para facilitar la comprensión intuitiva.
- Estructura la respuesta con secciones claras: idea básica, ejemplo, casos de uso, resumen.
- Al final ofrece opciones para profundizar en el tema.

### Claude Code

- Arranca directamente con una definición técnica.
- Mayor tecnicismo, ya que explica el ámbito léxico, que ChatGPT no menciona.
- Los ejemplos son más completos y prácticos: el código incluye comentarios con los resultados esperados de cada operación.
- También termina con una pregunta abierta, pero centrada en el código mostrado en lugar de ofrecer un menú de temas.

---

> EJEMPLO 2: PROMPT: "explicame que es el DOM"

### ChatGPT

- Define el DOM de forma clara y concisa desde el primer párrafo.
- Incluye un diagrama ASCII del árbol del DOM.
- Cubre los 4 casos de uso principales (contenido, estilos, crear/eliminar elementos, eventos) con ejemplos cortos.
- Tono accesible, sin tecnicismos innecesarios.
- Termina con una lista de temas para profundizar.

### Claude Code

- Explica el DOM con más detalle: explica las diferencia entre `getElementById`, `getElementsByClassName` y `querySelector`, mostrando cuándo usar cada uno y añadiendo comentarios.
- Incluye un diagrama ASCII del árbol del DOM.
- Cubre clases mas especificas, como `classList.toggle()` que CHATGPT no menciona.
- En la sección de eventos incluye una tabla con los eventos más comunes, lo que es más útil como referencia para su posterior uso.
- El resumen visual final (HTML → DOM → página actualizada) clarifica el flujo completo.
- Tambien acaba proponiendo un ejemplo mas completo para mostrar como funciona en profundidad.

---

> EJEMPLO 3: PROMPT: "Explicame que son los event loop"

### ChatGPT

- Define el event loop con claridad y de forma accesible desde el inicio.
- Usa una metáfora que facilita entender el concepto sin código.
- Muestra un ejemplo básico con `setTimeout` y explica el orden de ejecución.
- Lista los componentes del sistema (call stack, task queue, event loop).
- No distingue entre microtasks y macrotasks, ya que es una de las opciones que nos ofrece para profundizar al final, mientras que Claude lo añade de forma nativa.
- Termina con una lista de temas adicionales, como normalmente ofrece.

### Claude Code

- Explica desde el principio por qué existe el event loop (JavaScript es single-threaded), dando contexto a que entendamos que problema resuelve.
- Incluye un diagrama ASCII detallado que muestra la relación entre Call Stack, Event Loop, Task Queue y Microtask Queue, y despues explica el significado de cada cosa y la prioridad entre ellas.
- Distingue claramente microtasks de macrotasks y su diferencia de prioridad, con un ejemplo donde se puede ver el orden real de ejecución.
- Cierra con una tabla resumen de tipos de tareas y su prioridad.

---

## Correcciones de código erróneo

> EJEMPLO 1: PROMPT: "Explicame el fallo en la siguiente funcion"

```js
function sumar(a, b) {
  return a + b;
  console.log('El resultado es: ' + resultado);
}
```

### ChatGPT

- Identifica los dos fallos correctamente: código inalcanzable tras el `return` y variable `resultado` no definida.
- Explica cada fallo en una sección separada.
- Ofrece dos opciones de corrección, explicando el enfoque de cada una.
- El resumen final sintetiza bien el problema principal.

### Claude Code

- Identifica los dos fallos correctamente y usa el término técnico "dead code", que ChatGPT no menciona.
- La explicación es más compacta: un solo bloque con la corrección y una frase que resume los tres cambios realizados.
- No ofrece alternativas de solución, solo una corrección directa.

---

> EJEMPLO 2: PROMPT: "Explicame el fallo en la siguiente funcion"

```js
function esPar(numero) {
  if (numero % 2 = 0) {
    return verdadero;
  } else {
    return false;
  }
}
```

### ChatGPT

- Identifica 3 fallos: el operador `=` en lugar de `===`, `verdadero` en lugar de `true`, y el `else` innecesario.
- El `else` no es un error real — el código funciona igual con él. ChatGPT lo incluye como error pero es mas un posible estilo a la hora de escribirlo.
- Explica la diferencia entre `==` y `===`, recomendando el segundo.
- Ofrece dos versiones corregidas: la directa y la simplificada.
- Al final propone explicar por qué `% 2` detecta pares, lo que puede ser útil para alguien que empieza.

### Claude Code

- Identifica correctamente 2 errores: `=` en lugar de `===` y `verdadero` en lugar de `true`. No cataloga el `else` como error.
- Usa marcadores visuales para señalar el código incorrecto y el correcto, lo que facilita la lectura rápida.
- Explica la diferencia entre `==` y `===` de forma más precisa: especifica que `===` compara valor y tipo.
- También ofrece la versión simplificada como "bonus" con una explicación de por qué es equivalente.

---

> EJEMPLO 3: PROMPT: "Explicame el fallo en la siguiente funcion"

```js
function invertirArray(array) {
  return array.reverse;
}
```

### ChatGPT

- Identifica correctamente el único fallo: falta llamar al método con `()`.
- Muestra lo que devuelve el código erróneo (`ƒ reverse() { [native code] }`) para que el efecto sea visible.
- Proporciona la corrección directa y un ejemplo de uso con resultado.
- Añade una nota sobre el cambio del array original y ofrece la solución con spread `[...array]`.

### Claude Code

- Identifica el mismo fallo con marcadores.
- Va más allá: generaliza el concepto a cualquier método (`array.sort`, `string.toUpperCase`, `array.map`...), no solo a `reverse`.
- Muestra un ejemplo concreto que demuestra la diferencia entre referencia y ejecución.
- Explica la mutación con un ejemplo que muestra cómo tanto el original como la variable invertida cambian, lo que ChatGPT no ilustra con código.
- También ofrece la solución con spread.

---

## Generación de código mediante prompt

> EJEMPLO 1: PROMPT: "Dame una funcion javascript para añadir nombres a un array"

**ChatGPT:**
```js
function añadirNombre(array, nombre) {
  array.push(nombre);
  return array;
}
```

**Claude Code:**
```js
function añadirNombre(array, nombre) {
  array.push(nombre);
  return array;
}
```

### ChatGPT

- Entrega directamente una función limpia y funcional sin preámbulos.
- Muestra un ejemplo de uso con resultado esperado en comentario.
- Ofrece una segunda versión que no muta el array original (usando spread).
- Al final propone ampliarla con funcionalidades extra, pero no las incluye.

### Claude Code

- La función principal es idéntica a la de ChatGPT.
- Explica cómo funciona `push()` internamente.
- Incluye directamente dos variantes adicionales sin que se pidan: añadir varios nombres a la vez (rest params + spread) y añadir al principio (`unshift`).
- Cierra con un resumen de los conceptos clave que aparecen en el código (`push`, `unshift`, rest parameter, spread operator).
- Más completo de entrada, pero puede ser más de lo necesario.

---

> EJEMPLO 2: PROMPT: "Dame una funcion javascript para añadir un parrafo en el DOM"


**ChatGPT:**
```js
function agregarParrafo(texto, idContenedor) {
  const p = document.createElement("p");
  p.textContent = texto;
  const contenedor = document.getElementById(idContenedor);
  contenedor.appendChild(p);
}
```

**Claude Code:**
```js
function añadirParrafo(texto, elementoPadre = document.body) {
  const parrafo = document.createElement("p");
  parrafo.textContent = texto;
  elementoPadre.appendChild(parrafo);
  return parrafo;
}
```

### ChatGPT

- Genera una función funcional y clara que recibe el texto y el id del contenedor como string.
- Explica brevemente qué hace cada paso.
- Menciona como opción añadir el párrafo directamente al body, pero no lo implementa.
- No devuelve el elemento creado.

### Claude Code

- Recibe el elemento padre directamente (no el id).
- Usa un valor por defecto (`document.body`).
- Devuelve el párrafo creado, permitiendo seguir modificándolo después de llamar a la función.
- Explica cada línea con el motivo: por ejemplo, menciona que usa `textContent` en lugar de `innerHTML` para evitar inyección de HTML.
- Incluye un diagrama del flujo DOM (`createElement → textContent → appendChild`) como resumen visual.

---

> EJEMPLO 3: PROMPT: "Dame una funcion javascript para añadir un boton en el DOM"

**ChatGPT:**

```js
function agregarBoton(texto, id, contenedorId, onClick) {
  const boton = document.createElement("button");
  boton.textContent = texto;

  if (id) {
    boton.id = id;
  }

  if (onClick && typeof onClick === "function") {
    boton.addEventListener("click", onClick);
  }

  const contenedor = document.getElementById(contenedorId) || document.body;
  contenedor.appendChild(boton);

  return boton;
}
```

**Claude Code:**

```js
function añadirBoton(texto, idContenedor, onClick) {
  // 1. Crear el elemento botón
  const boton = document.createElement('button');

  // 2. Asignar el texto visible del botón
  boton.textContent = texto;

  // 3. Asignar el evento click (si se proporcionó)
  if (onClick) {
    boton.addEventListener('click', onClick);
  }

  // 4. Buscar el contenedor donde insertar el botón
  const contenedor = document.getElementById(idContenedor);

  // 5. Insertar el botón dentro del contenedor
  contenedor.appendChild(boton);

  // 6. Devolver el botón por si necesitas manipularlo después
  return boton;
}
```

### ChatGPT

- Genera directamente una función más completa de lo esperado: incluye `id` opcional, validación de tipo para `onClick` y con una fallback para no lanzar null.
- Más defensiva ante errores: si `contenedorId` no encuentra nada, no rompe — inserta en body.
- Devuelve el botón creado.
- Ofrece además una versión mínima sin parámetros para uso rápido.

### Claude Code

- Usa comentarios dentro de la función que explican cada paso, lo que hace el código legible y didáctico.
- Función más simple en parámetros (3 vs 4), sin fallback ni validación de tipo para `onClick`.
- Explica cada concepto usado (`createElement`, `textContent`, `addEventListener`, `appendChild`) con el motivo de por qué se usa así.
- Ofrece una versión mejorada para las opciones (`clase`, `id`, `onClick`), un patrón más avanzado que ChatGPT no incluye.

---

## Tabla comparativa

*Basada en los 9 ejemplos analizados: 3 de teoría, 3 de corrección de errores y 3 de generación de código.*

| Criterio | ChatGPT | Claude Code |
|---|---|---|
| Claridad de la explicación | Media-Alta, accesible | Alta, más técnica |
| Profundidad conceptual | Media | Alta (ámbito léxico, microtasks, classList.toggle...) |
| Calidad del código generado | Buena, a veces más defensiva (fallbacks, validación de tipos) | Buena, flexible y comentada |
| Tono | Conversacional, con metáforas | Técnico y directo |
| Uso de metáforas | Frecuente (facilita la comprensión inicial) | Poco frecuente |
| Oferta de seguimiento | Amplia (lista de opciones para profundizar) | Concreta (centrada en el código mostrado) |
| Uso de diagramas | Diagrama ASCII | Diagrama ASCII + tablas resumen |
| Precisión al identificar errores | A veces señala como error algo que es estilo| Identifica los errores con claridad |
| Terminología técnica | Básica | Frecuente (dead code, referencia vs ejecución, scope léxico...) |
| Comentarios en el código | No incluye | Frecuente, con numeración y explicación del motivo |
| Variantes sin que se pidan | En casos muy concretos | Las incluye directamente en la respuesta |

---

## Conclusiones

A partir del análisis de los 9 ejemplos repartidos en tres categorías (teoría, correcciones y generación de código), se pueden extraer las siguientes conclusiones:

### ¿Cuándo usar ChatGPT?

- Cuando el concepto es nuevo y necesitas una **primera aproximación accesible** antes de entrar en detalle.
- Cuando las metáforas y analogías te ayudan más que el código (ej. la mochila para closures, el camarero para el event loop).
- Cuando quieres explorar **hacia dónde seguir aprendiendo**: su oferta de temas de seguimiento es más amplia y variada.
- Cuando necesitas una función rápida y **sin más de lo necesario**: entrega lo que se pide sin añadir variantes no solicitadas.
- Cuando la **robustez del código importa**: en los ejemplos de generación, ChatGPT tendió a incluir validaciones defensivas (fallbacks, comprobación de tipos) de forma más natural.

### ¿Cuándo usar Claude Code?

- Cuando necesitas **profundidad técnica**: cubre más casos de uso, usa terminología precisa (dead code, scope léxico, referencias vs ejecución) y no deja conceptos importantes como tema opcional.
- Cuando el **código necesita ser legible y explicado**: sus funciones incluyen comentarios numerados que describen cada paso y el motivo.
- Cuando quieres una **respuesta de referencia** para consultar después: los diagramas ASCII detallados, las tablas resumen y los ejemplos de uso múltiple son más útiles para eso.
- Cuando corriges errores: identifica solo los errores reales sin catalogar decisiones de estilo como fallos.
- Cuando quieres aprender más allá de la pregunta: incluye variantes y conceptos relacionados directamente en la respuesta.

### Patrón general observado

A lo largo de los 9 ejemplos se repite el mismo patrón en las tres categorías:

- **ChatGPT** prioriza la **accesibilidad y la orientación**: entra rápido al concepto, usa metáforas, entrega lo justo y ofrece un menú amplio de opciones para continuar.
- **Claude Code** prioriza la **completitud y el rigor técnico**: da contexto antes del mecanismo, comenta el código en detalle, cubre más casos y cierra con recursos de referencia.

Ambos enfoques tienen valor según el momento: ChatGPT funciona mejor para una primera toma de contacto o cuando se necesita una solución concisa; Claude Code resulta más útil cuando se quiere entender en profundidad, escribir código de calidad o tener una referencia técnica completa.
