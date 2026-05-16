require('dotenv').config();

const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const adminRoutes = require('./routes/adminRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const regulatorRoutes = require('./routes/regulatorRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
/** Vite `npm run dev -- --host` on Wi‑Fi / WSL (any IP) — avoids stale per-IP entries */
const LAN_VITE =
  /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}):5173$/;

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production' && LAN_VITE.test(origin)) {
      return callback(null, true);
    }
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

/** Default express.json limit is 100kb — base64 product images exceed that → 413 */
app.use(express.json({ limit: '15mb' }));

app.use('/auth', authRoutes);
app.use('/health', healthRoutes);
app.use('/admin', adminRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/organization', organizationRoutes);
app.use('/regulator', regulatorRoutes);
app.use('/users', userRoutes);
app.use('/', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API running on port ${PORT}`);
  console.log(`📍 LAN: http://<this-pc-ip>:${PORT}  |  localhost:${PORT}`);
});