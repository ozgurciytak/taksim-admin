import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminPanelScreen() {
  const { logout, allUsers, allPosts, payments } = useAuth();
  const router = useRouter();

  const totalVehicles = allUsers.filter(u => u.role === 'owner' && u.plateNumber).length;
  const totalDrivers = allUsers.filter(u => u.role === 'driver').length;
  const activeAds = allPosts.length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  const StatCard = ({ value, label, icon, color }: any) => (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon} size={30} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="shield-account" size={28} color="black" />
          <Text style={styles.appBarTitle}>ADMİN PANELİ</Text>
        </View>
        <TouchableOpacity onPress={async () => {
          await logout();
          router.replace('/(auth)/login');
        }}>
          <MaterialCommunityIcons name="logout" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Grid */}
        <View style={styles.grid}>
          <View style={styles.row}>
            <StatCard value={totalVehicles.toString()} label="Toplam Araç" icon="taxi" color={Colors.secondary} />
            <StatCard value={totalDrivers.toString()} label="Kayıtlı Şoför" icon="account-group" color={Colors.primary} />
          </View>
          <View style={styles.row}>
            <StatCard value={activeAds.toString()} label="Aktif İlan" icon="bullhorn" color="green" />
            <StatCard value={pendingPayments.toString()} label="Bekleyen Ödeme" icon="credit-card-clock" color="orange" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Yönetim İşlemleri</Text>
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(admin)/vehicles')}>
            <MaterialCommunityIcons name="car" size={28} color={Colors.secondary} />
            <Text style={styles.actionButtonText}>Araç Sorgula</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(admin)/drivers')}>
            <MaterialCommunityIcons name="account-search" size={28} color={Colors.secondary} />
            <Text style={styles.actionButtonText}>Şoför Sorgula</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(admin)/admins')}>
            <MaterialCommunityIcons name="account-plus" size={28} color={Colors.secondary} />
            <Text style={styles.actionButtonText}>Yönetici Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(admin)/payments')}>
            <MaterialCommunityIcons name="credit-card-check" size={28} color={Colors.secondary} />
            <Text style={styles.actionButtonText}>Ödeme Onayları</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(admin)/settings')}>
            <MaterialCommunityIcons name="cog" size={28} color={Colors.secondary} />
            <Text style={styles.actionButtonText}>Sistem Ayarları</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Son Şikayetler</Text>
        <View style={styles.complaintCard}>
          <View style={styles.complaintIcon}>
            <MaterialCommunityIcons name="alert" size={24} color="white" />
          </View>
          <View style={styles.complaintDetails}>
            <Text style={styles.complaintName}>Ali Demir</Text>
            <Text style={styles.complaintText}>Müşteriye kaba davranış</Text>
            <Text style={styles.complaintDate}>2 saat önce</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.grey} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  appBar: {
    height: 60,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 8,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.grey,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  miniPaymentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  miniPaymentUser: { fontWeight: 'bold', fontSize: 14 },
  miniPaymentMeta: { color: Colors.grey, fontSize: 12 },
  miniStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  miniStatusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: Colors.grey, marginTop: 10 },
  complaintCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.1)',
  },
  complaintIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  complaintDetails: {
    flex: 1,
  },
  complaintName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  complaintText: {
    color: '#333',
    marginVertical: 2,
  },
  complaintDate: {
    fontSize: 12,
    color: Colors.grey,
  },
  actionButton: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionButtonText: {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.secondary,
  },
});
