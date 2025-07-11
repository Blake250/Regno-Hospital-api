const express = require('express')
const { protect, doctorsOnly } = require('../middleWares/authMiddleWare')
const {  cancelAppointment,
 
     doctorProfile, 
     bookingCompleted, 
     docList, 
     docProfile,
    updateDoctorProfile,
     changeDocAvailability,
  
    getAllDocsBookings} = require('../controllers/docsController')

const router = express.Router()
// //const doctorsOnly =





//router.get('/doc-booked/:id', protect,  doctorsOnly, getSingleBooking )
router.get('/doc-booked/:docId', protect,  doctorsOnly, getAllDocsBookings  )
router.patch('/cancel-appointment', protect,  doctorsOnly, cancelAppointment)
router.patch('/complete', protect, doctorsOnly, bookingCompleted  )
router.get('/doc-list', protect, doctorsOnly, docList )

router.get('/doc-profile/:id', protect, doctorsOnly, docProfile )
router.post('/doc-update', protect, doctorsOnly, updateDoctorProfile )
router.patch('/doc-list', protect, doctorsOnly, changeDocAvailability )
 //router.post('/doc-login',  loginDoc)






   



module.exports = router
