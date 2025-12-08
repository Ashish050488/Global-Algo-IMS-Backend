"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRoutes = webhookRoutes;
const twilioAdapter_1 = require("../adapter/twilioAdapter");
const db_1 = require("../db");
async function webhookRoutes(server) {
    server.post('/api/whatsapp/webhook', async (req, reply) => {
        const data = (0, twilioAdapter_1.parseWebhook)(req.body);
        console.log(`[Webhook] Message ${data.messageSid} -> ${data.status}`);
        await db_1.messagesCollection.updateOne({ provider_sid: data.messageSid }, {
            $set: {
                status: data.status,
                error_code: data.errorCode || null,
                updated_at: new Date()
            }
        });
        return reply.code(200).send('OK');
    });
}
