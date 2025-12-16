// SIMULATED GEMINI AI (Replace with real API call later)
exports.generateMessage = async (req, res) => {
  const { leadName, outcome, notes, type } = req.body;

  try {
    let message = "";

    // 1. Template Logic
    if (type === 'greeting') {
      message = `Hello ${leadName}, this is [Your Name] from Global Algo. I wanted to briefly introduce our trading advisory services. Is now a good time to chat?`;
    } 
    else if (type === 'kyc') {
      message = `Hi ${leadName}, to start your trading journey, please complete your KYC here: [LINK]. Let me know once done!`;
    }
    else if (type === 'market_update') {
      message = `Market Update: Nifty is showing strong momentum today. Good opportunity for intraday. Call me if interested.`;
    }
    // 2. Context-Aware Logic (The "Smart" Layer)
    else if (type === 'follow_up') {
      if (outcome === 'Interested') {
        message = `Hi ${leadName}, great speaking with you! As discussed regarding "${notes}", here are the details. Looking forward to onboarding you.`;
      } else if (outcome === 'Busy' || outcome === 'Callback') {
        message = `Hi ${leadName}, sorry I caught you at a busy time. I made a note to call you back later regarding "${notes}".`;
      } else {
        message = `Hi ${leadName}, thank you for your time.`;
      }
    }

    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).send("AI Error");
  }
};