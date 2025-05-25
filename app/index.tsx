import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import ChatBot from '../components/ChatBot';

interface StatisticCardProps {
  title: string;
  value: string;
  subtitle: string;
}

const unionData = [
  { id: 1, code: 12, name: 'TÜRK METAL SENDİKASI', members: 293829 },
  { id: 2, code: 20, name: 'HİZMET-İŞ', members: 280769 },
  { id: 3, code: 17, name: 'ÖZ SAĞLIK-İŞ', members: 224289 },
  { id: 4, code: 20, name: 'GENEL-İŞ', members: 171348 },
  { id: 5, code: 10, name: 'TEZ-KOOP-İŞ', members: 126431 },
  { id: 6, code: 20, name: 'BELEDİYE-İŞ', members: 126182 },
  { id: 7, code: 10, name: 'KOOP-İŞ', members: 124095 },
  { id: 8, code: 14, name: 'TES-İŞ', members: 68890 },
  { id: 9, code: 10, name: 'ÖZ BÜRO-İŞ', members: 50901 },
  { id: 10, code: 13, name: 'YOL-İŞ', members: 50630 },
];

const workSectorData = [
  { id: 1, code: 10, name: 'TİCARET, BÜRO, EĞİTİM VE GÜZEL SANATLAR', members: 4469945 },
  { id: 2, code: 12, name: 'METAL', members: 1987733 },
  { id: 3, code: 13, name: 'İNŞAAT', members: 1741475 },
  { id: 4, code: 18, name: 'KONAKLAMA VE EĞLENCE İŞLERİ', members: 1169680 },
  { id: 5, code: 5, name: 'DOKUMA, HAZIR GİYİM VE DERİ', members: 1169314 },
  { id: 6, code: 15, name: 'TAŞIMACILIK', members: 1048014 },
  { id: 7, code: 20, name: 'GENEL İŞLER', members: 991976 },
  { id: 8, code: 17, name: 'SAĞLIK VE SOSYAL HİZMETLER', members: 761312 },
  { id: 9, code: 2, name: 'GIDA SANAYİİ', members: 758601 },
  { id: 10, code: 4, name: 'PETROL, KİMYA, LASTİK, PLASTİK VE İLAÇ', members: 615122 },
];

const UnionTable = () => (
  <View style={styles.tableContainer}>
    <Text style={styles.tableTitle}>Üye Sayılarına Göre En Büyük On Sendika</Text>
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 0.5 }]}>Sıra No</Text>
      <Text style={[styles.headerCell, { flex: 0.5 }]}>İş Kolu No</Text>
      <Text style={[styles.headerCell, { flex: 2 }]}>Sendika Adı</Text>
      <Text style={[styles.headerCell, { flex: 1 }]}>Üye Sayısı</Text>
    </View>
    <ScrollView>
      {unionData.map((item) => (
        <View key={item.id} style={[
          styles.tableRow,
          item.id % 2 === 1 ? styles.oddRow : null
        ]}>
          <Text style={[styles.cell, { flex: 0.5 }]}>{item.id}</Text>
          <Text style={[styles.cell, { flex: 0.5 }]}>{item.code}</Text>
          <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>
          <Text style={[styles.cell, { flex: 1 }]}>{item.members.toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const WorkSectorTable = () => (
  <View style={styles.tableContainer}>
    <Text style={styles.tableTitle}>İşçi Sayısına Göre En Büyük On İş Kolu</Text>
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 0.5 }]}>Sıra No</Text>
      <Text style={[styles.headerCell, { flex: 0.5 }]}>İş Kolu No</Text>
      <Text style={[styles.headerCell, { flex: 2 }]}>İş Kolu Adı</Text>
      <Text style={[styles.headerCell, { flex: 1 }]}>Üye Sayısı</Text>
    </View>
    <ScrollView>
      {workSectorData.map((item) => (
        <View key={item.id} style={[
          styles.tableRow,
          item.id % 2 === 1 ? styles.oddRow : null
        ]}>
          <Text style={[styles.cell, { flex: 0.5 }]}>{item.id}</Text>
          <Text style={[styles.cell, { flex: 0.5 }]}>{item.code.toString().padStart(2, '0')}</Text>
          <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>
          <Text style={[styles.cell, { flex: 1 }]}>{item.members.toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const StatisticCard = ({ title, value, subtitle }: StatisticCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
  </View>
);

const sendikaHaberleri = [
  {
    title: "İşçi ücretlerinde yeni düzenleme: Asgari ücret artışı beklentileri",
    date: "15 Aralık 2024",
    summary: "2025 yılı asgari ücret görüşmeleri devam ederken, işçi sendikaları %40 artış talep ediyor.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/isci-ucretlerinde-yeni-duzenleme-asgari-ucret-artisi-beklentileri/"
  },
  {
    title: "Metal işçilerinden toplu sözleşme eylemi: Hakları için mücadele sürüyor",
    date: "12 Aralık 2024",
    summary: "Türk Metal Sendikası üyeleri, toplu sözleşme görüşmelerinde anlaşma sağlanmaması üzerine eylem kararı aldı.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/metal-iscilerinden-toplu-sozlesme-eylemi-haklari-icin-mucadele-suruyor/"
  },
  {
    title: "İş güvenliği raporu: 2024'te iş kazalarında artış kaydedildi",
    date: "10 Aralık 2024",
    summary: "İSİG Meclisi'nin raporuna göre 2024 yılında iş kazalarında %8 artış yaşandı. Önlemler yetersiz.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/is-guvenligi-raporu-2024te-is-kazalarinda-artis-kaydedildi/"
  },
  {
    title: "Kadın işçilerin hakları: Eşit ücret için mücadele devam ediyor",
    date: "8 Aralık 2024",
    summary: "Kadın işçiler, erkek meslektaşlarıyla eşit ücret alma hakkı için sendikalar aracılığıyla mücadele veriyor.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/kadin-iscilerin-haklari-esit-ucret-icin-mucadele-devam-ediyor/"
  },
  {
    title: "Gıda işçilerinden zam talebi: Enflasyon karşısında alım gücü eriyor",
    date: "5 Aralık 2024",
    summary: "Tek Gıda-İş Sendikası, gıda sektöründe çalışan işçiler için acil zam talep etti. Enflasyon oranı %65'i buldu.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/gida-iscilerinden-zam-talebi-enflasyon-karsisinda-alim-gucu-eriyor/"
  },
  {
    title: "Sendika üyeliği artıyor: Gençler haklarını öğreniyor",
    date: "3 Aralık 2024",
    summary: "Son dönemde genç işçiler arasında sendika üyeliği artış gösteriyor. Dijital platformlar etkili oluyor.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/sendika-uyeligi-artiyor-gencler-haklarini-ogreniyor/"
  },
  {
    title: "Toplu iş sözleşmelerinde yeni dönem: 2025 hedefleri belirlendi",
    date: "18 Aralık 2024",
    summary: "Sendikalar 2025 yılı toplu iş sözleşmeleri için hazırlıklarını tamamladı. İşçi lehine düzenlemeler öne çıkıyor.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/toplu-is-sozlesmelerinde-yeni-donem-2025-hedefleri-belirlendi/"
  },
  {
    title: "Tekstil işçilerinden ücret adaletsizliği protestosu",
    date: "16 Aralık 2024",
    summary: "Tekstil sektöründe çalışan kadın işçiler, erkek meslektaşlarıyla arasındaki ücret farkını protesto etti.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/tekstil-iscilerinden-ucret-adaletsizligi-protestosu/"
  },
  {
    title: "Sağlık çalışanları için yeni haklar paketi açıklandı",
    date: "14 Aralık 2024",
    summary: "Sağlık-Sen'in uzun süredir talep ettiği haklar paketi nihayet kabul edildi. Ek ödemeler ve izin hakları genişletildi.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/saglik-calisanlari-icin-yeni-haklar-paketi-aciklandi/"
  },
  {
    title: "İnşaat sektöründe iş güvenliği denetimi artırılıyor",
    date: "13 Aralık 2024",
    summary: "İnşaat-İş Sendikası'nın talepleri doğrultusunda iş güvenliği denetimleri 3 kat artırılacak.",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/insaat-sektorunde-is-guvenligi-denetimi-artiriliyor/"
  },
  {
    title: "Uzaktan çalışma hakları için yeni düzenleme geliyor",
    date: "11 Aralık 2024",
    summary: "Pandemi sonrası yaygınlaşan uzaktan çalışma modeli için işçi hakları açısından yeni düzenlemeler hazırlanıyor.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/uzaktan-calisma-haklari-icin-yeni-duzenleme-geliyor/"
  },
  {
    title: "Emeklilik yaşı tartışmaları: Sendikalardan ortak açıklama",
    date: "9 Aralık 2024",
    summary: "Türk-İş, Hak-İş ve DİSK konfederasyonları emeklilik yaşı konusunda ortak tavır sergiledi.",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/emeklilik-yasi-tartismalari-sendikalardan-ortak-aciklama/"
  },
  {
    title: "Taşeron işçileri için müjdeli haber: Kadroya geçiş süreci başladı",
    date: "7 Aralık 2024",
    summary: "Kamu sektöründe çalışan taşeron işçilerinin kadroya geçiş süreci resmi olarak başlatıldı.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=200&fit=crop",
    url: "https://sendika.org/2024/12/taseron-iscileri-icin-mujdeli-haber-kadroya-gecis-sureci-basladi/"
  }
];

export default function Index() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();

  const workerStats = [
    { title: 'Toplam Sendikalı Oranı', value: '% 14.97', subtitle: 'İşçi Sendikaları' },
    { title: 'Güncel Sendika Sayısı', value: '235', subtitle: 'Aktif Sendika' },
    { title: 'En Yüksek Üye Oranı', value: 'GENEL İŞLER', subtitle: 'İş Kolu' },
    { title: 'En Düşük Üye Oranı', value: 'İNŞAAT', subtitle: 'İş Kolu' },
  ];

  const publicStats = [
    { title: 'Toplam Sendikalı Oranı', value: '% 75.18', subtitle: 'Kamu Sendikaları' },
    { title: 'Güncel Sendika Sayısı', value: '242', subtitle: 'Aktif Sendika' },
    { title: 'En Yüksek Üye Oranı', value: 'YEREL YÖNETİM', subtitle: 'İş Kolu' },
    { title: 'En Düşük Üye Oranı', value: 'ENERJİ, SANAYİ', subtitle: 'İş Kolu' },
  ];

  const handleMenuItemPress = (route: string) => {
    setDropdownVisible(false);
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
          <Ionicons name="menu" size={28} color="#FFD700" />
        </TouchableOpacity>
        <Text style={[styles.headerText, { 
          marginLeft: 15,
          color: '#E2E7E8',
          textShadowColor: 'rgba(0, 0, 0, 0.75)',
          textShadowOffset: { width: -1, height: 1 },
          textShadowRadius: 10
        }]}>Sendika İletişim Merkezi</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/giris-secimi')}
        >
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={[styles.dropdown, { top: 90, right: 20 }]}>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleMenuItemPress('/login/sendika')}
            >
              <Text style={styles.dropdownText}>Sendikacı Girişi</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleMenuItemPress('/login/isci')}
            >
              <Text style={styles.dropdownText}>İşçi Girişi</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleMenuItemPress('/register')}
            >
              <Text style={styles.dropdownText}>Üye Ol</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz!</Text>
          <Text style={styles.welcomeText}>
            Sendika İletişim Merkezi'ne hoş geldiniz. Burada işçi hakları, sendikalar ve çalışma hayatı ile ilgili güncel bilgilere ulaşabilirsiniz.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İŞÇİ SENDİKALARI VERİLERİ</Text>
          <View style={styles.cardContainer}>
            {workerStats.map((stat, index) => (
              <StatisticCard key={index} {...stat} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KAMU SENDİKALARI VERİLERİ</Text>
          <View style={styles.cardContainer}>
            {publicStats.map((stat, index) => (
              <StatisticCard key={index} {...stat} />
            ))}
          </View>
        </View>
        <View style={styles.sendikaNewsSection}>
          <Text style={styles.sendikaNewsHeader}>📰 Güncel Sendika Haberleri</Text>
          <View style={styles.newsGrid}>
            {sendikaHaberleri.map((haber, idx) => (
              <TouchableOpacity key={idx} style={styles.sendikaNewsItem} onPress={() => Linking.openURL(haber.url)}>
                <Image 
                  source={{ uri: haber.image }} 
                  style={styles.newsImage}
                  resizeMode="cover"
                />
                <View style={styles.newsContent}>
                  <Text style={styles.sendikaNewsTitle}>{haber.title}</Text>
                  <Text style={styles.sendikaNewsSummary}>{haber.summary}</Text>
                  <View style={styles.newsFooter}>
                    <Text style={styles.sendikaNewsDate}>📅 {haber.date}</Text>
                    <View style={styles.readMoreContainer}>
                      <Text style={styles.readMoreText}>Devamını Oku</Text>
                      <Ionicons name="arrow-forward" size={12} color="#FFD700" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <ChatBot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2942',
  },
  header: {
    backgroundColor: '#0d1521',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#8B1F41',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 5,
    width: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    color: '#1a2942',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 15,
    backgroundColor: '#1a2942',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    width: '48%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    backgroundColor: '#4A90E2',
    padding: 12,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardValue: {
    color: '#4A90E2',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  cardSubtitle: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a2942',
    marginBottom: 15,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a2942',
    padding: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  oddRow: {
    backgroundColor: '#f9f9f9',
  },
  cell: {
    fontSize: 14,
    color: '#333',
  },
  tableSeparator: {
    height: 20,
  },
  welcomeContainer: {
    backgroundColor: '#243B55',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E2E7E8',
    textAlign: 'center',
    lineHeight: 24,
  },
  sendikaNewsSection: {
    width: '100%',
    backgroundColor: '#243B55',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    marginTop: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  sendikaNewsHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  newsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sendikaNewsItem: {
    flexDirection: 'column',
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#1a2942',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  newsImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#243B55',
  },
  newsContent: {
    padding: 12,
    flex: 1,
  },
  sendikaNewsTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 18,
  },
  sendikaNewsSummary: {
    fontSize: 12,
    color: '#E2E7E8',
    lineHeight: 16,
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sendikaNewsDate: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#243B55',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  readMoreText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
    marginRight: 4,
  },
});
