import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Etkinlik {
  id: number;
  baslik: string;
  tur: string;
  tarih: string;
  saat: string;
  bitis_tarihi: string;
  bitis_saati: string;
  konum: string;
  aciklama: string;
  olusturan_id: number;
}

export default function Etkinlikler() {
  const params = useLocalSearchParams();
  const userId = params.user_id as string;
  const role = Number(params.role) || 1;

  const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEtkinlikler();
  }, []);

  const fetchEtkinlikler = async () => {
    try {
      const response = await axios.get<Etkinlik[]>(`${API_BASE_URL}/api/etkinlikler`);
      console.log('API\'den gelen etkinlikler:', JSON.stringify(response.data, null, 2));
      setEtkinlikler(response.data);
      setLoading(false);
    } catch (error) {
      Alert.alert('Hata', 'Etkinlikler yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR');
  };

  const now = new Date();
  
  const getBitis = (e) => {
    const tarih = e.bitis_tarihi || e.tarih;
    const saat = e.bitis_saati || e.saat;
    if (!tarih || !saat) return null;
    const [yil, ay, gun] = tarih.split('-').map(Number);
    const [saatNum, dakika] = saat.split(':').map(Number);
    return new Date(yil, ay - 1, gun, saatNum, dakika, 0);
  };

  const upcoming = etkinlikler.filter(e => {
    const bitis = getBitis(e);
    return bitis && bitis >= now;
  });
  const past = etkinlikler.filter(e => {
    const bitis = getBitis(e);
    return bitis && bitis < now;
  });

  console.log('Aktif etkinlik sayısı:', upcoming.length);
  console.log('Geçmiş etkinlik sayısı:', past.length);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push({ pathname: '/isci-home', params: { user_id: userId, ad: params.ad, soyad: params.soyad, role } })}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etkinlikler</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Aktif Etkinlikler</Text>
        {loading ? (
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        ) : upcoming.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#1976d2" />
            <Text style={styles.emptyText}>Aktif etkinlik yok.</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {upcoming.map((e) => (
              <View key={e.id} style={[styles.card, {backgroundColor: '#e0f7fa'}]}>
                <Text style={[styles.cardTitle, {color:'#1976d2'}]}><Ionicons name="calendar" size={18} color="#1976d2" /> {e.baslik}</Text>
                <View style={styles.badgePrimary}><Text style={styles.badgeText}>Aktif</Text></View>
                <Text style={styles.cardText}><Text style={styles.bold}>Açıklama:</Text> {e.aciklama}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Başlangıç:</Text> {formatDate(e.tarih)} {e.saat}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Bitiş:</Text> {e.bitis_tarihi ? formatDate(e.bitis_tarihi) : ''} {e.bitis_saati || ''}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Tür:</Text> {e.tur}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Konum:</Text> {e.konum}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.sectionTitle}>Geçmiş Etkinlikler</Text>
        {loading ? (
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        ) : past.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#8e24aa" />
            <Text style={styles.emptyText}>Geçmiş etkinlik yok.</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {past.map((e) => (
              <View key={e.id} style={[styles.card, {backgroundColor: '#f3e5f5'}]}>
                <Text style={[styles.cardTitle, {color:'#8e24aa'}]}><Ionicons name="calendar" size={18} color="#8e24aa" /> {e.baslik}</Text>
                <View style={styles.badgeSecondary}><Text style={styles.badgeText}>Geçmiş</Text></View>
                <Text style={styles.cardText}><Text style={styles.bold}>Açıklama:</Text> {e.aciklama}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Başlangıç:</Text> {formatDate(e.tarih)} {e.saat}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Bitiş:</Text> {e.bitis_tarihi ? formatDate(e.bitis_tarihi) : ''} {e.bitis_saati || ''}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Tür:</Text> {e.tur}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Konum:</Text> {e.konum}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a237e',
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#1976d2',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flexBasis: '48%',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  badgePrimary: {
    alignSelf: 'flex-start',
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  badgeSecondary: {
    alignSelf: 'flex-start',
    backgroundColor: '#8e24aa',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 13,
    marginBottom: 2,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 