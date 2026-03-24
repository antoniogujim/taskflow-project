# Pruebas manuales de la API

Base URL: `http://localhost:3000/api/v1/habitos`

---

## GET `/` — Obtener todos los hábitos

### Caso 1: Lista vacía

**Petición**

```
GET http://localhost:3000/api/v1/habitos
```

**Respuesta esperada**

```
Status: 200
Response: []
```

**Respuesta obtenida**

```
Status: 200 OK
Response: []
```

---

### Caso 2: Lista con hábitos

**Petición**

```
GET http://localhost:3000/api/v1/habitos
```

**Respuesta esperada**

```
Status:
Response:
[
	{habitos totales}
]
```

**Respuesta obtenida**

```
Status:
Response:
[
  {
    "id": "68153288-25e0-4cc0-9144-56a90e9eb97f",
    "habito": "Meditar",
    "tiempo": "10 min"
  }
]

// Get comprobado tras el primer post para añadir casos reales
```

---

## POST `/` — Crear un hábito

### Caso 3: Datos válidos

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body:{ "habito": "Meditar", "tiempo": "10 min" }
```

**Respuesta esperada**

```
Status:201 Created
Response:
{
  "id": "generada",
  "habito": "Meditar",
  "tiempo": "10 min"
}
```

**Respuesta obtenida**

```
Status:201 Created
Response:
{
  "id": "68153288-25e0-4cc0-9144-56a90e9eb97f",
  "habito": "Meditar",
  "tiempo": "10 min"
}
```

---

### Caso 4: Sin el campo `habito`

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body:{ "tiempo": "10 min" }
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:mensaje de error
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito es obligatorio"
}
```

### Caso 5: Crear con body vacío

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body:{}
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:mensaje de error
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito es obligatorio"
}
```

---

### Caso 6: Crear sin body

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body:—
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:mensaje de error
```

**Respuesta obtenida**

```
Status: 500 Internal Server Error
Response:
{
  "error": "Error interno del servidor"
}
```

---

### Caso 7: Enviar campo que no existe

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body:{ "habito": "Meditar", "color": "rojo" }
```

**Respuesta esperada**

```
Status: Por como tengo el servidor, creo que aceptaria
Response: Esperando la prueba
```

**Respuesta obtenida**

```
Status:201 Created
Response:
{
  "id": "4a3bd692-4066-4cf2-9031-29ec626e1bf1",
  "habito": "Meditar",
  "color": "rojo"
}
```

---

### Caso 8: `habito` con string vacío

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body:{ "habito": "" }
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:mensaje de error
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito es obligatorio"
}
```

---

### Caso 9: `habito` con un espacio

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body:{ "habito": " " }
```

**Respuesta esperada**

```
Status: Realmente no lo se, porque en realidad esta vacio pero tiene informacion
Response: Sin saberlo hasta probar
```

**Respuesta obtenida**

```
Status: 201 Created
Response:
{
  "id": "05271d32-aa11-4921-93ac-3218ff8f4646",
  "habito": " "
}
```

---

### Caso 10: `habito` con un tipo de dato incorrecto

#### Caso 10.1: número

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body:{ "habito": 123 }
```

**Respuesta esperada**

```
Status:201 Created
Response:
{
  "id": "generada",
  "habito": 123,
}
```

**Respuesta obtenida**

```
Status:201 Created
Response:
{
  "id": "9333629f-b107-4caf-a72a-c74d4c8dd74c",
  "habito": 123
}
```

#### Caso 10.2: booleano

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body:{ "habito": true }
```

**Respuesta esperada**

```
Status:201 Created
Response:
{
  "id": "generada",
  "habito": true,
}
```

**Respuesta obtenida**

```
Status:201 Created
Response:
{
  "id": "a209808f-6bd2-4e85-8803-c3c9d306ca56",
  "habito": true
}
```

#### Caso 10.3: array

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body:{ "habito": [] }
```

**Respuesta esperada**

```
Status:201 Created
Response:
{
  "id": "generada",
  "habito": [],
}
```

**Respuesta obtenida**

```
Status:201 Created
Response:
{
  "id": "91516e94-a672-4cfe-8b91-364386afc467",
  "habito": []
}
```

---

## DELETE `/:id` — Eliminar un hábito

### Caso 11: Sin pasar ID

**Petición**

```
DELETE http://localhost:3000/api/v1/habitos
```

**Respuesta esperada**

```
Status: 404 Not found
Response: Mensaje no encontrado
```

**Respuesta obtenida**

```
Status:404 Not Found
Response:
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Error</title>
  </head>
  <body>
    <pre>Cannot DELETE /api/v1/habitos</pre>
  </body>
</html>
```

---

### Caso 12: ID existente (creada anteriormente probando Post)

**Petición**

```
DELETE http://localhost:3000/api/v1/habitos/4a3bd692-4066-4cf2-9031-29ec626e1bf1
```

**Respuesta esperada**

```
Status:204 No Content
Response: Sin contenido
```

**Respuesta obtenida**

```
Status:204 No Content
Response:Sin contenido
```

---

### Caso 13: ID inexistente

**Petición**

```
DELETE http://localhost:3000/api/v1/habitos/1234
```

**Respuesta esperada**

```
Status: 404 Not Found
Response: Mensaje no encontrado
```

**Respuesta obtenida**

```
Status:404 Not Found
Response:
{
  "error": "Hábito no encontrado"
}
```

---

### Caso 14: Eliminar el mismo ID dos veces (aprobechamos el ID usado en caso 12)

**Petición**

```
DELETE http://localhost:3000/api/v1/habitos/4a3bd692-4066-4cf2-9031-29ec626e1bf1
// Segunda vez con el mismo ID ya eliminado
```

**Respuesta esperada**

```
Status: 404 Not Found
Response: Mensaje no encontrado
```

**Respuesta obtenida**

```
Status: 404 Not Found
Response:
{
  "error": "Hábito no encontrado"
}
```

---

## Informe de resultados

| Caso | Descripción                  | Resultado                                                      |
| ---- | ---------------------------- | -------------------------------------------------------------- |
| 1    | GET lista vacía              | OK                                                             |
| 2    | GET lista con hábitos        | OK                                                             |
| 3    | POST datos válidos           | OK                                                             |
| 4    | POST sin campo `habito`      | OK                                                             |
| 5    | POST body vacío `{}`         | OK                                                             |
| 6    | POST sin body                | INCORRECTO — devuelve 500 en vez de 400                        |
| 7    | POST campo que no existe     | COMPORTAMIENTO A REVISAR — acepta y guarda campos desconocidos |
| 8    | POST `habito` string vacío   | OK                                                             |
| 9    | POST `habito` con un espacio | COMPORTAMIENTO A REVISAR — acepta un espacio como valor válido |
| 10.1 | POST `habito` número         | COMPORTAMIENTO A REVISAR — no valida el tipo del campo         |
| 10.2 | POST `habito` booleano       | COMPORTAMIENTO A REVISAR — no valida el tipo del campo         |
| 10.3 | POST `habito` array          | COMPORTAMIENTO A REVISAR — no valida el tipo del campo         |
| 11   | DELETE sin pasar ID          | INCORRECTO — devuelve HTML en vez de JSON                      |
| 12   | DELETE ID existente          | OK                                                             |
| 13   | DELETE ID inexistente        | OK                                                             |
| 14   | DELETE mismo ID dos veces    | OK                                                             |

### Problemas encontrados

**Caso 6 — POST sin body devuelve 500**
El servidor lanza un error interno cuando no se envía body. Debería devolver 400 como el resto de casos de validación.

**Caso 11 — DELETE sin ID devuelve HTML**
Express no encuentra la ruta y responde con su página de error por defecto en HTML. El resto de errores de la API devuelven JSON, por lo que este caso rompe la consistencia.

### Comportamientos a revisar

**Casos 7, 9, 10.1, 10.2, 10.3 — Sin validación estricta de datos**
El servidor no valida ni el tipo del campo `habito` ni los campos extra que se envíen. Acepta números, booleanos, arrays y espacios en blanco como valores válidos. Esto no produce un error pero puede generar datos incorrectos almacenados.

---

### Cambios a realizar

**1. `habito.controller.js` — Guarda defensiva para body nulo**
Añadir al inicio de `create`, antes de desestructurar `req.body`, una comprobación que detecte cuando no hay body o no es un objeto. Sin esto, intentar desestructurar `undefined` lanza un `TypeError` que llega al manejador de errores como 500.
Cubre: caso 6.

**2. `habito.controller.js` — Validar que `habito` es string y no está vacío**
Tras comprobar que el campo existe, verificar que su tipo es `string` (`typeof habito !== 'string'`) y que no es solo espacios en blanco (`habito.trim() === ''`). La comprobación de tipo debe ir antes que la de trim, porque llamar a `.trim()` sobre un número o un array lanzaría un error.

- Si el tipo no es string → 400 `"El nombre del hábito debe ser un texto"`
- Si el string es solo espacios → 400 `"El nombre del hábito es obligatorio"`
  Cubre: casos 9, 10.1, 10.2, 10.3.

**3. `habito.controller.js` — Validar que `tiempo` es string y no está vacío**
Misma lógica que el punto anterior aplicada al campo `tiempo`.

- Si el tipo no es string → 400 `"La duración debe ser un texto"`
- Si el string es solo espacios → 400 `"La duración es obligatoria"`
  Cubre: casos 9b, 10.1b, 10.2b, 10.3b.

**4. `habito.service.js` — Extraer solo los campos permitidos**
En lugar de guardar todo `req.body` directamente, construir el objeto hábito extrayendo únicamente `habito` y `tiempo` por nombre. Así cualquier campo extra que envíe el cliente (como `"color"`) se descarta antes de llegar al array interno.
Cubre: caso 7.

**5. `index.js` — Middleware catch-all 404**
Añadir, entre el montaje del router y el manejador de errores, un middleware `app.use` que capture todas las rutas no reconocidas por Express y devuelva un JSON `{ "error": "Ruta no encontrada" }` con status 404. Sin esto, Express responde con su página HTML de error por defecto.
Cubre: caso 11.

## 2ª fase de pruebas — tras analizar los errores

Se repiten los casos que resultaron incorrectos o con comportamiento a revisar en la primera fase, una vez aplicadas las correcciones. Al final se añaden casos nuevos derivados de los cambios realizados.

Durante la investigación previa a esta segunda fase descubrí la importancia del header `Content-Type`. Al no conocerlo, las pruebas de la fase 1 se realizaron sin él, lo que afectó a algunos resultados. Todos los casos de esta fase se evalúan incluyendo el siguiente header:

`Content-Type: application/json`

---

### Caso 5 (2ª fase): POST con body vacío `{}`

El mensaje cambia respecto a la fase 1: ahora `tiempo` también es obligatorio, por lo que el error indica que faltan los dos campos.

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: {}
```

**Resultado anterior**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito es obligatorio"
}
// Solo validaba habito, no tiempo
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito y la duración son obligatorios"
}
```

**Respuesta obtenida**

```
Status:400 Bad Request
Response:
{
  "error": "El nombre del hábito y la duración son obligatorios"
}

```

---

### Caso 6 (2ª fase): POST sin body

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: —
```

**Resultado anterior**

```
Status: 500 Internal Server Error
Response:
{
  "error": "Error interno del servidor"
}
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito y la duración son obligatorios"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito y la duración son obligatorios"
}
```

---

### Caso 7 (2ª fase): POST con campo que no existe

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": "Meditar", "tiempo": "10 minutos", "color": "rojo" }
```

**Resultado anterior**

```
Status: 201 Created
Response:
{
  "id": "4a3bd692-4066-4cf2-9031-29ec626e1bf1",
  "habito": "Meditar",
  "color": "rojo"
}
// El campo desconocido "color" se guardaba
```

**Respuesta esperada**

```
Status: 201 Created
Response:
{
  "id": "generada",
  "habito": "Meditar",
  "tiempo": "10 minutos"
  "completado": false,
  "createdAt": "Fecha generada"
}
// El campo desconocido "color" no debería guardarse
```

**Respuesta obtenida**

```
Status:201 Created
Response:
{
  "id": "c62c2c50-72d4-4622-94df-940a419590a1",
  "habito": "Meditar",
  "tiempo": "10 minutos",
  "completado": false,
  "createdAt": "2026-03-20T07:05:55.003Z"
}
```

---

### Caso 9 (2ª fase): POST con `habito` solo espacios en blanco

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": " ", "tiempo": "10 minutos" }
```

**Resultado anterior**

```
Status: 201 Created
Response:
{
  "id": "05271d32-aa11-4921-93ac-3218ff8f4646",
  "habito": " "
}
// Aceptaba un espacio como valor válido
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito es obligatorio"
}
// Un string con solo espacios debería tratarse como vacío
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito es obligatorio"
}
```

---

### Caso 10 (2ª fase): POST con tipo de dato incorrecto en `habito`

#### Caso 10.1 (2ª fase): número

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": 123, "tiempo": "10 minutos"  }
```

**Resultado anterior**

```
Status: 201 Created
Response:
{
  "id": "9333629f-b107-4caf-a72a-c74d4c8dd74c",
  "habito": 123
}
// Aceptaba un número como valor válido
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito debe ser un texto"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito debe ser un texto"
}
```

---

#### Caso 10.2 (2ª fase): booleano

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": true, "tiempo": "10 minutos"  }
```

**Resultado anterior**

```
Status: 201 Created
Response:
{
  "id": "a209808f-6bd2-4e85-8803-c3c9d306ca56",
  "habito": true
}
// Aceptaba un booleano como valor válido
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito debe ser un texto"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito debe ser un texto"
}
```

---

#### Caso 10.3 (2ª fase): array

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": [], "tiempo": "10 minutos"  }
```

**Resultado anterior**

```
Status: 201 Created
Response:
{
  "id": "91516e94-a672-4cfe-8b91-364386afc467",
  "habito": []
}
// Aceptaba un array como valor válido
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito debe ser un texto"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito debe ser un texto"
}
```

---

### Caso 11 (2ª fase): DELETE sin pasar ID

**Petición**

```
DELETE http://localhost:3000/api/v1/habitos
```

**Resultado anterior**

```
Status: 404 Not Found
Response:
<!DOCTYPE html>
<html lang="en">
  <head><meta charset="utf-8"><title>Error</title></head>
  <body><pre>Cannot DELETE /api/v1/habitos</pre></body>
</html>
// Devolvía HTML en vez de JSON
```

**Respuesta esperada**

```
Status: 404 Not Found
Response:
{
  "error": "Ruta no encontrada"
}
// Debe devolver JSON como el resto de errores, no HTML
```

**Respuesta obtenida**

```
Status: 404 Not Found
Response:
{
  "error": "Ruta no encontrada"
}
```

---

## Pruebas nuevas — derivadas de los cambios

Se añaden al introducir `tiempo` como campo obligatorio y mejorar los mensajes de error cuando faltan los dos campos a la vez.

---

### Caso 4b: POST sin el campo `tiempo`

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": "Meditar" }
```

**Resultado anterior**

```
// Caso no probado anteriormente
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración es obligatoria"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración es obligatoria"
}
```

---

### Caso 8b: POST con `tiempo` string vacío

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": "Meditar", "tiempo": "" }
```

**Resultado anterior**

```
// Caso no probado anteriormente
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración es obligatoria"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración es obligatoria"
}
```

---

### Caso 9b: POST con `tiempo` solo espacios

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": "Meditar", "tiempo": " " }
```

**Resultado anterior**

```
// Caso no probado anteriormente
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración es obligatoria"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración es obligatoria"
}
```

---

### Caso 10b: POST con tipo de dato incorrecto en `tiempo`

#### Caso 10.1b: número

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": "Meditar", "tiempo": 10 }
```

**Resultado anterior**

```
// Caso no probado anteriormente
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración debe ser un texto"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración debe ser un texto"
}
```

---

#### Caso 10.2b: booleano

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": "Meditar", "tiempo": true }
```

**Resultado anterior**

```
// Caso no probado anteriormente
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración debe ser un texto"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración debe ser un texto"
}
```

---

#### Caso 10.3b: array

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": "Meditar", "tiempo": [] }
```

**Resultado anterior**

```
// Caso no probado anteriormente
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración debe ser un texto"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración debe ser un texto"
}
```

---

## Nuevo caso detectado

### Caso 15: POST con hábito duplicado

Detectado al probar la creación de hábitos: el servidor no impedía registrar el mismo hábito dos veces. Se corrigió en esta misma fase.

**Petición**

```
POST http://localhost:3000/api/v1/habitos
Body: { "habito": "Meditar", "tiempo": "10 min" }
// Segunda vez con el mismo nombre ya existente
```

**Respuesta esperada**

```
Status: 409 Conflict
Response:
{
  "error": "Este hábito ya existe"
}
```

**Respuesta obtenida**

```
Status: 409 Conflict
Response:
{
  "error": "Este hábito ya existe"
}
```

---

## Informe de resultados — 2ª fase

| Caso         | Descripción                     | Resultado |
| ------------ | ------------------------------- | --------- |
| 5 (revisado) | POST body vacío `{}`            | OK        |
| 6            | POST sin body                   | OK        |
| 7            | POST campo que no existe        | OK        |
| 9            | POST `habito` con un espacio    | OK        |
| 10.1         | POST `habito` número            | OK        |
| 10.2         | POST `habito` booleano          | OK        |
| 10.3         | POST `habito` array             | OK        |
| 11           | DELETE sin pasar ID             | OK        |
|              | **— Casos nuevos —**            |           |
| 4b           | POST sin campo `tiempo`         | OK        |
| 8b           | POST `tiempo` string vacío      | OK        |
| 9b           | POST `tiempo` con solo espacios | OK        |
| 10.1b        | POST `tiempo` número            | OK        |
| 10.2b        | POST `tiempo` booleano          | OK        |
| 10.3b        | POST `tiempo` array             | OK        |
| 15           | POST hábito duplicado           | OK        |

### Conclusión

Todos los casos de la 2ª fase han resultado correctos. Los dos errores detectados en la fase anterior (500 al enviar sin body y respuesta HTML al hacer DELETE sin ID) quedaron resueltos. Los comportamientos marcados como revisables (campos extra, espacios en blanco y tipos de dato incorrectos) también se corrigieron, añadiendo además validaciones equivalentes para el campo `tiempo`, que en esta fase pasó a ser obligatorio.

Durante las pruebas se detectó además un caso no contemplado anteriormente: la posibilidad de crear hábitos duplicados. Se corrigió en esta misma fase añadiendo una comprobación en el servicio que devuelve un 409 si ya existe un hábito con el mismo nombre.

El servidor valida ahora de forma estricta las entradas del cliente antes de procesar ningún dato, y todas las respuestas de error son consistentes en formato JSON.

## 3ª fase de pruebas — nuevos endpoints

A partir de aquí, los hábitos incluyen siempre los campos `streakActual` y `fechaReferenciaRacha`. Estos campos no aparecían en las fases anteriores porque el servidor no los gestionaba todavía, pero desde que se añadieron al servicio al inicio de esta fase, forman parte de todos los hábitos automáticamente desde su creación.

---

## PATCH `/:id` — Editar hábito

### Caso 16: ID existente con datos válidos

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id
Body: { "habito": "Estudiar", "tiempo": "15 min" }
```

**Respuesta esperada**

```
Status: 200 OK
Response:
{
  "id": "...",
  "habito": "Estudiar",
  "tiempo": "15 min",
  "completado": false,
  "streakActual": 0,
  "fechaReferenciaRacha": null,
  "createdAt": "..."
}
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
{
  "id": "8a5692aa-5d9f-4692-a6ad-049735129658",
  "habito": "Estudiar",
  "tiempo": "15 min",
  "completado": false,
  "createdAt": "2026-03-20T13:19:53.203Z",
  "streakActual": 0,
  "fechaReferenciaRacha": null
}
```

---

### Caso 16b: Sin body

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id
Body: —
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito y la duración son obligatorios"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito y la duración son obligatorios"
}
```

---

### Caso 16c: Body vacío `{}`

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id
Body: {}
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito y la duración son obligatorios"
}
```

**Respuesta obtenida**

```
Status:400 Bad Request
Response:
{
  "error": "El nombre del hábito y la duración son obligatorios"
}
```

---

### Caso 16d: `habito` con tipo incorrecto

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id
Body: { "habito": 123, "tiempo": "10 min" }
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito debe ser un texto"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito debe ser un texto"
}
```

---

### Caso 16e: `habito` con string vacío o solo espacios

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id
Body: { "habito": "   ", "tiempo": "10 min" }
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito es obligatorio"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El nombre del hábito es obligatorio"
}
```

---

### Caso 16f: `tiempo` con tipo incorrecto

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id
Body: { "habito": "Meditar", "tiempo": true }
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración debe ser un texto"
}
```

**Respuesta obtenida**

```
Status:400 Bad Request
Response:
{
  "error": "La duración debe ser un texto"
}
```

---

### Caso 16g: `tiempo` con string vacío o solo espacios

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id
Body: { "habito": "Meditar", "tiempo": "" }
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración es obligatoria"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "La duración es obligatoria"
}
```

---

### Caso 17: ID inexistente

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/id-que-no-existe
Body: { "habito": "Meditar", "tiempo": "15 min" }
```

**Respuesta esperada**

```
Status: 404 Not Found
Response:
{
  "error": "Hábito no encontrado"
}
```

**Respuesta obtenida**

```
Status: 404 Not Found
Response:
{
  "error": "Hábito no encontrado"
}
```

---

### Caso 18: Nombre duplicado de otro hábito

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id
Body: { "habito": "NombreYaUsadoPorOtro", "tiempo": "10 min" }
// El nombre pertenece a un hábito distinto
```

**Respuesta esperada**

```
Status: 409 Conflict
Response:
{
  "error": "Este hábito ya existe"
}
```

**Respuesta obtenida**

```
Status: 409 Conflict
Response:
{
  "error": "Este hábito ya existe"
}
```

---

### Caso 19: Mismo nombre sin cambios

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id
Body: { "habito": "MismoNombreDelHabito", "tiempo": "10 min" }
// El nombre coincide con el propio hábito que se está editando
```

**Respuesta esperada**

```
Status: 200 OK
Response:
{
  "id": "...",
  "habito": "MismoNombreDelHabito",
  "tiempo": "10 min",
  ...
}
// No debe dar error de duplicado
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
{
  "id": "8a5692aa-5d9f-4692-a6ad-049735129658",
  "habito": "volar",
  "tiempo": "12 min",
  "completado": false,
  "createdAt": "2026-03-20T13:19:53.203Z",
  "streakActual": 0,
  "fechaReferenciaRacha": null
}
```

---

### Caso 20: Campos extra en el body

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id
Body: { "habito": "volar", "tiempo": "10 min", "color": "azul" }
```

**Respuesta esperada**

```
Status: 200 OK
Response:
{
  "id": "...",
  "habito": "volar",
  "tiempo": "10 min",
  "completado": false,
  "streakActual": 0,
  "fechaReferenciaRacha": null,
  "createdAt": "..."
}
// El campo "color" debe descartarse
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
{
  "id": "8a5692aa-5d9f-4692-a6ad-049735129658",
  "habito": "volar",
  "tiempo": "10 min",
  "completado": false,
  "createdAt": "2026-03-20T13:19:53.203Z",
  "streakActual": 0,
  "fechaReferenciaRacha": null
}
```

---

## PATCH `/:id/completar` — Completar / desmarcar

### Caso 21: `completado` ausente en el body

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id/completar
Body: {}
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El valor de completado debe ser true o false"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El valor de completado debe ser true o false"
}
```

---

### Caso 22: `completado` con valor no booleano

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id/completar
Body: { "completado": "true" }
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El valor de completado debe ser true o false"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El valor de completado debe ser true o false"
}
```

---

### Caso 23: ID inexistente

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/id-que-no-existe/completar
Body: { "completado": true }
```

**Respuesta esperada**

```
Status: 404 Not Found
Response:
{
  "error": "Hábito no encontrado"
}
```

**Respuesta obtenida**

```
Status: 404 Not Found
Response:
{
  "error": "Hábito no encontrado"
}
```

---

### Caso 24: Marcar por primera vez

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id/completar
Body: { "completado": true }
// El hábito tiene streakActual = 0 y fechaReferenciaRacha = null
```

**Respuesta esperada**

```
Status: 200 OK
Response:
{
  ...
  "completado": true,
  "streakActual": 1,
  "fechaReferenciaRacha": "fecha de hoy"
}
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
{
  "id": "8a5692aa-5d9f-4692-a6ad-049735129658",
  "habito": "volar",
  "tiempo": "10 min",
  "completado": true,
  "createdAt": "2026-03-20T13:19:53.203Z",
  "streakActual": 1,
  "fechaReferenciaRacha": "2026-03-20"
}
```

---

### Caso 25: Marcar dos veces el mismo día

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id/completar
Body: { "completado": true }
// El hábito ya está completado con fechaReferenciaRacha = hoy
```

**Respuesta esperada**

```
Status: 200 OK
Response:
{
  ...
  "completado": true,
  "streakActual": 1,
  "fechaReferenciaRacha": "fecha de hoy"
}
// El streak no debe incrementar
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
{
  "id": "8a5692aa-5d9f-4692-a6ad-049735129658",
  "habito": "volar",
  "tiempo": "10 min",
  "completado": true,
  "createdAt": "2026-03-20T13:19:53.203Z",
  "streakActual": 1, (no ha incrementado)
  "fechaReferenciaRacha": "2026-03-20"
}
```

---

### Caso 26: Desmarcar con streak = 1

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id/completar
Body: { "completado": false }
// El hábito tiene streakActual = 1
```

**Respuesta esperada**

```
Status: 200 OK
Response:
{
  ...
  "completado": false,
  "streakActual": 2,
  "fechaReferenciaRacha": La de ayer
}
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
{
  "id": "test-10",
  "habito": "TEST - Límite de racha",
  "tiempo": "10 minutos",
  "completado": false,
  "createdAt": "2026-03-20T14:04:15.487Z",
  "streakActual": 0,
  "fechaReferenciaRacha": null
}
```

---

### Caso 27: Desmarcar con streak > 1

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id/completar
Body: { "completado": false }
// El hábito tiene streakActual = 3
```

**Respuesta esperada**

```
Status: 200 OK
Response:
{
  ...
  "completado": false,
  "streakActual": 2,
  "fechaReferenciaRacha": "fecha de ayer" //prueba realizada 20/03/2026 (habito creado falsamente para la prueba)
}
```

**Respuesta obtenida**

```
Status:
Response:
{
  "id": "54ec9727-122e-4ba7-99e7-74c19b2332ea",
  "habito": "TEST - Hábito con racha",
  "tiempo": "10 minutos",
  "completado": false,
  "createdAt": "2026-03-20T13:57:04.988Z",
  "streakActual": 2,
  "fechaReferenciaRacha": "2026-03-19"
}
```

---

### Caso 28: Desmarcar con streak ya en 0

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id/completar
Body: { "completado": false }
// El hábito tiene streakActual = 0
```

**Respuesta esperada**

```
Status: 200 OK
Response:
{
  ...
  "completado": false,
  "streakActual": 0,
  "fechaReferenciaRacha": null
}
// El streak no debe bajar a negativo
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
{
  "id": "test-10",
  "habito": "TEST - Límite de racha",
  "tiempo": "10 minutos",
  "completado": false,
  "createdAt": "2026-03-20T14:04:15.487Z",
  "streakActual": 0,
  "fechaReferenciaRacha": null
}
```

---

### Caso 29: Completar días consecutivos

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id/completar
Body: { "completado": true }
// El hábito tiene fechaReferenciaRacha = ayer y streakActual = 2
```

**Respuesta esperada**

```
Status: 200 OK
Response:
{
  ...
  "completado": true,
  "streakActual": 3,
  "fechaReferenciaRacha": "fecha de hoy"
}
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
{
  "id": "test",
  "habito": "TEST - Hábito con racha",
  "tiempo": "10 minutos",
  "completado": true,
  "createdAt": "2026-03-20T14:10:01.290Z",
  "streakActual": 3,
  "fechaReferenciaRacha": "2026-03-20" //dia que se hizo la prueba
}
```

---

### Caso 30: Saltar un día y completar

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id/completar
Body: { "completado": true }
// El hábito tiene fechaReferenciaRacha = hace 2 días y streakActual = 5
```

**Respuesta esperada**

```
Status: 200 OK
Response:
{
  ...
  "completado": true,
  "streakActual": 1,
  "fechaReferenciaRacha": "fecha de hoy"
}
// Al saltar un día la racha se reinicia a 1
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
{
  "id": "test",
  "habito": "TEST - Hábito con racha",
  "tiempo": "10 minutos",
  "completado": true,
  "createdAt": "2026-03-20T14:13:04.228Z",
  "streakActual": 1,
  "fechaReferenciaRacha": "2026-03-20"
}
```

---

## POST `/reset` — Reset diario

### Caso 31: Con hábitos completados

**Petición**

```
POST http://localhost:3000/api/v1/habitos/reset
// Hay hábitos con completado: true
```

**Respuesta esperada**

```
Status: 204 No Content
// Todos los hábitos quedan con completado: false
```

**Respuesta obtenida**

```
Status:204 No Content
//Aun asi, compruebo con get que se han modificado, y efectivamente, se han peusto en false
```

---

### Caso 32: Con racha activa y fecha de ayer

**Petición**

```
POST http://localhost:3000/api/v1/habitos/reset
// Hay un hábito con streakActual = 3 y fechaReferenciaRacha = ayer
```

**Respuesta esperada**

```
Status: 204 No Content
// El hábito queda con completado: false, streakActual = 3, fechaReferenciaRacha = ayer
// La racha se mantiene porque el último día completado fue ayer
```

**Respuesta obtenida**

```
Status: 204 No Content
//Efectivamente, la racha se mantiene pero queda en false.
```

---

### Caso 33: Con racha activa y fecha antigua

**Petición**

```
POST http://localhost:3000/api/v1/habitos/reset
// Hay un hábito con streakActual = 5 y fechaReferenciaRacha = hace 3 días
```

**Respuesta esperada**

```
Status: 204 No Content
// El hábito queda con completado: false, streakActual = 0, fechaReferenciaRacha = null
// La racha se rompe porque se saltaron días
```

**Respuesta obtenida**

```
Status:204 No content
efectivamente, al comprobar el habito, se han reiniciado ambas referencias
```

---

### Caso 34: Lista vacía

**Petición**

```
POST http://localhost:3000/api/v1/habitos/reset
// No hay ningún hábito creado
```

**Respuesta esperada**

```
Status: 204 No Content
// No hay nada que resetear pero no debe dar error
```

**Respuesta obtenida**

```
Status: 204 No Content
//funciona
```

---

## Nuevo caso detectado

### Caso 35: PATCH /completar con `fechaReferenciaRacha` en el futuro — servidor colgado

Detectado al intentar simular días consecutivos cambiando la fecha del sistema. El procedimiento fue:

1. Completar el hábito con la fecha real → `streakActual = 1`, `fechaReferenciaRacha = hoy`
2. Cambiar la fecha del sistema a **ayer** (en lugar de mañana)
3. Volver a llamar a PATCH `/completar` con `{ "completado": true }`

Al cambiar la fecha del sistema a ayer, el servidor ve que `fechaReferenciaRacha` del hábito es **mañana** (una fecha posterior a "hoy" según el sistema). Esta situación no está contemplada en la lógica del servicio, que solo compara con `ayer` y `hoy`. El resultado fue que la petición quedó colgada indefinidamente sin devolver respuesta ni error, bloqueando el servidor hasta reiniciarlo.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/:id/completar
Body: { "completado": true }
// El hábito tiene fechaReferenciaRacha = fecha posterior a la fecha actual del sistema
```

**Respuesta esperada**

```
// Comportamiento a definir — la opción más segura sería reiniciar la racha a 1
// En ningún caso debería colgar el servidor
```

**Respuesta obtenida**

```
Fue un problema falso. Ocurrio porque cambie la hora en el pc de manera falsa en lugar de crear un habito falso. Al probarlo, simplemente actualiza con racha 1
```

---

## Informe de resultados — 3ª fase

| Caso | Descripción                                              | Resultado                       |
| ---- | -------------------------------------------------------- | ------------------------------- |
| 16   | PATCH ID existente con datos válidos                     | OK                              |
| 16b  | PATCH sin body                                           | OK                              |
| 16c  | PATCH body vacío `{}`                                    | OK                              |
| 16d  | PATCH `habito` con tipo incorrecto                       | OK                              |
| 16e  | PATCH `habito` con string vacío o solo espacios          | OK                              |
| 16f  | PATCH `tiempo` con tipo incorrecto                       | OK                              |
| 16g  | PATCH `tiempo` con string vacío o solo espacios          | OK                              |
| 17   | PATCH ID inexistente                                     | OK                              |
| 18   | PATCH nombre duplicado de otro hábito                    | OK                              |
| 19   | PATCH mismo nombre sin cambios                           | OK                              |
| 20   | PATCH campos extra en el body                            | OK                              |
| 21   | PATCH /completar sin campo `completado`                  | OK                              |
| 22   | PATCH /completar `completado` no booleano                | OK                              |
| 23   | PATCH /completar ID inexistente                          | OK                              |
| 24   | PATCH /completar marcar por primera vez                  | OK                              |
| 25   | PATCH /completar marcar dos veces el mismo día           | OK                              |
| 26   | PATCH /completar desmarcar con streak = 1                | OK                              |
| 27   | PATCH /completar desmarcar con streak > 1                | OK                              |
| 28   | PATCH /completar desmarcar con streak = 0                | OK                              |
| 29   | PATCH /completar completar días consecutivos             | OK                              |
| 30   | PATCH /completar saltar un día y completar               | OK                              |
| 31   | POST /reset con hábitos completados                      | OK                              |
| 32   | POST /reset con racha activa y fecha de ayer             | OK                              |
| 33   | POST /reset con racha activa y fecha antigua             | OK                              |
| 34   | POST /reset lista vacía                                  | OK                              |
| 35   | PATCH /completar con `fechaReferenciaRacha` en el futuro | OK — falso positivo, no era bug |

---

## 4ª fase de pruebas — nuevo endpoint completar-todos

Se añade el endpoint `PATCH /completar-todos` para reemplazar las peticiones paralelas del botón "Completar todos" del frontend, que causaban 404 al ser enrutadas a instancias serverless distintas con IDs diferentes.

---

## PATCH `/completar-todos` — Completar o desmarcar todos a la vez

### Caso 36: Sin body

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: —
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El cuerpo de la petición es obligatorio"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El valor de completado debe ser true o false"
}
```

**Nota:** Express convierte la ausencia de body en `{}`, por lo que la comprobación `!req.body` no la detecta y cae en la validación del campo `completado`. El status 400 es correcto; solo difiere el mensaje. Comportamiento idéntico al de `PATCH /:id/completar`.

---

### Caso 37: `completado` con valor no booleano

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": "true" }
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El valor de completado debe ser true o false"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El valor de completado debe ser true o false"
}
```

---

### Caso 38: `completado: true` con hábitos pendientes

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": true }
// Hay hábitos con completado: false
```

**Respuesta esperada**

```
Status: 200 OK
Response:
[
  { ..., "completado": true, "streakActual": 1, "fechaReferenciaRacha": "fecha de hoy" },
  { ..., "completado": true, "streakActual": 1, "fechaReferenciaRacha": "fecha de hoy" },
  ...
]
// Todos los hábitos quedan completados y con la racha actualizada
```

**Respuesta obtenida**

```
Status:200 OK
Response:
[
  {
    "id": "1",
    "habito": "Meditar",
    "tiempo": "10 minutos",
    "completado": true,
    "createdAt": "2026-03-23T09:59:51.980Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-23"
  },
  {
    "id": "2",
    "habito": "Leer",
    "tiempo": "1 capítulo",
    "completado": true,
    "createdAt": "2026-03-23T09:59:51.997Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-23"
  },
  {
    "id": "3",
    "habito": "Correr",
    "tiempo": "30 minutos",
    "completado": true,
    "createdAt": "2026-03-23T09:59:51.998Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-23"
  },
  {
    "id": "4",
    "habito": "Tomar vitaminas",
    "tiempo": "Instantáneo",
    "completado": true,
    "createdAt": "2026-03-23T09:59:51.999Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-23"
  }
]
```

---

### Caso 39: `completado: true` cuando ya están todos completados

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": true }
// Todos los hábitos ya tienen completado: true y fechaReferenciaRacha = hoy
```

**Respuesta esperada**

```
Status: 200 OK
Response:
[
  { ..., "completado": true, "streakActual": 1, "fechaReferenciaRacha": "fecha de hoy" },
  ...
]
// El streakActual no debe incrementar al marcar el mismo día dos veces
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
[
  {
    "id": "1",
    "habito": "Meditar",
    "tiempo": "10 minutos",
    "completado": true,
    "createdAt": "2026-03-23T09:59:51.980Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-23"
  },
  {
    "id": "2",
    "habito": "Leer",
    "tiempo": "1 capítulo",
    "completado": true,
    "createdAt": "2026-03-23T09:59:51.997Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-23"
  },
  {
    "id": "3",
    "habito": "Correr",
    "tiempo": "30 minutos",
    "completado": true,
    "createdAt": "2026-03-23T09:59:51.998Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-23"
  },
  {
    "id": "4",
    "habito": "Tomar vitaminas",
    "tiempo": "Instantáneo",
    "completado": true,
    "createdAt": "2026-03-23T09:59:51.999Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-23"
  }
]
```

---

### Caso 40: `completado: false` con hábitos completados

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": false }
// Todos los hábitos tienen completado: true y streakActual > 0
```

**Respuesta esperada**

```
Status: 200 OK
Response:
[
  { ..., "completado": false, "streakActual": 0, "fechaReferenciaRacha": null },
  ...
]
// Todos quedan desmarcados y la racha decrementada
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
[
  {
    "id": "1",
    "habito": "Meditar",
    "tiempo": "10 minutos",
    "completado": false,
    "createdAt": "2026-03-23T09:59:51.980Z",
    "streakActual": 0,
    "fechaReferenciaRacha": null
  },
  {
    "id": "2",
    "habito": "Leer",
    "tiempo": "1 capítulo",
    "completado": false,
    "createdAt": "2026-03-23T09:59:51.997Z",
    "streakActual": 0,
    "fechaReferenciaRacha": null
  },
  {
    "id": "3",
    "habito": "Correr",
    "tiempo": "30 minutos",
    "completado": false,
    "createdAt": "2026-03-23T09:59:51.998Z",
    "streakActual": 0,
    "fechaReferenciaRacha": null
  },
  {
    "id": "4",
    "habito": "Tomar vitaminas",
    "tiempo": "Instantáneo",
    "completado": false,
    "createdAt": "2026-03-23T09:59:51.999Z",
    "streakActual": 0,
    "fechaReferenciaRacha": null
  }
]
```

---

### Caso 41: Lista vacía

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": true }
// No hay ningún hábito creado
```

**Respuesta esperada**

```
Status: 200 OK
Response: []
// No hay nada que completar pero no debe dar error
```

**Respuesta obtenida**

```
Status:200 OK
Response: []
```

---

## Informe de resultados — 4ª fase

| Caso | Descripción                                              | Resultado |
| ---- | -------------------------------------------------------- | --------- |
| 36   | PATCH /completar-todos sin body                          | OK        |
| 37   | PATCH /completar-todos `completado` no booleano          | OK        |
| 38   | PATCH /completar-todos con hábitos pendientes            | OK        |
| 39   | PATCH /completar-todos cuando ya están todos completados | OK        |
| 40   | PATCH /completar-todos desmarcar todos                   | OK        |
| 41   | PATCH /completar-todos lista vacía                       | OK        |

### Observaciones

**Orden de rutas en Express**
Durante las pruebas se detectó que `PATCH /completar-todos` devolvía 400 con el mensaje "El nombre del hábito y la duración son obligatorios", que corresponde al controlador de editar. El motivo es que Express evalúa las rutas en el orden en que se registran: al estar `PATCH /:id` antes que `PATCH /completar-todos`, Express interpretaba "completar-todos" como un ID y lo enrutaba al controlador incorrecto. La solución fue registrar `/completar-todos` antes que `/:id` en el archivo de rutas. Las rutas específicas siempre deben ir antes que las rutas con parámetros dinámicos.

---

## 5ª fase de pruebas — reestructuración del endpoint completar-todos

### Motivo de esta fase

El endpoint `PATCH /completar-todos` se rediseña para que solo complete los hábitos que el usuario tiene visibles en pantalla según el filtro de búsqueda activo, en lugar de completar todos los hábitos sin excepción.

Para conseguirlo, el frontend pasa a enviar siempre un array `ids` con los identificadores de los hábitos visibles en ese momento. El servidor deja de operar sobre todos los hábitos y pasa a filtrar únicamente por los IDs recibidos.

Como consecuencia, `ids` se convierte en un campo **obligatorio**: si no llega, el servidor rechaza la petición con 400. Esto elimina el comportamiento anterior en el que una petición sin body completaba todos los hábitos (caso 36 de la 4ª fase), que ahora se considera un error.

Se repiten los casos 36–41 porque el contrato del endpoint cambia: todos necesitan incluir `ids` en el body, y algunos resultados esperados son distintos.

---

## PATCH `/completar-todos` — 5ª fase

### Caso 36.b: Sin body (sin `ids`)

Repite el caso 36 de la 4ª fase. El comportamiento cambia: antes completaba todos los hábitos; ahora es obligatorio enviar `ids`, por lo que devuelve 400.

**Nota:** aunque al no llegar body tampoco llega `completado`, el error que aparece es el de `ids` y no el de `completado`. Esto se debe al orden de las validaciones en el controlador: `ids` se comprueba primero, por lo que es la que dispara el 400 antes de llegar a evaluar `completado`.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: —
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El campo ids es obligatorio y debe ser un array"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El campo ids es obligatorio y debe ser un array"
}

```

---

### Caso 37.b: `completado` no booleano

Repite el caso 37 de la 4ª fase. El resultado esperado no cambia (400), pero ahora el body incluye `ids`.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": "true", "ids": [] }
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El campo completado debe ser un booleano"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El campo completado debe ser un booleano"
}

```

---

### Caso 38.b: Completar hábitos filtrados (hábitos pendientes)

Repite el caso 38 de la 4ª fase. Ahora se envían solo los IDs visibles en lugar de actuar sobre todos.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": true, "ids": ["1", "2"] }
// IDs 1 y 2 tienen completado: false
```

**Respuesta esperada**

```
Status: 200 OK
Response:
[
  { "id": "1", "completado": true, "streakActual": 1, "fechaReferenciaRacha": "fecha de hoy", ... },
  { "id": "2", "completado": true, "streakActual": 1, "fechaReferenciaRacha": "fecha de hoy", ... }
]
// Solo los hábitos con IDs 1 y 2 quedan completados. Los IDs 3 y 4 no se tocan.
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
[
  {
    "id": "1",
    "habito": "Meditar",
    "tiempo": "10 minutos",
    "completado": true,
    "createdAt": "2026-03-24T09:11:08.967Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-24"
  },
  {
    "id": "2",
    "habito": "Leer",
    "tiempo": "1 capítulo",
    "completado": true,
    "createdAt": "2026-03-24T09:11:08.969Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-24"
  }
]

//Si llamamos a obtener todos los habitos, comprobamos que los de id 3 y 4 no han sido modificados

```

---

### Caso 39.b: Todos los IDs enviados ya están completados

Repite el caso 39 de la 4ª fase. Ahora se envían solo los IDs visibles en lugar de actuar sobre todos.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": true, "ids": ["1", "2"] }
// IDs 1 y 2 ya tienen completado: true y fechaReferenciaRacha = hoy
```

**Respuesta esperada**

```
Status: 200 OK
Response:
[
  { "id": "1", "completado": true, "streakActual": 1, "fechaReferenciaRacha": "fecha de hoy", ... },
  { "id": "2", "completado": true, "streakActual": 1, "fechaReferenciaRacha": "fecha de hoy", ... }
]
// No se modifica ningún dato. La racha no se incrementa por estar ya registrada hoy.
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
[
  {
    "id": "1",
    "habito": "Meditar",
    "tiempo": "10 minutos",
    "completado": true,
    "createdAt": "2026-03-24T09:11:08.967Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-24"
  },
  {
    "id": "2",
    "habito": "Leer",
    "tiempo": "1 capítulo",
    "completado": true,
    "createdAt": "2026-03-24T09:11:08.969Z",
    "streakActual": 1,
    "fechaReferenciaRacha": "2026-03-24"
  }
]

//Iguales a los obtenidos anteriormente

```

---

### Caso 40.b: Desmarcar hábitos filtrados

Repite el caso 40 de la 4ª fase. Ahora se envían solo los IDs visibles en lugar de actuar sobre todos.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": false, "ids": ["1", "2"] }
// IDs 1 y 2 tienen completado: true y streakActual > 0
```

**Respuesta esperada**

```
Status: 200 OK
Response:
[
  { "id": "1", "completado": false, "streakActual": 0, ... },
  { "id": "2", "completado": false, "streakActual": 0, ... }
]
// Solo los IDs 1 y 2 quedan desmarcados. Los IDs 3 y 4 no se tocan.
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
[
  {
    "id": "1",
    "habito": "Meditar",
    "tiempo": "10 minutos",
    "completado": false,
    "createdAt": "2026-03-24T09:11:08.967Z",
    "streakActual": 0,
    "fechaReferenciaRacha": null
  },
  {
    "id": "2",
    "habito": "Leer",
    "tiempo": "1 capítulo",
    "completado": false,
    "createdAt": "2026-03-24T09:11:08.969Z",
    "streakActual": 0,
    "fechaReferenciaRacha": null
  }
]

//Si llamamos a obtener todos los habitos, comprobamos que los de id 3 y 4 no han sido modificados y el 1 y 2 si han vuelto a su estado anterior

```

---

### Caso 41.b: Lista vacía — ningún hábito existe

Repite el caso 41 de la 4ª fase. El resultado esperado no cambia, pero ahora el body incluye `ids`.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": true, "ids": [] }
// No hay ningún hábito creado
```

**Respuesta esperada**

```
Status: 200 OK
Response:
[]
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
[]

```

---

### Caso 42: `ids` no es un array

Exclusivo de esta fase. Valida que el servidor rechaza `ids` cuando no es un array.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": true, "ids": "abc123" }
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El campo ids es obligatorio y debe ser un array"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El campo ids es obligatorio y debe ser un array"
}

```

---

### Caso 43: `ids` vacío — no completa ninguno

Exclusivo de esta fase. Valida que enviar un array vacío no modifica ningún hábito.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": true, "ids": [] }
// Hay hábitos con completado: false
```

**Respuesta esperada**

```
Status: 200 OK
Response:
[]
// Los hábitos existentes no se modifican. Array vacío porque ningún ID fue procesado.
```

**Respuesta obtenida**

```
Status: 200 OK
Response:
[]

// Si obtenemos todos los hábitos, siguen en false todos.

```

---

### Caso 44: `completado` ausente del body

Exclusivo de esta fase. Valida que `completado` es obligatorio aunque `ids` llegue correctamente.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "ids": ["1", "2"] }
```

**Respuesta esperada**

```
Status: 400 Bad Request
Response:
{
  "error": "El campo completado debe ser un booleano"
}
```

**Respuesta obtenida**

```
Status: 400 Bad Request
Response:
{
  "error": "El campo completado debe ser un booleano"
}

```

---

### Caso 45: Todos los IDs enviados no existen

Exclusivo de esta fase. Valida que el servidor devuelve 404 si ninguno de los IDs recibidos corresponde a un hábito existente.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": true, "ids": ["id-inventado-1", "id-inventado-2"] }
```

**Respuesta esperada**

```
Status: 404 Not Found
Response:
{
  "error": "Hábito no encontrado"
}
```

**Respuesta obtenida**

```
Status: 404 Not Found
Response:
{
  "error": "Hábito no encontrado"
}

```

---

### Caso 46: Mezcla de IDs válidos e inexistentes

Exclusivo de esta fase. Valida que el servidor devuelve 404 en cuanto detecta algún ID que no existe, sin completar ninguno.

**Nota:** el servicio recorre primero todos los IDs para verificar que existen antes de modificar nada. Si alguno falla, lanza `NOT_FOUND` y la operación se cancela por completo. Esto garantiza que "completar todos" es todo o nada — nunca se completan solo algunos de los IDs enviados. Esto nos permite tener mas control y no aceptar solo algunos, produciendo que la función no se realice como esperamos.

**Petición**

```
PATCH http://localhost:3000/api/v1/habitos/completar-todos
Body: { "completado": true, "ids": ["1", "id-inventado"] }
// "1" corresponde a un hábito existente
```

**Respuesta esperada**

```
Status: 404 Not Found
Response:
{
  "error": "Hábito no encontrado"
}
// No se modifica ningún hábito, ni siquiera el ID "1" que sí existe.
```

**Respuesta obtenida**

```
Status: 404 Not Found
Response:
{
  "error": "Hábito no encontrado"
}

```

---

## Informe de resultados — 5ª fase

| Caso  | Descripción                                             | Resultado |
| ----- | ------------------------------------------------------- | --------- |
| 36.b  | Sin body (sin `ids`) — ahora devuelve 400               | OK        |
| 37.b  | `completado` no booleano                                | OK        |
| 38.b  | Completar hábitos filtrados (hábitos pendientes)        | OK        |
| 39.b  | Todos los IDs enviados ya están completados             | OK        |
| 40.b  | Desmarcar hábitos filtrados                             | OK        |
| 41.b  | Lista vacía — ningún hábito existe                      | OK        |
| 42    | `ids` no es un array                                    | OK        |
| 43    | `ids` vacío — no completa ninguno                       | OK        |
| 44    | `completado` ausente del body                           | OK        |
| 45    | Todos los IDs enviados no existen                       | OK        |
| 46    | Mezcla de IDs válidos e inexistentes                    | OK        |
