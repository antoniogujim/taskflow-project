require('dotenv').config();

// En Vercel no hay PORT — el entorno serverless no usa puertos.
// Solo lo exigimos cuando corremos en local.
if (!process.env.PORT && !process.env.VERCEL) {
    throw new Error('El puerto no está definido');
}