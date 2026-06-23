// server.js
// Entry point — Express server setup

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./src/config/database');
const routes = require('./src/routes');
const { notFoundHandler, globalErrorHandler } = require('./src/middleware/errorHandler');

// Initialize Cron Jobs
require('./src/utils/cronJobs');

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api', routes);

// ─────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─────────────────────────────────────────────
// Start Server with DB connection check
// ─────────────────────────────────────────────
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log('');
      console.log('🎓 ═══════════════════════════════════════');
      console.log('   Kampus Pinjam API Server');
      console.log(`   Running on: http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log('🎓 ═══════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    console.error('💡 Make sure MySQL is running and DATABASE_URL in .env is correct');
    process.exit(1);
  }
};

startServer();

module.exports = app;
