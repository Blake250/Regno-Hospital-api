
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const dotenv= require('dotenv')
const bcrypt = require('bcryptjs')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY) // Import Stripe with your secret key 
const User = require('../models/userModal')
const docModel = require('../models/docModel')
const appointmentModel = require('../models/appointmentModels')
const   mongoose  = require('mongoose')
const { appointmentSuccessEmail } = require('../emailTemplate/appointmentTemplate')
const sendEmail = require('../util/sendEmail')




dotenv.config() 

const TOKEN_EXPIRES_IN_DAYS = 30; // how many days the token and cookie last



const generateToken = (id)=>{
return   jwt.sign({id:id}, process.env.SECRET_KEY, {expiresIn : `${TOKEN_EXPIRES_IN_DAYS}d`})  
}


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password ,role } = req.body;

    const userRole = role || 'customer'; // Default to 'customer' if no role is provided
    // const { speciality, degree, experience, about, photo, fees, address, available

    // Validate inputs
    if (!name || !email || !password ) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters");
    }

    
    // Check if user already exists
    const userExists = await User.findOne({ email:email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists, please login");
    }


  //create user
    const user = await User.create({
        name,
        email,
        password,
        role :userRole, // Set the role to 'customer' or 'admin'

    });
    console.log(`this is the user: ${user.role} for this user `)

    console.log("Hashed password:", user.password);
 
    // Generate a token
    const token = generateToken(user._id);

    if(user ){
      
    
    // Send token in cookies
    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
      //  secure: process.env.NODE_ENV !== 'production',
      expires: new Date(Date.now() + 1000 * 86400 * `${TOKEN_EXPIRES_IN_DAYS}` ),
       secure:true,
       sameSite: 'none', 
   
       
   
    })

    // Send response
    res.status(201).json({
        user: {  
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role ,
        },
      
    
    })

}
else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});










const loginUser = asyncHandler(async(req,res)=>{
const {email, password, role} = req.body
//let user;

    // ensure the user enters a valid  email and password
    if(!email || !password){
        res.status(400)
        throw new Error('Please Enter Valid Email And Password')

    }

    
    // ensure the user exist in the DB
const  user = await User.findOne({email:email})


    // throw an error if a user doesn't exist
    if(!user){
        res.status(400)
        throw new Error('User does not exist..')

    }


    // // a check to ensure the user's password correspond to that in the DB


    const passwordIsCorrect = await bcrypt.compare(password, user?.password);
    console.log('   bcrypt.compare →', passwordIsCorrect);
    

    // generate a token for the user
    const token = generateToken(user._id)
   //console.log(`The token looks like this ${token}`)

    //ensure the password isn't sent back to the user
    if(user && passwordIsCorrect){
  
        res.cookie('token', token,{
            path:'/',
            httpOnly:true,
           // sameSite:'lax',
           expires:new Date(Date.now() + 1000 * 86400 * `${TOKEN_EXPIRES_IN_DAYS}`),
         
       
              secure:true,
           sameSite: 'none',
           
          
        })    
        
        res.status(201).json({user  
          :{
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        message:'login successful',
        token:token
    })

    }else{
        res.status(400)
        throw new Error('invalid login details')
    }

})



// logging out the user
const logoutUser = asyncHandler(async(req, res)=>{
    res.cookie('token', '',{
        path:'/',
        httpOnly:true,
        expires:new Date(0) ,
       
       
    })

    res.status(201).json({
     message:'successfully logged out'
    }
       
    )
})




// Get user details
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
 
  if (user) {
    res.status(201).json({
        user:user
    });
  } else {
    res.status(400);
    throw new Error("User not found...");
  }
});


// const getUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);
 
//   if (user) {
//     res.status(201).json({
//       user:{
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         photo: user.photo,
//         phone: user.phone,
        
//       }
//     });
//   } else {
//     res.status(400);
//     throw new Error("User not found...");
//   }
// });







const getLoginStatus = asyncHandler(async (req, res) => {
    console.log("Cookies in /get-status route:", req.cookies);

  // console.log(req.cookies)
    const token = req.cookies ? req.cookies.token : '';
 //console.log(`it looks like this ${token}`)
  
    // if (!token ) {
    //   return res.status(401).json({
    //     isLoggedIn: false,
    //     message: 'No Token Provided',
    //   });
    // }
  
    if (!token) {
      return res.json(false);
    }


    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
   //  console.log(`the ${JSON.stringify(decoded )} was successful`)
  
//return
     res.status(200).json({
        isLoggedIn: true,
        message: 'User is Logged In',
        user: decoded,
      });
   
    } catch (error) {
        console.log('JWT verification failed:', error.message)
      return res.status(401).json({
        loggedIn: false,
        message:error.message
      });
    }
  });
  

// updating the user's data
const updateUser = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id) 
    if(!user){
      res.status(400)
      throw new Error('User Not Found')
    }

    if(user){
        // updating the scalar fields
        const {name, phone, email, dob, gender} = user
        user.name = req.body.name || name
        user.phone = req.body.phone || phone
        user.email = req.body.email || email
        user.gender = req.body.gender || gender
        user.dob = req.body.dob  || dob

  
      if (req.body.address) {
        if (!user.address) {
            user.address = {}; // Initialize address if it doesn't exist
        }
        user.address.line1 = req.body.address.line1 || user.address.line1;
        user.address.line2 = req.body.address.line2 || user.address.line2;
    }
    

        const updatedUser = await user.save()
        res.status(200).json(updatedUser)
    }else{
        res.status(400)
        throw new Error('User Info not updated')
    }


})



const updatePhoto = asyncHandler(async(req,res)=>{  
    const user  = await User.findById(req.user._id) 
    if(!user){
      res.status(400)
      throw new Error('User Not Found')
    }     
    if(user){


        user.photo = req.body.photo || user.photo 
        const updatedPhoto = await user.save()  
        res.status(200).json(updatedPhoto)  
    }else{      
        res.status(400)
        throw new Error('User Photo not updated')
    }
})



// const updatePhoto = asyncHandler(async (req, res) => {
//   const { photo } = req.body;

//   if (!photo) {
//     return res.status(400).json({ message: 'No Photo Found' });
//   }

//   const user = await User.findById(req.user._id);
//   if (!user) {
//     return res.status(404).json({ message: 'User not found' });
//   }

//   user.photo = photo;
//   const updatedUser = await user.save();

//   res.status(200).json({
//     message: "Photo updated successfully",
//     photo: updatedUser.photo,
//   });
// });



  



const bookAppointment = asyncHandler(async (req, res) => {
    const {paymentMethod, slotDate, slotTime} = req.body;
  const docId= req.params.docId? req.params?.docId.trim() : req.params?.docId ;  
//    const { docId } = req.params;
  const userId= req.user._id 
   console.log(`The doc ID IS ${docId} and the userID is ${userId}`)


      // Check if slotData and slotTime are received correctly
      if (!slotTime) {
        return res.status(400).json({ message: 'Missing time slot  ' });
      }
  

      if (!slotDate) {
        return res.status(400).json({ message: 'Missing   date slot ' });
      }


    if (!docId) {
        res.status(400);
        throw new Error('Invalid doctor ID')

    }
   console.log( `the docId is ${docId}`)

  
   if (!mongoose.Types.ObjectId.isValid(docId)) {
    res.status(400);
    throw new Error('Invalid doc ID format');
  }
        let docData;
     docData = await docModel.findById(docId).populate('user', 'name email');  
     console.log(`The doctor data is ${docData}`)
    if (!docData?.available) {
        res.status(404);
        throw new Error('Doctor not found');
    }

    const userData = await User.findById(userId).select(`-password`);  
   console.log(`i have the ${userData} now`)
    if (!userData) {
        res.status(400);
        throw new Error('User not found');
    }

    const slot_booked = docData.slot_booked || {};
    if (slot_booked[slotDate]?.includes(slotTime)) {
        res.status(400);
        throw new Error('Time slot not available');
    } 

    slot_booked[slotDate] = [...(slot_booked[slotDate] || []), slotTime];

     docData = await docModel.findByIdAndUpdate(docId, { slot_booked: slot_booked }, {new:true} ).populate('user', 'email name')
    //  .populate({
    //   path:'user',
    //   populate:{
    //     path:'docId',
    //     model:'User',
    //   //  select: ''

    //   }
    //  });


     if (!docData) {
      res.status(500);
      throw new Error('Failed to update doctor with new slot');
    }
     
  //  const deletedBooking =  delete docData.slot_booked

//console.log(`This booking with Id number ${deletedBooking} has been deleted`)

    const appointmentData = {
        userId,
        docId:docData._id,
        slotDate,
        slotTime,
        amount: docData.fees,
        userData,
        docData,
        date: new Date(),
       paymentMethod,
       // description
  
    };

  const newAppointment = await new appointmentModel(appointmentData).save();

    if(!newAppointment){
      res.status(400)
      throw new Error(`booking unsuccessful`)
    }

    const subject = 'new order successfully  booked on Regno hospital'
  const  send_to =  userData.email || 'ozoekwecelestine@gmail.com'
 //  const template = appointmentSuccessEmail(userData?.name, slotDate,slotTime )
 const template = appointmentSuccessEmail(userData?.name, newAppointment);

 const reply_to = 'no_reply@gmail.com'


 await sendEmail(subject, send_to, template, reply_to)

    res.status(200).json({
        message: 'Appointment booked successfully',
        appointment: newAppointment,
    });
});



// Canceling an appointment
const cancelAppointment = asyncHandler(async (req, res) => {
    const { appointmentId,  } = req.body;
    const loggedInUser = req.user._id 
    const appointmentData = await appointmentModel.findById(appointmentId);

    // If no appointment is found
    if (!appointmentData) {
        res.status(400);
        throw new Error('No Appointment Found');
    }

    // // Check if the user is authorized
    // if ( (loggedInUser.toString() !== 'customer' )  && loggedInUser.toString() !== appointmentData.userId.toString()) {  
    //     res.status(400);
    //     throw new Error('User not authorized');
    // }

    // Cancel the appointment in the database
    const getBooking = await appointmentModel.findByIdAndUpdate(
        appointmentId, 
        { cancelled: true },  
        { new: true } ,
        {runValidators: true } );

    if (!getBooking) {
        res.status(400);
        throw new Error(`Appointment Not Available`);
    }

    // Extract necessary details from the updated booking
    const { docId, slotDate, slotTime } = getBooking;

    // Fetch the doctor's data from the database
   // const docData = await docModel.findById( docId );

  const docData =  await docModel.findByIdAndUpdate(
    docId,
    {
      $pull: {
        [`slot_booked.${slotDate}`]:slotTime
      }
    },
    { new: true, runValidators: true }  
  );
  
    if (!docData) {
        res.status(400);
        throw new Error(`No Doctor Found`);
    }

    // Remove the canceled slot from the doctor's schedule
    if (docData.slot_booked[slotDate]) {
        docData.slot_booked[slotDate] = docData.slot_booked[slotDate].filter(e => e !== slotTime);

    //  await  docData.markModified('slot_booked');
        
        // Save the updated doctor data
        await docData.save();
        
        console.log(`The appointment slot ${slotTime} on ${slotDate} has been canceled.`);
    }

    res.status(200).json({
        success: true,
        message: "Appointment canceled successfully",
    });
});






const getSingleBooking = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id ?  req.params.id?.trim() : req.params.id
  const userId = req.user._id;

  if (!userId) {
    res.status(400);
    throw new Error('No user ID found');
  }

  if (!appointmentId) {
    res.status(400);
    throw new Error('No appointment ID found');
  }

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    res.status(400);
    throw new Error('Invalid appointment ID format');
  }

  const user = await User.findById(userId)
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const appointmentData = await appointmentModel.findById(appointmentId).populate('userId'
    
  ).populate({
  path :  'docId',
  populate :{
    path:'user',
    model: 'User',
    select : 'name email'
  }

  })


  if (!appointmentData) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // if (appointmentData.userId.toString() !== userId.toString()) {
  //   res.status(403);
  //   throw new Error('Access denied: Appointment does not belong to you');
  // }

  res.status(200).json({
    message: 'Appointment found',
    appointmentData: appointmentData
  });
});






const getAllBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select('-password')
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // if (user.role !== 'customer' || 'admin') {
  //   res.status(403);
  //   throw new Error('Access denied: Not a customer');
  // }

  // Now find all appointments where this doctor is involved
  const bookings = await appointmentModel.find({ userId: userId }).sort({ createdAt: -1 }) 
  .populate('userId', 'name user')
  .populate({
    path: 'docId',
    populate: {
      path: 'user',
      model: 'User', 
      select: 'name email photo'
    }

 } )
  //.populate('docId', 'name user')


  // if (!bookings || bookings.length === 0) {
  //   res.status(404);
  //   throw new Error('No Bookings Found');
  //   next();
  // }
 


  res.status(200).json({
    bookedData : bookings
  });
});




const getOneDoctor = asyncHandler(async(req,res)=>{
  const  docIdData = req.params.id ? req.params.id.trim() : req.params.id

  if (!mongoose.Types.ObjectId.isValid(docIdData)) {
    res.status(400);
    throw new Error('Invalid DOC ID format');
  }
  

  if(!docIdData){
    res.status(400)
    throw new Error(`doctor not found`)
  }
  const getDocData = await docModel.findById(docIdData).select(`-password`).populate('user')

  if(!getDocData){
    res.status(404)
    throw new Error(`doctor data not found...`)
  }
  res.status(200).json({
  fetchedDoc :    getDocData

  })
})











const updatePaymentMethod = asyncHandler(async (req, res) => {
  console.log("Raw body:", req.body);

  const { appointmentId } = req.params 
  const paymentMethod = req.body?.paymentMethod?.trim()?.toLowerCase();
//   const paymentMethodRaw = req.body?.paymentMethod;
// const paymentMethod = typeof paymentMethodRaw === 'string' ? paymentMethodRaw.trim().toLowerCase() : null;


  const validMethods = ['stripe', 'paypal'];

  console.log(`Appointment ID: ${appointmentId}`);
  console.log(`Payment Method: ${paymentMethod}`);

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    res.status(400);
    throw new Error('Invalid appointment ID format');
  }
  

  // ✅ Validate payment method
  if (!paymentMethod) {
    res.status(400);
    throw new Error('Payment method is required.');
  }

  if (!validMethods.includes(paymentMethod)) {
    res.status(400);
    throw new Error('Invalid payment method. Must be "stripe" or "paypal".');
  }

  // ✅ Update the appointment and return the updated document
  const updatedAppointment = await appointmentModel.findByIdAndUpdate(
    appointmentId,
    { paymentMethod },
    { new: true }
  )
    .populate('userId', 'name email')
    //.populate('docId', 'name email ' )
    .populate({
      path: 'docId',
      populate: {
        path: 'user',
        model: 'User',
        select: 'name email '
      }
    });

  if (!updatedAppointment || updatedAppointment.cancelled) {
    res.status(404);
    throw new Error('Appointment not found or already cancelled.');
  }


  console.log(`✅ Payment method updated to: ${updatedAppointment.paymentMethod}`);


  res.status(200).json({
    message: 'Payment method updated successfully.',
    updated: updatedAppointment,
  });
});







const getAllDoctors = asyncHandler(async (req, res, next) => {
  try {
    console.log('Fetching doctors for user:', req.user?._id || 'No user');
    
    // Fetch doctors with populated user data
    const getDoctors = await docModel
      .find({})
      .select('-password')
      .populate('user', 'name email photo role')
      // .populate({
      //   path: 'user',
      //   select: 'name email photo role',
      //   model: 'User', // Explicitly specify model to avoid schema issues
      // })
      // .lean()

    console.log('Raw doctors fetched:', getDoctors?.length);

    // Filter out doctors with invalid or missing user references
    const filteredDoctors = getAllDoctors && getDoctors?.filter((doc) => {
      if (!doc?.user) {
        console.warn('Doctor with missing user data:', doc?._id);
        return false;
      }
      return true;
    });

    if (!filteredDoctors?.length) {
      console.log('No valid doctors found');
      res.status(404);
      throw new Error('No valid doctor data found');
    }

    console.log('Filtered doctors:', filteredDoctors?.length);
    res.status(200).json({
      doctors: filteredDoctors,
      message: 'Doctors fetched successfully',
    });
  } catch (error) {
    console.error('getAllDoctors error:', error.message, error.stack);
    next(error); // Pass to error middleware
  }
});











module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    getLoginStatus,
    updateUser,
    updatePhoto,
    bookAppointment,
    cancelAppointment,
    getSingleBooking,
   getAllBookings,
   getOneDoctor,
  updatePaymentMethod , 
  getAllDoctors,  
//    payWithStripe,
// verifyStripePayment
}
