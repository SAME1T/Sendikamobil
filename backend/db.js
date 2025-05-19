const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sendikaprojesi',
  password: 'Samet6380.',
  port: 5432,
  // Bağlantı zaman aşımı ve yeniden deneme ayarları
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20, // maksimum bağlantı sayısı
});

let retryCount = 0;
const maxRetries = 5;

// Bağlantıyı test et ve hata durumunda yeniden dene
const connectWithRetry = async () => {
  try {
    const client = await pool.connect();
    console.log('Veritabanına başarıyla bağlandı');
    client.release();
    retryCount = 0; // Başarılı bağlantıda sayacı sıfırla
  } catch (err) {
    console.error('Veritabanı bağlantı hatası:', err.message);
    retryCount++;
    
    if (retryCount >= maxRetries) {
      console.error('Maksimum yeniden deneme sayısına ulaşıldı. Lütfen veritabanı ayarlarınızı kontrol edin.');
      process.exit(1);
    }
    
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
    console.log(`${delay/1000} saniye sonra tekrar denenecek... (Deneme ${retryCount}/${maxRetries})`);
    setTimeout(connectWithRetry, delay);
  }
};

// Bağlantı havuzu hata olaylarını dinle
pool.on('error', (err) => {
  console.error('Beklenmeyen veritabanı havuzu hatası:', err);
  if (err.code === 'ECONNREFUSED') {
    console.error('PostgreSQL sunucusuna bağlanılamıyor. Lütfen PostgreSQL servisinin çalıştığından emin olun.');
  }
});

connectWithRetry();

module.exports = pool; 