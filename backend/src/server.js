// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const searchRoutes = require('./routes/searchRoutes');
const paperRoutes = require('./routes/paperRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Configure middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/search', searchRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/analysis', analysisRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Paper Pulse API',
    status: 'running',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  
  // Log environment variables status (but not their values for security)
  console.log('Environment variables:');
  console.log(`- SERPER_API_KEY: ${process.env.SERPER_API_KEY ? 'Set ✅' : 'Not set ❌'}`);
  console.log(`- TOGETHER_API_KEY: ${process.env.TOGETHER_API_KEY ? 'Set ✅' : 'Not set ❌'}`);
});

module.exports = app; 