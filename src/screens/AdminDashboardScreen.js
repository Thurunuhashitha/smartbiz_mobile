import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axiosConfig';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [aiUsage, setAiUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes, aiRes] = await Promise.all([
        API.get('/admin/system-stats'),
        API.get('/admin/logs'),
        API.get('/admin/ai-usage')
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data);
      setAiUsage(aiRes.data);
    } catch (err) {
      console.log('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Command Center</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtnSmall}>
            <Text style={styles.logoutIconSmall}>🚪</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading system data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Command Center</Text>
          <Text style={styles.subtitle}>System Overview</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
            <Text style={styles.refreshBtnText}>↻</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtnSmall} onPress={handleLogout}>
            <Text style={styles.logoutIconSmall}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Navigation to Plans */}
        <TouchableOpacity style={styles.managePlansBtn} onPress={() => navigation.navigate('AdminPlans')}>
          <View style={styles.managePlansContent}>
            <Text style={styles.managePlansIcon}>⭐</Text>
            <View>
              <Text style={styles.managePlansTitle}>Manage Subscription Plans</Text>
              <Text style={styles.managePlansSub}>Create, edit, and configure system tiers</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Companies</Text>
              <Text style={styles.statIcon}>🏢</Text>
            </View>
            <Text style={styles.statValue}>{(stats?.totalCompanies || 0).toLocaleString()}</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Total Users</Text>
              <Text style={styles.statIcon}>👥</Text>
            </View>
            <Text style={styles.statValue}>{(stats?.totalUsers || 0).toLocaleString()}</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Revenue</Text>
              <Text style={styles.statIcon}>💰</Text>
            </View>
            <Text style={styles.statValue}>${parseFloat(stats?.totalRevenue || 0).toLocaleString()}</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#8b5cf6' }]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>AI Requests</Text>
              <Text style={styles.statIcon}>🤖</Text>
            </View>
            <Text style={styles.statValue}>{(stats?.aiRequests || 0).toLocaleString()}</Text>
          </View>
        </View>

        {/* Active Companies Insight */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Active Engagement</Text>
          <View style={styles.engagementRow}>
            <View style={styles.activeCircle}>
              <Text style={styles.activeNumber}>{stats?.activeCompanies || 0}</Text>
            </View>
            <View style={styles.activeDesc}>
              <Text style={styles.activeLabel}>Companies engaged</Text>
              <Text style={styles.activeSub}>Active in the last 30 days</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity Logs */}
        <View style={styles.logsSection}>
          <View style={styles.logsHeader}>
            <Text style={styles.logsTitle}>System Activity Logs</Text>
            <Text style={styles.badge}>{logs.length} entries</Text>
          </View>

          {logs.slice(0, 50).map((log, index) => (
            <View key={log.log_id || index} style={styles.logItem}>
              <View style={styles.logTop}>
                <View style={[styles.methodBadge, { backgroundColor: log.method === 'GET' ? '#dbe1ff' : log.method === 'POST' ? '#d1fae5' : log.method === 'PUT' ? '#fef3c7' : '#fee2e2' }]}>
                  <Text style={[styles.methodText, { color: log.method === 'GET' ? '#3b82f6' : log.method === 'POST' ? '#10b981' : log.method === 'PUT' ? '#d97706' : '#ef4444' }]}>{log.method}</Text>
                </View>
                <Text style={styles.logPath} numberOfLines={1} ellipsizeMode="tail">{log.path}</Text>
              </View>
              <View style={styles.logBottom}>
                <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</Text>
                <View style={styles.logMeta}>
                  <Text style={styles.logStatus}>{log.status_code}</Text>
                  <Text style={styles.logCompany}>Co: {log.company_id || 'sys'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1e293b' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  refreshBtn: { backgroundColor: '#334155', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  refreshBtnText: { color: '#e2e8f0', fontSize: 18, fontWeight: 'bold' },
  logoutBtnSmall: { backgroundColor: '#334155', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#475569' },
  logoutIconSmall: { fontSize: 18 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#64748b' },

  container: { padding: 16, paddingBottom: 40 },

  managePlansBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  managePlansContent: { flexDirection: 'row', alignItems: 'center' },
  managePlansIcon: { fontSize: 28, marginRight: 16 },
  managePlansTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  managePlansSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  chevron: { fontSize: 24, color: '#94a3b8' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  statIcon: { fontSize: 16, opacity: 0.8 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },

  insightCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  insightTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  engagementRow: { flexDirection: 'row', alignItems: 'center' },
  activeCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 4, borderColor: '#10b981' },
  activeNumber: { fontSize: 22, fontWeight: 'bold', color: '#065f46' },
  activeDesc: { flex: 1 },
  activeLabel: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  activeSub: { fontSize: 13, color: '#64748b', marginTop: 4 },

  logsSection: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  logsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#f8fafc' },
  logsTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  badge: { backgroundColor: '#e2e8f0', color: '#475569', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 12, fontWeight: 'bold' },
  
  logItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  logTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  methodBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  methodText: { fontSize: 10, fontWeight: 'bold' },
  logPath: { flex: 1, fontSize: 13, color: '#334155', fontFamily: 'monospace' },
  
  logBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logTime: { fontSize: 12, color: '#94a3b8' },
  logMeta: { flexDirection: 'row', gap: 8 },
  logStatus: { fontSize: 11, fontWeight: 'bold', color: '#64748b', backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  logCompany: { fontSize: 11, fontWeight: 'bold', color: '#64748b', backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
});

export default AdminDashboardScreen;
