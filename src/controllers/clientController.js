const Client = require('../models/Client');
const Lead = require('../models/Lead');

// 1. CONVERT LEAD TO CLIENT (Now counts as a CALL too)
exports.createClient = async (req, res) => {
  const { leadId, name, email, phone, tradingPlatform, investmentCapital } = req.body;

  try {
    // A. Check if already exists
    const existing = await Client.findOne({ phone });
    if (existing) {
      return res.status(400).json({ msg: "Client with this phone number already exists." });
    }

    // B. Create Client Record
    const newClient = new Client({
      leadId,
      managedBy: req.user.id, // Assigned to Employee
      name,
      email,
      phone,
      tradingPlatform,
      investmentCapital
    });

    await newClient.save();

    // C. MAGIC FIX: Update the Lead to reflect a "Successful Call"
    if (leadId) {
      const lead = await Lead.findById(leadId);
      if (lead) {
        lead.status = 'Closed'; // Mark as won
        lead.callCount = (lead.callCount || 0) + 1; // Increment Call Counter
        lead.lastCallOutcome = 'Converted to Client';
        lead.lastCallDate = new Date();

        // Add to History so "Calls Today" dashboard updates
        lead.history.push({
          action: 'Call Logged: Converted',
          by: req.user.id,
          date: new Date(),
          details: `Success! Registered with ₹${investmentCapital} capital.`
        });

        await lead.save();
      }
    }

    res.json({ msg: "Success! Client Registered and Call Logged.", client: newClient });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// 2. GET MY CLIENTS
exports.getMyClients = async (req, res) => {
  try {
    const clients = await Client.find({ managedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// 3. UPDATE KYC STATUS
exports.updateClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { registrationStatus, remarks } = req.body;

    await Client.findByIdAndUpdate(id, { registrationStatus, remarks });
    res.json({ msg: "Client Updated" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};