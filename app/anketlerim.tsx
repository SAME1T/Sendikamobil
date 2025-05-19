import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, TextInput, Alert, AppState } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

export default function Anketlerim() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = Number(params.user_id) || 1;
  console.log('userId:', userId, 'params:', params);
  if (!userId) {
    Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
    router.replace('/');
    return null;
  }
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [formAnswers, setFormAnswers] = useState<{ [questionId: number]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [solvedSurveyIds, setSolvedSurveyIds] = useState<number[]>([]);

  useEffect(() => {
    fetchSurveys();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setSurveys([]);
      setSolvedSurveyIds([]);
      fetchSurveys();
      // App arka plandan öne gelince de fetch et
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          setSurveys([]);
          setSolvedSurveyIds([]);
          fetchSurveys();
        }
      });
      return () => {
        subscription.remove();
      };
    }, [userId])
  );

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/surveys`);
      // Sadece active durumundaki anketleri filtrele
      const activeSurveys = res.data.filter((survey: any) => survey.status === 'active');
      setSurveys(activeSurveys);
      // SADECE BU İŞÇİNİN çözdüğü anketleri bul
      const solved: number[] = [];
      for (const survey of activeSurveys) {
        const ansRes = await axios.get(`${API_BASE_URL}/api/surveys/${survey.id}/answers`);
        // Sadece bu kullanıcıya ait cevapları filtrele
        if (ansRes.data.some((a: any) => Number(a.user_id) === Number(userId))) {
          solved.push(survey.id);
        }
      }
      setSolvedSurveyIds(solved);
    } catch (err) {
      Alert.alert('Hata', 'Anketler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyQuestions = async (surveyId: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/surveys/${surveyId}`);
      if (res.data.status !== 'active') {
        Alert.alert('Uyarı', 'Bu anket silinmiş veya artık aktif değil.');
        setShowQuestions(false);
        setSelectedSurvey(null);
        fetchSurveys();
        return;
      }
      setSelectedSurvey(res.data);
      setShowQuestions(true);
      // Kullanıcının daha önce verdiği cevapları çek (sadece kendi user_id'siyle)
      const ansRes = await axios.get(`${API_BASE_URL}/api/surveys/${surveyId}/answers`);
      const userAnswers = ansRes.data.filter((a: any) => Number(a.user_id) === Number(userId));
      setAnswers(userAnswers);
      // Eğer cevap varsa formu doldur
      if (userAnswers.length > 0) {
        const fa: { [questionId: number]: string } = {};
        userAnswers.forEach((a: any) => { fa[a.question_id] = a.answer; });
        setFormAnswers(fa);
      } else {
        setFormAnswers({});
      }
    } catch (err) {
      Alert.alert('Hata', 'Anket soruları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setFormAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedSurvey) return;
    setSubmitting(true);
    const userAnswers = selectedSurvey.questions.map((q: any) => ({
      question_id: q.id,
      answer: formAnswers[q.id] || ''
    }));
    if (userAnswers.some((a: any) => !a.answer)) {
      Alert.alert('Eksik', 'Lütfen tüm soruları eksiksiz cevaplayınız.');
      setSubmitting(false);
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/surveys/${selectedSurvey.id}/answer`, {
        user_id: userId,
        answers: userAnswers,
      });
      Alert.alert('Başarılı', 'Cevaplarınız kaydedildi!');
      setShowQuestions(false);
      setSelectedSurvey(null);
      setSurveys([]);
      setSolvedSurveyIds([]);
      fetchSurveys();
    } catch (err) {
      Alert.alert('Hata', 'Cevaplar kaydedilemedi.');
    }
    setSubmitting(false);
  };

  const closeModal = () => {
    setShowQuestions(false);
    setSelectedSurvey(null);
    setSurveys([]);
    setSolvedSurveyIds([]);
    fetchSurveys();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push({ pathname: '/isci-home', params })}
        >
          <Ionicons name="home-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anketlerim</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.surveyTitle}>Çözülmemiş Anketler</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 40 }} />
        ) : showQuestions && selectedSurvey ? (
          <View style={styles.surveyCard}>
            <Text style={styles.surveyCardTitle}><Ionicons name="list-circle" size={22} color="#2575fc" /> {selectedSurvey.title}</Text>
            <Text style={styles.surveyDesc}>{selectedSurvey.description}</Text>
            {selectedSurvey.questions && selectedSurvey.questions.map((q: any, idx: number) => (
              <View key={q.id} style={styles.questionBox}>
                <Text style={styles.questionText}>{idx + 1}. {q.question_text} <Text style={styles.badge}>{q.type === 'open' ? 'Açık Uçlu' : 'Çoktan Seçmeli'}</Text></Text>
                {q.type === 'multiple' ? (
                  (() => {
                    let options = [];
                    if (Array.isArray(q.options)) {
                      options = q.options;
                    } else if (typeof q.options === 'string') {
                      try {
                        options = JSON.parse(q.options);
                        if (!Array.isArray(options)) options = [];
                      } catch (e) {
                        options = [];
                      }
                    }
                    return options.map((opt: string, oidx: number) => (
                      <TouchableOpacity
                        key={oidx}
                        style={[
                          styles.optionBtn,
                          formAnswers[q.id] === opt && styles.optionBtnSelected
                        ]}
                        onPress={() => handleAnswerChange(q.id, opt)}
                      >
                        <Text style={[
                          styles.optionText,
                          formAnswers[q.id] === opt && styles.optionTextSelected,
                        ]}>{opt}</Text>
                      </TouchableOpacity>
                    ));
                  })()
                ) : (
                  <TextInput
                    style={styles.input}
                    value={formAnswers[q.id] || ''}
                    onChangeText={(text) => handleAnswerChange(q.id, text)}
                    placeholder="Cevabınızı yazın..."
                    placeholderTextColor="#666"
                  />
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Gönder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: '#888', marginTop: 10 }]}
              onPress={closeModal}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Geri</Text>
            </TouchableOpacity>
          </View>
        ) : (
          surveys
            .filter((s) => !solvedSurveyIds.includes(Number(s.id)))
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((survey) => (
              <TouchableOpacity key={survey.id} style={styles.surveyCard} onPress={() => fetchSurveyQuestions(survey.id)}>
                <Text style={styles.surveyCardTitle}><Ionicons name="list-circle" size={22} color="#2575fc" /> {survey.title}</Text>
                <Text style={styles.surveyDesc}>{survey.description}</Text>
              </TouchableOpacity>
            ))
        )}
        {/* Çözülen Anketler */}
        <Text style={styles.completedTitle}><Ionicons name="checkmark-circle" size={22} color="#43e97b" /> Çözülen Anketler</Text>
        {solvedSurveyIds.length === 0 ? (
          <View style={styles.alertCard}>
            <Ionicons name="checkmark-done-outline" size={28} color="#888" />
            <Text style={styles.alertText}>Henüz anket çözmediniz.</Text>
          </View>
        ) : (
          surveys
            .filter((s) => solvedSurveyIds.includes(Number(s.id)))
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((survey) => (
            <View key={survey.id} style={styles.completedCard}>
              <Text style={styles.completedCardTitle}><Ionicons name="list-circle" size={20} color="#2575fc" /> {survey.title}</Text>
              <View style={styles.completedBadge}><Ionicons name="checkmark" size={16} color="#fff" /><Text style={styles.completedBadgeText}>Cevaplandı</Text></View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0eafc',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#243B55',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  surveyTitle: {
    fontSize: 28,
    fontWeight: '900',
    backgroundColor: 'transparent',
    color: '#2575fc',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 1,
  },
  surveyCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#1f2687',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    maxWidth: 600,
    alignSelf: 'center',
  },
  surveyCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2575fc',
    marginBottom: 8,
  },
  surveyDesc: {
    fontSize: 15,
    color: '#444',
    marginBottom: 16,
  },
  questionBox: {
    marginBottom: 18,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007aff',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#e3f0ff',
    color: '#2575fc',
    fontWeight: 'bold',
    fontSize: 13,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
    overflow: 'hidden',
  },
  optionBtn: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e3e9f0',
  },
  optionBtnSelected: {
    backgroundColor: '#2575fc',
    borderColor: '#2575fc',
  },
  optionText: {
    color: '#222',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e3e9f0',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2575fc',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  alertCard: {
    backgroundColor: '#fffbe6',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#ffe58f',
  },
  alertText: {
    color: '#888',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: '900',
    backgroundColor: 'transparent',
    color: '#2575fc',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 1,
  },
  completedCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#1f2687',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    maxWidth: 600,
    alignSelf: 'center',
  },
  completedCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2575fc',
    marginBottom: 8,
  },
  completedBadge: {
    backgroundColor: '#2575fc',
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
  },
  completedBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 