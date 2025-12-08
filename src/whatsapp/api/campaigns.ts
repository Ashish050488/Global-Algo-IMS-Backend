
import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { ObjectId } from 'mongodb';
import { campaignsCollection, clientsCollection, messagesCollection } from '../db';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

const STREAM_KEY = 'whatsapp_queue';

export async function campaignRoutes(server: FastifyInstance) {
  
  // Create Campaign
  server.post('/api/campaigns', async (req, reply) => {
    const { name, template_body } = req.body as { name: string; template_body: string };
    if (!name || !template_body) return reply.code(400).send({ error: 'Missing fields' });

    const result = await campaignsCollection.insertOne({
      name,
      template_body,
      status: 'draft',
      created_at: new Date()
    });

    return { id: result.insertedId.toString(), name, status: 'draft' };
  });

  // Start Campaign (Enqueue)
  server.post('/api/campaigns/:id/start', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    // 1. Get Campaign
    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
    if (!campaign) return reply.code(404).send({ error: 'Campaign not found' });

    // 2. Get Opted-in Clients
    const clients = await clientsCollection.find({ opt_in: true }).toArray();
    
    if (clients.length === 0) return { message: 'No eligible contacts found.' };

    // 3. Batch Enqueue
    const pipeline = redis.pipeline();
    let queuedCount = 0;

    const messageDocs = [];
    for (const client of clients) {
      const messageId = uuidv4();
      
      // Prepare message document
      messageDocs.push({
        message_id: messageId,
        campaign_id: id,
        client_phone: client.phone,
        status: 'queued',
        created_at: new Date()
      });
      
      // Add to Redis Stream
      pipeline.xadd(STREAM_KEY, '*', 
        'message_id', messageId,
        'client_phone', client.phone,
        'template_body', campaign.template_body
      );
      queuedCount++;
    }

    // Insert all messages
    if (messageDocs.length > 0) {
      await messagesCollection.insertMany(messageDocs);
    }
    await pipeline.exec();

    // Update Campaign Status
    await campaignsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'processing', started_at: new Date() } }
    );

    return { success: true, queued: queuedCount };
  });

  // Get Campaign Status
  server.get('/api/campaigns/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
    
    // Aggregate stats by status
    const stats = await messagesCollection.aggregate([
      { $match: { campaign_id: id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]).toArray();
    
    return { campaign, stats };
  });
}
