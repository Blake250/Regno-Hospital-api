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
     updatePaymentMethod} = require('../controllers/user')
const { protect, doctorsOnly } = require('../middleWares/authMiddleWare')
const {getAllDoctors} = require('../controllers/adminController')


const router = express.Router()






// route configurations
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser )
router.get('/getUser',protect, getUser )
router.get('/get-status', getLoginStatus)


router.patch('/update-user', protect,updateUser)
router.patch('/update-photo', protect, updatePhoto)

router.post('/doc-booking/:docId', protect,  bookAppointment )

router.get('/appointments',protect, getAllBookings)  
router.get('/fetch-doc/:id',protect, getOneDoctor)  


router.get('/appointments/:id', protect, getSingleBooking)  



router.patch('/cancel-doc', protect,  cancelAppointment  )

router.patch('/:appointmentId/payment-method', protect, updatePaymentMethod);

//router.get('/get-docs', protect, getAllDoctors);



module.exports = router



