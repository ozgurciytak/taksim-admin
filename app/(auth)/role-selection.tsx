import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RoleSelectionScreen() {
  const router = useRouter();

  const RoleButton = ({ icon, title, color, textColor, borderColor, role }: any) => (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: color, borderColor: borderColor || color, borderWidth: borderColor ? 2 : 0 }
      ]}
      onPress={() => router.push({ pathname: '/(auth)/login', params: { role } })}
    >
      <Text style={styles.buttonIcon}>{icon}</Text>
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="taxi" size={60} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Hoş Geldiniz</Text>
        <Text style={styles.subtitle}>Lütfen giriş yapmak istediğiniz rolü seçin</Text>

        <View style={styles.buttonContainer}>
          <RoleButton
            icon="🛡️"
            title="YÖNETİCİ GİRİŞİ"
            color={Colors.secondary}
            textColor="white"
            role="admin"
          />
        </View>

        <View style={styles.registerContainer}>
          <Text style={{ textAlign: 'center', color: Colors.grey }}>
            Bu uygulama sadece İstanbul Taksiciler Odası yetkililerine özeldir.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    alignItems: 'center',
  },
  headerIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 32,
  },
  registerLink: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.lightGrey,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.grey,
    fontSize: 12,
    fontWeight: 'bold',
  },
  adminContainer: {
    width: '100%',
    alignItems: 'center',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
  },
  adminButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
});
