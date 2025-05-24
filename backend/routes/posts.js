const express = require('express');
const router = express.Router();
const pool = require('../db');

// Tüm paylaşımları getir (timeline)
router.get('/', async (req, res) => {
  const { user_id, user_role } = req.query;
  
  console.log('Paylaşımlar isteniyor:', { user_id, user_role }); // Debug için
  
  try {
    let query = `
      SELECT 
        p.id, p.user_id, p.icerik, p.kategori, p.gizlilik, p.media_path, 
        p.hedef_kullanici_id, p.created_at, p.updated_at,
        u.ad, u.soyad, u.rol,
        (SELECT COUNT(*) FROM begeniler WHERE paylasim_id = p.id) as begeni_sayisi,
        (SELECT COUNT(*) FROM yorumlar WHERE paylasim_id = p.id) as yorum_sayisi,
        (SELECT COUNT(*) > 0 FROM begeniler WHERE paylasim_id = p.id AND user_id = $1) as kullanici_begendi
      FROM paylasimlar p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [user_id];
    
    // İşçi ise
    if (user_role == 1) {
      query += ` AND (
        (p.user_id = $1) OR 
        (p.hedef_kullanici_id = $1 AND p.gizlilik = 'kisisel') OR 
        (p.gizlilik = 'herkes' AND p.hedef_kullanici_id IS NULL)
      )`;
    }
    // Sendikacı ise
    else if (user_role == 2) {
      query += ` AND (
        (p.user_id = $1) OR 
        (p.hedef_kullanici_id = $1 AND p.gizlilik = 'kisisel') OR 
        (p.gizlilik = 'herkes' AND p.hedef_kullanici_id IS NULL)
      )`;
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT 50`;
    
    console.log('SQL Sorgusu:', query); // Debug için
    console.log('Parametreler:', params); // Debug için
    
    const result = await pool.query(query, params);
    console.log('Bulunan paylaşım sayısı:', result.rows.length); // Debug için
    res.json(result.rows);
  } catch (err) {
    console.error('Paylaşım getirme hatası:', err); // Debug için
    res.status(500).json({ error: err.message });
  }
});

// Yeni paylaşım oluştur
router.post('/', async (req, res) => {
  const { user_id, icerik, kategori, gizlilik, hedef_kullanici_id, media_path } = req.body;
  
  if (!user_id || !icerik) {
    return res.status(400).json({ error: 'Kullanıcı ve içerik gereklidir.' });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO paylasimlar (user_id, icerik, kategori, gizlilik, hedef_kullanici_id, media_path, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [user_id, icerik, kategori || 'dilek', gizlilik || 'herkes', hedef_kullanici_id, media_path]
    );
    res.json({ success: true, paylasim: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Paylaşımı beğen/beğenmekten vazgeç
router.post('/:id/like', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ error: 'Kullanıcı ID gereklidir.' });
  }
  
  try {
    // Daha önce beğenmiş mi kontrol et
    const existingLike = await pool.query(
      'SELECT * FROM begeniler WHERE paylasim_id = $1 AND user_id = $2',
      [id, user_id]
    );
    
    if (existingLike.rows.length > 0) {
      // Beğeniyi kaldır
      await pool.query(
        'DELETE FROM begeniler WHERE paylasim_id = $1 AND user_id = $2',
        [id, user_id]
      );
      res.json({ success: true, action: 'unliked' });
    } else {
      // Beğeni ekle
      await pool.query(
        'INSERT INTO begeniler (paylasim_id, user_id, created_at) VALUES ($1, $2, NOW())',
        [id, user_id]
      );
      res.json({ success: true, action: 'liked' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Paylaşıma yorum yap
router.post('/:id/comment', async (req, res) => {
  const { id } = req.params;
  const { user_id, yorum_metni } = req.body;
  if (!user_id || !yorum_metni) {
    return res.status(400).json({ error: 'Kullanıcı ve yorum metni gereklidir.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO yorumlar (paylasim_id, user_id, icerik, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [id, user_id, yorum_metni]
    );
    res.json({ success: true, yorum: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Paylaşımın yorumlarını getir
router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        y.id, y.icerik, y.created_at,
        u.ad, u.soyad, u.rol, y.user_id,
        (SELECT COUNT(*) FROM yorum_begeniler WHERE yorum_id = y.id) as begeni_sayisi
      FROM yorumlar y
      JOIN users u ON y.user_id = u.id
      WHERE y.paylasim_id = $1
      ORDER BY y.created_at ASC
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Yorumu beğen/beğenmekten vazgeç
router.post('/comment/:id/like', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ error: 'Kullanıcı ID gereklidir.' });
  }
  
  try {
    const existingLike = await pool.query(
      'SELECT * FROM yorum_begeniler WHERE yorum_id = $1 AND user_id = $2',
      [id, user_id]
    );
    
    if (existingLike.rows.length > 0) {
      await pool.query(
        'DELETE FROM yorum_begeniler WHERE yorum_id = $1 AND user_id = $2',
        [id, user_id]
      );
      res.json({ success: true, action: 'unliked' });
    } else {
      await pool.query(
        'INSERT INTO yorum_begeniler (yorum_id, user_id, created_at) VALUES ($1, $2, NOW())',
        [id, user_id]
      );
      res.json({ success: true, action: 'liked' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hedef kullanıcı listesi (rol bazında)
router.get('/target-users', async (req, res) => {
  const { user_role } = req.query;
  
  try {
    let query = 'SELECT id, ad, soyad FROM users WHERE ';
    
    // İşçi ise sadece sendikacıları görebilir
    if (user_role == 1) {
      query += 'rol = 2';
    }
    // Sendikacı ise herkesi görebilir (işçi ve sendikacı)
    else if (user_role == 2) {
      query += '(rol = 1 OR rol = 2)';
    }
    // Varsayılan olarak işçileri göster
    else {
      query += 'rol = 1';
    }
    
    query += ' ORDER BY ad, soyad';
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Paylaşımı sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  
  try {
    // Sadece paylaşımın sahibi silebilir
    const result = await pool.query(
      'DELETE FROM paylasimlar WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Bu paylaşımı silme yetkiniz yok.' });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Yorum sil
router.delete('/comment/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  
  try {
    // Sadece yorumu yazan kişi silebilir
    const result = await pool.query(
      'DELETE FROM yorumlar WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Bu yorumu silme yetkiniz yok.' });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 