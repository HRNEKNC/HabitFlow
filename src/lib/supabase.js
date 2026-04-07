import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://gheqwvncvofchhwzatzo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZXF3dm5jdm9mY2hod3phdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTI1NDIsImV4cCI6MjA5MDgyODU0Mn0.EpOt5HFBu7ApYLMzWE6pCnTcTk1JoKllHoY7r-Hp25w";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
