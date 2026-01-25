import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pkzdzbhykshhnipzxpeu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBremR6Ymh5a3NoaG5pcHp4cGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNzI1NTUsImV4cCI6MjA4NDg0ODU1NX0.CFmD3DUtODibWM-KFcgJoJN79JOWjicHx3sP4cLjTbA'

export const supabase = createClient(supabaseUrl, supabaseKey)