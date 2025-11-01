import express from 'express';
import cors from 'cors';
import pg from 'pg';
import 'dotenv/config';

const app = express();
const port = 3001;

// CORS configuration for production and development
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper to get all settings from DB
const getSettings = async () => {
    const results = await pool.query('SELECT key, value FROM app_settings');
    const settings = {};
    for (const row of results.rows) {
        settings[row.key] = row.value;
    }
    return settings;
};

// Endpoint to load all initial state for the app
app.get('/api/state', async (req, res) => {
  try {
    const devicesRes = await pool.query('SELECT * FROM devices ORDER BY id');
    const reportsRes = await pool.query('SELECT * FROM reports ORDER BY "startTime" DESC');
    const settings = await getSettings();

    res.json({
      devices: devicesRes.rows,
      reports: reportsRes.rows,
      prices: settings.prices,
      labels: settings.labels, 
      credentials: settings.credentials
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load app state' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { user, pass } = req.body;
    try {
        const settings = await getSettings();
        if (settings.credentials && user === settings.credentials.loginUser && pass === settings.credentials.loginPass) {
            res.json({ success: true, adminPass: settings.credentials.adminPass });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed due to server error' });
    }
});

// Devices Endpoints
app.get('/api/devices', async (req, res) => {
    const result = await pool.query('SELECT * FROM devices ORDER BY id');
    res.json(result.rows);
});

app.post('/api/devices', async (req, res) => {
    const { name, status, type } = req.body;
    const result = await pool.query(
        'INSERT INTO devices(name, status, type) VALUES($1, $2, $3) RETURNING *', 
        [name, status, type]
    );
    res.status(201).json(result.rows[0]);
});

app.put('/api/devices/:id', async (req, res) => {
    const { id } = req.params;
    const { name, status, type } = req.body;
    const result = await pool.query(
        'UPDATE devices SET name = $1, status = $2, type = $3 WHERE id = $4 RETURNING *',
        [name, status, type, id]
    );
    res.json(result.rows[0]);
});

app.delete('/api/devices/:id', async (req, res) => {
    await pool.query('DELETE FROM devices WHERE id = $1', [req.params.id]);
    res.status(204).send();
});

// Session Endpoint
app.post('/api/sessions/end', async (req, res) => {
    const { reportData } = req.body;
    const { deviceId, startTime, endTime, durationMinutes, gameType, cost } = reportData;
    const newReport = {
      id: `${Date.now()}-${deviceId}`,
      date: new Date(startTime).toISOString().split('T')[0],
      cost: parseFloat(cost.toFixed(2)),
      deviceId, startTime, endTime, durationMinutes, gameType
    };
    await pool.query(
        `INSERT INTO reports(id, "deviceId", "startTime", "endTime", "durationMinutes", "gameType", cost, date) 
         VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newReport.id, newReport.deviceId, newReport.startTime, newReport.endTime, newReport.durationMinutes, newReport.gameType, newReport.cost, newReport.date]
    );
    res.status(201).json(newReport);
});

// Settings (used for prices, labels, credentials)
app.post('/api/settings/:key', async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    await pool.query(
        'INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        [key, JSON.stringify(value)]
    );
    res.json({ success: true });
});

// Reports
app.get('/api/reports', async (req, res) => {
    const result = await pool.query('SELECT * FROM reports ORDER BY "startTime" DESC');
    res.json(result.rows);
});

app.delete('/api/reports', async (req, res) => {
    await pool.query('DELETE FROM reports');
    res.status(204).send();
});

// Vercel needs this export for serverless functions
export default app;
