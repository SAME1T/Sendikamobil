import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import AnimatedBackground from '../components/AnimatedBackground';
import LogoWithSlogan from '../components/LogoWithSlogan';

// Local kullanıcı listesi (gerçek uygulamada global state veya API ile yapılmalı)
const users = [
  { tc_no: '12345678901', password: 'admin123', rol: 0 },
  { tc_no: '11122233344', password: 'isci123', rol: 1 },
  { tc_no: '22233344455', password: 'sendika123', rol: 2 },
];

export default function Register() {
  const params = useLocalSearchParams();
  const role = params.role;
  const [formData, setFormData] = useState({
    tcNo: '',
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const inputRefs = {
    name: useRef<TextInput>(null),
    surname: useRef<TextInput>(null),
    email: useRef<TextInput>(null),
    phone: useRef<TextInput>(null),
    password: useRef<TextInput>(null),
    confirmPassword: useRef<TextInput>(null),
  };

  const handleRegister = async () => {
    // Form validasyonu
    if (!formData.tcNo || !formData.name || !formData.surname || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      Alert.alert('Hata', 'Tüm alanları doldurun.');
      return;
    }
    if (formData.tcNo.length !== 11) {
      Alert.alert('Hata', 'TC Kimlik No 11 haneli olmalı.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    try {
      const response = await fetch('http://172.20.10.2:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad: formData.name,
          soyad: formData.surname,
          tc_no: formData.tcNo,
          telefon: formData.phone,
          email: formData.email,
          password: formData.password,
          rol: 1
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Başarılı', 'Kayıt başarıyla oluşturuldu!');
        setTimeout(() => {
          router.replace('/login/isci');
        }, 700);
      } else {
        Alert.alert('Hata', data.message || 'Kayıt sırasında bir hata oluştu.');
      }
    } catch (err) {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const focusNextInput = (nextKey: keyof typeof inputRefs) => {
    inputRefs[nextKey].current?.focus();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.mainContainer}
    >
      <AnimatedBackground />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <LogoWithSlogan />
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📝</Text>
          </View>
          <Text style={styles.title}>
            {role === 'isci' ? 'İşçi Üyeliği' : role === 'sendikaci' ? 'Sendikacı Üyeliği' : 'Üye Ol'}
          </Text>
          <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>

          <TextInput
            style={[styles.input, styles.inputText]}
            placeholder="TC Kimlik Numarası"
            placeholderTextColor="#666"
            value={formData.tcNo}
            onChangeText={(value) => updateFormData('tcNo', value)}
            keyboardType="numeric"
            maxLength={11}
          />

          <TextInput
            ref={inputRefs.name}
            style={[styles.input, styles.inputText]}
            placeholder="Ad"
            placeholderTextColor="#666"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
          />

          <TextInput
            ref={inputRefs.surname}
            style={[styles.input, styles.inputText]}
            placeholder="Soyad"
            placeholderTextColor="#666"
            value={formData.surname}
            onChangeText={(value) => updateFormData('surname', value)}
          />

          <TextInput
            ref={inputRefs.email}
            style={[styles.input, styles.inputText]}
            placeholder="E-posta"
            placeholderTextColor="#666"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            ref={inputRefs.phone}
            style={[styles.input, styles.inputText]}
            placeholder="Telefon"
            placeholderTextColor="#666"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            keyboardType="phone-pad"
          />

          <TextInput
            ref={inputRefs.password}
            style={[styles.input, styles.inputText]}
            placeholder="Şifre"
            placeholderTextColor="#666"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
          />

          <TextInput
            ref={inputRefs.confirmPassword}
            style={[styles.input, styles.inputText]}
            placeholder="Şifre Tekrar"
            placeholderTextColor="#666"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            secureTextEntry
          />

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>KAYIT OL</Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <Link href="/login/sendika" style={styles.link}>Sendikacı Girişi</Link>
            <Text style={styles.separator}>|</Text>
            <Link href="/login/isci" style={styles.link}>İşçi Girişi</Link>
            <Text style={styles.separator}>|</Text>
            <Link href="/" style={styles.link}>Ana Sayfa</Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1a2942',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inputText: {
    color: '#333',
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#0095FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: '#0095FF',
    fontSize: 14,
    textDecorationLine: 'none',
  },
  separator: {
    color: '#666',
    marginHorizontal: 10,
  },
}); 