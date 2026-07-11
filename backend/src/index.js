const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static upload files
app.use('/uploads', express.static(uploadsDir));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Import route modules
const authRoutes = require('./routes/auth');
const ngoRoutes = require('./routes/ngo');
const adminRoutes = require('./routes/admin');
const communityRoutes = require('./routes/community');
const directoryRoutes = require('./routes/directory');
const orgRoutes = require('./routes/org');
const agentRoutes = require('./routes/agents');
const chatRoutes = require('./routes/chat');
const fundingRoutes = require('./routes/funding');
const notificationsRoutes = require('./routes/notifications');

// Map API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/notifications', notificationsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Nivara API Server is running.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

if (process.env.NODE_ENV !== 'test' && (!process.env.VERCEL || require.main === module)) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
