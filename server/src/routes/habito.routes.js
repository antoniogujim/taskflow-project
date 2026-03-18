// Importamos express para poder usar su sistema de enrutamiento
const express = require('express');

// Creamos una instancia del Router — es una mini-app que agrupa rutas del mismo dominio
const router = express.Router();

// Importamos el controlador para conectar cada ruta a su método correspondiente
const habitoController = require('../controllers/habito.controller');

// GET /    → devuelve todos los hábitos
router.get('/', habitoController.getAll);

// POST /   → crea un nuevo hábito
router.post('/', habitoController.create);

// DELETE /:id → elimina el hábito con ese ID
router.delete('/:id', habitoController.remove);

// Exportamos el router para montarlo en index.js
module.exports = router;
