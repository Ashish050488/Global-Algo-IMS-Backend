
import { FastifyInstance } from 'fastify';
import { parseWebhook } from '../adapter/twilioAdapter';
import { messagesCollection } from '../db';

export async function webhookRoutes(server: FastifyInstance) {
  server.post('/api/whatsapp/webhook', async (req, reply) => {
    const data = parseWebhook(req.body);
    console.log(`[Webhook] Message ${data.messageSid} -> ${data.status}`);

    await messagesCollection.updateOne(
      { provider_sid: data.messageSid },
      { 
        $set: { 
          status: data.status,
          error_code: data.errorCode || null,
          updated_at: new Date()
        } 
      }
    );

    return reply.code(200).send('OK');
  });
}
