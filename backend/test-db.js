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
                tc_no VARCHAR(11) UNIQUE NOT NULL,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Users tablosu başarıyla oluşturuldu!');

        // Örnek veri ekleyelim
        await pool.query(`
            INSERT INTO users (tc_no, username, email, password)
            VALUES 
                ('12345678901', 'test_user', 'test@example.com', '123456'),
                ('98765432109', 'admin', 'admin@example.com', '111111')
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