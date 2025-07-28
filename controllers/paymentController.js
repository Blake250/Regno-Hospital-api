
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const dotenv= require('dotenv')
const bcrypt = require('bcryptjs')
const appointmentModel = require('../models/appointmentModels')
const User = require('../models/userModal')
const { default: mongoose } = require('mongoose')
//dotenv.config(); 

const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)




const payWithStripe = asyncHandler(async (req, res) => {
  console.log("req Body:", req.body);

  const userId = req.user._id;
  const appointmentId = req.params.appointmentId || req.query.appointmentId || req.body.appointmentId;

  console.log(`Incoming appointmentId: ${appointmentId}`);
  console.log("req.user:", req.user);

  if (!appointmentId) {
    res.status(400);
    throw new Error("Appointment ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    res.status(400);
    throw new Error("Invalid appointment ID format");
  }

  const user = await User.findById(userId).select("-password");

  const appointmentData = await appointmentModel.findById(appointmentId)
    .populate("userId", "name email")
    .populate({
      path: 'docId',
      populate: {
        path: 'user', // ✅ FIXED
        model: 'User', // ✅ FIXED
        select: 'name email photo'
      }
    });

  if (!appointmentData || appointmentData.cancelled) {
    res.status(404);
    throw new Error("No appointment found or appointment cancelled");
  }

  // if (!user || appointmentData.userId.toString() !== user._id.toString()) {
  //   res.status(403);
  //   throw new Error("User not authorized or appointment not found");
  // }

  if (appointmentData.payment) {
    res.status(400);
    throw new Error("Payment already made");
  }

  const description = `Payment for appointment with Dr. ${appointmentData.docId?.user?.name || 'Unknown Doctor'}`;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(appointmentData.amount * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true },

    metadata: {
      appointmentId: appointmentData._id.toString(),
    },
    description,
    receipt_email: user.email
  });

  if (!paymentIntent?.client_secret) {
    res.status(500);
    throw new Error("Stripe payment intent creation failed");
  }

 // appointmentData.payment = true
//  appointmentData.payment = true;
// await appointmentData.save(); 

  res.status(200).json({
    clientSecret: paymentIntent.client_secret
  });
  // res.send({
  //   clientSecret: paymentIntent.client_secret,
  // })

});

 


  
  
  const verifyStripePayment = asyncHandler(async (req, res) => {
    const { success, appointmentId } = req.query;
  
    if (success === 'true') {
      const updatedAppointment = await appointmentModel.findByIdAndUpdate(
        appointmentId,
        { payment: true },
        { new: true }
      );
  
      if (!updatedAppointment) {
        return res.status(400).json({ message: 'Appointment not found' });
      }
  
      res.status(200).json({
        message: 'Payment successful',
        appointment: updatedAppointment,
      });
    } else {
      res.status(400).json({ message: 'Payment failed or cancelled' });
    }
  }); 








//paypal payment

const verifyPaypalPayment = asyncHandler(async (req, res) => {
  const { orderID } = req.body;
  const {appointmentId} = req.params || req.body

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    res.status(400);
    throw new Error("Invalid appointment ID");
  }

  // Step 1: Get access token from PayPal
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');

  const tokenRes = await axios.post(`${process.env.PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  });

  const accessToken = tokenRes.data.access_token;

  // Step 2: Get order details
  const orderRes = await axios.get(`${process.env.PAYPAL_API}/v2/checkout/orders/${orderID}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const orderStatus = orderRes.data.status;
 
  if (orderStatus !== 'COMPLETED') {
    res.status(400);
    throw new Error('Payment not completed.');
  }

  // Step 3: Mark appointment as paid
  const updatedAppointment = await appointmentModel.findByIdAndUpdate(
    appointmentId,
    { payment: true },
 //   {paymentStatus:true},
    { new: true }
  );

  if (!updatedAppointment   || updatedAppointment.cancelled) {
    res.status(404);
    throw new Error('Appointment not found');
  }


  if (updatedAppointment.payment) {
    return res.status(400).json({ message: 'Payment already completed' });
  }

  res.status(200).json({
    message: 'Payment verified and marked as paid',
    appointment: updatedAppointment
  });
});




   


  
  
  module.exports = {
    payWithStripe,
    verifyStripePayment,
    verifyPaypalPayment
  //updatePaymentMethod 
  }