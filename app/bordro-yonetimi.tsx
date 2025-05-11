import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Keyboard, TouchableWithoutFeedback, Modal, Linking, ActivityIndicator } from 'react-native';
import api from '../services/api';
import * as DocumentPicker from 'expo-document-picker';
import { API_BASE_URL } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';

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

  useEffect(() => {
    if (!userId) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      router.replace('/');
      return;
    }
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
        // Sort payrolls by date in descending order
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

  // PDF seç ve yükle
  const handlePickPdf = async () => {
    setPdfUploading(true);
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.type === 'success' || (result.assets && result.assets.length > 0)) {
      const file = result.assets ? result.assets[0] : result;
      setPdfName(file.name);
      Keyboard.dismiss();
      // PDF'i backend'e yükle
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

  const handleSendPayroll = async () => {
    if (!form.user_id || !form.pdf_path) {
      Alert.alert('Hata', 'İşçi ve PDF seçmelisiniz.');
      return;
    }
    setLoading(true);
    Keyboard.dismiss();
    try {
      const data = await api.addPayroll({
        user_id: Number(form.user_id),
        payroll_date: form.payroll_date || new Date().toISOString().slice(0, 10),
        amount: form.amount || 0,
        description: form.description || '',
        pdf_path: form.pdf_path,
      });
      if (data.success) {
        Alert.alert('Başarılı', 'Bordro gönderildi!');
        setForm({ user_id: '', payroll_date: '', amount: '', description: '', pdf_path: '' });
        setPdfName('');
        fetchPayrolls();
      } else {
        Alert.alert('Hata', data.message || 'Bordro gönderilemedi.');
      }
    } catch (err) {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = () => {
    if (form.pdf_path) {
      Linking.openURL(API_BASE_URL + form.pdf_path);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={() => router.push({ pathname: '/home', params: { user_id: userId, role: 2 } })}>
        <Text style={styles.homeButtonText}>Ana Sayfa</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Bordro Yönetimi</Text>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.form}>
          <Text style={styles.label}>İşçi Seç</Text>
          <TouchableOpacity style={styles.input} onPress={() => setWorkerModal(true)}>
            <Text>{form.user_id ? (workers.find(w => w.id.toString() === form.user_id)?.ad + ' ' + workers.find(w => w.id.toString() === form.user_id)?.soyad) : 'İşçi Seçiniz'}</Text>
          </TouchableOpacity>
          <Modal visible={workerModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
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
                      <Text>{item.ad} {item.soyad}</Text>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 200 }}
                />
                <TouchableOpacity style={styles.button} onPress={() => setWorkerModal(false)}>
                  <Text style={styles.buttonText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {workerError ? <Text style={{color:'red'}}>{workerError}</Text> : null}
          <Text style={styles.label}>Tarih</Text>
          <TouchableOpacity style={styles.input} onPress={() => setDatePickerVisible(true)}>
            <Text>{form.payroll_date ? form.payroll_date : 'Tarih Seçiniz'}</Text>
          </TouchableOpacity>
          {datePickerVisible && (
            <DateTimePicker
              value={form.payroll_date ? new Date(form.payroll_date) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          <Text style={styles.label}>Tutar</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 1500.00"
            value={form.amount}
            keyboardType="numeric"
            onChangeText={v => setForm(f => ({ ...f, amount: v }))}
          />
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={styles.input}
            placeholder="Açıklama"
            value={form.description}
            onChangeText={v => setForm(f => ({ ...f, description: v }))}
          />
          <Text style={styles.label}>PDF</Text>
          <TouchableOpacity style={styles.button} onPress={handlePickPdf} disabled={pdfUploading}>
            <Text style={styles.buttonText}>{pdfUploading ? 'PDF Yükleniyor...' : 'PDF Seç ve Yükle'}</Text>
          </TouchableOpacity>
          {pdfUploading && <ActivityIndicator size="small" color="#0095FF" style={{marginTop: 8}} />}
          {pdfName && form.pdf_path ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Text style={{ flex: 1 }}>Seçilen PDF: {pdfName}</Text>
              <TouchableOpacity style={[styles.button, { padding: 8, marginTop: 0, marginLeft: 8 }]} onPress={handleViewPdf}>
                <Text style={styles.buttonText}>Görüntüle</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: form.user_id && form.pdf_path && !pdfUploading ? '#0095FF' : '#ccc', marginTop: 20 }]}
            onPress={handleSendPayroll}
            disabled={!form.user_id || !form.pdf_path || pdfUploading || loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Gönderiliyor...' : 'Gönder'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
      <Text style={styles.subtitle}>Tüm Bordrolar</Text>
      <FlatList
        data={payrolls}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.payrollItem}>
            <Text>İşçi ID: {item.user_id}</Text>
            <Text>Tarih: {item.payroll_date}</Text>
            <Text>Tutar: {item.amount}</Text>
            <Text>Açıklama: {item.description}</Text>
            <Text>PDF: {item.pdf_path}</Text>
          </View>
        )}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16, paddingTop: 60 },
  homeButton: { backgroundColor: '#007aff', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 18, alignSelf: 'center', minWidth: 120 },
  homeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32, color: '#1a2942' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 32, marginBottom: 8, color: '#1a2942' },
  form: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 24, elevation: 2, marginTop: 16 },
  label: { fontWeight: 'bold', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginTop: 4, marginBottom: 8, minHeight: 40, justifyContent: 'center' },
  button: { backgroundColor: '#0095FF', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 12 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  payrollItem: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, elevation: 1 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 8 },
  picker: { height: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20, width: '80%' },
  workerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
}); 