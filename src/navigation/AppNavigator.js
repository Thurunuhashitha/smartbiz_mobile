import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardOverviewScreen from '../screens/DashboardOverviewScreen';
import ProductStockScreen from '../screens/ProductStockScreen';
import CompanyScreen from '../screens/CompanyScreen';
import CustomerScreen from '../screens/CustomerScreen';
import SupplierScreen from '../screens/SupplierScreen';
import SalesScreen from '../screens/SalesScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AiInsightsScreen from '../screens/AiInsightsScreen';
import PlansScreen from '../screens/PlansScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminPlansScreen from '../screens/AdminPlansScreen';
import MoreScreen from '../screens/MoreScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MoreStackScreen = ({ route }) => {
  const role = route.params?.role || 'company';
  
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreMenu" component={MoreScreen} />
      <MoreStack.Screen name="Suppliers" component={SupplierScreen} />
      <MoreStack.Screen name="Sales" component={SalesScreen} />
      <MoreStack.Screen name="Expenses" component={ExpensesScreen} />
      <MoreStack.Screen name="AiInsights" component={AiInsightsScreen} />
      <MoreStack.Screen name="Plans" component={PlansScreen} />
      
      {/* Only include Admin screens in the stack if user is Admin */}
      {role === 'admin' && (
        <>
          <MoreStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <MoreStack.Screen name="AdminPlans" component={AdminPlansScreen} />
          <MoreStack.Screen name="Companies" component={CompanyScreen} />
        </>
      )}
    </MoreStack.Navigator>
  );
};

const TabIcon = ({ name, color, focused }) => {
  // A simple text/emoji icon fallback since we don't have vector icons installed
  const icon = name === 'Dashboard' || name === 'AdminDashboard' ? '📊' : 
               name === 'Inventory' ? '📦' : 
               name === 'Companies' ? '🏢' : 
               name === 'Customers' ? '👥' : 
               name === 'AdminPlans' ? '⭐' :
               name === 'More' ? '☰' : '⚙️';
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{icon}</Text>
    </View>
  );
};

const MainTabs = () => {
  const [role, setRole] = React.useState(null);

  React.useEffect(() => {
    const getRole = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Robust role detection: check role property or fallback to company name
        if (user.role === 'admin' || user.company_name === 'admin@gmail.com') {
          setRole('admin');
        } else {
          setRole(user.role || 'company');
        }
      } else {
        setRole('company');
      }
    };
    getRole();
  }, []);

  if (role === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, focused }) => <TabIcon name={route.name} color={color} focused={focused} />,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          elevation: 10,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600'
        }
      })}
    >
      {role === 'admin' ? (
        <>
          <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
          <Tab.Screen name="Companies" component={CompanyScreen} />
          <Tab.Screen name="AdminPlans" component={AdminPlansScreen} options={{ title: 'Plans' }} />
        </>
      ) : (
        <>
          <Tab.Screen name="Dashboard" component={DashboardOverviewScreen} />
          <Tab.Screen name="Inventory" component={ProductStockScreen} />
          <Tab.Screen name="Customers" component={CustomerScreen} />
          <Tab.Screen 
            name="More" 
            component={MoreStackScreen} 
            initialParams={{ role }} 
          />
        </>
      )}
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="MainDrawer" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

