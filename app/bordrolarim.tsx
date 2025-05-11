import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import api from '../services/api';
import { API_BASE_URL } from '../services/api';
import { useLocalSearchParams, router } from 'expo-router';

export default function Bordrolarim() {
  const params = useLocalSearchParams();
  const userId = Number(params.user_id);
  const [payrolls, setPayrolls] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    fetchMyPayrolls();
  }, [userId]);

  const fetchMyPayrolls = async () => {
    try {
      const data = await api.getPayrolls();
      if (data.success) {
        const filtered = data.payrolls.filter((p: any) => p.user_id === userId);
        console.log('Kullanıcıya ait bordrolar:', filtered);
        setPayrolls(filtered);
      }
    } catch (err) {
      Alert.alert('Hata', 'Bordrolar alınamadı.');
    }
  };

  const handleOpenPdf = (pdfPath: string) => {
    const url = API_BASE_URL + pdfPath;
    Linking.openURL(url);
  };

  const handleDownloadPdf = (pdfPath: string) => {
    const url = API_BASE_URL + pdfPath;
    Linking.openURL(url); // Mobilde genellikle açınca indirme de başlar
  };

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={() => router.replace({ pathname: '/home', params })}>
        <Text style={styles.homeButtonText}>Ana Sayfa</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Bordrolarım</Text>
      <FlatList
        contentContainerStyle={{ paddingTop: 32 }}
        data={payrolls}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.payrollCard}>
            <Text style={{ color: '#aaa', fontSize: 12 }}>id: {item.id} | user_id: {item.user_id}</Text>
            <Text style={styles.payrollDate}>{item.payroll_date}</Text>
            <Text style={styles.payrollAmount}>{item.amount} TL</Text>
            <Text style={styles.payrollDesc}>{item.description}</Text>
            <Text style={{ color: '#aaa', fontSize: 12 }}>PDF: {item.pdf_path}</Text>
            <View style={styles.payrollActions}>
              <TouchableOpacity style={styles.pdfButton} onPress={() => handleOpenPdf(item.pdf_path)}>
                <Text style={styles.pdfButtonText}>Görüntüle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfButton, { backgroundColor: '#4CAF50' }]} onPress={() => handleDownloadPdf(item.pdf_path)}>
                <Text style={styles.pdfButtonText}>İndir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz bordro bulunamadı.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16, paddingTop: 60 },
  homeButton: { backgroundColor: '#007aff', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 18, alignSelf: 'center', minWidth: 120 },
  homeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, color: '#1a2942', textAlign: 'center' },
  warning: { color: 'red', fontSize: 16, marginTop: 40, textAlign: 'center' },
  emptyText: { color: '#888', fontSize: 16, marginTop: 40, textAlign: 'center' },
  payrollCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 18, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  payrollDate: { fontSize: 16, color: '#007aff', fontWeight: 'bold', marginBottom: 6 },
  payrollAmount: { fontSize: 22, color: '#1a2942', fontWeight: 'bold', marginBottom: 6 },
  payrollDesc: { fontSize: 15, color: '#444', marginBottom: 12 },
  payrollActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  pdfButton: { backgroundColor: '#0095FF', padding: 10, borderRadius: 6, alignItems: 'center', marginRight: 8 },
  pdfButtonText: { color: 'white', fontWeight: 'bold' },
}); 