const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');

const app = express();

// 🔥 FIX: Allow frontend access
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
}));

app.use(express.json());

app.use('/', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API running on port ${PORT}`);
});