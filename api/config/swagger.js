const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Seguidor de Habitos API',
            version: '1.0.0',
            description: 'API REST para gestionar hábitos diarios. Permite crear, editar, eliminar, completar y resetear hábitos con seguimiento de racha.',
        },
        tags: [
            {
                name: 'Habitos',
                description: 'Operaciones sobre hábitos diarios',
            },
        ],
        servers: [
            {
                url: '/api/v1',
                description: 'Servidor de producción (Vercel)',
            },
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Servidor local',
            },
        ],
        components: {
            schemas: {
                // Modelo completo de un hábito — refleja exactamente lo que devuelve el servidor
                Habito: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        },
                        habito: {
                            type: 'string',
                            example: 'Meditar',
                        },
                        tiempo: {
                            type: 'string',
                            example: '10 minutos',
                        },
                        completado: {
                            type: 'boolean',
                            example: false,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-03-24T10:00:00.000Z',
                        },
                        streakActual: {
                            type: 'integer',
                            example: 3,
                        },
                        fechaReferenciaRacha: {
                            type: 'string',
                            format: 'date',
                            example: '2026-03-23',
                        },
                    },
                },
                // Modelo de error — formato estándar que devuelve la API en cualquier error
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            example: 'Mensaje de error',
                        },
                    },
                },
            },
        },
    },
    // swagger-jsdoc buscará los comentarios @swagger en todos los archivos de rutas
    apis: ['./api/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
