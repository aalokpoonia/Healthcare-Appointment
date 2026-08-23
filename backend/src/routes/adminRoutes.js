const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDoctors, createDoctor, updateDoctor, deleteDoctor, markDoctorLeave } = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/doctors', getDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);
router.post('/doctors/:id/leave', markDoctorLeave);

module.exports = router;
