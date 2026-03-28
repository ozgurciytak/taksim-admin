import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AssignmentsScreen() {
  const { systemSettings } = useAuth();
  const router = useRouter();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${systemSettings.backend.apiUrl}/users?role=driver`);
      if (res.ok) {
        const data = await res.json();
        // Filter only working drivers
        setDrivers(data.filter((d: any) => d.currentWorkInfo));
      }
    } catch (e) {
      console.error('Failed to load assignments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = drivers.filter(d => 
    d.fullName.toLowerCase().includes(search.toLowerCase()) || 
    d.currentWorkInfo.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    d.currentWorkInfo.plate.toLowerCase().includes(search.toLowerCase())
  );

  const AssignmentItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.driverSection}>
        <MaterialCommunityIcons name="account-tie" size={24} color={Colors.secondary} />
        <View style={styles.info}>
          <Text style={styles.label}>Şoför</Text>
          <Text style={styles.value}>{item.fullName}</Text>
        </View>
      </View>
      
      <View style={styles.arrowContainer}>
        <MaterialCommunityIcons name="arrow-down" size={20} color={Colors.grey} />
      </View>

      <View style={styles.ownerSection}>
        <MaterialCommunityIcons name="taxi" size={24} color={Colors.primary} />
        <View style={styles.info}>
          <Text style={styles.label}>Araç / Sahibi</Text>
          <Text style={styles.value}>{item.currentWorkInfo.plate} - {item.currentWorkInfo.ownerName}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>Başlangıç: {new Date(item.currentWorkInfo.startDate).toLocaleDateString('tr-TR')}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Çalışma Durumları</Text>
        <TouchableOpacity onPress={loadData}>
          <MaterialCommunityIcons name="refresh" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.grey} />
        <TextInput 
          style={styles.input} 
          placeholder="Şoför, Sahibi veya Plaka Ara..." 
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <AssignmentItem item={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aktif çalışma kaydı bulunamadı.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { height: 60, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', margin: 16, paddingHorizontal: 12, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
  input: { flex: 1, marginLeft: 8, fontSize: 15 },
  list: { padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  driverSection: { flexDirection: 'row', alignItems: 'center' },
  ownerSection: { flexDirection: 'row', alignItems: 'center' },
  arrowContainer: { paddingLeft: 2, marginVertical: 4 },
  info: { marginLeft: 12 },
  label: { fontSize: 11, color: Colors.grey, textTransform: 'uppercase' },
  value: { fontSize: 16, fontWeight: 'bold', color: Colors.secondary },
  footer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  date: { fontSize: 12, color: Colors.grey },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.grey },
});
