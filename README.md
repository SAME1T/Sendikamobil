# Sendika Mobil Uygulaması

## 📱 Proje Hakkında
Sendika Mobil, işçiler ve sendikacılar için geliştirilmiş kapsamlı bir mobil uygulama. Uygulama, sendika üyeleri arasında iletişimi kolaylaştırmak, işçi haklarını desteklemek ve sendika yönetimini dijitalleştirmek amacıyla tasarlanmıştır.

## ✨ Ana Özellikler

### 🔐 Kimlik Doğrulama Sistemi
- **Çift Rol Sistemi**: İşçi (Üye) ve Sendikacı (Yönetici) rolleri
- **Güvenli Giriş**: TC Kimlik No ve şifre ile giriş
- **Üye Kayıt Sistemi**: Yeni üyelerin sisteme kaydolması
- **Profil Yönetimi**: Kullanıcı bilgilerini güncelleme

### 👥 İşçi (Üye) Özellikleri
- **Ana Dashboard**: Kişiselleştirilmiş hoş geldin ekranı
- **Aktiflik Puanı Sistemi**: Kullanıcı aktivitelerine göre puan hesaplama
- **Sendika Ücreti Hesaplama**: Aktiflik puanına göre dinamik ücret
- **Sosyal Feed**: Paylaşım yapma, beğenme, yorum yazma
- **Anket Sistemi**: Sendikacılar tarafından oluşturulan anketlere katılım
- **Grev Kararları**: Grev duyurularını görüntüleme
- **Etkinlik Takvimi**: Sendika etkinliklerini takip etme
- **Bordro Yönetimi**: Kişisel bordroları görüntüleme
- **İletişim**: Sendika iletişim bilgileri

### 🏢 Sendikacı (Yönetici) Özellikleri
- **Yönetici Dashboard**: Kapsamlı yönetim paneli
- **Anket Yönetimi**: Anket oluşturma, düzenleme, sonuçları görme
- **Grev Yönetimi**: Grev kararları oluşturma ve yönetme
- **Toplantı Yönetimi**: Toplantı planlama ve katılımcı yönetimi
- **Etkinlik Yönetimi**: Sendika etkinliklerini organize etme
- **Bordro Yönetimi**: Üye bordrolarını yükleme ve yönetme
- **Sosyal Feed Yönetimi**: Tüm paylaşımları moderasyon

### 💬 Sosyal Özellikler
- **Paylaşım Sistemi**: Metin, resim ve video paylaşımı
- **Etkileşim**: Beğeni, yorum ve yanıt sistemi
- **Gizlilik Seçenekleri**: Herkese açık veya kişisel paylaşımlar
- **Hedefli Paylaşım**: Belirli kullanıcılara özel mesajlar

### 🤖 Akıllı ChatBot
- **8 Kategori Destek**: İşçi hakları, sendika bilgileri, şikayet/talep vb.
- **Hızlı Erişim Butonları**: Sık sorulan konulara anında erişim
- **Emoji Destekli Yanıtlar**: Görsel zenginlik
- **Büyük/Küçük Harf Duyarsız**: Akıllı arama sistemi

## 🛠️ Teknoloji Stack'i

### Frontend (Mobil Uygulama)
- **React Native**: Cross-platform mobil uygulama framework'ü
- **Expo SDK 51**: Geliştirme ve dağıtım platformu
- **TypeScript**: Tip güvenliği ve kod kalitesi
- **Expo Router**: Dosya tabanlı navigasyon sistemi
- **React Native Gesture Handler**: Dokunma ve hareket yönetimi
- **Expo Vector Icons**: İkon kütüphanesi
- **React Native Reanimated**: Animasyon sistemi
- **Expo Image Picker**: Medya seçimi
- **Axios**: HTTP istemci kütüphanesi

### Backend (API Sunucusu)
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **PostgreSQL**: İlişkisel veritabanı
- **Multer**: Dosya yükleme middleware'i
- **CORS**: Cross-origin resource sharing
- **dotenv**: Çevre değişkenleri yönetimi

### Veritabanı Yapısı
```sql
-- Ana tablolar
users (kullanıcılar)
survey (anketler)
survey_questions (anket soruları)
survey_answer (anket cevapları)
paylasimlar (sosyal paylaşımlar)
begeniler (beğeniler)
yorumlar (yorumlar)
toplantilar (toplantılar)
toplanti_katilimcilar (toplantı katılımcıları)
etkinlikler (etkinlikler)
grevler (grev kararları)
payrolls (bordrolar)
```

## 📁 Proje Yapısı
```
sendika-mobil/
├── app/                           # Ana uygulama sayfaları
│   ├── index.tsx                  # Giriş sayfası
│   ├── register.tsx               # Üye kayıt sayfası
│   ├── isci-home.tsx             # İşçi ana sayfası
│   ├── sendikaci-home.tsx        # Sendikacı ana sayfası
│   ├── ayarlar.tsx               # Profil ayarları
│   ├── anketlerim.tsx            # İşçi anket sayfası
│   ├── anket-yonetimi.tsx        # Sendikacı anket yönetimi
│   ├── grev-kararlari.tsx        # Grev kararları görüntüleme
│   ├── grev-yonetimi.tsx         # Grev yönetimi
│   ├── toplantilar.tsx           # Toplantı yönetimi
│   ├── etkinlikler.tsx           # Etkinlik görüntüleme
│   ├── etkinlik-yonetimi.tsx     # Etkinlik yönetimi
│   ├── bordrolarim.tsx           # Bordro görüntüleme
│   ├── bordro-yonetimi.tsx       # Bordro yönetimi
│   ├── iletisim.tsx              # İletişim sayfası
│   └── components/               # Sayfa özel bileşenler
│       └── AktiflikKutusu.tsx    # Aktiflik puanı bileşeni
├── components/                    # Paylaşılan bileşenler
│   ├── AnimatedBackground.tsx     # Animasyonlu arkaplan
│   ├── ChatBot.tsx               # Akıllı sohbet botu
│   └── SocialFeed.tsx            # Sosyal medya feed'i
├── backend/                       # Backend API
│   ├── app.js                    # Ana sunucu dosyası
│   ├── db.js                     # Veritabanı bağlantısı
│   ├── test-db.js                # Veritabanı test scripti
│   ├── routes/                   # API route'ları
│   │   ├── users.js              # Kullanıcı işlemleri
│   │   ├── survey.js             # Anket işlemleri
│   │   ├── posts.js              # Sosyal paylaşım işlemleri
│   │   ├── toplantilar.js        # Toplantı işlemleri
│   │   ├── etkinlikler.js        # Etkinlik işlemleri
│   │   ├── grevler.js            # Grev işlemleri
│   │   └── aktiflik.js           # Aktiflik puanı işlemleri
│   ├── utils/                    # Yardımcı fonksiyonlar
│   │   └── aktiflik.js           # Aktiflik hesaplama
│   └── uploads/                  # Yüklenen dosyalar
│       ├── payrolls/             # Bordro PDF'leri
│       └── posts/                # Paylaşım medyaları
├── services/                      # API servisleri
│   └── api.ts                    # HTTP istemci servisleri
├── config.ts                     # Uygulama konfigürasyonu
└── assets/                       # Statik dosyalar
```

## 🚀 Kurulum ve Çalıştırma

### Ön Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- PostgreSQL veritabanı
- Expo CLI (`npm install -g @expo/cli`)

### 1. Projeyi Klonlayın
```bash
git clone [repo-url]
cd sendika-mobil
```

### 2. Frontend Kurulumu
```bash
# Bağımlılıkları yükleyin
npm install

# Expo uygulamasını başlatın
npm start
```

### 3. Backend Kurulumu
```bash
# Backend klasörüne gidin
cd backend

# Bağımlılıkları yükleyin
npm install

# Çevre değişkenlerini ayarlayın
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanını oluşturun ve test edin
node test-db.js

# Backend sunucusunu başlatın
npm start
```

### 4. Veritabanı Konfigürasyonu
```javascript
// backend/db.js
const pool = new Pool({
  user: 'your_username',
  host: 'localhost',
  database: 'sendika_db',
  password: 'your_password',
  port: 5432,
});
```

## 📊 Aktiflik Puanı Sistemi



### Sendika Ücreti Hesaplama
```javascript
// Aktiflik puanına göre dinamik ücret
const sendikaUcreti = Math.max(50, 200 - (aktiflikPuani * 2));
```

## 🎨 Tasarım Özellikleri

### Renk Paleti
- **Ana Renk**: #007aff (Mavi)
- **Vurgu Rengi**: #FFD700 (Altın)
- **Hata Rengi**: #ff3b30 (Kırmızı)
- **Başarı Rengi**: #34c759 (Yeşil)
- **Arkaplan**: #f4f6fa (Açık Gri)

### UI/UX Özellikleri
- **Modern Kartlar**: Gölgeli ve yuvarlatılmış köşeler
- **Animasyonlu Arkaplan**: Gradient geçişler
- **Responsive Tasarım**: Tüm ekran boyutlarına uyumlu
- **Dokunmatik Optimizasyon**: Büyük dokunma alanları
- **Görsel Geri Bildirim**: Buton animasyonları

## 🔧 API Endpoints

### Kimlik Doğrulama
- `POST /api/login` - Kullanıcı girişi
- `POST /api/register` - Yeni üye kaydı

### Kullanıcı İşlemleri
- `GET /api/users/:id` - Kullanıcı bilgileri
- `PUT /api/users/:id` - Kullanıcı güncelleme

### Anket İşlemleri
- `GET /api/surveys` - Anket listesi
- `POST /api/surveys` - Yeni anket oluşturma
- `POST /api/surveys/:id/answer` - Anket cevaplama

### Sosyal İşlemler
- `GET /api/posts` - Paylaşım listesi
- `POST /api/posts` - Yeni paylaşım
- `POST /api/posts/:id/like` - Beğeni/beğenmeme
- `POST /api/posts/:id/comment` - Yorum yapma

### Toplantı İşlemleri
- `GET /api/toplantilar` - Toplantı listesi
- `POST /api/toplantilar` - Yeni toplantı
- `DELETE /api/toplantilar/:id` - Toplantı silme

## 📈 Performans Optimizasyonları

### Frontend
- **Lazy Loading**: Sayfa bazlı kod bölme
- **Image Optimization**: Otomatik resim sıkıştırma
- **Caching**: API yanıtlarının önbelleklenmesi
- **Debouncing**: Arama ve form girişlerinde gecikme

### Backend
- **Connection Pooling**: Veritabanı bağlantı havuzu
- **Query Optimization**: Optimize edilmiş SQL sorguları
- **File Upload Limits**: Dosya boyutu sınırlamaları
- **Error Handling**: Kapsamlı hata yönetimi

## 🔒 Güvenlik Özellikleri

### Kimlik Doğrulama
- **TC Kimlik No Validasyonu**: 11 haneli TC kontrolü
- **Şifre Güvenliği**: Minimum karakter gereksinimleri
- **Session Yönetimi**: Güvenli oturum kontrolü

### Veri Güvenliği
- **SQL Injection Koruması**: Parametreli sorgular
- **XSS Koruması**: Girdi sanitizasyonu
- **CORS Konfigürasyonu**: Güvenli cross-origin istekleri
- **File Upload Security**: Dosya tipi ve boyut kontrolü



## 📱 Desteklenen Platformlar
- **iOS**: iPhone 6s ve üzeri
- **Android**: API Level 21+ (Android 5.0+)
- **Web**: Modern tarayıcılar (Chrome, Firefox, Safari, Edge)

## 🔄 Gelecek Güncellemeler
- [ ] Push Notification sistemi
- [ ] Offline çalışma desteği
- [ ] Çoklu dil desteği
- [ ] Dark mode tema
- [ ] Biometric authentication
- [ ] Video konferans entegrasyonu
- [ ] QR kod ile hızlı giriş
- [ ] Gelişmiş raporlama sistemi

## 🤝 Katkıda Bulunma
1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans
Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim ve Destek
- **Proje Sahibi**: Samet ÇİFTCİ
- **Email**: sc962857@gmail.com.com
- **Proje Linki**: [https://github.com/yourusername/sendika-mobil](https://github.com/yourusername/sendika-mobil)

---

**Not**: Bu proje aktif geliştirme aşamasındadır. Yeni özellikler ve iyileştirmeler düzenli olarak eklenmektedir.
