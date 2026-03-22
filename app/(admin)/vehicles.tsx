import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, FlatList, TouchableOpacity, Modal, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const INITIAL_VEHICLES = [
  { id: '1', plate: '34 TAK 123', owner: 'Ahmet Yılmaz', region: 'Kadıköy', status: 'Aktif', model: 'Fiat Egea', year: '2022', engine: '1.3 MultiJet', color: 'Beyaz' },
  { id: '2', plate: '34 TAX 456', owner: 'Mehmet Demir', region: 'Beşiktaş', status: 'Aktif', model: 'Renault Megane', year: '2021', engine: '1.5 dCi', color: 'Gümüş' },
  { id: '3', plate: '34 TTT 789', owner: 'Ayşe Kaya', region: 'Şişli', status: 'Pasif', model: 'Toyota Corolla', year: '2023', engine: '1.8 Hybrid', color: 'Siyah' },
  { id: '4', plate: '34 ABC 001', owner: 'Fatma Şahin', region: 'Üsküdar', status: 'Aktif', model: 'Hyundai Accent', year: '2020', engine: '1.4 MPI', color: 'Mavi' },
];

export default function VehicleSearchScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [searchPlate, setSearchPlate] = useState('');
  const [searchRegion, setSearchRegion] = useState('');
  const [searchOwner, setSearchOwner] = useState('');

  // Modal states
  const [selectedVehicle, setSelectedVehicle] = useState<typeof INITIAL_VEHICLES[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleStatus = (id: string) => {
    setVehicles(prev => prev.map(v => 
      v.id === id ? { ...v, status: v.status === 'Aktif' ? 'Pasif' : 'Aktif' } : v
    ));
    if (selectedVehicle && selectedVehicle.id === id) {
      setSelectedVehicle(prev => prev ? { ...prev, status: prev.status === 'Aktif' ? 'Pasif' : 'Aktif' } : null);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchPlate.toLowerCase()) &&
    v.region.toLowerCase().includes(searchRegion.toLowerCase()) &&
    v.owner.toLowerCase().includes(searchOwner.toLowerCase())
  );

  const VehicleItem = ({ item }: { item: typeof INITIAL_VEHICLES[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.plateBadge}>
          <Text style={styles.plateText}>{item.plate}</Text>
        </View>
        <Text style={[styles.statusText, { color: item.status === 'Aktif' ? 'green' : 'red' }]}>{item.status}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account" size={16} color={Colors.grey} />
          <Text style={styles.infoText}>{item.owner}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color={Colors.grey} />
          <Text style={styles.infoText}>{item.region}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.detailsButton} 
        onPress={() => {
          setSelectedVehicle(item);
          setModalVisible(true);
        }}
      >
        <Text style={styles.detailsButtonText}>Detayları Gör</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.secondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Araç Sorgulama</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <View style={[styles.searchInputContainer, { flex: 1 }]}>
            <MaterialCommunityIcons name="car-info" size={20} color={Colors.grey} />
            <TextInput
              style={styles.searchInput}
              placeholder="Plaka"
              value={searchPlate}
              onChangeText={setSearchPlate}
              autoCapitalize="characters"
            />
          </View>
          <View style={[styles.searchInputContainer, { flex: 1.2, marginLeft: 8 }]}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.grey} />
            <TextInput
              style={styles.searchInput}
              placeholder="Bölge (İlçe)"
              value={searchRegion}
              onChangeText={setSearchRegion}
            />
          </View>
        </View>
        <View style={[styles.searchInputContainer, { marginTop: 8 }]}>
          <MaterialCommunityIcons name="account-search" size={20} color={Colors.grey} />
          <TextInput
            style={styles.searchInput}
            placeholder="Araç Sahibi Adı"
            value={searchOwner}
            onChangeText={setSearchOwner}
          />
        </View>
      </View>

      <FlatList
        data={filteredVehicles}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <VehicleItem item={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="car-off" size={60} color={Colors.lightGrey} />
            <Text style={styles.emptyText}>Araç bulunamadı</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Araç Detayları</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {selectedVehicle && (
              <ScrollView>
                <View style={styles.modalPlateBadge}>
                  <Text style={styles.modalPlateText}>{selectedVehicle.plate}</Text>
                </View>

                <View style={styles.detailSection}>
                  <DetailItem icon="account" label="Araç Sahibi" value={selectedVehicle.owner} />
                  <DetailItem icon="map-marker" label="Bölge" value={selectedVehicle.region} />
                  <DetailItem icon="car" label="Model" value={selectedVehicle.model} />
                  <DetailItem icon="calendar" label="Yıl" value={selectedVehicle.year} />
                  <DetailItem icon="engine" label="Motor" value={selectedVehicle.engine} />
                  <DetailItem icon="palette" label="Renk" value={selectedVehicle.color} />
                </View>

                <View style={styles.statusToggleContainer}>
                  <View>
                    <Text style={styles.statusLabel}>Araç Durumu</Text>
                    <Text style={[styles.statusValue, { color: selectedVehicle.status === 'Aktif' ? 'green' : 'red' }]}>
                      {selectedVehicle.status}
                    </Text>
                  </View>
                  <Switch
                    value={selectedVehicle.status === 'Aktif'}
                    onValueChange={() => toggleStatus(selectedVehicle.id)}
                    trackColor={{ false: '#767577', true: Colors.primary }}
                    thumbColor={selectedVehicle.status === 'Aktif' ? 'white' : '#f4f3f4'}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.closeBtn} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeBtnText}>KAPAT</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const DetailItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.detailItem}>
    <MaterialCommunityIcons name={icon as any} size={20} color={Colors.grey} />
    <View style={styles.detailInfo}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchSection: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchRow: {
    flexDirection: 'row',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  plateBadge: {
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  plateText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 8,
  },
  detailsButtonText: {
    color: Colors.secondary,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 12,
    color: Colors.grey,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalPlateBadge: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  modalPlateText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailSection: {
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailInfo: {
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.grey,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.grey,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    backgroundColor: Colors.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
