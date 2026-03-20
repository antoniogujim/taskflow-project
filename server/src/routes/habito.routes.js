// Importamos express para poder usar su sistema de enrutamiento
const express = require('express');

// Creamos una instancia del Router — es una mini-app que agrupa rutas del mismo dominio
const router = express.Router();

// Importamos el controlador para conectar cada ruta a su método correspondiente
const habitoController = require('../controllers/habito.controller');

// GET /    → devuelve todos los hábitos
router.get('/', habitoController.getAll);

// POST /reset → resetea todos los hábitos a completado: false
router.post('/reset', habitoController.reset);

// POST /   → crea un nuevo hábito
router.post('/', habitoController.create);

// PATCH /:id  → actualiza el nombre y la duración del hábito con ese ID
router.patch('/:id', habitoController.update);

// PATCH /:id/completar → marca o desmarca el hábito como completado y actualiza la racha.
// Aunque el patrón /:id se repite, Express diferencia esta ruta de PATCH /:id por ser más
// específica (/completar al final) y del DELETE /:id por el verbo HTTP distinto.
router.patch('/:id/completar', habitoController.complete);

// DELETE /:id → elimina el hábito con ese ID
router.delete('/:id', habitoController.remove);

// Exportamos el router para montarlo en index.js
module.exports = router;
