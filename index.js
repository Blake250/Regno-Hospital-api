

const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const cors = require('cors');

const errorHandler = require('./middleWares/errorMiddleWare');
const userRoutes = require('./routes/userRoutes');
const docRoutes = require('./routes/docRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { stripeWebhook } = require('./controllers/webhookController');


const app = express();

// Stripe webhook raw body (must be before express.json())
app.use('/api/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://regno-hospital-app.vercel.app',
      'http://localhost:5173'
    // 'https://regno-hospital-api.onrender.com',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-www-form-urlencoded'],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  maxAge: 1800, // 30 minutes, matching Access-Control-Max-Age
  // Note: Access-Control-Allow-Origin is handled by the 'origin' function
  // Content-Type header for responses can be set globally if needed
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Set Content-Type for all JSON responses globally (optional, if needed)
// Uncomment if you want to enforce JSON content-type for all responses
// app.use((req, res, next) => {
//   res.setHeader('Content-Type', 'application/json;charset=utf-8');
//   next();
// });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/docOnly', docRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});








