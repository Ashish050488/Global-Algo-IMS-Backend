# MongoDB Schema for WhatsApp Integration

This file documents the MongoDB collections and their schema for the WhatsApp messaging system.

## Collections

### 1. campaigns
Stores campaign information for bulk WhatsApp messaging.

**Schema:**
```javascript
{
  _id: ObjectId,
  name: String,                    // Campaign name
  template_body: String,           // Message template
  status: String,                  // 'draft' | 'processing' | 'completed'
  created_at: Date,
  started_at: Date                 // When campaign was started
}
```

**Indexes:**
- `{ name: 1 }`

**Example:**
```javascript
db.campaigns.insertOne({
  name: "New Year Promotion",
  template_body: "Happy New Year! Check our latest offers...",
  status: "draft",
  created_at: new Date()
});
```

---

### 2. clients
Stores client contact information and opt-in status.

**Schema:**
```javascript
{
  _id: ObjectId,
  phone: String,                   // Phone number in E.164 format (e.g., +1234567890)
  opt_in: Boolean,                 // Consent status for receiving messages
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `{ phone: 1 }` (unique)

**Example:**
```javascript
db.clients.insertOne({
  phone: "+1234567890",
  opt_in: true,
  created_at: new Date(),
  updated_at: new Date()
});
```

---

### 3. messages
Stores individual message records for tracking delivery status.

**Schema:**
```javascript
{
  _id: ObjectId,
  message_id: String,              // UUID for message tracking
  campaign_id: String,             // Reference to campaign (as string, not ObjectId)
  client_phone: String,            // Recipient phone number
  status: String,                  // 'queued' | 'sending' | 'sent' | 'failed' | 'skipped_opt_out'
  provider_sid: String,            // Twilio message SID (optional)
  error_code: String,              // Error code if failed (optional)
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `{ campaign_id: 1 }`
- `{ provider_sid: 1 }`
- `{ status: 1 }`
- `{ message_id: 1 }` (for worker lookups)

**Example:**
```javascript
db.messages.insertOne({
  message_id: "550e8400-e29b-41d4-a716-446655440000",
  campaign_id: "507f1f77bcf86cd799439011",
  client_phone: "+1234567890",
  status: "queued",
  created_at: new Date()
});
```

---

## Setup Instructions

### Create Database and Collections

```javascript
// Connect to MongoDB
use global_algo_whatsapp

// Create collections with validation (optional but recommended)
db.createCollection("campaigns", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "template_body", "status"],
      properties: {
        name: { bsonType: "string" },
        template_body: { bsonType: "string" },
        status: { 
          bsonType: "string",
          enum: ["draft", "processing", "completed"]
        },
        created_at: { bsonType: "date" },
        started_at: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("clients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["phone", "opt_in"],
      properties: {
        phone: { bsonType: "string", pattern: "^\\+[1-9]\\d{1,14}$" },
        opt_in: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("messages", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["message_id", "campaign_id", "client_phone", "status"],
      properties: {
        message_id: { bsonType: "string" },
        campaign_id: { bsonType: "string" },
        client_phone: { bsonType: "string" },
        status: { 
          bsonType: "string",
          enum: ["queued", "sending", "sent", "failed", "skipped_opt_out"]
        },
        provider_sid: { bsonType: "string" },
        error_code: { bsonType: "string" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

// Create indexes
db.campaigns.createIndex({ name: 1 });
db.clients.createIndex({ phone: 1 }, { unique: true });
db.messages.createIndex({ campaign_id: 1 });
db.messages.createIndex({ provider_sid: 1 });
db.messages.createIndex({ status: 1 });
db.messages.createIndex({ message_id: 1 });
```

### Seed Sample Data (Optional)

```javascript
// Add sample clients
db.clients.insertMany([
  { phone: "+1234567890", opt_in: true, created_at: new Date(), updated_at: new Date() },
  { phone: "+0987654321", opt_in: true, created_at: new Date(), updated_at: new Date() },
  { phone: "+1122334455", opt_in: false, created_at: new Date(), updated_at: new Date() }
]);

// Add sample campaign
db.campaigns.insertOne({
  name: "Test Campaign",
  template_body: "Hello! This is a test message from Global Algo IT.",
  status: "draft",
  created_at: new Date()
});
```

---

## Migration from SQLite

If migrating from SQLite, use the following queries to export and convert data:

```bash
# Export from SQLite
sqlite3 data/whatsapp.db "SELECT * FROM campaigns;" -json > campaigns.json
sqlite3 data/whatsapp.db "SELECT * FROM clients;" -json > clients.json
sqlite3 data/whatsapp.db "SELECT * FROM messages;" -json > messages.json

# Import to MongoDB
mongoimport --db global_algo_whatsapp --collection campaigns --file campaigns.json --jsonArray
mongoimport --db global_algo_whatsapp --collection clients --file clients.json --jsonArray
mongoimport --db global_algo_whatsapp --collection messages --file messages.json --jsonArray
```

Note: You may need to adjust field names and data types during import (e.g., converting `opt_in` from 0/1 to boolean).
