import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import colors from '../theme/colors';
import { Compass, Ticket, User as UserIcon } from 'lucide-react-native';

// Placeholder imports until we create them
import EventListScreen from '../screens/events/EventListScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import MyBookingsScreen from '../screens/bookings/MyBookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Event Stack
const EventStack = () => (
  <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerShadowVisible: false }}>
    <Stack.Screen name="EventList" component={EventListScreen} options={{ title: 'Explore' }} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: '' }} />
    <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'New Event' }} />
  </Stack.Navigator>
);

// Booking Stack
const BookingStack = () => (
  <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerShadowVisible: false }}>
    <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'Bookings' }} />
  </Stack.Navigator>
);

const MainNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 60,
          paddingBottom: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Explore') {
            return <Compass size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          } else if (route.name === 'Bookings') {
            return <Ticket size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          } else if (route.name === 'Profile') {
            return <UserIcon size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          }
        },
      })}
    >
      <Tab.Screen name="Explore" component={EventStack} />
      <Tab.Screen name="Bookings" component={BookingStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
