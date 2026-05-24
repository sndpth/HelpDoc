import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Stethoscope, MessageCircle, User } from 'lucide-react-native';
import { theme } from './src/constants/theme';

import EMRDashboard from './src/screens/EMRDashboard';
import PatientDetail from './src/screens/PatientDetail';
import VitalsScreen from './src/screens/VitalsScreen';
import AddPatientScreen from './src/screens/AddPatientScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import DischargeSummaryScreen from './src/screens/DischargeSummaryScreen';
import AuditLogScreen from './src/screens/AuditLogScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import OPDSchedulingScreen from './src/screens/OPDSchedulingScreen';
import useStore from './src/store/useStore';
import { initSocket } from './src/services/socket';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const EMRStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.colors.surface }, headerTintColor: theme.colors.primary, headerTitleStyle: { fontWeight: '700' }, gestureEnabled: true }}>
    <Stack.Screen name="Dashboard" component={EMRDashboard} options={{ headerShown: false }} />
    <Stack.Screen name="PatientDetail" component={PatientDetail} options={{ headerShown: false }} />
    <Stack.Screen name="VitalsScreen" component={VitalsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddPatient" component={AddPatientScreen} options={{ title: 'New Patient Record' }} />
    <Stack.Screen name="DischargeSummary" component={DischargeSummaryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="OPDScheduling" component={OPDSchedulingScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.colors.surface }, headerTintColor: theme.colors.primary, headerTitleStyle: { fontWeight: '700' }, gestureEnabled: true }}>
    <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ChatThread" component={ChatScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PatientDetail" component={PatientDetail} options={{ headerShown: false }} />
    <Stack.Screen name="VitalsScreen" component={VitalsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DischargeSummary" component={DischargeSummaryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="OPDScheduling" component={OPDSchedulingScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function MainTabs() {
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = Math.max(insets.bottom, 10) + 10;

  return (
    <Tab.Navigator
      initialRouteName="EMR"
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? '';
        const hideOnScreens = [
          'PatientDetail',
          'VitalsScreen',
          'AddPatient',
          'DischargeSummary',
          'Analytics',
          'OPDScheduling',
          'ChatThread',
          'AuditLog'
        ];
        const displayStyle = hideOnScreens.includes(routeName) ? 'none' : 'flex';

        return {
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'EMR') return <Stethoscope size={size} color={color} />;
            if (route.name === 'Chats') return <MessageCircle size={size} color={color} />;
            if (route.name === 'Profile') return <User size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingBottom: tabBarBottomPadding,
            paddingTop: 8,
            height: 54 + tabBarBottomPadding,
            display: displayStyle,
          },
          tabBarLabelStyle: { fontWeight: '600', fontSize: 11 }
        };
      }}
    >
      <Tab.Screen 
        name="EMR" 
        component={EMRStack} 
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent the default tab switch
            e.preventDefault();
            // Force navigation directly to the root of the stack atomically
            navigation.navigate('EMR', { screen: 'Dashboard' });
          },
        })}
      />
      <Tab.Screen 
        name="Chats" 
        component={ChatStack} 
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent the default tab switch (which goes to the last open screen inside the stack)
            e.preventDefault();
            // Force navigation directly to the root of the stack atomically
            navigation.navigate('Chats', { screen: 'ChatList' });
          },
        })}
      />
      <Tab.Screen name="Profile">
          {() => (
            <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: true }}>
              <Stack.Screen name="ProfileMain" component={ProfileScreen} />
              <Stack.Screen name="AuditLog" component={AuditLogScreen} />
              <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            </Stack.Navigator>
          )}
        </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for Zustand to rehydrate from AsyncStorage
    const unsub = useStore.persist.onFinishHydration(() => setIsReady(true));
    // If already hydrated (synchronous), set ready immediately
    if (useStore.persist.hasHydrated()) setIsReady(true);
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    if (isReady && isLoggedIn) {
      useStore.getState().fetchPatients();
      useStore.getState().fetchChats();
      
      // Trigger immediate sync of any pending offline EMR records
      useStore.getState().syncOfflineQueue();
      
      // Keep checking and syncing offline records every 30 seconds
      const syncInterval = setInterval(() => {
        useStore.getState().syncOfflineQueue();
      }, 30000);
      
      let host = null;
      const apiUrl = useStore.getState().apiUrl;
      if (apiUrl) {
        try {
          const match = apiUrl.match(/https?:\/\/([^:]+)/);
          if (match) host = match[1];
        } catch (e) {
          console.log('Error parsing host for socket:', e);
        }
      }
      initSocket(host);
      
      return () => {
        clearInterval(syncInterval);
      };
    }
  }, [isReady, isLoggedIn]);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Stethoscope size={28} color="#FFF" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: theme.colors.primary, marginBottom: 4 }}>HelpDoc</Text>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Loading clinical workspace...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isLoggedIn ? <MainTabs /> : <LoginScreen />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
