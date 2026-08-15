import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  const globalProc = (globalThis as any).process;
  if (globalProc && globalProc.env && globalProc.env[key]) {
    return globalProc.env[key] as string;
  }
  return defaultValue;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://iknxldrylfsuphaydamr.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbnhsZHJ5bGZzdXBoYXlkYW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNDY1NTAsImV4cCI6MjEwMDgyMjU1MH0.Dw-QBxAYHyOxF9PpWLBhQx_IqZ3T5biEfus0_40sEO4');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
