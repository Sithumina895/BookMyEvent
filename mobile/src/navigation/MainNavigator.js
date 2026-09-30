import React, { useContext } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import colors from '../theme/colors';
import { Home, Search, Ticket, User as UserIcon } from 'lucide-react-native';

// Screens
import EventListScreen from '../screens/events/EventListScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import MyBookingsScreen from '../screens/bookings/MyBookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Event Stack
const EventStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="EventList" component={EventListScreen} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
  </Stack.Navigator>
);

// Booking Stack
const BookingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
  </Stack.Navigator>
);

const MainNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          if (route.name === 'Home') IconComponent = Home;
          else if (route.name === 'Explore') IconComponent = Search;
          else if (route.name === 'Bookings') IconComponent = Ticket;
          else if (route.name === 'Profile') IconComponent = UserIcon;

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <IconComponent 
                size={22} 
                color={focused ? colors.white : '#8A8B94'} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={EventStack} />
      <Tab.Screen name="Explore" component={EventStack} listeners={{ tabPress: e => e.preventDefault() }} />
      <Tab.Screen name="Bookings" component={BookingStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 40,
    right: 40,
    elevation: 0,
    backgroundColor: colors.dark,
    borderRadius: 40,
    height: 70,
    borderTopWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: colors.primary,
  }
});

export default MainNavigator;
