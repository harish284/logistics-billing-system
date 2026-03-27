const shipmentService = require('../services/shipment.service');

const createShipment = async (req, res) => {
  try {
    const shipment = await shipmentService.createShipment(req.body);
    res.status(201).json(shipment);
  } catch (error) {
    if (error.message === 'Customer does not exist') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const getShipments = async (req, res) => {
  try {
    const shipments = await shipmentService.getShipments(req.query);
    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getShipmentById = async (req, res) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.status(200).json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateShipmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const shipment = await shipmentService.updateShipmentStatus(req.params.id, status);
    res.status(200).json(shipment);
  } catch (error) {
    if (error.message === 'Invalid shipment status') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus,
};
