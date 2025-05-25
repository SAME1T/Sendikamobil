const express = require('express');
const router = express.Router();
const pool = require('../db');

// Tüm grevleri getir
router.get('/', async (req, res) => {
  try {
    console.log('Tüm grevler isteniyor...');
    console.log('Veritabanı bağlantısı test ediliyor...');
    
    // Önce basit bir test sorgusu yapalım
    const testResult = await pool.query('SELECT 1 as test');
    console.log('Veritabanı bağlantısı başarılı:', testResult.rows);
    
    // Grevler tablosunu kontrol et
    const tableCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'grevler'
      ORDER BY ordinal_position
    `);
    console.log('Grevler tablosu sütunları:', tableCheck.rows);
    
    const result = await pool.query(`
      SELECT 
        g.id, g.baslik, g.neden, g.katilimci_sayisi, g.durum, g.olusturan_id,
        TO_CHAR(g.karar_tarihi, 'YYYY-MM-DD') as karar_tarihi,
        TO_CHAR(g.baslangic_tarihi, 'YYYY-MM-DD') as baslangic_tarihi,
        TO_CHAR(g.bitis_tarihi, 'YYYY-MM-DD') as bitis_tarihi,
        COALESCE(SUM(CASE WHEN go.oy = true THEN 1 ELSE 0 END), 0) as evet,
        COALESCE(SUM(CASE WHEN go.oy = false THEN 1 ELSE 0 END), 0) as hayir,
        COALESCE(COUNT(go.id), 0) as toplam_oy,
        CASE 
          WHEN COUNT(go.id) > 0 THEN 
            ROUND((SUM(CASE WHEN go.oy = true THEN 1 ELSE 0 END) * 100.0 / COUNT(go.id)), 1)
          ELSE 0 
        END as evet_oran,
        CASE 
          WHEN g.katilimci_sayisi > 0 THEN 
            ROUND((COUNT(go.id) * 100.0 / g.katilimci_sayisi), 1)
          ELSE 0 
        END as katilim_oran
      FROM grevler g
      LEFT JOIN grev_oylari go ON g.id = go.grev_id
      GROUP BY g.id, g.baslik, g.neden, g.karar_tarihi, g.baslangic_tarihi, g.bitis_tarihi, g.katilimci_sayisi, g.durum, g.olusturan_id
      ORDER BY g.id DESC
    `);
    console.log('Bulunan grev sayısı:', result.rows.length);
    console.log('Grevler:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Grev getirme hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// Aktif grevleri getir (oylamada, bekleme, onaylandi, reddedildi)
router.get('/aktif', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.id, g.baslik, g.neden, g.katilimci_sayisi, g.durum, g.olusturan_id,
        TO_CHAR(g.karar_tarihi, 'YYYY-MM-DD') as karar_tarihi,
        TO_CHAR(g.baslangic_tarihi, 'YYYY-MM-DD') as baslangic_tarihi,
        TO_CHAR(g.bitis_tarihi, 'YYYY-MM-DD') as bitis_tarihi,
        COALESCE(SUM(CASE WHEN go.oy = true THEN 1 ELSE 0 END), 0) as evet,
        COALESCE(SUM(CASE WHEN go.oy = false THEN 1 ELSE 0 END), 0) as hayir,
        COALESCE(COUNT(go.id), 0) as toplam_oy,
        CASE 
          WHEN COUNT(go.id) > 0 THEN 
            ROUND((SUM(CASE WHEN go.oy = true THEN 1 ELSE 0 END) * 100.0 / COUNT(go.id)), 1)
          ELSE 0 
        END as evet_oran,
        CASE 
          WHEN g.katilimci_sayisi > 0 THEN 
            ROUND((COUNT(go.id) * 100.0 / g.katilimci_sayisi), 1)
          ELSE 0 
        END as katilim_oran
      FROM grevler g
      LEFT JOIN grev_oylari go ON g.id = go.grev_id
      WHERE g.durum IN ('oylamada', 'bekleme', 'onaylandi', 'reddedildi')
      GROUP BY g.id, g.baslik, g.neden, g.karar_tarihi, g.baslangic_tarihi, g.bitis_tarihi, g.katilimci_sayisi, g.durum, g.olusturan_id
      ORDER BY g.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Yeni grev oluştur
router.post('/', async (req, res) => {
  console.log('Grev oluşturma isteği alındı:', req.body);
  
  const { baslik, neden, karar_tarihi, baslangic_tarihi, bitis_tarihi, olusturan_id } = req.body;
  
  if (!baslik || !neden || !karar_tarihi || !baslangic_tarihi || !bitis_tarihi || !olusturan_id) {
    console.log('Eksik bilgi hatası:', { baslik, neden, karar_tarihi, baslangic_tarihi, bitis_tarihi, olusturan_id });
    return res.status(400).json({ error: 'Eksik bilgi var.' });
  }
  
  try {
    console.log('Veritabanına kaydetme işlemi başlıyor...');
    const result = await pool.query(
      `INSERT INTO grevler (baslik, neden, karar_tarihi, baslangic_tarihi, bitis_tarihi, katilimci_sayisi, durum, olusturan_id)
       VALUES ($1, $2, $3, $4, $5, 0, 'oylamada', $6) RETURNING *`,
      [baslik, neden, karar_tarihi, baslangic_tarihi, bitis_tarihi, olusturan_id]
    );
    console.log('Grev başarıyla kaydedildi:', result.rows[0]);
    res.json({ success: true, grev: result.rows[0] });
  } catch (err) {
    console.error('Grev kaydetme hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// Oylamayı sonlandır ve onay beklemesine geçir
router.post('/sonlandir/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('UPDATE grevler SET durum = $1 WHERE id = $2', ['bekleme', id]);
    res.json({ success: true, message: 'Oylama sonlandırıldı, onay bekleniyor.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Grev kararı ver (onay/red)
router.post('/karar/:id', async (req, res) => {
  const { id } = req.params;
  const { karar } = req.body; // 'onay' veya 'red'
  
  if (!karar || !['onay', 'red'].includes(karar)) {
    return res.status(400).json({ error: 'Geçersiz karar.' });
  }
  
  try {
    const durum = karar === 'onay' ? 'onaylandi' : 'reddedildi';
    await pool.query('UPDATE grevler SET durum = $1 WHERE id = $2', [durum, id]);
    res.json({ success: true, message: `Grev ${durum}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Grev sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  
  try {
    // Sadece oluşturan silebilir
    const result = await pool.query(
      'DELETE FROM grevler WHERE id = $1 AND olusturan_id = $2 RETURNING id',
      [id, user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Bu grevi silme yetkiniz yok.' });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Oy kullan
router.post('/oy/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, oy } = req.body; // oy: 'evet' veya 'hayir'
  
  if (!user_id || !oy || !['evet', 'hayir'].includes(oy)) {
    return res.status(400).json({ error: 'Geçersiz oy.' });
  }
  
  try {
    // Daha önce oy kullanmış mı kontrol et
    const existingVote = await pool.query(
      'SELECT * FROM grev_oylari WHERE grev_id = $1 AND user_id = $2',
      [id, user_id]
    );
    
    if (existingVote.rows.length > 0) {
      return res.status(400).json({ error: 'Bu grev için zaten oy kullandınız.' });
    }
    
    // Grev durumu kontrol et
    const grev = await pool.query('SELECT durum FROM grevler WHERE id = $1', [id]);
    if (grev.rows.length === 0) {
      return res.status(404).json({ error: 'Grev bulunamadı.' });
    }
    
    if (grev.rows[0].durum !== 'oylamada') {
      return res.status(400).json({ error: 'Bu grev için oylama süreci sona ermiş.' });
    }
    
    // Oy kaydet - string'i boolean'a çevir
    const oyBoolean = oy === 'evet' ? true : false;
    await pool.query(
      'INSERT INTO grev_oylari (grev_id, user_id, oy) VALUES ($1, $2, $3)',
      [id, user_id, oyBoolean]
    );
    
    // Tüm işçiler oy kullandı mı kontrol et
    const toplamIsciSayisi = await pool.query('SELECT COUNT(*) as toplam FROM users WHERE rol = 1');
    const oyKullananSayisi = await pool.query('SELECT COUNT(DISTINCT user_id) as kullanan FROM grev_oylari WHERE grev_id = $1', [id]);
    
    const toplamIsci = parseInt(toplamIsciSayisi.rows[0].toplam);
    const oyKullanan = parseInt(oyKullananSayisi.rows[0].kullanan);
    
    console.log(`Toplam işçi: ${toplamIsci}, Oy kullanan: ${oyKullanan}`);
    
    // Eğer tüm işçiler oy kullandıysa durumu 'bekleme'ye çek
    if (oyKullanan >= toplamIsci) {
      await pool.query('UPDATE grevler SET durum = $1 WHERE id = $2', ['bekleme', id]);
      console.log(`Grev ${id} otomatik olarak onay beklemesine geçti.`);
    }
    
    res.json({ success: true, message: 'Oyunuz kaydedildi.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 