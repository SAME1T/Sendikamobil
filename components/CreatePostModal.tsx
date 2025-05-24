import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  Switch,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import * as DocumentPicker from 'expo-document-picker';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  userRole: number;
  onPostCreated: () => void;
}

interface TargetUser {
  id: number;
  ad: string;
  soyad: string;
}

export default function CreatePostModal({ 
  visible, 
  onClose, 
  userId, 
  userName, 
  userRole,
  onPostCreated 
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('dilek');
  const [privacy, setPrivacy] = useState('herkes');
  const [targetUsers, setTargetUsers] = useState<TargetUser[]>([]);
  const [selectedTargetUser, setSelectedTargetUser] = useState<number | null>(null);
  const [showTargetUsers, setShowTargetUsers] = useState(false);
  const [isPersonalPost, setIsPersonalPost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: 'dilek', label: 'Dilek' },
    { value: 'sikayet', label: 'Şikayet' },
    { value: 'istek', label: 'İstek' },
    { value: 'gorus', label: 'Görüş' },
    { value: 'oneri', label: 'Öneri' },
    { value: 'tesekkur', label: 'Teşekkür' }
  ];

  useEffect(() => {
    if (visible) {
      fetchTargetUsers();
    }
  }, [visible]);

  useEffect(() => {
    if (isPersonalPost) {
      setPrivacy('kisisel');
      setShowTargetUsers(true);
    } else {
      setPrivacy('herkes');
      setShowTargetUsers(false);
      setSelectedTargetUser(null);
    }
  }, [isPersonalPost]);

  const fetchTargetUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/posts/target-users`, {
        params: { user_role: userRole }
      });
      setTargetUsers(response.data);
    } catch (error) {
      console.error('Hedef kullanıcılar yüklenemedi:', error);
    }
  };

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedFile(result.assets[0]);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;
    setUploading(true);
    const formData = new FormData();
    formData.append('media', {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType || 'application/octet-stream',
    } as any);
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/post-media`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = await response.json();
      setUploading(false);
      if (data.success) return data.media_path;
      else throw new Error('Yükleme başarısız');
    } catch (e) {
      setUploading(false);
      Alert.alert('Hata', 'Dosya yüklenemedi.');
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Uyarı', 'Lütfen paylaşım içeriği yazın.');
      return;
    }
    if (isPersonalPost && !selectedTargetUser) {
      Alert.alert('Uyarı', 'Lütfen hedef kişiyi seçin.');
      return;
    }
    setLoading(true);
    let media_path = null;
    if (selectedFile) {
      media_path = await uploadFile();
      if (!media_path) {
        setLoading(false);
        return;
      }
    }
    try {
      const payload = {
        user_id: userId,
        icerik: content,
        kategori: category,
        gizlilik: isPersonalPost ? 'kisisel' : 'herkes',
        hedef_kullanici_id: isPersonalPost ? selectedTargetUser : null,
        media_path,
      };
      console.log('Paylaşım gönderiliyor:', payload); // Debug için
      const response = await axios.post(`${API_BASE_URL}/api/posts`, payload);
      if (response.data.success) {
        Alert.alert('Başarılı', 'Paylaşımınız oluşturuldu!');
        resetForm();
        onPostCreated();
      }
    } catch (error) {
      console.error('Paylaşım oluşturma hatası:', error);
      Alert.alert('Hata', 'Paylaşım oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setCategory('dilek');
    setPrivacy('herkes');
    setSelectedTargetUser(null);
    setIsPersonalPost(false);
    setShowTargetUsers(false);
    setSelectedFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={{flex: 1, justifyContent: 'flex-end'}}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{flex: 1, justifyContent: 'flex-end'}}
          >
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color="#007aff" />
                </TouchableOpacity>
                <Text style={styles.title}>Yeni Paylaşım</Text>
                <TouchableOpacity 
                  onPress={handleSubmit}
                  disabled={loading}
                  style={[styles.shareButton, loading && styles.disabledButton]}
                >
                  <Text style={[styles.shareText, loading && styles.disabledText]}>
                    {loading ? 'Gönderiliyor...' : 'Paylaş'}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.content} contentContainerStyle={{paddingBottom: 40}}>
                {/* User Info */}
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.userName}>{userName}</Text>
                </View>

                {/* Content Input */}
                <TextInput
                  style={styles.textInput}
                  placeholder="Ne düşünüyorsunuz?"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  maxLength={1000}
                  textAlignVertical="top"
                />

                {/* Category Selection */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Kategori</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryContainer}>
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat.value}
                          style={[
                            styles.categoryButton,
                            category === cat.value && styles.selectedCategory
                          ]}
                          onPress={() => setCategory(cat.value)}
                        >
                          <Text style={[
                            styles.categoryText,
                            category === cat.value && styles.selectedCategoryText
                          ]}>
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Personal Post Toggle */}
                <View style={styles.section}>
                  <View style={styles.toggleContainer}>
                    <View style={styles.toggleInfo}>
                      <Text style={styles.toggleTitle}>Kişiye Özel Paylaşım</Text>
                      <Text style={styles.toggleDescription}>
                        {isPersonalPost 
                          ? "Bu paylaşım sadece seçilen kişi tarafından görülecek" 
                          : "Paylaşım tüm uygun kullanıcılar tarafından görülecek"
                        }
                      </Text>
                    </View>
                    <Switch
                      value={isPersonalPost}
                      onValueChange={setIsPersonalPost}
                      trackColor={{ false: '#e0e0e0', true: '#007aff' }}
                      thumbColor={isPersonalPost ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                </View>

                {/* Target User Selection */}
                {showTargetUsers && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hedef Kişi Seçin</Text>
                    <ScrollView style={styles.targetUsersList}>
                      {targetUsers.map((user) => (
                        <TouchableOpacity
                          key={user.id}
                          style={[
                            styles.userItem,
                            selectedTargetUser === user.id && styles.selectedUser
                          ]}
                          onPress={() => setSelectedTargetUser(user.id)}
                        >
                          <View style={styles.userAvatar}>
                            <Text style={styles.userAvatarText}>
                              {user.ad.charAt(0)}{user.soyad.charAt(0)}
                            </Text>
                          </View>
                          <Text style={styles.userItemText}>
                            {user.ad} {user.soyad}
                          </Text>
                          {selectedTargetUser === user.id && (
                            <Ionicons name="checkmark-circle" size={20} color="#007aff" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* File Selection */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Fotoğraf/Video</Text>
                  <TouchableOpacity onPress={handlePickFile} style={{ backgroundColor: '#f0f0f0', borderRadius: 8, padding: 12, marginBottom: 4 }}>
                    <Text>{selectedFile ? selectedFile.name : 'Dosya Seç'}</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 12, color: '#888' }}>Maksimum dosya boyutu: 10MB. Desteklenen formatlar: JPG, PNG, GIF, MP4</Text>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: '95%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  shareText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  textInput: {
    fontSize: 16,
    minHeight: 100,
    maxHeight: 200,
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#007aff',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  targetUsersList: {
    maxHeight: 200,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  selectedUser: {
    backgroundColor: '#e6f3ff',
    borderColor: '#007aff',
    borderWidth: 1,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
}); 