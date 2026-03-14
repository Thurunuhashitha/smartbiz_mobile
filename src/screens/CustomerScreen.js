import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView } from 'react-native';
import API from '../api/axiosConfig';

const CustomerScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  
  // Form State
  const [id, setId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [saleDate, setSaleDate] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/customer/getAllCustomers');
      if (res.data) setCustomers(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to fetch customers');
    }
    setLoading(false);
  };

  const fetchAvailableProducts = async () => {
    try {
      const res = await API.get('/product/getAvailableProducts');
      if (res.data) setAvailableProducts(res.data);
    } catch (err) {
      console.warn("Error fetching available products");
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchAvailableProducts();
  }, []);

  const resetForm = () => {
    setId(''); setCustomerName(''); setPhone(''); setEmail(''); 
    setProduct(''); setQuantity(''); setUnitPrice(''); setSaleDate('');
    setModalVisible(false);
    setActiveSection(null);
  };

  const openCreate = () => {
    resetForm();
    setActiveSection('create');
    setModalVisible(true);
  };

  const openEdit = (cust) => {
    if (cust) {
      setId(String(cust.cID));
      setCustomerName(cust.customer_name);
      setPhone(cust.phone);
      setEmail(cust.email);
      setProduct(cust.product);
      setQuantity(String(cust.quantity));
      setUnitPrice(String(cust.unit_price));
      setSaleDate(cust.sale_date || '');
    } else {
      resetForm();
    }
    setActiveSection('edit');
    setModalVisible(true);
  };

  const openDelete = (cust) => {
    if (cust) setId(String(cust.cID));
    else resetForm();
    setActiveSection('delete');
    setModalVisible(true);
  };

  const handleProductSelect = (selectedProductName) => {
    setProduct(selectedProductName);
    const selectedProd = availableProducts.find(p => p.product_name === selectedProductName);
    if (selectedProd) {
      setUnitPrice(String(selectedProd.unit_price));
    }
  };

  const handleCreate = async () => {
    if (!customerName || !phone || !email || !product || !quantity || !unitPrice) {
      return Alert.alert('Error', 'Please fill all required fields');
    }
    setActionLoading(true);
    try {
      const res = await API.post('/customer/createCustomer', {
        customer_name: customerName, phone, email, product, quantity, unit_price: unitPrice, sale_date: saleDate || null
      });
      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Customer created successfully');
        fetchCustomers();
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to create customer');
    }
    setActionLoading(false);
  };

  const handleEdit = async () => {
    if (!id) return Alert.alert('Error', 'Customer ID is required');
    setActionLoading(true);
    try {
      const res = await API.put(`/customer/updateCustomer/${id}`, {
        customer_name: customerName, phone, email, product, quantity, unit_price: unitPrice, sale_date: saleDate || null
      });
      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Customer updated successfully');
        fetchCustomers();
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to update customer');
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!id) return Alert.alert('Error', 'Customer ID is required');
    setActionLoading(true);
    try {
      const res = await API.delete(`/customer/deleteCustomer/${id}`);
      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Customer deleted successfully');
        setCustomers(prev => prev.filter(c => String(c.cID) !== String(id)));
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to delete customer');
    }
    setActionLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.infoRowTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.customer_name?.substring(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.customer_name}</Text>
        </View>
        <Text style={styles.idBadge}>#{item.cID}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Product:</Text>
          <Text style={styles.value}>📦 {item.product}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Qty / Price:</Text>
          <Text style={styles.value}>{item.quantity}  @  LKR {Number(item.unit_price).toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>📞 {item.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>✉ {item.email}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtnOutline} onPress={() => openEdit(item)}>
          <Text style={styles.actionBtnTextOutline}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnDanger} onPress={() => {
          Alert.alert('Delete Customer', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => { setId(String(item.cID)); handleDelete(); } }
          ]);
        }}>
          <Text style={styles.actionBtnTextDanger}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <TouchableOpacity style={styles.primaryBtnTop} onPress={openCreate}>
          <Text style={styles.primaryBtnTopText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading && customers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => String(item.cID)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={() => (
            customers.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Customer Records</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{customers.length}</Text></View>
              </View>
            ) : null
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No customers found</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={fetchCustomers}>
                <Text style={styles.primaryBtnText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Action Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={resetForm}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeSection === 'create' ? 'Add Customer' : activeSection === 'edit' ? 'Edit Customer' : 'Delete Customer'}
              </Text>
              <TouchableOpacity onPress={resetForm}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            
            <ScrollView keyboardShouldPersistTaps="handled">
              {(activeSection === 'create' || activeSection === 'edit') && (
                <View style={styles.formGroup}>
                  {activeSection === 'edit' && (
                    <>
                      <Text style={styles.inputLabel}>Customer ID *</Text>
                      <TextInput style={styles.input} placeholder="Enter ID" value={id} onChangeText={setId} keyboardType="numeric" />
                    </>
                  )}
                  <Text style={styles.inputLabel}>Customer Name *</Text>
                  <TextInput style={styles.input} placeholder="Name" value={customerName} onChangeText={setCustomerName} />
                  
                  <Text style={styles.inputLabel}>Phone *</Text>
                  <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                  
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                  
                  <Text style={styles.inputLabel}>Product (Type exactly to match stock) *</Text>
                  <TextInput style={styles.input} placeholder="Product Name" value={product} onChangeText={handleProductSelect} />
                  
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <View style={{flex: 1}}>
                      <Text style={styles.inputLabel}>Quantity *</Text>
                      <TextInput style={styles.input} placeholder="Qty" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.inputLabel}>Unit Price *</Text>
                      <TextInput style={styles.input} placeholder="Price" value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" />
                    </View>
                  </View>
                </View>
              )}

              {activeSection === 'delete' && (
                <View style={styles.formGroup}>
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>⚠️ This action is permanent and cannot be undone.</Text>
                  </View>
                  <Text style={styles.inputLabel}>Customer ID *</Text>
                  <TextInput style={styles.input} placeholder="Enter ID to delete" value={id} onChangeText={setId} keyboardType="numeric" />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmBtn, activeSection === 'delete' && styles.confirmDelBtn, actionLoading && styles.disabledBtn]} 
                onPress={activeSection === 'create' ? handleCreate : activeSection === 'edit' ? handleEdit : handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color="#fff" /> : 
                  <Text style={styles.confirmBtnText}>{activeSection === 'create' ? 'Create' : activeSection === 'edit' ? 'Save' : 'Delete'}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  primaryBtnTop: { backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  primaryBtnTopText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorBanner: { backgroundColor: '#fee2e2', padding: 12, margin: 16, borderRadius: 8 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  listContainer: { padding: 16, paddingBottom: 40 },
  listHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginRight: 12 },
  badge: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#4f46e5', fontSize: 12, fontWeight: '600' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 12 },
  infoRowTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 14 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
  idBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: 'bold', color: '#6b7280' },
  cardBody: { marginBottom: 12, gap: 4 },
  row: { flexDirection: 'row' },
  label: { width: 80, fontSize: 13, color: '#6b7280' },
  value: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '500' },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtnOutline: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, alignItems: 'center' },
  actionBtnTextOutline: { fontSize: 13, color: '#374151', fontWeight: '600' },
  actionBtnDanger: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fef2f2', borderRadius: 6, alignItems: 'center' },
  actionBtnTextDanger: { fontSize: 13, color: '#ef4444', fontWeight: '600' },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  primaryBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  closeBtn: { fontSize: 24, color: '#6b7280' },
  formGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 16 },
  warningBox: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fef3c7', padding: 12, borderRadius: 8, marginBottom: 16 },
  warningText: { color: '#b45309', fontSize: 13, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10, paddingBottom: 20 },
  cancelBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#f3f4f6', borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#4b5563' },
  confirmBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#4f46e5', borderRadius: 8, alignItems: 'center' },
  confirmDelBtn: { backgroundColor: '#ef4444' },
  disabledBtn: { opacity: 0.7 },
  confirmBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

export default CustomerScreen;
