import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView } from 'react-native';
import API from '../api/axiosConfig';

const CompanyScreen = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit/Delete Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  
  // Form State
  const [id, setId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [owner, setOwner] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/admin/getallcompanies');
      if (res.data) setCompanies(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch companies');
    }
    setLoading(false);
  };

  useEffect(() => {
    // Note: If you don't want to load immediately, comment this out and let the user press Refresh.
    // However, loading immediately is better UX.
    fetchCompanies();
  }, []);

  const resetForm = () => {
    setId(''); setCompanyName(''); setOwner(''); setEmail(''); setPhone('');
    setModalVisible(false);
    setActiveSection(null);
  };

  const openEdit = (comp) => {
    if (comp) {
      setId(String(comp.id));
      setCompanyName(comp.company_name);
      setOwner(comp.owner);
      setEmail(comp.email);
      setPhone(comp.phone);
    } else {
      resetForm();
    }
    setActiveSection('edit');
    setModalVisible(true);
  };

  const openDelete = (comp) => {
    if (comp) {
      setId(String(comp.id));
    } else {
      resetForm();
    }
    setActiveSection('delete');
    setModalVisible(true);
  };

  const handleEdit = async () => {
    if (!id) return Alert.alert('Error', 'Company ID is required');
    setActionLoading(true);
    try {
      const res = await API.put(`/admin/updatecompany/${id}`, {
        company_name: companyName, owner, email, phone
      });
      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Company updated successfully');
        setCompanies(prev => prev.map(c => String(c.id) === String(id) ? { ...c, company_name: companyName, owner, email, phone } : c));
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update company');
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!id) return Alert.alert('Error', 'Company ID is required');
    setActionLoading(true);
    try {
      const res = await API.delete(`/admin/deletecompany/${id}`);
      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Company deleted successfully');
        setCompanies(prev => prev.filter(c => String(c.id) !== String(id)));
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to delete company');
    }
    setActionLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.companyInfoRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.company_name?.substring(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.companyName} numberOfLines={1}>{item.company_name}</Text>
        </View>
        <Text style={styles.idBadge}>#{item.id}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Owner:</Text>
          <Text style={styles.infoValue}>{item.owner}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{item.phone}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtnOutline} onPress={() => openEdit(item)}>
          <Text style={styles.actionBtnTextOutline}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnDanger} onPress={() => openDelete(item)}>
          <Text style={styles.actionBtnTextDanger}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Company Management</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchCompanies}>
          <Text style={styles.refreshBtnText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Global Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.barBtn} onPress={() => openEdit()}>
          <Text style={styles.barBtnText}>✏️ Edit by ID</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.barBtn, styles.barBtnDel]} onPress={() => openDelete()}>
          <Text style={[styles.barBtnText, { color: '#ef4444' }]}>🗑️ Del by ID</Text>
        </TouchableOpacity>
      </View>

      {loading && companies.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading companies...</Text>
        </View>
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={() => (
            companies.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Registered Companies</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{companies.length}</Text></View>
              </View>
            ) : null
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏢</Text>
              <Text style={styles.emptyTitle}>No companies loaded</Text>
              <Text style={styles.emptySub}>Click Refresh to load registered companies</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={fetchCompanies}>
                <Text style={styles.primaryBtnText}>Load Companies</Text>
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
              <Text style={styles.modalTitle}>{activeSection === 'edit' ? 'Edit Company' : 'Delete Company'}</Text>
              <TouchableOpacity onPress={resetForm}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            
            <ScrollView keyboardShouldPersistTaps="handled">
              {activeSection === 'edit' && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Company ID *</Text>
                  <TextInput style={styles.input} placeholder="Enter company ID" value={id} onChangeText={setId} keyboardType="numeric" />
                  <Text style={styles.label}>Company Name</Text>
                  <TextInput style={styles.input} placeholder="Company name" value={companyName} onChangeText={setCompanyName} />
                  <Text style={styles.label}>Owner</Text>
                  <TextInput style={styles.input} placeholder="Owner name" value={owner} onChangeText={setOwner} />
                  <Text style={styles.label}>Email</Text>
                  <TextInput style={styles.input} placeholder="company@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                  <Text style={styles.label}>Phone</Text>
                  <TextInput style={styles.input} placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
              )}

              {activeSection === 'delete' && (
                <View style={styles.formGroup}>
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>⚠️ This will permanently delete the company and all associated data. This cannot be undone.</Text>
                  </View>
                  <Text style={styles.label}>Company ID *</Text>
                  <TextInput style={styles.input} placeholder="Enter Company ID to delete" value={id} onChangeText={setId} keyboardType="numeric" />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmBtn, activeSection === 'delete' && styles.confirmDelBtn, actionLoading && styles.disabledBtn]} 
                onPress={activeSection === 'edit' ? handleEdit : handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color="#fff" /> : 
                  <Text style={styles.confirmBtnText}>{activeSection === 'edit' ? 'Save Changes' : 'Confirm Delete'}</Text>
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
  refreshBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f3f4f6', borderRadius: 6 },
  refreshBtnText: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },
  errorBanner: { backgroundColor: '#fee2e2', padding: 12, margin: 16, borderRadius: 8 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  listContainer: { padding: 16, paddingBottom: 40 },
  listHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginRight: 12 },
  badge: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#4f46e5', fontSize: 12, fontWeight: '600' },

  actionBar: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  barBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, alignItems: 'center', marginRight: 8 },
  barBtnDel: { borderColor: '#fecaca', backgroundColor: '#fef2f2', marginRight: 0 },
  barBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 12 },
  companyInfoRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 14 },
  companyName: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
  idBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: 'bold', color: '#6b7280' },
  cardBody: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  infoLabel: { width: 60, fontSize: 13, color: '#6b7280' },
  infoValue: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '500' },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtnOutline: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, alignItems: 'center' },
  actionBtnTextOutline: { fontSize: 13, color: '#374151', fontWeight: '600' },
  actionBtnDanger: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fef2f2', borderRadius: 6, alignItems: 'center' },
  actionBtnTextDanger: { fontSize: 13, color: '#ef4444', fontWeight: '600' },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  primaryBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  closeBtn: { fontSize: 24, color: '#6b7280' },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 16 },
  warningBox: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fef3c7', padding: 12, borderRadius: 8, marginBottom: 16 },
  warningText: { color: '#b45309', fontSize: 13, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#f3f4f6', borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#4b5563' },
  confirmBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#4f46e5', borderRadius: 8, alignItems: 'center' },
  confirmDelBtn: { backgroundColor: '#ef4444' },
  disabledBtn: { opacity: 0.7 },
  confirmBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

export default CompanyScreen;
