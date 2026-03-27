const prisma = require('../db');

exports.createRateCard = async (req, res) => {
  try {
    const { name, origin, destination, baseRate, perKgRate, currency, isActive, customerId } = req.body;
    
    // Create new rate card
    const rateCard = await prisma.rateCard.create({
      data: {
        name,
        origin,
        destination,
        baseRate: parseFloat(baseRate),
        perKgRate: parseFloat(perKgRate),
        currency: currency || 'USD',
        isActive: isActive !== undefined ? isActive : true,
        customerId: customerId || null,
      },
    });

    res.status(201).json({ message: 'Rate Card created successfully', rateCard });
  } catch (error) {
    console.error('Error creating rate card:', error);
    res.status(500).json({ error: 'Failed to create rate card' });
  }
};

exports.getRateCards = async (req, res) => {
  try {
    const rateCards = await prisma.rateCard.findMany({
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json(rateCards);
  } catch (error) {
    console.error('Error fetching rate cards:', error);
    res.status(500).json({ error: 'Failed to fetch rate cards' });
  }
};

exports.getRateCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const rateCard = await prisma.rateCard.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } }
      }
    });

    if (!rateCard) {
      return res.status(404).json({ error: 'Rate card not found' });
    }

    res.status(200).json(rateCard);
  } catch (error) {
    console.error('Error fetching rate card by ID:', error);
    res.status(500).json({ error: 'Failed to fetch rate card' });
  }
};

exports.updateRateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, origin, destination, baseRate, perKgRate, currency, isActive, customerId } = req.body;

    const rateCard = await prisma.rateCard.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(origin && { origin }),
        ...(destination && { destination }),
        ...(baseRate !== undefined && { baseRate: parseFloat(baseRate) }),
        ...(perKgRate !== undefined && { perKgRate: parseFloat(perKgRate) }),
        ...(currency && { currency }),
        ...(isActive !== undefined && { isActive }),
        ...(customerId !== undefined && { customerId: customerId === '' ? null : customerId }),
      },
    });

    res.status(200).json({ message: 'Rate card updated successfully', rateCard });
  } catch (error) {
    console.error('Error updating rate card:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Rate card not found' });
    }
    res.status(500).json({ error: 'Failed to update rate card' });
  }
};

exports.deleteRateCard = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.rateCard.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Rate card deleted successfully' });
  } catch (error) {
    console.error('Error deleting rate card:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Rate card not found' });
    }
    res.status(500).json({ error: 'Failed to delete rate card' });
  }
};
