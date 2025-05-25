import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Ayarlar() {
  const params = useLocalSearchParams();
  const userId = params.user_id;
  const role = Number(params.role) || 1;
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
  const [loading, setLoading] = useState(true);
  const [kayitTarihi, setKayitTarihi] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
      const userData = response.data;
      
      setAd(userData.ad || '');
      setSoyad(userData.soyad || '');
      setEmail(userData.email || '');
      setTelefon(userData.telefon || '');
      setKayitTarihi(userData.created_at || '');
    } catch (error) {
      console.error('Kullanıcı bilgileri çekme hatası:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (yeniSifre !== yeniSifreTekrar) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor!');
      return;
    }

    try {
      const updateData: any = {
        ad: String(ad),
        soyad: String(soyad),
        email: String(email),
        telefon: String(telefon)
      };

      if (yeniSifre) {
        updateData.sifre = String(yeniSifre);
      }

      await axios.put(`${API_BASE_URL}/api/users/${userId}`, updateData);

      Alert.alert('Başarılı', 'Bilgileriniz güncellendi!');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Bilgiler güncellenirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>Kullanıcı bilgileri yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (role === 1) {
              router.push({
                pathname: '/isci-home',
                params: { user_id: userId, ad, soyad, role }
              });
            } else {
              router.push({
                pathname: '/sendikaci-home',
                params: { user_id: userId, ad, soyad, role }
              });
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#007aff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Ayarları</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.profileSection}>
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileInitials}>
              {ad[0]?.toUpperCase()}{soyad[0]?.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userInfo}>{ad} {soyad}</Text>
          <View style={styles.userRole}>
            <Text style={styles.userRoleText}>
              {role === 1 ? 'İşçi Üye' : 'Sendikacı'}
            </Text>
          </View>
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Üye ID</Text>
              <Text style={styles.statValue}>#{userId}</Text>
            </View>
            {kayitTarihi && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Kayıt Tarihi</Text>
                <Text style={styles.statValue}>{new Date(kayitTarihi).toLocaleDateString('tr-TR')}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
        <View style={styles.infoItem}>
          <Ionicons name="person" size={24} color="#007aff" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Ad:</Text>
          <TextInput
            style={styles.infoInput}
            value={ad}
            onChangeText={setAd}
            placeholder="Adınız"
          />
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="person" size={24} color="#007aff" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Soyad:</Text>
          <TextInput
            style={styles.infoInput}
            value={soyad}
            onChangeText={setSoyad}
            placeholder="Soyadınız"
          />
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="mail" size={24} color="#007aff" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>E-posta:</Text>
          <TextInput
            style={styles.infoInput}
            value={email}
            onChangeText={setEmail}
            placeholder="E-posta adresiniz"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="call" size={24} color="#007aff" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Telefon:</Text>
          <TextInput
            style={styles.infoInput}
            value={telefon}
            onChangeText={setTelefon}
            placeholder="Telefon numaranız"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
        <View style={styles.infoItem}>
          <Ionicons name="lock-closed" size={24} color="#007aff" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Yeni Şifre:</Text>
          <TextInput
            style={styles.infoInput}
            value={yeniSifre}
            onChangeText={setYeniSifre}
            placeholder="Yeni şifre"
            secureTextEntry
          />
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="lock-closed" size={24} color="#007aff" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Şifre Tekrar:</Text>
          <TextInput
            style={styles.infoInput}
            value={yeniSifreTekrar}
            onChangeText={setYeniSifreTekrar}
            placeholder="Yeni şifre tekrar"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save" size={24} color="#fff" style={styles.saveButtonIcon} />
          <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fa',
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007aff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 20,
    padding: 20,
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInitials: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007aff',
    marginBottom: 8,
  },
  userRole: {
    backgroundColor: '#007aff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  userRoleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007aff',
    marginTop: 20,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoIcon: {
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007aff',
    width: 100,
  },
  infoInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007aff',
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonIcon: {
    marginRight: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007aff',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007aff',
  },
}); 