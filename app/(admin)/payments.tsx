import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminPaymentsScreen() {
  const { payments, approvePayment, rejectPayment, refreshData } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  const handleApprove = (id: string) => {
    Alert.alert('Onayla', 'Bu ödemenin hesaba geçtiğini onaylıyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Onayla', onPress: () => approvePayment(id) }
    ]);
  };

  const renderPaymentItem = ({ item }: any) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.userContainer}>
          <MaterialCommunityIcons name="account" size={20} color={Colors.secondary} />
          <Text style={styles.userName}>{item.userName || 'Bilinmeyen Kullanıcı'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.itemBody}>
        <Text style={styles.amount}>{item.amount} TL</Text>
        <Text style={styles.method}>{item.type === 'havale' ? 'Banka Havalesi' : 'Kredi Kartı'}</Text>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApprove(item.id)}>
            <Text style={styles.btnText}>Onayla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => rejectPayment(item.id)}>
            <Text style={styles.btnText}>Reddet</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      default: return 'grey';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Onaylandı';
      case 'pending': return 'Bekliyor';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Ödeme Onayları</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <MaterialCommunityIcons name="refresh" size={28} color="black" />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Bekleyen ödeme bulunmuyor.</Text>}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    height: 60,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  list: { padding: 16 },
  itemCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  userContainer: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  itemBody: { marginBottom: 16 },
  amount: { fontSize: 24, fontWeight: 'bold', color: Colors.secondary },
  method: { color: Colors.grey, fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  approveBtn: { backgroundColor: 'green' },
  rejectBtn: { backgroundColor: 'red' },
  btnText: { color: 'white', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 100, color: Colors.grey }
});
