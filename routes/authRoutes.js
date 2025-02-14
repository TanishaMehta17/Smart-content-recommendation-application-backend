const express = require('express');
const router = express.Router();
const { signup, login, profile ,TokenisValid , getdata } = require('../controllers/authController');
//const { authMiddleware } = require('../middleware/authMiddleware');

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// Profile route (protected)
router.get('/profile' , profile);

router.post('/TokenisValid', TokenisValid);

router.get('/', getdata);

module.exports = router;
