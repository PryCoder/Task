const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');  // ← IMPORTANT: Must have this

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

// Serve static frontend files (ADD THIS SECTION)
const isProduction = process.env.NODE_ENV === 'production';
const frontendPath = path.join(__dirname, '../frontend/v/dist');

if (isProduction) {
  // Production: Serve built frontend
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
} else {
  // Development: Just show API info
  app.get('/', (req, res) => {
    res.json({ 
      message: 'API is running', 
      frontend: 'Run "cd frontend/v && npm run dev" for development',
      endpoints: ['/api/auth', '/api/projects', '/api/tasks', '/api/admin']
    });
  });
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!isProduction) {
    console.log(`Frontend dev server: http://localhost:5173`);
  } else {
    console.log(`Frontend served at: http://localhost:${PORT}`);
  }
});