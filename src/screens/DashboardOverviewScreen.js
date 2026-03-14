import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import API from '../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardOverviewScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      const [statsRes, reportRes] = await Promise.all([
        API.get('/dashboard/getStats', { headers: { Authorization: `Bearer ${token}` } }),
        API.get('/dashboard/getSalesReport', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (statsRes.data && reportRes.data) {
        setStats(statsRes.data);
        setReport(reportRes.data);
      } else {
        setError("Failed to fetch dashboard data");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Error connecting to server");
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.replace('Auth');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading business insights...</Text>
      </View>
    );
  }

  const p = stats?.profitSummary;
  const netPositive = p && p.netProfit >= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard Overview</Text>
            <Text style={styles.subtitle}>Real-time business performance</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {stats && (
          <>
            {/* Quick Stats Grid */}
            <View style={styles.grid}>
              <View style={[styles.statCard, { borderLeftColor: '#3b82f6', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>Total Customers</Text>
                <Text style={styles.statValue}>{stats.customers}</Text>
                <Text style={styles.statFooter}>Registered accounts</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#f97316', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>Total Suppliers</Text>
                <Text style={styles.statValue}>{stats.suppliers}</Text>
                <Text style={styles.statFooter}>Active relationships</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#8b5cf6', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>Total Products</Text>
                <Text style={styles.statValue}>{stats.products}</Text>
                <Text style={styles.statFooter}>Items in inventory</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#ef4444', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>Total Expenses</Text>
                <Text style={styles.statValue}>{stats.expensesCount}</Text>
                <Text style={styles.statFooter}>Recorded transactions</Text>
              </View>
            </View>

            {/* Profit Overview */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Business Profit Overview</Text>
                <View style={[styles.badge, netPositive ? styles.badgeSuccess : styles.badgeDanger]}>
                  <Text style={[styles.badgeText, netPositive ? styles.badgeTextSuccess : styles.badgeTextDanger]}>
                    {netPositive ? '▲ Profitable' : '▼ Net Loss'}
                  </Text>
                </View>
              </View>
              <View style={styles.profitGrid}>
                <ProfitRow emoji="💰" label="Total Revenue (Sales)" value={p?.revenue} positive={true} />
                <ProfitRow emoji="📦" label="Cost of Goods (Suppliers)" value={p?.supplierCosts} positive={false} />
                <ProfitRow emoji="🧾" label="Operating Expenses" value={p?.otherExpenses} positive={false} />
                <View style={[styles.profitRow, styles.netProfitRow, netPositive ? styles.netProfitPos : styles.netProfitNeg]}>
                  <Text style={styles.profitEmoji}>📈</Text>
                  <View style={styles.profitInfo}>
                    <Text style={[styles.profitLabel, { fontWeight: 'bold' }]}>Net Profit</Text>
                    <Text style={[styles.profitValue, netPositive ? styles.valPos : styles.valNeg, { fontSize: 18, fontWeight: 'bold' }]}>
                      LKR {Number(p?.netProfit || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Recent Sales */}
            {report?.recentSales?.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Recent Sales</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 2 }]}>Customer</Text>
                  <Text style={[styles.th, { flex: 2 }]}>Product</Text>
                  <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Total</Text>
                </View>
                {report.recentSales.map((sale, idx) => (
                  <View key={`sale-${idx}`} style={styles.tableRow}>
                    <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>{sale.customer_name}</Text>
                    <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>{sale.product}</Text>
                    <Text style={[styles.td, { flex: 1.5, textAlign: 'right', fontWeight: '600' }]} numberOfLines={1}>
                      {(sale.quantity * sale.unit_price).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Top Selling Products */}
            {report?.topProducts?.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Top Selling Products</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: 30 }]}>#</Text>
                  <Text style={[styles.th, { flex: 2 }]}>Product</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Qty</Text>
                  <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Revenue</Text>
                </View>
                {report.topProducts.map((prod, idx) => (
                  <View key={`prod-${idx}`} style={styles.tableRow}>
                    <Text style={[styles.td, { width: 30, color: '#6b7280', fontWeight: 'bold' }]}>{idx + 1}</Text>
                    <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>{prod.product}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>{Number(prod.total_quantity).toLocaleString()}</Text>
                    <Text style={[styles.td, { flex: 1.5, textAlign: 'right', fontWeight: '600', color: '#10b981' }]} numberOfLines={1}>
                      {Number(prod.total_revenue).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const ProfitRow = ({ emoji, label, value, positive }) => (
  <View style={styles.profitRow}>
    <Text style={styles.profitEmoji}>{emoji}</Text>
    <View style={styles.profitInfo}>
      <Text style={styles.profitLabel}>{label}</Text>
      <Text style={[styles.profitValue, positive ? styles.valPos : styles.valNeg]}>
        LKR {Number(value || 0).toLocaleString()}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280' },
  logoutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  logoutBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorBanner: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { 
    backgroundColor: '#fff', width: '48%', padding: 16, borderRadius: 12, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 
  },
  statLabel: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  statFooter: { fontSize: 11, color: '#9ca3af' },

  sectionCard: { 
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeSuccess: { backgroundColor: '#d1fae5' },
  badgeDanger: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextSuccess: { color: '#065f46' },
  badgeTextDanger: { color: '#991b1b' },

  profitGrid: { gap: 12 },
  profitRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, marginBottom: 8 },
  netProfitRow: { marginTop: 8, padding: 16 },
  netProfitPos: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1 },
  netProfitNeg: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 },
  profitEmoji: { fontSize: 24, marginRight: 12 },
  profitInfo: { flex: 1 },
  profitLabel: { fontSize: 13, color: '#4b5563', marginBottom: 2 },
  profitValue: { fontSize: 16, fontWeight: '600' },
  valPos: { color: '#10b981' },
  valNeg: { color: '#ef4444' },

  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 8, marginBottom: 8 },
  th: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  td: { fontSize: 13, color: '#374151' },
});

export default DashboardOverviewScreen;
