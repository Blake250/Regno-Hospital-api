const express = require('express')
const { registerUser, 
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
     updatePaymentMethod,
     getAllDoctors} = require('../controllers/user')
const { protect, doctorsOnly } = require('../middleWares/authMiddleWare')



const router = express.Router()






// route configurations
router.get('/appointments/:id', protect, getSingleBooking)  
router.get('/fetch-doc/:id',protect, getOneDoctor)  
router.post('/doc-booking/:docId', protect,  bookAppointment )

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser )
router.get('/get-user',getUser )
router.get('/get-status', getLoginStatus)


router.patch('/update-user', protect,updateUser)
router.patch('/update-photo', protect, updatePhoto)

router.get('/appointments',protect, getAllBookings)  

<<<<<<< HEAD
router.get('/get-docs', protect, getAllDoctors);
=======
router.get('/get-docs',protect,  getAllDoctors);
>>>>>>> 523d5a798bc63b67b3147ff907c1a962ff16269e

router.patch('/cancel-doc', protect,  cancelAppointment  )

router.patch('/:appointmentId/payment-method', protect, updatePaymentMethod);




module.exports = router



