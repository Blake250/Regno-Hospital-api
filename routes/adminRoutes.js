// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleWares/authMiddleWare');
const {  addDoctor, addDocPhoto, appointmentAdmin, appointmentCancel,  } = require('../controllers/adminController');

// router.get('/get-docs', protect, getAllDoctors);
router.post('/add-doc', protect, adminOnly, addDoctor);
router.post('/add-doc-photo', protect, adminOnly, addDocPhoto);
router.get('/appointments', protect, adminOnly, appointmentAdmin);
router.get('/cancelled-appointments', protect, adminOnly, appointmentCancel);

module.exports = router;

 


