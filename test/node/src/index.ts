import app from './app.js';
import { config } from './config/index.js';
import { getDb, ensureTables, startRealtime } from './services/db.service.js';

async function main(): Promise<void> {
  const db = getDb();
  await db.connect();
  await ensureTables();
  await startRealtime();

  app.listen(config.port, () => {
    console.log('Server start');
    console.log('  API :       http://localhost:' + config.port + '/api/users');
    console.log('  Realtime :  ws://localhost:' + config.realtime.port + config.realtime.path);
    console.log('  Page :      http://localhost:' + config.port + '/');
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
