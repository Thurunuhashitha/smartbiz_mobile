import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const MENU_ITEMS = [
  { id: 'suppliers', title: 'Suppliers', icon: '🚚', route: 'Suppliers', color: '#f97316' },
  { id: 'sales', title: 'Sales Tracking', icon: '🧾', route: 'Sales', color: '#0ea5e9' },
  { id: 'expenses', title: 'Expenses', icon: '💸', route: 'Expenses', color: '#ef4444' },
  { id: 'ai', title: 'AI Insights', icon: '✨', route: 'AiInsights', color: '#8b5cf6' },
  { id: 'plans', title: 'My Plans', icon: '⭐', route: 'Plans', color: '#eab308' },
  { id: 'admin', title: 'Admin Dashboard', icon: '👑', route: 'AdminDashboard', color: '#10b981' },
];

const MoreScreen = () => {
  const navigation = useNavigation();
  const [role, setRole] = React.useState('company');

  React.useEffect(() => {
    const getRole = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setRole(user.role || 'company');
      }
    };
    getRole();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const filteredMenuItems = MENU_ITEMS.filter(item => {
    if (item.id === 'admin') {
      return role === 'admin';
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>More Options</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Business Operations</Text>
        
        <View style={styles.menuGrid}>
          {filteredMenuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem} 
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  container: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: 12, marginTop: 8, letterSpacing: 0.5 },
  menuGrid: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  iconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  icon: { fontSize: 20 },
  itemTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: '#1f2937' },
  chevron: { fontSize: 24, color: '#9ca3af', fontWeight: '300' },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32, padding: 16, backgroundColor: '#fef2f2', borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2' },
  logoutIcon: { fontSize: 20, marginRight: 8 },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#dc2626' },
});

export default MoreScreen;
