import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const { error } = await supabase.rpc('exec_sql', {
  sql: `
    ALTER TABLE public.member_invites ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Service role only" ON public.member_invites
      USING (auth.role() = 'service_role');
  `,
})

if (error) {
  console.error(error)
  process.exit(1)
} else {
  console.log('RLS enabled on member_invites ✓')
}
