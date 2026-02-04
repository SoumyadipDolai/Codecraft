const QRCode = require('qrcode');

// Generate unique Health ID
const generateHealthId = () => {
    const year = new Date().getFullYear();
    const randomPart = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, 1, I)
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    return `HV-${year}-${randomPart()}-${randomPart()}`;
};

// Generate QR Code as Data URL
const generateQRCode = async (healthId, emergencyData = {}) => {
    const qrData = JSON.stringify({
        healthId,
        type: 'HEALTHVAULT_EMERGENCY',
        ...emergencyData,
        timestamp: new Date().toISOString()
    });

    try {
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.92,
            margin: 2,
            color: {
                dark: '#667eea',
                light: '#ffffff'
            },
            width: 300
        });
        return qrCodeDataUrl;
    } catch (error) {
        console.error('QR Code generation failed:', error);
        throw error;
    }
};

// Generate shareable emergency QR with limited info
const generateEmergencyQR = async (userData) => {
    const emergencyData = {
        name: `${userData.firstName} ${userData.lastName}`,
        bloodGroup: userData.emergencyInfo?.bloodGroup,
        allergies: userData.emergencyInfo?.allergies,
        emergencyContacts: userData.emergencyInfo?.emergencyContacts?.slice(0, 2),
        healthId: userData.healthId?.healthCode
    };

    return generateQRCode(userData.healthId?.healthCode, emergencyData);
};

module.exports = {
    generateHealthId,
    generateQRCode,
    generateEmergencyQR
};
