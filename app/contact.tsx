import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ContactItemProps {
  icon: string;
  title: string;
  value: string;
  onPress?: () => void;
}

const contactInfo = {
  address: 'Merkez Mah. Cumhuriyet Cad. No: 123 Kat: 4 Istanbul, Turkey',
  phone: '+90 212 345 67 89',
  email: 'info@sendika.com',
  workingHours: 'Pazartesi - Cuma: 09:00 - 18:00',
};

const socialMedia = [
  {
    id: '1',
    name: 'Facebook',
    icon: 'logo-facebook',
    url: 'https://facebook.com/sendika',
  },
  {
    id: '2',
    name: 'Twitter',
    icon: 'logo-twitter',
    url: 'https://twitter.com/sendika',
  },
  {
    id: '3',
    name: 'Instagram',
    icon: 'logo-instagram',
    url: 'https://instagram.com/sendika',
  },
];

const ContactScreen: React.FC = () => {
  const handlePress = (value: string, type: 'phone' | 'email' | 'address' | 'url') => {
    switch (type) {
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'address':
        Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(value)}`);
        break;
      case 'url':
        Linking.openURL(value);
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradientHeader}
      >
        <Text style={styles.headerText}>Iletisim</Text>
      </LinearGradient>

      <View style={styles.content}>
        <ContactItem
          icon="location"
          title="Adres"
          value={contactInfo.address}
          onPress={() => handlePress(contactInfo.address, 'address')}
        />
        <ContactItem
          icon="call"
          title="Telefon"
          value={contactInfo.phone}
          onPress={() => handlePress(contactInfo.phone, 'phone')}
        />
        <ContactItem
          icon="mail"
          title="E-posta"
          value={contactInfo.email}
          onPress={() => handlePress(contactInfo.email, 'email')}
        />
        <ContactItem
          icon="time"
          title="Calisma Saatleri"
          value={contactInfo.workingHours}
        />

        <Text style={styles.socialTitle}>Sosyal Medya</Text>
        <View style={styles.socialContainer}>
          {socialMedia.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={styles.socialButton}
              onPress={() => handlePress(platform.url, 'url')}
            >
              <Ionicons name={platform.icon as any} size={24} color="#fff" />
              <Text style={styles.socialText}>{platform.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const ContactItem: React.FC<ContactItemProps> = ({ icon, title, value, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={icon as any} size={24} color="#4c669f" />
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gradientHeader: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  contactInfo: {
    marginLeft: 16,
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    color: '#666',
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    backgroundColor: '#4c669f',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
  },
  socialText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
  },
});

export default ContactScreen; 