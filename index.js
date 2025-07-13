const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const cors = require('cors');

const errorHandler = require('./middleWares/errorMiddleWare');
const userRoutes = require('./routes/userRoutes');
const docRoutes = require('./routes/docRoutes');
const adminRoutes = require('./routes/adminRoutes');
//const webhookRoutes = require('./routes/webhookRoute');
const paymentRoutes = require('./routes/paymentRoutes');
const { stripeWebhook } = require('./controllers/webhookController');
const appointmentModel = require('./models/appointmentModels');

const app = express();

// Stripe webhook raw body (must be before express.json())
app.use('/api/webhook', express.raw({ type: 'application/json' }), stripeWebhook );

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigin = [
    //  'http://localhost:5173',
    //  'http://localhost:5000',
  'https://regno-hospital-app.vercel.app',
  'https://regno-hospital-api.onrender.com'
 
    ];
    if (!origin || allowedOrigin.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Cors blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
};
app.use(cors(corsOptions));




// async function backfillCreatedAt() {
//   try {
//     const result = await appointmentModel.updateMany(
//       { createdAt: { $exists: false } }, // Only update documents without createdAt
//       { $set: { createdAt: new Date() } } // Set to current date
//     );
//     console.log(`✅ Backfill complete: ${result.modifiedCount} documents updated.`);
//   } catch (error) {
//     console.error('❌ Error during backfillCreatedAt:', error);
//   }
// }


// MongoDB connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

  // mongoose.connect(process.env.MONGODB_URL)
  // .then(async () => {
  //   console.log('MongoDB connected');

  //   // 🔁 TEMPORARY: Run backfill once
  //   await backfillCreatedAt();
  // })
  // .catch((err) => console.error('MongoDB connection error:', err));






// Routes
app.use('/api/user', userRoutes);
app.use('/api/docOnly', docRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
//app.use('/api/webhook', webhookRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
  
















