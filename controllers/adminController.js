const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const bcrypt= require('bcrypt');
const User = require('../models/userModal');
const appointmentModel = require('../models/appointmentModels');
const docModel = require('../models/docModel');

// Function to create a JWT for a user





// const appointmentCancel = asyncHandler(async(req,res)=>{
//     const appointmentId = req.user._id
//  const   updateBooking = await appointmentModel.findByIdAndUpdate(appointmentId,
//      {cancel:true}, {new:true})
//         if(!updateBooking){
//             res.status(400)
//             throw new Error('no appointment found')
//         }res.status(200).json({
//             message:"booking is successfully cancel"
//         })
// })








const addDoctor = asyncHandler(async (req, res) => {
  const { name, email, password, speciality, degree, experience, about, fees, address, available, photo } = req.body;

  if ( !name || !email || !password) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const userExist = await User.findOne({ email, });
  if (userExist) {
    res.status(400);
    throw new Error('User already exists');
  }

  // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(password, salt);

  // Create the doctor user


const user = await User.create({
  email,
  password,
  name,
  role: 'doctor'
});


  let doc;
  try {
    doc = await docModel.create({
      user: user._id,
   
      speciality,
      degree,
      experience,
      about,
      fees,
      available,
      photo,
      address,
      date: new Date(),
     // email 
    });
  } catch (error) {
    // If doc creation fails, remove the user to rollback
    await User.findByIdAndDelete(user._id);
    res.status(500);
    throw new Error('Doctor profile creation failed: ' + error.message);
  }

  res.status(201).json({
    message: 'Doctor created successfully',
    user,
    doc
  });
});

//add doctor's photo
const addDocPhoto  = asyncHandler(async(req,res)=>{
  const {photo} = req.body
  const user = await User.findById(req.user._id)
  if(!user){
    res.status(400)
    throw new error('No User Was Found')
  }
  if(user && user.role === 'admin'){
  
    user.photo = photo  || ''
  //const docPhoto = await new user.save()
  const updatedDocPhoto = await docModel.findOne(
  
    { photo: user.photo},
    { new: true } 
    )
    if(!updatedDocPhoto){
      res.status(400)
      throw new Error('No doctor profile found for this user')  
    }
    res.status(200).json({
      message: 'Doctor photo updated successfully',
    //  photo: updatedDocPhoto.photo  
    })
  
  }

})



// const getAllDoctors = asyncHandler(async (req,res)=>{

//   const getDoctors = await docModel.find({})
//   .select('-password')
//   .populate('user')
//   .lean()
//   //.populate('user', 'name email photo role')
//  // .lean();

// const filteredDoctors = getDoctors.filter(doc => doc?.user); // remove broken population

// if (!filteredDoctors?.length) {
//   res.status(400);
//   throw new Error('No valid doctor data found');
// }

// // if(!getDoctors || getDoctors.length === 0){
// //   res.status(404);
// //   throw new Error('No valid doctor data found');
// // }
// res.status(200).json({
//   doctors: getDoctors,
//   message: 'Doctors fetched successfully'
// });


// } )


const asyncHandler = require('express-async-handler');

const getAllDoctors = asyncHandler(async (req, res, next) => {
  try {
    const getDoctors = await docModel
      .find({})
      .select('-password')
      .populate('user', 'name email photo role') // Specify fields to populate
      .lean();

    const filteredDoctors = getDoctors.filter(doc => doc?.user); // Remove broken population

    if (!filteredDoctors?.length) {
      res.status(404); // Use 404 for "not found" instead of 400
      throw new Error('No valid doctor data found');
    }

    res.status(200).json({
      doctors: filteredDoctors, // Use filteredDoctors for consistency
      message: 'Doctors fetched successfully',
    });
  } catch (error) {
    next(error); // Ensure errors are passed to the error handler
  }
});

module.exports = getAllDoctors;









//An API to fetch all appointment 
const appointmentAdmin = asyncHandler(async(req,res)=>{

  const appointment = await appointmentModel.find({})
  .populate('userId', 'name email')     // Include user info
  .populate('docId', 'name email slotDate slotTime fees experience'); 

  if(!appointment || appointment.length === 0){ 
      res.status(404)
      throw new Error('No Appointment was found')
  }res.status(200).json({
      appointment,
      message:"Appointments fetch successfully"
  })
})






// Cancel an appointment (admin action)
// @desc    Get all cancelled appointments
// @route   GET /api/admin/cancelled-appointments
// @access  Private/Admin
const appointmentCancel = asyncHandler(async (req, res) => {
  // Ensure only admin can access this route
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied. Only admins can view cancelled appointments.');
  }

  const cancelledAppointments = await appointmentModel.find({ cancelled: true })
    .populate('userId', 'name email')     // Include user info
    .populate('docId', 'name email');     // Include doctor info

  if (!cancelledAppointments.length) {
    return res.status(404).json({ success: false, message: 'No cancelled appointments found.' });
  }

  res.status(200).json({
    success: true,
    count: cancelledAppointments.length,
    data: cancelledAppointments,
  });
});

  
  module.exports = {
//loginAdmin,

  appointmentAdmin,

  addDoctor,
  addDocPhoto,
  getAllDoctors,
  appointmentCancel
  };
  









