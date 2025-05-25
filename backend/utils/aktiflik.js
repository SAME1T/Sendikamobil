const pool = require('../db');

// Aktiflik puanı hesaplama fonksiyonu
async function aktiflikPuaniHesapla(userId) {
    try {
        // Kullanıcının rolünü al
        const userResult = await pool.query('SELECT rol FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) throw new Error('Kullanıcı bulunamadı');
        const rol = userResult.rows[0].rol;

        // Sadece işçiler için puan hesapla
        let aktiflikPuani = 0;
        if (rol === 1) { // İşçi
            console.log(`Kullanıcı ${userId} için aktiflik hesaplanıyor...`);
            
            // Geri bildirim sayısı - önce tabloyu kontrol et
            let geriBildirimSayisi;
            try {
                geriBildirimSayisi = await pool.query(
                    'SELECT COUNT(*) FROM geri_bildirimler WHERE user_id = $1',
                    [userId]
                );
                console.log(`Geri bildirim sayısı: ${geriBildirimSayisi.rows[0].count}`);
            } catch (tableError) {
                console.log('geri_bildirimler tablosu bulunamadı, oluşturuluyor...');
                // Tabloyu oluştur
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS geri_bildirimler (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        mesaj TEXT,
                        tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                console.log('geri_bildirimler tablosu oluşturuldu.');
                
                // Tekrar dene
                geriBildirimSayisi = await pool.query(
                    'SELECT COUNT(*) FROM geri_bildirimler WHERE user_id = $1',
                    [userId]
                );
                console.log(`Geri bildirim sayısı: ${geriBildirimSayisi.rows[0].count}`);
            }
            
            // Anket katılım sayısı - mevcut tablo yapısına uygun
            let anketKatilimSayisi;
            try {
                // Önce tablo yapısını kontrol et
                const tableInfo = await pool.query(`
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_name = 'anket_katilimlari'
                `);
                console.log('anket_katilimlari tablo sütunları:', tableInfo.rows.map(r => r.column_name));
                
                // Basit COUNT sorgusu - hangi sütun olursa olsun user_id'ye göre say
                anketKatilimSayisi = await pool.query(
                    'SELECT COUNT(*) FROM anket_katilimlari WHERE user_id = $1',
                    [userId]
                );
                console.log(`Anket katılım sayısı: ${anketKatilimSayisi.rows[0].count}`);
            } catch (tableError) {
                console.log('anket_katilimlari tablosu bulunamadı veya hata:', tableError.message);
                console.log('Tablo oluşturuluyor...');
                
                // Tabloyu oluştur
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS anket_katilimlari (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        survey_id INTEGER,
                        anket_id INTEGER,
                        tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                console.log('anket_katilimlari tablosu oluşturuldu.');
                
                // Tekrar dene
                anketKatilimSayisi = await pool.query(
                    'SELECT COUNT(*) FROM anket_katilimlari WHERE user_id = $1',
                    [userId]
                );
                console.log(`Anket katılım sayısı: ${anketKatilimSayisi.rows[0].count}`);
            }
            
            const geriBildirimPuan = Number(geriBildirimSayisi.rows[0].count) * 1;
            const anketPuan = Number(anketKatilimSayisi.rows[0].count) * 2;
            
            aktiflikPuani += geriBildirimPuan;
            aktiflikPuani += anketPuan;
            
            console.log(`Geri bildirim puanı: ${geriBildirimPuan}, Anket puanı: ${anketPuan}, Toplam: ${aktiflikPuani}`);
        } else {
            console.log(`Kullanıcı ${userId} işçi değil (rol: ${rol}), aktiflik puanı hesaplanmıyor.`);
        }
        // Maksimum 100 puan
        aktiflikPuani = Math.min(aktiflikPuani, 100);

        // Aktiflik puanını güncelle
        try {
            await pool.query(
                'INSERT INTO aktiflik_puanlari (user_id, aktiflik_puani) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET aktiflik_puani = $2, son_guncelleme = CURRENT_TIMESTAMP',
                [userId, aktiflikPuani]
            );
            console.log(`Kullanıcı ${userId} aktiflik puanı ${aktiflikPuani} olarak güncellendi.`);
        } catch (tableError) {
            console.log('aktiflik_puanlari tablosu bulunamadı, oluşturuluyor...');
            // Tabloyu oluştur
            await pool.query(`
                CREATE TABLE IF NOT EXISTS aktiflik_puanlari (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER UNIQUE NOT NULL,
                    aktiflik_puani INTEGER DEFAULT 0,
                    son_guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('aktiflik_puanlari tablosu oluşturuldu.');
            
            // Tekrar dene
            await pool.query(
                'INSERT INTO aktiflik_puanlari (user_id, aktiflik_puani) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET aktiflik_puani = $2, son_guncelleme = CURRENT_TIMESTAMP',
                [userId, aktiflikPuani]
            );
            console.log(`Kullanıcı ${userId} aktiflik puanı ${aktiflikPuani} olarak güncellendi.`);
        }

        return aktiflikPuani;
    } catch (error) {
        console.error('Aktiflik puanı hesaplama hatası:', error);
        throw error;
    }
}

// Sendika ücreti hesaplama fonksiyonu
async function sendikaUcretiHesapla(userId) {
    try {
        // Kullanıcının en son bordrosundan saatlik ücreti al
        const payrollResult = await pool.query(
            'SELECT amount FROM payrolls WHERE user_id = $1 ORDER BY payroll_date DESC, id DESC LIMIT 1',
            [userId]
        );
        let saatlikMaas = 0;
        if (payrollResult.rows.length > 0) {
            const aylikMaas = Number(payrollResult.rows[0].amount) || 0;
            saatlikMaas = aylikMaas / 30 / 8;
        }

        // Aktiflik puanını al
        const aktiflikResult = await pool.query(
            'SELECT aktiflik_puani FROM aktiflik_puanlari WHERE user_id = $1',
            [userId]
        );
        const aktiflikPuani = aktiflikResult.rows.length > 0 ? aktiflikResult.rows[0].aktiflik_puani : 0;

        // Ücreti hesapla: Ucret = SaatlikMaas × 30 × 8 × 0.005 × (1 - AktiflikPuani/100)
        let ucret = 0;
        if (saatlikMaas > 0) {
            const aylikBrut = saatlikMaas * 30 * 8;
            ucret = aylikBrut * 0.005 * (1 - aktiflikPuani/100);
        }

        return {
            ucret: Math.round(ucret * 100) / 100, // 2 ondalık basamağa yuvarla
            aktiflikPuani: aktiflikPuani,
            saatlikMaas: Math.round(saatlikMaas * 100) / 100 // 2 ondalık basamağa yuvarla
        };
    } catch (error) {
        console.error('Sendika ücreti hesaplama hatası:', error);
        throw error;
    }
}

module.exports = {
    aktiflikPuaniHesapla,
    sendikaUcretiHesapla
}; 