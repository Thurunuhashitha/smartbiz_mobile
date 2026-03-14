import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView } from 'react-native';
import API from '../api/axiosConfig';

const SupplierScreen = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  
  // Form State
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/supplier/getAllSuppliers');
      if (res.data) setSuppliers(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to fetch suppliers');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const resetForm = () => {
    setId(''); setName(''); setProduct(''); setQuantity(''); setPrice(''); setPhone('');
    setModalVisible(false);
    setActiveSection(null);
  };

  const openCreate = () => {
    resetForm();
    setActiveSection('create');
    setModalVisible(true);
  };

  const openEdit = (sup) => {
    if (sup) {
      setId(String(sup.sID));
      setName(sup.name);
      setProduct(sup.product);
      setQuantity(String(sup.quantity));
      setPrice(String(sup.price));
      setPhone(sup.phone);
    } else {
      resetForm();
    }
    setActiveSection('edit');
    setModalVisible(true);
  };

  const openDelete = (sup) => {
    if (sup) setId(String(sup.sID));
    else resetForm();
    setActiveSection('delete');
    setModalVisible(true);
  };

  const handleCreate = async () => {
    if (!name || !product || !phone || !quantity || !price) {
      return Alert.alert('Error', 'Please fill all required fields');
    }
    setActionLoading(true);
    try {
      const res = await API.post('/supplier/createSupplier', {
        name, product, quantity, price, phone
      });
      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Supplier created successfully');
        fetchSuppliers();
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to create supplier');
    }
    setActionLoading(false);
  };

  const handleEdit = async () => {
    if (!id) return Alert.alert('Error', 'Supplier ID is required');
    setActionLoading(true);
    try {
      const res = await API.put(`/supplier/updateSupplier/${id}`, {
        name, product, quantity, price, phone
      });
      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Supplier updated successfully');
        fetchSuppliers();
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to update supplier');
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!id) return Alert.alert('Error', 'Supplier ID is required');
    setActionLoading(true);
    try {
      const res = await API.delete(`/supplier/deleteSupplier/${id}`);
      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Supplier deleted successfully');
        setSuppliers(prev => prev.filter(s => String(s.sID) !== String(id)));
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to delete supplier');
    }
    setActionLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.infoRowTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name?.substring(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        </View>
        <Text style={styles.idBadge}>#{item.sID}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Product:</Text>
          <Text style={styles.value}>📦 {item.product}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Qty / Price:</Text>
          <Text style={styles.value}>{item.quantity}  @  LKR {Number(item.price).toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>📞 {item.phone}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtnOutline} onPress={() => openEdit(item)}>
          <Text style={styles.actionBtnTextOutline}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnDanger} onPress={() => {
          Alert.alert('Delete Supplier', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => { setId(String(item.sID)); handleDelete(); } }
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
        <Text style={styles.title}>Suppliers</Text>
        <TouchableOpacity style={styles.primaryBtnTop} onPress={openCreate}>
          <Text style={styles.primaryBtnTopText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading && suppliers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading suppliers...</Text>
        </View>
      ) : (
        <FlatList
          data={suppliers}
          keyExtractor={(item) => String(item.sID)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={() => (
            suppliers.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Supplier Records</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{suppliers.length}</Text></View>
              </View>
            ) : null
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🚚</Text>
              <Text style={styles.emptyTitle}>No suppliers found</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={fetchSuppliers}>
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
                {activeSection === 'create' ? 'Add Supplier' : activeSection === 'edit' ? 'Edit Supplier' : 'Delete Supplier'}
              </Text>
              <TouchableOpacity onPress={resetForm}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            
            <ScrollView keyboardShouldPersistTaps="handled">
              {(activeSection === 'create' || activeSection === 'edit') && (
                <View style={styles.formGroup}>
                  {activeSection === 'edit' && (
                    <>
                      <Text style={styles.inputLabel}>Supplier ID *</Text>
                      <TextInput style={styles.input} placeholder="Enter ID" value={id} onChangeText={setId} keyboardType="numeric" />
                    </>
                  )}
                  <Text style={styles.inputLabel}>Supplier Name *</Text>
                  <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
                  
                  <Text style={styles.inputLabel}>Phone *</Text>
                  <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                  
                  <Text style={styles.inputLabel}>Product *</Text>
                  <TextInput style={styles.input} placeholder="Product Name" value={product} onChangeText={setProduct} />
                  
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <View style={{flex: 1}}>
                      <Text style={styles.inputLabel}>Quantity *</Text>
                      <TextInput style={styles.input} placeholder="Qty" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.inputLabel}>Price *</Text>
                      <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
                    </View>
                  </View>
                </View>
              )}

              {activeSection === 'delete' && (
                <View style={styles.formGroup}>
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>⚠️ This action is permanent and cannot be undone.</Text>
                  </View>
                  <Text style={styles.inputLabel}>Supplier ID *</Text>
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
  primaryBtnTop: { backgroundColor: '#f97316', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  primaryBtnTopText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorBanner: { backgroundColor: '#fee2e2', padding: 12, margin: 16, borderRadius: 8 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  listContainer: { padding: 16, paddingBottom: 40 },
  listHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginRight: 12 },
  badge: { backgroundColor: '#ffedd5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#ea580c', fontSize: 12, fontWeight: '600' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 12 },
  infoRowTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffedd5', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#ea580c', fontWeight: 'bold', fontSize: 14 },
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
  primaryBtn: { backgroundColor: '#f97316', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
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
  confirmBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#f97316', borderRadius: 8, alignItems: 'center' },
  confirmDelBtn: { backgroundColor: '#ef4444' },
  disabledBtn: { opacity: 0.7 },
  confirmBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

export default SupplierScreen;
