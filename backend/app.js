const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

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
          username: user.username,
          email: user.email
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

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
}); 