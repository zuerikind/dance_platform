// Shared Calendly API helpers: token refresh, ensure valid access token.
// Caller uses Supabase service client and passes connection row.

const CALENDLY_TOKEN_URL = 'https://auth.calendly.com/oauth/token';
const BUFFER_SECONDS = 120; // refresh if expires in less than 2 min

export type ConnectionRow = {
  id: string;
  school_id: string;
  calendly_user_uri: string;
  organization_uri: string | null;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  webhook_subscription_uri: string | null;
};

export async function ensureValidToken(
  conn: ConnectionRow,
  adminClient: { from: (table: string) => { update: (data: unknown) => { eq: (col: string, val: string) => Promise<{ error: unknown }> } } },
  env: { CALENDLY_CLIENT_ID?: string; CALENDLY_CLIENT_SECRET?: string }
): Promise<string> {
  const expiresAt = new Date(conn.token_expires_at).getTime();
  const now = Date.now();
  if (expiresAt > now + BUFFER_SECONDS * 1000) {
    return conn.access_token;
  }
  const clientId = env.CALENDLY_CLIENT_ID;
  const clientSecret = env.CALENDLY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Calendly OAuth not configured');
  }
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: conn.refresh_token,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(CALENDLY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  const accessToken = data.access_token;
  const refreshToken = data.refresh_token ?? conn.refresh_token;
  const expiresIn = data.expires_in ?? 7200;
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  const { error } = await adminClient
    .from('calendly_connections')
    .update({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: tokenExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conn.id);
  if (error) {
    console.error('Failed to save refreshed tokens:', error);
  }
  return accessToken;
}
