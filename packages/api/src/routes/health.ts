import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { pool } from '../db/index.js';
import { checkEngineHealth } from '../services/python-bridge.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/ready', async (_request: FastifyRequest, reply: FastifyReply) => {
    const [engineOk, dbOk] = await Promise.all([
      checkEngineHealth().catch(() => false),
      pool.query('SELECT 1').then(() => true).catch(() => false),
    ]);

    const services = {
      api: 'healthy',
      database: dbOk ? 'healthy' : 'down',
      colorEngine: engineOk ? 'up' : 'down',
    };

    const allHealthy = dbOk && engineOk;
    return reply.status(allHealthy ? 200 : 503).send({
      status: allHealthy ? 'healthy' : 'degraded',
      version: '1.0.0',
      services,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/live', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      status: 'alive',
      uptime: process.uptime(),
    });
  });
}