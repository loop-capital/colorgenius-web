import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config.js';
import { healthRoutes } from './routes/health.js';

async function buildServer() {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport: config.logPretty
        ? {
            target: 'pino-pretty',
            options: { colorize: true },
          }
        : undefined,
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  });

  // Security middleware
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  // CORS
  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: config.rateLimitWindow,
  });

  // API documentation
  if (config.nodeEnv !== 'production') {
    await app.register(swagger, {
      openapi: {
        info: {
          title: 'ColorGenius API',
          version: '1.0.0',
          description: 'AI-powered hair color formulation API',
        },
        servers: [
          { url: 'http://localhost:3000', description: 'Development' },
        ],
        tags: [
          { name: 'Health', description: 'System health endpoints' },
          { name: 'Photos', description: 'Photo analysis endpoints' },
          { name: 'Formulations', description: 'Color formulation endpoints' },
          { name: 'Clients', description: 'Client management endpoints' },
          { name: 'Color Lines', description: 'Brand and shade database' },
        ],
      },
    });

    await app.register(swaggerUi, {
      routePrefix: '/docs',
    });
  }

  // Health check routes
  await app.register(healthRoutes);

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.validation,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return reply.status(error.statusCode || 500).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: config.nodeEnv === 'production'
          ? 'An internal error occurred'
          : error.message,
      },
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });

  return app;
}

async function start() {
  const app = await buildServer();

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    app.log.info(`ColorGenius API running on port ${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

export { buildServer };