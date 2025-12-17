const express = require('express');
const router = express.Router();
const { createTicket, getTickets, resolveTicket } = require('../controllers/ticketController');
const auth = require('../middleware/auth');

router.post('/create', auth, createTicket);
router.get('/', auth, getTickets);
router.put('/:id/resolve', auth, resolveTicket);

module.exports = router;