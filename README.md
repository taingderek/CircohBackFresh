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

## Database Setup

The application uses Supabase for database functionality. The database schema and sample data can be set up using the provided migration files.

### Migrations and Seed Data

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Set your Supabase project ID as an environment variable:
   ```bash
   export SUPABASE_PROJECT_ID=your_project_id
   ```

4. Run the migrations and seed script:
   ```bash
   ./supabase/apply_migrations.sh
   ```

This will create all the necessary tables and populate them with test data for development purposes.

### Database Schema

The application uses the following main tables:
- `profiles` - Extended user information
- `todos` - Task management
- `categories` - Todo categorization
- `habits` - Habit tracking
- `mood_logs` - Mood tracking
- `focus_sessions` - Focused work periods
- `gratitude_entries` - Gratitude journal
- `shared_todos` - Collaboration features

## Technologies Used

- React Native
- Expo
- Redux Toolkit
- Supabase
- Expo Router

## License

This project is licensed under the MIT License. 