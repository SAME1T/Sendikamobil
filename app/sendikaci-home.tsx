import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AnimatedBackground from '../components/AnimatedBackground';
import ChatBot from '../components/ChatBot';
import SocialFeed from '../components/SocialFeed';

const announcements = [
  { id: 1, title: 'Aidat Ödemeleri Başladı', date: '2024-06-01' },
  { id: 2, title: "Genel Kurul Toplantısı 15 Haziran'da", date: '2024-06-15' },
  { id: 3, title: 'Yeni İş Güvenliği Eğitimi', date: '2024-06-20' },
];

export default function SendikaciHome() {
  const params = useLocalSearchParams();
  const ad = params.ad || '';
  const soyad = params.soyad || '';
  const userId = params.user_id;
  const role = Number(params.role) || 2;
  if (!userId) {
    Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
    router.replace('/');
    return null;
  }

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
          <Text style={styles.subHeader}>Sendika İletişim Merkezi yönetici paneline hoş geldiniz.</Text>
        </View>
        
        {/* Sosyal Medya Feed'i */}
        <View style={styles.feedContainer}>
          <SocialFeed 
            userId={userId as string}
            userRole={role}
            userName={`${ad} ${soyad}`}
          />
        </View>
        
        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/anket-yonetimi', params: { user_id: userId, ad, soyad, role } })}>
            <View style={styles.menuIconBg}><Ionicons name="list-circle" size={32} color="#fff" /></View>
            <Text style={styles.menuLabel}>Anket Yönetimi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/grev-kartlari')}>
            <View style={styles.menuIconBg}><Ionicons name="card" size={32} color="#fff" /></View>
            <Text style={styles.menuLabel}>Grev Yönetimi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/toplantilar', params: { user_id: userId, ad, soyad, role } })}>
            <View style={styles.menuIconBg}><Ionicons name="people" size={32} color="#fff" /></View>
            <Text style={styles.menuLabel}>Toplantılar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/iletisim')}>
            <View style={styles.menuIconBg}><Ionicons name="call" size={32} color="#fff" /></View>
            <Text style={styles.menuLabel}>İletişim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/etkinlik-yonetimi', params: { user_id: userId, ad, soyad, role } })}>
            <View style={styles.menuIconBg}><Ionicons name="calendar" size={32} color="#fff" /></View>
            <Text style={styles.menuLabel}>Etkinlik Yönetimi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/bordro-yonetimi', params: { user_id: userId, ad, soyad, role } })}>
            <View style={styles.menuIconBg}><Ionicons name="document-text" size={32} color="#fff" /></View>
            <Text style={styles.menuLabel}>Bordro Yönetimi</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={() => router.push({
              pathname: '/ayarlar',
              params: {
                user_id: userId,
                role: 2,
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
  },
  content: {
    padding: 16,
  },
  headerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    flex: 1,
    minHeight: 500,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
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