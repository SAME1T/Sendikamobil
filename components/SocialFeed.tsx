import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

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

interface SocialFeedProps {
  userId: string;
  userRole: number;
  userName: string;
}

export default function SocialFeed({ userId, userRole, userName }: SocialFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [likingPost, setLikingPost] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!modalVisible) {
      fetchPosts();
    }
  }, [modalVisible]);

  const fetchPosts = async () => {
    try {
      console.log('Paylaşımlar yükleniyor:', { userId, userRole });
      const response = await axios.get(`${API_BASE_URL}/api/posts`, {
        params: { 
          user_id: userId,
          user_role: userRole
        }
      });
      console.log('Gelen paylaşımlar:', response.data);
      setPosts(response.data);
    } catch (error) {
      console.error('Post çekme hatası:', error);
      Alert.alert('Hata', 'Paylaşımlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleLike = async (postId: number) => {
    if (likingPost === postId) return;
    setLikingPost(postId);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/posts/${postId}/like`, {
        user_id: parseInt(userId)
      });
      
      if (response.data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? {
                  ...post,
                  kullanici_begendi: response.data.action === 'liked',
                  begeni_sayisi: response.data.action === 'liked' 
                    ? Number(post.begeni_sayisi) + 1 
                    : Number(post.begeni_sayisi) - 1
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Beğeni hatası:', error);
      Alert.alert('Hata', 'Beğeni işlemi başarısız.');
    } finally {
      setLikingPost(null);
    }
  };

  const handleComment = async (postId: number, commentText: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/posts/${postId}/comment`, {
        user_id: parseInt(userId),
        yorum_metni: commentText
      });
      
      if (response.data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, yorum_sayisi: Number(post.yorum_sayisi) + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Yorum hatası:', error);
      Alert.alert('Hata', 'Yorum eklenemedi.');
    }
  };

  const handlePostCreated = () => {
    setModalVisible(false);
    fetchPosts();
  };

  const handleDeletePost = (postId: number) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paylaşımlar</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#007aff']}
            tintColor="#007aff"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Henüz paylaşım yok</Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={parseInt(userId)}
              onLike={() => handleLike(post.id)}
              onComment={(text: string) => handleComment(post.id, text)}
              onDelete={() => handleDeletePost(post.id)}
            />
          ))
        )}
      </ScrollView>

      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userId={parseInt(userId)}
        userName={userName}
        userRole={userRole}
        onPostCreated={handlePostCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    minHeight: 600, // Minimum yükseklik artırıldı
    width: '100%', // Tam genişlik
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20, // Padding artırıldı
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    minHeight: 70, // Header yüksekliği artırıldı
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007aff',
  },
  createButton: {
    backgroundColor: '#007aff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feed: {
    flex: 1,
    minHeight: 500, // Feed alanı minimum yüksekliği artırıldı
  },
  feedContent: {
    paddingBottom: 30, // Alt padding artırıldı
    paddingHorizontal: 8, // Yatay padding eklendi
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
}); 