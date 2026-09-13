import React from 'react';
import { Tabs } from 'expo-router';
import {
  Calendar,
  CheckSquare,
  Layout,
  Target,
  Zap,
  BarChart2,
  Settings,
  Clock,
  RotateCw
} from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const colors = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundSelected,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="today/index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Zap color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="goals/index"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="habits/index"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, size }) => <RotateCw color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="insights/index"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
      {/* Hide these from tab bar if needed, or use a "More" tab */}
      <Tabs.Screen name="projects/index" options={{ href: null }} />
      <Tabs.Screen name="calendar/index" options={{ href: null }} />
      <Tabs.Screen name="focus/index" options={{ href: null }} />
    </Tabs>
  );
}
