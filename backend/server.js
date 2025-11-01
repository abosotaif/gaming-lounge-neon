import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// --- Default Data (from frontend constants) ---

const INITIAL_DEVICES = [
  { id: 1, name: 'PS-1', status: 'available', type: 'PS4' },
  { id: 2, name: 'PS-2', status: 'available', type: 'PS4' },
  { id: 3, name: 'PS-3', status: 'available', type: 'PS5' },
  { id: 4, name: 'PS-4', status: 'available', type: 'PS4' },
  { id: 5, name: 'PS-5', status: 'available', type: 'PS5' },
];

const INITIAL_PRICES = {
  ps4: { single: 10, double: 20, quad: 30 },
  ps5: { single: 15, double: 25, quad: 35 }
};

const INITIAL_CREDENTIALS = {
  loginUser: 'admin',
  loginPass: 'admin',
  adminPass: '12',
};

const INITIAL_LABELS = {
  app_title: "نظام صالة الألعاب",
  dashboard: "لوحة التحكم",
  reports: "التقارير",
  admin: "الإدارة",
  theme_switcher: "تغيير الثيم",
  login_page_title: "تسجيل دخول - نظام صالة الألعاب",
  username: "اسم المستخدم",
  password: "كلمة المرور",
  login: "دخول",
  device: "جهاز",
  available: "متاح",
  busy: "مشغول",
  maintenance: "تحت الصيانة",
  start_session: "بدء جلسة",
  end_session: "إنهاء الجلسة",
  session_details: "تفاصيل الجلسة",
  game_type: "نوع اللعب",
  single: "فردي",
  double: "زوجي",
  quad: "رباعي",
  time_mode: "نمط التوقيت",
  open_time: "وقت مفتوح",
  timed: "محدد",
  duration_minutes: "المدة (دقائق)",
  cancel: "إلغاء",
  start: "بدء",
  time_remaining: "الوقت المتبقي",
  session_time_ended_for: "انتهى وقت الجلسة للجهاز",
  choose_action: "اختر الإجراء المناسب.",
  switch_to_open_time: "تحويل لوقت مفتوح",
  extend_time: "تمديد الوقت",
  stop_session: "إيقاف الجلسة",
  extend_session_for: "تمديد الجلسة للجهاز",
  additional_time: "الوقت الإضافي",
  confirm_extension: "تأكيد التمديد",
  total_revenue_for: "إجمالي الإيرادات ليوم",
  no_reports_for_selected_date: "لا توجد تقارير للتاريخ المحدد.",
  print_pdf: "طباعة PDF",
  save_html: "حفظ صفحة ويب",
  report_details: "تفاصيل التقرير",
  date: "التاريخ",
  device_id: "رقم الجهاز",
  start_time: "وقت البدء",
  end_time: "وقت الإنتهاء",
  duration: "المدة",
  cost: "التكلفة",
  total: "الإجمالي",
  admin_panel: "لوحة تحكم المدير",
  enter_admin_password: "الرجاء إدخال كلمة مرور المدير للوصول",
  submit: "إرسال",
  price_management: "إدارة الأسعار",
  ps4_price_management: "إدارة أسعار PS4",
  ps5_price_management: "إدارة أسعار PS5",
  single_price_per_hour: "سعر اللعب الفردي (للساعة)",
  double_price_per_hour: "سعر اللعب الزوجي (للساعة)",
  quad_price_per_hour: "سعر اللعب الرباعي (للساعة)",
  update_prices: "تحديث الأسعار",
  device_management: "إدارة الأجهزة",
  device_type: "نوع الجهاز",
  add_new_device: "إضافة جهاز جديد",
  add: "إضافة",
  reports_management: "إدارة التقارير",
  delete_all_reports: "حذف جميع التقارير",
  confirm_delete_all_reports: "هل أنت متأكد من رغبتك في حذف جميع التقارير؟ لا يمكن التراجع عن هذا الإجراء.",
  confirm_delete: "تأكيد الحذف",
  confirm_delete_password_prompt: "للتأكيد، يرجى إدخال كلمة مرور المدير للمتابعة.",
  label_management: "إدارة التسميات",
  page_title: "عنوان الصفحة",
  label_text: "نص التسمية",
  save_labels: "حفظ التسميات",
  confirm_end_session: "تأكيد إنهاء الجلسة",
  confirm: "تأكيد",
  minute_short: "دقيقة",
  session_will_end_in: "سيتم إنهاء الجلسة تلقائياً خلال {0} ثواني.",
  end_session_now: "إنهاء الجلسة الآن",
  password_management: "إدارة كلمات المرور",
  login_username: "اسم مستخدم الدخول",
  login_password: "كلمة سر الدخول",
  admin_panel_password: "كلمة سر لوحة الإدارة",
  save_and_export_pdf: "حفظ وتصدير PDF",
  password_change_report: "تقرير تغيير كلمة المرور",
  changes_made_on: "التغييرات التي تمت بتاريخ",
  new_login_username: "اسم مستخدم الدخول الجديد",
  new_login_password: "كلمة سر الدخول الجديدة",
  new_admin_password: "كلمة سر الإدارة الجديدة",
  store_securely_warning: "هام: يرجى تخزين هذه المعلومات في مكان آمن. لا يمكن استعادتها.",
  passwords_updated_success: "تم تحديث كلمات المرور بنجاح!",
  search_by_device_name: "البحث باسم الجهاز...",
  all_statuses: "كل الحالات",
  no_devices_match_search: "لا توجد أجهزة تطابق معايير البحث.",
  player_name: "اسم اللاعب",
  enter_player_name_optional: "أدخل اسم اللاعب (اختياري)",
  session_ended_summary_title: "انتهت الجلسة",
  player_must_pay: "المبلغ المطلوب دفعه",
  close: "إغلاق",
  logout: "تسجيل الخروج",
};

// --- Server Setup ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json());

// --- Database Initialization ---
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        type TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY,
        "deviceId" INTEGER NOT NULL,
        "startTime" BIGINT NOT NULL,
        "endTime" BIGINT NOT NULL,
        "durationMinutes" INTEGER NOT NULL,
        "gameType" TEXT NOT NULL,
        cost NUMERIC(10, 2) NOT NULL,
        date DATE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);
    
    console.log('Database tables are ready.');

    const devicesCount = await client.query('SELECT COUNT(*) FROM devices');
    if (parseInt(devicesCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial devices...');
      const deviceInserts = INITIAL_DEVICES.map(d => 
        client.query('INSERT INTO devices (id, name, status, type) VALUES ($1, $2, $3, $4)', [d.id, d.name, d.status, d.type])
      );
      await Promise.all(deviceInserts);
      await client.query(`SELECT setval('devices_id_seq', (SELECT MAX(id) FROM devices))`);
    }

    const settingsRes = await client.query("SELECT key FROM settings");
    const existingKeys = settingsRes.rows.map(r => r.key);

    if (!existingKeys.includes('prices')) {
        console.log("Seeding initial prices...");
        await client.query("INSERT INTO settings (key, value) VALUES ('prices', $1::jsonb)", [JSON.stringify(INITIAL_PRICES)]);
    }
    if (!existingKeys.includes('credentials')) {
        console.log("Seeding initial credentials...");
        await client.query("INSERT INTO settings (key, value) VALUES ('credentials', $1::jsonb)", [JSON.stringify(INITIAL_CREDENTIALS)]);
    }
    if (!existingKeys.includes('labels')) {
        console.log("Seeding initial labels...");
        await client.query("INSERT INTO settings (key, value) VALUES ('labels', $1::jsonb)", [JSON.stringify(INITIAL_LABELS)]);
    }

  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
};

// --- API Routes ---

app.get('/api/state', async (req, res) => {
    try {
        const devicesRes = await pool.query('SELECT * FROM devices ORDER BY id ASC');
        const reportsRes = await pool.query('SELECT * FROM reports ORDER BY "startTime" DESC');
        const settingsRes = await pool.query("SELECT key, value FROM settings");

        const settings = settingsRes.rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        
        res.json({
            devices: devicesRes.rows,
            reports: reportsRes.rows,
            prices: settings.prices || INITIAL_PRICES,
            labels: settings.labels || INITIAL_LABELS,
            credentials: settings.credentials || INITIAL_CREDENTIALS,
        });
    } catch (err) {
        console.error('State fetch error:', err);
        res.status(500).json({ message: 'Error fetching initial state' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { user, pass } = req.body;
        const credentialsRes = await pool.query("SELECT value FROM settings WHERE key = 'credentials'");
        const creds = credentialsRes.rows[0]?.value || INITIAL_CREDENTIALS;

        if (user === creds.loginUser && pass === creds.loginPass) {
            res.json({ success: true, adminPass: creds.adminPass });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed' });
    }
});

app.post('/api/devices', async (req, res) => {
    try {
        const { name, status, type } = req.body;
        const newDevice = await pool.query(
            'INSERT INTO devices (name, status, type) VALUES ($1, $2, $3) RETURNING *',
            [name, status, type]
        );
        res.status(201).json(newDevice.rows[0]);
    } catch (err) {
        console.error('Add device error:', err);
        res.status(500).json({ message: 'Error adding device' });
    }
});

app.put('/api/devices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status, type } = req.body;
        const updatedDevice = await pool.query(
            'UPDATE devices SET name = $1, status = $2, type = $3 WHERE id = $4 RETURNING *',
            [name, status, type, id]
        );
        res.json(updatedDevice.rows[0]);
    } catch (err) {
        console.error('Update device error:', err);
        res.status(500).json({ message: 'Error updating device' });
    }
});

app.delete('/api/devices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM devices WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error('Delete device error:', err);
        res.status(500).json({ message: 'Error deleting device' });
    }
});

app.post('/api/sessions/end', async (req, res) => {
    try {
        const { reportData } = req.body;
        const newId = uuidv4();
        const date = new Date(reportData.endTime).toISOString().split('T')[0];

        const newReport = await pool.query(
            'INSERT INTO reports (id, "deviceId", "startTime", "endTime", "durationMinutes", "gameType", cost, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [newId, reportData.deviceId, reportData.startTime, reportData.endTime, reportData.durationMinutes, reportData.gameType, reportData.cost, date]
        );
        res.status(201).json(newReport.rows[0]);
    } catch (err) {
        console.error('End session error:', err);
        res.status(500).json({ message: 'Error saving session' });
    }
});

app.delete('/api/reports', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE reports');
        res.status(204).send();
    } catch (err) {
        console.error('Delete reports error:', err);
        res.status(500).json({ message: 'Error deleting reports' });
    }
});

const updateSetting = async (key, value, res) => {
    try {
        await pool.query(
            'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [key, JSON.stringify(value)]
        );
        res.status(204).send();
    } catch (err) {
        console.error(`Update setting error for ${key}:`, err);
        res.status(500).json({ message: `Error updating ${key}` });
    }
};

app.post('/api/settings/prices', async (req, res) => {
    await updateSetting('prices', req.body.value, res);
});

app.post('/api/settings/labels', async (req, res) => {
    await updateSetting('labels', req.body.value, res);
});

app.post('/api/settings/credentials', async (req, res) => {
    await updateSetting('credentials', req.body.value, res);
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  initializeDatabase();
});
