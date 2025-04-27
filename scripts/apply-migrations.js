const { supabase } = require('../app/core/services/supabaseClient');
const fs = require('fs');
const path = require('path');

async function applyMigrations() {
  console.log('Applying migrations to Supabase...');
  
  try {
    // Get the migration files
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order
    
    console.log(`Found ${files.length} migration files to apply`);
    
    // Apply each migration
    for (const file of files) {
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Error applying migration ${file}:`, error);
        // Continue with next migration even if one fails
      } else {
        console.log(`Successfully applied migration: ${file}`);
      }
    }
    
    console.log('Migration process completed');
    
  } catch (err) {
    console.error('Unexpected error during migrations:', err);
  }
}

// Run the migrations
applyMigrations(); 