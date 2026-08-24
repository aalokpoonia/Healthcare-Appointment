const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  markDoctorLeave,
  getAdminStats,
  getPatients,
  getAppointmentsForAdmin,
  toggleDoctorStatus,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/stats', getAdminStats);
router.get('/doctors', getDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.patch('/doctors/:id/status', toggleDoctorStatus);
router.delete('/doctors/:id', deleteDoctor);
router.post('/doctors/:id/leave', markDoctorLeave);
router.get('/patients', getPatients);
router.get('/appointments', getAppointmentsForAdmin);

module.exports = router;
