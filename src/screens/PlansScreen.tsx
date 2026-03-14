import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axiosConfig';

const PlansScreen = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentPlan();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await API.get('/plans/getall');
      setPlans(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to loaded plans');
    }
  };

  const fetchCurrentPlan = async () => {
    try {
      const res = await API.get('/plans/current');
      if (res.data?.plan_id) {
        setCurrentPlanId(res.data.plan_id);
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.plan_id = res.data.plan_id;
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }
      }
    } catch (err) {
      // fallback to local storage
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.plan_id) setCurrentPlanId(user.plan_id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePlan = async (planId: number) => {
    if (planId === currentPlanId) return;
    setActivating(planId);
    setError(null);
    try {
      const res = await API.post('/plans/activate', { plan_id: planId });
      Alert.alert('Success', res.data.message || 'Plan activated successfully');
      setCurrentPlanId(planId);

      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.plan_id = planId;
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to activate plan');
    } finally {
      setActivating(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Subscription Plans</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading available plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription Plans</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroSection}>
          <Text style={styles.eyebrow}>⭐ Choose Your Plan</Text>
          <Text style={styles.heroSub}>Select the perfect plan to unlock more features for your business</Text>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.plansGrid}>
          {plans.map(plan => {
            const isActive = currentPlanId === plan.id;
            const isActivating = activating === plan.id;
            const features = plan.features?.split(',').map((f: string) => f.trim()).filter(Boolean) || [];
            const priceLabel = plan.stock_limit_value 
              ? `${(plan.stock_limit_value / 1000000).toFixed(0)}M stock limit` 
              : 'Unlimited';

            return (
              <View key={plan.id} style={[styles.planCard, isActive && styles.planCardActive]}>
                {isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>✓ Current Plan</Text>
                  </View>
                )}
                
                <Text style={styles.planName}>{plan.name}</Text>
                {plan.description ? <Text style={styles.planDesc}>{plan.description}</Text> : null}
                
                <View style={styles.priceRow}>
                  <Text style={[styles.priceText, isActive && styles.priceTextActive]}>{priceLabel}</Text>
                </View>

                {features.length > 0 && (
                  <View style={styles.featuresList}>
                    {features.map((feature: string, index: number) => (
                      <View key={index} style={styles.featureItem}>
                        <Text style={styles.featureIcon}>✓</Text>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity 
                  style={[
                    styles.activateBtn, 
                    isActive ? styles.activateBtnActive : styles.activateBtnDefault,
                    (isActivating || isActive) && styles.activateBtnDisabled
                  ]}
                  onPress={() => handleActivatePlan(plan.id)}
                  disabled={isActive || isActivating || activating !== null}
                >
                  {isActivating ? <ActivityIndicator color="#fff" /> : 
                   isActive ? <Text style={styles.activateBtnTextActive}>✓ Active Plan</Text> : 
                   <Text style={styles.activateBtnTextDefault}>Select Plan</Text>
                  }
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  
  container: { padding: 16, paddingBottom: 40 },
  heroSection: { alignItems: 'center', marginBottom: 24, paddingVertical: 10 },
  eyebrow: { fontSize: 14, fontWeight: 'bold', color: '#8b5cf6', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  heroSub: { fontSize: 15, color: '#4b5563', textAlign: 'center', paddingHorizontal: 20 },
  
  errorBanner: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },

  plansGrid: { gap: 16 },
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, position: 'relative' },
  planCardActive: { borderColor: '#8b5cf6', borderWidth: 2, backgroundColor: '#f5f3ff' },
  
  activeBadge: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: '#8b5cf6', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 },
  activeBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  
  planName: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8, marginTop: 8 },
  planDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  
  priceRow: { alignItems: 'center', marginBottom: 20 },
  priceText: { fontSize: 20, fontWeight: 'bold', color: '#4b5563', backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  priceTextActive: { backgroundColor: '#ede9fe', color: '#7c3aed' },
  
  featuresList: { marginBottom: 24, gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { color: '#10b981', fontWeight: 'bold', marginRight: 10, fontSize: 16 },
  featureText: { fontSize: 15, color: '#374151', flex: 1 },
  
  activateBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  activateBtnDefault: { backgroundColor: '#111827' },
  activateBtnActive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#8b5cf6' },
  activateBtnDisabled: { opacity: 0.8 },
  activateBtnTextDefault: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  activateBtnTextActive: { color: '#8b5cf6', fontSize: 16, fontWeight: 'bold' },
});

export default PlansScreen;
