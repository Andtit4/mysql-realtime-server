#!/usr/bin/env node

import { createConnection, createClient } from '../dist/index.js';

const REALTIME_PORT = Number(process.env.REALTIME_PORT) || 3040;
const useChangelog = process.argv.includes('--changelog');

const db = createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'app_user',
  password: process.env.MYSQL_PASSWORD || 'password_fort',
  database: process.env.MYSQL_DATABASE || 'mydb',
  realtime: {
    port: REALTIME_PORT,
    path: '/realtime',
    enableChangelog: useChangelog,
    changelogPollIntervalMs: 500,
    tables: useChangelog ? ['users'] : [],
  },
});

db.on('users:insert', (row) => console.log('[serveur] users:insert', row));
db.on('users:update', ({ previous, current }) =>
  console.log('[serveur] users:update', previous?.id, '->', current)
);
db.on('users:delete', (row) => console.log('[serveur] users:delete', row));

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table users prête.');
}

//operation run
async function runOperations() {
  console.log('\n--- Insert ---');
  const id = await db.insert('users', {
    name: 'Test ' + Date.now(),
    email: 'test@example.com',
  });
  console.log('Inserted id:', id);

  console.log('\n--- Update ---');
  await db.update('users', { id }, { name: 'Test Updated ' + Date.now() });

  console.log('\n--- Delete ---');
  await db.delete('users', { id });
  console.log('Deleted id:', id);
  console.log('');
}

async function main() {
  await db.connect();
  await ensureTable();
  if (useChangelog) {
    await db.installChangelog();
    console.log('Mode changelog activé : les insert/update/delete faits en SQL direct seront détectés.\n');
  }
  await db.startRealtimeServer();
  console.log('Realtime server: ws://localhost:' + REALTIME_PORT + '/realtime\n');

  const client = createClient({ url: 'http://localhost:' + REALTIME_PORT, path: '/realtime' });
  client.subscribe('users', (event, data) => {
    console.log('[client WS] users:', event, data);
  });
  await client.connect();
  console.log('Client WebSocket connecté.\n');

  await runOperations();

  const loop = process.argv.includes('--loop');
  if (loop) {
    console.log('Mode loop : une opération toutes les 3 s (Ctrl+C pour arrêter).\n');
    setInterval(runOperations, 3000);
  } else {
    console.log('Serveur actif. Ouvrir test/test-realtime.html dans le navigateur.');
    console.log('Pour enchaîner en boucle : node test/test-realtime.mjs --loop\n');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
