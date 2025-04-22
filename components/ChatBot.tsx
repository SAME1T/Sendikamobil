import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface QuickReply {
  id: number;
  text: string;
  action: string;
}

const quickReplies: QuickReply[] = [
  { id: 1, text: 'İşçi Hakları', action: 'worker_rights' },
  { id: 2, text: 'Sendika Yönetmelikleri', action: 'union_regulations' },
  { id: 3, text: 'Şikayet/Talep', action: 'complaint' },
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Merhaba! Size nasıl yardımcı olabilirim?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const positionAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      const height = event.endCoordinates.height;
      setKeyboardHeight(height);
      Animated.spring(positionAnim, {
        toValue: height + 20,
        useNativeDriver: false,
        friction: 8,
      }).start();
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
      Animated.spring(positionAnim, {
        toValue: 20,
        useNativeDriver: false,
        friction: 8,
      }).start();
    };

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardWillShow
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardWillHide
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isChatOpen]);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Animasyonlu scroll
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Bot yanıtı
    setTimeout(() => {
      const botResponse = getBotResponse(inputText.toLowerCase());
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      }]);
      
      // Bot yanıtı sonrası scroll
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    if (input.includes('işçi hakları') || input.includes('hak')) {
      return 'İşçi hakları konusunda size yardımcı olabilirim. İş Kanunu\'na göre temel haklarınız şunlardır: \n\n1. Adil ücret hakkı\n2. Yıllık izin hakkı\n3. Kıdem tazminatı hakkı\n4. Sendika üyeliği hakkı';
    } else if (input.includes('sendika') || input.includes('üyelik')) {
      return 'Sendika üyeliği ve yönetmelikler hakkında bilgi almak için sendika temsilcinizle görüşebilir veya web sitemizin "Üyelik" bölümünü ziyaret edebilirsiniz.';
    } else if (input.includes('şikayet') || input.includes('talep')) {
      return 'Şikayet ve taleplerinizi değerlendirmek için lütfen detaylı bir açıklama yapın. En kısa sürede size geri dönüş yapılacaktır.';
    }
    return 'Üzgünüm, sorunuzu tam olarak anlayamadım. Lütfen daha açık bir şekilde belirtir misiniz?';
  };

  const handleQuickReply = (action: string) => {
    let response = '';
    switch (action) {
      case 'worker_rights':
        response = 'İşçi hakları hakkında bilgi almak istiyorum';
        break;
      case 'union_regulations':
        response = 'Sendika yönetmelikleri hakkında bilgi almak istiyorum';
        break;
      case 'complaint':
        response = 'Bir şikayet/talebim var';
        break;
    }
    setInputText(response);
    handleSend();
  };

  return (
    <Animated.View style={[
      styles.floatingButton,
      { bottom: positionAnim }
    ]}>
      {!isChatOpen ? (
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => setIsChatOpen(true)}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="#FFD700" />
        </TouchableOpacity>
      ) : (
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>Sendika Yardımcısı</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsChatOpen(false)}
            >
              <Ionicons name="chevron-down" size={24} color="#FFD700" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => (
              <Animated.View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.sender === 'user' ? styles.userMessage : styles.botMessage,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.sender === 'bot' ? styles.botMessageText : null
                ]}>{message.text}</Text>
                <Text style={[
                  styles.timestamp,
                  message.sender === 'bot' ? styles.botTimestamp : null
                ]}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Animated.View>
            ))}
          </ScrollView>

          <View style={styles.quickRepliesContainer}>
            {quickReplies.map((reply) => (
              <TouchableOpacity
                key={reply.id}
                style={styles.quickReplyButton}
                onPress={() => handleQuickReply(reply.action)}
              >
                <Text style={styles.quickReplyText}>{reply.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Mesajınızı yazın..."
              placeholderTextColor="#8B9CB0"
              onSubmitEditing={handleSend}
              multiline
              numberOfLines={1}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                { opacity: inputText.trim() ? 1 : 0.5 }
              ]} 
              onPress={handleSend}
            >
              <Ionicons name="send" size={24} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    left: 20,
    maxWidth: 400,
    alignSelf: 'center',
  },
  chatButton: {
    backgroundColor: '#1a2942',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    height: 400,
    backgroundColor: '#243B55',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a2942',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  headerText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
    marginLeft: 10,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1a2942',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#0d1521',
  },
  messageText: {
    color: '#FFD700',
    fontSize: 14,
  },
  botMessageText: {
    color: '#E2E7E8',
  },
  timestamp: {
    fontSize: 10,
    color: '#E2E7E8',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  botTimestamp: {
    color: '#E2E7E8',
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  quickReplyButton: {
    backgroundColor: '#1a2942',
    padding: 8,
    borderRadius: 15,
    margin: 5,
  },
  quickReplyText: {
    color: '#FFD700',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a2942',
    backgroundColor: '#243B55',
  },
  input: {
    flex: 1,
    backgroundColor: '#0d1521',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    color: '#E2E7E8',
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: '#1a2942',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 