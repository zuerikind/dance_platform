/**
 * Hash/path handling for competition routes and dancer identity routes.
 *
 * URL -> view -> renderer mapping:
 *   ?view=verify-email&token=... -> currentView=verify-email, state.verifyEmailToken
 *   #/verify-email?token=...     -> currentView=verify-email, state.verifyEmailToken
 *   #/dashboard/profile          -> currentView=dashboard-profile
 *   /discovery/register          -> discoveryPath set, renderDiscoveryView shows discovery-register
 *   /discovery/login             -> discoveryPath set, renderDiscoveryView shows discovery-login
 */

import { state } from './state.js';

export function parseQueryAndHashForView() {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const tokenParam = params.get('token');
    if (viewParam === 'verify-email') {
        state.currentView = 'verify-email';
        state.verifyEmailToken = tokenParam || null;
        return true;
    }
    if (viewParam === 'activate') {
        state.currentView = 'activate';
        state.activateToken = tokenParam || null;
        return true;
    }
    const hash = (window.location.hash || '').replace(/^#/, '');
    const [pathPart, hashQuery] = hash.split('?');
    const segments = pathPart.split('/').filter(Boolean);
    const hashParams = new URLSearchParams(hashQuery || '');
    if (segments[0] === 'verify-email') {
        state.currentView = 'verify-email';
        state.verifyEmailToken = hashParams.get('token') || params.get('token') || null;
        return true;
    }
    if (segments[0] === 'dashboard' && segments[1] === 'profile') {
        state.currentView = 'dashboard-profile';
        return true;
    }
    return false;
}

export function parseHashRoute() {
    const hash = (typeof window !== 'undefined' && window.location.hash || '').replace(/^#/, '');
    const [pathPart, queryPart] = hash.split('?');
    const segments = pathPart.split('/').filter(Boolean);
    const params = new URLSearchParams(queryPart || '');

    if (segments[0] === 'verify-email') {
        state.currentView = 'verify-email';
        state.verifyEmailToken = params.get('token') || null;
        return true;
    }
    if (segments[0] === 'activate') {
        state.currentView = 'activate';
        state.activateToken = params.get('token') || null;
        return true;
    }
    if (segments[0] === 'dashboard' && segments[1] === 'profile') {
        state.currentView = 'dashboard-profile';
        return true;
    }

    if (segments[0] === 'admin' && segments[1] === 'schools' && segments[2] && segments[3] === 'competitions' && segments[4] === 'jack-and-jill') {
        const isStudent = state.currentUser && state.currentUser.school_id && state.currentUser.role !== 'admin' && state.currentUser.role !== 'platform-dev' && !state.isPlatformDev;
        if (isStudent) {
            if (typeof window !== 'undefined') window.location.hash = '';
            return false;
        }
        const schoolId = segments[2];
        const competitionId = segments[5] || null;
        state.competitionSchoolId = schoolId;
        state.competitionId = competitionId;
        state.competitionTab = params.get('tab') === 'registrations' ? 'registrations' : 'edit';
        state.currentView = 'admin-competition-jack-and-jill';
        if (state.currentSchool?.id !== schoolId) {
            const school = (state.schools || []).find(s => s.id === schoolId);
            state.currentSchool = school ? { id: school.id, name: school.name } : { id: schoolId, name: 'School' };
        }
        state.isAdmin = true;
        return true;
    }

    if (segments[0] === 'student' && segments[1] === 'competitions' && segments[2] && segments[3] === 'jack-and-jill') {
        state.competitionId = segments[2];
        state.currentView = 'student-competition-register';
        state.studentCompetitionDetail = null;
        state.studentCompetitionRegDetail = null;
        return true;
    }

    if (segments[0] === 'settings') {
        state.currentView = 'admin-settings';
        const schoolId = params.get('school_id');
        if (schoolId && params.get('calendly') === 'connected') {
            state._calendlyReturnSchoolId = schoolId;
        }
        if (params.get('calendly') === 'error') {
            state.calendlyErrorFromRedirect = decodeURIComponent(params.get('message') || 'Connection failed');
            if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
                window.history.replaceState(null, '', (window.location.pathname || '') + '#/settings');
            }
        }
        return true;
    }

    return false;
}

export function navigateToAdminJackAndJill(schoolId, competitionId, tab) {
    const sid = schoolId || state.currentSchool?.id;
    if (!sid) return;
    let hash = `#/admin/schools/${sid}/competitions/jack-and-jill`;
    if (competitionId) hash += `/${competitionId}`;
    if (tab === 'registrations') hash += '?tab=registrations';
    if (typeof window !== 'undefined') window.location.hash = hash;
}

export function navigateToStudentJackAndJill(competitionId) {
    if (!competitionId) return;
    if (typeof window !== 'undefined') window.location.hash = `#/student/competitions/${competitionId}/jack-and-jill`;
}
