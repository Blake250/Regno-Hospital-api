
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'appointment',
      required: true
    },

    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'doctor',
      required: true
    },

    description: {
      type: String,
      required: false,
      default: ''
    },

    paymentMethod: {
      type: String,
      required: false,
      enum: ['stripe', 'paypal'],
      trim: true
    }
  },
  {
    timestamps: true // ✅ This is the correct place for timestamps
  }
);

const paymentModel = mongoose.models.payment || mongoose.model("payment", paymentSchema);

module.exports = paymentModel;





// const mongoose = require('mongoose')




// const paymentSchema = new mongoose.Schema({
//     // userId: { type: String, required: true },
//     appointmentId:{
//      type:mongoose.Schema.Types.ObjectId,
//      ref:'appointment',
//      required:true
//     },

//     docId:{
//      type:mongoose.Schema.Types.ObjectId,
//      ref:'doctor',
//      required:true
//     },
    

//       description: {
//         type:String,
//          default : false,
//         required: false
//         },

//      paymentMethod:{
//       type:String,
//     required:false ,
//       enum:['stripe','paypal'], 
    
//       trim :true
     

//   },

   
  
//  } 
//  {
//   timestamps: true
// },


// )
 
 
 
 
//  const paymentModel = mongoose.models.appointment || mongoose.model("appointment", paymentSchema)
 
//  module.exports =  paymentModel   
