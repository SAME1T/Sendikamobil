import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import AnimatedBackground from '../../components/AnimatedBackground';
import LogoWithSlogan from '../../components/LogoWithSlogan';

export default function SendikaLogin() {
  const [tcNo, setTcNo] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Login logic will be implemented here
    console.log('Login attempt:', { tcNo, password });
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
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
        />

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Şifre"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>GİRİŞ YAP</Text>
        </TouchableOpacity>

        <View style={styles.linksContainer}>
          <Link href="/forgot-password" style={styles.link}>Şifremi Unuttum</Link>
          <Text style={styles.separator}>|</Text>
          <Link href="/register" style={styles.link}>Üye Ol</Link>
          <Text style={styles.separator}>|</Text>
          <Link href="/" style={styles.link}>Ana Sayfa</Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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