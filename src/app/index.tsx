import { Redirect } from 'expo-router';

export default function Index() {
  // Logic for auth state goes here later
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/today" />;
  }

  return <Redirect href="/(auth)/login" />;
}
