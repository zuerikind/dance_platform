// --- SUPABASE CONFIG ---
const SUPABASE_URL = 'https://fziyybqhecfxhkagknvg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aXl5YnFoZWNmeGhrYWdrbnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDYwNDAsImV4cCI6MjA4NTk4MjA0MH0.wX7oIivqTbfBTMsIwI9zDgKk5x8P4mW3M543OgzwqCs';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// --- TRANSLATIONS ---
// --- TRANSLATIONS (DANCE_LOCALES) ---
const DANCE_LOCALES = {
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
        admin_title: "Administrator",
        no_subs: "No active memberships found",
        scan_success: "Verification Successful",
        scan_fail: "Membership Inactive",
        switch_to_admin: "Go to Admin",
        switch_to_student: "Go to Student",
        auth_title: "Bailadmin",
        auth_subtitle: "Precision in every step.",
        student_signup: "New Student",
        admin_login: "Admin login",
        enter_name: "How should we call you?",
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
        mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
        valid_month: "Valid for one month",
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
        nav_revenue: 'Revenue',
        monthly_total: 'This Month Total',
        all_payments: 'Payment History',
        total_earned: 'Total Earned',
        approved: 'Approved',
        rejected: 'Not Approved',
        pending: 'Pending',
        check_in_title: "Check-In Attendance",
        one_class: "1 Class",
        two_classes: "2 Classes",
        cancel: "Cancel",
        confirm_attendance: "Confirm Attendance",
        admin_user_placeholder: "Admin Username",
        admin_pass_placeholder: "Admin Password",
        admin_login_btn: "Admin Login",
        admin_access_trigger: "• ADMIN ACCESS •",
        add_student: "+ Student",
        add_admin: "+ Admin",
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
        limit_classes_label: "Class Limit",
        price_mxd_label: "Price MXD",
        transfer_details_label: "Transfer Details",
        bank_name_label: "Bank Name",
        holder_name_label: "Holder Name",
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
        enter_student_name: "Enter student name:",
        enter_student_phone: "Enter student phone:",
        enter_student_pass: "Enter student password:",
        student_created: "Student created!",
        unknown_student: "Unknown Student",
        delete_payment_confirm: "Delete this payment record forever?",
        select_school_title: "Welcome to Bailadmin",
        select_school_subtitle: "Please select your school or teacher to continue",
        add_school_btn: "+ New School",
        enter_school_name: "Enter new school or teacher name:",
        school_created: "School created successfully!",
        switch_school: "Switch School"
    },
    es: {
        nav_schedule: "Horario",
        nav_shop: "Planes",
        nav_qr: "Mi Pase",
        nav_students: "Alumnos",
        nav_scan: "Escanear",
        nav_settings: "Ajustes",
        schedule_title: "Horario de Clases",
        shop_title: "Planes de Suscripción",
        qr_title: "Tu Pase de Acceso",
        qr_subtitle: "Preséntalo en la entrada del salón",
        buy: "Comprar Ahora",
        active: "Acceso Permitido",
        inactive: "Pago Pendiente",
        pay_status: "Estado de Membresía",
        student_id: "ID de Miembro",
        admin_title: "Administración",
        no_subs: "Sin membresías activas",
        scan_success: "Verificación Exitosa",
        scan_fail: "Membresía Inactiva",
        switch_to_admin: "Ir a Admin",
        switch_to_student: "Ir a Alumno",
        auth_title: "Bailadmin",
        auth_subtitle: "Eleva tu baile.",
        student_signup: "Nuevo Alumno",
        admin_login: "Acceso Admin",
        enter_name: "¿Cómo te llamas?",
        signup_btn: "Unirme Ahora",
        logout: "Cerrar Sesión",
        admin_subtitle: "Gestiona tu academia",
        classes_subtitle: "Próximas sesiones y talleres",
        username: "Usuario",
        password: "Contraseña",
        login_btn: "Entrar",
        invalid_login: "Credenciales inválidas",
        remaining_classes: "Clases Restantes",
        unlimited: "Ilimitado",
        already_account: "¿Ya tienes cuenta?",
        no_account: "¿No tienes cuenta?",
        sign_in: "Entrar",
        sign_up: "Registrarse",
        student_login: "Acceso Alumno",
        phone: "Teléfono",
        list_view: "Lista",
        weekly_view: "Plan Semanal",
        mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes", sat: "Sábado", sun: "Domingo",
        valid_month: "Válido por un mes",
        nav_memberships: "Membresías",
        pending_payments: "Pagos Pendientes",
        approve: "Aprobar",
        reject: "Rechazar",
        nav_revenue: 'Ganancias',
        monthly_total: 'Total este mes',
        all_payments: 'Historial de pagos',
        total_earned: 'Total ganado',
        approved: 'Aprobado',
        rejected: 'No Aprobado',
        pending: 'Pendiente',
        transfer: "Transferencia",
        cash: "Efectivo",
        payment_instructions: "Instrucciones de Pago",
        i_have_paid: "Ya transferí",
        pay_cash: "Pagaré en efectivo",
        request_sent_title: "¡Gracias por tu pago!",
        request_sent_msg: "Tu acceso será activado una vez que validemos el pago.",
        close: "Cerrar",
        check_in_title: "Confirmar Asistencia",
        one_class: "1 Clase",
        two_classes: "2 Clases",
        cancel: "Cancelar",
        confirm_attendance: "Confirmar Asistencia",
        attendance_success: "¡Asistencia confirmada!",
        attendance_error: "Error en la asistencia",
        admin_user_placeholder: "Usuario Admin",
        admin_pass_placeholder: "Contraseña Admin",
        admin_login_btn: "Inicia Sesión Admin",
        admin_access_trigger: "• ACCESO ADMIN •",
        add_student: "+ Alumno",
        add_admin: "+ Administrador",
        status_active: "Activo",
        status_unpaid: "Impago",
        balance_label: "Saldo",
        plan_label: "Plan",
        none_label: "Ninguno",
        mark_paid: "Marcar como Pagado",
        mark_unpaid: "Marcar como Impago",
        history_label: "Historial",
        scan_cta_desc: "Verifica la precisión de la entrada.",
        initiate_scan_btn: "Iniciar Escaneo",
        classes_label: "Clases",
        add_label: "Añadir",
        plans_label: "Planes",
        limit_classes_label: "Límite de Clases",
        price_mxd_label: "Precio MXD",
        transfer_details_label: "Detalles de Transferencia",
        bank_name_label: "Nombre del Banco",
        holder_name_label: "Nombre des Titular",
        save_bank_btn: "Guardar Detalles",
        saved_success_msg: "¡Guardado con éxito!",
        balance_manual_label: "Saldo Manual",
        no_classes_msg: "Sin clases",
        select_plan_msg: "Selecciona tu plan de membresía.",
        delete_student_confirm: "¿Estás seguro de eliminar a este alumno? Se perderá todo su progreso.",
        not_found_msg: "No Encontrado",
        not_enough_balance: "¡No hay suficientes clases disponibles!",
        enter_admin_user: "Ingresa el nombre de usuario del admin:",
        enter_admin_pass: "Ingresa la contraseña del admin:",
        admin_created: "¡Admin creado!",
        enter_student_name: "Ingresa el nombre del alumno:",
        enter_student_phone: "Ingresa el teléfono del alumno:",
        enter_student_pass: "Ingresa la contraseña del alumno:",
        student_created: "¡Alumno creado!",
        unknown_student: "Alumno Desconocido",
        delete_payment_confirm: "¿Eliminar este registro de pago permanentemente?",
        select_school_title: "Bienvenido a Bailadmin",
        select_school_subtitle: "Por favor selecciona tu escuela o profesor para continuar",
        add_school_btn: "+ Nueva Escuela",
        enter_school_name: "Ingresa el nombre de la nueva escuela o profesor:",
        school_created: "¡Escuela creada con éxito!",
        switch_school: "Cambiar Escuela"
    }
};

const APP_VERSION = '1.6';

// --- STATE ---
let state = {
    version: APP_VERSION,
    currentUser: null,
    classes: [],
    subscriptions: [],
    students: [],
    language: 'en',
    currentView: 'auth',
    scheduleView: 'weekly', // 'list' or 'weekly'
    authMode: 'login',
    theme: 'dark',
    isAdmin: false,
    paymentRequests: [],
    adminSettings: {},
    lastActivity: Date.now(),
    schools: [],
    currentSchool: null
};

// --- DATA FETCHING ---
async function fetchAllData() {
    if (!window.supabase) return;

    try {
        // First, always fetch schools
        const { data: schoolsData } = await supabaseClient.from('schools').select('*').order('name');
        if (schoolsData) state.schools = schoolsData;

        // If no school is selected, we can't fetch tenant-specific data
        if (!state.currentSchool) {
            state.currentView = 'school-selection';
            renderView();
            return;
        }

        const sid = state.currentSchool.id;

        const [classesRes, subsRes, studentsRes, requestsRes, settingsRes] = await Promise.all([
            supabaseClient.from('classes').select('*').eq('school_id', sid).order('id'),
            supabaseClient.from('subscriptions').select('*').eq('school_id', sid).order('name'),
            supabaseClient.from('students').select('*').eq('school_id', sid).order('name'),
            supabaseClient.from('payment_requests').select('*, students(name)').eq('school_id', sid).order('created_at', { ascending: false }),
            supabaseClient.from('admin_settings').select('*').eq('school_id', sid)
        ]);

        if (classesRes.data) state.classes = classesRes.data;
        if (subsRes.data) state.subscriptions = subsRes.data;
        if (studentsRes.data) {
            state.students = studentsRes.data;
            // SYNC: Update currentUser if they are a student to show latest balance
            if (state.currentUser && !state.isAdmin) {
                const updatedMe = state.students.find(s => s.id === state.currentUser.id);
                if (updatedMe) {
                    state.currentUser = { ...updatedMe, role: 'student' };
                    saveState();
                }
            }
        }
        if (requestsRes.data) state.paymentRequests = requestsRes.data;
        if (settingsRes.data) {
            const settingsObj = {};
            settingsRes.data.forEach(item => {
                settingsObj[item.key] = item.value;
            });
            state.adminSettings = settingsObj;
        }

        renderView();
    } catch (err) {
        console.error("Error fetching data:", err);
    }
}

// --- LOGIC ---
function saveState() {
    localStorage.setItem('dance_app_state', JSON.stringify({
        language: state.language,
        theme: state.theme,
        currentUser: state.currentUser,
        isAdmin: state.isAdmin,
        currentView: state.currentView,
        scheduleView: state.scheduleView,
        lastActivity: state.lastActivity,
        currentSchool: state.currentSchool
    }));
}

// Security: Session Timeout Logic
const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 Minutes

window.resetInactivityTimer = () => {
    // Throttled persistence: Only update storage if 30s have passed to save resources
    const now = Date.now();
    if (now - state.lastActivity > 30000) {
        state.lastActivity = now;
        saveState();
    } else {
        state.lastActivity = now; // Update local state regardless
    }
};

window.checkInactivity = () => {
    if (!state.currentUser) return;
    const now = Date.now();
    const idleTime = now - state.lastActivity;
    if (idleTime > INACTIVITY_LIMIT) {
        console.warn("Session expired due to inactivity.");
        window.logout();
    }
};

// Bulletproof translation helper
window.t = function (key) {
    const lang = state.language || 'en';
    const dict = DANCE_LOCALES[lang] || DANCE_LOCALES.en;
    const val = dict[key] || DANCE_LOCALES.en[key] || `[${key}]`;
    console.log(`[T] ${key} (${lang}) => ${val}`);
    if (!dict[key]) console.warn(`Translation missing: ${key} for lang: ${lang}`);
    return val;
};

// Standard static update
function updateI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = window.t(key);
    });
    const langIndicator = document.getElementById('lang-text');
    if (langIndicator) langIndicator.textContent = (state.language || 'EN').toUpperCase();
}

function renderView() {
    const root = document.getElementById('app-root');
    const view = state.currentView;
    const isSignup = state.authMode === 'signup';

    // Magic Proxy: supports both t.key and t('key')
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });

    let html = `<div class="container ${view === 'auth' ? 'auth-view' : ''} slide-in">`;

    if (view === 'school-selection') {
        html += `
            <div class="auth-page-container" style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
                <div class="card" style="max-width: 440px; width: 90%; text-align: center; border-radius: 40px; padding: 3rem 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                    <div style="margin-bottom: 2rem;">
                        <img src="logo.png" alt="Bailadmin" style="width: 80px; height: 80px; margin-bottom: 1.5rem; filter: drop-shadow(0 0 10px rgba(45, 212, 191, 0.3));">
                        <h1 style="margin: 0; font-size: 2.2rem; font-weight: 800; letter-spacing: -0.04em;">Bailadmin</h1>
                        <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem; font-weight: 500;">${t.select_school_subtitle}</p>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                        <div style="position: relative;">
                            <select id="school-selector" class="glass-input" style="width: 100%; padding: 1.2rem; appearance: none; font-weight: 600; font-size: 1rem; text-align: center; cursor: pointer; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.05);">
                                <option value="" disabled selected>-- Elige tu academia --</option>
                                ${state.schools.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                            <div style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); pointer-events: none; opacity: 0.5;">
                                <i data-lucide="chevron-down" size="20"></i>
                            </div>
                        </div>

                        <button id="select-school-btn" class="btn-auth-primary" onclick="window.confirmSchoolSelection()" style="width: 100%; padding: 1.2rem; border-radius: 18px; background: var(--secondary); color: #000; font-weight: 800; font-size: 1.1rem;">
                            ${t.sign_in}
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else if (view === 'super-admin-dashboard') {
        html += `
            <div style="padding: 2rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 3rem;">
                    <h1 style="margin:0;">Platform Super Admin</h1>
                    <button class="btn-primary" onclick="createNewSchool()">${t.add_school_btn}</button>
                </div>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
                    ${state.schools.map(s => `
                        <div class="card" style="padding: 1.5rem; border-radius: 20px;">
                            <h3 style="margin-bottom: 0.5rem;">${s.name}</h3>
                            <div class="text-muted" style="font-size: 0.8rem; margin-bottom: 1rem;">ID: ${s.id}</div>
                            <button class="btn-secondary w-full" onclick="selectSchool('${s.id}')">Manage School</button>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-icon mt-4" onclick="setState({currentView: 'school-selection'})" style="margin-top: 2rem;">Back to Selection</button>
            </div>
        `;
    } else if (view === 'auth') {
        const isSignup = state.authMode === 'signup';
        html += `
            <div class="auth-page-container">
                <div style="position: fixed; bottom: 10px; right: 10px; font-size: 10px; color: rgba(255,255,255,0.1); z-index: 9999;">V2.1-REBUILT</div>
                <div class="landing-grid">
                    <!-- LEFT / TOP: HERO SECTION -->
                    <div class="hero-section">
                        <div class="auth-logo-container">
                            <img src="logo.png" class="auth-logo">
                        </div>
                        
                        <div class="text-center" style="margin-bottom: 2rem; width: 100%;">
                            <h1 class="auth-title">${window.t('auth_title')}</h1>
                            <p class="auth-subtitle">${window.t('auth_subtitle')}</p>
                        </div>
                    </div>

                    <!-- RIGHT / BOTTOM: AUTH CARD -->
                    <div class="auth-card-container">
                        <div class="auth-card">
                            <div style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1.5rem; letter-spacing: -0.02em; text-align: center;">
                            ${isSignup ? window.t('student_signup') : window.t('student_login')}
                            </div>

                            <div class="auth-input-group">
                                ${isSignup ? `
                                    <input type="text" id="auth-name" class="minimal-input" placeholder="${window.t('enter_name')}">
                                    <input type="text" id="auth-phone" class="minimal-input" placeholder="${window.t('phone')}">
                                ` : `
                                    <input type="text" id="auth-name" class="minimal-input" placeholder="${window.t('username')}">
                                `}
                                <input type="password" id="auth-pass" class="minimal-input" placeholder="${window.t('password')}">
                            </div>

                            <div class="auth-actions">
                                <button class="btn-auth-primary" onclick="${isSignup ? 'signUpStudent()' : 'loginStudent()'}">
                                    ${isSignup ? window.t('sign_up') : window.t('sign_in')}
                                </button>
                                
                                <p class="text-muted text-center" style="font-size: 0.85rem; margin-top: 1rem;">
                                    ${isSignup ? window.t('already_account') : window.t('no_account')}
                                    <a href="#" onclick="switchAuthMode(); return false;" style="color: var(--text); font-weight: 700; text-decoration: none; border-bottom: 1.5px solid var(--border);">
                                        ${isSignup ? window.t('sign_in') : window.t('sign_up')}
                                    </a>
                                </p>
                            </div>
                            
                            <div class="admin-trigger-container" style="margin-top: 2.5rem; text-align: center;">
                                <button id="admin-show-btn" style="opacity: 0.3; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; background: none; border: none; color: var(--text-muted); cursor: pointer;" onclick="showAdminFields()">${window.t('admin_access_trigger')}</button>
                                <div id="admin-fields" class="hidden slide-in" style="margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
                                    <input type="text" id="admin-user-input" class="minimal-input" placeholder="${window.t('admin_user_placeholder')}" style="margin-bottom: 0.8rem;">
                                    <input type="password" id="admin-pass-input" class="minimal-input" placeholder="${window.t('admin_pass_placeholder')}" style="margin-bottom: 1rem;">
                                    <button id="admin-login-button" class="btn-auth-primary" onclick="loginAdminWithCreds()" style="background: var(--text-muted); padding: 1rem;">
                                        ${window.t('admin_login_btn')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    else if (view === 'schedule') {
        html += `<h1 style="margin-bottom: 0.5rem;">${t.schedule_title}</h1>`;
        html += `<p class="text-muted" style="margin-bottom: 1.5rem; font-size: 1.1rem;">${t.classes_subtitle}</p>`;

        // View Toggle
        html += `
            <div class="segment-control">
                <button class="segment-item ${state.scheduleView === 'list' ? 'active' : ''}" onclick="setScheduleView('list')">${t.list_view}</button>
                <button class="segment-item ${state.scheduleView === 'weekly' ? 'active' : ''}" onclick="setScheduleView('weekly')">${t.weekly_view}</button>
            </div>
        `;

        if (state.scheduleView === 'list') {
            html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">`;

            const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const sortedClasses = [...state.classes].sort((a, b) => {
                const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
                if (dayDiff !== 0) return dayDiff;
                return a.time.localeCompare(b.time);
            });

            sortedClasses.forEach(c => {
                html += `
                    <div class="card" style="padding: 1.2rem; border-radius: 20px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 0.8rem;">
                            <span style="background: var(--text); color: var(--background); padding: 0.3rem 0.8rem; border-radius: 40px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;">${c.tag || 'Class'}</span>
                            <span style="font-weight: 700; font-size: 1rem;">MXD ${c.price}</span>
                        </div>
                        <h3 style="font-size: 1.25rem; margin-bottom: 0.3rem; letter-spacing: -0.02em;">${c.name}</h3>
                        <div class="text-muted" style="display:flex; align-items:center; gap:0.4rem; font-size: 0.9rem;">
                            <i data-lucide="calendar" size="14"></i> ${c.day} • <i data-lucide="clock" size="14"></i> ${c.time}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        } else {
            const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const dayAliases = { 'Mon': ['Mon', 'Mo', 'Monday'], 'Tue': ['Tue', 'Tu', 'Tuesday'], 'Wed': ['Wed', 'We', 'Wednesday'], 'Thu': ['Thu', 'Th', 'Thursday'], 'Fri': ['Fri', 'Fr', 'Friday'], 'Sat': ['Sat', 'Sa', 'Saturday'], 'Sun': ['Sun', 'Su', 'Sunday'] };

            html += `<div class="weekly-grid">`;
            daysOrder.forEach(dayKey => {
                const aliases = dayAliases[dayKey];
                const dayClasses = state.classes.filter(c => aliases.includes(c.day)).sort((a, b) => a.time.localeCompare(b.time));

                html += `
                    <div class="day-tile">
                        <div class="day-tile-header">${t[dayKey.toLowerCase()]}</div>
                        <div style="display:flex; flex-direction:column; gap:0.6rem;">
                            ${dayClasses.length > 0 ? dayClasses.map(c => `
                                <div class="tile-class-item">
                                    <div class="tile-class-level">${c.tag || 'Open'}</div>
                                    <div class="tile-class-desc">${c.name}</div>
                                    <div class="tile-class-time">${c.time}</div>
                                </div>
                            `).join('') : `<div class="text-muted" style="font-size:0.6rem; font-style:italic;">${t.no_classes_msg}</div>`}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }
    } else if (view === 'shop') {
        html += `<h1>${t.shop_title}</h1>`;
        html += `<p class="text-muted" style="margin-bottom: 3.5rem; font-size: 1.1rem;">${t.select_plan_msg}</p>`;
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;">`;
        state.subscriptions.forEach(s => {
            const isPackage = s.name.includes("4") || s.name.includes("8");
            html += `
                <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-radius: 24px; padding: 1.8rem;">
                    <div>
                        <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem;">${s.name}</h3>
                        <p class="text-muted" style="margin-bottom: 1.2rem; font-size: 0.9rem;">
                            ${isPackage ? t.valid_month : s.duration}
                        </p>
                        <div style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1.5rem; letter-spacing: -0.04em;">MXD ${s.price}</div>
                    </div>
                    <button class="btn-primary w-full" onclick="openPaymentModal('${s.id}')" style="padding: 1rem;">${t.buy}</button>
                </div>
            `;
        });
        html += `</div>`;
    } else if (view === 'qr') {
        html += `
            <div class="text-center">
                <h1 style="margin-bottom: 0.5rem;">${t.qr_title}</h1>
                <p class="text-muted" style="margin-bottom: 2rem;">${t.qr_subtitle}</p>
                <div class="qr-outer" style="margin: 0 auto 1.5rem;"><div id="qr-code"></div></div>
                <div>
                    <div style="font-size: 0.8rem; margin-bottom: 1rem; letter-spacing: 0.05em; font-weight: 600;">
                        ${t.student_id}: <span style="color: var(--primary);">${state.currentUser.id}</span>
                    </div>
                    <div class="card" style="max-width: 280px; margin: 0 auto; padding: 1.2rem; border-radius: 20px;">
                        <div class="text-muted" style="font-size: 0.8rem; margin-bottom: 0.2rem; font-weight: 600; text-transform: uppercase;">${t.remaining_classes}</div>
                        <div style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.04em; color: var(--primary);">
                            ${state.currentUser.balance === null ? t.unlimited : state.currentUser.balance}
                        </div>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => {
            new QRCode(document.getElementById("qr-code"), {
                text: state.currentUser.id,
                width: 250, height: 250, colorDark: "#000", colorLight: "#fff"
            });
        }, 50);
    } else if (view === 'admin-students') {
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
                <h1 style="margin:0;">${t.admin_title}</h1>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn-primary" onclick="createNewStudent()" style="padding: 0.5rem 1rem; font-size: 0.8rem;">${t.add_student}</button>
                    <button class="btn-secondary" onclick="createNewAdmin()" style="padding: 0.5rem 1rem; font-size: 0.8rem;">${t.add_admin}</button>
                </div>
            </div>
        `;
        state.students.forEach(s => {
            html += `
                <div class="card" style="padding: 1.5rem; border-radius: 24px;">
                    <div style="display:flex; flex-direction: column; gap: 1rem;">
                        <div style="display:flex; justify-content:space-between; align-items: center;">
                            <div>
                                <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.2rem;">${s.name}</h3>
                                <div style="display:flex; gap:0.5rem; align-items:center;">
                                    <span style="background: ${s.paid ? 'rgba(45, 212, 191, 0.1)' : 'rgba(251, 113, 133, 0.1)'}; color: ${s.paid ? 'var(--secondary)' : 'var(--danger)'}; padding: 0.2rem 0.6rem; border-radius: 40px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase;">${s.paid ? t.status_active : t.status_unpaid}</span>
                                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--secondary);">
                                        ${t.balance_label}: ${s.balance === null ? '∞' : s.balance}
                                    </span>
                                </div>
                            </div>
                            <button class="btn-icon" onclick="deleteStudent('${s.id}')" style="color: var(--danger); opacity: 0.4;">
                                <i data-lucide="trash-2" size="18"></i>
                            </button>
                        </div>
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                            <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                <span class="text-muted" style="font-size: 0.7rem; font-weight: 600;">${t.plan_label}</span>
                                <select class="glass-input" onchange="activatePackage('${s.id}', this.value)" style="padding: 0.6rem; border-radius: 10px; font-size: 0.85rem;">
                                    <option value="">${t.none_label}</option>
                                    ${state.subscriptions.map(sub => `<option value="${sub.name}" ${s.package === sub.name ? 'selected' : ''}>${sub.name}</option>`).join('')}
                                </select>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                <span class="text-muted" style="font-size: 0.7rem; font-weight: 600;">${t.balance_manual_label}</span>
                                <input type="number" value="${s.balance === null ? '' : s.balance}" placeholder="∞" onchange="updateBalance('${s.id}', this.value)" class="glass-input" style="padding: 0.6rem; border-radius: 10px; font-size: 0.85rem; font-weight: 700;">
                            </div>
                        </div>

                        <button class="btn-secondary w-full" onclick="togglePayment('${s.id}')" style="padding: 0.6rem; font-size: 0.8rem;">
                            ${s.paid ? t.mark_unpaid : t.mark_paid}
                        </button>
                    </div>
                </div>
            `;
        });
    } else if (view === 'admin-memberships') {
        html += `<h1 style="margin-bottom: 2rem;">${t.pending_payments}</h1>`;
        if (state.paymentRequests.length === 0) {
            html += `<p class="text-muted">${t.no_subs}</p>`;
        } else {
            state.paymentRequests.forEach(req => {
                const studentName = req.students ? req.students.name : t.unknown_student;
                const isPending = req.status === 'pending';
                html += `
                    <div class="card slide-in" style="margin-bottom: 1rem; border-left: 4px solid ${req.status === 'approved' ? 'var(--secondary)' : (req.status === 'rejected' ? 'var(--danger)' : 'var(--primary)')}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <h3 style="font-size: 1.1rem; margin-bottom: 0.2rem;">${studentName}</h3>
                                <div class="text-muted" style="font-size: 0.8rem;">
                                    ${req.sub_name} • MXD ${req.price} • ${req.payment_method.toUpperCase()}
                                </div>
                                <div style="font-size: 0.7rem; opacity: 0.5; margin-top: 0.4rem;">${new Date(req.created_at).toLocaleString()}</div>
                            </div>
                            ${isPending ? `
                                <div style="display:flex; gap:0.5rem;">
                                    <button class="btn-secondary" onclick="processPaymentRequest(${req.id}, 'approved')" style="padding: 0.5rem 0.8rem; font-size: 0.75rem;">${t.approve}</button>
                                    <button class="btn-icon" onclick="processPaymentRequest(${req.id}, 'rejected')" style="color: var(--danger);"><i data-lucide="x-circle"></i></button>
                                </div>
                            ` : `
                                <span style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: ${req.status === 'approved' ? 'var(--secondary)' : 'var(--danger)'}">
                                    ${req.status}
                                </span>
                            `}
                        </div>
                    </div>
                `;
            });
        }
    } else if (view === 'admin-revenue') {
        // Calculate Revenue
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const approvedPayments = state.paymentRequests.filter(r => r.status === 'approved');

        const currentMonthEarnings = approvedPayments
            .filter(r => {
                const date = new Date(r.created_at);
                return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
            })
            .reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);

        const totalHistorical = approvedPayments.reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);

        html += `
            <h1 style="margin-bottom: 2rem;">${t.nav_revenue}</h1>
            
            <div style="display:grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 3rem;">
                <div class="card" style="padding: 2rem; border-radius: 30px; background: linear-gradient(135deg, rgba(45, 212, 191, 0.1), transparent); border-color: var(--secondary);">
                    <div class="text-muted" style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">${t.monthly_total}</div>
                    <div style="font-size: 2.5rem; font-weight: 800; color: var(--secondary);">MXD ${currentMonthEarnings.toLocaleString()}</div>
                </div>
                
                <div class="card" style="padding: 1.5rem; border-radius: 24px;">
                    <div class="text-muted" style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">${t.total_earned}</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">MXD ${totalHistorical.toLocaleString()}</div>
                </div>
            </div>

            <h2 style="margin-bottom: 1.5rem; font-size: 1.2rem;">${t.all_payments}</h2>
            <div style="display:flex; flex-direction:column; gap:0.8rem;">
                ${state.paymentRequests.map(req => {
            const studentName = req.students ? req.students.name : t.unknown_student;
            const date = new Date(req.created_at).toLocaleDateString();
            const statusColor = req.status === 'approved' ? 'var(--secondary)' : (req.status === 'rejected' ? 'var(--danger)' : 'var(--primary)');
            return `
                        <div class="card" style="padding: 1rem; border-radius: 16px; border-left: 4px solid ${statusColor}; font-size: 0.9rem;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div style="display:flex; align-items:center; gap:0.8rem; flex:1;">
                                    <div>
                                        <div style="font-weight: 700;">${studentName}</div>
                                        <div class="text-muted" style="font-size: 0.75rem;">${req.sub_name} • ${date}</div>
                                    </div>
                                </div>
                                <div style="display:flex; align-items:center; gap:1rem;">
                                    <div style="text-align:right;">
                                        <div style="font-weight: 800;">MXD ${req.price}</div>
                                        <div style="font-size: 0.7rem; text-transform: uppercase; font-weight: 800; color: ${statusColor}">${t[req.status] || req.status}</div>
                                    </div>
                                    <button class="btn-icon" onclick="removePaymentRequest('${req.id}')" style="color: var(--danger); opacity:0.3; width:36px; height:36px;">
                                        <i data-lucide="trash-2" size="16"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    } else if (view === 'admin-scanner') {
        html += `
            <div class="text-center">
                <h1>${t.nav_scan}</h1>
                <p class="text-muted" style="margin-bottom: 4rem;">${t.scan_cta_desc}</p>
                <div class="card" style="max-width: 440px; margin: 0 auto; border-radius: 30px;">
                    <div style="width: 120px; height: 120px; background: var(--background); border-radius: 30px; margin: 0 auto 2rem; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                         <i data-lucide="camera" size="48"></i>
                    </div>
                    <button class="btn-primary w-full" onclick="startScanner()" style="justify-content:center; padding: 1.5rem; font-size: 1.1rem;">
                        ${t.initiate_scan_btn}
                    </button>
                </div>
                <div id="scan-result" class="mt-4"></div>
            </div>
        `;
    } else if (view === 'admin-settings') {
        html += `<h1 style="margin-bottom: 4rem;">${t.nav_settings}</h1>`;

        html += `
            <div class="card" style="border-radius: 24px;">
                <div class="settings-header" style="margin-bottom: 2rem;">
                    <h3 style="font-size: 1.4rem;">${t.classes_label}</h3>
                    <button class="btn-primary" onclick="addClass()" style="padding: 0.5rem 1.2rem; font-size: 0.8rem;">
                        <i data-lucide="plus" size="14"></i> ${t.add_label}
                    </button>
                </div>
                <div class="mt-4">
        `;
        const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        state.classes.forEach(c => {
            html += `
                <div class="card" style="margin-bottom: 1.5rem; padding: 1.5rem; border-radius: 20px;">
                    <div style="display:flex; flex-direction:column; gap:1rem;">
                        <input type="text" class="glass-input" value="${c.name}" onchange="updateClass(${c.id}, 'name', this.value)" placeholder="Class Name" style="padding: 0.8rem;">
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.8rem;">
                            <select class="glass-input" onchange="updateClass(${c.id}, 'day', this.value)" style="padding: 0.8rem;">
                                <option value="">Select Day</option>
                                ${daysOrder.map(d => `<option value="${d}" ${c.day === d ? 'selected' : ''}>${t[d.toLowerCase()]}</option>`).join('')}
                            </select>
                            <input type="time" class="glass-input" value="${c.time || '09:00'}" onchange="updateClass(${c.id}, 'time', this.value)" style="padding: 0.8rem;">
                        </div>

                        <div style="display:grid; grid-template-columns: 1.5fr 1fr auto; gap: 0.8rem; align-items: center;">
                            <input type="text" class="glass-input" value="${c.tag || ''}" onchange="updateClass(${c.id}, 'tag', this.value)" placeholder="Tag (e.g. Beginner)" style="padding: 0.8rem;">
                            <input type="number" class="glass-input" value="${c.price}" onchange="updateClass(${c.id}, 'price', this.value)" placeholder="MXD" style="padding: 0.8rem;">
                            <button class="btn-icon" onclick="removeClass(${c.id})" style="color: var(--danger); width:44px; height:44px;"><i data-lucide="trash-2" size="20"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;

        html += `
            <div class="card" style="border-radius: 24px; margin-top: 2rem; padding: 1.5rem;">
                <div class="settings-header" style="margin-bottom: 1.5rem; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="font-size: 1.3rem;">${t.plans_label}</h3>
                    <button class="btn-primary" onclick="addSubscription()" style="padding: 0.5rem 1rem; font-size: 0.8rem; min-height: 36px;">
                        <i data-lucide="plus" size="14"></i> ${t.add_label}
                    </button>
                </div>
                <div style="display:flex; flex-direction:column; gap:1rem;">
        `;
        state.subscriptions.forEach(s => {
            html += `
                <div class="card" style="margin-bottom: 1rem; padding: 1.2rem; border-radius: 20px;">
                    <div style="display:flex; flex-direction:column; gap:0.8rem;">
                        <input type="text" class="glass-input" value="${s.name}" onchange="updateSub('${s.id}', 'name', this.value)" placeholder="Plan Name" style="padding: 0.8rem; font-weight: 700;">
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr auto; gap:0.8rem; align-items:center;">
                            <div style="display:flex; flex-direction:column; gap:0.3rem;">
                                <span class="text-muted" style="font-size: 0.65rem; font-weight: 600; text-transform: uppercase;">${t.limit_classes_label}</span>
                                <input type="number" class="glass-input" value="${s.limit_count || ''}" onchange="updateSub('${s.id}', 'limit_count', this.value)" placeholder="∞" style="padding: 0.7rem; font-size: 0.9rem; font-weight: 700;">
                            </div>
                            <div style="display:flex; flex-direction:column; gap:0.3rem;">
                                <span class="text-muted" style="font-size: 0.65rem; font-weight: 600; text-transform: uppercase;">${t.price_mxd_label}</span>
                                <input type="number" class="glass-input" value="${s.price}" onchange="updateSub('${s.id}', 'price', this.value)" placeholder="MXD" style="padding: 0.7rem; font-size: 0.9rem; font-weight: 700;">
                            </div>
                            <button class="btn-icon" onclick="removeSubscription('${s.id}')" style="color: var(--danger); margin-top: 1rem;"><i data-lucide="trash-2" size="20"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;

        // Transfer Settings
        html += `
            <div class="card" style="border-radius: 24px; margin-top: 2rem; padding: 1.5rem;">
                <h3 style="font-size: 1.3rem; margin-bottom: 1.5rem;">${t.transfer_details_label}</h3>
                <div style="display:flex; flex-direction:column; gap:1rem;">
                    <div>
                        <span class="text-muted" style="font-size: 0.7rem; font-weight: 600;">${t.bank_name_label}</span>
                        <input type="text" id="set-bank-name" class="glass-input" value="${state.adminSettings.bank_name || ''}" style="padding: 0.8rem; width: 100%;">
                    </div>
                    <div>
                        <span class="text-muted" style="font-size: 0.7rem; font-weight: 600;">CBU</span>
                        <input type="text" id="set-bank-cbu" class="glass-input" value="${state.adminSettings.bank_cbu || ''}" style="padding: 0.8rem; width: 100%;">
                    </div>
                    <div>
                        <span class="text-muted" style="font-size: 0.7rem; font-weight: 600;">Alias</span>
                        <input type="text" id="set-bank-alias" class="glass-input" value="${state.adminSettings.bank_alias || ''}" style="padding: 0.8rem; width: 100%;">
                    </div>
                    <div>
                        <span class="text-muted" style="font-size: 0.7rem; font-weight: 600;">${t.holder_name_label}</span>
                        <input type="text" id="set-bank-holder" class="glass-input" value="${state.adminSettings.bank_holder || ''}" style="padding: 0.8rem; width: 100%;">
                    </div>
                    <button class="btn-primary w-full" onclick="saveBankSettings(this)" style="margin-top: 1rem; padding: 1rem;">
                        <i data-lucide="save" size="16"></i> ${t.save_bank_btn}
                    </button>
                    <div id="save-status" class="text-center hidden slide-in" style="font-size: 0.8rem; color: var(--secondary); font-weight: 700;">
                        <i data-lucide="check" size="14"></i> ${t.saved_success_msg}
                    </div>
                </div>
            </div>
        `;
    }

    html += `</div>`;
    root.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Global UI Updates
    document.getElementById('logout-btn').classList.toggle('hidden', state.currentUser === null);
    document.getElementById('student-nav').classList.toggle('hidden', state.currentUser === null || state.isAdmin);
    document.getElementById('admin-nav').classList.toggle('hidden', state.currentUser === null || !state.isAdmin);

    // Sync active nav items
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === view);
    });
}

// --- ACTIONS ---
window.switchAuthMode = () => {
    state.authMode = state.authMode === 'signup' ? 'login' : 'signup';
    renderView();
};

window.showAdminFields = () => {
    document.getElementById('admin-fields').classList.toggle('hidden');
    document.getElementById('admin-show-btn').classList.toggle('hidden');
};

window.setScheduleView = (v) => {
    state.scheduleView = v;
    saveState();
    renderView();
};

window.signUpStudent = async () => {
    const name = document.getElementById('auth-name').value.trim();
    const phone = document.getElementById('auth-phone').value.trim();
    const pass = document.getElementById('auth-pass').value.trim();

    if (!name || !pass || !phone) {
        alert("Please enter name, phone number and password");
        return;
    }

    if (state.students.find(s => s.name.toLowerCase() === name.toLowerCase())) {
        alert("This name is already taken. Try signing in!");
        return;
    }

    const newStudent = {
        id: "STUD-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
        name: name,
        phone: phone,
        password: pass,
        paid: false,
        package: null,
        balance: 0,
        school_id: state.currentSchool.id
    };

    if (supabaseClient) {
        const { error } = await supabaseClient.from('students').insert([newStudent]);
        if (error) { alert("Error signing up: " + error.message); return; }
    }

    state.students.push(newStudent);
    state.currentUser = { ...newStudent, role: 'student' };
    state.isAdmin = false;
    state.currentView = 'qr';
    saveState();
    renderView();
};

window.loginStudent = async () => {
    const nameInput = document.getElementById('auth-name').value.trim();
    const passInput = document.getElementById('auth-pass').value.trim();
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });

    let student;
    if (supabaseClient) {
        const { data, error } = await supabaseClient
            .from('students')
            .select('*')
            .eq('name', nameInput)
            .eq('password', passInput)
            .single();

        if (error) {
            alert(t('invalid_login'));
            return;
        }
        student = data;
    } else {
        student = state.students.find(s =>
            s.name.toLowerCase() === nameInput.toLowerCase() && s.password === passInput
        );
    }

    if (student) {
        state.currentUser = { ...student, role: 'student' };
        state.isAdmin = false;
        state.currentView = 'qr';
        saveState();
        renderView();
    } else {
        alert(t('invalid_login'));
    }
};

window.buySubscription = async (id) => {
    if (!state.currentUser || state.isAdmin) {
        alert("Please log in as a student to purchase a plan.");
        return;
    }
    const sub = state.subscriptions.find(s => s.id === id);
    if (confirm(`Purchase ${sub.name} for $${sub.price}?`)) {
        await window.activatePackage(state.currentUser.id, sub.name);
        alert("Plan activated!");
        state.currentView = 'qr';
        renderView();
    }
};

window.deleteStudent = async (id) => {
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    if (confirm(t('delete_student_confirm'))) {
        if (supabaseClient) {
            const { error } = await supabaseClient.from('students').delete().eq('id', id);
            if (error) { alert("Error deleting: " + error.message); return; }
        }
        state.students = state.students.filter(s => s.id !== id);
        saveState();
        renderView();
    }
};

window.loginAdminWithCreds = async () => {
    const user = document.getElementById('admin-user-input').value.trim();
    const pass = document.getElementById('admin-pass-input').value.trim();
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });

    if (supabaseClient) {
        const { data, error } = await supabaseClient
            .from('admins')
            .select('*')
            .eq('username', user)
            .eq('password', pass)
            .eq('school_id', state.currentSchool.id)
            .single();

        if (data) {
            state.currentUser = { name: data.username + " (Admin)", role: "admin" };
            state.isAdmin = true;
            state.currentView = 'admin-students';
            saveState();
            renderView();
            return;
        }
    }

    // Fallback to hardcoded for safety during migration
    if (user === "Omid" && pass === "royal") {
        state.currentUser = { name: "Omid (Admin)", role: "admin" };
        state.isAdmin = true;
        state.currentView = 'admin-students';
        saveState();
        renderView();
    } else {
        alert(t('invalid_login'));
    }
};

window.createNewAdmin = async () => {
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const name = prompt(t('enter_admin_user'));
    const pass = prompt(t('enter_admin_pass'));
    if (!name || !pass) return;

    const newId = "ADMIN-" + Math.random().toString(36).substr(2, 4).toUpperCase();
    if (supabaseClient) {
        const { error } = await supabaseClient.from('admins').insert([{ id: newId, username: name, password: pass, school_id: state.currentSchool.id }]);
        if (error) { alert("Error: " + error.message); return; }
        alert(t('admin_created'));
    }
};

window.createNewStudent = async () => {
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const name = prompt(t('enter_student_name'));
    const phone = prompt(t('enter_student_phone'));
    const pass = prompt(t('enter_student_pass'));
    if (!name || !pass) return;

    const newStudent = {
        id: "STUD-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
        name: name,
        phone: phone,
        password: pass,
        paid: false,
        package: null,
        balance: 0,
        school_id: state.currentSchool.id
    };

    if (supabaseClient) {
        const { error } = await supabaseClient.from('students').insert([newStudent]);
        if (error) { alert("Error: " + error.message); return; }
    }
    state.students.push(newStudent);
    renderView();
    alert(t('student_created'));
};

window.logout = () => {
    state.currentUser = null;
    state.isAdmin = false;
    state.currentView = 'school-selection';
    state.currentSchool = null;
    state.lastActivity = Date.now();
    saveState();
    renderView();
};

window.confirmSchoolSelection = () => {
    const selector = document.getElementById('school-selector');
    const selectedId = selector.value;
    if (selectedId) {
        window.selectSchool(selectedId);
    } else {
        alert("Por favor, selecciona una academia primero.");
    }
};

window.selectSchool = (id) => {
    const school = state.schools.find(s => s.id === id);
    if (school) {
        state.currentSchool = school;
        state.currentView = 'auth';
        saveState();
        fetchAllData(); // Fetch school specific data
    }
};

window.createNewSchool = async () => {
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const name = prompt(t('enter_school_name'));
    if (!name) return;

    if (supabaseClient) {
        const { error } = await supabaseClient.from('schools').insert([{ name: name }]);
        if (error) { alert("Error: " + error.message); return; }
        alert(t('school_created'));
        fetchAllData();
    }
};

window.togglePayment = async (id) => {
    const student = state.students.find(s => s.id === id);
    if (student) {
        const newPaidStatus = !student.paid;
        if (supabaseClient) {
            const { error } = await supabaseClient.from('students').update({ paid: newPaidStatus }).eq('id', id);
            if (error) { alert("Error updating: " + error.message); return; }
        }
        student.paid = newPaidStatus;
        saveState();
        renderView();
    }
};

window.activatePackage = async (studentId, packageName) => {
    const student = state.students.find(s => s.id === studentId);
    // Robust case-insensitive search
    const pkg = state.subscriptions.find(p => p.name.trim().toLowerCase() === String(packageName).trim().toLowerCase());

    console.log(`Activating package [${packageName}] for student [${studentId}]...`);
    if (pkg) console.log(`Matched subscription:`, pkg);

    if (student) {
        // Ensure limit_count is a number. 
        const limitCount = pkg ? parseInt(pkg.limit_count) : 0;

        const updates = {
            package: pkg ? pkg.name : null, // Use the canonical name from the subscription
            balance: isNaN(limitCount) ? 0 : limitCount,
            paid: !!pkg
        };

        console.log(`Update payload:`, updates);

        if (supabaseClient) {
            const { error } = await supabaseClient.from('students').update(updates).eq('id', studentId);
            if (error) {
                console.error("Supabase update error:", error);
                alert("Error updating: " + error.message);
                return;
            }
        }

        student.package = updates.package;
        student.balance = updates.balance;
        student.paid = updates.paid;

        saveState();
        await fetchAllData(); // Pull fresh data to be 100% sure everything is synced
    }
};

window.openPaymentModal = (subId) => {
    const sub = state.subscriptions.find(s => s.id === subId);
    if (!sub) return;
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const modal = document.getElementById('payment-modal');
    const content = document.getElementById('payment-modal-content');

    content.innerHTML = `
        <h2 style="margin-bottom: 1.5rem;">${t('payment_instructions')}</h2>
        <div class="card" style="margin-bottom: 1.5rem; text-align: left;">
            <p><strong>${sub.name}</strong> - MXD ${sub.price}</p>
            <hr style="margin: 1rem 0; opacity: 0.1;">
            <p style="font-size: 0.9rem; margin-bottom: 0.5rem;"><strong>${state.adminSettings.bank_name || 'Bank'}</strong></p>
            <p style="font-size: 0.8rem;">CBU: ${state.adminSettings.bank_cbu || 'N/A'}</p>
            <p style="font-size: 0.8rem;">Alias: ${state.adminSettings.bank_alias || 'N/A'}</p>
            <p style="font-size: 0.8rem;">${t('holder_name_label')}: ${state.adminSettings.bank_holder || 'N/A'}</p>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.8rem;">
            <button class="btn-primary w-full" onclick="submitPaymentRequest('${sub.id}', 'transfer')">${t('i_have_paid')} (${t('transfer')})</button>
            <button class="btn-secondary w-full" onclick="submitPaymentRequest('${sub.id}', 'cash')">${t('pay_cash')}</button>
            <button class="btn-icon w-full" onclick="document.getElementById('payment-modal').classList.add('hidden')">${t('close')}</button>
        </div>
    `;
    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
};

window.submitPaymentRequest = async (subId, method) => {
    if (!state.currentUser) return;
    const sub = state.subscriptions.find(s => s.id === subId);
    if (!sub) { alert("Error: Plan not found"); return; }
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });

    const newRequest = {
        student_id: state.currentUser.id,
        sub_id: String(sub.id),
        sub_name: sub.name,
        price: sub.price,
        payment_method: method,
        school_id: state.currentSchool.id,
        status: 'pending'
    };

    if (supabaseClient) {
        const { error } = await supabaseClient.from('payment_requests').insert([newRequest]);
        if (error) { alert("Error sending request: " + error.message); return; }
    }

    // Refresh local list
    await fetchAllData();

    // Show success message
    const content = document.getElementById('payment-modal-content');
    content.innerHTML = `
        <i data-lucide="check-circle" size="48" style="color: var(--secondary); margin-bottom: 1rem;"></i>
        <h2>${t('request_sent_title')}</h2>
        <p class="text-muted" style="margin: 1rem 0;">${t('request_sent_msg')}</p>
        <button class="btn-primary w-full" onclick="document.getElementById('payment-modal').classList.add('hidden')">${t('close')}</button>
    `;
    if (window.lucide) lucide.createIcons();
};

window.processPaymentRequest = async (id, status) => {
    const req = state.paymentRequests.find(r => r.id === id);
    if (!req) return;

    if (supabaseClient) {
        const { error } = await supabaseClient.from('payment_requests').update({ status }).eq('id', id);
        if (error) { alert("Error processing: " + error.message); return; }

        if (status === 'approved') {
            await window.activatePackage(req.student_id, req.sub_name);
        }
    }

    await fetchAllData();
};

window.removePaymentRequest = async (id) => {
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    if (confirm(t('delete_payment_confirm'))) {
        if (supabaseClient) {
            const { error } = await supabaseClient.from('payment_requests').delete().eq('id', id);
            if (error) { alert("Error deleting: " + error.message); return; }
        }
        state.paymentRequests = state.paymentRequests.filter(r => r.id !== id);
        saveState();
        renderView();
    }
};

window.saveBankSettings = async (btn) => {
    const name = document.getElementById('set-bank-name').value;
    const cbu = document.getElementById('set-bank-cbu').value;
    const alias = document.getElementById('set-bank-alias').value;
    const holder = document.getElementById('set-bank-holder').value;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="loader-2" class="spin" size="16"></i> Saving to Vault...`;
        if (window.lucide) lucide.createIcons();
    }

    try {
        // Serial awaits for maximum reliability
        await window.updateAdminSetting('bank_name', name);
        await window.updateAdminSetting('bank_cbu', cbu);
        await window.updateAdminSetting('bank_alias', alias);
        await window.updateAdminSetting('bank_holder', holder);

        const status = document.getElementById('save-status');
        if (status) {
            status.innerHTML = `<i data-lucide="check" size="14"></i> Database Updated!`;
            status.classList.remove('hidden');
            setTimeout(() => status.classList.add('hidden'), 4000);
        }

        await fetchAllData();
        alert("Settings saved successfully!");
    } catch (err) {
        console.error("Save Error:", err);
        alert("CRITICAL ERROR: Could not save settings. Info: " + err.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="save" size="16"></i> Save Bank Details`;
            if (window.lucide) lucide.createIcons();
        }
    }
};

window.updateAdminSetting = async (key, value) => {
    if (supabaseClient) {
        const { error } = await supabaseClient
            .from('admin_settings')
            .upsert({ key: String(key), value: String(value), school_id: state.currentSchool.id }, { onConflict: 'school_id, key' });

        if (error) {
            console.error(`Error updating setting [${key}]:`, error);
            throw error;
        }
    }
    state.adminSettings[key] = value;
    saveState();
};

window.updateBalance = async (studentId, value) => {
    const student = state.students.find(s => s.id === studentId);
    if (student) {
        const newBalance = value === "" ? null : parseInt(value);
        if (supabaseClient) {
            const { error } = await supabaseClient.from('students').update({ balance: newBalance }).eq('id', studentId);
            if (error) { alert("Error updating: " + error.message); return; }
        }
        student.balance = newBalance;
        saveState();
        renderView();
    }
};

window.updateClass = async (id, field, value) => {
    const cls = state.classes.find(c => c.id === id);
    if (cls) {
        const val = (field === 'price' ? parseFloat(value) : value);
        if (supabaseClient) {
            const { error } = await supabaseClient.from('classes').update({ [field]: val }).eq('id', id);
            if (error) { console.error(error); return; }
        }
        cls[field] = val;
        saveState();
    }
};

window.addClass = async () => {
    const newClass = { name: "New Class", day: "Mon", time: "09:00", price: 10, tag: "Beginner", school_id: state.currentSchool.id };
    if (supabaseClient) {
        const { data, error } = await supabaseClient.from('classes').insert([newClass]).select();
        if (error) { alert("Error adding class: " + error.message); return; }
        state.classes.push(data[0]);
    } else {
        const newId = state.classes.length ? Math.max(...state.classes.map(c => c.id)) + 1 : 1;
        state.classes.push({ id: newId, ...newClass });
    }
    saveState();
    renderView();
};

window.removeClass = async (id) => {
    if (supabaseClient) {
        const { error } = await supabaseClient.from('classes').delete().eq('id', id);
        if (error) { alert("Error removing class: " + error.message); return; }
    }
    state.classes = state.classes.filter(c => c.id !== id);
    saveState();
    renderView();
};

window.updateSub = async (id, field, value) => {
    const sub = state.subscriptions.find(s => s.id === id);
    if (sub) {
        const val = (field === 'price' ? parseFloat(value) : (field === 'limit_count' ? parseInt(value) : value));
        if (supabaseClient) {
            const { error } = await supabaseClient.from('subscriptions').update({ [field]: val }).eq('id', id);
            if (error) { console.error(error); return; }
        }
        sub[field] = val;
        saveState();
    }
};

window.addSubscription = async () => {
    const newSub = { id: "S" + Date.now(), name: "New Plan", price: 50, duration: "30 days", limit_count: 10, school_id: state.currentSchool.id };
    if (supabaseClient) {
        const { error } = await supabaseClient.from('subscriptions').insert([newSub]);
        if (error) { alert("Error adding plan: " + error.message); return; }
    }
    state.subscriptions.push(newSub);
    saveState();
    renderView();
};

window.removeSubscription = async (id) => {
    if (supabaseClient) {
        const { error } = await supabaseClient.from('subscriptions').delete().eq('id', id);
        if (error) { alert("Error removing plan: " + error.message); return; }
    }
    state.subscriptions = state.subscriptions.filter(s => s.id !== id);
    saveState();
    renderView();
};

// --- SCANNER ---
let html5QrCode;
window.startScanner = async () => {
    try {
        const modal = document.getElementById('scanner-modal');
        modal.classList.remove('hidden');
        document.getElementById('inline-scan-result').innerHTML = '';

        // If instance exists but isn't scanning, try to start it.
        // If it MUST be recreated, we stop it first.
        if (html5QrCode) {
            try {
                await html5QrCode.stop();
            } catch (e) {
                console.warn("Error stopping existing scanner:", e);
            }
            html5QrCode = null;
        }

        html5QrCode = new Html5Qrcode("reader");

        const config = {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        const scanSuccess = (id) => {
            console.log("QR Scanned successfully. ID:", id);
            // PAUSE so we don't scan 50 times a second while choosing
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.pause(false);
            }
            window.handleScan(id);
        };

        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            scanSuccess,
            () => { }
        ).catch(err => {
            console.error("Scanner start error (environment):", err);
            return html5QrCode.start({ facingMode: "user" }, config, scanSuccess, () => { });
        }).catch(e => {
            console.error("Scanner setup error:", e);
            alert("Camera error: " + e);
        });
    } catch (err) {
        console.error("Scanner setup error:", err);
        alert("Camera access denied or error: " + err);
    }
};

window.stopScanner = async () => {
    document.getElementById('scanner-modal').classList.add('hidden');
    if (html5QrCode) {
        try {
            if (html5QrCode.isScanning) {
                await html5QrCode.stop();
            }
        } catch (err) {
            console.error("Error stopping scanner:", err);
        } finally {
            html5QrCode = null; // FORCE CLEAR for next init
        }
    }
};

window.handleScan = async (scannedId) => {
    const id = (scannedId || '').trim();
    console.log(`Processing scan for ID: [${id}]`);

    const student = state.students.find(s => s.id === id);
    const resultEl = document.getElementById('inline-scan-result'); // TARGET INLINE
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });

    if (!student) {
        resultEl.innerHTML = `
            <div class="card" style="border-color: var(--danger); background: rgba(251, 113, 133, 0.1); padding: 1rem;">
                <h2 style="color: var(--danger); font-size: 1rem;">${t('scan_fail')}</h2>
                <p style="margin-top:0.3rem">${t('not_found_msg')}: [${id.substring(0, 8)}...]</p>
                <button class="btn-primary mt-2 w-full" onclick="cancelAttendance()">${t('close')}</button>
            </div>
        `;
        return;
    }

    const hasValidPass = student.paid && (student.balance === null || student.balance > 0);

    if (hasValidPass) {
        resultEl.innerHTML = `
            <div class="card" style="border-radius: 20px; padding: 1rem; text-align: left; border: 2px solid var(--secondary); background: var(--background);">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <h3 style="font-size: 1rem; margin:0;">${student.name}</h3>
                        <div style="font-size: 0.9rem; font-weight: 700; color: var(--secondary);">
                            ${t('remaining_classes')}: ${student.balance === null ? t('unlimited') : student.balance}
                        </div>
                    </div>
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn-primary" onclick="confirmAttendance('${student.id}', 1)" style="padding: 0.8rem; font-size: 0.85rem;">
                        ${t('one_class')}
                    </button>
                    <button class="btn-secondary" onclick="confirmAttendance('${student.id}', 2)" style="padding: 0.8rem; font-size: 0.85rem;">
                        ${t('two_classes')}
                    </button>
                </div>
                
                <button class="btn-icon w-full" onclick="cancelAttendance()" style="padding: 0.4rem; font-size: 0.75rem; margin-top:0.5rem; opacity:0.5;">
                    ${t('cancel')}
                </button>
            </div>
        `;
    } else {
        resultEl.innerHTML = `
            <div class="card" style="border-color: var(--danger); background: rgba(251, 113, 133, 0.1); padding: 1rem;">
                <h2 style="color: var(--danger); font-size: 1rem;">${t('scan_fail')}</h2>
                <p style="margin-top:0.3rem">${student.name}</p>
                <p style="font-size:0.75rem; color:var(--danger)">${t('inactive')}</p>
                <button class="btn-primary mt-2 w-full" onclick="cancelAttendance()">${t('close')}</button>
            </div>
        `;
    }
    if (window.lucide) lucide.createIcons();
};

window.cancelAttendance = () => {
    document.getElementById('inline-scan-result').innerHTML = '';
    if (html5QrCode) {
        try {
            html5QrCode.resume();
            console.log("Scanner resumed after cancel.");
        } catch (e) {
            console.warn("Could not resume scanner:", e);
        }
    }
};

window.confirmAttendance = async (studentId, count) => {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const resultEl = document.getElementById('inline-scan-result');

    if (student.balance !== null && student.balance < count) {
        alert(t('not_enough_balance'));
        return;
    }

    if (student.balance !== null) {
        const newBalance = student.balance - count;
        if (supabaseClient) {
            const { error } = await supabaseClient.from('students').update({ balance: newBalance }).eq('id', studentId);
            if (error) { alert("Error updating balance: " + error.message); return; }
        }
        student.balance = newBalance;
        saveState();
        await fetchAllData();
    }

    resultEl.innerHTML = `
        <div class="card" style="border-color: var(--secondary); background: rgba(45, 212, 191, 0.1); padding: 1rem; text-align:center;">
             <i data-lucide="check-circle" size="32" style="color: var(--secondary)"></i>
             <div style="font-weight:700; color:var(--secondary)">${t('attendance_success')}</div>
             <div style="font-size:0.8rem">${student.name} (-${count})</div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        resultEl.innerHTML = '';
        if (html5QrCode) {
            try {
                html5QrCode.resume();
                console.log("Scanner resumed after confirmation.");
            } catch (e) {
                console.warn("Could not resume scanner:", e);
            }
        }
    }, 2000);
};

// --- INIT ---
document.getElementById('lang-toggle').addEventListener('click', () => {
    state.language = state.language === 'en' ? 'es' : 'en';
    saveState(); updateI18n(); renderView();
});

document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('close-scanner').addEventListener('click', stopScanner);

document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        state.currentView = btn.getAttribute('data-view');
        saveState();
        renderView();
    });
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', state.theme);
    document.body.classList.toggle('dark-mode', state.theme === 'dark');
    const icon = state.theme === 'dark' ? 'moon' : 'sun';
    document.getElementById('theme-icon').setAttribute('data-lucide', icon);
    saveState();
    lucide.createIcons();
});

// Admin toggle (Logo hold)
let logoPressTimer;
let superAdminTimer;
document.querySelector('.logo').addEventListener('mousedown', () => {
    logoPressTimer = setTimeout(() => {
        state.isAdmin = !state.isAdmin;
        state.currentView = state.isAdmin ? 'admin-students' : 'schedule';
        renderView();
    }, 2000);
    superAdminTimer = setTimeout(() => {
        state.currentView = 'super-admin-dashboard';
        renderView();
    }, 5000);
});
document.querySelector('.logo').addEventListener('mouseup', () => {
    clearTimeout(logoPressTimer);
    clearTimeout(superAdminTimer);
});

// Global User Activity Listeners (Auto-Logout)
['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
    window.addEventListener(evt, window.resetInactivityTimer, { passive: true });
});

// Initial Load
(function init() {
    const local = localStorage.getItem('dance_app_state');
    if (local) {
        const saved = JSON.parse(local);
        state.language = saved.language || 'en';
        state.theme = saved.theme || 'dark';
        if (saved.currentUser) state.currentUser = saved.currentUser;
        if (saved.isAdmin !== undefined) state.isAdmin = saved.isAdmin;
        if (saved.currentView) state.currentView = saved.currentView;
        if (saved.scheduleView) state.scheduleView = saved.scheduleView;
        if (saved.lastActivity) state.lastActivity = saved.lastActivity;
    }

    // Check if session expired while away
    window.checkInactivity();

    updateI18n();
    document.body.setAttribute('data-theme', state.theme);
    document.body.classList.toggle('dark-mode', state.theme === 'dark');
    renderView();
    if (window.lucide) lucide.createIcons();

    // Fetch live data from Supabase
    fetchAllData();

    // Background Sync: Refresh every 10 seconds to catch QR scans from other devices
    setInterval(() => {
        if (state.currentUser) fetchAllData();
    }, 10000);

    // Inactivity Monitor: Check every minute
    setInterval(() => {
        window.checkInactivity();
    }, 60000);
})();
