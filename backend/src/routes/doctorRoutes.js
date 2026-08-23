const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDoctorProfile, updateDoctorProfile } = require('../controllers/doctorController');

const router = express.Router();

router.use(protect, authorize('doctor'));
router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);

module.exports = router;
