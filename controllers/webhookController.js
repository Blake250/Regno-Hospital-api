
const express= require('express');
const dotenv= require('dotenv')
const appointmentModel = require('../models/appointmentModels');
const expressAsyncHandler = require('express-async-handler');
const { default: mongoose } = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

dotenv.config();   




const endPointSecret = process.env.WEBHOOK_SECRET;
if(endPointSecret){
  console.log(`here is my ${endPointSecret}`)
}else{
  console.log(`No end Point secret found`)
}










// const stripeWebhook = expressAsyncHandler(async (req, res) => {
//   const sig = req.headers['stripe-signature'];

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error('Webhook signature verification failed.', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//    // return res.sendStatus(400);
//   }

//   if (event.type === 'payment_intent.succeeded') {
//     const paymentIntent = event.data.object;

//     const appointmentId = paymentIntent.metadata.appointmentId;

//     if (mongoose.Types.ObjectId.isValid(appointmentId)) {
//       const appointment = await appointmentModel.findById(appointmentId);
//       if (appointment && !appointment.payment) {
//         appointment.payment = true;
//         await appointment.save();
//       }
//     }
//   }

//   res.sendStatus(200);
// });








const stripeWebhook = expressAsyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endPointSecret );
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
  console.log("💰 PaymentIntent Succeeded:", paymentIntent.id);

    const appointmentId = paymentIntent.metadata.appointmentId;
    console.log("📅 appointmentId from metadata:", appointmentId);

    if (mongoose.Types.ObjectId.isValid(appointmentId)) {
      const appointment = await appointmentModel.findById(appointmentId)
        .populate('userId')   // Populate user info
        .populate({
          path:'docId',
          populate:{
            path:'user',
            model :'User',
            select:'name email photo'
          }
        }


        );   // Populate doctor info

      if (appointment && !appointment.payment) {
        // ✅ Mark payment complete
        appointment.payment = true;
      //  appointment.paymentMethod = 'stripe'; // optional
        await appointment.save();

        // 🧾 Compose message
        const userName = appointment.userId?.name || "Unknown User";
        const doctorName = appointment.docId?.user?.name || "Unknown Doctor";
        const slotDate = appointment.slotDate;
        const slotTime = appointment.slotTime;

        const message = `${userName} paid via Stripe for an appointment with ${doctorName} on ${slotDate} at ${slotTime}.`;

        console.log(message); // You can log it

        // 📧 Optional: send email here using nodemailer (see below)
        // 🗄️ Optional: save message to a `notifications` or `paymentLogs` collection
      }
    }
  }


  res.status(200).json({
            message: "Webhook received successfully",
            event: event.type,
        });
        res.send().end();
        });
    
  // res.sendStatus(200);
// });




 module.exports = {
stripeWebhook
}




