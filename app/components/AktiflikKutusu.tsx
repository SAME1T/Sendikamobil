import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

interface AktiflikKutusuProps {
  userId: string;
  refreshTrigger?: number; // Bu prop değiştiğinde yeniden fetch yapar
}

interface AktiflikData {
  aktiflikPuani: number;
  sendikaUcreti: number;
  saatlikMaas: number;
}

export default function AktiflikKutusu({ userId, refreshTrigger }: AktiflikKutusuProps) {
  const [data, setData] = useState<AktiflikData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAktiflikData();
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(() => {
      fetchAktiflikData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [userId, refreshTrigger]); // refreshTrigger değiştiğinde de yenile

  const fetchAktiflikData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/aktiflik/${userId}`);
      if (response.data.success) {
        setData({
          aktiflikPuani: response.data.aktiflikPuani,
          sendikaUcreti: response.data.sendikaUcreti,
          saatlikMaas: response.data.saatlikMaas
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Aktiflik verisi getirme hatası:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <Text style={styles.title}>Aktiflik Puanı ve Sendika Ücreti</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007aff" />
          <Text style={styles.loadingText}>Hesaplanıyor...</Text>
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <Text style={styles.title}>Aktiflik Puanı ve Sendika Ücreti</Text>
        </View>
        <Text style={styles.errorText}>Veriler yüklenemedi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={24} color="#FFD700" />
        <Text style={styles.title}>Aktiflik Puanı ve Sendika Ücreti</Text>
      </View>
      
      <View style={styles.content}>
        {/* Aktiflik Puanı */}
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>Aktiflik Puanınız</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{data.aktiflikPuani}</Text>
            <Text style={styles.scoreMax}>/100 puan</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${data.aktiflikPuani}%` }
              ]} 
            />
          </View>
        </View>

        {/* Sendika Ücreti Hesaplama */}
        <View style={styles.feeSection}>
          <Text style={styles.sectionTitle}>Sendika Ücreti Hesaplama</Text>
          
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Saatlik Ücretiniz:</Text>
            <Text style={styles.calculationValue}>
              {data.saatlikMaas.toFixed(2)} TL
            </Text>
          </View>
          
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Hesaplanan Sendika Ücreti:</Text>
            <Text style={[styles.calculationValue, styles.feeValue]}>
              {data.sendikaUcreti.toFixed(2)} TL
            </Text>
          </View>
          
          <Text style={styles.infoText}>
            * Ücret, aktiflik puanınıza göre otomatik hesaplanmaktadır.
          </Text>
          <Text style={styles.infoText}>
            * Anket yapınca aktiflik artacak ve sendika ücreti düşecek.
          </Text>
        </View>

        {/* Aktiflik Artırma İpuçları */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Aktiflik Puanınızı Artırmak İçin:</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#229954" />
            <Text style={styles.tipText}>Geri bildirim gönderin (1 puan)</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#229954" />
            <Text style={styles.tipText}>Anketlere katılın (2 puan)</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007aff',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    color: '#ff3b30',
    padding: 20,
    fontSize: 14,
  },
  scoreSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007aff',
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007aff',
  },
  scoreMax: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007aff',
    borderRadius: 4,
  },
  feeSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007aff',
  },
  feeValue: {
    fontSize: 18,
    color: '#ff3b30',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  tipsSection: {
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#229954',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 6,
  },
}); 