import { createConnection, type RealtimeConnection } from 'mysql-realtime-db';
import { config } from '../config/index.js';

let db: RealtimeConnection | null = null;

export function getDb(): RealtimeConnection {
  if (!db) {
    db = createConnection({
      ...config.mysql,
      realtime: {
        port: config.realtime.port,
        path: config.realtime.path,
      },
    });
  }
  return db;
}

const USERS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

export async function ensureTables(): Promise<void> {
  const connection = getDb();
  await connection.query(USERS_TABLE_SQL);
}

export async function startRealtime(): Promise<void> {
  const connection = getDb();
  await connection.startRealtimeServer();
}
