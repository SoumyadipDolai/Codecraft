const prisma = require('../config/database');
const { generateQRCode, generateEmergencyQR } = require('../utils/healthId');

// Get Health ID
const getHealthId = async (req, res, next) => {
    try {
        const healthId = await prisma.healthId.findUnique({
            where: { userId: req.user.id }
        });

        if (!healthId) {
            return res.status(404).json({ error: 'Health ID not found' });
        }

        res.json(healthId);
    } catch (error) {
        next(error);
    }
};

// Get Health ID with QR Code
const getHealthIdWithQR = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                healthId: true,
                emergencyInfo: true
            }
        });

        if (!user.healthId) {
            return res.status(404).json({ error: 'Health ID not found' });
        }

        const qrCode = await generateEmergencyQR(user);

        res.json({
            healthCode: user.healthId.healthCode,
            qrCode,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                bloodGroup: user.emergencyInfo?.bloodGroup
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getHealthId,
    getHealthIdWithQR
};
