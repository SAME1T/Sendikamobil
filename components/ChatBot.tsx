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
  { id: 1, text: '🔒 İşçi Hakları', action: 'worker_rights' },
  { id: 2, text: '🏢 Sendika Bilgileri', action: 'union_info' },
  { id: 3, text: '📝 Şikayet/Talep', action: 'complaint' },
  { id: 4, text: '💰 Bordro/Maaş', action: 'payroll' },
  { id: 5, text: '🏖️ İzin Hakları', action: 'leave_rights' },
  { id: 6, text: '⚠️ İş Güvenliği', action: 'safety' },
  { id: 7, text: '📚 Eğitim/Kurslar', action: 'education' },
  { id: 8, text: '🤝 Yardım', action: 'help' },
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '👋 Merhaba! Sendika Yardım Botuna hoş geldiniz!\n\n🎯 Size şu konularda yardımcı olabilirim:\n• İşçi hakları ve mevzuat\n• Sendika üyeliği bilgileri\n• Bordro ve maaş sorguları\n• İzin hakları\n• İş güvenliği\n• Eğitim programları\n• Şikayet ve talepler\n\n💬 Aşağıdaki butonları kullanabilir veya doğrudan soru sorabilirsiniz!',
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
    const lowerInput = input.toLowerCase();
    
    // İşçi hakları ile ilgili sorular
    if (lowerInput.includes('işçi hakları') || lowerInput.includes('hak') || lowerInput.includes('çalışan hakları')) {
      return '🔒 İşçi hakları konusunda size yardımcı olabilirim:\n\n📋 Temel Haklarınız:\n• Adil ücret alma hakkı\n• Yıllık izin hakkı (14-26 gün)\n• Kıdem tazminatı hakkı\n• Sendika üyeliği hakkı\n• İş güvenliği hakkı\n• Fazla mesai ücreti hakkı\n\n❓ Hangi konuda detay istiyorsunuz?';
    }
    
    // Sendika ile ilgili sorular
    else if (lowerInput.includes('sendika') || lowerInput.includes('üyelik') || lowerInput.includes('aidat')) {
      return '🏢 Sendika bilgileri:\n\n✅ Üyelik Avantajları:\n• Hukuki destek\n• Toplu sözleşme hakları\n• Eğitim programları\n• Sosyal etkinlikler\n\n💰 Aidat: Maaşınızın %1\'i\n📞 Üyelik için: 0212 XXX XX XX\n\n🔗 Daha fazla bilgi için "İletişim" menüsünü ziyaret edin.';
    }
    
    // Şikayet ve talepler
    else if (lowerInput.includes('şikayet') || lowerInput.includes('talep') || lowerInput.includes('problem')) {
      return '📝 Şikayet/Talep Süreci:\n\n1️⃣ Detaylı açıklama yapın\n2️⃣ Kanıt belgelerinizi hazırlayın\n3️⃣ Sendika temsilcinize başvurun\n4️⃣ 5 iş günü içinde yanıt alın\n\n📧 E-posta: sikayet@sendika.com\n📞 Acil durum: 0212 XXX XX XX\n\n⚡ Hangi konuda şikayetiniz var?';
    }
    
    // Bordro ve maaş
    else if (lowerInput.includes('bordro') || lowerInput.includes('maaş') || lowerInput.includes('ücret')) {
      return '💰 Bordro ve Maaş Bilgileri:\n\n📊 Bordro sorgulama: "Bordrolarım" menüsü\n💳 Maaş hesaplama araçları mevcut\n📈 Zam oranları ve toplu sözleşme bilgileri\n\n❓ Maaşınızla ilgili sorun mu var?\n📞 Muhasebe: 0212 XXX XX XX';
    }
    
    // İzin ve tatil
    else if (lowerInput.includes('izin') || lowerInput.includes('tatil') || lowerInput.includes('rapor')) {
      return '🏖️ İzin ve Tatil Hakları:\n\n📅 Yıllık İzin:\n• 1-5 yıl: 14 gün\n• 5-15 yıl: 20 gün\n• 15+ yıl: 26 gün\n\n🏥 Diğer İzinler:\n• Hastalık izni\n• Doğum izni\n• Evlilik izni\n• Ölüm izni\n\n📋 İzin başvurusu için yöneticinize başvurun.';
    }
    
    // İş güvenliği
    else if (lowerInput.includes('güvenlik') || lowerInput.includes('kaza') || lowerInput.includes('iş kazası')) {
      return '⚠️ İş Güvenliği:\n\n🛡️ Güvenlik Önlemleri:\n• Koruyucu ekipman kullanımı\n• Güvenlik eğitimleri\n• Risk değerlendirmesi\n\n🚨 Kaza Durumunda:\n1. Derhal sağlık ekibini arayın\n2. Güvenlik sorumlusunu bilgilendirin\n3. Kaza tutanağı tutun\n\n📞 Acil: 112\n📞 İş güvenliği: 0212 XXX XX XX';
    }
    
    // Eğitim ve kurslar
    else if (lowerInput.includes('eğitim') || lowerInput.includes('kurs') || lowerInput.includes('sertifika')) {
      return '📚 Eğitim Programları:\n\n🎓 Mevcut Kurslar:\n• Mesleki gelişim eğitimleri\n• İş güvenliği sertifikaları\n• Bilgisayar kursları\n• Dil eğitimleri\n\n📅 Kayıt: "Etkinlikler" menüsünden\n💰 Ücretsiz üye eğitimleri\n\n📞 Eğitim koordinatörü: 0212 XXX XX XX';
    }
    
    // Genel yardım
    else if (lowerInput.includes('yardım') || lowerInput.includes('help') || lowerInput.includes('nasıl')) {
      return '🤝 Size nasıl yardımcı olabilirim?\n\n💬 Sorularınız için:\n• İşçi hakları\n• Sendika üyeliği\n• Bordro/maaş\n• İzin hakları\n• İş güvenliği\n• Eğitim programları\n• Şikayet/talep\n\n⚡ Hızlı erişim için aşağıdaki butonları kullanabilirsiniz!';
    }
    
    // Selamlama
    else if (lowerInput.includes('merhaba') || lowerInput.includes('selam') || lowerInput.includes('iyi günler')) {
      return '👋 Merhaba! Sendika Yardım Botuna hoş geldiniz!\n\n🎯 Size şu konularda yardımcı olabilirim:\n• İşçi hakları ve mevzuat\n• Sendika üyeliği\n• Şikayet ve talepler\n• Bordro sorguları\n• Eğitim programları\n\n💬 Hangi konuda yardıma ihtiyacınız var?';
    }
    
    // Teşekkür
    else if (lowerInput.includes('teşekkür') || lowerInput.includes('sağol') || lowerInput.includes('thanks')) {
      return '😊 Rica ederim! Size yardımcı olabildiğim için mutluyum.\n\n🔄 Başka sorularınız varsa çekinmeden sorabilirsiniz.\n📞 Acil durumlar için: 0212 XXX XX XX\n\n💪 Birlikte daha güçlüyüz!';
    }
    
    // Varsayılan yanıt
    else {
      return '🤔 Sorunuzu tam olarak anlayamadım.\n\n💡 Şu konularda yardımcı olabilirim:\n• İşçi hakları\n• Sendika üyeliği\n• Bordro/maaş\n• İzin hakları\n• Şikayet/talep\n\n📝 Lütfen daha açık bir şekilde belirtir misiniz?\n⚡ Veya hızlı erişim butonlarını kullanabilirsiniz.';
    }
  };

  const handleQuickReply = (action: string) => {
    let response = '';
    switch (action) {
      case 'worker_rights':
        response = 'İşçi hakları hakkında bilgi almak istiyorum';
        break;
      case 'union_info':
        response = 'Sendika üyeliği ve aidat bilgileri';
        break;
      case 'complaint':
        response = 'Bir şikayet/talebim var';
        break;
      case 'payroll':
        response = 'Bordro ve maaş bilgileri';
        break;
      case 'leave_rights':
        response = 'İzin hakları hakkında bilgi';
        break;
      case 'safety':
        response = 'İş güvenliği konularında yardım';
        break;
      case 'education':
        response = 'Eğitim ve kurs programları';
        break;
      case 'help':
        response = 'Genel yardım ve bilgi';
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
    height: 500, // Yükseklik artırıldı
    backgroundColor: '#243B55',
    borderRadius: 20, // Köşe yuvarlaklığı artırıldı
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4, // Gölge derinliği artırıldı
    },
    shadowOpacity: 0.3, // Gölge opaklığı artırıldı
    shadowRadius: 6, // Gölge yarıçapı artırıldı
    elevation: 8, // Android elevation artırıldı
    borderWidth: 2, // Kenarlık eklendi
    borderColor: '#1a2942',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18, // Padding artırıldı
    backgroundColor: '#1a2942',
    borderTopLeftRadius: 18, // Köşe yuvarlaklığı artırıldı
    borderTopRightRadius: 18,
    borderBottomWidth: 2, // Alt kenarlık eklendi
    borderBottomColor: '#243B55',
  },
  headerText: {
    color: '#FFD700',
    fontSize: 18, // Font boyutu artırıldı
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    padding: 12,
    justifyContent: 'center',
    backgroundColor: '#1a2942',
    borderTopWidth: 1,
    borderTopColor: '#243B55',
  },
  quickReplyButton: {
    backgroundColor: '#243B55',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    margin: 4,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  quickReplyText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
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