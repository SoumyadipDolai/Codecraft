const prisma = require('../config/database');

// Get all records
const getRecords = async (req, res, next) => {
    try {
        const { type, search } = req.query;

        const where = { userId: req.user.id };
        if (type) where.type = type;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const records = await prisma.medicalRecord.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(records);
    } catch (error) {
        next(error);
    }
};

// Get single record
const getRecord = async (req, res, next) => {
    try {
        const record = await prisma.medicalRecord.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.json(record);
    } catch (error) {
        next(error);
    }
};

// Upload record
const uploadRecord = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { type, title, description, metadata, tags } = req.body;

        const record = await prisma.medicalRecord.create({
            data: {
                userId: req.user.id,
                type: type || 'OTHER',
                title: title || req.file.originalname,
                description,
                fileUrl: `/uploads/${req.file.filename}`,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                metadata: metadata ? JSON.parse(metadata) : {},
                tags: tags ? JSON.parse(tags) : []
            }
        });

        res.status(201).json(record);
    } catch (error) {
        next(error);
    }
};

// Update record
const updateRecord = async (req, res, next) => {
    try {
        const { title, description, type, metadata, tags } = req.body;

        const record = await prisma.medicalRecord.updateMany({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(type && { type }),
                ...(metadata && { metadata: JSON.parse(metadata) }),
                ...(tags && { tags: JSON.parse(tags) })
            }
        });

        if (record.count === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.json({ message: 'Record updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Delete record
const deleteRecord = async (req, res, next) => {
    try {
        const result = await prisma.medicalRecord.deleteMany({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Get records by type (grouped)
const getRecordsByType = async (req, res, next) => {
    try {
        const records = await prisma.medicalRecord.groupBy({
            by: ['type'],
            where: { userId: req.user.id },
            _count: true
        });

        res.json(records);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRecords,
    getRecord,
    uploadRecord,
    updateRecord,
    deleteRecord,
    getRecordsByType
};
