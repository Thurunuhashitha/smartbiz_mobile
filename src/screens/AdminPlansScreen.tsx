import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, SafeAreaView, Switch } from 'react-native';
import API from '../api/axiosConfig';

const AdminPlansScreen = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [stockLimit, setStockLimit] = useState('');
  const [features, setFeatures] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await API.get('/plans/getall');
      setPlans(res.data);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setStockLimit('');
    setFeatures('');
    setIsActive(true);
  };

  const handleEdit = (plan: any) => {
    setIsEditing(true);
    setEditingId(plan.id);
    setName(plan.name);
    setStockLimit(plan.stock_limit_value ? String(plan.stock_limit_value) : '');
    setFeatures(plan.features || '');
    setIsActive(!!plan.is_active);
  };

  const handleSubmit = async () => {
    if (!name) return Alert.alert('Error', 'Plan name is required');
    
    setActionLoading(true);
    const payload = {
      name,
      stock_limit_value: stockLimit ? parseInt(stockLimit, 10) : null,
      features,
      is_active: isActive
    };

    try {
      if (isEditing && editingId) {
        await API.put(`/plans/update/${editingId}`, payload);
        Alert.alert('Success', 'Plan updated successfully');
      } else {
        await API.post('/plans/create', payload);
        Alert.alert('Success', 'Plan created successfully');
      }
      resetForm();
      fetchPlans();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this plan?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          setActionLoading(true);
          try {
            await API.delete(`/plans/delete/${id}`);
            Alert.alert('Success', 'Plan deleted successfully');
            fetchPlans();
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error || 'Delete failed');
          } finally {
            setActionLoading(false);
          }
        }
      }
    ]);
  };

  if (loading && plans.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Plans</Text>
        </View>
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Plans</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>{isEditing ? 'Editing Plan' : 'Create New Plan'}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Plan Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Pro Plan" value={name} onChangeText={setName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stock Limit Value</Text>
            <TextInput style={styles.input} placeholder="e.g. 5000000 (Empty for unlimited)" value={stockLimit} onChangeText={setStockLimit} keyboardType="numeric" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Features (Comma separated)</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="e.g. Basic Access, AI Tools" value={features} onChangeText={setFeatures} multiline />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.label}>Active Plan</Text>
            <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: '#10b981', false: '#cbd5e1' }} />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity style={[styles.submitBtn, actionLoading && styles.disabledBtn]} onPress={handleSubmit} disabled={actionLoading}>
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEditing ? 'Update Plan' : 'Create Plan'}</Text>}
            </TouchableOpacity>
            
            {isEditing && (
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm} disabled={actionLoading}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Plans List */}
        <Text style={styles.sectionTitle}>Existing Plans</Text>
        <View style={styles.plansList}>
          {plans.map(plan => (
            <View key={plan.id} style={styles.planItem}>
              <View style={styles.planHeader}>
                <View style={styles.planTitleRow}>
                  <Text style={styles.planId}>#{plan.id}</Text>
                  <Text style={styles.planName}>{plan.name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: plan.is_active ? '#dcfce7' : '#fee2e2' }]}>
                  <Text style={[styles.statusText, { color: plan.is_active ? '#166534' : '#991b1b' }]}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <Text style={styles.planMeta}>
                Limit: <Text style={styles.planMetaValue}>{plan.stock_limit_value ? `$${Number(plan.stock_limit_value).toLocaleString()}` : 'Unlimited'}</Text>
              </Text>
              
              <View style={styles.planActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(plan)}>
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(plan.id)}>
                  <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                </TouchableOpacity>
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
  header: { padding: 16, backgroundColor: '#1e293b' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  
  container: { padding: 16, paddingBottom: 40 },
  
  formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  textArea: { height: 80, textAlignVertical: 'top' },
  switchGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  
  formActions: { flexDirection: 'row', gap: 12 },
  submitBtn: { flex: 1, backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontSize: 15, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.7 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12, marginLeft: 4 },
  plansList: { gap: 12 },
  planItem: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planId: { fontSize: 13, color: '#64748b', fontWeight: 'bold', backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  planName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  planMeta: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  planMetaValue: { color: '#0f172a', fontWeight: '600' },
  
  planActions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  editBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, backgroundColor: '#f1f5f9', borderRadius: 6 },
  editBtnText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  deleteBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, backgroundColor: '#fef2f2', borderRadius: 6 },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: '#ef4444' },
});

export default AdminPlansScreen;
