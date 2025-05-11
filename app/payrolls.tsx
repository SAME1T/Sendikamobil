import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import api from '../services/api';
import { Picker } from '@react-native-picker/picker';

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

export default function Payrolls() {
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

  useEffect(() => {
    fetchWorkers();
    fetchPayrolls();
  }, []);

  const fetchWorkers = async () => {
    try {
      const data = await api.getWorkers();
      if (data.success) setWorkers(data.workers);
    } catch (err) {
      Alert.alert('Hata', 'İşçi listesi alınamadı.');
    }
  };

  const fetchPayrolls = async () => {
    try {
      const data = await api.getPayrolls();
      if (data.success) setPayrolls(data.payrolls);
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bordro Yönetimi</Text>
      <View style={styles.form}>
        <Text style={styles.label}>İşçi Seç</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.user_id}
            onValueChange={v => setForm(f => ({ ...f, user_id: v }))}
            style={styles.picker}
          >
            <Picker.Item label="İşçi Seçiniz" value="" />
            {workers.map(worker => (
              <Picker.Item key={worker.id} label={`${worker.ad} ${worker.soyad}`} value={worker.id.toString()} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>Tarih (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2025-05-01"
          value={form.payroll_date}
          onChangeText={v => setForm(f => ({ ...f, payroll_date: v }))}
        />
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
        <Text style={styles.label}>PDF Yolu</Text>
        <TextInput
          style={styles.input}
          placeholder="/uploads/payrolls/xxx.pdf"
          value={form.pdf_path}
          onChangeText={v => setForm(f => ({ ...f, pdf_path: v }))}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddPayroll} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Ekleniyor...' : 'Bordro Ekle'}</Text>
        </TouchableOpacity>
      </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1a2942' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 32, marginBottom: 8, color: '#1a2942' },
  form: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 24, elevation: 2 },
  label: { fontWeight: 'bold', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginTop: 4, marginBottom: 8 },
  button: { backgroundColor: '#0095FF', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 12 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  payrollItem: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, elevation: 1 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 8 },
  picker: { height: 40 },
}); 