const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const errorHandler = require('./middleWares/errorMiddleWare');
const userRoutes = require('./routes/userRoutes');
const docRoutes = require('./routes/docRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { stripeWebhook } = require('./controllers/webhookController');

dotenv.config();

// Validate environment variables
const requiredEnvVars = ['MONGODB_URL', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const app = express();

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl);
  console.log('Request Headers:', req.headers);
  next();
});

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
     'https://regno-hospital-app.vercel.app/',
      // For local development
      'http://localhost:5173' // For Vite-based local development
    ];
    console.log('Request Origin:', origin); // Log the incoming origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  maxAge: 1800,
  optionsSuccessStatus: 204 // Handle preflight requests
};

// Apply CORS middleware globally
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Explicitly handle preflight requests for all routes

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/user', userRoutes);
app.use('/api/docOnly', docRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Handle 404 errors
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Custom error handler to ensure CORS headers are included
app.use((err, req, res, next) => {
  console.error('Error:', err.message, err.stack); // Log full error details
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Ensure CORS headers are included in error responses
  const origin = req.get('origin');
  const allowedOrigins = [
    'https://regno-hospital-app.vercel.app',
    'https://regno-hospital-app.vercel.app/',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  }
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});



// const express = require('express');
// const cookieParser = require('cookie-parser');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');

// const errorHandler = require('./middleWares/errorMiddleWare');
// const userRoutes = require('./routes/userRoutes');
// const docRoutes = require('./routes/docRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
// const { stripeWebhook } = require('./controllers/webhookController');
// dotenv.config();

// const app = express();

// // Stripe webhook raw body (must be before express.json())
// app.use('/api/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // const corsOptions = {
// //   origin: function (origin, callback) {
// //     const allowedOrigins = [
// //       'https://regno-hospital-app.vercel.app', 
// //       'https://regno-hospital-app.vercel.app/',
    
// //     // 'https://regno-hospital-api.onrender.com',
      
   
   
// //     ];
// //     if (!origin || allowedOrigins.includes(origin)) {
// //       callback(null, true);
// //     } else {
// //       console.log(`CORS blocked: ${origin}`);
// //       callback(new Error('Not allowed by CORS'));
// //     }
// //   },
// //   credentials: true,
// //   allowedHeaders: ['Content-Type', 'Authorization'],
// //   allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
// //   maxAge: 1800, // 30 minutes, matching Access-Control-Max-Age
  
// // };




// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       'https://regno-hospital-app.vercel.app',
//     ];
    
//     // Remove trailing slash for comparison
//     const cleanedOrigin = origin?.replace(/\/$/, '');
    
//     if (!origin || allowedOrigins.includes(cleanedOrigin)) {
//       callback(null, true);
//     } else {
//       console.log(`❌ CORS blocked: ${origin}`);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   maxAge: 1800,
// };

// // Apply CORS middleware globally
// app.use(cors(corsOptions));

// // Set Content-Type for all JSON responses globally (optional, if needed)
// // Uncomment if you want to enforce JSON content-type for all responses
// // app.use((req, res, next) => {
// //   res.setHeader('Content-Type', 'application/json;charset=utf-8');
// //   next();
// // });

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URL)
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // Routes
// app.use('/api/user', userRoutes);
// app.use('/api/docOnly', docRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/payment', paymentRoutes);

// app.get('/', (req, res) => {
//   res.send('API is running...');
// });

// app.use(errorHandler);

// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });








