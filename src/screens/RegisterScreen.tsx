import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import API from '../api/axiosConfig';

const RegisterScreen = ({ navigation }: any) => {
  const [companyName, setCompanyName] = useState('');
  const [owner, setOwner] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const register = async () => {
    setError('');
    if (!companyName || !owner || !email || !phone || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/register', {
        company_name: companyName,
        owner,
        email,
        phone,
        password,
      });
      navigation.navigate('Login');
    } catch (err: any) {
      console.warn('Registration Error:', err);
      if (err.response) {
        setError(err.response.data.error || err.response.data.message || 'Registration failed. Please try again.');
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
            <Text style={styles.brandName}>SmartBiz</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Create your account</Text>
            <Text style={styles.formSubtitle}>Set up your SmartBiz business profile</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput style={styles.input} placeholder="e.g. ABC Trading Co." placeholderTextColor="#9ca3af" value={companyName} onChangeText={setCompanyName} autoCapitalize="words" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Owner Name</Text>
              <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#9ca3af" value={owner} onChangeText={setOwner} autoCapitalize="words" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} placeholder="e.g. 0771234567" placeholderTextColor="#9ca3af" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} placeholder="company@email.com" placeholderTextColor="#9ca3af" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Min. 8 characters"
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
              style={[styles.btn, loading && styles.btnDisabled]} 
              onPress={register} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>Sign in here</Text>
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
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 40, paddingBottom: 40 },
  brandContainer: { alignItems: 'center', marginBottom: 24 },
  brandName: { fontSize: 24, fontWeight: '800', color: '#111827' },
  formContainer: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  formTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 6 },
  formSubtitle: { fontSize: 15, color: '#6b7280', marginBottom: 24 },
  errorBox: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
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
  btn: {
    backgroundColor: '#4f46e5', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    marginTop: 12, marginBottom: 24
  },
  btnDisabled: { backgroundColor: '#818cf8', shadowOpacity: 0, elevation: 0 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#6b7280', fontSize: 14 },
  linkText: { color: '#4f46e5', fontSize: 14, fontWeight: '600' }
});

export default RegisterScreen;
