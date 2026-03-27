const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.use(authenticateToken); // Protect API

router.post('/', paymentController.recordPayment);
router.get('/', paymentController.getPayments);
router.get('/invoice/:invoiceId', paymentController.getPaymentsByInvoice);

module.exports = router;
