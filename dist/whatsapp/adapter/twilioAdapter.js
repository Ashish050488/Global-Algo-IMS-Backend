"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.parseWebhook = parseWebhook;
const twilio_1 = __importDefault(require("twilio"));
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'
let client = null;
if (accountSid && authToken) {
    client = (0, twilio_1.default)(accountSid, authToken);
}
else {
    console.warn('Twilio credentials missing. WhatsApp adapter will fail if used.');
}
async function sendMessage(clientPhone, templateBody, // For Sandbox, we use body text. For Prod, this would be template params.
_templateParams) {
    if (!client) {
        return { success: false, error: 'Twilio client not initialized' };
    }
    try {
        const message = await client.messages.create({
            body: templateBody,
            from: fromNumber,
            to: `whatsapp:${clientPhone}`,
            statusCallback: `${process.env.PUBLIC_URL || 'http://localhost:3001'}/api/whatsapp/webhook`
        });
        return { success: true, sid: message.sid };
    }
    catch (error) {
        console.error('Twilio Send Error:', error.message);
        return { success: false, error: error.message };
    }
}
function parseWebhook(reqBody) {
    // Twilio sends form-urlencoded data
    return {
        messageSid: reqBody.MessageSid,
        status: reqBody.MessageStatus,
        from: reqBody.From,
        to: reqBody.To,
        errorCode: reqBody.ErrorCode
    };
}
