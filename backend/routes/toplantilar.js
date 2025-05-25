const express = require('express');
const router = express.Router();
const pool = require('../db');

// Tüm toplantıları getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, baslik, yer, gundem, yapilacaklar, katilimcilar, olusturan_id, created_at,
        TO_CHAR(tarih, 'YYYY-MM-DD') as tarih,
        TO_CHAR(saat, 'HH24:MI') as saat
      FROM toplantilar 
      ORDER BY tarih DESC, saat DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Yeni toplantı ekle
router.post('/', async (req, res) => {
  const { baslik, tarih, saat, yer, gundem, yapilacaklar, katilimcilar, olusturan_id } = req.body;
  
  if (!baslik || !tarih || !saat || !yer || !olusturan_id) {
    return res.status(400).json({ error: 'Eksik bilgi var.' });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO toplantilar (baslik, tarih, saat, yer, gundem, yapilacaklar, katilimcilar, olusturan_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
      [baslik, tarih, saat, yer, gundem, yapilacaklar, katilimcilar, olusturan_id]
    );
    res.json({ success: true, toplanti: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toplantı sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  
  try {
    // Sadece toplantıyı oluşturan silebilir
    const result = await pool.query(
      'DELETE FROM toplantilar WHERE id = $1 AND olusturan_id = $2 RETURNING id',
      [id, user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Bu toplantıyı silme yetkiniz yok.' });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sendikacıları getir (katılımcı seçimi için)
router.get('/sendikacilar', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, ad, soyad FROM users WHERE rol = 2 ORDER BY ad, soyad'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 