import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Post {
  id: number;
  user_id: number;
  icerik: string;
  kategori: string;
  gizlilik: string;
  media_path?: string;
  hedef_kullanici_id?: number;
  created_at: string;
  ad: string;
  soyad: string;
  rol: number;
  begeni_sayisi: number;
  yorum_sayisi: number;
  kullanici_begendi: boolean;
}

interface PostCardProps {
  post: Post;
  currentUserId: number;
  onLike: () => void;
  onComment: (text: string) => void;
  onDelete?: () => void;
}

export default function PostCard({ post, currentUserId, onLike, onComment, onDelete }: PostCardProps) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (commentsVisible) fetchComments();
  }, [commentsVisible]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/posts/${post.id}/comments`);
      setComments(res.data);
    } catch (e) {
      setComments([]);
    }
    setLoadingComments(false);
  };

  const handleDeletePost = async () => {
    Alert.alert('Paylaşımı Sil', 'Bu paylaşımı silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/api/posts/${post.id}`, { data: { user_id: currentUserId } });
          Alert.alert('Silindi', 'Paylaşım silindi.');
          if (typeof onDelete === 'function') onDelete();
        } catch (e) {
          Alert.alert('Hata', 'Paylaşım silinemedi.');
        }
      }}
    ]);
  };

  const handleDeleteComment = async (commentId: number) => {
    Alert.alert('Yorumu Sil', 'Bu yorumu silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/api/posts/comment/${commentId}`, { data: { user_id: currentUserId } });
          fetchComments();
        } catch (e) {
          Alert.alert('Hata', 'Yorum silinemedi.');
        }
      }}
    ]);
  };

  const handleCommentLike = async (commentId: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/posts/comment/${commentId}/like`, {
        user_id: currentUserId
      });
      
      if (response.data.success) {
        // Yorumları yenile
        fetchComments();
      }
    } catch (error) {
      console.error('Yorum beğeni hatası:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText('');
      setShowCommentInput(false);
      if (commentsVisible) {
        setTimeout(() => fetchComments(), 1000);
      }
    } else {
      Alert.alert('Uyarı', 'Lütfen bir yorum yazın.');
    }
  };

  const getRoleText = (role: number) => {
    return role === 2 ? 'Sendikacı' : 'İşçi';
  };

  return (
    <View style={styles.container}>
      {/* Kullanıcı Bilgileri */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.ad.charAt(0)}{post.soyad.charAt(0)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.ad} {post.soyad}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.roleText}>{getRoleText(post.rol)}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.timeText}>{formatDate(post.created_at)}</Text>
            {post.gizlilik === 'kisisel' && (
              <>
                <Text style={styles.dot}>•</Text>
                <View style={styles.privateBadge}>
                  <Ionicons name="lock-closed" size={12} color="#ff9500" />
                  <Text style={styles.privacyText}>Kişiye Özel</Text>
                </View>
              </>
            )}
          </View>
        </View>
        {post.kategori && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{post.kategori}</Text>
          </View>
        )}
        {post.user_id === currentUserId && (
          <TouchableOpacity onPress={handleDeletePost} style={{ marginLeft: 8 }}>
            <Ionicons name="trash" size={20} color="#ff3b30" />
          </TouchableOpacity>
        )}
      </View>

      {/* İçerik */}
      <View style={styles.content}>
        <Text style={styles.contentText}>{post.icerik}</Text>
        {post.media_path && (
          <Image 
            source={{ uri: post.media_path.startsWith('http') ? post.media_path : `${API_BASE_URL}${post.media_path}` }} 
            style={styles.mediaImage} 
            onError={(error) => console.error('Resim yüklenme hatası:', error)}
          />
        )}
      </View>

      {/* Beğeni ve Yorum Sayıları */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {post.begeni_sayisi} beğeni • {post.yorum_sayisi} yorum
        </Text>
      </View>

      {/* Aksiyon Butonları */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, post.kullanici_begendi && styles.likedButton]}
          onPress={onLike}
        >
          <Ionicons 
            name={post.kullanici_begendi ? "heart" : "heart-outline"} 
            size={20} 
            color={post.kullanici_begendi ? "#ff3b30" : "#666"} 
          />
          <Text style={[styles.actionText, post.kullanici_begendi && styles.likedText]}>
            Beğen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowCommentInput(!showCommentInput)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Yorum</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setCommentsVisible(!commentsVisible)}
        >
          <Ionicons name="chevron-down" size={20} color="#666" />
          <Text style={styles.actionText}>Yorumları Göster</Text>
        </TouchableOpacity>
      </View>

      {/* Yorum Input */}
      {showCommentInput && (
        <View style={styles.commentInput}>
          <TextInput
            style={styles.textInput}
            placeholder="Yorum yazın..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleComment}>
            <Ionicons name="send" size={20} color="#007aff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Yorumlar Listesi */}
      {commentsVisible && (
        <View style={{ marginTop: 8 }}>
          {loadingComments ? (
            <Text>Yorumlar yükleniyor...</Text>
          ) : comments.length === 0 ? (
            <Text>Henüz yorum yok.</Text>
          ) : (
            <ScrollView style={{ maxHeight: 180 }}>
              {comments.map((c) => (
                <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: '#f8f8f8', borderRadius: 8, padding: 8 }}>
                  <View style={{ backgroundColor: '#007aff', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{c.ad.charAt(0)}{c.soyad.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', color: '#222' }}>{c.ad} {c.soyad}</Text>
                    <Text style={{ color: '#444' }}>{c.icerik}</Text>
                  </View>
                  
                  {/* Yorum beğeni butonu */}
                  <TouchableOpacity 
                    onPress={() => handleCommentLike(c.id)} 
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 6 }}
                  >
                    <Ionicons name="heart-outline" size={14} color="#ff3b30" />
                    {c.begeni_sayisi > 0 && (
                      <Text style={{ fontSize: 12, color: '#ff3b30', marginLeft: 2 }}>{c.begeni_sayisi}</Text>
                    )}
                  </TouchableOpacity>
                  
                  {/* Yorum sil butonu */}
                  {c.ad && c.soyad && c.user_id === currentUserId && (
                    <TouchableOpacity onPress={() => handleDeleteComment(c.id)} style={{ marginLeft: 6 }}>
                      <Ionicons name="trash" size={18} color="#ff3b30" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginVertical: 4,
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  roleText: {
    fontSize: 12,
    color: '#007aff',
    fontWeight: '600',
  },
  dot: {
    color: '#999',
    marginHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  privacyText: {
    fontSize: 12,
    color: '#ff9500',
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  content: {
    marginBottom: 12,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#333',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  stats: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 13,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  likedButton: {
    backgroundColor: '#ffe6e6',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  likedText: {
    color: '#ff3b30',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 80,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
  },
  privateBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 