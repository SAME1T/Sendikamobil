import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

const sendikalar = [
  {
    ad: 'TÜRK-İŞ (Türkiye İşçi Sendikaları Konfederasyonu)',
    adres: 'Bayındır sok.No:10 Kızılay / Ankara | 06410',
    telefon: '0312 433 31 25 (pbx)',
    email: 'turkis@turkis.org.tr',
    web: 'https://www.turkis.org.tr/',
    map: 'https://www.google.com/maps?q=Bayındır+Sokak+No:10+Kızılay+Ankara',
  },
  {
    ad: 'MEMUR-SEN (Memur Sendikaları Konfederasyonu)',
    adres: 'Zübeyde Hanım Mh. Sebze Bahçeleri Cd. No:86, 06400 Altındağ/Ankara',
    telefon: '+90 312 230 09 72-73',
    web: 'https://www.memursen.org.tr/',
    map: 'https://www.google.com/maps?q=Zübeyde+Hanım+Mahallesi+Sebze+Bahçeleri+Cd+86+Altındağ+Ankara',
  },
  {
    ad: 'EĞİTİM-BİR-SEN',
    adres: 'Zübeyde Hanım Mh. Sebze Bahçeleri Cd. No:86 Kat:14-16 06400 Altındağ/Ankara',
    telefon: '0.312.231 23 06',
    web: 'https://www.ebs.org.tr/',
    map: 'https://www.google.com/maps?q=Zübeyde+Hanım+Mahallesi+Sebze+Bahçeleri+Cd+86+Altındağ+Ankara',
  },
  {
    ad: 'SAĞLIK-SEN',
    adres: 'Zübeyde Hanım Mh. Sebze Bahçeleri Cd. No:86 Kat:11-13, 06400 Altındağ/Ankara',
    telefon: '444 1995',
    web: 'https://www.sagliksen.org.tr/',
    map: 'https://www.google.com/maps?q=Zübeyde+Hanım+Mahallesi+Sebze+Bahçeleri+Cd+86+Altındağ+Ankara',
  },
  {
    ad: 'DİYANET-SEN',
    adres: 'Rüzgarlı Sokak 15/B Ulus / ANKARA',
    telefon: '0.312 230 46 86 - 0.312 231 57 22',
    web: 'https://www.diyanetsen.org.tr/',
    map: 'https://www.google.com/maps?q=Rüzgarlı+Sokak+15/B+Ulus+Ankara',
  },
  {
    ad: 'TÜRK METAL SENDİKASI',
    adres: 'GMK Bulvarı No: 128 Maltepe/ANKARA',
    telefon: '0 312 232 00 60',
    web: 'https://www.turkmetal.org.tr/',
    map: 'https://www.google.com/maps?q=GMK+Bulvarı+No:128+Maltepe+Ankara',
  },
  {
    ad: 'TEKGIDA-İŞ SENDİKASI',
    adres: 'Konaklar Mah. Faruk Nafiz Çamlıbel Sok.No:5 / 4. Levent / İSTANBUL',
    telefon: '0535 973 63 17 - 0535 973 60 86',
    web: 'https://www.tekgida.org.tr/',
    map: 'https://www.google.com/maps?q=Konaklar+Mah.+Faruk+Nafiz+Çamlıbel+Sok.No:5+Levent+İstanbul',
  },
];

export default function Iletisim() {
  return (
    <ScrollView style={styles.bg} contentContainerStyle={{paddingBottom: 32}}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#2575fc" />
        </TouchableOpacity>
        <View style={styles.iconCircle}>
          <FontAwesome5 name="address-book" size={32} color="#fff" />
        </View>
        <Text style={styles.pageTitle}>Sendika İletişim Rehberi</Text>
        <Text style={styles.pageDesc}>Türkiye'deki önde gelen sendikaların güncel iletişim, adres ve web sitesi bilgilerine buradan ulaşabilirsiniz.</Text>
        {sendikalar.map((s, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{s.ad}</Text>
            <Text style={styles.cardText}><Text style={styles.bold}>Adres:</Text> {s.adres}</Text>
            <Text style={styles.cardText}><Text style={styles.bold}>Telefon:</Text> {s.telefon}</Text>
            {s.email && <Text style={styles.cardText}><Text style={styles.bold}>E-Posta:</Text> {s.email}</Text>}
            <TouchableOpacity onPress={() => Linking.openURL(s.web)}>
              <Text style={[styles.cardText, {color:'#2575fc', textDecorationLine:'underline'}]}>{s.web.replace('https://','')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapBtn} onPress={() => Linking.openURL(s.map)}>
              <Ionicons name="map" size={18} color="#fff" />
              <Text style={styles.mapBtnText}>Haritada Göster</Text>
            </TouchableOpacity>
          </View>
        ))}
        <Text style={styles.footer}>Daha fazla sendika ve iletişim bilgisi için ilgili sendikanın resmi web sitesini ziyaret edebilirsiniz.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: '#e6eaf7',
  },
  container: {
    maxWidth: 900,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    margin: 18,
    padding: 18,
    shadowColor: '#1f2687',
    shadowOpacity: 0.13,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-start',
    padding: 4,
  },
  iconCircle: {
    alignSelf: 'center',
    backgroundColor: '#2575fc',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2575fc',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2575fc',
    textAlign: 'center',
    marginBottom: 4,
  },
  pageDesc: {
    textAlign: 'center',
    color: '#555',
    fontSize: 15,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#f8faff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#2575fc',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    color: '#6a11cb',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  bold: {
    fontWeight: 'bold',
    color: '#2575fc',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2575fc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  mapBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  footer: {
    marginTop: 18,
    color: '#888',
    textAlign: 'center',
    fontSize: 13,
  },
}); 