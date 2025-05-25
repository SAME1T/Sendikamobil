import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Grev {
  id: number;
  baslik: string;
  neden: string;
  karar_tarihi: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  katilimci_sayisi: number;
  durum: string;
  olusturan_id: number;
  evet: number;
  hayir: number;
  toplam_oy: number;
  evet_oran: number;
  katilim_oran: number;
}

export default function GrevKararlari() {
  const params = useLocalSearchParams();
  const userId = params.user_id as string;
  const role = Number(params.role) || 1;

  const [grevler, setGrevler] = useState<Grev[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGrevler();
    
    // Her 10 saniyede bir otomatik yenile
    const interval = setInterval(() => {
      fetchGrevler();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchGrevler = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      console.log('Aktif grevler getiriliyor...');
      const response = await axios.get<Grev[]>(`${API_BASE_URL}/api/grevler/aktif`);
      console.log('Gelen aktif grevler:', response.data);
      setGrevler(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Aktif grev getirme hatası:', error);
      Alert.alert('Hata', 'Grevler yüklenirken bir hata oluştu.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchGrevler(true);
  };

  const oyKullan = async (grevId: number, oy: 'evet' | 'hayir') => {
    try {
      await axios.post(`${API_BASE_URL}/api/grevler/oy/${grevId}`, {
        user_id: Number(userId),
        oy
      });
      Alert.alert('Başarılı', 'Oyunuz kaydedildi!');
      // Sayfayı hemen yenile
      fetchGrevler();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Oy kullanılamadı.';
      Alert.alert('Hata', errorMessage);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR');
  };

  const getStatusColor = (durum: string) => {
    switch (durum) {
      case 'oylamada': return '#1b4f72';
      case 'bekleme': return '#b9770e';
      case 'onaylandi': return '#229954';
      case 'reddedildi': return '#c0392b';
      default: return '#626567';
    }
  };

  const getStatusText = (durum: string) => {
    switch (durum) {
      case 'oylamada': return 'Oylamada';
      case 'bekleme': return 'Onay Bekliyor';
      case 'onaylandi': return 'Onaylandı';
      case 'reddedildi': return 'Reddedildi';
      default: return durum;
    }
  };

  const aktifOylamalar = grevler.filter(g => g.durum === 'oylamada');
  const onayBekleyenler = grevler.filter(g => g.durum === 'bekleme');
  const sonuclananlar = grevler.filter(g => g.durum === 'onaylandi' || g.durum === 'reddedildi');

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push({ 
            pathname: '/isci-home', 
            params: { user_id: userId, ad: params.ad, soyad: params.soyad, role } 
          })}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Ionicons name="document-text" size={24} color="#FFD700" /> Grev Kararları
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1a237e']}
            tintColor="#1a237e"
          />
        }
      >
        {/* Aktif Oylamalar */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="checkmark-circle" size={20} color="#1a237e" /> Aktif Oylamalar
        </Text>
        {loading ? (
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        ) : aktifOylamalar.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="information-circle-outline" size={64} color="#1976d2" />
            <Text style={styles.emptyText}>Şu anda aktif oylama bulunmamaktadır.</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {aktifOylamalar.map((grev) => (
              <View key={grev.id} style={[styles.grevCard, {backgroundColor: '#e3f2fd'}]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.grevTitle, {color:'#1976d2'}]}>{grev.baslik}</Text>
                  <View style={[styles.statusBadge, {backgroundColor: '#d6eaff'}]}>
                    <Text style={[styles.statusText, {color: '#1b4f72'}]}>Oylamada</Text>
                  </View>
                </View>
                <Text style={styles.grevNeden}>{grev.neden}</Text>
                <Text style={styles.grevMeta}>
                  <Ionicons name="calendar-outline" size={16} color="#607d8b" /> Karar Tarihi: {formatDate(grev.karar_tarihi)}
                </Text>
                <Text style={styles.grevMeta}>
                  <Ionicons name="play-outline" size={16} color="#607d8b" /> Başlangıç: {formatDate(grev.baslangic_tarihi)}
                </Text>
                
                <View style={styles.voteButtons}>
                  <TouchableOpacity
                    style={styles.voteYesButton}
                    onPress={() => {
                      Alert.alert(
                        'Oy Kullan',
                        'Bu grev kararını ONAYLIYOR musunuz?',
                        [
                          { text: 'İptal', style: 'cancel' },
                          { text: 'Evet', onPress: () => oyKullan(grev.id, 'evet') }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="thumbs-up" size={16} color="#fff" />
                    <Text style={styles.voteButtonText}>Evet ({grev.evet || 0})</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.voteNoButton}
                    onPress={() => {
                      Alert.alert(
                        'Oy Kullan',
                        'Bu grev kararını REDDEDİYOR musunuz?',
                        [
                          { text: 'İptal', style: 'cancel' },
                          { text: 'Hayır', style: 'destructive', onPress: () => oyKullan(grev.id, 'hayir') }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="thumbs-down" size={16} color="#fff" />
                    <Text style={styles.voteButtonText}>Hayır ({grev.hayir || 0})</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: `${grev.evet_oran}%`}]} />
                  </View>
                  <Text style={styles.progressText}>
                    Oylama Durumu: {grev.evet_oran}% Evet
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Onay Bekleyen Grevler */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="hourglass" size={20} color="#1a237e" /> Onay Bekleyen Grevler
        </Text>
        {onayBekleyenler.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="warning-outline" size={64} color="#b9770e" />
            <Text style={styles.emptyText}>Onay bekleyen grev yok.</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {onayBekleyenler.map((grev) => (
              <View key={grev.id} style={[styles.grevCard, {backgroundColor: '#fff8e1'}]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.grevTitle, {color:'#b9770e'}]}>{grev.baslik}</Text>
                  <View style={[styles.statusBadge, {backgroundColor: '#f9e79f'}]}>
                    <Text style={[styles.statusText, {color: '#b9770e'}]}>Onay Bekliyor</Text>
                  </View>
                </View>
                <Text style={styles.grevNeden}>{grev.neden}</Text>
                <Text style={styles.grevMeta}>
                  <Ionicons name="calendar-outline" size={16} color="#607d8b" /> Karar Tarihi: {formatDate(grev.karar_tarihi)}
                </Text>
                <Text style={styles.grevMeta}>
                  <Ionicons name="play-outline" size={16} color="#607d8b" /> Başlangıç: {formatDate(grev.baslangic_tarihi)}
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: `${grev.evet_oran}%`}]} />
                  </View>
                  <Text style={styles.progressText}>
                    Oylama Sonucu: {grev.evet_oran}% Evet ({grev.evet || 0} Evet / {grev.hayir || 0} Hayır)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Sonuçlanan Grevler */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="archive" size={20} color="#1a237e" /> Sonuçlanan Grevler
        </Text>
        {sonuclananlar.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="archive-outline" size={64} color="#626567" />
            <Text style={styles.emptyText}>Henüz sonuçlanan grev bulunmamaktadır.</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {sonuclananlar.map((grev) => (
              <View key={grev.id} style={[styles.grevCard, {
                backgroundColor: grev.durum === 'onaylandi' ? '#eafaf1' : '#fdecea'
              }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.grevTitle, {
                    color: grev.durum === 'onaylandi' ? '#229954' : '#c0392b'
                  }]}>{grev.baslik}</Text>
                  <View style={[styles.statusBadge, {
                    backgroundColor: grev.durum === 'onaylandi' ? '#d1f2eb' : '#fadbd8'
                  }]}>
                    <Text style={[styles.statusText, {
                      color: grev.durum === 'onaylandi' ? '#229954' : '#c0392b'
                    }]}>{getStatusText(grev.durum)}</Text>
                  </View>
                </View>
                <Text style={styles.grevNeden}>{grev.neden}</Text>
                <Text style={styles.grevMeta}>
                  <Ionicons name="calendar-outline" size={16} color="#607d8b" /> Karar Tarihi: {formatDate(grev.karar_tarihi)}
                </Text>
                <Text style={styles.grevMeta}>
                  <Ionicons name="play-outline" size={16} color="#607d8b" /> Başlangıç: {formatDate(grev.baslangic_tarihi)}
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: `${grev.evet_oran}%`}]} />
                  </View>
                  <Text style={styles.progressText}>
                    Sonuç: {grev.evet_oran}% Evet ({grev.evet || 0} Evet / {grev.hayir || 0} Hayır)
                  </Text>
                </View>
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
    color: '#1a237e',
    marginBottom: 16,
    marginTop: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cardGrid: {
    marginBottom: 20,
  },
  grevCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e3e6ed',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  grevTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  grevNeden: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  grevMeta: {
    fontSize: 14,
    color: '#607d8b',
    marginBottom: 6,
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  voteYesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#229954',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  voteNoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c0392b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  progressBar: {
    height: 14,
    backgroundColor: '#e9ecef',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#229954',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
}); 