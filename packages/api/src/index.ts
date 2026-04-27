import { buildApp } from './app.js';
import { config } from './config.js';
import { closePool } from './db/index.js';

async function main() {
  const app = await buildApp();

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down gracefully...`);
      try {
        await app.close();
        await closePool();
        app.log.info('Server closed');
        process.exit(0);
      } catch (err) {
        app.log.error('Error during shutdown: %s', err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });
  }

  try {
    const address = await app.listen({
      port: config.server.port,
      host: config.server.host,
    });
    app.log.info(`ColorGenius API server running at ${address}`);
    app.log.info(`Health check: ${address}/health`);
  } catch (err) {
    app.log.error('Failed to start server: %s', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();