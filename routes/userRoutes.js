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

router.get('/fetch-doc/:id', getOneDoctor)  


router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser )
router.get('/get-status', getLoginStatus)
router.get('/get-docs',  getAllDoctors);
router.post('/doc-booking/:docId',  bookAppointment )
router.get('/get-user', protect, getUser )

router.get('/appointments/:id', protect, getSingleBooking)  
router.patch('/update-user', protect,updateUser)
router.patch('/update-photo', protect, updatePhoto)

router.get('/appointments',protect, getAllBookings)  


router.patch('/cancel-doc', protect,  cancelAppointment  )

router.patch('/:appointmentId/payment-method', protect, updatePaymentMethod);




module.exports = router



