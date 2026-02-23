/**
 * Data loading from Supabase: fetchAllData, fetchPlatformData, fetchDiscoveryData.
 * Uses state/saveState and calls window.renderView, window.checkExpirations, etc.
 */
import { supabaseClient } from './config.js';
import { state, saveState } from './state.js';

const FETCH_THROTTLE_MS = 1500;
let _lastFetchEndTime = 0;
let _fetchScheduledTimer = null;

export function resetFetchThrottle() {
    _lastFetchEndTime = 0;
}

export async function fetchAllData() {
    if (!window.supabase || !supabaseClient) {
        state.loading = false;
        state.schools = [];
        if (typeof window.renderView === 'function') window.renderView();
        return;
    }
    if (state.loading) {
        window._fetchAllDataNeeded = true;
        return;
    }
    const now = Date.now();
    if (now - _lastFetchEndTime < FETCH_THROTTLE_MS && _lastFetchEndTime > 0) {
        if (_fetchScheduledTimer) clearTimeout(_fetchScheduledTimer);
        _fetchScheduledTimer = setTimeout(() => {
            _fetchScheduledTimer = null;
            fetchAllData();
        }, FETCH_THROTTLE_MS - (now - _lastFetchEndTime));
        return;
    }
    state.loading = true;
    if (state.currentView !== 'auth' && typeof window.renderView === 'function') window.renderView();

    try {
        const { data: schoolsData, error: schoolsError } = await supabaseClient.from('schools').select('*').order('name');
        if (schoolsError) console.error('Schools fetch error:', schoolsError);
        state.schoolsLoadError = schoolsError || null;
        state.schools = schoolsData ?? [];

        if (state._discoveryOnlyEdit && state.currentSchool?.id && supabaseClient) {
            const { data: detail } = await supabaseClient.rpc('discovery_school_detail_by_id', { p_school_id: state.currentSchool.id });
            if (detail && typeof detail === 'object' && detail.id) {
                const schoolPart = { id: detail.id, name: detail.name, discovery_slug: detail.discovery_slug, country: detail.country, city: detail.city, address: detail.address, discovery_description: detail.discovery_description, discovery_genres: detail.discovery_genres, discovery_levels: detail.discovery_levels, logo_url: detail.logo_url, teacher_photo_url: detail.teacher_photo_url, gallery_urls: detail.gallery_urls, discovery_locations: detail.discovery_locations, currency: detail.currency, active: detail.active };
                state.currentSchool = { ...state.currentSchool, ...schoolPart };
                state._discoveryLocationsSchoolId = null;
                state.discoveryLocations = Array.isArray(detail.discovery_locations) ? detail.discovery_locations.map(l => ({ name: l.name || '', address: l.address || '', description: l.description || '', image_urls: Array.isArray(l.image_urls) ? [...l.image_urls] : [] })) : [];
            }
        }
        if (!state.currentSchool && supabaseClient) {
            const { data: discEnabled } = await supabaseClient.rpc('discovery_is_enabled');
            state.discoveryEnabled = !!discEnabled;
        }
        if (!state.isPlatformDev && !state._discoveryOnlyEdit && state.currentSchool && !state.schools.some(s => s.id === state.currentSchool.id)) {
            state.currentSchool = null;
            state.currentUser = null;
            state.isAdmin = false;
            state.currentView = 'school-selection';
            saveState();
        }
        if (state.currentView === 'school-selection' && typeof window.renderView === 'function') window.renderView();

        if (state.isPlatformDev) {
            await fetchPlatformData();
            if (!state.currentSchool) {
                state.loading = false;
                if (typeof window.renderView === 'function') window.renderView();
                return;
            }
        } else if (!state.currentSchool) {
            state.currentView = 'school-selection';
            state.loading = false;
            if (typeof window.renderView === 'function') window.renderView();
            return;
        }

        if (state.currentUser && !state.isAdmin && state.currentUser.school_id) {
            if (state.currentSchool.id !== state.currentUser.school_id) {
                const enrolledSchool = state.schools.find(s => s.id === state.currentUser.school_id);
                if (enrolledSchool) state.currentSchool = enrolledSchool;
            }
        }
        const sid = (state.currentUser && !state.isAdmin && state.currentUser.school_id)
            ? state.currentUser.school_id
            : state.currentSchool.id;
        const isStudent = state.currentUser && !state.isAdmin;

        let studentsQuery;
        if (state.isAdmin || state.isPlatformDev) {
            studentsQuery = supabaseClient.rpc('get_school_students', { p_school_id: sid }).then(r => ({ data: r.data || [], error: r.error }));
        } else if (state.currentUser && state.currentUser.id) {
            studentsQuery = supabaseClient.from('students_with_profile').select('*').eq('id', state.currentUser.id);
        } else {
            studentsQuery = Promise.resolve({ data: [], error: null });
        }

        const classesPromise = isStudent
            ? supabaseClient.rpc('get_school_classes', { p_school_id: sid }).then(r => ({ data: r.data || [], error: r.error }))
            : supabaseClient.from('classes').select('*').eq('school_id', sid).order('id');
        const subsPromise = isStudent
            ? supabaseClient.rpc('get_school_subscriptions', { p_school_id: sid }).then(r => ({ data: r.data || [], error: r.error }))
            : supabaseClient.from('subscriptions').select('*').eq('school_id', sid).order('name');
        const allEnrollmentsPromise = (isStudent && state.currentUser?.user_id)
            ? supabaseClient.rpc('get_all_student_enrollments', { p_user_id: state.currentUser.user_id }).then(r => ({ data: r.data }))
            : Promise.resolve({ data: null });

        const [classesRes, subsRes, studentsRes, requestsRes, settingsRes, adminsRes, allEnrollmentsRes] = await Promise.all([
            classesPromise,
            subsPromise,
            studentsQuery,
            supabaseClient.from('payment_requests').select('*, students(name)').eq('school_id', sid).order('created_at', { ascending: false }),
            supabaseClient.from('admin_settings').select('*').eq('school_id', sid),
            supabaseClient.from('admins').select('*').eq('school_id', sid).order('username'),
            allEnrollmentsPromise
        ]);

        if (classesRes.data && classesRes.data.length > 0) {
            state.classes = classesRes.data;
        } else if (state.isAdmin && supabaseClient) {
            const { data: rpcClasses } = await supabaseClient.rpc('get_school_classes', { p_school_id: sid });
            if (rpcClasses && Array.isArray(rpcClasses)) state.classes = rpcClasses;
        }
        if (subsRes.data && subsRes.data.length > 0) {
            state.subscriptions = subsRes.data;
        } else if (state.isAdmin && supabaseClient) {
            const { data: rpcSubs } = await supabaseClient.rpc('get_school_subscriptions', { p_school_id: sid });
            if (rpcSubs && Array.isArray(rpcSubs)) state.subscriptions = rpcSubs;
        }
        if (isStudent) {
            const { data: settingsJson } = await supabaseClient.rpc('get_school_admin_settings', { p_school_id: sid });
            if (settingsJson && typeof settingsJson === 'object') state.adminSettings = settingsJson;
        }
        if (studentsRes.data && studentsRes.data.length > 0) {
            state.students = studentsRes.data;
            if (state.currentUser && !state.isAdmin) {
                const updatedMe = state.students.find(s => s.id === state.currentUser.id);
                if (updatedMe) {
                    state.currentUser = { ...updatedMe, role: 'student' };
                    saveState();
                }
            }
        } else if (state.isAdmin && supabaseClient) {
            const { data: rpcStudents } = await supabaseClient.rpc('get_school_students', { p_school_id: sid });
            if (rpcStudents && Array.isArray(rpcStudents)) state.students = rpcStudents;
        } else if (isStudent && state.currentUser) {
            const schoolId = state.currentUser.school_id || sid;
            let myRow = null;
            if (state.currentUser.user_id) {
                const { data } = await supabaseClient.rpc('get_student_by_user_id', { p_user_id: state.currentUser.user_id, p_school_id: schoolId });
                if (data && Array.isArray(data) && data.length > 0) myRow = data;
            }
            if (!myRow) {
                const { data } = await supabaseClient.rpc('get_student_by_id', { p_student_id: state.currentUser.id, p_school_id: schoolId });
                if (data && Array.isArray(data) && data.length > 0) myRow = data;
            }
            if (myRow && myRow.length > 0) {
                const row = myRow[0];
                state.students = [row];
                state.currentUser = { ...row, role: 'student' };
                saveState();
            } else {
                state.students = [{ ...state.currentUser }];
            }
        }
        if (isStudent && state.currentUser && supabaseClient) {
            const schoolId = state.currentUser.school_id || sid;
            let freshRow = null;
            if (state.currentUser.user_id) {
                const { data } = await supabaseClient.rpc('get_student_by_user_id', { p_user_id: state.currentUser.user_id, p_school_id: schoolId });
                if (data && Array.isArray(data) && data.length > 0) freshRow = data;
            }
            if (!freshRow) {
                const { data } = await supabaseClient.rpc('get_student_by_id', { p_student_id: String(state.currentUser.id), p_school_id: schoolId });
                if (data && Array.isArray(data) && data.length > 0) freshRow = data;
            }
            if (freshRow && freshRow.length > 0) {
                const row = freshRow[0];
                state.currentUser = { ...row, role: 'student' };
                const idx = state.students.findIndex(s => s.id === row.id || String(s.id) === String(row.id));
                if (idx >= 0) state.students[idx] = row;
                else state.students = [row];
                saveState();
            }
        }
        if (requestsRes.data && requestsRes.data.length > 0) {
            state.paymentRequests = requestsRes.data;
        } else if (state.isAdmin && supabaseClient) {
            const { data: reqsRpc } = await supabaseClient.rpc('get_school_payment_requests', { p_school_id: sid });
            if (reqsRpc && Array.isArray(reqsRpc)) state.paymentRequests = reqsRpc;
        }
        if (settingsRes.data && settingsRes.data.length > 0) {
            const settingsObj = {};
            settingsRes.data.forEach(item => { settingsObj[item.key] = item.value; });
            state.adminSettings = settingsObj;
        } else if (state.isAdmin && supabaseClient) {
            const { data: settingsJson } = await supabaseClient.rpc('get_school_admin_settings', { p_school_id: sid });
            if (settingsJson && typeof settingsJson === 'object') state.adminSettings = settingsJson;
        }
        if (adminsRes.data && adminsRes.data.length > 0) {
            state.admins = adminsRes.data;
        } else if (state.isAdmin && supabaseClient) {
            const { data: rpcAdmins } = await supabaseClient.rpc('get_school_admins', { p_school_id: sid });
            if (rpcAdmins && Array.isArray(rpcAdmins)) state.admins = rpcAdmins;
        }
        if (state.isAdmin && supabaseClient) {
            const { data: sessionData } = await supabaseClient.auth.getSession();
            const uid = sessionData?.session?.user?.id;
            const admins = state.admins || [];
            state.schoolAdminLinked = !!(uid && admins.some(a => a.user_id === uid));
            state.currentAdmin = admins.find(a => a.user_id === uid) || null;
            if (!state.currentAdmin && uid && sid) {
                try {
                    const { data: curAdmin } = await supabaseClient.rpc('get_current_admin', { p_school_id: sid });
                    const row = Array.isArray(curAdmin) && curAdmin.length > 0 ? curAdmin[0] : curAdmin;
                    if (row && typeof row === 'object') state.currentAdmin = row;
                } catch (_) { /* ignore */ }
            }
        }
        const currentSchoolObj = state.schools.find(s => s.id === sid) || state.currentSchool;
        if (currentSchoolObj?.profile_type === 'private_teacher' && supabaseClient) {
            try {
                const { data: availData } = await supabaseClient.rpc('get_teacher_availability', { p_school_id: sid });
                state.teacherAvailability = Array.isArray(availData) ? availData : [];
            } catch (_) { state.teacherAvailability = []; }
            if (state.isAdmin) {
                try {
                    const { data: pcrData } = await supabaseClient.rpc('get_private_class_requests_for_school', { p_school_id: sid });
                    state.privateClassRequests = Array.isArray(pcrData) ? pcrData : [];
                } catch (_) { state.privateClassRequests = []; }
            }
        } else {
            state.teacherAvailability = [];
            state.privateClassRequests = [];
        }
        if (isStudent && state.currentSchool?.profile_type === 'private_teacher' && state.currentUser?.id && supabaseClient && sid) {
            try {
                const { data: pcrStudent } = await supabaseClient.from('private_class_requests').select('*').eq('school_id', sid).eq('student_id', String(state.currentUser.id)).eq('status', 'accepted').order('requested_date', { ascending: true });
                state.studentPrivateClassRequests = Array.isArray(pcrStudent) ? pcrStudent : [];
            } catch (_) { state.studentPrivateClassRequests = []; }
        } else {
            state.studentPrivateClassRequests = [];
        }
        if (currentSchoolObj && state.currentSchool && state.currentSchool.id === currentSchoolObj.id) {
            state.currentSchool = { ...state.currentSchool, ...currentSchoolObj };
        }
        if (isStudent && allEnrollmentsRes?.data != null) {
            const allEnroll = allEnrollmentsRes.data;
            state.allEnrollments = Array.isArray(allEnroll) ? allEnroll : (typeof allEnroll === 'string' ? JSON.parse(allEnroll) : []);
        } else if (isStudent) {
            state.allEnrollments = [];
        }
        if (isStudent && state.currentUser?.id && supabaseClient && sid) {
            try {
                const { data: compData, error: compErr } = await supabaseClient.rpc('competition_get_for_student', { p_student_id: String(state.currentUser.id), p_school_id: sid });
                if (compErr) { state.currentCompetitionForStudent = null; state.studentCompetitionRegistration = null; }
                else {
                    const comp = Array.isArray(compData) && compData.length > 0 ? compData[0] : null;
                    state.currentCompetitionForStudent = comp || null;
                    if (comp) {
                        const { data: regData } = await supabaseClient.rpc('competition_registration_get', { p_competition_id: comp.id, p_student_id: String(state.currentUser.id) });
                        state.studentCompetitionRegistration = Array.isArray(regData) && regData.length > 0 ? regData[0] : null;
                    } else state.studentCompetitionRegistration = null;
                }
            } catch (_) {
                state.currentCompetitionForStudent = null;
                state.studentCompetitionRegistration = null;
            }
        } else {
            state.currentCompetitionForStudent = null;
            state.studentCompetitionRegistration = null;
        }
        if (state.isAdmin && sid && supabaseClient) {
            try {
                const { data: compList, error: compListErr } = await supabaseClient.rpc('competition_list_for_admin', { p_school_id: sid });
                state.competitions = !compListErr && Array.isArray(compList) ? compList : [];
                if (state.competitionTab === 'registrations' && state.competitionId && typeof window.fetchCompetitionRegistrations === 'function') {
                    state.currentCompetition = state.competitions.find(c => c.id === state.competitionId || String(c.id) === String(state.competitionId)) || null;
                    await window.fetchCompetitionRegistrations(state.competitionId);
                }
            } catch (_) {
                state.competitions = [];
            }
        }
        if (typeof window.checkExpirations === 'function') await window.checkExpirations();

        if (sid && supabaseClient && state.currentSchool?.class_registration_enabled) {
            try {
                if (!state.mockDate) {
                    await supabaseClient.rpc('process_expired_registrations', { p_school_id: sid });
                }
            } catch (e) { console.warn('process_expired_registrations error:', e); }
            if (isStudent && state.currentUser?.id) {
                state.classRegLoaded = false;
                if (typeof window.loadClassAvailability === 'function') {
                    window.loadClassAvailability().then(() => {
                        if (typeof window.shouldDeferRender === 'function' && window.shouldDeferRender()) {
                            if (typeof window.scheduleDeferredRender === 'function') window.scheduleDeferredRender();
                        } else {
                            if (typeof window.renderView === 'function') window.renderView();
                            if (window.lucide) window.lucide.createIcons();
                        }
                    }).catch(() => {});
                }
            }
            if (state.isAdmin) {
                const allWeekRegs = [];
                const allDates = new Set();
                const getToday = typeof window.getTodayForMonthly === 'function' ? window.getTodayForMonthly : () => new Date();
                const now = getToday();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    allDates.add(typeof window.formatClassDate === 'function' ? window.formatClassDate(d) : d.toISOString().slice(0, 10));
                }
                const dateArr = [...allDates];
                const BATCH = 10;
                for (let i = 0; i < dateArr.length; i += BATCH) {
                    const chunk = dateArr.slice(i, i + BATCH);
                    const results = await Promise.all(chunk.map(dateStr =>
                        supabaseClient.rpc('get_class_registrations_for_date', { p_school_id: sid, p_class_date: dateStr })
                    ));
                    results.forEach((res) => {
                        if (res.error || !res.data) return;
                        const arr = Array.isArray(res.data) ? res.data : (typeof res.data === 'string' ? JSON.parse(res.data) : []);
                        arr.forEach(r => allWeekRegs.push(r));
                    });
                }
                state.adminWeekRegistrations = allWeekRegs;
            }
        }
        if (state.currentUser && !state.isAdmin && state.students?.length > 0) {
            const updated = state.students.find(s => s.id === state.currentUser.id);
            if (updated) state.currentUser = { ...updated, role: 'student' };
        }

        state.loading = false;
        _lastFetchEndTime = Date.now();
        if (state.currentView !== 'auth') {
            if (typeof window.shouldDeferRender === 'function' && window.shouldDeferRender()) {
                if (typeof window.scheduleDeferredRender === 'function') window.scheduleDeferredRender();
            } else if (typeof window.renderView === 'function') window.renderView();
        }
        if (window._fetchAllDataNeeded) {
            window._fetchAllDataNeeded = false;
            setTimeout(() => fetchAllData(), 100);
        }
    } catch (err) {
        state.loading = false;
        _lastFetchEndTime = Date.now();
        console.error("Error fetching data:", err);
        if (state.currentView !== 'auth') {
            if (typeof window.shouldDeferRender === 'function' && window.shouldDeferRender()) {
                if (typeof window.scheduleDeferredRender === 'function') window.scheduleDeferredRender();
            } else if (typeof window.renderView === 'function') window.renderView();
        }
        if (window._fetchAllDataNeeded) {
            window._fetchAllDataNeeded = false;
            setTimeout(() => fetchAllData(), 100);
        }
    }
}

export async function fetchPlatformData() {
    if (!supabaseClient) return;
    state.loading = true;
    if (typeof window.renderView === 'function') window.renderView();
    try {
        const [schools, students, admins, classes, subs] = await Promise.all([
            supabaseClient.from('schools').select('*').order('name'),
            supabaseClient.from('students_with_profile').select('*'),
            supabaseClient.from('admins').select('*'),
            supabaseClient.from('classes').select('*'),
            supabaseClient.from('subscriptions').select('*')
        ]);
        state.platformData = {
            schools: schools.data || [],
            students: students.data || [],
            admins: admins.data || [],
            classes: classes.data || [],
            subscriptions: subs.data || [],
            payment_requests: [],
            admin_settings: [],
            platform_admins: []
        };
        if (state.isPlatformDev) {
            const { data: rpcData } = await supabaseClient.rpc('get_platform_all_data');
            if (rpcData && typeof rpcData === 'object') {
                state.platformData = {
                    schools: Array.isArray(rpcData.schools) ? rpcData.schools : (state.platformData.schools || []),
                    students: Array.isArray(rpcData.students) ? rpcData.students : (state.platformData.students || []),
                    admins: Array.isArray(rpcData.admins) ? rpcData.admins : (state.platformData.admins || []),
                    classes: Array.isArray(rpcData.classes) ? rpcData.classes : (state.platformData.classes || []),
                    subscriptions: Array.isArray(rpcData.subscriptions) ? rpcData.subscriptions : (state.platformData.subscriptions || []),
                    payment_requests: Array.isArray(rpcData.payment_requests) ? rpcData.payment_requests : [],
                    admin_settings: Array.isArray(rpcData.admin_settings) ? rpcData.admin_settings : [],
                    platform_admins: Array.isArray(rpcData.platform_admins) ? rpcData.platform_admins : []
                };
            }
            const { data: sessionData } = await supabaseClient.auth.getSession();
            const uid = sessionData?.session?.user?.id;
            const admins = state.platformData?.platform_admins || [];
            state.platformAdminLinked = !!(uid && admins.some(pa => pa.user_id === uid));
            const { data: discEnabled } = await supabaseClient.rpc('discovery_is_enabled');
            state.platformData.discoveryEnabled = !!discEnabled;
        }
        state.loading = false;
        if (typeof window.renderView === 'function') window.renderView();
    } catch (err) {
        state.loading = false;
        console.error("Error fetching platform data:", err);
        if (typeof window.renderView === 'function') window.renderView();
    }
}

window._discoveryFetchInProgress = false;

export async function fetchDiscoveryData() {
    if (!state.discoveryPath) return;
    if (window._discoveryFetchInProgress) return;
    window._discoveryFetchInProgress = true;
    const path = state.discoveryPath;
    try {
        if (path === '/discovery') {
            state.discoverySchools = [];
            state.discoverySchoolDetail = null;
            if (supabaseClient) {
                try {
                    const { data, error } = await supabaseClient.rpc('discovery_list_schools');
                    if (error) throw error;
                    state.discoverySchools = Array.isArray(data) ? data : (data && typeof data === 'object' && data !== null ? [data] : []);
                } catch (err) {
                    console.error('Discovery list error:', err);
                    state.discoverySchools = [];
                }
            }
        } else if (path.startsWith('/discovery/')) {
            state.discoverySchoolDetail = null;
            const afterPrefix = path.replace(/^\/discovery\//, '').trim();
            let decoded = afterPrefix;
            try { decoded = decodeURIComponent(afterPrefix); } catch (_) { /* keep raw */ }
            if (supabaseClient) {
                try {
                    if (decoded.startsWith('id/')) {
                        const schoolId = decoded.replace(/^id\/?/, '').trim();
                        if (schoolId) {
                            const { data, error } = await supabaseClient.rpc('discovery_school_detail_by_id', { p_school_id: schoolId });
                            if (error) throw error;
                            state.discoverySchoolDetail = data || null;
                        }
                    } else if (decoded) {
                        const { data, error } = await supabaseClient.rpc('discovery_school_detail', { p_slug: decoded });
                        if (error) throw error;
                        state.discoverySchoolDetail = data || null;
                    }
                } catch (err) {
                    console.error('Discovery detail error:', err);
                    state.discoverySchoolDetail = null;
                }
            }
        }
    } finally {
        window._discoveryFetchInProgress = false;
    }
}
