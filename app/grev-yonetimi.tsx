import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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

export default function GrevYonetimi() {
  const params = useLocalSearchParams();
  const userId = params.user_id as string;
  const role = Number(params.role) || 2;

  const [grevler, setGrevler] = useState<Grev[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [baslik, setBaslik] = useState('');
  const [neden, setNeden] = useState('');
  const [kararTarihi, setKararTarihi] = useState(new Date());
  const [baslangicTarihi, setBaslangicTarihi] = useState(new Date());
  const [bitisTarihi, setBitisTarihi] = useState(new Date());


  // DateTimePicker state
  const [showKararDatePicker, setShowKararDatePicker] = useState(false);
  const [showBaslangicDatePicker, setShowBaslangicDatePicker] = useState(false);
  const [showBitisDatePicker, setShowBitisDatePicker] = useState(false);

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
      console.log('Grevler getiriliyor...');
      const response = await axios.get<Grev[]>(`${API_BASE_URL}/api/grevler`);
      console.log('Gelen grevler:', response.data);
      setGrevler(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Grev getirme hatası:', error);
      Alert.alert('Hata', 'Grevler yüklenirken bir hata oluştu.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchGrevler(true);
  };

  const handleKararDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || kararTarihi;
    setShowKararDatePicker(Platform.OS === 'ios');
    setKararTarihi(currentDate);
  };

  const handleBaslangicDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || baslangicTarihi;
    setShowBaslangicDatePicker(Platform.OS === 'ios');
    setBaslangicTarihi(currentDate);
  };

  const handleBitisDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || bitisTarihi;
    setShowBitisDatePicker(Platform.OS === 'ios');
    setBitisTarihi(currentDate);
  };

  const saveGrev = async () => {
    if (!baslik.trim() || !neden.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve neden bilgilerini giriniz.');
      return;
    }

    const payload = {
      baslik,
      neden,
      karar_tarihi: kararTarihi.toISOString().split('T')[0],
      baslangic_tarihi: baslangicTarihi.toISOString().split('T')[0],
      bitis_tarihi: bitisTarihi.toISOString().split('T')[0],
      olusturan_id: Number(userId)
    };

    console.log('Grev kaydediliyor:', payload);
    console.log('API URL:', `${API_BASE_URL}/api/grevler`);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/grevler`, payload);
      console.log('Grev kaydetme başarılı:', response.data);
      Alert.alert('Başarılı', 'Grev kararı başarıyla oluşturuldu!');
      resetForm();
      fetchGrevler();
      setModalVisible(false);
    } catch (err: any) {
      console.error('Grev kaydetme hatası:', err.response?.data || err.message);
      Alert.alert('Hata', `Grev kararı oluşturulamadı: ${err.response?.data?.error || err.message}`);
    }
  };

  const grevKarariVer = async (grevId: number, karar: 'onay' | 'red') => {
    try {
      await axios.post(`${API_BASE_URL}/api/grevler/karar/${grevId}`, { karar });
      Alert.alert('Başarılı', `Grev ${karar === 'onay' ? 'onaylandı' : 'reddedildi'}!`);
      fetchGrevler();
    } catch (err) {
      Alert.alert('Hata', 'Karar verilemedi.');
    }
  };

  const deleteGrev = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/grevler/${id}`, {
        data: { user_id: Number(userId) }
      });
      Alert.alert('Başarılı', 'Grev başarıyla silindi!');
      fetchGrevler();
    } catch (err) {
      Alert.alert('Hata', 'Grev silinemedi.');
    }
  };



  const resetForm = () => {
    setBaslik('');
    setNeden('');
    setKararTarihi(new Date());
    setBaslangicTarihi(new Date());
    setBitisTarihi(new Date());
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

  const aktifGrevler = grevler.filter(g => g.durum === 'oylamada');
  const bekleyenGrevler = grevler.filter(g => g.durum === 'bekleme');
  const gecmisGrevler = grevler.filter(g => g.durum === 'onaylandi' || g.durum === 'reddedildi');

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push({ 
            pathname: '/sendikaci-home', 
            params: { user_id: userId, ad: params.ad, soyad: params.soyad, role } 
          })}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Ionicons name="megaphone" size={24} color="#FFD700" /> Grev Yönetimi
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Yeni Grev Kararı</Text>
        </TouchableOpacity>

        {/* Aktif Oylamalar */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="checkmark-circle" size={20} color="#1a237e" /> Aktif Oylamalar
        </Text>
        {loading ? (
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        ) : aktifGrevler.length === 0 ? (
                     <View style={styles.emptyContainer}>
             <Ionicons name="checkmark-circle-outline" size={64} color="#1976d2" />
             <Text style={styles.emptyText}>Şu anda oylamada olan grev yok.</Text>
           </View>
        ) : (
          <View style={styles.cardGrid}>
            {aktifGrevler.map((grev) => (
              <View key={grev.id} style={[styles.grevCard, {backgroundColor: '#e3f2fd'}]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.grevTitle, {color:'#1976d2'}]}>{grev.baslik}</Text>
                  <View style={[styles.statusBadge, {backgroundColor: '#d6eaff'}]}>
                    <Text style={[styles.statusText, {color: '#1b4f72'}]}>Oylamada</Text>
                  </View>
                </View>
                <Text style={styles.grevNeden}>{grev.neden}</Text>
                <Text style={styles.grevMeta}>
                  <Ionicons name="calendar-outline" size={16} color="#607d8b" /> Karar: {formatDate(grev.karar_tarihi)}
                </Text>
                <Text style={styles.grevMeta}>
                  <Ionicons name="play-outline" size={16} color="#607d8b" /> Başlangıç: {formatDate(grev.baslangic_tarihi)}
                </Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: `${grev.evet_oran}%`}]} />
                  </View>
                  <Text style={styles.progressText}>
                    {grev.evet_oran}% Evet ({grev.evet} Evet / {grev.hayir} Hayır)
                  </Text>
                </View>

                {Number(userId) === grev.olusturan_id && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Grevi Sil',
                        'Bu grevi silmek istediğinize emin misiniz?',
                        [
                          { text: 'İptal', style: 'cancel' },
                          { text: 'Sil', style: 'destructive', onPress: () => deleteGrev(grev.id) }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash" size={16} color="#fff" />
                    <Text style={styles.deleteButtonText}>Sil</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Onay Bekleyen Grevler */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="hourglass" size={20} color="#1a237e" /> Onay Bekleyen Grevler
        </Text>
        {bekleyenGrevler.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="hourglass-outline" size={64} color="#b9770e" />
            <Text style={styles.emptyText}>Onay bekleyen grev yok.</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {bekleyenGrevler.map((grev) => (
              <View key={grev.id} style={[styles.grevCard, {backgroundColor: '#fff8e1'}]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.grevTitle, {color:'#b9770e'}]}>{grev.baslik}</Text>
                  <View style={[styles.statusBadge, {backgroundColor: '#f9e79f'}]}>
                    <Text style={[styles.statusText, {color: '#b9770e'}]}>Onay Bekliyor</Text>
                  </View>
                </View>
                <Text style={styles.grevNeden}>{grev.neden}</Text>
                <Text style={styles.grevMeta}>
                  <Ionicons name="calendar-outline" size={16} color="#607d8b" /> Karar: {formatDate(grev.karar_tarihi)}
                </Text>
                <Text style={styles.grevMeta}>
                  <Ionicons name="play-outline" size={16} color="#607d8b" /> Başlangıç: {formatDate(grev.baslangic_tarihi)}
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: `${grev.evet_oran}%`}]} />
                  </View>
                  <Text style={styles.progressText}>
                    Sonuç: {grev.evet_oran}% Evet ({grev.evet} Evet / {grev.hayir} Hayır)
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => {
                      Alert.alert(
                        'Grevi Onayla',
                        'Bu grevi onaylamak istediğinize emin misiniz?',
                        [
                          { text: 'İptal', style: 'cancel' },
                          { text: 'Onayla', onPress: () => grevKarariVer(grev.id, 'onay') }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Onayla</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => {
                      Alert.alert(
                        'Grevi Reddet',
                        'Bu grevi reddetmek istediğinize emin misiniz?',
                        [
                          { text: 'İptal', style: 'cancel' },
                          { text: 'Reddet', style: 'destructive', onPress: () => grevKarariVer(grev.id, 'red') }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Reddet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Geçmiş Grevler */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="archive" size={20} color="#1a237e" /> Geçmiş Grevler
        </Text>
        {gecmisGrevler.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="archive-outline" size={64} color="#626567" />
            <Text style={styles.emptyText}>Henüz geçmiş grev yok.</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {gecmisGrevler.map((grev) => (
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
                  <Ionicons name="calendar-outline" size={16} color="#607d8b" /> Karar: {formatDate(grev.karar_tarihi)}
                </Text>
                <Text style={styles.grevMeta}>
                  <Ionicons name="play-outline" size={16} color="#607d8b" /> Başlangıç: {formatDate(grev.baslangic_tarihi)}
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: `${grev.evet_oran}%`}]} />
                  </View>
                  <Text style={styles.progressText}>
                    Sonuç: {grev.evet_oran}% Evet ({grev.evet} Evet / {grev.hayir} Hayır)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                <Ionicons name="add" size={20} color="#1a237e" /> Yeni Grev Kararı
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Grev Adı/Konusu</Text>
                <TextInput
                  style={styles.input}
                  value={baslik}
                  onChangeText={setBaslik}
                  placeholder="Grev başlığı"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Grev Nedeni</Text>
                <TextInput
                  style={styles.textArea}
                  value={neden}
                  onChangeText={setNeden}
                  placeholder="Grev nedeni açıklaması..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Karar Tarihi</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowKararDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>{kararTarihi.toLocaleDateString('tr-TR')}</Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>
                  {showKararDatePicker && (
                    <DateTimePicker
                      value={kararTarihi}
                      mode="date"
                      display="default"
                      onChange={handleKararDateChange}
                    />
                  )}
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Başlangıç Tarihi</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowBaslangicDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>{baslangicTarihi.toLocaleDateString('tr-TR')}</Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>
                  {showBaslangicDatePicker && (
                    <DateTimePicker
                      value={baslangicTarihi}
                      mode="date"
                      display="default"
                      onChange={handleBaslangicDateChange}
                    />
                  )}
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Bitiş Tarihi</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowBitisDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>{bitisTarihi.toLocaleDateString('tr-TR')}</Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>
                  {showBitisDatePicker && (
                    <DateTimePicker
                      value={bitisTarihi}
                      mode="date"
                      display="default"
                      onChange={handleBitisDateChange}
                    />
                  )}
                </View>


              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveGrev}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.saveButtonText}> Grev Kararı Oluştur</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a237e',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#229954',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c0392b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '95%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  modalBody: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a237e',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 