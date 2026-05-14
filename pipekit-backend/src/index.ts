import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';

import errorHandler from './middleware/errorHandler';
import pipelineRoutes from './routes/pipelines';
import runRoutes from './routes/runs';
import { initWebSocket } from './websocket/server'; 


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/pipelines', pipelineRoutes);
app.use('/api/runs', runRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler — must be last
app.use(errorHandler);

const server = createServer(app);

initWebSocket(server); 

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
export { server };