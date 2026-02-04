const express = require('express');
const { body, param } = require('express-validator');
const emergencyController = require('../controllers/emergency.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Get emergency info (protected)
router.get('/', authMiddleware, emergencyController.getEmergencyInfo);

// Get emergency card (protected)
router.get('/card', authMiddleware, emergencyController.getEmergencyCard);

// Update emergency info
router.put('/', authMiddleware, [
    body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('allergies').optional().isArray(),
    body('chronicDiseases').optional().isArray(),
    body('medications').optional().isArray(),
    body('emergencyContacts').optional().isArray(),
    body('organDonor').optional().isBoolean()
], validate, emergencyController.updateEmergencyInfo);

// Public emergency access (via Health ID code)
router.get('/public/:healthCode', [
    param('healthCode').matches(/^HV-\d{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
], validate, emergencyController.getPublicEmergencyInfo);

module.exports = router;
