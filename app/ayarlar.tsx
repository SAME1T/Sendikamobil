import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Ayarlar() {
  const params = useLocalSearchParams();
  const userId = params.user_id;
  const role = Number(params.role) || 1;
  const [ad, setAd] = useState(params.ad || '');
  const [soyad, setSoyad] = useState(params.soyad || '');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
  const [profilFoto, setProfilFoto] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfilFoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (yeniSifre !== yeniSifreTekrar) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('ad', String(ad));
      formData.append('soyad', String(soyad));
      formData.append('email', String(email));
      formData.append('telefon', String(telefon));
      if (yeniSifre) {
        formData.append('sifre', String(yeniSifre));
      }
      if (profilFoto) {
        const response = await fetch(profilFoto);
        const blob = await response.blob();
        formData.append('profil_foto', blob, 'profil.jpg');
      }

      await axios.put(`${API_BASE_URL}/api/users/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Başarılı', 'Bilgileriniz güncellendi!');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Bilgiler güncellenirken bir hata oluştu.');
    }
  };

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
        </View>

        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
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
}); 