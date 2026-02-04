const prisma = require('../config/database');

// Get all reminders
const getReminders = async (req, res, next) => {
    try {
        const { type, active } = req.query;

        const where = { userId: req.user.id };
        if (type) where.type = type;
        if (active !== undefined) where.isActive = active === 'true';

        const reminders = await prisma.reminder.findMany({
            where,
            orderBy: { scheduledAt: 'asc' }
        });

        res.json(reminders);
    } catch (error) {
        next(error);
    }
};

// Get upcoming reminders (next 24 hours)
const getUpcomingReminders = async (req, res, next) => {
    try {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const reminders = await prisma.reminder.findMany({
            where: {
                userId: req.user.id,
                isActive: true,
                scheduledAt: {
                    gte: now,
                    lte: tomorrow
                }
            },
            orderBy: { scheduledAt: 'asc' }
        });

        res.json(reminders);
    } catch (error) {
        next(error);
    }
};

// Get single reminder
const getReminder = async (req, res, next) => {
    try {
        const reminder = await prisma.reminder.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.json(reminder);
    } catch (error) {
        next(error);
    }
};

// Create reminder
const createReminder = async (req, res, next) => {
    try {
        const { type, title, description, scheduledAt, recurring, frequency, endDate } = req.body;

        const reminder = await prisma.reminder.create({
            data: {
                userId: req.user.id,
                type: type || 'OTHER',
                title,
                description,
                scheduledAt: new Date(scheduledAt),
                recurring: recurring || false,
                frequency,
                endDate: endDate ? new Date(endDate) : null
            }
        });

        res.status(201).json(reminder);
    } catch (error) {
        next(error);
    }
};

// Update reminder
const updateReminder = async (req, res, next) => {
    try {
        const { title, description, scheduledAt, recurring, frequency, endDate, isActive } = req.body;

        const result = await prisma.reminder.updateMany({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
                ...(recurring !== undefined && { recurring }),
                ...(frequency !== undefined && { frequency }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                ...(isActive !== undefined && { isActive })
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.json({ message: 'Reminder updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Mark reminder as completed
const completeReminder = async (req, res, next) => {
    try {
        const result = await prisma.reminder.updateMany({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            data: {
                completedAt: new Date()
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.json({ message: 'Reminder marked as completed' });
    } catch (error) {
        next(error);
    }
};

// Delete reminder
const deleteReminder = async (req, res, next) => {
    try {
        const result = await prisma.reminder.deleteMany({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.json({ message: 'Reminder deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getReminders,
    getUpcomingReminders,
    getReminder,
    createReminder,
    updateReminder,
    completeReminder,
    deleteReminder
};
