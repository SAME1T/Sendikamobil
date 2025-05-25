const express = require('express');
const router = express.Router();
const pool = require('../db');

// Kullanıcı bilgilerini getir
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT id, ad, soyad, email, telefon, tc_no, rol, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Kullanıcı getirme hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// Kullanıcı bilgilerini güncelle
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { ad, soyad, email, telefon, sifre } = req.body;
  
  try {
    let query = 'UPDATE users SET ad = $1, soyad = $2, email = $3, telefon = $4';
    let params = [ad, soyad, email, telefon];
    
    // Şifre varsa güncelle
    if (sifre) {
      query += ', password = $5';
      params.push(sifre);
    }
    
    query += ' WHERE id = $' + (params.length + 1) + ' RETURNING *';
    params.push(id);
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Kullanıcı güncelleme hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// Tüm kullanıcıları getir (admin için)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, ad, soyad, email, telefon, tc_no, rol, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Kullanıcılar getirme hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 