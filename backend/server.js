// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.error(err));

// app.use('/api/nameplates', require('./routes/nameplate'));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CORS Configuration (Local + Production Vercel domain allow karein)
const allowedOrigins = [
  'http://localhost:5173',
  'https://ntpcpmi-digital-nameplate.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Mobile apps, Postman ya direct server hits ke liye !origin check
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

// 2. Large Canvas payloads (ESL 192KB binary data/images) ke liye limit badhayein
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check route (Render ke free tier ko check karne ke liye)
app.get('/', (req, res) => {
  res.send('NTPC PMI Digital Nameplate Backend is running smoothly!');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/nameplates', require('./routes/nameplate'));

// Port Binding (Render assigns process.env.PORT automatically)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));