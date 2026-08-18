import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  authRouter,
  machinesRouter,
  simulationsRouter,
  calculationsRouter,
  energyRouter,
  maintenanceRouter,
  alertsRouter,
  aiRouter,
  iotRouter,
  auditLogsRouter,
  reportsRouter,
} from './server/routes/apiRouters';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MechTwin AI Enterprise Engine',
    version: '2.0.0-Industry4.0',
    tagline: 'Engineering Intelligence for Every Machine.',
    creator: 'Samil Khan',
    timestamp: new Date().toISOString(),
    aiEngineAvailable: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Mount Modular API Routers
app.use('/api/auth', authRouter);
app.use('/api/machines', machinesRouter);
app.use('/api/simulations', simulationsRouter);
app.use('/api/calculations', calculationsRouter);
app.use('/api/energy', energyRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/iot', iotRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/reports', reportsRouter);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MechTwin AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

