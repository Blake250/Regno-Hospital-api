
const express = require('express')
const { loginAdmin, appointmentAdmin, appointmentCancel, addDoctor, addDocPhoto,  getAllDoctors } = require('../controllers/adminController')
const { protect, adminOnly } = require('../middleWares/authMiddleWare')
const router = express.Router()







//router.post('/admin-login', adminOnly, loginAdmin )
 router.get('/cancel', protect, adminOnly, appointmentCancel )
 router.get('/get-booking', protect, adminOnly, appointmentAdmin )
 router.post('/add-doc', protect, adminOnly, addDoctor)
 router.patch('/doc-photo', protect, adminOnly, addDocPhoto )

 router.get('/get-docs', protect,  getAllDoctors)










module.exports = router