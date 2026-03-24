// Importamos express para poder usar su sistema de enrutamiento
const express = require('express');

// Creamos una instancia del Router — es una mini-app que agrupa rutas del mismo dominio
const router = express.Router();

// Importamos el controlador para conectar cada ruta a su método correspondiente
const habitoController = require('../controllers/habito.controller');

/**
 * @swagger
 * /habitos:
 *   get:
 *     tags:
 *       - Habitos
 *     summary: Devuelve todos los hábitos
 *     responses:
 *       200:
 *         description: Lista completa de hábitos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Habito'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Error interno del servidor
 */
// GET /    → devuelve todos los hábitos
router.get('/', habitoController.getAll);

/**
 * @swagger
 * /habitos/reset:
 *   post:
 *     tags:
 *       - Habitos
 *     summary: Resetea todos los hábitos a completado false y rompe rachas antiguas
 *     description: Se llama automáticamente al detectar que es un día nuevo. No requiere body.
 *     responses:
 *       204:
 *         description: Reset aplicado correctamente, sin contenido en la respuesta
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Error interno del servidor
 */
// POST /reset → resetea todos los hábitos a completado: false
router.post('/reset', habitoController.reset);

/**
 * @swagger
 * /habitos:
 *   post:
 *     tags:
 *       - Habitos
 *     summary: Crea un nuevo hábito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - habito
 *               - tiempo
 *             properties:
 *               habito:
 *                 type: string
 *                 example: Meditar
 *               tiempo:
 *                 type: string
 *                 example: 10 minutos
 *     responses:
 *       201:
 *         description: Hábito creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Habito'
 *       400:
 *         description: Body ausente, campos faltantes, vacíos, con solo espacios o de tipo incorrecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: El nombre del hábito es obligatorio
 *       409:
 *         description: Ya existe un hábito con el mismo nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Este hábito ya existe
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Error interno del servidor
 */
// POST /   → crea un nuevo hábito
router.post('/', habitoController.create);

/**
 * @swagger
 * /habitos/completar-todos:
 *   patch:
 *     tags:
 *       - Habitos
 *     summary: Marca o desmarca un conjunto de hábitos en una sola petición
 *     description: Recibe un array de IDs para operar solo sobre los hábitos visibles, respetando el filtro de búsqueda activo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - completado
 *               - ids
 *             properties:
 *               completado:
 *                 type: boolean
 *                 example: true
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890']
 *     responses:
 *       200:
 *         description: Array con los hábitos modificados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Habito'
 *       400:
 *         description: ids ausente o no es un array, o completado no es booleano
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: El campo ids es obligatorio y debe ser un array
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Error interno del servidor
 */
// PATCH /completar-todos → marca o desmarca todos los hábitos en una sola petición.
// Debe ir antes de /:id para que Express no interprete "completar-todos" como un ID.
router.patch('/completar-todos', habitoController.completeAll);

/**
 * @swagger
 * /habitos/{id}/completar:
 *   patch:
 *     tags:
 *       - Habitos
 *     summary: Marca o desmarca un hábito y actualiza su racha
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del hábito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - completado
 *             properties:
 *               completado:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Hábito actualizado con la racha recalculada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Habito'
 *       400:
 *         description: Body ausente o completado no es booleano
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: El valor de completado debe ser true o false
 *       404:
 *         description: No existe ningún hábito con ese ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Hábito no encontrado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Error interno del servidor
 */
// PATCH /:id/completar → marca o desmarca el hábito como completado y actualiza la racha.
// Aunque el patrón /:id se repite, Express diferencia esta ruta de PATCH /:id por ser más
// específica (/completar al final) y del DELETE /:id por el verbo HTTP distinto.
router.patch('/:id/completar', habitoController.complete);

/**
 * @swagger
 * /habitos/{id}:
 *   patch:
 *     tags:
 *       - Habitos
 *     summary: Edita el nombre y la duración de un hábito
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del hábito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - habito
 *               - tiempo
 *             properties:
 *               habito:
 *                 type: string
 *                 example: Leer
 *               tiempo:
 *                 type: string
 *                 example: 30 minutos
 *     responses:
 *       200:
 *         description: Hábito actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Habito'
 *       400:
 *         description: Body ausente, campos faltantes, vacíos o de tipo incorrecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: La duración es obligatoria
 *       404:
 *         description: No existe ningún hábito con ese ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Hábito no encontrado
 *       409:
 *         description: Ya existe otro hábito con el mismo nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Este hábito ya existe
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Error interno del servidor
 */
// PATCH /:id  → actualiza el nombre y la duración del hábito con ese ID
router.patch('/:id', habitoController.update);

/**
 * @swagger
 * /habitos/{id}:
 *   delete:
 *     tags:
 *       - Habitos
 *     summary: Elimina el hábito con ese ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del hábito
 *     responses:
 *       204:
 *         description: Hábito eliminado correctamente, sin contenido en la respuesta
 *       404:
 *         description: No existe ningún hábito con ese ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Hábito no encontrado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Error interno del servidor
 */
// DELETE /:id → elimina el hábito con ese ID
router.delete('/:id', habitoController.remove);

// Exportamos el router para montarlo en index.js
module.exports = router;
