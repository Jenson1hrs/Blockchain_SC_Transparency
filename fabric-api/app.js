const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');

const app = express();

// 🔥 FIX: Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.11:5173',
  'http://192.168.1.4:5173'  // Add your old IP too
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.use('/', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API running on port ${PORT}`);
  console.log(`📍 Accessible at: http://192.168.1.11:${PORT}`);
});