const prisma = require('../db');

const recordPayment = async (data) => {
  const { invoiceId, amount, paymentMethod, reference } = data;

  // Validate payment method matches the request
  const validMethods = ['CASH', 'UPI', 'BANK_TRANSFER', 'CREDIT_CARD'];
  if (!validMethods.includes(paymentMethod.toUpperCase())) {
    throw new Error('Invalid payment method');
  }

  if (amount <= 0) throw new Error('Payment amount must be greater than zero');

  // Use a transaction to ensure payment logging and invoice status update synchronously safely
  return prisma.$transaction(async (tx) => {
    // 1. Fetch the invoice and all existing payments made on it
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) throw new Error('Invoice not found');
    if (invoice.status === 'PAID') throw new Error('Invoice is already fully paid');

    // 2. Calculate sum of what was previously paid
    const previouslyPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    // 3. Ensure they aren't over-paying 
    // Small float precision buffer added to avoid exact match errors if using Floats in Postgres
    if (Math.round((previouslyPaid + amount) * 100) / 100 > Math.round(invoice.totalAmount * 100) / 100) {
      throw new Error('Payment amount exceeds the remaining invoice balance');
    }

    // 4. Create the payment record
    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount,
        paymentMethod: paymentMethod.toUpperCase(),
        reference,
      },
    });

    // 5. Determine new invoice status depending on full vs partial amounts
    const newlyPaidTotal = previouslyPaid + amount;
    const isFullyPaid = Math.round(newlyPaidTotal * 100) / 100 >= Math.round(invoice.totalAmount * 100) / 100;
    const newStatus = isFullyPaid ? 'PAID' : 'PARTIALLY_PAID';

    // 6. Update invoice status if it advanced towards PAID
    if (invoice.status !== newStatus) {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });
    }

    return { 
      payment, 
      invoiceStatus: newStatus, 
      remainingBalance: invoice.totalAmount - newlyPaidTotal 
    };
  });
};

const getPayments = async () => {
  return prisma.payment.findMany({
    orderBy: { paymentDate: 'desc' },
    include: { invoice: { select: { invoiceNumber: true, status: true } } },
  });
};

const getPaymentsByInvoice = async (invoiceId) => {
  return prisma.payment.findMany({
    where: { invoiceId },
    orderBy: { paymentDate: 'desc' },
  });
};

module.exports = {
  recordPayment,
  getPaymentsByInvoice,
  getPayments,
};
