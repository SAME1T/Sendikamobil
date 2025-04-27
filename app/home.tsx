import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Home() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Hoş Geldiniz, Ahmet!</Text>
      <Text style={styles.subHeader}>Sendika İletişim Merkezi üye paneline hoş geldiniz.</Text>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aktif Anketler</Text>
          <Text style={styles.cardValue}>3</Text>
          <Text style={styles.cardSub}>1 yeni anket var</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>İletilerim</Text>
          <Text style={styles.cardValue}>5</Text>
          <Text style={styles.cardSub}>2 yanıt bekleyen ileti</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Duyurular</Text>
          <Text style={styles.cardValue}>8</Text>
          <Text style={styles.cardSub}>3 yeni duyuru</Text>
        </View>
      </View>

      <View style={styles.sectionsRow}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          <Text style={styles.activity}>✔️ "İş Güvenliği" anketini doldurdunuz</Text>
          <Text style={styles.activity}>📧 Yeni bir ileti gönderdiniz</Text>
          <Text style={styles.activity}>🔔 2 yeni duyuru okundu</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yaklaşan Etkinlikler</Text>
          <Text style={styles.activity}>📅 Üye Toplantısı - 15 Mayıs</Text>
          <Text style={styles.activity}>🎓 İş Güvenliği Eğitimi - 20 Mayıs</Text>
          <Text style={styles.activity}>🎉 Sosyal Etkinlik - 25 Mayıs</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fa',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007aff',
    marginTop: 20,
    marginBottom: 5,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007aff',
  },
  cardSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  sectionsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  section: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  activity: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
}); 