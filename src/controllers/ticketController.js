const Ticket = require('../models/Ticket');

// 1. RAISE TICKET
exports.createTicket = async (req, res) => {
  try {
    const { category, priority, subject, description, recipient } = req.body;

    const newTicket = new Ticket({
      createdBy: req.user.id,
      recipient: recipient || 'Admin', // Default to Admin if not specified
      category,
      priority,
      subject,
      description
    });

    await newTicket.save();
    res.json({ msg: "Ticket Raised Successfully." });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// 2. GET TICKETS (The "Inbox" Logic)
exports.getTickets = async (req, res) => {
  try {
    const role = req.user.role;

    // SCENARIO A: ADMIN (Only sees tickets sent to 'Admin')
    if (role === 'Admin') {
      const tickets = await Ticket.find({ recipient: 'Admin' }) // <--- ADDED FILTER
        .populate('createdBy', 'name role email')
        .sort({ createdAt: -1 });
      return res.json(tickets);
    }

    // SCENARIO B: BRANCH MANAGER (Only sees tickets sent to 'BranchManager')
    if (role === 'BranchManager') {
      const tickets = await Ticket.find({ recipient: 'BranchManager' })
        .populate('createdBy', 'name role email')
        .sort({ createdAt: -1 });
      return res.json(tickets);
    }

    // SCENARIO C: EMPLOYEE/HR (See only their OWN raised tickets)
    const myTickets = await Ticket.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(myTickets);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// 3. RESOLVE TICKET (Managers & Admin)
exports.resolveTicket = async (req, res) => {
  try {
    // Only Admin and BM can resolve
    if (req.user.role !== 'Admin' && req.user.role !== 'BranchManager') {
      return res.status(403).json({ msg: "Access Denied" });
    }
    
    await Ticket.findByIdAndUpdate(req.params.id, { status: 'Resolved' });
    res.json({ msg: "Ticket Marked as Resolved" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};