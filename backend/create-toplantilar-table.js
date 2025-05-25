const pool = require('./db.js');

async function createToplantilarTable() {
    try {
        // Toplantılar tablosunu oluştur
        await pool.query(`
            CREATE TABLE IF NOT EXISTS toplantilar (
                id SERIAL PRIMARY KEY,
                baslik VARCHAR(255) NOT NULL,
                tarih DATE NOT NULL,
                saat TIME NOT NULL,
                yer VARCHAR(255) NOT NULL,
                gundem TEXT,
                yapilacaklar TEXT,
                katilimcilar TEXT, -- Virgülle ayrılmış sendikacı ID'leri
                olusturan_id INTEGER NOT NULL REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Toplantılar tablosu başarıyla oluşturuldu!');

        // Örnek toplantı verisi ekle
        await pool.query(`
            INSERT INTO toplantilar (baslik, tarih, saat, yer, gundem, yapilacaklar, katilimcilar, olusturan_id)
            VALUES 
                ('Aylık Değerlendirme Toplantısı', '2024-12-20', '14:00', 'Sendika Merkez Ofisi', 'Aylık performans değerlendirmesi\nYeni projeler hakkında görüşme\nBütçe planlaması', 'Rapor hazırlama\nYeni üye kayıtları\nEtkinlik planlaması', '2,3', 2),
                ('Yıl Sonu Genel Kurul', '2024-12-25', '10:00', 'Konferans Salonu', 'Yıllık faaliyet raporu\nMali durum değerlendirmesi\nYeni dönem hedefleri', 'Seçim hazırlıkları\nBelge düzenlemesi\nDavetiye gönderimi', '2', 2)
            ON CONFLICT DO NOTHING;
        `);
        console.log('Örnek toplantı verileri eklendi!');

        // Eklenen verileri kontrol et
        const result = await pool.query('SELECT * FROM toplantilar ORDER BY created_at DESC');
        console.log('Toplantılar tablosundaki kayıtlar:', result.rows);

    } catch (err) {
        console.error('Hata:', err);
    } finally {
        await pool.end();
    }
}

createToplantilarTable(); 