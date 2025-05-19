import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const menuItems = [
  { 
    id: 1, 
    title: 'Anketlerim', 
    icon: 'stats-chart',
    route: '/anketlerim'
  },
  { 
    id: 2, 
    title: 'Grev Kararları', 
    icon: 'hand-left',
    route: '/strikes'
  },
  { 
    id: 3, 
    title: 'Toplantılar', 
    icon: 'people',
    route: '/meetings'
  },
  { 
    id: 4, 
    title: 'Eylem Planları', 
    icon: 'megaphone',
    route: '/actions'
  },
  { 
    id: 5, 
    title: 'Duyurular', 
    icon: 'notifications',
    route: '/announcements'
  },
  { 
    id: 6, 
    title: 'İletişim', 
    icon: 'mail',
    route: '/contact'
  },
  { 
    id: 7, 
    title: 'Etkinlikler', 
    icon: 'calendar',
    route: '/events'
  },
];

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.clockContainer}>
      <Text style={styles.timeText}>{formatTime(time)}</Text>
      <Text style={styles.dateText}>{formatDate(time)}</Text>
    </View>
  );
};

const TurkishFlag = () => (
  <Svg width="48" height="32" viewBox="0 0 48 32">
    {/* Kırmızı zemin */}
    <Rect width="48" height="32" fill="#E30A17" />
    {/* Büyük beyaz ay */}
    <Circle cx="19" cy="16" r="10" fill="#fff" />
    {/* Kırmızı iç ay (hilal) */}
    <Circle cx="22" cy="16" r="8" fill="#E30A17" />
    {/* Yıldız */}
    <Path
      d="M31.5 16 l3.09 1.00 -2.00-2.73 2.00-2.73 -3.09 1.00 -1.00-3.09 -1.00 3.09 -3.09-1.00 2.00 2.73 -2.00 2.73 3.09-1.00 1.00 3.09z"
      fill="#fff"
      transform="scale(1.1) translate(2.5 -2.5)"
    />
  </Svg>
);

export default function CustomDrawerContent(props: any) {
  const router = useRouter();

  return (
    <DrawerContentScrollView 
      {...props}
      style={styles.container}
    >
      <View style={styles.header}>
        <DigitalClock />
        <TurkishFlag />
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => router.push('/giris-secimi')}
          >
            <Ionicons 
              name={item.icon as any} 
              size={24} 
              color="#FFD700"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => router.push('/giris-secimi')}
        >
          <Ionicons name="settings-outline" size={24} color="#FFD700" />
          <Text style={styles.footerButtonText}>Ayarlar</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2942',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 100,
  },
  clockContainer: {
    flex: 1,
    marginRight: 20,
  },
  timeText: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    color: '#E2E7E8',
    fontSize: 14,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2c3e50',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#FFD700',
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '500',
  },
}); 