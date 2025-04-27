import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import AnimatedBackground from '../../components/AnimatedBackground';
import LogoWithSlogan from '../../components/LogoWithSlogan';

export default function SendikaLogin() {
  const [tcNo, setTcNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!tcNo || !password) {
      Alert.alert('Hata', 'TC Kimlik No ve şifre alanları boş bırakılamaz.');
      return;
    }

    if (tcNo.length !== 11) {
      Alert.alert('Hata', 'TC Kimlik No 11 haneli olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = 'http://172.20.10.2:3001/api/login'; // Kendi IP adresinizi kullanın
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tc_no: tcNo,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Başarılı', 'Giriş yapıldı!');
        router.replace('/home');
      } else {
        Alert.alert('Hata', data.message || 'Giriş yapılamadı. TC No veya şifre hatalı.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <AnimatedBackground />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <LogoWithSlogan />
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>👤</Text>
        </View>
        <Text style={styles.title}>Sendikacı Girişi</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="TC Kimlik Numarası"
          placeholderTextColor="#666"
          value={tcNo}
          onChangeText={setTcNo}
          keyboardType="numeric"
          maxLength={11}
          editable={!loading}
        />

        <TextInput
          ref={passwordInputRef}
          style={[styles.input, styles.inputText]}
          placeholder="Şifre"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>{loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}</Text>
        </TouchableOpacity>

        <View style={styles.linksContainer}>
          <Link href="/reset-password" style={styles.link}>Şifremi Unuttum</Link>
          <Text style={styles.separator}>|</Text>
          <Link href="/register" style={styles.link}>Üye Ol</Link>
          <Text style={styles.separator}>|</Text>
          <Link href="/" style={styles.link}>Ana Sayfa</Link>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2942',
  },
  scrollContent: {
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
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#0095FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
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