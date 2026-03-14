import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView } from 'react-native';
import API from '../api/axiosConfig';

const ExpensesScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  
  // Form State
  const [id, setId] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/expense/getAllExpenses');
      if (res.data) setExpenses(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to fetch expenses');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const resetForm = () => {
    setId(''); setExpenseName(''); setAmount(''); setDate('');
    setModalVisible(false);
    setActiveSection(null);
  };

  const openCreate = () => {
    resetForm();
    setActiveSection('create');
    setModalVisible(true);
  };

  const openEdit = (exp) => {
    if (exp) {
      setId(String(exp.eID));
      setExpenseName(exp.expense);
      setAmount(String(exp.amount));
      setDate(exp.date ? new Date(exp.date).toISOString().split('T')[0] : '');
    } else {
      resetForm();
    }
    setActiveSection('edit');
    setModalVisible(true);
  };

  const openDelete = (exp) => {
    if (exp) setId(String(exp.eID));
    else resetForm();
    setActiveSection('delete');
    setModalVisible(true);
  };

  const handleCreate = async () => {
    if (!expenseName || !amount || !date) {
      return Alert.alert('Error', 'Please fill all required fields');
    }
    setActionLoading(true);
    try {
      const res = await API.post('/expense/createExpense', {
        expense: expenseName, amount, date
      });
      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Expense created successfully');
        fetchExpenses();
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to create expense');
    }
    setActionLoading(false);
  };

  const handleEdit = async () => {
    if (!id) return Alert.alert('Error', 'Expense ID is required');
    setActionLoading(true);
    try {
      const res = await API.put(`/expense/updateExpense/${id}`, {
        expense: expenseName, amount, date
      });
      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Expense updated successfully');
        fetchExpenses();
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to update expense');
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!id) return Alert.alert('Error', 'Expense ID is required');
    setActionLoading(true);
    try {
      const res = await API.delete(`/expense/deleteExpense/${id}`);
      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Expense deleted successfully');
        setExpenses(prev => prev.filter(e => String(e.eID) !== String(id)));
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to delete expense');
    }
    setActionLoading(false);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const highestExpense = expenses.length ? expenses.reduce((max, e) => Number(e.amount) > Number(max.amount) ? e : max, expenses[0]) : null;
  const thisMonthTotal = expenses.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + Number(e.amount), 0);

  const renderItem = ({ item }) => {
    const pct = totalExpenses > 0 ? Math.round((Number(item.amount) / totalExpenses) * 100) : 0;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.idBadge}>#{item.eID}</Text>
          <Text style={styles.dateText}>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</Text>
        </View>
        <View style={styles.productRow}>
          <Text style={styles.productName}>{item.expense}</Text>
          <Text style={styles.totalText}>LKR {Number(item.amount).toLocaleString()}</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
          <Text style={styles.progressText}>{pct}% of total</Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtnOutline} onPress={() => openEdit(item)}>
            <Text style={styles.actionBtnTextOutline}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnDanger} onPress={() => {
            Alert.alert('Delete Expense', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => { setId(String(item.eID)); handleDelete(); } }
            ]);
          }}>
            <Text style={styles.actionBtnTextDanger}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <TouchableOpacity style={styles.primaryBtnTop} onPress={openCreate}>
          <Text style={styles.primaryBtnTopText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll} contentContainerStyle={styles.summaryContainer}>
          <View style={[styles.summaryCard, { borderLeftColor: '#ef4444' }]}>
            <Text style={styles.summaryValue}>LKR {totalExpenses.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#f97316' }]}>
            <Text style={styles.summaryValue}>LKR {thisMonthTotal.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>This Month</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#f59e0b' }]}>
            <Text style={styles.summaryValue}>{highestExpense ? `LKR ${Number(highestExpense.amount).toLocaleString()}` : "—"}</Text>
            <Text style={styles.summaryLabel}>Highest ({(highestExpense?.expense) || 'N/A'})</Text>
          </View>
        </ScrollView>
      </View>

      {loading && expenses.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => String(item.eID)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={() => (
            expenses.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Expense Records</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{expenses.length}</Text></View>
              </View>
            ) : null
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyTitle}>No expenses found</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={fetchExpenses}>
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
                {activeSection === 'create' ? 'Add Expense' : activeSection === 'edit' ? 'Edit Expense' : 'Delete Expense'}
              </Text>
              <TouchableOpacity onPress={resetForm}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            
            <ScrollView keyboardShouldPersistTaps="handled">
              {(activeSection === 'create' || activeSection === 'edit') && (
                <View style={styles.formGroup}>
                  {activeSection === 'edit' && (
                    <>
                      <Text style={styles.inputLabel}>Expense ID *</Text>
                      <TextInput style={styles.input} placeholder="Enter ID" value={id} onChangeText={setId} keyboardType="numeric" />
                    </>
                  )}
                  <Text style={styles.inputLabel}>Expense Name *</Text>
                  <TextInput style={styles.input} placeholder="e.g. Office Rent, Bills" value={expenseName} onChangeText={setExpenseName} />
                  
                  <Text style={styles.inputLabel}>Amount (LKR) *</Text>
                  <TextInput style={styles.input} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="numeric" />
                  
                  <Text style={styles.inputLabel}>Date * (YYYY-MM-DD)</Text>
                  <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />
                </View>
              )}

              {activeSection === 'delete' && (
                <View style={styles.formGroup}>
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>⚠️ This action is permanent and cannot be undone.</Text>
                  </View>
                  <Text style={styles.inputLabel}>Expense ID *</Text>
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
  primaryBtnTop: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  primaryBtnTopText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorBanner: { backgroundColor: '#fee2e2', padding: 12, margin: 16, borderRadius: 8 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  
  summaryScroll: { flexGrow: 0 },
  summaryContainer: { padding: 16, gap: 12 },
  summaryCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, width: 170, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderLeftWidth: 4 },
  summaryValue: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  summaryLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  
  listContainer: { padding: 16, paddingBottom: 40 },
  listHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginRight: 12 },
  badge: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  idBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: 'bold', color: '#6b7280' },
  dateText: { fontSize: 12, color: '#6b7280' },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  productName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#dc2626' },
  
  progressBarContainer: { backgroundColor: '#f3f4f6', height: 16, borderRadius: 8, position: 'relative', marginBottom: 12, overflow: 'hidden' },
  progressBarFill: { backgroundColor: '#ef4444', height: '100%', borderRadius: 8 },
  progressText: { position: 'absolute', right: 8, top: 0, fontSize: 10, color: '#111827', lineHeight: 16, fontWeight: 'bold' },

  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtnOutline: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, alignItems: 'center' },
  actionBtnTextOutline: { fontSize: 13, color: '#374151', fontWeight: '600' },
  actionBtnDanger: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fef2f2', borderRadius: 6, alignItems: 'center' },
  actionBtnTextDanger: { fontSize: 13, color: '#ef4444', fontWeight: '600' },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  primaryBtn: { backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
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
  confirmBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#ef4444', borderRadius: 8, alignItems: 'center' },
  confirmDelBtn: { backgroundColor: '#ef4444' },
  disabledBtn: { opacity: 0.7 },
  confirmBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

export default ExpensesScreen;
