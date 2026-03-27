const express = require('express');
const router = express.Router();
const rateCardController = require('../controllers/rateCard.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Protect all rate card routes with authentication
router.use(authenticateToken);

router.post('/', rateCardController.createRateCard);
router.get('/', rateCardController.getRateCards);
router.get('/:id', rateCardController.getRateCardById);
router.put('/:id', rateCardController.updateRateCard);
router.delete('/:id', rateCardController.deleteRateCard);

module.exports = router;
