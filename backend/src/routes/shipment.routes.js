const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipment.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.use(authenticateToken); // Protect all shipment routes

router.post('/', shipmentController.createShipment);
router.get('/', shipmentController.getShipments);
router.get('/:id', shipmentController.getShipmentById);
router.patch('/:id/status', shipmentController.updateShipmentStatus);

module.exports = router;
