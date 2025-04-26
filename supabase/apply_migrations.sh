#!/bin/bash

# Apply migrations and seed data to Supabase project

# Check if SUPABASE_PROJECT_ID is set
if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "Error: SUPABASE_PROJECT_ID environment variable is not set."
  echo "Please set it with your Supabase project ID."
  exit 1
fi

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Error: supabase CLI is not installed."
  echo "Please install it with 'npm install -g supabase'."
  exit 1
fi

echo "Applying migrations to project $SUPABASE_PROJECT_ID..."

# Apply the schema
echo "Applying schema migrations..."
supabase db push

# Apply seed data
echo "Applying seed data..."
supabase db execute --file ./supabase/seed_data.sql

echo "All done! Migrations and seed data have been applied." 