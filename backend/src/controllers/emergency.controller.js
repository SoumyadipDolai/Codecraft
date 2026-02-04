const prisma = require('../config/database');

// Get emergency info
const getEmergencyInfo = async (req, res, next) => {
    try {
        let emergencyInfo = await prisma.emergencyInfo.findUnique({
            where: { userId: req.user.id }
        });

        if (!emergencyInfo) {
            // Create default emergency info
            emergencyInfo = await prisma.emergencyInfo.create({
                data: { userId: req.user.id }
            });
        }

        res.json(emergencyInfo);
    } catch (error) {
        next(error);
    }
};

// Update emergency info
const updateEmergencyInfo = async (req, res, next) => {
    try {
        const { bloodGroup, allergies, chronicDiseases, medications, emergencyContacts, organDonor } = req.body;

        const emergencyInfo = await prisma.emergencyInfo.upsert({
            where: { userId: req.user.id },
            update: {
                ...(bloodGroup !== undefined && { bloodGroup }),
                ...(allergies !== undefined && { allergies }),
                ...(chronicDiseases !== undefined && { chronicDiseases }),
                ...(medications !== undefined && { medications }),
                ...(emergencyContacts !== undefined && { emergencyContacts }),
                ...(organDonor !== undefined && { organDonor })
            },
            create: {
                userId: req.user.id,
                bloodGroup,
                allergies: allergies || [],
                chronicDiseases: chronicDiseases || [],
                medications: medications || [],
                emergencyContacts: emergencyContacts || [],
                organDonor: organDonor || false
            }
        });

        res.json(emergencyInfo);
    } catch (error) {
        next(error);
    }
};

// Get emergency card (public-friendly data)
const getEmergencyCard = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                healthId: true,
                emergencyInfo: true
            }
        });

        res.json({
            name: `${user.firstName} ${user.lastName}`,
            healthCode: user.healthId?.healthCode,
            bloodGroup: user.emergencyInfo?.bloodGroup,
            allergies: user.emergencyInfo?.allergies || [],
            chronicDiseases: user.emergencyInfo?.chronicDiseases || [],
            medications: user.emergencyInfo?.medications || [],
            emergencyContacts: user.emergencyInfo?.emergencyContacts || [],
            organDonor: user.emergencyInfo?.organDonor || false
        });
    } catch (error) {
        next(error);
    }
};

// Public emergency access (via QR code / access code)
const getPublicEmergencyInfo = async (req, res, next) => {
    try {
        const { healthCode } = req.params;

        const healthId = await prisma.healthId.findUnique({
            where: { healthCode },
            include: {
                user: {
                    include: {
                        emergencyInfo: true
                    }
                }
            }
        });

        if (!healthId) {
            return res.status(404).json({ error: 'Health ID not found' });
        }

        const user = healthId.user;

        // Return limited emergency info
        res.json({
            name: `${user.firstName} ${user.lastName}`,
            bloodGroup: user.emergencyInfo?.bloodGroup,
            allergies: user.emergencyInfo?.allergies || [],
            emergencyContacts: (user.emergencyInfo?.emergencyContacts || []).slice(0, 2)
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEmergencyInfo,
    updateEmergencyInfo,
    getEmergencyCard,
    getPublicEmergencyInfo
};
