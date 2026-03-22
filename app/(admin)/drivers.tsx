import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, FlatList, TouchableOpacity, Modal, Alert, Switch, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DriverSearchScreen() {
  const { systemSettings } = useAuth();
  const router = useRouter();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchTc, setSearchTc] = useState('');
  const [searchRegion, setSearchRegion] = useState('');
  
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${systemSettings.backend.apiUrl}/users?role=driver`);
      if (res.ok) {
        setDrivers(await res.json());
      }
    } catch (e) {
      console.error('Failed to load drivers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(d => 
    (d.fullName || d.name || '').toLowerCase().includes(searchName.toLowerCase()) &&
    (d.tc || '').includes(searchTc) &&
    (d.region || '').toLowerCase().includes(searchRegion.toLowerCase())
  );

  const handleEdit = (driver: any) => {
    setSelectedDriver({ ...driver });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedDriver) return;

    try {
      const res = await fetch(`${systemSettings.backend.apiUrl}/users/${selectedDriver.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: selectedDriver.fullName || selectedDriver.name,
          region: selectedDriver.region,
          status: selectedDriver.status
        })
      });

      if (res.ok) {
        Alert.alert('Başarılı', 'Şoför bilgileri güncellendi.');
        setShowModal(false);
        loadDrivers();
      } else {
        Alert.alert('Hata', 'Güncelleme yapılamadı.');
      }
    } catch (e) {
      Alert.alert('Hata', 'Sunucu bağlantı hatası.');
    }
  };

  const DriverItem = ({ item }: { item: any }) => {
    const isBad = item.complaints > 5 || item.rating < 3.0;
    const isGood = item.references > 5 && item.complaints === 0;

    return (
      <View style={[
        styles.card, 
        isBad ? styles.badCard : isGood ? styles.goodCard : null,
        item.status === 'passive' && styles.passiveCard
      ]}>
        <View style={styles.cardHeader}>
          {item.profileImage && (
            <Image source={{ uri: item.profileImage }} style={styles.listAvatar} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{item.fullName || item.name}</Text>
            {item.status === 'passive' && (
              <View style={styles.passiveBadge}>
                <Text style={styles.passiveBadgeText}>PASİF / ENGELİ</Text>
              </View>
            )}
          </View>
          <View style={[styles.indicator, { backgroundColor: item.status === 'passive' ? 'black' : isBad ? 'red' : isGood ? 'green' : 'grey' }]} />
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="card-account-details" size={16} color={Colors.grey} />
            <Text style={styles.infoText}>TC: {item.tc}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={Colors.grey} />
            <Text style={styles.infoText}>{item.region}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star" size={16} color="#FFB800" />
              <Text style={styles.statText}>{item.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="alert" size={16} color="red" />
              <Text style={styles.statText}>{item.complaints} Şikayet</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.detailsButton} onPress={() => handleEdit(item)}>
          <Text style={styles.detailsButtonText}>Düzenle / Görüntüle</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.secondary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Şoför Sorgulama</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="account-search" size={20} color={Colors.grey} />
          <TextInput
            style={styles.searchInput}
            placeholder="İsim Soyisim"
            value={searchName}
            onChangeText={setSearchName}
          />
        </View>
        <View style={styles.searchRow}>
          <View style={[styles.searchInputContainer, { flex: 1, marginTop: 8 }]}>
            <MaterialCommunityIcons name="numeric" size={20} color={Colors.grey} />
            <TextInput
              style={styles.searchInput}
              placeholder="TC Kimlik"
              value={searchTc}
              onChangeText={setSearchTc}
              keyboardType="numeric"
              maxLength={11}
            />
          </View>
          <View style={[styles.searchInputContainer, { flex: 1, marginTop: 8, marginLeft: 8 }]}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.grey} />
            <TextInput
              style={styles.searchInput}
              placeholder="Bölge"
              value={searchRegion}
              onChangeText={setSearchRegion}
            />
          </View>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredDrivers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <DriverItem item={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-off" size={60} color={Colors.lightGrey} />
              <Text style={styles.emptyText}>Şoför bulunamadı</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Şoför Düzenle</Text>
            
            <Text style={styles.label}>İsim Soyisim</Text>
            <TextInput 
              style={styles.modalInput} 
              value={selectedDriver?.fullName || selectedDriver?.name} 
              onChangeText={(t) => setSelectedDriver({...selectedDriver, fullName: t})}
            />

            <Text style={styles.label}>Bölge</Text>
            <TextInput 
              style={styles.modalInput} 
              value={selectedDriver?.region} 
              onChangeText={(t) => setSelectedDriver({...selectedDriver, region: t})}
            />

            <View style={styles.statusRow}>
              <Text style={[styles.label, { marginTop: 0 }]}>Hesap Durumu: {selectedDriver?.status === 'active' ? 'AKTİF' : 'PASİF'}</Text>
              <Switch
                value={selectedDriver?.status === 'active'}
                onValueChange={(val) => setSelectedDriver({...selectedDriver, status: val ? 'active' : 'passive'})}
                trackColor={{ false: '#767577', true: '#4CD964' }}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  searchSection: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchRow: { flexDirection: 'row' },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DDD',
  },
  badCard: { borderLeftColor: 'red', backgroundColor: '#FFF5F5' },
  goodCard: { borderLeftColor: 'green', backgroundColor: '#F5FFF5' },
  passiveCard: { borderLeftColor: 'black', backgroundColor: '#F2F2F7', opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  passiveBadge: {
    backgroundColor: 'black',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  passiveBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  listAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },
  driverName: { fontWeight: 'bold', fontSize: 18, color: Colors.secondary },
  indicator: { width: 12, height: 12, borderRadius: 6 },
  cardBody: { gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { marginLeft: 8, color: '#333', fontSize: 14 },
  statsRow: { flexDirection: 'row', marginTop: 8, gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statText: { marginLeft: 4, fontWeight: '600', fontSize: 14 },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  detailsButtonText: { color: Colors.secondary, fontWeight: '600', marginRight: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, color: Colors.grey, fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.secondary, textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, color: Colors.grey, marginBottom: 6, marginTop: 12 },
  modalInput: { backgroundColor: '#F9F9F9', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#EAEAEA', fontSize: 16 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: 12, backgroundColor: '#F2F2F7', borderRadius: 12 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 32 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  cancelBtnText: { fontWeight: 'bold', color: Colors.grey },
  saveBtn: { flex: 1, backgroundColor: Colors.secondary, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontWeight: 'bold', color: 'white' },
});
