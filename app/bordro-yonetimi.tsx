import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Keyboard, TouchableWithoutFeedback, Modal, Linking, ActivityIndicator, ScrollView } from 'react-native';
import api from '../services/api';
import * as DocumentPicker from 'expo-document-picker';
import { API_BASE_URL } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Payroll = {
  id: number;
  user_id: number;
  payroll_date: string;
  amount: number;
  description: string;
  pdf_path: string;
};

type Worker = {
  id: number;
  ad: string;
  soyad: string;
};

export default function BordroYonetimi() {
  const params = useLocalSearchParams();
  const userId = Number(params.user_id);
  if (!userId) {
    Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
    router.replace('/');
    return null;
  }
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [form, setForm] = useState({
    user_id: '',
    payroll_date: '',
    amount: '',
    description: '',
    pdf_path: '',
  });
  const [loading, setLoading] = useState(false);
  const [workerError, setWorkerError] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [workerModal, setWorkerModal] = useState(false);
  const [workerSearch, setWorkerSearch] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [role, setRole] = useState(Number(params.role));

  useEffect(() => {
    if (!userId) return;
    fetchWorkers();
    fetchPayrolls();
  }, [userId]);

  const fetchWorkers = async () => {
    try {
      const data = await api.getWorkers();
      if (data.success) {
        setWorkers(data.workers);
        setWorkerError('');
      } else {
        setWorkerError('İşçi listesi alınamadı.');
      }
    } catch (err) {
      setWorkerError('İşçi listesi alınamadı.');
    }
  };

  const fetchPayrolls = async () => {
    try {
      const data = await api.getPayrolls();
      if (data.success) {
        const sortedPayrolls = data.payrolls.sort((a: any, b: any) => 
          new Date(b.payroll_date).getTime() - new Date(a.payroll_date).getTime()
        );
        setPayrolls(sortedPayrolls);
      }
    } catch (err) {
      Alert.alert('Hata', 'Bordrolar alınamadı.');
    }
  };

  const handleAddPayroll = async () => {
    if (!form.user_id || !form.payroll_date || !form.amount || !form.description || !form.pdf_path) {
      Alert.alert('Hata', 'Tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    Keyboard.dismiss();
    try {
      const data = await api.addPayroll({
        user_id: Number(form.user_id),
        payroll_date: form.payroll_date,
        amount: Number(form.amount),
        description: form.description,
        pdf_path: form.pdf_path,
      });
      if (data.success) {
        Alert.alert('Başarılı', 'Bordro eklendi!');
        setForm({ user_id: '', payroll_date: '', amount: '', description: '', pdf_path: '' });
        setPdfName('');
        fetchPayrolls();
      } else {
        Alert.alert('Hata', data.message || 'Bordro eklenemedi.');
      }
    } catch (err) {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickPdf = async () => {
    setPdfUploading(true);
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      setPdfName(file.name);
      Keyboard.dismiss();
      const formData = new FormData();
      formData.append('pdf', {
        uri: file.uri,
        name: file.name,
        type: 'application/pdf',
      } as any);
      try {
        const response = await fetch(API_BASE_URL + '/api/upload/payroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          setForm(f => ({ ...f, pdf_path: data.pdf_path }));
        } else {
          setForm(f => ({ ...f, pdf_path: '' }));
          Alert.alert('Hata', data.message || 'PDF yüklenemedi.');
        }
      } catch (err) {
        setForm(f => ({ ...f, pdf_path: '' }));
        Alert.alert('Hata', 'PDF yüklenemedi.');
      }
    }
    setPdfUploading(false);
  };

  const filteredWorkers = workers.filter(w =>
    (w.ad + ' ' + w.soyad).toLowerCase().includes(workerSearch.toLowerCase())
  );

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setDatePickerVisible(false);
    if (selectedDate) {
      setForm(f => ({ ...f, payroll_date: selectedDate.toISOString().slice(0, 10) }));
    }
  };

  const handleViewPdf = () => {
    if (form.pdf_path) {
      Linking.openURL(API_BASE_URL + form.pdf_path);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={() => {
        if (role === 2) {
          router.push({ pathname: '/sendikaci-home', params: { user_id: userId, role, ad: params.ad, soyad: params.soyad } });
        } else {
          router.push({ pathname: '/isci-home', params: { user_id: userId, role, ad: params.ad, soyad: params.soyad } });
        }
      }}>
        <Ionicons name="home" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.homeButtonText}>Ana Sayfa</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Bordro Yönetimi</Text>

      {workerError ? (
        <View style={{ backgroundColor: '#ffeaea', padding: 16, borderRadius: 10, marginBottom: 20 }}>
          <Text style={{ color: '#d32f2f', fontWeight: 'bold', textAlign: 'center' }}>{workerError}</Text>
          <TouchableOpacity onPress={fetchWorkers} style={{ marginTop: 10, alignSelf: 'center', backgroundColor: '#d32f2f', padding: 10, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={payrolls}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.form, workerError ? { opacity: 0.5 } : null]} pointerEvents={workerError ? 'none' : 'auto'}>
              <Text style={styles.sectionTitle}>Yeni Bordro Ekle</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>İşçi Seç</Text>
                <TouchableOpacity style={styles.input} onPress={() => setWorkerModal(true)} disabled={!!workerError}>
                  <Text style={form.user_id ? styles.inputText : styles.placeholderText}>
                    {form.user_id ? (workers.find(w => w.id.toString() === form.user_id)?.ad + ' ' + workers.find(w => w.id.toString() === form.user_id)?.soyad) : 'İşçi Seçiniz'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

          <Modal visible={workerModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>İşçi Seçimi</Text>
                      <TouchableOpacity onPress={() => setWorkerModal(false)}>
                        <Ionicons name="close" size={24} color="#666" />
                      </TouchableOpacity>
                    </View>
                <TextInput
                      style={styles.searchInput}
                  placeholder="İşçi ara..."
                  value={workerSearch}
                  onChangeText={setWorkerSearch}
                  autoFocus
                />
                <FlatList
                  data={filteredWorkers}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.workerItem}
                      onPress={() => {
                        setForm(f => ({ ...f, user_id: item.id.toString() }));
                        setWorkerModal(false);
                        setWorkerSearch('');
                      }}
                    >
                          <Text style={styles.workerItemText}>{item.ad} {item.soyad}</Text>
                    </TouchableOpacity>
                  )}
                      style={styles.workerList}
                />
              </View>
            </View>
          </Modal>

              <View style={styles.formGroup}>
          <Text style={styles.label}>Tarih</Text>
          <TouchableOpacity style={styles.input} onPress={() => setDatePickerVisible(true)}>
                  <Text style={form.payroll_date ? styles.inputText : styles.placeholderText}>
                    {form.payroll_date ? formatDate(form.payroll_date) : 'Tarih Seçiniz'}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>
          {datePickerVisible && (
            <DateTimePicker
              value={form.payroll_date ? new Date(form.payroll_date) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
              </View>

              <View style={styles.formGroup}>
          <Text style={styles.label}>Tutar</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 1500.00"
            value={form.amount}
            keyboardType="numeric"
            onChangeText={v => setForm(f => ({ ...f, amount: v }))}
          />
              </View>

              <View style={styles.formGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
                  style={[styles.input, styles.textArea]}
            placeholder="Açıklama"
            value={form.description}
            onChangeText={v => setForm(f => ({ ...f, description: v }))}
                  multiline
                  numberOfLines={3}
          />
              </View>

              <View style={styles.formGroup}>
          <Text style={styles.label}>PDF</Text>
                <TouchableOpacity style={styles.pdfButton} onPress={handlePickPdf} disabled={pdfUploading}>
                  <Ionicons name="document-attach" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.pdfButtonText}>
                    {pdfUploading ? 'PDF Yükleniyor...' : 'PDF Seç ve Yükle'}
                  </Text>
          </TouchableOpacity>
          {pdfUploading && <ActivityIndicator size="small" color="#0095FF" style={{marginTop: 8}} />}
          {pdfName && form.pdf_path ? (
                  <View style={styles.pdfPreview}>
                    <Text style={styles.pdfName} numberOfLines={1}>{pdfName}</Text>
                    <TouchableOpacity style={styles.viewPdfButton} onPress={handleViewPdf}>
                      <Ionicons name="eye" size={20} color="#fff" />
                      <Text style={styles.viewPdfButtonText}>Görüntüle</Text>
              </TouchableOpacity>
            </View>
          ) : null}
              </View>

          <TouchableOpacity
                style={[styles.submitButton, (!form.user_id || !form.pdf_path || pdfUploading || loading) && styles.submitButtonDisabled]}
                onPress={handleAddPayroll}
            disabled={!form.user_id || !form.pdf_path || pdfUploading || loading}
          >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>Bordro Ekle</Text>
                  </>
                )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
        }
        renderItem={({ item }) => (
          <View style={styles.payrollCard}>
            <View style={styles.payrollHeader}>
              <Text style={styles.payrollDate}>{formatDate(item.payroll_date)}</Text>
              <Text style={styles.payrollAmount}>{formatAmount(item.amount)}</Text>
            </View>
            <Text style={styles.payrollDesc}>{item.description}</Text>
            <View style={styles.payrollActions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => Linking.openURL(API_BASE_URL + item.pdf_path)}
              >
                <Ionicons name="eye" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Görüntüle</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} 
                onPress={() => Linking.openURL(API_BASE_URL + item.pdf_path)}
              >
                <Ionicons name="download" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>İndir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Henüz bordro bulunamadı.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
  },
  homeButton: {
    backgroundColor: '#007aff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
    minWidth: 140,
  },
  homeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1a2942',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a2942',
    marginBottom: 16,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a2942',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
  },
  inputText: {
    color: '#1a2942',
    fontSize: 16,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pdfButton: {
    backgroundColor: '#0095FF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pdfPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  pdfName: {
    flex: 1,
    color: '#666',
    marginRight: 8,
  },
  viewPdfButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewPdfButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#0095FF',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2942',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  workerList: {
    maxHeight: 300,
  },
  workerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  workerItemText: {
    fontSize: 16,
    color: '#1a2942',
  },
  payrollCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  payrollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  payrollDate: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '600',
  },
  payrollAmount: {
    fontSize: 18,
    color: '#1a2942',
    fontWeight: 'bold',
  },
  payrollDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  payrollActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#0095FF',
    padding: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
}); 