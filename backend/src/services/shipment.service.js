const prisma = require('../db');

// Generate unique AWB number automatically
const generateAWB = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  return `AWB-${dateStr}-${randomStr}`;
};

const createShipment = async (data) => {
  const { customerId, origin, destination, weight } = data;
  
  // Verify customer exists
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new Error('Customer does not exist');

  const trackingNumber = generateAWB();
  
  return prisma.shipment.create({
    data: {
      trackingNumber,
      origin,
      destination,
      weight,
      customerId,
      // Default status is PENDING from prisma schema
    },
  });
};

const getShipments = async (filters) => {
  const { customerId, status } = filters;
  const where = {};
  
  if (customerId) where.customerId = customerId;
  if (status) where.status = status;

  return prisma.shipment.findMany({
    where,
    include: { customer: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getShipmentById = async (id) => {
  return prisma.shipment.findUnique({
    where: { id },
    include: { customer: true, invoice: true }
  });
};

const updateShipmentStatus = async (id, status) => {
  const validStatuses = ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid shipment status');
  }

  return prisma.shipment.update({
    where: { id },
    data: { status },
  });
};

module.exports = {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus,
};
