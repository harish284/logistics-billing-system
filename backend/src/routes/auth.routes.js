const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Example protected route for testing
router.get('/me', authenticateToken, (req, res) => {
  res.json({ message: 'Access granted to protected route', user: req.user });
});

module.exports = router;
