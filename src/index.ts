import express from 'express';
import cors from 'cors';
import { Database } from './database';
import { IdentityService, IdentifyRequest } from './identityService';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and service
const database = new Database();
const identityService = new IdentityService(database);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bitespeed Identity Reconciliation Service is running' });
});

// Main identify endpoint
app.post('/identify', async (req, res) => {
  try {
    const request: IdentifyRequest = req.body;
    
    // Validate request body
    if (!request || (typeof request !== 'object')) {
      return res.status(400).json({
        error: 'Invalid request body. Expected JSON object with email and/or phoneNumber.'
      });
    }

    const { email, phoneNumber } = request;

    // Validate email format if provided
    if (email && typeof email !== 'string') {
      return res.status(400).json({
        error: 'Email must be a string'
      });
    }

    // Validate phone number format if provided
    if (phoneNumber && typeof phoneNumber !== 'string') {
      return res.status(400).json({
        error: 'Phone number must be a string'
      });
    }

    // Validate email format using simple regex
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // At least one contact method must be provided
    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: 'Either email or phoneNumber must be provided'
      });
    }

    // Process the identity reconciliation
    const result = await identityService.identify({ email, phoneNumber });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing identify request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Bitespeed Identity Reconciliation Service running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔍 Identify endpoint: http://localhost:${port}/identify`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await database.close();
  process.exit(0);
});
