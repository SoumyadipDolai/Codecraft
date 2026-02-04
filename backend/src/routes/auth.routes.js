const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Register
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('phone').optional().isMobilePhone()
], validate, authController.register);

// Verify OTP
router.post('/verify-otp', [
    body('userId').isUUID(),
    body('code').isLength({ min: 6, max: 6 }),
    body('type').isIn(['EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'LOGIN', 'PASSWORD_RESET'])
], validate, authController.verifyOTP);

// Resend OTP
router.post('/resend-otp', [
    body('userId').isUUID(),
    body('type').optional().isIn(['EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'LOGIN', 'PASSWORD_RESET'])
], validate, authController.resendOTP);

// Login
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], validate, authController.login);

// Get Profile (Protected)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
