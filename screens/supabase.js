// supabase.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://axxiixvxpgitnxhlkfpp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4eGlpeHZ4cGdpdG54aGxrZnBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwODQwODIsImV4cCI6MjEwNDY2MDA4Mn0.I4qo1tqs20WNE3JWcsfIDs-VaAeVm8FMFu7dv1IyBPI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
