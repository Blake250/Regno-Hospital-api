const express = require('express')
const { protect } = require('../middleWares/authMiddleWare')
const { payWithStripe, verifyStripePayment, verifyPaypalPayment,  } = require('../controllers/paymentController.js')


const router = express.Router()


//router.get('/stripe-pay/:appointmentId',protect, payWithStripe)
router.get('/stripe-pay/:appointmentId',protect, payWithStripe)
router.get('/verify-stripe/:appointmentId', protect,  verifyStripePayment )
router.post('/paypal-verify/:appointmentId', protect, verifyPaypalPayment);
//router.put('/:appointmentId/payment-method', protect, updatePaymentMethod);













module.exports = router