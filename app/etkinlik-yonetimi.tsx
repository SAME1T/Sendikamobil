import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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

export default function EtkinlikYonetimi() {
  const params = useLocalSearchParams();
  const userId = params.user_id as string;
  const role = Number(params.role) || 2;

  const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEtkinlik, setSelectedEtkinlik] = useState<Etkinlik | null>(null);
  const [modalView, setModalView] = useState('form'); // 'form' veya 'details'

  // Form state
  const [baslik, setBaslik] = useState('');
  const [tur, setTur] = useState('Toplu Yemek');
  const [tarih, setTarih] = useState(new Date());
  const [saat, setSaat] = useState(new Date());
  const [bitisTarihi, setBitisTarihi] = useState(new Date());
  const [bitisSaati, setBitisSaati] = useState(new Date());
  const [konum, setKonum] = useState('');
  const [aciklama, setAciklama] = useState('');

  // DateTimePicker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showBitisDatePicker, setShowBitisDatePicker] = useState(false);
  const [showBitisTimePicker, setShowBitisTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');

  useEffect(() => {
    fetchEtkinlikler();
  }, []);

  const fetchEtkinlikler = async () => {
    try {
      console.log('API çağrısı yapılıyor:', `${API_BASE_URL}/api/etkinlikler`);
      const response = await axios.get<Etkinlik[]>(`${API_BASE_URL}/api/etkinlikler`);
      console.log('API\'den gelen tüm etkinlikler:', JSON.stringify(response.data, null, 2));
      console.log('Gelen etkinlik sayısı:', response.data.length);
      setEtkinlikler(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Etkinlik çekme hatası:', error);
      Alert.alert('Hata', 'Etkinlikler yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || tarih;
    setShowDatePicker(Platform.OS === 'ios');
    setTarih(currentDate);
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || saat;
    setShowTimePicker(Platform.OS === 'ios');
    setSaat(currentTime);
  };

  const handleBitisDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || bitisTarihi;
    setShowBitisDatePicker(Platform.OS === 'ios');
    setBitisTarihi(currentDate);
  };

  const handleBitisTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || bitisSaati;
    setShowBitisTimePicker(Platform.OS === 'ios');
    setBitisSaati(currentTime);
  };

  const saveEtkinlik = async () => {
    if (!baslik.trim()) {
      Alert.alert('Hata', 'Lütfen etkinlik başlığını giriniz.');
      return;
    }

    const payload = {
      baslik,
      tur,
      tarih: tarih.toISOString().split('T')[0],
      saat: saat.toTimeString().slice(0, 5),
      bitis_tarihi: bitisTarihi.toISOString().split('T')[0],
      bitis_saati: bitisSaati.toTimeString().slice(0, 5),
      konum,
      aciklama,
      olusturan_id: Number(userId)
    };
    console.log('ETKINLIK PAYLOAD:', payload);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/etkinlikler`, payload);
      console.log('ETKINLIK KAYIT API CEVABI:', response.data);
      Alert.alert('Başarılı', 'Etkinlik başarıyla kaydedildi!');
      resetForm();
      fetchEtkinlikler();
      setModalVisible(false);
    } catch (err: any) {
      if (err.response) {
        console.log('ETKINLIK KAYIT API HATASI:', err.response.data);
      } else {
        console.log('ETKINLIK KAYIT API HATASI:', err);
      }
      Alert.alert('Hata', 'Etkinlik kaydedilemedi.');
    }
  };

  const deleteEtkinlik = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/etkinlikler/${id}`);
      Alert.alert('Başarılı', 'Etkinlik başarıyla silindi!');
      fetchEtkinlikler();
    } catch (err) {
      Alert.alert('Hata', 'Etkinlik silinemedi.');
    }
  };

  const resetForm = () => {
    setBaslik('');
    setTur('Toplu Yemek');
    setTarih(new Date());
    setSaat(new Date());
    setBitisTarihi(new Date());
    setBitisSaati(new Date());
    setKonum('');
    setAciklama('');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const getBitis = (e: Etkinlik) => {
    const tarih = e.bitis_tarihi || e.tarih;
    const saat = e.bitis_saati || e.saat;
    if (!tarih || !saat) return null;
    
    const [yil, ay, gun] = tarih.split('-').map(Number);
    const [saatNum, dakika] = saat.split(':').map(Number);
    const bitisZamani = new Date(yil, ay - 1, gun, saatNum, dakika, 0);
    
    console.log(`Etkinlik: ${e.baslik}`);
    console.log(`Bitiş tarihi: ${tarih}, Bitiş saati: ${saat}`);
    console.log(`Hesaplanan bitiş zamanı: ${bitisZamani.toLocaleString('tr-TR')}`);
    console.log(`Şimdiki zaman: ${new Date().toLocaleString('tr-TR')}`);
    console.log(`Aktif mi? ${bitisZamani >= new Date()}`);
    console.log('---');
    
    return bitisZamani;
  };

  // Her render'da güncel zamanı al
  const now = new Date();
  console.log(`Render zamanı: ${now.toLocaleString('tr-TR')}`);

  const upcoming = etkinlikler.filter(e => {
    const bitis = getBitis(e);
    return bitis && bitis >= now;
  });
  const past = etkinlikler.filter(e => {
    const bitis = getBitis(e);
    return bitis && bitis < now;
  });

  console.log(`Toplam etkinlik: ${etkinlikler.length}, Aktif: ${upcoming.length}, Geçmiş: ${past.length}`);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push({ pathname: '/sendikaci-home', params: { user_id: userId, ad: params.ad, soyad: params.soyad, role } })}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etkinlik Yönetimi</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalView('form');
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Yeni Etkinlik Ekle</Text>
        </TouchableOpacity>
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
                <View style={styles.etkinlikHeader}>
                  <Text style={[styles.cardTitle, {color:'#1976d2'}]}><Ionicons name="calendar" size={18} color="#1976d2" /> {e.baslik}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Etkinliği Sil',
                        'Bu etkinliği silmek istediğinize emin misiniz?',
                        [
                          { text: 'İptal', style: 'cancel' },
                          { text: 'Sil', style: 'destructive', onPress: () => deleteEtkinlik(e.id) }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                <View style={styles.badgePrimary}><Text style={styles.badgeText}>Aktif</Text></View>
                <Text style={styles.cardText}><Text style={styles.bold}>Açıklama:</Text> {e.aciklama}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Başlangıç:</Text> {formatDate(new Date(e.tarih))} {e.saat}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Bitiş:</Text> {e.bitis_tarihi ? formatDate(new Date(e.bitis_tarihi)) : ''} {e.bitis_saati || ''}</Text>
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
                <View style={styles.etkinlikHeader}>
                  <Text style={[styles.cardTitle, {color:'#8e24aa'}]}><Ionicons name="calendar" size={18} color="#8e24aa" /> {e.baslik}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Etkinliği Sil',
                        'Bu etkinliği silmek istediğinize emin misiniz?',
                        [
                          { text: 'İptal', style: 'cancel' },
                          { text: 'Sil', style: 'destructive', onPress: () => deleteEtkinlik(e.id) }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                <View style={styles.badgeSecondary}><Text style={styles.badgeText}>Geçmiş</Text></View>
                <Text style={styles.cardText}><Text style={styles.bold}>Açıklama:</Text> {e.aciklama}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Başlangıç:</Text> {formatDate(new Date(e.tarih))} {e.saat}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Bitiş:</Text> {e.bitis_tarihi ? formatDate(new Date(e.bitis_tarihi)) : ''} {e.bitis_saati || ''}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Tür:</Text> {e.tur}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Konum:</Text> {e.konum}</Text>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Etkinlik Ekle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Başlık</Text>
                <TextInput
                  style={styles.input}
                  value={baslik}
                  onChangeText={setBaslik}
                  placeholder="Etkinlik başlığı"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tür</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      Alert.alert(
                        'Etkinlik Türü',
                        'Tür seçin',
                        [
                          { text: 'Toplu Yemek', onPress: () => setTur('Toplu Yemek') },
                          { text: 'Sosyal Gösteri', onPress: () => setTur('Sosyal Gösteri') },
                          { text: 'Spor Etkinliği', onPress: () => setTur('Spor Etkinliği') },
                          { text: 'Gezi', onPress: () => setTur('Gezi') },
                          { text: 'Özel Gün Kutlaması', onPress: () => setTur('Özel Gün Kutlaması') }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.pickerButtonText}>{tur}</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Başlangıç Tarihi</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>{formatDate(tarih)}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={tarih}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Başlangıç Saati</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.dateButtonText}>{formatTime(saat)}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={saat}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Bitiş Tarihi</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowBitisDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>{formatDate(bitisTarihi)}</Text>
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

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Bitiş Saati</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowBitisTimePicker(true)}
                >
                  <Text style={styles.dateButtonText}>{formatTime(bitisSaati)}</Text>
                </TouchableOpacity>
                {showBitisTimePicker && (
                  <DateTimePicker
                    value={bitisSaati}
                    mode="time"
                    display="default"
                    onChange={handleBitisTimeChange}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Konum</Text>
                <TextInput
                  style={styles.input}
                  value={konum}
                  onChangeText={setKonum}
                  placeholder="Etkinlik konumu"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Açıklama</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={aciklama}
                  onChangeText={setAciklama}
                  placeholder="Etkinlik açıklaması"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveEtkinlik}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  etkinlikCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  etkinlikHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  etkinlikTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  etkinlikTur: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  etkinlikDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  etkinlikLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  etkinlikDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  modalBody: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
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
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dateButton: {
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
    backgroundColor: '#1a237e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 16,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  badgePrimary: {
    backgroundColor: '#e0f7fa',
    padding: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeSecondary: {
    backgroundColor: '#f3e5f5',
    padding: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
}); 