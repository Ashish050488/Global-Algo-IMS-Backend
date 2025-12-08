"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const process_1 = require("process");
// Load env vars
dotenv_1.default.config();
// Import WhatsApp modules
const db_1 = require("./whatsapp/db");
const campaigns_1 = require("./whatsapp/api/campaigns");
const webhook_1 = require("./whatsapp/api/webhook");
const messageWorker_1 = require("./whatsapp/workers/messageWorker");
// --- STATE ---
const USERS = new Map();
const SESSIONS = new Map(); // sessionId -> username
const LOCKOUTS = new Map(); // username -> attempt state
const DATA_DIR = path_1.default.resolve('.', 'data');
const AUDIT_FILE = path_1.default.join(DATA_DIR, 'audit.jsonl');
// --- CONFIG ---
const SALT_ROUNDS = 10;
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const PORT = parseInt(process.env.PORT || '3001');
// --- INITIALIZATION ---
if (!fs_1.default.existsSync(DATA_DIR))
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
// Init WhatsApp MongoDB (async)
(async () => {
    try {
        await (0, db_1.initDb)();
        console.log('MongoDB initialization complete.');
        // Start Worker in Background (For PoC only)
        if (process.env.ENABLE_WORKER === 'true') {
            (0, messageWorker_1.startWorker)().catch(err => console.error('Worker failed to start:', err));
        }
    }
    catch (err) {
        console.error('Failed to initialize MongoDB:', err);
        process.exit(1);
    }
})();
// Seed Mock Users (Matching frontend constants)
const SEED_USERS = [
    { u: 'admin.team', p: 'Root-Admin123', r: 'Admin' },
    { u: 'owner', p: 'Root-Owner123', r: 'Admin' },
    { u: 'bm01', p: 'SetC-Temp123', r: 'Branch Manager' },
    { u: 'tl01', p: 'SetA-Temp123', r: 'Team Lead' },
    { u: 'ag001', p: 'SetB-Temp123', r: 'Agent' },
];
// Pre-hash passwords on startup
(async () => {
    console.log('Seeding in-memory database...');
    for (const cred of SEED_USERS) {
        const hash = await bcryptjs_1.default.hash(cred.p, SALT_ROUNDS);
        USERS.set(cred.u, {
            id: (0, uuid_1.v4)(),
            username: cred.u,
            role: cred.r,
            passwordHash: hash
        });
    }
    console.log(`Seeded ${USERS.size} users.`);
})();
// --- SERVER SETUP ---
const server = (0, fastify_1.default)({ logger: true });
server.register(cors_1.default, {
    origin: (origin, cb) => {
        // Allow localhost for dev, distinct for prod
        const isLocal = !origin || /^http:\/\/localhost/.test(origin);
        cb(null, isLocal); // Allow requests from localhost
    },
    credentials: true // Allow cookies to be sent
});
server.register(cookie_1.default, {
    secret: 'dev-secret-key-change-in-prod-1234567890',
    parseOptions: {}
});
server.register(formbody_1.default);
// Register WhatsApp API Routes
server.register(campaigns_1.campaignRoutes);
server.register(webhook_1.webhookRoutes);
// --- HELPERS ---
function logAudit(event) {
    const line = JSON.stringify({ ...event, _ts: new Date().toISOString() }) + '\n';
    fs_1.default.appendFile(AUDIT_FILE, line, (err) => {
        if (err)
            console.error('Failed to write audit log', err);
    });
}
// --- ROUTES ---
// 1. Auth: Login
server.post('/api/auth/login', async (req, reply) => {
    const { username, password } = req.body || {};
    if (!username || !password)
        return reply.code(400).send({ error: 'Missing credentials' });
    const userKey = username.toLowerCase();
    // Check Lockout
    const attempt = LOCKOUTS.get(userKey);
    if (attempt?.lockedUntil) {
        if (Date.now() < attempt.lockedUntil) {
            logAudit({ event: 'login_locked', actor: username, status: 'rejected' });
            return reply.code(423).send({ error: 'Account locked. Try again later.' });
        }
        else {
            // Lock expired
            LOCKOUTS.delete(userKey);
        }
    }
    const user = USERS.get(userKey);
    const isValid = user ? await bcryptjs_1.default.compare(password, user.passwordHash) : false;
    if (!isValid) {
        // Handle Failure / Lockout logic
        const now = Date.now();
        const current = LOCKOUTS.get(userKey) || { count: 0, firstAttemptAt: now, lockedUntil: null };
        // Reset window if hour passed
        if (now - current.firstAttemptAt > LOCKOUT_DURATION_MS) {
            current.count = 1;
            current.firstAttemptAt = now;
        }
        else {
            current.count++;
        }
        if (current.count >= LOCKOUT_THRESHOLD) {
            current.lockedUntil = now + LOCKOUT_DURATION_MS;
            logAudit({ event: 'account_lockout_triggered', actor: username });
        }
        LOCKOUTS.set(userKey, current);
        logAudit({ event: 'login_failure', actor: username });
        if (current.lockedUntil)
            return reply.code(423).send({ error: 'Account locked.' });
        return reply.code(401).send({ error: 'Invalid credentials' });
    }
    // Success
    LOCKOUTS.delete(userKey);
    const sessionId = (0, uuid_1.v4)();
    SESSIONS.set(sessionId, userKey);
    logAudit({ event: 'login_success', actor: username });
    reply.setCookie('session', sessionId, {
        path: '/',
        httpOnly: true,
        secure: false, // Set to true if serving over HTTPS
        sameSite: 'lax', // Use 'lax' or 'none' (with secure: true) for cross-origin dev if needed, 'strict' otherwise
        maxAge: SESSION_DURATION_MS / 1000
    });
    return {
        user: {
            user_id: user.id,
            username: user.username,
            role: user.role,
            issued_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + SESSION_DURATION_MS).toISOString()
        }
    };
});
// 2. Auth: Me (Session Check)
server.get('/api/auth/me', async (req, reply) => {
    const sessionId = req.cookies.session;
    if (!sessionId || !SESSIONS.has(sessionId)) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }
    const userKey = SESSIONS.get(sessionId);
    const user = USERS.get(userKey);
    if (!user)
        return reply.code(401).send({ error: 'User not found' });
    // Extend session if valid? (Simplified: just return info)
    return {
        user: {
            user_id: user.id,
            username: user.username,
            role: user.role,
            issued_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + SESSION_DURATION_MS).toISOString()
        }
    };
});
// 3. Auth: Logout
server.post('/api/auth/logout', async (req, reply) => {
    const sessionId = req.cookies.session;
    if (sessionId) {
        SESSIONS.delete(sessionId);
    }
    logAudit({ event: 'logout', actor: sessionId ? 'session_user' : 'unknown' });
    reply.clearCookie('session', { path: '/' });
    return { success: true };
});
// 4. Audit: Ingest
server.post('/api/audit', async (req, reply) => {
    const payload = req.body || {};
    logAudit({ ...payload, source: 'client_report' });
    return { status: 'ok' };
});
// 5. Modules: Pluggable Connector
server.get('/api/modules/:moduleName', async (req, reply) => {
    const { moduleName } = req.params;
    // Auth Check - Ensure session exists
    const sessionId = req.cookies.session;
    if (!sessionId || !SESSIONS.has(sessionId))
        return reply.code(401).send({ error: 'Unauthorized' });
    // Mock Connector Logic
    switch (moduleName) {
        case 'team_performance':
            // Return structured data matching frontend interface TeamPerformanceData
            const performanceData = Array.from({ length: 8 }, (_, i) => {
                const num = (i + 1).toString().padStart(2, '0');
                const baseSeed = (i + 1) * 17;
                return {
                    teamLeadId: `tl_${num}`,
                    teamLeadName: `Team Lead ${num}`,
                    weeklyKYCs: 15 + (baseSeed % 35),
                    weeklyCollection: 50000 + ((baseSeed * 13) % 450000),
                    weeklyTradingVolume: 500000 + ((baseSeed * 29) % 4500000),
                    totalAgents: 20
                };
            });
            return { data: performanceData };
        case 'upload_xlsx':
            return { status: 'ready', allowed_types: ['.xlsx', '.xls'] };
        default:
            return {
                module: moduleName,
                status: 'active',
                data: { message: `Mock data for ${moduleName}` }
            };
    }
});
// Start
const start = async () => {
    try {
        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Backend running at http://localhost:${PORT}`);
    }
    catch (err) {
        server.log.error(err);
        (0, process_1.exit)(1);
    }
};
start();
