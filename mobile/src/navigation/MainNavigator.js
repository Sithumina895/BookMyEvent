import React, { useContext } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import colors from '../theme/colors';
import { Home, Compass, Ticket, User as UserIcon, BarChart3, PlusCircle } from 'lucide-react-native';

// Screens
import EventListScreen from '../screens/events/EventListScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import MyBookingsScreen from '../screens/bookings/MyBookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Event Stack
const EventStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="EventList" component={EventListScreen} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
  </Stack.Navigator>
);

// Explore Stack
const ExploreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="ExploreMain" component={ExploreScreen} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
  </Stack.Navigator>
);

// Booking Stack
const BookingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
  </Stack.Navigator>
);

// Create Event Stack (Direct for Organizers)
const CreateEventStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="CreateEventTab" component={CreateEventScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
  </Stack.Navigator>
);

// Helper to hide tab bar on detail screens so bottom action buttons are never covered
const getTabBarStyle = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  if (routeName === 'EventDetail' || routeName === 'CreateEvent') {
    return { display: 'none' };
  }
  return styles.tabBar;
};

const MainNavigator = () => {
  const { user } = useContext(AuthContext);
  const isOrganizer = user?.role === 'organizer';

  if (isOrganizer) {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: getTabBarStyle(route),
          tabBarItemStyle: styles.tabBarItem,
          tabBarIconStyle: styles.tabBarIcon,
          tabBarIcon: ({ focused }) => {
            let IconComponent;
            if (route.name === 'Dashboard') {
              IconComponent = BarChart3;
            } else if (route.name === 'Create') {
              IconComponent = PlusCircle;
            } else if (route.name === 'Profile') {
              IconComponent = UserIcon;
            }

            return (
              <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <IconComponent
                  size={22}
                  color={focused ? colors.white : '#8A8B94'}
                  strokeWidth={focused ? 2.5 : 1.8}
                />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={EventStack} />
        <Tab.Screen name="Create" component={CreateEventStack} />
        <Tab.Screen name="Profile" component={ProfileStack} />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: getTabBarStyle(route),
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarIcon: ({ focused }) => {
          let IconComponent;
          if (route.name === 'Home') {
            IconComponent = Home;
          } else if (route.name === 'Explore') {
            IconComponent = Compass;
          } else if (route.name === 'Bookings') {
            IconComponent = Ticket;
          } else if (route.name === 'Profile') {
            IconComponent = UserIcon;
          }

          return (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <IconComponent
                size={22}
                color={focused ? colors.white : '#8A8B94'}
                strokeWidth={focused ? 2.5 : 1.8}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={EventStack} />
      <Tab.Screen name="Explore" component={ExploreStack} />
      <Tab.Screen name="Bookings" component={BookingStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 24,
    right: 24,
    elevation: 10,
    backgroundColor: colors.dark,
    borderRadius: 36,
    height: 64,
    borderTopWidth: 0,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBarItem: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    marginVertical: 0,
  },
  tabBarIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default MainNavigator;
