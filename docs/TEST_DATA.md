# CircohBack Test Data Generator

This document explains how to use the test data generation tools built into CircohBack to create realistic test accounts and data for development and testing purposes.

## Overview

The test data generator provides:
1. The ability to create test user accounts with customizable profile details
2. Generation of realistic test data including contacts, reminders, streaks, and travel plans
3. A user-friendly UI for generating test data directly within the app

## Access the Test Data Generator

The Test Data Generator is available only in development builds and can be accessed in two ways:

1. **Profile Menu**: In the app, navigate to the Profile tab and look for the "Test Data Generator" menu item at the bottom (only visible in development builds)
2. **Direct URL**: Navigate to `/admin/test-data` in the app

## Features

### 1. Create Test Users

- Create test users with customizable:
  - Email address
  - Password
  - Full name
  - Avatar URL 
  - Subscription tier (free or premium)

These users are created with actual authentication in Supabase, allowing you to test login/logout and other authentication flows with real credentials.

### 2. Generate Test Data

Once you've created a test user, you can generate test data for them including:

- **Contacts**: Generate test contacts with realistic details including names, contact info, relationships, and locations
- **Reminders**: Create upcoming and past reminders associated with contacts
- **Streaks**: Generate streak data for app usage, relationships, and messaging
- **Travel Plans**: Create future and past travel plans with associated contacts

### 3. Customization Options

You can customize what data gets generated:

- Specify how many contacts to create (1-10)
- Toggle whether to include reminders
- Toggle whether to include streaks data
- Toggle whether to include travel plans

## Technical Implementation

The system consists of three main components:

1. **UI**: A React Native screen (`TestDataGenerator.tsx`) in the admin section
2. **Edge Functions**:
   - `create_test_user`: Creates a Supabase auth account and associated profile
   - `generate_test_data`: Populates the database with realistic test data for a specified user

## Adding New Test Data Types

To extend the test data generator with new types of data:

1. Update the `generate_test_data` edge function in Supabase
2. Add the new data type to the UI options in `TestDataGenerator.tsx`
3. Document the new data type in this file

## Best Practices

- Use test data for functional testing, not performance testing (it may not represent realistic data volumes)
- Reset or delete test data before production deployment
- Test with both free and premium tier users to verify subscription-based features
- When creating test users, use email addresses with a consistent pattern (e.g., `test+NAME@circohback.com`) to easily identify test accounts

## Security Note

The test data generator is only available in development builds and will not be accessible in production. 
The Edge Functions have appropriate security controls to prevent misuse.

## Troubleshooting

If you encounter issues with the test data generator:

1. Check the console logs for error messages
2. Verify that your Supabase instance is running and accessible
3. Ensure you have the correct permissions in Supabase
4. Check that the service role key is properly configured in your Supabase environment

For persistent issues, check the error logs in the Supabase dashboard. 