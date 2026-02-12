// Edge Function: Upload competition logo via service role (bypasses Storage RLS auth.uid() bug).
// Verifies caller is school/platform admin via RPC before uploading.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const schoolId = formData.get('schoolId') as string | null
    const compId = formData.get('compId') as string | null

    if (!file || !schoolId || !compId) {
      return new Response(JSON.stringify({ error: 'Missing file, schoolId, or compId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify user is admin via RPC (auth works in RPC context)
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: isAdmin, error: rpcError } = await userClient.rpc('check_school_admin_for_upload', {
      p_school_id: schoolId,
    })
    if (rpcError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Permission denied: not an admin for this school' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const ext = (file.name.match(/\.(jpe?g|png|gif|webp)$/i) || ['', 'jpg'])[1]?.toLowerCase() || 'jpg'
    const path = `${schoolId}/${compId}/logo.${ext}`
    const contentType = file.type || (ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg')

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await adminClient.storage
      .from('competition-logos')
      .upload(path, arrayBuffer, { upsert: true, contentType })

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ path }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
