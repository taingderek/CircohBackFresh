# CircohBack

CircohBack is a relationship management mobile app that helps users maintain connections with important contacts through reminders, AI messaging, and tracking.

## Features

- Contact management with birthdays and location tracking
- Smart reminders for birthdays and regular check-ins
- Travel planning with location-based friend finder
- User profiles with subscription management
- Premium features for enhanced relationship management

## Getting Started

### Prerequisites

- Node.js 14+ 
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/CircohBack.git
cd CircohBack
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

```
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_AUTH_REDIRECT_URL=circohback://login/callback

# Environment (development, staging, production)
EXPO_PUBLIC_APP_ENV=development

# Feature Flags
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=false
EXPO_PUBLIC_ENABLE_REMOTE_LOGGING=false
EXPO_PUBLIC_ENABLE_MOCK_API=false
EXPO_PUBLIC_DEBUG_MODE=true
```

4. Start the development server:

```bash
npx expo start
```

## Supabase Configuration

The app is configured to use Supabase for backend services. The connection is set up in `app/core/services/supabaseClient.ts`, which provides a centralized client instance for the entire application.

To test the Supabase connection:

```bash
# Run the test script
npx ts-node scripts/check-supabase.ts
```

## Project Structure

- **/app** - React Native application
  - **/assets** - Images, fonts, and static resources
  - **/components** - Reusable UI components
  - **/core** - Core application logic
    - **/config** - Configuration files
    - **/hooks** - Custom React hooks
    - **/services** - API and external service integrations
    - **/store** - Redux state management
    - **/types** - TypeScript type definitions
    - **/utils** - Helper functions and utilities
  - **/screens** - Application screens
  - **/navigation** - Navigation configuration

## Database Structure

The database includes the following main tables:

- **auth.users** - User authentication data
- **profiles** - User profile information
- **contacts** - User's contact list with birthday and location data
- **reminders** - Reminders for birthdays, regular check-ins, etc.
- **travel_plans** - Travel plans with location information

## License

[MIT](LICENSE)

## Additional Dependencies

The project includes an installation script for additional recommended libraries that enhance CircohBack's functionality:

```bash
# Make the script executable if needed
chmod +x install-additional-deps.sh

# Run the installation script
./install-additional-deps.sh

# If developing for iOS, install pods afterward
cd ios && pod install && cd ..
```

### Additional libraries include:

- Enhanced navigation (@react-navigation/stack)
- UI and animations (moti, react-native-skia, lottie-react-native)
- Improved state management (zustand, immer) 
- Device features (react-native-device-info, react-native-mmkv)
- Calendar and sharing functionality
- Enhanced permissions management
- Analytics and charting capabilities
- Development tools like plop for generating boilerplate code

These libraries complement the existing codebase without creating conflicts. 