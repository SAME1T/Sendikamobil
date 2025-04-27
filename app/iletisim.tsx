import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Iletisim() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>İletişim</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6fa',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007aff',
  },
}); 