import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface SurveyQuestion {
  id: number;
  question: string;
  type: 'text' | 'choice';
  choices?: string[];
}

export default function SurveyScreen() {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const router = useRouter();

  const addQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: questions.length + 1,
      question: '',
      type: 'text',
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, question: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, question } : q
    ));
  };

  const toggleQuestionType = (id: number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { 
        ...q, 
        type: q.type === 'text' ? 'choice' : 'text',
        choices: q.type === 'text' ? [''] : undefined
      } : q
    ));
  };

  const addChoice = (questionId: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? {
        ...q,
        choices: [...(q.choices || []), '']
      } : q
    ));
  };

  const updateChoice = (questionId: number, choiceIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? {
        ...q,
        choices: q.choices?.map((c, i) => i === choiceIndex ? value : c)
      } : q
    ));
  };

  const removeChoice = (questionId: number, choiceIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? {
        ...q,
        choices: q.choices?.filter((_, i) => i !== choiceIndex)
      } : q
    ));
  };

  const saveSurvey = () => {
    if (!title.trim()) {
      Alert.alert('Uyarı', 'Lütfen anket başlığını giriniz.');
      return;
    }
    if (questions.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir soru ekleyiniz.');
      return;
    }
    if (questions.some(q => !q.question.trim())) {
      Alert.alert('Uyarı', 'Lütfen tüm soruları doldurunuz.');
      return;
    }
    if (questions.some(q => q.type === 'choice' && (!q.choices || q.choices.length < 2))) {
      Alert.alert('Uyarı', 'Çoktan seçmeli sorular için en az 2 seçenek giriniz.');
      return;
    }

    // TODO: Veritabanı entegrasyonu eklenecek
    Alert.alert('Başarılı', 'Anket kaydedildi!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/surveys')}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.header}>Anket Oluştur</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.label}>Anket Başlığı</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Anket başlığını yazın..."
            placeholderTextColor="#666"
          />
        </View>

        {questions.map((question, index) => (
          <View key={question.id} style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>Soru {index + 1}</Text>
              <TouchableOpacity
                onPress={() => removeQuestion(question.id)}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.questionInput}
              value={question.question}
              onChangeText={(text) => updateQuestion(question.id, text)}
              placeholder="Soruyu yazın..."
              placeholderTextColor="#666"
              multiline
            />

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  question.type === 'text' && styles.selectedType
                ]}
                onPress={() => toggleQuestionType(question.id)}
              >
                <Text style={[
                  styles.typeText,
                  question.type === 'text' && styles.selectedTypeText
                ]}>Metin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  question.type === 'choice' && styles.selectedType
                ]}
                onPress={() => toggleQuestionType(question.id)}
              >
                <Text style={[
                  styles.typeText,
                  question.type === 'choice' && styles.selectedTypeText
                ]}>Çoktan Seçmeli</Text>
              </TouchableOpacity>
            </View>

            {question.type === 'choice' && (
              <View style={styles.choicesContainer}>
                {question.choices?.map((choice, choiceIndex) => (
                  <View key={choiceIndex} style={styles.choiceRow}>
                    <TextInput
                      style={styles.choiceInput}
                      value={choice}
                      onChangeText={(text) => updateChoice(question.id, choiceIndex, text)}
                      placeholder={`Seçenek ${choiceIndex + 1}`}
                      placeholderTextColor="#666"
                    />
                    <TouchableOpacity
                      onPress={() => removeChoice(question.id, choiceIndex)}
                      style={styles.removeChoiceButton}
                    >
                      <Ionicons name="close-circle-outline" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addChoiceButton}
                  onPress={() => addChoice(question.id)}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
                  <Text style={styles.addChoiceText}>Seçenek Ekle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addQuestionButton}
          onPress={addQuestion}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addQuestionText}>Yeni Soru Ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSurvey}
        >
          <Ionicons name="save-outline" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Anketi Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginRight: 40, // To center the text accounting for the back button
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  titleContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#E2E7E8',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#1a2942',
    borderRadius: 8,
    padding: 12,
    color: '#E2E7E8',
    fontSize: 16,
  },
  questionContainer: {
    backgroundColor: '#1a2942',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  removeButton: {
    padding: 4,
  },
  questionInput: {
    backgroundColor: '#0d1521',
    borderRadius: 8,
    padding: 12,
    color: '#E2E7E8',
    fontSize: 16,
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#0d1521',
  },
  selectedType: {
    backgroundColor: '#4CAF50',
  },
  typeText: {
    color: '#E2E7E8',
    fontSize: 14,
  },
  selectedTypeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  choicesContainer: {
    marginTop: 12,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  choiceInput: {
    flex: 1,
    backgroundColor: '#0d1521',
    borderRadius: 8,
    padding: 12,
    color: '#E2E7E8',
    marginRight: 8,
  },
  removeChoiceButton: {
    padding: 4,
  },
  addChoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#0d1521',
  },
  addChoiceText: {
    color: '#4CAF50',
    marginLeft: 8,
    fontSize: 14,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  addQuestionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e88e5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
}); 