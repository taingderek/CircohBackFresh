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

3. Start the development server:

```bash
npx expo start
```

## Supabase Configuration

The app is configured to use Supabase for backend services. The connection is set up in `app/core/config/supabaseConfig.ts`.

To test the Supabase connection:

```bash
# Run the test script
npx ts-node scripts/testSupabaseConnection.ts
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