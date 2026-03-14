import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Clipboard } from 'react-native';
import API from '../api/axiosConfig';

const TABS = [
  { id: 'report', label: '📊 Performance', desc: 'Get a summary of sales and expenses.' },
  { id: 'email', label: '✉️ Emails', desc: 'Draft follow-ups or resolutions instantly.' },
  { id: 'marketing', label: '💬 Marketing', desc: 'Create engaging social media posts.' },
];

const AiInsightsScreen = () => {
  const [activeTab, setActiveTab] = useState('report');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // Form states
  const [reportTimeframe, setReportTimeframe] = useState('Last Month');
  const [emailDetails, setEmailDetails] = useState({ name: '', context: '', type: 'follow-up' });
  const [marketingDetails, setMarketingDetails] = useState({ platform: 'Facebook', details: '', tone: 'Professional & Catchy' });

  const copyToClipboard = () => {
    if (result) {
      Clipboard.setString(result);
      Alert.alert('Copied', 'Text copied to clipboard');
    }
  };

  const generateReport = async () => {
    setLoading(true); setResult('');
    try {
      const [salesRes, expenseRes] = await Promise.all([
        API.get('/customer/getAllCustomers'),
        API.get('/expense/getAllExpenses'),
      ]);
      const salesData = salesRes.data || [];
      const expenseData = expenseRes.data || [];
      const aiRes = await API.post('/ai/report', { 
        timeframe: reportTimeframe, 
        salesData: salesData.slice(0, 50), 
        expenseData: expenseData.slice(0, 50) 
      });
      setResult(aiRes.data.result || 'No content generated.');
    } catch (err) {
      setResult(`Error: ${err?.response?.data?.error || 'Failed to connect to AI server.'}`);
    }
    setLoading(false);
  };

  const generateEmail = async () => {
    if (!emailDetails.name || !emailDetails.context) {
      return Alert.alert('Error', 'Please fill in customer name and context.');
    }
    setLoading(true); setResult('');
    try {
      const res = await API.post('/ai/email', {
        customerName: emailDetails.name, 
        context: emailDetails.context, 
        type: emailDetails.type
      });
      setResult(res.data.result || 'No content generated.');
    } catch (err) {
      setResult(`Error: ${err?.response?.data?.error || 'Failed to connect to AI server.'}`);
    }
    setLoading(false);
  };

  const generateMarketing = async () => {
    if (!marketingDetails.details) {
      return Alert.alert('Error', 'Please provide product details.');
    }
    setLoading(true); setResult('');
    try {
      const res = await API.post('/ai/marketing', {
        platform: marketingDetails.platform, 
        productDetails: marketingDetails.details, 
        tone: marketingDetails.tone
      });
      setResult(res.data.result || 'No content generated.');
    } catch (err) {
      setResult(`Error: ${err?.response?.data?.error || 'Failed to connect to AI server.'}`);
    }
    setLoading(false);
  };

  const handleGenerate = () => {
    if (activeTab === 'report') generateReport();
    else if (activeTab === 'email') generateEmail();
    else generateMarketing();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Insights</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>● Online</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContainer}>
          {TABS.map(tab => (
            <TouchableOpacity 
              key={tab.id} 
              style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
              onPress={() => { setActiveTab(tab.id); setResult(''); }}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{TABS.find(t=>t.id === activeTab)?.label?.replace(/[^a-zA-Z\s]/g, '')}</Text>
          <Text style={styles.panelDesc}>{TABS.find(t=>t.id === activeTab)?.desc}</Text>

          {activeTab === 'report' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Timeframe</Text>
              <TextInput style={styles.input} placeholder="e.g. Last Month" value={reportTimeframe} onChangeText={setReportTimeframe} />
              <Text style={styles.hint}>ℹ️ Pulls up to 50 recent records</Text>
            </View>
          )}

          {activeTab === 'email' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Customer Name</Text>
              <TextInput style={styles.input} placeholder="e.g. John Doe" value={emailDetails.name} onChangeText={n => setEmailDetails({...emailDetails, name: n})} />
              <Text style={styles.label}>Email Type</Text>
              <TextInput style={styles.input} placeholder="follow-up, complaint, appreciation" value={emailDetails.type} onChangeText={t => setEmailDetails({...emailDetails, type: t})} />
              <Text style={styles.label}>Context / Details</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Briefly describe the situation..." value={emailDetails.context} onChangeText={c => setEmailDetails({...emailDetails, context: c})} />
            </View>
          )}

          {activeTab === 'marketing' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Platform</Text>
              <TextInput style={styles.input} placeholder="Facebook, Instagram, LinkedIn" value={marketingDetails.platform} onChangeText={p => setMarketingDetails({...marketingDetails, platform: p})} />
              <Text style={styles.label}>Tone</Text>
              <TextInput style={styles.input} placeholder="Professional, Excited, Witty" value={marketingDetails.tone} onChangeText={t => setMarketingDetails({...marketingDetails, tone: t})} />
              <Text style={styles.label}>Product / Sale Details</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline placeholder="e.g. New wireless headphones, 20% off" value={marketingDetails.details} onChangeText={d => setMarketingDetails({...marketingDetails, details: d})} />
            </View>
          )}

          <TouchableOpacity style={[styles.generateBtn, loading && styles.generateBtnDisabled]} onPress={handleGenerate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateBtnText}>✨ Generate with AI</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.resultPanel}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Output</Text>
            {result ? (
              <TouchableOpacity onPress={copyToClipboard}><Text style={styles.copyText}>📑 Copy</Text></TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.resultBody}>
            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text style={styles.loadingText}>Consulting AI...</Text>
              </View>
            ) : result ? (
              <Text style={styles.resultText}>{result}</Text>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✨</Text>
                <Text style={styles.emptyText}>Fill in the form and click generate</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  badge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#166534', fontSize: 12, fontWeight: 'bold' },

  container: { padding: 16, paddingBottom: 40 },
  tabsScroll: { flexGrow: 0, marginBottom: 16 },
  tabsContainer: { gap: 12, paddingBottom: 4 },
  tabBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  tabBtnActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#4b5563' },
  tabTextActive: { color: '#fff' },

  panel: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  panelTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  panelDesc: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 12 },
  textArea: { height: 100, textAlignVertical: 'top' },
  hint: { fontSize: 12, color: '#6b7280', marginTop: -4 },
  
  generateBtn: { backgroundColor: '#8b5cf6', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  generateBtnDisabled: { opacity: 0.7 },
  generateBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  resultPanel: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f3f4f6', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  copyText: { fontSize: 14, color: '#8b5cf6', fontWeight: '600' },
  resultBody: { padding: 16, minHeight: 150 },
  loadingState: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6b7280' },
  resultText: { fontSize: 15, color: '#111827', lineHeight: 24 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
});

export default AiInsightsScreen;
