import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomDrawerContent from '../components/CustomDrawerContent';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#1a2942',
            width: 280,
          },
          drawerType: 'front',
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen 
          name="index" 
          options={{
            drawerLabel: 'Ana Sayfa',
            title: 'Ana Sayfa'
          }}
        />
        <Drawer.Screen 
          name="login/sendika" 
          options={{
            drawerLabel: 'Sendikacı Girişi',
            title: 'Sendikacı Girişi'
          }}
        />
        <Drawer.Screen 
          name="login/isci" 
          options={{
            drawerLabel: 'İşçi Girişi',
            title: 'İşçi Girişi'
          }}
        />
        <Drawer.Screen 
          name="register" 
          options={{
            drawerLabel: 'Üye Ol',
            title: 'Üye Ol'
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
