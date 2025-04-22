import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordScreen() {
  const [step, setStep] = useState(1); // 1: Email, 2: Verification Code, 3: New Password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = () => {
    if (!email) {
      Alert.alert('Uyarı', 'Lütfen e-posta adresinizi girin.');
      return;
    }
    setLoading(true);
    // TODO: API entegrasyonu - e-posta doğrulama kodu gönderme
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      Alert.alert('Başarılı', 'Doğrulama kodu e-posta adresinize gönderildi.');
    }, 1500);
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      Alert.alert('Uyarı', 'Lütfen doğrulama kodunu girin.');
      return;
    }
    setLoading(true);
    // TODO: API entegrasyonu - kod doğrulama
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Uyarı', 'Şifreler eşleşmiyor.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Uyarı', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setLoading(true);
    // TODO: API entegrasyonu - şifre güncelleme
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.header}>Şifre Yenileme</Text>
      </View>

      <View style={styles.content}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>E-posta Doğrulama</Text>
            <Text style={styles.stepDescription}>
              Şifrenizi yenilemek için kayıtlı e-posta adresinizi girin.
              Size bir doğrulama kodu göndereceğiz.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="E-posta adresiniz"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Kod Gönder</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Kod Doğrulama</Text>
            <Text style={styles.stepDescription}>
              E-posta adresinize gönderilen 6 haneli doğrulama kodunu girin.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Doğrulama kodu"
              placeholderTextColor="#666"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Doğrula</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleSendCode}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>Kodu Tekrar Gönder</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Yeni Şifre</Text>
            <Text style={styles.stepDescription}>
              Lütfen yeni şifrenizi girin ve onaylayın.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Yeni şifre"
              placeholderTextColor="#666"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Şifre tekrar"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Şifreyi Güncelle</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#243B55',
  },
  headerContainer: {
    backgroundColor: '#1a2942',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0d1521',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    backgroundColor: '#1a2942',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 14,
    color: '#E2E7E8',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#0d1521',
    borderRadius: 8,
    padding: 12,
    color: '#E2E7E8',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    padding: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#FFD700',
    fontSize: 14,
  },
}); 