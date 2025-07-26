// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleWares/authMiddleWare');
const { getAllDoctors, addDoctor, addDocPhoto, appointmentAdmin, appointmentCancel } = require('../controllers/adminController');

router.get('/get-docs', protect, getAllDoctors);
router.post('/add-doc', protect, adminOnly, addDoctor);
router.post('/add-doc-photo', protect, adminOnly, addDocPhoto);
router.get('/appointments', protect, adminOnly, appointmentAdmin);
router.get('/cancelled-appointments', protect, adminOnly, appointmentCancel);

module.exports = router;








// const express = require('express')
// const { loginAdmin, appointmentAdmin, appointmentCancel, addDoctor, addDocPhoto,  getAllDoctors } = require('../controllers/adminController')
// const { protect, adminOnly } = require('../middleWares/authMiddleWare')
// const router = express.Router()







// //router.post('/admin-login', adminOnly, loginAdmin )
//  router.get('/cancel', protect, adminOnly, appointmentCancel )
//  router.get('/get-booking', protect, adminOnly, appointmentAdmin )
//  router.post('/add-doc', protect, adminOnly, addDoctor)
//  router.patch('/doc-photo', protect, adminOnly, addDocPhoto )

//  router.get('/get-docs', protect,  getAllDoctors)










// module.exports = router