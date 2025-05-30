import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function TabsIndex() {
  const router = useRouter();
  
  useEffect(() => {
    // Navigate to daily screen on load
    router.replace('/daily');
  }, [router]);
  
  // Return null while redirecting
  return null;
}
