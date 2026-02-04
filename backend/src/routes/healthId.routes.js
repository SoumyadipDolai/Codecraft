const express = require('express');
const healthIdController = require('../controllers/healthId.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Get Health ID
router.get('/', authMiddleware, healthIdController.getHealthId);

// Get Health ID with QR Code
router.get('/qr', authMiddleware, healthIdController.getHealthIdWithQR);

module.exports = router;
