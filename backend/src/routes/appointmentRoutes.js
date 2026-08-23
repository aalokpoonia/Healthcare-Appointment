const express = require('express');
const { protect } = require('../middleware/auth');
const {
  searchDoctors,
  getAvailableSlots,
  createAppointment,
  holdSlot,
  submitSymptomForm,
  getPatientAppointments,
  doctorAppointments,
  submitClinicalSummary,
} = require('../controllers/appointmentController');

const router = express.Router();

router.get('/doctors', searchDoctors);
router.get('/doctors/:id/slots', getAvailableSlots);
router.use(protect);
router.get('/me', getPatientAppointments);
router.post('/book', createAppointment);
router.post('/hold', holdSlot);
router.post('/symptoms', submitSymptomForm);
router.get('/doctor', doctorAppointments);
router.post('/summary', submitClinicalSummary);

module.exports = router;
