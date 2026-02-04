const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { generateOTP, sendOTPEmail } = require('../utils/otp');
const { generateHealthId } = require('../utils/healthId');

// Register new user
const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                phone
            }
        });

        // Generate and send OTP
        const otpCode = generateOTP();
        await prisma.otpCode.create({
            data: {
                userId: user.id,
                code: otpCode,
                type: 'EMAIL_VERIFICATION',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
            }
        });

        await sendOTPEmail(email, otpCode);

        res.status(201).json({
            message: 'Registration successful. Please verify your email.',
            userId: user.id
        });
    } catch (error) {
        next(error);
    }
};

// Verify OTP
const verifyOTP = async (req, res, next) => {
    try {
        const { userId, code, type } = req.body;

        const otpRecord = await prisma.otpCode.findFirst({
            where: {
                userId,
                code,
                type,
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });

        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        await prisma.otpCode.update({
            where: { id: otpRecord.id },
            data: { isUsed: true }
        });

        // Update user verification status
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isVerified: true }
        });

        // Generate Health ID for verified user
        const healthCode = generateHealthId();
        await prisma.healthId.create({
            data: {
                userId: user.id,
                healthCode
            }
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Verification successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                healthCode
            }
        });
    } catch (error) {
        next(error);
    }
};

// Login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { healthId: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            // Send new OTP
            const otpCode = generateOTP();
            await prisma.otpCode.create({
                data: {
                    userId: user.id,
                    code: otpCode,
                    type: 'EMAIL_VERIFICATION',
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
                }
            });
            await sendOTPEmail(email, otpCode);

            return res.status(403).json({
                error: 'Email not verified',
                message: 'A new verification code has been sent to your email',
                userId: user.id
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                healthCode: user.healthId?.healthCode
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get current user profile
const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                healthId: true,
                emergencyInfo: true
            }
        });

        res.json({
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            profileImage: user.profileImage,
            healthCode: user.healthId?.healthCode,
            emergencyInfo: user.emergencyInfo
        });
    } catch (error) {
        next(error);
    }
};

// Resend OTP
const resendOTP = async (req, res, next) => {
    try {
        const { userId, type } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const otpCode = generateOTP();
        await prisma.otpCode.create({
            data: {
                userId,
                code: otpCode,
                type: type || 'EMAIL_VERIFICATION',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            }
        });

        await sendOTPEmail(user.email, otpCode);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    verifyOTP,
    login,
    getProfile,
    resendOTP
};
