#!/usr/bin/env node
/**
 * Exemple CRUD en temps réel — Users
 *
 * - API HTTP sur le port 3040 : GET/POST/PATCH/DELETE /api/users
 * - WebSocket temps réel sur le port 3041 : événements insert/update/delete
 *
 * Lancer : npm run build && node test/test-realtime.mjs
 * Puis ouvrir test/test-realtime.html dans le navigateur.
 */

import { createServer } from 'node:http';
import { createConnection } from '../dist/index.js';
import { createHandler } from './api-routes.mjs';

const API_PORT = Number(process.env.API_PORT) || 3040;
const REALTIME_PORT = Number(process.env.REALTIME_PORT) || 3041;

const db = createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'mydb',
  realtime: {
    port: REALTIME_PORT,
    path: '/realtime',
  },
});

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function main() {
  await db.connect();
  await ensureTable();
  await db.startRealtimeServer();

  const server = createServer(createHandler(db));
  server.listen(API_PORT, () => {
    console.log('Exemple CRUD temps réel');
    console.log('  API REST :     http://localhost:' + API_PORT + '/api/users');
    console.log('  WebSocket :   ws://localhost:' + REALTIME_PORT + '/realtime');
    console.log('  Page de test : ouvrir test/test-realtime.html dans le navigateur\n');
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
