const prisma = require('../db');

const calculatePricing = async (shipmentId) => {
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw new Error('Shipment not found');

  // Ensure we prioritize company-specific rate card, falling back to global ones
  let rateCard = await prisma.rateCard.findFirst({
    where: {
      origin: shipment.origin,
      destination: shipment.destination,
      customerId: shipment.customerId, // specific company rate
      isActive: true,
    },
  });

  // Fallback to global rate if no custom rate exists
  if (!rateCard) {
    rateCard = await prisma.rateCard.findFirst({
      where: {
        origin: shipment.origin,
        destination: shipment.destination,
        customerId: null, // global company rate
        isActive: true,
      },
    });
  }

  if (!rateCard) throw new Error('No applicable rate card found for this route');

  // Calculate base pricing based on weight and rate card rates
  const baseCost = rateCard.baseRate + (rateCard.perKgRate * shipment.weight);
  
  // Update shipment with calculated price
  return prisma.shipment.update({
    where: { id: shipmentId },
    data: { price: baseCost },
  });
};

const generateInvoice = async (customerId, shipmentIds) => {
  // Extract unbilled shipments for customer
  const shipments = await prisma.shipment.findMany({
    where: {
      id: { in: shipmentIds },
      customerId,
      invoiceId: null, // Ensure they are not already billed
    },
  });

  if (shipments.length === 0) throw new Error('No valid, unbilled shipments found');

  // Ensure all shipments have a price calculated before invoicing
  let subtotal = 0;
  for (const shipment of shipments) {
    if (shipment.price === null) {
      // Automatically calculate if not done yet
      const updatedShipment = await calculatePricing(shipment.id);
      subtotal += updatedShipment.price;
    } else {
      subtotal += shipment.price;
    }
  }

  // Basic GST calculation (18%)
  const gstRate = 0.18;
  const gstAmount = subtotal * gstRate;
  const totalAmount = subtotal + gstAmount;

  // Generate unique invoice number
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `INV-${dateStr}-${randomStr}`;

  // Create the invoice and link shipments within a transaction block
  const invoice = await prisma.$transaction(async (tx) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15); // Add 15 days window

    const newInvoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        totalAmount,
        status: 'ISSUED',
        dueDate,
        customerId,
      },
    });

    // Update shipments linking them to the generated Invoice
    await tx.shipment.updateMany({
      where: { id: { in: shipmentIds } },
      data: { invoiceId: newInvoice.id },
    });

    return newInvoice;
  });

  return { invoice, summary: { subtotal, gst: gstAmount, total: totalAmount } };
};

const getInvoices = async (filters) => {
  const { customerId, status } = filters;
  const where = {};
  if (customerId) where.customerId = customerId;
  if (status) where.status = status;

  return prisma.invoice.findMany({
    where,
    include: { shipments: true, customer: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const updateInvoiceStatus = async (id, status) => {
  const validStatuses = ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid invoice status');
  }

  return prisma.invoice.update({
    where: { id },
    data: { status },
  });
};

module.exports = {
  calculatePricing,
  generateInvoice,
  getInvoices,
  updateInvoiceStatus,
};
