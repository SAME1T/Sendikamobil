const pool = require('./db.js');

async function testConnection() {
    try {
        // Önce mevcut tabloyu silelim
        await pool.query('DROP TABLE IF EXISTS users CASCADE;');
        console.log('Eski tablo silindi!');

        // Yeni tabloyu oluşturalım
        await pool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                ad VARCHAR(50) NOT NULL,
                soyad VARCHAR(50) NOT NULL,
                tc_no VARCHAR(11) UNIQUE NOT NULL,
                telefon VARCHAR(20) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                rol INTEGER NOT NULL, -- 0: admin, 1: işçi, 2: sendikacı
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Yeni users tablosu oluşturuldu!');

        // Örnek veriler ekleyelim
        await pool.query(`
            INSERT INTO users (ad, soyad, tc_no, telefon, email, password, rol)
            VALUES 
                ('Ahmet', 'Yılmaz', '12345678901', '5551112233', 'admin@example.com', 'admin123', 0),
                ('Mehmet', 'Kaya', '11122233344', '5552223344', 'isci@example.com', 'isci123', 1),
                ('Ayşe', 'Demir', '22233344455', '5553334455', 'sendikaci@example.com', 'sendika123', 2)
            ON CONFLICT (tc_no) DO NOTHING;
        `);
        console.log('Örnek veriler eklendi!');

        // Eklenen verileri kontrol edelim
        const result = await pool.query('SELECT * FROM users');
        console.log('Tablodaki kayıtlar:', result.rows);

    } catch (err) {
        console.error('Hata:', err);
    } finally {
        await pool.end();
    }
}

testConnection(); 