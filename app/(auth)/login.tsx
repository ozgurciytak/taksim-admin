import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const { login, isLoading, systemSettings, updateSettings } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const REMEMBER_ME_KEY = 'ADMIN_REMEMBER_ME_DATA';

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const saved = await AsyncStorage.getItem(REMEMBER_ME_KEY);
        if (saved) {
          const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (e) {
        console.error('Failed to load saved credentials:', e);
      }
    };
    loadSavedCredentials();
  }, []);
  
  // API Config Modal states
  const [isConfigVisible, setIsConfigVisible] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(systemSettings.backend.apiUrl);
  const [tempApiKey, setTempApiKey] = useState(systemSettings.payment.apiKey);

  const getTitle = () => {
    switch (role) {
      case 'admin': return 'Yönetici Girişi';
      case 'owner': return 'Taksi Sahibi Girişi';
      case 'driver': return 'Şoför Girişi';
      default: return 'Giriş Yap';
    }
  };

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const success = await login(cleanEmail, password, role || 'admin');
    if (success) {
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({ email: cleanEmail, password }));
      } else {
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      }
      router.replace('/');
    } else {
      setError('E-posta veya şifre hatalı');
    }
  };

  const handleSaveConfig = () => {
    updateSettings({
      ...systemSettings,
      payment: {
        ...systemSettings.payment,
        apiKey: tempApiKey
      },
      backend: {
        ...systemSettings.backend,
        apiUrl: tempApiUrl
      }
    });
    setIsConfigVisible(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <MaterialCommunityIcons name="account" size={50} color={Colors.primary} />
          </View>
          <Text style={styles.title}>{getTitle()}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>E-posta Adresi</Text>
          <TextInput
            style={styles.input}
            placeholder="e-posta@test.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="******"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity 
            style={styles.rememberMeContainer} 
            onPress={() => setRememberMe(!rememberMe)}
          >
            <MaterialCommunityIcons 
              name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"} 
              size={20} 
              color={rememberMe ? Colors.primary : Colors.grey} 
            />
            <Text style={styles.rememberMeText}>Beni Hatırla</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPass}>
            <Text style={styles.forgotPassText}>Şifremi Unuttum?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.loginButtonText}>GİRİŞ YAP</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.apiConfigToggle} 
          onPress={() => {
            setTempApiUrl(systemSettings.backend.apiUrl);
            setTempApiKey(systemSettings.payment.apiKey);
            setIsConfigVisible(true);
          }}
        >
          <MaterialCommunityIcons name="api" size={16} color={Colors.grey} />
          <Text style={styles.apiConfigText}>Sunucu: {systemSettings.backend.apiUrl}</Text>
        </TouchableOpacity>

        <Modal
          visible={isConfigVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>API Ayarları</Text>
              
              <Text style={styles.modalLabel}>Backend URL</Text>
              <TextInput
                style={styles.modalInput}
                value={tempApiUrl}
                onChangeText={setTempApiUrl}
                placeholder="https://..."
                autoCapitalize="none"
              />

              <Text style={styles.modalLabel}>Ödeme API Anahtarı</Text>
              <TextInput
                style={styles.modalInput}
                value={tempApiKey}
                onChangeText={setTempApiKey}
                placeholder="sk_test..."
                autoCapitalize="none"
                secureTextEntry
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.cancelBtn]} 
                  onPress={() => setIsConfigVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.saveBtn]} 
                  onPress={handleSaveConfig}
                >
                  <Text style={styles.saveBtnText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
  },
  errorText: {
    color: Colors.error,
    marginTop: 8,
    fontSize: 12,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  forgotPassText: {
    color: Colors.primary,
    fontSize: 14,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.secondary,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  registerLink: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  apiConfigToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
  },
  apiConfigText: {
    fontSize: 12,
    color: Colors.grey,
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    padding: 24,
    borderRadius: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.secondary,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
  },
  cancelBtn: {
    backgroundColor: '#F2F2F7',
  },
  saveBtnText: {
    fontWeight: 'bold',
    color: 'black',
  },
  cancelBtnText: {
    color: Colors.secondary,
  },
});
