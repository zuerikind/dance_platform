/**
 * Entry point. Bundled to app.js so index.html keeps one script tag.
 * Attaches core modules to window for HTML and legacy, runs legacy, then init and event listeners.
 */
import { escapeHtml, supabaseClient, DISCOVERY_COUNTRIES_CITIES, DISCOVERY_COUNTRIES, AURE_SCHOOL_ID, CALENDLY_FEATURE_ENABLED } from './config.js';
import { state, saveState, setSessionIdentity, clearSessionIdentity, sessionIdentityMatches, resetInactivityTimer, checkInactivity } from './state.js';
import { setLocalesDict, t, updateI18n } from './locales.js';
import { formatPrice, formatClassTime, getPlanExpiryUseFixedDate, schoolHasDualGroupPrivateOffering } from './utils.js';
import { parseHashRoute, parseQueryAndHashForView, navigateToAdminJackAndJill, navigateToStudentJackAndJill } from './routing.js';
import { getCapabilities, bootstrapAuth } from './auth.js';
import {
    closeRevenueAttributionPopover,
    toggleRevenueAttributionPopover
} from './kpi/revenueFiltersUi.js';

const SCHOOL_THEME_BY_ID = {
    [AURE_SCHOOL_ID]: 'aure'
};

function resolveSchoolThemeKey() {
    const school = state.currentSchool;
    if (!school) return '';
    const mapped = school.id ? SCHOOL_THEME_BY_ID[school.id] : '';
    const raw = mapped || school.discovery_slug || school.slug || '';
    return String(raw || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

function getMetaThemeColor(theme) {
    const schoolTheme = resolveSchoolThemeKey();
    if (schoolTheme === 'aure') return '#a6b5b2';
    return theme === 'dark' ? '#000000' : '#f5f5f7';
}

function applySchoolTheme() {
    if (typeof document === 'undefined') return;
    const themeKey = resolveSchoolThemeKey();
    if (themeKey) document.body.setAttribute('data-school-theme', themeKey);
    else document.body.removeAttribute('data-school-theme');
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', getMetaThemeColor(state.theme));
}

if (typeof window !== 'undefined') {
    window.getCapabilities = getCapabilities;
    window.parseHashRoute = parseHashRoute;
    window.parseQueryAndHashForView = parseQueryAndHashForView;
    window.navigateToAdminJackAndJill = navigateToAdminJackAndJill;
    window.navigateToStudentJackAndJill = navigateToStudentJackAndJill;
    window.escapeHtml = escapeHtml;
    window.state = state;
    window.t = t;
    window.updateI18n = updateI18n;
    window.saveState = saveState;
    window.setSessionIdentity = setSessionIdentity;
    window.clearSessionIdentity = clearSessionIdentity;
    window.sessionIdentityMatches = sessionIdentityMatches;
    window.resetInactivityTimer = resetInactivityTimer;
    window.checkInactivity = checkInactivity;
    window.formatPrice = formatPrice;
    window.formatClassTime = formatClassTime;
    window.getPlanExpiryUseFixedDate = getPlanExpiryUseFixedDate;
    window.schoolHasDualGroupPrivateOffering = schoolHasDualGroupPrivateOffering;
    window.DISCOVERY_COUNTRIES_CITIES = DISCOVERY_COUNTRIES_CITIES;
    window.DISCOVERY_COUNTRIES = DISCOVERY_COUNTRIES;
    window.applySchoolTheme = applySchoolTheme;
    window.toggleRevenueAttributionPopover = toggleRevenueAttributionPopover;
    window.closeRevenueAttributionPopover = closeRevenueAttributionPopover;
}

import './legacy.js';

// --- Event listeners and init (run after legacy has attached handlers to window) ---
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // When Supabase refresh token is invalid, sign out and show login so the user can re-authenticate.
    // This prevents red AuthApiError in console and fixes broken session (e.g. group classes "jumping back" after save).
    window.addEventListener('unhandledrejection', function onAuthRejection(event) {
        const err = event?.reason;
        const msg = (err?.message || err?.msg || String(err || '')).toLowerCase();
        if (!msg) return;
        const isInvalidRefresh = msg.includes('invalid refresh') || msg.includes('refresh token not found') || msg.includes('refresh token');
        const isAuthError = (err?.name === 'AuthApiError') || (err?.status === 400 && isInvalidRefresh);
        if (!isAuthError && !isInvalidRefresh) return;
        event.preventDefault();
        if (supabaseClient) {
            supabaseClient.auth.signOut().catch(() => {});
        }
        if (state.currentUser || state.isAdmin || state.isPlatformDev) {
            state.currentUser = null;
            state.isAdmin = false;
            state.isPlatformDev = false;
            state.currentSchool = null;
            state.currentView = 'school-selection';
            saveState();
            if (typeof window.renderView === 'function') window.renderView();
        }
    });

    const PW_RECOVERY_STORAGE = 'bailadmin_pw_recovery';

    if (supabaseClient && supabaseClient.auth) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' && session?.user) {
                try { sessionStorage.setItem(PW_RECOVERY_STORAGE, '1'); } catch (_) {}
                state.authRecoveryMode = true;
                state.currentView = 'reset-password';
                state.currentUser = null;
                state.isAdmin = false;
                state.isPlatformDev = false;
                saveState();
                if (typeof window.renderView === 'function') window.renderView();
                return;
            }
            if (event === 'INITIAL_SESSION' && session?.user && typeof window !== 'undefined') {
                const h = window.location.hash || '';
                if (h.includes('type=recovery')) {
                    try { sessionStorage.setItem(PW_RECOVERY_STORAGE, '1'); } catch (_) {}
                    state.authRecoveryMode = true;
                    state.currentView = 'reset-password';
                    state.currentUser = null;
                    state.isAdmin = false;
                    state.isPlatformDev = false;
                    saveState();
                    if (typeof window.renderView === 'function') window.renderView();
                    return;
                }
            }
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (session?.user && state.isAdmin) {
                    if (!state.auth) state.auth = { session: null, user: null, profile: null, loading: false, error: null };
                    state.auth.user = session.user;
                    state.auth.session = session;
                }
            }
            if (event === 'SIGNED_OUT') {
                try { sessionStorage.removeItem(PW_RECOVERY_STORAGE); } catch (_) {}
                state.authRecoveryMode = false;
                if (state.currentUser || state.isAdmin || state.isPlatformDev) {
                    state.currentUser = null;
                    state.isAdmin = false;
                    state.isPlatformDev = false;
                    state.currentSchool = null;
                    state.currentView = 'school-selection';
                    saveState();
                    if (typeof window.renderView === 'function') window.renderView();
                }
            }
        });
    }

    window.addEventListener('scroll', () => { window.updateStickyFooterVisibility(); }, { passive: true });
    window.addEventListener('resize', () => { window.updateStickyFooterVisibility(); });
    document.addEventListener('focusin', () => window.updateStickyFooterVisibility());
    document.addEventListener('focusout', () => window.updateStickyFooterVisibility());
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => window.updateStickyFooterVisibility());
        window.visualViewport.addEventListener('scroll', () => window.updateStickyFooterVisibility());
    }

    document.getElementById('lang-toggle').addEventListener('click', () => {
        state.language = state.language === 'en' ? 'es' : 'en';
        saveState(); updateI18n(); window.renderView();
    });

    document.getElementById('dev-login-trigger').addEventListener('click', () => window.promptDevLogin());

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const target = e.target;
            if (target.id === 'dev-pass-input') window.submitDevLogin();
            if (target.id === 'auth-forgot-email') {
                if (typeof window.requestPasswordResetFromAuthStudent === 'function') window.requestPasswordResetFromAuthStudent();
            }
            if (target.id === 'auth-pass' || target.id === 'auth-pass-confirm') {
                const isSignup = state.authMode === 'signup';
                if (isSignup) window.signUpStudent(); else window.loginStudent();
            }
            if (target.id === 'recovery-new-pass' || target.id === 'recovery-confirm-pass') {
                if (typeof window.submitPasswordRecovery === 'function') window.submitPasswordRecovery();
            }
            if (target.id === 'admin-pass-input') window.loginAdminWithCreds();
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => window.logout());
    document.getElementById('close-scanner').addEventListener('click', () => window.stopScanner());

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            const prevView = state.currentView;
            if (prevView === 'admin-settings') {
                state._settingsScrollTop = window.scrollY ?? document.documentElement?.scrollTop ?? 0;
                state._settingsScrollTime = Date.now();
            }
            state.currentView = view;
            if (view === 'dashboard-profile') {
                window.location.hash = '#/dashboard/profile';
            } else if (view !== 'admin-competition-jack-and-jill' && view !== 'student-competition-register') {
                window.location.hash = '';
            }
            saveState();
            window.renderView();
            const canRestoreSettings = view === 'admin-settings' && state._settingsScrollTime != null && (Date.now() - state._settingsScrollTime) < 10 * 60 * 1000 && (state._settingsScrollTop ?? 0) >= 0;
            if (canRestoreSettings) {
                requestAnimationFrame(() => { requestAnimationFrame(() => { window.scrollTo(0, state._settingsScrollTop); }); });
            } else {
                window.scrollTo(0, 0);
            }
            if (view === 'qr' && state.currentUser && !state.isAdmin && state.currentUser.id && (state.currentUser.school_id || state.currentSchool?.id) && supabaseClient) {
                window.fetchAllData();
            }
        });
    });

    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', state.theme);
        document.body.classList.toggle('dark-mode', state.theme === 'dark');
        const icon = state.theme === 'dark' ? 'moon' : 'sun';
        document.getElementById('theme-icon').setAttribute('data-lucide', icon);
        applySchoolTheme();
        saveState();
        if (typeof window.lucide !== 'undefined' && window.lucide.createIcons) window.lucide.createIcons();
    });

    let logoPressTimer;
    let superAdminTimer;
    let isLongPress = false;
    const logoEl = document.querySelector('.logo');
    if (logoEl) {
        logoEl.addEventListener('mousedown', () => {
            isLongPress = false;
            logoPressTimer = setTimeout(() => {
                isLongPress = true;
                state.isAdmin = !state.isAdmin;
                state.currentView = state.isAdmin ? 'admin-students' : (state.currentSchool?.profile_type === 'private_teacher' ? 'teacher-booking' : 'schedule');
                window.renderView();
                window.scrollTo(0, 0);
            }, 2000);
            superAdminTimer = setTimeout(() => {
                isLongPress = true;
                state.currentView = 'super-admin-dashboard';
                window.renderView();
                window.scrollTo(0, 0);
            }, 5000);
        });
        logoEl.addEventListener('mouseup', () => {
            clearTimeout(logoPressTimer);
            clearTimeout(superAdminTimer);
        });
        logoEl.addEventListener('click', () => {
            if (!isLongPress) window.logout();
        });
    }

    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
        window.addEventListener(evt, window.resetInactivityTimer, { passive: true });
    });

    (async function init() {
        const path = (window.location.pathname || '').replace(/\/$/, '') || '/';
        if (path === '/discovery' || path.startsWith('/discovery/')) {
            state.discoveryPath = path;
        }
        parseQueryAndHashForView();
        const params = new URLSearchParams(window.location.search);
        const mockDateStr = params.get('mockDate');
        if (mockDateStr) {
            const d = new Date(mockDateStr);
            if (!isNaN(d.getTime())) state.mockDate = mockDateStr;
        }
        const hostname = typeof window !== 'undefined' && window.location && window.location.hostname ? window.location.hostname.toLowerCase() : '';
        const isAureSubdomain = hostname === 'aure.bailadmin.lat' || hostname === 'aurea.bailadmin.lat';
        if (isAureSubdomain) {
            state.currentSchool = { id: AURE_SCHOOL_ID, name: 'AURÉ', discovery_slug: 'aure' };
            state._aureSubdomain = true;
        }
        const local = localStorage.getItem('dance_app_state');
        let saved = {};
        try {
            saved = local ? JSON.parse(local) : {};
        } catch (_) { saved = {}; }
        if (local && !state.discoveryPath) {
            state.language = saved.language || 'en';
            state.theme = (saved.theme === 'light' || saved.theme === 'dark') ? saved.theme : 'dark';
            if (saved.currentUser) state.currentUser = saved.currentUser;
            if (saved.isAdmin !== undefined) state.isAdmin = saved.isAdmin;
            if (saved.isPlatformDev !== undefined) state.isPlatformDev = saved.isPlatformDev;
            if (saved.currentView && state.currentView !== 'verify-email' && saved.currentView !== 'reset-password') state.currentView = saved.currentView;
            if (saved.scheduleView) state.scheduleView = saved.scheduleView;
            if (saved.lastActivity) state.lastActivity = saved.lastActivity;
            if (saved.currentSchool) state.currentSchool = saved.currentSchool;
            if (saved._discoveryOnlyEdit !== undefined) state._discoveryOnlyEdit = !!saved._discoveryOnlyEdit;
            if (state.currentView === 'discovery-profile-only') state._discoveryOnlyEdit = true;
            if (saved.afterLogin !== undefined) state.afterLogin = saved.afterLogin;
            if (saved.reviewDraft !== undefined) state.reviewDraft = saved.reviewDraft;
            if (saved.currentUser?.school_id && !saved.isAdmin) {
                const match = saved.currentSchool && saved.currentSchool.id === saved.currentUser.school_id;
                state.currentSchool = match ? saved.currentSchool : { id: saved.currentUser.school_id, name: saved.currentSchool?.name || 'School' };
            }
            if (isAureSubdomain) {
                state.currentSchool = { id: AURE_SCHOOL_ID, name: 'AURÉ', discovery_slug: 'aure' };
                if (!state.currentUser && !state.isAdmin && !state.isPlatformDev) state.currentView = 'auth';
            }
            const hasUserState = !!(saved.currentUser || saved.isAdmin || saved.isPlatformDev);
            if (hasUserState && !sessionIdentityMatches(saved)) {
                clearSessionIdentity();
                state.currentUser = null;
                state.isAdmin = false;
                state.isPlatformDev = false;
                state._discoveryOnlyEdit = false;
                state.currentView = 'school-selection';
                state.currentSchool = null;
                state.competitionId = null;
                state.competitionSchoolId = null;
                state.competitionTab = null;
                window.clearSchoolData();
                saveState();
            }
        }
        if (state.discoveryPath && local) {
            state.language = saved.language || state.language || 'en';
            state.theme = (saved.theme === 'light' || saved.theme === 'dark') ? saved.theme : (state.theme || 'dark');
            if (saved.currentUser) state.currentUser = saved.currentUser;
            if (saved.lastActivity) state.lastActivity = saved.lastActivity;
            if (saved._discoveryOnlyEdit !== undefined) state._discoveryOnlyEdit = !!saved._discoveryOnlyEdit;
            if (saved.afterLogin !== undefined) state.afterLogin = saved.afterLogin;
            if (saved.reviewDraft !== undefined) state.reviewDraft = saved.reviewDraft;
        }
        if (isAureSubdomain && !state.currentUser && !state.isAdmin && !state.isPlatformDev) state.currentView = 'auth';

        // Apply theme and icon immediately so first paint is correct and theme never "flips" to light
        document.body.setAttribute('data-theme', state.theme);
        document.body.classList.toggle('dark-mode', state.theme === 'dark');
        const themeIconEl = document.getElementById('theme-icon');
        if (themeIconEl) themeIconEl.setAttribute('data-lucide', state.theme === 'dark' ? 'moon' : 'sun');
        applySchoolTheme();

        // Billing return: apply state from previous load if we just did a reload (sessionStorage)
        try {
            const stored = sessionStorage.getItem('billing_return');
            if (stored) {
                sessionStorage.removeItem('billing_return');
                const { academyId, returnView } = JSON.parse(stored);
                if (academyId) state.currentSchool = { id: academyId, name: state.currentSchool?.name || 'School' };
                if (returnView) state.currentView = returnView;
                else state.currentView = 'admin-settings';
            }
        } catch (_) {}

        // Billing return: Stripe redirects to /?billing=cancel or ?billing=success (or legacy /billing/cancel). Reload so the app loads cleanly with correct state.
        const searchParams = new URLSearchParams(window.location.search);
        const billingReturn = searchParams.get('billing');
        const isLegacyBillingPath = path === '/billing/cancel' || path === '/billing/success';
        if (billingReturn === 'cancel' || billingReturn === 'success' || isLegacyBillingPath) {
            const academyId = searchParams.get('academy');
            const returnViewRaw = searchParams.get('return_view');
            const returnView = returnViewRaw ? decodeURIComponent(returnViewRaw) : 'admin-settings';
            try {
                sessionStorage.setItem('billing_return', JSON.stringify({
                    academyId: academyId ? decodeURIComponent(academyId) : null,
                    returnView
                }));
            } catch (_) {}
            window.history.replaceState(null, '', '/');
            window.location.reload();
            return;
        }

        updateI18n();
        document.body.setAttribute('data-theme', state.theme);
        document.body.classList.toggle('dark-mode', state.theme === 'dark');
        applySchoolTheme();
        if (themeIconEl) themeIconEl.setAttribute('data-lucide', state.theme === 'dark' ? 'moon' : 'sun');
        if (state.isAdmin && state._discoveryOnlyEdit && state.currentSchool?.id && supabaseClient) {
            try {
                const { data } = await supabaseClient.from('schools').select('active').eq('id', state.currentSchool.id).maybeSingle();
                if (data && data.active !== false) {
                    state._discoveryOnlyEdit = false;
                    state.currentView = 'admin-students';
                    saveState();
                }
            } catch (_) {}
        }
        if (typeof window.history !== 'undefined' && window.history.scrollRestoration !== undefined) {
            window.history.scrollRestoration = 'manual';
        }

        const hasAuthState = !!(state.currentUser || state.isAdmin || state.isPlatformDev);
        // Recovery links use hash fragments (#...type=recovery...). getSession() consumes the hash
        // before onAuthStateChange(PASSWORD_RECOVERY) may run, so init would otherwise treat the
        // session as a normal discovery login and leave currentView on school-selection (landing).
        const hashBeforeSession = (typeof window !== 'undefined' && window.location.hash) ? window.location.hash : '';
        let isRecoveryFromUrl = false;
        try {
            const raw = hashBeforeSession.replace(/^#/, '');
            if (raw.includes('type=recovery') || raw.includes('type%3Drecovery') || raw.includes('type%3drecovery')) {
                isRecoveryFromUrl = true;
            } else if (raw) {
                const params = new URLSearchParams(raw);
                if (params.get('type') === 'recovery') isRecoveryFromUrl = true;
            }
        } catch (_) {}
        if (isRecoveryFromUrl) {
            try { sessionStorage.setItem(PW_RECOVERY_STORAGE, '1'); } catch (_) {}
            state.authRecoveryMode = true;
            state.currentView = 'reset-password';
            state.currentUser = null;
            state.isAdmin = false;
            state.isPlatformDev = false;
            state.currentSchool = null;
            state._discoveryOnlyEdit = false;
            saveState();
        }

        let sessRes = { data: { session: null } };
        try {
            sessRes = supabaseClient ? await supabaseClient.auth.getSession() : sessRes;
            if (sessRes?.error && supabaseClient && /refresh|invalid.*token|token.*not found/i.test(sessRes.error.message || '')) {
                await supabaseClient.auth.signOut();
                sessRes = { data: { session: null } };
            }
        } catch (e) {
            if (supabaseClient && e?.message && /refresh|invalid.*token|token.*not found/i.test(String(e.message))) {
                await supabaseClient.auth.signOut().catch(() => {});
            }
        }
        const hasSupabaseSession = !!sessRes?.data?.session?.user;
        let inPwRecovery = false;
        try { inPwRecovery = sessionStorage.getItem(PW_RECOVERY_STORAGE) === '1'; } catch (_) {}
        if (!hasSupabaseSession && inPwRecovery) {
            try { sessionStorage.removeItem(PW_RECOVERY_STORAGE); } catch (_) {}
            state.authRecoveryMode = false;
            inPwRecovery = false;
        }
        if (hasSupabaseSession && inPwRecovery) {
            state.authRecoveryMode = true;
            state.currentView = 'reset-password';
            saveState();
        }
        if (hasSupabaseSession && supabaseClient) await bootstrapAuth(supabaseClient);
        const hash = (typeof window !== 'undefined' && window.location.hash) ? window.location.hash : '';
        const isCalendlyReturn = hash.includes('calendly=connected');
        const calendlySchoolId = isCalendlyReturn && hash.includes('school_id=') ? (hash.match(/school_id=([^&]+)/) || [])[1] : null;
        if (hasAuthState && !hasSupabaseSession) {
            if (isCalendlyReturn && calendlySchoolId) {
                state.currentView = 'admin-settings';
                state.currentSchool = { id: decodeURIComponent(calendlySchoolId), name: 'School' };
                if (local) saveState();
            } else {
                state.currentUser = null;
                state.isAdmin = false;
                state.isPlatformDev = false;
                state._discoveryOnlyEdit = false;
                state.currentView = 'school-selection';
                state.currentSchool = null;
                if (local) saveState();
            }
        } else if (!hasAuthState && hasSupabaseSession && supabaseClient && sessRes?.data?.session?.user && !state.authRecoveryMode) {
            const user = sessRes.data.session.user;
            state.currentUser = { id: user.id, email: user.email ?? user.user_metadata?.email ?? '', role: 'student', school_id: null };
            state.isAdmin = false;
            state.isPlatformDev = false;
            const path = (typeof window !== 'undefined' && window.location?.pathname) ? window.location.pathname : '';
            const hashForDiscovery = (typeof window !== 'undefined' && window.location?.hash) ? window.location.hash : '';
            state._discoveryOnlyEdit = (path.includes('discovery') || hashForDiscovery.includes('discovery'));
            setSessionIdentity();
            if (typeof window.fetchUserProfile === 'function') await window.fetchUserProfile();
            saveState();
        }

        window.renderView();
        window.scrollTo(0, 0);
        if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();

        window.checkInactivity();

        // Capture hash BEFORE parseHashRoute (which may replaceState and strip calendly=error)
        const hashBeforeParse = (typeof window !== 'undefined' && window.location.hash) ? window.location.hash : '';
        const hasCalendlyInHash = hashBeforeParse.includes('calendly=connected') || hashBeforeParse.includes('calendly=error');
        if (window.location.hash) parseHashRoute();
        if (typeof window !== 'undefined' && window.opener && hasCalendlyInHash) {
            if (hashBeforeParse.includes('calendly=error')) {
                const hashQuery = (hashBeforeParse.split('?')[1] || '');
                const params = new URLSearchParams(hashQuery);
                const msg = params.get('message');
                if (window.opener.state) {
                    window.opener.state.calendlyErrorFromRedirect = msg ? decodeURIComponent(msg) : 'Connection failed';
                    window.opener.state._calendlyOAuthPopupOpen = false;
                }
            } else {
                if (window.opener.state) {
                    window.opener.state._calendlyOAuthPopupOpen = false;
                    window.opener.state.calendlyErrorFromRedirect = null;
                }
            }
            if (typeof window.opener.fetchAllData === 'function') {
                window.opener.fetchAllData().then(function () {
                    if (typeof window.opener.renderView === 'function') window.opener.renderView();
                    if (window.opener.lucide && typeof window.opener.lucide.createIcons === 'function') window.opener.lucide.createIcons();
                });
            }
            window.close();
        } else if (state.currentView === 'admin-settings' && hash.includes('calendly=connected') && typeof window.fetchAllData === 'function') {
            window.fetchAllData().then(() => {
                window.renderView();
                if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
                if (CALENDLY_FEATURE_ENABLED && state.currentView === 'admin-settings' && state.calendlyConnected && (!state.calendlyEventTypesList || !state.calendlyEventTypesList.length) && typeof window.loadCalendlyEventTypes === 'function') window.loadCalendlyEventTypes();
            });
        }
        if (saved.currentView && saved.currentView.startsWith('admin-competition') && !window.location.hash) {
            state.competitionId = saved.competitionId || null;
            state.competitionSchoolId = saved.competitionSchoolId || null;
            state.competitionTab = saved.competitionTab || 'edit';
        }
        if (saved.currentView && saved.currentView === 'student-competition-register' && !window.location.hash) {
            state.competitionId = saved.competitionId || null;
        }
        if (saved.currentUser && !saved.isAdmin && saved.currentView === 'student-competition-register' && !window.location.hash) {
            state.currentView = 'qr';
            state.competitionId = null;
            state.studentCompetitionDetail = null;
            state.studentCompetitionRegDetail = null;
        }

        const isStudent = state.currentUser && state.currentUser.school_id && state.currentUser.role !== 'admin' && state.currentUser.role !== 'platform-dev' && !state.isPlatformDev;
        const adminViews = ['admin-competition-jack-and-jill', 'admin-students', 'admin-scanner', 'admin-memberships', 'admin-revenue', 'admin-revenue-analytics', 'admin-settings'];
        const isAdminView = adminViews.includes(state.currentView) || (state.currentView && state.currentView.startsWith('admin-'));
        if (isStudent && isAdminView) {
            state.isAdmin = false;
            state.currentView = (saved.currentView === 'qr' || saved.currentView === 'shop' || saved.currentView === 'schedule' || saved.currentView === 'teacher-booking') ? saved.currentView : 'qr';
            state.competitionId = null;
            state.competitionSchoolId = null;
            state.competitionTab = 'edit';
            window.location.hash = '';
            if (local) saveState();
        }

        updateI18n();
        document.body.setAttribute('data-theme', state.theme);
        document.body.classList.toggle('dark-mode', state.theme === 'dark');
        applySchoolTheme();

        if (state.discoveryPath && supabaseClient) {
            await window.fetchDiscoveryData();
        }
        if (supabaseClient && (state.currentUser || state.isAdmin || state.isPlatformDev)) {
            const sessRes = await supabaseClient.auth.getSession();
            if (sessRes?.data?.session && typeof window.fetchUserProfile === 'function') {
                await window.fetchUserProfile();
            }
        }
        window.renderView();
        window.scrollTo(0, 0);
        if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
        if (CALENDLY_FEATURE_ENABLED && state.currentView === 'admin-settings' && state.calendlyConnected && (!state.calendlyEventTypesList || !state.calendlyEventTypesList.length) && typeof window.loadCalendlyEventTypes === 'function') window.loadCalendlyEventTypes();

        window.addEventListener('popstate', () => {
            const path = (window.location.pathname || '').replace(/\/$/, '') || '/';
            if (path === '/discovery' || path.startsWith('/discovery/')) {
                state.discoveryPath = path;
                if (path !== '/discovery') state.discoveryDetailFetched = false;
                window.fetchDiscoveryData().then(() => { window.renderView(); window.scrollTo(0, 0); });
            } else {
                state.discoveryPath = null;
                window.renderView();
                window.scrollTo(0, 0);
            }
        });

        window.addEventListener('hashchange', () => {
            if (parseHashRoute()) {
                saveState();
                if (state.currentView === 'admin-settings' && (window.location.hash || '').includes('calendly=connected') && typeof window.fetchAllData === 'function') {
                    window.fetchAllData().then(() => {
                        window.renderView();
                        window.scrollTo(0, 0);
                        if (CALENDLY_FEATURE_ENABLED && state.currentView === 'admin-settings' && state.calendlyConnected && (!state.calendlyEventTypesList || !state.calendlyEventTypesList.length) && typeof window.loadCalendlyEventTypes === 'function') window.loadCalendlyEventTypes();
                    });
                } else {
                    window.renderView();
                    window.scrollTo(0, 0);
                    if (CALENDLY_FEATURE_ENABLED && state.currentView === 'admin-settings' && state.calendlyConnected && (!state.calendlyEventTypesList || !state.calendlyEventTypesList.length) && typeof window.loadCalendlyEventTypes === 'function') window.loadCalendlyEventTypes();
                }
                if (state.currentView === 'admin-competition-jack-and-jill' && state.competitionTab === 'registrations' && state.competitionId && supabaseClient) {
                    state.currentCompetition = (state.competitions || []).find(c => c.id === state.competitionId || String(c.id) === String(state.competitionId)) || null;
                    window.fetchCompetitionRegistrations(state.competitionId);
                }
            }
        });

        document.addEventListener('click', (e) => {
            const resendBtn = e.target.closest('.resend-verification-btn');
            if (resendBtn && !resendBtn.disabled) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window.resendVerificationEmail === 'function') window.resendVerificationEmail();
                return;
            }
            const renameSchoolBtn = e.target.closest('[data-action="rename-school"]');
            if (renameSchoolBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = renameSchoolBtn.getAttribute('data-school-id');
                if (id && typeof window.renameSchool === 'function') window.renameSchool(id);
                return;
            }
            const delSchoolBtn = e.target.closest('[data-action="delete-school"]');
            if (delSchoolBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = delSchoolBtn.getAttribute('data-school-id');
                if (id && typeof window.deleteSchool === 'function') window.deleteSchool(id);
                return;
            }
            const submitSchoolBtn = e.target.closest('[data-action="submit-new-school"]');
            if (submitSchoolBtn) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window.submitNewSchoolWithAdmin === 'function') window.submitNewSchoolWithAdmin();
                return;
            }
            const btn = e.target.closest('[data-action="openCreateNewCompetition"]');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window.openCreateNewCompetition === 'function') window.openCreateNewCompetition();
                return;
            }
            const regBtn = e.target.closest('[data-action="openRegistrations"]');
            if (regBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = regBtn.getAttribute('data-competition-id');
                if (id) {
                    state.competitionId = id;
                    state.currentCompetition = (state.competitions || []).find(c => c.id === id) || null;
                    state.competitionTab = 'registrations';
                    window.fetchCompetitionRegistrations(id);
                    saveState();
                    window.renderView();
                }
                return;
            }
            const answersBtn = e.target.closest('[data-action="openRegistrationAnswers"]');
            if (answersBtn) {
                e.preventDefault();
                e.stopPropagation();
                const regId = answersBtn.getAttribute('data-reg-id');
                if (regId && typeof window.openRegistrationAnswers === 'function') window.openRegistrationAnswers(regId);
                return;
            }
            const copyCompBtn = e.target.closest('[data-action="copyCompetition"]');
            if (copyCompBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = copyCompBtn.getAttribute('data-competition-id');
                if (id && typeof window.copyCompetition === 'function') window.copyCompetition(id);
                return;
            }
            const deleteCompBtn = e.target.closest('[data-action="deleteCompetition"]');
            if (deleteCompBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = deleteCompBtn.getAttribute('data-competition-id');
                if (id && typeof window.deleteCompetition === 'function') window.deleteCompetition(id);
            }
        });

        if (!state.discoveryPath) {
            if (state.currentView === 'discovery-profile-only' && state.currentSchool?.id) {
                await window.fetchAllData();
                window.renderView();
                if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
            } else {
                window.fetchAllData();
            }
        }

        setInterval(() => {
            const isFocussed = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '');
            const isModalOpen = document.querySelector('.modal:not(.hidden)');
            const isEditingClasses = state.currentView === 'admin-settings';
            const recentlyEditedClass = state._lastClassEditAt && (Date.now() - state._lastClassEditAt < 15000);
            if (state.currentUser && !state.discoveryPath && !isFocussed && !isModalOpen && !isEditingClasses && !recentlyEditedClass) {
                window.fetchAllData();
            }
        }, 120000);

        setInterval(() => { window.checkInactivity(); }, 60000);

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-dropdown-container')) {
                document.querySelectorAll('.custom-dropdown-list').forEach(el => {
                    if (el.id === 'school-dropdown-list' && el.classList.contains('open') && typeof window.closeSchoolDropdown === 'function') {
                        window.closeSchoolDropdown();
                    } else {
                        el.classList.remove('open');
                    }
                });
            }
        });
    })();
}
