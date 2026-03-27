const paymentService = require('../services/payment.service');

const recordPayment = async (req, res) => {
  try {
    const result = await paymentService.recordPayment(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (
      error.message === 'Invalid payment method' ||
      error.message === 'Invoice not found' ||
      error.message === 'Invoice is already fully paid' ||
      error.message === 'Payment amount must be greater than zero' ||
      error.message === 'Payment amount exceeds the remaining invoice balance'
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await paymentService.getPayments();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaymentsByInvoice = async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByInvoice(req.params.invoiceId);
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  recordPayment,
  getPaymentsByInvoice,
  getPayments,
};
