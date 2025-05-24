const express = require('express');
const router = express.Router();
const pool = require('../db');

// Tüm etkinlikleri getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, baslik, aciklama, konum, tur, olusturan_id, durum, created_at,
        TO_CHAR(tarih, 'YYYY-MM-DD') as tarih,
        TO_CHAR(bitis_tarihi, 'YYYY-MM-DD') as bitis_tarihi,
        TO_CHAR(saat, 'HH24:MI') as saat,
        TO_CHAR(bitis_saati, 'HH24:MI') as bitis_saati
      FROM etkinlikler 
      ORDER BY tarih DESC, saat DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tarihi lokal timezone ile YYYY-MM-DD formatında döndür
function formatLocalDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Yeni etkinlik ekle
router.post('/', async (req, res) => {
  const { baslik, tur, tarih, saat, bitis_tarihi, bitis_saati, konum, aciklama, olusturan_id } = req.body;
  if (!baslik || !tur || !tarih || !saat || !konum || !olusturan_id) {
    return res.status(400).json({ error: 'Eksik bilgi var.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO etkinlikler (baslik, tur, tarih, saat, bitis_tarihi, bitis_saati, konum, aciklama, olusturan_id, durum, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'aktif', NOW()) RETURNING *`,
      [baslik, tur, tarih, saat, bitis_tarihi, bitis_saati, konum, aciklama, olusturan_id]
    );
    res.json({ success: true, etkinlik: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Etkinlik sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM etkinlikler WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 