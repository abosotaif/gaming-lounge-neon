
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import 'dotenv/config';

// --- INITIAL CONSTANTS (MOVED HERE TO FIX IMPORT ISSUES) ---

const INITIAL_DEVICES = [
  { name: 'PS-1', status: 'available', type: 'PS4' },
  { name: 'PS-2', status: 'available', type: 'PS4' },
  { name: 'PS-3', status: 'available', type: 'PS5' },
  { name: 'PS-4', status: 'available', type: 'PS4' },
  { name: 'PS-5', status: 'available', type: 'PS5' },
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

// --- END OF CONSTANTS ---


const app = express();
const port = process.env.PORT || 3001;

// Vercel deployment adds a `VERCEL_URL` environment variable.
const allowedOrigins = [
    `https://${process.env.FRONTEND_URL}`,
    'http://localhost:3000'
];

app.use(cors({
    origin: function(origin, callback){
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
app.use(express.json());

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Seed initial data if tables are empty
const seedInitialData = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check and seed settings (prices, credentials)
        const settingsRes = await client.query('SELECT key FROM app_settings');
        const existingKeys = settingsRes.rows.map(r => r.key);

        if (!existingKeys.includes('prices')) {
            console.log('Seeding initial prices...');
            await client.query('INSERT INTO app_settings (key, value) VALUES ($1, $2)', ['prices', JSON.stringify(INITIAL_PRICES)]);
        }
        if (!existingKeys.includes('credentials')) {
            console.log('Seeding initial credentials...');
            await client.query('INSERT INTO app_settings (key, value) VALUES ($1, $2)', ['credentials', JSON.stringify(INITIAL_CREDENTIALS)]);
        }

        // Check and seed labels
        const labelsRes = await client.query('SELECT COUNT(*) FROM app_labels');
        if (parseInt(labelsRes.rows[0].count, 10) === 0) {
            console.log('Seeding initial labels...');
            const labelEntries = Object.entries(INITIAL_LABELS);
            for (const [key, value] of labelEntries) {
                await client.query('INSERT INTO app_labels (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [key, value]);
            }
        }
        
        // Check and seed devices
        const devicesRes = await client.query('SELECT COUNT(*) FROM devices');
        if (parseInt(devicesRes.rows[0].count, 10) === 0) {
            console.log('Seeding initial devices...');
            for (const device of INITIAL_DEVICES) {
                await client.query('INSERT INTO devices (name, status, type) VALUES ($1, $2, $3)', [device.name, device.status, device.type]);
            }
        }

        await client.query('COMMIT');
        console.log('Initial data seeding check complete.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error during initial data seeding:', e);
    } finally {
        client.release();
    }
};

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
    const reportsRes = await pool.query('SELECT * FROM reports');
    const settings = await getSettings();
    
    const labelsRes = await pool.query('SELECT key, value FROM app_labels');
    const labels = {};
    for(const row of labelsRes.rows) {
        labels[row.key] = row.value;
    }

    res.json({
      devices: devicesRes.rows,
      reports: reportsRes.rows,
      prices: settings.prices || INITIAL_PRICES,
      labels: Object.keys(labels).length > 0 ? labels : INITIAL_LABELS,
      credentials: settings.credentials || INITIAL_CREDENTIALS,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load app state' });
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
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch(err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// Devices Endpoints
app.post('/api/devices', async (req, res) => {
    try {
        const { name, status, type } = req.body;
        const result = await pool.query(
            'INSERT INTO devices(name, status, type) VALUES($1, $2, $3) RETURNING *', 
            [name, status, type]
        );
        res.status(201).json(result.rows[0]);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create device' });
    }
});

app.put('/api/devices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status, type } = req.body;
        const result = await pool.query(
            'UPDATE devices SET name = $1, status = $2, type = $3 WHERE id = $4 RETURNING *',
            [name, status, type, id]
        );
        res.json(result.rows[0]);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update device' });
    }
});

app.delete('/api/devices/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM devices WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete device' });
    }
});

// Session Endpoint
app.post('/api/sessions/end', async (req, res) => {
    try {
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
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save session' });
    }
});

// Settings
app.post('/api/settings/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        await pool.query(
            'INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
            [key, JSON.stringify(value)]
        );
        res.json({ success: true });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Reports
app.delete('/api/reports', async (req, res) => {
    try {
        await pool.query('DELETE FROM reports');
        res.status(204).send();
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete reports' });
    }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  seedInitialData();
});
