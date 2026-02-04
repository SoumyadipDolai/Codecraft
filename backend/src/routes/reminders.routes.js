const express = require('express');
const { body, param, query } = require('express-validator');
const remindersController = require('../controllers/reminders.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Get all reminders
router.get('/', authMiddleware, [
    query('type').optional().isIn(['MEDICINE', 'APPOINTMENT', 'CHECKUP', 'VACCINATION', 'OTHER']),
    query('active').optional().isIn(['true', 'false'])
], validate, remindersController.getReminders);

// Get upcoming reminders (next 24 hours)
router.get('/upcoming', authMiddleware, remindersController.getUpcomingReminders);

// Get single reminder
router.get('/:id', authMiddleware, [
    param('id').isUUID()
], validate, remindersController.getReminder);

// Create reminder
router.post('/', authMiddleware, [
    body('type').optional().isIn(['MEDICINE', 'APPOINTMENT', 'CHECKUP', 'VACCINATION', 'OTHER']),
    body('title').notEmpty().trim(),
    body('description').optional().isString(),
    body('scheduledAt').isISO8601(),
    body('recurring').optional().isBoolean(),
    body('frequency').optional().isIn(['daily', 'weekly', 'monthly']),
    body('endDate').optional().isISO8601()
], validate, remindersController.createReminder);

// Update reminder
router.put('/:id', authMiddleware, [
    param('id').isUUID(),
    body('title').optional().notEmpty().trim(),
    body('description').optional().isString(),
    body('scheduledAt').optional().isISO8601(),
    body('recurring').optional().isBoolean(),
    body('frequency').optional().isIn(['daily', 'weekly', 'monthly']),
    body('endDate').optional().isISO8601(),
    body('isActive').optional().isBoolean()
], validate, remindersController.updateReminder);

// Mark as completed
router.post('/:id/complete', authMiddleware, [
    param('id').isUUID()
], validate, remindersController.completeReminder);

// Delete reminder
router.delete('/:id', authMiddleware, [
    param('id').isUUID()
], validate, remindersController.deleteReminder);

module.exports = router;
