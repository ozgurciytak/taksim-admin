import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_STORAGE_KEY = '@taksim_all_users_v2';

export default function AdminManagementScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [admins, setAdmins] = useState<any[]>([]);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const allUsers = JSON.parse(stored);
        if (Array.isArray(allUsers)) {
          setAdmins(allUsers.filter((u: any) => u.role === 'admin'));
        }
      }
    } catch (error) {
      console.error('Admin yükleme hatası:', error);
    }
  };

  const handleAddAdmin = async () => {
    if (!email || !fullName || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    let allUsers = [];
    try {
      allUsers = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(allUsers)) allUsers = [];
    } catch (e) {
      allUsers = [];
    }
    
    if (allUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      Alert.alert('Hata', 'Bu e-posta adresi zaten kayıtlı.');
      return;
    }

    const newAdmin = {
      id: Date.now().toString(),
      email,
      fullName,
      role: 'admin',
      phone: '',
      balance: 0,
      password: password
    };

    allUsers.push(newAdmin);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
    
    setEmail('');
    setFullName('');
    setPassword('');
    loadAdmins();
    Alert.alert('Başarılı', 'Yeni yönetici eklendi.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yönetici Yönetimi</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Yeni Yönetici Ekle</Text>
          <TextInput
            style={styles.input}
            placeholder="İsim Soyisim"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddAdmin}>
            <Text style={styles.addBtnText}>Ekle</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.listTitle}>Mevcut Yöneticiler</Text>
        {admins.map((admin) => (
          <View key={admin.id} style={styles.adminItem}>
            <View>
              <Text style={styles.adminName}>{admin.fullName}</Text>
              <Text style={styles.adminEmail}>{admin.email}</Text>
            </View>
            <MaterialCommunityIcons name="shield-check" size={24} color="green" />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    height: 60,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: Colors.secondary },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: Colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  listTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
  adminItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  adminName: { fontWeight: 'bold' },
  adminEmail: { color: Colors.grey, fontSize: 12 },
});
