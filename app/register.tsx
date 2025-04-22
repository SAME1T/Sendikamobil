import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import AnimatedBackground from '../components/AnimatedBackground';
import LogoWithSlogan from '../components/LogoWithSlogan';

export default function Register() {
  const [formData, setFormData] = useState({
    tcNo: '',
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = () => {
    // Register logic will be implemented here
    console.log('Register attempt:', formData);
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.mainContainer}>
      <AnimatedBackground />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <LogoWithSlogan />
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📝</Text>
          </View>
          <Text style={styles.title}>Üye Ol</Text>
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
            style={[styles.input, styles.inputText]}
            placeholder="Ad"
            placeholderTextColor="#666"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
          />

          <TextInput
            style={[styles.input, styles.inputText]}
            placeholder="Soyad"
            placeholderTextColor="#666"
            value={formData.surname}
            onChangeText={(value) => updateFormData('surname', value)}
          />

          <TextInput
            style={[styles.input, styles.inputText]}
            placeholder="E-posta"
            placeholderTextColor="#666"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, styles.inputText]}
            placeholder="Telefon"
            placeholderTextColor="#666"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[styles.input, styles.inputText]}
            placeholder="Şifre"
            placeholderTextColor="#666"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
          />

          <TextInput
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
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
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