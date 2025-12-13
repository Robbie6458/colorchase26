/**
 * Migration script to import user data from CSV into Supabase
 * Run this script to migrate your existing user data
 * 
 * Usage: npx ts-node scripts/migrate-users.ts
 */

import { createServerClient } from '../app/lib/supabase';

// Your existing user data from the CSV
const existingUsers = [
  {
    id: '110783650757634567558', // google_sub
    email: 'robbie6458@gmail.com',
    player_name: 'Rbrt',
  },
  {
    id: '105721434841619502578', // google_sub
    email: 'toreyroutson@gmail.com',
    player_name: 'Torey',
  },
];

async function migrateUsers() {
  const supabase = createServerClient();

  console.log('Starting user migration...');

  for (const user of existingUsers) {
    try {
      // First, create auth user with Google OAuth
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        user_metadata: {
          player_name: user.player_name,
        },
      });

      if (error) {
        console.error(`Error creating auth user for ${user.email}:`, error);
        continue;
      }

      // Then create the profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: user.email,
          player_name: user.player_name,
          google_sub: user.id,
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
      } else {
        console.log(`✓ Migrated user: ${user.player_name} (${user.email})`);
      }
    } catch (err) {
      console.error(`Error migrating user ${user.email}:`, err);
    }
  }

  console.log('User migration complete!');
}

migrateUsers().catch(console.error);
