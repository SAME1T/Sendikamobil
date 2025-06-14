import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AnimatedBackground from '../components/AnimatedBackground';
import ChatBot from '../components/ChatBot';
import SocialFeed from '../components/SocialFeed';
import AktiflikKutusu from './components/AktiflikKutusu';

const announcements = [
  { id: 1, title: 'Aidat Ödemeleri Başladı', date: '2024-06-01' },
  { id: 2, title: "Genel Kurul Toplantısı 15 Haziran'da", date: '2024-06-15' },
  { id: 3, title: 'Yeni İş Güvenliği Eğitimi', date: '2024-06-20' },
];

export default function IsciHome() {
  const params = useLocalSearchParams();
  const ad = params.ad || '';
  const soyad = params.soyad || '';
  const userId = params.user_id;
  const role = Number(params.role) || 1;
  const [aktiflikRefresh, setAktiflikRefresh] = useState(0);
  if (!userId) {
    Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
    router.replace('/');
    return null;
  }

  // Sayfa odaklandığında aktiflik kutusunu yenile
  useFocusEffect(
    React.useCallback(() => {
      setAktiflikRefresh(prev => prev + 1);
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Oturumdan çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => router.replace('/') }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerBox}>
          <Text style={styles.header}>Hoş Geldiniz!</Text>
          <Text style={styles.name}>{ad} {soyad}</Text>
          <Text style={styles.subHeader}>Sendika İletişim Merkezi üye paneline hoş geldiniz.</Text>
        </View>
        
        {/* Aktiflik Puanı ve Sendika Ücreti */}
        <AktiflikKutusu userId={userId as string} refreshTrigger={aktiflikRefresh} />
        
        {/* Sosyal Medya Feed'i */}
        <View style={styles.feedContainer}>
          <SocialFeed 
            userId={userId as string}
            userRole={role}
            userName={`${ad} ${soyad}`}
          />
        </View>
        
        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/anketlerim', params: { user_id: userId, ad, soyad, role } })}>
            <View style={styles.menuIconBg}><Ionicons name="list" size={32} color="#fff" /></View>
            <Text style={styles.menuLabel}>Anketlerim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/grev-kararlari', params: { user_id: userId, ad, soyad, role } })}>
            <View style={styles.menuIconBg}><Ionicons name="document-text" size={32} color="#fff" /></View>
            <Text style={styles.menuLabel}>Grev Kararları</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/etkinlikler', params: { user_id: userId, ad, soyad, role } })}>
            <View style={styles.menuIconBg}><Ionicons name="calendar" size={32} color="#fff" /></View>
            <Text style={styles.menuLabel}>Etkinlikler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ 
            pathname: '/iletisim', 
            params: { user_id: userId, ad, soyad, role } 
          })}>
            <View style={styles.menuIconBg}><Ionicons name="call" size={32} color="#fff" /></View>
            <Text style={styles.menuLabel}>İletişim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/bordrolarim', params: { user_id: userId, ad, soyad, role } })}>
            <View style={styles.menuIconBg}><Ionicons name="document-text" size={32} color="#fff" /></View>
            <Text style={styles.menuLabel}>Bordrolarım</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={() => router.push({
              pathname: '/ayarlar',
              params: {
                user_id: userId,
                role: 1,
                ad: ad,
                soyad: soyad
              }
            })}
          >
            <Ionicons name="settings-outline" size={24} color="#FFD700" />
            <Text style={styles.footerButtonText}>Ayarlar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFD700" />
            <Text style={styles.footerButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ChatBot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(180deg, #e3f0ff 0%, #f4f6fa 100%)',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 120,
    paddingTop: 40,
  },
  headerBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    marginBottom: 28,
    alignItems: 'center',
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007aff',
    marginBottom: 10,
    textAlign: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007aff',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  subHeader: {
    fontSize: 16,
    color: '#444',
    marginBottom: 0,
    textAlign: 'center',
  },
  feedContainer: {
    width: '100%',
    height: 600, // Yükseklik artırıldı
    backgroundColor: '#fff',
    borderRadius: 20, // Köşe yuvarlaklığı artırıldı
    marginBottom: 32, // Alt margin artırıldı
    overflow: 'hidden',
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 4 }, // Gölge derinliği artırıldı
    shadowOpacity: 0.08, // Gölge opaklığı artırıldı
    shadowRadius: 10, // Gölge yarıçapı artırıldı
    elevation: 4, // Android elevation artırıldı
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 18,
    gap: 10,
    marginBottom: 30,
  },
  menuItem: {
    width: 104,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    padding: 8,
  },
  menuIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007aff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  menuLabel: {
    marginTop: 2,
    fontSize: 14,
    color: '#007aff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginHorizontal: 5,
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
}); 