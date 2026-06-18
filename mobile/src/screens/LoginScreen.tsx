import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Spacing } from '../constants/theme';

export default function LoginScreen() {
  const { login } = useApp();
  const [phone, setPhone] = useState('998901234567');
  const [password, setPassword] = useState('123456');

  const handleLogin = () => {
    const ok = login(phone, password);
    if (!ok) {
      Alert.alert('Xato', 'Telefon raqam yoki parol noto\'g\'ri');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logo}>WR</Text>
        </View>
        <Text style={styles.brand}>WORKRANK</Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.label}>Telefon raqam</Text>
        <TextInput
          style={styles.input}
          placeholder="998901234567"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Parol</Text>
        <TextInput
          style={styles.input}
          placeholder="Parol"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Kirish</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.link}>Parolni unutdingizmi?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logo: { fontSize: 32, fontWeight: '900', color: '#fff' },
  brand: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  form: { padding: Spacing.lg, flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: {
    textAlign: 'center',
    color: Colors.primary,
    marginTop: Spacing.md,
    fontSize: 14,
  },
});
