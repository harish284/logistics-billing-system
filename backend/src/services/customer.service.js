const prisma = require('../db');

const createCustomer = async (data) => {
  return prisma.customer.create({ data });
};

const getCustomers = async (filters) => {
  const { search, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.count({ where }),
  ]);

  return { data: customers, total, page: parseInt(page), limit: parseInt(limit) };
};

const getCustomerById = async (id) => {
  return prisma.customer.findUnique({
    where: { id },
    include: { shipments: true, invoices: true },
  });
};

const updateCustomer = async (id, data) => {
  return prisma.customer.update({
    where: { id },
    data,
  });
};

const deleteCustomer = async (id) => {
  return prisma.customer.delete({
    where: { id },
  });
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
