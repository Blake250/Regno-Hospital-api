
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const bcrypt= require('bcrypt')
const User = require('../models/userModal')
const docModel = require('../models/docModel')
const appointmentModel = require('../models/appointmentModels')
const { default: mongoose } = require('mongoose')










// cancel an appointment
const cancelAppointment = asyncHandler(async(req,res)=>{
    const {docId} = req.user._id
    const { appointmentId } = req.body  || req.params
    console.log(`Appointment ID: ${appointmentId}, Doctor ID: ${docId}`)  
    

    if (!appointmentId) {
      res.status(400)
      throw new Error('Appointment ID is required');
    }
    
    if (!docId) {
      res.status(400)
      throw new Error('Doctor ID is required');
    }
    

   
    const appointmentData = await appointmentModel.findById(docId)
    if(!appointmentData){
        res.status(404)
        throw new Error('No Appointment Found')
    }


  //   // check if the appointment intended to be cancel is truly from the same owner of the account
  //  if(appointmentData.docId.toString() !== docId.toString()){
  //       res.status(403)
  //       throw new Error("You are not authorized to cancel this appointment.");
  //   }
 


   // if appointment booking  has been completed 
   if( appointmentData.isCompleted && appointmentData.payment ){
       res.status(400)
     .json({
        cancelled:false,
        message: appointmentData.isCompleted ?
        'appointment process is completed and can not be cancelled' :
        'cancellation is not possible since payment is completed'
   })
   }

   appointmentData.cancelled = true
   await appointmentData.save()
  res.status(200).json({
    success:true,
    message:'Appointment has been successfully cancelled'
  })

})



const getAllDocsBookings = asyncHandler(async (req, res) => {
  const { docId } = req.user._id  || req.params.id  // Assuming you get the doctor ID from the request params or user object  

  if (!docId) {
    res.status(400);
    throw new Error('Invalid doctor ID');
  }
  console.log(`Doctor ID from user: ${docId}`);

  const allAppointments = await appointmentModel.find({ docId }).populate('user', 'name email ');

  if (!allAppointments || allAppointments.length === 0) {
    res.status(404);
    throw new Error('No appointments found for this doctor');
  } 


  // if (   docId.toString() !== allAppointments.docId.toString() ) {
  //   res.status(404);
  //   throw new Error('Not authorized to access these appointments');
  // }
 
  res.status(200).json({
    message: 'appointments fetched successfully',
   allDocBookings: allAppointments
  });
});

 



 const getSingleDocBooking = asyncHandler(async (req, res) => {
  const {docId } = req.params 
  console.log(`Doctor ID from params: ${docId}`); 
 // console.log(`Appointments for doctor ${docId});
  const loggedInUserId = req.user;

  if(!loggedInUserId && loggedInUserId.role !== 'doctor'){
    res.status(401);
    throw new Error("User not authorized");
  } 

  if (!docId) { 
    res.status(400);
    throw new Error("no doctor selected");
  }
console.log(`Doctor ID from params: ${docId}`);  


  //  verify the doctor login details with what we have in the database
  const user = await docModel.findById(loggedInUserId._id )

  if (!user) {
    res.status(404);
    throw new Error("Doctor login details not recognized");
  }

  // if (user.role !== "doctor") {
  //   res.status(403);
  //   throw new Error("Access denied: Only doctors can view appointments");
  // }

  // Ensure doctor is accessing their own data
  if ( user.role !== 'doctor' && user._id.toString() !== docId.toString()) { 
    throw new Error("You are not authorized to view another doctor's appointments");
  }

  // Fetch appointments
  const appointments = await appointmentModel.find({ doctor: docId});
  console.log(`Appointments for doctor :`, appointments);

  if (!appointments || appointments.length === 0) {
    res.status(404);
    throw new Error("No appointments found for this doctor");
  }

  res.status(200).json({
    message: "Appointments fetched successfully",
    appointments,
  });
});









// API to mark that an appointment is completed by a doctor
const bookingCompleted = asyncHandler(async(req,res)=>{
  const  appointmentId = req.body
  const docId  = req.params.id ? req.params.id.trim() : null; // Get the doctor ID from params or user object  
  // Validate input

  if (!mongoose.Types.ObjectId.isValid(docId)) {
    res.status(400);
    throw new Error('Invalid appointment ID format');
  }

 
  if ( !appointmentId) {
    res.status(400);
    throw new Error("No appointment Found");
  }  

  if(!docId){
    res.status(400);
    throw new Error("No Doctor Found"); 
  }

  console.log(`Appointment ID: ${appointmentId}, Doctor ID: ${docId}`); 

  const appointmentData = await appointmentModel.findById(appointmentId)
  if(!appointmentData || appointmentData.docId.toString() !== docId.toString()){
    res.status(400)
    throw new Error( "No appointment was found")
  }
  const updatedDocBooking = await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted:true}, {new:true})
  if(!updatedDocBooking){
    res.status(400)
    throw new Error('booking completion not possible')
  }
  res.json({
    message:'appointment successfully completed'
  })
})


const docList = asyncHandler(async(req,res)=>{
  const doctorList = await docModel.find({}).select(['-email','-password'])
  if(!doctorList.length){
    res.status(400)
    throw new Error('No doctor found')
  }res.status(200).json(
    docList
  )
})


// getting  an about info of a doctor 
const docProfile = asyncHandler(async(req,res)=>{
  const docId= req.params.id
  if(!docId){
    res.status(400)
    throw new Error('invalid doc id')
  }
  const docInfo = await docModel.findById(docId).select('-password')
  if(!docInfo){
    res.status(404)
    throw new Error('no doctor found')
  }res.status(200).json(docInfo)
})



//to change availability for admin and doctor panel
const changeDocAvailability = asyncHandler(async(req,res)=>{
  const {docId} = req.body 


if(!docId){
  res.status(400)
  throw new Error('invalid user')
}
const doctor = await docModel.findById({docId})
if(!doctor){
  res.status(400)
  throw new Error('No doctor Found')
}
const updatedData =  await docModel.findByIdAndUpdate(docId, {available:!doctor.available}, {new:true} )
if(!updatedData){
  rs.status(400)
  throw new Error(`doctor available is not change`)

}
res.status(200).json({
  message:'doctor availability changed successfully',
  doctor: updatedDoctor
})


})




const updateDoctorProfile = asyncHandler(async(req,res)=>{ 

    const { docId, fees, address, available } = req.body;

    // Validate input
    if (!docId) {
      return res.status(400).json({ success: false, message: "Doctor ID is required" });
    }

    // If address is sent as a string, parse it
    const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;

    // Update the doctor profile
    const updatedDoctor = await docModel.findByIdAndUpdate(
      docId,
      {
        ...(fees !== undefined && { fees }),
        ...(available !== undefined && { available }),
        ...(address && { address: parsedAddress })
      },
      { new: true } // Return the updated document
    );

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      doctor: updatedDoctor
    });

  
})


//const docList 


module.exports = {
 
   cancelAppointment,
   bookingCompleted,
   docList, 

  changeDocAvailability,
   docProfile,
   updateDoctorProfile,
   getAllDocsBookings,
  // getBookedDoc,
   getSingleDocBooking,
  
}


