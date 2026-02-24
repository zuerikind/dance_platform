/**
 * Entry point. Bundled to app.js so index.html keeps one script tag.
 * Attaches core modules to window for HTML and legacy, runs legacy, then init and event listeners.
 */
import { escapeHtml, supabaseClient, DISCOVERY_COUNTRIES_CITIES, DISCOVERY_COUNTRIES } from './config.js';
import { state, saveState, setSessionIdentity, clearSessionIdentity, sessionIdentityMatches, resetInactivityTimer, checkInactivity } from './state.js';
import { setLocalesDict, t, updateI18n } from './locales.js';
import { formatPrice, formatClassTime, getPlanExpiryUseFixedDate } from './utils.js';
import { parseHashRoute, parseQueryAndHashForView, navigateToAdminJackAndJill, navigateToStudentJackAndJill } from './routing.js';
import { getCapabilities, bootstrapAuth } from './auth.js';

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
    window.DISCOVERY_COUNTRIES_CITIES = DISCOVERY_COUNTRIES_CITIES;
    window.DISCOVERY_COUNTRIES = DISCOVERY_COUNTRIES;
}

import './legacy.js';

// --- Event listeners and init (run after legacy has attached handlers to window) ---
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('scroll', () => { window.updateStickyFooterVisibility(); }, { passive: true });
    window.addEventListener('resize', () => { window.updateStickyFooterVisibility(); });

    document.getElementById('lang-toggle').addEventListener('click', () => {
        state.language = state.language === 'en' ? 'es' : 'en';
        saveState(); updateI18n(); window.renderView();
    });

    document.getElementById('dev-login-trigger').addEventListener('click', () => window.promptDevLogin());

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const target = e.target;
            if (target.id === 'dev-pass-input') window.submitDevLogin();
            if (target.id === 'auth-pass' || target.id === 'auth-pass-confirm') {
                const isSignup = state.authMode === 'signup';
                if (isSignup) window.signUpStudent(); else window.loginStudent();
            }
            if (target.id === 'admin-pass-input') window.loginAdminWithCreds();
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => window.logout());
    document.getElementById('close-scanner').addEventListener('click', () => window.stopScanner());

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            state.currentView = view;
            if (view === 'dashboard-profile') {
                window.location.hash = '#/dashboard/profile';
            } else if (view !== 'admin-competition-jack-and-jill' && view !== 'student-competition-register') {
                window.location.hash = '';
            }
            saveState();
            window.renderView();
            window.scrollTo(0, 0);
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
        const local = localStorage.getItem('dance_app_state');
        let saved = {};
        try {
            saved = local ? JSON.parse(local) : {};
        } catch (_) { saved = {}; }
        if (local && !state.discoveryPath) {
            state.language = saved.language || 'en';
            state.theme = saved.theme || 'dark';
            if (saved.currentUser) state.currentUser = saved.currentUser;
            if (saved.isAdmin !== undefined) state.isAdmin = saved.isAdmin;
            if (saved.isPlatformDev !== undefined) state.isPlatformDev = saved.isPlatformDev;
            if (saved.currentView && state.currentView !== 'verify-email' && state.currentView !== 'activate') state.currentView = saved.currentView;
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
            state.theme = saved.theme || state.theme || 'dark';
            if (saved.currentUser) state.currentUser = saved.currentUser;
            if (saved.lastActivity) state.lastActivity = saved.lastActivity;
            if (saved._discoveryOnlyEdit !== undefined) state._discoveryOnlyEdit = !!saved._discoveryOnlyEdit;
            if (saved.afterLogin !== undefined) state.afterLogin = saved.afterLogin;
            if (saved.reviewDraft !== undefined) state.reviewDraft = saved.reviewDraft;
        }

        updateI18n();
        document.body.setAttribute('data-theme', state.theme);
        document.body.classList.toggle('dark-mode', state.theme === 'dark');
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
        window.renderView();
        if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();

        const hasAuthState = !!(state.currentUser || state.isAdmin || state.isPlatformDev);
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
        if (hasSupabaseSession && supabaseClient) await bootstrapAuth(supabaseClient);
        if (hasAuthState && !hasSupabaseSession) {
            state.currentUser = null;
            state.isAdmin = false;
            state.isPlatformDev = false;
            state._discoveryOnlyEdit = false;
            state.currentView = 'school-selection';
            state.currentSchool = null;
            if (local) saveState();
        } else if (!hasAuthState && hasSupabaseSession && supabaseClient && sessRes?.data?.session?.user) {
            const user = sessRes.data.session.user;
            state.currentUser = { id: user.id, email: user.email ?? user.user_metadata?.email ?? '', role: 'student', school_id: null };
            state.isAdmin = false;
            state.isPlatformDev = false;
            const path = (typeof window !== 'undefined' && window.location?.pathname) ? window.location.pathname : '';
            const hash = (typeof window !== 'undefined' && window.location?.hash) ? window.location.hash : '';
            state._discoveryOnlyEdit = (path.includes('discovery') || hash.includes('discovery'));
            setSessionIdentity();
            if (typeof window.fetchUserProfile === 'function') await window.fetchUserProfile();
            saveState();
            window.renderView();
        }

        window.checkInactivity();

        if (window.location.hash) parseHashRoute();
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
        const adminViews = ['admin-competition-jack-and-jill', 'admin-students', 'admin-scanner', 'admin-memberships', 'admin-revenue', 'admin-settings'];
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
        if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
        if (state.currentView === 'admin-settings' && state.calendlyConnected && (!state.calendlyEventTypesList || !state.calendlyEventTypesList.length) && typeof window.loadCalendlyEventTypes === 'function') window.loadCalendlyEventTypes();

        window.addEventListener('popstate', () => {
            const path = (window.location.pathname || '').replace(/\/$/, '') || '/';
            if (path === '/discovery' || path.startsWith('/discovery/')) {
                state.discoveryPath = path;
                if (path !== '/discovery') state.discoveryDetailFetched = false;
                window.fetchDiscoveryData().then(() => window.renderView());
            } else {
                state.discoveryPath = null;
                window.renderView();
            }
        });

        window.addEventListener('hashchange', () => {
            if (parseHashRoute()) {
                saveState();
                if (state.currentView === 'admin-settings' && (window.location.hash || '').includes('calendly=connected') && typeof window.fetchAllData === 'function') window.fetchAllData();
                window.renderView();
                if (state.currentView === 'admin-settings' && state.calendlyConnected && (!state.calendlyEventTypesList || !state.calendlyEventTypesList.length) && typeof window.loadCalendlyEventTypes === 'function') window.loadCalendlyEventTypes();
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
