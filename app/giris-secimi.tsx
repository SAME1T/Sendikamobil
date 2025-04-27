import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function GirisSecimi() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleRegister = (role: 'isci' | 'sendikaci') => {
    setModalVisible(false);
    router.push({ pathname: '/register', params: { role } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={48} color="#FFD700" style={{ marginBottom: 8 }} />
        <Text style={styles.title}>Giriş Seçimi</Text>
        <Text style={styles.slogan}>Lütfen giriş türünüzü seçin</Text>
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, styles.workerButton]}
          onPress={() => router.push('/login/isci')}
          activeOpacity={0.85}
        >
          <Ionicons name="construct" size={28} color="#FFD700" style={{ marginBottom: 6 }} />
          <Text style={styles.buttonText}>işçi giriş</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.unionButton]}
          onPress={() => router.push('/login/sendika')}
          activeOpacity={0.85}
        >
          <Ionicons name="business" size={28} color="#FFD700" style={{ marginBottom: 6 }} />
          <Text style={styles.buttonText}>sendikacı giriş</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.button, styles.fullWidthButton, styles.registerButton]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="person-add" size={28} color="#FFD700" style={{ marginBottom: 6 }} />
        <Text style={styles.buttonText}>üye ol</Text>
      </TouchableOpacity>

      {/* Anasayfa Butonu */}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push('/')}
        activeOpacity={0.85}
      >
        <Ionicons name="home" size={22} color="#FFD700" style={{ marginRight: 8 }} />
        <Text style={styles.homeButtonText}>Ana Sayfa</Text>
      </TouchableOpacity>

      {/* Üye Ol Modalı */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kayıt Türü Seçin</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#243B55' }]}
              onPress={() => handleRegister('isci')}
            >
              <Ionicons name="construct" size={22} color="#FFD700" style={{ marginRight: 8 }} />
              <Text style={styles.modalButtonText}>İşçi olarak üye ol</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#0d1521' }]}
              onPress={() => handleRegister('sendikaci')}
            >
              <Ionicons name="business" size={22} color="#FFD700" style={{ marginRight: 8 }} />
              <Text style={styles.modalButtonText}>Sendikacı olarak üye ol</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a2942', // Giriş ekranlarıyla uyumlu
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  slogan: {
    fontSize: 15,
    color: '#E2E7E8',
    marginBottom: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
    width: '100%',
  },
  button: {
    width: width * 0.36,
    height: 80,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: '#243B55',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    padding: 6,
  },
  workerButton: {
    // Farklı bir renk tonu veya ekstra stil eklenebilir
  },
  unionButton: {
    // Farklı bir renk tonu veya ekstra stil eklenebilir
  },
  fullWidthButton: {
    width: width * 0.78,
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  registerButton: {
    backgroundColor: '#0d1521',
    borderColor: '#FFD700',
  },
  buttonText: {
    fontSize: 17,
    color: '#FFD700',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    backgroundColor: '#243B55',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  homeButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a2942',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    width: width * 0.8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginVertical: 8,
    width: '100%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  modalButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancel: {
    marginTop: 16,
    padding: 8,
  },
  modalCancelText: {
    color: '#E2E7E8',
    fontSize: 15,
  },
}); 