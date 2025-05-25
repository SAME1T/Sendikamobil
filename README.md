# Sendika Mobil Uygulaması

## Proje Hakkında
Sendika Mobil, işçiler ve sendikacılar için geliştirilmiş bir mobil uygulama. Uygulama, işçi hakları ve sendika iletişimini kolaylaştırmak amacıyla tasarlanmıştır.

## Özellikler
- İşçi ve Sendikacı girişi
- Üye olma sistemi
- Şifre sıfırlama
- Anket oluşturma ve yönetme
- Duyuru sistemi
- Etkinlik takvimi
- **Toplantı yönetimi 
- İletişim araçları

## Toplantılar Modülü (YENİ)
- **Toplantı Oluşturma:** Sendikacılar başlık, tarih, saat, yer, gündem, yapılacaklar ve katılımcı seçerek toplantı oluşturabilir.
- **Katılımcı Seçimi:** Birden fazla sendikacı seçilebilir.
- **Gündem & Yapılacaklar:** Her satır bir madde olacak şekilde eklenebilir.
- **Katılımcı Notu:** İsteğe bağlı özel not eklenebilir.
- **Sadece Oluşturan Silebilir:** Toplantıyı sadece oluşturan sendikacı silebilir.
- **Tüm Toplantılar:** Yaklaşan ve geçmiş toplantılar tek listede, renkli ve modern kartlarla gösterilir.
- **Güvenlik:** Form validasyonu ve yetki kontrolü.
- **Web ile Tam Uyumlu:** Web arayüzündeki tüm işlevler mobilde de mevcut.

## Kullanılan Teknolojiler
- **React Native**: Mobil uygulama geliştirme framework'ü
- **Expo**: React Native uygulamaları için geliştirme platformu
- **TypeScript**: Tip güvenliği sağlayan JavaScript süper seti
- **React Navigation**: Sayfa yönlendirme ve navigasyon
- **React Native Gesture Handler**: Dokunma ve hareket işlemleri
- **Expo Router**: Dosya tabanlı yönlendirme sistemi
- **Node.js + Express**: Backend API
- **PostgreSQL**: Veritabanı

## Kurulum
1. Projeyi klonlayın:
```bash
git clone [repo-url]
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Uygulamayı başlatın:
```bash
npm start
```

4. Backend'i başlatın:
```bash
cd backend && npm install && npm start
```

## Proje Yapısı
```
sendika-mobil/
├── app/                    # Sayfa bileşenleri
│   ├── login/             # Giriş sayfaları
│   ├── register.tsx       # Üye olma sayfası
│   ├── toplantilar.tsx    # Toplantılar modülü (yeni)
│   └── ...
├── components/            # Yeniden kullanılabilir bileşenler
├── backend/               # Node.js + Express API ve veritabanı
├── assets/                # Görseller ve diğer kaynaklar
└── ...
```

## Son Yapılan Güncellemeler
1. **Toplantılar Modülü Eklendi**
   - Web arayüzündeki tüm toplantı işlevleri mobilde de mevcut
   - Katılımcı seçimi, gündem, yapılacaklar, silme yetkisi
   - Modern ve kullanıcı dostu arayüz
2. **Klavye Yönetimi İyileştirmeleri**
   - Klavye açıldığında içeriğin otomatik kaydırılması
   - Form alanlarının klavye ile uyumlu çalışması
   - Gereksiz klavye butonlarının kaldırılması
3. **Kod Kalitesi İyileştirmeleri**
   - TypeScript tip güvenliği
   - Bileşen yapısının sadeleştirilmesi
   - Performans optimizasyonları
4. **Kullanıcı Deneyimi İyileştirmeleri**
   - Daha akıcı geçişler
   - Daha iyi hata yönetimi
   - Kullanıcı dostu arayüz

## Katkıda Bulunma
1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans
Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim
Proje Sahibi - [@your-twitter](https://twitter.com/your-twitter)

Proje Linki: [https://github.com/yourusername/sendika-mobil](https://github.com/yourusername/sendika-mobil)
