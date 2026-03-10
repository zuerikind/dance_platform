// Sync a legacy admin's Supabase Auth password with their DB password.
// Called during login when signInWithPassword fails but legacy credentials pass.
// Each step returns a specific error so failures are diagnosable from the UI.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const body = await req.json().catch(() => ({})) as { email?: string; password?: string; school_id?: string };
    const { email, password, school_id } = body;
    if (!email || !password || !school_id) {
      return json({ error: 'email, password, and school_id are required' }, 400);
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    // Step 1: Verify legacy credentials
    let admins: unknown[] | null = null;
    try {
      const { data, error: credErr } = await serviceClient.rpc('get_admin_by_email_credentials', {
        p_email: email,
        p_password: password,
        p_school_id: school_id,
      });
      if (credErr) return json({ error: `step1_rpc: ${credErr.message}` }, 500);
      admins = Array.isArray(data) ? data : null;
    } catch (e) {
      return json({ error: `step1_exception: ${String(e)}` }, 500);
    }
    if (!admins || admins.length === 0) {
      return json({ error: 'Invalid credentials' }, 401);
    }

    // Step 2: Find or create the Supabase Auth user
    let authUserId: string | null = null;
    try {
      // Try creating first (works when user doesn't exist yet)
      const { data: created, error: createErr } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (created?.user?.id) {
        authUserId = created.user.id;
      } else {
        // User already exists — find by listing and filtering
        let found: { id: string; email?: string | null } | undefined;
        for (let page = 1; page <= 10 && !found; page++) {
          const { data: usersPage, error: listErr } = await serviceClient.auth.admin.listUsers({ page, perPage: 1000 });
          if (listErr) return json({ error: `step2_listUsers_p${page}: ${listErr.message}` }, 500);
          found = usersPage?.users?.find((u: { id: string; email?: string | null }) =>
            u.email?.toLowerCase() === email.toLowerCase()
          );
          if (!usersPage?.users?.length || usersPage.users.length < 1000) break;
        }
        if (!found?.id) {
          return json({ error: `step2_not_found: user not in listUsers (createErr: ${createErr?.message})` }, 500);
        }
        authUserId = found.id;
        // Update password and confirm email
        const { error: updErr } = await serviceClient.auth.admin.updateUserById(authUserId, {
          password,
          email_confirm: true,
        });
        if (updErr) return json({ error: `step2_update: ${updErr.message}` }, 500);
      }
    } catch (e) {
      return json({ error: `step2_exception: ${String(e)}` }, 500);
    }

    // Step 3: Link admin row user_id
    try {
      await serviceClient.from('admins')
        .update({ user_id: authUserId })
        .eq('school_id', school_id)
        .ilike('email', email);
    } catch (_) {
      // Non-fatal — continue to sign-in
    }

    // Step 4: Sign in to get a session
    let session: { access_token?: string; refresh_token?: string } = {};
    try {
      const signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: supabaseAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      session = await signInRes.json();
    } catch (e) {
      return json({ error: `step4_exception: ${String(e)}` }, 500);
    }
    if (!session?.access_token) {
      return json({ error: `step4_no_token: ${JSON.stringify(session)}` }, 500);
    }

    return json({ access_token: session.access_token, refresh_token: session.refresh_token });
  } catch (e) {
    console.error('admin-auth-sync unhandled:', e);
    return json({ error: String(e) }, 500);
  }
});
