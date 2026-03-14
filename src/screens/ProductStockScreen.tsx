import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import API from '../api/axiosConfig';

const ProductStockScreen = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = async () => {
    setError(null);
    try {
      const res = await API.get('/product/getAllProducts');
      if (res.data) {
        setProducts(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error fetching stock data");
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    await fetchStock();
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStock();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  const getStockValue = (p: any) => Number(p.unit_price) * Number(p.current_stock);
  const totalStockValue = products.reduce((sum, p) => sum + getStockValue(p), 0);

  const renderItem = ({ item }: any) => {
    const stock = Number(item.current_stock);
    let stockColor = '#10b981'; // ok
    if (stock <= 10) stockColor = '#ef4444'; // low
    else if (stock <= 50) stockColor = '#f59e0b'; // mid

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.productId}>#{item.pID}</Text>
          <Text style={styles.productName} numberOfLines={1}>📦 {item.product_name}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Current Stock</Text>
            <View style={[styles.stockBadge, { backgroundColor: stockColor + '20' }]}>
              <Text style={[styles.stockText, { color: stockColor }]}>{item.current_stock} units</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Unit Price</Text>
            <Text style={styles.priceText}>LKR {Number(item.unit_price).toLocaleString()}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Stock Value</Text>
            <Text style={styles.valueText}>LKR {getStockValue(item).toLocaleString()}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Products & Stock</Text>
        <Text style={styles.subtitle}>View stock levels and values from supplier records</Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading stock data...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.pID.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Stock Overview</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{products.length} items</Text>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            products.length > 0 ? (
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total Stock Value (price × qty)</Text>
                <Text style={styles.totalValue}>LKR {totalStockValue.toLocaleString()}</Text>
              </View>
            ) : null
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No stock records found</Text>
              <Text style={styles.emptySub}>Stock is updated automatically when suppliers are added.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  errorBanner: { backgroundColor: '#fee2e2', padding: 12, margin: 16, borderRadius: 8 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  listContainer: { padding: 16, paddingBottom: 40 },
  listHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginRight: 12 },
  badge: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#4f46e5', fontSize: 12, fontWeight: '600' },
  
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  productId: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  productName: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
  
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  infoCol: { flex: 1 },
  label: { fontSize: 11, color: '#6b7280', marginBottom: 4 },
  priceText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  valueText: { fontSize: 13, color: '#111827', fontWeight: 'bold' },
  
  stockBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  stockText: { fontSize: 12, fontWeight: '600' },

  totalBox: { backgroundColor: '#4f46e5', borderRadius: 12, padding: 16, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#e0e7ff', fontSize: 13, flex: 1 },
  totalValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
});

export default ProductStockScreen;
