"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesCollection = exports.clientsCollection = exports.campaignsCollection = void 0;
exports.initDb = initDb;
exports.getDb = getDb;
exports.closeDb = closeDb;
const mongodb_1 = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'global_algo_whatsapp';
let client;
let db;
async function initDb() {
    try {
        client = new mongodb_1.MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);
        // Initialize collections
        exports.campaignsCollection = db.collection('campaigns');
        exports.clientsCollection = db.collection('clients');
        exports.messagesCollection = db.collection('messages');
        // Create indexes for better performance
        await exports.campaignsCollection.createIndex({ name: 1 });
        await exports.clientsCollection.createIndex({ phone: 1 }, { unique: true });
        await exports.messagesCollection.createIndex({ campaign_id: 1 });
        await exports.messagesCollection.createIndex({ provider_sid: 1 });
        await exports.messagesCollection.createIndex({ status: 1 });
        console.log('MongoDB connected and initialized successfully.');
    }
    catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}
function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initDb() first.');
    }
    return db;
}
async function closeDb() {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}
exports.default = {
    getDb,
    campaignsCollection: () => exports.campaignsCollection,
    clientsCollection: () => exports.clientsCollection,
    messagesCollection: () => exports.messagesCollection
};
