import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const menuItems = [
  { 
    id: 1, 
    title: 'Anketler', 
    icon: 'stats-chart',
    route: '/surveys'
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

export default function CustomDrawerContent(props: any) {
  const router = useRouter();

  return (
    <DrawerContentScrollView 
      {...props}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sendikamobil</Text>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
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
        <TouchableOpacity style={styles.footerButton}>
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
  },
  headerTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
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