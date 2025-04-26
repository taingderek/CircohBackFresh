import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function TabsIndex() {
  const router = useRouter();
  
  useEffect(() => {
    // Use imperative navigation instead of Redirect component
    router.replace('/home');
  }, [router]);
  
  // Return null while redirecting
  return null;
}
