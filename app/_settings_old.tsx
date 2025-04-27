// This file redirects to the settings page in the settings directory
// to resolve the routing conflict between 'settings' and 'settings/index'
import { Redirect } from 'expo-router';

export default function SettingsRedirect() {
  return <Redirect href="/settings/" />;
} 