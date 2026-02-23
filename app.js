(() => {
  // src/config.js
  var SUPABASE_URL = "https://fziyybqhecfxhkagknvg.supabase.co";
  var SUPABASE_KEY2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aXl5YnFoZWNmeGhrYWdrbnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDYwNDAsImV4cCI6MjA4NTk4MjA0MH0.wX7oIivqTbfBTMsIwI9zDgKk5x8P4mW3M543OgzwqCs";
  var supabaseClient = typeof window !== "undefined" && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY2) : null;
  var DISCOVERY_COUNTRIES_CITIES = {
    "Switzerland": ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Winterthur", "Lucerne", "St. Gallen"],
    "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "D\xFCsseldorf", "Dortmund", "Essen", "Leipzig"],
    "Austria": ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"],
    "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "M\xE1laga", "Murcia", "Palma"],
    "Mexico": ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Le\xF3n", "Canc\xFAn", "M\xE9rida"],
    "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Francisco"],
    "France": ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg"],
    "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
    "United Kingdom": ["London", "Birmingham", "Manchester", "Leeds", "Liverpool", "Bristol", "Edinburgh", "Glasgow"],
    "Colombia": ["Bogot\xE1", "Medell\xEDn", "Cali", "Barranquilla", "Cartagena"],
    "Argentina": ["Buenos Aires", "C\xF3rdoba", "Rosario", "Mendoza", "La Plata"],
    "Italy": ["Rome", "Milan", "Naples", "Turin", "Florence", "Venice", "Bologna"],
    "Portugal": ["Lisbon", "Porto", "Braga", "Coimbra", "Faro"],
    "Belgium": ["Brussels", "Antwerp", "Ghent", "Charleroi", "Li\xE8ge"],
    "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Ottawa"],
    "Brazil": ["S\xE3o Paulo", "Rio de Janeiro", "Bras\xEDlia", "Salvador", "Fortaleza"],
    "Chile": ["Santiago", "Valpara\xEDso", "Concepci\xF3n"],
    "Peru": ["Lima", "Arequipa", "Trujillo"],
    "Ecuador": ["Quito", "Guayaquil", "Cuenca"],
    "Costa Rica": ["San Jos\xE9", "Lim\xF3n", "Alajuela"],
    "Other": []
  };
  var DISCOVERY_COUNTRIES = Object.keys(DISCOVERY_COUNTRIES_CITIES).sort();
  function escapeHtml2(str) {
    if (str == null) return "";
    const s = String(str);
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // src/state.js
  var APP_VERSION = "1.6";
  var state = {
    version: APP_VERSION,
    currentUser: null,
    classes: [],
    subscriptions: [],
    students: [],
    language: "en",
    currentView: "auth",
    scheduleView: "weekly",
    authMode: "login",
    theme: "dark",
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
    competitionTab: "edit",
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
    adminStudentsFilterHasPack: "all",
    adminStudentsFilterPackage: null,
    adminRevenueDateStart: null,
    adminRevenueDateEnd: null,
    adminRevenuePackageFilter: null,
    adminRevenueStatusFilter: null,
    adminRevenueMethodFilter: null,
    adminStudentsFilterPaid: "all",
    adminStudentsSearch: "",
    devDashboardTab: "schools",
    teacherAvailability: [],
    privateClassRequests: [],
    studentPrivateClassRequests: [],
    studentPrivateClassesExpanded: false,
    classAvailability: {},
    studentRegistrations: [],
    studentPastRegistrations: [],
    qrRegistrationsExpanded: true,
    todayRegistrations: [],
    classRegLoaded: false,
    adminWeekRegistrations: [],
    adminRegExpanded: false,
    teacherAcceptedClassesExpanded: true,
    teacherAcceptedClassesView: "list",
    teacherAcceptedCalendarDate: null,
    teacherAcceptedCalendarSelectedDate: null,
    studentsFilterExpanded: false,
    adminRevenueFiltersExpanded: false,
    scanDeductionType: "group",
    settingsClassesExpanded: false,
    settingsPlansExpanded: false,
    lastAddedSubscriptionId: null,
    settingsTransferExpanded: false,
    settingsDiscoveryExpanded: false,
    _discoveryOnlyEdit: false,
    mockDate: null,
    userProfile: null,
    verifyEmailToken: null
  };
  var SESSION_IDENTITY_KEY = "dance_session_identity";
  function saveState() {
    let safeCurrentUser = state.currentUser;
    if (safeCurrentUser && typeof safeCurrentUser === "object") {
      const { password, ...rest } = safeCurrentUser;
      safeCurrentUser = rest;
    }
    if (typeof localStorage === "undefined") return;
    localStorage.setItem("dance_app_state", JSON.stringify({
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
      _discoveryOnlyEdit: state._discoveryOnlyEdit
    }));
  }
  function setSessionIdentity() {
    const user = state.currentUser;
    const school = state.currentSchool;
    const isAdmin = state.isAdmin;
    const isPlatformDev = state.isPlatformDev;
    let ident = null;
    if (isPlatformDev) ident = { t: "d" };
    else if (isAdmin && school?.id) ident = { t: "a", sid: school.id };
    else if (user?.id) ident = { t: "s", uid: user.id, sid: user.school_id || school?.id || null };
    if (ident && typeof sessionStorage !== "undefined") {
      try {
        sessionStorage.setItem(SESSION_IDENTITY_KEY, JSON.stringify(ident));
      } catch (_) {
      }
    }
  }
  function clearSessionIdentity() {
    if (typeof sessionStorage === "undefined") return;
    try {
      sessionStorage.removeItem(SESSION_IDENTITY_KEY);
    } catch (_) {
    }
  }
  function sessionIdentityMatches(saved) {
    if (!saved) return false;
    try {
      const raw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(SESSION_IDENTITY_KEY) : null;
      if (!raw) return false;
      const ident = JSON.parse(raw);
      if (ident.t === "d") return !!saved.isPlatformDev;
      if (ident.t === "a") return !!(saved.isAdmin && saved.currentSchool?.id === ident.sid);
      if (ident.t === "s") return !!(saved.currentUser?.id === ident.uid && (ident.sid == null || (saved.currentUser?.school_id || saved.currentSchool?.id) === ident.sid));
    } catch (_) {
    }
    return false;
  }
  var INACTIVITY_LIMIT = 12 * 60 * 60 * 1e3;
  var _lastUserInteractionAt = 0;
  function resetInactivityTimer() {
    _lastUserInteractionAt = Date.now();
    const now = Date.now();
    if (now - state.lastActivity > 3e4) {
      state.lastActivity = now;
      saveState();
    } else {
      state.lastActivity = now;
    }
  }
  function checkInactivity() {
    if (!state.currentUser) return;
    const now = Date.now();
    const idleTime = now - state.lastActivity;
    if (idleTime > INACTIVITY_LIMIT) {
      if (typeof console !== "undefined" && console.warn) console.warn("Session expired due to inactivity.");
      if (typeof window !== "undefined" && typeof window.logout === "function") window.logout();
    }
  }

  // src/locales.js
  var _localesDict = { en: {} };
  function setLocalesDict(d) {
    _localesDict = d || _localesDict;
  }
  function t(key) {
    const lang = state.language || "en";
    const dict = _localesDict[lang] || _localesDict.en;
    const val = dict[key] || _localesDict.en[key] || `[${key}]`;
    return val;
  }
  function updateI18n() {
    if (typeof document === "undefined") return;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.placeholder = t(key);
    });
    const langIndicator = document.getElementById("lang-text");
    if (langIndicator) langIndicator.textContent = (state.language || "EN").toUpperCase();
  }

  // src/utils.js
  var CURRENCY_SYMBOLS = { MXN: "MX$", CHF: "CHF ", USD: "US$", COP: "COP " };
  var formatClassTime = (c) => c && c.end_time ? `${c.time || ""} \u2013 ${c.end_time}` : c && c.time ? c.time : "";
  function formatPrice(price, currency) {
    const c = (currency || "MXN").toUpperCase();
    const sym = CURRENCY_SYMBOLS[c] || "MX$";
    const p = parseFloat(price);
    if (isNaN(p)) return sym + "0";
    const n = p;
    const formatted = Number.isInteger(n) ? n.toLocaleString() : parseFloat(n.toFixed(2)).toLocaleString();
    return sym + formatted;
  }
  function getPlanExpiryUseFixedDate() {
    return false;
  }

  // src/routing.js
  function parseQueryAndHashForView() {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    const tokenParam = params.get("token");
    if (viewParam === "verify-email") {
      state.currentView = "verify-email";
      state.verifyEmailToken = tokenParam || null;
      return true;
    }
    const hash = (window.location.hash || "").replace(/^#/, "");
    const [pathPart, hashQuery] = hash.split("?");
    const segments = pathPart.split("/").filter(Boolean);
    const hashParams = new URLSearchParams(hashQuery || "");
    if (segments[0] === "verify-email") {
      state.currentView = "verify-email";
      state.verifyEmailToken = hashParams.get("token") || params.get("token") || null;
      return true;
    }
    if (segments[0] === "dashboard" && segments[1] === "profile") {
      state.currentView = "dashboard-profile";
      return true;
    }
    return false;
  }
  function parseHashRoute() {
    const hash = (typeof window !== "undefined" && window.location.hash || "").replace(/^#/, "");
    const [pathPart, queryPart] = hash.split("?");
    const segments = pathPart.split("/").filter(Boolean);
    const params = new URLSearchParams(queryPart || "");
    if (segments[0] === "verify-email") {
      state.currentView = "verify-email";
      state.verifyEmailToken = params.get("token") || null;
      return true;
    }
    if (segments[0] === "dashboard" && segments[1] === "profile") {
      state.currentView = "dashboard-profile";
      return true;
    }
    if (segments[0] === "admin" && segments[1] === "schools" && segments[2] && segments[3] === "competitions" && segments[4] === "jack-and-jill") {
      const isStudent = state.currentUser && state.currentUser.school_id && state.currentUser.role !== "admin" && state.currentUser.role !== "platform-dev" && !state.isPlatformDev;
      if (isStudent) {
        if (typeof window !== "undefined") window.location.hash = "";
        return false;
      }
      const schoolId = segments[2];
      const competitionId = segments[5] || null;
      state.competitionSchoolId = schoolId;
      state.competitionId = competitionId;
      state.competitionTab = params.get("tab") === "registrations" ? "registrations" : "edit";
      state.currentView = "admin-competition-jack-and-jill";
      if (state.currentSchool?.id !== schoolId) {
        const school = (state.schools || []).find((s) => s.id === schoolId);
        state.currentSchool = school ? { id: school.id, name: school.name } : { id: schoolId, name: "School" };
      }
      state.isAdmin = true;
      return true;
    }
    if (segments[0] === "student" && segments[1] === "competitions" && segments[2] && segments[3] === "jack-and-jill") {
      state.competitionId = segments[2];
      state.currentView = "student-competition-register";
      state.studentCompetitionDetail = null;
      state.studentCompetitionRegDetail = null;
      return true;
    }
    return false;
  }
  function navigateToAdminJackAndJill(schoolId, competitionId, tab) {
    const sid = schoolId || state.currentSchool?.id;
    if (!sid) return;
    let hash = `#/admin/schools/${sid}/competitions/jack-and-jill`;
    if (competitionId) hash += `/${competitionId}`;
    if (tab === "registrations") hash += "?tab=registrations";
    if (typeof window !== "undefined") window.location.hash = hash;
  }
  function navigateToStudentJackAndJill(competitionId) {
    if (!competitionId) return;
    if (typeof window !== "undefined") window.location.hash = `#/student/competitions/${competitionId}/jack-and-jill`;
  }

  // src/data.js
  var FETCH_THROTTLE_MS = 1500;
  var _lastFetchEndTime = 0;
  var _fetchScheduledTimer = null;
  function resetFetchThrottle() {
    _lastFetchEndTime = 0;
  }
  async function fetchAllData() {
    if (!window.supabase || !supabaseClient) {
      state.loading = false;
      state.schools = [];
      if (typeof window.renderView === "function") window.renderView();
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
    if (state.currentView !== "auth" && typeof window.renderView === "function") window.renderView();
    try {
      const { data: schoolsData, error: schoolsError } = await supabaseClient.from("schools").select("*").order("name");
      if (schoolsError) console.error("Schools fetch error:", schoolsError);
      state.schoolsLoadError = schoolsError || null;
      state.schools = schoolsData ?? [];
      if (state._discoveryOnlyEdit && state.currentSchool?.id && supabaseClient) {
        const { data: detail } = await supabaseClient.rpc("discovery_school_detail_by_id", { p_school_id: state.currentSchool.id });
        if (detail && typeof detail === "object" && detail.id) {
          const schoolPart = { id: detail.id, name: detail.name, discovery_slug: detail.discovery_slug, country: detail.country, city: detail.city, address: detail.address, discovery_description: detail.discovery_description, discovery_genres: detail.discovery_genres, discovery_levels: detail.discovery_levels, logo_url: detail.logo_url, teacher_photo_url: detail.teacher_photo_url, gallery_urls: detail.gallery_urls, discovery_locations: detail.discovery_locations, currency: detail.currency, active: detail.active };
          state.currentSchool = { ...state.currentSchool, ...schoolPart };
          state._discoveryLocationsSchoolId = null;
          state.discoveryLocations = Array.isArray(detail.discovery_locations) ? detail.discovery_locations.map((l) => ({ name: l.name || "", address: l.address || "", description: l.description || "", image_urls: Array.isArray(l.image_urls) ? [...l.image_urls] : [] })) : [];
        }
      }
      if (!state.currentSchool && supabaseClient) {
        const { data: discEnabled } = await supabaseClient.rpc("discovery_is_enabled");
        state.discoveryEnabled = !!discEnabled;
      }
      if (!state.isPlatformDev && !state._discoveryOnlyEdit && state.currentSchool && !state.schools.some((s) => s.id === state.currentSchool.id)) {
        state.currentSchool = null;
        state.currentUser = null;
        state.isAdmin = false;
        state.currentView = "school-selection";
        saveState();
      }
      if (state.currentView === "school-selection" && typeof window.renderView === "function") window.renderView();
      if (state.isPlatformDev) {
        await fetchPlatformData();
        if (!state.currentSchool) {
          state.loading = false;
          if (typeof window.renderView === "function") window.renderView();
          return;
        }
      } else if (!state.currentSchool) {
        state.currentView = "school-selection";
        state.loading = false;
        if (typeof window.renderView === "function") window.renderView();
        return;
      }
      if (state.currentUser && !state.isAdmin && state.currentUser.school_id) {
        if (state.currentSchool.id !== state.currentUser.school_id) {
          const enrolledSchool = state.schools.find((s) => s.id === state.currentUser.school_id);
          if (enrolledSchool) state.currentSchool = enrolledSchool;
        }
      }
      const sid = state.currentUser && !state.isAdmin && state.currentUser.school_id ? state.currentUser.school_id : state.currentSchool.id;
      const isStudent = state.currentUser && !state.isAdmin;
      let studentsQuery;
      if (state.isAdmin || state.isPlatformDev) {
        studentsQuery = supabaseClient.rpc("get_school_students", { p_school_id: sid }).then((r) => ({ data: r.data || [], error: r.error }));
      } else if (state.currentUser && state.currentUser.id) {
        studentsQuery = supabaseClient.from("students_with_profile").select("*").eq("id", state.currentUser.id);
      } else {
        studentsQuery = Promise.resolve({ data: [], error: null });
      }
      const classesPromise = isStudent ? supabaseClient.rpc("get_school_classes", { p_school_id: sid }).then((r) => ({ data: r.data || [], error: r.error })) : supabaseClient.from("classes").select("*").eq("school_id", sid).order("id");
      const subsPromise = isStudent ? supabaseClient.rpc("get_school_subscriptions", { p_school_id: sid }).then((r) => ({ data: r.data || [], error: r.error })) : supabaseClient.from("subscriptions").select("*").eq("school_id", sid).order("name");
      const allEnrollmentsPromise = isStudent && state.currentUser?.user_id ? supabaseClient.rpc("get_all_student_enrollments", { p_user_id: state.currentUser.user_id }).then((r) => ({ data: r.data })) : Promise.resolve({ data: null });
      const [classesRes, subsRes, studentsRes, requestsRes, settingsRes, adminsRes, allEnrollmentsRes] = await Promise.all([
        classesPromise,
        subsPromise,
        studentsQuery,
        supabaseClient.from("payment_requests").select("*, students(name)").eq("school_id", sid).order("created_at", { ascending: false }),
        supabaseClient.from("admin_settings").select("*").eq("school_id", sid),
        supabaseClient.from("admins").select("*").eq("school_id", sid).order("username"),
        allEnrollmentsPromise
      ]);
      if (classesRes.data && classesRes.data.length > 0) {
        state.classes = classesRes.data;
      } else if (state.isAdmin && supabaseClient) {
        const { data: rpcClasses } = await supabaseClient.rpc("get_school_classes", { p_school_id: sid });
        if (rpcClasses && Array.isArray(rpcClasses)) state.classes = rpcClasses;
      }
      if (subsRes.data && subsRes.data.length > 0) {
        state.subscriptions = subsRes.data;
      } else if (state.isAdmin && supabaseClient) {
        const { data: rpcSubs } = await supabaseClient.rpc("get_school_subscriptions", { p_school_id: sid });
        if (rpcSubs && Array.isArray(rpcSubs)) state.subscriptions = rpcSubs;
      }
      if (isStudent) {
        const { data: settingsJson } = await supabaseClient.rpc("get_school_admin_settings", { p_school_id: sid });
        if (settingsJson && typeof settingsJson === "object") state.adminSettings = settingsJson;
      }
      if (studentsRes.data && studentsRes.data.length > 0) {
        state.students = studentsRes.data;
        if (state.currentUser && !state.isAdmin) {
          const updatedMe = state.students.find((s) => s.id === state.currentUser.id);
          if (updatedMe) {
            state.currentUser = { ...updatedMe, role: "student" };
            saveState();
          }
        }
      } else if (state.isAdmin && supabaseClient) {
        const { data: rpcStudents } = await supabaseClient.rpc("get_school_students", { p_school_id: sid });
        if (rpcStudents && Array.isArray(rpcStudents)) state.students = rpcStudents;
      } else if (isStudent && state.currentUser) {
        const schoolId = state.currentUser.school_id || sid;
        let myRow = null;
        if (state.currentUser.user_id) {
          const { data } = await supabaseClient.rpc("get_student_by_user_id", { p_user_id: state.currentUser.user_id, p_school_id: schoolId });
          if (data && Array.isArray(data) && data.length > 0) myRow = data;
        }
        if (!myRow) {
          const { data } = await supabaseClient.rpc("get_student_by_id", { p_student_id: state.currentUser.id, p_school_id: schoolId });
          if (data && Array.isArray(data) && data.length > 0) myRow = data;
        }
        if (myRow && myRow.length > 0) {
          const row = myRow[0];
          state.students = [row];
          state.currentUser = { ...row, role: "student" };
          saveState();
        } else {
          state.students = [{ ...state.currentUser }];
        }
      }
      if (isStudent && state.currentUser && supabaseClient) {
        const schoolId = state.currentUser.school_id || sid;
        let freshRow = null;
        if (state.currentUser.user_id) {
          const { data } = await supabaseClient.rpc("get_student_by_user_id", { p_user_id: state.currentUser.user_id, p_school_id: schoolId });
          if (data && Array.isArray(data) && data.length > 0) freshRow = data;
        }
        if (!freshRow) {
          const { data } = await supabaseClient.rpc("get_student_by_id", { p_student_id: String(state.currentUser.id), p_school_id: schoolId });
          if (data && Array.isArray(data) && data.length > 0) freshRow = data;
        }
        if (freshRow && freshRow.length > 0) {
          const row = freshRow[0];
          state.currentUser = { ...row, role: "student" };
          const idx = state.students.findIndex((s) => s.id === row.id || String(s.id) === String(row.id));
          if (idx >= 0) state.students[idx] = row;
          else state.students = [row];
          saveState();
        }
      }
      if (requestsRes.data && requestsRes.data.length > 0) {
        state.paymentRequests = requestsRes.data;
      } else if (state.isAdmin && supabaseClient) {
        const { data: reqsRpc } = await supabaseClient.rpc("get_school_payment_requests", { p_school_id: sid });
        if (reqsRpc && Array.isArray(reqsRpc)) state.paymentRequests = reqsRpc;
      }
      if (settingsRes.data && settingsRes.data.length > 0) {
        const settingsObj = {};
        settingsRes.data.forEach((item) => {
          settingsObj[item.key] = item.value;
        });
        state.adminSettings = settingsObj;
      } else if (state.isAdmin && supabaseClient) {
        const { data: settingsJson } = await supabaseClient.rpc("get_school_admin_settings", { p_school_id: sid });
        if (settingsJson && typeof settingsJson === "object") state.adminSettings = settingsJson;
      }
      if (adminsRes.data && adminsRes.data.length > 0) {
        state.admins = adminsRes.data;
      } else if (state.isAdmin && supabaseClient) {
        const { data: rpcAdmins } = await supabaseClient.rpc("get_school_admins", { p_school_id: sid });
        if (rpcAdmins && Array.isArray(rpcAdmins)) state.admins = rpcAdmins;
      }
      if (state.isAdmin && supabaseClient) {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const uid = sessionData?.session?.user?.id;
        const admins = state.admins || [];
        state.schoolAdminLinked = !!(uid && admins.some((a) => a.user_id === uid));
        state.currentAdmin = admins.find((a) => a.user_id === uid) || null;
        if (!state.currentAdmin && uid && sid) {
          try {
            const { data: curAdmin } = await supabaseClient.rpc("get_current_admin", { p_school_id: sid });
            const row = Array.isArray(curAdmin) && curAdmin.length > 0 ? curAdmin[0] : curAdmin;
            if (row && typeof row === "object") state.currentAdmin = row;
          } catch (_) {
          }
        }
      }
      const currentSchoolObj = state.schools.find((s) => s.id === sid) || state.currentSchool;
      if (currentSchoolObj?.profile_type === "private_teacher" && supabaseClient) {
        try {
          const { data: availData } = await supabaseClient.rpc("get_teacher_availability", { p_school_id: sid });
          state.teacherAvailability = Array.isArray(availData) ? availData : [];
        } catch (_) {
          state.teacherAvailability = [];
        }
        if (state.isAdmin) {
          try {
            const { data: pcrData } = await supabaseClient.rpc("get_private_class_requests_for_school", { p_school_id: sid });
            state.privateClassRequests = Array.isArray(pcrData) ? pcrData : [];
          } catch (_) {
            state.privateClassRequests = [];
          }
        }
      } else {
        state.teacherAvailability = [];
        state.privateClassRequests = [];
      }
      if (isStudent && state.currentSchool?.profile_type === "private_teacher" && state.currentUser?.id && supabaseClient && sid) {
        try {
          const { data: pcrStudent } = await supabaseClient.from("private_class_requests").select("*").eq("school_id", sid).eq("student_id", String(state.currentUser.id)).eq("status", "accepted").order("requested_date", { ascending: true });
          state.studentPrivateClassRequests = Array.isArray(pcrStudent) ? pcrStudent : [];
        } catch (_) {
          state.studentPrivateClassRequests = [];
        }
      } else {
        state.studentPrivateClassRequests = [];
      }
      if (currentSchoolObj && state.currentSchool && state.currentSchool.id === currentSchoolObj.id) {
        state.currentSchool = { ...state.currentSchool, ...currentSchoolObj };
      }
      if (isStudent && allEnrollmentsRes?.data != null) {
        const allEnroll = allEnrollmentsRes.data;
        state.allEnrollments = Array.isArray(allEnroll) ? allEnroll : typeof allEnroll === "string" ? JSON.parse(allEnroll) : [];
      } else if (isStudent) {
        state.allEnrollments = [];
      }
      if (isStudent && state.currentUser?.id && supabaseClient && sid) {
        try {
          const { data: compData, error: compErr } = await supabaseClient.rpc("competition_get_for_student", { p_student_id: String(state.currentUser.id), p_school_id: sid });
          if (compErr) {
            state.currentCompetitionForStudent = null;
            state.studentCompetitionRegistration = null;
          } else {
            const comp = Array.isArray(compData) && compData.length > 0 ? compData[0] : null;
            state.currentCompetitionForStudent = comp || null;
            if (comp) {
              const { data: regData } = await supabaseClient.rpc("competition_registration_get", { p_competition_id: comp.id, p_student_id: String(state.currentUser.id) });
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
          const { data: compList, error: compListErr } = await supabaseClient.rpc("competition_list_for_admin", { p_school_id: sid });
          state.competitions = !compListErr && Array.isArray(compList) ? compList : [];
          if (state.competitionTab === "registrations" && state.competitionId && typeof window.fetchCompetitionRegistrations === "function") {
            state.currentCompetition = state.competitions.find((c) => c.id === state.competitionId || String(c.id) === String(state.competitionId)) || null;
            await window.fetchCompetitionRegistrations(state.competitionId);
          }
        } catch (_) {
          state.competitions = [];
        }
      }
      if (typeof window.checkExpirations === "function") await window.checkExpirations();
      if (sid && supabaseClient && state.currentSchool?.class_registration_enabled) {
        try {
          if (!state.mockDate) {
            await supabaseClient.rpc("process_expired_registrations", { p_school_id: sid });
          }
        } catch (e) {
          console.warn("process_expired_registrations error:", e);
        }
        if (isStudent && state.currentUser?.id) {
          state.classRegLoaded = false;
          if (typeof window.loadClassAvailability === "function") {
            window.loadClassAvailability().then(() => {
              if (typeof window.shouldDeferRender === "function" && window.shouldDeferRender()) {
                if (typeof window.scheduleDeferredRender === "function") window.scheduleDeferredRender();
              } else {
                if (typeof window.renderView === "function") window.renderView();
                if (window.lucide) window.lucide.createIcons();
              }
            }).catch(() => {
            });
          }
        }
        if (state.isAdmin) {
          const allWeekRegs = [];
          const allDates = /* @__PURE__ */ new Set();
          const getToday = typeof window.getTodayForMonthly === "function" ? window.getTodayForMonthly : () => /* @__PURE__ */ new Date();
          const now2 = getToday();
          const start = new Date(now2.getFullYear(), now2.getMonth(), 1);
          const end = new Date(now2.getFullYear(), now2.getMonth() + 2, 0);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            allDates.add(typeof window.formatClassDate === "function" ? window.formatClassDate(d) : d.toISOString().slice(0, 10));
          }
          const dateArr = [...allDates];
          const BATCH = 10;
          for (let i = 0; i < dateArr.length; i += BATCH) {
            const chunk = dateArr.slice(i, i + BATCH);
            const results = await Promise.all(chunk.map(
              (dateStr) => supabaseClient.rpc("get_class_registrations_for_date", { p_school_id: sid, p_class_date: dateStr })
            ));
            results.forEach((res) => {
              if (res.error || !res.data) return;
              const arr = Array.isArray(res.data) ? res.data : typeof res.data === "string" ? JSON.parse(res.data) : [];
              arr.forEach((r) => allWeekRegs.push(r));
            });
          }
          state.adminWeekRegistrations = allWeekRegs;
        }
      }
      if (state.currentUser && !state.isAdmin && state.students?.length > 0) {
        const updated = state.students.find((s) => s.id === state.currentUser.id);
        if (updated) state.currentUser = { ...updated, role: "student" };
      }
      state.loading = false;
      _lastFetchEndTime = Date.now();
      if (state.currentView !== "auth") {
        if (typeof window.shouldDeferRender === "function" && window.shouldDeferRender()) {
          if (typeof window.scheduleDeferredRender === "function") window.scheduleDeferredRender();
        } else if (typeof window.renderView === "function") window.renderView();
      }
      if (window._fetchAllDataNeeded) {
        window._fetchAllDataNeeded = false;
        setTimeout(() => fetchAllData(), 100);
      }
    } catch (err) {
      state.loading = false;
      _lastFetchEndTime = Date.now();
      console.error("Error fetching data:", err);
      if (state.currentView !== "auth") {
        if (typeof window.shouldDeferRender === "function" && window.shouldDeferRender()) {
          if (typeof window.scheduleDeferredRender === "function") window.scheduleDeferredRender();
        } else if (typeof window.renderView === "function") window.renderView();
      }
      if (window._fetchAllDataNeeded) {
        window._fetchAllDataNeeded = false;
        setTimeout(() => fetchAllData(), 100);
      }
    }
  }
  async function fetchPlatformData() {
    if (!supabaseClient) return;
    state.loading = true;
    if (typeof window.renderView === "function") window.renderView();
    try {
      const [schools, students, admins, classes, subs] = await Promise.all([
        supabaseClient.from("schools").select("*").order("name"),
        supabaseClient.from("students_with_profile").select("*"),
        supabaseClient.from("admins").select("*"),
        supabaseClient.from("classes").select("*"),
        supabaseClient.from("subscriptions").select("*")
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
        const { data: rpcData } = await supabaseClient.rpc("get_platform_all_data");
        if (rpcData && typeof rpcData === "object") {
          state.platformData = {
            schools: Array.isArray(rpcData.schools) ? rpcData.schools : state.platformData.schools || [],
            students: Array.isArray(rpcData.students) ? rpcData.students : state.platformData.students || [],
            admins: Array.isArray(rpcData.admins) ? rpcData.admins : state.platformData.admins || [],
            classes: Array.isArray(rpcData.classes) ? rpcData.classes : state.platformData.classes || [],
            subscriptions: Array.isArray(rpcData.subscriptions) ? rpcData.subscriptions : state.platformData.subscriptions || [],
            payment_requests: Array.isArray(rpcData.payment_requests) ? rpcData.payment_requests : [],
            admin_settings: Array.isArray(rpcData.admin_settings) ? rpcData.admin_settings : [],
            platform_admins: Array.isArray(rpcData.platform_admins) ? rpcData.platform_admins : []
          };
        }
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const uid = sessionData?.session?.user?.id;
        const admins2 = state.platformData?.platform_admins || [];
        state.platformAdminLinked = !!(uid && admins2.some((pa) => pa.user_id === uid));
        const { data: discEnabled } = await supabaseClient.rpc("discovery_is_enabled");
        state.platformData.discoveryEnabled = !!discEnabled;
      }
      state.loading = false;
      if (typeof window.renderView === "function") window.renderView();
    } catch (err) {
      state.loading = false;
      console.error("Error fetching platform data:", err);
      if (typeof window.renderView === "function") window.renderView();
    }
  }
  window._discoveryFetchInProgress = false;
  async function fetchDiscoveryData() {
    if (!state.discoveryPath) return;
    if (window._discoveryFetchInProgress) return;
    window._discoveryFetchInProgress = true;
    const path = state.discoveryPath;
    try {
      if (path === "/discovery") {
        state.discoverySchools = [];
        state.discoverySchoolDetail = null;
        if (supabaseClient) {
          try {
            const { data, error } = await supabaseClient.rpc("discovery_list_schools");
            if (error) throw error;
            state.discoverySchools = Array.isArray(data) ? data : data && typeof data === "object" && data !== null ? [data] : [];
          } catch (err) {
            console.error("Discovery list error:", err);
            state.discoverySchools = [];
          }
        }
      } else if (path.startsWith("/discovery/")) {
        state.discoverySchoolDetail = null;
        const afterPrefix = path.replace(/^\/discovery\//, "").trim();
        let decoded = afterPrefix;
        try {
          decoded = decodeURIComponent(afterPrefix);
        } catch (_) {
        }
        if (supabaseClient) {
          try {
            if (decoded.startsWith("id/")) {
              const schoolId = decoded.replace(/^id\/?/, "").trim();
              if (schoolId) {
                const { data, error } = await supabaseClient.rpc("discovery_school_detail_by_id", { p_school_id: schoolId });
                if (error) throw error;
                state.discoverySchoolDetail = data || null;
              }
            } else if (decoded) {
              const { data, error } = await supabaseClient.rpc("discovery_school_detail", { p_slug: decoded });
              if (error) throw error;
              state.discoverySchoolDetail = data || null;
            }
          } catch (err) {
            console.error("Discovery detail error:", err);
            state.discoverySchoolDetail = null;
          }
        }
      }
    } finally {
      window._discoveryFetchInProgress = false;
    }
  }

  // src/scanner.js
  var html5QrCode;
  async function startScanner() {
    try {
      const modal = document.getElementById("scanner-modal");
      modal.classList.remove("hidden");
      document.getElementById("inline-scan-result").innerHTML = "";
      const scanHint = document.getElementById("scan-align-hint");
      if (scanHint) scanHint.style.display = "";
      if (html5QrCode) {
        try {
          await html5QrCode.stop();
        } catch (e) {
          console.warn("Error stopping existing scanner:", e);
        }
        html5QrCode = null;
      }
      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1
      };
      const scanSuccess = (id) => {
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.pause(false);
        }
        handleScan(id);
      };
      const constraints = [
        { facingMode: "environment" },
        { facingMode: "user" },
        { video: true }
      ];
      let lastErr;
      for (const c of constraints) {
        try {
          html5QrCode = new Html5Qrcode("reader");
          await html5QrCode.start(c, config, scanSuccess, () => {
          });
          return;
        } catch (err) {
          console.warn("Scanner start attempt failed:", c, err);
          lastErr = err;
          if (html5QrCode) {
            try {
              await html5QrCode.stop();
            } catch (_) {
            }
            html5QrCode = null;
          }
        }
      }
      const msg = (lastErr?.message || String(lastErr)).toLowerCase();
      const friendlyMsg = msg.includes("not found") || msg.includes("notfound") ? typeof window.t === "function" ? window.t("camera_not_found") : "No camera found. Please connect a camera or use a device with a built-in camera." : msg.includes("permission") || msg.includes("denied") ? typeof window.t === "function" ? window.t("camera_permission_denied") : "Camera access denied. Please allow camera in your browser settings." : "Camera error: " + (lastErr?.message || lastErr);
      alert(friendlyMsg);
    } catch (err) {
      console.error("Scanner setup error:", err);
      alert("Camera access denied or error: " + err);
    }
  }
  async function stopScanner() {
    document.getElementById("scanner-modal").classList.add("hidden");
    if (html5QrCode) {
      try {
        if (html5QrCode.isScanning) {
          await html5QrCode.stop();
        }
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        html5QrCode = null;
      }
    }
  }
  async function handleScan(scannedId) {
    const id = (scannedId || "").trim();
    const student = state.students.find((s) => s.id === id || s.user_id === id);
    const resultEl = document.getElementById("inline-scan-result");
    const scanHint = document.getElementById("scan-align-hint");
    if (scanHint) scanHint.style.display = "none";
    const t2 = new Proxy(window.t, {
      get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
    });
    if (!student) {
      resultEl.innerHTML = `
            <div class="card" style="border-color: var(--danger); background: rgba(251, 113, 133, 0.1); padding: 1rem;">
                <h2 style="color: var(--danger); font-size: 1rem;">${t2("scan_fail")}</h2>
                <p style="margin-top:0.3rem">${t2("not_found_msg")}: [${escapeHtml2(id.substring(0, 8))}...]</p>
                <button class="btn-primary mt-2 w-full" onclick="window.cancelAttendance()">${t2("close")}</button>
            </div>
        `;
      return;
    }
    const schoolId = state.currentSchool?.id;
    const regEnabled = state.currentSchool?.class_registration_enabled;
    let todayRegs = [];
    if (regEnabled && supabaseClient && schoolId) {
      try {
        await supabaseClient.rpc("process_expired_registrations", { p_school_id: schoolId });
        const { data, error } = await supabaseClient.rpc("get_student_registrations_for_today", {
          p_student_id: String(id),
          p_school_id: schoolId
        });
        if (!error && data) {
          todayRegs = Array.isArray(data) ? data : typeof data === "string" ? JSON.parse(data) : [];
        }
      } catch (e) {
        console.warn("Error checking registrations:", e);
      }
    }
    const packs = student.active_packs || [];
    const now = /* @__PURE__ */ new Date();
    const activePacks = packs.filter((p) => new Date(p.expires_at) > now);
    const hasUnlimitedPack = activePacks.some((p) => p.count == null || p.count === "null");
    const isUnlimitedGroup = student.balance === null || hasUnlimitedPack;
    const isPT = state.currentSchool?.profile_type === "private_teacher";
    const hasDualScanMode = isPT || state.currentSchool?.private_packages_enabled !== false && state.adminSettings?.private_classes_offering_enabled === "true";
    const hasEventsEnabled = state.currentSchool?.events_packages_enabled !== false && state.adminSettings?.events_offering_enabled === "true";
    const effectivePrivate = Math.max(student.balance_private ?? 0, activePacks.reduce((s, p) => s + (p.private_count || 0), 0));
    const effectiveEvents = Math.max(student.balance_events ?? 0, activePacks.reduce((s, p) => s + (p.event_count || 0), 0));
    const hasGroupLeft = isUnlimitedGroup || student.balance != null && student.balance > 0 || activePacks.some((p) => (parseInt(p.count, 10) || 0) > 0);
    const hasPrivateLeft = effectivePrivate > 0;
    const hasEventsLeft = effectiveEvents > 0;
    if (!state.scanDeductionType || state.scanDeductionType !== "group" && state.scanDeductionType !== "private" && state.scanDeductionType !== "event") {
      state.scanDeductionType = isPT ? "private" : "group";
    }
    const hasValidPass = student.paid && (hasGroupLeft || hasDualScanMode && hasPrivateLeft || hasEventsEnabled && hasEventsLeft);
    const hasNoClasses = student.paid && !hasGroupLeft && !hasPrivateLeft && !hasEventsLeft;
    if (todayRegs.length > 0 && hasValidPass) {
      const regsHtml = todayRegs.map((r) => `
            <div style="background: rgba(52, 199, 89, 0.1); border: 1px solid var(--secondary); border-radius: 12px; padding: 0.6rem 0.8rem; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <i data-lucide="check-circle" size="14" style="color: var(--secondary);"></i>
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--secondary);">${t2("student_registered_for")}</span>
                </div>
                <div style="font-size: 0.95rem; font-weight: 600;">${escapeHtml2(r.class_name)} <span class="text-muted">@ ${escapeHtml2(r.class_time)}</span></div>
            </div>
        `).join("");
      const regBtns = todayRegs.map((r) => `
            <button class="btn-primary w-full" onclick="window.confirmRegisteredAttendance('${escapeHtml2(r.id)}')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem; margin-bottom: 0.35rem;">
                <i data-lucide="check" size="14" style="margin-right: 6px;"></i> ${t2("confirm_attendance_registered")} \u2013 ${escapeHtml2(r.class_name)}
            </button>
        `).join("");
      const regBalanceLabel = hasDualScanMode ? `${t2("group_classes_remaining") || "Group"}: ${student.balance === null ? t2("unlimited") : student.balance} | ${t2("private_classes_remaining") || "Private"}: ${effectivePrivate}${hasEventsEnabled ? " | " + (t2("events_remaining") || "Events") + ": " + effectiveEvents : ""}` : `${t2("remaining_classes")}: ${student.balance === null ? t2("unlimited") : student.balance}${hasEventsEnabled ? " | " + (t2("events_remaining") || "Events") + ": " + effectiveEvents : ""}`;
      resultEl.innerHTML = `
            <div class="card" style="border-radius: 16px; padding: 0.85rem; text-align: left; border: 2px solid var(--secondary); background: var(--background);">
                <h3 style="font-size: 0.95rem; margin:0 0 0.4rem;">${escapeHtml2(student.name)}</h3>
                <div style="font-size: 0.8rem; font-weight: 600; color: var(--secondary); margin-bottom: 0.6rem;">
                    ${regBalanceLabel}
                </div>
                ${regsHtml}
                <div style="font-size: 0.7rem; color: var(--text-secondary); text-align: center; margin: 0.4rem 0;">
                    <i data-lucide="info" size="12" style="vertical-align: middle; margin-right: 4px;"></i>${t2("class_will_deduct")}
                </div>
                ${regBtns}
                <div style="border-top: 1px solid var(--border); margin-top: 0.4rem; padding-top: 0.4rem;">
                    <div style="font-size: 0.7rem; color: var(--text-secondary); text-align: center; margin-bottom: 0.25rem;">${t2("no_manual_deduction")}</div>
                </div>
                <div style="text-align: center; margin-top: 0.5rem;">
                    <button type="button" onclick="window.cancelAttendance()" style="background: none; border: none; color: var(--text-secondary); font-size: 0.75rem; padding: 0.25rem 0.5rem; cursor: pointer; opacity: 0.8;">${t2("cancel")}</button>
                </div>
            </div>
        `;
    } else if (hasNoClasses) {
      resultEl.innerHTML = `
            <div class="card" style="border-color: var(--system-orange); background: rgba(255, 149, 0, 0.1); padding: 1rem; text-align: center;">
                <h3 style="font-size: 1rem; margin:0;">${escapeHtml2(student.name)}</h3>
                <p style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 0.75rem 0;">${t2("no_classes_buy_package")}</p>
                <button class="btn-primary mt-2 w-full" onclick="window.cancelAttendance()">${t2("close")}</button>
            </div>
        `;
    } else if (hasValidPass) {
      const maxDeductGroup = student.balance === null || student.balance === void 0 ? 99 : Math.max(1, student.balance);
      const maxDeductPrivate = Math.max(1, effectivePrivate);
      const balanceLabelDual = `${t2("group_classes_remaining") || "Group"}: ${student.balance === null ? t2("unlimited") : student.balance} | ${t2("private_classes_remaining") || "Private"}: ${effectivePrivate}${hasEventsEnabled ? " | " + (t2("events_remaining") || "Events") + ": " + effectiveEvents : ""}`;
      const balanceLabelSingle = `${t2("remaining_classes")}: ${student.balance === null ? t2("unlimited") : student.balance}${hasEventsEnabled ? " | " + (t2("events_remaining") || "Events") + ": " + effectiveEvents : ""}`;
      const balanceLabel = hasDualScanMode ? balanceLabelDual : balanceLabelSingle;
      const groupRow = hasGroupLeft ? `
                <div style="margin-bottom: ${hasDualScanMode ? "0.75rem" : "0"};">
                    ${hasDualScanMode ? `<div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">${t2("deduct_group_classes") || "Deduct group classes"}</div>` : ""}
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-top: 0.2rem;">
                        <button class="btn-primary" onclick="window.confirmAttendance('${escapeHtml2(student.id)}', 1, 'group')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;">${t2("one_class")}</button>
                        <button class="btn-secondary" onclick="window.confirmAttendance('${escapeHtml2(student.id)}', 2, 'group')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;">${t2("two_classes")}</button>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem; margin-top: 0.4rem;">
                        <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap;">${t2("custom_classes_label")}:</label>
                        <input type="number" id="scan-custom-count-group" min="1" max="${maxDeductGroup}" placeholder="0" style="flex:1; max-width: 70px; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 0.85rem; font-weight: 600; box-sizing: border-box;" inputmode="numeric">
                        <button class="btn-primary" onclick="var el = document.getElementById('scan-custom-count-group'); var n = parseInt(el && el.value ? el.value : 0, 10); if (n >= 1) window.confirmAttendance('${escapeHtml2(student.id)}', n, 'group'); else alert(window.t('deduct_invalid_amount'));" style="padding: 0.4rem 0.7rem; font-size: 0.8rem;">${t2("deduct_btn")}</button>
                    </div>
                </div>` : "";
      const privateRow = hasDualScanMode && hasPrivateLeft ? `
                <details style="border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: 0.4rem;">
                    <summary class="scan-private-summary" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); cursor: pointer; list-style: none; display: flex; align-items: center; gap: 6px; padding: 0.35rem 0;">
                        <span class="scan-private-arrow" style="opacity: 0.7; display: inline-block; transition: transform 0.2s;">\u25B6</span> ${t2("deduct_private_classes") || "Deduct private classes"}
                    </summary>
                    <div style="margin-top: 0.4rem;">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">
                            <button class="btn-primary" onclick="window.confirmAttendance('${escapeHtml2(student.id)}', 1, 'private')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;">${t2("one_class")}</button>
                            <button class="btn-secondary" onclick="window.confirmAttendance('${escapeHtml2(student.id)}', 2, 'private')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;">${t2("two_classes")}</button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.4rem; margin-top: 0.4rem;">
                            <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap;">${t2("custom_classes_label")}:</label>
                            <input type="number" id="scan-custom-count-private" min="1" max="${maxDeductPrivate}" placeholder="0" style="flex:1; max-width: 70px; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 0.85rem; font-weight: 600; box-sizing: border-box;" inputmode="numeric">
                            <button class="btn-primary" onclick="var el = document.getElementById('scan-custom-count-private'); var n = parseInt(el && el.value ? el.value : 0, 10); if (n >= 1) window.confirmAttendance('${escapeHtml2(student.id)}', n, 'private'); else alert(window.t('deduct_invalid_amount'));" style="padding: 0.4rem 0.7rem; font-size: 0.8rem;">${t2("deduct_btn")}</button>
                        </div>
                    </div>
                </details>` : "";
      const eventRow = hasEventsEnabled && hasEventsLeft ? `
                <details style="border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: 0.4rem;">
                    <summary class="scan-event-summary" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); cursor: pointer; list-style: none; display: flex; align-items: center; gap: 6px; padding: 0.35rem 0;">
                        <span class="scan-event-arrow" style="opacity: 0.7; display: inline-block; transition: transform 0.2s;">\u25B6</span> ${t2("deduct_one_event") || "Deduct event"}
                    </summary>
                    <div style="margin-top: 0.4rem;">
                        <button class="btn-primary w-full" onclick="window.confirmAttendance('${escapeHtml2(student.id)}', 1, 'event')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;">${t2("deduct_one_event") || "Deduct 1 event"}</button>
                    </div>
                </details>` : "";
      resultEl.innerHTML = `
            <div class="card" style="border-radius: 16px; padding: 0.85rem; text-align: left; border: 2px solid var(--secondary); background: var(--background);">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <h3 style="font-size: 0.95rem; margin:0;">${escapeHtml2(student.name)}</h3>
                        <div style="font-size: 0.85rem; font-weight: 700; color: var(--secondary);">
                            ${balanceLabel}
                        </div>
                    </div>
                </div>
                ${groupRow}
                ${privateRow}
                ${eventRow}
            </div>
        `;
    } else {
      resultEl.innerHTML = `
            <div class="card" style="border-color: var(--danger); background: rgba(251, 113, 133, 0.1); padding: 1rem;">
                <h2 style="color: var(--danger); font-size: 1rem;">${t2("scan_fail")}</h2>
                <p style="margin-top:0.3rem">${escapeHtml2(student.name)}</p>
                <p style="font-size:0.75rem; color:var(--danger)">${t2("inactive")}</p>
                <button class="btn-primary mt-2 w-full" onclick="window.cancelAttendance()">${t2("close")}</button>
            </div>
        `;
    }
    if (window.lucide) window.lucide.createIcons();
  }
  function cancelAttendance() {
    document.getElementById("inline-scan-result").innerHTML = "";
    const scanHint = document.getElementById("scan-align-hint");
    if (scanHint) scanHint.style.display = "";
    if (html5QrCode) {
      try {
        html5QrCode.resume();
      } catch (e) {
        console.warn("Could not resume scanner:", e);
      }
    }
  }
  async function confirmRegisteredAttendance(registrationId) {
    const schoolId = state.currentSchool?.id;
    if (!schoolId || !supabaseClient) return;
    const t2 = new Proxy(window.t, {
      get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
    });
    const resultEl = document.getElementById("inline-scan-result");
    try {
      const { error } = await supabaseClient.rpc("mark_registration_attended", {
        p_registration_id: registrationId,
        p_school_id: schoolId
      });
      if (error) throw error;
      if (supabaseClient && schoolId) {
        const { data: freshStudents } = await supabaseClient.rpc("get_school_students", { p_school_id: schoolId });
        if (freshStudents) state.students = freshStudents;
      }
      resultEl.innerHTML = `
            <div class="card" style="border-radius: 20px; padding: 1.5rem; text-align: center; border: 2px solid var(--secondary); background: var(--background);">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.8rem;">
                    <i data-lucide="check" size="24" style="color: white;"></i>
                </div>
                <h3 style="font-size: 1rem; color: var(--secondary); margin: 0;">${t2("attendance_success")}</h3>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.3rem 0 1rem;">${t2("auto_deducted")}</p>
                <button class="btn-primary w-full" onclick="window.cancelAttendance()" style="padding: 0.8rem;">${t2("close")}</button>
            </div>
        `;
      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error("Error confirming registered attendance:", e);
      resultEl.innerHTML = `
            <div class="card" style="border-color: var(--danger); background: rgba(251, 113, 133, 0.1); padding: 1rem;">
                <p style="color: var(--danger);">${escapeHtml2(e.message || t2("error_confirming_attendance"))}</p>
                <button class="btn-primary mt-2 w-full" onclick="window.cancelAttendance()">${t2("close")}</button>
            </div>
        `;
    }
  }
  async function confirmAttendance(studentId, count, classType) {
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return;
    if (classType !== "group" && classType !== "private" && classType !== "event") classType = state.scanDeductionType === "private" ? "private" : state.scanDeductionType === "event" ? "event" : "group";
    const t2 = new Proxy(window.t, {
      get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
    });
    const countNum = typeof count === "number" ? count : parseInt(count, 10);
    if (!Number.isInteger(countNum) || countNum < 1) {
      alert(t2("deduct_invalid_amount"));
      return;
    }
    const resultEl = document.getElementById("inline-scan-result");
    const packs = student.active_packs || [];
    const now = /* @__PURE__ */ new Date();
    const activePacks = packs.filter((p) => new Date(p.expires_at) > now);
    const hasUnlimitedPack = activePacks.some((p) => p.count == null || p.count === "null");
    const isUnlimited = student.balance === null || hasUnlimitedPack;
    const effectivePrivate = Math.max(student.balance_private ?? 0, activePacks.reduce((s, p) => s + (p.private_count || 0), 0));
    const effectiveEvents = Math.max(student.balance_events ?? 0, activePacks.reduce((s, p) => s + (p.event_count || 0), 0));
    const checkBalance = classType === "private" ? effectivePrivate < countNum : classType === "event" ? effectiveEvents < countNum : !isUnlimited && student.balance !== null && student.balance < countNum;
    if (checkBalance) {
      alert(t2("not_enough_balance"));
      return;
    }
    const shouldDeduct = classType === "private" ? effectivePrivate >= countNum : classType === "event" ? effectiveEvents >= countNum : !isUnlimited && student.balance !== null;
    if (shouldDeduct) {
      const schoolId = student.school_id || state.currentSchool?.id;
      let updated = false;
      if (supabaseClient && schoolId) {
        const { error: rpcError } = await supabaseClient.rpc("deduct_student_classes", {
          p_student_id: String(studentId),
          p_school_id: schoolId,
          p_count: countNum,
          p_class_type: classType
        });
        if (!rpcError) {
          updated = true;
          const now2 = /* @__PURE__ */ new Date();
          const packs2 = student.active_packs.slice().sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
          let remaining = countNum;
          for (const pack of packs2) {
            if (remaining <= 0) break;
            if (new Date(pack.expires_at) <= now2) continue;
            if (classType === "private") {
              const c = pack.private_count ?? 0;
              const deduct = Math.min(c, remaining);
              pack.private_count = c - deduct;
              remaining -= deduct;
            } else if (classType === "event") {
              const c = pack.event_count ?? 0;
              const deduct = Math.min(c, remaining);
              pack.event_count = c - deduct;
              remaining -= deduct;
            } else {
              const c = pack.count || 0;
              const deduct = Math.min(c, remaining);
              pack.count = c - deduct;
              remaining -= deduct;
            }
          }
          student.active_packs = packs2.filter((p) => (classType === "private" ? p.private_count || 0 : classType === "event" ? p.event_count || 0 : p.count || 0) > 0 || new Date(p.expires_at) <= now2);
          if (classType === "private") {
            student.balance_private = Math.max(0, (student.balance_private ?? 0) - countNum);
          } else if (classType === "event") {
            student.balance_events = student.active_packs.filter((p) => new Date(p.expires_at) > now2).reduce((s, p) => s + (p.event_count || 0), 0);
          } else {
            student.balance = (student.balance || 0) - countNum;
          }
        }
      }
      if (!updated && classType === "group") {
        const now2 = /* @__PURE__ */ new Date();
        const allPacks = Array.isArray(student.active_packs) ? [...student.active_packs] : [];
        const activePacks2 = allPacks.filter((p) => new Date(p.expires_at) > now2).sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
        let remainingToDeduct = countNum;
        if (activePacks2.length > 0) {
          for (let i = 0; i < activePacks2.length && remainingToDeduct > 0; i++) {
            const pack = activePacks2[i];
            const c = pack.count || 0;
            if (c >= remainingToDeduct) {
              pack.count = c - remainingToDeduct;
              remainingToDeduct = 0;
            } else {
              remainingToDeduct -= c;
              pack.count = 0;
            }
          }
          const expiredPacks = allPacks.filter((p) => new Date(p.expires_at) <= now2);
          const updatedPacks = [...activePacks2.filter((p) => (p.count || 0) > 0), ...expiredPacks];
          const newBalance = updatedPacks.filter((p) => new Date(p.expires_at) > now2).reduce((sum, p) => sum + (parseInt(p.count) || 0), 0);
          if (supabaseClient) {
            const { error } = await supabaseClient.from("students").update({ balance: newBalance, active_packs: updatedPacks }).eq("id", studentId);
            if (error) {
              alert("Error updating balance: " + error.message);
              return;
            }
          }
          student.balance = newBalance;
          student.active_packs = updatedPacks;
        } else {
          const newBalance = student.balance - countNum;
          if (supabaseClient) {
            const { error } = await supabaseClient.from("students").update({ balance: newBalance }).eq("id", studentId);
            if (error) {
              alert("Error updating balance: " + error.message);
              return;
            }
          }
          student.balance = newBalance;
        }
      }
      saveState();
      await fetchAllData();
    }
    const newRemaining = classType === "private" ? student.balance_private ?? 0 : classType === "event" ? student.balance_events ?? 0 : isUnlimited ? t2("unlimited") : student.balance ?? 0;
    const unitLabel = classType === "event" ? countNum === 1 ? t2("event_unit") : t2("events_unit") : countNum === 1 ? t2("class_unit") : t2("classes_unit");
    const remainingLabel = classType === "event" ? t2("events_remaining") : classType === "private" ? t2("private_classes_remaining") : t2("remaining_classes");
    resultEl.innerHTML = `
        <div class="card" style="border-color: var(--secondary); background: rgba(45, 212, 191, 0.1); padding: 1rem; text-align:center;">
             <i data-lucide="check-circle" size="32" style="color: var(--secondary)"></i>
             <div style="font-weight:700; color:var(--secondary)">${t2("attendance_success")}</div>
             <div style="font-size:0.9rem; margin-top:0.25rem">${student.name} &minus;${countNum} ${unitLabel}</div>
             <div style="font-size:0.85rem; font-weight:600; color:var(--text-secondary); margin-top:0.5rem">${remainingLabel}: ${newRemaining}</div>
        </div>
        `;
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      resultEl.innerHTML = "";
      const scanHint = document.getElementById("scan-align-hint");
      if (scanHint) scanHint.style.display = "";
      if (html5QrCode) {
        try {
          html5QrCode.resume();
        } catch (e) {
          console.warn("Could not resume scanner:", e);
        }
      }
    }, 2e3);
  }
  function updateStickyFooterVisibility() {
    const el = document.querySelector(".sticky-footer-inner");
    if (!el) return;
    const threshold = 80;
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - threshold;
    el.classList.toggle("sticky-footer-visible", atBottom);
  }

  // src/legacy.js
  var DANCE_LOCALES = {
    en: {
      nav_schedule: "Schedule",
      nav_shop: "Shop",
      nav_qr: "My QR",
      nav_students: "Students",
      nav_scan: "Scan",
      nav_settings: "Settings",
      schedule_title: "Class Schedule",
      shop_title: "Subscription Plans",
      qr_title: "Your Access Pass",
      qr_subtitle: "Present this at the studio entrance",
      buy: "Get Started",
      active: "Access Granted",
      inactive: "Payment Required",
      pay_status: "Membership Status",
      student_id: "Member ID",
      admin_label: "Admin",
      no_subs: "No active memberships found",
      scan_success: "Verification Successful",
      scan_fail: "Membership Inactive",
      scan_align_hint: "Align QR code within the frame",
      error_confirming_attendance: "Error confirming attendance",
      camera_not_found: "No camera found. Please connect a camera or use a device with a built-in camera.",
      camera_permission_denied: "Camera access denied. Please allow camera in your browser settings.",
      switch_to_admin: "Go to Admin",
      switch_to_student: "Go to Student",
      auth_subtitle: "Precision in every step.",
      welcome_to: "Welcome to",
      student_signup: "New Student",
      admin_login: "Admin login",
      full_name_placeholder: "Full name",
      email_placeholder: "Email address",
      signup_require_fields: "Please enter full name, email, phone and password.",
      signup_email_login_hint: "You will use this email to log in.",
      email_already_registered: "This email is already in use. Sign in or use another email.",
      signup_invalid_email: "Please enter a valid email address.",
      confirm_password_placeholder: "Confirm password",
      signup_passwords_dont_match: "Passwords do not match.",
      signup_btn: "Join Now",
      logout: "Sign Out",
      admin_subtitle: "Manage your studio efficiently",
      classes_subtitle: "Upcoming sessions and workshops",
      username: "Username",
      password: "Password",
      login_btn: "Login",
      invalid_login: "Invalid credentials",
      remaining_classes: "Classes Remaining",
      unlimited: "Unlimited",
      already_account: "Already have an account?",
      no_account: "Don't have an account?",
      sign_in: "Sign In",
      sign_up: "Sign Up",
      student_login: "Student Login",
      phone: "Phone Number",
      list_view: "List View",
      weekly_view: "Weekly Plan",
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday",
      sun: "Sunday",
      valid_for_days: "Valid for {days} days",
      nav_memberships: "Memberships",
      pending_payments: "Pending Payments",
      approve: "Approve",
      reject: "Reject",
      transfer: "Transfer",
      cash: "Cash",
      payment_instructions: "Payment Instructions",
      i_have_paid: "I have transferred",
      pay_cash: "I will pay cash",
      request_sent_title: "Request Sent!",
      request_sent_msg: "Your access will be activated once the payment is verified by our staff.",
      close: "Close",
      nav_revenue: "Revenue",
      monthly_total: "This Month Total",
      all_payments: "Payment History",
      approved: "Approved",
      rejected: "Not Approved",
      pending: "Pending",
      one_class: "1 Class",
      two_classes: "2 Classes",
      class_unit: "class",
      classes_unit: "classes",
      event_unit: "event",
      events_unit: "events",
      custom_classes_label: "Custom",
      deduct_btn: "Deduct",
      deduct_invalid_amount: "Enter 1 or more classes to deduct.",
      cancel: "Cancel",
      confirm_attendance: "Confirm Attendance",
      attendance_success: "Attendance confirmed!",
      no_classes_buy_package: "This student has no classes left. They should buy a new package.",
      admin_user_placeholder: "Admin Username",
      admin_email_placeholder: "Admin Email",
      admin_pass_placeholder: "Admin Password",
      admin_login_btn: "Admin Login",
      admin_access_trigger: "\u2022 ADMIN ACCESS \u2022",
      add_student: "Student",
      add_admin: "Admin",
      status_active: "Active",
      status_unpaid: "Unpaid",
      balance_label: "Balance",
      plan_label: "Plan",
      none_label: "None",
      mark_paid: "Mark Paid",
      mark_unpaid: "Mark Unpaid",
      history_label: "History",
      scan_cta_desc: "Verify student entrance precision.",
      initiate_scan_btn: "Initiate Portal Scan",
      classes_label: "Classes",
      add_label: "Add",
      plans_label: "Plans",
      plans_section_group: "Group classes",
      plans_section_private: "Private classes",
      plans_section_mixed: "Mixed classes",
      plans_section_sociales: "Sociales (events)",
      limit_classes_label: "Class Limit",
      limit_classes_placeholder: "Classes (0 = Unlimited)",
      offer_private_classes: "Offer private classes",
      offer_private_classes_desc: "Allow students to buy and use private class packages. When enabled, plans can include group classes, private classes, or both.",
      offer_events: "Offer events",
      offer_events_desc: "Allow students to buy and use event tokens. When enabled, plans can include group, private, and event counts.",
      events: "Events",
      events_remaining: "Events",
      deduct_one_event: "Deduct 1 event",
      group_classes: "Group",
      private_classes: "Private",
      group_classes_remaining: "Group",
      private_classes_remaining: "Private",
      scan_mode_group: "Group",
      scan_mode_private: "Private",
      deduct_group_classes: "Deduct group classes",
      deduct_private_classes: "Deduct private classes",
      price_mxd_label: "Price MXD",
      transfer_details_label: "Transfer Details",
      bank_name_label: "Nombre del banco",
      account_number_label: "Numero de cuenta",
      holder_name_label: "Nombre del titular",
      asunto_label: "Asunto",
      save_bank_btn: "Save Bank Details",
      saved_success_msg: "Saved Successfully!",
      balance_manual_label: "Balance Manual",
      no_classes_msg: "No classes",
      select_plan_msg: "Select your preferred membership plan.",
      delete_student_confirm: "Are you sure you want to remove this student? All their progress will be lost.",
      not_found_msg: "Not Found",
      not_enough_balance: "Not enough classes remaining!",
      enter_admin_user: "Enter new admin username:",
      enter_admin_pass: "Enter new admin password:",
      admin_created: "Admin created!",
      add_admin_modal_title: "Add administrator",
      add_admin_modal_subtitle: "Create a new admin for your school",
      add_admin_success_title: "Administrator added",
      add_admin_success_text: "The new administrator can now sign in with the email and password you set.",
      add_admin_btn: "Add",
      enter_student_name: "Enter student name:",
      enter_student_phone: "Enter student phone:",
      enter_student_email: "Enter student email (optional):",
      enter_student_pass: "Enter student password:",
      student_created: "Student created!",
      unknown_student: "Unknown Student",
      delete_payment_confirm: "Delete this payment record forever?",
      select_school_subtitle: "Please select your school or teacher to continue",
      discover_dance_btn: "Discover all schools",
      discovery_title: "Discover Dance",
      discovery_subtitle: "Find studios and teachers near you",
      discovery_back: "Back to all studios",
      discovery_no_schools: "No studios listed yet.",
      discovery_tab_schools: "Schools",
      discovery_tab_private_teachers: "Private teachers",
      discovery_no_teachers: "No private teachers listed yet.",
      discovery_filter_dance: "Dance style",
      discovery_filter_country: "Country",
      discovery_filter_city: "City",
      discovery_filter_all: "All",
      discovery_not_found: "This studio doesn't have a detail page yet.",
      discovery_sign_in_btn: "Sign in",
      discovery_not_on_app: "This school is not using Bailadmin. Please contact the school directly.",
      discovery_sign_in_edit_profile: "Sign in to edit your studio profile",
      discovery_back_to_page: "Back to discovery page",
      discovery_studio_admin_signin: "Studio admin? Sign in",
      discovery_pick_school_to_signin: "Choose your studio to sign in and edit your discovery profile.",
      discovery_admin_signin_title: "Edit discovery profile",
      discovery_admin_signin_subtitle: "This studio only appears on the discovery page. Sign in with your admin email and password.",
      discovery_placeholder_upload_soon: "Will be uploaded soon.",
      discovery_location: "Location",
      discovery_classes: "Classes",
      discovery_packages: "Packages",
      discovery_gallery: "Gallery",
      add_school_btn: "New School",
      enter_school_name: "Enter new school or teacher name:",
      school_created: "School created successfully!",
      switch_school: "Switch School",
      welcome_classes: "Welcome to the classes of",
      loading: "Loading...",
      select_school_placeholder: "Choose your school...",
      search_school_placeholder: "Type or select school...",
      dropdown_schools: "Schools",
      dropdown_private_teachers: "Private teachers",
      dropdown_country_other: "Other",
      loading_schools: "Loading schools...",
      loading_dashboard: "Loading...",
      no_schools: "No schools found",
      no_schools_yet: "No schools registered yet.",
      could_not_load_schools: "Could not load schools",
      retry: "Retry",
      connecting: "Connecting...",
      dev_access_title: "Dev Access",
      dev_access_subtitle: "Enter platform developer credentials",
      footer_support: "Support",
      footer_contact: "Contact",
      footer_copy: "Made with <3 by a salsero; \xA9 2026 Bailadmin Systems.",
      nav_profile: "Profile",
      discovery_register_title: "Create account",
      discovery_register_subtitle: "Register as an independent dancer",
      discovery_login_title: "Sign in",
      discovery_login_subtitle: "Sign in to your dancer account",
      discovery_already_have_account: "Already have an account?",
      discovery_no_account: "Don't have an account?",
      discovery_confirm_email_banner: "Confirm your email to unlock reviews and adding schools.",
      discovery_review_gate_login: "Sign in to leave a review or suggest a school.",
      discovery_leave_review: "Leave a review",
      discovery_suggest_school: "Suggest a school",
      verify_email_verifying: "Verifying...",
      verify_email_success: "Email confirmed!",
      verify_email_invalid_link: "Invalid or expired link.",
      profile_settings: "Profile",
      profile_sign_in_required: "Sign in to edit your profile.",
      resend_verification: "Resend verification email",
      resend_sending: "Sending\u2026",
      resend_cooldown: "Sent. Wait 60s",
      resend_success: "Check your inbox",
      resend_error: "Could not send. Try again.",
      linked_schools: "Linked schools",
      no_schools_linked: "No schools linked yet.",
      verified: "Verified",
      not_verified: "Not verified",
      first_name: "First name",
      last_name: "Last name",
      email: "Email",
      city: "City",
      country: "Country",
      save: "Save",
      instagram: "Instagram",
      instagram_placeholder: "@handle",
      coming_soon: "Coming soon",
      dev_login_btn: "Login",
      dev_dashboard_title: "Platform Developer",
      dev_school_inspector: "School Inspector",
      dev_active_schools: "Active Schools",
      school_active: "Active",
      school_inactive: "Inactive",
      activate_school: "Activate",
      deactivate_school: "Deactivate",
      school_on_platform: "On the platform",
      school_on_discovery: "On discovery",
      dev_stats_schools: "Schools",
      dev_stats_students: "Total Students",
      dev_stats_plans: "Plans",
      dev_tab_schools: "Schools",
      dev_tab_account_audit: "Account Audit",
      dev_audit_students: "Students",
      dev_audit_admins: "Admins",
      dev_audit_linked: "Linked",
      dev_audit_not_linked: "Not linked",
      dev_audit_user_id: "user_id",
      dev_stats_classes: "Classes",
      dev_view_details: "View Details",
      dev_enter_as_admin: "Enter as Admin",
      dev_edit_discovery_profile: "Edit discovery profile",
      dev_discovery_profile_desc: "Slug, location, description, genres, logo, locations",
      dev_edit_school_info: "Edit school info",
      dev_save_school_info: "Save",
      dev_school_info_desc: "Name and address",
      dev_school_info_saved: "School information saved.",
      dev_events_packages_feature: "Events as packages",
      dev_events_packages_feature_desc: "Allow this school to offer events in packages (school admin can toggle in Settings)",
      dev_private_packages_feature: "Private classes as packages",
      dev_private_packages_feature_desc: "Allow this school to offer private classes in packages (school admin can toggle in Settings)",
      dev_monthly_registration_feature: "Monthly class registration",
      dev_monthly_registration_feature_desc: "Allow this school to offer monthly class registration (sign up for all classes in a month)",
      offer_monthly_registration: "Offer monthly class registration",
      offer_monthly_registration_desc: "Students can register for all remaining classes of a course in the current month at once.",
      register_single: "Register for this class only",
      register_monthly: "Register for all {n} classes this month",
      monthly_badge: "Monthly",
      monthly_balance_insufficient: "You need at least {n} classes to register for the full month.",
      monthly_registration_success: "Successfully registered for {n} classes this month!",
      monthly_capacity_full: "Class is full on {date}. Cannot complete monthly registration.",
      fixed_expiry_date_label: "Fixed expiry date (optional)",
      plan_expiry_display_title: "Plan expiry display",
      plan_expiry_display_desc: "Choose how expiry is shown on each plan and to students.",
      plan_expiry_option_date: "Fixed expiry date",
      plan_expiry_option_date_hint: "e.g. 28.02.2026",
      plan_expiry_option_days: "Validity in days",
      plan_expiry_option_days_hint: "e.g. 30 days",
      plan_expiry_fixed_date_label: "Use fixed expiry date",
      plan_expiry_fixed_date_desc: "When ON: Plans and students see a fixed expiry date (e.g. 28.02.2026). When OFF: Plans and students see validity in days (e.g. 30 days left).",
      dev_events_feature: "Jack and Jill / Events",
      dev_events_feature_desc: "Allow this school to create Jack and Jill events (premium feature)",
      dev_events_enabled: "Enabled",
      dev_events_disabled: "Disabled",
      jack_and_jill_upgrade_msg: "To create events you need to upgrade to a package that includes this feature.",
      dev_volver_dashboard: "Back to Dashboard",
      dev_admins_label: "Administrators",
      dev_students_label: "Students",
      dev_discovery_site: "Discovery site",
      dev_discovery_toggle_on: "On",
      dev_discovery_toggle_off: "Off",
      dev_discovery_profiles: "Discovery profiles",
      dev_open_ajustes: "Open Ajustes",
      dev_edit_in_dashboard: "View / Edit",
      dev_plans_label: "Subscription Catalogue",
      dev_classes_label: "Schedule and Classes",
      dev_no_admins: "No admins assigned",
      dev_no_students: "No students registered",
      dev_no_plans: "No plans defined",
      dev_no_classes: "No classes configured",
      password_label: "Password",
      delete_school_btn: "Delete School",
      rename_school_btn: "Rename",
      rename_school_prompt: "Enter new name for this school:",
      rename_school_success: "School name updated.",
      delete_school_confirm: "Are you sure you want to delete this school? ALL data (students, admins, payments, classes) will be permanently lost.",
      delete_school_success: "School deleted successfully",
      add_school_title: "Create New School",
      school_info_section: "Academy Details",
      admin_info_section: "Initial Administrator",
      admin_name_label: "Admin name",
      admin_email_label: "Email",
      admin_email_not_set: "Not set",
      enter_admin_email: "Please enter an email address.",
      dev_discovery_optional: "Discovery profile (optional)",
      create_school_btn: "Execute Initialization",
      username_exists_msg: "This username is already taken. Please choose another one.",
      class_location: "Location",
      location_placeholder: "e.g. Studio A",
      active_packs_label: "Your Active Packs",
      all_schools_packs_label: "Your Packs Across Schools",
      no_packs_any_school: "You have no active packages at any school",
      expired_classes_label: "Expired Classes",
      used_packs_label: "Used packages",
      no_expiration: "No expiration date",
      expires_in: "Expires in",
      days_left: "days left",
      expires_label: "Expires",
      search_students: "Search members...",
      filter_all: "All",
      filter_with_pack: "With active pack",
      filter_no_pack: "No active pack",
      filter_package_type: "Packages",
      filter_this_month: "This Month",
      filter_status: "Status",
      filter_method: "Method",
      filter_paid: "Paid",
      filter_unpaid: "Unpaid",
      filter_result_students: "{count} students",
      filter_result_payments: "{count} payments",
      filter_label_pack: "Pack",
      filter_label_package: "Package",
      filter_label_payment: "Payment",
      filters_label: "Filters",
      period_total: "Total for period",
      loading_students_msg: "Loading members...",
      no_pending_msg: "No pending payments",
      refresh_btn: "Refresh",
      historical_total_label: "Historical",
      no_data_msg: "No data yet",
      mgmt_classes_title: "Class Management",
      mgmt_admins_title: "Administrators",
      day_label: "Day",
      hour_label: "Time",
      start_time_label: "Start",
      end_time_label: "End",
      level_tag_label: "Level",
      new_class_label: "New Class",
      show_weekly_btn: "Show Weekly Plan",
      hide_weekly_btn: "Hide Weekly Plan",
      weekly_preview_title: "Weekly Preview",
      full_name_label: "Full Name",
      total_classes_label: "Classes Remaining (Total)",
      pack_details_title: "Package Details",
      reg_date_label: "Registration Date",
      next_expiry_label: "Next Expiry",
      delete_perm_label: "Delete member permanently",
      admin_pass_req: "Admin Password Required:",
      leave_blank_keep: "leave blank to keep",
      invalid_pass_msg: "Incorrect Admin Password.",
      save_btn: "Save",
      saving_label: "Saving\u2026",
      save_schedule_btn: "Save schedule",
      save_plans_btn: "Save plans",
      remove_admin_confirm: "Are you sure you want to remove this administrator?",
      admin_removed: "Administrator removed successfully!",
      error_creating_admin: "Error creating administrator:",
      admin_add_need_linked_session: "To add administrators you must be signed in with your linked account. Please log out and sign in again with your username and password.",
      error_removing_admin: "Error removing administrator:",
      additional_features: "Additional features",
      settings_account_admin_label: "Profile, password, admins & more",
      create_new_competition: "Create new competition",
      jack_and_jill: "Jack and Jill",
      competition_date: "Date",
      competition_time: "Time",
      competition_name: "Event name",
      competition_questions: "Organizer questions",
      competition_add_question: "Add question",
      competition_next_steps: "Next steps (shown to students)",
      competition_activate_event: "Activate event",
      competition_activate_signin: "Activate sign-in",
      competition_for_event: "For event",
      competition_saved: "Competition saved successfully.",
      competition_error: "Error saving competition.",
      competition_registrations: "Registrations",
      competition_publish_decisions: "Publish decisions",
      competition_republish_decisions: "Republish decisions",
      competition_confirm_publish: "Are you sure?",
      competition_approve: "Approve",
      competition_decline: "Decline",
      register_for_event: "Register for {eventName}",
      reviewing_application: "We are reviewing your application",
      accepted: "Accepted",
      declined: "Declined",
      competition_approved_message: 'Congratulations! You will compete in "{eventName}"',
      competition_declined_message: "This time you cannot compete, but we hope to see you next time.",
      submit_registration: "Submit registration",
      competition_reg_opens_soon: "Registration opens soon",
      competition_edit_tab: "Edit",
      no_existing_events: "No existing events.",
      no_events_linked_hint: 'If you created events before, link your admin account: go to Students \u2192 use the "Link account" card, or log out and log in again with your admin username and password.',
      add_new_event: "Add new event",
      competition_view_answers: "View answers",
      competition_answers: "Answers",
      competition_answer: "Answer",
      competition_no_answers: "No answers yet.",
      competition_registration_not_found: "Registration not found. Try going back and opening Registros again.",
      competition_delete_confirm: "Delete this event? All registrations will be removed.",
      competition_copy: "Copy",
      competition_copy_of: "Copy of ",
      competition_confirm_copy: 'Create copy as "{name}"? The new event will be inactive.',
      competition_copy_success: "Event copied.",
      competition_done: "Done",
      competition_saved_indicator: "Saved",
      competition_saving: "Saving...",
      competition_next_steps_placeholder: "E.g. No cuts, fixed camera, good lighting...",
      competition_video_submission_toggle: "Include video submission?",
      competition_video_prompt_label: "Video question text",
      competition_video_prompt_placeholder: "Upload your demo video",
      competition_video_duration_error: "Video must be 2-3 minutes",
      competition_video_size_error: "File too large (max 50 MB)",
      competition_video_uploading: "Uploading...",
      competition_video_uploaded: "Video uploaded",
      competition_video_unavailable: "Video unavailable",
      // Class Registration
      nav_my_classes: "My Classes",
      register_for_class: "Register for this class",
      join_class: "Join",
      cancel_registration: "Cancel Registration",
      class_full: "Class Full",
      full_label: "Full",
      class_already_started: "Class already started",
      spots_left: "{n} spots left",
      only_n_spots: "Only {n} places left!",
      registered: "Registered",
      registered_check: "You're registered",
      cancel_before_deadline: "Cancel up to 4h before class",
      cannot_cancel_deadline: "Cancellation deadline passed",
      auto_deducted: "Class deducted automatically",
      registered_for_class_msg: "Registered for {className} at {time}",
      no_manual_deduction: "No manual deduction needed",
      my_classes_title: "My Classes",
      my_classes_subtitle: "Your upcoming and past registrations",
      upcoming_classes: "Upcoming",
      past_classes: "Past Classes",
      no_upcoming: "No upcoming registrations",
      no_past_classes: "No past class history",
      cancelled: "Cancelled",
      attended: "Attended",
      no_show: "No-show",
      registration_enabled: "Class Registration",
      registration_enabled_desc: "Allow students to register for specific class times",
      max_students: "Max Students",
      max_students_placeholder: "e.g. 20",
      confirm_attendance_registered: "Confirm Attendance",
      class_will_deduct: "1 class will be deducted from their package",
      student_registered_for: "Registered for",
      register_success: "Successfully registered!",
      register_error: "Could not register. Please try again.",
      cancel_success: "Registration cancelled.",
      cancel_error: "Could not cancel. Please try again.",
      cancel_too_late_error: "Cannot cancel less than 4 hours before the class.",
      cancel_confirm: "Cancel your registration for this class?",
      cancel_confirm_full: "You are cancelling this class. If the class gets full, you will not be able to register again.",
      register_success_4h_note: "If you don't cancel at least 4 hours before the class starts, one class will be deducted from your pass automatically.",
      my_registrations_label: "Class Registrations",
      took_class_label: "Past classes",
      got_it: "Got it",
      cancel_confirm_yes: "Yes, cancel registration",
      go_back: "Go back",
      registered_title: "You're registered",
      unlimited_spots: "Open registration",
      week_of: "Week of {start} \u2013 {end}",
      class_registrations_title: "Class Registrations",
      no_registrations_yet: "No registrations this week",
      registered_count: "{n} registered",
      past_day: "Past",
      // Private classes
      private_classes_prompt: "Do you want private classes? Message us and we will give you all the information.",
      private_classes_btn: "I am interested",
      private_classes_contact_title: "Contact for Private Classes",
      message_whatsapp: "Message on WhatsApp",
      contact_not_configured: "Contact not configured. Please try again later.",
      private_contact_section: "Private Classes Contact",
      private_contact_desc: "Select which admin students see when they ask about private classes",
      my_profile_section: "My Profile",
      display_name_label: "Display Name",
      phone_label: "Phone (for WhatsApp)",
      change_password_section: "Change Password",
      current_password_label: "Current password",
      new_password_label: "New password",
      confirm_new_password_label: "Confirm new password",
      save_profile_btn: "Save Profile",
      change_password_btn: "Change Password",
      password_changed_success: "Password updated successfully.",
      auth_password_sync_failed: "Warning: the login service could not be updated. Use your OLD password to log in once, then change the password again in Settings.",
      admin_password_sync_hint: "Your password is correct for this school, but the login service could not accept it. If you recently changed your password in Settings, try logging in with your previous (old) password, then change it again.",
      admin_account_needs_activation: 'Your admin account was just created but the login service requires email confirmation. Ask your platform administrator to turn off "Confirm email" in Supabase: Authentication > Providers > Email. Then try logging in again.',
      admin_email_modal_title: "Add your email",
      admin_email_modal_msg: "For password reset and account security, please add your real email address. You will use this email to log in from now on.",
      admin_email_save: "Save",
      admin_email_later: "Later",
      admin_email_saved: "Email saved!",
      admin_email_invalid: "Please enter a valid email address.",
      profile_saved_success: "Profile saved.",
      password_mismatch: "New passwords do not match.",
      password_too_short: "Password must be at least 4 characters.",
      select_contact_admin: "Select contact",
      discovery_profile_section: "Discovery profile",
      discovery_offerings_section: "Offerings",
      discovery_slug_label: "URL slug",
      discovery_slug_placeholder: "e.g. royal_latin",
      discovery_upload_btn: "Upload",
      discovery_replace_title: "Replace image?",
      discovery_replace_message: "A photo is already set. Do you want to replace it with the new one?",
      discovery_replace_confirm: "Replace",
      discovery_logo_crop_title: "Crop logo for discovery",
      discovery_logo_crop_hint: "Position and zoom so your logo looks good in the square preview. This is how it will appear on the discovery page.",
      discovery_logo_crop_preview_label: "Preview on discovery page:",
      discovery_logo_crop_apply: "Apply",
      discovery_remove_image: "Remove",
      country_label: "Country",
      city_label: "City",
      school_name_label: "School name",
      address_label: "Address",
      discovery_description_label: "Description",
      discovery_genres_label: "Genres (comma-separated)",
      discovery_levels_label: "Levels (comma-separated)",
      logo_url_label: "Logo URL",
      teacher_photo_url_label: "Teacher photo URL",
      gallery_urls_label: "Gallery URLs (one per line)",
      discovery_locations_label: "Where we teach",
      discovery_location_name: "Salon / location name",
      discovery_location_address: "Address (required)",
      discovery_location_description: "Condition / description of the place",
      discovery_add_location: "Add location",
      discovery_remove_location: "Remove",
      discovery_where_we_teach: "Locations",
      save_discovery_btn: "Save discovery profile",
      discovery_preview_title: "Preview on Discover",
      show_discovery_preview_btn: "Show preview",
      hide_discovery_preview_btn: "Hide preview",
      discovery_saved: "Discovery profile saved",
      // Private Teacher / Booking
      profile_type_label: "Profile type",
      profile_type_school: "School",
      profile_type_private_teacher: "Private Teacher",
      teacher_availability_title: "Availability",
      add_availability: "Add availability",
      private_class_requests_title: "Private class requests",
      no_private_requests: "No requests yet",
      accept_btn: "Accept",
      decline_btn: "Decline",
      nav_book_class: "Book Class",
      book_class_title: "Book a Class",
      private_teacher_label: "Private Dance Teacher",
      session_label: "session",
      no_availability_this_week: "No availability this week",
      confirm_booking_btn: "Request this slot",
      confirm_request_title: "Confirm class request",
      teacher_label: "Teacher",
      date_label: "Date",
      time_label: "Time",
      location_label: "Location",
      price_label: "Price",
      message_label: "Message (optional)",
      booking_message_placeholder: "e.g. I'd like to focus on\u2026",
      send_request_btn: "Send request",
      request_sent_success: "Request sent! The teacher will review it.",
      confirm_btn: "Confirm",
      confirm_booking_title: "Confirm request",
      no_availability: "No availability",
      private_teacher_title: "Private Teacher",
      request_sent: "Request sent! The teacher will confirm.",
      request_sent_booking_title: "Request sent!",
      request_sent_booking_msg: "The teacher will confirm it.",
      need_package_to_book: "You need a package to request private classes",
      visit_shop_to_buy: "Visit the Shop to buy one.",
      my_private_classes: "My private classes",
      no_private_classes_yet: "No accepted private classes yet",
      accepted_private_classes: "Accepted private classes",
      calendar_view: "Calendar",
      no_accepted_private_classes: "No accepted private classes yet",
      today: "Today",
      no_classes_this_day: "No classes this day",
      month_jan: "Jan",
      month_feb: "Feb",
      month_mar: "Mar",
      month_apr: "Apr",
      month_may: "May",
      month_jun: "Jun",
      month_jul: "Jul",
      month_aug: "Aug",
      month_sep: "Sep",
      month_oct: "Oct",
      month_nov: "Nov",
      month_dec: "Dec"
    },
    es: {
      nav_schedule: "Horario",
      nav_shop: "Planes",
      nav_qr: "Mi Pase",
      nav_students: "Alumnos",
      nav_scan: "Escanear",
      nav_settings: "Ajustes",
      schedule_title: "Horario de Clases",
      shop_title: "Planes de Suscripci\xF3n",
      qr_title: "Tu Pase de Acceso",
      qr_subtitle: "Pres\xE9ntalo en la entrada del sal\xF3n",
      buy: "Comprar Ahora",
      active: "Acceso Permitido",
      inactive: "Pago Pendiente",
      pay_status: "Estado de Membres\xEDa",
      student_id: "ID de Miembro",
      no_subs: "Sin membres\xEDas activas",
      scan_success: "Verificaci\xF3n Exitosa",
      scan_fail: "Membres\xEDa Inactiva",
      scan_align_hint: "Centra el c\xF3digo QR en el marco",
      error_confirming_attendance: "Error al confirmar la asistencia",
      camera_not_found: "No se encontr\xF3 ninguna c\xE1mara. Conecta una c\xE1mara o usa un dispositivo con c\xE1mara integrada.",
      camera_permission_denied: "Acceso a la c\xE1mara denegado. Permite la c\xE1mara en la configuraci\xF3n del navegador.",
      switch_to_admin: "Ir a Admin",
      switch_to_student: "Ir a Alumno",
      auth_subtitle: "Eleva tu baile.",
      welcome_to: "Bienvenido a",
      student_signup: "Nuevo Alumno",
      admin_login: "Acceso Admin",
      full_name_placeholder: "Nombre completo",
      email_placeholder: "Correo electr\xF3nico",
      signup_require_fields: "Ingresa nombre completo, correo, tel\xE9fono y contrase\xF1a.",
      signup_email_login_hint: "Usar\xE1s este correo para iniciar sesi\xF3n.",
      email_already_registered: "Este correo ya est\xE1 en uso. Inicia sesi\xF3n o usa otro correo.",
      signup_invalid_email: "Ingresa un correo electr\xF3nico v\xE1lido.",
      confirm_password_placeholder: "Repetir contrase\xF1a",
      signup_passwords_dont_match: "Las contrase\xF1as no coinciden.",
      signup_btn: "Unirme Ahora",
      logout: "Cerrar Sesi\xF3n",
      admin_subtitle: "Gestiona tu academia",
      classes_subtitle: "Pr\xF3ximas sesiones y talleres",
      username: "Usuario",
      password: "Contrase\xF1a",
      login_btn: "Entrar",
      invalid_login: "Credenciales inv\xE1lidas",
      remaining_classes: "Clases Restantes",
      unlimited: "Ilimitado",
      already_account: "\xBFYa tienes cuenta?",
      no_account: "\xBFNo tienes cuenta?",
      sign_in: "Entrar",
      sign_up: "Registrarse",
      student_login: "Acceso Alumno",
      phone: "Tel\xE9fono",
      list_view: "Lista",
      weekly_view: "Plan Semanal",
      mon: "Lunes",
      tue: "Martes",
      wed: "Mi\xE9rcoles",
      thu: "Jueves",
      fri: "Viernes",
      sat: "S\xE1bado",
      sun: "Domingo",
      valid_for_days: "V\xE1lido por {days} d\xEDas",
      nav_memberships: "Membres\xEDas",
      pending_payments: "Pagos Pendientes",
      approve: "Aprobar",
      reject: "Rechazar",
      nav_revenue: "Ganancias",
      monthly_total: "Total este mes",
      all_payments: "Historial de pagos",
      approved: "Aprobado",
      rejected: "No Aprobado",
      pending: "Pendiente",
      transfer: "Transferencia",
      cash: "Efectivo",
      payment_instructions: "Instrucciones de Pago",
      i_have_paid: "Ya transfer\xED",
      pay_cash: "Pagar\xE9 en efectivo",
      request_sent_title: "\xA1Gracias por tu pago!",
      request_sent_msg: "Tu acceso ser\xE1 activado una vez que validemos el pago.",
      close: "Cerrar",
      one_class: "1 Clase",
      two_classes: "2 Clases",
      class_unit: "clase",
      classes_unit: "clases",
      event_unit: "evento",
      events_unit: "eventos",
      custom_classes_label: "Otra cantidad",
      deduct_btn: "Descontar",
      deduct_invalid_amount: "Indica 1 o m\xE1s clases a descontar.",
      cancel: "Cancelar",
      confirm_attendance: "Confirmar Asistencia",
      attendance_success: "\xA1Asistencia confirmada!",
      no_classes_buy_package: "Este alumno no tiene clases. Debe comprar un nuevo paquete.",
      admin_user_placeholder: "Usuario Admin",
      admin_email_placeholder: "Email Admin",
      admin_pass_placeholder: "Contrase\xF1a Admin",
      admin_login_btn: "Inicia Sesi\xF3n Admin",
      admin_access_trigger: "\u2022 ACCESO ADMIN \u2022",
      add_student: "Alumno",
      add_admin: "Administrador",
      status_active: "Activo",
      status_unpaid: "Impago",
      balance_label: "Saldo",
      plan_label: "Plan",
      none_label: "Ninguno",
      mark_paid: "Marcar como Pagado",
      mark_unpaid: "Marcar como Impago",
      history_label: "Historial",
      scan_cta_desc: "Verifica la precisi\xF3n de la entrada.",
      initiate_scan_btn: "Iniciar Escaneo",
      classes_label: "Clases",
      add_label: "A\xF1adir",
      plans_label: "Planes",
      plans_section_group: "Clases grupales",
      plans_section_private: "Clases particulares",
      plans_section_mixed: "Clases mixtas",
      plans_section_sociales: "Sociales (eventos)",
      limit_classes_label: "L\xEDmite de Clases",
      limit_classes_placeholder: "Clases (0 = Ilimitado)",
      offer_private_classes: "Ofrecer clases particulares",
      offer_private_classes_desc: "Permite que los alumnos compren y usen paquetes de clases particulares. Cuando est\xE1 activo, los planes pueden incluir clases en grupo, particulares o ambas.",
      offer_events: "Ofrecer eventos",
      offer_events_desc: "Permite que los alumnos compren y usen tokens de eventos. Cuando est\xE1 activo, los planes pueden incluir grupo, particulares y eventos.",
      events: "Eventos",
      events_remaining: "Eventos",
      deduct_one_event: "Descontar 1 evento",
      group_classes: "Grupal",
      private_classes: "Particular",
      group_classes_remaining: "Grupal",
      private_classes_remaining: "Particular",
      scan_mode_group: "Grupal",
      scan_mode_private: "Particular",
      deduct_group_classes: "Descontar clases grupales",
      deduct_private_classes: "Descontar clases particulares",
      price_mxd_label: "Precio MXD",
      transfer_details_label: "Detalles de Transferencia",
      bank_name_label: "Nombre del banco",
      account_number_label: "Numero de cuenta",
      holder_name_label: "Nombre del titular",
      asunto_label: "Asunto",
      save_bank_btn: "Guardar Detalles",
      saved_success_msg: "\xA1Guardado con \xE9xito!",
      balance_manual_label: "Saldo Manual",
      no_classes_msg: "Sin clases",
      select_plan_msg: "Selecciona tu plan de membres\xEDa.",
      delete_student_confirm: "\xBFEst\xE1s seguro de eliminar a este alumno? Se perder\xE1 todo su progreso.",
      not_found_msg: "No Encontrado",
      not_enough_balance: "\xA1No hay suficientes clases disponibles!",
      enter_admin_user: "Ingresa el nombre de usuario del admin:",
      enter_admin_pass: "Ingresa la contrase\xF1a del admin:",
      admin_created: "\xA1Admin creado!",
      add_admin_modal_title: "Agregar administrador",
      add_admin_modal_subtitle: "Crea un nuevo administrador para tu escuela",
      add_admin_success_title: "Administrador agregado",
      add_admin_success_text: "El nuevo administrador ya puede iniciar sesi\xF3n con el email y la contrase\xF1a que configuraste.",
      add_admin_btn: "Agregar",
      enter_student_name: "Ingresa el nombre del alumno:",
      enter_student_phone: "Ingresa el tel\xE9fono del alumno:",
      enter_student_email: "Ingresa el email del alumno (opcional):",
      enter_student_pass: "Ingresa la contrase\xF1a del alumno:",
      student_created: "\xA1Alumno creado!",
      unknown_student: "Alumno Desconocido",
      delete_payment_confirm: "\xBFEliminar este registro de pago permanentemente?",
      select_school_subtitle: "Por favor selecciona tu escuela o profesor para continuar",
      discover_dance_btn: "Descubre todas las escuelas",
      discovery_title: "Descubre la danza",
      discovery_subtitle: "Encuentra estudios y profesores cerca de ti",
      discovery_back: "Volver a todos los estudios",
      discovery_register_title: "Crear cuenta",
      discovery_register_subtitle: "Reg\xEDstrate como bailar\xEDn independiente",
      discovery_login_title: "Iniciar sesi\xF3n",
      discovery_login_subtitle: "Inicia sesi\xF3n en tu cuenta de bailar\xEDn",
      discovery_already_have_account: "\xBFYa tienes cuenta?",
      discovery_no_account: "\xBFNo tienes cuenta?",
      discovery_confirm_email_banner: "Confirma tu correo para desbloquear rese\xF1as y agregar escuelas.",
      discovery_review_gate_login: "Inicia sesi\xF3n para dejar una rese\xF1a o sugerir una escuela.",
      resend_verification: "Reenviar correo de verificaci\xF3n",
      resend_sending: "Enviando\u2026",
      resend_cooldown: "Enviado. Espera 60 s",
      resend_success: "Revisa tu correo",
      resend_error: "No se pudo enviar. Intenta de nuevo.",
      nav_profile: "Perfil",
      discovery_no_schools: "A\xFAn no hay estudios publicados.",
      discovery_tab_schools: "Estudios",
      discovery_tab_private_teachers: "Profesores privados",
      discovery_no_teachers: "A\xFAn no hay profesores privados publicados.",
      discovery_filter_dance: "Estilo de baile",
      discovery_filter_country: "Pa\xEDs",
      discovery_filter_city: "Ciudad",
      discovery_filter_all: "Todos",
      discovery_not_found: "Este estudio a\xFAn no tiene p\xE1gina de detalle.",
      discovery_sign_in_btn: "Iniciar sesi\xF3n",
      discovery_not_on_app: "Esta escuela no utiliza Bailadmin. Por favor contacta a la escuela directamente.",
      discovery_sign_in_edit_profile: "Iniciar sesi\xF3n para editar el perfil de tu estudio",
      discovery_back_to_page: "Volver a la p\xE1gina de descubrimiento",
      discovery_studio_admin_signin: "\xBFEres administrador? Inicia sesi\xF3n",
      discovery_pick_school_to_signin: "Elige tu estudio para iniciar sesi\xF3n y editar tu perfil de descubrimiento.",
      discovery_admin_signin_title: "Editar perfil de descubrimiento",
      discovery_admin_signin_subtitle: "Este estudio solo aparece en la p\xE1gina de descubrimiento. Inicia sesi\xF3n con tu correo y contrase\xF1a de administrador.",
      discovery_placeholder_upload_soon: "Se subir\xE1 pronto.",
      discovery_location: "Ubicaci\xF3n",
      discovery_classes: "Clases",
      discovery_packages: "Paquetes",
      discovery_gallery: "Galer\xEDa",
      add_school_btn: "Nueva Escuela",
      enter_school_name: "Ingresa el nombre de la nueva escuela o profesor:",
      school_created: "\xA1Escuela creada con \xE9xito!",
      switch_school: "Cambiar Escuela",
      welcome_classes: "Bienvenido a las clases de",
      loading: "Cargando...",
      select_school_placeholder: "Elige tu escuela...",
      search_school_placeholder: "Escribe o elige escuela...",
      dropdown_schools: "Escuelas",
      dropdown_private_teachers: "Profesores privados",
      dropdown_country_other: "Otro",
      loading_schools: "Cargando academias...",
      loading_dashboard: "Cargando...",
      no_schools: "No hay academias",
      could_not_load_schools: "No se pudieron cargar las academias",
      retry: "Reintentar",
      connecting: "Iniciando conexi\xF3n...",
      dev_access_title: "Acceso Dev",
      dev_access_subtitle: "Ingresa credenciales de desarrollador",
      footer_support: "Soporte",
      footer_contact: "Contacto",
      footer_copy: "Hecho con <3 por un salsero; \xA9 2026 Bailadmin Systems.",
      dev_login_btn: "Entrar",
      dev_dashboard_title: "Plataforma Dev",
      dev_school_inspector: "Inspector de Escuela",
      dev_active_schools: "Escuelas Activas",
      school_active: "Activa",
      school_inactive: "Inactiva",
      activate_school: "Activar",
      deactivate_school: "Desactivar",
      school_on_platform: "En la plataforma",
      school_on_discovery: "En discover",
      dev_stats_schools: "Escuelas",
      dev_stats_students: "Total Alumnos",
      dev_stats_plans: "Planes",
      dev_tab_schools: "Escuelas",
      dev_tab_account_audit: "Auditor\xEDa de cuentas",
      dev_audit_students: "Alumnos",
      dev_audit_admins: "Administradores",
      dev_audit_linked: "Vinculado",
      dev_audit_not_linked: "No vinculado",
      dev_audit_user_id: "user_id",
      dev_stats_classes: "Clases",
      dev_view_details: "Ver Detalles",
      dev_enter_as_admin: "Entrar como Admin",
      dev_edit_discovery_profile: "Editar perfil Discovery",
      dev_discovery_profile_desc: "Slug, ubicaci\xF3n, descripci\xF3n, g\xE9neros, logo, ubicaciones",
      dev_edit_school_info: "Editar datos de la escuela",
      dev_save_school_info: "Guardar",
      dev_school_info_desc: "Nombre y direcci\xF3n",
      dev_school_info_saved: "Informaci\xF3n de la escuela guardada.",
      dev_events_packages_feature: "Eventos como paquetes",
      dev_events_packages_feature_desc: "Permitir a esta escuela ofrecer eventos en paquetes (el admin puede activarlo en Ajustes)",
      dev_private_packages_feature: "Clases privadas como paquetes",
      dev_private_packages_feature_desc: "Permitir a esta escuela ofrecer clases privadas en paquetes (el admin puede activarlo en Ajustes)",
      dev_monthly_registration_feature: "Inscripci\xF3n mensual a clases",
      dev_monthly_registration_feature_desc: "Permitir a esta escuela ofrecer inscripci\xF3n mensual (inscribirse a todas las clases del mes)",
      offer_monthly_registration: "Ofrecer inscripci\xF3n mensual",
      offer_monthly_registration_desc: "Los estudiantes pueden inscribirse a todas las clases restantes de un curso en el mes actual de una vez.",
      register_single: "Inscribirse solo a esta clase",
      register_monthly: "Inscribirse a las {n} clases de este mes",
      monthly_badge: "Mensual",
      monthly_balance_insufficient: "Necesitas al menos {n} clases para inscribirte al mes completo.",
      monthly_registration_success: "\xA1Te inscribiste exitosamente a {n} clases este mes!",
      monthly_capacity_full: "La clase est\xE1 llena el {date}. No se puede completar la inscripci\xF3n mensual.",
      fixed_expiry_date_label: "Fecha de vencimiento fija (opcional)",
      plan_expiry_display_title: "Vencimiento de los planes",
      plan_expiry_display_desc: "Elige c\xF3mo se muestra el vencimiento en cada plan y a los alumnos.",
      plan_expiry_option_date: "Fecha de vencimiento fija",
      plan_expiry_option_date_hint: "ej. 28.02.2026",
      plan_expiry_option_days: "Validez en d\xEDas",
      plan_expiry_option_days_hint: "ej. 30 d\xEDas",
      plan_expiry_fixed_date_label: "Usar fecha de vencimiento fija",
      plan_expiry_fixed_date_desc: "Activado: En los planes y para los alumnos se muestra una fecha fija (ej. 28.02.2026). Desactivado: Se muestra la validez en d\xEDas (ej. 30 d\xEDas restantes).",
      dev_events_feature: "Jack and Jill / Eventos",
      dev_events_feature_desc: "Permitir a esta escuela crear eventos Jack and Jill (funci\xF3n premium)",
      dev_events_enabled: "Activado",
      dev_events_disabled: "Desactivado",
      jack_and_jill_upgrade_msg: "Para crear eventos necesitas actualizar a un paquete que incluya esta funci\xF3n.",
      dev_volver_dashboard: "Volver al Dashboard",
      dev_admins_label: "Administradores",
      dev_students_label: "Alumnos",
      dev_discovery_site: "Sitio Discovery",
      dev_discovery_toggle_on: "Activado",
      dev_discovery_toggle_off: "Desactivado",
      dev_discovery_profiles: "Perfiles Discovery",
      dev_open_ajustes: "Abrir Ajustes",
      dev_edit_in_dashboard: "Ver / Editar",
      dev_plans_label: "Cat\xE1logo de Planes",
      dev_classes_label: "Horarios y Clases",
      dev_no_admins: "Sin administradores",
      dev_no_students: "Sin alumnos registrados",
      dev_no_plans: "Sin planes definidos",
      dev_no_classes: "Sin clases configuradas",
      password_label: "Contrase\xF1a",
      delete_school_btn: "Eliminar Escuela",
      rename_school_btn: "Renombrar",
      rename_school_prompt: "Ingresa el nuevo nombre de la escuela:",
      rename_school_success: "Nombre de escuela actualizado.",
      delete_school_confirm: "\xBFEst\xE1s seguro de que quieres eliminar esta escuela? TODOS los datos (alumnos, admins, pagos, clases) se perder\xE1n permanentemente.",
      delete_school_success: "Escuela eliminada con \xE9xito",
      add_school_title: "Crear Nueva Escuela",
      school_info_section: "Detalles de la Academia",
      admin_info_section: "Administrador Inicial",
      admin_name_label: "Nombre del admin",
      admin_email_label: "Email",
      admin_email_not_set: "No configurado",
      enter_admin_email: "Por favor ingresa un email.",
      dev_discovery_optional: "Perfil Discovery (opcional)",
      create_school_btn: "Ejecutar Inicializaci\xF3n",
      username_exists_msg: "Este usuario ya est\xE1 en uso. Por favor elige otro.",
      class_location: "Ubicaci\xF3n",
      location_placeholder: "Ej: Aula A",
      active_packs_label: "Tus Paquetes Activos",
      all_schools_packs_label: "Tus Paquetes en Todas las Escuelas",
      no_packs_any_school: "No tienes paquetes activos en ninguna escuela",
      expired_classes_label: "Clases Expiradas",
      used_packs_label: "Paquetes usados",
      no_expiration: "Sin fecha de vencimiento",
      expires_in: "Vence en",
      days_left: "d\xEDas restantes",
      expires_label: "Vence",
      search_students: "Buscar alumnos...",
      filter_all: "Todos",
      filter_with_pack: "Con paquete activo",
      filter_no_pack: "Sin paquete activo",
      filter_package_type: "Paquetes",
      filter_this_month: "Este mes",
      filter_status: "Estado",
      filter_method: "M\xE9todo",
      filter_paid: "Pagado",
      filter_unpaid: "Sin pagar",
      filter_result_students: "{count} alumnos",
      filter_result_payments: "{count} pagos",
      filter_label_pack: "Paquete",
      filter_label_package: "Plan",
      filter_label_payment: "Pago",
      filters_label: "Filtros",
      period_total: "Total del per\xEDodo",
      loading_students_msg: "Cargando alumnos...",
      no_pending_msg: "Sin pagos pendientes",
      refresh_btn: "Actualizar",
      historical_total_label: "Hist\xF3rico",
      no_data_msg: "No hay datos",
      mgmt_classes_title: "Gesti\xF3n de Clases",
      mgmt_admins_title: "Administradores",
      day_label: "D\xEDa",
      hour_label: "Hora",
      start_time_label: "Inicio",
      end_time_label: "Fin",
      level_tag_label: "Nivel",
      new_class_label: "Nueva Clase",
      show_weekly_btn: "Ver Plan Semanal",
      hide_weekly_btn: "Ocultar Plan Semanal",
      weekly_preview_title: "Vista Previa (Semanal)",
      full_name_label: "Nombre Completo",
      total_classes_label: "Clases Restantes (Total)",
      pack_details_title: "Paquetes Detalles",
      reg_date_label: "Fecha de Registro",
      next_expiry_label: "Pr\xF3ximo Vencimiento",
      delete_perm_label: "Eliminar Alumno permanentemente",
      admin_pass_req: "Password Admin Requerido:",
      leave_blank_keep: "dejar en blanco para mantener",
      invalid_pass_msg: "Contrase\xF1a Incorrecta.",
      save_btn: "Guardar",
      saving_label: "Guardando\u2026",
      save_schedule_btn: "Guardar horario",
      save_plans_btn: "Guardar planes",
      remove_admin_confirm: "\xBFEst\xE1s seguro de que quieres eliminar a este administrador?",
      admin_removed: "Administrador eliminado con \xE9xito.",
      error_creating_admin: "Error al crear administrador:",
      admin_add_need_linked_session: "Para agregar administradores debes iniciar sesi\xF3n con tu cuenta vinculada. Cierra sesi\xF3n e inicia de nuevo con tu usuario y contrase\xF1a.",
      error_removing_admin: "Error al eliminar administrador:",
      additional_features: "Funciones adicionales",
      settings_account_admin_label: "Perfil, contrase\xF1a, administradores y m\xE1s",
      create_new_competition: "Crear nueva competencia",
      jack_and_jill: "Jack and Jill",
      competition_date: "Fecha",
      competition_time: "Hora",
      competition_name: "Nombre del evento",
      competition_questions: "Preguntas del organizador",
      competition_add_question: "A\xF1adir pregunta",
      competition_next_steps: "Pr\xF3ximos pasos (para alumnos)",
      competition_activate_event: "Activar evento",
      competition_activate_signin: "Activar registro",
      competition_for_event: "Para evento",
      competition_saved: "Competencia guardada correctamente.",
      competition_error: "Error al guardar la competencia.",
      competition_registrations: "Registros",
      competition_publish_decisions: "Publicar decisi\xF3n",
      competition_republish_decisions: "Republicar decisiones",
      competition_confirm_publish: "\xBFEst\xE1s seguro?",
      competition_approve: "Aprobar",
      competition_decline: "Rechazar",
      register_for_event: "Registrarse para {eventName}",
      reviewing_application: "Estamos revisando tu solicitud",
      accepted: "Aceptado",
      declined: "Rechazado",
      competition_approved_message: '\xA1Felicidades! Vas a competir en "{eventName}"',
      competition_declined_message: "Esta vez no puedes competir, pero te esperamos la pr\xF3xima vez.",
      submit_registration: "Enviar registro",
      competition_reg_opens_soon: "Inscripciones pr\xF3ximamente",
      competition_edit_tab: "Editar",
      no_existing_events: "No hay eventos.",
      no_events_linked_hint: 'Si creaste eventos antes, vincula tu cuenta: ve a Alumnos \u2192 usa la tarjeta "Link account", o cierra sesi\xF3n e inicia de nuevo con tu usuario y contrase\xF1a de admin.',
      add_new_event: "A\xF1adir nuevo evento",
      competition_view_answers: "Ver respuestas",
      competition_answers: "Respuestas",
      competition_answer: "Respuesta",
      competition_no_answers: "A\xFAn no hay respuestas.",
      competition_registration_not_found: "Registro no encontrado. Vuelve atr\xE1s y abre Registros de nuevo.",
      competition_delete_confirm: "\xBFEliminar este evento? Se borrar\xE1n todas las inscripciones.",
      competition_copy: "Copiar",
      competition_copy_of: "Copia de ",
      competition_confirm_copy: '\xBFCrear copia como "{name}"? El nuevo evento estar\xE1 inactivo.',
      competition_copy_success: "Evento copiado.",
      competition_done: "Listo",
      competition_saved_indicator: "Guardado",
      competition_saving: "Guardando...",
      competition_next_steps_placeholder: "Ej: Sin cortes, c\xE1mara fija, buena iluminaci\xF3n...",
      competition_video_submission_toggle: "\xBFIncluir env\xEDo de video?",
      competition_video_prompt_label: "Texto de la pregunta de video",
      competition_video_prompt_placeholder: "Sube tu video demo",
      competition_video_duration_error: "El video debe durar 2-3 minutos",
      competition_video_size_error: "Archivo demasiado grande (m\xE1x. 50 MB)",
      competition_video_uploading: "Subiendo...",
      competition_video_uploaded: "Video subido",
      competition_video_unavailable: "Video no disponible",
      // Class Registration
      nav_my_classes: "Mis Clases",
      register_for_class: "Registrarse en esta clase",
      join_class: "Unirme",
      cancel_registration: "Cancelar registro",
      class_full: "Clase llena",
      full_label: "Llena",
      class_already_started: "La clase ya comenz\xF3",
      spots_left: "{n} lugares disponibles",
      only_n_spots: "Solo quedan {n} lugares!",
      registered: "Registrado",
      registered_check: "Est\xE1s registrado/a",
      cancel_before_deadline: "Cancela hasta 4h antes de la clase",
      cannot_cancel_deadline: "Plazo de cancelaci\xF3n vencido",
      auto_deducted: "Clase descontada autom\xE1ticamente",
      registered_for_class_msg: "Registrado en {className} a las {time}",
      no_manual_deduction: "No se necesita descuento manual",
      my_classes_title: "Mis Clases",
      my_classes_subtitle: "Tus registros pr\xF3ximos y pasados",
      upcoming_classes: "Pr\xF3ximas",
      past_classes: "Clases pasadas",
      no_upcoming: "No hay registros pr\xF3ximos",
      no_past_classes: "No hay historial de clases",
      cancelled: "Cancelado",
      attended: "Asisti\xF3",
      no_show: "No asisti\xF3",
      registration_enabled: "Registro de clases",
      registration_enabled_desc: "Permitir que los alumnos se registren para horarios espec\xEDficos",
      max_students: "M\xE1x. alumnos",
      max_students_placeholder: "ej. 20",
      confirm_attendance_registered: "Confirmar asistencia",
      class_will_deduct: "Se descontar\xE1 1 clase de su paquete",
      student_registered_for: "Registrado en",
      register_success: "Registro exitoso!",
      register_error: "No se pudo registrar. Intenta de nuevo.",
      cancel_success: "Registro cancelado.",
      cancel_error: "No se pudo cancelar. Intenta de nuevo.",
      cancel_too_late_error: "No se puede cancelar con menos de 4 horas antes del inicio de la clase.",
      cancel_confirm: "\xBFCancelar tu registro para esta clase?",
      cancel_confirm_full: "Est\xE1s cancelando esta clase. Si la clase se llena, no podr\xE1s inscribirte de nuevo.",
      register_success_4h_note: "Si no cancelas al menos 4 horas antes del inicio de la clase, se descontar\xE1 una clase de tu pase autom\xE1ticamente.",
      my_registrations_label: "Registros de clases",
      took_class_label: "Clases pasadas",
      got_it: "Entendido",
      cancel_confirm_yes: "S\xED, cancelar registro",
      go_back: "Volver",
      registered_title: "Est\xE1s registrado/a",
      unlimited_spots: "Registro abierto",
      week_of: "Semana del {start} al {end}",
      class_registrations_title: "Registros de clases",
      no_registrations_yet: "Sin registros esta semana",
      registered_count: "{n} registrados",
      past_day: "Pasado",
      // Private classes
      private_classes_prompt: "\xBFQuieres clases particulares? Escr\xEDbenos y te damos toda la informaci\xF3n.",
      private_classes_btn: "Me interesa",
      private_classes_contact_title: "Contacto para Clases Particulares",
      message_whatsapp: "Escribir por WhatsApp",
      contact_not_configured: "Contacto no configurado. Intenta m\xE1s tarde.",
      private_contact_section: "Contacto Clases Particulares",
      private_contact_desc: "Selecciona qu\xE9 admin ven los alumnos al preguntar por clases particulares",
      my_profile_section: "Mi Perfil",
      display_name_label: "Nombre para mostrar",
      phone_label: "Tel\xE9fono (para WhatsApp)",
      change_password_section: "Cambiar Contrase\xF1a",
      current_password_label: "Contrase\xF1a actual",
      new_password_label: "Nueva contrase\xF1a",
      confirm_new_password_label: "Confirmar nueva contrase\xF1a",
      save_profile_btn: "Guardar Perfil",
      change_password_btn: "Cambiar Contrase\xF1a",
      password_changed_success: "Contrase\xF1a actualizada.",
      auth_password_sync_failed: "Aviso: el servicio de inicio de sesi\xF3n no pudo actualizarse. Usa tu contrase\xF1a ANTERIOR para entrar una vez, luego c\xE1mbiala de nuevo en Ajustes.",
      admin_password_sync_hint: "Tu contrase\xF1a es correcta para esta escuela, pero el servicio de inicio de sesi\xF3n no la acept\xF3. Si cambiaste la contrase\xF1a en Ajustes, intenta entrar con tu contrase\xF1a anterior y c\xE1mbiala de nuevo.",
      admin_account_needs_activation: 'Tu cuenta de administrador acaba de crearse, pero el servicio de inicio de sesi\xF3n exige confirmar el correo. Pide al administrador de la plataforma que desactive "Confirmar email" en Supabase: Autenticaci\xF3n > Proveedores > Email. Luego intenta entrar de nuevo.',
      admin_email_modal_title: "Agrega tu correo",
      admin_email_modal_msg: "Para recuperar tu contrase\xF1a y mayor seguridad, agrega tu correo electr\xF3nico real. Usar\xE1s este correo para iniciar sesi\xF3n de ahora en adelante.",
      admin_email_save: "Guardar",
      admin_email_later: "Despu\xE9s",
      admin_email_saved: "\xA1Correo guardado!",
      admin_email_invalid: "Ingresa un correo electr\xF3nico v\xE1lido.",
      profile_saved_success: "Perfil guardado.",
      password_mismatch: "Las contrase\xF1as no coinciden.",
      password_too_short: "La contrase\xF1a debe tener al menos 4 caracteres.",
      select_contact_admin: "Seleccionar contacto",
      discovery_profile_section: "Perfil Discovery",
      discovery_offerings_section: "Oferta",
      discovery_slug_label: "Slug URL",
      discovery_slug_placeholder: "ej. royal_latin",
      discovery_upload_btn: "Subir",
      discovery_replace_title: "\xBFReemplazar imagen?",
      discovery_replace_message: "Ya hay una foto. \xBFQuieres reemplazarla por la nueva?",
      discovery_replace_confirm: "Reemplazar",
      discovery_logo_crop_title: "Recortar logo para discovery",
      discovery_logo_crop_hint: "Posiciona y haz zoom para que tu logo se vea bien en el recuadro. As\xED se mostrar\xE1 en la p\xE1gina de discovery.",
      discovery_logo_crop_preview_label: "Vista previa en discovery:",
      discovery_logo_crop_apply: "Aplicar",
      discovery_remove_image: "Quitar",
      country_label: "Pa\xEDs",
      city_label: "Ciudad",
      school_name_label: "Nombre de la escuela",
      address_label: "Direcci\xF3n",
      discovery_description_label: "Descripci\xF3n",
      discovery_genres_label: "G\xE9neros (separados por coma)",
      discovery_levels_label: "Niveles (separados por coma)",
      logo_url_label: "URL del logo",
      teacher_photo_url_label: "URL foto del profesor",
      gallery_urls_label: "URLs de galer\xEDa (una por l\xEDnea)",
      discovery_locations_label: "D\xF3nde damos clase",
      discovery_location_name: "Nombre del sal\xF3n / lugar",
      discovery_location_address: "Direcci\xF3n (obligatoria)",
      discovery_location_description: "Estado / descripci\xF3n del lugar",
      discovery_add_location: "A\xF1adir ubicaci\xF3n",
      discovery_remove_location: "Quitar",
      discovery_where_we_teach: "Ubicaciones",
      save_discovery_btn: "Guardar perfil Discovery",
      discovery_preview_title: "Vista previa en Discover",
      show_discovery_preview_btn: "Ver vista previa",
      hide_discovery_preview_btn: "Ocultar vista previa",
      discovery_saved: "Perfil Discovery guardado.",
      profile_type_label: "Tipo de perfil",
      profile_type_school: "Escuela",
      profile_type_private_teacher: "Profesor privado",
      teacher_availability_title: "Disponibilidad",
      add_availability: "A\xF1adir disponibilidad",
      private_class_requests_title: "Solicitudes de clases privadas",
      no_private_requests: "A\xFAn no hay solicitudes",
      accept_btn: "Aceptar",
      decline_btn: "Rechazar",
      nav_book_class: "Reservar clase",
      session_label: "sesi\xF3n",
      no_availability: "Sin disponibilidad",
      confirm_btn: "Confirmar",
      confirm_booking_title: "Confirmar solicitud",
      private_teacher_title: "Profesor privado",
      request_sent: "\xA1Solicitud enviada! El profesor la confirmar\xE1.",
      request_sent_booking_title: "\xA1Solicitud enviada!",
      request_sent_booking_msg: "El profesor la confirmar\xE1.",
      need_package_to_book: "Necesitas un paquete para solicitar clases privadas",
      visit_shop_to_buy: "Visita la tienda para comprar uno.",
      my_private_classes: "Mis clases privadas",
      no_private_classes_yet: "A\xFAn no hay clases privadas aceptadas",
      accepted_private_classes: "Clases privadas aceptadas",
      calendar_view: "Calendario",
      no_accepted_private_classes: "A\xFAn no hay clases privadas aceptadas",
      today: "Hoy",
      no_classes_this_day: "No hay clases este d\xEDa",
      profile_settings: "Perfil",
      linked_schools: "Escuelas vinculadas",
      no_schools_linked: "A\xFAn no hay escuelas vinculadas.",
      verified: "Verificado",
      not_verified: "No verificado",
      first_name: "Nombre",
      last_name: "Apellido",
      email: "Correo electr\xF3nico",
      city: "Ciudad",
      country: "Pa\xEDs",
      save: "Guardar",
      instagram: "Instagram",
      instagram_placeholder: "@usuario"
    },
    de: {
      nav_schedule: "Stundenplan",
      nav_shop: "Abos",
      nav_qr: "Mein QR",
      nav_students: "Sch\xFCler",
      nav_scan: "Scan",
      nav_settings: "Einstellungen",
      schedule_title: "Kursplan",
      shop_title: "Abonnements",
      qr_title: "Dein Zugangspass",
      qr_subtitle: "Zeige diesen am Studio-Eingang vor",
      buy: "Jetzt kaufen",
      active: "Zugang gew\xE4hrt",
      inactive: "Zahlung erforderlich",
      pay_status: "Mitgliedschaftsstatus",
      student_id: "Mitglieder-ID",
      admin_label: "Admin",
      no_subs: "Keine aktiven Mitgliedschaften gefunden",
      scan_success: "Verifizierung erfolgreich",
      scan_fail: "Mitgliedschaft inaktiv",
      scan_align_hint: "QR-Code im Rahmen ausrichten",
      error_confirming_attendance: "Fehler beim Best\xE4tigen der Anwesenheit",
      camera_not_found: "Keine Kamera gefunden. Verbinde eine Kamera oder verwende ein Ger\xE4t mit integrierter Kamera.",
      camera_permission_denied: "Kamerazugriff verweigert. Bitte erlaube die Kamera in den Browser-Einstellungen.",
      switch_to_admin: "Zum Admin",
      switch_to_student: "Zum Sch\xFCler",
      auth_subtitle: "Pr\xE4zision in jedem Schritt.",
      welcome_to: "Willkommen bei",
      student_signup: "Neuer Sch\xFCler",
      admin_login: "Admin-Login",
      full_name_placeholder: "Vollst\xE4ndiger Name",
      email_placeholder: "E-Mail-Adresse",
      signup_require_fields: "Bitte gib Name, E-Mail, Telefon und Passwort ein.",
      signup_email_login_hint: "Du wirst diese E-Mail zum Anmelden verwenden.",
      email_already_registered: "Diese E-Mail ist bereits registriert. Melde dich an oder verwende eine andere E-Mail.",
      signup_invalid_email: "Bitte gib eine g\xFCltige E-Mail-Adresse ein.",
      confirm_password_placeholder: "Passwort best\xE4tigen",
      signup_passwords_dont_match: "Die Passw\xF6rter stimmen nicht \xFCberein.",
      signup_btn: "Jetzt beitreten",
      logout: "Abmelden",
      admin_subtitle: "Verwalte dein Studio effizient",
      classes_subtitle: "Kommende Kurse und Workshops",
      username: "Benutzername",
      password: "Passwort",
      login_btn: "Login",
      invalid_login: "Ung\xFCltige Anmeldedaten",
      remaining_classes: "Verbleibende Stunden",
      unlimited: "Unbegrenzt",
      already_account: "Hast du bereits ein Konto?",
      no_account: "Noch kein Konto?",
      sign_in: "Anmelden",
      sign_up: "Registrieren",
      student_login: "Sch\xFCler-Login",
      phone: "Telefonnummer",
      list_view: "Listenansicht",
      weekly_view: "Wochenplan",
      mon: "Montag",
      tue: "Dienstag",
      wed: "Mittwoch",
      thu: "Donnerstag",
      fri: "Freitag",
      sat: "Samstag",
      sun: "Sonntag",
      valid_for_days: "G\xFCltig f\xFCr {days} Tage",
      nav_memberships: "Mitgliedschaften",
      pending_payments: "Ausstehende Zahlungen",
      approve: "Best\xE4tigen",
      reject: "Ablehnen",
      nav_revenue: "Einnahmen",
      monthly_total: "Gesamt diesen Monat",
      all_payments: "Zahlungsverlauf",
      approved: "Best\xE4tigt",
      rejected: "Abgelehnt",
      pending: "Ausstehend",
      transfer: "\xDCberweisung",
      cash: "Barzahlung",
      payment_instructions: "Zahlungsanweisungen",
      i_have_paid: "Ich habe \xFCberwiesen",
      pay_cash: "Ich zahle bar",
      request_sent_title: "Anfrage gesendet!",
      request_sent_msg: "Dein Zugang wird aktiviert, sobald wir die Zahlung gepr\xFCft haben.",
      close: "Schlie\xDFen",
      one_class: "1 Stunde",
      two_classes: "2 Stunden",
      class_unit: "Stunde",
      classes_unit: "Stunden",
      event_unit: "Event",
      events_unit: "Events",
      custom_classes_label: "Anzahl",
      deduct_btn: "Abziehen",
      deduct_invalid_amount: "Gib 1 oder mehr Stunden zum Abziehen ein.",
      cancel: "Abbrechen",
      confirm_attendance: "Anwesenheit best\xE4tigen",
      attendance_success: "Anwesenheit best\xE4tigt!",
      no_classes_buy_package: "Dieser Sch\xFCler hat keine Stunden mehr. Bitte neues Paket kaufen.",
      admin_user_placeholder: "Admin Benutzername",
      admin_email_placeholder: "Admin E-Mail",
      admin_pass_placeholder: "Admin Passwort",
      admin_login_btn: "Admin Login",
      admin_access_trigger: "\u2022 ADMIN ZUGANG \u2022",
      add_student: "Sch\xFCler",
      add_admin: "Administrator",
      status_active: "Aktiv",
      status_unpaid: "Unbezahlt",
      balance_label: "Guthaben",
      plan_label: "Plan",
      none_label: "Keiner",
      mark_paid: "Als bezahlt markieren",
      mark_unpaid: "Als unbezahlt markieren",
      history_label: "Verlauf",
      scan_cta_desc: "Verifiziere den Studio-Zugang.",
      initiate_scan_btn: "Scan starten",
      classes_label: "Kurse",
      add_label: "Hinzuf\xFCgen",
      plans_label: "Pl\xE4ne",
      plans_section_group: "Gruppenstunden",
      plans_section_private: "Privatstunden",
      plans_section_mixed: "Gemischt",
      plans_section_sociales: "Sociales (Events)",
      limit_classes_label: "Stundenlimit",
      limit_classes_placeholder: "Stunden (0 = Unbegrenzt)",
      offer_private_classes: "Privatunterricht anbieten",
      offer_private_classes_desc: "Erm\xF6glicht Sch\xFClern den Kauf und die Nutzung von Privatstunden-Paketen. Wenn aktiv, k\xF6nnen Pl\xE4ne Gruppen-, Privatstunden oder beides enthalten.",
      offer_events: "Events anbieten",
      offer_events_desc: "Erm\xF6glicht Sch\xFClern den Kauf und die Nutzung von Event-Tokens. Wenn aktiv, k\xF6nnen Pl\xE4ne Gruppen-, Privat- und Event-Anzahl enthalten.",
      events: "Events",
      events_remaining: "Events",
      deduct_one_event: "1 Event abziehen",
      group_classes: "Gruppe",
      private_classes: "Privat",
      group_classes_remaining: "Gruppe",
      private_classes_remaining: "Privat",
      scan_mode_group: "Gruppe",
      scan_mode_private: "Privat",
      deduct_group_classes: "Gruppenstunden abziehen",
      deduct_private_classes: "Privatstunden abziehen",
      price_mxd_label: "Preis MXD",
      transfer_details_label: "\xDCberweisungsdaten",
      bank_name_label: "Nombre del banco",
      account_number_label: "Numero de cuenta",
      holder_name_label: "Nombre del titular",
      asunto_label: "Asunto",
      save_bank_btn: "Bankdaten speichern",
      saved_success_msg: "Erfolgreich gespeichert!",
      balance_manual_label: "Guthaben manuell",
      no_classes_msg: "Keine Kurse",
      select_plan_msg: "W\xE4hle dein bevorzugtes Abo.",
      delete_student_confirm: "Bist du sicher, dass du diesen Sch\xFCler l\xF6schen willst? Alle Fortschritte gehen verloren.",
      not_found_msg: "Nicht gefunden",
      not_enough_balance: "Nicht gen\xFCgend Stunden \xFCbrig!",
      enter_admin_user: "Neuen Admin-Benutzernamen eingeben:",
      enter_admin_pass: "Neues Admin-Passwort eingeben:",
      admin_created: "Admin erstellt!",
      add_admin_modal_title: "Administrator hinzuf\xFCgen",
      add_admin_modal_subtitle: "Einen neuen Administrator f\xFCr deine Schule anlegen",
      add_admin_success_title: "Administrator hinzugef\xFCgt",
      add_admin_success_text: "Der neue Administrator kann sich jetzt mit der von dir festgelegten E-Mail und dem Passwort anmelden.",
      add_admin_btn: "Hinzuf\xFCgen",
      enter_student_name: "Name des Sch\xFClers eingeben:",
      enter_student_phone: "Telefonnummer eingeben:",
      enter_student_email: "E-Mail des Sch\xFClers (optional):",
      enter_student_pass: "Passwort f\xFCr den Sch\xFCler eingeben:",
      student_created: "Sch\xFCler erstellt!",
      unknown_student: "Unbekannter Sch\xFCler",
      delete_payment_confirm: "Diesen Zahlungsbeleg permanent l\xF6schen?",
      select_school_subtitle: "Bitte w\xE4hle deine Schule oder deinen Lehrer aus",
      discover_dance_btn: "Alle Schulen entdecken",
      discovery_title: "Tanz entdecken",
      discovery_subtitle: "Finde Studios und Lehrer in deiner N\xE4he",
      discovery_back: "Zur\xFCck zu allen Studios",
      discovery_register_title: "Konto erstellen",
      discovery_register_subtitle: "Als unabh\xE4ngiger T\xE4nzer registrieren",
      discovery_login_title: "Anmelden",
      discovery_login_subtitle: "Melde dich in deinem T\xE4nzerkonto an",
      discovery_already_have_account: "Bereits ein Konto?",
      discovery_no_account: "Noch kein Konto?",
      discovery_confirm_email_banner: "Best\xE4tige deine E-Mail, um Bewertungen und das Hinzuf\xFCgen von Schulen freizuschalten.",
      discovery_review_gate_login: "Melde dich an, um eine Bewertung zu schreiben oder eine Schule vorzuschlagen.",
      resend_verification: "Best\xE4tigungs-E-Mail erneut senden",
      resend_sending: "Wird gesendet\u2026",
      resend_cooldown: "Gesendet. Bitte 60 s warten",
      resend_success: "Schau in dein Postfach",
      resend_error: "Senden fehlgeschlagen. Bitte erneut versuchen.",
      nav_profile: "Profil",
      discovery_no_schools: "Noch keine Studios gelistet.",
      discovery_tab_schools: "Studios",
      discovery_tab_private_teachers: "Privatlehrer",
      discovery_no_teachers: "Noch keine Privatlehrer gelistet.",
      discovery_filter_dance: "Tanzstil",
      discovery_filter_country: "Land",
      discovery_filter_city: "Stadt",
      discovery_filter_all: "Alle",
      discovery_not_found: "Dieses Studio hat noch keine Detailseite.",
      discovery_sign_in_btn: "Anmelden",
      discovery_not_on_app: "Diese Schule nutzt Bailadmin nicht. Bitte kontaktiere die Schule direkt.",
      discovery_sign_in_edit_profile: "Anmelden, um dein Studio-Profil zu bearbeiten",
      discovery_back_to_page: "Zur\xFCck zur Discovery-Seite",
      discovery_studio_admin_signin: "Studio-Admin? Anmelden",
      discovery_pick_school_to_signin: "W\xE4hle dein Studio, um dich anzumelden und dein Discovery-Profil zu bearbeiten.",
      discovery_admin_signin_title: "Discovery-Profil bearbeiten",
      discovery_admin_signin_subtitle: "Dieses Studio erscheint nur auf der Discovery-Seite. Melde dich mit deiner Admin-E-Mail und deinem Passwort an.",
      discovery_placeholder_upload_soon: "Wird demn\xE4chst hochgeladen.",
      discovery_location: "Standort",
      discovery_classes: "Kurse",
      discovery_packages: "Pakete",
      discovery_gallery: "Galerie",
      add_school_btn: "Neue Schule",
      enter_school_name: "Namen der neuen Schule oder des Lehrers eingeben:",
      school_created: "Schule erfolgreich erstellt!",
      switch_school: "Schule wechseln",
      welcome_classes: "Willkommen beim Unterricht von",
      loading: "L\xE4dt...",
      select_school_placeholder: "W\xE4hle deine Schule...",
      search_school_placeholder: "Tippen oder Schule w\xE4hlen...",
      dropdown_schools: "Schulen",
      dropdown_private_teachers: "Privatlehrer",
      dropdown_country_other: "Sonstige",
      loading_schools: "Schulen werden geladen...",
      loading_dashboard: "Laden...",
      no_schools: "Keine Schulen gefunden",
      could_not_load_schools: "Schulen konnten nicht geladen werden",
      retry: "Erneut versuchen",
      connecting: "Verbindung wird hergestellt...",
      dev_access_title: "Entwickler-Zugang",
      dev_access_subtitle: "Entwickler-Anmeldedaten eingeben",
      footer_support: "Support",
      footer_contact: "Kontakt",
      footer_copy: "Made with <3 by a salsero; \xA9 2026 Bailadmin Systems.",
      dev_login_btn: "Login",
      dev_dashboard_title: "Plattform-Entwickler",
      dev_school_inspector: "Schul-Inspektor",
      dev_active_schools: "Aktive Schulen",
      school_active: "Aktiv",
      school_inactive: "Inaktiv",
      activate_school: "Aktivieren",
      deactivate_school: "Deaktivieren",
      school_on_platform: "Auf der Plattform",
      school_on_discovery: "In Discovery",
      dev_stats_schools: "Schulen",
      dev_stats_students: "Gesamt Sch\xFCler",
      dev_stats_plans: "Pl\xE4ne",
      dev_tab_schools: "Schulen",
      dev_tab_account_audit: "Konto-Audit",
      dev_audit_students: "Sch\xFCler",
      dev_audit_admins: "Administratoren",
      dev_audit_linked: "Verkn\xFCpft",
      dev_audit_not_linked: "Nicht verkn\xFCpft",
      dev_audit_user_id: "user_id",
      dev_stats_classes: "Kurse",
      dev_view_details: "Details anzeigen",
      dev_enter_as_admin: "Als Admin betreten",
      dev_edit_discovery_profile: "Discovery-Profil bearbeiten",
      dev_discovery_profile_desc: "Slug, Standort, Beschreibung, Stile, Logo, Orte",
      dev_edit_school_info: "Schuldaten bearbeiten",
      dev_save_school_info: "Speichern",
      dev_school_info_desc: "Name und Adresse",
      dev_school_info_saved: "Schulinformationen gespeichert.",
      dev_events_packages_feature: "Events als Pakete",
      dev_events_packages_feature_desc: "Erlaubt dieser Schule, Events in Paketen anzubieten (Admin kann in Einstellungen schalten)",
      dev_private_packages_feature: "Privatstunden als Pakete",
      dev_private_packages_feature_desc: "Erlaubt dieser Schule, Privatstunden in Paketen anzubieten (Admin kann in Einstellungen schalten)",
      dev_monthly_registration_feature: "Monatliche Kursanmeldung",
      dev_monthly_registration_feature_desc: "Erlaubt dieser Schule, monatliche Kursanmeldung anzubieten (f\xFCr alle Kurse im Monat anmelden)",
      offer_monthly_registration: "Monatliche Kursanmeldung anbieten",
      offer_monthly_registration_desc: "Sch\xFCler k\xF6nnen sich auf einmal f\xFCr alle verbleibenden Kurse eines Kurses im aktuellen Monat anmelden.",
      register_single: "Nur f\xFCr diesen Kurs anmelden",
      register_monthly: "F\xFCr alle {n} Kurse diesen Monat anmelden",
      monthly_badge: "Monatlich",
      monthly_balance_insufficient: "Du brauchst mindestens {n} Kurse, um dich f\xFCr den ganzen Monat anzumelden.",
      monthly_registration_success: "Erfolgreich f\xFCr {n} Kurse diesen Monat angemeldet!",
      monthly_capacity_full: "Kurs ist am {date} voll. Monatliche Anmeldung nicht m\xF6glich.",
      fixed_expiry_date_label: "Festes Ablaufdatum (optional)",
      plan_expiry_display_title: "Ablauf-Anzeige der Pakete",
      plan_expiry_display_desc: "W\xE4hle, wie das Ablaufdatum in jedem Paket und f\xFCr Sch\xFCler angezeigt wird.",
      plan_expiry_option_date: "Festes Ablaufdatum",
      plan_expiry_option_date_hint: "z.B. 28.02.2026",
      plan_expiry_option_days: "G\xFCltigkeit in Tagen",
      plan_expiry_option_days_hint: "z.B. 30 Tage",
      plan_expiry_fixed_date_label: "Festes Ablaufdatum verwenden",
      plan_expiry_fixed_date_desc: "An: Pl\xE4ne und Sch\xFCler sehen ein festes Ablaufdatum (z.B. 28.02.2026). Aus: Es wird die G\xFCltigkeit in Tagen angezeigt (z.B. 30 Tage \xFCbrig).",
      dev_events_feature: "Jack and Jill / Events",
      dev_events_feature_desc: "Erlaube dieser Schule Jack and Jill Events zu erstellen (Premium-Funktion)",
      dev_events_enabled: "Aktiviert",
      dev_events_disabled: "Deaktiviert",
      jack_and_jill_upgrade_msg: "Um Events zu erstellen musst du auf ein Paket upgraden, das diese Funktion enth\xE4lt.",
      dev_volver_dashboard: "Zur\xFCck zum Dashboard",
      dev_admins_label: "Administratoren",
      dev_students_label: "Sch\xFCler",
      dev_discovery_site: "Discovery-Seite",
      dev_discovery_toggle_on: "An",
      dev_discovery_toggle_off: "Aus",
      dev_discovery_profiles: "Discovery-Profile",
      dev_open_ajustes: "Einstellungen \xF6ffnen",
      dev_edit_in_dashboard: "Ansehen / Bearbeiten",
      dev_plans_label: "Abos",
      dev_classes_label: "Stundenplan und Kurse",
      dev_no_admins: "Keine Admins zugewiesen",
      dev_no_students: "Keine Sch\xFCler registriert",
      dev_no_plans: "Keine Pl\xE4ne definiert",
      dev_no_classes: "Keine Kurse konfiguriert",
      password_label: "Passwort",
      delete_school_btn: "Schule l\xF6schen",
      rename_school_btn: "Umbenennen",
      rename_school_prompt: "Neuer Name f\xFCr diese Schule:",
      rename_school_success: "Schulname aktualisiert.",
      delete_school_confirm: "Bist du sicher? ALLE Daten (Sch\xFCler, Admins, Zahlungen, Kurse) werden unwiderruflich gel\xF6scht.",
      delete_school_success: "Schule erfolgreich gel\xF6scht",
      add_school_title: "Neue Schule erstellen",
      school_info_section: "Akademie-Details",
      admin_info_section: "Erster Administrator",
      admin_name_label: "Admin-Name",
      admin_email_label: "E-Mail",
      admin_email_not_set: "Nicht festgelegt",
      enter_admin_email: "Bitte gib eine E-Mail-Adresse ein.",
      dev_discovery_optional: "Discovery-Profil (optional)",
      create_school_btn: "Initialisierung ausf\xFChren",
      username_exists_msg: "Dieser Benutzername ist bereits vergeben. Bitte w\xE4hle einen anderen.",
      class_location: "Standort",
      location_placeholder: "z.B. Studio A",
      active_packs_label: "Deine aktiven Pakete",
      all_schools_packs_label: "Deine Pakete in allen Schulen",
      no_packs_any_school: "Du hast keine aktiven Pakete an einer Schule",
      expired_classes_label: "Abgelaufene Stunden",
      used_packs_label: "Verbrauchte Pakete",
      no_expiration: "Kein Ablaufdatum",
      expires_in: "L\xE4uft ab in",
      days_left: "Tage \xFCbrig",
      expires_label: "G\xFCltig bis",
      search_students: "Sch\xFCler suchen...",
      filter_all: "Alle",
      filter_with_pack: "Mit aktivem Paket",
      filter_no_pack: "Ohne aktives Paket",
      filter_package_type: "Pakete",
      filter_this_month: "Dieser Monat",
      filter_status: "Status",
      filter_method: "Methode",
      filter_paid: "Bezahlt",
      filter_unpaid: "Unbezahlt",
      filter_result_students: "{count} Sch\xFCler",
      filter_result_payments: "{count} Zahlungen",
      filter_label_pack: "Paket",
      filter_label_package: "Plan",
      filter_label_payment: "Zahlung",
      filters_label: "Filter",
      period_total: "Gesamt f\xFCr Zeitraum",
      loading_students_msg: "Sch\xFCler werden geladen...",
      no_pending_msg: "Keine ausstehenden Zahlungen",
      refresh_btn: "Aktualisieren",
      historical_total_label: "Gesamtverlauf",
      no_data_msg: "Noch keine Daten",
      mgmt_classes_title: "Kursverwaltung",
      mgmt_admins_title: "Administratoren",
      additional_features: "Zus\xE4tzliche Funktionen",
      settings_account_admin_label: "Profil, Passwort, Administratoren und mehr",
      day_label: "Tag",
      hour_label: "Uhrzeit",
      start_time_label: "Start",
      end_time_label: "Ende",
      level_tag_label: "Niveau",
      new_class_label: "Neuer Kurs",
      show_weekly_btn: "Wochenplan anzeigen",
      hide_weekly_btn: "Wochenplan ausblenden",
      weekly_preview_title: "Vorschau (Woche)",
      full_name_label: "Vollst\xE4ndiger Name",
      total_classes_label: "Stunden insgesamt",
      pack_details_title: "Paket-Details",
      reg_date_label: "Registriert am",
      next_expiry_label: "N\xE4chster Ablauf",
      delete_perm_label: "Sch\xFCler dauerhaft l\xF6schen",
      admin_pass_req: "Admin-Passwort erforderlich:",
      leave_blank_keep: "leer lassen um beizubehalten",
      invalid_pass_msg: "Falsches Admin-Passwort.",
      save_btn: "Speichern",
      saving_label: "Speichern\u2026",
      save_schedule_btn: "Stundenplan speichern",
      save_plans_btn: "Pakete speichern",
      remove_admin_confirm: "Sind Sie sicher, dass Sie diesen Administrator entfernen m\xF6chten?",
      admin_removed: "Administrator erfolgreich entfernt!",
      error_creating_admin: "Fehler beim Erstellen des Administrators:",
      admin_add_need_linked_session: "Um Administratoren hinzuzuf\xFCgen, m\xFCssen Sie mit Ihrem verkn\xFCpften Konto angemeldet sein. Bitte melden Sie sich ab und mit Benutzername und Passwort wieder an.",
      error_removing_admin: "Fehler beim Entfernen des Administrators:",
      competition_view_answers: "Antworten anzeigen",
      competition_answers: "Antworten",
      competition_answer: "Antwort",
      competition_no_answers: "Noch keine Antworten.",
      competition_registration_not_found: "Registrierung nicht gefunden. Gehe zur\xFCck und \xF6ffne Registros erneut.",
      competition_activate_event: "Event aktivieren",
      competition_activate_signin: "Registrierung aktivieren",
      competition_for_event: "F\xFCr Event",
      competition_delete_confirm: "Dieses Event l\xF6schen? Alle Anmeldungen werden entfernt.",
      competition_copy: "Kopieren",
      competition_copy_of: "Kopie von ",
      no_existing_events: "Keine Events vorhanden.",
      no_events_linked_hint: 'Wenn du zuvor Events erstellt hast, verkn\xFCpfe dein Admin-Konto: Gehe zu Sch\xFCler \u2192 nutze die Karte "Link account", oder melde dich ab und mit Benutzername + Passwort wieder an.',
      competition_confirm_copy: 'Kopie erstellen als "{name}"? Das neue Event ist zun\xE4chst inaktiv.',
      competition_copy_success: "Event kopiert.",
      competition_done: "Fertig",
      competition_saved_indicator: "Gespeichert",
      competition_saving: "Wird gespeichert...",
      competition_next_steps_placeholder: "Z.B. Keine Schnitte, feste Kamera, gute Beleuchtung...",
      competition_video_submission_toggle: "Video-Einreichung einschlie\xDFen?",
      competition_video_prompt_label: "Video-Fragentext",
      competition_video_prompt_placeholder: "Lade dein Demo-Video hoch",
      competition_video_duration_error: "Video muss 2-3 Minuten dauern",
      competition_video_size_error: "Datei zu gro\xDF (max. 50 MB)",
      competition_video_uploading: "Wird hochgeladen...",
      competition_video_uploaded: "Video hochgeladen",
      competition_video_unavailable: "Video nicht verf\xFCgbar",
      competition_approved_message: 'Herzlichen Gl\xFCckwunsch! Du wirst an "{eventName}" teilnehmen.',
      competition_declined_message: "Dieses Mal kannst du nicht teilnehmen, aber wir freuen uns auf dich beim n\xE4chsten Mal.",
      // Class Registration
      nav_my_classes: "Meine Kurse",
      register_for_class: "F\xFCr diesen Kurs anmelden",
      join_class: "Anmelden",
      cancel_registration: "Anmeldung stornieren",
      class_full: "Kurs voll",
      full_label: "Voll",
      class_already_started: "Kurs hat bereits begonnen",
      spots_left: "{n} Pl\xE4tze frei",
      only_n_spots: "Nur noch {n} Pl\xE4tze!",
      registered: "Angemeldet",
      registered_check: "Du bist angemeldet",
      cancel_before_deadline: "Stornierung bis 4h vor Kursbeginn",
      cannot_cancel_deadline: "Stornierungsfrist abgelaufen",
      auto_deducted: "Kurs automatisch abgezogen",
      registered_for_class_msg: "Angemeldet f\xFCr {className} um {time}",
      no_manual_deduction: "Kein manueller Abzug n\xF6tig",
      my_classes_title: "Meine Kurse",
      my_classes_subtitle: "Deine kommenden und vergangenen Anmeldungen",
      upcoming_classes: "Kommende",
      past_classes: "Vergangene Kurse",
      no_upcoming: "Keine kommenden Anmeldungen",
      no_past_classes: "Kein Kursverlauf",
      cancelled: "Storniert",
      attended: "Teilgenommen",
      no_show: "Nicht erschienen",
      registration_enabled: "Kursanmeldung",
      registration_enabled_desc: "Sch\xFClern erlauben, sich f\xFCr bestimmte Kurszeiten anzumelden",
      max_students: "Max. Teilnehmer",
      max_students_placeholder: "z.B. 20",
      confirm_attendance_registered: "Anwesenheit best\xE4tigen",
      class_will_deduct: "1 Kurs wird vom Paket abgezogen",
      student_registered_for: "Angemeldet f\xFCr",
      register_success: "Erfolgreich angemeldet!",
      register_error: "Anmeldung fehlgeschlagen. Bitte erneut versuchen.",
      cancel_success: "Anmeldung storniert.",
      cancel_error: "Stornierung fehlgeschlagen. Bitte erneut versuchen.",
      cancel_too_late_error: "Stornierung weniger als 4 Stunden vor Kursbeginn nicht m\xF6glich.",
      cancel_confirm: "Anmeldung f\xFCr diesen Kurs stornieren?",
      cancel_confirm_full: "Du stornierst diesen Kurs. Wenn der Kurs voll wird, kannst du dich nicht erneut anmelden.",
      register_success_4h_note: "Wenn du nicht mindestens 4 Stunden vor Kursbeginn stornierst, wird automatisch eine Klasse von deinem Pass abgezogen.",
      my_registrations_label: "Kurs-Anmeldungen",
      took_class_label: "Vergangene Kurse",
      got_it: "Verstanden",
      cancel_confirm_yes: "Ja, Anmeldung stornieren",
      go_back: "Zur\xFCck",
      registered_title: "Du bist angemeldet",
      unlimited_spots: "Offene Anmeldung",
      week_of: "Woche vom {start} bis {end}",
      class_registrations_title: "Kursanmeldungen",
      no_registrations_yet: "Noch keine Anmeldungen diese Woche",
      registered_count: "{n} angemeldet",
      past_day: "Vergangen",
      // Private classes
      private_classes_prompt: "M\xF6chtest du Privatunterricht? Schreib uns und wir geben dir alle Infos.",
      private_classes_btn: "Ich bin interessiert",
      private_classes_contact_title: "Kontakt f\xFCr Privatunterricht",
      message_whatsapp: "Per WhatsApp schreiben",
      contact_not_configured: "Kontakt nicht eingerichtet. Bitte sp\xE4ter versuchen.",
      private_contact_section: "Privatunterricht-Kontakt",
      private_contact_desc: "W\xE4hle den Admin, den Sch\xFCler bei Fragen zu Privatunterricht sehen",
      my_profile_section: "Mein Profil",
      display_name_label: "Anzeigename",
      phone_label: "Telefon (f\xFCr WhatsApp)",
      change_password_section: "Passwort \xE4ndern",
      current_password_label: "Aktuelles Passwort",
      new_password_label: "Neues Passwort",
      confirm_new_password_label: "Neues Passwort best\xE4tigen",
      save_profile_btn: "Profil speichern",
      change_password_btn: "Passwort \xE4ndern",
      password_changed_success: "Passwort aktualisiert.",
      auth_password_sync_failed: "Hinweis: Der Anmeldedienst konnte nicht aktualisiert werden. Melde dich einmal mit deinem ALTEN Passwort an und \xE4ndere es danach unter Einstellungen erneut.",
      admin_password_sync_hint: "Dein Passwort ist f\xFCr diese Schule korrekt, wurde aber vom Anmeldedienst nicht akzeptiert. Wenn du k\xFCrzlich das Passwort in den Einstellungen ge\xE4ndert hast, melde dich mit dem vorherigen Passwort an und \xE4ndere es danach erneut.",
      admin_account_needs_activation: 'Dein Admin-Konto wurde gerade erstellt, aber der Anmeldedienst verlangt E-Mail-Best\xE4tigung. Bitte den Plattform-Administrator, in Supabase "E-Mail best\xE4tigen" zu deaktivieren: Authentifizierung > Anbieter > E-Mail. Dann erneut anmelden.',
      admin_email_modal_title: "E-Mail hinzuf\xFCgen",
      admin_email_modal_msg: "F\xFCr Passwort-Wiederherstellung und Kontosicherheit, bitte hinterlege deine echte E-Mail-Adresse. Du wirst dich k\xFCnftig mit dieser E-Mail anmelden.",
      admin_email_save: "Speichern",
      admin_email_later: "Sp\xE4ter",
      admin_email_saved: "E-Mail gespeichert!",
      admin_email_invalid: "Bitte gib eine g\xFCltige E-Mail-Adresse ein.",
      profile_saved_success: "Profil gespeichert.",
      password_mismatch: "Passw\xF6rter stimmen nicht \xFCberein.",
      password_too_short: "Passwort muss mindestens 4 Zeichen haben.",
      select_contact_admin: "Kontakt ausw\xE4hlen",
      discovery_profile_section: "Discovery-Profil",
      discovery_offerings_section: "Angebote",
      discovery_slug_label: "URL-Slug",
      discovery_slug_placeholder: "z.B. royal_latin",
      discovery_upload_btn: "Hochladen",
      discovery_replace_title: "Bild ersetzen?",
      discovery_replace_message: "Es ist bereits ein Foto vorhanden. M\xF6chtest du es durch das neue ersetzen?",
      discovery_replace_confirm: "Ersetzen",
      discovery_logo_crop_title: "Logo f\xFCr Discovery zuschneiden",
      discovery_logo_crop_hint: "Positioniere und zoome, damit dein Logo im Quadrat gut aussieht. So wird es auf der Discovery-Seite angezeigt.",
      discovery_logo_crop_preview_label: "Vorschau auf Discovery:",
      discovery_logo_crop_apply: "Anwenden",
      discovery_remove_image: "Entfernen",
      country_label: "Land",
      city_label: "Stadt",
      school_name_label: "Schulname",
      address_label: "Adresse",
      discovery_description_label: "Beschreibung",
      discovery_genres_label: "Stile (kommagetrennt)",
      discovery_levels_label: "Level (kommagetrennt)",
      logo_url_label: "Logo-URL",
      teacher_photo_url_label: "Lehrerfoto-URL",
      gallery_urls_label: "Galerie-URLs (eine pro Zeile)",
      discovery_locations_label: "Wo wir unterrichten",
      discovery_location_name: "Name des Salons / Orts",
      discovery_location_address: "Adresse (Pflichtfeld)",
      discovery_location_description: "Zustand / Beschreibung des Orts",
      discovery_add_location: "Ort hinzuf\xFCgen",
      discovery_remove_location: "Entfernen",
      discovery_where_we_teach: "Standorte",
      save_discovery_btn: "Discovery-Profil speichern",
      discovery_preview_title: "Vorschau auf Discover",
      show_discovery_preview_btn: "Vorschau anzeigen",
      hide_discovery_preview_btn: "Vorschau ausblenden",
      discovery_saved: "Discovery-Profil gespeichert.",
      profile_type_label: "Profiltyp",
      profile_type_school: "Schule",
      profile_type_private_teacher: "Privatlehrer",
      teacher_availability_title: "Verf\xFCgbarkeit",
      add_availability: "Verf\xFCgbarkeit hinzuf\xFCgen",
      private_class_requests_title: "Anfragen f\xFCr Privatstunden",
      no_private_requests: "Noch keine Anfragen",
      accept_btn: "Annehmen",
      decline_btn: "Ablehnen",
      nav_book_class: "Klasse buchen",
      session_label: "Stunde",
      no_availability: "Keine Verf\xFCgbarkeit",
      confirm_btn: "Best\xE4tigen",
      confirm_booking_title: "Anfrage best\xE4tigen",
      private_teacher_title: "Privatlehrer",
      request_sent: "Anfrage gesendet! Der Lehrer best\xE4tigt.",
      request_sent_booking_title: "Anfrage gesendet!",
      request_sent_booking_msg: "Der Lehrer wird best\xE4tigen.",
      need_package_to_book: "Du ben\xF6tigst ein Paket f\xFCr Privatstunden.",
      visit_shop_to_buy: "Besuche den Shop, um eines zu kaufen.",
      my_private_classes: "Meine Privatstunden",
      no_private_classes_yet: "Noch keine akzeptierten Privatstunden",
      accepted_private_classes: "Akzeptierte Privatstunden",
      calendar_view: "Kalender",
      no_accepted_private_classes: "Noch keine akzeptierten Privatstunden",
      today: "Heute",
      no_classes_this_day: "Keine Stunden an diesem Tag",
      profile_settings: "Profil",
      linked_schools: "Verkn\xFCpfte Schulen",
      no_schools_linked: "Noch keine Schulen verkn\xFCpft.",
      verified: "Best\xE4tigt",
      not_verified: "Nicht best\xE4tigt",
      first_name: "Vorname",
      last_name: "Nachname",
      email: "E-Mail",
      city: "Stadt",
      country: "Land",
      save: "Speichern",
      instagram: "Instagram",
      instagram_placeholder: "@handle"
    }
  };
  setLocalesDict(DANCE_LOCALES);
  window.fetchAllData = fetchAllData;
  window.fetchPlatformData = fetchPlatformData;
  window.fetchDiscoveryData = fetchDiscoveryData;
  window.resetFetchThrottle = resetFetchThrottle;
  window.startScanner = startScanner;
  window.stopScanner = stopScanner;
  window.handleScan = handleScan;
  window.cancelAttendance = cancelAttendance;
  window.confirmRegisteredAttendance = confirmRegisteredAttendance;
  window.confirmAttendance = confirmAttendance;
  window.updateStickyFooterVisibility = updateStickyFooterVisibility;
  window.slugFromName = (name) => {
    if (!name || typeof name !== "string") return "";
    const s = String(name).trim().toLowerCase().replace(/[^a-z0-9\s\-]/g, "").replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
    return s || "";
  };
  window.navigateDiscovery = (path) => {
    state.discoveryPath = path;
    history.pushState({ discoveryPath: path }, "", path || "/discovery");
    if (path === "/discovery/register" || path === "/discovery/login") {
      renderView();
      window.scrollTo(0, 0);
      if (window.lucide) window.lucide.createIcons();
    } else {
      window.fetchDiscoveryData().then(() => {
        renderView();
        window.scrollTo(0, 0);
      });
    }
  };
  window.fetchUserProfile = async () => {
    if (!supabaseClient) return null;
    const { data: sess } = await supabaseClient.auth.getSession();
    if (!sess?.session?.user?.id) {
      state.userProfile = null;
      return null;
    }
    const uid = sess.session.user.id;
    const { data: profile, error } = await supabaseClient.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (error) {
      state.userProfile = null;
      return null;
    }
    state.userProfile = profile || null;
    return state.userProfile;
  };
  var _resendVerificationCooldownUntil = 0;
  var _resendVerificationSending = false;
  var _resendVerificationFeedback = null;
  var _resendVerificationErrorMsg = "";
  window.resendVerificationEmail = async () => {
    if (Date.now() < _resendVerificationCooldownUntil) return;
    if (!supabaseClient) return;
    const { data: sess } = await supabaseClient.auth.getSession();
    (function(l) {
      const b = JSON.stringify(l);
      fetch("http://127.0.0.1:7243/ingest/adf50a45-9f8f-4c1e-8e97-90df72d1c8da", { method: "POST", headers: { "Content-Type": "application/json" }, body: b }).catch(() => {
      });
      if (typeof console !== "undefined" && console.log) console.log("[DEBUG_RESEND]", b);
    })({ location: "legacy.js:resendVerificationEmail", message: "after getSession", data: { hasSession: !!sess?.session, accessTokenLen: sess?.session?.access_token?.length ?? 0 }, timestamp: Date.now(), hypothesisId: "H1" });
    if (!sess?.session?.access_token) {
      (function(l) {
        const b = JSON.stringify(l);
        fetch("http://127.0.0.1:7243/ingest/adf50a45-9f8f-4c1e-8e97-90df72d1c8da", { method: "POST", headers: { "Content-Type": "application/json" }, body: b }).catch(() => {
        });
        if (typeof console !== "undefined" && console.log) console.log("[DEBUG_RESEND]", b);
      })({ location: "legacy.js:resendVerificationEmail", message: "early return no token", data: {}, timestamp: Date.now(), hypothesisId: "H1" });
      return;
    }
    const t2 = (k) => window.t ? window.t(k) : k;
    _resendVerificationSending = true;
    _resendVerificationFeedback = null;
    if (typeof window.renderView === "function") window.renderView();
    try {
      const { data: refreshed } = await supabaseClient.auth.refreshSession();
      const session = refreshed?.session || sess?.session;
      const token = session?.access_token;
      (function(l) {
        const b = JSON.stringify(l);
        fetch("http://127.0.0.1:7243/ingest/adf50a45-9f8f-4c1e-8e97-90df72d1c8da", { method: "POST", headers: { "Content-Type": "application/json" }, body: b }).catch(() => {
        });
        if (typeof console !== "undefined" && console.log) console.log("[DEBUG_RESEND]", b);
      })({ location: "legacy.js:resendVerificationEmail", message: "after refresh", data: { hasToken: !!token, tokenLen: token?.length ?? 0, isJwtLike: !!(token && String(token).startsWith("eyJ")) }, timestamp: Date.now(), hypothesisId: "H2" });
      if (!token) throw new Error("Session expired");
      (function(l) {
        const b = JSON.stringify(l);
        fetch("http://127.0.0.1:7243/ingest/adf50a45-9f8f-4c1e-8e97-90df72d1c8da", { method: "POST", headers: { "Content-Type": "application/json" }, body: b }).catch(() => {
        });
        if (typeof console !== "undefined" && console.log) console.log("[DEBUG_RESEND]", b);
      })({ location: "legacy.js:resendVerificationEmail", message: "before invoke", data: { tokenLen: token.length }, timestamp: Date.now(), hypothesisId: "H3" });
      const fnUrl = (SUPABASE_URL || "").replace(/\/$/, "") + "/functions/v1/send_verification_email";
      const res = await fetch(fnUrl, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token }, body: "{}" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(data?.error || "HTTP " + res.status), { context: { status: res.status } });
      if (data && data.error) throw new Error(data.error);
      _resendVerificationCooldownUntil = Date.now() + 6e4;
      _resendVerificationFeedback = "sent";
      if (typeof window.renderView === "function") window.renderView();
      setTimeout(() => {
        _resendVerificationFeedback = null;
        if (typeof window.renderView === "function") window.renderView();
      }, 4e3);
    } catch (e) {
      const errStatus = e && (e.context && e.context.status !== void 0 ? e.context.status : e.status);
      (function(l) {
        const b = JSON.stringify(l);
        fetch("http://127.0.0.1:7243/ingest/adf50a45-9f8f-4c1e-8e97-90df72d1c8da", { method: "POST", headers: { "Content-Type": "application/json" }, body: b }).catch(() => {
        });
        if (typeof console !== "undefined" && console.log) console.log("[DEBUG_RESEND]", b);
      })({ location: "legacy.js:resendVerificationEmail", message: "catch", data: { errMsg: e?.message || e?.error || String(e), status: errStatus, name: e?.name }, timestamp: Date.now(), hypothesisId: "H4" });
      _resendVerificationCooldownUntil = 0;
      _resendVerificationFeedback = "error";
      _resendVerificationErrorMsg = e && (e.message || e.error) ? String(e.message || e.error) : t2("resend_error") || "Could not send. Try again.";
      console.warn("Resend verification failed:", e);
      if (typeof window.renderView === "function") window.renderView();
      setTimeout(() => {
        _resendVerificationFeedback = null;
        _resendVerificationErrorMsg = "";
        if (typeof window.renderView === "function") window.renderView();
      }, 5e3);
    } finally {
      _resendVerificationSending = false;
      if (typeof window.renderView === "function") window.renderView();
    }
  };
  window.discoveryRegister = async () => {
    const t2 = (k) => window.t ? window.t(k) : k;
    const emailEl = document.getElementById("discovery-register-email");
    const passEl = document.getElementById("discovery-register-password");
    const email = emailEl && emailEl.value.trim() ? emailEl.value.trim().toLowerCase() : "";
    const password = passEl ? passEl.value : "";
    if (!email || !password) {
      alert(t2("signup_require_fields") || "Email and password required");
      return;
    }
    if (!supabaseClient) {
      alert("Not connected");
      return;
    }
    try {
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({ email, password });
      if (signUpError) {
        if (signUpError.message && (signUpError.message.includes("already registered") || signUpError.message.includes("already exists"))) {
          alert(t2("email_already_registered") || "Email already registered.");
          return;
        }
        alert(signUpError.message || "Sign up failed");
        return;
      }
      if (!signUpData?.user) {
        alert("Sign up failed");
        return;
      }
      const user = signUpData.user;
      if (signUpData.session) {
        await supabaseClient.auth.setSession({ access_token: signUpData.session.access_token, refresh_token: signUpData.session.refresh_token });
      } else {
        await supabaseClient.auth.signInWithPassword({ email, password });
      }
      await supabaseClient.from("profiles").upsert({
        id: user.id,
        email: (user.email || email).toLowerCase(),
        role: "dancer",
        origin: "discovery",
        email_confirmed: false
      }, { onConflict: "id" });
      state.currentUser = { id: user.id, email: user.email, role: "student", school_id: null };
      state.isAdmin = false;
      setSessionIdentity();
      saveState();
      state.discoveryPath = "/discovery";
      history.pushState({ discoveryPath: "/discovery" }, "", "/discovery");
      await window.fetchUserProfile();
      await supabaseClient.functions.invoke("send_verification_email", { headers: { Authorization: "Bearer " + (await supabaseClient.auth.getSession()).data.session?.access_token } });
      renderView();
      window.scrollTo(0, 0);
    } catch (e) {
      console.error("Discovery register error:", e);
      alert(e.message || "Something went wrong");
    }
  };
  window.discoveryLogin = async () => {
    const t2 = (k) => window.t ? window.t(k) : k;
    const emailEl = document.getElementById("discovery-login-email");
    const passEl = document.getElementById("discovery-login-password");
    const email = emailEl && emailEl.value.trim() ? emailEl.value.trim().toLowerCase() : "";
    const password = passEl ? passEl.value : "";
    if (!email || !password) {
      alert(t2("signup_require_fields") || "Email and password required");
      return;
    }
    if (!supabaseClient) {
      alert("Not connected");
      return;
    }
    try {
      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (signInError) {
        alert(signInError.message || "Sign in failed");
        return;
      }
      const user = signInData.user;
      let profile = (await supabaseClient.from("profiles").select("*").eq("id", user.id).maybeSingle()).data;
      if (!profile) {
        await supabaseClient.from("profiles").insert({
          id: user.id,
          email: (user.email || email).toLowerCase(),
          role: "dancer",
          origin: "discovery",
          email_confirmed: false
        });
        profile = (await supabaseClient.from("profiles").select("*").eq("id", user.id).single()).data;
      }
      state.currentUser = { id: user.id, email: user.email, role: "student", school_id: profile?.origin === "school" ? void 0 : null };
      state.isAdmin = false;
      setSessionIdentity();
      saveState();
      state.userProfile = profile || null;
      state.discoveryPath = "/discovery";
      history.pushState({ discoveryPath: "/discovery" }, "", "/discovery");
      renderView();
      window.scrollTo(0, 0);
    } catch (e) {
      console.error("Discovery login error:", e);
      alert(e.message || "Something went wrong");
    }
  };
  window.verifyEmailWithToken = async (token) => {
    const t2 = (k) => window.t ? window.t(k) : k;
    const root = document.getElementById("app-root");
    if (!supabaseClient || !root) return;
    try {
      const { data, error } = await supabaseClient.functions.invoke("verify_email_token", { body: { token } });
      if (error) throw error;
      if (data && data.error) throw new Error(data.error);
      state.verifyEmailToken = null;
      await window.fetchUserProfile();
      state.currentView = "dashboard-profile";
      if (window.location.hash) window.location.hash = "";
      window.history.replaceState({}, "", window.location.pathname || "/?view=dashboard-profile");
      renderView();
      if (window.lucide) window.lucide.createIcons();
      root.innerHTML = `<div class="container auth-view"><div class="auth-page-container" style="padding: 2rem;"><p style="color: var(--system-green);">${t2("verify_email_success") || "Email confirmed!"}</p><a href="#/dashboard/profile" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">${t2("profile_settings") || "Go to profile"}</a></div></div>`;
      setTimeout(() => {
        state.currentView = "dashboard-profile";
        if (typeof window.parseHashRoute === "function") window.location.hash = "#/dashboard/profile";
        renderView();
      }, 1500);
    } catch (e) {
      root.innerHTML = `<div class="container auth-view"><div class="auth-page-container" style="padding: 2rem;"><p class="text-muted">${t2("verify_email_invalid_link") || "Invalid or expired link."}</p><a href="/discovery" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">${t2("discovery_back") || "Back to discovery"}</a></div></div>`;
    }
  };
  window.renderDashboardProfileView = () => {
    const t2 = (k) => window.t ? window.t(k) : k;
    const p = state.userProfile || {};
    const linkedSchools = state.profileLinkedSchools || [];
    const canResend = p.origin === "discovery" && !p.email_confirmed && Date.now() >= (_resendVerificationCooldownUntil || 0) && !_resendVerificationSending;
    const resendLabel = _resendVerificationSending ? t2("resend_sending") || "Sending\u2026" : canResend ? t2("resend_verification") || "Resend verification email" : t2("resend_cooldown") || "Sent. Wait 60s";
    const backToDiscovery = "event.preventDefault(); state.currentView=null; state.discoveryPath='/discovery'; history.pushState({},'','/discovery'); window.fetchDiscoveryData().then(function(){ renderView(); window.scrollTo(0,0); }); if(window.lucide) window.lucide.createIcons();";
    let html = `<div class="container" style="padding: 1rem 1.2rem;"><div style="margin-bottom: 1rem;"><a href="/discovery" onclick="${backToDiscovery}" style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--text-primary); text-decoration: none;"><i data-lucide="arrow-left" size="16"></i>${t2("discovery_back") || "Back to all studios"}</a></div><div class="ios-header"><div class="ios-large-title">${t2("profile_settings") || "Profile"}</div></div>`;
    html += `<div class="ios-list" style="margin-bottom: 1rem;">`;
    html += `<div class="ios-list-item" style="padding: 12px 16px;"><span style="opacity: 0.8;">${t2("email") || "Email"}</span><span style="flex: 1; text-align: right;">${(p.email || "").replace(/</g, "&lt;")}</span><span style="font-size: 11px; margin-left: 8px;">${p.email_confirmed ? t2("verified") || "Verified" : t2("not_verified") || "Not verified"}</span></div>`;
    if (p.origin === "discovery" && !p.email_confirmed) {
      html += `<div class="ios-list-item" style="padding: 12px 16px;"><button type="button" class="resend-verification-btn btn-secondary" ${canResend && !_resendVerificationSending ? "" : "disabled"} onclick="event.preventDefault(); event.stopPropagation(); if(window.resendVerificationEmail) window.resendVerificationEmail(); return false;" style="width: 100%; min-height: 44px; cursor: ${canResend && !_resendVerificationSending ? "pointer" : "default"}; -webkit-tap-highlight-color: transparent;">${resendLabel}</button>${_resendVerificationFeedback === "sent" ? `<p style="margin-top: 8px; font-size: 13px; color: var(--system-green);">${t2("resend_success") || "Check your inbox"}</p>` : ""}${_resendVerificationFeedback === "error" ? `<p style="margin-top: 8px; font-size: 13px; color: var(--system-red);">${(_resendVerificationErrorMsg || t2("resend_error")).replace(/</g, "&lt;")}</p>` : ""}</div>`;
    }
    html += `</div>`;
    html += `<div class="ios-list" style="margin-bottom: 1rem;"><div class="ios-list-item" style="padding: 12px 16px;"><span style="opacity: 0.8;">${t2("first_name") || "First name"}</span><input type="text" id="profile-first-name" value="${(p.first_name || "").replace(/"/g, "&quot;")}" placeholder="${t2("first_name") || "First name"}" style="flex: 1; border: none; background: transparent; color: var(--text-primary); text-align: right; outline: none;"></div>`;
    html += `<div class="ios-list-item" style="padding: 12px 16px;"><span style="opacity: 0.8;">${t2("last_name") || "Last name"}</span><input type="text" id="profile-last-name" value="${(p.last_name || "").replace(/"/g, "&quot;")}" placeholder="${t2("last_name") || "Last name"}" style="flex: 1; border: none; background: transparent; color: var(--text-primary); text-align: right; outline: none;"></div>`;
    html += `<div class="ios-list-item" style="padding: 12px 16px;"><span style="opacity: 0.8;">${t2("phone") || "Phone"}</span><input type="text" id="profile-phone" value="${(p.phone || "").replace(/"/g, "&quot;")}" placeholder="${t2("phone") || "Phone"}" style="flex: 1; border: none; background: transparent; color: var(--text-primary); text-align: right; outline: none;"></div>`;
    html += `<div class="ios-list-item" style="padding: 12px 16px;"><span style="opacity: 0.8;">${t2("city") || "City"}</span><input type="text" id="profile-city" value="${(p.city || "").replace(/"/g, "&quot;")}" placeholder="${t2("city") || "City"}" style="flex: 1; border: none; background: transparent; color: var(--text-primary); text-align: right; outline: none;"></div>`;
    html += `<div class="ios-list-item" style="padding: 12px 16px;"><span style="opacity: 0.8;">${t2("country") || "Country"}</span><input type="text" id="profile-country" value="${(p.country || "").replace(/"/g, "&quot;")}" placeholder="${t2("country") || "Country"}" style="flex: 1; border: none; background: transparent; color: var(--text-primary); text-align: right; outline: none;"></div>`;
    html += `<div class="ios-list-item" style="padding: 12px 16px;"><span style="opacity: 0.8;">${t2("instagram") || "Instagram"}</span><input type="text" id="profile-instagram" value="${(p.instagram || "").replace(/"/g, "&quot;")}" placeholder="${t2("instagram_placeholder") || "@handle"}" style="flex: 1; border: none; background: transparent; color: var(--text-primary); text-align: right; outline: none;"></div></div>`;
    html += `<button type="button" class="btn-primary" onclick="window.saveProfile()" style="width: 100%; padding: 14px; font-weight: 600; border-radius: 12px; margin-bottom: 1.5rem;">${t2("save") || "Save"}</button>`;
    html += `<h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.5rem;">${t2("linked_schools") || "Linked schools"}</h3>`;
    html += linkedSchools.length ? `<ul style="margin: 0; padding-left: 1.2rem; color: var(--text-primary);">${linkedSchools.map((s) => `<li>${(s.name || s.id || "").replace(/</g, "&lt;")}</li>`).join("")}</ul>` : `<p class="text-muted" style="font-size: 0.9rem;">${t2("no_schools_linked") || "No schools linked yet."}</p>`;
    html += `</div>`;
    return html;
  };
  window.saveProfile = async () => {
    if (!supabaseClient) return;
    const { data: sess } = await supabaseClient.auth.getSession();
    if (!sess?.session?.user?.id) return;
    const first_name = (document.getElementById("profile-first-name") || {}).value?.trim() || null;
    const last_name = (document.getElementById("profile-last-name") || {}).value?.trim() || null;
    const phone = (document.getElementById("profile-phone") || {}).value?.trim() || null;
    const city = (document.getElementById("profile-city") || {}).value?.trim() || null;
    const country = (document.getElementById("profile-country") || {}).value?.trim() || null;
    const instagram = (document.getElementById("profile-instagram") || {}).value?.trim() || null;
    const { error } = await supabaseClient.from("profiles").update({ first_name, last_name, phone, city, country, instagram }).eq("id", sess.session.user.id);
    if (error) {
      alert(error.message || "Save failed");
      return;
    }
    state.userProfile = { ...state.userProfile, first_name, last_name, phone, city, country, instagram };
    saveState();
    if (typeof window.renderView === "function") window.renderView();
  };
  window.renderDiscoveryView = (path) => {
    const t2 = (key) => window.t ? window.t(key) : key;
    if (path === "/discovery/register") {
      return `<div class="container discovery-page"><div class="auth-page-container" style="max-width: 400px; margin: 0 auto; padding: 2rem 1.25rem;">
            <a href="#" class="discovery-back-link" onclick="event.preventDefault(); window.navigateDiscovery('/discovery');" style="margin-bottom: 1rem; display: inline-flex;"><i data-lucide="arrow-left" size="16"></i> ${t2("discovery_back")}</a>
            <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">${t2("discovery_register_title") || "Create account"}</h1>
            <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1.5rem;">${t2("discovery_register_subtitle") || "Register as an independent dancer"}</p>
            <div class="ios-list" style="margin-bottom: 1rem;">
                <div class="ios-list-item" style="padding: 10px 16px;"><input type="email" id="discovery-register-email" placeholder="${t2("email") || "Email"}" autocomplete="email" style="width: 100%; border: none; background: transparent; color: var(--text-primary); font-size: 16px; outline: none;"></div>
                <div class="ios-list-item password-input-wrap" style="padding: 10px 16px;"><input type="password" id="discovery-register-password" placeholder="${t2("password") || "Password"}" autocomplete="new-password" style="width: 100%; border: none; background: transparent; color: var(--text-primary); font-size: 16px; outline: none; padding-right: 44px;"></div>
            </div>
            <button type="button" class="btn-primary" onclick="window.discoveryRegister()" style="width: 100%; padding: 14px; font-weight: 600; border-radius: 12px;">${t2("sign_up") || "Sign up"}</button>
            <p style="margin-top: 1rem; font-size: 14px; color: var(--text-secondary);">${t2("discovery_already_have_account") || "Already have an account?"} <a href="#" onclick="event.preventDefault(); window.navigateDiscovery('/discovery/login');" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">${t2("sign_in") || "Sign in"}</a></p>
        </div></div>`;
    }
    if (path === "/discovery/login") {
      return `<div class="container discovery-page"><div class="auth-page-container" style="max-width: 400px; margin: 0 auto; padding: 2rem 1.25rem;">
            <a href="#" class="discovery-back-link" onclick="event.preventDefault(); window.navigateDiscovery('/discovery');" style="margin-bottom: 1rem; display: inline-flex;"><i data-lucide="arrow-left" size="16"></i> ${t2("discovery_back")}</a>
            <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">${t2("discovery_login_title") || "Sign in"}</h1>
            <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1.5rem;">${t2("discovery_login_subtitle") || "Sign in to your dancer account"}</p>
            <div class="ios-list" style="margin-bottom: 1rem;">
                <div class="ios-list-item" style="padding: 10px 16px;"><input type="email" id="discovery-login-email" placeholder="${t2("email") || "Email"}" autocomplete="email" style="width: 100%; border: none; background: transparent; color: var(--text-primary); font-size: 16px; outline: none;"></div>
                <div class="ios-list-item password-input-wrap" style="padding: 10px 16px;"><input type="password" id="discovery-login-password" placeholder="${t2("password") || "Password"}" autocomplete="current-password" style="width: 100%; border: none; background: transparent; color: var(--text-primary); font-size: 16px; outline: none; padding-right: 44px;"></div>
            </div>
            <button type="button" class="btn-primary" onclick="window.discoveryLogin()" style="width: 100%; padding: 14px; font-weight: 600; border-radius: 12px;">${t2("sign_in") || "Sign in"}</button>
            <p style="margin-top: 1rem; font-size: 14px; color: var(--text-secondary);">${t2("discovery_no_account") || "Don't have an account?"} <a href="#" onclick="event.preventDefault(); window.navigateDiscovery('/discovery/register');" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">${t2("sign_up") || "Sign up"}</a></p>
        </div></div>`;
    }
    if (path !== "/discovery" && path.startsWith("/discovery/")) {
      const detail = state.discoverySchoolDetail;
      if (!detail) {
        return `<div class="container discovery-page" style="padding: 2rem 1rem; text-align: center;">
                <a href="#" class="discovery-back-link" onclick="event.preventDefault(); window.navigateDiscovery('/discovery');" style="margin-bottom: 1rem; display: inline-flex;"><i data-lucide="arrow-left" size="16"></i>${t2("discovery_back")}</a>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 1rem;">${t2("discovery_not_found")}</p>
            </div>`;
      }
      const placeholder = t2("discovery_placeholder_upload_soon");
      const name = detail.name || detail.school?.name || "";
      const desc = detail.discovery_description || detail.school?.discovery_description || "";
      const country = detail.country || detail.school?.country || "";
      const city = detail.city || detail.school?.city || "";
      const address = detail.address || detail.school?.address || "";
      const location = [city, country].filter(Boolean).join(", ") || address || "";
      const classes = detail.classes || [];
      const subscriptions = detail.subscriptions || [];
      const genres = detail.discovery_genres || detail.school?.discovery_genres || [];
      const levels = detail.discovery_levels || detail.school?.discovery_levels || [];
      const logoUrl = detail.logo_url || detail.school?.logo_url || "";
      const teacherPhotoUrl = detail.teacher_photo_url || detail.school?.teacher_photo_url || "";
      const locations = detail.discovery_locations || detail.school?.discovery_locations || [];
      const locationsList = Array.isArray(locations) ? locations : [];
      const displayName = name ? String(name).replace(/</g, "&lt;") : placeholder;
      const displayLoc = location ? String(location).replace(/</g, "&lt;") : placeholder;
      const displayDesc = desc ? String(desc).replace(/</g, "&lt;").replace(/\n/g, "<br>") : placeholder;
      const resendLabelDetail = _resendVerificationSending ? t2("resend_sending") || "Sending\u2026" : Date.now() >= (_resendVerificationCooldownUntil || 0) ? t2("resend_verification") || "Resend email" : t2("resend_cooldown") || "Sent. Wait 60s";
      const resendDisabledDetail = _resendVerificationSending || Date.now() < (_resendVerificationCooldownUntil || 0);
      const confirmBannerDetail = state.userProfile && state.userProfile.origin === "discovery" && !state.userProfile.email_confirmed ? `<div class="discovery-confirm-banner" style="background: var(--system-gray6); border: 1px solid var(--border); color: var(--text-primary); padding: 12px 16px; border-radius: 12px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;"><span style="font-size: 14px; flex: 1; min-width: 0;">${t2("discovery_confirm_email_banner") || "Confirm your email to unlock reviews and adding schools."}</span><button type="button" class="resend-verification-btn" ${resendDisabledDetail ? "disabled" : ""} onclick="event.preventDefault(); event.stopPropagation(); if(window.resendVerificationEmail) window.resendVerificationEmail(); return false;" style="flex-shrink: 0; background: var(--surface); border: 1px solid var(--border); color: var(--text-primary); padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: ${resendDisabledDetail ? "default" : "pointer"}; min-height: 40px; -webkit-tap-highlight-color: transparent;">${resendLabelDetail}</button></div>` : "";
      let html = `<div class="container discovery-detail-page">${confirmBannerDetail}
            <div style="margin-bottom: 1.25rem;"><a href="#" class="discovery-back-link" onclick="event.preventDefault(); window.navigateDiscovery('/discovery');" style="font-size: 14px; display: inline-flex; align-items: center; gap: 6px;"><i data-lucide="arrow-left" size="16"></i>${t2("discovery_back")}</a></div>
            <div class="discovery-detail-hero">
                <div class="discovery-detail-logo-wrap">${logoUrl ? `<img src="${String(logoUrl).replace(/"/g, "&quot;")}" alt="">` : `<div class="discovery-detail-logo-placeholder"><i data-lucide="image" size="40"></i></div>`}</div>
                <div class="discovery-detail-info">
                    <h1 class="discovery-detail-title">${displayName}</h1>
                    <p class="discovery-detail-loc"><i data-lucide="map-pin" size="14"></i> ${displayLoc}</p>
                    ${genres.length || levels.length ? `<p class="discovery-detail-tags">${[...genres, ...levels].filter(Boolean).join(" \xB7 ")}</p>` : `<p class="discovery-detail-tags" style="font-style: italic;">${placeholder}</p>`}
                </div>
            </div>
            <div class="discovery-detail-desc">${displayDesc}</div>
            <div class="discovery-detail-teacher-wrap">${teacherPhotoUrl ? `<img src="${String(teacherPhotoUrl).replace(/"/g, "&quot;")}" alt="Teacher">` : `<div class="discovery-detail-teacher-placeholder"><i data-lucide="user" size="48"></i><span>${placeholder}</span></div>`}</div>
            <h2 class="discovery-detail-section-title">${t2("discovery_classes")}</h2>
            ${classes.length ? (() => {
        const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const dayAliases = { "Mon": ["Mon", "Mo", "Monday"], "Tue": ["Tue", "Tu", "Tuesday"], "Wed": ["Wed", "We", "Wednesday"], "Thu": ["Thu", "Th", "Thursday"], "Fri": ["Fri", "Fr", "Friday"], "Sat": ["Sat", "Sa", "Saturday"], "Sun": ["Sun", "Su", "Sunday"] };
        const noClassesMsg = t2("no_classes_msg") || "No classes";
        return `<div class="weekly-grid">${daysOrder.map((dayKey) => {
          const aliases = dayAliases[dayKey];
          const dayClasses = classes.filter((c) => aliases.includes(c.day)).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
          const dayLabel = t2(dayKey.toLowerCase()) || dayKey;
          return `<div class="day-tile" style="background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 0.8rem;"><div class="day-tile-header" style="padding-bottom: 0.4rem; border-bottom: 1px solid var(--border); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">${dayLabel}</div><div style="display:flex; flex-direction:column; gap:0.5rem; margin-top: 0.6rem;">${dayClasses.length > 0 ? dayClasses.map((c) => {
            const cName = String(c.name || c.class_name || "").replace(/</g, "&lt;");
            const timeStr = typeof window.formatClassTime === "function" ? window.formatClassTime(c) : c.time || "";
            const loc = (c.location || "").replace(/</g, "&lt;");
            return `<div class="tile-class-item" style="padding: 8px; border-radius: 10px; border: 1px solid var(--border);"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;"><span class="tile-class-level" style="font-size: 8px; background: var(--system-gray6); padding: 2px 6px; border-radius: 4px;">${(c.tag || "Open").replace(/</g, "&lt;")}</span>${loc ? `<span style="font-size: 6px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; opacity: 0.7;">${loc}</span>` : ""}</div><div class="tile-class-desc" style="font-size: 11px; font-weight: 700;">${cName}</div><div class="tile-class-time" style="font-size: 9px; opacity: 0.6;">${timeStr.replace(/</g, "&lt;")}</div></div>`;
          }).join("") : `<div class="text-muted" style="font-size:9px; font-style:italic; padding: 0.5rem 0;">${noClassesMsg}</div>`}</div></div>`;
        }).join("")}</div>`;
      })() : `<div class="discovery-detail-placeholder-block"><i data-lucide="calendar" size="24"></i><span>${placeholder}</span></div>`}
            <h2 class="discovery-detail-section-title">${t2("discovery_packages")}</h2>
            ${subscriptions.length ? `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">${subscriptions.map((s) => {
        const sName = String(s.name || s.title || "").replace(/</g, "&lt;");
        const priceStr = typeof window.formatPrice === "function" ? window.formatPrice(s.price, detail.currency || "MXN") : s.price != null ? s.price : "";
        const validDays = s.validity_days != null ? s.validity_days : 30;
        return `<div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-radius: 24px; padding: 1.2rem;"><div><h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">${sName}</h3><p class="text-muted" style="margin-bottom: 0.75rem; font-size: 0.8rem;">${(t2("valid_for_days") || "Valid for {days} days").replace("{days}", validDays)}</p><div style="font-size: 1.75rem; font-weight: 800; margin-bottom: 0; letter-spacing: -0.04em;">${priceStr}</div></div></div>`;
      }).join("")}</div>` : `<div class="discovery-detail-placeholder-block"><i data-lucide="credit-card" size="24"></i><span>${placeholder}</span></div>`}
            <h2 class="discovery-detail-section-title">${t2("discovery_where_we_teach")}</h2>
            ${locationsList.length ? locationsList.map((loc) => {
        const locName = String(loc.name || "").replace(/</g, "&lt;");
        const locAddr = String(loc.address || "").replace(/</g, "&lt;");
        const locDesc = String(loc.description || "").replace(/</g, "&lt;").replace(/\n/g, "<br>");
        const imgs = Array.isArray(loc.image_urls) ? loc.image_urls : [];
        return `<div class="discovery-detail-location-card" style="margin-bottom: 1.25rem; padding: 1rem; border-radius: 16px; border: 1px solid var(--border);"><div style="font-weight: 700; margin-bottom: 4px;">${locName || "\u2014"}</div><div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 6px;"><i data-lucide="map-pin" size="14"></i> ${locAddr || placeholder}</div>${locDesc ? `<div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px;">${locDesc}</div>` : ""}${imgs.length ? `<div class="discovery-detail-gallery-grid" style="margin-top: 8px;">${imgs.slice(0, 6).map((url) => `<img src="${String(url).replace(/"/g, "&quot;")}" alt="">`).join("")}</div>` : ""}</div>`;
      }).join("") : `<div class="discovery-detail-placeholder-block"><i data-lucide="map-pin" size="32"></i><span>${placeholder}</span></div>`}
            <div class="discovery-detail-cta" style="margin-top: 2rem; padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); background: var(--surface);">
            ${detail.active !== false ? `
                <button type="button" class="btn-primary" onclick="event.preventDefault(); const d=state.discoverySchoolDetail; if(d){ state.currentSchool={id:d.id,name:d.name,currency:d.currency||'MXN'}; state.currentView='auth'; state.discoveryPath=null; history.pushState({},'','/'); saveState(); renderView(); fetchAllData(); }" style="width: 100%; padding: 14px 24px; border-radius: 14px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i data-lucide="log-in" size="20"></i> ${t2("discovery_sign_in_btn")}
                </button>
                ${(() => {
        const needLogin = !state.currentUser && !state.userProfile;
        const needConfirm = state.userProfile && state.userProfile.origin === "discovery" && !state.userProfile.email_confirmed;
        const canReview = state.currentUser || state.userProfile;
        const allowed = canReview && !needConfirm;
        if (needLogin) return `<p style="margin-top: 1rem; font-size: 13px; color: var(--text-secondary);">${t2("discovery_review_gate_login") || "Sign in to leave a review or suggest a school."}</p>`;
        if (needConfirm) return `<p style="margin-top: 1rem; font-size: 13px;">${t2("discovery_confirm_email_banner") || "Confirm your email to unlock reviews and adding schools."} <button type="button" class="resend-verification-btn btn-secondary" onclick="event.preventDefault(); event.stopPropagation(); if(window.resendVerificationEmail) window.resendVerificationEmail(); return false;" style="margin-top: 6px; padding: 8px 14px; font-size: 12px; min-height: 36px; cursor: pointer; -webkit-tap-highlight-color: transparent;">${t2("resend_verification") || "Resend email"}</button></p>`;
        return `<button type="button" class="btn-secondary" style="width: 100%; margin-top: 0.75rem; padding: 10px;" disabled title="${t2("coming_soon") || "Coming soon"}">${t2("discovery_leave_review") || "Leave a review"}</button><button type="button" class="btn-secondary" style="width: 100%; margin-top: 0.5rem; padding: 10px;" disabled title="${t2("coming_soon") || "Coming soon"}">${t2("discovery_suggest_school") || "Suggest a school"}</button>`;
      })()}
            ` : `
                <div style="display: flex; align-items: flex-start; gap: 12px; color: var(--text-secondary); font-size: 14px; line-height: 1.5;">
                    <i data-lucide="info" size="20" style="flex-shrink: 0; opacity: 0.7;"></i>
                    <p style="margin: 0;">${t2("discovery_not_on_app")}</p>
                </div>
                <button type="button" onclick="event.preventDefault(); const d=state.discoverySchoolDetail; if(d){ state.currentSchool={id:d.id,name:d.name,currency:d.currency||'MXN'}; state._discoveryOnlyEdit=true; state.currentView='discovery-admin-auth'; state.discoveryPath=null; history.pushState({},'','/'); saveState(); renderView(); }" style="margin-top: 1rem; padding: 10px 18px; border-radius: 12px; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: var(--system-gray6); border: 1px solid var(--border); color: var(--text-primary); cursor: pointer;">
                    <i data-lucide="edit-3" size="16"></i> ${t2("discovery_sign_in_edit_profile")}
                </button>
            `}
            </div>
            </div>`;
      return html;
    }
    state.discoveryTab = state.discoveryTab || "schools";
    const allDiscovery = state.discoverySchools || [];
    const schoolsOnly = allDiscovery.filter((s) => (s.profile_type || "school") !== "private_teacher");
    const teachersOnly = allDiscovery.filter((s) => (s.profile_type || "") === "private_teacher");
    const allSchools = state.discoveryTab === "schools" ? schoolsOnly : teachersOnly;
    state.discoveryFilterGenre = state.discoveryFilterGenre ?? "";
    state.discoveryFilterCountry = state.discoveryFilterCountry ?? "";
    state.discoveryFilterCity = state.discoveryFilterCity ?? "";
    const genreSet = /* @__PURE__ */ new Set();
    allSchools.forEach((s) => {
      const g = s.discovery_genres;
      if (Array.isArray(g)) g.forEach((x) => {
        if (x && String(x).trim()) genreSet.add(String(x).trim());
      });
    });
    const allGenres = [...genreSet].sort((a, b) => a.localeCompare(b));
    const countrySet = /* @__PURE__ */ new Set();
    allSchools.forEach((s) => {
      const c = (s.country || "Other").trim() || "Other";
      countrySet.add(c);
    });
    const allCountries = [...countrySet].sort((a, b) => a.localeCompare(b));
    let schools = allSchools;
    if (state.discoveryFilterGenre) {
      const g = state.discoveryFilterGenre;
      schools = schools.filter((s) => Array.isArray(s.discovery_genres) && s.discovery_genres.some((x) => String(x).trim() === g));
    }
    if (state.discoveryFilterCountry) {
      const c = state.discoveryFilterCountry;
      schools = schools.filter((s) => ((s.country || "Other").trim() || "Other") === c);
    }
    if (state.discoveryFilterCity) {
      const city = state.discoveryFilterCity;
      schools = schools.filter((s) => (s.city || "").trim() === city);
    }
    const citySet = /* @__PURE__ */ new Set();
    const schoolListForCities = state.discoveryFilterCountry ? allSchools.filter((s) => ((s.country || "Other").trim() || "Other") === state.discoveryFilterCountry) : allSchools;
    schoolListForCities.forEach((s) => {
      const c = (s.city || "").trim();
      if (c) citySet.add(c);
    });
    const citiesInScope = [...citySet].sort((a, b) => a.localeCompare(b));
    const byCountry = {};
    schools.forEach((s) => {
      const c = (s.country || "Other").trim() || "Other";
      if (!byCountry[c]) byCountry[c] = [];
      byCountry[c].push(s);
    });
    const countries = Object.keys(byCountry).sort();
    const filtersHtml = `
        <div class="discovery-filters">
            <div class="discovery-filter-group">
                <label class="discovery-filter-label">${t2("discovery_filter_dance")}</label>
                <select class="discovery-filter-select" onchange="state.discoveryFilterGenre=this.value; state.discoveryFilterCity=''; renderView();">
                    <option value="">${t2("discovery_filter_all")}</option>
                    ${allGenres.map((g) => `<option value="${String(g).replace(/"/g, "&quot;")}" ${state.discoveryFilterGenre === g ? "selected" : ""}>${String(g).replace(/</g, "&lt;")}</option>`).join("")}
                </select>
            </div>
            <div class="discovery-filter-group">
                <label class="discovery-filter-label">${t2("discovery_filter_country")}</label>
                <select class="discovery-filter-select" onchange="state.discoveryFilterCountry=this.value; state.discoveryFilterCity=''; renderView();">
                    <option value="">${t2("discovery_filter_all")}</option>
                    ${allCountries.map((c) => `<option value="${String(c).replace(/"/g, "&quot;")}" ${state.discoveryFilterCountry === c ? "selected" : ""}>${String(c).replace(/</g, "&lt;")}</option>`).join("")}
                </select>
            </div>
            <div class="discovery-filter-group">
                <label class="discovery-filter-label">${t2("discovery_filter_city")}</label>
                <select class="discovery-filter-select" onchange="state.discoveryFilterCity=this.value; renderView();">
                    <option value="">${t2("discovery_filter_all")}</option>
                    ${citiesInScope.map((c) => `<option value="${String(c).replace(/"/g, "&quot;")}" ${state.discoveryFilterCity === c ? "selected" : ""}>${String(c).replace(/</g, "&lt;")}</option>`).join("")}
                </select>
            </div>
        </div>`;
    let cardsHtml = countries.length ? countries.map((country) => `
        <div class="discovery-country-section">
            <h2 class="discovery-country-title">${String(country).replace(/</g, "&lt;")}</h2>
            <div class="discovery-grid">
                ${byCountry[country].map((s) => {
      const rawSlug = (s.discovery_slug || s.slug || "").trim();
      const effectiveSlug = rawSlug || (window.slugFromName ? window.slugFromName(s.name || "") : "");
      const path2 = effectiveSlug ? "/discovery/" + encodeURIComponent(effectiveSlug) : "/discovery/id/" + encodeURIComponent(s.id || "");
      const name = (s.name || "").trim();
      const city = (s.city || "").trim();
      const loc = [city, country].filter(Boolean).join(", ");
      const logo = s.logo_url || "";
      const placeholder = t2("discovery_placeholder_upload_soon");
      return `<a href="#" class="discovery-card" onclick="event.preventDefault(); window.navigateDiscovery('${path2.replace(/'/g, "\\'")}');">
                        <div class="discovery-card-media">${logo ? `<img src="${String(logo).replace(/"/g, "&quot;")}" alt="" class="discovery-card-logo" />` : `<div class="discovery-card-no-logo"><i data-lucide="image" size="32"></i></div>`}</div>
                        <div class="discovery-card-body">
                            <span class="discovery-card-name">${name ? String(name).replace(/</g, "&lt;") : placeholder}</span>
                            <span class="discovery-card-loc">${loc ? String(loc).replace(/</g, "&lt;") : placeholder}</span>
                        </div>
                    </a>`;
    }).join("")}
            </div>
        </div>
    `).join("") : `<p class="discovery-empty-state">${state.discoveryTab === "teachers" ? t2("discovery_no_teachers") : t2("discovery_no_schools")}</p>`;
    const tabSchoolsActive = state.discoveryTab === "schools";
    const tabTeachersActive = state.discoveryTab === "teachers";
    const tabsHtml = `
        <div class="discovery-tabs" role="tablist" style="display: flex; gap: 0; margin-bottom: 1.25rem; border-radius: 12px; background: var(--system-gray6); padding: 4px; border: 1px solid var(--border);">
            <button type="button" role="tab" aria-selected="${tabSchoolsActive}" onclick="state.discoveryTab='schools'; renderView();" style="flex: 1; padding: 10px 16px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; background: ${tabSchoolsActive ? "var(--surface)" : "transparent"}; color: var(--text-primary); box-shadow: ${tabSchoolsActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none"};">
                ${t2("discovery_tab_schools")}
            </button>
            <button type="button" role="tab" aria-selected="${tabTeachersActive}" onclick="state.discoveryTab='teachers'; renderView();" style="flex: 1; padding: 10px 16px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; background: ${tabTeachersActive ? "var(--surface)" : "transparent"}; color: var(--text-primary); box-shadow: ${tabTeachersActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none"};">
                ${t2("discovery_tab_private_teachers")}
            </button>
        </div>`;
    const resendLabel = _resendVerificationSending ? t2("resend_sending") || "Sending\u2026" : Date.now() >= (_resendVerificationCooldownUntil || 0) ? t2("resend_verification") || "Resend email" : t2("resend_cooldown") || "Sent. Wait 60s";
    const resendDisabled = _resendVerificationSending || Date.now() < (_resendVerificationCooldownUntil || 0);
    const confirmBanner = state.userProfile && state.userProfile.origin === "discovery" && !state.userProfile.email_confirmed ? `<div class="discovery-confirm-banner" style="background: var(--system-gray6); border: 1px solid var(--border); color: var(--text-primary); padding: 12px 16px; border-radius: 12px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;"><div style="flex: 1; min-width: 0;"><span style="font-size: 14px;">${t2("discovery_confirm_email_banner") || "Confirm your email to unlock reviews and adding schools."}</span>${_resendVerificationFeedback === "sent" ? `<p style="margin: 8px 0 0; font-size: 13px; color: var(--system-green);">${t2("resend_success") || "Check your inbox"}</p>` : ""}${_resendVerificationFeedback === "error" ? `<p style="margin: 8px 0 0; font-size: 13px; color: var(--system-red);">${(_resendVerificationErrorMsg || t2("resend_error")).replace(/</g, "&lt;")}</p>` : ""}</div><button type="button" class="resend-verification-btn" ${resendDisabled ? "disabled" : ""} onclick="event.preventDefault(); event.stopPropagation(); if(window.resendVerificationEmail) window.resendVerificationEmail(); return false;" style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--surface); border: 1px solid var(--border); color: var(--text-primary); padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: ${resendDisabled ? "default" : "pointer"}; min-height: 40px; -webkit-tap-highlight-color: transparent;">${resendLabel}</button></div>` : "";
    const hasDancerSession = !!(state.currentUser || state.userProfile);
    const btnCompact = "display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; font-size: 13px; font-weight: 600; border-radius: 12px; border: 1px solid var(--border); background: var(--system-gray6); color: var(--text-primary); text-decoration: none; cursor: pointer; transition: background 0.2s, border-color 0.2s;";
    const btnCompactPrimary = "display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; font-size: 13px; font-weight: 600; border-radius: 12px; border: none; background: var(--text-primary); color: var(--bg-body); text-decoration: none; cursor: pointer; transition: opacity 0.2s;";
    const authLinks = hasDancerSession ? `<button type="button" onclick="state.currentView='dashboard-profile'; window.location.hash='#/dashboard/profile'; saveState(); renderView();" style="${btnCompact}"><i data-lucide="user" size="14"></i>${t2("nav_profile") || "Profile"}</button>` : `<button type="button" onclick="event.preventDefault(); window.navigateDiscovery('/discovery/login');" style="${btnCompactPrimary}">${t2("sign_in") || "Sign in"}</button><button type="button" onclick="event.preventDefault(); window.navigateDiscovery('/discovery/register');" style="${btnCompact}">${t2("sign_up") || "Sign up"}</button>`;
    return `<div class="container discovery-page">${confirmBanner}
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
            <a href="/" class="discovery-back-link" onclick="event.preventDefault(); state.discoveryPath=null; state.currentView='school-selection'; state.currentSchool=null; history.pushState({},'','/'); saveState(); renderView();" style="display: inline-flex;"><i data-lucide="arrow-left" size="16"></i>${t2("discovery_back")}</a>
            <span style="display: flex; align-items: center; gap: 0.5rem;">${authLinks}</span>
        </div>
        <header class="discovery-hero">
            <h1 class="discovery-hero-title">${t2("discovery_title")}</h1>
            <p class="discovery-hero-subtitle">${t2("discovery_subtitle")}</p>
        </header>
        ${tabsHtml}
        <div class="discovery-filters-wrap">${filtersHtml}</div>
        <main class="discovery-content">${cardsHtml}</main>
        <p style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); text-align: center;">
            <button type="button" onclick="event.preventDefault(); state._discoveryOnlyEdit=true; state.currentView='discovery-admin-pick-school'; state.discoveryPath=null; history.pushState({},'','/'); saveState(); renderView();" style="background: none; border: none; padding: 0; font-size: 12px; color: var(--text-muted); cursor: pointer; text-decoration: underline; text-underline-offset: 3px;">${t2("discovery_studio_admin_signin")}</button>
        </p>
    </div>`;
  };
  window.togglePasswordVisibility = function(btn) {
    const wrap = btn && btn.closest && btn.closest(".password-input-wrap");
    const input = wrap && wrap.querySelector("input");
    if (!input) return;
    const isPass = input.type === "password";
    input.type = isPass ? "text" : "password";
    const icon = btn.querySelector("i");
    if (icon) {
      icon.setAttribute("data-lucide", isPass ? "eye-off" : "eye");
      if (window.lucide) window.lucide.createIcons();
    }
  };
  window.openCreateNewCompetition = () => {
    state.competitionId = null;
    state.currentCompetition = null;
    state.competitionRegistrations = [];
    state.competitionTab = "edit";
    state.competitionFormQuestions = [];
    if (state.currentSchool?.id) state.competitionSchoolId = state.currentSchool.id;
    state.jackAndJillFormOpen = true;
    saveState();
    renderView();
  };
  window.openEditCompetition = (id) => {
    state.competitionId = id;
    state.currentCompetition = (state.competitions || []).find((c) => c.id === id) || null;
    if (state.currentCompetition?.school_id) state.competitionSchoolId = state.currentCompetition.school_id;
    state.competitionFormQuestions = state.currentCompetition && Array.isArray(state.currentCompetition.questions) ? [...state.currentCompetition.questions] : [];
    state.jackAndJillFormOpen = true;
    saveState();
    renderView();
  };
  window.closeCompetitionForm = () => {
    state.jackAndJillFormOpen = false;
    state.competitionId = null;
    state.currentCompetition = null;
    state.competitionFormQuestions = [];
    saveState();
    renderView();
  };
  window.fetchCompetitionList = async (schoolId) => {
    if (!supabaseClient || !schoolId) return;
    const { data, error } = await supabaseClient.rpc("competition_list_for_admin", { p_school_id: schoolId });
    state.competitions = !error && Array.isArray(data) ? data : [];
    if (state.competitionId) state.currentCompetition = state.competitions.find((c) => c.id === state.competitionId) || null;
    else state.currentCompetition = null;
    renderView();
  };
  window.fetchCompetitionRegistrations = async (competitionId) => {
    if (!supabaseClient || !competitionId) return;
    const { data } = await supabaseClient.rpc("competition_registrations_list", { p_competition_id: competitionId });
    state.competitionRegistrations = Array.isArray(data) ? data : [];
    renderView();
  };
  var _competitionAutosaveTimer = null;
  window.debouncedAutosaveCompetition = () => {
    if (_competitionAutosaveTimer) clearTimeout(_competitionAutosaveTimer);
    _competitionAutosaveTimer = setTimeout(() => {
      _competitionAutosaveTimer = null;
      autosaveCompetition();
    }, 800);
  };
  window.autosaveCompetition = async () => {
    const statusEl = document.getElementById("comp-autosave-status") || document.getElementById("comp-autosave-status-footer");
    const setStatus = (text, isError = false) => {
      ["comp-autosave-status", "comp-autosave-status-footer"].forEach((id2) => {
        const el = document.getElementById(id2);
        if (el) {
          el.textContent = text;
          el.style.color = isError ? "var(--system-red)" : "var(--text-secondary)";
        }
      });
    };
    const schoolId = state.competitionSchoolId || state.currentSchool?.id;
    if (!schoolId || !supabaseClient) {
      setStatus("", false);
      return;
    }
    const { data: sess } = await supabaseClient.auth.getSession();
    if (!sess?.session?.user) {
      setStatus(window.t("competition_session_expired") || "Session expired. Link your admin account or log in again.", true);
      return;
    }
    const name = (document.getElementById("comp-name") || {}).value?.trim() || "";
    const date = (document.getElementById("comp-date") || {}).value || "";
    const time = (document.getElementById("comp-time") || {}).value || "19:00";
    const id = (document.getElementById("comp-id") || {}).value || "";
    if (!id && (!name || !date)) {
      setStatus("", false);
      return;
    }
    setStatus(window.t("competition_saving") || "Saving...");
    const startsAt = date ? (/* @__PURE__ */ new Date(date + "T" + time + ":00")).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
    const nextSteps = (document.getElementById("comp-next-steps") || {}).value || "";
    const container = document.getElementById("comp-questions-container");
    const questions = container ? Array.from(container.querySelectorAll("input[data-qidx]")).sort((a, b) => parseInt(a.getAttribute("data-qidx"), 10) - parseInt(b.getAttribute("data-qidx"), 10)).map((inp) => inp.value?.trim() || "") : state.competitionFormQuestions || [];
    try {
      if (id) {
        const cur = state.currentCompetition || {};
        const videoEnabled = !!(document.getElementById("comp-video-enabled") || {}).checked;
        const videoPrompt = (document.getElementById("comp-video-prompt") || {}).value?.trim() || "";
        const { data: res, error } = await supabaseClient.rpc("competition_update", {
          p_competition_id: id,
          p_name: name || (cur.name || "Event"),
          p_starts_at: startsAt,
          p_questions: questions,
          p_next_steps_text: nextSteps,
          p_is_active: !!cur.is_active,
          p_is_sign_in_active: !!cur.is_sign_in_active,
          p_video_submission_enabled: videoEnabled,
          p_video_submission_prompt: videoPrompt,
          p_image_url: ""
        });
        if (error) throw new Error(error.message);
        if (res) {
          state.currentCompetition = res;
          state.competitions = (state.competitions || []).map((c) => c.id === id ? res : c);
          setStatus(window.t("competition_saved_indicator") || "Saved");
          ["comp-autosave-status", "comp-autosave-status-footer"].forEach((id2) => {
            const el = document.getElementById(id2);
            if (el) {
              el.style.color = "var(--system-green)";
            }
          });
          setTimeout(() => {
            ["comp-autosave-status", "comp-autosave-status-footer"].forEach((id2) => {
              const e = document.getElementById(id2);
              if (e) e.textContent = "";
            });
          }, 2e3);
        }
      } else {
        const videoEnabled = !!(document.getElementById("comp-video-enabled") || {}).checked;
        const videoPrompt = (document.getElementById("comp-video-prompt") || {}).value?.trim() || "";
        const { data: res, error } = await supabaseClient.rpc("competition_create", {
          p_school_id: schoolId,
          p_name: name || "New Event",
          p_starts_at: startsAt,
          p_questions: questions,
          p_next_steps_text: nextSteps,
          p_video_submission_enabled: videoEnabled,
          p_video_submission_prompt: videoPrompt,
          p_image_url: ""
        });
        if (error) throw new Error(error.message);
        const newComp = res != null && (typeof res === "object" ? res : typeof res === "string" ? JSON.parse(res) : null);
        if (newComp) {
          state.competitions = [newComp, ...state.competitions || []];
          state.currentCompetition = newComp;
          state.competitionId = newComp.id;
          const hid = document.getElementById("comp-id");
          if (hid) hid.value = newComp.id;
          setStatus(window.t("competition_saved_indicator") || "Saved");
          ["comp-autosave-status", "comp-autosave-status-footer"].forEach((id2) => {
            const el = document.getElementById(id2);
            if (el) {
              el.style.color = "var(--system-green)";
            }
          });
          setTimeout(() => {
            ["comp-autosave-status", "comp-autosave-status-footer"].forEach((id2) => {
              const e = document.getElementById(id2);
              if (e) e.textContent = "";
            });
          }, 2e3);
        }
      }
    } catch (e) {
      setStatus(e?.message || "Error", true);
    }
  };
  window.addCompetitionQuestion = () => {
    if (!state.competitionFormQuestions) state.competitionFormQuestions = state.currentCompetition && Array.isArray(state.currentCompetition.questions) ? [...state.currentCompetition.questions] : [];
    state.competitionFormQuestions.push("");
    state.currentCompetition = state.currentCompetition ? { ...state.currentCompetition, questions: state.competitionFormQuestions } : { questions: state.competitionFormQuestions };
    renderView();
    debouncedAutosaveCompetition();
  };
  window.updateCompetitionQuestion = (idx, value) => {
    if (!state.competitionFormQuestions) state.competitionFormQuestions = state.currentCompetition && Array.isArray(state.currentCompetition.questions) ? [...state.currentCompetition.questions] : [];
    state.competitionFormQuestions[idx] = value;
    state.currentCompetition = state.currentCompetition ? { ...state.currentCompetition, questions: state.competitionFormQuestions } : { questions: state.competitionFormQuestions };
    debouncedAutosaveCompetition();
  };
  window.removeCompetitionQuestion = (idx) => {
    if (!state.competitionFormQuestions) state.competitionFormQuestions = state.currentCompetition && Array.isArray(state.currentCompetition.questions) ? [...state.currentCompetition.questions] : [];
    state.competitionFormQuestions.splice(idx, 1);
    state.currentCompetition = state.currentCompetition ? { ...state.currentCompetition, questions: state.competitionFormQuestions } : { questions: state.competitionFormQuestions };
    renderView();
    debouncedAutosaveCompetition();
  };
  window.toggleCompetitionActiveFromStudents = async (id, checked) => {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.rpc("competition_toggle_active", { p_competition_id: id, p_is_active: checked });
    if (data) state.competitions = (state.competitions || []).map((c) => c.id === id ? data || c : c);
    renderView();
  };
  window.toggleCompetitionSignInFromStudents = async (id, checked) => {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.rpc("competition_toggle_sign_in", { p_competition_id: id, p_is_sign_in_active: checked });
    if (data) state.competitions = (state.competitions || []).map((c) => c.id === id ? data || c : c);
    renderView();
  };
  window.publishCompetitionDecisions = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.rpc("competition_publish_decisions", { p_competition_id: id });
    if (!error) {
      state.currentCompetition = state.currentCompetition ? { ...state.currentCompetition, decisions_published_at: (/* @__PURE__ */ new Date()).toISOString() } : null;
      await fetchCompetitionRegistrations(id);
      renderView();
    }
  };
  window.republishCompetitionDecisions = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.rpc("competition_publish_decisions", { p_competition_id: id });
    if (!error) {
      state.currentCompetition = state.currentCompetition ? { ...state.currentCompetition, decisions_published_at: (/* @__PURE__ */ new Date()).toISOString() } : null;
      renderView();
    }
  };
  window.competitionRegistrationDecide = async (regId, status) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.rpc("competition_registration_decide", { p_registration_id: regId, p_status: status });
    if (!error && state.competitionId) await fetchCompetitionRegistrations(state.competitionId);
    renderView();
  };
  window.copyCompetition = async (competitionId) => {
    const t2 = window.t;
    const c = (state.competitions || []).find((x) => x.id === competitionId);
    if (!c) {
      alert(t2("competition_error"));
      return;
    }
    const namePrefix = t2("competition_copy_of") || "Copy of ";
    const copyName = namePrefix + (c.name || "").trim();
    const confirmMsg = (t2("competition_confirm_copy") || 'Create copy as "{name}"? The new event will be inactive.').replace("{name}", copyName);
    if (!confirm(confirmMsg)) return;
    if (!supabaseClient) {
      alert(t2("competition_error"));
      return;
    }
    const { data: newComp, error } = await supabaseClient.rpc("competition_copy", {
      p_competition_id: competitionId,
      p_name_prefix: namePrefix
    });
    if (error) {
      alert(t2("competition_error") + (error?.message ? "\n" + error.message : ""));
      return;
    }
    const schoolId = state.competitionSchoolId || state.currentSchool?.id;
    if (schoolId) window.fetchCompetitionList(schoolId);
    alert(t2("competition_copy_success") || "Event copied.");
    renderView();
  };
  window.deleteCompetition = async (competitionId) => {
    const t2 = window.t;
    if (!confirm(t2("competition_delete_confirm"))) return;
    if (!supabaseClient) {
      alert(t2("competition_error"));
      return;
    }
    const { data: ok, error } = await supabaseClient.rpc("competition_delete", { p_competition_id: competitionId });
    if (error || !ok) {
      alert(t2("competition_error") + (error?.message ? "\n" + error.message : ""));
      return;
    }
    const schoolId = state.competitionSchoolId || state.currentSchool?.id;
    if (schoolId) window.fetchCompetitionList(schoolId);
    if (state.competitionId === competitionId) {
      state.competitionId = null;
      state.currentCompetition = null;
      state.competitionRegistrations = [];
      state.competitionTab = "edit";
    }
    renderView();
  };
  window.openRegistrationAnswers = async (regId) => {
    const modalEl = document.getElementById("registration-answers-modal");
    const bodyEl = document.getElementById("registration-answers-body");
    const titleEl = document.getElementById("registration-answers-title");
    if (!modalEl || !bodyEl) return;
    if (titleEl) titleEl.textContent = "\u2026";
    bodyEl.innerHTML = '<p style="font-size: 15px; margin: 0; color: #8e8e93;">Loading...</p>';
    modalEl.classList.remove("hidden");
    if (!state.currentCompetition && state.competitionId && (state.competitions || []).length > 0) {
      state.currentCompetition = state.competitions.find((c) => String(c.id) === String(state.competitionId)) || null;
    }
    const regs = state.competitionRegistrations || [];
    let reg = regs.find((r) => String(r.id) === String(regId));
    if (!reg && regId && state.competitionId && supabaseClient) {
      const { data: refetched } = await supabaseClient.rpc("competition_registrations_list", { p_competition_id: state.competitionId });
      if (refetched && Array.isArray(refetched)) {
        state.competitionRegistrations = refetched;
        reg = refetched.find((r) => String(r.id) === String(regId)) || null;
      }
    }
    if (reg && regId && supabaseClient) {
      try {
        const { data: byId } = await supabaseClient.rpc("competition_registration_get_by_id_admin", { p_registration_id: regId });
        const row = Array.isArray(byId) ? byId[0] : byId;
        if (row) reg = { ...reg, answers: row.answers ?? reg.answers };
      } catch (_) {
      }
    }
    let questions = state.currentCompetition?.questions;
    if (!Array.isArray(questions)) {
      if (typeof questions === "string") {
        try {
          const p = JSON.parse(questions);
          questions = Array.isArray(p) ? p : [];
        } catch (_) {
          questions = [];
        }
      } else questions = [];
    }
    let answers = {};
    if (reg?.answers) {
      if (typeof reg.answers === "object") answers = reg.answers;
      else if (typeof reg.answers === "string") {
        try {
          answers = JSON.parse(reg.answers) || {};
        } catch (_) {
          answers = {};
        }
      }
    }
    const t2 = window.t;
    const esc = (s) => String(s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    const isDark = document.body.classList.contains("dark-mode");
    const textColor = isDark ? "#ffffff" : "#000000";
    const secondaryColor = "#8e8e93";
    const labelStyle = `font-size: 13px; font-weight: 600; color: ${secondaryColor}; margin-bottom: 6px; display: block;`;
    const valueStyle = `font-size: 16px; color: ${textColor}; line-height: 1.4; display: block;`;
    const pStyle = `color: ${secondaryColor}; font-size: 15px; margin: 0;`;
    let html = "";
    if (!reg) {
      html = `<div style="padding: 16px; width: 100%; box-sizing: border-box;"><p style="${pStyle}">${t2("competition_registration_not_found") || "Registration not found. Try going back and opening Registros again."}</p></div>`;
    } else if (questions.length > 0) {
      html = `<div style="padding: 16px; color: ${textColor}; width: 100%; box-sizing: border-box;">` + questions.map((q, i) => {
        const ans = answers[i] ?? answers[String(i)] ?? "";
        const qEsc = esc(q);
        const ansEsc = esc(ans) || "\u2014";
        return `<div style="margin-bottom: 16px;"><div style="${labelStyle}">${qEsc}</div><div style="${valueStyle}">${ansEsc}</div></div>`;
      }).join("") + `</div>`;
    }
    const answerEntries = Object.entries(answers).filter(([k]) => k !== "video" && String(k).trim() !== "");
    if (html === "" && answerEntries.length > 0) {
      html = `<div style="padding: 16px; color: ${textColor}; width: 100%; box-sizing: border-box;">` + answerEntries.map(
        ([key, val]) => `<div style="margin-bottom: 14px;"><div style="${labelStyle}">${t2("competition_answer") || "Answer"} ${esc(key)}</div><div style="${valueStyle}">${esc(val)}</div></div>`
      ).join("") + `</div>`;
    }
    if (html === "" && reg && answers && Object.keys(answers).filter((k) => k !== "video").length > 0) {
      html = `<div style="padding: 16px; width: 100%; box-sizing: border-box;"><pre style="font-size: 13px; white-space: pre-wrap; word-break: break-all; color: ${textColor};">${esc(JSON.stringify(answers, null, 2))}</pre></div>`;
    }
    if (html === "") {
      const diag = reg ? ` (reg keys: ${Object.keys(reg || {}).join(", ")}; answers type: ${typeof reg?.answers})` : "";
      html = `<div style="padding: 16px; width: 100%; box-sizing: border-box;"><p style="${pStyle}">${t2("competition_no_answers") || "No answers yet."}${diag}</p></div>`;
    }
    const comp = state.currentCompetition;
    const videoPath = answers.video || answers["video"];
    if (comp?.video_submission_enabled && videoPath && supabaseClient) {
      const prompt2 = (comp.video_submission_prompt || t2("competition_video_prompt_placeholder") || "Video").replace(/</g, "&lt;");
      html += `<div style="margin-top: 20px; padding-top: 16px; padding-left: 16px; padding-right: 16px; border-top: 1px solid #38383a;"><div style="font-size: 13px; font-weight: 600; color: ${secondaryColor}; margin-bottom: 8px;">${prompt2}</div>`;
      try {
        const { data: signed } = await supabaseClient.storage.from("competition-videos").createSignedUrl(videoPath, 3600);
        if (signed?.signedUrl) {
          html += `<video src="${signed.signedUrl.replace(/"/g, "&quot;")}" controls style="max-width: 100%; border-radius: 12px; background: #1c1c1e;" preload="metadata"></video>`;
        } else {
          html += `<p style="color: ${secondaryColor}; font-size: 14px;">${t2.competition_video_unavailable || "Video unavailable"}</p>`;
        }
      } catch (_) {
        html += `<p style="color: ${secondaryColor}; font-size: 14px;">${t2.competition_video_unavailable || "Video unavailable"}</p>`;
      }
      html += "</div>";
    }
    bodyEl.innerHTML = html;
    bodyEl.scrollTop = 0;
    if (titleEl) titleEl.textContent = reg?.student_name || reg?.student_id || t2("competition_answers") || "Answers";
    const closeBtn = document.getElementById("registration-answers-close-btn");
    if (closeBtn) closeBtn.textContent = t2("close") || "Close";
    if (typeof lucide !== "undefined") lucide.createIcons();
  };
  window.handleCompetitionVideoSelect = async (fileInput) => {
    const file = fileInput?.files?.[0];
    if (!file || !supabaseClient || !state.competitionId || !state.currentUser?.id) return;
    const schoolId = state.currentUser.school_id || state.currentSchool?.id;
    if (!schoolId) return;
    const statusEl = document.getElementById("student-comp-video-status");
    const setStatus = (msg, isErr = false) => {
      if (statusEl) {
        statusEl.textContent = msg;
        statusEl.style.color = isErr ? "var(--system-red)" : "var(--text-secondary)";
      }
    };
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setStatus(window.t("competition_video_size_error") || "File too large (max 50 MB)", true);
      fileInput.value = "";
      return;
    }
    setStatus(window.t("competition_video_uploading") || "Validating duration...");
    const duration = await new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        URL.revokeObjectURL(v.src);
        resolve(v.duration);
      };
      v.onerror = () => {
        URL.revokeObjectURL(v.src);
        resolve(-1);
      };
      v.src = URL.createObjectURL(file);
    });
    if (duration < 0) {
      setStatus(window.t("competition_video_duration_error") || "Could not read video", true);
      return;
    }
    setStatus(window.t("competition_video_uploading") || "Uploading...");
    const ext = (file.name.match(/\.(mp4|mov|webm)$/i) || ["", "mp4"])[1] || "mp4";
    const path = `${schoolId}/${state.competitionId}/${state.currentUser.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabaseClient.storage.from("competition-videos").upload(path, file);
    if (error) {
      console.error("Competition video upload error:", error);
      const msg = (error.message || "").toLowerCase();
      const hint = msg.includes("row-level security") || msg.includes("policy") || msg.includes("permission") ? " " + (window.t("competition_video_auth_hint") || "(Ensure you are logged in with your student account.)") : "";
      setStatus((window.t("competition_error") || "Upload failed") + ": " + error.message + hint, true);
      return;
    }
    state.studentCompetitionAnswers = state.studentCompetitionAnswers || {};
    state.studentCompetitionAnswers.video = path;
    setStatus("");
    saveStudentCompetitionDraft();
    renderView();
  };
  var _competitionDraftSaveTimer = null;
  window.debouncedSaveCompetitionDraft = () => {
    if (_competitionDraftSaveTimer) clearTimeout(_competitionDraftSaveTimer);
    _competitionDraftSaveTimer = setTimeout(() => {
      _competitionDraftSaveTimer = null;
      saveStudentCompetitionDraft();
    }, 600);
  };
  window.saveStudentCompetitionDraft = async () => {
    const form = document.getElementById("student-comp-form");
    if (!form || !supabaseClient || !state.competitionId || !state.currentUser?.id) return;
    const schoolId = state.currentUser.school_id || state.currentSchool?.id;
    if (!schoolId) return;
    const answers = {};
    form.querySelectorAll("input[data-qidx]").forEach((inp) => {
      const i = inp.getAttribute("data-qidx");
      answers[i] = inp.value || "";
    });
    if (state.studentCompetitionAnswers?.video) answers.video = state.studentCompetitionAnswers.video;
    state.studentCompetitionAnswers = answers;
    const { data } = await supabaseClient.rpc("competition_registration_upsert_draft", {
      p_competition_id: state.competitionId,
      p_student_id: String(state.currentUser.id),
      p_school_id: schoolId,
      p_answers: answers
    });
    if (data) state.studentCompetitionRegDetail = typeof data === "object" ? data : typeof data === "string" ? JSON.parse(data) : null;
  };
  window.submitStudentCompetitionRegistration = async () => {
    if (!supabaseClient || !state.competitionId || !state.currentUser?.id) return;
    const btn = document.getElementById("student-comp-submit-btn");
    if (btn) btn.disabled = true;
    const { data, error } = await supabaseClient.rpc("competition_registration_submit", { p_competition_id: state.competitionId, p_student_id: String(state.currentUser.id) });
    if (error) {
      if (btn) btn.disabled = false;
      alert(window.t("competition_error"));
      return;
    }
    state.studentCompetitionRegDetail = data && (typeof data === "object" ? data : typeof data === "string" ? JSON.parse(data) : null);
    state.studentCompetitionRegDetail = state.studentCompetitionRegDetail ? { ...state.studentCompetitionRegDetail, status: "SUBMITTED" } : { status: "SUBMITTED" };
    state.studentCompetitionRegistration = state.studentCompetitionRegDetail;
    renderView();
  };
  var _renderViewScheduled = false;
  var _lastRenderedView = null;
  var _lastUserInteractionAt2 = 0;
  var _deferredRenderTimer = null;
  function shouldDeferRender() {
    const active = document.activeElement;
    if (active && ["INPUT", "TEXTAREA"].includes(active.tagName || "")) return true;
    if (active && active.getAttribute("contenteditable") === "true") return true;
    if (document.querySelector(".modal:not(.hidden)")) return true;
    if (Date.now() - _lastUserInteractionAt2 < 500) return true;
    return false;
  }
  window.toggleExpandableNoRender = (key) => {
    const map = {
      "adminReg": ["adminRegExpanded", "admin-reg-content", "admin-reg-section"],
      "studentsFilter": ["studentsFilterExpanded", "students-filter-content", "students-filter-expandable"],
      "qrRegistrations": ["qrRegistrationsExpanded", "qr-registrations-content", "qr-registrations-expandable"],
      "additionalFeatures": ["additionalFeaturesExpanded", "additional-features-content", "expandable-section"],
      "revenueFilters": ["adminRevenueFiltersExpanded", "revenue-filters-content", "revenue-filters-expandable"],
      "settingsAdvanced": ["settingsAdvancedExpanded", "settings-advanced-content", "settings-advanced-expandable"],
      "studentPrivateClasses": ["studentPrivateClassesExpanded", "student-private-classes-content", "student-private-classes-expandable"],
      "teacherAcceptedClasses": ["teacherAcceptedClassesExpanded", "teacher-accepted-classes-content", "teacher-accepted-classes-expandable"]
    };
    const entry = map[key];
    if (!entry) return;
    const [stateKey, contentId, containerClass] = entry;
    state[stateKey] = !state[stateKey];
    const content = document.getElementById(contentId);
    const container = document.querySelector(`.${containerClass}`);
    if (content) content.style.display = state[stateKey] ? "" : "none";
    if (container) container.classList.toggle("expanded", !!state[stateKey]);
  };
  function scheduleDeferredRender() {
    if (_deferredRenderTimer) clearTimeout(_deferredRenderTimer);
    _deferredRenderTimer = setTimeout(() => {
      _deferredRenderTimer = null;
      if (!shouldDeferRender()) {
        renderView();
        if (window.lucide) window.lucide.createIcons();
      } else {
        scheduleDeferredRender();
      }
    }, 500);
  }
  window.shouldDeferRender = shouldDeferRender;
  window.scheduleDeferredRender = scheduleDeferredRender;
  function renderView() {
    if (_renderViewScheduled) return;
    _renderViewScheduled = true;
    requestAnimationFrame(() => {
      _renderViewScheduled = false;
      _renderViewImpl();
    });
  }
  window.renderView = renderView;
  function _renderViewImpl() {
    try {
      state._usePlanExpiryFixedDate = state.adminSettings?.plan_expiry_fixed_date === "true" || state.adminSettings?.plan_expiry_fixed_date !== "false" && (state.adminSettings?.monthly_registration_enabled === "true" || !!state.currentSchool?.monthly_registration_enabled);
    } catch (_) {
      state._usePlanExpiryFixedDate = false;
    }
    const root = document.getElementById("app-root");
    const view = state.currentView;
    const isSignup = state.authMode === "signup";
    const viewChanged = view !== _lastRenderedView;
    _lastRenderedView = view;
    if (view === "verify-email" && root) {
      const t2 = (k) => window.t ? window.t(k) : k;
      const token = state.verifyEmailToken || new URLSearchParams(window.location.search).get("token") || (() => {
        const h = (window.location.hash || "").replace(/^#/, "");
        const q = h.split("?")[1] || "";
        return new URLSearchParams(q).get("token");
      })();
      if (!token) {
        root.innerHTML = `<div class="container auth-view"><div class="auth-page-container" style="padding: 2rem;"><p class="text-muted">${t2("verify_email_invalid_link") || "Invalid or expired link."}</p><a href="/discovery" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">${t2("discovery_back") || "Back to discovery"}</a></div></div>`;
      } else {
        root.innerHTML = `<div class="container auth-view"><div class="auth-page-container" style="padding: 2rem;"><p>${t2("verify_email_verifying") || "Verifying..."}</p><div class="spin" style="margin: 1rem auto;"><i data-lucide="loader-2" size="32"></i></div></div></div>`;
        if (window.lucide) window.lucide.createIcons();
        if (typeof window.verifyEmailWithToken === "function") window.verifyEmailWithToken(token);
      }
      return;
    }
    if (view === "dashboard-profile" && root) {
      const t2 = (k) => window.t ? window.t(k) : k;
      (async () => {
        if (!supabaseClient) {
          root.innerHTML = '<div class="container" style="padding: 2rem;"><p class="text-muted">Not connected.</p></div>';
          return;
        }
        const { data: sess } = await supabaseClient.auth.getSession();
        if (!sess?.session?.user) {
          root.innerHTML = `<div class="container auth-view"><div class="auth-page-container" style="padding: 2rem;"><p class="text-muted">${t2("profile_sign_in_required") || "Sign in to edit your profile."}</p><a href="#" onclick="event.preventDefault(); state.discoveryPath='/discovery/login'; history.pushState({},'','/discovery/login'); renderView();" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">${t2("sign_in") || "Sign in"}</a></div></div>`;
          return;
        }
        if (!state.userProfile) {
          const profile = await window.fetchUserProfile();
          if (!profile) {
            const { data: ins } = await supabaseClient.from("profiles").upsert({
              id: sess.session.user.id,
              email: (sess.session.user.email || "").toLowerCase(),
              role: "dancer",
              origin: "discovery",
              email_confirmed: false
            }, { onConflict: "id" }).select().single();
            state.userProfile = ins || (await supabaseClient.from("profiles").select("*").eq("id", sess.session.user.id).single()).data;
          }
        }
        const uid = sess.session.user.id;
        const { data: links } = await supabaseClient.from("profile_school_links").select("school_id").eq("profile_id", uid);
        const schoolIds = (links || []).map((l) => l.school_id).filter(Boolean);
        state.profileLinkedSchools = schoolIds.length && state.schools ? state.schools.filter((s) => schoolIds.includes(s.id)) : [];
        if (schoolIds.length && (!state.schools || state.schools.length === 0)) {
          const { data: schools } = await supabaseClient.from("schools").select("id, name").in("id", schoolIds);
          state.profileLinkedSchools = schools || [];
        }
        if (typeof window.renderDashboardProfileView === "function") {
          root.innerHTML = window.renderDashboardProfileView();
          if (window.lucide) window.lucide.createIcons();
        }
      })();
      root.innerHTML = '<div class="container" style="padding: 2rem;"><p class="text-muted">Loading...</p></div>';
      return;
    }
    if (state.discoveryPath) {
      if (!root) return;
      try {
        const html = typeof window.renderDiscoveryView === "function" ? window.renderDiscoveryView(state.discoveryPath) : "";
        root.innerHTML = html || '<div class="container" style="padding:2rem;text-align:center;"><p>Loading...</p></div>';
        if (window.lucide) window.lucide.createIcons();
      } catch (e) {
        console.error("Discovery render error:", e);
        root.innerHTML = '<div class="container" style="padding:2rem;text-align:center;"><p style="color:var(--text-muted);">Something went wrong. <a href="/" style="color:var(--text-primary); text-decoration:none; font-weight:600;">Go back</a>.</p></div>';
      }
      return;
    }
    if (!root) return;
    try {
      let renderSchoolSelection = function() {
        const schools = state.schools || [];
        const hasSchools = schools.length > 0;
        const triggerLabel = state.currentSchool?.name || (state.loading ? t2.loading_schools : t2.search_school_placeholder || t2.select_school_placeholder);
        return `
            <div class="auth-page-container" style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100dvh; text-align: center; width: 100%;">
                <div class="landing-branding slide-in" style="margin-bottom: 2.5rem;">
                    <img src="logo.png" alt="Bailadmin" class="auth-logo" style="width: 150px; height: 150px; margin-bottom: 0.5rem;">
                    <h1 style="font-size: 2.2rem; letter-spacing: -1.5px; font-weight: 800; margin-bottom: 0.2rem;">Bailadmin</h1>
                    <p class="text-muted" style="font-size: 1rem; opacity: 0.6;">${t2.select_school_subtitle}</p>
                </div>
                
                <div class="school-combobox-container custom-dropdown-container" style="width: 100%; max-width: 300px; margin: 0 auto; z-index: 50;">
                    <div class="school-combobox-trigger" onclick="openSchoolDropdown();" style="width: 100%; box-sizing: border-box;">
                        <span id="school-trigger-label" class="school-combobox-label" style="flex: 1; min-width: 0; font: inherit; color: inherit; text-align: left;">${(triggerLabel ?? "").replace(/</g, "&lt;")}</span>
                        <input type="text" id="school-search-input" class="school-combobox-input school-search-when-open" placeholder="${t2.search_school_placeholder || t2.select_school_placeholder}" value="" autocomplete="off" oninput="filterSchoolDropdown(this.value)" onkeydown="handleSchoolComboboxKeydown(event)" style="display: none;" ${state.loading || !hasSchools ? "disabled" : ""} />
                        <i data-lucide="chevron-down" size="18" class="school-combobox-chevron"></i>
                    </div>
                    <div id="school-dropdown-list" class="custom-dropdown-list school-dropdown-list" style="width: 100%; box-sizing: border-box;">
                        ${hasSchools ? (() => {
          const schoolsList = schools.filter((s) => s.profile_type !== "private_teacher");
          const teachersList = schools.filter((s) => s.profile_type === "private_teacher");
          const getCountry = (s) => (s.country || "").trim() || (t2.dropdown_country_other || "Other");
          const itemHtml = (s, section) => {
            const country = getCountry(s);
            const nameEsc = (s.name || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            const countryEsc = String(country).replace(/"/g, "&quot;");
            const check = state.currentSchool?.id === s.id ? '<i data-lucide="check" size="16"></i>' : "";
            const idEsc = String(s.id).replace(/'/g, "\\'");
            return '<div class="dropdown-item" data-school-id="' + s.id + '" data-school-name="' + nameEsc + '" data-section="' + section + '" data-country="' + countryEsc + `" onclick="event.preventDefault(); selectSchool('` + idEsc + `');"><span>` + nameEsc + "</span>" + check + "</div>";
          };
          const renderByCountry = (list, section) => {
            const byCountry = {};
            list.forEach((s) => {
              const c = getCountry(s);
              if (!byCountry[c]) byCountry[c] = [];
              byCountry[c].push(s);
            });
            const countries = Object.keys(byCountry).sort((a, b) => a.localeCompare(b));
            let html2 = "";
            countries.forEach((c) => {
              const cEsc = String(c).replace(/</g, "&lt;").replace(/"/g, "&quot;");
              html2 += '<div class="school-dropdown-country-header" data-section="' + section + '" data-country="' + cEsc + '" style="padding: 0.35rem 0.75rem 0.15rem; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-secondary); opacity: 0.7;">' + cEsc + "</div>";
              html2 += byCountry[c].map((s) => itemHtml(s, section)).join("");
            });
            return html2;
          };
          let out = "";
          if (schoolsList.length > 0) {
            out += '<div class="school-dropdown-section-header" data-section="schools" style="padding: 0.5rem 0.75rem; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); opacity: 0.85;">' + (t2.dropdown_schools || "Schools") + "</div>";
            out += renderByCountry(schoolsList, "schools");
          }
          if (teachersList.length > 0) {
            out += '<div class="school-dropdown-section-divider" style="border-top: 1px solid var(--border); margin: 0.35rem 0;"></div>';
            out += '<div class="school-dropdown-section-header" data-section="teachers" style="padding: 0.5rem 0.75rem; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); opacity: 0.85;">' + (t2.dropdown_private_teachers || "Private teachers") + "</div>";
            out += renderByCountry(teachersList, "teachers");
          }
          return out;
        })() : `<div class="school-dropdown-empty" style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 14px;">${state.loading ? t2.connecting : t2.could_not_load_schools}</div>`}
                        ${hasSchools ? `<div class="school-dropdown-no-match" style="display: none; padding: 1rem; text-align: center; color: var(--text-muted); font-size: 14px;">${t2.no_schools}</div>` : ""}
                    </div>
                </div>
                ${!hasSchools && !state.loading ? `
                <p class="text-muted" style="font-size: 13px; margin-top: 1rem; max-width: 280px;">${state.schoolsLoadError ? t2.could_not_load_schools : t2.no_schools_yet || t2.no_schools}</p>
                <button type="button" onclick="fetchAllData()" class="btn-secondary" style="margin-top: 0.75rem; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600;">${(t2.retry || "Retry").replace(/</g, "&lt;")}</button>
                ` : ""}
                ${state.discoveryEnabled ? `
                <a href="/discovery" onclick="event.preventDefault(); window.navigateDiscovery('/discovery');" class="discovery-landing-btn">${t2.discover_dance_btn || "Discover all schools"}</a>
                ` : ""}
            </div>
        `;
      };
      const tFn = typeof window.t === "function" ? window.t : (k) => k;
      const t2 = new Proxy(tFn, {
        get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
      });
      const isDevDashboardView = ["platform-dev-dashboard", "platform-school-details", "platform-dev-edit-discovery", "platform-dev-edit-school", "super-admin-dashboard"].includes(view);
      let html = `<div class="container ${view === "auth" ? "auth-view" : ""} ${isDevDashboardView ? "container-dev" : ""} ${viewChanged ? "slide-in" : ""}">`;
      if (view === "school-selection") {
        html += renderSchoolSelection();
      } else if (view === "super-admin-dashboard" || view === "platform-dev-dashboard") {
        const isDev = view === "platform-dev-dashboard";
        const title = isDev ? t2.dev_dashboard_title : "Platform Super Admin";
        const schools = isDev ? state.platformData.schools : state.schools;
        const devTab = state.devDashboardTab || "schools";
        const getSchoolName = (id) => (state.platformData.schools || []).find((s) => s.id === id)?.name || id;
        const showDashboardLoader = isDev && state.loading;
        html += `
            <div class="dev-dashboard-inner">
            <div class="ios-header">
                <div class="ios-large-title" style="letter-spacing: -1.2px;">${title}</div>
                ${isDev ? '<div style="font-size: 13px; color: var(--system-blue); font-weight: 700; padding: 0 1.2rem; margin-top: -5px; letter-spacing: 0.1em; text-transform: uppercase;">' + t2.admin_label + " (God Mode)</div>" : ""}
            </div>
            ${showDashboardLoader ? `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; padding: 2rem; text-align: center;">
                <div class="spin" style="color: var(--system-blue); margin-bottom: 1rem;"><i data-lucide="loader-2" size="48"></i></div>
                <p style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0;">${t2.loading_dashboard || "Opening dashboard..."}</p>
            </div>
            ` : ""}
            ${!showDashboardLoader ? `
            ${isDev ? `
            <div style="display: flex; gap: 8px; padding: 0 1.2rem 1rem; border-bottom: 1px solid var(--border);">
                <button type="button" onclick="state.devDashboardTab='schools'; renderView();" style="padding: 10px 18px; border-radius: 12px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; background: ${devTab === "schools" ? "var(--system-blue)" : "var(--system-gray6)"}; color: ${devTab === "schools" ? "white" : "var(--text-secondary)"}; transition: all 0.2s;">${t2.dev_tab_schools || "Schools"}</button>
                <button type="button" onclick="state.devDashboardTab='audit'; renderView();" style="padding: 10px 18px; border-radius: 12px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; background: ${devTab === "audit" ? "var(--system-blue)" : "var(--system-gray6)"}; color: ${devTab === "audit" ? "white" : "var(--text-secondary)"}; transition: all 0.2s;">${t2.dev_tab_account_audit || "Account Audit"}</button>
            </div>
            ` : ""}
            <div class="dev-dashboard-content" style="padding: 1.2rem;">
                ${devTab === "audit" && isDev ? `
                <div style="margin-bottom: 2rem;">
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; opacity: 0.8;">${t2.dev_audit_students || "Students"} (${(state.platformData.students || []).length})</div>
                    <div class="ios-list" style="overflow-x: auto; margin-bottom: 2rem;">
                        ${(state.platformData.students || []).length === 0 ? '<div style="padding: 2rem; color: var(--text-secondary); text-align: center;">' + (t2.no_data_msg || "No data") + "</div>" : (state.platformData.students || []).map((st) => {
          const linked = !!st.user_id;
          const schoolName = getSchoolName(st.school_id);
          return `<div class="ios-list-item" style="padding: 12px 16px; display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center; flex-wrap: wrap;">
                                <div><span style="font-weight: 700;">${(st.name || st.id || "").replace(/</g, "&lt;")}</span><span style="font-size: 11px; color: var(--text-secondary); margin-left: 8px;">${schoolName}</span></div>
                                <div style="font-size: 10px; font-family: monospace; color: var(--text-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis;">${linked ? (st.user_id || "").substring(0, 8) + "\u2026" : "\u2014"}</div>
                                <span style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px; ${linked ? "background: rgba(52, 199, 89, 0.15); color: var(--system-green);" : "background: rgba(255, 59, 48, 0.15); color: var(--system-red);"}">${linked ? t2.dev_audit_linked || "Linked" : t2.dev_audit_not_linked || "Not linked"}</span>
                            </div>`;
        }).join("")}
                    </div>
                </div>
                <div>
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; opacity: 0.8;">${t2.dev_audit_admins || "Admins"} (${(state.platformData.admins || []).length})</div>
                    <div class="ios-list" style="overflow-x: auto;">
                        ${(state.platformData.admins || []).length === 0 ? '<div style="padding: 2rem; color: var(--text-secondary); text-align: center;">' + (t2.no_data_msg || "No data") + "</div>" : (state.platformData.admins || []).map((ad) => {
          const linked = !!ad.user_id;
          const schoolName = getSchoolName(ad.school_id);
          return `<div class="ios-list-item" style="padding: 12px 16px; display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center;">
                                <div><span style="font-weight: 700;">${(ad.username || ad.id || "").replace(/</g, "&lt;")}</span><span style="font-size: 11px; color: var(--text-secondary); margin-left: 8px;">${schoolName}</span></div>
                                <div style="font-size: 10px; font-family: monospace; color: var(--text-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis;">${linked ? (ad.user_id || "").substring(0, 8) + "\u2026" : "\u2014"}</div>
                                <span style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px; ${linked ? "background: rgba(52, 199, 89, 0.15); color: var(--system-green);" : "background: rgba(255, 59, 48, 0.15); color: var(--system-red);"}">${linked ? t2.dev_audit_linked || "Linked" : t2.dev_audit_not_linked || "Not linked"}</span>
                            </div>`;
        }).join("")}
                    </div>
                </div>
                ` : devTab === "schools" || !isDev ? `
                ${isDev ? `
                    ${!state.platformAdminLinked ? `
                    <div class="card" style="margin-bottom: 1.5rem; padding: 1.25rem; border-radius: 20px; border: 1px solid var(--border); background: linear-gradient(135deg, rgba(0,122,255,0.06) 0%, transparent 100%);">
                        <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;"><i data-lucide="link" size="14" style="vertical-align: middle; margin-right: 6px;"></i> Enable username + password login (one-time)</div>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">So you can always sign in with &quot;${state.currentUser && state.currentUser.name ? state.currentUser.name.replace(/\s*\(Dev\)\s*$/i, "").trim() : "you"}&quot; and your password (no email needed). Enter your <strong>current password</strong>:</p>
                        <div class="password-input-wrap" style="margin-bottom: 10px;">
                            <input type="password" id="platform-link-password" placeholder="Your current Dev password" autocomplete="off" style="width: 100%; padding: 12px 44px 12px 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 14px; box-sizing: border-box;" />
                            <button type="button" class="password-toggle-btn" onclick="window.togglePasswordVisibility(this)" aria-label="Show password" style="right: 8px;"><i data-lucide="eye" size="18"></i></button>
                        </div>
                        <button type="button" class="btn-primary" onclick="window.linkPlatformAdminAccount()" style="width: 100%; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 700;">Enable username login</button>
                    </div>
                    ` : ""}
                    <!-- PREMIUM STATS -->
                    <div class="dev-stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2.5rem;">
                        <div class="dev-stat-card" style="background: var(--bg-card); padding: 1.5rem; border-radius: 24px; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.05); position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -10px; right: -10px; opacity: 0.05; color: var(--system-blue); transform: rotate(-15deg);"><i data-lucide="building-2" size="80"></i></div>
                            <div style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.08em; opacity: 0.7;">${t2.dev_stats_schools}</div>
                            <div class="dev-stat-value" style="font-size: 32px; font-weight: 900; letter-spacing: -1px; color: var(--text-primary);">${state.platformData.schools.length}</div>
                        </div>
                        <div class="dev-stat-card" style="background: var(--bg-card); padding: 1.5rem; border-radius: 24px; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.05); position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -10px; right: -10px; opacity: 0.05; color: var(--system-green); transform: rotate(-15deg);"><i data-lucide="users" size="80"></i></div>
                            <div style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.08em; opacity: 0.7;">${t2.dev_stats_students}</div>
                            <div class="dev-stat-value" style="font-size: 32px; font-weight: 900; letter-spacing: -1px; color: var(--text-primary);">${state.platformData.students.length}</div>
                        </div>
                    </div>
                    <!-- Discovery site toggle -->
                    <div class="card dev-discovery-card" style="margin-bottom: 1.5rem; padding: 1.25rem; border-radius: 20px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-weight: 700; font-size: 15px; color: var(--text-primary);">${t2.dev_discovery_site || "Discovery site"}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${t2.discovery_title || "Discover Dance"} ${t2.dev_discovery_toggle_on ? "\u2014 " + (state.platformData.discoveryEnabled ? t2.dev_discovery_toggle_on : t2.dev_discovery_toggle_off) : ""}</div>
                        </div>
                        <button type="button" onclick="window.setDiscoveryEnabled(!(state.platformData.discoveryEnabled === true))" style="width: 56px; height: 32px; border-radius: 16px; border: none; cursor: pointer; background: ${state.platformData.discoveryEnabled === true ? "var(--system-blue)" : "var(--system-gray5)"}; transition: background 0.2s; position: relative;"><span style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: white; top: 3px; left: ${state.platformData.discoveryEnabled === true ? "27px" : "3px"}; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></span></button>
                    </div>
                ` : ""}

                <div class="dev-active-schools-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 0 0.2rem;">
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); opacity: 0.8;">${t2.dev_active_schools}</div>
                    <button class="btn-primary" onclick="${isDev ? "createNewSchoolWithAdmin()" : "createNewSchool()"}" style="padding: 10px 20px; font-size: 13px; font-weight: 700; height: auto; border-radius: 14px; box-shadow: var(--shadow-sm);"><i data-lucide="plus" size="14" style="margin-right: 6px;"></i> ${t2.add_school_btn}</button>
                </div>

                <div class="dev-schools-grid">
                    ${schools.map((s) => {
          const schoolStudents = state.platformData.students.filter((st) => st.school_id === s.id).length;
          const schoolAdmins = state.platformData.admins.filter((a) => a.school_id === s.id).map((a) => a.username).join(", ");
          return `
                            <div class="card card-premium dev-school-card" style="padding: 1.8rem; border-radius: 28px; display: flex; flex-direction: column; gap: 1.4rem; background: var(--bg-card); border: 1.5px solid var(--border); transition: all 0.4s var(--transition); position: relative;">
                                <div class="dev-school-card-header" style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1;">
                                        <div style="font-size: 20px; font-weight: 900; margin-bottom: 4px; letter-spacing: -0.5px; color: var(--text-primary);">${s.name}${s.profile_type === "private_teacher" ? ' <span style="font-size: 10px; font-weight: 700; color: var(--system-orange, #ff9500); background: rgba(255,149,0,0.12); padding: 2px 8px; border-radius: 6px; vertical-align: middle; margin-left: 6px; letter-spacing: 0.03em;">' + (t2.profile_type_private_teacher || "Private Teacher") + "</span>" : ""}</div>
                                        <div style="font-size: 10px; color: var(--text-secondary); opacity: 0.5; font-family: monospace; letter-spacing: 0.05em;">${s.id}</div>
                                    </div>
                                    <div class="dev-school-card-controls" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                        ${isDev ? `
                                        <div class="dev-school-toggle-row" style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; background: var(--system-gray6); border-radius: 12px; min-width: 140px;">
                                            <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">${t2.school_on_platform || "On the platform"}</span>
                                            <button type="button" onclick="window.toggleSchoolActive('${escapeHtml(s.id)}', ${s.active !== false})" title="${(t2.school_on_platform || "On the platform").replace(/"/g, "&quot;")}" style="width: 48px; height: 28px; border-radius: 14px; border: none; cursor: pointer; background: ${s.active !== false ? "var(--system-green)" : "var(--system-gray5)"}; transition: background 0.2s; position: relative; flex-shrink: 0;"><span style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: white; top: 3px; left: ${s.active !== false ? "23px" : "3px"}; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></span></button>
                                        </div>
                                        <div class="dev-school-toggle-row" style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; background: var(--system-gray6); border-radius: 12px; min-width: 140px;">
                                            <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">${t2.school_on_discovery || "On discovery"}</span>
                                            <button type="button" onclick="window.toggleSchoolDiscoveryVisible('${escapeHtml(s.id)}', ${s.discovery_visible !== false})" title="${(t2.school_on_discovery || "On discovery").replace(/"/g, "&quot;")}" style="width: 48px; height: 28px; border-radius: 14px; border: none; cursor: pointer; background: ${s.discovery_visible !== false ? "var(--system-blue)" : "var(--system-gray5)"}; transition: background 0.2s; position: relative; flex-shrink: 0;"><span style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: white; top: 3px; left: ${s.discovery_visible !== false ? "23px" : "3px"}; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></span></button>
                                        </div>
                                        ` : ""}
                                        <div style="font-size: 11px; font-weight: 800; color: var(--system-blue); background: rgba(0, 122, 255, 0.08); padding: 5px 12px; border-radius: 14px; letter-spacing: 0.02em; border: 1px solid rgba(0, 122, 255, 0.1);">
                                            ${schoolStudents} ${t2.dev_students_label.toUpperCase()}
                                        </div>
                                        <button type="button" class="btn-icon" data-action="rename-school" data-school-id="${s.id}" data-school-name="${(s.name || "").replace(/"/g, "&quot;")}" style="color: var(--system-blue); opacity: 0.85; padding: 6px; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.opacity='1'; this.style.background='rgba(0, 122, 255, 0.15)'" onmouseout="this.style.opacity='0.85'; this.style.background='transparent'" title="${(t2.rename_school_btn || "Rename").replace(/"/g, "&quot;")}">
                                            <i data-lucide="pencil" size="18"></i>
                                        </button>
                                        <button type="button" class="btn-icon" data-action="delete-school" data-school-id="${s.id}" style="color: var(--system-red); opacity: 0.85; padding: 6px; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.opacity='1'; this.style.background='rgba(255, 59, 48, 0.15)'" onmouseout="this.style.opacity='0.85'; this.style.background='transparent'" title="${(t2.delete_school_btn || "Delete School").replace(/"/g, "&quot;")}">
                                            <i data-lucide="trash-2" size="18"></i>
                                        </button>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: var(--system-gray6); border-radius: 16px; border: 1px solid rgba(0,0,0,0.02);">
                                    <i data-lucide="shield" size="14" style="color: var(--system-blue); opacity: 0.8;"></i>
                                    <div style="font-size: 13px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">
                                        <span style="font-weight: 700; color: var(--text-primary); opacity: 0.7;">${t2.dev_admins_label}:</span> ${schoolAdmins || "N/A"}
                                    </div>
                                </div>
                                <div class="dev-school-card-actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 5px;">
                                    <button class="btn-secondary" onclick="state.selectedDevSchoolId='${s.id}'; state.currentView='platform-school-details'; renderView();" style="width: 100%; border-radius: 16px; height: 50px; font-size: 14px; font-weight: 700; background: var(--system-gray6); color: var(--text-primary); border: 1px solid var(--border); box-shadow: none;">
                                        <i data-lucide="info" size="14" style="margin-right: 6px; opacity: 0.6;"></i> ${t2.dev_view_details}
                                    </button>
                                    <button class="btn-primary" onclick="const sch=state.platformData?.schools?.find(x=>x.id==='${s.id}')||state.schools?.find(x=>x.id==='${s.id}'); state.currentSchool=sch||{id:'${s.id}',name:'${s.name}',jack_and_jill_enabled:false}; state.isAdmin=true; state.currentView='admin-students'; fetchAllData();" style="width: 100%; border-radius: 16px; height: 50px; font-size: 14px; font-weight: 700; background: var(--text-primary); color: var(--bg-body); box-shadow: var(--shadow-sm);">
                                        <i data-lucide="external-link" size="14" style="margin-right: 6px;"></i> ${t2.dev_enter_as_admin}
                                    </button>
                                </div>
                            </div>
                        `;
        }).join("")}
                </div>

                ${isDev && state.platformData.platform_admins && state.platformData.platform_admins.length > 0 ? `
                <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin: 2.5rem 0 1rem; padding: 0 0.2rem; opacity: 0.8;">Platform Admins (Dev Access)</div>
                <div class="ios-list" style="margin-bottom: 2rem;">
                    ${state.platformData.platform_admins.map((pa) => `
                        <div class="ios-list-item" style="padding: 14px 16px; border-bottom: 1px solid var(--border);">
                            <div style="font-weight: 800; font-size: 15px;">${pa.username || pa.id}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;"><i data-lucide="key" size="10" style="vertical-align: middle;"></i> ${t2.password_label}: <span style="font-family: monospace;">${pa.password || "\u2014"}</span></div>
                        </div>
                    `).join("")}
                </div>
                ` : ""}
                ` : ""}
            </div>
            ` : ""}
            </div>
        `;
      } else if (view === "platform-add-school") {
        html += `
            <div class="ios-header" style="background: transparent; padding-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 0 0.5rem;">
                    <button type="button" class="btn-back" onclick="state.currentView='platform-dev-dashboard'; renderView();">
                        <i data-lucide="chevron-left" size="20" style="margin-right: 2px;"></i>
                    </button>
                    <div style="font-size: 11px; color: var(--system-blue); font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">${t2.dev_dashboard_title}</div>
                </div>
                <div class="ios-large-title" style="letter-spacing: -1.2px;">${t2.add_school_title}</div>
            </div>

            <div style="padding: 1.2rem;">
                <!-- PROFILE TYPE SELECTOR -->
                <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; padding: 0 0.5rem; opacity: 0.7;">${t2.profile_type_label || "Profile type"}</div>
                <div class="ios-list" style="margin-bottom: 2.5rem; overflow: hidden;">
                    <div class="ios-list-item" style="padding: 6px; border-bottom: none;">
                        <div id="profile-type-selector" style="display: flex; width: 100%; border-radius: 12px; background: var(--bg-body); overflow: hidden; gap: 4px;">
                            <button type="button" id="profile-type-school" class="profile-type-btn active" onclick="window.selectProfileType('school')" style="flex: 1; padding: 12px 8px; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.25s;">
                                <i data-lucide="school" size="16"></i> ${t2.profile_type_school || "School"}
                            </button>
                            <button type="button" id="profile-type-teacher" class="profile-type-btn" onclick="window.selectProfileType('private_teacher')" style="flex: 1; padding: 12px 8px; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.25s;">
                                <i data-lucide="user-check" size="16"></i> ${t2.profile_type_private_teacher || "Private Teacher"}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- SCHOOL INFO -->
                <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; padding: 0 0.5rem; opacity: 0.7;">${t2.school_info_section}</div>
                <div class="ios-list" style="margin-bottom: 2.5rem; overflow: hidden;">
                    <div class="ios-list-item" style="padding: 16px; border-bottom: none;">
                        <div style="width: 100%;">
                            <div style="font-size: 12px; font-weight: 800; color: var(--system-blue); margin-bottom: 6px; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.05em;">${t2.enter_school_name || "Academy Name"}</div>
                            <input type="text" id="new-school-name" placeholder="e.g. Tanzstudio Berlin" style="width: 100%; border: none; background: transparent; color: var(--text-primary); outline: none; font-size: 17px; font-weight: 700; padding: 0; letter-spacing: -0.3px;">
                        </div>
                    </div>
                </div>

                <!-- ADMIN INFO -->
                <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; padding: 0 0.5rem; opacity: 0.7;">${t2.admin_info_section}</div>
                <div class="ios-list" style="margin-bottom: 3.5rem; overflow: hidden;">
                    <div class="ios-list-item" style="padding: 16px; border-bottom: 1px solid var(--border);">
                        <div style="width: 100%;">
                            <div style="font-size: 12px; font-weight: 800; color: var(--system-blue); margin-bottom: 6px; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.05em;">${t2.admin_name_label || "Admin name"}</div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i data-lucide="user" size="14" style="opacity: 0.3;"></i>
                                <input type="text" id="new-school-admin-name" placeholder="e.g. Mar\xEDa Garc\xEDa" style="width: 100%; border: none; background: transparent; color: var(--text-primary); outline: none; font-size: 17px; font-weight: 700; padding: 0; letter-spacing: -0.3px;">
                            </div>
                        </div>
                    </div>
                    <div class="ios-list-item" style="padding: 16px; border-bottom: 1px solid var(--border);">
                        <div style="width: 100%;">
                            <div style="font-size: 12px; font-weight: 800; color: var(--system-blue); margin-bottom: 6px; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.05em;">${t2.admin_email_label || "Admin email"}</div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i data-lucide="mail" size="14" style="opacity: 0.3;"></i>
                                <input type="email" id="new-school-admin-email" placeholder="admin@example.com" style="width: 100%; border: none; background: transparent; color: var(--text-primary); outline: none; font-size: 17px; font-weight: 700; padding: 0; letter-spacing: -0.3px;">
                            </div>
                        </div>
                    </div>
                    <div class="ios-list-item" style="padding: 16px; border-bottom: none;">
                        <div style="width: 100%;">
                            <div style="font-size: 12px; font-weight: 800; color: var(--system-blue); margin-bottom: 6px; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.05em;">${t2.password}</div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i data-lucide="key" size="14" style="opacity: 0.3;"></i>
                                <input type="text" id="new-school-admin-pass" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" style="width: 100%; border: none; background: transparent; color: var(--text-primary); outline: none; font-size: 17px; font-weight: 700; padding: 0; letter-spacing: -0.3px;">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DISCOVERY PROFILE (OPTIONAL) -->
                <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; padding: 0 0.5rem; opacity: 0.7;">${t2.dev_discovery_optional}</div>
                <div class="ios-list" style="margin-bottom: 2rem; overflow: hidden;">
                    <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 6px;">
                        <span style="font-size: 14px; opacity: 0.8;">${t2.discovery_slug_label}</span>
                        <input type="text" id="new-school-discovery-slug" placeholder="${t2.discovery_slug_placeholder || "e.g. royal_latin"}" style="width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none; box-sizing: border-box;">
                    </div>
                    <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 6px;">
                        <span style="font-size: 14px; opacity: 0.8;">${t2.country_label}</span>
                        <select id="new-school-country" onchange="window.updateNewSchoolCityOptions()" style="width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none; box-sizing: border-box;"><option value="">\u2014</option>${DISCOVERY_COUNTRIES.map((c) => `<option value="${String(c).replace(/"/g, "&quot;")}">${String(c).replace(/</g, "&lt;")}</option>`).join("")}</select>
                    </div>
                    <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 6px;">
                        <span style="font-size: 14px; opacity: 0.8;">${t2.city_label}</span>
                        <select id="new-school-city" style="width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none; box-sizing: border-box;"><option value="">\u2014</option></select>
                    </div>
                    <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 6px;">
                        <span style="font-size: 14px; opacity: 0.8;">${t2.discovery_description_label}</span>
                        <textarea id="new-school-discovery-description" rows="2" placeholder="Short description for discovery page" style="width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none; box-sizing: border-box; resize: vertical;"></textarea>
                    </div>
                    <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 6px;">
                        <span style="font-size: 14px; opacity: 0.8;">${t2.discovery_genres_label}</span>
                        <input type="text" id="new-school-discovery-genres" placeholder="Salsa, Bachata" style="width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <!-- ACTIONS -->
                <div style="padding: 0 0.5rem;">
                    <button type="button" class="btn-primary" data-action="submit-new-school" style="width: 100%; border-radius: 20px; height: 60px; font-size: 17px; font-weight: 900; box-shadow: var(--shadow-lg); background: var(--text-primary); color: var(--bg-body); transition: all 0.3s; cursor: pointer;" onmouseover="this.style.transform='scale(1.01)'; this.style.filter='brightness(1.1)'" onmouseout="this.style.transform='scale(1)'; this.style.filter='brightness(1)'">
                        <i data-lucide="sparkles" size="18" style="margin-right: 10px;"></i> ${t2.create_school_btn}
                    </button>
                    <button class="btn-secondary" onclick="state.currentView='platform-dev-dashboard'; renderView();" style="width: 100%; background: transparent; border: none; color: var(--system-red); font-weight: 700; margin-top: 1.2rem; font-size: 15px; opacity: 0.8;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">
                        ${t2.cancel}
                    </button>
                </div>
            </div>
        `;
      } else if (view === "platform-school-details") {
        const schoolId = state.selectedDevSchoolId;
        const school = state.platformData.schools.find((s) => s.id === schoolId);
        if (!school) {
          html += `<div style="padding:2rem;">${t2.not_found_msg}. <button class="btn-primary" onclick="state.currentView='platform-dev-dashboard'; renderView();">${t2.dev_volver_dashboard}</button></div>`;
        } else {
          const students = state.platformData.students.filter((s) => s.school_id === schoolId);
          const admins = state.platformData.admins.filter((a) => a.school_id === schoolId);
          const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const classes = state.platformData.classes.filter((c) => c.school_id === schoolId).sort((a, b) => {
            const ia = daysOrder.indexOf(a.day);
            const ib = daysOrder.indexOf(b.day);
            const dayDiff = (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
            if (dayDiff !== 0) return dayDiff;
            return (a.time || "").localeCompare(b.time || "");
          });
          const subs = state.platformData.subscriptions.filter((s) => s.school_id === schoolId);
          const jjEnabled = !!school.jack_and_jill_enabled;
          const eventsPkgsEnabled = school.events_packages_enabled !== false;
          const privatePkgsEnabled = school.private_packages_enabled !== false;
          const monthlyRegEnabled = !!school.monthly_registration_enabled;
          html += `
                <div class="platform-school-details-page">
                    <div class="platform-school-detail-header">
                        <div class="platform-school-detail-nav">
                            <button type="button" class="btn-back" onclick="state.currentView='platform-dev-dashboard'; renderView();">
                                <i data-lucide="arrow-left" size="20"></i>
                            </button>
                            <span class="platform-school-detail-badge">${t2.dev_school_inspector}</span>
                        </div>
                        <div class="platform-school-hero">
                            <div class="platform-school-hero-icon"><i data-lucide="building-2" size="36"></i></div>
                            <h1 class="platform-school-title">${(school.name || "").replace(/</g, "&lt;")}</h1>
                            <div class="platform-school-id">${String(schoolId).slice(0, 8)}\u2026</div>
                            <button class="platform-school-enter-btn" onclick="const s=state.platformData.schools.find(x=>x.id==='${school.id}'); state.currentSchool=s||{id:'${school.id}',name:'${school.name}',jack_and_jill_enabled:${jjEnabled},events_packages_enabled:${eventsPkgsEnabled},private_packages_enabled:${privatePkgsEnabled},monthly_registration_enabled:${monthlyRegEnabled},currency:'${(school.currency || "MXN").replace(/'/g, "\\'")}'}; state.isAdmin=true; state.currentView='admin-students'; fetchAllData();">
                                <i data-lucide="shield-check" size="20"></i> ${t2.dev_enter_as_admin}
                            </button>
                        </div>
                    </div>
                    <div class="platform-school-detail-body">
                        <div class="platform-settings-group">
                            <div class="platform-setting-row platform-setting-row-monthly">
                                <div class="platform-setting-info">
                                    <div class="platform-setting-icon platform-setting-icon-green"><i data-lucide="calendar-range" size="22"></i></div>
                                    <div>
                                        <div class="platform-setting-title">${t2.dev_monthly_registration_feature || "Monthly class registration"}</div>
                                        <div class="platform-setting-desc">${t2.dev_monthly_registration_feature_desc || "Allow this school to offer monthly class registration and fixed expiry date on plans"}</div>
                                    </div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" class="toggle-switch-input" ${monthlyRegEnabled ? "checked" : ""} onchange="toggleSchoolMonthlyRegistration('${school.id}', this.checked)"><span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span></label>
                            </div>
                            <div class="platform-setting-row">
                                <div class="platform-setting-info">
                                    <div class="platform-setting-icon platform-setting-icon-blue"><i data-lucide="ticket" size="22"></i></div>
                                    <div>
                                        <div class="platform-setting-title">${t2.dev_events_packages_feature || "Events as packages"}</div>
                                        <div class="platform-setting-desc">${t2.dev_events_packages_feature_desc || "Allow this school to offer events in packages"}</div>
                                    </div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" class="toggle-switch-input" ${eventsPkgsEnabled ? "checked" : ""} onchange="toggleSchoolEventsPackagesEnabled('${school.id}', this.checked)"><span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span></label>
                            </div>
                            <div class="platform-setting-row">
                                <div class="platform-setting-info">
                                    <div class="platform-setting-icon platform-setting-icon-purple"><i data-lucide="user" size="22"></i></div>
                                    <div>
                                        <div class="platform-setting-title">${t2.dev_private_packages_feature || "Private classes as packages"}</div>
                                        <div class="platform-setting-desc">${t2.dev_private_packages_feature_desc || "Allow this school to offer private classes in packages"}</div>
                                    </div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" class="toggle-switch-input" ${privatePkgsEnabled ? "checked" : ""} onchange="toggleSchoolPrivatePackagesEnabled('${school.id}', this.checked)"><span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span></label>
                            </div>
                            <div class="platform-setting-row">
                                <div class="platform-setting-info">
                                    <div class="platform-setting-icon platform-setting-icon-orange"><i data-lucide="trophy" size="22"></i></div>
                                    <div>
                                        <div class="platform-setting-title">${t2.dev_events_feature}</div>
                                        <div class="platform-setting-desc">${t2.dev_events_feature_desc}</div>
                                    </div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" class="toggle-switch-input" ${jjEnabled ? "checked" : ""} onchange="toggleSchoolJackAndJill('${school.id}', this.checked)"><span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span></label>
                            </div>
                            <div class="platform-setting-row">
                                <div class="platform-setting-info">
                                    <div class="platform-setting-icon platform-setting-icon-green"><i data-lucide="banknote" size="22"></i></div>
                                    <div>
                                        <div class="platform-setting-title">Currency</div>
                                        <div class="platform-setting-desc">Plan prices in this currency</div>
                                    </div>
                                </div>
                                <select class="platform-setting-select" onchange="toggleSchoolCurrency('${school.id}', this.value)">
                                    <option value="MXN" ${(school.currency || "MXN") === "MXN" ? "selected" : ""}>MXN</option>
                                    <option value="CHF" ${(school.currency || "MXN") === "CHF" ? "selected" : ""}>CHF</option>
                                    <option value="USD" ${(school.currency || "MXN") === "USD" ? "selected" : ""}>USD</option>
                                    <option value="COP" ${(school.currency || "MXN") === "COP" ? "selected" : ""}>COP</option>
                                </select>
                            </div>
                        </div>
                        <div class="platform-edit-group">
                            <button type="button" class="platform-edit-row" onclick="state.currentSchool=state.platformData.schools.find(x=>x.id==='${school.id}')||{}; state._devEditSchoolReturnView='platform-school-details'; state._devEditSchoolReturnSchoolId='${school.id}'; state.currentView='platform-dev-edit-school'; fetchAllData(); renderView();">
                                <div class="platform-setting-info">
                                    <div class="platform-setting-icon platform-setting-icon-purple"><i data-lucide="building-2" size="20"></i></div>
                                    <div>
                                        <div class="platform-setting-title">${t2.dev_edit_school_info || "Edit school info"}</div>
                                        <div class="platform-setting-desc">${t2.school_name_label || "Name"}, ${t2.address_label || "Address"}</div>
                                    </div>
                                </div>
                                <i data-lucide="chevron-right" size="18" class="platform-edit-chevron"></i>
                            </button>
                            <button type="button" class="platform-edit-row" onclick="state.currentSchool=state.platformData.schools.find(x=>x.id==='${school.id}')||{}; state._devDiscoveryReturnView='platform-school-details'; state._devDiscoveryReturnSchoolId='${school.id}'; state.currentView='platform-dev-edit-discovery'; fetchAllData(); renderView();">
                                <div class="platform-setting-info">
                                    <div class="platform-setting-icon platform-setting-icon-blue"><i data-lucide="globe" size="20"></i></div>
                                    <div>
                                        <div class="platform-setting-title">${t2.dev_edit_discovery_profile || "Edit discovery profile"}</div>
                                        <div class="platform-setting-desc">${t2.dev_discovery_profile_desc || "Slug, logo, genres"}</div>
                                    </div>
                                </div>
                                <i data-lucide="chevron-right" size="18" class="platform-edit-chevron"></i>
                            </button>
                        </div>
                        <div class="platform-stats-grid">
                            <div class="platform-stat-card"><div class="platform-stat-icon platform-stat-icon-blue"><i data-lucide="users" size="18"></i></div><div class="platform-stat-value">${students.length}</div><div class="platform-stat-label">${t2.dev_students_label}</div></div>
                            <div class="platform-stat-card"><div class="platform-stat-icon platform-stat-icon-green"><i data-lucide="credit-card" size="18"></i></div><div class="platform-stat-value">${subs.length}</div><div class="platform-stat-label">${t2.dev_plans_label}</div></div>
                            <div class="platform-stat-card"><div class="platform-stat-icon platform-stat-icon-orange"><i data-lucide="calendar" size="18"></i></div><div class="platform-stat-value">${classes.length}</div><div class="platform-stat-label">${t2.dev_classes_label}</div></div>
                            <div class="platform-stat-card"><div class="platform-stat-icon platform-stat-icon-red"><i data-lucide="shield" size="18"></i></div><div class="platform-stat-value">${admins.length}</div><div class="platform-stat-label">${t2.dev_admins_label}</div></div>
                        </div>
                        <div class="platform-section">
                            <h3 class="platform-section-title">${t2.dev_admins_label}</h3>
                            <div class="platform-list platform-list-admins">
                                ${admins.length > 0 ? admins.map((a) => `
                                    <div class="platform-list-item">
                                        <div class="platform-list-avatar">${a.username.charAt(0).toUpperCase()}</div>
                                        <div class="platform-list-content">
                                            <div class="platform-list-title">${a.username}</div>
                                            <div class="platform-list-meta"><i data-lucide="key" size="12"></i> ${t2.password_label}: <span class="platform-list-mono">${a.password || "\u2014"}</span></div>
                                        </div>
                                    </div>
                                `).join("") : `<div class="platform-list-empty">${t2.dev_no_admins}</div>`}
                            </div>
                        </div>
                        <div class="platform-section">
                            <div class="platform-section-header">
                                <h3 class="platform-section-title">${t2.dev_students_label}</h3>
                                <span class="platform-section-badge">${students.length}</span>
                            </div>
                            <div class="platform-list platform-list-students">
                                ${students.length > 0 ? students.map((s) => `
                                    <div class="platform-list-item platform-list-item-student">
                                        <div class="platform-list-content">
                                            <div class="platform-list-title">${s.name}</div>
                                            <div class="platform-list-meta">${s.phone || "\u2014"} ${s.email ? " \u2022 " + s.email : ""}</div>
                                            <div class="platform-list-meta platform-list-meta-small"><i data-lucide="key" size="10"></i> ${t2.password_label}: <span class="platform-list-mono">${s.password || "\u2014"}</span></div>
                                        </div>
                                        <div class="platform-list-balance">
                                            <div class="platform-list-balance-value">${s.balance === null ? "\u221E" : s.balance}</div>
                                            <div class="platform-list-balance-label">${t2.balance_label}</div>
                                        </div>
                                    </div>
                                `).join("") : `<div class="platform-list-empty">${t2.dev_no_students}</div>`}
                            </div>
                        </div>
                        <div class="platform-section">
                            <h3 class="platform-section-title">${t2.dev_plans_label}</h3>
                            <div class="platform-list">
                                ${subs.length > 0 ? subs.map((sb) => `
                                    <div class="platform-list-item">
                                        <div class="platform-list-title">${sb.name}</div>
                                        <div class="platform-list-price">${formatPrice(sb.price, school.currency || "MXN")}</div>
                                    </div>
                                `).join("") : `<div class="platform-list-empty">${t2.dev_no_plans}</div>`}
                            </div>
                        </div>
                        <div class="platform-section">
                            <h3 class="platform-section-title">${t2.dev_classes_label}</h3>
                            <div class="platform-list">
                                ${classes.length > 0 ? classes.map((c) => `
                                    <div class="platform-list-item">
                                        <div>
                                            <div class="platform-list-title">${c.name}</div>
                                            <div class="platform-list-meta">${c.day} \u2022 ${window.formatClassTime(c)} \u2022 ${c.location || "N/A"}</div>
                                        </div>
                                        <span class="platform-list-tag">${c.tag || "OPEN"}</span>
                                    </div>
                                `).join("") : `<div class="platform-list-empty">${t2.dev_no_classes}</div>`}
                            </div>
                        </div>
                        ${state.platformData.payment_requests && state.platformData.payment_requests.length > 0 ? (() => {
            const prs = state.platformData.payment_requests.filter((pr) => pr.school_id === schoolId);
            return prs.length > 0 ? `
                        <div class="platform-section">
                            <h3 class="platform-section-title">Payment requests</h3>
                            <div class="platform-list">${prs.map((pr) => `
                                <div class="platform-list-item">
                                    <div><div class="platform-list-title">${pr.sub_name || "\u2014"} \u2022 ${formatPrice(pr.price, school.currency || "MXN")}</div><div class="platform-list-meta">${pr.status || "\u2014"} \u2022 ${pr.payment_method || "\u2014"}</div></div>
                                </div>`).join("")}</div>
                        </div>` : "";
          })() : ""}
                        ${state.platformData.admin_settings && state.platformData.admin_settings.length > 0 ? (() => {
            const sets = state.platformData.admin_settings.filter((as) => as.school_id === schoolId);
            return sets.length > 0 ? `
                        <div class="platform-section">
                            <h3 class="platform-section-title">Admin settings</h3>
                            <div class="platform-list">${sets.map((as) => `
                                <div class="platform-list-item"><div class="platform-list-title">${as.key || "\u2014"}</div><div class="platform-list-mono">${as.value != null && as.value !== "" ? String(as.value) : "\u2014"}</div></div>`).join("")}</div>
                        </div>` : "";
          })() : ""}
                    </div>
                </div>
            `;
        }
      } else if (view === "platform-dev-edit-school") {
        const school = state.currentSchool;
        if (!school || !school.id) {
          html += `<div style="padding: 2rem 1.2rem;"><p style="color: var(--text-secondary); margin-bottom: 1rem;">${t2.not_found_msg}</p><button type="button" class="btn-primary" onclick="state.currentView=state._devEditSchoolReturnView||'platform-dev-dashboard'; state.selectedDevSchoolId=state._devEditSchoolReturnSchoolId; renderView();">${t2.dev_volver_dashboard}</button></div>`;
        } else {
          html += `
            <div class="ios-header" style="display: flex; align-items: center; gap: 1rem; padding: 0 1.2rem 1rem;">
                <button type="button" class="btn-back" onclick="state.currentView=state._devEditSchoolReturnView||'platform-dev-dashboard'; state.selectedDevSchoolId=state._devEditSchoolReturnSchoolId; renderView();">
                    <i data-lucide="arrow-left" size="20"></i>
                </button>
                <div>
                    <div style="font-size: 12px; font-weight: 700; color: var(--system-blue); letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.9;">${t2.dev_edit_school_info || "Edit school info"}</div>
                    <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${(school.name || "").replace(/</g, "&lt;")}</div>
                </div>
            </div>
            <div style="padding: 1.2rem;">
            <div class="ios-list" style="margin-bottom: 1rem;">
                <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 8px;">
                    <span style="font-size: 14px; opacity: 0.8;">${t2.school_name_label || "School name"}</span>
                    <input type="text" id="dev-edit-school-name" value="${(school.name || "").replace(/"/g, "&quot;")}" placeholder="School or teacher name" style="border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none; width: 100%; box-sizing: border-box;">
                </div>
                <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 8px;">
                    <span style="font-size: 14px; opacity: 0.8;">${t2.address_label || "Address"}</span>
                    <input type="text" id="dev-edit-school-address" value="${(school.address || "").replace(/"/g, "&quot;")}" placeholder="${t2.address_label || "Address"}" style="border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none; width: 100%; box-sizing: border-box;">
                </div>
                <div class="ios-list-item" onclick="window.saveSchoolInfoByPlatform('${school.id}', this)" style="color: var(--system-blue); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; background: var(--system-gray6);">
                    <i data-lucide="save" size="18" style="opacity: 0.6; margin-right: 8px;"></i> ${t2.dev_save_school_info || "Save"}
                </div>
            </div>
            </div>
            `;
        }
      } else if (view === "platform-dev-edit-discovery") {
        const school = state.currentSchool;
        if (!school || !school.id) {
          html += `<div style="padding: 2rem 1.2rem;"><p style="color: var(--text-secondary); margin-bottom: 1rem;">${t2.not_found_msg}</p><button type="button" class="btn-primary" onclick="state.currentView=state._devDiscoveryReturnView||'platform-dev-dashboard'; state.selectedDevSchoolId=state._devDiscoveryReturnSchoolId; renderView();">${t2.dev_volver_dashboard}</button></div>`;
        } else {
          html += `
            <div class="ios-header" style="display: flex; align-items: center; gap: 1rem; padding: 0 1.2rem 1rem;">
                <button type="button" class="btn-back" onclick="state.currentView=state._devDiscoveryReturnView||'platform-dev-dashboard'; state.selectedDevSchoolId=state._devDiscoveryReturnSchoolId; renderView();">
                    <i data-lucide="arrow-left" size="20"></i>
                </button>
                <div>
                    <div style="font-size: 12px; font-weight: 700; color: var(--system-blue); letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.9;">${t2.dev_edit_discovery_profile || "Edit discovery profile"}</div>
                    <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${(school.name || "").replace(/</g, "&lt;")}</div>
                </div>
            </div>
            <div style="padding: 0 1.2rem 2rem;">
            <div style="padding: 0 1.2rem; margin-top: 0.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t2.discovery_profile_section || "Discovery profile"}</div>
            <div class="ios-list" style="margin-bottom: 1rem;">
                <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_slug_label}</span><input type="text" id="discovery-slug" value="${((school.discovery_slug || "").trim() || (window.slugFromName ? window.slugFromName(school.name || "") : "")).replace(/"/g, "&quot;")}" placeholder="${t2.discovery_slug_placeholder || "royal_latin"}" oninput="window.updateDiscoveryPreview()" style="text-align: right; border: none; background: transparent; width: 55%; color: var(--text-primary); font-size: 14px; outline: none;"></div>
                <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.country_label}</span><select id="discovery-country" onchange="window.updateDiscoveryCityDropdown(); window.updateDiscoveryPreview();" style="background: var(--system-gray6); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; color: var(--text-primary); font-size: 14px; outline: none; min-width: 140px;"><option value="">\u2014</option>${DISCOVERY_COUNTRIES.map((c) => {
            const v = (school.country || "").trim();
            return `<option value="${String(c).replace(/"/g, "&quot;")}" ${c === v ? "selected" : ""}>${String(c).replace(/</g, "&lt;")}</option>`;
          }).join("")}</select></div>
                <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.city_label}</span><select id="discovery-city" onchange="window.updateDiscoveryPreview()" style="background: var(--system-gray6); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; color: var(--text-primary); font-size: 14px; outline: none; min-width: 140px;">${(() => {
            const country = (school.country || "").trim();
            const city = (school.city || "").trim();
            const cities = DISCOVERY_COUNTRIES_CITIES[country] || [];
            const list = city && !cities.includes(city) ? [city, ...cities] : cities;
            return '<option value="">\u2014</option>' + list.map((c) => `<option value="${String(c).replace(/"/g, "&quot;")}" ${c === city ? " selected" : ""}>${String(c).replace(/</g, "&lt;")}</option>`).join("");
          })()}</select></div>
                <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 6px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_description_label}</span><textarea id="discovery-description" rows="3" placeholder="Short description for the discovery page" oninput="window.updateDiscoveryPreview()" style="width: 100%; border: 1px solid var(--border); border-radius: 12px; padding: 10px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none; box-sizing: border-box;">${(school.discovery_description || "").replace(/</g, "&lt;").replace(/"/g, "&quot;")}</textarea></div>
                <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_genres_label}</span><input type="text" id="discovery-genres" value="${(Array.isArray(school.discovery_genres) ? school.discovery_genres.join(", ") : school.discovery_genres || "").toString().replace(/"/g, "&quot;")}" placeholder="Salsa, Bachata" oninput="window.updateDiscoveryPreview()" style="text-align: right; border: none; background: transparent; width: 55%; color: var(--text-primary); font-size: 14px; outline: none;"></div>
                <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_levels_label}</span><input type="text" id="discovery-levels" value="${(Array.isArray(school.discovery_levels) ? school.discovery_levels.join(", ") : school.discovery_levels || "").toString().replace(/"/g, "&quot;")}" placeholder="Beginner, Intermediate" oninput="window.updateDiscoveryPreview()" style="text-align: right; border: none; background: transparent; width: 55%; color: var(--text-primary); font-size: 14px; outline: none;"></div>
                <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 8px;"><span style="font-size: 14px; opacity: 0.8;">${t2.logo_url_label}</span><div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;"><input type="file" id="discovery-logo-file" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none;" onchange="window.handleDiscoveryFileSelect(this, 'logo')"><button type="button" onclick="document.getElementById('discovery-logo-file').click();" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: var(--system-gray6); border: 1px solid var(--border); color: var(--text-primary); cursor: pointer;">${t2.discovery_upload_btn || "Upload"}</button>${(school.logo_url || "").trim() ? `<button type="button" onclick="window.clearDiscoveryImage('logo')" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: transparent; border: 1px solid var(--border); color: var(--system-red, #ff3b30); cursor: pointer;">${(t2.discovery_remove_image || "Remove").replace(/</g, "&lt;")}</button>` : ""}<input type="text" id="discovery-logo-url" value="${(school.logo_url || "").replace(/"/g, "&quot;")}" placeholder="https://... or upload" oninput="window.updateDiscoveryPreview()" style="flex: 1; min-width: 0; border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none;"></div></div>
                <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 8px;"><span style="font-size: 14px; opacity: 0.8;">${t2.teacher_photo_url_label}</span><div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;"><input type="file" id="discovery-teacher-file" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none;" onchange="window.handleDiscoveryFileSelect(this, 'teacher')"><button type="button" onclick="document.getElementById('discovery-teacher-file').click();" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: var(--system-gray6); border: 1px solid var(--border); color: var(--text-primary); cursor: pointer;">${t2.discovery_upload_btn || "Upload"}</button>${(school.teacher_photo_url || "").trim() ? `<button type="button" onclick="window.clearDiscoveryImage('teacher')" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: transparent; border: 1px solid var(--border); color: var(--system-red, #ff3b30); cursor: pointer;">${(t2.discovery_remove_image || "Remove").replace(/</g, "&lt;")}</button>` : ""}<input type="text" id="discovery-teacher-url" value="${(school.teacher_photo_url || "").replace(/"/g, "&quot;")}" placeholder="https://... or upload" oninput="window.updateDiscoveryPreview()" style="flex: 1; min-width: 0; border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none;"></div></div>
                <div class="discovery-locations-wrap">
                    <h3 class="discovery-locations-title">${t2.discovery_locations_label || "Where we teach"}</h3>
                    ${(() => {
            if (state._discoveryLocationsSchoolId !== school?.id) {
              state._discoveryLocationsSchoolId = school?.id;
              state.discoveryLocations = Array.isArray(school?.discovery_locations) ? school.discovery_locations.map((l) => ({ name: l.name || "", address: l.address || "", description: l.description || "", image_urls: Array.isArray(l.image_urls) ? [...l.image_urls] : [] })) : [];
            }
            const locs = state.discoveryLocations || [];
            return locs.map((loc, i) => `<div class="discovery-location-card">
                        <div class="discovery-location-card-header">
                            <span class="discovery-location-card-badge">${t2.discovery_where_we_teach || "Location"} ${i + 1}</span>
                            <button type="button" class="discovery-location-remove" onclick="window.removeDiscoveryLocation(${i})" aria-label="${t2.discovery_remove_location || "Remove"}"><i data-lucide="trash-2" size="16"></i></button>
                        </div>
                        <div class="discovery-location-fields">
                            <label class="discovery-location-label">${t2.discovery_location_name || "Name"}</label>
                            <input type="text" class="discovery-location-input" value="${(loc.name || "").replace(/"/g, "&quot;")}" oninput="window.setDiscoveryLocationField(${i}, 'name', this.value)" placeholder="e.g. Studio Central">
                            <label class="discovery-location-label">${t2.discovery_location_address || "Address"} <span class="discovery-location-required">*</span></label>
                            <input type="text" class="discovery-location-input" value="${(loc.address || "").replace(/"/g, "&quot;")}" oninput="window.setDiscoveryLocationField(${i}, 'address', this.value)" placeholder="Street, number, city">
                            <label class="discovery-location-label">${t2.discovery_location_description || "Description"}</label>
                            <textarea rows="2" class="discovery-location-textarea" oninput="window.setDiscoveryLocationField(${i}, 'description', this.value)" placeholder="Condition, facilities\u2026">${(loc.description || "").replace(/</g, "&lt;").replace(/"/g, "&quot;")}</textarea>
                            <label class="discovery-location-label">${t2.discovery_upload_btn || "Photos"}</label>
                            <div class="discovery-location-photos-row">
                                <input type="file" id="discovery-loc-file-${i}" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none;" onchange="window.uploadDiscoveryLocationImage(${i}, this)">
                                <button type="button" class="discovery-location-upload-btn" onclick="document.getElementById('discovery-loc-file-${i}').click();"><i data-lucide="plus" size="18"></i> ${t2.discovery_upload_btn || "Upload"}</button>
                                ${(loc.image_urls || []).length ? `<div class="discovery-location-thumbs">${(loc.image_urls || []).map((url, j) => `<span class="discovery-location-thumb-wrap"><img src="${String(url).replace(/"/g, "&quot;")}" alt="" class="discovery-location-thumb"><button type="button" class="discovery-location-thumb-remove" onclick="window.removeDiscoveryLocationImage(${i}, ${j})" aria-label="Remove">\xD7</button></span>`).join("")}</div>` : ""}
                            </div>
                        </div>
                    </div>`).join("") + `<button type="button" class="discovery-location-add-btn" onclick="window.addDiscoveryLocation()"><i data-lucide="plus" size="20"></i> ${t2.discovery_add_location || "Add location"}</button>`;
          })()}
                </div>
                <div class="ios-list-item save-discovery-btn" onclick="window.saveDiscoveryProfile(event)" style="color: var(--system-blue); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; background: var(--system-gray6);">
                    <i data-lucide="save" size="18" style="opacity: 0.6; margin-right: 8px;"></i> ${t2.save_discovery_btn || "Save discovery profile"}
                </div>
            </div>
            <div style="padding: 0 1.2rem; margin-top: 1.5rem;">
                <button onclick="window.toggleDiscoveryPreview()" style="width: 100%; padding: 14px; border-radius: 16px; border: 1px solid var(--border); background: var(--system-gray6); color: var(--text-primary); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 14px;">
                    <i data-lucide="${state.showDiscoveryPreview ? "eye-off" : "eye"}" size="16" style="opacity: 0.6;"></i>
                    ${state.showDiscoveryPreview ? t2.hide_discovery_preview_btn : t2.show_discovery_preview_btn}
                </button>
            </div>
            ${state.showDiscoveryPreview ? `
            <div style="padding: 0 1.2rem; margin-top: 1rem; margin-bottom: 0.8rem;" class="slide-in">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">${t2.discovery_preview_title || "Preview on Discover"}</div>
            </div>
            <div class="card slide-in" style="margin: 0 1.2rem 1.5rem; padding: 0; border-radius: 16px; border: 1px solid var(--border); overflow: hidden;">
                <div id="discovery-preview-inner" style="font-size: 13px; color: var(--text-primary); max-height: 70vh; overflow-y: auto; padding: 1rem; background: var(--bg-body);">${(() => {
            const sc = state.currentSchool;
            const loc = [sc?.city, sc?.country].filter(Boolean).join(", ") || "\u2014";
            return window.getDiscoveryPreviewFullHtml ? window.getDiscoveryPreviewFullHtml({ name: sc?.name || "", loc, desc: (sc?.discovery_description || "").toString(), genres: Array.isArray(sc?.discovery_genres) ? sc.discovery_genres.join(" \xB7 ") : "", logoUrl: (sc?.logo_url || "").trim(), teacherUrl: (sc?.teacher_photo_url || "").trim(), gallery: [], locations: Array.isArray(state.discoveryLocations) ? state.discoveryLocations : Array.isArray(sc?.discovery_locations) ? sc.discovery_locations : [], currency: sc?.currency || "MXN", classes: state.classes || [], subscriptions: state.subscriptions || [], placeholder: t2.discovery_placeholder_upload_soon || "Will be uploaded soon." }) : "";
          })()}</div>
            </div>
            ` : ""}
            <div style="height: 80px;"></div>
            </div>`;
        }
      } else if (view === "discovery-profile-only") {
        const countryEl = document.getElementById("discovery-country");
        if (countryEl && state.currentSchool?.id) {
          const slug = (document.getElementById("discovery-slug")?.value ?? "").trim();
          const country = (countryEl.value ?? "").trim();
          const city = (document.getElementById("discovery-city")?.value ?? "").trim();
          const desc = (document.getElementById("discovery-description")?.value ?? "").trim();
          const genresStr = (document.getElementById("discovery-genres")?.value ?? "").trim();
          const levelsStr = (document.getElementById("discovery-levels")?.value ?? "").trim();
          const logoUrl = (document.getElementById("discovery-logo-url")?.value ?? "").trim();
          const teacherUrl = (document.getElementById("discovery-teacher-url")?.value ?? "").trim();
          state.currentSchool = {
            ...state.currentSchool,
            ...slug && { discovery_slug: slug },
            ...country && { country },
            ...city && { city },
            ...desc && { discovery_description: desc },
            ...genresStr && { discovery_genres: genresStr.split(",").map((s) => s.trim()).filter(Boolean) },
            ...levelsStr && { discovery_levels: levelsStr.split(",").map((s) => s.trim()).filter(Boolean) },
            ...logoUrl && { logo_url: logoUrl },
            ...teacherUrl && { teacher_photo_url: teacherUrl }
          };
        }
        const school = state.currentSchool;
        const discoverySlugDisplay = (school?.discovery_slug || "").trim() || (window.slugFromName ? window.slugFromName(school?.name || "") : "");
        const backPath = discoverySlugDisplay ? "/discovery/" + encodeURIComponent(discoverySlugDisplay) : school?.id ? "/discovery/id/" + encodeURIComponent(school.id) : "/discovery";
        if (!school || !school.id) {
          html += `<div style="padding: 2rem 1.2rem;"><p style="color: var(--text-secondary); margin-bottom: 1rem;">${t2.not_found_msg}</p><button type="button" class="btn-primary" onclick="state._discoveryOnlyEdit=false; state.currentView='school-selection'; saveState(); renderView();">${t2.discovery_back_to_page}</button></div>`;
        } else {
          html += `
            <div class="ios-header" style="display: flex; align-items: center; gap: 1rem; padding: 0 1.2rem 1rem; border-bottom: 1px solid var(--border);">
                <button type="button" class="btn-back" onclick="state._discoveryOnlyEdit=false; state.discoveryPath='${backPath.replace(/'/g, "\\'")}'; history.pushState({},'','${backPath.replace(/'/g, "\\'")}'); window.fetchDiscoveryData().then(function(){ state.currentView=null; renderView(); });">
                    <i data-lucide="arrow-left" size="20"></i>
                </button>
                <div>
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-secondary);">${t2.dev_edit_discovery_profile || "Edit discovery profile"}</div>
                    <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${(school.name || "").replace(/</g, "&lt;")}</div>
                </div>
            </div>
            <div style="padding: 0 1.2rem 2rem;">
            <!-- Section: General info -->
            <section class="discovery-edit-section" style="margin-bottom: 1.5rem;">
                <h2 class="discovery-edit-section-title">${t2.discovery_profile_section || "Discovery profile"}</h2>
                <div class="card" style="border-radius: 14px; border: 1px solid var(--border); overflow: hidden;">
                    <div class="ios-list" style="margin: 0;">
                        <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_slug_label}</span><input type="text" id="discovery-slug" value="${(discoverySlugDisplay || "").replace(/"/g, "&quot;")}" placeholder="${t2.discovery_slug_placeholder || "royal_latin"}" oninput="window.updateDiscoveryPreview && window.updateDiscoveryPreview()" style="text-align: right; border: none; background: transparent; width: 55%; color: var(--text-primary); font-size: 14px; outline: none;"></div>
                        <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.country_label}</span><select id="discovery-country" onchange="window.updateDiscoveryCityDropdown && window.updateDiscoveryCityDropdown(); window.updateDiscoveryPreview && window.updateDiscoveryPreview();" style="background: var(--system-gray6); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; color: var(--text-primary); font-size: 14px; outline: none; min-width: 140px;"><option value="">\u2014</option>${DISCOVERY_COUNTRIES.map((c) => {
            const v = (school.country || "").trim();
            return `<option value="${String(c).replace(/"/g, "&quot;")}" ${c === v ? "selected" : ""}>${String(c).replace(/</g, "&lt;")}</option>`;
          }).join("")}</select></div>
                        <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.city_label}</span><select id="discovery-city" onchange="window.updateDiscoveryPreview && window.updateDiscoveryPreview()" style="background: var(--system-gray6); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; color: var(--text-primary); font-size: 14px; outline: none; min-width: 140px;">${(() => {
            const country = (school.country || "").trim();
            const city = (school.city || "").trim();
            const cities = DISCOVERY_COUNTRIES_CITIES[country] || [];
            const list = city && !cities.includes(city) ? [city, ...cities] : cities;
            return '<option value="">\u2014</option>' + list.map((c) => `<option value="${String(c).replace(/"/g, "&quot;")}" ${c === city ? " selected" : ""}>${String(c).replace(/</g, "&lt;")}</option>`).join("");
          })()}</select></div>
                        <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 6px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_description_label}</span><textarea id="discovery-description" rows="3" placeholder="Short description for the discovery page" oninput="window.updateDiscoveryPreview && window.updateDiscoveryPreview()" style="width: 100%; border: 1px solid var(--border); border-radius: 12px; padding: 10px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none; box-sizing: border-box;">${(school.discovery_description || "").replace(/</g, "&lt;").replace(/"/g, "&quot;")}</textarea></div>
                        <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_genres_label}</span><input type="text" id="discovery-genres" value="${(Array.isArray(school.discovery_genres) ? school.discovery_genres.join(", ") : school.discovery_genres || "").toString().replace(/"/g, "&quot;")}" placeholder="Salsa, Bachata" oninput="window.updateDiscoveryPreview && window.updateDiscoveryPreview()" style="text-align: right; border: none; background: transparent; width: 55%; color: var(--text-primary); font-size: 14px; outline: none;"></div>
                        <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_levels_label}</span><input type="text" id="discovery-levels" value="${(Array.isArray(school.discovery_levels) ? school.discovery_levels.join(", ") : school.discovery_levels || "").toString().replace(/"/g, "&quot;")}" placeholder="Beginner, Intermediate" oninput="window.updateDiscoveryPreview && window.updateDiscoveryPreview()" style="text-align: right; border: none; background: transparent; width: 55%; color: var(--text-primary); font-size: 14px; outline: none;"></div>
                        <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 8px;"><span style="font-size: 14px; opacity: 0.8;">${t2.logo_url_label}</span><div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;"><input type="file" id="discovery-logo-file" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none;" onchange="window.handleDiscoveryFileSelect(this, 'logo')"><button type="button" onclick="document.getElementById('discovery-logo-file').click();" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: var(--system-gray6); border: 1px solid var(--border); color: var(--text-primary); cursor: pointer;">${t2.discovery_upload_btn || "Upload"}</button>${(school.logo_url || "").trim() ? `<button type="button" onclick="window.clearDiscoveryImage && window.clearDiscoveryImage('logo')" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: transparent; border: 1px solid var(--border); color: var(--system-red, #ff3b30); cursor: pointer;">${(t2.discovery_remove_image || "Remove").replace(/</g, "&lt;")}</button>` : ""}<input type="text" id="discovery-logo-url" value="${(school.logo_url || "").replace(/"/g, "&quot;")}" placeholder="https://... or upload" oninput="window.updateDiscoveryPreview && window.updateDiscoveryPreview()" style="flex: 1; min-width: 0; border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none;"></div></div>
                        <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 8px;"><span style="font-size: 14px; opacity: 0.8;">${t2.teacher_photo_url_label}</span><div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;"><input type="file" id="discovery-teacher-file" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none;" onchange="window.handleDiscoveryFileSelect(this, 'teacher')"><button type="button" onclick="document.getElementById('discovery-teacher-file').click();" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: var(--system-gray6); border: 1px solid var(--border); color: var(--text-primary); cursor: pointer;">${t2.discovery_upload_btn || "Upload"}</button>${(school.teacher_photo_url || "").trim() ? `<button type="button" onclick="window.clearDiscoveryImage && window.clearDiscoveryImage('teacher')" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: transparent; border: 1px solid var(--border); color: var(--system-red, #ff3b30); cursor: pointer;">${(t2.discovery_remove_image || "Remove").replace(/</g, "&lt;")}</button>` : ""}<input type="text" id="discovery-teacher-url" value="${(school.teacher_photo_url || "").replace(/"/g, "&quot;")}" placeholder="https://... or upload" oninput="window.updateDiscoveryPreview && window.updateDiscoveryPreview()" style="flex: 1; min-width: 0; border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none;"></div></div>
                    </div>
                </div>
            </section>
            <!-- Section: Locations -->
            <section class="discovery-edit-section" style="margin-bottom: 1.5rem;">
                <h2 class="discovery-edit-section-title">${t2.discovery_locations_label || "Where we teach"}</h2>
                <div class="card" style="border-radius: 14px; border: 1px solid var(--border); overflow: hidden; padding: 1rem;">
                <div class="discovery-locations-wrap">
                    ${(() => {
            if (state._discoveryLocationsSchoolId !== school?.id) {
              state._discoveryLocationsSchoolId = school?.id;
              state.discoveryLocations = Array.isArray(school?.discovery_locations) ? school.discovery_locations.map((l) => ({ name: l.name || "", address: l.address || "", description: l.description || "", image_urls: Array.isArray(l.image_urls) ? [...l.image_urls] : [] })) : [];
            }
            const locs = state.discoveryLocations || [];
            return locs.map((loc, i) => `<div class="discovery-location-card">
                        <div class="discovery-location-card-header">
                            <span class="discovery-location-card-badge">${t2.discovery_where_we_teach || "Location"} ${i + 1}</span>
                            <button type="button" class="discovery-location-remove" onclick="window.removeDiscoveryLocation(${i})" aria-label="${t2.discovery_remove_location || "Remove"}"><i data-lucide="trash-2" size="16"></i></button>
                        </div>
                        <div class="discovery-location-fields">
                            <label class="discovery-location-label">${t2.discovery_location_name || "Name"}</label>
                            <input type="text" class="discovery-location-input" value="${(loc.name || "").replace(/"/g, "&quot;")}" oninput="window.setDiscoveryLocationField(${i}, 'name', this.value)" placeholder="e.g. Studio Central">
                            <label class="discovery-location-label">${t2.discovery_location_address || "Address"} <span class="discovery-location-required">*</span></label>
                            <input type="text" class="discovery-location-input" value="${(loc.address || "").replace(/"/g, "&quot;")}" oninput="window.setDiscoveryLocationField(${i}, 'address', this.value)" placeholder="Street, number, city">
                            <label class="discovery-location-label">${t2.discovery_location_description || "Description"}</label>
                            <textarea rows="2" class="discovery-location-textarea" oninput="window.setDiscoveryLocationField(${i}, 'description', this.value)" placeholder="Condition, facilities\u2026">${(loc.description || "").replace(/</g, "&lt;").replace(/"/g, "&quot;")}</textarea>
                            <label class="discovery-location-label">${t2.discovery_upload_btn || "Photos"}</label>
                            <div class="discovery-location-photos-row">
                                <input type="file" id="discovery-loc-file-${i}" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none;" onchange="window.uploadDiscoveryLocationImage(${i}, this)">
                                <button type="button" class="discovery-location-upload-btn" onclick="document.getElementById('discovery-loc-file-${i}').click();"><i data-lucide="plus" size="18"></i> ${t2.discovery_upload_btn || "Upload"}</button>
                                ${(loc.image_urls || []).length ? `<div class="discovery-location-thumbs">${(loc.image_urls || []).map((url, j) => `<span class="discovery-location-thumb-wrap"><img src="${String(url).replace(/"/g, "&quot;")}" alt="" class="discovery-location-thumb"><button type="button" class="discovery-location-thumb-remove" onclick="window.removeDiscoveryLocationImage(${i}, ${j})" aria-label="Remove">\xD7</button></span>`).join("")}</div>` : ""}
                            </div>
                        </div>
                    </div>`).join("") + `<button type="button" class="discovery-location-add-btn" onclick="window.addDiscoveryLocation()"><i data-lucide="plus" size="20"></i> ${t2.discovery_add_location || "Add location"}</button>`;
          })()}
                </div>
                </div>
            </section>
            <!-- Section: Offerings (private classes & events toggles) -->
            ${school?.private_packages_enabled !== false || school?.events_packages_enabled !== false ? `
            <section class="discovery-edit-section" style="margin-bottom: 1.5rem;">
                <h2 class="discovery-edit-section-title">${t2.discovery_offerings_section || "Offerings"}</h2>
                <div class="card" style="border-radius: 14px; border: 1px solid var(--border); overflow: hidden; padding: 1rem 1.25rem;">
                    ${school?.private_packages_enabled !== false ? `
                    <div class="admin-private-classes-toggle-card" style="margin-bottom: 1rem;">
                        <div class="admin-private-contact-title">${t2.offer_private_classes || "Offer private classes"}</div>
                        <p class="admin-private-contact-desc">${t2.offer_private_classes_desc || "Allow students to buy and use private class packages. When enabled, plans can include group classes, private classes, or both."}</p>
                        <div class="ios-list-item" style="justify-content: space-between; padding: 12px 0;">
                            <span style="font-size: 15px; font-weight: 600;">${t2.offer_private_classes || "Offer private classes"}</span>
                            <label class="toggle-switch" style="flex-shrink: 0;">
                                <input type="checkbox" class="toggle-switch-input" ${state.adminSettings?.private_classes_offering_enabled === "true" ? "checked" : ""} onchange="window.togglePrivateClassesOffering(this.checked)">
                                <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                            </label>
                        </div>
                    </div>
                    ` : ""}
                    ${school?.events_packages_enabled !== false ? `
                    <div class="admin-private-classes-toggle-card" style="margin-bottom: 0;">
                        <div class="admin-private-contact-title">${t2.offer_events || "Offer events"}</div>
                        <p class="admin-private-contact-desc">${t2.offer_events_desc || "Allow students to buy and use event tokens. When enabled, plans can include group, private, and event counts."}</p>
                        <div class="ios-list-item" style="justify-content: space-between; padding: 12px 0;">
                            <span style="font-size: 15px; font-weight: 600;">${t2.offer_events || "Offer events"}</span>
                            <label class="toggle-switch" style="flex-shrink: 0;">
                                <input type="checkbox" class="toggle-switch-input" ${state.adminSettings?.events_offering_enabled === "true" ? "checked" : ""} onchange="window.toggleEventsOffering(this.checked)">
                                <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                            </label>
                        </div>
                    </div>
                    ` : ""}
                </div>
            </section>
            ` : ""}
            <!-- Section: Classes (schedule) -->
            <section class="discovery-edit-section" style="margin-bottom: 1.5rem;">
                <h2 class="discovery-edit-section-title">${t2.discovery_classes || "Classes"}</h2>
                <div class="card" style="border-radius: 14px; border: 1px solid var(--border); overflow: hidden; padding: 1rem 1.2rem;">
                <div style="margin-bottom: 0;">
                    ${(() => {
            const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            const dayAliases = { Mon: ["Mon", "Mo", "Monday"], Tue: ["Tue", "Tu", "Tuesday"], Wed: ["Wed", "We", "Wednesday"], Thu: ["Thu", "Th", "Thursday"], Fri: ["Fri", "Fr", "Friday"], Sat: ["Sat", "Sa", "Saturday"], Sun: ["Sun", "Su", "Sunday"] };
            const dayIndex = (day) => {
              const d = daysOrder.find((d2) => d2 === day || dayAliases[d2] && dayAliases[d2].includes(day));
              return d ? daysOrder.indexOf(d) : 999;
            };
            const classesList = [...state.classes || []].sort((a, b) => dayIndex(a.day) - dayIndex(b.day));
            return classesList.length ? `
                        <div class="ios-list" style="overflow: visible;">
                            ${classesList.map((c) => `
                                <div class="ios-list-item" style="flex-direction: column; align-items: stretch; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--border);">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <input type="text" value="${(c.name || "").replace(/"/g, "&quot;")}" oninput="debouncedUpdateClass(${c.id}, 'name', this.value)" style="border: none; background: transparent; font-size: 15px; font-weight: 600; flex: 1; color: var(--text-primary); outline: none; margin-right: 8px;">
                                        <button type="button" onclick="removeClass(${c.id})" style="background: none; border: none; color: var(--text-secondary); opacity: 0.5; padding: 4px; cursor: pointer;" aria-label="${(t2.delete_label || "Delete").replace(/"/g, "&quot;")}"><i data-lucide="trash-2" size="16"></i></button>
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                        <div style="background: var(--system-gray6); border-radius: 10px; padding: 6px 10px;">
                                            <label style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); opacity: 0.7;">${t2.day_label || "Day"}</label>
                                            <select onchange="updateClass(${c.id}, 'day', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-size: 13px; font-weight: 600; outline: none; cursor: pointer; padding: 0;">
                                                ${daysOrder.map((d) => `<option value="${d}" ${c.day === d || dayAliases[d] && dayAliases[d].includes(c.day) ? "selected" : ""}>${t2[d.toLowerCase()] || d}</option>`).join("")}
                                            </select>
                                        </div>
                                        <div style="background: var(--system-gray6); border-radius: 10px; padding: 6px 10px;">
                                            <label style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); opacity: 0.7;">${t2.start_time_label || "Time"}</label>
                                            <input type="time" value="${(c.time || "09:00").replace(/"/g, "&quot;")}" onblur="scheduleTimeBlurSave(${c.id}, this)" onfocus="cancelTimeBlurSave(this)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-size: 13px; font-weight: 600; outline: none; cursor: pointer; padding: 0;">
                                        </div>
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                        <div style="background: var(--system-gray6); border-radius: 10px; padding: 6px 10px;">
                                            <label style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); opacity: 0.7;">${t2.class_location || "Location"}</label>
                                            <input type="text" value="${(c.location || "").replace(/"/g, "&quot;")}" oninput="debouncedUpdateClass(${c.id}, 'location', this.value)" placeholder="${(t2.location_placeholder || "").replace(/"/g, "&quot;")}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-size: 12px; font-weight: 600; outline: none; padding: 0;">
                                        </div>
                                        <div style="background: var(--system-gray6); border-radius: 10px; padding: 6px 10px;">
                                            <label style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); opacity: 0.7;">${t2.level_tag_label || "Tag"}</label>
                                            <input type="text" value="${(c.tag || "Clase").replace(/"/g, "&quot;")}" oninput="debouncedUpdateClass(${c.id}, 'tag', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-size: 12px; font-weight: 600; outline: none; padding: 0;">
                                        </div>
                                    </div>
                                </div>
                            `).join("")}
                            <div class="ios-list-item" onclick="addClass()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px;">
                                <i data-lucide="plus-circle" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t2.add_label || "Add"} ${t2.new_class_label || "class"}
                            </div>
                        </div>
                        <div style="padding: 0 1.2rem; margin-top: 0.75rem;">
                            <button type="button" class="btn-primary" onclick="window.flushScheduleSave()" ${state._scheduleSaving ? "disabled" : ""} style="width: 100%; border-radius: 12px; height: 44px; font-size: 14px; font-weight: 600;">
                                ${state._scheduleSaving ? `<i data-lucide="loader-2" class="spin" size="16" style="margin-right: 6px;"></i> ${t2.saving_label || "Saving\u2026"}` : `<i data-lucide="save" size="16" style="margin-right: 6px;"></i> ${t2.save_schedule_btn || "Save schedule"}`}
                            </button>
                            ${state._scheduleSaveStatus ? `<div style="font-size: 12px; color: var(--text-secondary); font-weight: 600; margin-top: 0.4rem; text-align: center;">${state._scheduleSaveStatus}</div>` : ""}
                        </div>
                        ` : `<p style="font-size: 13px; color: var(--text-muted);">${(t2("discovery_placeholder_upload_soon") || "Will be uploaded soon.").replace(/</g, "&lt;")}</p>
                        <div class="ios-list-item" onclick="addClass()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; margin-top: 0.5rem;">
                            <i data-lucide="plus-circle" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t2.add_label || "Add"} ${t2.new_class_label || "class"}
                        </div>`;
          })()}
                </div>
                </div>
            </section>
            <!-- Section: Packages -->
            <section class="discovery-edit-section" style="margin-bottom: 1.5rem;">
                <h2 class="discovery-edit-section-title">${t2.discovery_packages || "Packages"}</h2>
                <div class="card" style="border-radius: 14px; border: 1px solid var(--border); overflow: hidden; padding: 1rem 1.2rem;">
                <div style="margin-bottom: 0;">
                    ${(() => {
            const subs = state.subscriptions || [];
            const currencySym = (CURRENCY_SYMBOLS[school?.currency || "MXN"] || "$").trim();
            return subs.length ? `
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                            ${subs.map((s) => `
                                <div class="card ios-list-item" data-plan-block data-sub-id="${s.id}" style="flex-direction: column; align-items: stretch; gap: 8px; padding: 12px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <input type="text" data-field="name" value="${(s.name || "").replace(/"/g, "&quot;")}" onchange="updateSub('${s.id}', 'name', this.value)" style="border: none; background: transparent; font-size: 14px; font-weight: 600; flex: 1; color: var(--text-primary); outline: none; margin-right: 6px;">
                                        <button type="button" onclick="removeSubscription('${s.id}')" style="background: none; border: none; color: var(--text-secondary); opacity: 0.5; padding: 4px; cursor: pointer;" aria-label="${(t2.delete_label || "Delete").replace(/"/g, "&quot;")}"><i data-lucide="trash-2" size="14"></i></button>
                                    </div>
                                    <div style="display: flex; align-items: center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                        <span style="color: var(--text-secondary); font-size: 10px; font-weight: 700; opacity: 0.6;">${currencySym}</span>
                                        <input type="number" data-field="price" value="${s.price}" onchange="updateSub('${s.id}', 'price', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                    </div>
                                    <div style="display: flex; align-items: center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                        <i data-lucide="calendar" size="10" style="color: var(--text-secondary); opacity: 0.5;"></i>
                                        <input type="number" data-field="validity_days" value="${s.validity_days || 30}" onchange="updateSub('${s.id}', 'validity_days', this.value)" placeholder="${(t2.validity_days_placeholder || "Days").replace(/"/g, "&quot;")}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                        <div style="padding: 0 1.2rem; margin-top: 0.75rem;">
                            <button type="button" class="btn-primary" onclick="window.saveAllPlans()" ${state._plansSaving ? "disabled" : ""} style="width: 100%; border-radius: 12px; height: 44px; font-size: 14px; font-weight: 600; margin-bottom: 0.5rem;">
                                ${state._plansSaving ? `<i data-lucide="loader-2" class="spin" size="16" style="margin-right: 6px;"></i> ${t2.saving_label || "Saving\u2026"}` : `<i data-lucide="save" size="16" style="margin-right: 6px;"></i> ${t2.save_plans_btn || "Save plans"}`}
                            </button>
                            ${state._plansSaveStatus ? `<div style="font-size: 12px; color: var(--text-secondary); font-weight: 600; margin-bottom: 0.5rem; text-align: center;">${state._plansSaveStatus}</div>` : ""}
                            <div class="card ios-list-item" onclick="addSubscription()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px;">
                                <i data-lucide="plus-circle" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t2.add_label || "Add"} Plan
                            </div>
                        </div>
                        ` : `<p style="font-size: 13px; color: var(--text-muted);">${(t2("discovery_placeholder_upload_soon") || "Will be uploaded soon.").replace(/</g, "&lt;")}</p>
                        <div class="card ios-list-item" onclick="addSubscription()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; margin-top: 0.5rem;">
                            <i data-lucide="plus-circle" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t2.add_label || "Add"} Plan
                        </div>`;
          })()}
                </div>
                </div>
            </section>
                <div class="ios-list-item save-discovery-btn" onclick="window.saveDiscoveryProfile(event)" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px;">
                    <i data-lucide="save" size="18" style="opacity: 0.7; margin-right: 8px;"></i> ${t2.save_discovery_btn || "Save discovery profile"}
                </div>
            </div>
            <div style="padding: 0 1.2rem; margin-top: 1.5rem;">
                <button onclick="window.toggleDiscoveryPreview && window.toggleDiscoveryPreview()" style="width: 100%; padding: 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); color: var(--text-primary); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; font-size: 14px;">
                    <i data-lucide="${state.showDiscoveryPreview ? "eye-off" : "eye"}" size="16" style="opacity: 0.6;"></i>
                    ${state.showDiscoveryPreview ? t2.hide_discovery_preview_btn : t2.show_discovery_preview_btn}
                </button>
            </div>
            ${state.showDiscoveryPreview ? `
            <div style="padding: 0 1.2rem; margin-top: 1rem; margin-bottom: 0.8rem;" class="slide-in">
                <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">${t2.discovery_preview_title || "Preview on Discover"}</div>
            </div>
            <div class="card slide-in" style="margin: 0 1.2rem 1.5rem; padding: 0; border-radius: 12px; border: 1px solid var(--border); overflow: hidden;">
                <div id="discovery-preview-inner" style="font-size: 13px; color: var(--text-primary); max-height: 70vh; overflow-y: auto; padding: 1rem; background: var(--bg-body);">${(() => {
            const sc = state.currentSchool;
            const loc = [sc?.city, sc?.country].filter(Boolean).join(", ") || "\u2014";
            return window.getDiscoveryPreviewFullHtml ? window.getDiscoveryPreviewFullHtml({ name: sc?.name || "", loc, desc: (sc?.discovery_description || "").toString(), genres: Array.isArray(sc?.discovery_genres) ? sc.discovery_genres.join(" \xB7 ") : "", logoUrl: (sc?.logo_url || "").trim(), teacherUrl: (sc?.teacher_photo_url || "").trim(), gallery: [], locations: Array.isArray(state.discoveryLocations) ? state.discoveryLocations : Array.isArray(sc?.discovery_locations) ? sc.discovery_locations : [], currency: sc?.currency || "MXN", classes: state.classes || [], subscriptions: state.subscriptions || [], placeholder: t2.discovery_placeholder_upload_soon || "Will be uploaded soon." }) : "";
          })()}</div>
            </div>
            ` : ""}
            <div style="height: 80px;"></div>
            </div>`;
        }
      } else if (view === "discovery-admin-pick-school") {
        const list = state.discoverySchools || [];
        html += `
            <div class="ios-header" style="display: flex; align-items: center; gap: 1rem; padding: 0 1.2rem 1rem;">
                <button type="button" class="btn-back" onclick="state._discoveryOnlyEdit=false; state.discoveryPath='/discovery'; history.pushState({},'','/discovery'); window.fetchDiscoveryData().then(function(){ state.currentView=null; renderView(); });">
                    <i data-lucide="arrow-left" size="20"></i>
                </button>
                <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">${(t2("discovery_sign_in_edit_profile") || "Sign in to edit your studio profile").replace(/</g, "&lt;")}</div>
            </div>
            <div style="padding: 1.2rem 1.2rem 2rem;">
                <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 1.25rem;">${(t2("discovery_pick_school_to_signin") || "Choose your studio to sign in and edit your discovery profile.").replace(/</g, "&lt;")}</p>
                ${list.length ? `<div style="display: flex; flex-direction: column; gap: 0.75rem;">${list.map((s) => {
          const name = (s.name || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
          const loc = [s.city, s.country].filter(Boolean).join(", ");
          const idEsc = String(s.id).replace(/'/g, "\\'");
          const nameEsc = (s.name || "").replace(/'/g, "\\'").replace(/\\/g, "\\\\");
          const currencyEsc = (s.currency || "MXN").replace(/'/g, "\\'");
          return `<button type="button" onclick="state.currentSchool={id:'${idEsc}',name:'${nameEsc}',currency:'${currencyEsc}'}; state.currentView='discovery-admin-auth'; saveState(); renderView();" style="width: 100%; padding: 1rem 1.25rem; border-radius: 14px; border: 1px solid var(--border); background: var(--surface); color: var(--text-primary); font-size: 15px; font-weight: 600; text-align: left; cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
                        <span>${name}</span>${loc ? `<span style="font-size: 13px; color: var(--text-secondary); font-weight: 400;">${loc.replace(/</g, "&lt;")}</span>` : ""}
                    </button>`;
        }).join("")}</div>` : `<p style="color: var(--text-muted); margin-bottom: 1rem;">${(t2("discovery_no_schools") || "No studios listed.").replace(/</g, "&lt;")}</p><button type="button" class="btn-primary" onclick="state._discoveryOnlyEdit=false; state.discoveryPath='/discovery'; history.pushState({},'','/discovery'); window.fetchDiscoveryData().then(function(){ state.currentView=null; renderView(); });">${(t2("discovery_back") || "Back to discovery").replace(/</g, "&lt;")}</button>`}
            </div>`;
      } else if (view === "discovery-admin-auth") {
        const schoolName = (state.currentSchool?.name || "").replace(/</g, "&lt;");
        html += `
            <div class="auth-page-container" style="max-width: 420px; margin: 0 auto; padding: 2rem 1.25rem;">
                <button type="button" onclick="state._discoveryOnlyEdit=false; state.currentView='discovery-admin-pick-school'; state.discoveryPath=null; saveState(); renderView();" style="background: none; border: none; padding: 0; font-size: 13px; color: var(--text-muted); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 1.5rem;">
                    <i data-lucide="arrow-left" size="18"></i> ${(t2("discovery_back") || "Back").replace(/</g, "&lt;")}
                </button>
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <h1 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">${(t2("discovery_admin_signin_title") || "Edit discovery profile").replace(/</g, "&lt;")}</h1>
                    <p style="font-size: 0.95rem; color: var(--text-secondary); margin: 0;">${schoolName ? schoolName + " \xB7 " : ""}${(t2("discovery_admin_signin_subtitle") || "This studio only appears on the discovery page. Sign in with your admin email and password.").replace(/</g, "&lt;")}</p>
                </div>
                <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem;">
                    <input type="email" id="admin-user-input" class="minimal-input" placeholder="${(window.t("admin_email_placeholder") || window.t("admin_user_placeholder") || "Admin email").replace(/"/g, "&quot;")}" autocomplete="email" style="margin-bottom: 0.75rem;">
                    <div class="password-input-wrap" style="margin-bottom: 1rem;">
                        <input type="password" id="admin-pass-input" class="minimal-input" placeholder="${(window.t("admin_pass_placeholder") || "Password").replace(/"/g, "&quot;")}" autocomplete="current-password">
                        <button type="button" class="password-toggle-btn" onclick="window.togglePasswordVisibility(this)" aria-label="Show password"><i data-lucide="eye" size="20"></i></button>
                    </div>
                    <button id="admin-login-button" type="button" class="btn-auth-primary" onclick="loginAdminWithCreds()" style="width: 100%; padding: 14px; font-weight: 600; background: var(--text-primary); color: var(--bg-body); border: none; border-radius: 12px; cursor: pointer;">
                        ${(window.t("admin_login_btn") || "Sign in").replace(/</g, "&lt;")}
                    </button>
                </div>
            </div>
        `;
      } else if (view === "auth") {
        const isSignup2 = state.authMode === "signup";
        html += `
            <div class="auth-page-container">
                <div style="position: fixed; bottom: 10px; right: 10px; font-size: 10px; color: rgba(255,255,255,0.1); z-index: 9999;">V2.1-REBUILT</div>
                <div class="landing-grid">
                    <!-- LEFT / TOP: HERO SECTION -->
                    <div class="hero-section">
                        <div class="auth-logo-container">
                            <img src="logo.png" class="auth-logo">
                        </div>
                        
                        <button onclick="window.backToSchoolSelection()" style="background: rgba(255,255,255,0.05); color: var(--text-muted); border: none; padding: 8px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.05);">
                            <i data-lucide="arrow-left" size="14"></i> ${t2.switch_school}
                        </button>
                        
                        <div class="text-center" style="margin-bottom: 2rem; width: 100%;">
                            <h1 class="auth-title">${t2.welcome_classes || t2.welcome_to} <span style="font-weight: 800; display: block; margin-top: 0.5rem;">${state.currentSchool?.name || "Bailadmin"}</span></h1>
                            <p class="auth-subtitle">${window.t("auth_subtitle")}</p>
                        </div>
                    </div>

                    <!-- RIGHT / BOTTOM: AUTH CARD -->
                    <div class="auth-card-container">
                        <div class="auth-card">
                            <div style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1.5rem; letter-spacing: -0.02em; text-align: center;">
                            ${isSignup2 ? window.t("student_signup") : window.t("student_login")}
                            </div>

                            <div class="auth-input-group">
                                ${isSignup2 ? `
                                    <input type="text" id="auth-name" class="minimal-input" placeholder="${window.t("full_name_placeholder")}" autocomplete="name">
                                    <input type="email" id="auth-email" class="minimal-input" placeholder="${window.t("email_placeholder")}" autocomplete="email" inputmode="email" maxlength="254">
                                    <p class="auth-hint" style="font-size: 0.8rem; color: var(--text-secondary); margin: -0.5rem 0 0.5rem 0;">${window.t("signup_email_login_hint")}</p>
                                    <input type="text" id="auth-phone" class="minimal-input" placeholder="${window.t("phone")}" autocomplete="tel">
                                    <div class="password-input-wrap">
                                        <input type="password" id="auth-pass" class="minimal-input" placeholder="${window.t("password")}">
                                        <button type="button" class="password-toggle-btn" onclick="window.togglePasswordVisibility(this)" aria-label="Show password"><i data-lucide="eye" size="20"></i></button>
                                    </div>
                                    <div class="password-input-wrap">
                                        <input type="password" id="auth-pass-confirm" class="minimal-input" placeholder="${window.t("confirm_password_placeholder")}" autocomplete="new-password">
                                        <button type="button" class="password-toggle-btn" onclick="window.togglePasswordVisibility(this)" aria-label="Show password"><i data-lucide="eye" size="20"></i></button>
                                    </div>
                                ` : `
                                    <input type="email" id="auth-email" class="minimal-input" placeholder="${window.t("email_placeholder")}" autocomplete="email" inputmode="email">
                                    <div class="password-input-wrap">
                                        <input type="password" id="auth-pass" class="minimal-input" placeholder="${window.t("password")}">
                                        <button type="button" class="password-toggle-btn" onclick="window.togglePasswordVisibility(this)" aria-label="Show password"><i data-lucide="eye" size="20"></i></button>
                                    </div>
                                `}
                            </div>

                            <div class="auth-actions">
                                <button class="btn-auth-primary" onclick="${isSignup2 ? "signUpStudent()" : "loginStudent()"}">
                                    ${isSignup2 ? window.t("sign_up") : window.t("sign_in")}
                                </button>
                                
                                <p class="text-muted text-center" style="font-size: 0.85rem; margin-top: 1rem;">
                                    ${isSignup2 ? window.t("already_account") : window.t("no_account")}
                                    <a href="#" onclick="switchAuthMode(); return false;" style="color: var(--text); font-weight: 700; text-decoration: none; border-bottom: 1.5px solid var(--border);">
                                        ${isSignup2 ? window.t("sign_in") : window.t("sign_up")}
                                    </a>
                                </p>
                            </div>
                            
                            <div class="admin-trigger-container" style="margin-top: 2.5rem; text-align: center;">
                                <button id="admin-show-btn" style="opacity: 0.3; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; background: none; border: none; color: var(--text-muted); cursor: pointer;" onclick="showAdminFields()">${window.t("admin_access_trigger")}</button>
                                <div id="admin-fields" class="hidden slide-in" style="margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
                                    <input type="email" id="admin-user-input" class="minimal-input" placeholder="${window.t("admin_email_placeholder") || window.t("admin_user_placeholder")}" style="margin-bottom: 0.8rem;">
                                    <div class="password-input-wrap" style="margin-bottom: 1rem;">
                                        <input type="password" id="admin-pass-input" class="minimal-input" placeholder="${window.t("admin_pass_placeholder")}">
                                        <button type="button" class="password-toggle-btn" onclick="window.togglePasswordVisibility(this)" aria-label="Show password"><i data-lucide="eye" size="20"></i></button>
                                    </div>
                                    <button id="admin-login-button" class="btn-auth-primary" onclick="loginAdminWithCreds()" style="background: var(--text-muted); padding: 1rem;">
                                        ${window.t("admin_login_btn")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
      } else if (view === "teacher-booking") {
        if (!state.currentSchool?.id || state.currentSchool?.profile_type !== "private_teacher") {
          html += '<div style="padding: 2rem;">' + (t2.not_found_msg || "Not available") + "</div>";
        } else {
          const school = state.currentSchool;
          const teacherName = school.name || "";
          const teacherImg = school.logo_url || school.teacher_photo_url || "";
          const locations = school.discovery_locations || [];
          const locOptions = locations.length ? locations.map((l) => `<option value="${(l.name || l.address || "").replace(/"/g, "&quot;")}">${(l.name || l.address || "\u2014").replace(/</g, "&lt;")}</option>`).join("") : '<option value="">\u2014</option>';
          const cheapestSub = (state.subscriptions || []).filter((s) => s.price != null).sort((a, b) => (a.price || 0) - (b.price || 0))[0];
          const priceStr = cheapestSub ? typeof window.formatPrice === "function" ? window.formatPrice(cheapestSub.price, school.currency || "MXN") : cheapestSub.price : "\u2014";
          const weekStart = state._teacherBookingWeekStart || (() => {
            const d = getTodayForMonthly();
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(d);
            monday.setDate(diff);
            return monday.toISOString().slice(0, 10);
          })();
          const daySchedules = state._teacherBookingSlots || [];
          const t22 = DANCE_LOCALES[state.language || "en"];
          const hasPackage = typeof window.studentHasPackageWithSchool === "function" ? window.studentHasPackageWithSchool(school.id) : true;
          const myClasses = (state.studentPrivateClassRequests || []).filter((r) => r.status === "accepted");
          const myClassesExpanded = state.studentPrivateClassesExpanded !== false;
          html += `
            <div class="teacher-booking-container" style="padding: 1.2rem; padding-bottom: 6rem;">
                <div class="student-private-classes-expandable ${myClassesExpanded ? "expanded" : ""}" style="margin-bottom: 1rem; border: 1px solid var(--border); border-radius: 16px; overflow: hidden;">
                    <div class="expandable-section-header" onclick="toggleExpandableNoRender('studentPrivateClasses')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; cursor: pointer; background: var(--system-gray6);">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="calendar-check" size="18" style="opacity: 0.6;"></i>
                            <span style="font-weight: 700; font-size: 15px;">${t22.my_private_classes || "My private classes"}</span>
                            ${myClasses.length > 0 ? `<span style="background: var(--secondary); color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">${myClasses.length}</span>` : ""}
                        </div>
                        <i data-lucide="chevron-down" size="18" class="expandable-chevron" style="opacity: 0.5;"></i>
                    </div>
                    <div id="student-private-classes-content" style="padding: 12px 16px; display: ${myClassesExpanded ? "" : "none"}; background: var(--bg);">
                        ${myClasses.length === 0 ? `
                        <div style="text-align: center; padding: 1rem 0; color: var(--text-secondary); font-size: 14px;">
                            <i data-lucide="inbox" size="24" style="opacity: 0.3; margin-bottom: 0.3rem;"></i>
                            <div>${t22.no_private_classes_yet || "No accepted private classes yet"}</div>
                        </div>
                        ` : myClasses.map((r) => {
            const dateLabel = window.formatShortDate ? window.formatShortDate(/* @__PURE__ */ new Date(r.requested_date + "T00:00:00"), state.language) : r.requested_date;
            return `
                            <div class="student-private-class-row" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--system-gray6); border-radius: 12px; margin-bottom: 8px;">
                                <i data-lucide="calendar" size="16" style="opacity: 0.5; flex-shrink: 0;"></i>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; font-size: 14px;">${dateLabel} &middot; ${(r.requested_time || "").replace(/</g, "&lt;")}</div>
                                    ${r.location ? `<div style="font-size: 12px; color: var(--text-secondary);"><i data-lucide="map-pin" size="12" style="vertical-align: middle; opacity: 0.5; margin-right: 4px;"></i>${(r.location || "").replace(/</g, "&lt;")}</div>` : ""}
                                </div>
                            </div>`;
          }).join("")}
                    </div>
                </div>
                <div class="teacher-booking-card">
                    <div class="teacher-booking-header">
                        ${teacherImg ? `<img class="teacher-booking-avatar" src="${String(teacherImg).replace(/"/g, "&quot;")}" alt="">` : `<div class="teacher-booking-avatar" style="background: var(--system-gray5); display: flex; align-items: center; justify-content: center;"><i data-lucide="user" size="28" style="opacity: 0.4;"></i></div>`}
                        <div class="teacher-booking-info">
                            <div class="teacher-booking-name">${(teacherName || "").replace(/</g, "&lt;")}</div>
                            <div class="teacher-booking-title">${(t22.private_teacher_title || "Private Teacher").replace(/</g, "&lt;")}</div>
                            <div class="teacher-booking-meta">
                                <span class="teacher-booking-price">${priceStr} / ${t22.session_label || "session"}</span>
                            </div>
                        </div>
                    </div>
                    ${!hasPackage ? `
                    <div class="teacher-booking-no-package" style="padding: 1.5rem; text-align: center; background: rgba(255,149,0,0.08); border-radius: 16px; margin: 0 18px 18px; border: 1px solid rgba(255,149,0,0.2);">
                        <i data-lucide="package" size="32" style="color: var(--system-orange, #ff9500); opacity: 0.8; margin-bottom: 8px;"></i>
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">${t22.need_package_to_book || "You need a package to request private classes"}</div>
                        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">${t22.visit_shop_to_buy || "Visit the Shop to buy one."}</div>
                        <button type="button" class="btn-primary" onclick="state.currentView='shop'; renderView();" style="padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 700;">${t22.nav_shop || "Shop"}</button>
                    </div>
                    ` : `
                    ${locations.length ? `
                    <div class="teacher-booking-location-bar">
                        <i data-lucide="map-pin" size="16" style="opacity: 0.5;"></i>
                        <select id="teacher-booking-location" onchange="window.fetchTeacherBookingSlots()">
                            ${locOptions}
                        </select>
                    </div>
                    ` : ""}
                    <div class="teacher-booking-week-nav">
                        <button type="button" class="teacher-booking-week-btn" onclick="window.changeTeacherBookingWeek(-1)"><i data-lucide="chevron-left" size="20"></i></button>
                        <span class="teacher-booking-week-label" id="teacher-booking-week-label">${weekStart} \u2013 ${(() => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + 6);
            return d.toISOString().slice(0, 10);
          })()}</span>
                        <button type="button" class="teacher-booking-week-btn" onclick="window.changeTeacherBookingWeek(1)"><i data-lucide="chevron-right" size="20"></i></button>
                    </div>
                    <div class="teacher-booking-days" id="teacher-booking-days">
                        ${daySchedules.length === 0 ? `
                        <div style="padding: 2rem; text-align: center; color: var(--text-muted);">${t22.loading_dashboard || "Loading..."}</div>
                        ` : daySchedules.map((day) => `
                        <div class="teacher-booking-day">
                            <div class="teacher-booking-day-label">${t22[day.dayName?.toLowerCase()] || day.dayName} ${day.date}</div>
                            ${day.hasAvailability ? `
                            <div class="teacher-booking-slots">
                                ${(day.slots || []).map((slot) => `
                                <button type="button" class="teacher-booking-slot ${slot.available ? "available" : "unavailable"}" ${slot.available ? `onclick="window.showTeacherBookingConfirm('${day.date}', '${slot.time}', '${(slot.location || "").replace(/'/g, "\\'")}')"` : "disabled"}>
                                    ${slot.time}
                                </button>
                                `).join("")}
                            </div>
                            ` : `
                            <div class="teacher-booking-empty-day">${t22.no_availability || "No availability"}</div>
                            `}
                        </div>
                        `).join("")}
                    </div>
                    `}
                </div>
            </div>
            <div id="teacher-booking-confirm-overlay" class="teacher-booking-confirm-overlay hidden" style="display: none;">
                <div class="teacher-booking-confirm-sheet">
                    <div class="teacher-booking-confirm-title">${t22.confirm_booking_title || "Confirm request"}</div>
                    <div id="teacher-booking-confirm-details"></div>
                    <div class="teacher-booking-confirm-actions">
                        <button type="button" class="teacher-booking-confirm-btn secondary" onclick="window.hideTeacherBookingConfirm()">${t22.cancel}</button>
                        <button type="button" class="teacher-booking-confirm-btn primary" id="teacher-booking-confirm-btn">${t22.confirm_btn || "Confirm"}</button>
                    </div>
                </div>
            </div>
            `;
        }
        const needsLoad = !state._teacherBookingSlots?.length || state._teacherBookingLoadedWeek !== (state._teacherBookingWeekStart || "");
        const hasPkg = typeof window.studentHasPackageWithSchool === "function" ? window.studentHasPackageWithSchool(state.currentSchool?.id) : true;
        if (state.currentSchool?.id && state.currentSchool?.profile_type === "private_teacher" && supabaseClient && needsLoad && hasPkg) {
          window.fetchTeacherBookingSlots();
        }
      } else if (view === "schedule") {
        if (!state.isAdmin && state.currentSchool?.profile_type === "private_teacher") {
          state.currentView = "teacher-booking";
          renderView();
          return;
        }
        const regEnabled = !state.isAdmin && state.currentSchool?.class_registration_enabled;
        if (regEnabled && !state.classRegLoaded) {
          window.loadClassAvailability().then(() => {
            if (shouldDeferRender()) scheduleDeferredRender();
            else {
              renderView();
              if (window.lucide) window.lucide.createIcons();
            }
          }).catch(() => {
          });
        }
        const getRegInfo = (classObj, dateOverride) => {
          if (!regEnabled || !state.classRegLoaded) return null;
          const useDate = dateOverride != null ? new Date(dateOverride) : window.getNextClassDate(classObj.day);
          if (!useDate) return null;
          const dateStr = window.formatClassDate(useDate);
          const key = classObj.id + "_" + dateStr;
          const avail = state.classAvailability[key] || {};
          const regPool = state.mockDate ? [...state.studentRegistrations || [], ...state.studentPastRegistrations || []] : state.studentRegistrations || [];
          const myReg = regPool.find((r) => r.class_id === classObj.id && r.class_date === dateStr && r.status === "registered");
          const classDateTime = /* @__PURE__ */ new Date(dateStr + "T" + (classObj.time || "23:59"));
          const nowMs = getVirtualNow().getTime();
          const isOver = classDateTime.getTime() <= nowMs;
          return {
            dateStr,
            maxCapacity: avail.max_capacity,
            registeredCount: avail.registered_count || 0,
            spotsLeft: avail.spots_left,
            isRegistered: !!myReg,
            registrationId: myReg?.id,
            canCancel: myReg ? classDateTime.getTime() - nowMs > 4 * 60 * 60 * 1e3 : false,
            isOver
          };
        };
        const buildRegButton = (c, info) => {
          if (!info) return "";
          if (info.isOver) {
            return `<div class="class-reg-status"><div class="reg-past-note">${t2.class_already_started}</div></div>`;
          }
          let spotsHtml = "";
          if (info.isRegistered) {
            return `
                    <div class="class-reg-status">
                        <div class="reg-badge reg-badge-registered"><i data-lucide="check-circle" size="14"></i> ${t2.registered_check}</div>
                        ${info.canCancel ? `<button class="reg-cancel-btn" onclick="event.stopPropagation(); window.cancelRegistrationFromSchedule('${info.registrationId}')">${t2.cancel_registration}</button>` : `<div class="reg-deadline-note">${t2.cannot_cancel_deadline}</div>`}
                    </div>`;
          }
          if (info.maxCapacity !== null && info.maxCapacity !== void 0) {
            if (info.spotsLeft === 0) {
              return `<div class="class-reg-status"><div class="reg-badge reg-badge-full"><i data-lucide="x-circle" size="14"></i> ${t2.class_full}</div></div>`;
            }
            if (info.spotsLeft <= 10) {
              spotsHtml = `<div class="reg-urgency">${(t2.only_n_spots || "").replace("{n}", info.spotsLeft)}</div>`;
            }
          }
          return `
                <div class="class-reg-status">
                    ${spotsHtml}
                    <button class="reg-register-btn" onclick="event.stopPropagation(); window.registerForClass(${c.id}, '${(c.name || "").replace(/'/g, "\\'")}')">${t2.register_for_class}</button>
                    ${info.maxCapacity != null ? `<div class="reg-spots-info">${(t2.spots_left || "").replace("{n}", info.spotsLeft)}</div>` : `<div class="reg-spots-info">${t2.unlimited_spots}</div>`}
                </div>`;
        };
        const buildTileReg = (c, info) => {
          if (!info) return "";
          if (info.isOver) {
            return `<div class="tile-reg-past">${t2.class_already_started}</div>`;
          }
          if (info.isRegistered) {
            return `<div class="tile-reg-signed-up-row">
                    <div class="tile-reg-signed-up"><i data-lucide="check" size="12"></i> ${t2.registered}</div>
                    ${info.canCancel ? `<button type="button" class="tile-cancel-btn" onclick="event.stopPropagation(); window.cancelRegistrationFromSchedule('${info.registrationId}')">${t2.cancel_registration}</button>` : `<span class="tile-deadline-note">${t2.cannot_cancel_deadline}</span>`}
                </div>`;
          }
          if (info.maxCapacity !== null && info.maxCapacity !== void 0 && info.spotsLeft === 0) {
            return `<div class="tile-reg-full-pill"><i data-lucide="x-circle" size="12"></i> ${t2.full_label || t2.class_full}</div>`;
          }
          let urgency = "";
          if (info.maxCapacity != null && info.spotsLeft <= 10) {
            urgency = `<div class="tile-reg-urgency">${(t2.spots_left || "").replace("{n}", info.spotsLeft)}</div>`;
          }
          return `<div class="tile-reg-actions">
                ${urgency}
                <button type="button" class="tile-join-btn" onclick="event.stopPropagation(); window.registerForClass(${c.id}, '${(c.name || "").replace(/'/g, "\\'")}')" title="${t2.register_for_class}"><i data-lucide="plus" size="12"></i> ${t2.join_class}</button>
            </div>`;
        };
        const weekRange = window.getCurrentWeekRange();
        const weekStartStr = window.formatShortDate(weekRange.start, state.language);
        const weekEndStr = window.formatShortDate(weekRange.end, state.language);
        const weekBannerText = (t2.week_of || "Week of {start} \u2013 {end}").replace("{start}", weekStartStr).replace("{end}", weekEndStr);
        html += `<h1 style="margin-bottom: 0.5rem;">${t2.schedule_title}</h1>`;
        html += `<p class="text-muted" style="margin-bottom: 0.8rem; font-size: 1.1rem;">${t2.classes_subtitle}</p>`;
        html += `
            <div class="week-banner">
                <i data-lucide="calendar-range" size="16" style="opacity: 0.6;"></i>
                <span>${weekBannerText}</span>
            </div>
        `;
        html += `
            <div class="segment-control">
                <button class="segment-item ${state.scheduleView === "list" ? "active" : ""}" onclick="setScheduleView('list')">${t2.list_view}</button>
                <button class="segment-item ${state.scheduleView === "weekly" ? "active" : ""}" onclick="setScheduleView('weekly')">${t2.weekly_view}</button>
            </div>
        `;
        if (state.scheduleView === "list") {
          html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">`;
          const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const sortedClasses = [...state.classes].sort((a, b) => {
            const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
            if (dayDiff !== 0) return dayDiff;
            return a.time.localeCompare(b.time);
          });
          sortedClasses.forEach((c) => {
            const info = getRegInfo(c);
            const isPast = regEnabled && window.isDayPastInCurrentWeek(c.day);
            const classDayDate = window.getCurrentWeekDate(c.day);
            const classDayStr = classDayDate ? window.formatShortDate(classDayDate, state.language) : c.day;
            html += `
                    <div class="card" style="padding: 1.2rem; border-radius: 20px; ${isPast ? "opacity: 0.5;" : ""}">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 0.8rem;">
                            <div style="display:flex; gap: 0.5rem;">
                                <span style="background: var(--text); color: var(--background); padding: 0.3rem 0.8rem; border-radius: 40px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;">${c.tag || "Class"}</span>
                                ${isPast ? `<span style="background: var(--system-gray4); color: var(--background); padding: 0.3rem 0.6rem; border-radius: 40px; font-size: 0.6rem; font-weight: 700; text-transform: uppercase;">${t2.past_day}</span>` : ""}
                            </div>
                        </div>
                        <h3 style="font-size: 1.25rem; margin-bottom: 0.3rem; letter-spacing: -0.02em;">${c.name}</h3>
                        <div class="text-muted" style="display:flex; align-items:center; flex-wrap: wrap; gap:0.4rem; font-size: 0.9rem;">
                            <i data-lucide="calendar" size="14"></i> ${classDayStr} \u2022 <i data-lucide="clock" size="14"></i> ${window.formatClassTime(c)}
                            ${c.location ? `\u2022 <i data-lucide="map-pin" size="14" style="opacity: 0.4;"></i> <span style="opacity: 0.7; font-weight: 500;">${c.location}</span>` : ""}
                        </div>
                        ${isPast ? "" : buildRegButton(c, info)}
                    </div>
                `;
          });
          html += `</div>`;
        } else {
          const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const dayAliases = { "Mon": ["Mon", "Mo", "Monday"], "Tue": ["Tue", "Tu", "Tuesday"], "Wed": ["Wed", "We", "Wednesday"], "Thu": ["Thu", "Th", "Thursday"], "Fri": ["Fri", "Fr", "Friday"], "Sat": ["Sat", "Sa", "Saturday"], "Sun": ["Sun", "Su", "Sunday"] };
          html += `<div class="weekly-grid">`;
          daysOrder.forEach((dayKey) => {
            const aliases = dayAliases[dayKey];
            const dayClasses = state.classes.filter((c) => aliases.includes(c.day)).sort((a, b) => a.time.localeCompare(b.time));
            const isPastDay = regEnabled && window.isDayPastInCurrentWeek(dayKey);
            const dayDate = window.getCurrentWeekDate(dayKey);
            const dayDateStr = dayDate ? dayDate.toLocaleDateString(state.language === "es" ? "es-ES" : state.language === "de" ? "de-DE" : "en-US", { day: "numeric", month: "short" }) : "";
            const isToday = dayDate && (() => {
              const td = new Date(getTodayForMonthly());
              td.setHours(0, 0, 0, 0);
              return dayDate.getTime() === td.getTime();
            })();
            html += `
                    <div class="day-tile ${isPastDay ? "day-tile-past" : ""}">
                        <div class="day-tile-header">
                            ${t2[dayKey.toLowerCase()]}
                            <div style="font-size: 0.55rem; font-weight: 600; opacity: 0.7; margin-top: 1px;">${dayDateStr}</div>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.6rem;">
                            ${dayClasses.length > 0 ? dayClasses.map((c) => {
              const info = isPastDay ? null : getRegInfo(c, dayDate);
              const isRegistered = info && info.isRegistered;
              const showRegisteredHighlight = isRegistered && info && !info.isOver;
              return `
                                <div class="tile-class-item ${showRegisteredHighlight ? "tile-class-item-registered" : ""}">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2px;">
                                        <div class="tile-class-level">${c.tag || "Open"}</div>
                                        ${c.location ? `<div onclick="window.showLocationDetails(\`${c.location.replace(/'/g, "\\'")}\`)" style="font-size: 7px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 2px; opacity: 0.8; cursor: pointer;"><i data-lucide="map-pin" style="width: 7px; height: 7px; opacity: 0.5;"></i> ${window.formatLocationLabel(c.location)}</div>` : ""}
                                    </div>
                                    <div class="tile-class-desc">${c.name}</div>
                                    <div class="tile-class-time">${window.formatClassTime(c)}</div>
                                    ${isPastDay ? "" : buildTileReg(c, info)}
                                </div>`;
            }).join("") : `<div class="text-muted" style="font-size:0.6rem; font-style:italic;">${t2.no_classes_msg}</div>`}
                        </div>
                    </div>
                `;
          });
          html += `</div>`;
        }
        html += `
            <div class="private-classes-card" onclick="window.openPrivateClassesModal()">
                <p class="private-classes-card-title">${t2.private_classes_prompt}</p>
                <button type="button" class="private-classes-card-btn">
                    <i data-lucide="message-circle" size="18"></i> ${t2.private_classes_btn}
                </button>
            </div>
        `;
      } else if (view === "teacher-booking") {
        const school = state.currentSchool || {};
        const teacherName = school.name || "Teacher";
        const logoUrl = school.logo_url || school.teacher_photo_url || "";
        const weekStartState = state._bookingWeekStart || (() => {
          const d = /* @__PURE__ */ new Date();
          d.setDate(d.getDate() - d.getDay() + 1);
          return d.toISOString().split("T")[0];
        })();
        if (!state._bookingWeekStart) state._bookingWeekStart = weekStartState;
        const weekSlots = state._bookingWeekSlots || [];
        const selectedSlot = state._bookingSelectedSlot || null;
        const dayNames = { Mon: t2.mon, Tue: t2.tue, Wed: t2.wed, Thu: t2.thu, Fri: t2.fri, Sat: t2.sat, Sun: t2.sun };
        const monthNames = [t2.month_jan || "Jan", t2.month_feb || "Feb", t2.month_mar || "Mar", t2.month_apr || "Apr", t2.month_may || "May", t2.month_jun || "Jun", t2.month_jul || "Jul", t2.month_aug || "Aug", t2.month_sep || "Sep", t2.month_oct || "Oct", t2.month_nov || "Nov", t2.month_dec || "Dec"];
        const wsDate = /* @__PURE__ */ new Date(weekStartState + "T00:00:00");
        const weDate = new Date(wsDate);
        weDate.setDate(weDate.getDate() + 6);
        const weekLabel = monthNames[wsDate.getMonth()] + " " + wsDate.getDate() + " \u2013 " + monthNames[weDate.getMonth()] + " " + weDate.getDate() + ", " + weDate.getFullYear();
        const locations = [...new Set((state.teacherAvailability || []).map((a) => a.location).filter(Boolean))];
        const selectedLocation = state._bookingLocation || locations[0] || "";
        const cheapestSub = (state.subscriptions || []).reduce((min, s) => !min || s.price && s.price < min.price ? s : min, null);
        const priceLabel = cheapestSub ? (CURRENCY_SYMBOLS[school.currency || "MXN"] || "$") + cheapestSub.price : "";
        html += `
            <div class="ios-header">
                <div class="ios-large-title" style="letter-spacing: -1px;">${t2.book_class_title || "Book a Class"}</div>
            </div>
            <div style="padding: 0 1.2rem;">
                <div class="teacher-booking-card">
                    <!-- Header -->
                    <div class="teacher-booking-header">
                        ${logoUrl ? '<img src="' + logoUrl + '" class="teacher-booking-avatar" alt="">' : '<div class="teacher-booking-avatar" style="display:flex;align-items:center;justify-content:center;background:var(--system-gray6);"><i data-lucide="user" size="28" style="opacity:0.4;"></i></div>'}
                        <div class="teacher-booking-info">
                            <div class="teacher-booking-name">${teacherName}</div>
                            <div class="teacher-booking-title">${t2.private_teacher_label || "Private Dance Teacher"}</div>
                            <div class="teacher-booking-meta">
                                ${priceLabel ? '<span class="teacher-booking-price">' + priceLabel + " / " + (t2.session_label || "session") + "</span>" : ""}
                            </div>
                        </div>
                    </div>
                    ${locations.length > 0 ? `
                    <!-- Location -->
                    <div class="teacher-booking-location-bar">
                        <i data-lucide="map-pin" size="14" style="opacity: 0.5;"></i>
                        <select onchange="state._bookingLocation=this.value; window.loadBookingWeek();">
                            ${locations.map((loc) => '<option value="' + loc + '"' + (loc === selectedLocation ? " selected" : "") + ">" + loc + "</option>").join("")}
                        </select>
                    </div>
                    ` : ""}
                    <!-- Week Nav -->
                    <div class="teacher-booking-week-nav">
                        <button class="teacher-booking-week-btn" onclick="window.shiftBookingWeek(-1)"><i data-lucide="chevron-left" size="18"></i></button>
                        <span class="teacher-booking-week-label">${weekLabel}</span>
                        <button class="teacher-booking-week-btn" onclick="window.shiftBookingWeek(1)"><i data-lucide="chevron-right" size="18"></i></button>
                    </div>
                    <!-- Day Slots -->
                    <div class="teacher-booking-days">
                        ${state._bookingSlotsLoading ? '<div style="text-align:center;padding:2rem;"><div class="spin"><i data-lucide="loader-2" size="24"></i></div></div>' : weekSlots.length === 0 ? '<div style="padding:2rem;text-align:center;color:var(--text-muted);font-style:italic;">' + (t2.no_availability_this_week || "No availability this week") + "</div>" : weekSlots.map((day) => {
          if (!day.hasAvailability) return "";
          const filteredSlots = selectedLocation ? day.slots.filter((s) => !s.location || s.location === selectedLocation) : day.slots;
          if (filteredSlots.length === 0) return "";
          return '<div class="teacher-booking-day"><div class="teacher-booking-day-label">' + (dayNames[day.dayName] || day.dayName) + ", " + day.dayNumber + '</div><div class="teacher-booking-slots">' + filteredSlots.map((s) => {
            const isSelected = selectedSlot && selectedSlot.date === day.date && selectedSlot.time === s.time;
            return '<button class="teacher-booking-slot ' + (s.available ? "available" : "unavailable") + (isSelected ? " selected" : "") + '" ' + (s.available ? `onclick="window.selectBookingSlot('` + day.date + "', '" + s.time + "', '" + (s.location || "").replace(/'/g, "\\\\'") + `')"` : "disabled") + ">" + s.time + "</button>";
          }).join("") + "</div></div>";
        }).join("")}
                    </div>
                </div>

                ${selectedSlot ? `
                <!-- Confirm Button -->
                <button class="btn-primary" onclick="window.showBookingConfirmation()" style="width: 100%; border-radius: 16px; height: 56px; font-size: 16px; font-weight: 800; margin-top: 0.5rem; margin-bottom: 1rem;">
                    <i data-lucide="calendar-check" size="18" style="margin-right: 8px;"></i> ${t2.confirm_booking_btn || "Request this slot"}
                </button>
                ` : ""}
            </div>
        `;
        if (!state._bookingSlotsLoaded || state._bookingSlotsLoadedWeek !== weekStartState) {
          setTimeout(() => window.loadBookingWeek(), 50);
        }
      } else if (view === "shop") {
        const planSortKey = (s) => {
          const name = (s.name || "").toLowerCase();
          if (name.includes("ilimitad") || name.includes("unlimited") || s.limit_count === 0 && (s.limit_count_private == null || s.limit_count_private === 0) || s.limit_count == null && !(s.name || "").match(/\d+/)) return 1e9;
          const n = parseInt(s.limit_count, 10);
          if (!isNaN(n)) return n;
          const m = (s.name || "").match(/\d+/);
          return m ? parseInt(m[0], 10) : 0;
        };
        const hasPrivateInPlan = (s) => s.limit_count_private != null && s.limit_count_private > 0;
        const hasEventsInPlan = (s) => s.limit_count_events != null && s.limit_count_events > 0;
        const isPT = state.currentSchool?.profile_type === "private_teacher";
        const hasDualShop = isPT || state.currentSchool?.private_packages_enabled !== false && state.adminSettings?.private_classes_offering_enabled === "true";
        const hasEventsEnabledShop = state.currentSchool?.events_packages_enabled !== false && state.adminSettings?.events_offering_enabled === "true";
        const visibleSubsShop = (state.subscriptions || []).filter((s) => {
          if (!hasEventsEnabledShop && hasEventsInPlan(s)) return false;
          if (!hasDualShop && hasPrivateInPlan(s)) return false;
          return true;
        });
        const hasGroupInPlan = (s) => s.limit_count != null && s.limit_count > 0;
        const shopGroupOnly = visibleSubsShop.filter((s) => hasGroupInPlan(s) && !hasPrivateInPlan(s) && !hasEventsInPlan(s)).sort((a, b) => planSortKey(a) - planSortKey(b));
        const shopPrivateOnly = visibleSubsShop.filter((s) => hasPrivateInPlan(s) && !hasGroupInPlan(s) && !hasEventsInPlan(s)).sort((a, b) => planSortKey(a) - planSortKey(b));
        const shopMixed = visibleSubsShop.filter((s) => hasEventsInPlan(s) || hasGroupInPlan(s) && hasPrivateInPlan(s)).sort((a, b) => planSortKey(a) - planSortKey(b));
        html += `<h1>${t2.shop_title}</h1>`;
        html += `<p class="text-muted" style="margin-bottom: 1.5rem; font-size: 1.1rem;">${t2.select_plan_msg}</p>`;
        if (shopGroupOnly.length > 0) {
          html += `<div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.6rem;">${t2.plans_section_group || "Group classes"}</div>`;
          html += `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: ${shopPrivateOnly.length > 0 || shopMixed.length > 0 ? "2rem" : "0"};">`;
          shopGroupOnly.forEach((s) => {
            const ev = s.limit_count_events != null && s.limit_count_events > 0 ? (t2.events || "Events") + " " + s.limit_count_events : "";
            const detailLine = ev ? `<p class="text-muted" style="font-size: 0.75rem; margin-bottom: 0.5rem;">${t2.group_classes || "Group"} ${s.limit_count || 0}${ev ? " \xB7 " + ev : ""}</p>` : "";
            html += `
                <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-radius: 24px; padding: 1.2rem;">
                    <div>
                        <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">${s.name}</h3>
                        <p class="text-muted" style="margin-bottom: 0.75rem; font-size: 0.8rem;">
                            ${t2.valid_for_days.replace("{days}", s.validity_days || 30)}
                        </p>
                        ${detailLine}
                        <div style="font-size: 1.75rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.04em;">${formatPrice(s.price, state.currentSchool?.currency || "MXN")}</div>
                    </div>
                    <button class="btn-primary w-full" onclick="openPaymentModal('${s.id}')" style="padding: 0.75rem; font-size: 0.9rem;">${t2.buy}</button>
                </div>
            `;
          });
          html += `</div>`;
        }
        if (shopPrivateOnly.length > 0) {
          html += `<div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.6rem;">${t2.plans_section_private || "Private classes"}</div>`;
          html += `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: ${shopMixed.length > 0 ? "2rem" : "0"};">`;
          shopPrivateOnly.forEach((s) => {
            const parts = [(t2.group_classes || "Group") + " " + (s.limit_count ?? 0), (t2.private_classes || "Private") + " " + (s.limit_count_private ?? 0)];
            if (s.limit_count_events != null && s.limit_count_events > 0) parts.push((t2.events || "Events") + " " + s.limit_count_events);
            const detailLine = parts.length > 0 ? `<p class="text-muted" style="font-size: 0.75rem; margin-bottom: 0.5rem;">${parts.join(" \xB7 ")}</p>` : "";
            html += `
                <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-radius: 24px; padding: 1.2rem;">
                    <div>
                        <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">${s.name}</h3>
                        <p class="text-muted" style="margin-bottom: 0.75rem; font-size: 0.8rem;">
                            ${t2.valid_for_days.replace("{days}", s.validity_days || 30)}
                        </p>
                        ${detailLine}
                        <div style="font-size: 1.75rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.04em;">${formatPrice(s.price, state.currentSchool?.currency || "MXN")}</div>
                    </div>
                    <button class="btn-primary w-full" onclick="openPaymentModal('${s.id}')" style="padding: 0.75rem; font-size: 0.9rem;">${t2.buy}</button>
                </div>
            `;
          });
          html += `</div>`;
        }
        if (shopMixed.length > 0) {
          html += `<div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.6rem; margin-top: ${shopGroupOnly.length > 0 || shopPrivateOnly.length > 0 ? "1.5rem" : "0"};">${t2.plans_section_mixed || "Mixed classes"}</div>`;
          html += `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">`;
          shopMixed.forEach((s) => {
            const parts = [(t2.group_classes || "Group") + " " + (s.limit_count ?? 0), (t2.private_classes || "Private") + " " + (s.limit_count_private ?? 0), (t2.events || "Events") + " " + (s.limit_count_events ?? 0)];
            const detailLine = `<p class="text-muted" style="font-size: 0.75rem; margin-bottom: 0.5rem;">${parts.join(" \xB7 ")}</p>`;
            html += `
                <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-radius: 24px; padding: 1.2rem;">
                    <div>
                        <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">${s.name}</h3>
                        <p class="text-muted" style="margin-bottom: 0.75rem; font-size: 0.8rem;">
                            ${t2.valid_for_days.replace("{days}", s.validity_days || 30)}
                        </p>
                        ${detailLine}
                        <div style="font-size: 1.75rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.04em;">${formatPrice(s.price, state.currentSchool?.currency || "MXN")}</div>
                    </div>
                    <button class="btn-primary w-full" onclick="openPaymentModal('${s.id}')" style="padding: 0.75rem; font-size: 0.9rem;">${t2.buy}</button>
                </div>
            `;
          });
          html += `</div>`;
        }
      } else if (view === "qr") {
        const compBlockHtml = state.currentCompetitionForStudent ? (() => {
          const comp = state.currentCompetitionForStudent;
          const reg = state.studentCompetitionRegistration;
          const eventName = (comp.name || "").substring(0, 40);
          const signInOpen = !!comp.is_sign_in_active;
          if (reg && reg.status === "SUBMITTED" && !comp.decisions_published_at) {
            return `<div style="margin-bottom: 2rem; padding: 1rem; border-radius: 16px; background: var(--system-gray6); text-align: center;"><span style="font-size: 14px; font-weight: 600;">${t2.reviewing_application}</span></div>`;
          }
          if (reg && comp.decisions_published_at) {
            const accepted = reg.status === "APPROVED";
            const eventNameEsc = (comp.name || "").replace(/"/g, "&quot;");
            const msg = (accepted ? t2.competition_approved_message || 'Congratulations! You will compete in "{eventName}"' : t2.competition_declined_message || "This time you cannot compete, but we hope to see you next time.").replace("{eventName}", eventNameEsc);
            const cardBg = accepted ? "linear-gradient(145deg, rgba(52, 199, 89, 0.12), rgba(52, 199, 89, 0.06))" : "linear-gradient(145deg, rgba(142, 142, 147, 0.1), rgba(142, 142, 147, 0.04))";
            const cardBorder = accepted ? "1px solid rgba(52, 199, 89, 0.4)" : "1px solid rgba(142, 142, 147, 0.2)";
            const badgeBg = accepted ? "var(--system-green)" : "rgba(142, 142, 147, 0.2)";
            const badgeColor = accepted ? "white" : "var(--text-secondary)";
            return `
                <div style="margin-bottom: 2rem;">
                    <div style="background: ${cardBg}; border: ${cardBorder}; border-radius: 20px; padding: 1.5rem; text-align: center; max-width: 320px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                        <div style="margin-bottom: 1rem;">
                            <span style="display: inline-flex; align-items: center; justify-content: center; background: ${badgeBg}; color: ${badgeColor}; padding: 10px 24px; border-radius: 24px; font-weight: 800; font-size: 14px; letter-spacing: 0.04em; text-transform: uppercase;">${accepted ? '<i data-lucide="check-circle" size="18" style="margin-right: 8px; vertical-align: middle;"></i>' : ""}${accepted ? t2.accepted : t2.declined}</span>
                        </div>
                        <p style="font-size: 16px; line-height: 1.5; color: var(--text-primary); margin: 0; font-weight: 500;">${msg.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                    </div>
                </div>`;
          }
          if (!signInOpen) {
            return `<div style="margin-bottom: 2rem; padding: 1rem; border-radius: 16px; background: var(--system-gray6); text-align: center;"><span style="font-size: 14px; font-weight: 600;">${eventName}</span><br><span style="font-size: 12px; color: var(--text-secondary);">${t2.competition_reg_opens_soon || "Registration opens soon"}</span></div>`;
          }
          return `<div style="margin-bottom: 2rem; display: flex; justify-content: center;">
                <button type="button" onclick="navigateToStudentJackAndJill('${comp.id}')" style="display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; max-width: 320px; padding: 18px 28px; border-radius: 18px; border: none; background: linear-gradient(135deg, var(--system-blue), #0051D5); color: white; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 24px rgba(0, 122, 255, 0.35); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 28px rgba(0, 122, 255, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(0, 122, 255, 0.35)'">
                    <i data-lucide="trophy" size="22"></i>
                    <span>${(t2.register_for_event || "Register for {eventName}").replace("{eventName}", eventName)}</span>
                </button>
            </div>`;
        })() : "";
        html += `
            <div class="text-center">
                <h1 style="margin-bottom: 0.5rem;">${t2.qr_title}</h1>
                <p class="text-muted" style="margin-bottom: ${compBlockHtml ? "1rem" : "2rem"};">${t2.qr_subtitle}</p>
                ${compBlockHtml}
                <div class="qr-outer" style="margin: 0 auto 1.5rem;"><div id="qr-code"></div></div>
                <div>
                    <div style="font-size: 0.8rem; margin-bottom: 1rem; letter-spacing: 0.05em; font-weight: 600;">
                        ${t2.student_id}: <span style="color: var(--primary);">${state.currentUser.id}</span>
                    </div>
                    <div class="card" style="max-width: 280px; margin: 0 auto; padding: 1.2rem; border-radius: 20px;">
                    ${(() => {
          const isPT = state.currentSchool?.profile_type === "private_teacher";
          const packs = state.currentUser.active_packs || [];
          const now = /* @__PURE__ */ new Date();
          const activePacks = packs.filter((p) => new Date(p.expires_at) > now);
          const hasUnlimitedGroup = state.currentUser.balance === null || activePacks.some((p) => p.count == null || p.count === "null");
          const groupVal = hasUnlimitedGroup ? "\u221E" : state.currentUser.balance ?? 0;
          const privVal = state.currentUser.balance_private ?? 0;
          const eventsFromPacks = activePacks.reduce((s, p) => s + (p.event_count || 0), 0);
          const effectiveEvents = Math.max(state.currentUser.balance_events ?? 0, eventsFromPacks);
          const hasGroup = hasUnlimitedGroup || state.currentUser.balance != null && state.currentUser.balance > 0 || activePacks.some((p) => p.count != null && p.count !== "null" && (parseInt(p.count, 10) || 0) > 0);
          const hasPrivate = privVal > 0 || activePacks.some((p) => (p.private_count || 0) > 0);
          const hasEvents = effectiveEvents > 0;
          const showDual = isPT || hasPrivate;
          const parts = [];
          if (hasGroup) parts.push({ label: t2.group_classes_remaining || "Group", value: groupVal });
          if (hasPrivate) parts.push({ label: t2.private_classes_remaining || "Private", value: privVal });
          if (hasEvents) parts.push({ label: t2.events_remaining || "Events", value: String(effectiveEvents) });
          if (parts.length === 0) {
            return '<div class="text-muted" style="font-size: 0.8rem; margin-bottom: 0.2rem; font-weight: 600; text-transform: uppercase;">' + t2.remaining_classes + '</div><div style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.04em; color: var(--primary);">0</div>';
          }
          if (parts.length === 1) {
            return '<div class="text-muted" style="font-size: 0.8rem; margin-bottom: 0.2rem; font-weight: 600; text-transform: uppercase;">' + parts[0].label + '</div><div style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.04em; color: var(--primary);">' + parts[0].value + "</div>";
          }
          const row = (label, value) => '<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.35rem;"><span class="text-muted" style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">' + label + '</span><span style="font-size: 1.5rem; font-weight: 800; letter-spacing: -0.04em; color: var(--primary);">' + value + "</span></div>";
          return parts.map((p) => row(p.label, p.value)).join("");
        })()}
                        ${(() => {
          const balance = state.currentUser.balance ?? 0;
          const balancePrivate = state.currentUser.balance_private ?? 0;
          const packs = state.currentUser.active_packs || [];
          const now = /* @__PURE__ */ new Date();
          const activePacks = packs.filter((p) => new Date(p.expires_at) > now);
          const hasUnlimitedGroup = state.currentUser.balance === null || activePacks.some((p) => p.count == null || p.count === "null");
          const isPT = state.currentSchool?.profile_type === "private_teacher";
          const hasPrivate = (state.currentUser.active_packs || []).some((p) => (p.private_count || 0) > 0);
          const eventsFromPacksExp = activePacks.reduce((s, p) => s + (p.event_count || 0), 0);
          const hasEventsLeft = (state.currentUser.balance_events ?? 0) > 0 || eventsFromPacksExp > 0;
          const noClassesLeft = isPT ? balancePrivate <= 0 && !hasEventsLeft : balance <= 0 && !hasUnlimitedGroup && !hasEventsLeft;
          if (noClassesLeft) return "";
          const nextExpiry = state.currentUser.package_expires_at || (activePacks.length > 0 ? activePacks.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at))[0].expires_at : null);
          if (nextExpiry) {
            const d = new Date(nextExpiry);
            const days = window.getDaysRemaining(nextExpiry);
            const isSoon = days !== null && days <= 5 && days > 0;
            const isExpired = days !== null && days <= 0;
            const useFixedExpiryDisplay = state._usePlanExpiryFixedDate || false;
            const displayValue = useFixedExpiryDisplay ? d.toLocaleDateString() : days !== null ? `${days} ${t2.days_left || "days left"}` : d.toLocaleDateString();
            return `<div style="margin-top: 10px; font-size: 11px; font-weight: 600; color: var(--text-secondary);">${t2.next_expiry_label}: <span style="color: ${isExpired ? "var(--system-red)" : isSoon ? "var(--system-orange)" : "var(--primary)"};">${displayValue}</span></div>`;
          }
          return "";
        })()}
                    </div>

                    <div style="margin-top: 2rem; width: 100%; max-width: 320px; margin-left: auto; margin-right: auto; text-align: left;">
                        ${(() => {
          const now = /* @__PURE__ */ new Date();
          const currentSchoolId = state.currentSchool?.id;
          const enrollments = Array.isArray(state.allEnrollments) && state.allEnrollments.length > 0 ? state.allEnrollments : [{ ...state.currentUser, school_name: state.currentSchool?.name || "" }];
          const hasMultipleSchools = enrollments.length > 1 || enrollments.length === 1 && enrollments[0].school_id !== currentSchoolId;
          const useFixedExpiryDisplay = state._usePlanExpiryFixedDate || false;
          const renderPackCard = (p, isExp, schoolName) => {
            const days = window.getDaysRemaining(p.expires_at);
            const isSoon = !isExp && days > 0 && days <= 5;
            const sc = isExp ? "var(--system-red)" : isSoon ? "var(--system-orange)" : "var(--system-blue)";
            const bg = isExp ? "var(--system-gray6)" : "linear-gradient(145deg, var(--bg-card), var(--bg-body))";
            const statusText = isExp ? "Expirado" : useFixedExpiryDisplay ? "Activo" : isSoon ? days + "d Restantes" : "Activo";
            const expiryDisplay = useFixedExpiryDisplay ? new Date(p.expires_at).toLocaleDateString() : days !== null ? days + " " + (t2.days_left || "days left") : new Date(p.expires_at).toLocaleDateString();
            const privCount = p.private_count ?? 0;
            const eventCount = p.event_count ?? 0;
            const groupCount = p.count;
            const groupHas = groupCount == null || groupCount === "null" || (parseInt(groupCount, 10) || 0) > 0;
            const hasBoth = groupHas && privCount > 0;
            const isPrivateOnly = !groupHas && privCount > 0;
            const hasAnyEvent = eventCount > 0;
            const parts = [];
            if (groupHas) parts.push((t2.group_classes_remaining || "G") + " " + (groupCount == null || groupCount === "null" ? "\u221E" : groupCount));
            if (privCount > 0) parts.push((t2.private_classes_remaining || "P") + " " + privCount);
            if (hasAnyEvent) parts.push((t2.events_remaining || "E") + " " + eventCount);
            let countHtml = "";
            if (parts.length > 1 || hasAnyEvent) {
              countHtml = '<div style="text-align: right;"><div style="font-size: 14px; font-weight: 800; color: ' + (isExp ? "var(--text-secondary)" : "var(--primary)") + ';">' + parts.join(" / ") + "</div></div>";
            } else if (isPrivateOnly) {
              countHtml = '<div style="text-align: right;"><div style="font-size: 20px; font-weight: 800; color: ' + (isExp ? "var(--text-secondary)" : "var(--primary)") + ';">' + privCount + '</div><div style="font-size: 9px; font-weight: 700; opacity: 0.4; text-transform: uppercase;">' + (t2.private_classes || "Private") + "</div></div>";
            } else if (hasBoth) {
              const gVal = groupCount == null || groupCount === "null" ? "\u221E" : groupCount;
              countHtml = '<div style="text-align: right;"><div style="font-size: 16px; font-weight: 800; color: ' + (isExp ? "var(--text-secondary)" : "var(--primary)") + ';">' + (t2.group_classes || "Group") + ": " + gVal + " \xB7 " + (t2.private_classes || "Private") + ": " + privCount + "</div></div>";
            } else {
              countHtml = '<div style="text-align: right;"><div style="font-size: 20px; font-weight: 800; color: ' + (isExp ? "var(--text-secondary)" : "var(--primary)") + ';">' + (groupCount == null || groupCount === "null" ? "\u221E" : groupCount) + '</div><div style="font-size: 9px; font-weight: 700; opacity: 0.4; text-transform: uppercase;">Clases</div></div>';
            }
            return '<div class="card" style="padding: 1.2rem; border-radius: 22px; border: 1px solid var(--border); background: ' + bg + "; opacity: " + (isExp ? 0.7 : 1) + ';"><div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;"><div><div style="font-size: 15px; font-weight: 700;">' + (p.name || "").replace(/</g, "&lt;") + '</div><div style="font-size: 11px; font-weight: 600; opacity: 0.5; text-transform: uppercase;">' + (p.created_at ? new Date(p.created_at).toLocaleDateString() : "") + '</div></div><div style="background: ' + sc + '; color: white; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase;">' + statusText + '</div></div><div style="display: flex; align-items: flex-end; justify-content: space-between;"><div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-secondary);"><i data-lucide="calendar" size="14" style="opacity: 0.6;"></i><span>' + t2.expires_label + ": " + expiryDisplay + "</span></div>" + countHtml + "</div></div>";
          };
          const sorted = [...enrollments].sort((a, b) => {
            if (a.school_id === currentSchoolId && b.school_id !== currentSchoolId) return -1;
            if (b.school_id === currentSchoolId && a.school_id !== currentSchoolId) return 1;
            return (a.school_name || "").localeCompare(b.school_name || "");
          });
          let totalActive = 0;
          let totalExpired = 0;
          sorted.forEach((en) => {
            const packs = Array.isArray(en.active_packs) ? en.active_packs : [];
            totalActive += packs.filter((p) => new Date(p.expires_at) > now).length;
            totalExpired += packs.filter((p) => new Date(p.expires_at) <= now).length;
          });
          let out = "";
          if (hasMultipleSchools) {
            out += '<div style="text-transform: uppercase; font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: 16px; letter-spacing: 0.05em; opacity: 0.6; padding: 0 10px;">' + (t2.all_schools_packs_label || "Your Packs Across Schools") + "</div>";
          } else {
            out += '<div style="text-transform: uppercase; font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px; letter-spacing: 0.05em; opacity: 0.6; padding: 0 10px;">' + (t2.active_packs_label || "Tus Paquetes Activos") + "</div>";
          }
          if (totalActive === 0 && totalExpired === 0) {
            out += '<div style="background: var(--bg-card); padding: 1.5rem; border-radius: 24px; text-align: center; border: 1px dashed var(--border);"><div style="font-size: 13px; color: var(--text-secondary); opacity: 0.5;">' + (t2.no_packs_any_school || "No tienes paquetes activos") + "</div></div>";
            return out;
          }
          const packHasRemaining = (p) => p.count == null || p.count === "null" || (parseInt(p.count, 10) || 0) > 0 || (p.private_count || 0) > 0 || (p.event_count || 0) > 0;
          const usedOrExpiredPacks = [];
          for (const enrollment of sorted) {
            const sName = (enrollment.school_name || "").replace(/</g, "&lt;");
            const packs = Array.isArray(enrollment.active_packs) ? enrollment.active_packs : [];
            const active = packs.filter((p) => new Date(p.expires_at) > now).sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
            const expired = packs.filter((p) => new Date(p.expires_at) <= now).sort((a, b) => new Date(b.expires_at) - new Date(a.expires_at));
            const activeWithRemaining = active.filter(packHasRemaining);
            const activeEmpty = active.filter((p) => !packHasRemaining(p));
            expired.forEach((p) => usedOrExpiredPacks.push({ p, sName, isExp: true }));
            activeEmpty.forEach((p) => usedOrExpiredPacks.push({ p, sName, isExp: false }));
            if (activeWithRemaining.length === 0 && activeEmpty.length === 0 && expired.length === 0) continue;
            const isCurrent = enrollment.school_id === currentSchoolId;
            const hasPriv = enrollment.balance_private != null && enrollment.balance_private > 0 || packs.some((p) => (p.private_count || 0) > 0);
            const eventsFromPacksEn = packs.filter((p) => new Date(p.expires_at) > now).reduce((s, p) => s + (p.event_count || 0), 0);
            const effectiveEvEn = Math.max(enrollment.balance_events ?? 0, eventsFromPacksEn);
            const hasEv = effectiveEvEn > 0 || packs.some((p) => (p.event_count || 0) > 0);
            let enrollLabel = (enrollment.balance === null ? "\u221E" : enrollment.balance ?? 0) + " clases";
            if (hasPriv || hasEv) {
              const g = (t2.group_classes_remaining || "G") + " " + (enrollment.balance === null ? "\u221E" : enrollment.balance ?? 0);
              const p_ = hasPriv ? " " + (t2.private_classes_remaining || "P") + " " + (enrollment.balance_private ?? 0) : "";
              const e = hasEv ? " " + (t2.events_remaining || "E") + " " + effectiveEvEn : "";
              enrollLabel = g + p_ + e;
            }
            if (activeWithRemaining.length > 0) {
              if (hasMultipleSchools) {
                out += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; margin-top: 12px; padding: 0 4px;"><div style="width: 6px; height: 6px; border-radius: 50%; background: ' + (isCurrent ? "var(--system-blue)" : "var(--text-secondary)") + "; opacity: " + (isCurrent ? 1 : 0.4) + ';"></div><div style="font-size: 13px; font-weight: 700; color: ' + (isCurrent ? "var(--text-primary)" : "var(--text-secondary)") + ';">' + sName + '</div><div style="font-size: 11px; font-weight: 600; color: var(--text-secondary); opacity: 0.6; margin-left: auto;">' + enrollLabel + "</div></div>";
              }
              out += '<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 1rem;">';
              out += activeWithRemaining.map((p) => renderPackCard(p, false, sName)).join("");
              out += "</div>";
            }
          }
          if (usedOrExpiredPacks.length > 0) {
            out += '<details style="margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1rem;">';
            out += '<summary style="cursor: pointer; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); opacity: 0.7; list-style: none; display: flex; align-items: center; gap: 6px;">';
            out += '<span style="opacity: 0.7;">\u25B6</span> ' + (t2.used_packs_label || "Used packages") + " (" + usedOrExpiredPacks.length + ")";
            out += "</summary>";
            out += '<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">';
            usedOrExpiredPacks.forEach(({ p, sName, isExp }) => {
              out += renderPackCard(p, isExp, sName);
            });
            out += "</div></details>";
          }
          return out;
        })()}
                    </div>

                    ${state.currentSchool?.class_registration_enabled ? (() => {
          const regExpanded = state.qrRegistrationsExpanded !== false;
          const upcoming = (state.studentRegistrations || []).filter((r) => r.status === "registered");
          const pastTook = (state.studentPastRegistrations || []).filter((r) => r.status === "attended" || r.status === "no_show");
          const todayTook = (state.studentRegistrations || []).filter((r) => r.status === "attended" || r.status === "no_show");
          const took = [...todayTook, ...pastTook].sort((a, b) => {
            const dA = /* @__PURE__ */ new Date(a.class_date + "T" + (a.time || "23:59"));
            const dB = /* @__PURE__ */ new Date(b.class_date + "T" + (b.time || "23:59"));
            return dB - dA;
          });
          const locale = state.language === "es" ? "es-ES" : state.language === "de" ? "de-DE" : "en-US";
          const fmtDate = (d) => d ? new Date(d).toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" }) : "";
          return `
                    <div class="qr-registrations-expandable ${regExpanded ? "expanded" : ""}" style="margin-top: 1.5rem; width: 100%; max-width: 320px; margin-left: auto; margin-right: auto; border-top: 1px solid var(--border); padding-top: 1rem;">
                        <div class="qr-registrations-header" onclick="toggleExpandableNoRender('qrRegistrations')" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; cursor: pointer;">
                            <span style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t2.my_registrations_label || "Class Registrations"}</span>
                            <i data-lucide="chevron-down" size="18" class="expandable-chevron" style="opacity: 0.5;"></i>
                        </div>
                        <div id="qr-registrations-content" style="display: ${regExpanded ? "" : "none"};">
                        <div style="display: flex; flex-direction: column; gap: 14px;">
                            <div>
                                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); opacity: 0.7; margin-bottom: 8px;">${t2.upcoming_classes || "Upcoming"}</div>
                                ${upcoming.length === 0 ? `<div style="font-size: 13px; color: var(--text-secondary); padding: 8px 0;">${t2.no_upcoming || "No upcoming registrations"}</div>` : upcoming.map((r) => {
            const dateLabel = fmtDate(r.class_date);
            return `<div class="card" style="padding: 10px 14px; border-radius: 12px; font-size: 13px;"><div style="font-weight: 700;">${(r.class_name || "").replace(/</g, "&lt;")}</div><div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${dateLabel} \u2022 ${r.time || ""}</div></div>`;
          }).join("")}
                            </div>
                            <div>
                                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); opacity: 0.7; margin-bottom: 8px;">${t2.took_class_label || "Took class"}</div>
                                ${took.length === 0 ? `<div style="font-size: 13px; color: var(--text-secondary); padding: 8px 0;">${t2.no_past_classes || "No classes attended yet"}</div>` : took.slice(0, 20).map((r) => {
            const dateLabel = fmtDate(r.class_date);
            const statusLabel = r.status === "attended" ? t2.attended || "Attended" : t2.no_show || "No-show";
            const statusColor = r.status === "attended" ? "var(--system-green)" : "var(--text-secondary)";
            return `<div class="card" style="padding: 10px 14px; border-radius: 12px; font-size: 13px; opacity: 0.9;"><div style="font-weight: 700;">${(r.class_name || "").replace(/</g, "&lt;")}</div><div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${dateLabel} \u2022 ${r.time || ""}</div><div style="font-size: 10px; font-weight: 600; color: ${statusColor}; margin-top: 4px;">${statusLabel}</div></div>`;
          }).join("")}
                            </div>
                        </div>
                        </div>
                    </div>
                    `;
        })() : ""}

                </div>
            </div>
        `;
        setTimeout(() => {
          new QRCode(document.getElementById("qr-code"), {
            text: state.currentUser.user_id || state.currentUser.id,
            width: 250,
            height: 250,
            colorDark: "#000",
            colorLight: "#fff"
          });
        }, 50);
      } else if (view === "student-competition-register") {
        const compId = state.competitionId;
        const studentId = state.currentUser?.id;
        const schoolId = state.currentUser?.school_id || state.currentSchool?.id;
        if (compId && studentId && schoolId && !state.studentCompetitionDetail) {
          (async () => {
            const { data: compData } = await supabaseClient.rpc("competition_get_by_id_for_student", { p_competition_id: compId, p_student_id: String(studentId), p_school_id: schoolId });
            state.studentCompetitionDetail = Array.isArray(compData) && compData.length > 0 ? compData[0] : null;
            const { data: regData } = await supabaseClient.rpc("competition_registration_get", { p_competition_id: compId, p_student_id: String(studentId) });
            state.studentCompetitionRegDetail = Array.isArray(regData) && regData.length > 0 ? regData[0] : null;
            if (state.studentCompetitionRegDetail && state.studentCompetitionRegDetail.answers) state.studentCompetitionAnswers = state.studentCompetitionRegDetail.answers;
            else state.studentCompetitionAnswers = state.studentCompetitionAnswers || {};
            renderView();
          })();
        }
        const comp = state.studentCompetitionDetail;
        const reg = state.studentCompetitionRegDetail;
        const questions = comp && Array.isArray(comp.questions) ? comp.questions : [];
        const isSubmitted = reg && reg.status !== "DRAFT";
        const isPublished = comp && comp.decisions_published_at;
        const answers = state.studentCompetitionAnswers || {};
        html += `
            <div class="student-comp-header">
                <div class="student-comp-header-bar">
                    <button type="button" class="btn-back" onclick="window.location.hash=''; state.currentView='qr'; state.competitionId=null; state.studentCompetitionDetail=null; state.studentCompetitionRegDetail=null; saveState(); renderView();"><i data-lucide="arrow-left" size="20"></i></button>
                    <div class="ios-large-title">${t2.jack_and_jill}</div>
                </div>
            </div>
            <div class="student-comp-body">
                ${!comp ? `<p style="color: var(--text-secondary);">${t2.loading}</p>` : `
                <div class="student-comp-info">
                    <h2 class="student-comp-title">${(comp.name || "").replace(/</g, "&lt;")}</h2>
                    <p class="student-comp-date">${comp.starts_at ? new Date(comp.starts_at).toLocaleString() : ""}</p>
                    ${comp.next_steps_text ? `<div class="student-comp-next-steps scroll-nice">${(comp.next_steps_text || "").replace(/</g, "&lt;")}</div>` : ""}
                </div>
                ${isSubmitted ? `
                    ${isPublished && reg ? `<div style="text-align: center; padding: 1.5rem;"><span class="status-badge ${reg.status === "APPROVED" ? "status-approved" : "status-declined"}" style="display: inline-block; padding: 10px 20px; border-radius: 20px; font-weight: 700; font-size: 16px;">${reg.status === "APPROVED" ? t2.accepted : t2.declined}</span></div>` : `<p style="text-align: center; font-weight: 600;">${t2.reviewing_application}</p>`}
                ` : `
                <form id="student-comp-form" onsubmit="return false;">
                    ${questions.map((q, i) => `
                        <div style="margin-bottom: 1rem;">
                            <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">${(q || "").replace(/</g, "&lt;")}</label>
                            <input type="text" name="q${i}" data-qidx="${i}" value="${(answers[i] || answers[String(i)] || "").replace(/"/g, "&quot;").replace(/</g, "&lt;")}" oninput="debouncedSaveCompetitionDraft()" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-primary);">
                        </div>
                    `).join("")}
                    ${comp.video_submission_enabled ? `
                    <div style="margin-bottom: 1rem;">
                        <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">${(comp.video_submission_prompt || t2.competition_video_prompt_placeholder || "Upload your demo video (2-3 minutes)").replace(/</g, "&lt;")}</label>
                        <div id="student-comp-video-upload-area">
                            <input type="file" id="student-comp-video-input" accept="video/mp4,video/quicktime,video/webm" onchange="handleCompetitionVideoSelect(this)" style="width: 100%; padding: 10px; font-size: 14px;">
                            <div id="student-comp-video-status" style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;"></div>
                            ${answers.video ? `<div style="margin-top: 8px; font-size: 13px; color: var(--system-green); font-weight: 600;"><i data-lucide="check-circle" size="14" style="vertical-align: middle;"></i> ${t2.competition_video_uploaded || "Video uploaded"}</div>` : ""}
                        </div>
                    </div>
                    ` : ""}
                    <button type="button" class="btn-primary" id="student-comp-submit-btn" onclick="submitStudentCompetitionRegistration()" style="width: 100%; border-radius: 14px; height: 50px; font-size: 16px; font-weight: 600; margin-top: 1rem;">${t2.submit_registration}</button>
                </form>
                `}
                `}
            </div>
            <div style="height: 80px;"></div>
        `;
      } else if (view === "admin-students") {
        const comps = Array.isArray(state.competitions) ? state.competitions : [];
        const defaultComp = comps.find((c) => c.is_active) || comps.sort((a, b) => new Date(b.starts_at || 0) - new Date(a.starts_at || 0))[0] || null;
        const pickedId = state.adminStudentsCompetitionId && comps.some((c) => c.id === state.adminStudentsCompetitionId) ? state.adminStudentsCompetitionId : null;
        const currentComp = pickedId ? comps.find((c) => c.id === pickedId) : defaultComp;
        const hasActiveEvent = comps.some((c) => c.is_active);
        html += `
            <div class="ios-header" style="background: transparent;"></div>
            <div class="students-page">
                <div class="students-header">
                    <h1 class="students-title">${t2.nav_students}</h1>
                    <div class="students-actions">
                        <button type="button" class="students-btn-add" onclick="createNewStudent()">
                            <i data-lucide="plus" size="18"></i> ${t2.add_student}
                        </button>
                        ${comps.length > 0 && state.currentSchool?.jack_and_jill_enabled === true ? `
                        <details class="students-jackblock" ${typeof window !== "undefined" && window.innerWidth >= 600 ? "open" : ""}>
                            <summary class="students-jack-summary">
                                <span class="students-jack-summary-icon"><i data-lucide="trophy" size="18"></i></span>
                                <span class="students-jack-summary-text">${t2.jack_and_jill}</span>
                                ${currentComp ? `<span class="students-jack-summary-badge">${currentComp.is_active && currentComp.is_sign_in_active ? "\u25CF" : "\u25CB"}</span>` : ""}
                            </summary>
                            <div class="students-jackblock-inner">
                                ${currentComp ? `
                                <div class="students-jack-step">
                                    <label class="students-jack-label">${t2.competition_for_event}</label>
                                    ${comps.length > 1 ? `
                                    <select class="students-jack-select" onchange="state.adminStudentsCompetitionId=this.value; renderView();">
                                        ${comps.map((c) => `<option value="${c.id}" ${c.id === currentComp.id ? "selected" : ""}>${(c.name || "").replace(/</g, "&lt;").substring(0, 42)}${(c.name || "").length > 42 ? "\u2026" : ""}</option>`).join("")}
                                    </select>
                                    ` : `<div class="students-jack-event-name">${(currentComp.name || "").replace(/</g, "&lt;").substring(0, 50)}${(currentComp.name || "").length > 50 ? "\u2026" : ""}</div>`}
                                </div>
                                <div class="students-jack-step">
                                    <div class="students-jack-toggles">
                                        <label class="toggle-switch">
                                            <span class="toggle-switch-label">${t2.competition_activate_event}</span>
                                            <span style="display: flex;">
                                                <input type="checkbox" class="toggle-switch-input" ${currentComp.is_active ? "checked" : ""} onchange="toggleCompetitionActiveFromStudents('${currentComp.id}', this.checked)">
                                                <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                                            </span>
                                        </label>
                                        <label class="toggle-switch">
                                            <span class="toggle-switch-label">${t2.competition_activate_signin}</span>
                                            <span style="display: flex;">
                                                <input type="checkbox" class="toggle-switch-input" ${currentComp.is_sign_in_active ? "checked" : ""} onchange="toggleCompetitionSignInFromStudents('${currentComp.id}', this.checked)">
                                                <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <button type="button" class="students-jack-btn" ${hasActiveEvent ? `onclick="navigateToAdminJackAndJill(state.currentSchool?.id, null, 'registrations')"` : "disabled"}>
                                    <i data-lucide="users" size="18"></i> ${t2.competition_registrations}
                                </button>
                                ` : ""}
                            </div>
                        </details>
                        ` : ""}
                    </div>
                </div>
                ${state.currentSchool?.class_registration_enabled ? (() => {
          const weekRegs = state.adminWeekRegistrations || [];
          const activeRegs = weekRegs;
          const grouped = {};
          activeRegs.forEach((r) => {
            const key = r.class_id + "_" + r.class_date;
            if (!grouped[key]) grouped[key] = { class_name: r.class_name, class_time: r.class_time, class_date: r.class_date, students: [] };
            grouped[key].students.push(r);
          });
          const groupedArr = Object.values(grouped).sort((a, b) => (a.class_date + a.class_time).localeCompare(b.class_date + b.class_time));
          const allRegDates = activeRegs.map((r) => r.class_date).filter(Boolean);
          let dateRangeLabel = "";
          if (allRegDates.length > 0) {
            const sorted = [...new Set(allRegDates)].sort();
            const minD = /* @__PURE__ */ new Date(sorted[0] + "T00:00:00");
            const maxD = /* @__PURE__ */ new Date(sorted[sorted.length - 1] + "T00:00:00");
            dateRangeLabel = window.formatShortDate(minD, state.language) + " \u2013 " + window.formatShortDate(maxD, state.language);
          } else {
            const weekRange = window.getCurrentWeekRange();
            dateRangeLabel = window.formatShortDate(weekRange.start, state.language) + " \u2013 " + window.formatShortDate(weekRange.end, state.language);
          }
          return `
                    <div class="admin-reg-section ${state.adminRegExpanded ? "expanded" : ""}" style="padding: 0 1.2rem; margin-bottom: 1rem;">
                        <div class="admin-reg-header" onclick="toggleExpandableNoRender('adminReg')" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; cursor: pointer; border-bottom: 1px solid var(--border);">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="calendar-check" size="16" style="opacity: 0.6;"></i>
                                <span style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t2.class_registrations_title}</span>
                                <span style="font-size: 10px; color: var(--text-secondary); font-weight: 500;">${dateRangeLabel}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                ${activeRegs.length > 0 ? `<span style="background: var(--secondary); color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">${activeRegs.length}</span>` : ""}
                                <i data-lucide="chevron-down" size="16" class="expandable-chevron" style="opacity: 0.4;"></i>
                            </div>
                        </div>
                        <div id="admin-reg-content" class="admin-reg-content" style="padding: 0.8rem 0; display: ${state.adminRegExpanded ? "" : "none"};">
                            ${groupedArr.length === 0 ? `
                                <div style="text-align: center; padding: 1rem 0; color: var(--text-secondary); font-size: 0.85rem;">
                                    <i data-lucide="inbox" size="24" style="opacity: 0.2; margin-bottom: 0.3rem;"></i>
                                    <div>${t2.no_registrations_yet}</div>
                                </div>
                            ` : groupedArr.map((g) => {
            const dateObj = /* @__PURE__ */ new Date(g.class_date + "T00:00:00");
            const dateLabel = window.formatShortDate(dateObj, state.language);
            const maxCap = (state.classes || []).find((cl) => cl.id === g.students[0]?.class_id)?.max_capacity;
            const capLabel = maxCap ? `${g.students.length} / ${maxCap}` : `${g.students.length}`;
            return `
                                <div class="admin-reg-card">
                                    <div class="admin-reg-card-header">
                                        <div>
                                            <div style="font-size: 0.9rem; font-weight: 700;">${g.class_name}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-secondary);">${dateLabel} \u2022 ${g.class_time}</div>
                                        </div>
                                        <div class="admin-reg-count">${capLabel}</div>
                                    </div>
                                    <div class="admin-reg-students">
                                        ${g.students.map((s) => {
              const statusIcon = s.status === "attended" ? '<i data-lucide="check-circle" size="12" style="color: var(--secondary);"></i>' : s.status === "no_show" ? '<i data-lucide="user-x" size="12" style="opacity: 0.4;"></i>' : s.status === "cancelled" ? '<i data-lucide="x-circle" size="12" style="opacity: 0.4;"></i>' : '<i data-lucide="clock" size="12" style="opacity: 0.4;"></i>';
              const statusLabel = s.status === "attended" ? t2.attended : s.status === "no_show" ? t2.auto_deducted || "No show" : s.status === "cancelled" ? t2.cancelled || "Cancelled" : t2.registered;
              const monthlyTag = s.is_monthly ? '<span style="font-size: 0.55rem; background: var(--system-blue, #007aff); color: white; padding: 1px 5px; border-radius: 6px; font-weight: 700; margin-left: 4px;">' + (t2.monthly_badge || "Monthly") + "</span>" : "";
              return `<div class="admin-reg-student-row">
                                                ${statusIcon}
                                                <span style="font-size: 0.8rem; font-weight: 500;">${s.student_name}${monthlyTag}</span>
                                                <span style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; margin-left: auto;">${statusLabel}</span>
                                            </div>`;
            }).join("")}
                                    </div>
                                </div>`;
          }).join("")}
                        </div>
                    </div>`;
        })() : ""}
                ${state.currentSchool?.profile_type === "private_teacher" ? (() => {
          const acceptedReqs = (state.privateClassRequests || []).filter((r) => r.status === "accepted");
          const sortedAccepted = [...acceptedReqs].sort((a, b) => (a.requested_date + a.requested_time).localeCompare(b.requested_date + b.requested_time));
          const viewMode = state.teacherAcceptedClassesView || "list";
          const expanded = state.teacherAcceptedClassesExpanded !== false;
          return `
                    <div class="teacher-accepted-classes-expandable ${expanded ? "expanded" : ""}" style="padding: 0 1.2rem; margin-bottom: 1rem;">
                        <div class="admin-reg-header" onclick="toggleExpandableNoRender('teacherAcceptedClasses')" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; cursor: pointer; border-bottom: 1px solid var(--border);">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="calendar-check" size="16" style="opacity: 0.6;"></i>
                                <span style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t2.accepted_private_classes || "Accepted private classes"}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                ${acceptedReqs.length > 0 ? `<span style="background: var(--secondary); color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">${acceptedReqs.length}</span>` : ""}
                                <i data-lucide="chevron-down" size="16" class="expandable-chevron" style="opacity: 0.4;"></i>
                            </div>
                        </div>
                        <div id="teacher-accepted-classes-content" style="padding: 0.8rem 0; display: ${expanded ? "" : "none"};">
                            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                                <button type="button" class="btn-tab ${viewMode === "list" ? "active" : ""}" onclick="state.teacherAcceptedClassesView='list'; renderView();" style="padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 8px; border: 1px solid var(--border); background: ${viewMode === "list" ? "var(--secondary)" : "transparent"}; color: ${viewMode === "list" ? "white" : "var(--text-primary)"};">${t2.list_view || "List"}</button>
                                <button type="button" class="btn-tab ${viewMode === "calendar" ? "active" : ""}" onclick="state.teacherAcceptedClassesView='calendar'; renderView();" style="padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 8px; border: 1px solid var(--border); background: ${viewMode === "calendar" ? "var(--secondary)" : "transparent"}; color: ${viewMode === "calendar" ? "white" : "var(--text-primary)"};">${t2.calendar_view || "Calendar"}</button>
                            </div>
                            ${viewMode === "list" ? `
                            ${sortedAccepted.length === 0 ? `
                            <div style="text-align: center; padding: 1rem 0; color: var(--text-secondary); font-size: 0.85rem;">
                                <i data-lucide="inbox" size="24" style="opacity: 0.2; margin-bottom: 0.3rem;"></i>
                                <div>${t2.no_accepted_private_classes || "No accepted private classes yet"}</div>
                            </div>
                            ` : sortedAccepted.map((r) => {
            const studentName = (state.students || []).find((s) => String(s.id) === String(r.student_id))?.name || r.student_id;
            const dateLabel = window.formatShortDate ? window.formatShortDate(/* @__PURE__ */ new Date(r.requested_date + "T00:00:00"), state.language) : r.requested_date;
            return `
                                <div class="teacher-accepted-class-row" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--system-gray6); border-radius: 12px; margin-bottom: 8px;">
                                    <i data-lucide="calendar" size="16" style="opacity: 0.5; flex-shrink: 0;"></i>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; font-size: 14px;">${(studentName || "").replace(/</g, "&lt;")}</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">${dateLabel} &middot; ${(r.requested_time || "").replace(/</g, "&lt;")}${r.location ? " &middot; " + (r.location || "").replace(/</g, "&lt;") : ""}</div>
                                    </div>
                                </div>`;
          }).join("")}
                            ` : (() => {
            const calDateStr = state.teacherAcceptedCalendarDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 7) + "-01";
            const calDate = /* @__PURE__ */ new Date(calDateStr + "T12:00:00");
            const prevMonth = (() => {
              const x = new Date(calDate);
              x.setMonth(x.getMonth() - 1);
              return x.toISOString().slice(0, 7) + "-01";
            })();
            const nextMonth = (() => {
              const x = new Date(calDate);
              x.setMonth(x.getMonth() + 1);
              return x.toISOString().slice(0, 7) + "-01";
            })();
            const monthLabel = calDate.toLocaleDateString(state.language === "es" ? "es-ES" : state.language === "de" ? "de-DE" : "en-US", { month: "long", year: "numeric" });
            const grid = window.getMonthCalendarGrid ? window.getMonthCalendarGrid(calDateStr, acceptedReqs) : [];
            const selectedDate = state.teacherAcceptedCalendarSelectedDate;
            const selectedEvents = selectedDate ? acceptedReqs.filter((r) => r.requested_date === selectedDate) || [] : [];
            const weekdays = state.language === "es" ? ["Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b", "Dom"] : state.language === "de" ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            return `
                                <div class="private-classes-calendar">
                                    <div class="private-classes-calendar-nav">
                                        <button type="button" class="private-classes-calendar-btn" onclick="state.teacherAcceptedCalendarDate='${prevMonth}'; renderView();"><i data-lucide="chevron-left" size="20"></i></button>
                                        <span class="private-classes-calendar-month">${monthLabel}</span>
                                        <button type="button" class="private-classes-calendar-btn" onclick="state.teacherAcceptedCalendarDate='${nextMonth}'; renderView();"><i data-lucide="chevron-right" size="20"></i></button>
                                    </div>
                                    <button type="button" class="private-classes-calendar-today" onclick="state.teacherAcceptedCalendarDate=null; state.teacherAcceptedCalendarSelectedDate=null; renderView();">${t2.today || "Today"}</button>
                                    <div class="private-classes-calendar-weekdays">
                                        ${weekdays.map((w) => `<span class="private-classes-calendar-wd">${w}</span>`).join("")}
                                    </div>
                                    <div class="private-classes-calendar-grid">
                                        ${grid.map((cell) => {
              const isSelected = cell.dateStr === selectedDate;
              const hasEvents = cell.events.length > 0;
              return `
                                            <button type="button" class="private-classes-calendar-day ${!cell.isCurrentMonth ? "other-month" : ""} ${isSelected ? "selected" : ""}" onclick="state.teacherAcceptedCalendarSelectedDate='${cell.dateStr}'; renderView();">
                                                <span class="private-classes-calendar-day-num">${cell.dayNum}</span>
                                                ${hasEvents ? `<span class="private-classes-calendar-dots">${cell.events.slice(0, 3).map(() => '<span class="dot"></span>').join("")}</span>` : ""}
                                            </button>`;
            }).join("")}
                                    </div>
                                    ${selectedDate ? `
                                    <div class="private-classes-calendar-detail">
                                        <div class="private-classes-calendar-detail-title">${window.formatShortDate ? window.formatShortDate(/* @__PURE__ */ new Date(selectedDate + "T00:00:00"), state.language) : selectedDate}</div>
                                        ${selectedEvents.length === 0 ? `<div style="text-align: center; padding: 1rem; color: var(--text-secondary); font-size: 13px;">${t2.no_classes_this_day || "No classes this day"}</div>` : selectedEvents.map((r) => {
              const studentName = (state.students || []).find((s) => String(s.id) === String(r.student_id))?.name || r.student_id;
              return `<div class="teacher-accepted-class-row" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--system-gray6); border-radius: 12px; margin-bottom: 8px;">
                                                <i data-lucide="clock" size="16" style="opacity: 0.5; flex-shrink: 0;"></i>
                                                <div style="flex: 1;">
                                                    <div style="font-weight: 600; font-size: 14px;">${(studentName || "").replace(/</g, "&lt;")}</div>
                                                    <div style="font-size: 12px; color: var(--text-secondary);">${(r.requested_time || "").replace(/</g, "&lt;")}${r.location ? " &middot; " + (r.location || "").replace(/</g, "&lt;") : ""}</div>
                                                </div>
                                            </div>`;
            }).join("")}
                                    </div>
                                    ` : ""}
                                </div>`;
          })()}
                        </div>
                    </div>`;
        })() : ""}
                <div class="students-filter-expandable ${state.studentsFilterExpanded ? "expanded" : ""}" style="margin: 0 1.2rem 0; border-bottom: 1px solid var(--border);">
                    <div class="students-filter-header" onclick="toggleExpandableNoRender('studentsFilter')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; cursor: pointer;">
                        <span style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t2.filters_label || "Filters"}</span>
                        <i data-lucide="chevron-down" size="18" class="expandable-chevron" style="opacity: 0.5;"></i>
                    </div>
                    <div id="students-filter-content" style="display: ${state.studentsFilterExpanded ? "" : "none"}; margin-bottom: 12px;">
                    <div class="filter-bar students-filter-bar">
                        <div class="filter-group">
                            <span class="filter-label">${t2.filter_label_pack || "Pack"}</span>
                            <span class="filter-select-wrap">
                                <select class="filter-control" onchange="state.adminStudentsFilterHasPack=this.value; filterStudents();">
                                    <option value="all" ${(state.adminStudentsFilterHasPack || "all") === "all" ? "selected" : ""}>${t2.filter_all || "All"}</option>
                                    <option value="yes" ${state.adminStudentsFilterHasPack === "yes" ? "selected" : ""}>${t2.filter_with_pack || "With pack"}</option>
                                    <option value="no" ${state.adminStudentsFilterHasPack === "no" ? "selected" : ""}>${t2.filter_no_pack || "No pack"}</option>
                                </select>
                                <i data-lucide="chevron-down" size="16" class="filter-select-chevron"></i>
                            </span>
                        </div>
                        <div class="filter-group">
                            <span class="filter-label">${t2.filter_label_package || "Package"}</span>
                            <span class="filter-select-wrap">
                                <select class="filter-control" onchange="state.adminStudentsFilterPackage=this.value||null; filterStudents();">
                                    <option value="">${t2.filter_all || "All"}</option>
                                    ${(state.subscriptions || []).map((sub) => `<option value="${(sub.name || "").replace(/"/g, "&quot;")}" ${state.adminStudentsFilterPackage === sub.name ? "selected" : ""}>${(sub.name || "").replace(/</g, "&lt;")}</option>`).join("")}
                                </select>
                                <i data-lucide="chevron-down" size="16" class="filter-select-chevron"></i>
                            </span>
                        </div>
                        <div class="filter-group">
                            <span class="filter-label">${t2.filter_label_payment || "Payment"}</span>
                            <span class="filter-select-wrap">
                                <select class="filter-control" onchange="state.adminStudentsFilterPaid=this.value; filterStudents();">
                                    <option value="all" ${(state.adminStudentsFilterPaid || "all") === "all" ? "selected" : ""}>${t2.filter_all || "All"}</option>
                                    <option value="paid" ${state.adminStudentsFilterPaid === "paid" ? "selected" : ""}>${t2.filter_paid || "Paid"}</option>
                                    <option value="unpaid" ${state.adminStudentsFilterPaid === "unpaid" ? "selected" : ""}>${t2.filter_unpaid || "Unpaid"}</option>
                                </select>
                                <i data-lucide="chevron-down" size="16" class="filter-select-chevron"></i>
                            </span>
                        </div>
                        <span class="filter-count" id="students-filter-count"></span>
                    </div>
                    </div>
                </div>
                <div class="students-search-wrap">
                    <input type="text" class="students-search" placeholder="${t2.search_students}" value="${(state.adminStudentsSearch || "").replace(/"/g, "&quot;")}" oninput="state.adminStudentsSearch=this.value; filterStudents(this.value)">
                </div>
                <div class="students-list" id="admin-student-list">
                    ${state.loading && state.students.length === 0 ? `
                    <div class="students-loading">
                        <div class="spin" style="color: #5B8FD9;"><i data-lucide="loader-2" size="32"></i></div>
                        <p>${t2.loading_students_msg}</p>
                    </div>
                    ` : (() => {
          const _f = getFilteredStudents(state.adminStudentsSearch || "");
          setTimeout(() => {
            const _c = document.getElementById("students-filter-count");
            if (_c) _c.textContent = (t2.filter_result_students || "{count} students").replace("{count}", _f.length);
          }, 0);
          return _f.map((s) => renderAdminStudentCard(s)).join("");
        })()}
                </div>
            </div>
        `;
      } else if (view === "admin-memberships") {
        const pending = state.paymentRequests.filter((r) => r.status === "pending");
        html += `
            <div class="ios-header" style="background: transparent;">
                <div class="ios-large-title">${t2.nav_memberships}</div>
            </div>
            
            <div style="padding: 0 1.2rem; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t2.pending_payments}</span>
                <button type="button" onclick="fetchAllData()" style="background: var(--system-gray6); border: none; border-radius: 10px; padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 6px;" title="${t2.refresh_btn}">
                    <i data-lucide="refresh-cw" size="14"></i> ${t2.refresh_btn}
                </button>
            </div>
            <div class="ios-list">
                ${pending.length > 0 ? pending.map((req) => {
          const studentName = req.students && req.students.name || state.students.find((s) => s.id === req.student_id)?.name || t2.unknown_student;
          return `
                        <div class="ios-list-item" style="flex-direction: column; align-items: stretch; gap: 14px; padding: 20px;">
                            <div style="display: flex; gap: 12px; align-items: center;">
                                <div style="width: 40px; height: 40px; background: var(--system-gray6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--text-secondary);">
                                    ${studentName.charAt(0).toUpperCase()}
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; font-size: 17px;">${studentName}</div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <div style="font-size: 13px; color: var(--text-secondary);">${req.sub_name} \u2022 ${formatPrice(req.price, state.currentSchool?.currency || "MXN")}</div>
                                        <div style="font-size: 10px; background: var(--system-gray6); padding: 2px 8px; border-radius: 6px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
                                            <i data-lucide="${req.payment_method === "cash" ? "banknote" : "send"}" size="10"></i> ${t2[req.payment_method] || req.payment_method}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <button class="btn-secondary" onclick="processPaymentRequest(${req.id}, 'rejected')" style="background: rgba(255, 59, 48, 0.1); color: var(--system-red); border-radius: 12px; border: none; font-size: 14px; min-height: 48px; display: flex; align-items: center; justify-content: center; width: 100%;">
                                    ${t2.reject}
                                </button>
                                <button class="btn-primary" onclick="processPaymentRequest(${req.id}, 'approved')" style="background: var(--system-green); color: white; border-radius: 12px; border: none; font-size: 14px; min-height: 48px; display: flex; align-items: center; justify-content: center; width: 100%;">
                                    ${t2.approve}
                                </button>
                            </div>
                        </div>
                    `;
        }).join("") : `<div class="ios-list-item" style="color: var(--text-secondary); text-align: center; justify-content: center; padding: 2.5rem; flex-direction: column; gap: 12px;">
                    <i data-lucide="check-circle" size="32" style="opacity: 0.2;"></i>
                    <span style="font-size: 15px; font-weight: 500; opacity: 0.6;">${t2.no_pending_msg}</span>
                </div>`}
            </div>
        `;
      } else if (view === "admin-revenue") {
        const now = /* @__PURE__ */ new Date();
        const defaultStart = state.adminRevenueDateStart || window.formatClassDate(new Date(now.getFullYear(), now.getMonth(), 1));
        const defaultEnd = state.adminRevenueDateEnd || window.formatClassDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        const dateStart = state.adminRevenueDateStart ? /* @__PURE__ */ new Date(state.adminRevenueDateStart + "T00:00:00") : new Date(now.getFullYear(), now.getMonth(), 1);
        const dateEnd = state.adminRevenueDateEnd ? /* @__PURE__ */ new Date(state.adminRevenueDateEnd + "T23:59:59.999") : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const pkgFilter = state.adminRevenuePackageFilter;
        const statusFilter = state.adminRevenueStatusFilter;
        const methodFilter = state.adminRevenueMethodFilter;
        let filteredPayments = [...state.paymentRequests || []];
        filteredPayments = filteredPayments.filter((r) => {
          const d = new Date(r.created_at);
          if (d < dateStart || d > dateEnd) return false;
          if (pkgFilter && (r.sub_name || "").toLowerCase().trim() !== String(pkgFilter).toLowerCase().trim()) return false;
          if (statusFilter && r.status !== statusFilter) return false;
          if (methodFilter && r.payment_method !== methodFilter) return false;
          return true;
        });
        filteredPayments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const periodTotal = filteredPayments.filter((r) => r.status === "approved").reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);
        const totalHistorical = (state.paymentRequests || []).filter((r) => r.status === "approved").reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);
        const isCurrentMonth = !state.adminRevenueDateStart && !state.adminRevenueDateEnd;
        html += `
            <div class="ios-header" style="background: transparent;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div class="ios-large-title">${t2.nav_revenue}</div>
                    <button type="button" class="filter-btn" onclick="fetchAllData()" title="${t2.refresh_btn}" style="margin-right: 0;">
                        <i data-lucide="refresh-cw" size="14"></i> ${t2.refresh_btn}
                    </button>
                </div>
            </div>

            <div class="revenue-filters-expandable ${state.adminRevenueFiltersExpanded ? "expanded" : ""}" style="margin: 0 1.2rem; border-bottom: 1px solid var(--border);">
                <div class="revenue-filters-header" onclick="toggleExpandableNoRender('revenueFilters')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; cursor: pointer;">
                    <span style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t2.filters_label || "Filters"}</span>
                    <i data-lucide="chevron-down" size="18" class="expandable-chevron" style="opacity: 0.5;"></i>
                </div>
                <div id="revenue-filters-content" style="display: ${state.adminRevenueFiltersExpanded ? "" : "none"}; padding-bottom: 12px;">
                    <div class="filter-bar">
                        <input type="date" class="filter-control" id="revenue-date-start" value="${defaultStart}" onchange="state.adminRevenueDateStart=this.value||null; renderView();">
                        <input type="date" class="filter-control" id="revenue-date-end" value="${defaultEnd}" onchange="state.adminRevenueDateEnd=this.value||null; renderView();">
                        <button type="button" class="filter-btn" onclick="const n=new Date(); state.adminRevenueDateStart=window.formatClassDate(new Date(n.getFullYear(),n.getMonth(),1)); state.adminRevenueDateEnd=window.formatClassDate(new Date(n.getFullYear(),n.getMonth()+1,0)); renderView();">
                            <i data-lucide="calendar" size="14"></i> ${t2.filter_this_month || "This Month"}
                        </button>
                    </div>
                    <div class="filter-bar">
                        <span class="filter-select-wrap">
                            <select class="filter-control" onchange="state.adminRevenuePackageFilter=this.value||null; renderView();">
                                <option value="">${t2.filter_all || "All"} ${(t2.filter_package_type || "packages").toLowerCase()}</option>
                                ${(state.subscriptions || []).map((sub) => `<option value="${(sub.name || "").replace(/"/g, "&quot;")}" ${state.adminRevenuePackageFilter === sub.name ? "selected" : ""}>${(sub.name || "").replace(/</g, "&lt;")}</option>`).join("")}
                            </select>
                            <i data-lucide="chevron-down" size="18" class="filter-select-chevron"></i>
                        </span>
                        <span class="filter-select-wrap">
                            <select class="filter-control" onchange="state.adminRevenueStatusFilter=this.value||null; renderView();">
                                <option value="" ${!statusFilter ? "selected" : ""}>${t2.filter_all || "All"} ${(t2.filter_status || "status").toLowerCase()}</option>
                                <option value="approved" ${statusFilter === "approved" ? "selected" : ""}>${t2.approved}</option>
                                <option value="rejected" ${statusFilter === "rejected" ? "selected" : ""}>${t2.rejected}</option>
                                <option value="pending" ${statusFilter === "pending" ? "selected" : ""}>${t2.pending}</option>
                            </select>
                            <i data-lucide="chevron-down" size="18" class="filter-select-chevron"></i>
                        </span>
                        <span class="filter-select-wrap">
                            <select class="filter-control" onchange="state.adminRevenueMethodFilter=this.value||null; renderView();">
                                <option value="" ${!methodFilter ? "selected" : ""}>${t2.filter_all || "All"} ${(t2.filter_method || "method").toLowerCase()}</option>
                                <option value="transfer" ${methodFilter === "transfer" ? "selected" : ""}>${t2.transfer}</option>
                                <option value="cash" ${methodFilter === "cash" ? "selected" : ""}>${t2.cash}</option>
                            </select>
                            <i data-lucide="chevron-down" size="18" class="filter-select-chevron"></i>
                        </span>
                        <span class="filter-count">${(t2.filter_result_payments || "{count} payments").replace("{count}", filteredPayments.length)}</span>
                    </div>
                </div>
            </div>
            
            <div style="padding: 0 1.2rem; margin-bottom: 2rem;">
                <div style="background: var(--text-primary); padding: 2rem; border-radius: 24px; color: var(--bg-body); box-shadow: 0 15px 35px rgba(0,0,0,0.15); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                    <div style="opacity: 0.7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.8rem;">${isCurrentMonth && !pkgFilter ? t2.monthly_total || "This Month Total" : t2.period_total || "Total for period"}</div>
                    <div style="font-size: 48px; font-weight: 800; letter-spacing: -2px; margin-bottom: 1.5rem;">${formatPrice(periodTotal, state.currentSchool?.currency || "MXN")}</div>
                    
                    <div style="display: flex; align-items: center; gap: 8px; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
                        <i data-lucide="bar-chart-3" size="14" style="opacity: 0.6;"></i>
                        <span style="font-size: 13px; font-weight: 500; opacity: 0.8;">${t2.historical_total_label}: ${formatPrice(totalHistorical, state.currentSchool?.currency || "MXN")} </span>
                    </div>
                </div>
            </div>

            <div style="padding: 0 1.2rem; margin-bottom: 0.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                ${t2.all_payments}
            </div>
            <div class="ios-list">
                ${state.loading && state.paymentRequests.length === 0 ? `
                    <div style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        <div class="spin" style="margin-bottom: 1rem; color: var(--system-blue);"><i data-lucide="loader-2" size="32"></i></div>
                        <p style="font-size: 15px; font-weight: 500;">${t2.loading || "Loading..."}</p>
                    </div>
                ` : filteredPayments.length > 0 ? filteredPayments.map((req) => {
          const studentName = req.students && req.students.name || state.students.find((s) => s.id === req.student_id)?.name || t2.unknown_student;
          const statusColor = req.status === "approved" ? "var(--system-green)" : req.status === "rejected" ? "var(--system-red)" : "var(--system-blue)";
          const statusLabel = t2[req.status] || req.status;
          return `
                        <div class="ios-list-item" style="padding: 16px; align-items: center;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; font-size: 17px; margin-bottom: 4px;">${studentName}</div>
                                <div style="font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                                    ${req.sub_name} \u2022 ${new Date(req.created_at).toLocaleDateString()}
                                    <span style="font-size: 9px; opacity: 0.6; text-transform: uppercase; font-weight: 700; background: var(--system-gray6); padding: 1px 6px; border-radius: 4px;">${t2[req.payment_method] || req.payment_method}</span>
                                </div>
                            </div>
                            <div style="text-align: right; margin-right: 12px;">
                                <div style="font-weight: 700; font-size: 17px; margin-bottom: 4px;">${formatPrice(req.price, state.currentSchool?.currency || "MXN")}</div>
                                <div style="font-size: 10px; font-weight: 800; color: ${statusColor}; text-transform: uppercase; letter-spacing: 0.02em;">${statusLabel}</div>
                            </div>
                            <button onclick="window.removePaymentRequest('${req.id}')" style="background: none; border: none; color: var(--system-red); padding: 8px; opacity: 0.6;" title="${t2.delete_payment_confirm || "Delete"}">
                                <i data-lucide="trash-2" size="18"></i>
                            </button>
                        </div>
                    `;
        }).join("") : `<div class="ios-list-item" style="color: var(--text-secondary); text-align: center; justify-content: center; padding: 2rem;">${t2.no_data_msg}</div>`}
            </div>
        `;
      } else if (view === "admin-scanner") {
        html += `
            <div class="ios-header">
                <div class="ios-large-title">${t2.nav_scan}</div>
            </div>
            <div style="padding: 2rem; text-align: center;">
                <p style="font-size: 17px; color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.5;">${t2.scan_cta_desc}</p>

            <div style="width: 200px; height: 200px; margin: 0 auto 3rem; position: relative; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; inset: 0; border: 2px solid var(--system-gray4); border-radius: 30px;"></div>
                <div style="position: absolute; inset: -4px; border: 4px solid var(--system-blue); border-radius: 34px; clip-path: polygon(0% 20%, 0% 0%, 20% 0%, 80% 0%, 100% 0%, 100% 20%, 100% 80%, 100% 100%, 80% 100%, 20% 100%, 0% 100%, 0% 80%);"></div>
                <i data-lucide="qr-code" size="64" style="color: var(--system-gray);"></i>
            </div>

            <button class="btn-primary" onclick="startScanner()" style="width: 100%; border-radius: 14px; height: 50px; font-size: 17px; font-weight: 600;">
                ${t2.initiate_scan_btn}
            </button>
            <div id="scan-result" style="margin-top: 1.5rem; font-weight: 600; font-size: 17px;"></div>
        </div>
    `;
      } else if (view === "admin-settings") {
        const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const classesList = [...Array.isArray(state.classes) ? state.classes : []].sort((a, b) => (a.id || 0) - (b.id || 0));
        const planSortKey = (s) => {
          const name = (s.name || "").toLowerCase();
          if (name.includes("ilimitad") || name.includes("unlimited") || s.limit_count === 0 && (s.limit_count_private == null || s.limit_count_private === 0) || s.limit_count == null && !(s.name || "").match(/\d+/)) return 1e9;
          const n = parseInt(s.limit_count, 10);
          if (!isNaN(n)) return n;
          const m = (s.name || "").match(/\d+/);
          return m ? parseInt(m[0], 10) : 0;
        };
        const hasPrivateInPlanSub = (s) => s.limit_count_private != null && s.limit_count_private > 0;
        const hasEventsInPlanSub = (s) => s.limit_count_events != null && s.limit_count_events > 0;
        const lastAddedId = state.lastAddedSubscriptionId || "";
        const isPT = state.currentSchool?.profile_type === "private_teacher";
        const hasDualAdmin = isPT || state.currentSchool?.private_packages_enabled !== false && state.adminSettings?.private_classes_offering_enabled === "true";
        const hasEventsEnabled = state.currentSchool?.events_packages_enabled !== false && state.adminSettings?.events_offering_enabled === "true";
        const visibleSubsAdmin = (Array.isArray(state.subscriptions) ? state.subscriptions : []).filter((s) => {
          if (!hasEventsEnabled && hasEventsInPlanSub(s)) return false;
          if (!hasDualAdmin && hasPrivateInPlanSub(s)) return false;
          return true;
        });
        const notLastAdded = (s) => s.id !== lastAddedId;
        const hasGroupInPlanSub = (s) => s.limit_count != null && s.limit_count > 0;
        const adminGroupOnly = visibleSubsAdmin.filter((s) => notLastAdded(s) && hasGroupInPlanSub(s) && !hasPrivateInPlanSub(s) && !hasEventsInPlanSub(s)).sort((a, b) => planSortKey(a) - planSortKey(b));
        const adminPrivateOnly = visibleSubsAdmin.filter((s) => notLastAdded(s) && hasPrivateInPlanSub(s) && !hasGroupInPlanSub(s) && !hasEventsInPlanSub(s)).sort((a, b) => planSortKey(a) - planSortKey(b));
        const adminMixed = visibleSubsAdmin.filter((s) => notLastAdded(s) && (hasEventsInPlanSub(s) || hasGroupInPlanSub(s) && hasPrivateInPlanSub(s))).sort((a, b) => planSortKey(a) - planSortKey(b));
        const lastAddedPlan = lastAddedId ? (state.subscriptions || []).find((s) => s.id === lastAddedId) : null;
        let discoveryPreviewInnerHtml = "";
        if (state.settingsDiscoveryExpanded && state.showDiscoveryPreview && state.currentSchool) {
          const sc = state.currentSchool;
          const loc = [sc?.city, sc?.country].filter(Boolean).join(", ") || (sc?.address || "\u2014");
          const gallery = Array.isArray(sc?.gallery_urls) ? sc.gallery_urls : typeof sc?.gallery_urls === "string" ? sc.gallery_urls.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) : [];
          discoveryPreviewInnerHtml = window.getDiscoveryPreviewFullHtml ? window.getDiscoveryPreviewFullHtml({ name: sc?.name || "", loc, desc: (sc?.discovery_description || "").toString(), genres: Array.isArray(sc?.discovery_genres) ? sc.discovery_genres.join(" \xB7 ") : "", logoUrl: (sc?.logo_url || "").trim(), teacherUrl: (sc?.teacher_photo_url || "").trim(), gallery: [], locations: Array.isArray(state.discoveryLocations) ? state.discoveryLocations : Array.isArray(sc?.discovery_locations) ? sc.discovery_locations : [], currency: sc?.currency || "MXN", classes: state.classes || [], subscriptions: state.subscriptions || [], placeholder: t2.discovery_placeholder_upload_soon || "Will be uploaded soon." }) : "";
        }
        html += `
            <div class="ios-header">
                <div class="ios-large-title">${t2.nav_settings}</div>
            </div>

            ${state.currentSchool?.profile_type === "private_teacher" ? `
            <!-- TEACHER AVAILABILITY -->
            <div style="padding: 0 1.2rem; margin-top: 1.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                ${t2.teacher_availability_title || "Availability"}
            </div>
            <div class="ios-list" style="overflow: visible;">
                ${(state.teacherAvailability || []).map((a) => `
                    <div class="ios-list-item" style="flex-direction: column; align-items: stretch; gap: 10px; padding: 14px 16px; overflow: visible;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                <div class="custom-dropdown-container" style="overflow: visible; min-width: 70px;">
                                    <div class="custom-dropdown-trigger" onclick="window.toggleCustomDropdown('avail-${a.id}')" style="background: var(--system-gray6); border-radius: 10px; padding: 8px 10px; min-height: auto; width: auto; justify-content: space-between; gap: 6px;">
                                        <span style="font-size: 13px; font-weight: 700;">${t2[a.day_of_week.toLowerCase()] || a.day_of_week}</span>
                                        <i data-lucide="chevron-down" size="12" style="opacity: 0.4;"></i>
                                    </div>
                                    <div class="custom-dropdown-list" id="dropdown-list-avail-${a.id}">
                                        ${daysOrder.map((d) => `
                                            <div class="dropdown-item ${a.day_of_week === d ? "selected" : ""}" onclick="window.updateTeacherAvail('${a.id}', 'day_of_week', '${d}')">
                                                <span>${t2[d.toLowerCase()]}</span>
                                                ${a.day_of_week === d ? '<i data-lucide="check" size="14"></i>' : ""}
                                            </div>
                                        `).join("")}
                                    </div>
                                </div>
                            </div>
                            <button onclick="window.deleteTeacherAvail('${a.id}')" style="background: none; border: none; color: var(--text-secondary); opacity: 0.4; padding: 5px; cursor: pointer;">
                                <i data-lucide="trash-2" size="18"></i>
                            </button>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px;">
                                <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t2.start_time_label}</label>
                                <input type="time" value="${a.start_time || "09:00"}" onchange="window.updateTeacherAvail('${a.id}', 'start_time', this.value)" style="background: transparent; border: none; font-size: 14px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; cursor: pointer; padding: 0;">
                            </div>
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px;">
                                <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t2.end_time_label}</label>
                                <input type="time" value="${a.end_time || "10:00"}" onchange="window.updateTeacherAvail('${a.id}', 'end_time', this.value)" style="background: transparent; border: none; font-size: 14px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; cursor: pointer; padding: 0;">
                            </div>
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px; opacity: 0.8;">
                                <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t2.class_location || "Location"}</label>
                                <input type="text" value="${a.location || ""}" onchange="window.updateTeacherAvail('${a.id}', 'location', this.value)" placeholder="${t2.location_placeholder || "Optional"}" style="background: transparent; border: none; font-size: 13px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; padding: 0;">
                            </div>
                        </div>
                    </div>
                `).join("")}
                <div class="ios-list-item" onclick="window.addTeacherAvail()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px;">
                    <i data-lucide="plus-circle" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t2.add_availability || "Add availability"}
                </div>
            </div>
            ` : `
            <div class="settings-section-header" onclick="state.settingsClassesExpanded = !state.settingsClassesExpanded; saveState(); renderView();" style="padding: 0 1.2rem; margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                <span>${t2.mgmt_classes_title}</span>
                <i data-lucide="chevron-${state.settingsClassesExpanded ? "up" : "down"}" size="18" style="opacity: 0.6;"></i>
            </div>
            ${state.settingsClassesExpanded ? `
            <div class="ios-list" style="overflow: visible;">
                ${classesList.map((c) => `
                    <div class="ios-list-item" style="flex-direction: column; align-items: stretch; gap: 12px; padding: 16px; overflow: visible;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                <i data-lucide="music" size="16" style="opacity: 0.3;"></i>
                                <input type="text" value="${c.name}" oninput="debouncedUpdateClass(${c.id}, 'name', this.value)" style="border: none; background: transparent; font-size: 17px; font-weight: 600; width: 85%; color: var(--text-primary); outline: none;">
                            </div>
                            <button onclick="removeClass(${c.id})" style="background: none; border: none; color: var(--text-secondary); opacity: 0.4; padding: 5px; cursor: pointer;">
                                <i data-lucide="trash-2" size="18"></i>
                            </button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px; position: relative; overflow: visible;">
                                <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t2.day_label}</label>
                                <div class="custom-dropdown-container" style="overflow: visible;">
                                    <div class="custom-dropdown-trigger" onclick="window.toggleCustomDropdown('${c.id}')" style="background: transparent; border: none; padding: 0; min-height: auto; width: 100%; justify-content: space-between;">
                                        <span style="font-size: 14px; font-weight: 600;">${t2[c.day.toLowerCase()]}</span>
                                        <i data-lucide="chevron-down" size="12" style="opacity: 0.4;"></i>
                                    </div>
                                    <div class="custom-dropdown-list" id="dropdown-list-${c.id}">
                                        ${daysOrder.map((d) => `
                                            <div class="dropdown-item ${c.day === d ? "selected" : ""}" onclick="window.selectCustomOption(${c.id}, 'day', '${d}')">
                                                <span>${t2[d.toLowerCase()]}</span>
                                                ${c.day === d ? '<i data-lucide="check" size="14"></i>' : ""}
                                            </div>
                                        `).join("")}
                                    </div>
                                </div>
                            </div>
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px;">
                                <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t2.start_time_label}</label>
                                <input type="time" value="${c.time || "09:00"}" onblur="scheduleTimeBlurSave(${c.id}, this)" onfocus="cancelTimeBlurSave(this)" style="background: transparent; border: none; font-size: 14px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; cursor: pointer; padding: 0;">
                            </div>
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px;">
                                <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t2.end_time_label}</label>
                                <input type="time" value="${c.end_time || c.time || "10:00"}" onblur="scheduleEndTimeBlurSave(${c.id}, this)" onfocus="cancelTimeBlurSave(this)" style="background: transparent; border: none; font-size: 14px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; cursor: pointer; padding: 0;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px; opacity: 0.8;">
                                 <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t2.class_location}</label>
                                 <input type="text" value="${c.location || ""}" oninput="debouncedUpdateClass(${c.id}, 'location', this.value)" placeholder="${t2.location_placeholder}" style="background: transparent; border: none; font-size: 13px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; padding: 0;">
                            </div>
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px; opacity: 0.8;">
                                 <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t2.level_tag_label}</label>
                                 <input type="text" value="${c.tag || "Clase"}" oninput="debouncedUpdateClass(${c.id}, 'tag', this.value)" placeholder="Ej: Principiante" style="background: transparent; border: none; font-size: 13px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; padding: 0;">
                            </div>
                        </div>
                        ${state.currentSchool?.class_registration_enabled ? `
                        <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px; opacity: 0.8;">
                                 <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t2.max_students}</label>
                                 <input type="number" min="1" value="${c.max_capacity || ""}" oninput="debouncedUpdateClass(${c.id}, 'max_capacity', this.value)" placeholder="${t2.max_students_placeholder}" style="background: transparent; border: none; font-size: 13px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; padding: 0;">
                            </div>
                        </div>
                        ` : ""}
                    </div>
                `).join("")}
                
                <div class="ios-list-item" onclick="addClass()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px;">
                    <i data-lucide="plus-circle" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t2.add_label} ${t2.new_class_label}
                </div>
                <div style="padding: 0 1.2rem; margin-top: 1rem; margin-bottom: 0.5rem;">
                    <button type="button" class="btn-primary" id="save-schedule-btn" onclick="window.flushScheduleSave()" ${state._scheduleSaving ? "disabled" : ""} style="width: 100%; border-radius: 14px; height: 48px; font-size: 15px; font-weight: 600;">
                        ${state._scheduleSaving ? `<i data-lucide="loader-2" class="spin" size="18" style="margin-right: 8px;"></i> ${t2.saving_label || "Saving\u2026"}` : `<i data-lucide="save" size="18" style="margin-right: 8px;"></i> ${t2.save_schedule_btn || "Save schedule"}`}
                    </button>
                    ${state._scheduleSaveStatus ? `<div style="font-size: 13px; color: var(--secondary); font-weight: 600; margin-top: 0.5rem; text-align: center;">${state._scheduleSaveStatus}</div>` : ""}
                </div>
            </div>

            <!-- WEEKLY PREVIEW FOR ADMINS -->
            <div style="padding: 0 1.2rem; margin-top: 1.5rem;">
                <button onclick="window.toggleWeeklyPreview()" style="width: 100%; padding: 14px; border-radius: 16px; border: 1px solid var(--border); background: var(--system-gray6); color: var(--text-primary); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 14px;">
                    <i data-lucide="${state.showWeeklyPreview ? "eye-off" : "eye"}" size="16" style="opacity: 0.6;"></i>
                    ${state.showWeeklyPreview ? t2.hide_weekly_btn : t2.show_weekly_btn}
                </button>
            </div>

            ${state.showWeeklyPreview ? `
            <div style="padding: 0 1.2rem; margin-top: 2rem; margin-bottom: 0.8rem; display: flex; align-items: center; justify-content: space-between;" class="slide-in">
                <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                    ${t2.weekly_preview_title}
                </div>
            </div>
            <div style="padding: 0 0.5rem; margin-bottom: 2rem;" class="slide-in">
                <div class="weekly-grid">
                    ${daysOrder.map((dayKey) => {
          const dayAliases = { "Mon": ["Mon", "Mo", "Monday"], "Tue": ["Tue", "Tu", "Tuesday"], "Wed": ["Wed", "We", "Wednesday"], "Thu": ["Thu", "Th", "Thursday"], "Fri": ["Fri", "Fr", "Friday"], "Sat": ["Sat", "Sa", "Saturday"], "Sun": ["Sun", "Su", "Sunday"] };
          const aliases = dayAliases[dayKey];
          const dayClasses = classesList.filter((c) => aliases.includes(c.day)).sort((a, b) => a.time.localeCompare(b.time));
          return `
                        <div class="day-tile" style="background: var(--bg-card); border-radius: 16px;">
                            <div class="day-tile-header" style="padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 11px; opacity: 0.6;">${t2[dayKey.toLowerCase()]}</div>
                            <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top: 0.8rem;">
                                ${dayClasses.length > 0 ? dayClasses.map((c) => `
                                    <div class="tile-class-item" style="padding: 8px; border-radius: 10px; border: 1px solid var(--border);">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
                                            <div class="tile-class-level" style="font-size: 8px; background: var(--system-gray6); padding: 2px 6px; border-radius: 4px;">${c.tag || "Open"}</div>
                                            ${c.location ? `<div style="font-size: 6px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 2px; opacity: 0.7;"><i data-lucide="map-pin" size="6" style="opacity: 0.5;"></i> ${window.formatLocationLabel(c.location)}</div>` : ""}
                                        </div>
                                        <div class="tile-class-desc" style="font-size: 11px; font-weight: 700;">${c.name}</div>
                                        <div class="tile-class-time" style="font-size: 9px; opacity: 0.6;">${window.formatClassTime(c)}</div>
                                    </div>
                                `).join("") : `<div class="text-muted" style="font-size:9px; font-style:italic; padding: 1rem 0;">${t2.no_classes_msg}</div>`}
                            </div>
                        </div>
                        `;
        }).join("")}
                </div>
            </div>
            ` : ""}
            ` : ""}
            `}

            <div class="settings-section-header" onclick="state.settingsPlansExpanded = !state.settingsPlansExpanded; saveState(); renderView();" style="padding: 0 1.2rem; margin-top: 2.5rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                <span>${t2.plans_label}</span>
                <i data-lucide="chevron-${state.settingsPlansExpanded ? "up" : "down"}" size="18" style="opacity: 0.6;"></i>
            </div>
            ${state.settingsPlansExpanded ? `
            ${adminGroupOnly.length > 0 ? `
            <div style="padding: 0 1.2rem; margin-top: 0.6rem; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); opacity: 0.9;">${t2.plans_section_group || "Group classes"}</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; padding: 0 1.2rem; margin-top: 0.25rem;">
                ${adminGroupOnly.map((s) => `
                    <div class="card ios-list-item" data-plan-block data-sub-id="${s.id}" style="flex-direction: column; align-items: stretch; gap: 10px; padding: 12px;">
                         <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                                <i data-lucide="credit-card" size="14" style="opacity: 0.3; flex-shrink: 0;"></i>
                                <input type="text" data-field="name" value="${s.name}" onchange="updateSub('${s.id}', 'name', this.value)" style="border: none; background: transparent; font-size: 14px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none;">
                            </div>
                            <button onclick="removeSubscription('${s.id}')" style="background: none; border: none; color: var(--text-secondary); opacity: 0.4; padding: 4px; cursor: pointer; flex-shrink: 0;">
                                <i data-lucide="trash-2" size="16"></i>
                            </button>
                        </div>
                         <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; align-items: center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                <span style="color: var(--text-secondary); font-size: 10px; font-weight: 700; opacity: 0.6;">${(CURRENCY_SYMBOLS[state.currentSchool?.currency || "MXN"] || "$").trim()}</span>
                                <input type="number" data-field="price" value="${s.price}" onchange="updateSub('${s.id}', 'price', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                ${!state._usePlanExpiryFixedDate ? `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="calendar" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="validity_days" value="${s.validity_days || 30}" onchange="updateSub('${s.id}', 'validity_days', this.value)" placeholder="D\xEDas" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>` : ""}
                                ${(() => {
          const isPT2 = state.currentSchool?.profile_type === "private_teacher";
          const hasDual = isPT2 || state.adminSettings?.private_classes_offering_enabled === "true";
          const hasEvents = state.adminSettings?.events_offering_enabled === "true";
          let out = "";
          if (hasDual && isPT2) {
            out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="user" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_private" value="${s.limit_count_private ?? s.limit_count ?? ""}" min="0" onchange="updateSub('${s.id}', 'limit_count_private', this.value === '' ? '0' : this.value)" placeholder="${t2.private_classes || "Private"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          } else if (hasDual) {
            out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="users" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count" value="${s.limit_count === 0 ? 0 : s.limit_count || ""}" min="0" onchange="updateSub('${s.id}', 'limit_count', this.value === '' ? '0' : this.value)" placeholder="${t2.group_classes || "Group"} (0=\u221E if no private)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div><div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="user" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_private" value="${s.limit_count_private ?? 0}" min="0" onchange="updateSub('${s.id}', 'limit_count_private', this.value === '' ? '0' : this.value)" placeholder="${t2.private_classes || "Private"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          } else {
            out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="layers" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count" value="${s.limit_count === 0 ? 0 : s.limit_count || ""}" min="0" onchange="updateSub('${s.id}', 'limit_count', this.value === '' ? '0' : this.value)" placeholder="${t2.limit_classes_placeholder || "Clases (0 = Ilimitado)"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          }
          if (hasEvents) out += `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="ticket" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_events" value="${s.limit_count_events ?? 0}" min="0" onchange="updateSub('${s.id}', 'limit_count_events', this.value === '' ? '0' : this.value)" placeholder="${t2.events || "Events"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          return out;
        })()}
                            </div>
                            ${state._usePlanExpiryFixedDate ? `<div style="display: flex; align-items: center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                <i data-lucide="calendar-range" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                <input type="date" data-field="expiry_date" value="${s.expiry_date || ""}" onchange="updateSub('${s.id}', 'expiry_date', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 11px; padding: 0;" title="${t2.fixed_expiry_date_label || "Fixed expiry date (optional)"}">
                            </div>` : ""}
                        </div>
                    </div>
                `).join("")}
            </div>
            ` : ""}
            ${adminPrivateOnly.length > 0 ? `
            <div style="padding: 0 1.2rem; margin-top: ${adminGroupOnly.length > 0 ? "1.25rem" : "0.6rem"}; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); opacity: 0.9;">${t2.plans_section_private || "Private classes"}</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; padding: 0 1.2rem; margin-top: 0.25rem;">
                ${adminPrivateOnly.map((s) => `
                    <div class="card ios-list-item" data-plan-block data-sub-id="${s.id}" style="flex-direction: column; align-items: stretch; gap: 10px; padding: 12px;">
                         <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                                <i data-lucide="credit-card" size="14" style="opacity: 0.3; flex-shrink: 0;"></i>
                                <input type="text" data-field="name" value="${s.name}" onchange="updateSub('${s.id}', 'name', this.value)" style="border: none; background: transparent; font-size: 14px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none;">
                            </div>
                            <button onclick="removeSubscription('${s.id}')" style="background: none; border: none; color: var(--text-secondary); opacity: 0.4; padding: 4px; cursor: pointer; flex-shrink: 0;">
                                <i data-lucide="trash-2" size="16"></i>
                            </button>
                        </div>
                         <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; align-items: center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                <span style="color: var(--text-secondary); font-size: 10px; font-weight: 700; opacity: 0.6;">${(CURRENCY_SYMBOLS[state.currentSchool?.currency || "MXN"] || "$").trim()}</span>
                                <input type="number" data-field="price" value="${s.price}" onchange="updateSub('${s.id}', 'price', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                ${!state._usePlanExpiryFixedDate ? `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="calendar" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="validity_days" value="${s.validity_days || 30}" onchange="updateSub('${s.id}', 'validity_days', this.value)" placeholder="D\xEDas" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>` : ""}
                                ${(() => {
          const isPT2 = state.currentSchool?.profile_type === "private_teacher";
          const hasDual = isPT2 || state.adminSettings?.private_classes_offering_enabled === "true";
          const hasEvents = state.adminSettings?.events_offering_enabled === "true";
          let out = "";
          if (hasDual && isPT2) {
            out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="user" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_private" value="${s.limit_count_private ?? s.limit_count ?? ""}" min="0" onchange="updateSub('${s.id}', 'limit_count_private', this.value === '' ? '0' : this.value)" placeholder="${t2.private_classes || "Private"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          } else if (hasDual) {
            out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="users" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count" value="${s.limit_count === 0 ? 0 : s.limit_count || ""}" min="0" onchange="updateSub('${s.id}', 'limit_count', this.value === '' ? '0' : this.value)" placeholder="${t2.group_classes || "Group"} (0=\u221E if no private)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div><div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="user" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_private" value="${s.limit_count_private ?? 0}" min="0" onchange="updateSub('${s.id}', 'limit_count_private', this.value === '' ? '0' : this.value)" placeholder="${t2.private_classes || "Private"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          } else {
            out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="layers" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count" value="${s.limit_count === 0 ? 0 : s.limit_count || ""}" min="0" onchange="updateSub('${s.id}', 'limit_count', this.value === '' ? '0' : this.value)" placeholder="${t2.limit_classes_placeholder || "Clases (0 = Ilimitado)"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          }
          if (hasEvents) out += `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="ticket" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_events" value="${s.limit_count_events ?? 0}" min="0" onchange="updateSub('${s.id}', 'limit_count_events', this.value === '' ? '0' : this.value)" placeholder="${t2.events || "Events"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          return out;
        })()}
                            </div>
                            ${state._usePlanExpiryFixedDate ? `<div style="display: flex; align-items: center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                <i data-lucide="calendar-range" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                <input type="date" data-field="expiry_date" value="${s.expiry_date || ""}" onchange="updateSub('${s.id}', 'expiry_date', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 11px; padding: 0;" title="${t2.fixed_expiry_date_label || "Fixed expiry date (optional)"}">
                            </div>` : ""}
                        </div>
                    </div>
                `).join("")}
            </div>
            ` : ""}
            ${adminMixed.length > 0 ? `
            <div style="padding: 0 1.2rem; margin-top: ${adminGroupOnly.length > 0 || adminPrivateOnly.length > 0 ? "1.25rem" : "0.6rem"}; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); opacity: 0.9;">${t2.plans_section_mixed || "Mixed classes"}</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; padding: 0 1.2rem; margin-top: 0.25rem;">
                ${adminMixed.map((s) => `
                    <div class="card ios-list-item" data-plan-block data-sub-id="${s.id}" style="flex-direction: column; align-items: stretch; gap: 10px; padding: 12px;">
                         <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                                <i data-lucide="credit-card" size="14" style="opacity: 0.3; flex-shrink: 0;"></i>
                                <input type="text" data-field="name" value="${s.name}" onchange="updateSub('${s.id}', 'name', this.value)" style="border: none; background: transparent; font-size: 14px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none;">
                            </div>
                            <button onclick="removeSubscription('${s.id}')" style="background: none; border: none; color: var(--text-secondary); opacity: 0.4; padding: 4px; cursor: pointer; flex-shrink: 0;">
                                <i data-lucide="trash-2" size="16"></i>
                            </button>
                        </div>
                         <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; align-items: center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                <span style="color: var(--text-secondary); font-size: 10px; font-weight: 700; opacity: 0.6;">${(CURRENCY_SYMBOLS[state.currentSchool?.currency || "MXN"] || "$").trim()}</span>
                                <input type="number" data-field="price" value="${s.price}" onchange="updateSub('${s.id}', 'price', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                ${!state._usePlanExpiryFixedDate ? `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="calendar" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="validity_days" value="${s.validity_days || 30}" onchange="updateSub('${s.id}', 'validity_days', this.value)" placeholder="D\xEDas" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>` : ""}
                                ${(() => {
          const isPT2 = state.currentSchool?.profile_type === "private_teacher";
          const hasDual = isPT2 || state.adminSettings?.private_classes_offering_enabled === "true";
          const hasEvents = true;
          let out = "";
          if (hasDual && isPT2) {
            out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="user" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_private" value="${s.limit_count_private ?? s.limit_count ?? ""}" min="0" onchange="updateSub('${s.id}', 'limit_count_private', this.value === '' ? '0' : this.value)" placeholder="${t2.private_classes || "Private"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          } else if (hasDual) {
            out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="users" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count" value="${s.limit_count === 0 ? 0 : s.limit_count || ""}" min="0" onchange="updateSub('${s.id}', 'limit_count', this.value === '' ? '0' : this.value)" placeholder="${t2.group_classes || "Group"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div><div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="user" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_private" value="${s.limit_count_private ?? 0}" min="0" onchange="updateSub('${s.id}', 'limit_count_private', this.value === '' ? '0' : this.value)" placeholder="${t2.private_classes || "Private"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          } else {
            out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="layers" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count" value="${s.limit_count === 0 ? 0 : s.limit_count || ""}" min="0" onchange="updateSub('${s.id}', 'limit_count', this.value === '' ? '0' : this.value)" placeholder="${t2.group_classes || "Group"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          }
          out += `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="ticket" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_events" value="${s.limit_count_events ?? 0}" min="0" onchange="updateSub('${s.id}', 'limit_count_events', this.value === '' ? '0' : this.value)" placeholder="${t2.events || "Events"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
          return out;
        })()}
                            </div>
                            ${state._usePlanExpiryFixedDate ? `<div style="display: flex; align-items: center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                <i data-lucide="calendar-range" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                <input type="date" data-field="expiry_date" value="${s.expiry_date || ""}" onchange="updateSub('${s.id}', 'expiry_date', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 11px; padding: 0;" title="${t2.fixed_expiry_date_label || "Fixed expiry date (optional)"}">
                            </div>` : ""}
                        </div>
                    </div>
                `).join("")}
            </div>
            ` : ""}
            ${lastAddedPlan ? `
            <div style="padding: 0 1.2rem; margin-top: 1rem; margin-bottom: 0.5rem;">
                <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); opacity: 0.9; margin-bottom: 0.4rem;">New plan \u2014 edit below</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                    ${((s) => {
          const card = (sub) => `<div class="card ios-list-item" data-plan-block data-sub-id="${sub.id}" style="flex-direction: column; align-items: stretch; gap: 10px; padding: 12px;">
                         <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                                <i data-lucide="credit-card" size="14" style="opacity: 0.3; flex-shrink: 0;"></i>
                                <input type="text" data-field="name" value="${sub.name}" onchange="updateSub('${sub.id}', 'name', this.value)" style="border: none; background: transparent; font-size: 14px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none;">
                            </div>
                            <button onclick="removeSubscription('${sub.id}')" style="background: none; border: none; color: var(--text-secondary); opacity: 0.4; padding: 4px; cursor: pointer; flex-shrink: 0;">
                                <i data-lucide="trash-2" size="16"></i>
                            </button>
                        </div>
                         <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; align-items: center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                <span style="color: var(--text-secondary); font-size: 10px; font-weight: 700; opacity: 0.6;">${(CURRENCY_SYMBOLS[state.currentSchool?.currency || "MXN"] || "$").trim()}</span>
                                <input type="number" data-field="price" value="${sub.price}" onchange="updateSub('${sub.id}', 'price', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                ${!state._usePlanExpiryFixedDate ? `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="calendar" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="validity_days" value="${sub.validity_days || 30}" onchange="updateSub('${sub.id}', 'validity_days', this.value)" placeholder="D\xEDas" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>` : ""}
                                ${(() => {
            const isPT2 = state.currentSchool?.profile_type === "private_teacher";
            const hasDual = isPT2 || state.adminSettings?.private_classes_offering_enabled === "true";
            const hasEvents = state.adminSettings?.events_offering_enabled === "true";
            let out = "";
            if (hasDual && isPT2) {
              out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="user" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_private" value="${sub.limit_count_private ?? sub.limit_count ?? ""}" min="0" onchange="updateSub('${sub.id}', 'limit_count_private', this.value === '' ? '0' : this.value)" placeholder="${t2.private_classes || "Private"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
            } else if (hasDual) {
              out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="users" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count" value="${sub.limit_count === 0 ? 0 : sub.limit_count || ""}" min="0" onchange="updateSub('${sub.id}', 'limit_count', this.value === '' ? '0' : this.value)" placeholder="${t2.group_classes || "Group"} (0=\u221E if no private)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div><div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="user" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_private" value="${sub.limit_count_private ?? 0}" min="0" onchange="updateSub('${sub.id}', 'limit_count_private', this.value === '' ? '0' : this.value)" placeholder="${t2.private_classes || "Private"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
            } else {
              out = `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="layers" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count" value="${sub.limit_count === 0 ? 0 : sub.limit_count || ""}" min="0" onchange="updateSub('${sub.id}', 'limit_count', this.value === '' ? '0' : this.value)" placeholder="${t2.limit_classes_placeholder || "Clases (0 = Ilimitado)"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
            }
            if (hasEvents) out += `<div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                    <i data-lucide="ticket" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                    <input type="number" data-field="limit_count_events" value="${sub.limit_count_events ?? 0}" min="0" onchange="updateSub('${sub.id}', 'limit_count_events', this.value === '' ? '0' : this.value)" placeholder="${t2.events || "Events"}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                                </div>`;
            return out;
          })()}
                            </div>
                            ${state._usePlanExpiryFixedDate ? `<div style="display: flex; align-items: center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                <i data-lucide="calendar-range" size="10" style="color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;"></i>
                                <input type="date" data-field="expiry_date" value="${sub.expiry_date || ""}" onchange="updateSub('${sub.id}', 'expiry_date', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 11px; padding: 0;" title="${t2.fixed_expiry_date_label || "Fixed expiry date (optional)"}">
                            </div>` : ""}
                        </div>
                    </div>`;
          return card(lastAddedPlan);
        })()}
                </div>
            </div>
            ` : ""}
            <div style="padding: 0 1.2rem; margin-top: 1rem;">
                <button type="button" class="btn-primary" id="save-plans-btn" onclick="window.saveAllPlans()" ${state._plansSaving ? "disabled" : ""} style="width: 100%; border-radius: 14px; height: 48px; font-size: 15px; font-weight: 600; margin-bottom: 0.75rem;">
                    ${state._plansSaving ? `<i data-lucide="loader-2" class="spin" size="18" style="margin-right: 8px;"></i> ${t2.saving_label || "Saving\u2026"}` : `<i data-lucide="save" size="18" style="margin-right: 8px;"></i> ${t2.save_plans_btn || "Save plans"}`}
                </button>
                ${state._plansSaveStatus ? `<div style="font-size: 13px; color: var(--secondary); font-weight: 600; margin-bottom: 0.5rem; text-align: center;">${state._plansSaveStatus}</div>` : ""}
                <div class="card ios-list-item" onclick="addSubscription()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px;">
                    <i data-lucide="plus-circle" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t2.add_label} Plan
                </div>
            </div>
            ` : ""}

            ${state.currentSchool?.profile_type === "private_teacher" ? `
            <!-- PRIVATE CLASS REQUESTS -->
            <div style="padding: 0 1.2rem; margin-top: 2.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                ${t2.private_class_requests_title || "Private class requests"}
            </div>
            <div style="padding: 0 1.2rem; margin-top: 0.5rem;">
                ${(state.privateClassRequests || []).length === 0 ? `
                    <div style="padding: 2rem 0; text-align: center; color: var(--text-muted); font-size: 14px; font-style: italic;">${t2.no_private_requests || "No requests yet"}</div>
                ` : (state.privateClassRequests || []).map((r) => {
          const studentName = (state.students || []).find((s) => String(s.id) === String(r.student_id))?.name || r.student_id;
          return `
                    <div class="pcr-card">
                        <div class="pcr-card-header">
                            <span class="pcr-card-name">${(studentName || "").replace(/</g, "&lt;")}</span>
                            <span class="pcr-card-status ${r.status}">${r.status}</span>
                        </div>
                        <div class="pcr-card-detail"><i data-lucide="calendar" size="12" style="vertical-align: middle; opacity: 0.5; margin-right: 4px;"></i> ${r.requested_date} &middot; ${r.requested_time}</div>
                        ${r.location ? '<div class="pcr-card-detail"><i data-lucide="map-pin" size="12" style="vertical-align: middle; opacity: 0.5; margin-right: 4px;"></i> ' + r.location + "</div>" : ""}
                        ${r.message ? '<div class="pcr-card-detail" style="font-style: italic; margin-top: 4px;">"' + (r.message || "").replace(/</g, "&lt;") + '"</div>' : ""}
                        ${r.status === "pending" ? `<div class="pcr-card-actions"><button class="pcr-btn-accept" onclick="window.respondToPrivateClassRequest('` + r.id + `', true)"><i data-lucide="check" size="14" style="vertical-align: middle; margin-right: 4px;"></i> ` + (t2.accept_btn || "Accept") + `</button><button class="pcr-btn-decline" onclick="window.respondToPrivateClassRequest('` + r.id + `', false)"><i data-lucide="x" size="14" style="vertical-align: middle; margin-right: 4px;"></i> ` + (t2.decline_btn || "Decline") + "</button></div>" : ""}
                    </div>`;
        }).join("")}
            </div>
            ` : ""}

            <div class="settings-section-header" onclick="state.settingsTransferExpanded = !state.settingsTransferExpanded; saveState(); renderView();" style="padding: 0 1.2rem; margin-top: 2.5rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                <span>${t2.transfer_details_label}</span>
                <i data-lucide="chevron-${state.settingsTransferExpanded ? "up" : "down"}" size="18" style="opacity: 0.6;"></i>
            </div>
            ${state.settingsTransferExpanded ? `
            <div class="ios-list">
                <div class="ios-list-item" style="padding: 12px 16px;">
                    <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t2.bank_name_label}</span>
                    <input type="text" id="set-bank-name" value="${state.adminSettings.bank_name || ""}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                </div>
                <div class="ios-list-item" style="padding: 12px 16px;">
                    <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t2.account_number_label}</span>
                    <input type="text" id="set-bank-cbu" value="${state.adminSettings.bank_cbu || ""}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                </div>
                <div class="ios-list-item" style="padding: 12px 16px;">
                    <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t2.holder_name_label}</span>
                    <input type="text" id="set-bank-holder" value="${state.adminSettings.bank_holder || ""}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                </div>
                <div class="ios-list-item" style="padding: 12px 16px;">
                    <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t2.asunto_label}</span>
                    <input type="text" id="set-bank-alias" value="${state.adminSettings.bank_alias || ""}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                </div>
                <div class="ios-list-item" onclick="saveBankSettings(this)" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; background: var(--system-gray6);">
                    <i data-lucide="save" size="18" style="opacity: 0.6; margin-right: 8px;"></i> ${t2.save_bank_btn}
                </div>
            </div>
            ` : ""}

            <!-- Discovery profile (Ajustes) -->
            <div class="settings-section-header" onclick="state.settingsDiscoveryExpanded = !state.settingsDiscoveryExpanded; saveState(); renderView();" style="padding: 0 1.2rem; margin-top: 2.5rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                <span>${t2.discovery_profile_section || "Discovery profile"}</span>
                <i data-lucide="chevron-${state.settingsDiscoveryExpanded ? "up" : "down"}" size="18" style="opacity: 0.6;"></i>
            </div>
            ${state.settingsDiscoveryExpanded ? `
            <div class="ios-list" style="margin-bottom: 1rem;">
                <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_slug_label}</span><input type="text" id="discovery-slug" value="${(state.currentSchool?.discovery_slug || "").replace(/"/g, "&quot;")}" placeholder="${t2.discovery_slug_placeholder || "royal_latin"}" oninput="window.updateDiscoveryPreview()" style="text-align: right; border: none; background: transparent; width: 55%; color: var(--text-primary); font-size: 14px; outline: none;"></div>
                <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.country_label}</span><select id="discovery-country" onchange="window.updateDiscoveryCityDropdown(); window.updateDiscoveryPreview();" style="background: var(--system-gray6); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; color: var(--text-primary); font-size: 14px; outline: none; min-width: 140px;"><option value="">\u2014</option>${DISCOVERY_COUNTRIES.map((c) => {
          const v = (state.currentSchool?.country || "").trim();
          return `<option value="${String(c).replace(/"/g, "&quot;")}" ${c === v ? "selected" : ""}>${String(c).replace(/</g, "&lt;")}</option>`;
        }).join("")}</select></div>
                <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.city_label}</span><select id="discovery-city" onchange="window.updateDiscoveryPreview()" style="background: var(--system-gray6); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; color: var(--text-primary); font-size: 14px; outline: none; min-width: 140px;">${(() => {
          const country = (state.currentSchool?.country || "").trim();
          const city = (state.currentSchool?.city || "").trim();
          const cities = DISCOVERY_COUNTRIES_CITIES[country] || [];
          const list = city && !cities.includes(city) ? [city, ...cities] : cities;
          return '<option value="">\u2014</option>' + list.map((c) => `<option value="${String(c).replace(/"/g, "&quot;")}" ${c === city ? " selected" : ""}>${String(c).replace(/</g, "&lt;")}</option>`).join("");
        })()}</select></div>
                <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 6px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_description_label}</span><textarea id="discovery-description" rows="3" placeholder="Short description for the discovery page" oninput="window.updateDiscoveryPreview()" style="width: 100%; border: 1px solid var(--border); border-radius: 12px; padding: 10px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none; box-sizing: border-box;">${(state.currentSchool?.discovery_description || "").replace(/</g, "&lt;").replace(/"/g, "&quot;")}</textarea></div>
                <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_genres_label}</span><input type="text" id="discovery-genres" value="${(Array.isArray(state.currentSchool?.discovery_genres) ? state.currentSchool.discovery_genres.join(", ") : state.currentSchool?.discovery_genres || "").toString().replace(/"/g, "&quot;")}" placeholder="Salsa, Bachata" oninput="window.updateDiscoveryPreview()" style="text-align: right; border: none; background: transparent; width: 55%; color: var(--text-primary); font-size: 14px; outline: none;"></div>
                <div class="ios-list-item" style="padding: 12px 16px;"><span style="font-size: 14px; opacity: 0.8;">${t2.discovery_levels_label}</span><input type="text" id="discovery-levels" value="${(Array.isArray(state.currentSchool?.discovery_levels) ? state.currentSchool.discovery_levels.join(", ") : state.currentSchool?.discovery_levels || "").toString().replace(/"/g, "&quot;")}" placeholder="Beginner, Intermediate" oninput="window.updateDiscoveryPreview()" style="text-align: right; border: none; background: transparent; width: 55%; color: var(--text-primary); font-size: 14px; outline: none;"></div>
                <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 8px;"><span style="font-size: 14px; opacity: 0.8;">${t2.logo_url_label}</span><div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;"><input type="file" id="discovery-logo-file" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none;" onchange="window.handleDiscoveryFileSelect(this, 'logo')"><button type="button" onclick="document.getElementById('discovery-logo-file').click();" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: var(--system-gray6); border: 1px solid var(--border); color: var(--text-primary); cursor: pointer;">${t2.discovery_upload_btn || "Upload"}</button>${(state.currentSchool?.logo_url || "").trim() ? `<button type="button" onclick="window.clearDiscoveryImage('logo')" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: transparent; border: 1px solid var(--border); color: var(--system-red, #ff3b30); cursor: pointer;">${(t2.discovery_remove_image || "Remove").replace(/</g, "&lt;")}</button>` : ""}<input type="text" id="discovery-logo-url" value="${(state.currentSchool?.logo_url || "").replace(/"/g, "&quot;")}" placeholder="https://... or upload" oninput="window.updateDiscoveryPreview()" style="flex: 1; min-width: 0; border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none;"></div></div>
                <div class="ios-list-item" style="padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 8px;"><span style="font-size: 14px; opacity: 0.8;">${t2.teacher_photo_url_label}</span><div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;"><input type="file" id="discovery-teacher-file" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none;" onchange="window.handleDiscoveryFileSelect(this, 'teacher')"><button type="button" onclick="document.getElementById('discovery-teacher-file').click();" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: var(--system-gray6); border: 1px solid var(--border); color: var(--text-primary); cursor: pointer;">${t2.discovery_upload_btn || "Upload"}</button>${(state.currentSchool?.teacher_photo_url || "").trim() ? `<button type="button" onclick="window.clearDiscoveryImage('teacher')" style="padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; background: transparent; border: 1px solid var(--border); color: var(--system-red, #ff3b30); cursor: pointer;">${(t2.discovery_remove_image || "Remove").replace(/</g, "&lt;")}</button>` : ""}<input type="text" id="discovery-teacher-url" value="${(state.currentSchool?.teacher_photo_url || "").replace(/"/g, "&quot;")}" placeholder="https://... or upload" oninput="window.updateDiscoveryPreview()" style="flex: 1; min-width: 0; border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none;"></div></div>
                <div class="discovery-locations-wrap">
                    <h3 class="discovery-locations-title">${t2.discovery_locations_label || "Where we teach"}</h3>
                    ${(() => {
          if (state._discoveryLocationsSchoolId !== state.currentSchool?.id) {
            state._discoveryLocationsSchoolId = state.currentSchool?.id;
            state.discoveryLocations = Array.isArray(state.currentSchool?.discovery_locations) ? state.currentSchool.discovery_locations.map((l) => ({ name: l.name || "", address: l.address || "", description: l.description || "", image_urls: Array.isArray(l.image_urls) ? [...l.image_urls] : [] })) : [];
          }
          const locs = state.discoveryLocations || [];
          return locs.map((loc, i) => `<div class="discovery-location-card">
                        <div class="discovery-location-card-header">
                            <span class="discovery-location-card-badge">${t2.discovery_where_we_teach || "Location"} ${i + 1}</span>
                            <button type="button" class="discovery-location-remove" onclick="window.removeDiscoveryLocation(${i})" aria-label="${t2.discovery_remove_location || "Remove"}"><i data-lucide="trash-2" size="16"></i></button>
                        </div>
                        <div class="discovery-location-fields">
                            <label class="discovery-location-label">${t2.discovery_location_name || "Name"}</label>
                            <input type="text" class="discovery-location-input" value="${(loc.name || "").replace(/"/g, "&quot;")}" oninput="window.setDiscoveryLocationField(${i}, 'name', this.value)" placeholder="e.g. Studio Central">
                            <label class="discovery-location-label">${t2.discovery_location_address || "Address"} <span class="discovery-location-required">*</span></label>
                            <input type="text" class="discovery-location-input" value="${(loc.address || "").replace(/"/g, "&quot;")}" oninput="window.setDiscoveryLocationField(${i}, 'address', this.value)" placeholder="Street, number, city">
                            <label class="discovery-location-label">${t2.discovery_location_description || "Description"}</label>
                            <textarea rows="2" class="discovery-location-textarea" oninput="window.setDiscoveryLocationField(${i}, 'description', this.value)" placeholder="Condition, facilities\u2026">${(loc.description || "").replace(/</g, "&lt;").replace(/"/g, "&quot;")}</textarea>
                            <label class="discovery-location-label">${t2.discovery_upload_btn || "Photos"}</label>
                            <div class="discovery-location-photos-row">
                                <input type="file" id="discovery-loc-file-${i}" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none;" onchange="window.uploadDiscoveryLocationImage(${i}, this)">
                                <button type="button" class="discovery-location-upload-btn" onclick="document.getElementById('discovery-loc-file-${i}').click();"><i data-lucide="plus" size="18"></i> ${t2.discovery_upload_btn || "Upload"}</button>
                                ${(loc.image_urls || []).length ? `<div class="discovery-location-thumbs">${(loc.image_urls || []).map((url, j) => `<span class="discovery-location-thumb-wrap"><img src="${String(url).replace(/"/g, "&quot;")}" alt="" class="discovery-location-thumb"><button type="button" class="discovery-location-thumb-remove" onclick="window.removeDiscoveryLocationImage(${i}, ${j})" aria-label="Remove">\xD7</button></span>`).join("")}</div>` : ""}
                            </div>
                        </div>
                    </div>`).join("") + `<button type="button" class="discovery-location-add-btn" onclick="window.addDiscoveryLocation()"><i data-lucide="plus" size="20"></i> ${t2.discovery_add_location || "Add location"}</button>`;
        })()}
                </div>
                <div class="ios-list-item save-discovery-btn" onclick="window.saveDiscoveryProfile(event)" style="color: var(--system-blue); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; background: var(--system-gray6);">
                    <i data-lucide="save" size="18" style="opacity: 0.6; margin-right: 8px;"></i> ${t2.save_discovery_btn || "Save discovery profile"}
                </div>
            </div>
            <div style="padding: 0 1.2rem; margin-top: 1.5rem;">
                <button onclick="window.toggleDiscoveryPreview()" style="width: 100%; padding: 14px; border-radius: 16px; border: 1px solid var(--border); background: var(--system-gray6); color: var(--text-primary); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 14px;">
                    <i data-lucide="${state.showDiscoveryPreview ? "eye-off" : "eye"}" size="16" style="opacity: 0.6;"></i>
                    ${state.showDiscoveryPreview ? t2.hide_discovery_preview_btn : t2.show_discovery_preview_btn}
                </button>
            </div>
            ${state.showDiscoveryPreview ? `
            <div style="padding: 0 1.2rem; margin-top: 1rem; margin-bottom: 0.8rem;" class="slide-in">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">${t2.discovery_preview_title || "Preview on Discover"}</div>
            </div>
            <div class="card slide-in" style="margin: 0 1.2rem 1.5rem; padding: 0; border-radius: 16px; border: 1px solid var(--border); overflow: hidden;">
                <div id="discovery-preview-inner" style="font-size: 13px; color: var(--text-primary); max-height: 70vh; overflow-y: auto; padding: 1rem; background: var(--bg-body);">${discoveryPreviewInnerHtml}</div>
            </div>
            ` : ""}
            ` : ""}

            <!-- Profile, password, admins, additional features, private contact (expandable at bottom) -->
            <div class="settings-advanced-expandable ${state.settingsAdvancedExpanded ? "expanded" : ""}" style="margin-top: 2.5rem; margin-bottom: 1rem; padding: 0 1.2rem; border-top: 1px solid var(--border); padding-top: 1rem;">
                <div class="expandable-section-header" onclick="toggleExpandableNoRender('settingsAdvanced')" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 0; cursor: pointer; border-bottom: 1px solid var(--border);">
                    <span style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t2.settings_account_admin_label || "Profile, password, admins & more"}</span>
                    <i data-lucide="chevron-down" size="18" class="expandable-chevron" style="opacity: 0.5;"></i>
                </div>
                <div id="settings-advanced-content" style="padding: 1rem 0; display: ${state.settingsAdvancedExpanded ? "" : "none"};">
                    ${state.currentSchool?.profile_type === "school" ? `
                    ${state.currentSchool?.private_packages_enabled !== false ? `
                    <div class="admin-private-classes-toggle-card">
                        <div class="admin-private-contact-title">${t2.offer_private_classes || "Offer private classes"}</div>
                        <p class="admin-private-contact-desc">${t2.offer_private_classes_desc || "Allow students to buy and use private class packages. When enabled, plans can include group classes, private classes, or both."}</p>
                        <div class="ios-list-item" style="justify-content: space-between; padding: 12px 0;">
                            <span style="font-size: 15px; font-weight: 600;">${t2.offer_private_classes || "Offer private classes"}</span>
                            <label class="toggle-switch" style="flex-shrink: 0;">
                                <input type="checkbox" class="toggle-switch-input" ${state.adminSettings?.private_classes_offering_enabled === "true" ? "checked" : ""} onchange="window.togglePrivateClassesOffering(this.checked)">
                                <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                            </label>
                        </div>
                    </div>
                    ` : ""}
                    ${state.currentSchool?.events_packages_enabled !== false ? `
                    <div class="admin-private-classes-toggle-card">
                        <div class="admin-private-contact-title">${t2.offer_events || "Offer events"}</div>
                        <p class="admin-private-contact-desc">${t2.offer_events_desc || "Allow students to buy and use event tokens. When enabled, plans can include group, private, and event counts."}</p>
                        <div class="ios-list-item" style="justify-content: space-between; padding: 12px 0;">
                            <span style="font-size: 15px; font-weight: 600;">${t2.offer_events || "Offer events"}</span>
                            <label class="toggle-switch" style="flex-shrink: 0;">
                                <input type="checkbox" class="toggle-switch-input" ${state.adminSettings?.events_offering_enabled === "true" ? "checked" : ""} onchange="window.toggleEventsOffering(this.checked)">
                                <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                            </label>
                        </div>
                    </div>
                    ` : ""}
                    ${state.currentSchool?.monthly_registration_enabled || state.currentSchool?.profile_type === "private_teacher" ? `
                    <div class="admin-private-classes-toggle-card">
                        <div class="admin-private-contact-title">${t2.offer_monthly_registration || "Offer monthly class registration"}</div>
                        <p class="admin-private-contact-desc">${t2.offer_monthly_registration_desc || "Students can register for all remaining classes of a course in the current month at once."}</p>
                        <div class="ios-list-item" style="justify-content: space-between; padding: 12px 0;">
                            <span style="font-size: 15px; font-weight: 600;">${t2.offer_monthly_registration || "Offer monthly class registration"}</span>
                            <label class="toggle-switch" style="flex-shrink: 0;">
                                <input type="checkbox" class="toggle-switch-input" ${state.adminSettings?.monthly_registration_enabled === "true" ? "checked" : ""} onchange="window.toggleMonthlyRegistration(this.checked)">
                                <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                            </label>
                        </div>
                    </div>
                    ` : ""}
                    <div class="admin-private-classes-toggle-card">
                        <div class="admin-private-contact-title">${t2.plan_expiry_fixed_date_label || "Use fixed expiry date"}</div>
                        <p class="admin-private-contact-desc">${t2.plan_expiry_fixed_date_desc || "When ON: Plans and students see a fixed expiry date (e.g. 28.02.2026). When OFF: Plans and students see validity in days (e.g. 30 days left)."}</p>
                        <div class="ios-list-item" style="justify-content: space-between; padding: 12px 0;">
                            <span style="font-size: 15px; font-weight: 600;">${t2.plan_expiry_fixed_date_label || "Use fixed expiry date"}</span>
                            <label class="toggle-switch" style="flex-shrink: 0;">
                                <input type="checkbox" class="toggle-switch-input" ${state._usePlanExpiryFixedDate ? "checked" : ""} onchange="window.togglePlanExpiryFixedDate(this.checked)">
                                <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                            </label>
                        </div>
                    </div>
                    <!-- Contacto clases particulares -->
                    <div class="admin-private-contact-card">
                        <div class="admin-private-contact-title">${t2.private_contact_section}</div>
                        <p class="admin-private-contact-desc">${t2.private_contact_desc}</p>
                        <div class="admin-private-contact-select-wrap">
                            <span class="admin-private-contact-select-label">${t2.select_contact_admin}</span>
                            <select id="private-contact-admin" onchange="window.savePrivateContactAdmin(this.value)">
                                <option value="">\u2014</option>
                                ${(Array.isArray(state.admins) ? state.admins : []).map((adm) => `
                                    <option value="${adm.id}" ${(state.adminSettings?.private_contact_admin_id || "") === adm.id ? "selected" : ""}>${(adm.display_name || adm.username || "").replace(/</g, "&lt;")}</option>
                                `).join("")}
                            </select>
                            <i data-lucide="chevron-down" size="18" style="opacity: 0.5; flex-shrink: 0;"></i>
                        </div>
                    </div>

                    ${state.currentAdmin ? `
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.5rem;">${t2.my_profile_section}</div>
                    <div class="ios-list" style="margin-bottom: 1.5rem;">
                        <div class="ios-list-item" style="padding: 12px 16px;">
                            <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t2.display_name_label}</span>
                            <input type="text" id="profile-display-name" value="${(state.currentAdmin.display_name || "").replace(/"/g, "&quot;")}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                        </div>
                        <div class="ios-list-item" style="padding: 12px 16px;">
                            <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t2.admin_email_label || "Email"}</span>
                            <input type="email" id="profile-email" value="${(state.currentAdmin.email || "").replace(/"/g, "&quot;")}" placeholder="${t2.admin_email_not_set || "Not set"}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                        </div>
                        <div class="ios-list-item" style="padding: 12px 16px;">
                            <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t2.phone_label}</span>
                            <input type="text" id="profile-phone" value="${(state.currentAdmin.phone || "").replace(/"/g, "&quot;")}" placeholder="+52 55 1234 5678" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                        </div>
                        <div class="ios-list-item" id="save-admin-profile-btn" onclick="window.saveAdminProfile()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; background: var(--system-gray6);">
                            <i data-lucide="save" size="18" style="opacity: 0.6; margin-right: 8px;"></i> ${t2.save_profile_btn}
                        </div>
                    </div>

                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.5rem;">${t2.change_password_section}</div>
                    <div class="ios-list" style="margin-bottom: 1.5rem;">
                        <div class="ios-list-item" style="padding: 12px 16px;">
                            <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t2.current_password_label}</span>
                            <input type="password" id="profile-current-password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                        </div>
                        <div class="ios-list-item" style="padding: 12px 16px;">
                            <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t2.new_password_label}</span>
                            <input type="password" id="profile-new-password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                        </div>
                        <div class="ios-list-item" style="padding: 12px 16px;">
                            <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t2.confirm_new_password_label}</span>
                            <input type="password" id="profile-confirm-password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                        </div>
                        <div class="ios-list-item" onclick="window.changeAdminPassword()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; background: var(--system-gray6);">
                            <i data-lucide="key" size="18" style="opacity: 0.6; margin-right: 8px;"></i> ${t2.change_password_btn}
                        </div>
                    </div>
                    ` : ""}

                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.5rem;">${t2.mgmt_admins_title}</div>
                    <div class="ios-list" style="margin-bottom: 1.5rem;">
                        ${(Array.isArray(state.admins) ? state.admins : []).map((adm) => `
                            <div class="ios-list-item" style="padding: 12px 16px; align-items: center;">
                                <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${adm.username}</span>
                                <button onclick="window.removeAdmin('${adm.id}')" style="background: none; border: none; color: var(--text-secondary); padding: 8px; opacity: 0.4; margin-left: auto; cursor: pointer;">
                                    <i data-lucide="trash-2" size="18"></i>
                                </button>
                            </div>
                        `).join("")}
                        <div class="ios-list-item" onclick="window.openAddAdminModal()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px;">
                            <i data-lucide="user-plus" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t2.add_admin || "Agregar Admin"}
                        </div>
                    </div>

                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.5rem;">${t2.additional_features}</div>
                    <div style="margin-bottom: 1rem;">
                        <div class="card" style="padding: 16px; border-radius: 16px; margin-bottom: 16px;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="flex: 1;">
                                    <div style="font-size: 15px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                                        <i data-lucide="calendar-check" size="18" style="opacity: 0.6;"></i>
                                        ${t2.registration_enabled}
                                    </div>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; padding-left: 26px;">${t2.registration_enabled_desc}</div>
                                </div>
                                <label class="toggle-switch" style="flex-shrink: 0; margin-left: 12px;">
                                    <input type="checkbox" class="toggle-switch-input" ${state.currentSchool?.class_registration_enabled ? "checked" : ""} onchange="window.toggleClassRegistration(this.checked)">
                                    <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                                </label>
                            </div>
                        </div>
                        ${state.currentSchool?.jack_and_jill_enabled === true ? `
                        <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px;">${t2.create_new_competition}</div>
                        <button class="btn-primary" onclick="navigateToAdminJackAndJill(state.currentSchool?.id, null)" style="width: 100%; border-radius: 14px; height: 48px; font-size: 15px; font-weight: 600;">
                            <i data-lucide="trophy" size="16" style="margin-right: 8px;"></i> ${t2.jack_and_jill}
                        </button>
                        ` : ""}
                    </div>
                </div>
            </div>
                    ` : ""}

            <div style="height:100px"></div>
    `;
      } else if (view === "admin-competition-jack-and-jill") {
        const schoolId = state.competitionSchoolId || state.currentSchool?.id;
        if (schoolId && state._competitionListSchoolId !== schoolId) {
          state._competitionListSchoolId = schoolId;
          window.fetchCompetitionList(schoolId);
        }
        const comps = Array.isArray(state.competitions) ? state.competitions : [];
        const current = state.currentCompetition;
        const formOpen = !!state.jackAndJillFormOpen;
        if (formOpen && current) state.competitionFormQuestions = Array.isArray(state.competitionFormQuestions) ? state.competitionFormQuestions : Array.isArray(current.questions) ? [...current.questions] : [];
        else if (formOpen && !current) state.competitionFormQuestions = Array.isArray(state.competitionFormQuestions) ? state.competitionFormQuestions : [];
        html += `
            <div class="jandj-page" style="min-height: 100vh; background: var(--bg-body);">
            <div class="ios-header" style="display: flex; align-items: center; gap: 16px; padding: 14px 20px 18px; border-bottom: 1px solid var(--border);">
                <button type="button" class="btn-back" onclick="window.location.hash=''; state.currentView='admin-settings'; saveState(); renderView();"><i data-lucide="chevron-left" size="22"></i></button>
                <h1 style="font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: var(--text-primary); margin: 0;">${t2.jack_and_jill}</h1>
            </div>
            <div class="jandj-form-page">
                ${!schoolId ? `<p style="color: var(--text-secondary); font-size: 15px;">${t2.not_found_msg}</p>` : formOpen ? `
                <div class="jandj-form-card">
                    <div class="jandj-form-body">
                        <div class="jandj-form-header">
                            <h2 class="jandj-form-title">${current ? t2.competition_edit_tab : t2.add_new_event}</h2>
                            <div class="jandj-form-header-actions">
                                <span id="comp-autosave-status" class="jandj-form-autosave"></span>
                                <button type="button" class="jandj-form-cancel" onclick="closeCompetitionForm()">${t2.cancel}</button>
                            </div>
                        </div>
                        <input type="hidden" id="comp-id" value="${current && current.id || ""}">
                        <div class="jandj-form-group">
                            <label class="jandj-form-label">${t2.competition_name}</label>
                            <input type="text" id="comp-name" class="jandj-form-input" value="${current && current.name || ""}" placeholder="${t2.competition_name}" oninput="debouncedAutosaveCompetition()">
                        </div>
                        <div class="jandj-form-group">
                            <div class="jandj-form-row">
                                <div>
                                    <label class="jandj-form-label">${t2.competition_date}</label>
                                    <input type="date" id="comp-date" class="jandj-form-input" value="${current && current.starts_at ? window.formatClassDate(new Date(current.starts_at)) : ""}" onchange="debouncedAutosaveCompetition()">
                                </div>
                                <div>
                                    <label class="jandj-form-label">${t2.competition_time}</label>
                                    <input type="time" id="comp-time" class="jandj-form-input" value="${current && current.starts_at ? (() => {
          const d = new Date(current.starts_at);
          return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
        })() : "19:00"}" onchange="debouncedAutosaveCompetition()">
                                </div>
                            </div>
                        </div>
                        <div class="jandj-form-group">
                            <label class="jandj-form-label">${t2.competition_questions}</label>
                            <div id="comp-questions-container" class="jandj-form-questions-list"></div>
                            <button type="button" class="jandj-form-add-question" onclick="addCompetitionQuestion()"><i data-lucide="plus" size="20"></i>${t2.competition_add_question}</button>
                        </div>
                        <div class="jandj-form-group">
                            <label class="jandj-form-label">${t2.competition_next_steps}</label>
                            <textarea id="comp-next-steps" class="jandj-form-textarea scroll-nice" rows="6" placeholder="${t2.competition_next_steps_placeholder || ""}" oninput="debouncedAutosaveCompetition()">${current && current.next_steps_text || ""}</textarea>
                        </div>
                        <div class="jandj-form-group jandj-form-toggle-wrap">
                            <label class="toggle-switch">
                                <span class="toggle-switch-label">${t2.competition_video_submission_toggle || "Include video submission?"}</span>
                                <span style="display: flex;">
                                    <input type="checkbox" id="comp-video-enabled" class="toggle-switch-input" ${current && current.video_submission_enabled ? "checked" : ""} onchange="debouncedAutosaveCompetition(); const p=document.getElementById('comp-video-prompt-wrap'); if(p)p.style.display=this.checked?'block':'none';">
                                    <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                                </span>
                            </label>
                            <div id="comp-video-prompt-wrap" class="jandj-form-video-wrap" style="display: ${current && current.video_submission_enabled ? "block" : "none"};">
                                <label class="jandj-form-label" style="margin-bottom: 8px;">${t2.competition_video_prompt_label || "Video question text"}</label>
                                <textarea id="comp-video-prompt" class="jandj-form-video-prompt scroll-nice" rows="5" placeholder="${t2.competition_video_prompt_placeholder || "Upload your demo video"}" oninput="debouncedAutosaveCompetition()">${(current && current.video_submission_prompt || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
                            </div>
                        </div>
                    </div>
                    <div class="jandj-form-footer">
                        <span id="comp-autosave-status-footer" class="jandj-form-autosave"></span>
                        <button type="button" class="jandj-form-done" onclick="closeCompetitionForm()">${t2.competition_done}</button>
                    </div>
                </div>
                ` : `
                ${state.competitionTab === "registrations" && state.competitionId ? (() => {
          const regs = Array.isArray(state.competitionRegistrations) ? state.competitionRegistrations : [];
          const cur = state.currentCompetition;
          const statusClass = (s) => s === "APPROVED" ? "approved" : s === "DECLINED" ? "declined" : s === "SUBMITTED" ? "pending" : "draft";
          return `
                    <button type="button" class="comp-reg-back btn-back" onclick="state.competitionTab='edit'; state.competitionId=null; state.currentCompetition=null; state.competitionRegistrations=[]; renderView();" style="width: auto; min-width: auto; height: auto; min-height: 40px; padding: 0 18px; gap: 8px; border-radius: 50px; font-size: 15px; font-weight: 600;"><i data-lucide="chevron-left" size="20"></i> Back to events</button>
                    <div class="comp-reg-card">
                        ${cur && cur.decisions_published_at ? `<button type="button" class="comp-reg-header comp-reg-header-secondary" onclick="if(confirm(t('competition_confirm_publish'))) republishCompetitionDecisions('${state.competitionId}');">${t2.competition_republish_decisions}</button>` : `<button type="button" class="comp-reg-header" onclick="if(confirm(t('competition_confirm_publish'))) publishCompetitionDecisions('${state.competitionId}');">${t2.competition_publish_decisions}</button>`}
                        <div class="comp-reg-list">
                            ${regs.length === 0 ? `<div class="comp-reg-empty">No registrations yet.</div>` : regs.map((r) => {
            const canDecide = ["SUBMITTED", "APPROVED", "DECLINED"].includes(r.status || "");
            const nameEsc = ((r.student_name || r.student_id || "") + "").replace(/</g, "&lt;").replace(/>/g, "&gt;").substring(0, 30);
            const statusLabel = r.status === "APPROVED" ? t2.accepted : r.status === "DECLINED" ? t2.declined : r.status === "SUBMITTED" ? t2.pending : "Draft";
            return `
                                <div class="comp-reg-item">
                                    <div class="comp-reg-top">
                                        <button type="button" class="comp-reg-name" data-action="openRegistrationAnswers" data-reg-id="${r.id}">${nameEsc}</button>
                                        <span class="comp-reg-status comp-reg-status-${statusClass(r.status)}">${statusLabel}</span>
                                    </div>
                                    ${canDecide ? `
                                    <div class="comp-reg-actions">
                                        <button type="button" class="comp-reg-btn comp-reg-btn-approve ${r.status === "APPROVED" ? "selected" : ""}" onclick="competitionRegistrationDecide('${r.id}', 'APPROVED');">${t2.competition_approve}</button>
                                        <button type="button" class="comp-reg-btn comp-reg-btn-decline ${r.status === "DECLINED" ? "selected" : ""}" onclick="competitionRegistrationDecide('${r.id}', 'DECLINED');">${t2.competition_decline}</button>
                                    </div>
                                    ` : ""}
                                </div>
                            `;
          }).join("")}
                        </div>
                    </div>
                    `;
        })() : `
                <section class="jandj-events-section">
                    <h2 class="jandj-events-title">Events</h2>
                    ${comps.length === 0 ? `
                    <p class="jandj-empty-state">${t2.no_existing_events}</p>
                    ${state.currentUser ? `<p class="jandj-empty-hint" style="font-size: 13px; color: var(--text-secondary); margin-top: 8px; padding: 0 0.5rem;">${t2.no_events_linked_hint || ""}</p>` : ""}
                    ` : `
                    <div class="jandj-events-list">
                        ${comps.map((c) => {
          const nameEsc = (c.name || "").replace(/</g, "&lt;");
          const nameTrunc = nameEsc.substring(0, 40) + (nameEsc.length > 40 ? "\u2026" : "");
          const dateStr = c.starts_at ? new Date(c.starts_at).toLocaleDateString(void 0, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
          return `
                        <div class="jandj-event-card">
                            <div class="jandj-event-card-header">
                                <div>
                                    <div class="jandj-event-card-title">${nameTrunc}</div>
                                    <div class="jandj-event-card-date">${dateStr}</div>
                                </div>
                                <div class="jandj-event-card-actions">
                                    <a href="#" class="jandj-event-card-link" data-action="openRegistrations" data-competition-id="${c.id}">${t2.competition_registrations}</a>
                                    <button type="button" class="jandj-event-card-icon-btn" data-action="copyCompetition" data-competition-id="${c.id}" title="${t2.competition_copy || "Copy"}"><i data-lucide="copy" size="18"></i></button>
                                    <button type="button" class="jandj-event-card-icon-btn jandj-event-card-delete" data-action="deleteCompetition" data-competition-id="${c.id}" title="${t2.competition_delete_confirm || "Delete event"}"><i data-lucide="trash-2" size="18"></i></button>
                                </div>
                            </div>
                            <div class="jandj-event-card-toggles">
                                <label class="toggle-switch">
                                    <span class="toggle-switch-label">${t2.competition_activate_event}</span>
                                    <span style="display: flex;">
                                        <input type="checkbox" class="toggle-switch-input" ${c.is_active ? "checked" : ""} onchange="toggleCompetitionActiveFromStudents('${c.id}', this.checked)">
                                        <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                                    </span>
                                </label>
                                <label class="toggle-switch">
                                    <span class="toggle-switch-label">${t2.competition_activate_signin}</span>
                                    <span style="display: flex;">
                                        <input type="checkbox" class="toggle-switch-input" ${c.is_sign_in_active ? "checked" : ""} onchange="toggleCompetitionSignInFromStudents('${c.id}', this.checked)">
                                        <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                                    </span>
                                </label>
                            </div>
                            <div class="jandj-event-card-edit-wrap">
                                <button type="button" class="jandj-event-card-edit-btn" onclick="openEditCompetition('${c.id}')">${t2.competition_edit_tab}</button>
                            </div>
                        </div>
                        `;
        }).join("")}
                    </div>
                    `}
                </section>
                <button type="button" class="jandj-add-event-btn" data-action="openCreateNewCompetition">
                    <i data-lucide="plus" size="22"></i> ${t2.add_new_event}
                </button>
                `}
                `}
            </div>
            <div style="height: 80px;"></div>
            </div>
        `;
        if (view === "admin-competition-jack-and-jill" && formOpen) {
          const questions = Array.isArray(state.competitionFormQuestions) ? state.competitionFormQuestions : current && Array.isArray(current.questions) ? current.questions : [];
          setTimeout(() => {
            const container = document.getElementById("comp-questions-container");
            if (container) {
              container.innerHTML = questions.map((q, i) => `
                        <div class="jandj-form-question-row">
                            <span class="jandj-form-question-num">${i + 1}</span>
                            <input type="text" class="jandj-form-question-input" value="${String(q || "").replace(/"/g, "&quot;").replace(/</g, "&lt;")}" data-qidx="${i}" oninput="updateCompetitionQuestion(${i}, this.value)">
                            <button type="button" class="jandj-form-question-remove" onclick="removeCompetitionQuestion(${i})" title="Remove question"><i data-lucide="trash-2" size="18"></i></button>
                        </div>
                    `).join("");
              if (window.lucide) window.lucide.createIcons();
            }
          }, 0);
        }
      }
      html += `</div>`;
      root.innerHTML = html;
      if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
      if (view === "platform-school-details") window.scrollTo(0, 0);
      const isDevView = ["platform-dev-dashboard", "platform-school-details", "platform-dev-edit-discovery", "platform-dev-edit-school"].includes(view);
      const isAdminView = view && view.startsWith("admin-");
      const hasSession = state.currentUser !== null || state.isAdmin || state.isPlatformDev;
      const isLanding = view === "school-selection" || view === "auth";
      const isDiscoveryOnlyView = state._discoveryOnlyEdit || view === "discovery-profile-only" || view === "discovery-admin-pick-school" || view === "discovery-admin-auth";
      const showLogout = hasSession && (!isLanding || state.isPlatformDev);
      const showNav = hasSession && !isLanding && !isDevView && !isDiscoveryOnlyView;
      document.getElementById("logout-btn").classList.toggle("hidden", !showLogout);
      document.getElementById("dev-login-trigger").classList.toggle("hidden", state.currentUser !== null);
      document.getElementById("student-nav").classList.toggle("hidden", !showNav || state.isAdmin);
      document.getElementById("admin-nav").classList.toggle("hidden", !showNav || !state.isAdmin);
      const studentNav = document.getElementById("student-nav");
      if (studentNav) {
        const isPrivateTeacher = state.currentSchool?.profile_type === "private_teacher";
        const navItems = [
          { view: isPrivateTeacher ? "teacher-booking" : "schedule", icon: isPrivateTeacher ? "calendar-clock" : "calendar", labelKey: isPrivateTeacher ? "nav_book_class" : "nav_schedule", labelFallback: isPrivateTeacher ? "Book Class" : "Schedule" },
          { view: "shop", icon: "shopping-bag", labelKey: "nav_shop", labelFallback: "Shop" },
          { view: "qr", icon: "qr-code", labelKey: "nav_qr", labelFallback: "My QR" },
          { view: "dashboard-profile", icon: "user", labelKey: "nav_profile", labelFallback: "Profile" }
        ];
        const t3 = DANCE_LOCALES[state.language || "en"];
        navItems.forEach(({ view: view2, icon, labelKey, labelFallback }, idx) => {
          const btn = studentNav.children[idx];
          if (!btn || !btn.classList.contains("nav-item")) return;
          btn.setAttribute("data-view", view2);
          const oldIcon = btn.querySelector("[data-lucide], i, svg");
          if (oldIcon) {
            const newIcon = document.createElement("i");
            newIcon.setAttribute("data-lucide", icon);
            oldIcon.replaceWith(newIcon);
          }
          const label = btn.querySelector("span");
          if (label) label.textContent = t3[labelKey] || labelFallback;
        });
      }
      document.body.classList.toggle("landing-page", view === "school-selection");
      if (typeof window.updateStickyFooterVisibility === "function") {
        window.updateStickyFooterVisibility();
      }
      document.querySelectorAll(".nav-item").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-view") === view);
      });
      if (state.isAdmin) {
        const pendingCount = (state.paymentRequests || []).filter((r) => r.status === "pending").length;
        const badge = document.getElementById("memberships-badge");
        if (badge) {
          badge.textContent = "";
          badge.classList.toggle("hidden", pendingCount === 0);
        }
      }
      const lucideLib = window.lucide || typeof globalThis !== "undefined" && globalThis.lucide;
      if (lucideLib && typeof lucideLib.createIcons === "function") lucideLib.createIcons();
    } catch (e) {
      console.error("Render error:", e);
      if (root) root.innerHTML = '<div class="container" style="padding:2rem;text-align:center;"><p style="color:var(--text-muted);">Something went wrong. <a href="#" onclick="location.reload()" style="color:var(--text-primary); text-decoration:none; font-weight:600;">Reload</a>.</p></div>';
      const lucideLib = window.lucide || typeof globalThis !== "undefined" && globalThis.lucide;
      if (lucideLib && typeof lucideLib.createIcons === "function") lucideLib.createIcons();
    }
  }
  window.switchAuthMode = () => {
    state.authMode = state.authMode === "signup" ? "login" : "signup";
    renderView();
  };
  window.showAdminFields = () => {
    document.getElementById("admin-fields").classList.toggle("hidden");
    document.getElementById("admin-show-btn").classList.toggle("hidden");
  };
  window.setScheduleView = (v) => {
    state.scheduleView = v;
    saveState();
    renderView();
    window.scrollTo(0, 0);
  };
  window.getNextClassDate = (dayCode) => {
    const dayMap = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 0 };
    const dayAliases = { "Mo": 1, "Monday": 1, "Tu": 2, "Tuesday": 2, "We": 3, "Wednesday": 3, "Th": 4, "Thursday": 4, "Fr": 5, "Friday": 5, "Sa": 6, "Saturday": 6, "Su": 0, "Sunday": 0 };
    let targetDay = dayMap[dayCode];
    if (targetDay === void 0) targetDay = dayAliases[dayCode];
    if (targetDay === void 0) return null;
    const now = /* @__PURE__ */ new Date();
    const today = now.getDay();
    let daysUntil = targetDay - today;
    if (daysUntil < 0) daysUntil += 7;
    if (daysUntil === 0) {
    }
    const result = new Date(now);
    result.setDate(result.getDate() + daysUntil);
    return result;
  };
  window.formatClassDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  window.getCurrentWeekMonday = () => {
    const now = getTodayForMonthly();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };
  window.getCurrentWeekDate = (dayCode) => {
    const dayOffsets = { "Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6 };
    const dayAliasMap = { "Mo": 0, "Monday": 0, "Tu": 1, "Tuesday": 1, "We": 2, "Wednesday": 2, "Th": 3, "Thursday": 3, "Fr": 4, "Friday": 4, "Sa": 5, "Saturday": 5, "Su": 6, "Sunday": 6 };
    let offset = dayOffsets[dayCode];
    if (offset === void 0) offset = dayAliasMap[dayCode];
    if (offset === void 0) return null;
    const monday = window.getCurrentWeekMonday();
    const result = new Date(monday);
    result.setDate(monday.getDate() + offset);
    return result;
  };
  window.getCurrentWeekRange = () => {
    const monday = window.getCurrentWeekMonday();
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday, end: sunday };
  };
  window.isDayPastInCurrentWeek = (dayCode) => {
    const dayDate = window.getCurrentWeekDate(dayCode);
    if (!dayDate) return false;
    const today = new Date(getTodayForMonthly());
    today.setHours(0, 0, 0, 0);
    return dayDate < today;
  };
  window.formatShortDate = (date, lang) => {
    if (!date) return "";
    const locale = lang === "es" ? "es-ES" : lang === "de" ? "de-DE" : "en-US";
    return new Date(date).toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
  };
  window.getMonthCalendarGrid = (monthDateStr, acceptedReqs) => {
    const d = /* @__PURE__ */ new Date((monthDateStr || (/* @__PURE__ */ new Date()).toISOString().slice(0, 7) + "-01") + "T12:00:00");
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const mondayOffset = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    const startCell = new Date(firstDay);
    startCell.setDate(firstDay.getDate() + mondayOffset);
    const lastDayOfWeek = lastDay.getDay();
    const sundayOffset = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    const endCell = new Date(lastDay);
    endCell.setDate(lastDay.getDate() + sundayOffset);
    const eventsByDate = {};
    (acceptedReqs || []).forEach((r) => {
      if (!eventsByDate[r.requested_date]) eventsByDate[r.requested_date] = [];
      eventsByDate[r.requested_date].push(r);
    });
    const cells = [];
    const cur = new Date(startCell);
    while (cur <= endCell) {
      const dateStr = cur.toISOString().slice(0, 10);
      const dayNum = cur.getDate();
      const isCurrentMonth = cur.getMonth() === month;
      const events = eventsByDate[dateStr] || [];
      cells.push({ dateStr, dayNum, isCurrentMonth, events });
      cur.setDate(cur.getDate() + 1);
    }
    return cells;
  };
  window.loadClassAvailability = async () => {
    const schoolId = state.currentSchool?.id;
    if (!schoolId || !supabaseClient || !state.currentSchool?.class_registration_enabled) return;
    const availability = {};
    const dates = /* @__PURE__ */ new Set();
    const weekRange = window.getCurrentWeekRange();
    for (let d = new Date(weekRange.start); d <= weekRange.end; d.setDate(d.getDate() + 1)) {
      dates.add(window.formatClassDate(d));
    }
    (state.classes || []).forEach((c) => {
      const nextDate = window.getNextClassDate(c.day);
      if (nextDate) dates.add(window.formatClassDate(nextDate));
    });
    for (const dateStr of dates) {
      try {
        const { data, error } = await supabaseClient.rpc("get_class_availability", {
          p_school_id: schoolId,
          p_class_date: dateStr
        });
        if (!error && data) {
          const arr = Array.isArray(data) ? data : typeof data === "string" ? JSON.parse(data) : [];
          arr.forEach((item) => {
            availability[item.class_id + "_" + dateStr] = item;
          });
        }
      } catch (e) {
        console.warn("Error loading availability for", dateStr, e);
      }
    }
    let myRegs = [];
    let pastRegs = [];
    if (state.currentUser?.id) {
      try {
        const [upcomingRes, pastRes] = await Promise.all([
          supabaseClient.rpc("get_student_upcoming_registrations", { p_student_id: String(state.currentUser.id), p_school_id: schoolId }),
          supabaseClient.rpc("get_student_past_registrations", { p_student_id: String(state.currentUser.id), p_school_id: schoolId })
        ]);
        if (!upcomingRes.error && upcomingRes.data) {
          myRegs = Array.isArray(upcomingRes.data) ? upcomingRes.data : typeof upcomingRes.data === "string" ? JSON.parse(upcomingRes.data) : [];
        }
        if (!pastRes.error && pastRes.data) {
          pastRegs = Array.isArray(pastRes.data) ? pastRes.data : typeof pastRes.data === "string" ? JSON.parse(pastRes.data) : [];
        }
      } catch (e) {
        console.warn("Error loading registrations:", e);
      }
    }
    state.classAvailability = availability;
    state.studentRegistrations = myRegs;
    state.studentPastRegistrations = pastRegs;
    state.classRegLoaded = true;
  };
  window.openPrivateClassesModal = async () => {
    const modal = document.getElementById("private-classes-modal");
    const content = document.getElementById("private-classes-modal-content");
    if (!modal || !content) return;
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    const sid = state.currentSchool?.id;
    if (!sid || !supabaseClient) {
      content.innerHTML = `<p class="text-muted">${t2("contact_not_configured")}</p><button class="btn-primary" onclick="document.getElementById('private-classes-modal').classList.add('hidden')" style="margin-top:1rem;">${t2("close")}</button>`;
      modal.classList.remove("hidden");
      if (window.lucide) window.lucide.createIcons();
      return;
    }
    content.innerHTML = `<div style="padding:1rem;"><i data-lucide="loader-2" class="spin" size="24"></i><p class="text-muted" style="margin-top:0.5rem;">${t2("loading")}</p></div>`;
    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
    try {
      const { data, error } = await supabaseClient.rpc("get_private_classes_contact", { p_school_id: sid, p_bust: Date.now() });
      if (error) throw error;
      if (!data || !data.name || !data.phone) {
        content.innerHTML = `<p class="text-muted">${t2("contact_not_configured")}</p><button class="btn-primary" onclick="document.getElementById('private-classes-modal').classList.add('hidden')" style="margin-top:1rem;">${t2("close")}</button>`;
      } else {
        const phoneDigits = (data.phone || "").replace(/\D/g, "");
        const whatsappUrl = phoneDigits ? `https://wa.me/${phoneDigits}` : "#";
        content.innerHTML = `
                <h2 class="private-classes-title">${t2("private_classes_contact_title")}</h2>
                <div class="private-classes-avatar"><i data-lucide="user" size="32"></i></div>
                <p class="private-classes-name">${(data.name || "").replace(/</g, "&lt;")}</p>
                <p class="private-classes-phone">${(data.phone || "").replace(/</g, "&lt;")}</p>
                <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="private-classes-whatsapp-btn">
                    <i data-lucide="message-circle" size="22"></i> ${t2("message_whatsapp")}
                </a>
                <button type="button" class="private-classes-close-btn" onclick="document.getElementById('private-classes-modal').classList.add('hidden')">${t2("close")}</button>
            `;
      }
    } catch (err) {
      content.innerHTML = `<p class="text-muted">${t2("contact_not_configured")}</p><button class="btn-primary" onclick="document.getElementById('private-classes-modal').classList.add('hidden')" style="margin-top:1rem;">${t2("close")}</button>`;
    }
    if (window.lucide) window.lucide.createIcons();
  };
  window.showMessageModal = (opts) => {
    const modal = document.getElementById("message-modal");
    const iconEl = document.getElementById("message-modal-icon");
    const titleEl = document.getElementById("message-modal-title");
    const bodyEl = document.getElementById("message-modal-body");
    const actionsEl = document.getElementById("message-modal-actions");
    if (!modal || !iconEl || !titleEl || !bodyEl || !actionsEl) return;
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    const close = () => {
      modal.classList.add("hidden");
    };
    iconEl.className = "message-modal-icon message-modal-icon-" + (opts.icon || "success");
    iconEl.innerHTML = opts.icon === "warning" ? '<i data-lucide="alert-circle" size="30"></i>' : '<i data-lucide="check-circle" size="30"></i>';
    titleEl.textContent = typeof opts.title === "function" ? opts.title() : opts.title || "";
    const bodyText = typeof opts.body === "function" ? opts.body() : opts.body || "";
    bodyEl.textContent = bodyText;
    bodyEl.style.display = bodyText ? "" : "none";
    const primaryLabel = typeof opts.primaryLabel === "function" ? opts.primaryLabel() : opts.primaryLabel || t2("got_it");
    const secondaryLabel = opts.secondaryLabel != null ? typeof opts.secondaryLabel === "function" ? opts.secondaryLabel() : opts.secondaryLabel : null;
    const cancelLabel = opts.cancelLabel != null ? typeof opts.cancelLabel === "function" ? opts.cancelLabel() : opts.cancelLabel : null;
    const hasRow = secondaryLabel || cancelLabel;
    actionsEl.className = "message-modal-actions" + (hasRow ? " message-modal-actions-row" : "") + (cancelLabel ? " message-modal-actions-with-cancel" : "");
    if (cancelLabel) {
      actionsEl.innerHTML = `<div class="message-modal-actions-main">` + (secondaryLabel ? `<button type="button" class="btn-secondary" style="flex:1;">${secondaryLabel}</button>` : "") + `<button type="button" class="btn-primary" style="flex:1;">${primaryLabel}</button></div><button type="button" class="btn-secondary message-modal-cancel">${cancelLabel}</button>`;
    } else {
      actionsEl.innerHTML = secondaryLabel ? `<button type="button" class="btn-secondary" style="flex:1;">${secondaryLabel}</button><button type="button" class="btn-primary" style="flex:1;">${primaryLabel}</button>` : `<button type="button" class="btn-primary" style="width:100%;">${primaryLabel}</button>`;
    }
    actionsEl.querySelector(".btn-primary").onclick = () => {
      if (opts.onPrimary) opts.onPrimary(close);
      else close();
    };
    if (secondaryLabel) {
      const sec = actionsEl.querySelector(".message-modal-actions-main .btn-secondary") || actionsEl.querySelector(".btn-secondary");
      if (sec) sec.onclick = () => {
        if (opts.onSecondary) opts.onSecondary(close);
        else close();
      };
    }
    if (cancelLabel) {
      actionsEl.querySelector(".message-modal-cancel").onclick = () => {
        if (opts.onCancel) opts.onCancel(close);
        else close();
      };
    }
    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  };
  window.showRegisterSuccessModal = (registrationId, canCancelFromSuccess) => {
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    window.showMessageModal({
      icon: "success",
      title: t2("registered_title"),
      body: t2("register_success_4h_note"),
      primaryLabel: t2("got_it"),
      secondaryLabel: t2("close"),
      onPrimary: (close) => {
        close();
      },
      onSecondary: (close) => {
        close();
      }
    });
  };
  window.showCancelConfirmModal = (registrationId) => {
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    const studentId = state.currentUser?.id;
    if (!studentId || !supabaseClient) return;
    window.showMessageModal({
      icon: "warning",
      title: t2("cancel_registration"),
      body: t2("cancel_confirm_full"),
      primaryLabel: t2("cancel_confirm_yes"),
      secondaryLabel: t2("go_back"),
      onSecondary: (close) => {
        close();
      },
      onPrimary: async (close) => {
        try {
          const { error } = await supabaseClient.rpc("cancel_class_registration", {
            p_registration_id: registrationId,
            p_student_id: String(studentId)
          });
          if (error) throw error;
          close();
          await window.loadClassAvailability();
          if (shouldDeferRender()) scheduleDeferredRender();
          else {
            renderView();
            if (window.lucide) window.lucide.createIcons();
          }
        } catch (e) {
          console.error("Cancel error:", e);
          close();
          const msg = e && e.message || "";
          const is4HourRule = /4\s*hours?|4\s*horas|before\s*class|antes del inicio|less than/i.test(msg);
          alert(is4HourRule ? t2("cancel_too_late_error") : msg || t2("cancel_error"));
        }
      }
    });
  };
  function getTodayForMonthly() {
    if (state.mockDate) {
      const d = new Date(state.mockDate);
      return isNaN(d.getTime()) ? /* @__PURE__ */ new Date() : d;
    }
    return /* @__PURE__ */ new Date();
  }
  window.getTodayForMonthly = getTodayForMonthly;
  function getVirtualNow() {
    if (state.mockDate) {
      const d = /* @__PURE__ */ new Date(state.mockDate + "T00:00:00");
      return isNaN(d.getTime()) ? /* @__PURE__ */ new Date() : d;
    }
    return /* @__PURE__ */ new Date();
  }
  window.getMonthlyDates = (dayCode) => {
    const dayMap = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 0 };
    const dayAliases = { "Mo": 1, "Monday": 1, "Tu": 2, "Tuesday": 2, "We": 3, "Wednesday": 3, "Th": 4, "Thursday": 4, "Fr": 5, "Friday": 5, "Sa": 6, "Saturday": 6, "Su": 0, "Sunday": 0 };
    let targetDay = dayMap[dayCode];
    if (targetDay === void 0) targetDay = dayAliases[dayCode];
    if (targetDay === void 0) return [];
    const now = getTodayForMonthly();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = new Date(year, month, now.getDate());
    const lastDay = new Date(year, month + 1, 0).getDate();
    const dates = [];
    for (let d = 1; d <= lastDay; d++) {
      const dt = new Date(year, month, d);
      if (dt.getDay() === targetDay && dt >= today) {
        dates.push(window.formatClassDate(dt));
      }
    }
    return dates;
  };
  window.isMonthlyRegistrationAvailable = () => {
    const school = state.currentSchool;
    if (school?.monthly_registration_enabled === false) return false;
    if (!school?.class_registration_enabled) return false;
    const dayOfMonth = getTodayForMonthly().getDate();
    if (dayOfMonth > 14) return false;
    if (state.adminSettings?.monthly_registration_enabled === "false") return false;
    const adminOffers = state.adminSettings?.monthly_registration_enabled === "true";
    const platformAllows = school?.monthly_registration_enabled === true;
    return adminOffers || platformAllows;
  };
  window.registerForClassSingle = async (classId, className) => {
    const schoolId = state.currentSchool?.id;
    const studentId = state.currentUser?.id;
    if (!schoolId || !studentId || !supabaseClient) return;
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    const classObj = (state.classes || []).find((c) => c.id === classId);
    if (!classObj) return;
    const nextDate = window.getNextClassDate(classObj.day);
    if (!nextDate) return;
    const dateStr = window.formatClassDate(nextDate);
    try {
      const { data, error } = await supabaseClient.rpc("register_for_class", {
        p_student_id: String(studentId),
        p_class_id: classId,
        p_school_id: schoolId,
        p_class_date: dateStr
      });
      if (error) throw error;
      const registrationId = data?.id || (data && typeof data === "object" ? data.id : null);
      const classDateTime = /* @__PURE__ */ new Date(dateStr + "T" + (classObj.time || "23:59"));
      const canCancel = classDateTime.getTime() - getVirtualNow().getTime() > 4 * 60 * 60 * 1e3;
      window.showRegisterSuccessModal(registrationId, canCancel);
      window.loadClassAvailability().then(() => {
        if (shouldDeferRender()) scheduleDeferredRender();
        else {
          renderView();
          if (window.lucide) window.lucide.createIcons();
        }
      }).catch(() => {
      });
    } catch (e) {
      console.error("Registration error:", e);
      alert(e.message || t2("register_error"));
    }
  };
  window.registerForClassMonthly = async (classId, className) => {
    const schoolId = state.currentSchool?.id;
    const studentId = state.currentUser?.id;
    if (!schoolId || !studentId || !supabaseClient) return;
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    const classObj = (state.classes || []).find((c) => c.id === classId);
    if (!classObj) return;
    const dates = window.getMonthlyDates(classObj.day);
    if (dates.length === 0) return;
    try {
      const { data, error } = await supabaseClient.rpc("register_for_class_monthly", {
        p_student_id: String(studentId),
        p_class_id: classId,
        p_school_id: schoolId,
        p_dates: dates
      });
      if (error) throw error;
      const count = Array.isArray(data) ? data.length : data ? JSON.parse(data).length : dates.length;
      window.showMessageModal({
        icon: "success",
        title: (t2("monthly_registration_success") || "Successfully registered for {n} classes this month!").replace("{n}", count),
        body: "",
        primaryLabel: t2("got_it")
      });
      window.loadClassAvailability().then(() => {
        if (shouldDeferRender()) scheduleDeferredRender();
        else {
          renderView();
          if (window.lucide) window.lucide.createIcons();
        }
      }).catch(() => {
      });
    } catch (e) {
      console.error("Monthly registration error:", e);
      alert(e.message || t2("register_error"));
    }
  };
  window.registerForClass = async (classId, className) => {
    const schoolId = state.currentSchool?.id;
    const studentId = state.currentUser?.id;
    if (!schoolId || !studentId || !supabaseClient) return;
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    const classObj = (state.classes || []).find((c) => c.id === classId);
    if (!classObj) return;
    const nextDate = window.getNextClassDate(classObj.day);
    if (!nextDate) return;
    const dateStr = window.formatClassDate(nextDate);
    const classDateTime = /* @__PURE__ */ new Date(dateStr + "T" + (classObj.time || "23:59"));
    if (classDateTime.getTime() <= getVirtualNow().getTime()) {
      window.showMessageModal({
        icon: "warning",
        title: t2("class_already_started"),
        body: "",
        primaryLabel: t2("got_it")
      });
      return;
    }
    if (window.isMonthlyRegistrationAvailable()) {
      const monthlyDates = window.getMonthlyDates(classObj.day);
      if (monthlyDates.length > 1) {
        const dayNames = { "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday" };
        const dayName = dayNames[classObj.day] || classObj.day;
        window.showMessageModal({
          icon: "success",
          title: className || classObj.name,
          body: (t2("register_monthly") || "Register for all {n} classes this month").replace("{n}", monthlyDates.length) + " (" + dayName + ")",
          primaryLabel: (t2("register_monthly") || "Register for all {n} classes this month").replace("{n}", monthlyDates.length),
          secondaryLabel: t2("register_single") || "Register for this class only",
          cancelLabel: t2("cancel"),
          onPrimary: (close) => {
            close();
            window.registerForClassMonthly(classId, className);
          },
          onSecondary: (close) => {
            close();
            window.registerForClassSingle(classId, className);
          },
          onCancel: (close) => {
            close();
          }
        });
        return;
      }
    }
    window.registerForClassSingle(classId, className);
  };
  window.cancelRegistrationFromSchedule = (registrationId) => {
    if (!state.currentUser?.id || !supabaseClient) return;
    window.showCancelConfirmModal(registrationId);
  };
  window.formatLocationLabel = (loc) => {
    if (!loc) return "";
    return loc.replace(/\s*\(.*?\)\s*/g, " ").trim();
  };
  window.getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate) - /* @__PURE__ */ new Date();
    const days = Math.ceil(diff / (1e3 * 60 * 60 * 24));
    return days;
  };
  window.showLocationDetails = (fullLoc) => {
    if (!fullLoc) return;
    const title = window.formatLocationLabel(fullLoc);
    document.getElementById("loc-modal-title").innerText = title || "Location";
    document.getElementById("loc-modal-address").innerText = fullLoc;
    document.getElementById("location-modal").classList.remove("hidden");
    if (window.lucide) lucide.createIcons();
  };
  window.checkExpirations = async () => {
    if (!state.students || state.students.length === 0) return;
    const now = /* @__PURE__ */ new Date();
    let updatedCount = 0;
    for (let s of state.students) {
      let changed = false;
      if (Array.isArray(s.active_packs) && s.active_packs.length > 0) {
        const activeOnly = s.active_packs.filter((p) => new Date(p.expires_at) > now);
        const hasUnlimited = activeOnly.some((p) => p.count == null || p.count === "null");
        const activeBalance = hasUnlimited ? null : activeOnly.reduce((sum, p) => sum + (parseInt(p.count) || 0), 0);
        if (s.balance !== activeBalance) {
          s.balance = activeBalance;
          changed = true;
        }
        if (activeOnly.length === 0 && s.paid) {
          s.package = null;
          s.paid = false;
          s.package_expires_at = null;
          changed = true;
        } else if (activeOnly.length > 0) {
          const nextExp = activeOnly.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at))[0].expires_at;
          if (s.package_expires_at !== nextExp) {
            s.package_expires_at = nextExp;
            changed = true;
          }
        }
      } else if (s.package_expires_at && s.balance > 0) {
        const expiry = new Date(s.package_expires_at);
        if (now > expiry) {
          s.balance = 0;
          s.paid = false;
          s.package = null;
          s.package_expires_at = null;
          changed = true;
        }
      }
      if (changed) {
        if (supabaseClient) {
          await supabaseClient.from("students").update({
            balance: s.balance,
            paid: s.paid,
            package: s.package,
            package_expires_at: s.package_expires_at,
            active_packs: s.active_packs
          }).eq("id", s.id);
        }
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      saveState();
    }
  };
  window.toggleCustomDropdown = (id) => {
    const list = document.getElementById(`dropdown-list-${id}`);
    const isOpen = list.classList.contains("open");
    document.querySelectorAll(".custom-dropdown-list").forEach((el) => el.classList.remove("open"));
    if (!isOpen) {
      list.classList.add("open");
    }
  };
  window.scheduleTimeBlurSave = (classId, inputEl) => {
    if (inputEl._timeBlurT) clearTimeout(inputEl._timeBlurT);
    inputEl._timeBlurT = setTimeout(() => {
      inputEl._timeBlurT = null;
      if (inputEl.value && document.activeElement !== inputEl) updateClass(classId, "time", inputEl.value);
    }, 400);
  };
  window.scheduleEndTimeBlurSave = (classId, inputEl) => {
    if (inputEl._timeBlurT) clearTimeout(inputEl._timeBlurT);
    inputEl._timeBlurT = setTimeout(() => {
      inputEl._timeBlurT = null;
      if (document.activeElement !== inputEl) updateClass(classId, "end_time", inputEl.value || "");
    }, 400);
  };
  window.cancelTimeBlurSave = (inputEl) => {
    if (inputEl._timeBlurT) {
      clearTimeout(inputEl._timeBlurT);
      inputEl._timeBlurT = null;
    }
  };
  window.selectCustomOption = async (classId, field, value) => {
    document.querySelectorAll(".custom-dropdown-list").forEach((el) => el.classList.remove("open"));
    await window.updateClass(classId, field, value);
  };
  window.signUpStudent = async () => {
    const t2 = new Proxy(window.t, { get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop] });
    const name = document.getElementById("auth-name").value.trim();
    const emailEl = document.getElementById("auth-email");
    const email = emailEl ? emailEl.value.trim().toLowerCase() : "";
    const phone = document.getElementById("auth-phone").value.trim();
    const pass = document.getElementById("auth-pass").value.trim();
    const passConfirmEl = document.getElementById("auth-pass-confirm");
    const passConfirm = passConfirmEl ? passConfirmEl.value.trim() : "";
    if (!name || !email || !pass || !phone) {
      alert(t2("signup_require_fields"));
      return;
    }
    if (pass !== passConfirm) {
      alert(t2("signup_passwords_dont_match"));
      return;
    }
    const newStudent = {
      id: "STUD-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
      name,
      email: email || null,
      phone,
      paid: false,
      package: null,
      balance: 0,
      school_id: state.currentSchool.id,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    let studentCreated = false;
    if (supabaseClient) {
      try {
        const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
          email,
          password: pass
        });
        if (signUpError) {
          if (signUpError.message && (signUpError.message.includes("already registered") || signUpError.message.includes("already exists"))) {
            alert(t2("email_already_registered"));
            return;
          }
          alert("Error creating account: " + (signUpError.message || "Try again."));
          return;
        }
        if (signUpData?.user) {
          const authUser = signUpData.user;
          if (signUpData.session) {
            await supabaseClient.auth.setSession({
              access_token: signUpData.session.access_token,
              refresh_token: signUpData.session.refresh_token
            });
          } else {
            const { error: signInErr } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
            if (signInErr) console.warn("No session after signUp; signIn failed:", signInErr?.message);
          }
          const { data: authRpcRow, error: authRpcError } = await supabaseClient.rpc("create_student_with_auth", {
            p_user_id: authUser.id,
            p_name: name,
            p_email: email || null,
            p_phone: phone || null,
            p_password: pass,
            p_school_id: state.currentSchool.id
          });
          if (!authRpcError && authRpcRow) {
            const created = typeof authRpcRow === "object" ? authRpcRow : typeof authRpcRow === "string" ? JSON.parse(authRpcRow) : null;
            if (created) {
              newStudent.id = created.id;
              newStudent.email = created.email ?? email;
              newStudent.user_id = created.user_id;
              studentCreated = true;
            }
          }
          if (!studentCreated) {
            const studentToInsert = { ...newStudent, user_id: authUser.id };
            const { error: insertError } = await supabaseClient.from("students").insert([studentToInsert]);
            if (!insertError) studentCreated = true;
          }
        }
        if (!studentCreated) {
          const { data: rpcRow, error: rpcError } = await supabaseClient.rpc("create_student_legacy", {
            p_name: name,
            p_email: email || null,
            p_phone: phone || null,
            p_password: pass,
            p_school_id: state.currentSchool.id
          });
          if (!rpcError && rpcRow) {
            const created = typeof rpcRow === "object" ? rpcRow : typeof rpcRow === "string" ? JSON.parse(rpcRow) : null;
            if (created) {
              newStudent.id = created.id;
              newStudent.email = created.email ?? email;
              studentCreated = true;
            }
          }
        }
        if (!studentCreated) {
          alert("Error creating profile. Try again.");
          return;
        }
      } catch (e) {
        try {
          const { data: rpcRow, error: rpcError } = await supabaseClient.rpc("create_student_legacy", {
            p_name: name,
            p_email: email || null,
            p_phone: phone || null,
            p_password: pass,
            p_school_id: state.currentSchool.id
          });
          if (!rpcError && rpcRow) {
            const created = typeof rpcRow === "object" ? rpcRow : typeof rpcRow === "string" ? JSON.parse(rpcRow) : null;
            if (created) {
              newStudent.id = created.id;
              newStudent.email = created.email ?? email;
              studentCreated = true;
            }
          }
        } catch (_) {
        }
        if (!studentCreated) {
          alert("Unexpected signup error: " + (e.message || "Try again."));
          return;
        }
      }
    } else {
      state.students.push(newStudent);
      studentCreated = true;
    }
    state.currentUser = { ...newStudent, role: "student" };
    state.isAdmin = false;
    state.currentSchool = state.schools.find((s) => s.id === newStudent.school_id) || state.currentSchool;
    state.currentView = "qr";
    clearSchoolData();
    window.resetFetchThrottle();
    setSessionIdentity();
    saveState();
    fetchAllData();
  };
  window.loginStudent = async () => {
    const emailEl = document.getElementById("auth-email");
    const email = emailEl ? emailEl.value.trim().toLowerCase() : "";
    const passInput = document.getElementById("auth-pass").value.trim();
    const t2 = new Proxy(window.t, {
      get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
    });
    let student;
    let authSucceeded = false;
    let enrollError = null;
    if (supabaseClient && email && passInput) {
      try {
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
          email,
          password: passInput
        });
        if (!authError && authData?.user) {
          authSucceeded = true;
          const uid = authData.user.id;
          const { data: enrollRows } = await supabaseClient.rpc("get_student_by_user_id", {
            p_user_id: uid,
            p_school_id: state.currentSchool.id
          });
          if (enrollRows && Array.isArray(enrollRows) && enrollRows.length > 0) {
            student = enrollRows[0];
          } else {
            const { data: enrolled, error: enrollErr } = await supabaseClient.rpc("auto_enroll_student", {
              p_user_id: uid,
              p_school_id: state.currentSchool.id
            });
            if (enrollErr) {
              enrollError = enrollErr.message || enrollErr.code || String(enrollErr);
              console.warn("auto_enroll_student error:", enrollError);
            } else if (enrolled != null) {
              const raw = Array.isArray(enrolled) ? enrolled[0] : enrolled;
              student = typeof raw === "object" && raw !== null && raw.id ? raw : typeof raw === "string" ? (() => {
                try {
                  return JSON.parse(raw);
                } catch (_) {
                  return null;
                }
              })() : null;
            }
          }
        }
      } catch (e) {
        console.warn("Student login error:", e);
      }
    }
    if (student) {
      state.currentUser = { ...student, role: "student" };
      state.isAdmin = false;
      state.currentView = "qr";
      clearSchoolData();
      window.resetFetchThrottle();
      setSessionIdentity();
      saveState();
      renderView();
      await fetchAllData();
    } else {
      if (authSucceeded && enrollError) {
        alert((t2("could_not_add_to_school") || "Could not add you to this school.") + " " + (enrollError || ""));
      } else {
        alert(t2("invalid_login"));
      }
    }
  };
  window.deleteStudent = async (id) => {
    const t2 = new Proxy(window.t, {
      get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
    });
    if (confirm(t2("delete_student_confirm"))) {
      if (supabaseClient) {
        const { error } = await supabaseClient.from("students").delete().eq("id", id);
        if (error) {
          alert("Error deleting: " + error.message);
          return;
        }
      }
      state.students = state.students.filter((s) => s.id !== id);
      saveState();
      renderView();
    }
  };
  window.loginAdminWithCreds = async () => {
    const emailRaw = document.getElementById("admin-user-input").value.trim();
    const email = emailRaw ? emailRaw.toLowerCase() : "";
    const pass = document.getElementById("admin-pass-input").value.trim();
    const t2 = new Proxy(window.t, {
      get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
    });
    const schoolId = state.currentSchool?.id;
    let adminRow = null;
    if (supabaseClient && schoolId) {
      try {
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
          email,
          password: pass
        });
        if (!authError && authData?.user) {
          const { data: rowByUser, error: errUser } = await supabaseClient.from("admins").select("*").eq("user_id", authData.user.id).eq("school_id", schoolId).single();
          if (!errUser && rowByUser) adminRow = rowByUser;
          if (!adminRow) {
            const { data: rowByEmail, error: errEmail } = await supabaseClient.from("admins").select("*").eq("school_id", schoolId).ilike("email", email).single();
            if (!errEmail && rowByEmail) adminRow = rowByEmail;
          }
          if (adminRow && !adminRow.user_id) {
            await supabaseClient.rpc("link_admin_auth", { p_school_id: schoolId });
            adminRow = { ...adminRow, user_id: authData.user.id };
          }
        } else {
          const { data: emailRows, error: rpcError } = await supabaseClient.rpc("get_admin_by_email_credentials", {
            p_email: email,
            p_password: pass,
            p_school_id: schoolId
          });
          if (!rpcError && Array.isArray(emailRows) && emailRows.length > 0) {
            adminRow = emailRows[0];
            const { error: signUpErr, data: signUpData } = await supabaseClient.auth.signUp({ email, password: pass });
            if (!signUpErr && signUpData?.user) {
              const hasIdentity = Array.isArray(signUpData.user.identities) && signUpData.user.identities.length > 0;
              if (hasIdentity) {
                await supabaseClient.rpc("link_admin_auth", { p_school_id: schoolId });
              } else {
                const { error: signInAgain } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
                if (!signInAgain) {
                  await supabaseClient.rpc("link_admin_auth", { p_school_id: schoolId });
                } else {
                  console.warn("Admin Auth: credentials valid but Auth sign-in failed:", signInAgain?.message);
                }
              }
            } else if (signUpErr && signUpErr.message && (signUpErr.message.includes("already registered") || signUpErr.message.includes("already been registered"))) {
              const { error: signInAgain } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
              if (!signInAgain) {
                await supabaseClient.rpc("link_admin_auth", { p_school_id: schoolId });
              } else {
                console.warn("Admin Auth: credentials valid but Auth sign-in failed:", signInAgain?.message);
              }
            } else if (signUpErr) {
              console.warn("Admin Auth signUp failed:", signUpErr?.message);
            }
          }
        }
      } catch (e) {
        console.warn("Admin login error:", e);
      }
    }
    if (adminRow) {
      state._adminLoginLegacyOkAuthFailed = false;
      state.currentUser = {
        name: adminRow.username + " (Admin)",
        role: "admin"
      };
      state.isAdmin = true;
      state.currentView = state._discoveryOnlyEdit ? "discovery-profile-only" : "admin-students";
      setSessionIdentity();
      saveState();
      renderView();
      await fetchAllData();
      if (state._discoveryOnlyEdit) renderView();
      const adminEmail = adminRow.email || "";
      const isPlaceholder = !adminEmail || adminEmail.endsWith("@temp.bailadmin.local") || adminEmail.endsWith("@admins.bailadmin.local");
      if (isPlaceholder) {
        window._showAdminEmailModal();
      }
    } else {
      if (state._adminAccountNeedsActivation) {
        alert(t2("admin_account_needs_activation") || 'Your admin account was just created but the login service requires email confirmation. Ask your platform administrator to turn off "Confirm email" in Supabase: Authentication > Providers > Email. Then try logging in again.');
        state._adminAccountNeedsActivation = false;
      } else if (state._adminLoginLegacyOkAuthFailed) {
        alert(t2("admin_password_sync_hint") || "Your password is correct for this school, but the login service could not accept it. If you recently changed your password in Settings, try logging in with your previous (old) password. Once in, go to Settings and change the password again.");
        state._adminLoginLegacyOkAuthFailed = false;
      } else {
        alert(t2("invalid_login"));
      }
    }
  };
  window._showAdminEmailModal = () => {
    const t2 = window.t;
    const modal = document.getElementById("admin-email-modal");
    if (!modal) return;
    const titleEl = document.getElementById("admin-email-modal-title");
    const msgEl = document.getElementById("admin-email-modal-msg");
    const laterBtn = document.getElementById("admin-email-later-btn");
    const saveBtn = document.getElementById("admin-email-save-btn");
    const inputEl = document.getElementById("admin-email-input");
    const errEl = document.getElementById("admin-email-error");
    if (titleEl) titleEl.textContent = t2("admin_email_modal_title") || "Add your email";
    if (msgEl) msgEl.textContent = t2("admin_email_modal_msg") || "For password reset and account security, please add your real email address.";
    if (laterBtn) laterBtn.textContent = t2("admin_email_later") || "Later";
    if (saveBtn) saveBtn.textContent = t2("admin_email_save") || "Save";
    if (inputEl) inputEl.value = "";
    if (errEl) {
      errEl.style.display = "none";
      errEl.textContent = "";
    }
    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
    if (inputEl) setTimeout(() => inputEl.focus(), 200);
  };
  window.dismissAdminEmailModal = () => {
    const modal = document.getElementById("admin-email-modal");
    if (modal) modal.classList.add("hidden");
  };
  window.saveAdminEmail = async () => {
    const t2 = window.t;
    const inputEl = document.getElementById("admin-email-input");
    const errEl = document.getElementById("admin-email-error");
    const saveBtn = document.getElementById("admin-email-save-btn");
    const email = (inputEl?.value || "").trim().toLowerCase();
    if (errEl) {
      errEl.style.display = "none";
      errEl.textContent = "";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      if (errEl) {
        errEl.textContent = t2("admin_email_invalid") || "Please enter a valid email address.";
        errEl.style.display = "block";
      }
      return;
    }
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.style.opacity = "0.7";
    }
    try {
      const { error } = await supabaseClient.rpc("admin_set_email", { p_email: email });
      if (error) {
        if (errEl) {
          errEl.textContent = error.message || "Error saving email.";
          errEl.style.display = "block";
        }
        return;
      }
      const { error: authErr } = await supabaseClient.auth.updateUser({ email });
      if (authErr) console.warn("Auth email update failed (DB updated):", authErr.message);
      const modal = document.getElementById("admin-email-modal");
      if (modal) modal.classList.add("hidden");
      alert(t2("admin_email_saved") || "Email saved!");
    } catch (e) {
      if (errEl) {
        errEl.textContent = e.message || "Error saving email.";
        errEl.style.display = "block";
      }
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.style.opacity = "";
      }
    }
  };
  window.promptDevLogin = () => {
    document.getElementById("dev-user-input").value = "";
    document.getElementById("dev-pass-input").value = "";
    document.getElementById("dev-login-modal").classList.remove("hidden");
    document.getElementById("dev-user-input").focus();
  };
  window.submitDevLogin = () => {
    const user = document.getElementById("dev-user-input").value;
    const pass = document.getElementById("dev-pass-input").value;
    if (user && pass) {
      document.getElementById("dev-login-modal").classList.add("hidden");
      window.loginDeveloper(user, pass);
    } else {
      alert("Please enter both username and password.");
    }
  };
  window.linkPlatformAdminAccount = async () => {
    const passEl = document.getElementById("platform-link-password");
    const password = passEl && passEl.value || "";
    const platformUsername = state.currentUser && state.currentUser.name ? state.currentUser.name.replace(/\s*\(Dev\)\s*$/i, "").trim() : "";
    if (!password) {
      alert("Please enter your current Dev password.");
      return;
    }
    if (!platformUsername) {
      alert("Could not detect platform admin username.");
      return;
    }
    if (!supabaseClient) {
      alert("Database connection not initialized.");
      return;
    }
    const pseudoEmail = `${String(platformUsername).replace(/\s+/g, "_").toLowerCase()}@platform.bailadmin.local`;
    try {
      let { error: signInErr } = await supabaseClient.auth.signInWithPassword({ email: pseudoEmail, password });
      if (signInErr) {
        const { error: signUpErr } = await supabaseClient.auth.signUp({ email: pseudoEmail, password });
        if (signUpErr && !String(signUpErr.message || "").match(/already registered|already exists/i)) {
          alert("Could not create login: " + (signUpErr.message || ""));
          return;
        }
        if (signUpErr && String(signUpErr.message || "").match(/already registered|already exists/i)) {
          signInErr = (await supabaseClient.auth.signInWithPassword({ email: pseudoEmail, password })).error;
        } else {
          signInErr = signUpErr;
        }
      }
      if (signInErr) {
        alert("Password did not match. Use the exact same password you used to log in here (" + platformUsername + ").");
        return;
      }
      const { data: linked, error: rpcErr } = await supabaseClient.rpc("link_platform_admin_auth", { p_username: platformUsername, p_password: password });
      if (rpcErr || !linked) {
        alert("Password did not match the one in the database. Use the exact same password for " + platformUsername + ".");
        return;
      }
      state.platformAdminLinked = true;
      if (passEl) passEl.value = "";
      alert('Done! You can now always sign in with "' + platformUsername + '" and your password (no email needed).');
      await fetchPlatformData();
      renderView();
    } catch (e) {
      console.error("Link platform admin:", e);
      alert("Error: " + (e.message || "Could not enable username login."));
    }
  };
  window.loginDeveloper = async (user, pass) => {
    if (!supabaseClient) {
      alert("Database connection not initialized.");
      return;
    }
    state.currentView = "platform-dev-dashboard";
    state.loading = true;
    renderView();
    const looksLikeEmail = typeof user === "string" && user.includes("@");
    if (looksLikeEmail) {
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: user,
        password: pass
      });
      if (!authError && authData?.user) {
        state.isPlatformDev = true;
        state.currentUser = { name: authData.user.email + " (Dev)", role: "platform-dev" };
        state.currentView = "platform-dev-dashboard";
        setSessionIdentity();
        saveState();
        renderView();
        document.getElementById("dev-login-modal").classList.add("hidden");
        await fetchPlatformData();
        state.loading = false;
        renderView();
        return;
      }
      if (authError) {
        state.currentView = "school-selection";
        state.loading = false;
        renderView();
        alert("That email isn't linked to a Dev account. Use your username (e.g. Omid7991) and password instead.");
        return;
      }
    }
    const { data: legacyRows, error: rpcError } = await supabaseClient.rpc("get_platform_admin_by_credentials", {
      p_username: user,
      p_password: pass
    });
    if (!rpcError && Array.isArray(legacyRows) && legacyRows.length > 0) {
      const platformUsername = legacyRows[0].username || user;
      const pseudoEmail = `${String(platformUsername).replace(/\s+/g, "_").toLowerCase()}@platform.bailadmin.local`;
      const errMsg = (e) => e && e.message ? String(e.message) : "";
      try {
        let { error: signInErr } = await supabaseClient.auth.signInWithPassword({ email: pseudoEmail, password: pass });
        const isInvalidCreds = signInErr && (errMsg(signInErr).toLowerCase().includes("invalid") || errMsg(signInErr).includes("Invalid login"));
        if (signInErr && isInvalidCreds) {
          const { error: signUpErr } = await supabaseClient.auth.signUp({ email: pseudoEmail, password: pass });
          if (signUpErr && (errMsg(signUpErr).includes("already registered") || errMsg(signUpErr).includes("already exists"))) {
            signInErr = (await supabaseClient.auth.signInWithPassword({ email: pseudoEmail, password: pass })).error;
          } else {
            signInErr = signUpErr;
          }
        }
        if (!signInErr) await supabaseClient.rpc("link_platform_admin_auth", { p_username: platformUsername, p_password: pass });
      } catch (e) {
        console.warn("Platform dev Auth link:", e);
      }
      const { data: sessionData } = await supabaseClient.auth.getSession();
      if (!sessionData?.session?.user) {
        state.currentView = "school-selection";
        state.loading = false;
        renderView();
        alert(`Your username and password are correct, but we couldn't sign you in to the backend (create/delete schools need that).

Use one of these:
\u2022 Log in with the **email + password** you used in "Link account" (e.g. omid@bailadmin.lat).
\u2022 Or use the "Link account" card on the dashboard to link this user to a new email and password.`);
        return;
      }
      state.isPlatformDev = true;
      state.currentUser = { name: platformUsername + " (Dev)", role: "platform-dev" };
      state.currentView = "platform-dev-dashboard";
      setSessionIdentity();
      saveState();
      renderView();
      document.getElementById("dev-login-modal").classList.add("hidden");
      await fetchPlatformData();
      state.loading = false;
      renderView();
      return;
    }
    state.currentView = "school-selection";
    state.loading = false;
    renderView();
    alert("Invalid Developer credentials.");
  };
  window.toggleSchoolActive = async (schoolId, currentlyActive) => {
    if (!supabaseClient) return;
    const t2 = typeof window.t === "function" ? window.t : (key) => (DANCE_LOCALES[state.language] || DANCE_LOCALES.en)[key] || key;
    const { error } = await supabaseClient.rpc("school_set_active", { p_school_id: schoolId, p_active: !currentlyActive });
    if (error) {
      alert(t2("error_generic") || "Error: " + (error.message || "Could not update school."));
      return;
    }
    await fetchPlatformData();
    renderView();
  };
  window.toggleSchoolDiscoveryVisible = async (schoolId, currentlyVisible) => {
    if (!supabaseClient) return;
    const t2 = typeof window.t === "function" ? window.t : (key) => (DANCE_LOCALES[state.language] || DANCE_LOCALES.en)[key] || key;
    const { error } = await supabaseClient.rpc("school_set_discovery_visible", { p_school_id: schoolId, p_visible: !currentlyVisible });
    if (error) {
      alert(t2("error_generic") || "Error: " + (error.message || "Could not update school."));
      return;
    }
    await fetchPlatformData();
    renderView();
  };
  window.saveSchoolInfoByPlatform = async (schoolId, btn) => {
    const t2 = typeof window.t === "function" ? window.t : (key) => (DANCE_LOCALES[state.language] || DANCE_LOCALES.en)[key] || key;
    if (!supabaseClient) {
      alert(t2("error_generic") || "No database connection");
      return;
    }
    const originalHtml = btn ? btn.innerHTML : null;
    if (btn) {
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.8";
      btn.innerHTML = '<i data-lucide="loader-2" class="spin" size="18" style="margin-right: 8px;"></i> ' + (t2("saving_label") || "Saving\u2026");
      if (window.lucide) window.lucide.createIcons();
    }
    try {
      const nameEl = document.getElementById("dev-edit-school-name");
      const addressEl = document.getElementById("dev-edit-school-address");
      const name = (nameEl?.value ?? "").trim() || null;
      const address = (addressEl?.value ?? "").trim();
      const { data, error } = await supabaseClient.rpc("school_update_info_by_platform", {
        p_school_id: schoolId,
        p_name: name,
        p_address: address || null
      });
      if (error) {
        alert(t2("error_generic") || "Error: " + (error.message || "Could not update school."));
        return;
      }
      const updated = data && typeof data === "object" ? data : data ? JSON.parse(data) : null;
      if (updated && state.platformData?.schools) {
        state.platformData.schools = state.platformData.schools.map((s) => s.id === schoolId ? { ...s, ...updated } : s);
      }
      if (state.currentSchool?.id === schoolId && updated) {
        state.currentSchool = { ...state.currentSchool, ...updated };
      }
      if (btn) {
        btn.innerHTML = '<i data-lucide="check" size="18" style="margin-right: 8px;"></i> ' + (t2("saved_success_msg") || "Saved!");
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
          if (btn && originalHtml) {
            btn.innerHTML = originalHtml;
            btn.style.pointerEvents = "";
            btn.style.opacity = "";
            if (window.lucide) window.lucide.createIcons();
          }
        }, 2e3);
      }
      state.currentView = state._devEditSchoolReturnView || "platform-dev-dashboard";
      state.selectedDevSchoolId = state._devEditSchoolReturnSchoolId || schoolId;
      renderView();
    } finally {
      if (btn && !btn.innerHTML.includes("check")) {
        btn.style.pointerEvents = "";
        btn.style.opacity = "";
        if (originalHtml) btn.innerHTML = originalHtml;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  };
  window.renameSchool = async (schoolId) => {
    const t2 = typeof window.t === "function" ? window.t : (key) => (DANCE_LOCALES[state.language] || DANCE_LOCALES.en)[key] || key;
    const schools = state.platformData?.schools || state.schools || [];
    const school = schools.find((s) => s.id === schoolId);
    if (!school) return;
    const newName = prompt(t2("rename_school_prompt") || t2("enter_school_name"), school.name || "");
    if (newName == null || !newName.trim()) return;
    if (!supabaseClient) {
      alert("No database connection");
      return;
    }
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData?.session?.user) {
      alert("Your Dev session is missing or expired. Log out and log in again with your Dev credentials.");
      return;
    }
    const { data, error } = await supabaseClient.rpc("school_update_by_platform", { p_school_id: schoolId, p_name: newName.trim() });
    if (error) {
      alert("Error: " + (error.message || "Could not update school name"));
      return;
    }
    const updated = data && (typeof data === "object" ? data : JSON.parse(data));
    if (state.platformData?.schools) {
      state.platformData.schools = state.platformData.schools.map((s) => s.id === schoolId ? { ...s, name: updated?.name || newName } : s);
    }
    if (state.schools) {
      state.schools = state.schools.map((s) => s.id === schoolId ? { ...s, name: updated?.name || newName } : s);
    }
    if (state.currentSchool?.id === schoolId) {
      state.currentSchool = { ...state.currentSchool, name: updated?.name || newName };
    }
    alert(t2("rename_school_success") || "School name updated.");
    renderView();
  };
  window.toggleSchoolCurrency = async (schoolId, currency) => {
    if (!supabaseClient) {
      alert("No database connection");
      return;
    }
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData?.session?.user) {
      alert("Your Dev session is missing or expired. Log in again with your Dev credentials.");
      return;
    }
    const { data, error } = await supabaseClient.rpc("school_update_currency_by_platform", { p_school_id: schoolId, p_currency: currency });
    if (error) {
      alert("Error: " + (error.message || "Could not update currency"));
      return;
    }
    const updated = data && (typeof data === "object" ? data : JSON.parse(data));
    if (state.platformData?.schools) {
      state.platformData.schools = state.platformData.schools.map((s) => s.id === schoolId ? { ...s, currency } : s);
    }
    if (state.schools) {
      state.schools = state.schools.map((s) => s.id === schoolId ? { ...s, currency } : s);
    }
    if (state.currentSchool?.id === schoolId) {
      state.currentSchool = { ...state.currentSchool, currency };
    }
    renderView();
  };
  window.toggleSchoolJackAndJill = async (schoolId, enabled) => {
    if (!supabaseClient) {
      alert("No database connection");
      return;
    }
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData?.session?.user) {
      alert("Your Dev session is missing or expired. Log in again with your Dev credentials.");
      return;
    }
    const { data, error } = await supabaseClient.rpc("school_update_jack_and_jill_enabled", { p_school_id: schoolId, p_enabled: !!enabled });
    if (error) {
      alert("Error: " + (error.message || "Could not update feature"));
      return;
    }
    const updated = data && (typeof data === "object" ? data : JSON.parse(data));
    if (state.platformData?.schools) {
      state.platformData.schools = state.platformData.schools.map((s) => s.id === schoolId ? { ...s, jack_and_jill_enabled: !!enabled } : s);
    }
    if (state.schools) {
      state.schools = state.schools.map((s) => s.id === schoolId ? { ...s, jack_and_jill_enabled: !!enabled } : s);
    }
    if (state.currentSchool?.id === schoolId) {
      state.currentSchool = { ...state.currentSchool, jack_and_jill_enabled: !!enabled };
    }
    renderView();
  };
  window.toggleSchoolEventsPackagesEnabled = async (schoolId, enabled) => {
    if (!supabaseClient) {
      alert("No database connection");
      return;
    }
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData?.session?.user) {
      alert("Your Dev session is missing or expired. Log in again with your Dev credentials.");
      return;
    }
    const { data, error } = await supabaseClient.rpc("school_update_events_packages_enabled", { p_school_id: schoolId, p_enabled: !!enabled });
    if (error) {
      alert("Error: " + (error.message || "Could not update feature"));
      return;
    }
    if (state.platformData?.schools) {
      state.platformData.schools = state.platformData.schools.map((s) => s.id === schoolId ? { ...s, events_packages_enabled: !!enabled } : s);
    }
    if (state.schools) {
      state.schools = state.schools.map((s) => s.id === schoolId ? { ...s, events_packages_enabled: !!enabled } : s);
    }
    if (state.currentSchool?.id === schoolId) {
      state.currentSchool = { ...state.currentSchool, events_packages_enabled: !!enabled };
    }
    renderView();
  };
  window.toggleSchoolPrivatePackagesEnabled = async (schoolId, enabled) => {
    if (!supabaseClient) {
      alert("No database connection");
      return;
    }
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData?.session?.user) {
      alert("Your Dev session is missing or expired. Log in again with your Dev credentials.");
      return;
    }
    const { data, error } = await supabaseClient.rpc("school_update_private_packages_enabled", { p_school_id: schoolId, p_enabled: !!enabled });
    if (error) {
      alert("Error: " + (error.message || "Could not update feature"));
      return;
    }
    if (state.platformData?.schools) {
      state.platformData.schools = state.platformData.schools.map((s) => s.id === schoolId ? { ...s, private_packages_enabled: !!enabled } : s);
    }
    if (state.schools) {
      state.schools = state.schools.map((s) => s.id === schoolId ? { ...s, private_packages_enabled: !!enabled } : s);
    }
    if (state.currentSchool?.id === schoolId) {
      state.currentSchool = { ...state.currentSchool, private_packages_enabled: !!enabled };
    }
    renderView();
  };
  window.toggleSchoolMonthlyRegistration = async (schoolId, enabled) => {
    if (!supabaseClient) {
      alert("No database connection");
      return;
    }
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData?.session?.user) {
      alert("Your Dev session is missing or expired. Log in again with your Dev credentials.");
      return;
    }
    const { data, error } = await supabaseClient.rpc("school_update_monthly_registration_enabled", { p_school_id: schoolId, p_enabled: !!enabled });
    if (error) {
      alert("Error: " + (error.message || "Could not update feature"));
      return;
    }
    if (state.platformData?.schools) {
      state.platformData.schools = state.platformData.schools.map((s) => s.id === schoolId ? { ...s, monthly_registration_enabled: !!enabled } : s);
    }
    if (state.schools) {
      state.schools = state.schools.map((s) => s.id === schoolId ? { ...s, monthly_registration_enabled: !!enabled } : s);
    }
    if (state.currentSchool?.id === schoolId) {
      state.currentSchool = { ...state.currentSchool, monthly_registration_enabled: !!enabled };
    }
    renderView();
  };
  window.deleteSchool = async (schoolId, schoolNameParam) => {
    const t2 = DANCE_LOCALES[state.language] || DANCE_LOCALES.en;
    const schools = state.platformData?.schools || state.schools || [];
    const school = schools.find((s) => s.id === schoolId);
    const schoolName = schoolNameParam != null ? String(schoolNameParam) : school?.name || schoolId;
    if (!confirm(`${t2.delete_school_confirm}

School: ${schoolName}`)) return;
    try {
      if (!supabaseClient) {
        alert("No database connection");
        return;
      }
      const { data: sessionData } = await supabaseClient.auth.getSession();
      if (!sessionData?.session?.user) {
        alert('Your Dev session is missing or expired. Log out and log in again with your Dev credentials (username + password, or the email + password you used in "Link account") so you have permission to delete schools.');
        return;
      }
      const { data: rpcResult, error } = await supabaseClient.rpc("school_delete_by_platform", { p_school_id: schoolId });
      const deletedRows = rpcResult?.deleted ? [{ id: schoolId }] : [];
      if (error) {
        const msg = error.message || "";
        if (msg.includes("Permission denied") && msg.includes("platform admin")) {
          alert('Permission denied. Your platform admin account is not linked to this session.\n\n1. Use the "Enable username login" card on this dashboard to enter your password and link.\n2. Or log out and log in again with your username and password.');
        } else {
          alert(`Error deleting school: ${msg}`);
        }
      } else if (!deletedRows || deletedRows.length === 0) {
        alert('Permission denied. Your platform admin account is not linked to this session.\n\n1. Use the "Enable username login" card on this dashboard to enter your password and link.\n2. Or log out and log in again with your username and password.');
      } else {
        alert(t2.delete_school_success);
        await fetchPlatformData();
        renderView();
      }
    } catch (err) {
      console.error("Deletion failed:", err);
      alert(`Deletion failed: ${err.message}`);
    }
  };
  window.setDiscoveryEnabled = async (enabled) => {
    if (!supabaseClient || !state.isPlatformDev) return;
    const { error } = await supabaseClient.rpc("platform_setting_set", { p_key: "discovery_enabled", p_value: enabled });
    if (error) {
      alert(error.message || "Failed to update");
      return;
    }
    state.platformData.discoveryEnabled = !!enabled;
    renderView();
  };
  window.createNewStudent = async () => {
    const t2 = new Proxy(window.t, {
      get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
    });
    const name = prompt(t2("enter_student_name"));
    const phone = prompt(t2("enter_student_phone"));
    const email = prompt(t2("enter_student_email") || "Student email (optional):");
    const pass = prompt(t2("enter_student_pass"));
    if (!name || !pass) return;
    if (supabaseClient) {
      const { data: rpcRow, error: rpcError } = await supabaseClient.rpc("create_student_legacy", {
        p_name: name,
        p_email: email && email.trim() || null,
        p_phone: phone && phone.trim() || null,
        p_password: pass,
        p_school_id: state.currentSchool.id
      });
      if (rpcError) {
        alert("Error: " + (rpcError.message || "Could not create student."));
        return;
      }
      const created = typeof rpcRow === "object" ? rpcRow : typeof rpcRow === "string" ? JSON.parse(rpcRow) : null;
      if (created) {
        state.students.push(created);
        renderView();
        alert(t2("student_created"));
        return;
      }
    }
    const newStudent = {
      id: "STUD-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
      name,
      email: email && email.trim() || null,
      phone: phone && phone.trim() || null,
      password: pass,
      paid: false,
      package: null,
      balance: 0,
      school_id: state.currentSchool.id
    };
    state.students.push(newStudent);
    renderView();
    alert(t2("student_created"));
  };
  function clearSchoolData() {
    state.classes = [];
    state.subscriptions = [];
    state.students = [];
    state.currentCompetitionForStudent = null;
    state.studentCompetitionRegistration = null;
    state.paymentRequests = [];
    state.adminSettings = {};
    state.competitions = [];
    state.competitionRegistrations = [];
    state.currentCompetition = null;
    state.competitionId = null;
    state.competitionSchoolId = null;
  }
  window.clearSchoolData = clearSchoolData;
  window.logout = async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    clearSessionIdentity();
    state.currentUser = null;
    state.isAdmin = false;
    state.isPlatformDev = false;
    state.currentView = "school-selection";
    state.currentSchool = null;
    state.lastActivity = Date.now();
    clearSchoolData();
    saveState();
    window.location.replace(window.location.origin + "/");
  };
  window.selectSchool = (id) => {
    const school = state.schools.find((s) => s.id === id);
    if (school) {
      const prevSchoolId = state.currentSchool?.id;
      state.currentSchool = school;
      state.adminSettings = {};
      state.currentView = "auth";
      if (prevSchoolId !== id) {
        clearSchoolData();
        window.resetFetchThrottle();
      }
      saveState();
      renderView();
      fetchAllData();
    }
  };
  window.backToSchoolSelection = () => {
    clearSessionIdentity();
    state._discoveryOnlyEdit = false;
    state.currentSchool = null;
    state.currentUser = null;
    state.isAdmin = false;
    state.currentView = "school-selection";
    clearSchoolData();
    saveState();
    renderView();
  };
  window.toggleWeeklyPreview = () => {
    state.showWeeklyPreview = !state.showWeeklyPreview;
    renderView();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };
  window.toggleClassRegistration = async (enabled) => {
    const schoolId = state.currentSchool?.id;
    if (!schoolId || !supabaseClient) return;
    try {
      const { data, error } = await supabaseClient.rpc("toggle_class_registration_enabled", {
        p_school_id: schoolId,
        p_enabled: enabled
      });
      if (error) throw error;
      if (state.currentSchool) state.currentSchool.class_registration_enabled = enabled;
      renderView();
      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error("Error toggling class registration:", e);
      alert("Error: " + (e.message || "Could not update setting"));
      renderView();
      if (window.lucide) window.lucide.createIcons();
    }
  };
  window.createNewSchool = async () => {
    const t2 = new Proxy(window.t, {
      get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
    });
    const name = prompt(t2("enter_school_name"));
    if (!name) return;
    if (supabaseClient) {
      const { error } = await supabaseClient.from("schools").insert([{ name }]);
      if (error) {
        alert("Error: " + error.message);
        return;
      }
      alert(t2("school_created"));
      if (state.isPlatformDev) {
        await fetchPlatformData();
      } else {
        fetchAllData();
      }
    }
  };
  window.createNewSchoolWithAdmin = async () => {
    state.currentView = "platform-add-school";
    state._newProfileType = "school";
    renderView();
  };
  window.selectProfileType = (type) => {
    state._newProfileType = type;
    const schoolBtn = document.getElementById("profile-type-school");
    const teacherBtn = document.getElementById("profile-type-teacher");
    if (schoolBtn && teacherBtn) {
      schoolBtn.classList.toggle("active", type === "school");
      teacherBtn.classList.toggle("active", type === "private_teacher");
    }
  };
  window.addTeacherAvail = async () => {
    if (!supabaseClient || !state.currentSchool?.id) return;
    try {
      const { data, error } = await supabaseClient.rpc("upsert_teacher_availability", {
        p_school_id: state.currentSchool.id,
        p_day_of_week: "Mon",
        p_start_time: "09:00",
        p_end_time: "10:00"
      });
      if (error) throw error;
      await fetchAllData();
    } catch (e) {
      alert("Error adding availability: " + (e.message || e));
    }
  };
  window.updateTeacherAvail = async (id, field, value) => {
    if (!supabaseClient || !state.currentSchool?.id) return;
    const row = (state.teacherAvailability || []).find((a) => a.id === id);
    if (!row) return;
    const updated = { ...row, [field]: value };
    try {
      const { error } = await supabaseClient.rpc("upsert_teacher_availability", {
        p_school_id: state.currentSchool.id,
        p_day_of_week: updated.day_of_week,
        p_start_time: updated.start_time,
        p_end_time: updated.end_time,
        p_location: updated.location || null,
        p_id: id
      });
      if (error) throw error;
      const ddList = document.getElementById("dropdown-list-avail-" + id);
      if (ddList) ddList.classList.remove("open");
      await fetchAllData();
    } catch (e) {
      alert("Error updating availability: " + (e.message || e));
    }
  };
  window.deleteTeacherAvail = async (id) => {
    if (!supabaseClient || !state.currentSchool?.id) return;
    try {
      const { error } = await supabaseClient.rpc("delete_teacher_availability", {
        p_id: id,
        p_school_id: state.currentSchool.id
      });
      if (error) throw error;
      await fetchAllData();
    } catch (e) {
      alert("Error deleting availability: " + (e.message || e));
    }
  };
  window.loadBookingWeek = async () => {
    if (!supabaseClient || !state.currentSchool?.id) return;
    const weekStart = state._bookingWeekStart;
    if (!weekStart) return;
    state._bookingSlotsLoading = true;
    renderView();
    try {
      const { data, error } = await supabaseClient.rpc("get_available_slots_for_week", {
        p_school_id: state.currentSchool.id,
        p_week_start: weekStart
      });
      if (error) throw error;
      state._bookingWeekSlots = Array.isArray(data) ? data : typeof data === "string" ? JSON.parse(data) : [];
    } catch (e) {
      console.error("loadBookingWeek error:", e);
      state._bookingWeekSlots = [];
    }
    state._bookingSlotsLoading = false;
    state._bookingSlotsLoaded = true;
    state._bookingSlotsLoadedWeek = weekStart;
    renderView();
  };
  window.shiftBookingWeek = (direction) => {
    const current = /* @__PURE__ */ new Date((state._bookingWeekStart || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]) + "T00:00:00");
    current.setDate(current.getDate() + direction * 7);
    state._bookingWeekStart = current.toISOString().split("T")[0];
    state._bookingSelectedSlot = null;
    window.loadBookingWeek();
  };
  window.selectBookingSlot = (date, time, location) => {
    if (state._bookingSelectedSlot && state._bookingSelectedSlot.date === date && state._bookingSelectedSlot.time === time) {
      state._bookingSelectedSlot = null;
    } else {
      state._bookingSelectedSlot = { date, time, location };
    }
    renderView();
  };
  window.showBookingConfirmation = () => {
    const slot = state._bookingSelectedSlot;
    if (!slot) return;
    const t2 = DANCE_LOCALES[state.language || "en"];
    const school = state.currentSchool || {};
    const teacherName = school.name || "Teacher";
    const cheapestSub = (state.subscriptions || []).reduce((min, s) => !min || s.price && s.price < min.price ? s : min, null);
    const priceLabel = cheapestSub ? (CURRENCY_SYMBOLS[school.currency || "MXN"] || "$") + cheapestSub.price : "";
    const overlay = document.createElement("div");
    overlay.className = "teacher-booking-confirm-overlay";
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
    overlay.innerHTML = `
        <div class="teacher-booking-confirm-sheet">
            <div class="teacher-booking-confirm-title">${t2.confirm_request_title || "Confirm class request"}</div>
            <div class="teacher-booking-confirm-row"><span>${t2.teacher_label || "Teacher"}</span><strong>${teacherName}</strong></div>
            <div class="teacher-booking-confirm-row"><span>${t2.date_label || "Date"}</span><strong>${slot.date}</strong></div>
            <div class="teacher-booking-confirm-row"><span>${t2.time_label || "Time"}</span><strong>${slot.time}</strong></div>
            ${slot.location ? '<div class="teacher-booking-confirm-row"><span>' + (t2.location_label || "Location") + "</span><strong>" + slot.location + "</strong></div>" : ""}
            ${priceLabel ? '<div class="teacher-booking-confirm-row"><span>' + (t2.price_label || "Price") + "</span><strong>" + priceLabel + "</strong></div>" : ""}
            <div style="margin-top: 12px;">
                <label style="font-size: 13px; color: var(--text-secondary); display: block; margin-bottom: 6px;">${t2.message_label || "Message (optional)"}</label>
                <textarea id="booking-message" rows="2" style="width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px; background: var(--bg-body); color: var(--text-primary); font-size: 14px; outline: none; box-sizing: border-box; resize: none;" placeholder="${t2.booking_message_placeholder || "e.g. I'd like to focus on\u2026"}"></textarea>
            </div>
            <div class="teacher-booking-confirm-actions">
                <button class="teacher-booking-confirm-btn secondary" onclick="this.closest('.teacher-booking-confirm-overlay').remove()">${t2.cancel || "Cancel"}</button>
                <button class="teacher-booking-confirm-btn primary" onclick="window.submitBookingRequest(this)">${t2.send_request_btn || "Send request"}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
  };
  window.submitBookingRequest = async (btn) => {
    const slot = state._bookingSelectedSlot;
    if (!slot || !supabaseClient || !state.currentUser?.id) return;
    btn.disabled = true;
    btn.textContent = "...";
    const message = (document.getElementById("booking-message")?.value || "").trim();
    try {
      const { error } = await supabaseClient.rpc("create_private_class_request", {
        p_school_id: state.currentSchool.id,
        p_student_id: String(state.currentUser.id),
        p_requested_date: slot.date,
        p_requested_time: slot.time,
        p_location: slot.location || null,
        p_message: message || null
      });
      if (error) throw error;
      state._bookingSelectedSlot = null;
      const overlay = btn.closest(".teacher-booking-confirm-overlay");
      if (overlay) overlay.remove();
      const t2 = DANCE_LOCALES[state.language || "en"];
      window.showBookingSuccessModal(t2.request_sent_booking_title || "Request sent!", t2.request_sent_booking_msg || t2.request_sent_success || "The teacher will review it.");
      window.loadBookingWeek();
    } catch (e) {
      btn.disabled = false;
      btn.textContent = DANCE_LOCALES[state.language || "en"].send_request_btn || "Send request";
      alert("Error: " + (e.message || e));
    }
  };
  window.studentHasPackageWithSchool = (schoolId) => {
    if (!schoolId || !state.allEnrollments?.length) return false;
    const enrollment = state.allEnrollments.find((e) => e.school_id === schoolId);
    if (!enrollment) return false;
    const balance = enrollment.balance;
    if (balance === null) return true;
    if (typeof balance === "number" && balance > 0) return true;
    const packs = Array.isArray(enrollment.active_packs) ? enrollment.active_packs : [];
    const now = /* @__PURE__ */ new Date();
    return packs.some((p) => {
      const exp = p?.expires_at ? new Date(p.expires_at) : null;
      return exp && exp > now;
    });
  };
  window.fetchTeacherBookingSlots = async () => {
    if (!supabaseClient || !state.currentSchool?.id) return;
    const weekStart = state._teacherBookingWeekStart || (() => {
      const d = getTodayForMonthly();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const m = new Date(d);
      m.setDate(diff);
      return m.toISOString().slice(0, 10);
    })();
    try {
      const { data, error } = await supabaseClient.rpc("get_available_slots_for_week", {
        p_school_id: state.currentSchool.id,
        p_week_start: weekStart
      });
      if (error) throw error;
      state._teacherBookingSlots = Array.isArray(data) ? data : [];
      state._teacherBookingWeekStart = weekStart;
      state._teacherBookingLoadedWeek = weekStart;
    } catch (e) {
      console.warn("fetchTeacherBookingSlots:", e);
      state._teacherBookingSlots = [];
    }
    if (state.currentView === "teacher-booking") renderView();
  };
  window.changeTeacherBookingWeek = (delta) => {
    const cur = state._teacherBookingWeekStart || (() => {
      const d2 = getTodayForMonthly();
      const day = d2.getDay();
      const diff = d2.getDate() - day + (day === 0 ? -6 : 1);
      const m = new Date(d2);
      m.setDate(diff);
      return m.toISOString().slice(0, 10);
    })();
    const d = /* @__PURE__ */ new Date(cur + "T12:00:00");
    d.setDate(d.getDate() + 7 * delta);
    state._teacherBookingWeekStart = d.toISOString().slice(0, 10);
    state._teacherBookingSlots = [];
    state._teacherBookingLoadedWeek = null;
    renderView();
  };
  window.showTeacherBookingConfirm = (date, time, location) => {
    if (!window.studentHasPackageWithSchool(state.currentSchool?.id)) {
      const t3 = DANCE_LOCALES[state.language || "en"];
      alert(t3.need_package_to_book || "You need a package to request private classes. Visit the Shop to buy one.");
      return;
    }
    state._teacherBookingConfirm = { date, time, location };
    const overlay = document.getElementById("teacher-booking-confirm-overlay");
    const details = document.getElementById("teacher-booking-confirm-details");
    const t2 = DANCE_LOCALES[state.language || "en"];
    const school = state.currentSchool;
    const cheapestSub = (state.subscriptions || []).filter((s) => s.price != null).sort((a, b) => (a.price || 0) - (b.price || 0))[0];
    const priceStr = cheapestSub ? typeof window.formatPrice === "function" ? window.formatPrice(cheapestSub.price, school?.currency || "MXN") : cheapestSub.price : "\u2014";
    if (overlay && details) {
      details.innerHTML = `
            <div class="teacher-booking-confirm-row"><span>${t2.date_label || "Date"}</span><strong>${date}</strong></div>
            <div class="teacher-booking-confirm-row"><span>${t2.start_time_label || "Time"}</span><strong>${time}</strong></div>
            ${location ? `<div class="teacher-booking-confirm-row"><span>${t2.class_location || "Location"}</span><strong>${location}</strong></div>` : ""}
            <div class="teacher-booking-confirm-row"><span>${t2.price_label || "Price"}</span><strong>${priceStr}</strong></div>
        `;
      overlay.classList.remove("hidden");
      overlay.style.display = "flex";
      const btn = document.getElementById("teacher-booking-confirm-btn");
      if (btn) {
        btn.onclick = () => window.submitTeacherBookingRequest();
      }
    }
  };
  window.hideTeacherBookingConfirm = () => {
    state._teacherBookingConfirm = null;
    const overlay = document.getElementById("teacher-booking-confirm-overlay");
    if (overlay) {
      overlay.classList.add("hidden");
      overlay.style.display = "none";
    }
  };
  window.showBookingSuccessModal = (title, message) => {
    const t2 = DANCE_LOCALES[state.language || "en"];
    const overlay = document.createElement("div");
    overlay.className = "booking-success-overlay";
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.remove();
        if (window.lucide) window.lucide.createIcons();
      }
    };
    overlay.innerHTML = `
        <div class="booking-success-card" onclick="event.stopPropagation()">
            <div class="booking-success-icon">
                <i data-lucide="check-circle" size="36"></i>
            </div>
            <h2 class="booking-success-title">${(title || "").replace(/</g, "&lt;")}</h2>
            <p class="booking-success-message">${(message || "").replace(/</g, "&lt;")}</p>
            <button type="button" class="booking-success-btn" onclick="this.closest('.booking-success-overlay').remove(); if (window.lucide) window.lucide.createIcons();">${t2.close || "OK"}</button>
        </div>
    `;
    document.body.appendChild(overlay);
    if (window.lucide) window.lucide.createIcons();
  };
  window.submitTeacherBookingRequest = async () => {
    const c = state._teacherBookingConfirm;
    if (!c || !supabaseClient || !state.currentSchool?.id || !state.currentUser?.id) return;
    if (!window.studentHasPackageWithSchool(state.currentSchool.id)) {
      const t2 = DANCE_LOCALES[state.language || "en"];
      alert(t2.need_package_to_book || "You need a package to request private classes. Visit the Shop to buy one.");
      return;
    }
    try {
      const { error } = await supabaseClient.rpc("create_private_class_request", {
        p_school_id: state.currentSchool.id,
        p_student_id: String(state.currentUser.id),
        p_requested_date: c.date,
        p_requested_time: c.time,
        p_location: c.location || null,
        p_message: null
      });
      if (error) throw error;
      window.hideTeacherBookingConfirm();
      state._teacherBookingConfirm = null;
      const t2 = DANCE_LOCALES[state.language || "en"];
      window.showBookingSuccessModal(t2.request_sent_booking_title || "Request sent!", t2.request_sent_booking_msg || t2.request_sent || "The teacher will confirm it.");
      await window.fetchTeacherBookingSlots();
    } catch (e) {
      alert("Error: " + (e.message || e));
    }
  };
  window.respondToPrivateClassRequest = async (requestId, accept) => {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient.rpc("teacher_respond_to_request", {
        p_request_id: requestId,
        p_accept: accept
      });
      if (error) throw error;
      await fetchAllData();
    } catch (e) {
      alert("Error: " + (e.message || e));
    }
  };
  window.updateNewSchoolCityOptions = () => {
    const countrySel = document.getElementById("new-school-city");
    const countrySel2 = document.getElementById("new-school-country");
    if (!countrySel || !countrySel2) return;
    const country = (countrySel2.value || "").trim();
    const cities = DISCOVERY_COUNTRIES_CITIES[country] || [];
    countrySel.innerHTML = '<option value="">\u2014</option>' + cities.map((c) => `<option value="${String(c).replace(/"/g, "&quot;")}">${String(c).replace(/</g, "&lt;")}</option>`).join("");
  };
  window.submitNewSchoolWithAdmin = async () => {
    const schoolName = (document.getElementById("new-school-name")?.value || "").trim();
    const adminName = (document.getElementById("new-school-admin-name")?.value || "").trim();
    const adminEmail = (document.getElementById("new-school-admin-email")?.value || "").trim().toLowerCase();
    const adminPass = (document.getElementById("new-school-admin-pass")?.value || "").trim();
    if (!schoolName || !adminName || !adminEmail || !adminPass) {
      alert("Please fill in all fields (school name, admin name, admin email, password).");
      return;
    }
    if (!supabaseClient) {
      alert("Database connection not available. Refresh the page and try again.");
      return;
    }
    {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      if (!sessionData?.session?.user) {
        alert('Your Dev session is missing or expired. Log out and log in again with your Dev credentials (username + password, or the email + password you used in "Link account") so you have permission to create schools.');
        return;
      }
      state.loading = true;
      renderView();
      try {
        const slug = (document.getElementById("new-school-discovery-slug")?.value || "").trim();
        const country = (document.getElementById("new-school-country")?.value || "").trim();
        const city = (document.getElementById("new-school-city")?.value || "").trim();
        const description = (document.getElementById("new-school-discovery-description")?.value || "").trim();
        const genresStr = (document.getElementById("new-school-discovery-genres")?.value || "").trim();
        const genres = genresStr ? genresStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
        const hasDiscoveryData = slug || country || city || description || genres.length > 0;
        const profileType = state._newProfileType || "school";
        const insertPayload = { p_name: schoolName, p_profile_type: profileType };
        if (hasDiscoveryData) {
          insertPayload.p_discovery_slug = slug || null;
          insertPayload.p_country = country || null;
          insertPayload.p_city = city || null;
          insertPayload.p_discovery_description = description || null;
          insertPayload.p_discovery_genres = genres;
        }
        const { data: schoolRow, error: schoolError } = await supabaseClient.rpc("school_insert_by_platform", insertPayload);
        if (schoolError) throw schoolError;
        const schoolId = schoolRow?.id;
        if (!schoolId) throw new Error("School was not created");
        let adminUserId = null;
        let sessBefore = null;
        try {
          const res = await supabaseClient.auth.getSession();
          sessBefore = res?.data?.session;
          const tempClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
          if (tempClient) {
            const { data: signUpData, error: signUpErr } = await tempClient.auth.signUp({ email: adminEmail, password: adminPass });
            if (!signUpErr && signUpData?.user) adminUserId = signUpData.user.id;
          }
        } catch (e) {
          console.warn("Admin Auth signUp:", e);
        } finally {
          if (sessBefore) await supabaseClient.auth.setSession({ access_token: sessBefore.access_token, refresh_token: sessBefore.refresh_token });
        }
        const adminPayload = { p_school_id: schoolId, p_username: adminName, p_email: adminEmail, p_password: adminPass };
        if (adminUserId) adminPayload.p_user_id = adminUserId;
        let { error: adminError } = await supabaseClient.rpc("admin_insert_for_school_by_platform", adminPayload);
        if (adminError) {
          const res2 = await supabaseClient.rpc("admin_insert_for_school", { p_school_id: schoolId, p_username: adminName, p_email: adminEmail, p_password: adminPass, p_user_id: adminUserId });
          adminError = res2.error;
        }
        if (adminError) {
          const fallbackPayload = {
            id: "ADM-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
            username: adminName,
            email: adminEmail,
            password: adminPass,
            school_id: schoolId
          };
          if (adminUserId) fallbackPayload.user_id = adminUserId;
          const fallback = await supabaseClient.from("admins").insert([fallbackPayload]);
          if (fallback.error) throw adminError;
        }
        const { error: subError } = await supabaseClient.from("subscriptions").insert([{
          id: "S-" + Date.now(),
          name: "Clase Suelta",
          price: 150,
          limit_count: 1,
          school_id: schoolId
        }]);
        if (subError) throw subError;
        alert(`School "${schoolName}" and Admin "${adminName}" created successfully!`);
        state.currentView = "platform-dev-dashboard";
        await fetchPlatformData();
      } catch (err) {
        console.error("Creation Error:", err);
        const t2 = DANCE_LOCALES[state.language] || DANCE_LOCALES.en;
        const msg = err && (err.message || String(err));
        if (msg && msg.includes("Permission denied") && msg.includes("platform admin")) {
          alert('Permission denied. Your platform admin account is not linked to this session.\n\n1. Use the "Enable username login" card on this dashboard to enter your password and link.\n2. Or log out and log in again with your username and password.');
        } else if (msg && msg.includes("admins_username_key")) {
          alert(t2.username_exists_msg);
        } else {
          alert("Failed to create school/admin: " + (msg || "Unknown error"));
        }
        state.loading = false;
        renderView();
      } finally {
        state.loading = false;
        renderView();
      }
    }
  };
  window.activatePackage = async (studentId, packageName) => {
    const student = state.students.find((s) => s.id === studentId);
    let pkg = state.subscriptions.find((p) => p.name.trim().toLowerCase() === String(packageName).trim().toLowerCase());
    if (!pkg && packageName) {
      const numMatch = String(packageName).match(/\d+/);
      const inferredCount = numMatch ? parseInt(numMatch[0], 10) : 1;
      pkg = { name: packageName, limit_count: inferredCount, limit_count_private: 0, limit_count_events: 0, validity_days: 30 };
    }
    if (!student) {
      console.warn("activatePackage: student not found", studentId);
      return;
    }
    const isPT = state.currentSchool?.profile_type === "private_teacher";
    let incomingGroup = pkg ? parseInt(pkg.limit_count, 10) : 0;
    let incomingPrivate = pkg ? parseInt(pkg.limit_count_private, 10) : 0;
    let incomingEvents = pkg ? parseInt(pkg.limit_count_events, 10) : 0;
    if (isNaN(incomingGroup)) incomingGroup = 0;
    if (isNaN(incomingPrivate)) incomingPrivate = 0;
    if (isNaN(incomingEvents)) incomingEvents = 0;
    if (isPT) {
      incomingGroup = 0;
      if (incomingPrivate <= 0) incomingPrivate = parseInt(pkg?.limit_count, 10) || 1;
    }
    const isUnlimitedGroup = pkg && incomingGroup <= 0 && (incomingPrivate == null || incomingPrivate <= 0) && (incomingEvents == null || incomingEvents <= 0) && !isPT;
    let newBalance;
    let newBalancePrivate = (student.balance_private ?? 0) + incomingPrivate;
    let newBalanceEvents = (student.balance_events ?? 0) + incomingEvents;
    if (!pkg) {
      newBalance = student.balance ?? 0;
    } else if (isUnlimitedGroup) {
      newBalance = null;
    } else if (student.balance === null && incomingGroup > 0) {
      newBalance = incomingGroup;
    } else if (student.balance === null) {
      newBalance = null;
    } else {
      newBalance = (student.balance || 0) + incomingGroup;
    }
    let expiry;
    if (pkg && pkg.expiry_date) {
      expiry = /* @__PURE__ */ new Date(pkg.expiry_date + "T23:59:59");
    } else {
      const days = pkg && pkg.validity_days && !isNaN(parseInt(pkg.validity_days, 10)) ? parseInt(pkg.validity_days, 10) : 30;
      expiry = /* @__PURE__ */ new Date();
      expiry.setDate(expiry.getDate() + days);
    }
    const newPack = {
      id: "PACK-" + Date.now().toString(36).toUpperCase(),
      name: pkg ? pkg.name : packageName,
      count: isUnlimitedGroup ? null : incomingGroup,
      private_count: incomingPrivate,
      event_count: incomingEvents,
      expires_at: expiry.toISOString(),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const activePacks = Array.isArray(student.active_packs) ? [...student.active_packs] : [];
    if (pkg && (incomingGroup > 0 || isUnlimitedGroup || incomingPrivate > 0 || incomingEvents > 0)) activePacks.push(newPack);
    const updates = {
      package: pkg ? pkg.name : null,
      balance: newBalance,
      balance_private: newBalancePrivate,
      balance_events: newBalanceEvents,
      paid: !!pkg,
      active_packs: activePacks,
      package_expires_at: activePacks.length > 0 ? expiry.toISOString() : null
    };
    if (supabaseClient) {
      const { error: rpcError } = await supabaseClient.rpc("apply_student_package", {
        p_student_id: studentId,
        p_balance: updates.balance,
        p_active_packs: updates.active_packs,
        p_package_expires_at: updates.package_expires_at,
        p_package_name: updates.package,
        p_paid: updates.paid,
        p_balance_private: updates.balance_private ?? 0,
        p_balance_events: updates.balance_events ?? 0
      });
      if (rpcError) {
        const { error: tableError } = await supabaseClient.from("students").update(updates).eq("id", studentId);
        if (tableError) {
          console.error("Supabase update error:", tableError);
          alert("Error applying package: " + tableError.message);
          return;
        }
      }
    }
    student.package = updates.package;
    student.balance = updates.balance;
    student.balance_private = updates.balance_private ?? 0;
    student.balance_events = updates.balance_events ?? 0;
    student.paid = updates.paid;
    student.active_packs = updates.active_packs;
    student.package_expires_at = updates.package_expires_at;
    if (state.currentUser && state.currentUser.id === studentId) {
      state.currentUser = { ...state.currentUser, ...updates, role: "student" };
      saveState();
    }
  };
  window.openPaymentModal = async (subId) => {
    const sub = state.subscriptions.find((s) => s.id === subId);
    if (!sub) return;
    const t2 = new Proxy(window.t, {
      get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
    });
    const modal = document.getElementById("payment-modal");
    const content = document.getElementById("payment-modal-content");
    const needsBank = !state.adminSettings || !state.adminSettings.bank_name && !state.adminSettings.bank_cbu;
    if (needsBank && supabaseClient && state.currentSchool) {
      content.innerHTML = `<p class="text-muted">${t2("loading")}</p>`;
      modal.classList.remove("hidden");
      const { data: settingsJson } = await supabaseClient.rpc("get_school_admin_settings", { p_school_id: state.currentSchool.id });
      if (settingsJson && typeof settingsJson === "object") state.adminSettings = settingsJson;
    }
    const bankName = state.adminSettings?.bank_name || "Bank";
    const bankCbu = state.adminSettings?.bank_cbu || "N/A";
    const bankAlias = state.adminSettings?.bank_alias || "N/A";
    const bankHolder = state.adminSettings?.bank_holder || "N/A";
    content.innerHTML = `
        <div class="payment-modal-header">
            <div class="payment-modal-icon">
                <i data-lucide="credit-card" size="28"></i>
            </div>
            <h2 class="payment-modal-title">${t2("payment_instructions")}</h2>
            <div class="payment-modal-package">
                <span class="payment-modal-package-name">${sub.name}</span>
                <span class="payment-modal-package-price">${formatPrice(sub.price, state.currentSchool?.currency || "MXN")}</span>
            </div>
        </div>
        <div class="payment-modal-bank ios-list">
            <div class="ios-list-item payment-modal-bank-row">
                <span class="payment-modal-label">${t2("bank_name_label")}</span>
                <span class="payment-modal-value">${bankName}</span>
            </div>
            <div class="ios-list-item payment-modal-bank-row">
                <span class="payment-modal-label">${t2("account_number_label")}</span>
                <span class="payment-modal-value payment-modal-value-monospace">${bankCbu}</span>
            </div>
            <div class="ios-list-item payment-modal-bank-row">
                <span class="payment-modal-label">${t2("holder_name_label")}</span>
                <span class="payment-modal-value">${bankHolder}</span>
            </div>
            <div class="ios-list-item payment-modal-bank-row">
                <span class="payment-modal-label">${t2("asunto_label")}</span>
                <span class="payment-modal-value">${bankAlias}</span>
            </div>
        </div>
        <div class="payment-modal-actions">
            <button class="btn-primary w-full payment-modal-btn" onclick="submitPaymentRequest('${sub.id}', 'transfer')">
                <i data-lucide="check-circle" size="20"></i>
                ${t2("i_have_paid")} (${t2("transfer")})
            </button>
            <button class="btn-secondary w-full payment-modal-btn" onclick="submitPaymentRequest('${sub.id}', 'cash')">
                <i data-lucide="banknote" size="20"></i>
                ${t2("pay_cash")}
            </button>
            <button class="btn-icon w-full payment-modal-btn payment-modal-close" onclick="document.getElementById('payment-modal').classList.add('hidden')">
                <i data-lucide="x" size="20"></i>
                ${t2("close")}
            </button>
        </div>
    `;
    modal.classList.remove("hidden");
    if (window.lucide) lucide.createIcons();
  };
  window.submitPaymentRequest = async (subId, method) => {
    if (!state.currentUser) return;
    const sub = state.subscriptions.find((s) => s.id === subId);
    if (!sub) {
      alert("Error: Plan not found");
      return;
    }
    const t2 = new Proxy(window.t, {
      get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
    });
    if (supabaseClient) {
      const { error } = await supabaseClient.rpc("create_payment_request", {
        p_student_id: state.currentUser.id,
        p_sub_id: String(sub.id),
        p_sub_name: sub.name,
        p_price: sub.price,
        p_payment_method: method,
        p_school_id: state.currentSchool.id
      });
      if (error) {
        const msg = error.message || "";
        if (msg.includes("Could not find the function") || msg.includes("schema cache")) {
          alert("Payment requests are not set up. Please run the Supabase SQL migration:\n\nsupabase/migrations/20260210100000_login_credentials_rpc.sql\n\nin your project's SQL Editor (Dashboard \u2192 SQL Editor \u2192 New query, paste file contents, Run).");
        } else {
          alert("Error sending request: " + msg);
        }
        return;
      }
    }
    await fetchAllData();
    const content = document.getElementById("payment-modal-content");
    content.innerHTML = `
        <div class="payment-modal-header">
            <div class="payment-modal-icon" style="background: rgba(52, 199, 89, 0.15); color: var(--system-green);">
                <i data-lucide="check-circle" size="32"></i>
            </div>
            <h2 class="payment-modal-title">${t2("request_sent_title")}</h2>
            <p class="text-muted" style="margin: 0 0 1.5rem 0; font-size: 0.95rem; line-height: 1.5;">${t2("request_sent_msg")}</p>
            <button class="btn-primary w-full payment-modal-btn" onclick="document.getElementById('payment-modal').classList.add('hidden')">
                <i data-lucide="x" size="20"></i>
                ${t2("close")}
            </button>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
  };
  window.processPaymentRequest = async (id, status) => {
    const req = state.paymentRequests.find((r) => r.id === id);
    if (!req) return;
    if (supabaseClient) {
      const { error: rpcError } = await supabaseClient.rpc("update_payment_request_status", { p_request_id: id, p_status: status });
      if (rpcError) {
        const { error: tableError } = await supabaseClient.from("payment_requests").update({ status }).eq("id", id);
        if (tableError) {
          alert("Error processing: " + (tableError.message || rpcError.message));
          return;
        }
      }
      req.status = status;
      saveState();
      renderView();
      if (status === "approved" && req.student_id && req.sub_name && req.school_id) {
        const { error: activateError } = await supabaseClient.rpc("activate_package_for_student", {
          p_student_id: String(req.student_id),
          p_sub_name: String(req.sub_name),
          p_school_id: req.school_id
        });
        if (activateError) {
          await window.activatePackage(req.student_id, req.sub_name);
        }
      }
    }
    await fetchAllData();
  };
  window.removePaymentRequest = async (id) => {
    const t2 = new Proxy(window.t, {
      get: (target, prop) => typeof prop === "string" ? target(prop) : target[prop]
    });
    if (confirm(t2("delete_payment_confirm"))) {
      const numId = typeof id === "string" ? parseInt(id, 10) : id;
      if (supabaseClient) {
        const { error: rpcError } = await supabaseClient.rpc("delete_payment_request", { p_request_id: numId });
        if (rpcError) {
          const { error: tableError } = await supabaseClient.from("payment_requests").delete().eq("id", numId);
          if (tableError) {
            alert("Error deleting: " + (tableError.message || rpcError.message));
            return;
          }
        }
      }
      state.paymentRequests = state.paymentRequests.filter((r) => r.id != id);
      saveState();
      renderView();
      window._fetchAllDataNeeded = true;
      fetchAllData();
    }
  };
  window.updateDiscoveryCityDropdown = () => {
    const country = (document.getElementById("discovery-country")?.value || "").trim();
    const cities = DISCOVERY_COUNTRIES_CITIES[country] || [];
    const sel = document.getElementById("discovery-city");
    if (!sel) return;
    const current = (sel.value || "").trim();
    const list = current && !cities.includes(current) ? [current, ...cities] : cities;
    sel.innerHTML = '<option value="">\u2014</option>' + list.map((c) => `<option value="${String(c).replace(/"/g, "&quot;")}" ${c === current ? " selected" : ""}>${String(c).replace(/</g, "&lt;")}</option>`).join("");
  };
  window.handleDiscoveryFileSelect = (inputEl, kind) => {
    const file = inputEl?.files?.[0];
    if (!file) return;
    if (inputEl) inputEl.value = "";
    window.uploadDiscoveryImage(kind, file);
  };
  window.uploadDiscoveryImage = async (kind, fileOverride) => {
    const id = kind === "logo" ? "discovery-logo-file" : "discovery-teacher-file";
    const urlId = kind === "logo" ? "discovery-logo-url" : "discovery-teacher-url";
    const fileInput = document.getElementById(id);
    const file = fileOverride != null ? fileOverride : fileInput?.files?.[0];
    if (!file || !supabaseClient || !state.currentSchool?.id) return;
    const urlEl = document.getElementById(urlId);
    const hasExisting = (urlEl?.value || "").trim().length > 0;
    if (kind === "logo") {
      state._discoveryReplacePending = hasExisting ? { file, kind } : null;
      if (hasExisting) {
        window.showDiscoveryReplaceModal();
        return;
      }
      window.showDiscoveryLogoCropModal(file, async (croppedBlob) => {
        const f = new File([croppedBlob], "logo.jpg", { type: "image/jpeg" });
        await window.doUploadDiscoveryImage(f, kind);
        if (fileInput) fileInput.value = "";
      });
      return;
    }
    if (hasExisting) {
      state._discoveryReplacePending = { file, kind };
      window.showDiscoveryReplaceModal();
      return;
    }
    await window.doUploadDiscoveryImage(file, kind);
    if (fileInput) fileInput.value = "";
  };
  window.showDiscoveryLogoCropModal = (file, onApply) => {
    const t2 = (k) => window.t ? window.t(k) : k;
    const title = t2("discovery_logo_crop_title");
    const hint = t2("discovery_logo_crop_hint");
    const previewLabel = t2("discovery_logo_crop_preview_label");
    const applyLabel = t2("discovery_logo_crop_apply") || "Apply";
    const cancelLabel = window.t ? window.t("cancel") : "Cancel";
    const existing = document.getElementById("discovery-logo-crop-modal");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.id = "discovery-logo-crop-modal";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;";
    overlay.innerHTML = `
        <div class="discovery-logo-crop-dialog" style="background:var(--bg-body,#fff);border-radius:20px;max-width:min(420px,100vw);width:100%;box-shadow:0 12px 40px rgba(0,0,0,0.3);padding:24px;display:flex;flex-direction:column;gap:16px;max-height:90vh;">
            <h2 style="margin:0;font-size:18px;font-weight:700;color:var(--text-primary,#111);">${(title || "Crop logo").replace(/</g, "&lt;")}</h2>
            <p style="margin:0;font-size:14px;color:var(--text-secondary,#666);line-height:1.45;">${(hint || "").replace(/</g, "&lt;")}</p>
            <div id="discovery-logo-crop-container" style="width:100%;height:260px;overflow:hidden;border-radius:12px;background:var(--system-gray6,#eee);position:relative;">
                <img id="discovery-logo-crop-img" src="" alt="Logo" style="display:block;max-width:100%;max-height:100%;">
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;flex-shrink:0;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-secondary);">${(previewLabel || "Preview").replace(/</g, "&lt;")}</div>
                <div class="discovery-card-media" style="width:120px;height:120px;aspect-ratio:1;overflow:hidden;border-radius:12px;background:var(--system-gray6);border:2px solid var(--border);">
                    <img id="discovery-logo-crop-preview" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>
            </div>
            <div style="display:flex;gap:12px;justify-content:flex-end;flex-shrink:0;">
                <button type="button" class="discovery-crop-cancel" style="padding:10px 20px;border-radius:12px;font-size:15px;font-weight:600;background:transparent;color:var(--text-secondary);border:1px solid var(--border);cursor:pointer;transition:background 0.2s,color 0.2s,border-color 0.2s;">${(cancelLabel || "Cancel").replace(/</g, "&lt;")}</button>
                <button type="button" class="discovery-crop-apply" style="padding:10px 20px;border-radius:12px;font-size:15px;font-weight:600;background:var(--text-primary,#111);color:var(--bg-body,#fff);border:none;cursor:pointer;">${(applyLabel || "Apply").replace(/</g, "&lt;")}</button>
            </div>
        </div>`;
    const imgEl = overlay.querySelector("#discovery-logo-crop-img");
    const previewEl = overlay.querySelector("#discovery-logo-crop-preview");
    const blobUrl = URL.createObjectURL(file);
    let cropper = null;
    const destroy = () => {
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      overlay.remove();
    };
    if (previewEl) previewEl.src = blobUrl;
    const updatePreview = () => {
      if (!cropper || !previewEl) return;
      try {
        const canvas = cropper.getCroppedCanvas({ width: 200, height: 200 });
        if (canvas) {
          const dataUrl = canvas.toDataURL("image/png");
          if (dataUrl && dataUrl.length > 100) previewEl.src = dataUrl;
        }
      } catch (e) {
      }
    };
    imgEl.onload = () => {
      if (typeof Cropper === "undefined") {
        alert("Cropper library not loaded");
        destroy();
        return;
      }
      cropper = new Cropper(imgEl, {
        aspectRatio: 1,
        viewMode: 2,
        dragMode: "move",
        autoCropArea: 1,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false
      });
      cropper.on("crop", updatePreview);
      cropper.on("cropmove", updatePreview);
      cropper.on("cropend", updatePreview);
      cropper.on("ready", () => {
        setTimeout(updatePreview, 50);
      });
    };
    overlay.querySelector(".discovery-crop-cancel").addEventListener("click", () => {
      destroy();
    });
    overlay.querySelector(".discovery-crop-apply").addEventListener("click", async () => {
      if (!cropper) {
        destroy();
        return;
      }
      const canvas = cropper.getCroppedCanvas({ width: 600, height: 600 });
      if (!canvas) {
        destroy();
        return;
      }
      canvas.toBlob((blob) => {
        destroy();
        if (blob && onApply) onApply(blob);
      }, "image/jpeg", 0.92);
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) destroy();
    });
    document.body.appendChild(overlay);
    imgEl.src = blobUrl;
  };
  window.showDiscoveryReplaceModal = () => {
    const t2 = (k) => window.t ? window.t(k) : k;
    const title = t2("discovery_replace_title");
    const message = t2("discovery_replace_message");
    const replaceLabel = t2("discovery_replace_confirm");
    const cancelLabel = window.t ? window.t("cancel") : "Cancel";
    const existing = document.getElementById("discovery-replace-modal");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.id = "discovery-replace-modal";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "discovery-replace-title");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;";
    overlay.innerHTML = `
        <div class="discovery-replace-dialog" style="background:var(--bg-body, #fff);border-radius:16px;max-width:320px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.2);padding:24px;">
            <h2 id="discovery-replace-title" style="margin:0 0 12px;font-size:18px;font-weight:600;color:var(--text-primary,#111);">${title.replace(/</g, "&lt;")}</h2>
            <p style="margin:0 0 20px;font-size:15px;color:var(--text-secondary,#666);line-height:1.4;">${message.replace(/</g, "&lt;")}</p>
            <div style="display:flex;gap:12px;justify-content:flex-end;">
                <button type="button" class="discovery-replace-cancel" style="padding:10px 18px;border-radius:10px;font-size:15px;font-weight:600;background:var(--system-gray5,#e5e5ea);color:var(--text-primary);border:1px solid var(--border, rgba(0,0,0,0.1));cursor:pointer;">${cancelLabel.replace(/</g, "&lt;")}</button>
                <button type="button" class="discovery-replace-confirm" style="padding:10px 18px;border-radius:10px;font-size:15px;font-weight:600;background:var(--text-primary,#111);color:var(--bg-body,#fff);border:none;cursor:pointer;">${replaceLabel.replace(/</g, "&lt;")}</button>
            </div>
        </div>`;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) window.confirmDiscoveryReplace(false);
    });
    const cancelBtn = overlay.querySelector(".discovery-replace-cancel");
    const confirmBtn = overlay.querySelector(".discovery-replace-confirm");
    cancelBtn.addEventListener("click", () => window.confirmDiscoveryReplace(false));
    confirmBtn.addEventListener("click", () => window.confirmDiscoveryReplace(true));
    document.body.appendChild(overlay);
  };
  window.confirmDiscoveryReplace = async (confirmed) => {
    const pending = state._discoveryReplacePending;
    state._discoveryReplacePending = null;
    const id = pending?.kind === "logo" ? "discovery-logo-file" : "discovery-teacher-file";
    const fileInput = document.getElementById(id);
    const modal = document.getElementById("discovery-replace-modal");
    if (modal) modal.remove();
    if (confirmed && pending?.file && pending?.kind) {
      if (pending.kind === "logo") {
        window.showDiscoveryLogoCropModal(pending.file, async (croppedBlob) => {
          const f = new File([croppedBlob], "logo.jpg", { type: "image/jpeg" });
          await window.doUploadDiscoveryImage(f, pending.kind);
          if (fileInput) fileInput.value = "";
        });
      } else {
        await window.doUploadDiscoveryImage(pending.file, pending.kind);
        if (fileInput) fileInput.value = "";
      }
    } else if (fileInput) fileInput.value = "";
  };
  window.doUploadDiscoveryImage = async (file, kind) => {
    if (!file || !supabaseClient || !state.currentSchool?.id) return;
    const urlId = kind === "logo" ? "discovery-logo-url" : "discovery-teacher-url";
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${state.currentSchool.id}/${kind}.${ext}`;
    const { error } = await supabaseClient.storage.from("school-discovery").upload(path, file, { upsert: true });
    if (error) {
      alert(error.message || "Upload failed");
      return;
    }
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/school-discovery/${path}`;
    const urlEl = document.getElementById(urlId);
    if (urlEl) {
      urlEl.value = publicUrl;
      window.updateDiscoveryPreview();
    }
  };
  window.clearDiscoveryImage = (kind) => {
    const urlId = kind === "logo" ? "discovery-logo-url" : "discovery-teacher-url";
    const urlEl = document.getElementById(urlId);
    if (urlEl) urlEl.value = "";
    if (state.currentSchool) {
      if (kind === "logo") state.currentSchool.logo_url = "";
      else if (kind === "teacher") state.currentSchool.teacher_photo_url = "";
    }
    if (document.getElementById("discovery-preview-inner")) window.updateDiscoveryPreview();
    renderView();
  };
  window.addDiscoveryLocation = () => {
    state.discoveryLocations = state.discoveryLocations || [];
    state.discoveryLocations.push({ name: "", address: "", description: "", image_urls: [] });
    renderView();
  };
  window.removeDiscoveryLocation = (index) => {
    state.discoveryLocations = state.discoveryLocations || [];
    state.discoveryLocations.splice(index, 1);
    renderView();
  };
  window.setDiscoveryLocationField = (index, field, value) => {
    state.discoveryLocations = state.discoveryLocations || [];
    if (state.discoveryLocations[index]) state.discoveryLocations[index][field] = value;
    if (document.getElementById("discovery-preview-inner")) window.updateDiscoveryPreview();
  };
  window.removeDiscoveryLocationImage = (locIndex, imgIndex) => {
    state.discoveryLocations = state.discoveryLocations || [];
    if (state.discoveryLocations[locIndex] && Array.isArray(state.discoveryLocations[locIndex].image_urls)) {
      state.discoveryLocations[locIndex].image_urls.splice(imgIndex, 1);
      renderView();
    }
  };
  window.uploadDiscoveryLocationImage = async (locIndex, fileInput) => {
    const file = fileInput?.files?.[0];
    if (!file || !supabaseClient || !state.currentSchool?.id) return;
    state.discoveryLocations = state.discoveryLocations || [];
    const loc = state.discoveryLocations[locIndex];
    if (!loc) return;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const imgCount = Array.isArray(loc.image_urls) ? loc.image_urls.length : 0;
    const path = `${state.currentSchool.id}/locations/${locIndex}_${imgCount}.${ext}`;
    const { error } = await supabaseClient.storage.from("school-discovery").upload(path, file, { upsert: true });
    if (error) {
      alert(error.message || "Upload failed");
      return;
    }
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/school-discovery/${path}`;
    if (!Array.isArray(loc.image_urls)) loc.image_urls = [];
    loc.image_urls.push(publicUrl);
    fileInput.value = "";
    renderView();
  };
  window.toggleDiscoveryPreview = () => {
    state.showDiscoveryPreview = !state.showDiscoveryPreview;
    renderView();
    if (state.showDiscoveryPreview && document.getElementById("discovery-preview-inner")) setTimeout(() => window.updateDiscoveryPreview(), 50);
  };
  window.getDiscoveryPreviewFullHtml = (opts) => {
    const t2 = (k) => window.t ? window.t(k) : k;
    const name = (opts.name || "").replace(/</g, "&lt;");
    const loc = (opts.loc || "\u2014").replace(/</g, "&lt;");
    const desc = (opts.desc || "").replace(/</g, "&lt;").replace(/\n/g, "<br>");
    const tags = (opts.genres || "").replace(/</g, "&lt;");
    const placeholder = opts.placeholder || t2("discovery_placeholder_upload_soon");
    const logoUrl = (opts.logoUrl || "").trim();
    const teacherUrl = (opts.teacherUrl || "").trim();
    const classes = opts.classes || [];
    const subscriptions = opts.subscriptions || [];
    const gallery = opts.gallery || [];
    const locations = opts.locations || [];
    const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayAliases = { "Mon": ["Mon", "Mo", "Monday"], "Tue": ["Tue", "Tu", "Tuesday"], "Wed": ["Wed", "We", "Wednesday"], "Thu": ["Thu", "Th", "Thursday"], "Fri": ["Fri", "Fr", "Friday"], "Sat": ["Sat", "Sa", "Saturday"], "Sun": ["Sun", "Su", "Sunday"] };
    const noClassesMsg = opts.noClassesMsg != null ? opts.noClassesMsg : t2("no_classes_msg") || "No classes";
    const classesHtml = classes.length ? `<div class="weekly-grid">${daysOrder.map((dayKey) => {
      const aliases = dayAliases[dayKey];
      const dayClasses = classes.filter((c) => aliases.includes(c.day)).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
      const dayLabel = t2(dayKey.toLowerCase()) || dayKey;
      return `<div class="day-tile" style="background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 0.8rem;">
            <div class="day-tile-header" style="padding-bottom: 0.4rem; border-bottom: 1px solid var(--border); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">${dayLabel}</div>
            <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top: 0.6rem;">
                ${dayClasses.length > 0 ? dayClasses.map((c) => {
        const cName = String(c.name || c.class_name || "").replace(/</g, "&lt;");
        const timeStr = typeof window.formatClassTime === "function" ? window.formatClassTime(c) : c.time || "";
        const loc2 = (c.location || "").replace(/</g, "&lt;");
        return `<div class="tile-class-item" style="padding: 8px; border-radius: 10px; border: 1px solid var(--border);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
                            <span class="tile-class-level" style="font-size: 8px; background: var(--system-gray6); padding: 2px 6px; border-radius: 4px;">${(c.tag || "Open").replace(/</g, "&lt;")}</span>
                            ${loc2 ? `<span style="font-size: 6px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; opacity: 0.7;">${loc2}</span>` : ""}
                        </div>
                        <div class="tile-class-desc" style="font-size: 11px; font-weight: 700;">${cName}</div>
                        <div class="tile-class-time" style="font-size: 9px; opacity: 0.6;">${timeStr.replace(/</g, "&lt;")}</div>
                    </div>`;
      }).join("") : `<div class="text-muted" style="font-size:9px; font-style:italic; padding: 0.5rem 0;">${noClassesMsg}</div>`}
            </div>
        </div>`;
    }).join("")}</div>` : `<div class="discovery-detail-placeholder-block"><i data-lucide="calendar" size="24"></i><span>${placeholder}</span></div>`;
    const currency = opts.currency || "MXN";
    const planSortKey = (s) => {
      const name2 = (s.name || "").toLowerCase();
      if (name2.includes("ilimitad") || name2.includes("unlimited") || s.limit_count === 0 && (s.limit_count_private == null || s.limit_count_private === 0) || s.limit_count == null && !(s.name || "").match(/\d+/)) return 1e9;
      const n = parseInt(s.limit_count, 10);
      if (!isNaN(n)) return n;
      const m = (s.name || "").match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    };
    const hasPrivateInPlanDiscovery = (s) => s.limit_count_private != null && s.limit_count_private > 0;
    const hasEventsInPlanDiscovery = (s) => s.limit_count_events != null && s.limit_count_events > 0;
    const hasGroupInPlanDiscovery = (s) => s.limit_count != null && s.limit_count > 0;
    const discoveryGroupOnly = [...subscriptions].filter((s) => hasGroupInPlanDiscovery(s) && !hasPrivateInPlanDiscovery(s) && !hasEventsInPlanDiscovery(s)).sort((a, b) => planSortKey(a) - planSortKey(b));
    const discoveryPrivateOnly = [...subscriptions].filter((s) => hasPrivateInPlanDiscovery(s) && !hasGroupInPlanDiscovery(s) && !hasEventsInPlanDiscovery(s)).sort((a, b) => planSortKey(a) - planSortKey(b));
    const discoveryMixed = [...subscriptions].filter((s) => hasEventsInPlanDiscovery(s) || hasGroupInPlanDiscovery(s) && hasPrivateInPlanDiscovery(s)).sort((a, b) => planSortKey(a) - planSortKey(b));
    const cardHtml = (s) => {
      const sName = String(s.name || s.title || "").replace(/</g, "&lt;");
      const priceStr = typeof window.formatPrice === "function" ? window.formatPrice(s.price, currency) : s.price != null ? s.price : "";
      const validDays = s.validity_days != null ? s.validity_days : 30;
      return `<div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-radius: 24px; padding: 1.2rem;"><div><h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">${sName}</h3><p class="text-muted" style="margin-bottom: 0.75rem; font-size: 0.8rem;">${(t2("valid_for_days") || "Valid for {days} days").replace("{days}", validDays)}</p><div style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.04em;">${priceStr}</div></div></div>`;
    };
    const packagesHtml = discoveryGroupOnly.length > 0 || discoveryPrivateOnly.length > 0 || discoveryMixed.length > 0 ? [
      discoveryGroupOnly.length > 0 ? `<div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.5rem;">${t2("plans_section_group") || "Group classes"}</div><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: ${discoveryPrivateOnly.length > 0 || discoveryMixed.length > 0 ? "1.5rem" : "0"};">${discoveryGroupOnly.map(cardHtml).join("")}</div>` : "",
      discoveryPrivateOnly.length > 0 ? `<div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.5rem;">${t2("plans_section_private") || "Private classes"}</div><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: ${discoveryMixed.length > 0 ? "1.5rem" : "0"};">${discoveryPrivateOnly.map(cardHtml).join("")}</div>` : "",
      discoveryMixed.length > 0 ? `<div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.5rem;">${t2("plans_section_mixed") || "Mixed classes"}</div><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">${discoveryMixed.map(cardHtml).join("")}</div>` : ""
    ].filter(Boolean).join("") : `<div class="discovery-detail-placeholder-block"><i data-lucide="credit-card" size="24"></i><span>${placeholder}</span></div>`;
    const locationsHtml = locations.length ? locations.map((loc2) => {
      const locName = String(loc2.name || "").replace(/</g, "&lt;");
      const locAddr = String(loc2.address || "").replace(/</g, "&lt;");
      const locDesc = String(loc2.description || "").replace(/</g, "&lt;").replace(/\n/g, "<br>");
      const imgs = Array.isArray(loc2.image_urls) ? loc2.image_urls : [];
      return `<div class="discovery-detail-location-card" style="margin-bottom: 1rem; padding: 1rem; border-radius: 16px; border: 1px solid var(--border);"><div style="font-weight: 700; margin-bottom: 4px;">${locName || "\u2014"}</div><div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 6px;"><i data-lucide="map-pin" size="14"></i> ${locAddr || placeholder}</div>${locDesc ? `<div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px;">${locDesc}</div>` : ""}${imgs.length ? `<div class="discovery-detail-gallery-grid" style="margin-top: 8px;">${imgs.slice(0, 6).map((url) => `<img src="${String(url).replace(/"/g, "&quot;")}" alt="">`).join("")}</div>` : ""}</div>`;
    }).join("") : gallery.length ? `<div class="discovery-detail-gallery-grid">${gallery.slice(0, 12).map((url) => `<img src="${String(url).replace(/"/g, "&quot;")}" alt="">`).join("")}</div>` : `<div class="discovery-detail-placeholder-block"><i data-lucide="map-pin" size="32"></i><span>${placeholder}</span></div>`;
    return `<div class="discovery-detail-page" style="padding-top: 0;">
            <div class="discovery-detail-hero">
                <div class="discovery-detail-logo-wrap">${logoUrl ? `<img src="${String(logoUrl).replace(/"/g, "&quot;")}" alt="">` : `<div class="discovery-detail-logo-placeholder"><i data-lucide="image" size="40"></i></div>`}</div>
                <div class="discovery-detail-info">
                    <h1 class="discovery-detail-title">${name || "\u2014"}</h1>
                    <p class="discovery-detail-loc"><i data-lucide="map-pin" size="14"></i> ${loc}</p>
                    <p class="discovery-detail-tags">${tags || placeholder}</p>
                </div>
            </div>
            <div class="discovery-detail-desc">${desc || placeholder}</div>
            <div class="discovery-detail-teacher-wrap">${teacherUrl ? `<img src="${String(teacherUrl).replace(/"/g, "&quot;")}" alt="Teacher">` : `<div class="discovery-detail-teacher-placeholder"><i data-lucide="user" size="48"></i><span>${placeholder}</span></div>`}</div>
            <h2 class="discovery-detail-section-title">${t2("discovery_classes")}</h2>${classesHtml}
            <h2 class="discovery-detail-section-title">${t2("discovery_packages")}</h2>${packagesHtml}
            <h2 class="discovery-detail-section-title">${t2("discovery_where_we_teach")}</h2>${locationsHtml}
            </div>`;
  };
  window.updateDiscoveryPreview = () => {
    const inner = document.getElementById("discovery-preview-inner");
    if (!inner) return;
    const slug = (document.getElementById("discovery-slug")?.value || "").trim();
    const name = (state.currentSchool?.name || "").replace(/</g, "&lt;");
    const country = (document.getElementById("discovery-country")?.value || "").trim();
    const city = (document.getElementById("discovery-city")?.value || "").trim();
    const loc = [city, country].filter(Boolean).join(", ") || "\u2014";
    const descEl = document.getElementById("discovery-description");
    const descRaw = (descEl?.value || "").toString();
    const desc = descRaw.replace(/</g, "&lt;").replace(/\n/g, "<br>");
    const genresEl = document.getElementById("discovery-genres");
    const genres = (genresEl?.value || "").split(",").map((s) => s.trim()).filter(Boolean).join(" \xB7 ");
    const logoUrl = (document.getElementById("discovery-logo-url")?.value || "").trim();
    const teacherUrl = (document.getElementById("discovery-teacher-url")?.value || "").trim();
    const placeholder = window.t ? window.t("discovery_placeholder_upload_soon") : "Will be uploaded soon.";
    const locations = state.discoveryLocations ?? state.currentSchool?.discovery_locations ?? [];
    if (!state.showDiscoveryPreview) return;
    inner.innerHTML = window.getDiscoveryPreviewFullHtml({
      name: state.currentSchool?.name || "",
      loc,
      desc: descRaw,
      genres,
      logoUrl,
      teacherUrl,
      gallery: [],
      locations: Array.isArray(locations) ? locations : [],
      currency: state.currentSchool?.currency || "MXN",
      classes: state.classes || [],
      subscriptions: state.subscriptions || [],
      placeholder
    });
    if (window.lucide) window.lucide.createIcons();
  };
  window.saveDiscoveryProfile = async (ev) => {
    if (!supabaseClient || !state.currentSchool?.id) return;
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    const btn = ev && ev.target ? ev.target.closest(".save-discovery-btn") : null;
    const originalHtml = btn ? btn.innerHTML : null;
    if (btn) {
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.8";
      btn.innerHTML = '<i data-lucide="loader-2" class="spin" size="18" style="margin-right: 8px;"></i> ' + (t2("saving_label") || "Saving\u2026");
      if (window.lucide) window.lucide.createIcons();
    }
    try {
      const slug = (document.getElementById("discovery-slug")?.value || "").trim();
      const country = (document.getElementById("discovery-country")?.value || "").trim();
      const city = (document.getElementById("discovery-city")?.value || "").trim();
      const description = (document.getElementById("discovery-description")?.value || "").trim();
      const genresStr = (document.getElementById("discovery-genres")?.value || "").trim();
      const levelsStr = (document.getElementById("discovery-levels")?.value || "").trim();
      const logoUrl = (document.getElementById("discovery-logo-url")?.value || "").trim();
      const teacherPhotoUrl = (document.getElementById("discovery-teacher-url")?.value || "").trim();
      const genres = genresStr ? genresStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const levels = levelsStr ? levelsStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const locationsRaw = (state.discoveryLocations || []).map((l) => ({
        name: (l.name || "").trim(),
        address: (l.address || "").trim(),
        description: (l.description || "").trim(),
        image_urls: Array.isArray(l.image_urls) ? l.image_urls : []
      }));
      const locations = locationsRaw.filter((l) => l.name || l.address || l.description || l.image_urls && l.image_urls.length);
      const missingAddress = locations.some((l) => !(l.address && l.address.length));
      if (locations.length && missingAddress) {
        alert(t2("discovery_location_address") || "Address is required for each location.");
        return;
      }
      const locationsToSave = locations.filter((l) => l.address && l.address.length);
      const schoolId = state.currentSchool.id;
      let existing = state.currentSchool;
      const { data: existingDetail } = await supabaseClient.rpc("discovery_school_detail_by_id", { p_school_id: schoolId });
      if (existingDetail && typeof existingDetail === "object" && existingDetail.id) {
        existing = { ...existing, ...existingDetail };
      }
      const slugToSave = slug || existing.discovery_slug || null;
      const countryToSave = country || existing.country || null;
      const cityToSave = city || existing.city || null;
      const descriptionToSave = description || existing.discovery_description || null;
      const genresToSave = genres.length ? genres : Array.isArray(existing.discovery_genres) ? existing.discovery_genres : [];
      const levelsToSave = levels.length ? levels : Array.isArray(existing.discovery_levels) ? existing.discovery_levels : [];
      const logoUrlToSave = logoUrl || existing.logo_url || null;
      const teacherPhotoUrlToSave = teacherPhotoUrl || existing.teacher_photo_url || null;
      const locationsFinal = locationsToSave.length ? locationsToSave : Array.isArray(existing.discovery_locations) ? existing.discovery_locations : [];
      const { error } = await supabaseClient.rpc("school_update_discovery", {
        p_school_id: schoolId,
        p_discovery_slug: slugToSave,
        p_country: countryToSave,
        p_city: cityToSave,
        p_address: existing.address || null,
        p_discovery_description: descriptionToSave,
        p_discovery_genres: genresToSave,
        p_discovery_levels: levelsToSave,
        p_logo_url: logoUrlToSave,
        p_teacher_photo_url: teacherPhotoUrlToSave,
        p_gallery_urls: existing.gallery_urls || [],
        p_discovery_locations: locationsFinal
      });
      if (error) {
        alert(error.message || "Failed to save discovery profile");
        return;
      }
      state.currentSchool = { ...state.currentSchool, discovery_slug: slugToSave, country: countryToSave, city: cityToSave, address: existing.address || null, discovery_description: descriptionToSave, discovery_genres: genresToSave, discovery_levels: levelsToSave, logo_url: logoUrlToSave, teacher_photo_url: teacherPhotoUrlToSave, discovery_locations: locationsFinal };
      if (state.platformData && state.platformData.schools) {
        const idx = state.platformData.schools.findIndex((s) => s.id === state.currentSchool.id);
        if (idx >= 0) state.platformData.schools[idx] = { ...state.platformData.schools[idx], ...state.currentSchool };
      }
      if (btn) {
        btn.innerHTML = '<i data-lucide="check" size="18" style="margin-right: 8px;"></i> ' + (t2("saved_success_msg") || "Saved!");
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
          if (btn && originalHtml) {
            btn.innerHTML = originalHtml;
            btn.style.pointerEvents = "";
            btn.style.opacity = "";
            if (window.lucide) window.lucide.createIcons();
          }
        }, 2e3);
      }
      renderView();
    } finally {
      if (btn && !btn.innerHTML.includes("check")) {
        btn.style.pointerEvents = "";
        btn.style.opacity = "";
        if (originalHtml) btn.innerHTML = originalHtml;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  };
  window.saveBankSettings = async (btn) => {
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    const name = document.getElementById("set-bank-name").value;
    const cbu = document.getElementById("set-bank-cbu").value;
    const alias = document.getElementById("set-bank-alias").value;
    const holder = document.getElementById("set-bank-holder").value;
    if (btn) {
      btn.disabled = true;
      btn.style.pointerEvents = "none";
      btn.innerHTML = '<i data-lucide="loader-2" class="spin" size="16"></i> ' + (t2("saving_label") || "Saving\u2026");
      if (window.lucide) lucide.createIcons();
    }
    try {
      await window.updateAdminSetting("bank_name", name);
      await window.updateAdminSetting("bank_cbu", cbu);
      await window.updateAdminSetting("bank_alias", alias);
      await window.updateAdminSetting("bank_holder", holder);
      const status = document.getElementById("save-status");
      if (status) {
        status.innerHTML = '<i data-lucide="check" size="14"></i> ' + (t2("saved_success_msg") || "Saved!");
        status.classList.remove("hidden");
        setTimeout(() => status.classList.add("hidden"), 3e3);
      }
      await fetchAllData();
    } catch (err) {
      console.error("Save Error:", err);
      alert("CRITICAL ERROR: Could not save settings. Info: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.style.pointerEvents = "";
        btn.innerHTML = '<i data-lucide="save" size="16"></i> ' + (t2("save_bank_btn") || "Save Bank Details");
        if (window.lucide) lucide.createIcons();
      }
    }
  };
  window.updateAdminSetting = async (key, value) => {
    if (supabaseClient && state.currentSchool?.id) {
      const { error: rpcError } = await supabaseClient.rpc("admin_setting_upsert", {
        p_school_id: state.currentSchool.id,
        p_key: String(key),
        p_value: String(value)
      });
      if (rpcError) {
        const { error: tableError } = await supabaseClient.from("admin_settings").upsert({ school_id: state.currentSchool.id, key: String(key), value: String(value) }, { onConflict: "school_id, key" });
        if (tableError) {
          console.error(`Error updating setting[${key}]: `, tableError);
          throw tableError;
        }
      }
    }
    state.adminSettings[key] = value;
    saveState();
  };
  window.savePrivateContactAdmin = async (adminId) => {
    if (!state.currentSchool?.id) return;
    await window.updateAdminSetting("private_contact_admin_id", adminId || "");
  };
  window.togglePrivateClassesOffering = async (enabled) => {
    if (!state.currentSchool?.id) return;
    await window.updateAdminSetting("private_classes_offering_enabled", enabled ? "true" : "false");
    renderView();
  };
  window.toggleEventsOffering = async (enabled) => {
    if (!state.currentSchool?.id) return;
    await window.updateAdminSetting("events_offering_enabled", enabled ? "true" : "false");
    renderView();
  };
  window.toggleMonthlyRegistration = async (enabled) => {
    if (!state.currentSchool?.id) return;
    await window.updateAdminSetting("monthly_registration_enabled", enabled ? "true" : "false");
    renderView();
  };
  window.togglePlanExpiryFixedDate = async (enabled) => {
    if (!state.currentSchool?.id) return;
    await window.updateAdminSetting("plan_expiry_fixed_date", enabled ? "true" : "false");
    renderView();
  };
  window.getPlanExpiryUseFixedDate = () => {
    try {
      if (!state) return false;
      if (state.adminSettings?.plan_expiry_fixed_date === "true") return true;
      if (state.adminSettings?.plan_expiry_fixed_date === "false") return false;
      return state.adminSettings?.monthly_registration_enabled === "true" || !!state.currentSchool?.monthly_registration_enabled;
    } catch (e) {
      return false;
    }
  };
  window.saveAdminProfile = async () => {
    const adm = state.currentAdmin;
    if (!adm || !supabaseClient) return;
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    const btn = document.getElementById("save-admin-profile-btn");
    const originalHtml = btn ? btn.innerHTML : null;
    if (btn) {
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.8";
      btn.innerHTML = '<i data-lucide="loader-2" class="spin" size="18" style="margin-right: 8px;"></i> ' + (t2("saving_label") || "Saving\u2026");
      if (window.lucide) window.lucide.createIcons();
    }
    const displayName = (document.getElementById("profile-display-name")?.value || "").trim();
    const phone = (document.getElementById("profile-phone")?.value || "").trim();
    const newEmail = (document.getElementById("profile-email")?.value || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newEmail && !emailRegex.test(newEmail)) {
      alert(t2("admin_email_invalid") || "Please enter a valid email address.");
      if (btn) {
        btn.style.pointerEvents = "";
        btn.style.opacity = "";
        if (originalHtml) btn.innerHTML = originalHtml;
        if (window.lucide) window.lucide.createIcons();
      }
      return;
    }
    try {
      const { error: profError } = await supabaseClient.rpc("admin_update_profile", {
        p_admin_id: adm.id,
        p_phone: phone,
        p_display_name: displayName
      });
      if (profError) throw profError;
      adm.display_name = displayName || null;
      adm.phone = phone || null;
      if (newEmail && newEmail !== (adm.email || "").toLowerCase()) {
        const payload = { p_email: newEmail };
        if (state.currentSchool?.id) payload.p_school_id = state.currentSchool.id;
        const { error: emailError } = await supabaseClient.rpc("admin_set_email", payload);
        if (emailError) throw emailError;
        adm.email = newEmail;
        try {
          const res = await supabaseClient.functions.invoke("admin-update-email", { body: { email: newEmail } });
          if (res.error) throw res.error;
          await supabaseClient.auth.refreshSession();
        } catch (authUpdateErr) {
          console.warn("Auth email update failed (DB updated):", authUpdateErr?.message || authUpdateErr);
        }
      }
      state.currentAdmin = adm;
      const idx = (state.admins || []).findIndex((a) => a.id === adm.id);
      if (idx >= 0) {
        state.admins[idx] = { ...state.admins[idx], display_name: adm.display_name, phone: adm.phone, email: adm.email };
      }
      saveState();
      if (btn) {
        btn.innerHTML = '<i data-lucide="check" size="18" style="margin-right: 8px;"></i> ' + (t2("saved_success_msg") || "Saved!");
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
          if (btn && originalHtml) {
            btn.innerHTML = originalHtml;
            btn.style.pointerEvents = "";
            btn.style.opacity = "";
            if (window.lucide) window.lucide.createIcons();
          }
        }, 2e3);
      }
      renderView();
    } catch (err) {
      alert("Error: " + (err.message || "Could not save profile"));
      if (btn) {
        btn.style.pointerEvents = "";
        btn.style.opacity = "";
        if (originalHtml) btn.innerHTML = originalHtml;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  };
  window.changeAdminPassword = async () => {
    const adm = state.currentAdmin;
    if (!adm || !supabaseClient) return;
    const t2 = window.t;
    const currentEl = document.getElementById("profile-current-password");
    const newEl = document.getElementById("profile-new-password");
    const confirmEl = document.getElementById("profile-confirm-password");
    const current = currentEl?.value || "";
    const newPass = newEl?.value || "";
    const confirmPass = confirmEl?.value || "";
    if (!current) {
      alert(t2("current_password_label") + " " + (t2("required") || "required"));
      return;
    }
    if (newPass.length < 4) {
      alert(t2("password_too_short"));
      return;
    }
    if (newPass !== confirmPass) {
      alert(t2("password_mismatch"));
      return;
    }
    try {
      const { error } = await supabaseClient.rpc("admin_change_password", {
        p_admin_id: adm.id,
        p_current_password: current,
        p_new_password: newPass
      });
      if (error) throw error;
      const { error: authErr } = await supabaseClient.auth.updateUser({ password: newPass });
      if (authErr) {
        alert(t2("password_changed_success") + "\n\n" + (t2("auth_password_sync_failed") || "Warning: login service could not be updated. You may need to use your OLD password to log in once, then change the password again.") + "\n\n" + (authErr.message || ""));
        if (currentEl) currentEl.value = "";
        if (newEl) newEl.value = "";
        if (confirmEl) confirmEl.value = "";
        renderView();
        return;
      }
      if (currentEl) currentEl.value = "";
      if (newEl) newEl.value = "";
      if (confirmEl) confirmEl.value = "";
      alert(t2("password_changed_success"));
      renderView();
    } catch (err) {
      alert(err.message || "Could not change password");
    }
  };
  window.openAddAdminModal = () => {
    const modal = document.getElementById("add-admin-modal");
    const formView = document.getElementById("add-admin-form-view");
    const successView = document.getElementById("add-admin-success-view");
    const errEl = document.getElementById("add-admin-error");
    const t2 = window.t;
    if (!modal || !formView || !successView) return;
    formView.classList.remove("hidden");
    formView.style.display = "";
    successView.classList.add("hidden");
    successView.style.display = "none";
    document.getElementById("add-admin-modal-title").textContent = t2("add_admin_modal_title") || "Add administrator";
    const sub = document.querySelector("#add-admin-form-view p");
    if (sub) sub.textContent = t2("add_admin_modal_subtitle") || "Create a new admin for your school";
    document.getElementById("add-admin-username").value = "";
    const emailEl = document.getElementById("add-admin-email");
    if (emailEl) emailEl.value = "";
    document.getElementById("add-admin-password").value = "";
    document.getElementById("add-admin-password-confirm").value = "";
    if (errEl) {
      errEl.style.display = "none";
      errEl.textContent = "";
    }
    const submitLabel = document.getElementById("add-admin-submit-label");
    if (submitLabel) submitLabel.textContent = t2("add_admin_btn") || "Add";
    document.getElementById("add-admin-success-title").textContent = t2("add_admin_success_title") || "Administrator added";
    document.getElementById("add-admin-success-text").textContent = t2("add_admin_success_text") || "The new administrator can now sign in with the email and password you set.";
    document.getElementById("add-admin-done-btn").textContent = t2("close") || "Done";
    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  };
  window.closeAddAdminModal = () => {
    const modal = document.getElementById("add-admin-modal");
    if (modal) modal.classList.add("hidden");
  };
  window.submitAddAdminModal = async () => {
    const t2 = window.t;
    const usernameEl = document.getElementById("add-admin-username");
    const emailEl = document.getElementById("add-admin-email");
    const passwordEl = document.getElementById("add-admin-password");
    const confirmEl = document.getElementById("add-admin-password-confirm");
    const errEl = document.getElementById("add-admin-error");
    const submitBtn = document.getElementById("add-admin-submit-btn");
    const username = (usernameEl && usernameEl.value || "").trim();
    const email = (emailEl && emailEl.value || "").trim().toLowerCase();
    const password = passwordEl ? passwordEl.value : "";
    const confirmPassword = confirmEl ? confirmEl.value : "";
    if (!errEl) return;
    errEl.style.display = "none";
    errEl.textContent = "";
    if (!username) {
      errEl.textContent = t2("enter_admin_user") || "Please enter a name.";
      errEl.style.display = "block";
      return;
    }
    if (!email) {
      errEl.textContent = t2("enter_admin_email") || "Please enter an email address.";
      errEl.style.display = "block";
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errEl.textContent = t2("admin_email_invalid") || "Please enter a valid email address.";
      errEl.style.display = "block";
      return;
    }
    if (!password) {
      errEl.textContent = t2("enter_admin_pass") || "Please enter a password.";
      errEl.style.display = "block";
      return;
    }
    if (password !== confirmPassword) {
      errEl.textContent = t2("signup_passwords_dont_match") || "Passwords do not match.";
      errEl.style.display = "block";
      return;
    }
    if (!supabaseClient || !state.currentSchool?.id) {
      errEl.textContent = t2("error_creating_admin") || "Error creating administrator.";
      errEl.style.display = "block";
      return;
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.7";
    }
    let userId = null;
    try {
      const tempClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
      if (tempClient) {
        const { data: signUpData, error: signUpErr } = await tempClient.auth.signUp({ email, password });
        if (!signUpErr && signUpData?.user) {
          const hasIdentity = Array.isArray(signUpData.user.identities) && signUpData.user.identities.length > 0;
          if (hasIdentity) {
            userId = signUpData.user.id;
          }
        }
      }
    } catch (e) {
      console.warn("Admin Auth signUp:", e);
    }
    const payload = { p_school_id: state.currentSchool.id, p_username: username, p_email: email, p_password: password };
    if (userId) payload.p_user_id = userId;
    const { error: rpcError } = await supabaseClient.rpc("admin_insert_for_school", payload);
    if (rpcError) {
      const msg = (rpcError.message || "").toLowerCase();
      const isPermissionDenied = msg.includes("permission denied") || msg.includes("row-level security") || msg.includes("violates row-level security");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "";
      }
      if (isPermissionDenied) {
        errEl.textContent = t2("admin_add_need_linked_session") || "To add administrators you must be signed in with your linked account. Please log out and sign in again.";
        errEl.style.display = "block";
        return;
      }
      const newId = "ADM-" + Math.random().toString(36).substr(2, 4).toUpperCase();
      const { error } = await supabaseClient.from("admins").insert([{ id: newId, username, email, password, school_id: state.currentSchool.id }]);
      if (error) {
        const errMsg = (error.message || "").toLowerCase();
        if (errMsg.includes("row-level security") || errMsg.includes("violates row-level security")) {
          errEl.textContent = t2("admin_add_need_linked_session") || "To add administrators you must be signed in with your linked account.";
        } else {
          errEl.textContent = (t2("error_creating_admin") || "Error") + " " + (error.message || rpcError.message);
        }
        errEl.style.display = "block";
        return;
      }
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "";
    }
    document.getElementById("add-admin-form-view").classList.add("hidden");
    document.getElementById("add-admin-form-view").style.display = "none";
    const successView = document.getElementById("add-admin-success-view");
    successView.classList.remove("hidden");
    successView.style.display = "block";
    if (window.lucide) window.lucide.createIcons();
    await fetchAllData();
  };
  window.removeAdmin = async (id) => {
    const t2 = window.t;
    if (!confirm(t2("remove_admin_confirm"))) return;
    if (supabaseClient) {
      const { error: rpcError } = await supabaseClient.rpc("admin_delete_for_school", { p_admin_id: String(id) });
      if (rpcError) {
        const { error } = await supabaseClient.from("admins").delete().eq("id", id);
        if (error) {
          alert(t2("error_removing_admin") + " " + (error.message || rpcError.message));
          return;
        }
      }
      alert(t2("admin_removed"));
      await fetchAllData();
    }
  };
  var _classUpdatePending = /* @__PURE__ */ new Map();
  var _classUpdateDebounceTimer = null;
  var CLASS_UPDATE_DEBOUNCE_MS = 3e3;
  window.debouncedUpdateClass = (id, field, value) => {
    const cls = state.classes.find((c) => c.id === id);
    if (!cls) return;
    state._lastClassEditAt = Date.now();
    const val = field === "price" ? parseFloat(value) : value;
    cls[field] = val;
    const key = id + "::" + field;
    _classUpdatePending.set(key, { id, field });
    if (_classUpdateDebounceTimer) clearTimeout(_classUpdateDebounceTimer);
    _classUpdateDebounceTimer = setTimeout(async () => {
      _classUpdateDebounceTimer = null;
      const toFlush = [..._classUpdatePending.values()];
      _classUpdatePending.clear();
      for (const { id: classId, field: fieldName } of toFlush) {
        const c = state.classes.find((x) => x.id === classId);
        if (!c) continue;
        await window._doClassUpdateOnly(classId, fieldName, c[fieldName]);
      }
      if (toFlush.length > 0) {
        saveState();
        if (shouldDeferRender()) scheduleDeferredRender();
        else renderView();
      }
    }, CLASS_UPDATE_DEBOUNCE_MS);
  };
  window.flushScheduleSave = async () => {
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    state._scheduleSaving = true;
    if (window.renderView) renderView();
    if (window.lucide) window.lucide.createIcons();
    try {
      if (_classUpdateDebounceTimer) {
        clearTimeout(_classUpdateDebounceTimer);
        _classUpdateDebounceTimer = null;
      }
      const toFlush = [..._classUpdatePending.values()];
      _classUpdatePending.clear();
      for (const { id: classId, field: fieldName } of toFlush) {
        const c = state.classes.find((x) => x.id === classId);
        if (!c) continue;
        await window._doClassUpdateOnly(classId, fieldName, c[fieldName]);
      }
      if (toFlush.length > 0) saveState();
      state._scheduleSaveStatus = t2("saved_success_msg") || "Saved!";
    } finally {
      state._scheduleSaving = false;
      if (window.renderView) renderView();
      if (window.lucide) window.lucide.createIcons();
    }
    setTimeout(() => {
      state._scheduleSaveStatus = "";
      if (window.renderView) renderView();
    }, 2500);
  };
  window._doClassUpdateOnly = async (id, field, value) => {
    const cls = state.classes.find((c) => c.id === id);
    if (!cls) return;
    const val = field === "price" ? parseFloat(value) : value;
    if (supabaseClient) {
      const { error: rpcError } = await supabaseClient.rpc("class_update_field", { p_id: id, p_field: field, p_value: String(val) });
      if (rpcError) {
        const { error } = await supabaseClient.from("classes").update({ [field]: val }).eq("id", id);
        if (error) {
          console.error(error);
          return;
        }
      }
    }
    cls[field] = val;
  };
  window.updateClass = async (id, field, value) => {
    const cls = state.classes.find((c) => c.id === id);
    if (cls) {
      await window._doClassUpdateOnly(id, field, field === "price" ? parseFloat(value) : value);
      saveState();
      renderView();
    }
  };
  window.addClass = async () => {
    const schoolId = state.currentSchool?.id;
    if (supabaseClient && schoolId) {
      const { data: row, error: rpcError } = await supabaseClient.rpc("class_insert_for_school", {
        p_school_id: schoolId,
        p_name: "New Class",
        p_day: "Mon",
        p_time: "09:00",
        p_end_time: "10:00",
        p_price: 150,
        p_tag: "Beginner",
        p_location: "Studio A"
      });
      if (rpcError) {
        const msg = (rpcError.message || "").toLowerCase();
        const hint = msg.includes("could not find") || msg.includes("function") || msg.includes("row-level security") ? "\n\nRun the Supabase migration (SQL Editor \u2192 paste supabase/migrations/20260210100000_login_credentials_rpc.sql and Run) so Add Class works for admins." : "";
        alert("Error adding class: " + (rpcError.message || "Unknown error") + hint);
        return;
      }
      if (row) {
        const created = typeof row === "object" && !Array.isArray(row) ? row : Array.isArray(row) ? row[0] : null;
        if (created) state.classes.push(created);
        else state.classes.push({ id: state.classes.length + 1, name: "New Class", day: "Mon", time: "09:00", end_time: "10:00", price: 150, tag: "Beginner", location: "Studio A", school_id: schoolId });
      }
    } else {
      const newId = state.classes.length ? Math.max(...state.classes.map((c) => c.id)) + 1 : 1;
      state.classes.push({ id: newId, name: "New Class", day: "Mon", time: "09:00", end_time: "10:00", price: 150, tag: "Beginner", location: "Studio A", school_id: schoolId });
    }
    saveState();
    renderView();
  };
  window.removeClass = async (id) => {
    if (supabaseClient) {
      const { error: rpcError } = await supabaseClient.rpc("class_delete_for_school", { p_class_id: id });
      if (rpcError) {
        const { error } = await supabaseClient.from("classes").delete().eq("id", id);
        if (error) {
          alert("Error removing class: " + error.message);
          return;
        }
      }
    }
    state.classes = state.classes.filter((c) => c.id !== id);
    saveState();
    renderView();
  };
  window.saveAllPlans = async () => {
    const subs = state.subscriptions || [];
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    state._plansSaving = true;
    if (window.renderView) renderView();
    if (window.lucide) window.lucide.createIcons();
    try {
      document.querySelectorAll("[data-plan-block]").forEach((block) => {
        const id = block.getAttribute("data-sub-id");
        const sub = subs.find((s) => String(s.id) === id);
        if (!sub) return;
        const get = (field) => {
          const el = block.querySelector('[data-field="' + field + '"]');
          return el ? el.value : void 0;
        };
        const nameVal = get("name");
        if (nameVal !== void 0) sub.name = (nameVal || "").trim();
        const priceVal = get("price");
        if (priceVal !== void 0) sub.price = parseFloat(priceVal) || 0;
        const daysVal = get("validity_days");
        if (daysVal !== void 0) sub.validity_days = parseInt(daysVal, 10) || 30;
        const limitVal = get("limit_count");
        if (limitVal !== void 0) sub.limit_count = limitVal === "" ? 0 : parseInt(limitVal, 10) || 0;
        const privVal = get("limit_count_private");
        if (privVal !== void 0) sub.limit_count_private = privVal === "" ? 0 : parseInt(privVal, 10) || 0;
        const evVal = get("limit_count_events");
        if (evVal !== void 0) sub.limit_count_events = evVal === "" ? 0 : parseInt(evVal, 10) || 0;
        const expVal = get("expiry_date");
        if (expVal !== void 0) sub.expiry_date = (expVal || "").trim();
      });
      for (const sub of subs) {
        const promises = [
          window._updateSubNoRender(sub.id, "name", sub.name),
          window._updateSubNoRender(sub.id, "price", sub.price),
          window._updateSubNoRender(sub.id, "validity_days", sub.validity_days ?? 30),
          window._updateSubNoRender(sub.id, "limit_count", sub.limit_count ?? 0),
          window._updateSubNoRender(sub.id, "limit_count_private", sub.limit_count_private ?? 0),
          window._updateSubNoRender(sub.id, "limit_count_events", sub.limit_count_events ?? 0)
        ];
        if (sub.expiry_date !== void 0) promises.push(window._updateSubNoRender(sub.id, "expiry_date", sub.expiry_date || ""));
        await Promise.all(promises);
      }
      saveState();
      state._plansSaveStatus = t2("saved_success_msg") || "Saved!";
    } finally {
      state._plansSaving = false;
      if (window.renderView) renderView();
      if (window.lucide) window.lucide.createIcons();
    }
    setTimeout(() => {
      state._plansSaveStatus = "";
      if (window.renderView) renderView();
    }, 2500);
  };
  window._updateSubNoRender = async (id, field, value) => {
    const sub = state.subscriptions.find((s) => s.id === id);
    if (!sub) return;
    let val;
    if (field === "price") val = parseFloat(value);
    else if (field === "limit_count") val = value === "" ? 0 : parseInt(value, 10) || 0;
    else if (field === "limit_count_private") val = value === "" ? 0 : parseInt(value, 10) || 0;
    else if (field === "limit_count_events") val = value === "" ? 0 : parseInt(value, 10) || 0;
    else if (field === "validity_days") val = parseInt(value, 10) || 30;
    else val = value;
    if (supabaseClient) {
      const { error: rpcError } = await supabaseClient.rpc("subscription_update_field", { p_id: String(id), p_field: field, p_value: val !== void 0 && val !== null ? String(val) : "" });
      if (rpcError) {
        const { error } = await supabaseClient.from("subscriptions").update({ [field]: val }).eq("id", id);
        if (error) console.error("Subscription update failed:", error);
      }
    }
    sub[field] = val;
  };
  window.updateSub = async (id, field, value) => {
    await window._updateSubNoRender(id, field, value);
    const sub = state.subscriptions.find((s) => s.id === id);
    if (sub) {
      saveState();
      renderView();
    }
  };
  window.addSubscription = async () => {
    const schoolId = state.currentSchool?.id;
    const isPT = state.currentSchool?.profile_type === "private_teacher";
    const defaultGroup = isPT ? 0 : 10;
    const defaultPrivate = isPT ? 10 : 0;
    if (supabaseClient && schoolId) {
      const { data: row, error: rpcError } = await supabaseClient.rpc("subscription_insert_for_school", {
        p_school_id: schoolId,
        p_name: "New Plan",
        p_price: 50,
        p_limit_count: defaultGroup,
        p_validity_days: 30,
        p_limit_count_private: defaultPrivate,
        p_limit_count_events: 0
      });
      if (rpcError) {
        const msg = (rpcError.message || "").toLowerCase();
        const hint = msg.includes("could not find") || msg.includes("function") || msg.includes("row-level security") ? "\n\nRun the Supabase migration (SQL Editor \u2192 paste supabase/migrations/20260210100000_login_credentials_rpc.sql and Run) so Add Plan works for admins." : "";
        alert("Error adding plan: " + (rpcError.message || "Unknown error") + hint);
        return;
      }
      if (row) {
        const created = typeof row === "object" && !Array.isArray(row) ? row : Array.isArray(row) ? row[0] : null;
        if (created) state.subscriptions.push(created);
        else state.subscriptions.push({ id: "S" + Date.now(), name: "New Plan", price: 50, limit_count: defaultGroup, limit_count_private: defaultPrivate, limit_count_events: 0, validity_days: 30, school_id: schoolId });
      }
    } else {
      state.subscriptions.push({ id: "S" + Date.now(), name: "New Plan", price: 50, limit_count: defaultGroup, limit_count_private: defaultPrivate, limit_count_events: 0, validity_days: 30, school_id: schoolId });
    }
    const added = state.subscriptions[state.subscriptions.length - 1];
    state.lastAddedSubscriptionId = added ? added.id : null;
    state.settingsPlansExpanded = true;
    saveState();
    renderView();
  };
  window.removeSubscription = async (id) => {
    if (supabaseClient) {
      const { error: rpcError } = await supabaseClient.rpc("subscription_delete_for_school", { p_sub_id: String(id) });
      if (rpcError) {
        const msg = (rpcError.message || "").toLowerCase();
        const hint = msg.includes("could not find") || msg.includes("function") || msg.includes("row-level security") ? "\n\nRun the Supabase migration (SQL Editor \u2192 paste supabase/migrations/20260210100000_login_credentials_rpc.sql and Run) so Remove Plan works for admins." : "";
        alert("Error removing plan: " + (rpcError.message || "Unknown error") + hint);
        return;
      }
    }
    if (state.lastAddedSubscriptionId === id) state.lastAddedSubscriptionId = null;
    state.subscriptions = state.subscriptions.filter((s) => s.id !== id);
    saveState();
    renderView();
  };
  window.openSchoolDropdown = () => {
    const list = document.getElementById("school-dropdown-list");
    const trigger = document.querySelector(".school-combobox-trigger");
    const chevron = document.querySelector(".school-combobox-chevron");
    const input = document.getElementById("school-search-input");
    const label = document.getElementById("school-trigger-label");
    if (!list || !input) return;
    if (input.disabled) return;
    list.classList.add("open");
    if (trigger) trigger.classList.add("dropdown-open");
    if (chevron) chevron.style.transform = "rotate(180deg)";
    if (label) label.style.display = "none";
    input.style.display = "";
    input.value = "";
    filterSchoolDropdown("");
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!e.target.closest(".school-combobox-container")) {
          closeSchoolDropdown();
          document.removeEventListener("click", closeHandler);
        }
      };
      document.addEventListener("click", closeHandler);
    }, 10);
  };
  window.closeSchoolDropdown = () => {
    const list = document.getElementById("school-dropdown-list");
    const trigger = document.querySelector(".school-combobox-trigger");
    const chevron = document.querySelector(".school-combobox-chevron");
    const input = document.getElementById("school-search-input");
    const label = document.getElementById("school-trigger-label");
    if (list) list.classList.remove("open");
    if (trigger) trigger.classList.remove("dropdown-open");
    if (chevron) chevron.style.transform = "rotate(0deg)";
    if (input) {
      input.blur();
      input.value = "";
      input.style.display = "none";
    }
    if (label) {
      label.style.display = "";
      const t2 = window.t || ((k) => k);
      label.textContent = state.currentSchool?.name || (t2("search_school_placeholder") || t2("select_school_placeholder") || "Select school");
    }
  };
  window.filterSchoolDropdown = (query) => {
    const list = document.getElementById("school-dropdown-list");
    if (!list) return;
    const q = (query || "").trim().toLowerCase();
    const items = list.querySelectorAll(".dropdown-item[data-school-name]");
    const noMatch = list.querySelector(".school-dropdown-no-match");
    let visibleCount = 0;
    const visibleBySection = { schools: 0, teachers: 0 };
    const visibleByCountry = {};
    items.forEach((item) => {
      const name = (item.dataset.schoolName || "").toLowerCase();
      const show = !q || name.includes(q);
      item.style.display = show ? "" : "none";
      if (show) {
        visibleCount++;
        const sec = item.dataset.section || "schools";
        visibleBySection[sec] = (visibleBySection[sec] || 0) + 1;
        const country = item.dataset.country || "";
        const key = sec + "::" + country;
        visibleByCountry[key] = (visibleByCountry[key] || 0) + 1;
      }
    });
    list.querySelectorAll(".school-dropdown-section-header").forEach((h) => {
      const sec = h.dataset.section || "schools";
      h.style.display = (visibleBySection[sec] || 0) > 0 ? "" : "none";
    });
    list.querySelectorAll(".school-dropdown-country-header").forEach((h) => {
      const sec = h.dataset.section || "schools";
      const country = h.dataset.country || "";
      const key = sec + "::" + country;
      h.style.display = (visibleByCountry[key] || 0) > 0 ? "" : "none";
    });
    const divider = list.querySelector(".school-dropdown-section-divider");
    if (divider) divider.style.display = (visibleBySection.teachers || 0) > 0 ? "" : "none";
    if (noMatch) noMatch.style.display = items.length > 0 && visibleCount === 0 ? "" : "none";
  };
  window.handleSchoolComboboxKeydown = (e) => {
    if (e.key === "Escape") {
      closeSchoolDropdown();
    }
  };
  window.toggleSchoolDropdown = () => {
    openSchoolDropdown();
  };
  window.renderAdminStudentCard = (s) => {
    const t2 = (key) => window.t(key);
    const statusLabel = s.paid ? t2("status_active") : t2("status_unpaid");
    const statusClass = s.paid ? "student-card-status-active" : "student-card-status-unpaid";
    const packs = s.active_packs || [];
    const now = /* @__PURE__ */ new Date();
    const activePacks = packs.filter((p) => new Date(p.expires_at) > now);
    const hasUnlimited = s.balance === null || activePacks.some((p) => p.count == null || p.count === "null");
    const balanceStr = hasUnlimited ? "\u221E" : s.balance ?? 0;
    const packsHtml = Array.isArray(s.active_packs) && s.active_packs.length > 0 ? `<span class="packs">${s.active_packs.length} ${s.active_packs.length === 1 ? "Pack" : "Packs"}</span>` : "";
    return `
        <div class="student-card" onclick="updateStudentPrompt('${escapeHtml(s.id)}')">
            <div class="student-card-avatar">${escapeHtml((s.name || "").charAt(0).toUpperCase())}</div>
            <div class="student-card-body">
                <div class="student-card-name">${escapeHtml(s.name)}</div>
                <div class="student-card-meta">
                    ${t2("remaining_classes")}: <span class="balance">${balanceStr}</span>${packsHtml}
                </div>
            </div>
            <span class="student-card-status ${statusClass}">${statusLabel}</span>
            <i data-lucide="chevron-right" size="18" class="student-card-chevron"></i>
        </div>
    `;
  };
  function getFilteredStudents(query) {
    const q = (query || "").toLowerCase().trim();
    const hasPackFilter = state.adminStudentsFilterHasPack || "all";
    const pkgFilter = state.adminStudentsFilterPackage;
    const paidFilter = state.adminStudentsFilterPaid || "all";
    return (state.students || []).filter((s) => {
      if (q && !(s.name || "").toLowerCase().includes(q)) return false;
      const packs = s.active_packs || [];
      const now = /* @__PURE__ */ new Date();
      const activePacks = packs.filter((p) => new Date(p.expires_at) > now);
      const hasActivePack = activePacks.length > 0;
      if (hasPackFilter === "yes" && !hasActivePack) return false;
      if (hasPackFilter === "no" && hasActivePack) return false;
      if (paidFilter === "paid" && !s.paid) return false;
      if (paidFilter === "unpaid" && s.paid) return false;
      if (pkgFilter) {
        const sub = state.subscriptions.find((x) => x.id === pkgFilter || (x.name || "").toLowerCase() === String(pkgFilter).toLowerCase());
        const pkgName = sub ? sub.name : typeof pkgFilter === "string" ? pkgFilter : null;
        if (!pkgName) return false;
        const match = activePacks.some((p) => (p.name || "").toLowerCase().trim() === pkgName.toLowerCase().trim());
        if (!match) return false;
      }
      return true;
    });
  }
  window.filterStudents = (query) => {
    const list = document.getElementById("admin-student-list");
    if (!list) return;
    const q = query !== void 0 ? query : state.adminStudentsSearch || "";
    if (query !== void 0) state.adminStudentsSearch = query;
    const filtered = getFilteredStudents(q);
    list.innerHTML = filtered.map((s) => renderAdminStudentCard(s)).join("");
    const countEl = document.getElementById("students-filter-count");
    if (countEl) {
      const t2 = window.t;
      countEl.textContent = (t2("filter_result_students") || "{count} students").replace("{count}", filtered.length);
    }
    if (window.lucide) lucide.createIcons();
  };
  window.updateStudentPrompt = async (id) => {
    const s = state.students.find((x) => x.id === id);
    if (!s) return;
    const t2 = window.t;
    if (!state.isAdmin || !state.currentSchool?.id) return;
    const adminUsername = (state.currentUser?.name || "").replace(/\s*\(Admin\)\s*$/i, "").trim();
    if (!adminUsername) return;
    const adminPassword = prompt(t2("admin_pass_req") + "\n" + (t2("password_label") || "Password"));
    if (adminPassword == null) return;
    if (supabaseClient) {
      const { data: adminRows, error } = await supabaseClient.rpc("get_admin_by_credentials", {
        p_username: adminUsername,
        p_password: adminPassword,
        p_school_id: state.currentSchool.id
      });
      if (error || !Array.isArray(adminRows) || adminRows.length === 0) {
        alert(t2("invalid_login") || "Invalid admin password.");
        return;
      }
    } else {
      if (adminPassword !== state.currentUser?.password) {
        alert(t2("invalid_login") || "Invalid admin password.");
        return;
      }
    }
    const modal = document.getElementById("student-modal");
    const content = document.getElementById("student-modal-scroll") || document.getElementById("student-modal-content");
    const isDark = document.body.classList.contains("dark-mode");
    const textColor = isDark ? "#ffffff" : "#000000";
    const bgColor = isDark ? "#1c1c1e" : "#f2f2f7";
    content.innerHTML = `
        <div style="text-align: left; width: 100%; min-width: 280px; color: ${textColor}; box-sizing: border-box;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 2rem;">
                <div style="width: 50px; height: 50px; background: ${bgColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #007aff; font-size: 20px;">
                    ${escapeHtml((s.name || "").charAt(0).toUpperCase())}
                </div>
                <div>
                    <h2 style="margin: 0; font-size: 20px; letter-spacing: -0.5px; color: ${textColor};">${escapeHtml(s.name)}</h2>
                    <p style="margin: 0; font-size: 12px; color: #8e8e93;">${escapeHtml(s.id)}</p>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1.2rem; width: 100%; min-width: 260px;">
                <div class="ios-input-group" style="width: 100%; min-width: 0;">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8e8e93; margin-bottom: 6px; letter-spacing: 0.05em;">${t2("full_name_label")}</label>
                    <input type="text" id="edit-student-name" class="minimal-input" value="${escapeHtml(s.name || "")}" style="background: ${bgColor}; color: ${textColor}; border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group" style="width: 100%; min-width: 0;">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8e8e93; margin-bottom: 6px; letter-spacing: 0.05em;">${t2("email_placeholder") || "Email"}</label>
                    <input type="text" id="edit-student-email" class="minimal-input" value="${escapeHtml(s.email || "")}" placeholder="email@example.com" inputmode="email" style="background: ${bgColor}; color: ${textColor}; border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group" style="width: 100%; min-width: 0;">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8e8e93; margin-bottom: 6px; letter-spacing: 0.05em;">${t2("phone")}</label>
                    <input type="text" id="edit-student-phone" class="minimal-input" value="${escapeHtml(s.phone || "")}" style="background: ${bgColor}; color: ${textColor}; border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group password-input-wrap" style="width: 100%; min-width: 0;">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8e8e93; margin-bottom: 6px; letter-spacing: 0.05em;">${t2("password_label")} (${t2("leave_blank_keep") || "leave blank to keep"})</label>
                    <input type="password" id="edit-student-password" class="minimal-input" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autocomplete="new-password" style="background: ${bgColor}; color: ${textColor}; border: none; width: 100%; box-sizing: border-box;">
                    <button type="button" class="password-toggle-btn" onclick="window.togglePasswordVisibility(this)" aria-label="Show password"><i data-lucide="eye" size="20"></i></button>
                </div>

                <div class="ios-input-group" style="width: 100%; min-width: 0;">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8e8e93; margin-bottom: 6px; letter-spacing: 0.05em;">${t2("total_classes_label")}</label>
                    <input type="number" id="edit-student-balance" class="minimal-input" value="${s.balance === null ? "" : s.balance}" placeholder="Ilimitado" style="background: ${bgColor}; color: ${textColor}; border: none; width: 100%; box-sizing: border-box;">
                </div>
                ${state.currentSchool?.profile_type === "private_teacher" || state.adminSettings?.private_classes_offering_enabled === "true" ? `
                <div class="ios-input-group" style="width: 100%; min-width: 0;">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8e8e93; margin-bottom: 6px; letter-spacing: 0.05em;">${t2("private_classes_remaining") || "Private classes"}</label>
                    <input type="number" id="edit-student-balance-private" class="minimal-input" value="${s.balance_private ?? 0}" min="0" style="background: ${bgColor}; color: ${textColor}; border: none; width: 100%; box-sizing: border-box;">
                </div>
                ` : ""}
                ${state.adminSettings?.events_offering_enabled === "true" ? `
                <div class="ios-input-group" style="width: 100%; min-width: 0;">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8e8e93; margin-bottom: 6px; letter-spacing: 0.05em;">${t2("events_remaining") || "Events"}</label>
                    <input type="number" id="edit-student-balance-events" class="minimal-input" value="${s.balance_events ?? 0}" min="0" style="background: ${bgColor}; color: ${textColor}; border: none; width: 100%; box-sizing: border-box;">
                </div>
                ` : ""}

                <div class="ios-input-group" style="width: 100%; min-width: 0;">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8e8e93; margin-bottom: 8px; letter-spacing: 0.05em;">${t2("pack_details_title")}</label>
                    <div style="display: flex; flex-direction: column; gap: 8px; background: ${bgColor}; border-radius: 14px; padding: 4px;">
                        ${(s.active_packs || []).length > 0 ? s.active_packs.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at)).map((p) => `
                            <div style="padding: 12px; border-bottom: 1px solid rgba(142,142,147,0.3); display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 13px; font-weight: 700; color: ${textColor};">${escapeHtml(p.name)}</div>
                                    <div style="font-size: 10px; opacity: 0.6; font-weight: 600; text-transform: uppercase; color: ${textColor};">${p.count == null || p.count === "null" ? "\u221E" : p.count} Clases \u2022 ${t2.expires_label}: ${new Date(p.expires_at).toLocaleDateString()}</div>
                                </div>
                                <button onclick="window.removeStudentPack('${escapeHtml(s.id)}', '${escapeHtml(p.id)}')" style="background: transparent; border: none; color: #ff3b30; padding: 8px; cursor: pointer; opacity: 0.5;">
                                    <i data-lucide="minus-circle" size="16"></i>
                                </button>
                            </div>
                        `).join("") : `<div style="padding: 16px; font-size: 12px; opacity: 0.5; text-align: center; color: ${textColor};">${t2("no_classes_msg")}</div>`}
                    </div>
                </div>

                <div class="ios-input-group" style="width: 100%; min-width: 0;">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8e8e93; margin-bottom: 6px; letter-spacing: 0.05em;">${t2("reg_date_label")}</label>
                    <div style="background: ${bgColor}; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; color: ${textColor};">
                        ${s.created_at ? new Date(s.created_at).toLocaleDateString() : "N/A"}
                    </div>
                </div>

                <div class="ios-input-group" style="width: 100%; min-width: 0;">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8e8e93; margin-bottom: 6px; letter-spacing: 0.05em;">${t2("next_expiry_label")} (Main Timer)</label>
                    <input type="date" id="edit-student-expires" class="minimal-input" value="${s.package_expires_at ? window.formatClassDate(new Date(s.package_expires_at)) : ""}" style="background: ${bgColor}; color: ${textColor}; border: none; width: 100%; box-sizing: border-box;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 2.5rem;">
                <button class="btn-secondary" onclick="document.getElementById('student-modal').classList.add('hidden')" style="height: 50px; border-radius: 14px; font-weight: 600;">${t2("cancel")}</button>
                <button type="button" class="btn-primary" id="save-student-details-btn" onclick="window.saveStudentDetails('${escapeHtml(s.id)}')" style="height: 50px; border-radius: 14px; font-weight: 600;">${t2("save_btn")}</button>
            </div>

            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(142,142,147,0.3);">
                <button onclick="window.deleteStudent('${s.id}')" style="background: rgba(255, 59, 48, 0.05); color: #ff3b30; border: none; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 600; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i data-lucide="user-minus" size="14"></i> ${t2("delete_perm_label")}
                </button>
            </div>
        </div>
    `;
    modal.classList.remove("hidden");
    if (window.lucide) lucide.createIcons();
  };
  window.removeStudentPack = async (studentId, packId) => {
    if (!confirm("\xBFEliminar este paquete? La balanza total se ajustar\xE1.")) return;
    const s = state.students.find((x) => x.id === studentId);
    if (!s || !Array.isArray(s.active_packs)) return;
    s.active_packs = s.active_packs.filter((p) => p.id !== packId);
    s.balance = s.active_packs.reduce((sum, p) => sum + (parseInt(p.count) || 0), 0);
    if (s.active_packs.length === 0) {
      s.paid = false;
      s.package = null;
      s.package_expires_at = null;
    } else {
      s.package_expires_at = s.active_packs.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at))[0].expires_at;
    }
    if (supabaseClient) {
      const { error } = await supabaseClient.from("students").update({
        active_packs: s.active_packs,
        balance: s.balance,
        paid: s.paid,
        package: s.package,
        package_expires_at: s.package_expires_at
      }).eq("id", studentId);
      if (error) {
        alert("Error updating database: " + error.message);
        return;
      }
    }
    saveState();
    window.updateStudentPrompt(studentId);
  };
  window.saveStudentDetails = async (id) => {
    const s = state.students.find((x) => x.id === id);
    if (!s) return;
    const t2 = typeof window.t === "function" ? window.t : (k) => k;
    const btn = document.getElementById("save-student-details-btn");
    const originalText = btn ? btn.textContent : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2" class="spin" size="18" style="margin-right: 6px;"></i> ' + (t2("saving_label") || "Saving\u2026");
      if (window.lucide) window.lucide.createIcons();
    }
    const newName = document.getElementById("edit-student-name").value.trim();
    const newEmail = document.getElementById("edit-student-email")?.value.trim() ?? "";
    const newPhone = document.getElementById("edit-student-phone").value.trim();
    const newPassword = document.getElementById("edit-student-password")?.value ?? "";
    const balanceVal = document.getElementById("edit-student-balance").value;
    const expiresVal = document.getElementById("edit-student-expires").value;
    const balancePrivateEl = document.getElementById("edit-student-balance-private");
    const balanceEventsEl = document.getElementById("edit-student-balance-events");
    const balancePrivateVal = balancePrivateEl ? balancePrivateEl.value : null;
    const balanceEventsVal = balanceEventsEl ? balanceEventsEl.value : null;
    if (!newName) {
      alert("Nombre is required.");
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
        if (window.lucide) window.lucide.createIcons();
      }
      return;
    }
    const schoolId = s.school_id || state.currentSchool?.id;
    if (supabaseClient && schoolId) {
      const payload = {
        p_student_id: id,
        p_school_id: schoolId,
        p_name: newName,
        p_email: newEmail || null,
        p_phone: newPhone,
        p_password: newPassword || null,
        p_balance: balanceVal === "" ? null : parseInt(balanceVal, 10),
        p_package_expires_at: expiresVal ? new Date(expiresVal).toISOString() : null
      };
      if (balancePrivateEl) payload.p_balance_private = Math.max(0, parseInt(balancePrivateVal, 10) || 0);
      if (balanceEventsEl) payload.p_balance_events = Math.max(0, parseInt(balanceEventsVal, 10) || 0);
      const { error } = await supabaseClient.rpc("update_student_details", payload);
      if (error) {
        alert("Error saving: " + error.message);
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
          if (window.lucide) window.lucide.createIcons();
        }
        return;
      }
    }
    const updates = {
      name: newName,
      email: newEmail || null,
      phone: newPhone,
      balance: balanceVal === "" ? null : parseInt(balanceVal, 10),
      package_expires_at: expiresVal ? new Date(expiresVal).toISOString() : null
    };
    if (balancePrivateEl) updates.balance_private = Math.max(0, parseInt(balancePrivateVal, 10) || 0);
    if (balanceEventsEl) updates.balance_events = Math.max(0, parseInt(balanceEventsVal, 10) || 0);
    Object.assign(s, updates);
    if (newPassword) s.password = newPassword;
    saveState();
    if (btn) {
      btn.innerHTML = '<i data-lucide="check" size="18" style="margin-right: 6px;"></i> ' + (t2("saved_success_msg") || "Saved!");
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        document.getElementById("student-modal").classList.add("hidden");
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
          if (window.lucide) window.lucide.createIcons();
        }
        renderView();
      }, 1500);
    } else {
      document.getElementById("student-modal").classList.add("hidden");
      renderView();
    }
  };

  // src/main.js
  if (typeof window !== "undefined") {
    window.parseHashRoute = parseHashRoute;
    window.parseQueryAndHashForView = parseQueryAndHashForView;
    window.navigateToAdminJackAndJill = navigateToAdminJackAndJill;
    window.navigateToStudentJackAndJill = navigateToStudentJackAndJill;
    window.escapeHtml = escapeHtml2;
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
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    window.addEventListener("scroll", () => {
      window.updateStickyFooterVisibility();
    }, { passive: true });
    document.getElementById("lang-toggle").addEventListener("click", () => {
      state.language = state.language === "en" ? "es" : "en";
      saveState();
      updateI18n();
      window.renderView();
    });
    document.getElementById("dev-login-trigger").addEventListener("click", () => window.promptDevLogin());
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const target = e.target;
        if (target.id === "dev-pass-input") window.submitDevLogin();
        if (target.id === "auth-pass" || target.id === "auth-pass-confirm") {
          const isSignup = state.authMode === "signup";
          if (isSignup) window.signUpStudent();
          else window.loginStudent();
        }
        if (target.id === "admin-pass-input") window.loginAdminWithCreds();
      }
    });
    document.getElementById("logout-btn").addEventListener("click", () => window.logout());
    document.getElementById("close-scanner").addEventListener("click", () => window.stopScanner());
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        state.currentView = view;
        if (view === "dashboard-profile") {
          window.location.hash = "#/dashboard/profile";
        } else if (view !== "admin-competition-jack-and-jill" && view !== "student-competition-register") {
          window.location.hash = "";
        }
        saveState();
        window.renderView();
        window.scrollTo(0, 0);
        if (view === "qr" && state.currentUser && !state.isAdmin && state.currentUser.id && (state.currentUser.school_id || state.currentSchool?.id) && supabaseClient) {
          window.fetchAllData();
        }
      });
    });
    document.getElementById("theme-toggle").addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      document.body.setAttribute("data-theme", state.theme);
      document.body.classList.toggle("dark-mode", state.theme === "dark");
      const icon = state.theme === "dark" ? "moon" : "sun";
      document.getElementById("theme-icon").setAttribute("data-lucide", icon);
      saveState();
      if (typeof window.lucide !== "undefined" && window.lucide.createIcons) window.lucide.createIcons();
    });
    let logoPressTimer;
    let superAdminTimer;
    let isLongPress = false;
    const logoEl = document.querySelector(".logo");
    if (logoEl) {
      logoEl.addEventListener("mousedown", () => {
        isLongPress = false;
        logoPressTimer = setTimeout(() => {
          isLongPress = true;
          state.isAdmin = !state.isAdmin;
          state.currentView = state.isAdmin ? "admin-students" : state.currentSchool?.profile_type === "private_teacher" ? "teacher-booking" : "schedule";
          window.renderView();
          window.scrollTo(0, 0);
        }, 2e3);
        superAdminTimer = setTimeout(() => {
          isLongPress = true;
          state.currentView = "super-admin-dashboard";
          window.renderView();
          window.scrollTo(0, 0);
        }, 5e3);
      });
      logoEl.addEventListener("mouseup", () => {
        clearTimeout(logoPressTimer);
        clearTimeout(superAdminTimer);
      });
      logoEl.addEventListener("click", () => {
        if (!isLongPress) window.logout();
      });
    }
    ["mousedown", "keydown", "touchstart", "scroll"].forEach((evt) => {
      window.addEventListener(evt, window.resetInactivityTimer, { passive: true });
    });
    (async function init() {
      const path = (window.location.pathname || "").replace(/\/$/, "") || "/";
      if (path === "/discovery" || path.startsWith("/discovery/")) {
        state.discoveryPath = path;
      }
      parseQueryAndHashForView();
      const params = new URLSearchParams(window.location.search);
      const mockDateStr = params.get("mockDate");
      if (mockDateStr) {
        const d = new Date(mockDateStr);
        if (!isNaN(d.getTime())) state.mockDate = mockDateStr;
      }
      const local = localStorage.getItem("dance_app_state");
      let saved = {};
      try {
        saved = local ? JSON.parse(local) : {};
      } catch (_) {
        saved = {};
      }
      if (local && !state.discoveryPath) {
        state.language = saved.language || "en";
        state.theme = saved.theme || "dark";
        if (saved.currentUser) state.currentUser = saved.currentUser;
        if (saved.isAdmin !== void 0) state.isAdmin = saved.isAdmin;
        if (saved.isPlatformDev !== void 0) state.isPlatformDev = saved.isPlatformDev;
        if (saved.currentView) state.currentView = saved.currentView;
        if (saved.scheduleView) state.scheduleView = saved.scheduleView;
        if (saved.lastActivity) state.lastActivity = saved.lastActivity;
        if (saved.currentSchool) state.currentSchool = saved.currentSchool;
        if (saved._discoveryOnlyEdit !== void 0) state._discoveryOnlyEdit = !!saved._discoveryOnlyEdit;
        if (state.currentView === "discovery-profile-only") state._discoveryOnlyEdit = true;
        if (saved.currentUser?.school_id && !saved.isAdmin) {
          const match = saved.currentSchool && saved.currentSchool.id === saved.currentUser.school_id;
          state.currentSchool = match ? saved.currentSchool : { id: saved.currentUser.school_id, name: saved.currentSchool?.name || "School" };
        }
        const hasUserState = !!(saved.currentUser || saved.isAdmin || saved.isPlatformDev);
        if (hasUserState && !sessionIdentityMatches(saved)) {
          clearSessionIdentity();
          state.currentUser = null;
          state.isAdmin = false;
          state.isPlatformDev = false;
          state._discoveryOnlyEdit = false;
          state.currentView = "school-selection";
          state.currentSchool = null;
          state.competitionId = null;
          state.competitionSchoolId = null;
          state.competitionTab = null;
          window.clearSchoolData();
          saveState();
        }
      }
      if (state.discoveryPath && local) {
        state.language = saved.language || state.language || "en";
        state.theme = saved.theme || state.theme || "dark";
        if (saved.currentUser) state.currentUser = saved.currentUser;
        if (saved.lastActivity) state.lastActivity = saved.lastActivity;
        if (saved._discoveryOnlyEdit !== void 0) state._discoveryOnlyEdit = !!saved._discoveryOnlyEdit;
      }
      updateI18n();
      document.body.setAttribute("data-theme", state.theme);
      document.body.classList.toggle("dark-mode", state.theme === "dark");
      window.renderView();
      if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
      const hasAuthState = !!(state.currentUser || state.isAdmin || state.isPlatformDev);
      const sessRes = supabaseClient ? await supabaseClient.auth.getSession() : { data: { session: null } };
      const hasSupabaseSession = !!sessRes?.data?.session?.user;
      if (hasAuthState && !hasSupabaseSession) {
        state.currentUser = null;
        state.isAdmin = false;
        state.isPlatformDev = false;
        state._discoveryOnlyEdit = false;
        state.currentView = "school-selection";
        state.currentSchool = null;
        if (local) saveState();
      } else if (!hasAuthState && hasSupabaseSession && supabaseClient && sessRes?.data?.session?.user) {
        const user = sessRes.data.session.user;
        state.currentUser = { id: user.id, email: user.email ?? user.user_metadata?.email ?? "", role: "student", school_id: null };
        state.isAdmin = false;
        state.isPlatformDev = false;
        state._discoveryOnlyEdit = true;
        setSessionIdentity();
        if (typeof window.fetchUserProfile === "function") await window.fetchUserProfile();
        saveState();
        window.renderView();
      }
      window.checkInactivity();
      if (window.location.hash) parseHashRoute();
      if (saved.currentView && saved.currentView.startsWith("admin-competition") && !window.location.hash) {
        state.competitionId = saved.competitionId || null;
        state.competitionSchoolId = saved.competitionSchoolId || null;
        state.competitionTab = saved.competitionTab || "edit";
      }
      if (saved.currentView && saved.currentView === "student-competition-register" && !window.location.hash) {
        state.competitionId = saved.competitionId || null;
      }
      if (saved.currentUser && !saved.isAdmin && saved.currentView === "student-competition-register" && !window.location.hash) {
        state.currentView = "qr";
        state.competitionId = null;
        state.studentCompetitionDetail = null;
        state.studentCompetitionRegDetail = null;
      }
      const isStudent = state.currentUser && state.currentUser.school_id && state.currentUser.role !== "admin" && state.currentUser.role !== "platform-dev" && !state.isPlatformDev;
      const adminViews = ["admin-competition-jack-and-jill", "admin-students", "admin-scanner", "admin-memberships", "admin-revenue", "admin-settings"];
      const isAdminView = adminViews.includes(state.currentView) || state.currentView && state.currentView.startsWith("admin-");
      if (isStudent && isAdminView) {
        state.isAdmin = false;
        state.currentView = saved.currentView === "qr" || saved.currentView === "shop" || saved.currentView === "schedule" || saved.currentView === "teacher-booking" ? saved.currentView : "qr";
        state.competitionId = null;
        state.competitionSchoolId = null;
        state.competitionTab = "edit";
        window.location.hash = "";
        if (local) saveState();
      }
      updateI18n();
      document.body.setAttribute("data-theme", state.theme);
      document.body.classList.toggle("dark-mode", state.theme === "dark");
      if (state.discoveryPath && supabaseClient) {
        await window.fetchDiscoveryData();
      }
      if (supabaseClient && (state.currentUser || state.isAdmin || state.isPlatformDev)) {
        const sessRes2 = await supabaseClient.auth.getSession();
        if (sessRes2?.data?.session && typeof window.fetchUserProfile === "function") {
          await window.fetchUserProfile();
        }
      }
      window.renderView();
      if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
      window.addEventListener("popstate", () => {
        const path2 = (window.location.pathname || "").replace(/\/$/, "") || "/";
        if (path2 === "/discovery" || path2.startsWith("/discovery/")) {
          state.discoveryPath = path2;
          window.fetchDiscoveryData().then(() => window.renderView());
        } else {
          state.discoveryPath = null;
          window.renderView();
        }
      });
      window.addEventListener("hashchange", () => {
        if (parseHashRoute()) {
          saveState();
          window.renderView();
          if (state.currentView === "admin-competition-jack-and-jill" && state.competitionTab === "registrations" && state.competitionId && supabaseClient) {
            state.currentCompetition = (state.competitions || []).find((c) => c.id === state.competitionId || String(c.id) === String(state.competitionId)) || null;
            window.fetchCompetitionRegistrations(state.competitionId);
          }
        }
      });
      document.addEventListener("click", (e) => {
        const resendBtn = e.target.closest(".resend-verification-btn");
        if (resendBtn && !resendBtn.disabled) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof window.resendVerificationEmail === "function") window.resendVerificationEmail();
          return;
        }
        const renameSchoolBtn = e.target.closest('[data-action="rename-school"]');
        if (renameSchoolBtn) {
          e.preventDefault();
          e.stopPropagation();
          const id = renameSchoolBtn.getAttribute("data-school-id");
          if (id && typeof window.renameSchool === "function") window.renameSchool(id);
          return;
        }
        const delSchoolBtn = e.target.closest('[data-action="delete-school"]');
        if (delSchoolBtn) {
          e.preventDefault();
          e.stopPropagation();
          const id = delSchoolBtn.getAttribute("data-school-id");
          if (id && typeof window.deleteSchool === "function") window.deleteSchool(id);
          return;
        }
        const submitSchoolBtn = e.target.closest('[data-action="submit-new-school"]');
        if (submitSchoolBtn) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof window.submitNewSchoolWithAdmin === "function") window.submitNewSchoolWithAdmin();
          return;
        }
        const btn = e.target.closest('[data-action="openCreateNewCompetition"]');
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof window.openCreateNewCompetition === "function") window.openCreateNewCompetition();
          return;
        }
        const regBtn = e.target.closest('[data-action="openRegistrations"]');
        if (regBtn) {
          e.preventDefault();
          e.stopPropagation();
          const id = regBtn.getAttribute("data-competition-id");
          if (id) {
            state.competitionId = id;
            state.currentCompetition = (state.competitions || []).find((c) => c.id === id) || null;
            state.competitionTab = "registrations";
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
          const regId = answersBtn.getAttribute("data-reg-id");
          if (regId && typeof window.openRegistrationAnswers === "function") window.openRegistrationAnswers(regId);
          return;
        }
        const copyCompBtn = e.target.closest('[data-action="copyCompetition"]');
        if (copyCompBtn) {
          e.preventDefault();
          e.stopPropagation();
          const id = copyCompBtn.getAttribute("data-competition-id");
          if (id && typeof window.copyCompetition === "function") window.copyCompetition(id);
          return;
        }
        const deleteCompBtn = e.target.closest('[data-action="deleteCompetition"]');
        if (deleteCompBtn) {
          e.preventDefault();
          e.stopPropagation();
          const id = deleteCompBtn.getAttribute("data-competition-id");
          if (id && typeof window.deleteCompetition === "function") window.deleteCompetition(id);
        }
      });
      if (!state.discoveryPath) {
        if (state.currentView === "discovery-profile-only" && state.currentSchool?.id) {
          await window.fetchAllData();
          window.renderView();
          if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
        } else {
          window.fetchAllData();
        }
      }
      setInterval(() => {
        const isFocussed = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "");
        const isModalOpen = document.querySelector(".modal:not(.hidden)");
        const isEditingClasses = state.currentView === "admin-settings";
        const recentlyEditedClass = state._lastClassEditAt && Date.now() - state._lastClassEditAt < 15e3;
        if (state.currentUser && !state.discoveryPath && !isFocussed && !isModalOpen && !isEditingClasses && !recentlyEditedClass) {
          window.fetchAllData();
        }
      }, 12e4);
      setInterval(() => {
        window.checkInactivity();
      }, 6e4);
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".custom-dropdown-container")) {
          document.querySelectorAll(".custom-dropdown-list").forEach((el) => {
            if (el.id === "school-dropdown-list" && el.classList.contains("open") && typeof window.closeSchoolDropdown === "function") {
              window.closeSchoolDropdown();
            } else {
              el.classList.remove("open");
            }
          });
        }
      });
    })();
  }
})();
