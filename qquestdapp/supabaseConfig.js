require('dotenv').config();
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ykggbhyyywyzyfxoqpab.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZ2diaHl5eXd5enlmeG9xcGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzMjc1OTcsImV4cCI6MjA0NDkwMzU5N30.st6bgsvxo1KVhoSTCSrVLMxs90zc-YCYhuEhuXi87h0"
export const supabase = createClient(supabaseUrl, supabaseKey)