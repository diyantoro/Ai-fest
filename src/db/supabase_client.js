import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

let rawUrl = process.env.SUPABASE_URL || '';
// Strip trailing /rest/v1 or / if user pasted rest URL
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.includes('.supabase.co') && 
  supabaseKey !== 'your_supabase_anon_key'
);

export let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    logger.info('Supabase client successfully connected.', { url: supabaseUrl });
  } catch (err) {
    logger.error('Failed to initialize Supabase client', err);
    supabase = null;
  }
} else {
  logger.warn('Supabase credentials not configured in .env. Operating in SQLite/Local storage mode.');
}
