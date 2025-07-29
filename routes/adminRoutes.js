// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleWares/authMiddleWare');
const {  addDoctor, addDocPhoto, appointmentAdmin, appointmentCancel, getAllDocsByAdmin,  } = require('../controllers/adminController');

router.get('/get-admin-docs', protect,adminOnly, getAllDocsByAdmin);
router.post('/add-doc', protect, adminOnly, addDoctor);
router.post('/add-doc-photo', protect, adminOnly, addDocPhoto);
router.get('/get-booking', protect, adminOnly, appointmentAdmin);
router.get('/cancelled-appointments', protect, adminOnly, appointmentCancel);

module.exports = router;

 


