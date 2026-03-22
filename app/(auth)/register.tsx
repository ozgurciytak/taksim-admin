import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform, Switch, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, SegmentedButtons } from 'react-native-paper';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [role, setRole] = useState<string>((params.role as string) || 'owner');
  
  // Ortak Alanlar
  const [fullName, setFullName] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Taksi Sahibi Özel Alanlar
  const [plateNumber, setPlateNumber] = useState('');
  const [licenseInfo, setLicenseInfo] = useState('');

  // Şoför Özel Alanlar
  const [driverLicense, setDriverLicense] = useState('');
  const [needsEk6, setNeedsEk6] = useState(false);
  const [referenceName, setReferenceName] = useState('');
  const [referencePhone, setReferencePhone] = useState('');
  const [residence, setResidence] = useState('');
  const [targetRegion, setTargetRegion] = useState('');

  const handleRegister = () => {
    const data = {
      role, fullName, tcNo, phone, email, password,
      ...(role === 'owner' ? { plateNumber, licenseInfo } : { driverLicense, needsEk6, referenceName, referencePhone, residence, targetRegion })
    };
    console.log('Registering User:', data);
    Alert.alert('Başarılı', 'Kaydınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.', [
      { text: 'Tamam', onPress: () => router.replace('/(auth)/login') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color={Colors.secondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>Lütfen bilgilerinizi eksiksiz doldurun</Text>
          </View>

          <View style={styles.roleSelector}>
            <SegmentedButtons
              value={role}
              onValueChange={setRole}
              buttons={[
                { value: 'owner', label: 'Taksi Sahibi', icon: 'car-key' },
                { value: 'driver', label: 'Şoför', icon: 'account-tie-hat' },
              ]}
              theme={{ colors: { primary: Colors.primary, outline: Colors.lightGrey } }}
            />
          </View>

          <View style={styles.form}>
            {/* Ortak Alanlar */}
            <InputField icon="account" placeholder="Ad Soyad" value={fullName} onChangeText={setFullName} />
            <InputField icon="card-account-details" placeholder="TC Kimlik No" value={tcNo} onChangeText={setTcNo} keyboardType="numeric" maxLength={11} />
            <InputField icon="phone" placeholder="Telefon Numarası" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <InputField icon="email" placeholder="E-posta Adresi" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            
            {/* Role Özel Alanlar */}
            {role === 'owner' ? (
              <>
                <InputField icon="car-info" placeholder="Araç Plakası" value={plateNumber} onChangeText={setPlateNumber} autoCapitalize="characters" />
                <InputField icon="file-document" placeholder="Ruhsat Bilgileri" value={licenseInfo} onChangeText={setLicenseInfo} />
              </>
            ) : (
              <>
                <InputField icon="card-account-details-star" placeholder="Ehliyet Bilgisi" value={driverLicense} onChangeText={setDriverLicense} />
                <InputField icon="map-marker" placeholder="İkamet Bilgisi" value={residence} onChangeText={setResidence} />
                <InputField icon="map-search" placeholder="Çalışmak İstediği Bölge" value={targetRegion} onChangeText={setTargetRegion} />
                
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Ek-6 Belgesi İstiyor muyum?</Text>
                  <Switch value={needsEk6} onValueChange={setNeedsEk6} trackColor={{ true: Colors.primary }} />
                </View>

                <Text style={styles.sectionTitle}>Referans (İsteğe Bağlı)</Text>
                <InputField icon="account-plus" placeholder="Referans Ad Soyad" value={referenceName} onChangeText={setReferenceName} />
                <InputField icon="phone-plus" placeholder="Referans Telefon" value={referencePhone} onChangeText={setReferencePhone} keyboardType="phone-pad" />
              </>
            )}

            <InputField icon="lock" placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry />

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              labelStyle={styles.buttonLabel}
            >
              KAYIT OL
            </Button>
          </View>

          <View style={styles.footer}>
            <Text>Zaten bir hesabınız var mı? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputField = ({ icon, placeholder, value, onChangeText, ...props }: any) => (
  <View style={styles.inputContainer}>
    <MaterialCommunityIcons name={icon} size={20} color={Colors.grey} style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={Colors.grey}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grey,
  },
  roleSelector: {
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginTop: 8,
    marginBottom: -8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGrey,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginVertical: 4,
  },
  switchLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  registerButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
