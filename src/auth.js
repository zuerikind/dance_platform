/**
 * Central auth and capability checks for Discovery actions (reviews, suggest listing).
 * getCapabilities(targetContext) is used by all action buttons for consistent gating.
 * bootstrapAuth(supabaseClient) populates state.auth from session and profiles.
 */

import { state } from './state.js';

/**
 * Load session and profile into state.auth; create profile row if missing (idempotent).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabaseClient
 */
export async function bootstrapAuth(supabaseClient) {
    if (!state.auth) state.auth = { session: null, user: null, profile: null, loading: false, error: null };
    state.auth.loading = true;
    state.auth.error = null;
    try {
        if (!supabaseClient) {
            state.auth = { session: null, user: null, profile: null, loading: false, error: null };
            return;
        }
        const { data: sessData } = await supabaseClient.auth.getSession();
        const session = sessData?.session ?? null;
        const user = session?.user ?? null;
        if (!session || !user?.id) {
            state.auth = { session: null, user: null, profile: null, loading: false, error: null };
            state.userProfile = null;
            return;
        }
        let profile = (await supabaseClient.from('profiles').select('*').eq('id', user.id).maybeSingle()).data;
        if (!profile) {
            await supabaseClient.from('profiles').upsert({
                id: user.id,
                email: (user.email || '').toLowerCase() || null,
                role: 'dancer',
                origin: 'discovery',
                email_confirmed: false
            }, { onConflict: 'id' });
            profile = (await supabaseClient.from('profiles').select('*').eq('id', user.id).single()).data ?? null;
        }
        state.auth = { session, user, profile, loading: false, error: null };
        state.userProfile = profile;
    } catch (err) {
        state.auth = { session: state.auth?.session ?? null, user: state.auth?.user ?? null, profile: state.auth?.profile ?? null, loading: false, error: err?.message || 'Auth failed' };
    }
}

/**
 * @param {string} [targetContext] - 'review' | 'suggest' | undefined (both)
 * @returns {{
 *   isLoggedIn: boolean,
 *   hasProfile: boolean,
 *   emailConfirmed: boolean,
 *   canReview: boolean,
 *   canSuggestListing: boolean,
 *   reason: 'ok'|'not_logged_in'|'no_profile'|'email_not_confirmed'|'rate_limited'|'not_eligible',
 *   cta: { label: string, action: string }
 * }}
 */
export function getCapabilities(targetContext) {
    const t = (key) => (typeof window !== 'undefined' && window.t ? window.t(key) : key);
    const defaultCta = { label: t('sign_in') || 'Log in', action: 'login' };
    const profile = state.auth?.profile ?? state.userProfile;
    const session = state.auth?.session;
    const user = state.auth?.user ?? session?.user;
    const isLoggedIn = !!(user?.id || state.currentUser?.id);
    const hasProfile = !!profile;
    const emailConfirmed = !profile ? false : (profile.origin !== 'discovery' || !!profile.email_confirmed);
    const needReview = !targetContext || targetContext === 'review';
    const needSuggest = !targetContext || targetContext === 'suggest';

    if (!isLoggedIn) {
        return {
            isLoggedIn: false,
            hasProfile: false,
            emailConfirmed: false,
            canReview: false,
            canSuggestListing: false,
            reason: 'not_logged_in',
            cta: defaultCta
        };
    }
    if (!hasProfile) {
        return {
            isLoggedIn: true,
            hasProfile: false,
            emailConfirmed: false,
            canReview: false,
            canSuggestListing: false,
            reason: 'no_profile',
            cta: { label: t('profile_sign_in_required') || 'Complete profile', action: 'profile' }
        };
    }
    if (!emailConfirmed) {
        return {
            isLoggedIn: true,
            hasProfile: true,
            emailConfirmed: false,
            canReview: false,
            canSuggestListing: false,
            reason: 'email_not_confirmed',
            cta: { label: t('resend_verification') || 'Confirm email', action: 'confirm_email' }
        };
    }

    const canReview = needReview;
    const canSuggestListing = needSuggest;
    return {
        isLoggedIn: true,
        hasProfile: true,
        emailConfirmed: true,
        canReview,
        canSuggestListing,
        reason: 'ok',
        cta: { label: '', action: '' }
    };
}
