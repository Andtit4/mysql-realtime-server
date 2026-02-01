import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API
app.use('/api', routes);

// fichiers statiques
app.use(express.static(path.join(__dirname, '../public')));

// fallback : index.html 
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default app;
