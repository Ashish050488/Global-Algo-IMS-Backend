"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRoutes = campaignRoutes;
const uuid_1 = require("uuid");
const ioredis_1 = __importDefault(require("ioredis"));
const mongodb_1 = require("mongodb");
const db_1 = require("../db");
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
});
const STREAM_KEY = 'whatsapp_queue';
async function campaignRoutes(server) {
    // Create Campaign
    server.post('/api/campaigns', async (req, reply) => {
        const { name, template_body } = req.body;
        if (!name || !template_body)
            return reply.code(400).send({ error: 'Missing fields' });
        const result = await db_1.campaignsCollection.insertOne({
            name,
            template_body,
            status: 'draft',
            created_at: new Date()
        });
        return { id: result.insertedId.toString(), name, status: 'draft' };
    });
    // Start Campaign (Enqueue)
    server.post('/api/campaigns/:id/start', async (req, reply) => {
        const { id } = req.params;
        // 1. Get Campaign
        const campaign = await db_1.campaignsCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!campaign)
            return reply.code(404).send({ error: 'Campaign not found' });
        // 2. Get Opted-in Clients
        const clients = await db_1.clientsCollection.find({ opt_in: true }).toArray();
        if (clients.length === 0)
            return { message: 'No eligible contacts found.' };
        // 3. Batch Enqueue
        const pipeline = redis.pipeline();
        let queuedCount = 0;
        const messageDocs = [];
        for (const client of clients) {
            const messageId = (0, uuid_1.v4)();
            // Prepare message document
            messageDocs.push({
                message_id: messageId,
                campaign_id: id,
                client_phone: client.phone,
                status: 'queued',
                created_at: new Date()
            });
            // Add to Redis Stream
            pipeline.xadd(STREAM_KEY, '*', 'message_id', messageId, 'client_phone', client.phone, 'template_body', campaign.template_body);
            queuedCount++;
        }
        // Insert all messages
        if (messageDocs.length > 0) {
            await db_1.messagesCollection.insertMany(messageDocs);
        }
        await pipeline.exec();
        // Update Campaign Status
        await db_1.campaignsCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { status: 'processing', started_at: new Date() } });
        return { success: true, queued: queuedCount };
    });
    // Get Campaign Status
    server.get('/api/campaigns/:id', async (req, reply) => {
        const { id } = req.params;
        const campaign = await db_1.campaignsCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        // Aggregate stats by status
        const stats = await db_1.messagesCollection.aggregate([
            { $match: { campaign_id: id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } }
        ]).toArray();
        return { campaign, stats };
    });
}
