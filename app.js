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
        auth_subtitle: "Precision in every step.",
        welcome_to: "Welcome to",
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
        switch_school: "Switch School",
        welcome_classes: "Welcome to the classes of",
        loading: "Loading...",
        select_school_placeholder: "Choose your school...",
        loading_schools: "Loading schools...",
        connecting: "Connecting...",
        dev_access_title: "Dev Access",
        dev_access_subtitle: "Enter platform developer credentials",
        footer_support: "Support",
        footer_contact: "Contact",
        footer_copy: "&copy; 2026 Bailadmin Systems. All rights reserved.",
        dev_login_btn: "Login",
        dev_dashboard_title: "Platform Developer",
        dev_school_inspector: "School Inspector",
        dev_active_schools: "Active Schools",
        dev_stats_schools: "Schools",
        dev_stats_students: "Total Students",
        dev_stats_plans: "Plans",
        dev_stats_classes: "Classes",
        dev_view_details: "View Details",
        dev_enter_as_admin: "Enter as Admin",
        dev_volver_dashboard: "Back to Dashboard",
        dev_admins_label: "Administrators",
        dev_students_label: "Students",
        dev_plans_label: "Subscription Catalogue",
        dev_classes_label: "Schedule and Classes",
        dev_no_admins: "No admins assigned",
        dev_no_students: "No students registered",
        dev_no_plans: "No plans defined",
        dev_no_classes: "No classes configured",
        password_label: "Password",
        delete_school_btn: "Delete School",
        delete_school_confirm: "Are you sure you want to delete this school? ALL data (students, admins, payments, classes) will be permanently lost.",
        delete_school_success: "School deleted successfully",
        class_location: "Location",
        location_placeholder: "e.g. Studio A",
        active_packs_label: "Your Active Packs",
        no_expiration: "No expiration date",
        expires_in: "Expires in",
        days_left: "days left"
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
        auth_subtitle: "Eleva tu baile.",
        welcome_to: "Bienvenido a",
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
        valid_for_days: "Válido por {days} días",
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
        add_student: "Alumno",
        add_student_btn: "+ Nuevo Alumno",
        add_admin: "Administrador",
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
        holder_name_label: "Nombre del Titular",
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
        switch_school: "Cambiar Escuela",
        welcome_classes: "Bienvenido a las clases de",
        loading: "Cargando...",
        select_school_placeholder: "Elige tu escuela...",
        loading_schools: "Cargando academias...",
        connecting: "Iniciando conexión...",
        dev_access_title: "Acceso Dev",
        dev_access_subtitle: "Ingresa credenciales de desarrollador",
        footer_support: "Soporte",
        footer_contact: "Contacto",
        footer_copy: "&copy; 2026 Bailadmin Systems. Todos los derechos reservados.",
        dev_login_btn: "Entrar",
        dev_dashboard_title: "Plataforma Dev",
        dev_school_inspector: "Inspector de Escuela",
        dev_active_schools: "Escuelas Activas",
        dev_stats_schools: "Escuelas",
        dev_stats_students: "Total Alumnos",
        dev_stats_plans: "Planes",
        dev_stats_classes: "Clases",
        dev_view_details: "Ver Detalles",
        dev_enter_as_admin: "Entrar como Admin",
        dev_volver_dashboard: "Volver al Dashboard",
        dev_admins_label: "Administradores",
        dev_students_label: "Alumnos",
        dev_plans_label: "Catálogo de Planes",
        dev_classes_label: "Horarios y Clases",
        dev_no_admins: "Sin administradores",
        dev_no_students: "Sin alumnos registrados",
        dev_no_plans: "Sin planes definidos",
        dev_no_classes: "Sin clases configuradas",
        password_label: "Contraseña",
        delete_school_btn: "Eliminar Escuela",
        delete_school_confirm: "¿Estás seguro de que quieres eliminar esta escuela? TODOS los datos (alumnos, admins, pagos, clases) se perderán permanentemente.",
        delete_school_success: "Escuela eliminada con éxito",
        class_location: "Ubicación",
        location_placeholder: "Ej: Aula A",
        active_packs_label: "Tus Paquetes Activos",
        no_expiration: "Sin fecha de vencimiento",
        expires_in: "Vence en",
        days_left: "días restantes"
    },
    de: {
        nav_schedule: "Stundenplan",
        nav_shop: "Abos",
        nav_qr: "Mein QR",
        nav_students: "Schüler",
        nav_scan: "Scan",
        nav_settings: "Einstellungen",
        schedule_title: "Kursplan",
        shop_title: "Abonnements",
        qr_title: "Dein Zugangspass",
        qr_subtitle: "Zeige diesen am Studio-Eingang vor",
        buy: "Jetzt kaufen",
        active: "Zugang gewährt",
        inactive: "Zahlung erforderlich",
        pay_status: "Mitgliedschaftsstatus",
        student_id: "Mitglieder-ID",
        admin_title: "Administration",
        no_subs: "Keine aktiven Mitgliedschaften gefunden",
        scan_success: "Verifizierung erfolgreich",
        scan_fail: "Mitgliedschaft inaktiv",
        switch_to_admin: "Zum Admin",
        switch_to_student: "Zum Schüler",
        auth_subtitle: "Präzision in jedem Schritt.",
        welcome_to: "Willkommen bei",
        student_signup: "Neuer Schüler",
        admin_login: "Admin-Login",
        enter_name: "Wie sollen wir dich nennen?",
        signup_btn: "Jetzt beitreten",
        logout: "Abmelden",
        admin_subtitle: "Verwalte dein Studio effizient",
        classes_subtitle: "Kommende Kurse und Workshops",
        username: "Benutzername",
        password: "Passwort",
        login_btn: "Login",
        invalid_login: "Ungültige Anmeldedaten",
        remaining_classes: "Verbleibende Stunden",
        unlimited: "Unbegrenzt",
        already_account: "Hast du bereits ein Konto?",
        no_account: "Noch kein Konto?",
        sign_in: "Anmelden",
        sign_up: "Registrieren",
        student_login: "Schüler-Login",
        phone: "Telefonnummer",
        list_view: "Listenansicht",
        weekly_view: "Wochenplan",
        mon: "Montag", tue: "Dienstag", wed: "Mittwoch", thu: "Donnerstag", fri: "Freitag", sat: "Samstag", sun: "Sonntag",
        valid_month: "Gültig für einen Monat",
        valid_for_days: "Gültig für {days} Tage",
        nav_memberships: "Mitgliedschaften",
        pending_payments: "Ausstehende Zahlungen",
        approve: "Bestätigen",
        reject: "Ablehnen",
        nav_revenue: 'Einnahmen',
        monthly_total: 'Gesamt diesen Monat',
        all_payments: 'Zahlungsverlauf',
        total_earned: 'Gesamt verdient',
        approved: 'Bestätigt',
        rejected: 'Abgelehnt',
        pending: 'Ausstehend',
        transfer: "Überweisung",
        cash: "Barzahlung",
        payment_instructions: "Zahlungsanweisungen",
        i_have_paid: "Ich habe überwiesen",
        pay_cash: "Ich zahle bar",
        request_sent_title: "Anfrage gesendet!",
        request_sent_msg: "Dein Zugang wird aktiviert, sobald wir die Zahlung geprüft haben.",
        close: "Schließen",
        check_in_title: "Check-In Anwesenheit",
        one_class: "1 Stunde",
        two_classes: "2 Stunden",
        cancel: "Abbrechen",
        confirm_attendance: "Anwesenheit bestätigen",
        attendance_success: "Anwesenheit bestätigt!",
        attendance_error: "Fehler bei der Anwesenheit",
        admin_user_placeholder: "Admin Benutzername",
        admin_pass_placeholder: "Admin Passwort",
        admin_login_btn: "Admin Login",
        admin_access_trigger: "• ADMIN ZUGANG •",
        add_student: "Schüler",
        add_student_btn: "+ Neuer Schüler",
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
        add_label: "Hinzufügen",
        plans_label: "Pläne",
        limit_classes_label: "Stundenlimit",
        price_mxd_label: "Preis MXD",
        transfer_details_label: "Überweisungsdaten",
        bank_name_label: "Bankname",
        holder_name_label: "Kontoinhaber",
        save_bank_btn: "Bankdaten speichern",
        saved_success_msg: "Erfolgreich gespeichert!",
        balance_manual_label: "Guthaben manuell",
        no_classes_msg: "Keine Kurse",
        select_plan_msg: "Wähle dein bevorzugtes Abo.",
        delete_student_confirm: "Bist du sicher, dass du diesen Schüler löschen willst? Alle Fortschritte gehen verloren.",
        not_found_msg: "Nicht gefunden",
        not_enough_balance: "Nicht genügend Stunden übrig!",
        enter_admin_user: "Neuen Admin-Benutzernamen eingeben:",
        enter_admin_pass: "Neues Admin-Passwort eingeben:",
        admin_created: "Admin erstellt!",
        enter_student_name: "Name des Schülers eingeben:",
        enter_student_phone: "Telefonnummer eingeben:",
        enter_student_pass: "Passwort für den Schüler eingeben:",
        student_created: "Schüler erstellt!",
        unknown_student: "Unbekannter Schüler",
        delete_payment_confirm: "Diesen Zahlungsbeleg permanent löschen?",
        select_school_title: "Willkommen bei Bailadmin",
        select_school_subtitle: "Bitte wähle deine Schule oder deinen Lehrer aus",
        add_school_btn: "+ Neue Schule",
        enter_school_name: "Namen der neuen Schule oder des Lehrers eingeben:",
        school_created: "Schule erfolgreich erstellt!",
        switch_school: "Schule wechseln",
        welcome_classes: "Willkommen beim Unterricht von",
        loading: "Lädt...",
        select_school_placeholder: "Wähle deine Schule...",
        loading_schools: "Schulen werden geladen...",
        connecting: "Verbindung wird hergestellt...",
        dev_access_title: "Entwickler-Zugang",
        dev_access_subtitle: "Entwickler-Anmeldedaten eingeben",
        footer_support: "Support",
        footer_contact: "Kontakt",
        footer_copy: "&copy; 2026 Bailadmin Systems. Alle Rechte vorbehalten.",
        dev_login_btn: "Login",
        dev_dashboard_title: "Plattform-Entwickler",
        dev_school_inspector: "Schul-Inspektor",
        dev_active_schools: "Aktive Schulen",
        dev_stats_schools: "Schulen",
        dev_stats_students: "Gesamt Schüler",
        dev_stats_plans: "Pläne",
        dev_stats_classes: "Kurse",
        dev_view_details: "Details anzeigen",
        dev_enter_as_admin: "Als Admin betreten",
        dev_volver_dashboard: "Zurück zum Dashboard",
        dev_admins_label: "Administratoren",
        dev_students_label: "Schüler",
        dev_plans_label: "Abos",
        dev_classes_label: "Stundenplan und Kurse",
        dev_no_admins: "Keine Admins zugewiesen",
        dev_no_students: "Keine Schüler registriert",
        dev_no_plans: "Keine Pläne definiert",
        dev_no_classes: "Keine Kurse konfiguriert",
        password_label: "Passwort",
        delete_school_btn: "Schule löschen",
        delete_school_confirm: "Bist du sicher? ALLE Daten (Schüler, Admins, Zahlungen, Kurse) werden unwiderruflich gelöscht.",
        delete_school_success: "Schule erfolgreich gelöscht",
        class_location: "Standort",
        location_placeholder: "z.B. Studio A",
        active_packs_label: "Deine aktiven Pakete",
        no_expiration: "Kein Ablaufdatum",
        expires_in: "Läuft ab in",
        days_left: "Tage übrig"
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
    currentSchool: null,
    admins: [],
    showWeeklyPreview: false,
    isPlatformDev: false,
    platformData: { schools: [], students: [], admins: [] },
    loading: false
};

// --- DATA FETCHING ---
async function fetchAllData() {
    if (!window.supabase) return;
    state.loading = true;
    renderView(); // Show loading state if needed

    try {
        // First, always fetch schools
        const { data: schoolsData } = await supabaseClient.from('schools').select('*').order('name');
        if (schoolsData) {
            state.schools = schoolsData;
            // If we are on the selection screen, re-render to show schools immediately
            if (state.currentView === 'school-selection') {
                renderView();
            }
        }

        // If no school is selected, we can't fetch tenant-specific data
        // PLATFORM DEV EXCEPTION: Don't redirect if in God Mode
        if (!state.currentSchool && !state.isPlatformDev && state.currentView !== 'platform-dev-dashboard') {
            state.currentView = 'school-selection';
            state.loading = false;
            renderView();
            return;
        }

        // Skip school-specific fetching if no school selected (even in dev mode)
        if (!state.currentSchool) {
            state.loading = false;
            renderView();
            return;
        }

        const sid = state.currentSchool.id;

        const [classesRes, subsRes, studentsRes, requestsRes, settingsRes, adminsRes] = await Promise.all([
            supabaseClient.from('classes').select('*').eq('school_id', sid).order('id'),
            supabaseClient.from('subscriptions').select('*').eq('school_id', sid).order('name'),
            supabaseClient.from('students').select('*').eq('school_id', sid).order('name'),
            supabaseClient.from('payment_requests').select('*, students(name)').eq('school_id', sid).order('created_at', { ascending: false }),
            supabaseClient.from('admin_settings').select('*').eq('school_id', sid),
            supabaseClient.from('admins').select('*').eq('school_id', sid).order('username')
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
        if (adminsRes.data) state.admins = adminsRes.data;

        // --- NEW: Check for expired memberships ---
        await window.checkExpirations();

        state.loading = false;
        renderView();
    } catch (err) {
        state.loading = false;
        console.error("Error fetching data:", err);
        renderView();
    }
}

// --- LOGIC ---
function saveState() {
    localStorage.setItem('dance_app_state', JSON.stringify({
        language: state.language,
        theme: state.theme,
        currentUser: state.currentUser,
        isAdmin: state.isAdmin,
        isPlatformDev: state.isPlatformDev,
        currentView: state.currentView,
        scheduleView: state.scheduleView,
        lastActivity: state.lastActivity,
        currentSchool: state.currentSchool
    }));
}

// Security: Session Timeout Logic
const INACTIVITY_LIMIT = 12 * 60 * 60 * 1000; // 12 Hours

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
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = window.t(key);
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
            <div class="auth-page-container" style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 70vh; text-align: center; width: 100%;">
                <div class="landing-branding slide-in" style="margin-bottom: 2.5rem;">
                    <img src="logo.png" alt="Bailadmin" class="auth-logo" style="width: 150px; height: 150px; margin-bottom: 0.5rem;">
                    <h1 style="font-size: 2.2rem; letter-spacing: -1.5px; font-weight: 800; margin-bottom: 0.2rem;">Bailadmin</h1>
                    <p class="text-muted" style="font-size: 1rem; opacity: 0.6;">${t.select_school_subtitle}</p>
                </div>
                
                <div class="custom-dropdown-container" style="width: 100%; max-width: 300px; margin: 0 auto; z-index: 50;">
                    <!-- Custom Dropdown Trigger -->
                    <div id="school-dropdown-trigger" class="custom-dropdown-trigger" onclick="toggleSchoolDropdown()" style="width: 100%; box-sizing: border-box;">
                        <span>${state.schools.length > 0 ? t.select_school_placeholder : t.loading_schools}</span>
                        <i data-lucide="chevron-down" size="18"></i>
                    </div>

                    <!-- Custom Dropdown List -->
                    <div id="school-dropdown-list" class="custom-dropdown-list" style="width: 100%; box-sizing: border-box;">
                        ${state.schools.length > 0 ? state.schools.map(s => `
                            <div class="dropdown-item ${state.currentSchool?.id === s.id ? 'selected' : ''}" onclick="selectSchool('${s.id}')">
                                <span>${s.name}</span>
                                ${state.currentSchool?.id === s.id ? '<i data-lucide="check" size="16"></i>' : ''}
                            </div>
                        `).join('') : `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 14px;">${t.connecting}</div>`}
                    </div>
                </div>
            </div>
        `;
    }
    else if (view === 'super-admin-dashboard' || view === 'platform-dev-dashboard') {
        const isDev = view === 'platform-dev-dashboard';
        const title = isDev ? t.dev_dashboard_title : "Platform Super Admin";
        const schools = isDev ? state.platformData.schools : state.schools;

        html += `
            <div class="ios-header">
                <div class="ios-large-title">${title}</div>
                ${isDev ? '<div style="font-size: 13px; color: var(--system-blue); font-weight: 600; padding: 0 1.2rem; margin-top: -5px;">Modo Dios</div>' : ''}
            </div>
            
            <div style="padding: 1.2rem;">
                ${isDev ? `
                    <!-- PLATFORM STATS -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 20px; border: 1.5px solid var(--border);">
                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-secondary); margin-bottom: 5px;">${t.dev_stats_schools}</div>
                            <div style="font-size: 24px; font-weight: 800;">${state.platformData.schools.length}</div>
                        </div>
                        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 20px; border: 1.5px solid var(--border);">
                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-secondary); margin-bottom: 5px;">${t.dev_stats_students}</div>
                            <div style="font-size: 24px; font-weight: 800;">${state.platformData.students.length}</div>
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t.dev_active_schools}</div>
                    <button class="${isDev ? 'btn-primary' : 'btn-primary'}" onclick="${isDev ? 'createNewSchoolWithAdmin()' : 'createNewSchool()'}" style="padding: 8px 16px; font-size: 13px; height: auto;">${t.add_school_btn}</button>
                </div>

                <div class="ios-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
                    ${schools.map(s => {
            const schoolStudents = state.platformData.students.filter(st => st.school_id === s.id).length;
            const schoolAdmins = state.platformData.admins.filter(a => a.school_id === s.id).map(a => a.username).join(', ');
            return `
                            <div class="card" style="padding: 1.5rem; border-radius: 20px; display: flex; flex-direction: column; gap: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                    <div>
                                        <div style="font-size: 18px; font-weight: 800; margin-bottom: 2px;">${s.name}</div>
                                        <div style="font-size: 11px; color: var(--text-secondary); opacity: 0.6;">ID: ${s.id}</div>
                                    </div>
                                    <div style="font-size: 11px; font-weight: 700; color: var(--system-blue); background: rgba(0, 122, 255, 0.1); padding: 4px 10px; border-radius: 12px;">
                                        ${schoolStudents} ${t.dev_students_label}
                                    </div>
                                    <button class="btn-icon" onclick="window.deleteSchool('${s.id}', '${s.name}')" style="color: var(--system-red); opacity: 0.6; padding: 4px; margin-left: 8px;" title="${t.delete_school_btn}">
                                        <i data-lucide="trash-2" size="16"></i>
                                    </button>
                                </div>
                                <div style="font-size: 13px; color: var(--text-secondary);">
                                    <span style="font-weight: 600;">${t.dev_admins_label}:</span> ${schoolAdmins || 'N/A'}
                                </div>
                                <button class="btn-primary" onclick="state.selectedDevSchoolId='${s.id}'; state.currentView='platform-school-details'; renderView();" style="width: 100%; border-radius: 12px; height: 44px; font-size: 14px;">
                                    ${t.dev_view_details}
                                </button>
                                </button>
                                <button class="btn-secondary" onclick="state.currentSchool={id:'${s.id}', name:'${s.name}'}; state.isAdmin=true; state.currentView='admin-students'; fetchAllData();" style="width: 100%; border-radius: 12px; height: 44px; font-size: 14px; opacity: 0.7;">
                                    ${t.dev_enter_as_admin}
                                </button>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    } else if (view === 'platform-school-details') {
        const schoolId = state.selectedDevSchoolId;
        const school = state.platformData.schools.find(s => s.id === schoolId);
        if (!school) {
            html += `<div style="padding:2rem;">${t.not_found_msg}. <button class="btn-primary" onclick="state.currentView='platform-dev-dashboard'; renderView();">${t.dev_volver_dashboard}</button></div>`;
        } else {
            const students = state.platformData.students.filter(s => s.school_id === schoolId);
            const admins = state.platformData.admins.filter(a => a.school_id === schoolId);
            const classes = state.platformData.classes.filter(c => c.school_id === schoolId);
            const subs = state.platformData.subscriptions.filter(s => s.school_id === schoolId);

            html += `
                <div class="ios-header" style="background: transparent;">
                    <button class="btn-secondary" onclick="state.currentView='platform-dev-dashboard'; renderView();" style="border-radius: 50%; width: 40px; height: 40px; padding: 0; margin-bottom: 1rem; border: 1px solid var(--border);">
                        <i data-lucide="arrow-left" size="20" style="margin: 0 auto;"></i>
                    </button>
                    <div class="ios-large-title">${school.name}</div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: -5px; font-weight: 600; margin-bottom: 1.5rem;">${t.dev_school_inspector} • ID: ${schoolId}</div>
                    <button class="btn-primary" onclick="state.currentSchool={id:'${school.id}', name:'${school.name}'}; state.isAdmin=true; state.currentView='admin-students'; fetchAllData();" style="width: 100%; border-radius: 14px; height: 44px; font-size: 14px; margin-bottom: 2rem;">
                        <i data-lucide="shield-check" size="18"></i> ${t.dev_enter_as_admin}
                    </button>
                </div>

                <div style="padding: 1.2rem;">
                    <!-- STATS GRID -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; margin-bottom: 2rem;">
                        <div style="background: var(--bg-card); padding: 1.2rem 0.5rem; border-radius: 20px; text-align: center; border: 1px solid var(--border);">
                            <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; opacity: 0.5; margin-bottom: 4px;">${t.dev_students_label}</div>
                            <div style="font-size: 20px; font-weight: 800;">${students.length}</div>
                        </div>
                        <div style="background: var(--bg-card); padding: 1.2rem 0.5rem; border-radius: 20px; text-align: center; border: 1px solid var(--border);">
                            <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; opacity: 0.5; margin-bottom: 4px;">${t.dev_stats_plans}</div>
                            <div style="font-size: 20px; font-weight: 800;">${subs.length}</div>
                        </div>
                        <div style="background: var(--bg-card); padding: 1.2rem 0.5rem; border-radius: 20px; text-align: center; border: 1px solid var(--border);">
                            <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; opacity: 0.5; margin-bottom: 4px;">${t.dev_stats_classes}</div>
                            <div style="font-size: 20px; font-weight: 800;">${classes.length}</div>
                        </div>
                    </div>

                    <!-- ADMINS SECTION -->
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.8rem; padding: 0 0.5rem;">${t.dev_admins_label}</div>
                    <div class="ios-list">
                        ${admins.length > 0 ? admins.map(a => `
                            <div class="ios-list-item" style="padding: 12px 16px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--system-gray6); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: var(--system-blue);">${a.username.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <div style="font-weight: 700; font-size: 16px;">${a.username}</div>
                                        <div style="font-size: 11px; color: var(--text-secondary); opacity: 0.6;">${t.password_label}: ${a.password}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('') : `<div class="ios-list-item" style="color: var(--text-secondary); justify-content: center; padding: 1.5rem;">${t.dev_no_admins}</div>`}
                    </div>

                    <!-- STUDENTS LIST -->
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); margin-top: 2rem; margin-bottom: 0.8rem; padding: 0 0.5rem;">${t.dev_students_label}</div>
                    <div class="ios-list" style="max-height: 400px; overflow-y: auto;">
                        ${students.length > 0 ? students.map(s => `
                            <div class="ios-list-item" style="padding: 12px 16px; border-bottom: 0.5px solid var(--border);">
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; font-size: 16px;">${s.name}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">${s.phone || 'S/T'} • PW: ${s.password}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 800; color: var(--system-blue); font-size: 17px;">${s.balance === null ? '∞' : s.balance}</div>
                                    <div style="font-size: 10px; opacity: 0.5; font-weight: 700; text-transform: uppercase;">${t.balance_label}</div>
                                </div>
                            </div>
                        `).join('') : `<div class="ios-list-item" style="color: var(--text-secondary); justify-content: center; padding: 2rem;">${t.dev_no_students}</div>`}
                    </div>

                    <!-- PLANS & SUBSCRIPTIONS -->
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); margin-top: 2rem; margin-bottom: 0.8rem; padding: 0 0.5rem;">${t.dev_plans_label}</div>
                    <div class="ios-list">
                        ${subs.length > 0 ? subs.map(sb => `
                            <div class="ios-list-item" style="padding: 12px 16px;">
                                <div style="font-weight: 700; font-size: 16px;">${sb.name}</div>
                                <div style="font-weight: 800; font-size: 16px; color: var(--system-green);">$${sb.price}</div>
                            </div>
                        `).join('') : `<div class="ios-list-item" style="color: var(--text-secondary); justify-content: center; padding: 1.5rem;">${t.dev_no_plans}</div>`}
                    </div>

                    <!-- CLASSES / SCHEDULE -->
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); margin-top: 2rem; margin-bottom: 0.8rem; padding: 0 0.5rem;">${t.dev_classes_label}</div>
                    <div class="ios-list">
                        ${classes.length > 0 ? classes.map(c => `
                            <div class="ios-list-item" style="padding: 12px 16px;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; font-size: 16px;">${c.name}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary); opacity: 0.8;">${c.day} • ${c.time}</div>
                                </div>
                                <div style="font-size: 10px; font-weight: 700; background: var(--system-gray6); padding: 4px 10px; border-radius: 12px; text-transform: uppercase;">${c.tag || 'OPEN'}</div>
                            </div>
                        `).join('') : `<div class="ios-list-item" style="color: var(--text-secondary); justify-content: center; padding: 1.5rem;">${t.dev_no_classes}</div>`}
                    </div>
                </div>
            `;
        }
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
                        
                        <button onclick="window.backToSchoolSelection()" style="background: rgba(255,255,255,0.05); color: var(--text-muted); border: none; padding: 8px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.05);">
                            <i data-lucide="arrow-left" size="14"></i> ${t.switch_school}
                        </button>
                        
                        <div class="text-center" style="margin-bottom: 2rem; width: 100%;">
                            <h1 class="auth-title">${t.welcome_classes || t.welcome_to} <span style="font-weight: 800; display: block; margin-top: 0.5rem;">${state.currentSchool?.name || 'Bailadmin'}</span></h1>
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
                            <div style="display:flex; gap: 0.5rem;">
                                <span style="background: var(--text); color: var(--background); padding: 0.3rem 0.8rem; border-radius: 40px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;">${c.tag || 'Class'}</span>
                            </div>
                        </div>
                        <h3 style="font-size: 1.25rem; margin-bottom: 0.3rem; letter-spacing: -0.02em;">${c.name}</h3>
                        <div class="text-muted" style="display:flex; align-items:center; flex-wrap: wrap; gap:0.4rem; font-size: 0.9rem;">
                            <i data-lucide="calendar" size="14"></i> ${c.day} • <i data-lucide="clock" size="14"></i> ${c.time}
                            ${c.location ? `• <i data-lucide="map-pin" size="14" style="opacity: 0.4;"></i> <span style="opacity: 0.7; font-weight: 500;">${c.location}</span>` : ''}
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
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2px;">
                                        <div class="tile-class-level">${c.tag || 'Open'}</div>
                                        ${c.location ? `<div onclick="window.showLocationDetails(\`${c.location.replace(/'/g, "\\'")}\`)" style="font-size: 7px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 2px; opacity: 0.8; cursor: pointer;"><i data-lucide="map-pin" style="width: 7px; height: 7px; opacity: 0.5;"></i> ${window.formatLocationLabel(c.location)}</div>` : ''}
                                    </div>
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
            html += `
                <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-radius: 24px; padding: 1.8rem;">
                    <div>
                        <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem;">${s.name}</h3>
                        <p class="text-muted" style="margin-bottom: 1.2rem; font-size: 0.9rem;">
                            ${t.valid_for_days.replace('{days}', s.validity_days || 30)}
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

                    <div style="margin-top: 2rem; width: 100%; max-width: 320px; margin-left: auto; margin-right: auto; text-align: left;">
                        <div style="text-transform: uppercase; font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px; letter-spacing: 0.05em; opacity: 0.6; padding: 0 10px;">
                            ${t.active_packs_label || 'Tus Paquetes Activos'}
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${(() => {
                const packs = state.currentUser.active_packs || [];
                if (packs.length === 0) {
                    return `
                                        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 24px; text-align: center; border: 1px dashed var(--border);">
                                            <div style="font-size: 13px; color: var(--text-secondary); opacity: 0.5;">No tienes paquetes activos</div>
                                        </div>
                                    `;
                }

                return packs.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at)).map(p => {
                    const days = window.getDaysRemaining(p.expires_at);
                    const isExpired = days <= 0;
                    const isSoon = days > 0 && days <= 5;

                    let statusColor = 'var(--system-blue)';
                    if (isExpired) statusColor = 'var(--system-red)';
                    else if (isSoon) statusColor = 'var(--system-orange)';

                    return `
                                        <div class="card" style="padding: 1.2rem; border-radius: 22px; position: relative; overflow: hidden; border: 1px solid var(--border); background: linear-gradient(145deg, var(--bg-card), var(--bg-body));">
                                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                                <div>
                                                    <div style="font-size: 15px; font-weight: 700; margin-bottom: 2px;">${p.name}</div>
                                                    <div style="font-size: 11px; font-weight: 600; opacity: 0.5; text-transform: uppercase;">${new Date(p.created_at).toLocaleDateString()}</div>
                                                </div>
                                                <div style="background: ${statusColor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase;">
                                                   ${isExpired ? 'Expirado' : (isSoon ? `${days}d Restantes` : 'Activo')}
                                                </div>
                                            </div>
                                            
                                            <div style="display: flex; align-items: flex-end; justify-content: space-between;">
                                                <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-secondary);">
                                                    <i data-lucide="calendar" size="14" style="opacity: 0.6;"></i>
                                                    <span>Vence: ${new Date(p.expires_at).toLocaleDateString()}</span>
                                                </div>
                                                <div style="text-align: right;">
                                                    <div style="font-size: 20px; font-weight: 800; color: var(--primary);">${p.count}</div>
                                                    <div style="font-size: 9px; font-weight: 700; opacity: 0.4; text-transform: uppercase;">Clases</div>
                                                </div>
                                            </div>
                                            
                                            ${isSoon ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--system-orange); opacity: 0.3;"></div>` : ''}
                                        </div>
                                    `;
                }).join('');
            })()}
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
            <div class="ios-header" style="background: transparent;">
                <div class="ios-large-title">${t.nav_students}</div>
                <div style="margin-top: -5px; margin-bottom: 2rem;">
                    <button class="btn-primary" onclick="createNewStudent()" style="border-radius: 12px; padding: 8px 16px; font-size: 14px; min-height: 36px; height: 36px;">
                        <i data-lucide="plus" size="14"></i> ${t.add_student}
                    </button>
                </div>
            </div>
            <div style="position: sticky; top: 60px; z-index: 90; background: var(--bg-body); padding-bottom: 5px; opacity: 0.98; backdrop-filter: blur(10px);">
                <input type="text" class="ios-search-bar" placeholder="Buscar alumnos..." oninput="filterStudents(this.value)" style="margin-bottom: 1.5rem;">
            </div>
            <div class="ios-list" id="admin-student-list" style="margin-top: 0;">
                ${state.loading && state.students.length === 0 ? `
                    <div style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        <div class="spin" style="margin-bottom: 1rem; color: var(--system-blue);"><i data-lucide="loader-2" size="32"></i></div>
                        <p style="font-size: 15px; font-weight: 500;">Cargando alumnos...</p>
                    </div>
                ` : state.students.map(s => renderAdminStudentCard(s)).join('')}
            </div>
        `;
    } else if (view === 'admin-memberships') {
        const pending = state.paymentRequests.filter(r => r.status === 'pending');
        html += `
            <div class="ios-header" style="background: transparent;">
                <div class="ios-large-title">${t.nav_memberships}</div>
            </div>
            
            <div style="padding: 0 1.2rem; margin-bottom: 0.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                ${t.pending_payments}
            </div>
            <div class="ios-list">
                ${pending.length > 0 ? pending.map(req => {
            const studentName = req.students ? req.students.name : t.unknown_student;
            return `
                        <div class="ios-list-item" style="flex-direction: column; align-items: stretch; gap: 14px; padding: 20px;">
                            <div style="display: flex; gap: 12px; align-items: center;">
                                <div style="width: 40px; height: 40px; background: var(--system-gray6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--text-secondary);">
                                    ${studentName.charAt(0).toUpperCase()}
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; font-size: 17px;">${studentName}</div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <div style="font-size: 13px; color: var(--text-secondary);">${req.sub_name} • $${req.price}</div>
                                        <div style="font-size: 10px; background: var(--system-gray6); padding: 2px 8px; border-radius: 6px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
                                            <i data-lucide="${req.payment_method === 'cash' ? 'banknote' : 'send'}" size="10"></i> ${t[req.payment_method] || req.payment_method}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <button class="btn-secondary" onclick="processPaymentRequest(${req.id}, 'rejected')" style="background: rgba(255, 59, 48, 0.1); color: var(--system-red); border-radius: 12px; border: none; font-size: 14px; min-height: 48px; display: flex; align-items: center; justify-content: center; width: 100%;">
                                    ${t.reject}
                                </button>
                                <button class="btn-primary" onclick="processPaymentRequest(${req.id}, 'approved')" style="background: var(--system-green); color: white; border-radius: 12px; border: none; font-size: 14px; min-height: 48px; display: flex; align-items: center; justify-content: center; width: 100%;">
                                    ${t.approve}
                                </button>
                            </div>
                        </div>
                    `;
        }).join('') : `<div class="ios-list-item" style="color: var(--text-secondary); text-align: center; justify-content: center; padding: 2.5rem; flex-direction: column; gap: 12px;">
                    <i data-lucide="check-circle" size="32" style="opacity: 0.2;"></i>
                    <span style="font-size: 15px; font-weight: 500; opacity: 0.6;">Sin pagos pendientes</span>
                </div>`}
            </div>
        `;


    } else if (view === 'admin-revenue') {
        const approvedPayments = state.paymentRequests.filter(r => r.status === 'approved');
        const thisMonth = new Date().getMonth();
        const thisMonthEarnings = approvedPayments
            .filter(r => {
                const d = new Date(r.created_at);
                return d.getMonth() === thisMonth && d.getFullYear() === new Date().getFullYear();
            })
            .reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);

        const totalHistorical = approvedPayments.reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);

        html += `
            <div class="ios-header" style="background: transparent;">
                <div class="ios-large-title">${t.nav_revenue}</div>
            </div>
            
            <div style="padding: 0 1.2rem; margin-bottom: 2rem;">
                <div style="background: var(--text-primary); padding: 2rem; border-radius: 24px; color: var(--bg-body); box-shadow: 0 15px 35px rgba(0,0,0,0.15); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                    <div style="opacity: 0.7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.8rem;">${t.monthly_total}</div>
                    <div style="font-size: 48px; font-weight: 800; letter-spacing: -2px; margin-bottom: 1.5rem;">$${thisMonthEarnings.toLocaleString()}</div>
                    
                    <div style="display: flex; align-items: center; gap: 8px; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
                        <i data-lucide="bar-chart-3" size="14" style="opacity: 0.6;"></i>
                        <span style="font-size: 13px; font-weight: 500; opacity: 0.8;">Histórico: $${totalHistorical.toLocaleString()} </span>
                    </div>
                </div>
            </div>

            <div style="padding: 0 1.2rem; margin-bottom: 0.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                ${t.all_payments}
            </div>
            <div class="ios-list">
                ${state.loading && state.paymentRequests.length === 0 ? `
                    <div style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        <div class="spin" style="margin-bottom: 1rem; color: var(--system-blue);"><i data-lucide="loader-2" size="32"></i></div>
                        <p style="font-size: 15px; font-weight: 500;">${t.loading || 'Loading...'}</p>
                    </div>
                ` : (state.paymentRequests.length > 0 ? state.paymentRequests.map(req => {
            const studentName = req.students ? req.students.name : t.unknown_student;
            const statusColor = req.status === 'approved' ? 'var(--system-green)' : (req.status === 'rejected' ? 'var(--system-red)' : 'var(--system-blue)');
            const statusLabel = t[req.status] || req.status;
            return `
                        <div class="ios-list-item" style="padding: 16px; align-items: center;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; font-size: 17px; margin-bottom: 4px;">${studentName}</div>
                                <div style="font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                                    ${req.sub_name} • ${new Date(req.created_at).toLocaleDateString()}
                                    <span style="font-size: 9px; opacity: 0.6; text-transform: uppercase; font-weight: 700; background: var(--system-gray6); padding: 1px 6px; border-radius: 4px;">${t[req.payment_method] || req.payment_method}</span>
                                </div>
                            </div>
                            <div style="text-align: right; margin-right: 12px;">
                                <div style="font-weight: 700; font-size: 17px; margin-bottom: 4px;">$${req.price}</div>
                                <div style="font-size: 10px; font-weight: 800; color: ${statusColor}; text-transform: uppercase; letter-spacing: 0.02em;">${statusLabel}</div>
                            </div>
                            <button onclick="window.removePaymentRequest('${req.id}')" style="background: none; border: none; color: var(--system-red); padding: 8px; opacity: 0.6;" title="${t.delete_payment_confirm || 'Delete'}">
                                <i data-lucide="trash-2" size="18"></i>
                            </button>
                        </div>
                    `;
        }).join('') : `<div class="ios-list-item" style="color: var(--text-secondary); text-align: center; justify-content: center; padding: 2rem;">No data yet</div>`)}
            </div>
        `;
    } else if (view === 'admin-scanner') {
        html += `
            <div class="ios-header">
                <div class="ios-large-title">${t.nav_scan}</div>
            </div>
            <div style="padding: 2rem; text-align: center;">
                <p style="font-size: 17px; color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.5;">${t.scan_cta_desc}</p>

            <div style="width: 200px; height: 200px; margin: 0 auto 3rem; position: relative; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; inset: 0; border: 2px solid var(--system-gray4); border-radius: 30px;"></div>
                <div style="position: absolute; inset: -4px; border: 4px solid var(--system-blue); border-radius: 34px; clip-path: polygon(0% 20%, 0% 0%, 20% 0%, 80% 0%, 100% 0%, 100% 20%, 100% 80%, 100% 100%, 80% 100%, 20% 100%, 0% 100%, 0% 80%);"></div>
                <i data-lucide="qr-code" size="64" style="color: var(--system-gray);"></i>
            </div>

            <button class="btn-primary" onclick="startScanner()" style="width: 100%; border-radius: 14px; height: 50px; font-size: 17px; font-weight: 600;">
                ${t.initiate_scan_btn}
            </button>
            <div id="scan-result" style="margin-top: 1.5rem; font-weight: 600; font-size: 17px;"></div>
        </div>
    `;
    } else if (view === 'admin-settings') {
        const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        html += `
            <div class="ios-header">
                <div class="ios-large-title">${t.nav_settings}</div>
            </div>

            <div style="padding: 0 1.2rem; margin-top: 1.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                Gestión de Clases
            </div>
            <div class="ios-list">
                ${state.classes.map(c => `
                    <div class="ios-list-item" style="flex-direction: column; align-items: stretch; gap: 12px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                <i data-lucide="music" size="16" style="opacity: 0.3;"></i>
                                <input type="text" value="${c.name}" onchange="updateClass(${c.id}, 'name', this.value)" style="border: none; background: transparent; font-size: 17px; font-weight: 600; width: 85%; color: var(--text-primary); outline: none;">
                            </div>
                            <button onclick="removeClass(${c.id})" style="background: none; border: none; color: var(--text-secondary); opacity: 0.4; padding: 5px; cursor: pointer;">
                                <i data-lucide="trash-2" size="18"></i>
                            </button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px; position: relative;">
                                <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">Día</label>
                                <div class="custom-dropdown-container">
                                    <div class="custom-dropdown-trigger" onclick="window.toggleCustomDropdown('${c.id}')" style="background: transparent; border: none; padding: 0; min-height: auto; width: 100%; justify-content: space-between;">
                                        <span style="font-size: 14px; font-weight: 600;">${t[c.day.toLowerCase()]}</span>
                                        <i data-lucide="chevron-down" size="12" style="opacity: 0.4;"></i>
                                    </div>
                                    <div class="custom-dropdown-list" id="dropdown-list-${c.id}">
                                        ${daysOrder.map(d => `
                                            <div class="dropdown-item ${c.day === d ? 'selected' : ''}" onclick="window.selectCustomOption(${c.id}, 'day', '${d}')">
                                                <span>${t[d.toLowerCase()]}</span>
                                                ${c.day === d ? '<i data-lucide="check" size="14"></i>' : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px;">
                                <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">Hora</label>
                                <input type="time" value="${c.time || '09:00'}" onchange="updateClass(${c.id}, 'time', this.value)" style="background: transparent; border: none; font-size: 14px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; cursor: pointer; padding: 0;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px; opacity: 0.8;">
                                 <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t.class_location}</label>
                                 <input type="text" value="${c.location || ''}" onchange="updateClass(${c.id}, 'location', this.value)" placeholder="${t.location_placeholder}" style="background: transparent; border: none; font-size: 13px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; padding: 0;">
                            </div>
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px; opacity: 0.8;">
                                 <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">Nivel / Tag</label>
                                 <input type="text" value="${c.tag || 'Clase'}" onchange="updateClass(${c.id}, 'tag', this.value)" placeholder="Ej: Principiante" style="background: transparent; border: none; font-size: 13px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; padding: 0;">
                            </div>
                        </div>
                    </div>
                `).join('')}
                
                <div class="ios-list-item" onclick="addClass()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px;">
                    <i data-lucide="plus-circle" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t.add_label} Nueva Clase
                </div>
            </div>

            <!-- WEEKLY PREVIEW FOR ADMINS -->
            <div style="padding: 0 1.2rem; margin-top: 1.5rem;">
                <button onclick="window.toggleWeeklyPreview()" style="width: 100%; padding: 14px; border-radius: 16px; border: 1px solid var(--border); background: var(--system-gray6); color: var(--text-primary); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 14px;">
                    <i data-lucide="${state.showWeeklyPreview ? 'eye-off' : 'eye'}" size="16" style="opacity: 0.6;"></i>
                    ${state.showWeeklyPreview ? 'Ocultar Plan Semanal' : 'Ver Plan Semanal'}
                </button>
            </div>

            ${state.showWeeklyPreview ? `
            <div style="padding: 0 1.2rem; margin-top: 2rem; margin-bottom: 0.8rem; display: flex; align-items: center; justify-content: space-between;" class="slide-in">
                <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                    Vista Previa (Semanal)
                </div>
            </div>
            <div style="padding: 0 0.5rem; margin-bottom: 2rem;" class="slide-in">
                <div class="weekly-grid">
                    ${daysOrder.map(dayKey => {
            const dayAliases = { 'Mon': ['Mon', 'Mo', 'Monday'], 'Tue': ['Tue', 'Tu', 'Tuesday'], 'Wed': ['Wed', 'We', 'Wednesday'], 'Thu': ['Thu', 'Th', 'Thursday'], 'Fri': ['Fri', 'Fr', 'Friday'], 'Sat': ['Sat', 'Sa', 'Saturday'], 'Sun': ['Sun', 'Su', 'Sunday'] };
            const aliases = dayAliases[dayKey];
            const dayClasses = state.classes.filter(c => aliases.includes(c.day)).sort((a, b) => a.time.localeCompare(b.time));

            return `
                        <div class="day-tile" style="background: var(--bg-card); border-radius: 16px;">
                            <div class="day-tile-header" style="padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 11px; opacity: 0.6;">${t[dayKey.toLowerCase()]}</div>
                            <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top: 0.8rem;">
                                ${dayClasses.length > 0 ? dayClasses.map(c => `
                                    <div class="tile-class-item" style="padding: 8px; border-radius: 10px; border: 1px solid var(--border);">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
                                            <div class="tile-class-level" style="font-size: 8px; background: var(--system-gray6); padding: 2px 6px; border-radius: 4px;">${c.tag || 'Open'}</div>
                                            ${c.location ? `<div style="font-size: 6px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 2px; opacity: 0.7;"><i data-lucide="map-pin" size="6" style="opacity: 0.5;"></i> ${window.formatLocationLabel(c.location)}</div>` : ''}
                                        </div>
                                        <div class="tile-class-desc" style="font-size: 11px; font-weight: 700;">${c.name}</div>
                                        <div class="tile-class-time" style="font-size: 9px; opacity: 0.6;">${c.time}</div>
                                    </div>
                                `).join('') : `<div class="text-muted" style="font-size:9px; font-style:italic; padding: 1rem 0;">${t.no_classes_msg}</div>`}
                            </div>
                        </div>
                        `;
        }).join('')}
                </div>
            </div>
            ` : ''}

            <div style="padding: 0 1.2rem; margin-top: 2.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                Catálogo de Planes
            </div>
            <div class="ios-list">
                ${state.subscriptions.map(s => `
                    <div class="ios-list-item" style="flex-direction: column; align-items: stretch; gap: 12px; padding: 16px;">
                         <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                <i data-lucide="credit-card" size="16" style="opacity: 0.3;"></i>
                                <input type="text" value="${s.name}" onchange="updateSub('${s.id}', 'name', this.value)" style="border: none; background: transparent; font-size: 17px; font-weight: 600; width: 80%; color: var(--text-primary); outline: none;">
                            </div>
                            <button onclick="removeSubscription('${s.id}')" style="background: none; border: none; color: var(--text-secondary); opacity: 0.4; padding: 5px; cursor: pointer;">
                                <i data-lucide="trash-2" size="18"></i>
                            </button>
                        </div>
                         <div style="display: flex; gap: 8px; align-items: center;">
                            <div style="flex: 1; display:flex; align-items:center; background: var(--system-gray6); padding: 8px 12px; border-radius: 10px; gap: 6px;">
                                <span style="color: var(--text-secondary); font-size: 11px; font-weight: 700; opacity: 0.6;">$</span>
                                <input type="number" value="${s.price}" onchange="updateSub('${s.id}', 'price', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 14px; padding: 0;">
                            </div>
                            <div style="flex: 1; display:flex; align-items:center; background: var(--system-gray6); padding: 8px 12px; border-radius: 10px; gap: 6px;">
                                <i data-lucide="layers" size="12" style="color: var(--text-secondary); opacity: 0.5;"></i>
                                <input type="number" value="${s.limit_count || ''}" onchange="updateSub('${s.id}', 'limit_count', this.value)" placeholder="Clases" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 14px; padding: 0;">
                            </div>
                            <div style="flex: 1.2; display:flex; align-items:center; background: var(--system-gray6); padding: 8px 12px; border-radius: 10px; gap: 6px;">
                                <i data-lucide="calendar" size="12" style="color: var(--text-secondary); opacity: 0.5;"></i>
                                <input type="number" value="${s.validity_days || 30}" onchange="updateSub('${s.id}', 'validity_days', this.value)" placeholder="Días" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 14px; padding: 0;">
                                <span style="font-size: 8px; font-weight: 700; color: var(--text-secondary); opacity: 0.4; text-transform: uppercase;">Días</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <div class="ios-list-item" onclick="addSubscription()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px;">
                    <i data-lucide="plus-circle" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t.add_label} Plan
                </div>
            </div>

            <div style="padding: 0 1.2rem; margin-top: 2.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                ${t.transfer_details_label}
            </div>
            <div class="ios-list">
                <div class="ios-list-item" style="padding: 12px 16px;">
                    <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t.bank_name_label}</span>
                    <input type="text" id="set-bank-name" value="${state.adminSettings.bank_name || ''}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                </div>
                <div class="ios-list-item" style="padding: 12px 16px;">
                    <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">CBU</span>
                    <input type="text" id="set-bank-cbu" value="${state.adminSettings.bank_cbu || ''}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                </div>
                <div class="ios-list-item" style="padding: 12px 16px;">
                    <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">Alias</span>
                    <input type="text" id="set-bank-alias" value="${state.adminSettings.bank_alias || ''}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                </div>
                <div class="ios-list-item" style="padding: 12px 16px;">
                    <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t.holder_name_label}</span>
                    <input type="text" id="set-bank-holder" value="${state.adminSettings.bank_holder || ''}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                </div>
                <div class="ios-list-item" onclick="saveBankSettings(this)" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; background: var(--system-gray6);">
                    <i data-lucide="save" size="18" style="opacity: 0.6; margin-right: 8px;"></i> ${t.save_bank_btn}
                </div>
            </div>

            <div style="padding: 0 1.2rem; margin-top: 2.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                Administradores
            </div>
            <div class="ios-list">
                ${state.admins.map(adm => `
                    <div class="ios-list-item" style="padding: 12px 16px; align-items: center;">
                        <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${adm.username}</span>
                        <button onclick="window.removeAdmin('${adm.id}')" style="background: none; border: none; color: var(--text-secondary); padding: 8px; opacity: 0.4; margin-left: auto; cursor: pointer;">
                            <i data-lucide="trash-2" size="18"></i>
                        </button>
                    </div>
                `).join('')}
                <div class="ios-list-item" onclick="createNewAdmin()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px;">
                    <i data-lucide="user-plus" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t.add_admin || 'Agregar Admin'}
                </div>
            </div>
            <div style="height: 100px;"></div> <!-- Spacer for bottom nav padding -->
    `;
    }

    html += `</div>`;
    root.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Global UI Updates
    const isDevView = ['platform-dev-dashboard', 'platform-school-details'].includes(view);
    const showNav = state.currentUser !== null && !['school-selection', 'auth'].includes(view) && !isDevView;

    document.getElementById('logout-btn').classList.toggle('hidden', state.currentUser === null);
    document.getElementById('dev-login-trigger').classList.toggle('hidden', state.currentUser !== null);
    document.getElementById('student-nav').classList.toggle('hidden', !showNav || state.isAdmin);
    document.getElementById('admin-nav').classList.toggle('hidden', !showNav || !state.isAdmin);

    // Sync active nav items
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === view);
    });

    // Update Notification Badges (Admin)
    if (state.isAdmin) {
        const pendingCount = (state.paymentRequests || []).filter(r => r.status === 'pending').length;
        const badge = document.getElementById('memberships-badge');
        if (badge) {
            badge.textContent = pendingCount;
            badge.classList.toggle('hidden', pendingCount === 0);
        }
    }
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

// --- LOCATION HELPERS ---
window.formatLocationLabel = (loc) => {
    if (!loc) return '';
    // Strip everything in parentheses non-greedily and clean up spacing
    return loc.replace(/\s*\(.*?\)\s*/g, ' ').trim();
};

// --- HELPER: CALCULATE DAYS REMAINING ---
window.getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
};

window.showLocationDetails = (fullLoc) => {
    if (!fullLoc) return;
    const title = window.formatLocationLabel(fullLoc);
    document.getElementById('loc-modal-title').innerText = title || "Location";
    document.getElementById('loc-modal-address').innerText = fullLoc;
    document.getElementById('location-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
};

// --- EXPIRATION LOGIC ---
window.checkExpirations = async () => {
    if (!state.students || state.students.length === 0) return;
    const now = new Date();
    let updatedCount = 0;

    for (let s of state.students) {
        let changed = false;

        // Handle Multi-Batch Expiration
        if (Array.isArray(s.active_packs) && s.active_packs.length > 0) {
            const initialCount = s.active_packs.length;
            s.active_packs = s.active_packs.filter(p => new Date(p.expires_at) > now);

            if (s.active_packs.length !== initialCount) {
                s.balance = s.active_packs.reduce((sum, p) => sum + p.count, 0);
                if (s.active_packs.length === 0) {
                    s.package = null;
                    s.paid = false;
                    s.package_expires_at = null;
                }
                changed = true;
            }
        } else if (s.package_expires_at && s.balance > 0) {
            // Legacy/Single Fallback Expiration
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
            console.log(`Student[${s.id}] package(s) expired. Updating profile.`);
            if (supabaseClient) {
                await supabaseClient.from('students').update({
                    balance: s.balance,
                    paid: s.paid,
                    package: s.package,
                    package_expires_at: s.package_expires_at,
                    active_packs: s.active_packs
                }).eq('id', s.id);
            }
            updatedCount++;
        }
    }

    if (updatedCount > 0) {
        saveState();
    }
};

// --- CUSTOM DROPDOWN LOGIC ---
window.toggleCustomDropdown = (id) => {
    const list = document.getElementById(`dropdown-list-${id}`);
    const isOpen = list.classList.contains('open');

    // Close all other dropdowns first
    document.querySelectorAll('.custom-dropdown-list').forEach(el => el.classList.remove('open'));

    if (!isOpen) {
        list.classList.add('open');
    }
};

window.selectCustomOption = async (classId, field, value) => {
    // Close dropdown
    document.querySelectorAll('.custom-dropdown-list').forEach(el => el.classList.remove('open'));

    // Update data
    await window.updateClass(classId, field, value);
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
        school_id: state.currentSchool.id,
        created_at: new Date().toISOString()
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
    if (confirm(`Purchase ${sub.name} for $${sub.price} ? `)) {
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
            state.currentUser = {
                name: data.username + " (Admin)",
                role: "admin",
                password: data.password // Store password for detail access 
            };
            state.isAdmin = true;
            state.currentView = 'admin-students';
            saveState();
            await fetchAllData(); // Prioritize fetching admin data immediately
            return;
        }
    }

    // Fallback to hardcoded for safety during migration
    if (user === "Omid" && pass === "royal") {
        state.currentUser = {
            name: "Omid (Admin)",
            role: "admin",
            password: "royal"
        };
        state.isAdmin = true;
        state.currentView = 'admin-students';
        saveState();
        fetchAllData(); // Trigger fetch for local fallback as well
    } else {
        alert(t('invalid_login'));
    }
};

window.promptDevLogin = () => {
    document.getElementById('dev-user-input').value = '';
    document.getElementById('dev-pass-input').value = '';
    document.getElementById('dev-login-modal').classList.remove('hidden');
    document.getElementById('dev-user-input').focus();
};

window.submitDevLogin = () => {
    const user = document.getElementById('dev-user-input').value;
    const pass = document.getElementById('dev-pass-input').value;
    if (user && pass) {
        document.getElementById('dev-login-modal').classList.add('hidden');
        window.loginDeveloper(user, pass);
    } else {
        alert("Please enter both username and password.");
    }
};

window.loginDeveloper = async (user, pass) => {
    if (!supabaseClient) {
        alert("Database connection not initialized.");
        return;
    }

    state.loading = true;
    renderView();

    const { data, error } = await supabaseClient
        .from('platform_admins')
        .select('*')
        .eq('username', user)
        .eq('password', pass)
        .single();

    if (data) {
        state.isPlatformDev = true;
        state.currentUser = {
            name: data.username + " (Dev)",
            role: "platform-dev",
            password: data.password // Store for detail access
        };
        state.currentView = 'platform-dev-dashboard';
        state.loading = false;
        saveState();
        await fetchPlatformData();
    } else {
        state.loading = false;
        renderView();
        alert("Invalid Developer credentials.");
    }
};

window.deleteSchool = async (schoolId, schoolName) => {
    const t = DANCE_LOCALES[state.language] || DANCE_LOCALES.en;
    if (!confirm(`${t.delete_school_confirm}\n\nSchool: ${schoolName}`)) return;

    try {
        if (!supabaseClient) {
            alert("No database connection");
            return;
        }

        // 1. Delete all related data for this school
        // We'll run them in parallel for speed, though order might matter with DB constraints.
        // Usually, deleting the child records first is safer.
        await Promise.all([
            supabaseClient.from('payments').delete().eq('school_id', schoolId),
            supabaseClient.from('classes').delete().eq('school_id', schoolId),
            supabaseClient.from('subscriptions').delete().eq('school_id', schoolId),
            supabaseClient.from('students').delete().eq('school_id', schoolId),
            supabaseClient.from('admins').delete().eq('school_id', schoolId)
        ]);

        // 2. Delete the school itself
        const { error } = await supabaseClient.from('schools').delete().eq('id', schoolId);

        if (error) {
            alert(`Error deleting school: ${error.message}`);
        } else {
            alert(t.delete_school_success);
            await fetchPlatformData(); // Refresh the list
            renderView();
        }
    } catch (err) {
        console.error("Deletion failed:", err);
        alert(`Deletion failed: ${err.message}`);
    }
};

async function fetchPlatformData() {
    if (!supabaseClient) return;
    state.loading = true;
    renderView();

    try {
        const [schools, students, admins, classes, subs] = await Promise.all([
            supabaseClient.from('schools').select('*').order('name'),
            supabaseClient.from('students').select('*'),
            supabaseClient.from('admins').select('*'),
            supabaseClient.from('classes').select('*'),
            supabaseClient.from('subscriptions').select('*')
        ]);

        state.platformData = {
            schools: schools.data || [],
            students: students.data || [],
            admins: admins.data || [],
            classes: classes.data || [],
            subscriptions: subs.data || []
        };

        state.loading = false;
        renderView();
    } catch (err) {
        state.loading = false;
        console.error("Error fetching platform data:", err);
        renderView();
    }
}

window.createNewSchoolWithAdmin = async () => {
    const schoolName = prompt("Nombre de la nueva escuela:");
    if (!schoolName) return;

    const adminUser = prompt("Username para el primer Admin:");
    const adminPass = prompt("Password para el primer Admin:");
    if (!adminUser || !adminPass) {
        alert("Debes proporcionar credenciales de admin.");
        return;
    }

    state.loading = true;
    renderView();

    try {
        // 1. Create School
        const { data: schoolRes, error: schoolErr } = await supabaseClient
            .from('schools')
            .insert([{ name: schoolName }])
            .select()
            .single();

        if (schoolErr) throw schoolErr;

        // 2. Create Admin linked to that school
        const { error: adminErr } = await supabaseClient
            .from('admins')
            .insert([{
                id: "ADMIN-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
                username: adminUser,
                password: adminPass,
                school_id: schoolRes.id
            }]);

        if (adminErr) throw adminErr;

        alert("¡Escuela y Admin creados con éxito!");
        await fetchPlatformData();
    } catch (err) {
        alert("Error: " + err.message);
        state.loading = false;
        renderView();
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
        await fetchAllData();
    }
};

window.removeAdmin = async (id) => {
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    if (confirm("¿Estás seguro de eliminar a este administrador?")) {
        if (supabaseClient) {
            const { error } = await supabaseClient.from('admins').delete().eq('id', id);
            if (error) { alert("Error: " + error.message); return; }
        }
        state.admins = state.admins.filter(a => a.id !== id);
        saveState();
        renderView();
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
        state.adminSettings = {}; // PROACTIVE CLEAR
        state.currentView = 'auth';
        saveState();
        fetchAllData(); // Fetch school specific data
    }
};

window.backToSchoolSelection = () => {
    state.currentSchool = null;
    state.isAdmin = false;
    state.currentView = 'school-selection';
    saveState();
    renderView();
};

window.toggleWeeklyPreview = () => {
    state.showWeeklyPreview = !state.showWeeklyPreview;
    renderView();
    // Re-initialize Lucide icons since we just re-rendered or added new elements
    if (window.lucide) {
        window.lucide.createIcons();
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
        if (state.isPlatformDev) {
            await fetchPlatformData();
        } else {
            fetchAllData();
        }
    }
};

window.createNewSchoolWithAdmin = async () => {
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });

    const schoolName = prompt(t('enter_school_name'));
    if (!schoolName) return;

    const adminUser = prompt(t('enter_admin_user') || "Admin Username:");
    if (!adminUser) return;

    const adminPass = prompt(t('enter_admin_pass') || "Admin Password:");
    if (!adminPass) return;

    if (supabaseClient) {
        state.loading = true;
        renderView();

        try {
            // 1. Create School
            const { data: schoolData, error: schoolError } = await supabaseClient
                .from('schools')
                .insert([{ name: schoolName }])
                .select();

            if (schoolError) throw schoolError;
            const schoolId = schoolData[0].id;

            // 2. Create Admin
            const { error: adminError } = await supabaseClient
                .from('admins')
                .insert([{
                    username: adminUser,
                    password: adminPass,
                    school_id: schoolId
                }]);

            if (adminError) throw adminError;

            // 3. Create Default "Clase Suelta" Pass
            const { error: subError } = await supabaseClient
                .from('subscriptions')
                .insert([{
                    name: 'Clase Suelta',
                    price: 150,
                    limit_count: 1,
                    school_id: schoolId
                }]);

            if (subError) throw subError;

            alert(`School "${schoolName}" and Admin "${adminUser}" created successfully!`);
            await fetchPlatformData();
        } catch (err) {
            console.error("Creation Error:", err);
            alert("Failed to create school/admin: " + err.message);
        } finally {
            state.loading = false;
            renderView();
        }
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

    console.log(`Activating package[${packageName}]for student[${studentId}]...`);
    if (pkg) console.log(`Matched subscription: `, pkg);

    if (student) {
        // Calculate new balance: accumulate if both are numbers, otherwise handle unlimited (null)
        let newBalance;
        const incomingLimit = pkg ? parseInt(pkg.limit_count) : 0;

        if (!pkg) {
            // If no package (e.g. resetting), set balance to 0
            newBalance = 0;
        } else if (isNaN(incomingLimit) || incomingLimit === 0) {
            // New package is Unlimited
            newBalance = null;
        } else if (student.balance === null) {
            // Already Unlimited, stays Unlimited
            newBalance = null;
        } else {
            // Both are specific numbers, so we ADD them
            newBalance = (student.balance || 0) + incomingLimit;
        }

        // Handle Multi-Batch Expiration
        const days = (pkg && pkg.validity_days && !isNaN(parseInt(pkg.validity_days))) ? parseInt(pkg.validity_days) : 30;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);

        const newPack = {
            id: "PACK-" + Date.now().toString(36).toUpperCase(),
            name: pkg ? pkg.name : packageName,
            count: incomingLimit,
            expires_at: expiry.toISOString(),
            created_at: new Date().toISOString()
        };

        // Initialize active_packs if it doesn't exist
        const activePacks = Array.isArray(student.active_packs) ? [...student.active_packs] : [];
        if (pkg) activePacks.push(newPack);

        const updates = {
            package: pkg ? pkg.name : null,
            balance: newBalance,
            paid: !!pkg,
            active_packs: activePacks,
            package_expires_at: pkg ? expiry.toISOString() : null // Keep for backward compatibility/quick check
        };

        console.log(`Update payload (Multi-Batch): `, updates);

        if (supabaseClient) {
            const { error } = await supabaseClient.from('students').update(updates).eq('id', studentId);
            if (error) {
                console.error("Supabase update error:", error);
                if (error.message.includes('active_packs')) {
                    alert("FATAL ERROR: The database is missing the 'active_packs' column. Please run the SQL script in Supabase: ALTER TABLE students ADD COLUMN IF NOT EXISTS active_packs JSONB DEFAULT '[]';");
                } else {
                    alert("Error updating: " + error.message);
                }
                return;
            }
        }

        student.package = updates.package;
        student.balance = updates.balance;
        student.paid = updates.paid;
        student.active_packs = updates.active_packs;
        student.package_expires_at = updates.package_expires_at;

        saveState();
        await fetchAllData();
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
        if (!state.currentSchool || !state.currentSchool.id) {
            console.error("Cannot update setting: No school selected.");
            return;
        }

        const { error } = await supabaseClient
            .from('admin_settings')
            .upsert({
                school_id: state.currentSchool.id,
                key: String(key),
                value: String(value)
            }, { onConflict: 'school_id, key' });

        if (error) {
            console.error(`Error updating setting[${key}]: `, error);
            throw error;
        }
    }
    state.adminSettings[key] = value;
    saveState();
};

window.createNewAdmin = async () => {
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const username = prompt(t('enter_admin_user') || 'Username:');
    if (!username) return;
    const password = prompt(t('enter_admin_pass') || 'Password:');
    if (!password) return;

    if (supabaseClient) {
        const { error } = await supabaseClient.from('admins').insert([{
            username,
            password,
            school_id: state.currentSchool.id
        }]);
        if (error) { alert("Error creating admin: " + error.message); return; }
        alert(t('admin_created'));
        fetchAllData();
    }
};

window.removeAdmin = async (id) => {
    const t = DANCE_LOCALES[state.language] || DANCE_LOCALES.en;
    if (!confirm("Are you sure you want to remove this administrator?")) return;

    if (supabaseClient) {
        const { error } = await supabaseClient.from('admins').delete().eq('id', id);
        if (error) { alert("Error removing admin: " + error.message); return; }
        fetchAllData();
    }
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
    const newClass = { name: "New Class", day: "Mon", time: "09:00", price: 150, tag: "Beginner", location: "Studio A", school_id: state.currentSchool.id };
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
        const val = (field === 'price' ? parseFloat(value) : (['limit_count', 'validity_days'].includes(field) ? parseInt(value) : value));
        if (supabaseClient) {
            const { error } = await supabaseClient.from('subscriptions').update({ [field]: val }).eq('id', id);
            if (error) { console.error(error); return; }
        }
        sub[field] = val;
        saveState();
    }
};


window.addSubscription = async () => {
    const newSub = { id: "S" + Date.now(), name: "New Plan", price: 50, duration: "30 days", limit_count: 10, validity_days: 30, school_id: state.currentSchool.id };
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

// --- MOBILE UI HELPERS ---
// --- MOBILE UI HELPERS ---
window.toggleSchoolDropdown = () => {
    const list = document.getElementById('school-dropdown-list');
    const triggerIcon = document.querySelector('#school-dropdown-trigger i');
    if (!list) return;

    const isOpen = list.classList.contains('open');

    if (!isOpen) {
        list.classList.add('open');
        if (triggerIcon) triggerIcon.style.transform = 'rotate(180deg)';

        // Auto-close when clicking outside
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!e.target.closest('#school-dropdown-trigger') && !e.target.closest('#school-dropdown-list')) {
                    list.classList.remove('open');
                    if (triggerIcon) triggerIcon.style.transform = 'rotate(0deg)';
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 10);
    } else {
        list.classList.remove('open');
        if (triggerIcon) triggerIcon.style.transform = 'rotate(0deg)';
    }
};

window.renderAdminStudentCard = (s) => {
    const t = (key) => window.t(key);
    const statusLabel = s.paid ? t('status_active') : t('status_unpaid');
    const statusColor = s.paid ? 'var(--system-green)' : 'var(--system-red)';
    const statusBg = s.paid ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)';

    return `
        <div class="ios-list-item" onclick="updateStudentPrompt('${s.id}')" style="cursor: pointer; padding: 12px 16px;">
            <div style="width: 44px; height: 44px; background: var(--system-gray6); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 14px; font-weight: 700; color: var(--text-secondary); font-size: 16px;">
                ${s.name.charAt(0).toUpperCase()}
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                    <div style="font-weight: 600; font-size: 17px; color: var(--text-primary);">${s.name}</div>
                    <div style="font-size: 10px; font-weight: 700; color: ${statusColor}; background: ${statusBg}; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.02em;">
                        ${statusLabel}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <div style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">
                        ${t('remaining_classes') || 'Clases restantes'}: <span style="color: var(--system-blue); font-weight: 700;">${s.balance === null ? '∞' : s.balance}</span>
                    </div>
                    ${Array.isArray(s.active_packs) && s.active_packs.length > 0 ? `
                        <div style="font-size: 11px; background: var(--system-gray6); padding: 2px 6px; border-radius: 6px; color: var(--text-secondary); font-weight: 600;">
                            ${s.active_packs.length} ${s.active_packs.length === 1 ? 'Pack' : 'Packs'}
                        </div>
                    ` : ''}
                </div>
            </div>
            <i data-lucide="chevron-right" size="18" style="color: var(--system-gray4); margin-left: 8px;"></i>
        </div >
        `;
};

window.filterStudents = (query) => {
    const q = query.toLowerCase();
    const list = document.getElementById('admin-student-list');
    if (!list) return;

    const filtered = state.students.filter(s => s.name.toLowerCase().includes(q));
    // Wrap in ios-list container if not present, but here we just render items
    list.innerHTML = filtered.map(s => renderAdminStudentCard(s)).join('');
    if (window.lucide) lucide.createIcons();
};

window.updateStudentPrompt = async (id) => {
    const s = state.students.find(x => x.id === id);
    if (!s) return;

    // Security Check: Require admin/dev password to edit/view sensitive data
    const inputPass = prompt("Admin Password Required:");
    if (!inputPass) return;

    // Use current session password for dynamic validation
    const sessionPass = state.currentUser ? state.currentUser.password : null;

    if (inputPass !== sessionPass && inputPass !== "royal" && inputPass !== "dany") {
        alert("Incorrect Admin Password.");
        return;
    }

    const t = window.t;
    const modal = document.getElementById('student-modal');
    const content = document.getElementById('student-modal-content');

    content.innerHTML = `
        <div style="text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 2rem;">
                <div style="width: 50px; height: 50px; background: var(--system-gray6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--system-blue); font-size: 20px;">
                    ${s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style="margin: 0; font-size: 20px; letter-spacing: -0.5px;">${s.name}</h2>
                    <p style="margin: 0; font-size: 12px; color: var(--text-secondary);">${s.id}</p>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">Nombre Completo</label>
                    <input type="text" id="edit-student-name" class="minimal-input" value="${s.name}" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">Teléfono</label>
                    <input type="text" id="edit-student-phone" class="minimal-input" value="${s.phone || ''}" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">Contraseña (Pin)</label>
                    <input type="text" id="edit-student-pass" class="minimal-input" value="${s.password}" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">Clases Restantes (Total)</label>
                    <input type="number" id="edit-student-balance" class="minimal-input" value="${s.balance === null ? '' : s.balance}" placeholder="Ilimitado" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.05em;">Paquetes Detalles</label>
                    <div style="display: flex; flex-direction: column; gap: 8px; background: var(--system-gray6); border-radius: 14px; padding: 4px;">
                        ${(s.active_packs || []).length > 0 ? s.active_packs.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at)).map(p => `
                            <div style="padding: 12px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 13px; font-weight: 700;">${p.name}</div>
                                    <div style="font-size: 10px; opacity: 0.6; font-weight: 600; text-transform: uppercase;">${p.count} Clases • Vence: ${new Date(p.expires_at).toLocaleDateString()}</div>
                                </div>
                                <button onclick="window.removeStudentPack('${s.id}', '${p.id}')" style="background: transparent; border: none; color: var(--system-red); padding: 8px; cursor: pointer; opacity: 0.5;">
                                    <i data-lucide="minus-circle" size="16"></i>
                                </button>
                            </div>
                        `).join('').replace(/border-bottom: 1px solid var\(--border\);:last-child/, 'border-bottom: none;') : '<div style="padding: 16px; font-size: 12px; opacity: 0.5; text-align: center;">Sin paquetes activos</div>'}
                    </div>
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">Fecha de Registro</label>
                    <div style="background: var(--system-gray6); padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
                        ${s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">Próximo Vencimiento (Main Timer)</label>
                    <input type="date" id="edit-student-expires" class="minimal-input" value="${s.package_expires_at ? new Date(s.package_expires_at).toISOString().split('T')[0] : ''}" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 2.5rem;">
                <button class="btn-secondary" onclick="document.getElementById('student-modal').classList.add('hidden')" style="height: 50px; border-radius: 14px; font-weight: 600;">Cancelar</button>
                <button class="btn-primary" onclick="window.saveStudentDetails('${s.id}')" style="height: 50px; border-radius: 14px; font-weight: 600;">Guardar</button>
            </div>

            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border);">
                <button onclick="window.deleteStudent('${s.id}')" style="background: rgba(255, 59, 48, 0.05); color: var(--system-red); border: none; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 600; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i data-lucide="user-minus" size="14"></i> Eliminar Alumno permenentemente
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
};

window.removeStudentPack = async (studentId, packId) => {
    if (!confirm("¿Eliminar este paquete? La balanza total se ajustará.")) return;

    const s = state.students.find(x => x.id === studentId);
    if (!s || !Array.isArray(s.active_packs)) return;

    // Filter out the pack
    s.active_packs = s.active_packs.filter(p => p.id !== packId);

    // Recalculate balance
    s.balance = s.active_packs.reduce((sum, p) => sum + (parseInt(p.count) || 0), 0);

    // Update paid status
    if (s.active_packs.length === 0) {
        s.paid = false;
        s.package = null;
        s.package_expires_at = null;
    } else {
        // Update next expiration date if the one removed was the soonest
        s.package_expires_at = s.active_packs.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at))[0].expires_at;
    }

    console.log(`Removed pack[${packId}] from student[${studentId}]. New balance: ${s.balance}`);

    if (supabaseClient) {
        const { error } = await supabaseClient
            .from('students')
            .update({
                active_packs: s.active_packs,
                balance: s.balance,
                paid: s.paid,
                package: s.package,
                package_expires_at: s.package_expires_at
            })
            .eq('id', studentId);

        if (error) {
            alert("Error updating database: " + error.message);
            return;
        }
    }

    saveState();
    // Re-render the modal to show updated list
    window.updateStudentPrompt(studentId);
};

window.saveStudentDetails = async (id) => {
    const s = state.students.find(x => x.id === id);
    if (!s) return;

    const newName = document.getElementById('edit-student-name').value.trim();
    const newPhone = document.getElementById('edit-student-phone').value.trim();
    const newPass = document.getElementById('edit-student-pass').value.trim();
    const balanceVal = document.getElementById('edit-student-balance').value;
    const expiresVal = document.getElementById('edit-student-expires').value;

    const updates = {
        name: newName,
        phone: newPhone,
        password: newPass,
        balance: balanceVal === "" ? null : parseInt(balanceVal),
        package_expires_at: expiresVal ? new Date(expiresVal).toISOString() : null
    };

    if (!newName || !newPass) {
        alert("Nombre and Password are required.");
        return;
    }

    if (supabaseClient) {
        const { error } = await supabaseClient.from('students').update(updates).eq('id', id);
        if (error) { alert("Error saving: " + error.message); return; }
    }

    Object.assign(s, updates);
    document.getElementById('student-modal').classList.add('hidden');
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
        // Multi-Batch Consumption: Consume from the soonest-expiring pack first
        const activePacks = Array.isArray(student.active_packs) ? [...student.active_packs] : [];
        let remainingToDeduct = count;

        if (activePacks.length > 0) {
            // Sort by expiration date (ascending)
            activePacks.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));

            for (let i = 0; i < activePacks.length && remainingToDeduct > 0; i++) {
                const pack = activePacks[i];
                if (pack.count >= remainingToDeduct) {
                    pack.count -= remainingToDeduct;
                    remainingToDeduct = 0;
                } else {
                    remainingToDeduct -= pack.count;
                    pack.count = 0;
                }
            }
            // Remove empty packs
            const updatedPacks = activePacks.filter(p => p.count > 0);
            const newBalance = updatedPacks.reduce((sum, p) => sum + p.count, 0);

            const updates = {
                balance: newBalance,
                active_packs: updatedPacks
            };

            if (supabaseClient) {
                const { error } = await supabaseClient.from('students').update(updates).eq('id', studentId);
                if (error) { alert("Error updating balance: " + error.message); return; }
            }
            student.balance = newBalance;
            student.active_packs = updatedPacks;
        } else {
            // Fallback for students without active_packs field (legacy balance)
            const newBalance = student.balance - count;
            if (supabaseClient) {
                const { error } = await supabaseClient.from('students').update({ balance: newBalance }).eq('id', studentId);
                if (error) { alert("Error updating balance: " + error.message); return; }
            }
            student.balance = newBalance;
        }

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

document.getElementById('dev-login-trigger').addEventListener('click', () => window.promptDevLogin());

// Global Enter Key Handler for Logins
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const target = e.target;
        if (target.id === 'dev-pass-input') window.submitDevLogin();
        if (target.id === 'auth-pass') {
            const isSignup = state.authMode === 'signup';
            if (isSignup) signUpStudent(); else loginStudent();
        }
        if (target.id === 'admin-pass-input') loginAdminWithCreds();
    }
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
// --- SEED DATA (Temporary) ---


(function init() {
    const local = localStorage.getItem('dance_app_state');
    if (local) {
        const saved = JSON.parse(local);
        state.language = saved.language || 'en';
        state.theme = saved.theme || 'dark';
        if (saved.currentUser) state.currentUser = saved.currentUser;
        if (saved.isAdmin !== undefined) state.isAdmin = saved.isAdmin;
        if (saved.isPlatformDev !== undefined) state.isPlatformDev = saved.isPlatformDev;
        if (saved.currentView) state.currentView = saved.currentView;
        if (saved.scheduleView) state.scheduleView = saved.scheduleView;
        if (saved.lastActivity) state.lastActivity = saved.lastActivity;
        if (saved.currentSchool) state.currentSchool = saved.currentSchool;
    }

    // Check if session expired while away
    window.checkInactivity();

    // SILENT SEED (Ensures "Profe Daniela" exists)
    (async function silentSeed() {
        if (!supabaseClient) return;
        try {
            // 1. Check for existing school using exact match to avoid duplicates
            const { data: schools } = await supabaseClient.from('schools').select('*').eq('name', 'Profe Daniela');
            let schoolId;

            if (!schools || schools.length === 0) {
                // If not found, insert
                const { data: newSchool } = await supabaseClient.from('schools').insert([{ name: 'Profe Daniela' }]).select();
                if (newSchool && newSchool.length > 0) schoolId = newSchool[0].id;
            } else {
                schoolId = schools[0].id;
                // [HOUSEKEEPING] If duplicates exist in DB, we'll just use the first one.
            }

            if (schoolId) {
                // 2. Check for existing admin in ADMINS table (Correct mapping)
                const { data: adminExists } = await supabaseClient.from('admins').select('*').eq('username', 'Daniela').eq('school_id', schoolId);

                if (!adminExists || adminExists.length === 0) {
                    await supabaseClient.from('admins').insert([{
                        username: 'Daniela',
                        password: 'dany', // Note: In production, hash passwords!
                        school_id: schoolId
                    }]);
                }
            }
            // Refresh logic to show changes immediately
            if (state.currentView === 'school-selection' && !state.schools.find(s => s.name === 'Profe Daniela')) {
                fetchAllData();
            }
        } catch (e) {
            console.warn("Silent seed skipped/failed:", e);
        }
    })();

    updateI18n();
    document.body.setAttribute('data-theme', state.theme);
    document.body.classList.toggle('dark-mode', state.theme === 'dark');
    renderView();
    if (window.lucide) lucide.createIcons();

    // Fetch live data from Supabase
    fetchAllData();

    // Background Sync: Refresh every 30 seconds to catch QR scans from other devices
    setInterval(() => {
        // REFRESH GUARD: Don't refresh if user is typing or a modal is open
        const isFocussed = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
        const isModalOpen = document.querySelector('.modal:not(.hidden)');

        if (state.currentUser && !isFocussed && !isModalOpen) {
            fetchAllData();
        }
    }, 30000);

    // Inactivity Monitor: Check every minute
    setInterval(() => {
        window.checkInactivity();
    }, 60000);

    // Global Click Listener for Custom Dropdowns
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown-container')) {
            document.querySelectorAll('.custom-dropdown-list').forEach(el => el.classList.remove('open'));
        }
    });
})();
