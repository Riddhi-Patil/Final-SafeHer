const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safeher_dev';
const PORT = process.env.PORT || 3001;

mongoose
  .connect(MONGODB_URI, { autoIndex: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', require('./routes/auth'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});