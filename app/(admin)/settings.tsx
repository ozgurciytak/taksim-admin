import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminSettingsScreen() {
  const { systemSettings, updateSettings } = useAuth();
  const [fee, setFee] = useState(systemSettings.app.applicationFee.toString());
  const [iban, setIban] = useState(systemSettings.payment.iban);
  const [companyTitle, setCompanyTitle] = useState(systemSettings.payment.companyTitle || '');
  const [apiKey, setApiKey] = useState(systemSettings.payment.apiKey);
  const [apiSecret, setApiSecret] = useState(systemSettings.payment.apiSecret || '');
  const [merchantId, setMerchantId] = useState(systemSettings.payment.merchantId || '');
  const [apiUrl, setApiUrl] = useState(systemSettings.backend.apiUrl);
  const [activeTab, setActiveTab] = useState<'iban' | 'api' | 'app' | 'server'>('iban');
  const router = useRouter();

  const handleSaveIban = async () => {
    await updateSettings({ 
      ...systemSettings,
      payment: { ...systemSettings.payment, iban, companyTitle }
    });
    Alert.alert('Başarılı', 'IBAN bilgileri güncellendi.');
  };

  const handleSavePaymentApi = async () => {
    await updateSettings({ 
      ...systemSettings,
      payment: { ...systemSettings.payment, apiKey, apiSecret, merchantId }
    });
    Alert.alert('Başarılı', 'Ödeme API ayarları güncellendi.');
  };

  const handleSaveApp = async () => {
    const newFee = parseFloat(fee);
    if (isNaN(newFee)) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin.');
      return;
    }
    await updateSettings({ 
      ...systemSettings,
      app: { applicationFee: newFee }
    });
    Alert.alert('Başarılı', 'Uygulama ücreti güncellendi.');
  };

  const handleSaveServer = async () => {
    await updateSettings({ 
      ...systemSettings,
      backend: { apiUrl }
    });
    Alert.alert('Başarılı', 'Sunucu adresi güncellendi.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Sistem Ayarları</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'iban' && styles.activeTab]} 
          onPress={() => setActiveTab('iban')}
        >
          <MaterialCommunityIcons name="bank" size={20} color={activeTab === 'iban' ? 'black' : Colors.grey} />
          <Text style={[styles.tabText, activeTab === 'iban' && styles.activeTabText]}>IBAN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'api' && styles.activeTab]} 
          onPress={() => setActiveTab('api')}
        >
          <MaterialCommunityIcons name="api" size={20} color={activeTab === 'api' ? 'black' : Colors.grey} />
          <Text style={[styles.tabText, activeTab === 'api' && styles.activeTabText]}>API</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'app' && styles.activeTab]} 
          onPress={() => setActiveTab('app')}
        >
          <MaterialCommunityIcons name="tune" size={20} color={activeTab === 'app' ? 'black' : Colors.grey} />
          <Text style={[styles.tabText, activeTab === 'app' && styles.activeTabText]}>ÜCRET</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'server' && styles.activeTab]} 
          onPress={() => setActiveTab('server')}
        >
          <MaterialCommunityIcons name="server" size={20} color={activeTab === 'server' ? 'black' : Colors.grey} />
          <Text style={[styles.tabText, activeTab === 'server' && styles.activeTabText]}>SUNUCU</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView style={styles.content}>
        {/* IBAN Ayarları Bölümü */}
        {activeTab === 'iban' && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="bank-outline" size={20} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>BANKA / IBAN AYARLARI</Text>
            </View>

            <Text style={styles.label}>Banka IBAN Bilgisi</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={iban} onChangeText={setIban} placeholder="TR00..." />
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Firma / Üye Ünvanı (IBAN Alıcı)</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={companyTitle} onChangeText={setCompanyTitle} placeholder="TAKSİM LTD. ŞTİ." />
            </View>

            <TouchableOpacity style={styles.sectionSaveBtn} onPress={handleSaveIban}>
              <Text style={styles.sectionSaveText}>IBAN BİLGİLERİNİ KAYDET</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ödeme API Ayarları Bölümü */}
        {activeTab === 'api' && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="api" size={20} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>ÖDEME SİSTEMİ (API) AYARLARI</Text>
            </View>

            <Text style={styles.label}>Ödeme API Anahtarı (Public Key)</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={apiKey} onChangeText={setApiKey} placeholder="api_key_..." secureTextEntry />
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>API Gizli Anahtar (Secret Key)</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={apiSecret} onChangeText={setApiSecret} placeholder="shak_..." secureTextEntry />
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Üye İşyeri ID (Merchant ID)</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={merchantId} onChangeText={setMerchantId} placeholder="1234567" />
            </View>

            <TouchableOpacity style={styles.sectionSaveBtn} onPress={handleSavePaymentApi}>
              <Text style={styles.sectionSaveText}>API AYARLARINI KAYDET</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Uygulama Ayarları Bölümü */}
        {activeTab === 'app' && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="tune" size={20} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>UYGULAMA AYARLARI</Text>
            </View>

            <Text style={styles.label}>Başvuru Ücreti (TL)</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={fee} onChangeText={setFee} keyboardType="numeric" />
              <Text style={styles.suffix}>TL</Text>
            </View>

            <TouchableOpacity style={styles.sectionSaveBtn} onPress={handleSaveApp}>
              <Text style={styles.sectionSaveText}>ÜCRETİ GÜNCELLE</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sunucu Ayarları Bölümü */}
        {activeTab === 'server' && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="server" size={20} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>SUNUCU AYARLARI</Text>
            </View>

            <Text style={styles.label}>Backend API Adresi (URL)</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={apiUrl} onChangeText={setApiUrl} placeholder="https://api..." autoCapitalize="none" />
            </View>

            <TouchableOpacity style={styles.sectionSaveBtn} onPress={handleSaveServer}>
              <Text style={styles.sectionSaveText}>SUNUCU ADRESİNİ KAYDET</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    height: 60,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  tabBar: {
    backgroundColor: Colors.primary,
    maxHeight: 50,
  },
  tabBarContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'white',
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabText: {
    color: 'black',
  },
  content: { padding: 16, marginTop: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, color: Colors.grey, textTransform: 'uppercase' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#F9F9F9',
  },
  input: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.secondary },
  suffix: { fontSize: 15, fontWeight: 'bold', color: Colors.grey },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: Colors.secondary, letterSpacing: 1.2 },
  sectionSaveBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  sectionSaveText: { color: 'black', fontWeight: 'bold', fontSize: 14 }
});
