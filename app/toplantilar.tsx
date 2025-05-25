import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Toplanti {
  id: number;
  baslik: string;
  tarih: string;
  saat: string;
  yer: string;
  gundem: string;
  yapilacaklar: string;
  katilimcilar: string;
  olusturan_id: number;
  created_at: string;
}

interface Sendikaci {
  id: number;
  ad: string;
  soyad: string;
}

export default function Toplantilar() {
  const params = useLocalSearchParams();
  const userId = params.user_id as string;
  const role = Number(params.role) || 2;

  const [toplantilar, setToplantilar] = useState<Toplanti[]>([]);
  const [sendikacilar, setSendikacilar] = useState<Sendikaci[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [baslik, setBaslik] = useState('');
  const [tarih, setTarih] = useState(new Date());
  const [saat, setSaat] = useState(new Date());
  const [yer, setYer] = useState('');
  const [gundem, setGundem] = useState('');
  const [yapilacaklar, setYapilacaklar] = useState('');
  const [katilimciNotu, setKatilimciNotu] = useState('');
  const [selectedKatilimcilar, setSelectedKatilimcilar] = useState<number[]>([]);

  // DateTimePicker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchToplantilar();
    fetchSendikacilar();
  }, []);

  const fetchToplantilar = async () => {
    try {
      const response = await axios.get<Toplanti[]>(`${API_BASE_URL}/api/toplantilar`);
      setToplantilar(response.data);
      setLoading(false);
    } catch (error) {
      Alert.alert('Hata', 'Toplantılar yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const fetchSendikacilar = async () => {
    try {
      const response = await axios.get<Sendikaci[]>(`${API_BASE_URL}/api/toplantilar/sendikacilar`);
      setSendikacilar(response.data);
    } catch (error) {
      console.error('Sendikacılar yüklenirken hata:', error);
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

  const toggleKatilimci = (id: number) => {
    setSelectedKatilimcilar(prev => 
      prev.includes(id) 
        ? prev.filter(k => k !== id)
        : [...prev, id]
    );
  };

  const saveToplanti = async () => {
    if (!baslik.trim() || !yer.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve yer bilgilerini giriniz.');
      return;
    }

    if (selectedKatilimcilar.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir katılımcı seçiniz.');
      return;
    }

    const payload = {
      baslik,
      tarih: tarih.toISOString().split('T')[0],
      saat: saat.toTimeString().slice(0, 5),
      yer,
      gundem,
      yapilacaklar,
      katilimcilar: selectedKatilimcilar.join(','),
      olusturan_id: Number(userId)
    };

    try {
      await axios.post(`${API_BASE_URL}/api/toplantilar`, payload);
      Alert.alert('Başarılı', 'Toplantı başarıyla oluşturuldu!');
      resetForm();
      fetchToplantilar();
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Hata', 'Toplantı oluşturulamadı.');
    }
  };

  const deleteToplanti = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/toplantilar/${id}`, {
        data: { user_id: Number(userId) }
      });
      Alert.alert('Başarılı', 'Toplantı başarıyla silindi!');
      fetchToplantilar();
    } catch (err) {
      Alert.alert('Hata', 'Toplantı silinemedi.');
    }
  };

  const resetForm = () => {
    setBaslik('');
    setTarih(new Date());
    setSaat(new Date());
    setYer('');
    setGundem('');
    setYapilacaklar('');
    setKatilimciNotu('');
    setSelectedKatilimcilar([]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR');
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  const getKatilimciNames = (katilimciIds: string) => {
    if (!katilimciIds) return [];
    return katilimciIds.split(',').map(id => {
      const sendikaci = sendikacilar.find(s => s.id === Number(id.trim()));
      return sendikaci ? `${sendikaci.ad} ${sendikaci.soyad}` : '';
    }).filter(name => name);
  };

  const now = new Date();
  const upcoming = toplantilar.filter(t => {
    const toplantiBitis = new Date(`${t.tarih}T${t.saat}`);
    return toplantiBitis >= now;
  });
  const past = toplantilar.filter(t => {
    const toplantiBitis = new Date(`${t.tarih}T${t.saat}`);
    return toplantiBitis < now;
  });

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
          <Ionicons name="people" size={24} color="#FFD700" /> Toplantılar
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Toplantı Oluştur</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          <Ionicons name="list" size={20} color="#1a237e" /> Tüm Toplantılar
        </Text>
        
        {loading ? (
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        ) : toplantilar.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#1976d2" />
            <Text style={styles.emptyText}>Henüz toplantı eklenmedi.</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {toplantilar.map((toplanti) => {
              const isUpcoming = new Date(`${toplanti.tarih}T${toplanti.saat}`) >= now;
              const canDelete = Number(userId) === toplanti.olusturan_id;
              
              return (
                <View key={toplanti.id} style={[
                  styles.meetingCard, 
                  { backgroundColor: isUpcoming ? '#e3f2fd' : '#f3e5f5' }
                ]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.meetingTitle, { 
                      color: isUpcoming ? '#1976d2' : '#8e24aa' 
                    }]}>
                      {toplanti.baslik}
                    </Text>
                    {canDelete && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                          Alert.alert(
                            'Toplantıyı Sil',
                            'Bu toplantıyı silmek istediğinize emin misiniz?',
                            [
                              { text: 'İptal', style: 'cancel' },
                              { text: 'Sil', style: 'destructive', onPress: () => deleteToplanti(toplanti.id) }
                            ]
                          );
                        }}
                      >
                        <Ionicons name="trash" size={18} color="#fff" />
                        <Text style={styles.deleteButtonText}>Sil</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.meetingMeta}>
                    <Text style={styles.metaItem}>
                      <Text style={styles.metaLabel}>
                        <Ionicons name="calendar-outline" size={16} color="#607d8b" /> Tarih:
                      </Text> {formatDate(toplanti.tarih)} {toplanti.saat}
                    </Text>
                    <Text style={styles.metaItem}>
                      <Text style={styles.metaLabel}>
                        <Ionicons name="location-outline" size={16} color="#607d8b" /> Yer:
                      </Text> {toplanti.yer}
                    </Text>
                  </View>

                  {toplanti.gundem && (
                    <View style={styles.agendaSection}>
                      <Text style={[styles.sectionLabel, { color: isUpcoming ? '#1976d2' : '#8e24aa' }]}>
                        <Ionicons name="chatbubbles-outline" size={16} /> Konuşulacaklar
                      </Text>
                      <View style={styles.agendaList}>
                        {toplanti.gundem.split('\n').map((item, idx) => (
                          item.trim() && (
                            <Text key={idx} style={styles.agendaItem}>• {item}</Text>
                          )
                        ))}
                      </View>
                    </View>
                  )}

                  {toplanti.yapilacaklar && (
                    <View style={styles.todoSection}>
                      <Text style={[styles.sectionLabel, { color: isUpcoming ? '#1976d2' : '#8e24aa' }]}>
                        <Ionicons name="checkbox-outline" size={16} /> Yapılacaklar
                      </Text>
                      <View style={styles.todoList}>
                        {toplanti.yapilacaklar.split('\n').map((item, idx) => (
                          item.trim() && (
                            <View key={idx} style={styles.todoItem}>
                              <Ionicons name="square-outline" size={14} color="#666" />
                              <Text style={styles.todoText}> {item}</Text>
                            </View>
                          )
                        ))}
                      </View>
                    </View>
                  )}

                  {toplanti.katilimcilar && (
                    <View style={styles.participantsSection}>
                      <Text style={[styles.sectionLabel, { color: isUpcoming ? '#1976d2' : '#8e24aa' }]}>
                        <Ionicons name="people-outline" size={16} /> Katılımcılar
                      </Text>
                      <View style={styles.participantsList}>
                        {getKatilimciNames(toplanti.katilimcilar).map((name, idx) => (
                          <Text key={idx} style={styles.participantItem}>• {name}</Text>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.createdMeta}>
                    <Text style={styles.createdText}>
                      Oluşturan: {toplanti.olusturan_id} | Eklenme: {formatDateTime(toplanti.created_at)}
                    </Text>
                  </View>
                </View>
              );
            })}
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
                <Ionicons name="add" size={20} color="#1a237e" /> Toplantı Oluştur
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formSection}>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Başlık</Text>
                    <TextInput
                      style={styles.input}
                      value={baslik}
                      onChangeText={setBaslik}
                      placeholder="Toplantı başlığı"
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Yer</Text>
                    <TextInput
                      style={styles.input}
                      value={yer}
                      onChangeText={setYer}
                      placeholder="Toplantı yeri"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Tarih</Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.dateButtonText}>{tarih.toLocaleDateString('tr-TR')}</Text>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
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

                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Saat</Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Text style={styles.dateButtonText}>
                        {saat.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Ionicons name="time-outline" size={20} color="#666" />
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
                </View>

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Konuşulacaklar (her satır bir madde)</Text>
                    <TextInput
                      style={styles.textArea}
                      value={gundem}
                      onChangeText={setGundem}
                      placeholder="Her satıra bir gündem maddesi yazın..."
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Yapılacaklar (her satır bir madde)</Text>
                    <TextInput
                      style={styles.textArea}
                      value={yapilacaklar}
                      onChangeText={setYapilacaklar}
                      placeholder="Her satıra bir yapılacak yazın..."
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Katılacak Sendikacılar</Text>
                  <ScrollView style={styles.katilimciContainer}>
                    {sendikacilar.map((sendikaci) => (
                      <TouchableOpacity
                        key={sendikaci.id}
                        style={styles.katilimciItem}
                        onPress={() => toggleKatilimci(sendikaci.id)}
                      >
                        <View style={[
                          styles.checkbox,
                          selectedKatilimcilar.includes(sendikaci.id) && styles.checkboxSelected
                        ]}>
                          {selectedKatilimcilar.includes(sendikaci.id) && (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          )}
                        </View>
                        <Text style={styles.katilimciName}>{sendikaci.ad} {sendikaci.soyad}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text style={styles.helperText}>Birden fazla sendikacı seçebilirsiniz.</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Katılımcı Notu (isteğe bağlı)</Text>
                  <TextInput
                    style={styles.input}
                    value={katilimciNotu}
                    onChangeText={setKatilimciNotu}
                    placeholder="Katılımcılar için özel not..."
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={saveToplanti}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}> Toplantı Ekle</Text>
                </TouchableOpacity>
              </View>
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
    marginTop: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cardGrid: {
    marginBottom: 16,
  },
  meetingCard: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e3e9f7',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  meetingMeta: {
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  metaLabel: {
    fontWeight: '600',
    color: '#607d8b',
  },
  agendaSection: {
    marginTop: 12,
  },
  todoSection: {
    marginTop: 12,
  },
  participantsSection: {
    marginTop: 12,
  },
  sectionLabel: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 8,
  },
  agendaList: {
    marginLeft: 8,
  },
  agendaItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  todoList: {
    marginLeft: 8,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  todoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 4,
  },
  participantsList: {
    marginLeft: 8,
  },
  participantItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  createdMeta: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  createdText: {
    fontSize: 12,
    color: '#888',
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
  formSection: {
    marginBottom: 16,
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
    minHeight: 80,
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
  katilimciContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  katilimciItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1a237e',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1a237e',
  },
  katilimciName: {
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
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