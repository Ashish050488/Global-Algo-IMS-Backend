import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'global_algo_whatsapp';

let client: MongoClient;
let db: Db;

// Collections
export let campaignsCollection: Collection;
export let clientsCollection: Collection;
export let messagesCollection: Collection;

export async function initDb() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    db = client.db(DB_NAME);
    
    // Initialize collections
    campaignsCollection = db.collection('campaigns');
    clientsCollection = db.collection('clients');
    messagesCollection = db.collection('messages');
    
    // Create indexes for better performance
    await campaignsCollection.createIndex({ name: 1 });
    await clientsCollection.createIndex({ phone: 1 }, { unique: true });
    await messagesCollection.createIndex({ campaign_id: 1 });
    await messagesCollection.createIndex({ provider_sid: 1 });
    await messagesCollection.createIndex({ status: 1 });
    
    console.log('MongoDB connected and initialized successfully.');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

export default {
  getDb,
  campaignsCollection: () => campaignsCollection,
  clientsCollection: () => clientsCollection,
  messagesCollection: () => messagesCollection
};