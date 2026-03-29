import React, { createContext, useContext, useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

type UserRole = 'admin' | 'owner' | 'driver' | null;

interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string;
  plateNumber?: string;
  rating?: number;
  balance: number;
  password?: string;
  currentWorkInfo?: any;
}

interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'card' | 'havale';
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

interface PaymentSettings {
  iban: string;
  companyTitle: string;
  apiKey: string;
  apiSecret: string;
  merchantId: string;
}

interface AppSettings {
  applicationFee: number;
}

interface BackendSettings {
  apiUrl: string;
}

interface SystemSettings {
  payment: PaymentSettings;
  app: AppSettings;
  backend: BackendSettings;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  payments: Payment[];
  approvePayment: (paymentId: string) => Promise<void>;
  rejectPayment: (paymentId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  systemSettings: SystemSettings;
  updateSettings: (settings: SystemSettings) => Promise<void>;
  allUsers: User[];
  allPosts: any[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@taksim_admin_data';
const DEFAULT_API_URL = 'http://localhost:3000';
const API_URL_KEY = '@taksim_api_url';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [connectionError, setConnectionError] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState('');
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({ 
    payment: { iban: '', companyTitle: '', apiKey: '', apiSecret: '', merchantId: '' },
    app: { applicationFee: 1 },
    backend: { apiUrl: DEFAULT_API_URL }
  });

  const API_URL = systemSettings.backend.apiUrl || DEFAULT_API_URL;

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Load API URL from Local Storage (Priority)
      const cachedApiUrl = await AsyncStorage.getItem(API_URL_KEY);
      if (cachedApiUrl) {
        setSystemSettings(prev => ({ ...prev, backend: { apiUrl: cachedApiUrl } }));
      }

      // 2. Load Session from AsyncStorage
      const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) setUser(JSON.parse(savedUser));

      // 3. Load Settings from API (using the loaded URL or default)
      const currentUrl = cachedApiUrl || DEFAULT_API_URL;
      const settingsRes = await fetch(`${currentUrl}/systemSettings`);
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        // Don't overwrite the backend.apiUrl with whatever the server has if we already have a working URL
        const fixedSettings = {
          ...settings,
          backend: {
            ...settings.backend,
            apiUrl: currentUrl // Maintain the URL that actually worked
          }
        };
        setSystemSettings(fixedSettings);
      }

      // 4. Load Payments from API
      const currentUrlP = cachedApiUrl || DEFAULT_API_URL;
      const paymentsRes = await fetch(`${currentUrlP}/payments?_sort=date&_order=desc`);
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data);
      }

      // 5. Load All Users & Posts for stats
      const usersRes = await fetch(`${currentUrl}/users`);
      if (usersRes.ok) setAllUsers(await usersRes.json());

      const postsRes = await fetch(`${currentUrl}/posts`);
      if (postsRes.ok) setAllPosts(await postsRes.json());

      setConnectionError(false);
    } catch (e) {
      console.error('Initial load failed:', e);
      setConnectionError(true);
      setTempApiUrl(API_URL);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const login = async (email: string, pass: string, role: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/users?email=${email.toLowerCase()}&password=${pass}&role=${role}`);
      const data = await res.json();
      
      if (data.length > 0) {
        const loggedUser = data[0];
        if (loggedUser.status === 'passive') {
          Alert.alert('Hata', 'Hesabınız pasif durumdadır. Lütfen yönetimle iletişime geçin.');
          setIsLoading(false);
          return false;
        }
        setUser(loggedUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
        setIsLoading(false);
        return true;
      }
    } catch (e) {
      console.error('Login failed:', e);
    }
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateSettings = async (newSettings: SystemSettings) => {
    // 1. Basic URL normalization
    let apiUrl = newSettings.backend.apiUrl.trim();
    if (apiUrl && !apiUrl.startsWith('http')) {
      apiUrl = 'http://' + apiUrl;
    }
    const sanitizedSettings = {
      ...newSettings,
      backend: { ...newSettings.backend, apiUrl }
    };

    // 2. Always update local state and AsyncStorage immediately
    setSystemSettings(sanitizedSettings);
    if (apiUrl) {
      await AsyncStorage.setItem(API_URL_KEY, apiUrl);
    }

    // 3. Try to sync with server and REFRESH data
    try {
      await fetch(`${apiUrl}/systemSettings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedSettings)
      });
      // Trigger a full reload of payments/users from the NEW url
      loadInitialData();
    } catch (e) {
      console.warn('Could not sync settings with server, but local URL updated.');
      loadInitialData(); // Still try to load data from the new URL
    }
  };

  const approvePayment = async (paymentId: string) => {
    try {
      // 1. Get Payment 
      const pRes = await fetch(`${API_URL}/payments/${paymentId}`);
      const payment = await pRes.json();

      // 2. Update Payment Status
      await fetch(`${API_URL}/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      // 3. Update User Balance
      const uRes = await fetch(`${API_URL}/users/${payment.userId}`);
      const userData = await uRes.json();
      await fetch(`${API_URL}/users/${payment.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: (userData.balance || 0) + payment.amount })
      });

      // 4. Reload local data
      loadInitialData();
    } catch (e) {
      console.error('Approval failed:', e);
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      await fetch(`${API_URL}/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      loadInitialData();
    } catch (e) {
      console.error('Rejection failed:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      isAuthenticated: !!user,
      payments,
      approvePayment,
      rejectPayment,
      systemSettings,
      updateSettings,
      allUsers,
      allPosts,
      refreshData: loadInitialData
    }}>
      {children}
      
      <Modal visible={connectionError} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.modalTitle}>Bağlantı Hatası</Text>
            <Text style={styles.modalText}>
              Sunucuya bağlanılamadı. Lütfen IP adresini veya tünel adresini kontrol edin.
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={tempApiUrl}
              onChangeText={setTempApiUrl}
              placeholder="http://192.168.1.XX:3000"
              autoCapitalize="none"
            />
            
            <TouchableOpacity 
              style={styles.retryBtn} 
              onPress={() => updateSettings({ ...systemSettings, backend: { apiUrl: tempApiUrl } })}
            >
              <Text style={styles.retryBtnText}>TEKRAR DENE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  modalText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    marginBottom: 20,
    fontSize: 16,
  },
  retryBtn: {
    backgroundColor: '#007AFF',
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
