import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading) {
      if (!user) {
        // Admin uygulamasında direkt giriş ekranına (admin rolüyle) yönlendir
        router.replace('/(auth)/login?role=admin');
      } else {
        // Sadece admin girişi desteklenir
        if (user.role === 'admin') {
          router.replace('/(admin)');
        } else {
          // Başka bir rol gelirse (hata durumu) çıkış yaptır
          logout();
        }
      }
    }
  }, [user, isLoading, isMounted]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFB800' }}>
      <ActivityIndicator size="large" color="#0A1E3C" />
    </View>
  );
}
