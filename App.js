import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import WelcomeScreen from "./screens/welcomeScreen";
import AuthenticationScreen from "./screens/authenticationScreen";
import DashBoardScreen from "./screens/dashBoardScreen";
import CalendarScreen from "./screens/jobsScreen";
import TasksScreen from "./screens/tasksScreen";
import ChatScreen from "./screens/chatScreen";
import ProfileScreen from "./screens/profileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#080808",
          borderTopColor: "#222",
          height: 85,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#777",
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
        },
        tabBarIcon: ({ color }) => {
          let icon = "⌂";
          if (route.name === "Home") icon = "⌂";
          else if (route.name === "Job") icon = "□";
          else if (route.name === "Tasks") icon = "✓";
          else if (route.name === "Chat") icon = "◯";
          else if (route.name === "Profile") icon = "○";

          return <Text style={{ color, fontSize: 21 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashBoardScreen} />
      <Tab.Screen name="Job" component={CalendarScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Auth" component={AuthenticationScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
