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

| Caso | Descripción | Resultado |
|------|-------------|-----------|
| 1 | GET lista vacía | OK |
| 2 | GET lista con hábitos | OK |
| 3 | POST datos válidos | OK |
| 4 | POST sin campo `habito` | OK |
| 5 | POST body vacío `{}` | OK |
| 6 | POST sin body | INCORRECTO — devuelve 500 en vez de 400 |
| 7 | POST campo que no existe | COMPORTAMIENTO A REVISAR — acepta y guarda campos desconocidos |
| 8 | POST `habito` string vacío | OK |
| 9 | POST `habito` con un espacio | COMPORTAMIENTO A REVISAR — acepta un espacio como valor válido |
| 10.1 | POST `habito` número | COMPORTAMIENTO A REVISAR — no valida el tipo del campo |
| 10.2 | POST `habito` booleano | COMPORTAMIENTO A REVISAR — no valida el tipo del campo |
| 10.3 | POST `habito` array | COMPORTAMIENTO A REVISAR — no valida el tipo del campo |
| 11 | DELETE sin pasar ID | INCORRECTO — devuelve HTML en vez de JSON |
| 12 | DELETE ID existente | OK |
| 13 | DELETE ID inexistente | OK |
| 14 | DELETE mismo ID dos veces | OK |

### Problemas encontrados

**Caso 6 — POST sin body devuelve 500**
El servidor lanza un error interno cuando no se envía body. Debería devolver 400 como el resto de casos de validación.

**Caso 11 — DELETE sin ID devuelve HTML**
Express no encuentra la ruta y responde con su página de error por defecto en HTML. El resto de errores de la API devuelven JSON, por lo que este caso rompe la consistencia.

### Comportamientos a revisar

**Casos 7, 9, 10.1, 10.2, 10.3 — Sin validación estricta de datos**
El servidor no valida ni el tipo del campo `habito` ni los campos extra que se envíen. Acepta números, booleanos, arrays y espacios en blanco como valores válidos. Esto no produce un error pero puede generar datos incorrectos almacenados.
