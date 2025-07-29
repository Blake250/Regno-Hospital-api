const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const bcrypt= require('bcrypt');
const User = require('../models/userModal');
const appointmentModel = require('../models/appointmentModels');
const docModel = require('../models/docModel');

// Function to create a JWT for a user






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




// get all doctors registered by admin
const getAllDocsByAdmin = asyncHandler(async (req, res) => {
  const doctorList = await docModel.find({}).populate('user', 'name email');
  console.log(`Fetched ${doctorList.length} doctors from the database.`);
  if (!doctorList || doctorList?.length === 0) {
    res.status(404);
    throw new Error('No doctors found');
  }
  res.status(200).json({
    // success: true,
    // count: doctorList.length,
    doctors: doctorList,
  });
});








//An API to fetch all appointment 
const appointmentAdmin = asyncHandler(async(req,res)=>{

  const appointment = await appointmentModel.find({})
  .populate('userId', 'name email')     // Include user info
  .populate('docId', 'name email')     // Include doctor info 
 // .populate('docId', 'name email slotDate slotTime fees experience'); 

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
  getAllDocsByAdmin,
  appointmentCancel
  };
  









