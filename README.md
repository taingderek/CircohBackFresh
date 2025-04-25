# CircohBack Mobile App

CircohBack is a mobile application designed to help users maintain meaningful connections with their important contacts.

## Features

- Authentication with Supabase
- Contact management
- Reminder system for periodic check-ins
- Personalized connection schedules
- Activity tracking and analytics

## Environment Setup

This app requires environment variables to connect to Supabase. Create a `.env` file in the root directory with the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Default values are provided in the `app/core/config/env.ts` file for development purposes.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Yarn or npm
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env` file with your Supabase credentials (see Environment Setup)
4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Project Structure

- `app/` - Main application code
  - `(auth)/` - Authentication screens
  - `(tabs)/` - Main app tabs
  - `core/` - Core functionality
    - `config/` - Configuration files
    - `constants/` - Application constants
    - `providers/` - Context providers
    - `store/` - Redux store
    - `utils/` - Utility functions

## Technologies Used

- React Native
- Expo
- Redux Toolkit
- Supabase
- Expo Router

## License

This project is licensed under the MIT License. 