import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import { PieChart } from 'react-native-chart-kit';

export default function AnketYonetimi() {
  const router = useRouter();
  const params = useLocalSearchParams ? useLocalSearchParams() : {};
  const role = Number(params.role) || 2;
  const userId = params.user_id;
  const [questions, setQuestions] = useState<Array<{
    questionText: string;
    type: 'multiple' | 'open';
    options: string[];
  }>>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalView, setModalView] = useState<'questions' | 'results'>('questions');
  const [solvedSurveyIds, setSolvedSurveyIds] = useState<number[]>([]);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    setSolvedSurveyIds([]);
    setSurveys([]);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/surveys`);
      console.log('APIden dönen anketler:', res.data);
      setSurveys(res.data);
      const solved: number[] = [];
      for (const survey of res.data) {
        const ansRes = await axios.get(`${API_BASE_URL}/api/surveys/${survey.id}/answers`);
        console.log('Anket cevapları:', ansRes.data, 'survey_id:', survey.id);
        if (ansRes.data && Array.isArray(ansRes.data) && ansRes.data.some((a: any) => Number(a.user_id) === Number(userId))) {
          solved.push(Number(survey.id));
        }
      }
      setSolvedSurveyIds(solved);
    } catch (err) {
      Alert.alert('Hata', 'Anketler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      type: 'multiple',
      options: ['', '']
    }]);
  };

  const updateQuestion = (index: number, field: 'questionText' | 'type' | 'options', value: any) => {
    const newQuestions = [...questions];
    if (field === 'options') {
      newQuestions[index].options = value;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const saveSurvey = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Lütfen anket başlığını giriniz.');
      return;
    }
    if (questions.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir soru ekleyiniz.');
      return;
    }
    const payload = {
      title,
      description,
      questions: questions.map(q => ({
        questionText: q.questionText,
        type: q.type,
        options: q.type === 'multiple' ? q.options : []
      }))
    };
    console.log('ANKET KAYIT PAYLOAD:', payload);
    try {
      await axios.post(`${API_BASE_URL}/api/surveys`, payload);
      Alert.alert('Başarılı', 'Anket başarıyla kaydedildi!');
      setTitle('');
      setDescription('');
      setQuestions([]);
      fetchSurveys();
    } catch (err) {
      Alert.alert('Hata', 'Anket kaydedilemedi.');
    }
  };

  const openSurveyDetails = async (survey: any) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/surveys/${survey.id}`);
      setSelectedSurvey(res.data);
      setModalView('questions');
      setModalVisible(true);
    } catch (err) {
      Alert.alert('Hata', 'Anket detayları yüklenemedi.');
    }
  };

  const openSurveyResults = async (survey: any) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/surveys/${survey.id}/answers`);
      setSelectedSurvey(survey);
      setAnswers(res.data);
      setModalView('results');
      setModalVisible(true);
    } catch (err) {
      Alert.alert('Hata', 'Cevaplar yüklenemedi.');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSurvey(null);
    setAnswers([]);
    setModalView('questions');
  };

  // Grafik için renkler
  const chartColors = [
    '#2575fc', '#6a11cb', '#43e97b', '#f8ffae', '#ffb347', '#ff6961', '#a1c4fd', '#c2e9fb', '#e0eafc'
  ];

  // Güvenli seçenek ayrıştırıcı
  function parseOptions(options: any): string[] {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (role === 2) {
              router.push({ pathname: '/sendikaci-home', params: { user_id: userId, ad: params.ad, soyad: params.soyad, role } });
            } else {
              router.push({ pathname: '/isci-home', params: { user_id: userId, ad: params.ad, soyad: params.soyad, role } });
            }
          }}
        >
          <Ionicons name="home-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anket Yönetimi</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Anket Oluşturma Formu */}
        <View style={styles.surveyForm}>
          <Text style={styles.formTitle}>Anket Oluştur</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Anket Başlığı</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Anket başlığını yazın..."
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Açıklama (isteğe bağlı)"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </View>
          {questions.map((question, index) => (
            <View key={index} style={styles.questionCard}>
              <Text style={styles.questionNumber}>Soru {index + 1}</Text>
              <TextInput
                style={styles.input}
                value={question.questionText}
                onChangeText={(text) => updateQuestion(index, 'questionText', text)}
                placeholder="Sorunuzu yazın..."
                placeholderTextColor="#666"
              />
              <View style={styles.questionTypeContainer}>
                <Text style={styles.label}>Soru Tipi</Text>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      question.type === 'multiple' && styles.typeButtonActive
                    ]}
                    onPress={() => updateQuestion(index, 'type', 'multiple')}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      question.type === 'multiple' && styles.typeButtonTextActive
                    ]}>Çoktan Seçmeli</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      question.type === 'open' && styles.typeButtonActive
                    ]}
                    onPress={() => updateQuestion(index, 'type', 'open')}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      question.type === 'open' && styles.typeButtonTextActive
                    ]}>Açık Uçlu</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {question.type === 'multiple' && (
                <View style={styles.optionsContainer}>
                  <Text style={styles.label}>Seçenekler</Text>
                  {question.options.map((option, optionIndex) => (
                    <TextInput
                      key={optionIndex}
                      style={styles.input}
                      value={option}
                      onChangeText={(text) => {
                        const newOptions = [...question.options];
                        newOptions[optionIndex] = text;
                        updateQuestion(index, 'options', newOptions);
                      }}
                      placeholder={`Seçenek ${optionIndex + 1}`}
                      placeholderTextColor="#666"
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.addOptionButton}
                    onPress={() => addOption(index)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                    <Text style={styles.addOptionText}>Seçenek Ekle</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                style={styles.removeQuestionButton}
                onPress={() => removeQuestion(index)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={styles.removeQuestionText}>Soruyu Sil</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.addQuestionButton}
              onPress={addQuestion}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.addQuestionText}>Soru Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveSurvey}
            >
              <Ionicons name="save-outline" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Anket Listesi */}
        <Text style={styles.listTitle}>Oluşturduğunuz Anketler</Text>
        {loading ? (
          <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>Yükleniyor...</Text>
        ) : (
          surveys.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color="#FFD700" />
              <Text style={styles.emptyText}>Henüz anket bulunmamaktadır.</Text>
              <Text style={styles.emptySubText}>
                Yeni bir anket oluşturmak için yukarıdaki formu kullanın.
              </Text>
            </View>
          ) : (
            surveys.map((survey) => (
              <View key={survey.id} style={styles.surveyListCard}>
                <TouchableOpacity
                  style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
                  onPress={async () => {
                    Alert.alert('Onay', 'Bu anketi silmek istediğinize emin misiniz?', [
                      { text: 'İptal', style: 'cancel' },
                      { text: 'Sil', style: 'destructive', onPress: async () => {
                        try {
                          await axios.delete(`${API_BASE_URL}/api/surveys/${survey.id}`);
                          Alert.alert('Başarılı', 'Anket başarıyla silindi.');
                          fetchSurveys();
                        } catch (err) {
                          const errorMessage = (err && typeof err === 'object' && 'response' in err && (err as any).response?.data?.message)
                            ? (err as any).response.data.message
                            : 'Anket silinemedi.';
                          Alert.alert('Hata', errorMessage);
                        }
                      }}
                    ]);
                  }}
                >
                  <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => openSurveyDetails(survey)}
                >
                  <Text style={styles.surveyListCardTitle}><Ionicons name="list-circle" size={18} color="#2575fc" /> {survey.title}</Text>
                  <Text style={styles.surveyListCardDesc}>{survey.description}</Text>
                  <Text style={styles.surveyListCardDate}>ID: {survey.id}</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        )}
      </ScrollView>
      {/* Modal: Anket Detayları ve Sonuçları */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.closeModalBtn} onPress={closeModal}>
                <Ionicons name="close" size={28} color="#2575fc" />
              </TouchableOpacity>
              <View style={styles.modalTabs}>
                <TouchableOpacity
                  style={[styles.modalTab, modalView === 'questions' && styles.modalTabActive]}
                  onPress={() => setModalView('questions')}
                >
                  <Text style={[styles.modalTabText, modalView === 'questions' && styles.modalTabTextActive]}>Sorular</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalTab, modalView === 'results' && styles.modalTabActive]}
                  onPress={() => selectedSurvey && openSurveyResults(selectedSurvey)}
                >
                  <Text style={[styles.modalTabText, modalView === 'results' && styles.modalTabTextActive]}>Sonuçlar</Text>
                </TouchableOpacity>
              </View>
            </View>
            {selectedSurvey && (
              <ScrollView>
                <Text style={styles.modalTitle}>{selectedSurvey.title}</Text>
                {modalView === 'questions' ? (
                  // Sorular Görünümü
                  <>
                    <Text style={styles.modalDescription}>{selectedSurvey.description}</Text>
                    {selectedSurvey.questions.map((q: any, idx: number) => (
                      <View key={q.id} style={styles.modalQuestionCard}>
                        <Text style={styles.modalQuestion}>{idx + 1}. {q.question_text}</Text>
                        <Text style={styles.modalQuestionType}>
                          <Ionicons name={q.type === 'multiple' ? 'list' : 'create'} size={16} color="#666" />
                          {q.type === 'multiple' ? ' Çoktan Seçmeli' : ' Açık Uçlu'}
                        </Text>
                        {q.type === 'multiple' && (
                          <View style={styles.modalOptions}>
                            {parseOptions(q.options).map((opt: string, i: number) => (
                              <Text key={i} style={styles.modalOption}>• {opt}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </>
                ) : (
                  // Sonuçlar Görünümü
                  <ScrollView>
                    <Text style={styles.modalTitle}>{selectedSurvey.title} - Sonuçlar</Text>
                    {selectedSurvey.questions.map((q: any, idx: number) => {
                      if (q.type === 'multiple') {
                        const options = parseOptions(q.options);
                        const counts = options.map((opt: string) =>
                          answers.filter((a) => a.question_id === q.id && a.answer === opt).length
                        );
                        const total = counts.reduce((a: number, b: number) => a + b, 0);
                        const chartData = options.map((opt: string, i: number) => ({
                          name: opt,
                          population: counts[i],
                          color: chartColors[i % chartColors.length],
                          legendFontColor: '#222',
                          legendFontSize: 14,
                        })).filter((d: any) => d.population > 0);
                        return (
                          <View key={q.id} style={styles.resultCard}>
                            <Text style={styles.modalQuestion}>{idx + 1}. {q.question_text}</Text>
                            {chartData.length > 0 ? (
                              <PieChart
                                data={chartData}
                                width={Math.min(Dimensions.get('window').width - 64, 400)}
                                height={180}
                                chartConfig={{
                                  color: () => '#2575fc',
                                  labelColor: () => '#222',
                                  backgroundColor: '#fff',
                                  backgroundGradientFrom: '#fff',
                                  backgroundGradientTo: '#fff',
                                }}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="16"
                                absolute
                              />
                            ) : (
                              <Text style={{ color: '#888', textAlign: 'center', marginTop: 10 }}>Henüz cevap yok.</Text>
                            )}
                            {options.map((opt: string, i: number) => {
                              const percent = total > 0 ? ((counts[i] / total) * 100).toFixed(1) : '0.0';
                              return (
                                <Text key={i} style={styles.optionPercent}>{opt}: %{percent}</Text>
                              );
                            })}
                            <Text style={styles.modalTotal}>Toplam Cevap: {total}</Text>
                          </View>
                        );
                      } else {
                        // Açık uçlu cevaplar
                        const openAnswers = answers.filter((a) => a.question_id === q.id && a.answer);
                        return (
                          <View key={q.id} style={styles.resultCard}>
                            <Text style={styles.modalQuestion}>{idx + 1}. {q.question_text}</Text>
                            {openAnswers.length === 0 ? (
                              <Text style={{ color: '#888', textAlign: 'center', marginTop: 10 }}>Henüz cevap yok.</Text>
                            ) : (
                              openAnswers.map((a, i) => (
                                <Text key={i} style={styles.openAnswerText}>- {a.answer}</Text>
                              ))
                            )}
                            <Text style={styles.modalTotal}>Toplam Cevap: {openAnswers.length}</Text>
                          </View>
                        );
                      }
                    })}
                  </ScrollView>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2942',
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
  },
  surveyForm: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2575fc',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e3e9f0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  questionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2575fc',
    marginBottom: 12,
  },
  questionTypeContainer: {
    marginTop: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3e9f0',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#2575fc',
    borderColor: '#2575fc',
  },
  typeButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  optionsContainer: {
    marginTop: 12,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
  },
  addOptionText: {
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  removeQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 12,
  },
  removeQuestionText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  addQuestionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
  },
  addQuestionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  surveyList: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2575fc',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#E2E7E8',
    marginTop: 8,
    textAlign: 'center',
  },
  surveyListCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  surveyListCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2575fc',
    marginBottom: 8,
  },
  surveyListCardDesc: {
    color: '#666',
  },
  surveyListCardDate: {
    color: '#888',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  closeModalBtn: {
    alignItems: 'flex-end',
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2575fc',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTabs: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  modalTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalTabActive: {
    backgroundColor: '#2575fc',
  },
  modalTabText: {
    color: '#666',
    fontWeight: '600',
  },
  modalTabTextActive: {
    color: '#fff',
  },
  modalDescription: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalQuestionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalQuestionType: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptions: {
    marginTop: 12,
    paddingLeft: 8,
  },
  modalOption: {
    color: '#444',
    fontSize: 15,
    marginBottom: 6,
  },
  modalQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  modalTotal: {
    color: '#888',
    marginTop: 8,
  },
  openAnswerText: {
    color: '#666',
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  optionPercent: {
    color: '#2575fc',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 4,
    marginLeft: 8,
  },
}); 