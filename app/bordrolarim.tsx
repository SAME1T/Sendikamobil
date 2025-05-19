import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { API_BASE_URL } from '../services/api';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Payroll = {
  id: number;
  user_id: number;
  payroll_date: string;
  amount: number;
  description: string;
  pdf_path: string;
};

export default function Bordrolarim() {
  const params = useLocalSearchParams();
  const userId = Number(params.user_id);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  if (!userId) {
    Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
    router.replace('/');
    return null;
  }

  useEffect(() => {
    fetchMyPayrolls();
  }, [userId]);

  const fetchMyPayrolls = async () => {
    try {
      setLoading(true);
      const data = await api.getPayrolls();
      if (data.success) {
        // Sadece kullanıcıya ait bordroları filtrele ve tarihe göre sırala
        const myPayrolls = data.payrolls
          .filter((p: Payroll) => p.user_id === userId)
          .sort((a: Payroll, b: Payroll) => 
            new Date(b.payroll_date).getTime() - new Date(a.payroll_date).getTime()
          );
        setPayrolls(myPayrolls);
      }
    } catch (err) {
      Alert.alert('Hata', 'Bordrolar alınamadı.');
    } finally {
      setLoading(false);
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
      <TouchableOpacity style={styles.homeButton} onPress={() => router.replace({ pathname: '/isci-home', params })}>
        <Ionicons name="home" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.homeButtonText}>Ana Sayfa</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Bordrolarım</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0095FF" />
          <Text style={styles.loadingText}>Bordrolar yükleniyor...</Text>
        </View>
      ) : (
      <FlatList
          contentContainerStyle={styles.listContainer}
        data={payrolls}
        keyExtractor={item => String(item.id)}
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
      />
      )}
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
  warning: {
    color: 'red',
    fontSize: 16,
    marginTop: 40,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  listContainer: {
    paddingTop: 16,
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
    marginBottom: 12,
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
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
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