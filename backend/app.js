const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// CORS ayarlarını güncelle
app.use(cors({
  origin: '*', // Expo için tüm originlere izin ver
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sendika API Çalışıyor!');
});

// Basit bir örnek endpoint
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { tc_no, password } = req.body;

  try {
    // Veritabanında kullanıcıyı ara
    const result = await pool.query(
      'SELECT * FROM users WHERE tc_no = $1 AND password = $2',
      [tc_no, password]
    );

    if (result.rows.length > 0) {
      // Kullanıcı bulundu
      const user = result.rows[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          ad: user.ad,
          soyad: user.soyad,
          rol: user.rol,
          email: user.email,
          telefon: user.telefon,
          tc_no: user.tc_no
        }
      });
    } else {
      // Kullanıcı bulunamadı
      res.status(401).json({
        success: false,
        message: 'TC Kimlik No veya şifre hatalı'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu'
    });
  }
});

// Kullanıcı kayıt endpoint'i
app.post('/api/register', async (req, res) => {
  const { ad, soyad, tc_no, telefon, email, password, rol } = req.body;
  if (!ad || !soyad || !tc_no || !telefon || !email || !password || typeof rol !== 'number') {
    return res.status(400).json({ success: false, message: 'Eksik bilgi var.' });
  }
  try {
    // TC veya email zaten kayıtlı mı?
    const exists = await pool.query('SELECT * FROM users WHERE tc_no = $1 OR email = $2', [tc_no, email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Bu TC veya e-posta ile zaten kayıt var.' });
    }
    await pool.query(
      'INSERT INTO users (ad, soyad, tc_no, telefon, email, password, rol) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [ad, soyad, tc_no, telefon, email, password, rol]
    );
    res.json({ success: true, message: 'Kayıt başarılı!' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Bordro (payrolls) listeleme
app.get('/api/payrolls', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payrolls ORDER BY created_at DESC');
    res.json({ success: true, payrolls: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bordro (payrolls) ekleme
app.post('/api/payrolls', async (req, res) => {
  const { user_id, payroll_date, amount, description, pdf_path } = req.body;
  if (!user_id || !payroll_date || !amount || !description || !pdf_path) {
    return res.status(400).json({ success: false, message: 'Eksik bilgi var.' });
  }
  try {
    await pool.query(
      'INSERT INTO payrolls (user_id, payroll_date, amount, description, pdf_path) VALUES ($1, $2, $3, $4, $5)',
      [user_id, payroll_date, amount, description, pdf_path]
    );
    res.json({ success: true, message: 'Bordro başarıyla eklendi!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// İşçi listesini döner
app.get('/api/workers', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, ad, soyad FROM users WHERE rol = 1');
    res.json({ success: true, workers: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PDF upload için storage ayarı
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads', 'payrolls'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Sadece PDF dosyası yükleyebilirsiniz!'));
    }
  }
});

// PDF upload endpointi
app.post('/api/upload/payroll', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Dosya yüklenemedi.' });
  }
  // Yüklenen dosyanın yolunu döndür
  const pdfPath = '/uploads/payrolls/' + req.file.filename;
  res.json({ success: true, pdf_path: pdfPath });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
}); 