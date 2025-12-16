const express = require('express');
const router = express.Router();
const { login, registerUser,getMySubordinates } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', login);
// Protected Route: Only logged-in users can create subordinates
router.post('/register', auth, registerUser);


router.get('/subordinates', auth, getMySubordinates);

module.exports = router;