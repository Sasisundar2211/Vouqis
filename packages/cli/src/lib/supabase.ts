import {createClient} from '@supabase/supabase-js'

export const supabase = createClient(
  'https://plplgsvoyjhdyntfaubf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscGxnc3ZveWpoZHludGZhdWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzA4NDksImV4cCI6MjA5NDM0Njg0OX0.eKTrBaexFLKS4UPoiHpV93a69Hjh7a82OvqFQskA0ZM',
)
