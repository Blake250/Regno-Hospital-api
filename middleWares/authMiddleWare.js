// middleWares/authMiddleWare.js
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModal');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Token not provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(error.message === 'Token not provided' ? 401 : 403);
    next(error);
  }
});

const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
});

const doctorsOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a doctor');
  }
});

module.exports = { protect, adminOnly, doctorsOnly };







// const jwt = require('jsonwebtoken')
// const asyncHandler = require('express-async-handler')
// const User = require('../models/userModal');




// // const secretKey = process.env.SECRET_KEY || '234566778891099'
// // console.log(`here we have  the ${secretKey}`)




// const protect = asyncHandler(async (req, res, next) => {
//     let token;
  
//     // Try to get from Authorization header first
//     if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
//       token = req.headers.authorization.split(" ")[1];
//     } else if (req.cookies &&  req.cookies.token) {
//      token = req.cookies.token;
//     //  console.log(`i have my ${token}here`)
     
//     }
//     //console.log(`i have my ${token}here`)
  
//     if (!token) {
//       res.status(401);
//       throw new Error("Token not provided");
//     }
  
//     try {
//       const decoded = jwt.verify(token, process.env.SECRET_KEY || '234566778891099');
//       //console.log(`i have my ${ JSON.stringify( decoded) }here`)

//       const user = await User.findById(decoded.id).select("-password");
//     //  console.log(`we have the new user${user} here`)
//       if (!user) {
//         res.status(401);
//         throw new Error("User not found");
//       }
//       req.user = user;
//       next();
//     } catch (error) {
//       res.status(401);
//       console.log(`this is the ${error.message}`)
//       throw new Error("Not Authorized, Token Invalid");
//     }
//   });
  






// //For Admin Only
// const adminOnly = asyncHandler((req,res, next)=>{
//     if(req.user && req.user.role === 'admin'){
//          next()
//     }
//     else{
//         res.status(401)
//         throw new Error('Unauthorized Login  Details As An admin')

//     }
// })


// const doctorsOnly = asyncHandler((req,res,next)=>{
//   if(req.user && req.user.role==='doctor'){
//     next()
//   }else{
//     res.status(401) 
//     throw new Error('Unauthorized Login  Details As A Doctor')

//   }
// })










// module.exports ={
//     protect,
//     adminOnly,
//     doctorsOnly
// }