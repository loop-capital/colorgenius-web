import Fastify, { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { config } from './config.js';
import { authRoutes } from './auth/routes.js';
import { analyzeRoutes } from './routes/analyze.js';
import { formulateRoutes } from './routes/formulate.js';
import { colorLinesRoutes } from './routes/color-lines.js';
import { historyRoutes } from './routes/history.js';
import { clientsRoutes } from './routes/clients.js';
import { appointmentsRoutes } from './routes/appointments.js';
import { feedbackRoutes } from './routes/feedback.js';
import { profitTrackingRoutes } from './routes/profit-tracking.js';
import { checkEngineHealth } from './services/python-bridge.js';
import * as fs from 'fs';
import * as path from 'path';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Register plugins
  await app.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  await app.register(fastifyJwt, {
    secret: config.jwt.secret,
  });

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: config.upload.maxSize,
    },
  });

  // Serve uploaded files
  const uploadDir = config.upload.dir.startsWith('/') 
    ? path.resolve(process.cwd(), config.upload.dir.replace(/^\//, ''))
    : path.resolve(process.cwd(), config.upload.dir);
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  await app.register(fastifyStatic, {
    root: uploadDir,
    prefix: '/uploads/',
    prefixAvoidTrailingSlash: true,
  });

  // Health check endpoint
  app.get('/health', async (request, reply) => {
    const engineHealthy = await checkEngineHealth();

    return reply.status(engineHealthy ? 200 : 503).send({
      success: engineHealthy,
      data: {
        status: engineHealthy ? 'healthy' : 'degraded',
        engine: engineHealthy ? 'up' : 'down',
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Register auth routes
  await app.register(authRoutes, { prefix: '/auth' });

  // Register API routes
  await app.register(analyzeRoutes);
  await app.register(formulateRoutes);
  await app.register(colorLinesRoutes);
  await app.register(historyRoutes);
  await app.register(clientsRoutes);
  await app.register(appointmentsRoutes);
  await app.register(feedbackRoutes);
  await app.register(profitTrackingRoutes);

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.validation,
        },
      });
    }

    return reply.status(error.statusCode || 500).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
      },
    });
  });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
    });
  });

  return app;
}