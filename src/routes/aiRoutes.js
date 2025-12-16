const express = require('express');
const router = express.Router();
const { generateMessage } = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.post('/generate', auth, generateMessage);

module.exports = router;