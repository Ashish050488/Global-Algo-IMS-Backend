const express = require('express');
const router = express.Router();
const { createClient, getMyClients, updateClientStatus } = require('../controllers/clientController');
const auth = require('../middleware/auth');
const gatekeeper = require('../middleware/gatekeeper');

// All Client routes need Auth AND Attendance Check
router.post('/create', auth, gatekeeper, createClient);
router.get('/my-clients', auth, gatekeeper, getMyClients);
router.put('/:id', auth, gatekeeper, updateClientStatus);

module.exports = router;