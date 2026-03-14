import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axiosConfig';

const LoginScreen = ({ navigation }) => {
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async () => {
    setError('');
    if (!companyName || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await API.post('/auth/login', {
        company_name: companyName,
        password: password,
      });

      await AsyncStorage.setItem('token', response.data.token);
      let userData = response.data.user;
      
      // Fallback for hardcoded admin login if backend doesn't return user object
      if (!userData && companyName === 'admin@gmail.com') {
        userData = { id: 0, company_name: 'admin@gmail.com', role: 'admin' };
      }

      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }

      // Role-based navigation redirection
      if (companyName === 'admin@gmail.com' || userData?.role === 'admin') {
        navigation.replace('MainDrawer', { screen: 'AdminDashboard' });
      } else {
        navigation.replace('MainDrawer');
      }

    } catch (err) {
      console.warn('Login Error:', err);
      if (err.response) {
        setError(err.response.data.error || err.response.data.message || 'Login failed. Please try again.');
      } else {
        setError(`Server not responding (${err.message}). Please try again.`);
      }
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>SB</Text>
            </View>
            <Text style={styles.brandName}>SmartBiz</Text>
            <Text style={styles.brandTagline}>Business Management Suite</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formSubtitle}>Sign in to your business account</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your company name"
                placeholderTextColor="#9ca3af"
                value={companyName}
                onChangeText={setCompanyName}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]} 
              onPress={login} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Create one here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brandContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#4f46e5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  logoText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  brandName: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  brandTagline: { fontSize: 16, color: '#6b7280' },
  formContainer: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  formTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 6 },
  formSubtitle: { fontSize: 15, color: '#6b7280', marginBottom: 24 },
  errorBox: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb'
  },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 10,
    borderWidth: 1, borderColor: '#e5e7eb', paddingRight: 16
  },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827' },
  eyeButton: { padding: 4 },
  eyeText: { color: '#4f46e5', fontWeight: '600', fontSize: 14 },
  loginBtn: {
    backgroundColor: '#4f46e5', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    marginTop: 8, marginBottom: 24
  },
  loginBtnDisabled: { backgroundColor: '#818cf8', shadowOpacity: 0, elevation: 0 },
  loginBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#6b7280', fontSize: 14 },
  linkText: { color: '#4f46e5', fontSize: 14, fontWeight: '600' }
});

export default LoginScreen;
