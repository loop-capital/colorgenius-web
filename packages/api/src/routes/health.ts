import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', {
    schema: {
      description: 'Basic health check',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/health/ready', {
    schema: {
      description: 'Readiness check (includes dependencies)',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            version: { type: 'string' },
            services: {
              type: 'object',
              properties: {
                api: { type: 'string' },
                database: { type: 'string' },
                redis: { type: 'string' },
                colorEngine: { type: 'string' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
        503: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            services: { type: 'object' },
          },
        },
      },
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    // TODO: Implement actual dependency checks
    const services = {
      api: 'healthy',
      database: 'unknown', // TODO: Check DB connection
      redis: 'unknown',    // TODO: Check Redis connection
      colorEngine: 'unknown', // TODO: Check color engine health
    };

    const allHealthy = Object.values(services).every(s => s === 'healthy');

    const response = {
      status: allHealthy ? 'healthy' : 'degraded',
      version: '1.0.0',
      services,
      timestamp: new Date().toISOString(),
    };

    return reply.status(allHealthy ? 200 : 503).send(response);
  });

  app.get('/health/live', {
    schema: {
      description: 'Liveness check (basic process check)',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            uptime: { type: 'number' },
          },
        },
      },
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    return {
      status: 'alive',
      uptime: process.uptime(),
    };
  });
}