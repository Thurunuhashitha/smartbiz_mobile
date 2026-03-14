import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import API from '../api/axiosConfig';

const SalesScreen = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/customer/getAllCustomers');
      if (res.data) setSales(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to fetch sales');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.unit_price) * Number(s.quantity), 0);
  const totalSales = sales.length;
  
  const bestSellingProduct = (() => {
    if (!sales.length) return "—";
    const counts: any = {};
    sales.forEach((s) => {
      counts[s.product] = (counts[s.product] || 0) + Number(s.quantity);
    });
    return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0][0];
  })();

  const renderItem = ({ item }: any) => {
    const total = Number(item.unit_price) * Number(item.quantity);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.idBadge}>#{item.cID}</Text>
          <Text style={styles.dateText}>
            {item.sale_date ? new Date(item.sale_date).toLocaleDateString() : '—'}
          </Text>
        </View>
        <View style={styles.productRow}>
          <Text style={styles.productName}>📦 {item.product}</Text>
          <Text style={styles.totalText}>LKR {total.toLocaleString()}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailItem}>{item.quantity} units</Text>
          <Text style={styles.detailItem}>@ LKR {Number(item.unit_price).toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales Overview</Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Summary Cards */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll} contentContainerStyle={styles.summaryContainer}>
          <View style={[styles.summaryCard, { borderLeftColor: '#0d9488' }]}>
            <Text style={styles.summaryValue}>LKR {totalRevenue.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#3b82f6' }]}>
            <Text style={styles.summaryValue}>{totalSales} records</Text>
            <Text style={styles.summaryLabel}>Total Sales</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#8b5cf6' }]}>
            <Text style={styles.summaryValue} numberOfLines={1}>{bestSellingProduct}</Text>
            <Text style={styles.summaryLabel}>Best Selling</Text>
          </View>
        </ScrollView>
      </View>

      {loading && sales.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading sales data...</Text>
        </View>
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => String(item.cID)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={() => (
            sales.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Sales Records</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{sales.length}</Text></View>
              </View>
            ) : null
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🧾</Text>
              <Text style={styles.emptyTitle}>No sales records found</Text>
              <Text style={styles.emptySub}>Sales are recorded automatically when customers are added.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  errorBanner: { backgroundColor: '#fee2e2', padding: 12, margin: 16, borderRadius: 8 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  
  summaryScroll: { flexGrow: 0 },
  summaryContainer: { padding: 16, gap: 12 },
  summaryCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, width: 160, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderLeftWidth: 4 },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  summaryLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  
  listContainer: { padding: 16, paddingBottom: 40 },
  listHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginRight: 12 },
  badge: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#4f46e5', fontSize: 12, fontWeight: '600' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  idBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: 'bold', color: '#6b7280' },
  dateText: { fontSize: 12, color: '#6b7280' },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  productName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#0d9488' },
  detailsRow: { flexDirection: 'row', gap: 12 },
  detailItem: { fontSize: 13, color: '#4b5563', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
});

export default SalesScreen;
