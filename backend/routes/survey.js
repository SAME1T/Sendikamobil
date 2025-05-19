const express = require('express');
const router = express.Router();
const pool = require('../db');

// Tüm anketleri getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM survey WHERE status = $1 ORDER BY created_at DESC', ['active']);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Yeni anket oluştur
router.post('/', async (req, res) => {
  console.log('ANKET POST ENDPOINTİNE GELİNDİ', new Date().toISOString());
  const { title, description, questions } = req.body;
  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Başlık ve en az bir soru gereklidir.' });
  }
  try {
    const surveyResult = await pool.query(
      'INSERT INTO survey (title, description, created_by, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, description || '', 1, 'active']
    );
    const surveyId = surveyResult.rows[0].id;
    for (const q of questions) {
      const qResult = await pool.query(
        'INSERT INTO survey_question (survey_id, question_text, type, options) VALUES ($1, $2, $3, $4) RETURNING id',
        [surveyId, q.questionText, q.type, q.type === 'multiple' ? JSON.stringify(q.options) : null]
      );
    }
    res.json({ success: true, survey_id: surveyId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bir anket ve soruları
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const survey = await pool.query('SELECT * FROM survey WHERE id = $1', [id]);
    if (survey.rows.length === 0) return res.status(404).json({ error: 'Anket bulunamadı.' });
    const questions = await pool.query('SELECT * FROM survey_question WHERE survey_id = $1', [id]);
    res.json({ ...survey.rows[0], questions: questions.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Anket sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Önce o ankete ait tüm cevapları sil
    await pool.query('DELETE FROM survey_answer WHERE survey_id = $1', [id]);
    // Sonra anketi sil (soft delete)
    await pool.query('UPDATE survey SET status = $1 WHERE id = $2', ['deleted', id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ankete cevap gönder
router.post('/:id/answer', async (req, res) => {
  const { id } = req.params;
  const { user_id, answers } = req.body; // answers: [{ question_id, answer }]
  if (!user_id || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Kullanıcı ve cevaplar gereklidir.' });
  }
  try {
    // Önce bu kullanıcıya ait eski cevapları sil
    await pool.query(
      'DELETE FROM survey_answer WHERE survey_id = $1 AND user_id = $2',
      [id, user_id]
    );
    // Sonra yeni cevapları ekle
    for (const a of answers) {
      await pool.query(
        'INSERT INTO survey_answer (survey_id, question_id, user_id, answer) VALUES ($1, $2, $3, $4)',
        [id, a.question_id, user_id, a.answer]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bir anketin tüm cevapları
router.get('/:id/answers', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM survey_answer WHERE survey_id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// İşçi sayısını getir
router.get('/worker-count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users WHERE rol = $1', [1]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('İşçi sayısı alınırken hata:', err);
    res.status(500).json({ 
      error: 'İşçi sayısı alınamadı',
      details: err.message 
    });
  }
});

// Tüm işçileri getir
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE rol = $1', [1]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 