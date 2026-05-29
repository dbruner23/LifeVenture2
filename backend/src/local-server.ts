import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getPool } from './db';
import { listVentures, createVentureFromBody, ValidationError } from './queries/ventures';
import { parseVentureQuery } from './handlers/ventures';

// Local dev server. Exposes the same routes as the deployed HTTP API, backed by
// the local PostGIS container, so the Expo app can run against a real database.
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'lifeventure-api-local', time: new Date().toISOString() });
});

app.get('/ventures', async (req, res) => {
  try {
    const opts = parseVentureQuery(req.query as Record<string, string | undefined>);
    const ventures = await listVentures(getPool(), opts);
    res.json({ ventures, source: 'postgis-local' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list ventures' });
  }
});

app.post('/ventures', async (req, res) => {
  try {
    const venture = await createVentureFromBody(getPool(), req.body);
    res.status(201).json({ venture });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create venture' });
  }
});

const port = Number(process.env.PORT ?? 3100);
app.listen(port, () => {
  console.log(`LifeVenture local API on http://localhost:${port}`);
});
