import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/use-auth-store';
import { LoadingState } from '@/components/ui/loading-state';

export default function Index() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingState />;
  }

  if (user) {
    return <Redirect href="/(tabs)/today" />;
  }

  return <Redirect href="/(auth)/login" />;
}
