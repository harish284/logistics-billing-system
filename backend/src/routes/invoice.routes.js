const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.use(authenticateToken); // Protect all routes

router.post('/generate', invoiceController.generateInvoice);
router.post('/manual', invoiceController.createManualInvoice);
router.post('/', invoiceController.createManualInvoice);
router.post('/shipments/:shipmentId/calculate', invoiceController.calculateShipmentPrice);
router.get('/', invoiceController.getInvoices);
router.get('/:id/pdf', invoiceController.generatePdf);
router.patch('/:id/status', invoiceController.updateInvoiceStatus);
router.put('/:id/cancel', invoiceController.cancelInvoice);

module.exports = router;
