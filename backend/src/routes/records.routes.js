const express = require('express');
const { body, param, query } = require('express-validator');
const recordsController = require('../controllers/records.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Get all records
router.get('/', authMiddleware, [
    query('type').optional().isIn(['PRESCRIPTION', 'LAB_REPORT', 'VACCINATION', 'SCAN_XRAY', 'DISCHARGE_SUMMARY', 'BILL_INVOICE', 'OTHER']),
    query('search').optional().isString()
], validate, recordsController.getRecords);

// Get records grouped by type
router.get('/by-type', authMiddleware, recordsController.getRecordsByType);

// Get single record
router.get('/:id', authMiddleware, [
    param('id').isUUID()
], validate, recordsController.getRecord);

// Upload record
router.post('/', authMiddleware, upload.single('file'), [
    body('type').optional().isIn(['PRESCRIPTION', 'LAB_REPORT', 'VACCINATION', 'SCAN_XRAY', 'DISCHARGE_SUMMARY', 'BILL_INVOICE', 'OTHER']),
    body('title').optional().isString(),
    body('description').optional().isString()
], validate, recordsController.uploadRecord);

// Update record
router.put('/:id', authMiddleware, [
    param('id').isUUID(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('type').optional().isIn(['PRESCRIPTION', 'LAB_REPORT', 'VACCINATION', 'SCAN_XRAY', 'DISCHARGE_SUMMARY', 'BILL_INVOICE', 'OTHER'])
], validate, recordsController.updateRecord);

// Delete record
router.delete('/:id', authMiddleware, [
    param('id').isUUID()
], validate, recordsController.deleteRecord);

module.exports = router;
