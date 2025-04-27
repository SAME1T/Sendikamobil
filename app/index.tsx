import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import ChatBot from '../components/ChatBot';

interface StatisticCardProps {
  title: string;
  value: string;
  subtitle: string;
}

const unionData = [
  { id: 1, code: 12, name: 'TÜRK METAL SENDİKASI', members: 293829 },
  { id: 2, code: 20, name: 'HİZMET-İŞ', members: 280769 },
  { id: 3, code: 17, name: 'ÖZ SAĞLIK-İŞ', members: 224289 },
  { id: 4, code: 20, name: 'GENEL-İŞ', members: 171348 },
  { id: 5, code: 10, name: 'TEZ-KOOP-İŞ', members: 126431 },
  { id: 6, code: 20, name: 'BELEDİYE-İŞ', members: 126182 },
  { id: 7, code: 10, name: 'KOOP-İŞ', members: 124095 },
  { id: 8, code: 14, name: 'TES-İŞ', members: 68890 },
  { id: 9, code: 10, name: 'ÖZ BÜRO-İŞ', members: 50901 },
  { id: 10, code: 13, name: 'YOL-İŞ', members: 50630 },
];

const workSectorData = [
  { id: 1, code: 10, name: 'TİCARET, BÜRO, EĞİTİM VE GÜZEL SANATLAR', members: 4469945 },
  { id: 2, code: 12, name: 'METAL', members: 1987733 },
  { id: 3, code: 13, name: 'İNŞAAT', members: 1741475 },
  { id: 4, code: 18, name: 'KONAKLAMA VE EĞLENCE İŞLERİ', members: 1169680 },
  { id: 5, code: 5, name: 'DOKUMA, HAZIR GİYİM VE DERİ', members: 1169314 },
  { id: 6, code: 15, name: 'TAŞIMACILIK', members: 1048014 },
  { id: 7, code: 20, name: 'GENEL İŞLER', members: 991976 },
  { id: 8, code: 17, name: 'SAĞLIK VE SOSYAL HİZMETLER', members: 761312 },
  { id: 9, code: 2, name: 'GIDA SANAYİİ', members: 758601 },
  { id: 10, code: 4, name: 'PETROL, KİMYA, LASTİK, PLASTİK VE İLAÇ', members: 615122 },
];

const UnionTable = () => (
  <View style={styles.tableContainer}>
    <Text style={styles.tableTitle}>Üye Sayılarına Göre En Büyük On Sendika</Text>
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 0.5 }]}>Sıra No</Text>
      <Text style={[styles.headerCell, { flex: 0.5 }]}>İş Kolu No</Text>
      <Text style={[styles.headerCell, { flex: 2 }]}>Sendika Adı</Text>
      <Text style={[styles.headerCell, { flex: 1 }]}>Üye Sayısı</Text>
    </View>
    <ScrollView>
      {unionData.map((item) => (
        <View key={item.id} style={[
          styles.tableRow,
          item.id % 2 === 1 ? styles.oddRow : null
        ]}>
          <Text style={[styles.cell, { flex: 0.5 }]}>{item.id}</Text>
          <Text style={[styles.cell, { flex: 0.5 }]}>{item.code}</Text>
          <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>
          <Text style={[styles.cell, { flex: 1 }]}>{item.members.toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const WorkSectorTable = () => (
  <View style={styles.tableContainer}>
    <Text style={styles.tableTitle}>İşçi Sayısına Göre En Büyük On İş Kolu</Text>
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 0.5 }]}>Sıra No</Text>
      <Text style={[styles.headerCell, { flex: 0.5 }]}>İş Kolu No</Text>
      <Text style={[styles.headerCell, { flex: 2 }]}>İş Kolu Adı</Text>
      <Text style={[styles.headerCell, { flex: 1 }]}>Üye Sayısı</Text>
    </View>
    <ScrollView>
      {workSectorData.map((item) => (
        <View key={item.id} style={[
          styles.tableRow,
          item.id % 2 === 1 ? styles.oddRow : null
        ]}>
          <Text style={[styles.cell, { flex: 0.5 }]}>{item.id}</Text>
          <Text style={[styles.cell, { flex: 0.5 }]}>{item.code.toString().padStart(2, '0')}</Text>
          <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>
          <Text style={[styles.cell, { flex: 1 }]}>{item.members.toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const StatisticCard = ({ title, value, subtitle }: StatisticCardProps) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
  </View>
);

export default function Index() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();

  const workerStats = [
    { title: 'İŞÇİ', value: '% 14.97', subtitle: 'Toplam Sendikalı Oranı' },
    { title: 'İŞÇİ', value: '235', subtitle: 'Güncel Sendika Sayısı' },
    { title: 'İŞÇİ', value: 'GENEL İŞLER', subtitle: 'Üye Oranı En Yüksek İşkolu' },
    { title: 'İŞÇİ', value: 'İNŞAAT', subtitle: 'Üye Oranı En Düşük İşkolu' },
  ];

  const publicStats = [
    { title: 'KAMU', value: '% 75.18', subtitle: 'Toplam Sendikalı Oranı' },
    { title: 'KAMU', value: '242', subtitle: 'Güncel Sendika Sayısı' },
    { title: 'KAMU', value: 'YEREL YÖNETİM H.', subtitle: 'Üye Oranı En Yüksek İşkolu' },
    { title: 'KAMU', value: 'ENERJİ, SANAYİ', subtitle: 'Üye Oranı En Düşük İşkolu' },
  ];

  const handleMenuItemPress = (route: string) => {
    setDropdownVisible(false);
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
          <Ionicons name="menu" size={28} color="#FFD700" />
        </TouchableOpacity>
        <Text style={[styles.headerText, { 
          marginLeft: 15,
          color: '#E2E7E8',
          textShadowColor: 'rgba(0, 0, 0, 0.75)',
          textShadowOffset: { width: -1, height: 1 },
          textShadowRadius: 10
        }]}>
          İşçi Hakları ve Sendika İletişim Merkezi
        </Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/giris-secimi')}
        >
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={[styles.dropdown, { top: 90, right: 20 }]}>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleMenuItemPress('/login/sendika')}
            >
              <Text style={styles.dropdownText}>Sendikacı Girişi</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleMenuItemPress('/login/isci')}
            >
              <Text style={styles.dropdownText}>İşçi Girişi</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleMenuItemPress('/register')}
            >
              <Text style={styles.dropdownText}>Üye Ol</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz!</Text>
          <Text style={styles.welcomeText}>
            İşçi Hakları ve Sendika İletişim Merkezi'ne hoş geldiniz. Burada işçi hakları, sendikalar ve çalışma hayatı ile ilgili güncel bilgilere ulaşabilirsiniz.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İŞÇİ İSTATİSTİKLERİ</Text>
          <View style={styles.cardContainer}>
            {workerStats.map((stat, index) => (
              <StatisticCard key={index} {...stat} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KAMU İSTATİSTİKLERİ</Text>
          <View style={styles.cardContainer}>
            {publicStats.map((stat, index) => (
              <StatisticCard key={index} {...stat} />
            ))}
          </View>
        </View>

        <UnionTable />
        <View style={styles.tableSeparator} />
        <WorkSectorTable />
      </ScrollView>
      <ChatBot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2942',
  },
  header: {
    backgroundColor: '#0d1521',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#8B1F41',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 5,
    width: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    color: '#1a2942',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '48%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
  cardValue: {
    color: '#1a2942',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubtitle: {
    color: '#666',
    fontSize: 11,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a2942',
    marginBottom: 15,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a2942',
    padding: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  oddRow: {
    backgroundColor: '#f9f9f9',
  },
  cell: {
    fontSize: 14,
    color: '#333',
  },
  tableSeparator: {
    height: 20,
  },
  welcomeContainer: {
    backgroundColor: '#243B55',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E2E7E8',
    textAlign: 'center',
    lineHeight: 24,
  },
});
