/**
 * Single app state object, saveState(), session identity, and inactivity timeout.
 * Understand or change persisted state, session timeout, or version here.
 */

export const APP_VERSION = '1.6';

export let state = {
    version: APP_VERSION,
    currentUser: null,
    classes: [],
    subscriptions: [],
    students: [],
    language: 'en',
    currentView: 'auth',
    scheduleView: 'weekly',
    authMode: 'login',
    theme: 'dark',
    isAdmin: false,
    paymentRequests: [],
    adminSettings: {},
    lastActivity: Date.now(),
    schools: [],
    currentSchool: null,
    admins: [],
    showWeeklyPreview: false,
    showDiscoveryPreview: false,
    isPlatformDev: false,
    platformAdminLinked: false,
    schoolAdminLinked: false,
    platformData: { schools: [], students: [], admins: [] },
    loading: false,
    competitionId: null,
    competitionSchoolId: null,
    competitionTab: 'edit',
    competitions: [],
    currentCompetition: null,
    competitionRegistrations: [],
    additionalFeaturesExpanded: false,
    settingsAdvancedExpanded: false,
    currentCompetitionForStudent: null,
    studentCompetitionRegistration: null,
    studentCompetitionDetail: null,
    studentCompetitionRegDetail: null,
    studentCompetitionAnswers: {},
    jackAndJillFormOpen: false,
    adminStudentsCompetitionId: null,
    adminStudentsFilterHasPack: 'all',
    adminStudentsFilterPackage: null,
    adminRevenueDateStart: null,
    adminRevenueDateEnd: null,
    adminRevenuePackageFilter: null,
    adminRevenueStatusFilter: null,
    adminRevenueMethodFilter: null,
    adminStudentsFilterPaid: 'all',
    adminStudentsSearch: '',
    devDashboardTab: 'schools',
    teacherAvailability: [],
    privateClassRequests: [],
    studentPrivateClassRequests: [],
    studentPrivateClassesExpanded: false,
    studentPrivateClassesView: 'list',
    studentPrivateCalendarDate: null,
    studentPrivateCalendarSelectedDate: null,
    classAvailability: {},
    studentRegistrations: [],
    studentPastRegistrations: [],
    qrRegistrationsExpanded: true,
    todayRegistrations: [],
    classRegLoaded: false,
    adminWeekRegistrations: [],
    packageSlots: [],
    adminRegExpanded: false,
    aureAllStudentsExpanded: false,
    aurePackageOptionsExpanded: true,
    aurePackageSlotForm: null,
    aureSelectedSlotId: null,
    teacherAcceptedClassesExpanded: true,
    teacherAcceptedClassesView: 'list',
    teacherAcceptedCalendarDate: null,
    teacherAcceptedCalendarSelectedDate: null,
    studentsFilterExpanded: false,
    adminStudentsListExpandedForPrivateTeacher: false,
    adminRevenueFiltersExpanded: false,
    scanDeductionType: 'group',
    settingsClassesExpanded: false,
    settingsPlansExpanded: false,
    lastAddedSubscriptionId: null,
    settingsTransferExpanded: false,
    settingsDiscoveryExpanded: false,
    _discoveryOnlyEdit: false,
    mockDate: null,
    userProfile: null,
    verifyEmailToken: null,
    activateToken: null,
    studentActivationStatus: {},
    auth: { session: null, user: null, profile: null, loading: false, error: null },
    afterLogin: null,
    afterVerify: null,
    reviewDraft: null,
    calendlyConnected: false,
    calendlyEventTypeSelection: null,
    calendlyEventTypesList: [],
    calendlyEventTypesLoaded: false,
    calendlyEventTypesError: null,
    teacherCalendlySelectionForBooking: null
};

const SESSION_IDENTITY_KEY = 'dance_session_identity';

export function saveState() {
    let safeCurrentUser = state.currentUser;
    if (safeCurrentUser && typeof safeCurrentUser === 'object') {
        const { password, ...rest } = safeCurrentUser;
        safeCurrentUser = rest;
    }
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('dance_app_state', JSON.stringify({
        language: state.language,
        theme: state.theme,
        currentUser: safeCurrentUser,
        isAdmin: state.isAdmin,
        isPlatformDev: state.isPlatformDev,
        currentView: state.currentView,
        scheduleView: state.scheduleView,
        lastActivity: state.lastActivity,
        currentSchool: state.currentSchool,
        competitionId: state.competitionId,
        competitionSchoolId: state.competitionSchoolId,
        competitionTab: state.competitionTab,
        _discoveryOnlyEdit: state._discoveryOnlyEdit,
        afterLogin: state.afterLogin,
        reviewDraft: state.reviewDraft
    }));
}

export function setSessionIdentity() {
    const user = state.currentUser;
    const school = state.currentSchool;
    const isAdmin = state.isAdmin;
    const isPlatformDev = state.isPlatformDev;
    let ident = null;
    if (isPlatformDev) ident = { t: 'd' };
    else if (isAdmin && school?.id) ident = { t: 'a', sid: school.id };
    else if (user?.id) ident = { t: 's', uid: user.id, sid: user.school_id || school?.id || null };
    if (ident && typeof sessionStorage !== 'undefined') {
        try { sessionStorage.setItem(SESSION_IDENTITY_KEY, JSON.stringify(ident)); } catch (_) {}
    }
}

export function clearSessionIdentity() {
    if (typeof sessionStorage === 'undefined') return;
    try { sessionStorage.removeItem(SESSION_IDENTITY_KEY); } catch (_) {}
}

export function sessionIdentityMatches(saved) {
    if (!saved) return false;
    try {
        const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SESSION_IDENTITY_KEY) : null;
        if (!raw) return false;
        const ident = JSON.parse(raw);
        if (ident.t === 'd') return !!(saved.isPlatformDev);
        if (ident.t === 'a') return !!(saved.isAdmin && saved.currentSchool?.id === ident.sid);
        if (ident.t === 's') return !!(saved.currentUser?.id === ident.uid && (ident.sid == null || (saved.currentUser?.school_id || saved.currentSchool?.id) === ident.sid));
    } catch (_) {}
    return false;
}

export const INACTIVITY_LIMIT = 12 * 60 * 60 * 1000; // 12 hours
let _lastUserInteractionAt = 0;

export function resetInactivityTimer() {
    _lastUserInteractionAt = Date.now();
    const now = Date.now();
    if (now - state.lastActivity > 30000) {
        state.lastActivity = now;
        saveState();
    } else {
        state.lastActivity = now;
    }
}

export function checkInactivity() {
    if (!state.currentUser) return;
    const now = Date.now();
    const idleTime = now - state.lastActivity;
    if (idleTime > INACTIVITY_LIMIT) {
        if (typeof console !== 'undefined' && console.warn) console.warn("Session expired due to inactivity.");
        if (typeof window !== 'undefined' && typeof window.logout === 'function') window.logout();
    }
}
