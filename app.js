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
        admin_label: "Admin",
        no_subs: "No active memberships found",
        scan_success: "Verification Successful",
        scan_fail: "Membership Inactive",
        camera_not_found: "No camera found. Please connect a camera or use a device with a built-in camera.",
        camera_permission_denied: "Camera access denied. Please allow camera in your browser settings.",
        switch_to_admin: "Go to Admin",
        switch_to_student: "Go to Student",
        auth_subtitle: "Precision in every step.",
        welcome_to: "Welcome to",
        student_signup: "New Student",
        admin_login: "Admin login",
        enter_name: "How should we call you?",
        full_name_placeholder: "Full name",
        email_placeholder: "Email address",
        signup_require_fields: "Please enter full name, email, phone and password.",
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
        class_unit: "class",
        classes_unit: "classes",
        cancel: "Cancel",
        confirm_attendance: "Confirm Attendance",
        attendance_success: "Attendance confirmed!",
        no_classes_buy_package: "This student has no classes left. They should buy a new package.",
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
        limit_classes_placeholder: "Classes (0 = Unlimited)",
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
        enter_student_name: "Enter student name:",
        enter_student_phone: "Enter student phone:",
        enter_student_email: "Enter student email (optional):",
        enter_student_pass: "Enter student password:",
        student_created: "Student created!",
        unknown_student: "Unknown Student",
        delete_payment_confirm: "Delete this payment record forever?",
        select_school_title: "Welcome to Bailadmin",
        select_school_subtitle: "Please select your school or teacher to continue",
        add_school_btn: "New School",
        enter_school_name: "Enter new school or teacher name:",
        school_created: "School created successfully!",
        switch_school: "Switch School",
        welcome_classes: "Welcome to the classes of",
        loading: "Loading...",
        select_school_placeholder: "Choose your school...",
        loading_schools: "Loading schools...",
        no_schools: "No schools found",
        could_not_load_schools: "Could not load schools",
        connecting: "Connecting...",
        dev_access_title: "Dev Access",
        dev_access_subtitle: "Enter platform developer credentials",
        footer_support: "Support",
        footer_contact: "Contact",
        footer_copy: "Made with <3 by a salsero; © 2026 Bailadmin Systems. All rights reserved.",
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
        dev_events_feature: "Jack and Jill / Events",
        dev_events_feature_desc: "Allow this school to create Jack and Jill events (premium feature)",
        dev_events_enabled: "Enabled",
        dev_events_disabled: "Disabled",
        jack_and_jill_upgrade_msg: "To create events you need to upgrade to a package that includes this feature.",
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
        rename_school_btn: "Rename",
        rename_school_prompt: "Enter new name for this school:",
        rename_school_success: "School name updated.",
        delete_school_confirm: "Are you sure you want to delete this school? ALL data (students, admins, payments, classes) will be permanently lost.",
        delete_school_success: "School deleted successfully",
        add_school_title: "Create New School",
        school_info_section: "Academy Details",
        admin_info_section: "Initial Administrator",
        create_school_btn: "Execute Initialization",
        username_exists_msg: "This username is already taken. Please choose another one.",
        class_location: "Location",
        location_placeholder: "e.g. Studio A",
        active_packs_label: "Your Active Packs",
        expired_classes_label: "Expired Classes",
        no_expiration: "No expiration date",
        expires_in: "Expires in",
        days_left: "days left",
        expires_label: "Expires",
        search_students: "Search members...",
        loading_students_msg: "Loading members...",
        no_pending_msg: "No pending payments",
        refresh_btn: "Refresh",
        historical_total_label: "Historical",
        no_data_msg: "No data yet",
        mgmt_classes_title: "Class Management",
        mgmt_admins_title: "Administrators",
        day_label: "Day",
        hour_label: "Time",
        level_tag_label: "Level",
        new_class_label: "New Class",
        show_weekly_btn: "Show Weekly Plan",
        hide_weekly_btn: "Hide Weekly Plan",
        weekly_preview_title: "Weekly Preview",
        full_name_label: "Full Name",
        password_pin_label: "Password (PIN)",
        total_classes_label: "Classes Remaining (Total)",
        pack_details_title: "Package Details",
        reg_date_label: "Registration Date",
        next_expiry_label: "Next Expiry",
        delete_perm_label: "Delete member permanently",
        admin_pass_req: "Admin Password Required:",
        leave_blank_keep: "leave blank to keep",
        invalid_pass_msg: "Incorrect Admin Password.",
        save_btn: "Save",
        enter_admin_user: "Enter Admin Username:",
        enter_admin_pass: "Enter Admin Password:",
        admin_created: "Administrator created successfully!",
        remove_admin_confirm: "Are you sure you want to remove this administrator?",
        admin_removed: "Administrator removed successfully!",
        error_creating_admin: "Error creating administrator:",
        error_removing_admin: "Error removing administrator:",
        additional_features: "Additional features",
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
        competition_save: "Save",
        competition_saved: "Competition saved successfully.",
        competition_error: "Error saving competition.",
        competition_registrations: "Registrations",
        competition_publish_decisions: "Publish decisions",
        competition_republish_decisions: "Republish decisions",
        competition_confirm_publish: "Are you sure?",
        competition_approve: "Approve",
        competition_decline: "Decline",
        register_for_event: "Register for {eventName}",
        register_for_event_es: "Register for",
        reviewing_application: "We are reviewing your application",
        reviewing_application_es: "Estamos revisando tu solicitud",
        accepted: "Accepted",
        declined: "Declined",
        competition_approved_message: "Congratulations! You will compete in \"{eventName}\"",
        competition_declined_message: "This time you cannot compete, but we hope to see you next time.",
        submit_registration: "Submit registration",
        competition_no_events: "No Jack and Jill events yet.",
        competition_reg_opens_soon: "Registration opens soon",
        competition_select_or_create: "Select an event or create new.",
        competition_create_new: "Create new",
        competition_edit_tab: "Edit",
        no_existing_events: "No existing events.",
        add_new_event: "Add new event",
        competition_view_answers: "View answers",
        competition_answers: "Answers",
        competition_no_answers: "No answers yet.",
        competition_delete_confirm: "Delete this event? All registrations will be removed.",
        competition_copy: "Copy",
        competition_copy_of: "Copy of ",
        competition_confirm_copy: "Create copy as \"{name}\"? The new event will be inactive.",
        competition_copy_success: "Event copied.",
        competition_done: "Done",
        competition_saved_indicator: "Saved",
        competition_saving: "Saving...",
        competition_next_steps_placeholder: "E.g. No cuts, fixed camera, good lighting...",
        competition_video_submission_toggle: "Include video submission?",
        competition_video_prompt_label: "Video question text",
        competition_video_prompt_placeholder: "Upload your demo video (2-3 minutes)",
        competition_video_duration_error: "Video must be 2-3 minutes",
        competition_video_size_error: "File too large (max 50 MB)",
        competition_video_uploading: "Uploading...",
        competition_video_uploaded: "Video uploaded",
        competition_video_unavailable: "Video unavailable"
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
        camera_not_found: "No se encontró ninguna cámara. Conecta una cámara o usa un dispositivo con cámara integrada.",
        camera_permission_denied: "Acceso a la cámara denegado. Permite la cámara en la configuración del navegador.",
        switch_to_admin: "Ir a Admin",
        switch_to_student: "Ir a Alumno",
        auth_subtitle: "Eleva tu baile.",
        welcome_to: "Bienvenido a",
        student_signup: "Nuevo Alumno",
        admin_login: "Acceso Admin",
        enter_name: "¿Cómo te llamas?",
        full_name_placeholder: "Nombre completo",
        email_placeholder: "Correo electrónico",
        signup_require_fields: "Ingresa nombre completo, correo, teléfono y contraseña.",
        signup_invalid_email: "Ingresa un correo electrónico válido.",
        confirm_password_placeholder: "Repetir contraseña",
        signup_passwords_dont_match: "Las contraseñas no coinciden.",
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
        class_unit: "clase",
        classes_unit: "clases",
        cancel: "Cancelar",
        confirm_attendance: "Confirmar Asistencia",
        attendance_success: "¡Asistencia confirmada!",
        attendance_error: "Error en la asistencia",
        no_classes_buy_package: "Este alumno no tiene clases. Debe comprar un nuevo paquete.",
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
        limit_classes_placeholder: "Clases (0 = Ilimitado)",
        limit_classes_placeholder: "Clases (0 = Ilimitado)",
        price_mxd_label: "Precio MXD",
        transfer_details_label: "Detalles de Transferencia",
        bank_name_label: "Nombre del banco",
        account_number_label: "Numero de cuenta",
        holder_name_label: "Nombre del titular",
        asunto_label: "Asunto",
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
        enter_student_email: "Ingresa el email del alumno (opcional):",
        enter_student_pass: "Ingresa la contraseña del alumno:",
        student_created: "¡Alumno creado!",
        unknown_student: "Alumno Desconocido",
        delete_payment_confirm: "¿Eliminar este registro de pago permanentemente?",
        select_school_title: "Bienvenido a Bailadmin",
        select_school_subtitle: "Por favor selecciona tu escuela o profesor para continuar",
        add_school_btn: "Nueva Escuela",
        enter_school_name: "Ingresa el nombre de la nueva escuela o profesor:",
        school_created: "¡Escuela creada con éxito!",
        switch_school: "Cambiar Escuela",
        welcome_classes: "Bienvenido a las clases de",
        loading: "Cargando...",
        select_school_placeholder: "Elige tu escuela...",
        loading_schools: "Cargando academias...",
        no_schools: "No hay academias",
        could_not_load_schools: "No se pudieron cargar las academias",
        connecting: "Iniciando conexión...",
        dev_access_title: "Acceso Dev",
        dev_access_subtitle: "Ingresa credenciales de desarrollador",
        footer_support: "Soporte",
        footer_contact: "Contacto",
        footer_copy: "Hecho con <3 por un salsero; © 2026 Bailadmin Systems. Todos los derechos reservados.",
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
        dev_events_feature: "Jack and Jill / Eventos",
        dev_events_feature_desc: "Permitir a esta escuela crear eventos Jack and Jill (función premium)",
        dev_events_enabled: "Activado",
        dev_events_disabled: "Desactivado",
        jack_and_jill_upgrade_msg: "Para crear eventos necesitas actualizar a un paquete que incluya esta función.",
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
        rename_school_btn: "Renombrar",
        rename_school_prompt: "Ingresa el nuevo nombre de la escuela:",
        rename_school_success: "Nombre de escuela actualizado.",
        delete_school_confirm: "¿Estás seguro de que quieres eliminar esta escuela? TODOS los datos (alumnos, admins, pagos, clases) se perderán permanentemente.",
        delete_school_success: "Escuela eliminada con éxito",
        add_school_title: "Crear Nueva Escuela",
        school_info_section: "Detalles de la Academia",
        admin_info_section: "Administrador Inicial",
        create_school_btn: "Ejecutar Inicialización",
        username_exists_msg: "Este usuario ya está en uso. Por favor elige otro.",
        class_location: "Ubicación",
        location_placeholder: "Ej: Aula A",
        active_packs_label: "Tus Paquetes Activos",
        expired_classes_label: "Clases Expiradas",
        no_expiration: "Sin fecha de vencimiento",
        expires_in: "Vence en",
        days_left: "días restantes",
        expires_label: "Vence",
        search_students: "Buscar alumnos...",
        loading_students_msg: "Cargando alumnos...",
        no_pending_msg: "Sin pagos pendientes",
        refresh_btn: "Actualizar",
        historical_total_label: "Histórico",
        no_data_msg: "No hay datos",
        mgmt_classes_title: "Gestión de Clases",
        mgmt_admins_title: "Administradores",
        day_label: "Día",
        hour_label: "Hora",
        level_tag_label: "Nivel",
        new_class_label: "Nueva Clase",
        show_weekly_btn: "Ver Plan Semanal",
        hide_weekly_btn: "Ocultar Plan Semanal",
        weekly_preview_title: "Vista Previa (Semanal)",
        full_name_label: "Nombre Completo",
        password_pin_label: "Contraseña (PIN)",
        total_classes_label: "Clases Restantes (Total)",
        pack_details_title: "Paquetes Detalles",
        reg_date_label: "Fecha de Registro",
        next_expiry_label: "Próximo Vencimiento",
        delete_perm_label: "Eliminar Alumno permanentemente",
        admin_pass_req: "Password Admin Requerido:",
        leave_blank_keep: "dejar en blanco para mantener",
        invalid_pass_msg: "Contraseña Incorrecta.",
        save_btn: "Guardar",
        enter_admin_user: "Usuario Administrador:",
        enter_admin_pass: "Contraseña Administrador:",
        admin_created: "¡Administrador creado con éxito!",
        remove_admin_confirm: "¿Estás seguro de que quieres eliminar a dieser Administrador?",
        admin_removed: "Administrador eliminado con éxito.",
        error_creating_admin: "Error al crear administrador:",
        error_removing_admin: "Error al eliminar administrador:",
        additional_features: "Funciones adicionales",
        create_new_competition: "Crear nueva competencia",
        jack_and_jill: "Jack and Jill",
        competition_date: "Fecha",
        competition_time: "Hora",
        competition_name: "Nombre del evento",
        competition_questions: "Preguntas del organizador",
        competition_add_question: "Añadir pregunta",
        competition_next_steps: "Próximos pasos (para alumnos)",
        competition_activate_event: "Activar evento",
        competition_activate_signin: "Activar registro",
        competition_for_event: "Para evento",
        competition_save: "Guardar",
        competition_saved: "Competencia guardada correctamente.",
        competition_error: "Error al guardar la competencia.",
        competition_registrations: "Registros",
        competition_publish_decisions: "Publicar decisión",
        competition_republish_decisions: "Republicar decisiones",
        competition_confirm_publish: "¿Estás seguro?",
        competition_approve: "Aprobar",
        competition_decline: "Rechazar",
        register_for_event: "Registrarse para {eventName}",
        register_for_event_es: "Registrarse para",
        reviewing_application: "Estamos revisando tu solicitud",
        reviewing_application_es: "Estamos revisando tu solicitud",
        accepted: "Aceptado",
        declined: "Rechazado",
        competition_approved_message: "¡Felicidades! Vas a competir en \"{eventName}\"",
        competition_declined_message: "Esta vez no puedes competir, pero te esperamos la próxima vez.",
        submit_registration: "Enviar registro",
        competition_no_events: "Aún no hay eventos Jack and Jill.",
        competition_reg_opens_soon: "Inscripciones próximamente",
        competition_select_or_create: "Selecciona un evento o crea uno nuevo.",
        competition_create_new: "Crear nuevo",
        competition_edit_tab: "Editar",
        no_existing_events: "No hay eventos.",
        add_new_event: "Añadir nuevo evento",
        competition_view_answers: "Ver respuestas",
        competition_answers: "Respuestas",
        competition_no_answers: "Aún no hay respuestas.",
        competition_delete_confirm: "¿Eliminar este evento? Se borrarán todas las inscripciones.",
        competition_copy: "Copiar",
        competition_copy_of: "Copia de ",
        competition_confirm_copy: "¿Crear copia como \"{name}\"? El nuevo evento estará inactivo.",
        competition_copy_success: "Evento copiado.",
        competition_done: "Listo",
        competition_saved_indicator: "Guardado",
        competition_saving: "Guardando...",
        competition_next_steps_placeholder: "Ej: Sin cortes, cámara fija, buena iluminación...",
        competition_video_submission_toggle: "¿Incluir envío de video?",
        competition_video_prompt_label: "Texto de la pregunta de video",
        competition_video_prompt_placeholder: "Sube tu video demo (2-3 minutos)",
        competition_video_duration_error: "El video debe durar 2-3 minutos",
        competition_video_size_error: "Archivo demasiado grande (máx. 50 MB)",
        competition_video_uploading: "Subiendo...",
        competition_video_uploaded: "Video subido",
        competition_video_unavailable: "Video no disponible"
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
        admin_title: "Administrator",
        admin_label: "Admin",
        no_subs: "Keine aktiven Mitgliedschaften gefunden",
        scan_success: "Verifizierung erfolgreich",
        scan_fail: "Mitgliedschaft inaktiv",
        camera_not_found: "Keine Kamera gefunden. Verbinde eine Kamera oder verwende ein Gerät mit integrierter Kamera.",
        camera_permission_denied: "Kamerazugriff verweigert. Bitte erlaube die Kamera in den Browser-Einstellungen.",
        switch_to_admin: "Zum Admin",
        switch_to_student: "Zum Schüler",
        auth_subtitle: "Präzision in jedem Schritt.",
        welcome_to: "Willkommen bei",
        student_signup: "Neuer Schüler",
        admin_login: "Admin-Login",
        enter_name: "Wie sollen wir dich nennen?",
        full_name_placeholder: "Vollständiger Name",
        email_placeholder: "E-Mail-Adresse",
        signup_require_fields: "Bitte gib Name, E-Mail, Telefon und Passwort ein.",
        signup_invalid_email: "Bitte gib eine gültige E-Mail-Adresse ein.",
        confirm_password_placeholder: "Passwort bestätigen",
        signup_passwords_dont_match: "Die Passwörter stimmen nicht überein.",
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
        class_unit: "Stunde",
        classes_unit: "Stunden",
        cancel: "Abbrechen",
        confirm_attendance: "Anwesenheit bestätigen",
        attendance_success: "Anwesenheit bestätigt!",
        attendance_error: "Fehler bei der Anwesenheit",
        no_classes_buy_package: "Dieser Schüler hat keine Stunden mehr. Bitte neues Paket kaufen.",
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
        limit_classes_placeholder: "Stunden (0 = Unbegrenzt)",
        limit_classes_placeholder: "Stunden (0 = Unbegrenzt)",
        price_mxd_label: "Preis MXD",
        transfer_details_label: "Überweisungsdaten",
        bank_name_label: "Nombre del banco",
        account_number_label: "Numero de cuenta",
        holder_name_label: "Nombre del titular",
        asunto_label: "Asunto",
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
        enter_student_email: "E-Mail des Schülers (optional):",
        enter_student_pass: "Passwort für den Schüler eingeben:",
        student_created: "Schüler erstellt!",
        unknown_student: "Unbekannter Schüler",
        delete_payment_confirm: "Diesen Zahlungsbeleg permanent löschen?",
        select_school_title: "Willkommen bei Bailadmin",
        select_school_subtitle: "Bitte wähle deine Schule oder deinen Lehrer aus",
        add_school_btn: "Neue Schule",
        enter_school_name: "Namen der neuen Schule oder des Lehrers eingeben:",
        school_created: "Schule erfolgreich erstellt!",
        switch_school: "Schule wechseln",
        welcome_classes: "Willkommen beim Unterricht von",
        loading: "Lädt...",
        select_school_placeholder: "Wähle deine Schule...",
        loading_schools: "Schulen werden geladen...",
        no_schools: "Keine Schulen gefunden",
        could_not_load_schools: "Schulen konnten nicht geladen werden",
        connecting: "Verbindung wird hergestellt...",
        dev_access_title: "Entwickler-Zugang",
        dev_access_subtitle: "Entwickler-Anmeldedaten eingeben",
        footer_support: "Support",
        footer_contact: "Kontakt",
        footer_copy: "Made with <3 by a salsero; © 2026 Bailadmin Systems. Alle Rechte vorbehalten.",
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
        dev_events_feature: "Jack and Jill / Events",
        dev_events_feature_desc: "Erlaube dieser Schule Jack and Jill Events zu erstellen (Premium-Funktion)",
        dev_events_enabled: "Aktiviert",
        dev_events_disabled: "Deaktiviert",
        jack_and_jill_upgrade_msg: "Um Events zu erstellen musst du auf ein Paket upgraden, das diese Funktion enthält.",
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
        rename_school_btn: "Umbenennen",
        rename_school_prompt: "Neuer Name für diese Schule:",
        rename_school_success: "Schulname aktualisiert.",
        delete_school_confirm: "Bist du sicher? ALLE Daten (Schüler, Admins, Zahlungen, Kurse) werden unwiderruflich gelöscht.",
        delete_school_success: "Schule erfolgreich gelöscht",
        add_school_title: "Neue Schule erstellen",
        school_info_section: "Akademie-Details",
        admin_info_section: "Erster Administrator",
        create_school_btn: "Initialisierung ausführen",
        username_exists_msg: "Dieser Benutzername ist bereits vergeben. Bitte wähle einen anderen.",
        class_location: "Standort",
        location_placeholder: "z.B. Studio A",
        active_packs_label: "Deine aktiven Pakete",
        expired_classes_label: "Abgelaufene Stunden",
        no_expiration: "Kein Ablaufdatum",
        expires_in: "Läuft ab in",
        days_left: "Tage übrig",
        expires_label: "Gültig bis",
        search_students: "Schüler suchen...",
        loading_students_msg: "Schüler werden geladen...",
        no_pending_msg: "Keine ausstehenden Zahlungen",
        refresh_btn: "Aktualisieren",
        historical_total_label: "Gesamtverlauf",
        no_data_msg: "Noch keine Daten",
        mgmt_classes_title: "Kursverwaltung",
        mgmt_admins_title: "Administratoren",
        day_label: "Tag",
        hour_label: "Uhrzeit",
        level_tag_label: "Niveau",
        new_class_label: "Neuer Kurs",
        show_weekly_btn: "Wochenplan anzeigen",
        hide_weekly_btn: "Wochenplan ausblenden",
        weekly_preview_title: "Vorschau (Woche)",
        full_name_label: "Vollständiger Name",
        password_pin_label: "Passwort (PIN)",
        total_classes_label: "Stunden insgesamt",
        pack_details_title: "Paket-Details",
        reg_date_label: "Registriert am",
        next_expiry_label: "Nächster Ablauf",
        delete_perm_label: "Schüler dauerhaft löschen",
        admin_pass_req: "Admin-Passwort erforderlich:",
        leave_blank_keep: "leer lassen um beizubehalten",
        invalid_pass_msg: "Falsches Admin-Passwort.",
        save_btn: "Speichern",
        enter_admin_user: "Admin-Benutzername:",
        enter_admin_pass: "Admin-Passwort:",
        admin_created: "Administrator erfolgreich erstellt!",
        remove_admin_confirm: "Sind Sie sicher, dass Sie diesen Administrator entfernen möchten?",
        admin_removed: "Administrator erfolgreich entfernt!",
        error_creating_admin: "Fehler beim Erstellen des Administrators:",
        error_removing_admin: "Fehler beim Entfernen des Administrators:",
        competition_view_answers: "Antworten anzeigen",
        competition_answers: "Antworten",
        competition_no_answers: "Noch keine Antworten.",
        competition_activate_event: "Event aktivieren",
        competition_activate_signin: "Registrierung aktivieren",
        competition_for_event: "Für Event",
        competition_delete_confirm: "Dieses Event löschen? Alle Anmeldungen werden entfernt.",
        competition_copy: "Kopieren",
        competition_copy_of: "Kopie von ",
        competition_confirm_copy: "Kopie erstellen als \"{name}\"? Das neue Event ist zunächst inaktiv.",
        competition_copy_success: "Event kopiert.",
        competition_done: "Fertig",
        competition_saved_indicator: "Gespeichert",
        competition_saving: "Wird gespeichert...",
        competition_next_steps_placeholder: "Z.B. Keine Schnitte, feste Kamera, gute Beleuchtung...",
        competition_video_submission_toggle: "Video-Einreichung einschließen?",
        competition_video_prompt_label: "Video-Fragentext",
        competition_video_prompt_placeholder: "Lade dein Demo-Video hoch (2-3 Minuten)",
        competition_video_duration_error: "Video muss 2-3 Minuten dauern",
        competition_video_size_error: "Datei zu groß (max. 50 MB)",
        competition_video_uploading: "Wird hochgeladen...",
        competition_video_uploaded: "Video hochgeladen",
        competition_video_unavailable: "Video nicht verfügbar",
        competition_approved_message: "Herzlichen Glückwunsch! Du wirst an \"{eventName}\" teilnehmen.",
        competition_declined_message: "Dieses Mal kannst du nicht teilnehmen, aber wir freuen uns auf dich beim nächsten Mal."
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
    platformAdminLinked: false,
    schoolAdminLinked: false,
    platformData: { schools: [], students: [], admins: [] },
    loading: false,
    // Jack and Jill competitions (hash routing)
    competitionId: null,
    competitionSchoolId: null,
    competitionTab: 'edit', // 'edit' | 'registrations'
    competitions: [],
    currentCompetition: null,
    competitionRegistrations: [],
    additionalFeaturesExpanded: false,
    currentCompetitionForStudent: null,
    studentCompetitionRegistration: null,
    studentCompetitionDetail: null,
    studentCompetitionRegDetail: null,
    studentCompetitionAnswers: {},
    jackAndJillFormOpen: false,
    adminStudentsCompetitionId: null  // which event's toggles to show on Students page when multiple exist
};

// --- DATA FETCHING ---
const FETCH_THROTTLE_MS = 1500;
let _lastFetchEndTime = 0;
let _fetchScheduledTimer = null;

async function fetchAllData() {
    if (!window.supabase || !supabaseClient) {
        state.loading = false;
        state.schools = [];
        renderView();
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
    renderView();

    try {
        // First, always fetch schools (anon can read via RLS "schools_select_all")
        const { data: schoolsData, error: schoolsError } = await supabaseClient.from('schools').select('*').order('name');
        if (schoolsError) {
            console.error('Schools fetch error:', schoolsError);
        }
        state.schools = schoolsData ?? [];
        if (state.currentView === 'school-selection') {
            renderView();
        }

        // If no school is selected, we can't fetch tenant-specific data
        // PLATFORM DEV EXCEPTION: If in God Mode, fetch platform stats instead of redirecting
        if (state.isPlatformDev) {
            await fetchPlatformData();
            // If we're not impersonating a specific school, we stop here
            if (!state.currentSchool) {
                state.loading = false;
                renderView();
                return;
            }
        } else if (!state.currentSchool) {
            state.currentView = 'school-selection';
            state.loading = false;
            renderView();
            return;
        }

        // Critical: when logged in as student, always use THEIR school so we never show another school's data
        if (state.currentUser && !state.isAdmin && state.currentUser.school_id) {
            if (state.currentSchool.id !== state.currentUser.school_id) {
                state.currentSchool = state.schools.find(s => s.id === state.currentUser.school_id) || { id: state.currentUser.school_id, name: 'School' };
                saveState();
            }
        }
        const sid = (state.currentUser && !state.isAdmin && state.currentUser.school_id)
            ? state.currentUser.school_id
            : state.currentSchool.id;
        const isStudent = state.currentUser && !state.isAdmin;

        // Privacy: only admins / platform devs should ever load ALL students.
        // Regular students only fetch their own record.
        let studentsQuery = supabaseClient.from('students').select('*');
        if (state.isAdmin || state.isPlatformDev) {
            studentsQuery = studentsQuery.eq('school_id', sid).order('name');
        } else if (state.currentUser && state.currentUser.id) {
            studentsQuery = studentsQuery.eq('id', state.currentUser.id);
        } else {
            // Not logged in as student or admin – do not fetch any student rows
            studentsQuery = studentsQuery.eq('school_id', sid).limit(0);
        }

        // Students without Auth session (legacy login) can't pass RLS on classes/subscriptions;
        // fetch via RPC so they see schedule and shop.
        const classesPromise = isStudent
            ? supabaseClient.rpc('get_school_classes', { p_school_id: sid }).then(r => ({ data: r.data || [], error: r.error }))
            : supabaseClient.from('classes').select('*').eq('school_id', sid).order('id');
        const subsPromise = isStudent
            ? supabaseClient.rpc('get_school_subscriptions', { p_school_id: sid }).then(r => ({ data: r.data || [], error: r.error }))
            : supabaseClient.from('subscriptions').select('*').eq('school_id', sid).order('name');

        const [classesRes, subsRes, studentsRes, requestsRes, settingsRes, adminsRes] = await Promise.all([
            classesPromise,
            subsPromise,
            studentsQuery,
            supabaseClient.from('payment_requests').select('*, students(name)').eq('school_id', sid).order('created_at', { ascending: false }),
            supabaseClient.from('admin_settings').select('*').eq('school_id', sid),
            supabaseClient.from('admins').select('*').eq('school_id', sid).order('username')
        ]);

        // When RLS blocks, table returns { data: [], error: null }; treat empty as "no data" and use RPC for admins
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
        // Students cannot read admin_settings (RLS); fetch bank details via RPC for payment modal
        if (isStudent) {
            const { data: settingsJson } = await supabaseClient.rpc('get_school_admin_settings', { p_school_id: sid });
            if (settingsJson && typeof settingsJson === 'object') state.adminSettings = settingsJson;
        }
        if (studentsRes.data && studentsRes.data.length > 0) {
            state.students = studentsRes.data;
            // SYNC: Update currentUser if they are a student to show latest balance
            if (state.currentUser && !state.isAdmin) {
                const updatedMe = state.students.find(s => s.id === state.currentUser.id);
                if (updatedMe) {
                    state.currentUser = { ...updatedMe, role: 'student' };
                    saveState();
                }
            }
        } else if (state.isAdmin && supabaseClient) {
            // Legacy admin: RLS may return empty; fetch students via RPC
            const { data: rpcStudents } = await supabaseClient.rpc('get_school_students', { p_school_id: sid });
            if (rpcStudents && Array.isArray(rpcStudents)) state.students = rpcStudents;
        } else if (isStudent && state.currentUser) {
            // Legacy login: RLS may block student row; refresh profile from DB so balance/packs stay in sync
            const schoolId = state.currentUser.school_id || sid;
            const { data: myRow } = await supabaseClient.rpc('get_student_by_id', {
                p_student_id: state.currentUser.id,
                p_school_id: schoolId
            });
            if (myRow && Array.isArray(myRow) && myRow.length > 0) {
                const row = myRow[0];
                state.students = [row];
                state.currentUser = { ...row, role: 'student' };
                saveState();
            } else {
                state.students = [{ ...state.currentUser }];
            }
        }
        // Always refresh current student profile from server so balance shows latest (e.g. after admin deducts via QR)
        if (isStudent && state.currentUser && supabaseClient) {
            const schoolId = state.currentUser.school_id || sid;
            const { data: freshRow } = await supabaseClient.rpc('get_student_by_id', {
                p_student_id: String(state.currentUser.id),
                p_school_id: schoolId
            });
            if (freshRow && Array.isArray(freshRow) && freshRow.length > 0) {
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
            // Legacy admin: RLS blocks table read; fetch via RPC
            const { data: reqsRpc } = await supabaseClient.rpc('get_school_payment_requests', { p_school_id: sid });
            if (reqsRpc && Array.isArray(reqsRpc)) state.paymentRequests = reqsRpc;
        }
        if (settingsRes.data && settingsRes.data.length > 0) {
            const settingsObj = {};
            settingsRes.data.forEach(item => {
                settingsObj[item.key] = item.value;
            });
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
            } catch (_) {
                state.competitions = [];
            }
        }

        // --- NEW: Check for expired memberships ---
        await window.checkExpirations();

        // Re-sync currentUser (student) with updated balance/active_packs after expiration check
        if (state.currentUser && !state.isAdmin && state.students?.length > 0) {
            const updated = state.students.find(s => s.id === state.currentUser.id);
            if (updated) state.currentUser = { ...updated, role: 'student' };
        }

        state.loading = false;
        _lastFetchEndTime = Date.now();
        renderView();
        if (window._fetchAllDataNeeded) {
            window._fetchAllDataNeeded = false;
            setTimeout(() => fetchAllData(), 100);
        }
    } catch (err) {
        state.loading = false;
        _lastFetchEndTime = Date.now();
        console.error("Error fetching data:", err);
        renderView();
        if (window._fetchAllDataNeeded) {
            window._fetchAllDataNeeded = false;
            setTimeout(() => fetchAllData(), 100);
        }
    }
}

// --- LOGIC ---
function saveState() {
    // Never persist raw passwords or other highly sensitive session fields.
    let safeCurrentUser = state.currentUser;
    if (safeCurrentUser && typeof safeCurrentUser === 'object') {
        const { password, ...rest } = safeCurrentUser;
        safeCurrentUser = rest;
    }

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
        competitionTab: state.competitionTab
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

// --- HASH ROUTING (competitions) ---
function parseHashRoute() {
    const hash = (window.location.hash || '').replace(/^#/, '');
    const [pathPart, queryPart] = hash.split('?');
    const segments = pathPart.split('/').filter(Boolean);
    const params = new URLSearchParams(queryPart || '');

    // #/admin/schools/:schoolId/competitions/jack-and-jill[/:competitionId]
    if (segments[0] === 'admin' && segments[1] === 'schools' && segments[2] && segments[3] === 'competitions' && segments[4] === 'jack-and-jill') {
        const isStudent = state.currentUser && state.currentUser.school_id && state.currentUser.role !== 'admin' && state.currentUser.role !== 'platform-dev' && !state.isPlatformDev;
        if (isStudent) {
            window.location.hash = '';
            return false;
        }
        const schoolId = segments[2];
        const competitionId = segments[5] || null;
        state.competitionSchoolId = schoolId;
        state.competitionId = competitionId;
        state.competitionTab = params.get('tab') === 'registrations' ? 'registrations' : 'edit';
        state.currentView = 'admin-competition-jack-and-jill';
        if (state.currentSchool?.id !== schoolId) {
            const school = state.schools.find(s => s.id === schoolId);
            state.currentSchool = school ? { id: school.id, name: school.name } : { id: schoolId, name: 'School' };
        }
        state.isAdmin = true;
        return true;
    }

    // #/student/competitions/:competitionId/jack-and-jill
    if (segments[0] === 'student' && segments[1] === 'competitions' && segments[2] && segments[3] === 'jack-and-jill') {
        state.competitionId = segments[2];
        state.currentView = 'student-competition-register';
        state.studentCompetitionDetail = null;
        state.studentCompetitionRegDetail = null;
        return true;
    }

    return false;
}

function applyHashAndRender() {
    if (parseHashRoute()) {
        saveState();
        renderView();
        return true;
    }
    return false;
}

function navigateToAdminJackAndJill(schoolId, competitionId, tab) {
    const sid = schoolId || state.currentSchool?.id;
    if (!sid) return;
    let hash = `#/admin/schools/${sid}/competitions/jack-and-jill`;
    if (competitionId) hash += `/${competitionId}`;
    if (tab === 'registrations') hash += '?tab=registrations';
    window.location.hash = hash;
}

function navigateToStudentJackAndJill(competitionId) {
    if (!competitionId) return;
    window.location.hash = `#/student/competitions/${competitionId}/jack-and-jill`;
}

window.openCreateNewCompetition = () => {
    state.competitionId = null;
    state.currentCompetition = null;
    state.competitionRegistrations = [];
    state.competitionTab = 'edit';
    state.competitionFormQuestions = [];
    state.jackAndJillFormOpen = true;
    saveState();
    renderView();
};
window.openEditCompetition = (id) => {
    state.competitionId = id;
    state.currentCompetition = (state.competitions || []).find(c => c.id === id) || null;
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

window.selectCompetition = async (id) => {
    state.competitionId = id;
    state.currentCompetition = (state.competitions || []).find(c => c.id === id) || null;
    if (id) await fetchCompetitionRegistrations(id);
    saveState();
    renderView();
};

window.fetchCompetitionList = async (schoolId) => {
    if (!supabaseClient || !schoolId) return;
    const { data } = await supabaseClient.rpc('competition_list_for_admin', { p_school_id: schoolId });
    state.competitions = Array.isArray(data) ? data : [];
    if (state.competitionId) state.currentCompetition = state.competitions.find(c => c.id === state.competitionId) || null;
    else state.currentCompetition = null;
    renderView();
};

window.fetchCompetitionRegistrations = async (competitionId) => {
    if (!supabaseClient || !competitionId) return;
    const { data } = await supabaseClient.rpc('competition_registrations_list', { p_competition_id: competitionId });
    state.competitionRegistrations = Array.isArray(data) ? data : [];
    renderView();
};

window.saveCompetition = async () => {
    const t = window.t;
    const schoolId = state.competitionSchoolId || state.currentSchool?.id;
    if (!schoolId || !supabaseClient) { alert(t('competition_error') + (schoolId ? '' : ' Missing school.') + (!supabaseClient ? ' No database connection.' : '')); return; }
    const { data: sess } = await supabaseClient.auth.getSession();
    if (!sess?.session?.user) {
        alert(t('competition_error') + ' You are not signed in. Log in as a school admin or platform dev, then try again.');
        return;
    }
    const name = (document.getElementById('comp-name') || {}).value?.trim();
    const date = (document.getElementById('comp-date') || {}).value;
    const time = (document.getElementById('comp-time') || {}).value || '19:00';
    if (!name || !date) { alert(t('competition_error') + ' Please enter event name and date.'); return; }
    const startsAt = new Date(date + 'T' + time + ':00').toISOString();
    const nextSteps = (document.getElementById('comp-next-steps') || {}).value || '';
    const container = document.getElementById('comp-questions-container');
    const questions = container ? Array.from(container.querySelectorAll('input[data-qidx]')).sort((a, b) => parseInt(a.getAttribute('data-qidx'), 10) - parseInt(b.getAttribute('data-qidx'), 10)).map(inp => inp.value?.trim() || '') : [];
    const id = (document.getElementById('comp-id') || {}).value;
    try {
        if (id) {
            const cur = state.currentCompetition || {};
            const videoEnabled = !!(document.getElementById('comp-video-enabled') || {}).checked;
            const videoPrompt = (document.getElementById('comp-video-prompt') || {}).value?.trim() || '';
            const { data: res, error } = await supabaseClient.rpc('competition_update', {
                p_competition_id: id,
                p_name: name,
                p_starts_at: startsAt,
                p_questions: questions,
                p_next_steps_text: nextSteps,
                p_is_active: !!cur.is_active,
                p_is_sign_in_active: !!cur.is_sign_in_active,
                p_video_submission_enabled: videoEnabled,
                p_video_submission_prompt: videoPrompt
            });
            if (error) throw new Error(error.message);
            if (res == null) throw new Error('Update failed. Are you logged in as an admin for this school?');
            state.currentCompetition = res || cur;
            state.competitions = (state.competitions || []).map(c => c.id === id ? (res || c) : c);
        } else {
            const videoEnabled = !!(document.getElementById('comp-video-enabled') || {}).checked;
            const videoPrompt = (document.getElementById('comp-video-prompt') || {}).value?.trim() || '';
            const { data: res, error } = await supabaseClient.rpc('competition_create', {
                p_school_id: schoolId,
                p_name: name,
                p_starts_at: startsAt,
                p_questions: questions,
                p_next_steps_text: nextSteps,
                p_video_submission_enabled: videoEnabled,
                p_video_submission_prompt: videoPrompt
            });
            if (error) throw new Error(error.message);
            const newComp = res != null && (typeof res === 'object' ? res : (typeof res === 'string' ? JSON.parse(res) : null));
            if (!newComp) throw new Error('Create failed. Are you logged in as an admin for this school?');
            state.competitions = [newComp, ...(state.competitions || [])];
        }
        state.jackAndJillFormOpen = false;
        state.competitionId = null;
        state.currentCompetition = null;
        if (schoolId) window.fetchCompetitionList(schoolId);
        alert(t('competition_saved'));
        renderView();
    } catch (e) {
        const msg = e?.message || String(e) || '';
        if (msg.includes('Permission denied') && msg.includes('admin')) {
            alert(t('competition_error') + '\n\nYour account is not linked to this session.\n\n• If you are a school admin: use the "Link account" card on your dashboard to enter your password and link.\n• If you are a platform dev: use the "Enable username login" card or log out and log in again with your username and password.');
        } else {
            alert(t('competition_error') + '\n\n' + (msg || 'Unknown error'));
        }
    }
};

let _competitionAutosaveTimer = null;
window.debouncedAutosaveCompetition = () => {
    if (_competitionAutosaveTimer) clearTimeout(_competitionAutosaveTimer);
    _competitionAutosaveTimer = setTimeout(() => {
        _competitionAutosaveTimer = null;
        autosaveCompetition();
    }, 800);
};

window.autosaveCompetition = async () => {
    const statusEl = document.getElementById('comp-autosave-status') || document.getElementById('comp-autosave-status-footer');
    const setStatus = (text, isError = false) => {
        ['comp-autosave-status', 'comp-autosave-status-footer'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = text;
                el.style.color = isError ? 'var(--system-red)' : 'var(--text-secondary)';
            }
        });
    };
    const schoolId = state.competitionSchoolId || state.currentSchool?.id;
    if (!schoolId || !supabaseClient) return;
    const { data: sess } = await supabaseClient.auth.getSession();
    if (!sess?.session?.user) return;
    const name = (document.getElementById('comp-name') || {}).value?.trim() || '';
    const date = (document.getElementById('comp-date') || {}).value || '';
    const time = (document.getElementById('comp-time') || {}).value || '19:00';
    const id = (document.getElementById('comp-id') || {}).value || '';
    if (!id && (!name || !date)) return;
    setStatus(window.t('competition_saving') || 'Saving...');
    const startsAt = date ? new Date(date + 'T' + time + ':00').toISOString() : new Date().toISOString();
    const nextSteps = (document.getElementById('comp-next-steps') || {}).value || '';
    const container = document.getElementById('comp-questions-container');
    const questions = container ? Array.from(container.querySelectorAll('input[data-qidx]')).sort((a, b) => parseInt(a.getAttribute('data-qidx'), 10) - parseInt(b.getAttribute('data-qidx'), 10)).map(inp => inp.value?.trim() || '') : (state.competitionFormQuestions || []);
    try {
        if (id) {
            const cur = state.currentCompetition || {};
            const videoEnabled = !!(document.getElementById('comp-video-enabled') || {}).checked;
            const videoPrompt = (document.getElementById('comp-video-prompt') || {}).value?.trim() || '';
            const { data: res, error } = await supabaseClient.rpc('competition_update', {
                p_competition_id: id,
                p_name: name || (cur.name || 'Event'),
                p_starts_at: startsAt,
                p_questions: questions,
                p_next_steps_text: nextSteps,
                p_is_active: !!cur.is_active,
                p_is_sign_in_active: !!cur.is_sign_in_active,
                p_video_submission_enabled: videoEnabled,
                p_video_submission_prompt: videoPrompt
            });
            if (error) throw new Error(error.message);
            if (res) {
                state.currentCompetition = res;
                state.competitions = (state.competitions || []).map(c => c.id === id ? res : c);
                setStatus(window.t('competition_saved_indicator') || 'Saved');
                ['comp-autosave-status', 'comp-autosave-status-footer'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) { el.style.color = 'var(--system-green)'; }
                });
                setTimeout(() => { ['comp-autosave-status', 'comp-autosave-status-footer'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = ''; }); }, 2000);
            }
        } else {
            const videoEnabled = !!(document.getElementById('comp-video-enabled') || {}).checked;
            const videoPrompt = (document.getElementById('comp-video-prompt') || {}).value?.trim() || '';
            const { data: res, error } = await supabaseClient.rpc('competition_create', {
                p_school_id: schoolId,
                p_name: name || 'New Event',
                p_starts_at: startsAt,
                p_questions: questions,
                p_next_steps_text: nextSteps,
                p_video_submission_enabled: videoEnabled,
                p_video_submission_prompt: videoPrompt
            });
            if (error) throw new Error(error.message);
            const newComp = res != null && (typeof res === 'object' ? res : (typeof res === 'string' ? JSON.parse(res) : null));
            if (newComp) {
                state.competitions = [newComp, ...(state.competitions || [])];
                state.currentCompetition = newComp;
                state.competitionId = newComp.id;
                const hid = document.getElementById('comp-id');
                if (hid) hid.value = newComp.id;
                setStatus(window.t('competition_saved_indicator') || 'Saved');
                ['comp-autosave-status', 'comp-autosave-status-footer'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) { el.style.color = 'var(--system-green)'; }
                });
                setTimeout(() => { ['comp-autosave-status', 'comp-autosave-status-footer'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = ''; }); }, 2000);
            }
        }
    } catch (e) {
        setStatus(e?.message || 'Error', true);
    }
};

window.addCompetitionQuestion = () => {
    if (!state.competitionFormQuestions) state.competitionFormQuestions = state.currentCompetition && Array.isArray(state.currentCompetition.questions) ? [...state.currentCompetition.questions] : [];
    state.competitionFormQuestions.push('');
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

window.toggleCompetitionActive = async (id, checked) => {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.rpc('competition_toggle_active', { p_competition_id: id, p_is_active: checked });
    if (data) state.currentCompetition = data; state.competitions = (state.competitions || []).map(c => c.id === id ? (data || c) : c);
    renderView();
};
window.toggleCompetitionSignIn = async (id, checked) => {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.rpc('competition_toggle_sign_in', { p_competition_id: id, p_is_sign_in_active: checked });
    if (data) state.currentCompetition = data; state.competitions = (state.competitions || []).map(c => c.id === id ? (data || c) : c);
    renderView();
};
window.toggleCompetitionActiveFromStudents = async (id, checked) => {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.rpc('competition_toggle_active', { p_competition_id: id, p_is_active: checked });
    if (data) state.competitions = (state.competitions || []).map(c => c.id === id ? (data || c) : c);
    renderView();
};
window.toggleCompetitionSignInFromStudents = async (id, checked) => {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.rpc('competition_toggle_sign_in', { p_competition_id: id, p_is_sign_in_active: checked });
    if (data) state.competitions = (state.competitions || []).map(c => c.id === id ? (data || c) : c);
    renderView();
};

window.publishCompetitionDecisions = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.rpc('competition_publish_decisions', { p_competition_id: id });
    if (!error) { state.currentCompetition = state.currentCompetition ? { ...state.currentCompetition, decisions_published_at: new Date().toISOString() } : null; await fetchCompetitionRegistrations(id); renderView(); }
};
window.republishCompetitionDecisions = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.rpc('competition_publish_decisions', { p_competition_id: id });
    if (!error) { state.currentCompetition = state.currentCompetition ? { ...state.currentCompetition, decisions_published_at: new Date().toISOString() } : null; renderView(); }
};

window.competitionRegistrationDecide = async (regId, status) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.rpc('competition_registration_decide', { p_registration_id: regId, p_status: status });
    if (!error && state.competitionId) await fetchCompetitionRegistrations(state.competitionId);
    renderView();
};

window.copyCompetition = async (competitionId) => {
    const t = window.t;
    const c = (state.competitions || []).find(x => x.id === competitionId);
    if (!c) { alert(t('competition_error')); return; }
    const namePrefix = (t('competition_copy_of') || 'Copy of ');
    const copyName = namePrefix + (c.name || '').trim();
    const confirmMsg = (t('competition_confirm_copy') || 'Create copy as "{name}"? The new event will be inactive.').replace('{name}', copyName);
    if (!confirm(confirmMsg)) return;
    if (!supabaseClient) { alert(t('competition_error')); return; }
    const { data: newComp, error } = await supabaseClient.rpc('competition_copy', {
        p_competition_id: competitionId,
        p_name_prefix: namePrefix
    });
    if (error) {
        alert(t('competition_error') + (error?.message ? '\n' + error.message : ''));
        return;
    }
    const schoolId = state.competitionSchoolId || state.currentSchool?.id;
    if (schoolId) window.fetchCompetitionList(schoolId);
    alert(t('competition_copy_success') || 'Event copied.');
    renderView();
};

window.deleteCompetition = async (competitionId) => {
    const t = window.t;
    if (!confirm(t('competition_delete_confirm'))) return;
    if (!supabaseClient) { alert(t('competition_error')); return; }
    const { data: ok, error } = await supabaseClient.rpc('competition_delete', { p_competition_id: competitionId });
    if (error || !ok) {
        alert(t('competition_error') + (error?.message ? '\n' + error.message : ''));
        return;
    }
    const schoolId = state.competitionSchoolId || state.currentSchool?.id;
    if (schoolId) window.fetchCompetitionList(schoolId);
    if (state.competitionId === competitionId) {
        state.competitionId = null;
        state.currentCompetition = null;
        state.competitionRegistrations = [];
        state.competitionTab = 'edit';
    }
    renderView();
};

window.openRegistrationAnswers = async (regId) => {
    const reg = (state.competitionRegistrations || []).find(r => r.id === regId);
    const questions = state.currentCompetition?.questions || [];
    const answers = (reg?.answers && typeof reg.answers === 'object') ? reg.answers : {};
    const titleEl = document.getElementById('registration-answers-title');
    const bodyEl = document.getElementById('registration-answers-body');
    const modalEl = document.getElementById('registration-answers-modal');
    if (!titleEl || !bodyEl || !modalEl) return;
    const t = window.t;
    titleEl.textContent = (reg?.student_name || reg?.student_id || t.competition_answers || 'Answers');
    let html = '';
    if (questions.length === 0) {
        html = `<p style="color: var(--text-secondary); font-size: 15px;">${t.competition_no_answers}</p>`;
    } else {
        html = questions.map((q, i) => {
            const ans = answers[i] ?? answers[String(i)] ?? '';
            const qEsc = (q || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const ansEsc = (ans || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
            return `<div style="margin-bottom: 16px;"><div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">${qEsc}</div><div style="font-size: 16px; color: var(--text-primary); line-height: 1.4;">${ansEsc || '—'}</div></div>`;
        }).join('');
    }
    const comp = state.currentCompetition;
    const videoPath = answers.video || answers['video'];
    if (comp?.video_submission_enabled && videoPath && supabaseClient) {
        const prompt = (comp.video_submission_prompt || t.competition_video_prompt_placeholder || 'Video').replace(/</g, '&lt;');
        html += `<div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border);"><div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">${prompt}</div>`;
        try {
            const { data: signed } = await supabaseClient.storage.from('competition-videos').createSignedUrl(videoPath, 3600);
            if (signed?.signedUrl) {
                html += `<video src="${signed.signedUrl.replace(/"/g, '&quot;')}" controls style="max-width: 100%; border-radius: 12px; background: var(--system-gray6);" preload="metadata"></video>`;
            } else {
                html += `<p style="color: var(--text-secondary); font-size: 14px;">${t.competition_video_unavailable || 'Video unavailable'}</p>`;
            }
        } catch (_) {
            html += `<p style="color: var(--text-secondary); font-size: 14px;">${t.competition_video_unavailable || 'Video unavailable'}</p>`;
        }
        html += '</div>';
    }
    bodyEl.innerHTML = html;
    const closeBtn = document.getElementById('registration-answers-close-btn');
    if (closeBtn) closeBtn.textContent = t('close') || 'Close';
    modalEl.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.handleCompetitionVideoSelect = async (fileInput) => {
    const file = fileInput?.files?.[0];
    if (!file || !supabaseClient || !state.competitionId || !state.currentUser?.id) return;
    const schoolId = state.currentUser.school_id || state.currentSchool?.id;
    if (!schoolId) return;
    const statusEl = document.getElementById('student-comp-video-status');
    const setStatus = (msg, isErr = false) => { if (statusEl) { statusEl.textContent = msg; statusEl.style.color = isErr ? 'var(--system-red)' : 'var(--text-secondary)'; } };
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        setStatus(window.t('competition_video_size_error') || 'File too large (max 50 MB)', true);
        fileInput.value = '';
        return;
    }
    setStatus(window.t('competition_video_uploading') || 'Validating duration...');
    const duration = await new Promise((resolve) => {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); resolve(v.duration); };
        v.onerror = () => { URL.revokeObjectURL(v.src); resolve(-1); };
        v.src = URL.createObjectURL(file);
    });
    if (duration < 0) { setStatus(window.t('competition_video_duration_error') || 'Could not read video', true); return; }
    const minSec = 120, maxSec = 180;
    if (duration < minSec || duration > maxSec) {
        setStatus((window.t('competition_video_duration_error') || 'Video must be 2-3 minutes').replace('2-3', `${Math.floor(minSec/60)}-${Math.floor(maxSec/60)}`), true);
        fileInput.value = '';
        return;
    }
    setStatus(window.t('competition_video_uploading') || 'Uploading...');
    const ext = (file.name.match(/\.(mp4|mov|webm)$/i) || ['', 'mp4'])[1] || 'mp4';
    const path = `${schoolId}/${state.competitionId}/${state.currentUser.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabaseClient.storage.from('competition-videos').upload(path, file, { upsert: true });
    if (error) { setStatus(window.t('competition_error') || 'Upload failed: ' + error.message, true); return; }
    state.studentCompetitionAnswers = state.studentCompetitionAnswers || {};
    state.studentCompetitionAnswers.video = path;
    setStatus('');
    saveStudentCompetitionDraft();
    renderView();
};

let _competitionDraftSaveTimer = null;
window.debouncedSaveCompetitionDraft = () => {
    if (_competitionDraftSaveTimer) clearTimeout(_competitionDraftSaveTimer);
    _competitionDraftSaveTimer = setTimeout(() => {
        _competitionDraftSaveTimer = null;
        saveStudentCompetitionDraft();
    }, 600);
};
window.saveStudentCompetitionDraft = async () => {
    const form = document.getElementById('student-comp-form');
    if (!form || !supabaseClient || !state.competitionId || !state.currentUser?.id) return;
    const schoolId = state.currentUser.school_id || state.currentSchool?.id;
    if (!schoolId) return;
    const answers = {};
    form.querySelectorAll('input[data-qidx]').forEach(inp => {
        const i = inp.getAttribute('data-qidx');
        answers[i] = inp.value || '';
    });
    if (state.studentCompetitionAnswers?.video) answers.video = state.studentCompetitionAnswers.video;
    state.studentCompetitionAnswers = answers;
    const { data } = await supabaseClient.rpc('competition_registration_upsert_draft', {
        p_competition_id: state.competitionId,
        p_student_id: String(state.currentUser.id),
        p_school_id: schoolId,
        p_answers: answers
    });
    if (data) state.studentCompetitionRegDetail = typeof data === 'object' ? data : (typeof data === 'string' ? JSON.parse(data) : null);
};
window.submitStudentCompetitionRegistration = async () => {
    if (!supabaseClient || !state.competitionId || !state.currentUser?.id) return;
    const btn = document.getElementById('student-comp-submit-btn');
    if (btn) btn.disabled = true;
    const { data, error } = await supabaseClient.rpc('competition_registration_submit', { p_competition_id: state.competitionId, p_student_id: String(state.currentUser.id) });
    if (error) { if (btn) btn.disabled = false; alert(window.t('competition_error')); return; }
    state.studentCompetitionRegDetail = data && (typeof data === 'object' ? data : (typeof data === 'string' ? JSON.parse(data) : null));
    state.studentCompetitionRegDetail = state.studentCompetitionRegDetail ? { ...state.studentCompetitionRegDetail, status: 'SUBMITTED' } : { status: 'SUBMITTED' };
    state.studentCompetitionRegistration = state.studentCompetitionRegDetail;
    renderView();
};

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
                        <span>${state.loading ? t.loading_schools : (state.schools.length > 0 ? t.select_school_placeholder : t.no_schools)}</span>
                        <i data-lucide="chevron-down" size="18"></i>
                    </div>

                    <!-- Custom Dropdown List -->
                    <div id="school-dropdown-list" class="custom-dropdown-list" style="width: 100%; box-sizing: border-box;">
                        ${state.schools.length > 0 ? state.schools.map(s => `
                            <div class="dropdown-item ${state.currentSchool?.id === s.id ? 'selected' : ''}" onclick="selectSchool('${s.id}')">
                                <span>${s.name}</span>
                                ${state.currentSchool?.id === s.id ? '<i data-lucide="check" size="16"></i>' : ''}
                            </div>
                        `).join('') : `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 14px;">${state.loading ? t.connecting : t.could_not_load_schools}</div>`}
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
                <div class="ios-large-title" style="letter-spacing: -1.2px;">${title}</div>
                ${isDev ? '<div style="font-size: 13px; color: var(--system-blue); font-weight: 700; padding: 0 1.2rem; margin-top: -5px; letter-spacing: 0.1em; text-transform: uppercase;">' + t.admin_label + ' (God Mode)</div>' : ''}
            </div>
            
            <div style="padding: 1.2rem;">
                ${isDev ? `
                    ${!state.platformAdminLinked ? `
                    <div class="card" style="margin-bottom: 1.5rem; padding: 1.25rem; border-radius: 20px; border: 1px solid var(--border); background: linear-gradient(135deg, rgba(0,122,255,0.06) 0%, transparent 100%);">
                        <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;"><i data-lucide="link" size="14" style="vertical-align: middle; margin-right: 6px;"></i> Enable username + password login (one-time)</div>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">So you can always sign in with &quot;${(state.currentUser && state.currentUser.name ? state.currentUser.name.replace(/\s*\(Dev\)\s*$/i, '').trim() : 'you')}&quot; and your password (no email needed). Enter your <strong>current password</strong>:</p>
                        <input type="password" id="platform-link-password" placeholder="Your current Dev password" autocomplete="off" style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 14px; margin-bottom: 10px; box-sizing: border-box;" />
                        <button type="button" class="btn-primary" onclick="window.linkPlatformAdminAccount()" style="width: 100%; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 700;">Enable username login</button>
                    </div>
                    ` : ''}
                    <!-- PREMIUM STATS -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2.5rem;">
                        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 24px; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.05); position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -10px; right: -10px; opacity: 0.05; color: var(--system-blue); transform: rotate(-15deg);"><i data-lucide="building-2" size="80"></i></div>
                            <div style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.08em; opacity: 0.7;">${t.dev_stats_schools}</div>
                            <div style="font-size: 32px; font-weight: 900; letter-spacing: -1px; color: var(--text-primary);">${state.platformData.schools.length}</div>
                        </div>
                        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 24px; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.05); position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -10px; right: -10px; opacity: 0.05; color: var(--system-green); transform: rotate(-15deg);"><i data-lucide="users" size="80"></i></div>
                            <div style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.08em; opacity: 0.7;">${t.dev_stats_students}</div>
                            <div style="font-size: 32px; font-weight: 900; letter-spacing: -1px; color: var(--text-primary);">${state.platformData.students.length}</div>
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 0 0.2rem;">
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); opacity: 0.8;">${t.dev_active_schools}</div>
                    <button class="btn-primary" onclick="${isDev ? 'createNewSchoolWithAdmin()' : 'createNewSchool()'}" style="padding: 10px 20px; font-size: 13px; font-weight: 700; height: auto; border-radius: 14px; box-shadow: var(--shadow-sm);"><i data-lucide="plus" size="14" style="margin-right: 6px;"></i> ${t.add_school_btn}</button>
                </div>

                <div class="ios-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.2rem; background: transparent; padding: 0; box-shadow: none; border: none;">
                    ${schools.map(s => {
            const schoolStudents = state.platformData.students.filter(st => st.school_id === s.id).length;
            const schoolAdmins = state.platformData.admins.filter(a => a.school_id === s.id).map(a => a.username).join(', ');
            return `
                            <div class="card card-premium" style="padding: 1.8rem; border-radius: 28px; display: flex; flex-direction: column; gap: 1.4rem; background: var(--bg-card); border: 1.5px solid var(--border); transition: all 0.4s var(--transition); position: relative;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1;">
                                        <div style="font-size: 20px; font-weight: 900; margin-bottom: 4px; letter-spacing: -0.5px; color: var(--text-primary);">${s.name}</div>
                                        <div style="font-size: 10px; color: var(--text-secondary); opacity: 0.5; font-family: monospace; letter-spacing: 0.05em;">${s.id}</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <div style="font-size: 11px; font-weight: 800; color: var(--system-blue); background: rgba(0, 122, 255, 0.08); padding: 5px 12px; border-radius: 14px; letter-spacing: 0.02em; border: 1px solid rgba(0, 122, 255, 0.1);">
                                            ${schoolStudents} ${t.dev_students_label.toUpperCase()}
                                        </div>
                                        <button type="button" class="btn-icon" data-action="rename-school" data-school-id="${s.id}" data-school-name="${(s.name || '').replace(/"/g, '&quot;')}" style="color: var(--system-blue); opacity: 0.85; padding: 6px; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.opacity='1'; this.style.background='rgba(0, 122, 255, 0.15)'" onmouseout="this.style.opacity='0.85'; this.style.background='transparent'" title="${(t.rename_school_btn || 'Rename').replace(/"/g, '&quot;')}">
                                            <i data-lucide="pencil" size="18"></i>
                                        </button>
                                        <button type="button" class="btn-icon" data-action="delete-school" data-school-id="${s.id}" style="color: var(--system-red); opacity: 0.85; padding: 6px; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.opacity='1'; this.style.background='rgba(255, 59, 48, 0.15)'" onmouseout="this.style.opacity='0.85'; this.style.background='transparent'" title="${(t.delete_school_btn || 'Delete School').replace(/"/g, '&quot;')}">
                                            <i data-lucide="trash-2" size="18"></i>
                                        </button>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: var(--system-gray6); border-radius: 16px; border: 1px solid rgba(0,0,0,0.02);">
                                    <i data-lucide="shield" size="14" style="color: var(--system-blue); opacity: 0.8;"></i>
                                    <div style="font-size: 13px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">
                                        <span style="font-weight: 700; color: var(--text-primary); opacity: 0.7;">${t.dev_admins_label}:</span> ${schoolAdmins || 'N/A'}
                                    </div>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 5px;">
                                    <button class="btn-secondary" onclick="state.selectedDevSchoolId='${s.id}'; state.currentView='platform-school-details'; renderView();" style="width: 100%; border-radius: 16px; height: 50px; font-size: 14px; font-weight: 700; background: var(--system-gray6); color: var(--text-primary); border: 1px solid var(--border); box-shadow: none;">
                                        <i data-lucide="info" size="14" style="margin-right: 6px; opacity: 0.6;"></i> ${t.dev_view_details}
                                    </button>
                                    <button class="btn-primary" onclick="const sch=state.platformData?.schools?.find(x=>x.id==='${s.id}')||state.schools?.find(x=>x.id==='${s.id}'); state.currentSchool=sch||{id:'${s.id}',name:'${s.name}',jack_and_jill_enabled:false}; state.isAdmin=true; state.currentView='admin-students'; fetchAllData();" style="width: 100%; border-radius: 16px; height: 50px; font-size: 14px; font-weight: 700; background: var(--text-primary); color: var(--bg-body); box-shadow: var(--shadow-sm);">
                                        <i data-lucide="external-link" size="14" style="margin-right: 6px;"></i> ${t.dev_enter_as_admin}
                                    </button>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>

                ${isDev && state.platformData.platform_admins && state.platformData.platform_admins.length > 0 ? `
                <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin: 2.5rem 0 1rem; padding: 0 0.2rem; opacity: 0.8;">Platform Admins (Dev Access)</div>
                <div class="ios-list" style="margin-bottom: 2rem;">
                    ${state.platformData.platform_admins.map(pa => `
                        <div class="ios-list-item" style="padding: 14px 16px; border-bottom: 1px solid var(--border);">
                            <div style="font-weight: 800; font-size: 15px;">${pa.username || pa.id}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;"><i data-lucide="key" size="10" style="vertical-align: middle;"></i> ${t.password_label}: <span style="font-family: monospace;">${pa.password || '—'}</span></div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    } else if (view === 'platform-add-school') {
        html += `
            <div class="ios-header" style="background: transparent; padding-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 0 0.5rem;">
                    <button class="btn-secondary" onclick="state.currentView='platform-dev-dashboard'; renderView();" style="border-radius: 50%; width: 36px; height: 36px; padding: 0; border: 1.5px solid var(--border); background: var(--bg-card); display: flex; align-items: center; justify-content: center; opacity: 0.8; transition: all 0.3s;" onmouseover="this.style.opacity='1'; this.style.transform='translateX(-2px)'" onmouseout="this.style.opacity='0.8'; this.style.transform='translateX(0)'">
                        <i data-lucide="chevron-left" size="20" style="margin-right: 2px;"></i>
                    </button>
                    <div style="font-size: 11px; color: var(--system-blue); font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">${t.dev_dashboard_title}</div>
                </div>
                <div class="ios-large-title" style="letter-spacing: -1.2px;">${t.add_school_title}</div>
            </div>

            <div style="padding: 1.2rem;">
                <!-- SCHOOL INFO -->
                <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; padding: 0 0.5rem; opacity: 0.7;">${t.school_info_section}</div>
                <div class="ios-list" style="margin-bottom: 2.5rem; overflow: hidden;">
                    <div class="ios-list-item" style="padding: 16px; border-bottom: none;">
                        <div style="width: 100%;">
                            <div style="font-size: 12px; font-weight: 800; color: var(--system-blue); margin-bottom: 6px; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.05em;">${t.enter_school_name || 'Academy Name'}</div>
                            <input type="text" id="new-school-name" placeholder="e.g. Tanzstudio Berlin" style="width: 100%; border: none; background: transparent; color: var(--text-primary); outline: none; font-size: 17px; font-weight: 700; padding: 0; letter-spacing: -0.3px;">
                        </div>
                    </div>
                </div>

                <!-- ADMIN INFO -->
                <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; padding: 0 0.5rem; opacity: 0.7;">${t.admin_info_section}</div>
                <div class="ios-list" style="margin-bottom: 3.5rem; overflow: hidden;">
                    <div class="ios-list-item" style="padding: 16px; border-bottom: 1px solid var(--border);">
                        <div style="width: 100%;">
                            <div style="font-size: 12px; font-weight: 800; color: var(--system-blue); margin-bottom: 6px; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.05em;">${t.username}</div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i data-lucide="user" size="14" style="opacity: 0.3;"></i>
                                <input type="text" id="new-school-admin-user" placeholder="admin_user" style="width: 100%; border: none; background: transparent; color: var(--text-primary); outline: none; font-size: 17px; font-weight: 700; padding: 0; letter-spacing: -0.3px;">
                            </div>
                        </div>
                    </div>
                    <div class="ios-list-item" style="padding: 16px; border-bottom: none;">
                        <div style="width: 100%;">
                            <div style="font-size: 12px; font-weight: 800; color: var(--system-blue); margin-bottom: 6px; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.05em;">${t.password}</div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i data-lucide="key" size="14" style="opacity: 0.3;"></i>
                                <input type="text" id="new-school-admin-pass" placeholder="••••••••" style="width: 100%; border: none; background: transparent; color: var(--text-primary); outline: none; font-size: 17px; font-weight: 700; padding: 0; letter-spacing: -0.3px;">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ACTIONS -->
                <div style="padding: 0 0.5rem;">
                    <button type="button" class="btn-primary" data-action="submit-new-school" style="width: 100%; border-radius: 20px; height: 60px; font-size: 17px; font-weight: 900; box-shadow: var(--shadow-lg); background: var(--text-primary); color: var(--bg-body); transition: all 0.3s; cursor: pointer;" onmouseover="this.style.transform='scale(1.01)'; this.style.filter='brightness(1.1)'" onmouseout="this.style.transform='scale(1)'; this.style.filter='brightness(1)'">
                        <i data-lucide="sparkles" size="18" style="margin-right: 10px;"></i> ${t.create_school_btn}
                    </button>
                    <button class="btn-secondary" onclick="state.currentView='platform-dev-dashboard'; renderView();" style="width: 100%; background: transparent; border: none; color: var(--system-red); font-weight: 700; margin-top: 1.2rem; font-size: 15px; opacity: 0.8;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">
                        ${t.cancel}
                    </button>
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
            const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const classes = state.platformData.classes
                .filter(c => c.school_id === schoolId)
                .sort((a, b) => {
                    const ia = daysOrder.indexOf(a.day);
                    const ib = daysOrder.indexOf(b.day);
                    const dayDiff = (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
                    if (dayDiff !== 0) return dayDiff;
                    return (a.time || '').localeCompare(b.time || '');
                });
            const subs = state.platformData.subscriptions.filter(s => s.school_id === schoolId);
            const jjEnabled = !!school.jack_and_jill_enabled;

            html += `
                <div class="platform-school-detail-header">
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 0 1.2rem 1rem;">
                        <button class="btn-icon platform-school-back" onclick="state.currentView='platform-dev-dashboard'; renderView();" style="width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); display: flex; align-items: center; justify-content: center; color: var(--text-primary); transition: all 0.2s;">
                            <i data-lucide="arrow-left" size="20"></i>
                        </button>
                        <span style="font-size: 12px; font-weight: 700; color: var(--system-blue); letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.9;">${t.dev_school_inspector}</span>
                    </div>
                    <div class="platform-school-hero">
                        <div style="width: 72px; height: 72px; border-radius: 20px; background: linear-gradient(135deg, rgba(0,122,255,0.2) 0%, rgba(0,122,255,0.05) 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; border: 1px solid rgba(0,122,255,0.15);">
                            <i data-lucide="building-2" size="36" style="color: var(--system-blue);"></i>
                        </div>
                        <h1 class="platform-school-title">${(school.name || '').replace(/</g, '&lt;')}</h1>
                        <div style="font-size: 11px; color: var(--text-secondary); font-family: monospace; letter-spacing: 0.05em; opacity: 0.6;">${String(schoolId).slice(0, 8)}…</div>
                        <button class="btn-primary platform-school-enter-btn" onclick="const s=state.platformData.schools.find(x=>x.id==='${school.id}'); state.currentSchool=s||{id:'${school.id}',name:'${school.name}',jack_and_jill_enabled:${jjEnabled}}; state.isAdmin=true; state.currentView='admin-students'; fetchAllData();" style="margin-top: 1.25rem; padding: 14px 28px; border-radius: 14px; font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 10px; margin-left: auto; margin-right: auto;">
                            <i data-lucide="shield-check" size="20"></i> ${t.dev_enter_as_admin}
                        </button>
                    </div>
                    <div class="platform-school-feature-toggle">
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border); margin: 0 1.2rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                            <div style="display: flex; align-items: center; gap: 14px;">
                                <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(255, 149, 0, 0.12); display: flex; align-items: center; justify-content: center;">
                                    <i data-lucide="trophy" size="22" style="color: var(--system-orange);"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 800; font-size: 15px; color: var(--text-primary);">${t.dev_events_feature}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px; opacity: 0.85;">${t.dev_events_feature_desc}</div>
                                </div>
                            </div>
                            <label class="toggle-switch" style="flex-shrink: 0;">
                                <input type="checkbox" class="toggle-switch-input" ${jjEnabled ? 'checked' : ''} onchange="toggleSchoolJackAndJill('${school.id}', this.checked)">
                                <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div style="padding: 0 1.2rem 2rem;">
                    <!-- PREMIUM STATS GRID -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div class="platform-stat-card" style="padding: 1.25rem 0.5rem; border-radius: 16px; text-align: center; background: var(--bg-card); border: 1px solid var(--border);">
                            <div style="width: 36px; height: 36px; margin: 0 auto 8px; border-radius: 10px; background: rgba(0, 122, 255, 0.12); display: flex; align-items: center; justify-content: center;"><i data-lucide="users" size="18" style="color: var(--system-blue);"></i></div>
                            <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">${students.length}</div>
                            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-top: 2px;">${t.dev_students_label}</div>
                        </div>
                        <div class="platform-stat-card" style="padding: 1.25rem 0.5rem; border-radius: 16px; text-align: center; background: var(--bg-card); border: 1px solid var(--border);">
                            <div style="width: 36px; height: 36px; margin: 0 auto 8px; border-radius: 10px; background: rgba(52, 199, 89, 0.12); display: flex; align-items: center; justify-content: center;"><i data-lucide="credit-card" size="18" style="color: var(--system-green);"></i></div>
                            <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">${subs.length}</div>
                            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-top: 2px;">${t.dev_plans_label}</div>
                        </div>
                        <div class="platform-stat-card" style="padding: 1.25rem 0.5rem; border-radius: 16px; text-align: center; background: var(--bg-card); border: 1px solid var(--border);">
                            <div style="width: 36px; height: 36px; margin: 0 auto 8px; border-radius: 10px; background: rgba(255, 149, 0, 0.12); display: flex; align-items: center; justify-content: center;"><i data-lucide="calendar" size="18" style="color: var(--system-orange);"></i></div>
                            <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">${classes.length}</div>
                            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-top: 2px;">${t.dev_classes_label}</div>
                        </div>
                        <div class="platform-stat-card" style="padding: 1.25rem 0.5rem; border-radius: 16px; text-align: center; background: var(--bg-card); border: 1px solid var(--border);">
                            <div style="width: 36px; height: 36px; margin: 0 auto 8px; border-radius: 10px; background: rgba(255, 59, 48, 0.12); display: flex; align-items: center; justify-content: center;"><i data-lucide="shield" size="18" style="color: var(--system-red);"></i></div>
                            <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">${admins.length}</div>
                            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-top: 2px;">${t.dev_admins_label}</div>
                        </div>
                    </div>

                    <!-- ADMINS SECTION -->
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; padding: 0 0.5rem; opacity: 0.7;">${t.dev_admins_label}</div>
                    <div class="ios-list" style="margin-bottom: 2.5rem; overflow: hidden;">
                        ${admins.length > 0 ? admins.map(a => `
                            <div class="ios-list-item" style="padding: 16px; border-bottom: 1px solid var(--border);">
                                <div style="display: flex; align-items: center; gap: 14px; width: 100%;">
                                    <div style="width: 44px; height: 44px; border-radius: 12px; background: var(--system-gray6); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; color: var(--system-blue); border: 1px solid rgba(0,0,0,0.05);">${a.username.charAt(0).toUpperCase()}</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 800; font-size: 16px; letter-spacing: -0.2px; color: var(--text-primary);">${a.username}</div>
                                        <div style="font-size: 12px; color: var(--text-secondary); opacity: 0.6; margin-top: 2px;"><i data-lucide="key" size="10" style="vertical-align: middle; margin-right: 4px;"></i>${t.password_label}: <span style="font-family: monospace; font-weight: 600;">${a.password || '—'}</span></div>
                                    </div>
                                    <i data-lucide="chevron-right" size="16" style="opacity: 0.2;"></i>
                                </div>
                            </div>
                        `).join('').replace(/border-bottom: 1px solid var\(--border\);:last-child/, 'border-bottom: none;') : `<div class="ios-list-item" style="color: var(--text-secondary); justify-content: center; padding: 2rem; font-size: 13px; font-weight: 600;">${t.dev_no_admins}</div>`}
                    </div>

                    <!-- STUDENTS LIST -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0 0.5rem;">
                        <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); opacity: 0.7;">${t.dev_students_label}</div>
                        <div style="font-size: 11px; font-weight: 700; color: var(--system-blue); background: rgba(0,122,255,0.08); padding: 3px 8px; border-radius: 8px;">${students.length} Total</div>
                    </div>
                    <div class="ios-list" style="max-height: 400px; overflow-y: auto; margin-bottom: 2.5rem;">
                        ${students.length > 0 ? students.map(s => `
                            <div class="ios-list-item" style="padding: 16px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 8px;">
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-weight: 800; font-size: 16px; letter-spacing: -0.2px; color: var(--text-primary);">${s.name}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px; opacity: 0.7;">${s.phone || '—'} ${s.email ? ' • ' + s.email : ''}</div>
                                    <div style="font-size: 11px; color: var(--text-secondary); opacity: 0.6; margin-top: 4px;"><i data-lucide="key" size="10" style="vertical-align: middle;"></i> ${t.password_label}: <span style="font-family: monospace;">${s.password || '—'}</span></div>
                                </div>
                                <div style="text-align: right; background: var(--system-gray6); padding: 8px 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.02);">
                                    <div style="font-weight: 900; color: var(--system-blue); font-size: 18px; letter-spacing: -0.5px;">${s.balance === null ? '∞' : s.balance}</div>
                                    <div style="font-size: 9px; opacity: 0.5; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-top: -2px;">${t.balance_label}</div>
                                </div>
                            </div>
                        `).join('').replace(/border-bottom: 1px solid var\(--border\);:last-child/, 'border-bottom: none;') : `<div class="ios-list-item" style="color: var(--text-secondary); justify-content: center; padding: 2.5rem; font-size: 13px; font-weight: 600;">${t.dev_no_students}</div>`}
                    </div>

                    <!-- PLANS & SUBSCRIPTIONS -->
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; padding: 0 0.5rem; opacity: 0.7;">${t.dev_plans_label}</div>
                    <div class="ios-list" style="margin-bottom: 2.5rem;">
                        ${subs.length > 0 ? subs.map(sb => `
                            <div class="ios-list-item" style="padding: 16px; border-bottom: 1px solid var(--border);">
                                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                    <div style="font-weight: 800; font-size: 16px; letter-spacing: -0.2px; color: var(--text-primary);">${sb.name}</div>
                                    <div style="font-weight: 900; font-size: 17px; color: var(--system-green); background: rgba(52, 199, 89, 0.08); padding: 6px 12px; border-radius: 12px; border: 1px solid rgba(52, 199, 89, 0.1); font-family: 'Outfit';">$${sb.price}</div>
                                </div>
                            </div>
                        `).join('').replace(/border-bottom: 1px solid var\(--border\);:last-child/, 'border-bottom: none;') : `<div class="ios-list-item" style="color: var(--text-secondary); justify-content: center; padding: 2rem; font-size: 13px; font-weight: 600;">${t.dev_no_plans}</div>`}
                    </div>

                    <!-- CLASSES / SCHEDULE -->
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; padding: 0 0.5rem; opacity: 0.7;">${t.dev_classes_label}</div>
                    <div class="ios-list" style="margin-bottom: 4rem;">
                        ${classes.length > 0 ? classes.map(c => `
                            <div class="ios-list-item" style="padding: 16px; border-bottom: 1px solid var(--border);">
                                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 800; font-size: 16px; letter-spacing: -0.2px; color: var(--text-primary);">${c.name}</div>
                                        <div style="font-size: 12px; color: var(--text-secondary); opacity: 0.8; margin-top: 2px;">${c.day} • ${c.time} • ${c.location || 'N/A'}</div>
                                    </div>
                                    <div style="font-size: 10px; font-weight: 800; background: var(--system-gray6); padding: 5px 12px; border-radius: 12px; text-transform: uppercase; color: var(--text-primary); opacity: 0.6; border: 1px solid rgba(0,0,0,0.05);">${c.tag || 'OPEN'}</div>
                                </div>
                            </div>
                        `).join('').replace(/border-bottom: 1px solid var\(--border\);:last-child/, 'border-bottom: none;') : `<div class="ios-list-item" style="color: var(--text-secondary); justify-content: center; padding: 2rem; font-size: 13px; font-weight: 600;">${t.dev_no_classes}</div>`}
                    </div>

                    ${state.platformData.payment_requests && state.platformData.payment_requests.length > 0 ? (() => { const prs = state.platformData.payment_requests.filter(pr => pr.school_id === schoolId); return prs.length > 0 ? `
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; padding: 0 0.5rem; opacity: 0.7;">Payment requests</div>
                    <div class="ios-list" style="margin-bottom: 2.5rem;">
                        ${prs.map(pr => `
                            <div class="ios-list-item" style="padding: 12px 16px; border-bottom: 1px solid var(--border);">
                                <div style="font-size: 14px; font-weight: 700;">${pr.sub_name || '—'} • $${pr.price} • ${pr.status || '—'}</div>
                                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${pr.payment_method || '—'} • ${pr.created_at ? new Date(pr.created_at).toLocaleDateString() : '—'}</div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''; })() : ''}

                    ${state.platformData.admin_settings && state.platformData.admin_settings.length > 0 ? (() => { const sets = state.platformData.admin_settings.filter(as => as.school_id === schoolId); return sets.length > 0 ? `
                    <div style="text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 1rem; padding: 0 0.5rem; opacity: 0.7;">Admin settings (bank, etc.)</div>
                    <div class="ios-list" style="margin-bottom: 4rem;">
                        ${sets.map(as => `
                            <div class="ios-list-item" style="padding: 12px 16px; border-bottom: 1px solid var(--border);">
                                <div style="font-size: 12px; font-weight: 800; color: var(--system-blue);">${as.key || '—'}</div>
                                <div style="font-size: 13px; font-family: monospace;">${(as.value != null && as.value !== '') ? String(as.value) : '—'}</div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''; })() : ''}
                </div>
            `;
        }
    }
    else if (view === 'auth') {
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
                                    <input type="text" id="auth-name" class="minimal-input" placeholder="${window.t('full_name_placeholder')}" autocomplete="name">
                                    <input type="text" id="auth-username" class="minimal-input" placeholder="${window.t('username')}" autocomplete="username">
                                    <input type="text" id="auth-email" class="minimal-input" placeholder="${window.t('email_placeholder')}" autocomplete="email" inputmode="email" maxlength="254">
                                    <input type="text" id="auth-phone" class="minimal-input" placeholder="${window.t('phone')}" autocomplete="tel">
                                    <input type="password" id="auth-pass" class="minimal-input" placeholder="${window.t('password')}">
                                    <input type="password" id="auth-pass-confirm" class="minimal-input" placeholder="${window.t('confirm_password_placeholder')}" autocomplete="new-password">
                                ` : `
                                    <input type="text" id="auth-name" class="minimal-input" placeholder="${window.t('username')}" autocomplete="username">
                                    <input type="password" id="auth-pass" class="minimal-input" placeholder="${window.t('password')}">
                                `}
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
        const planSortKey = (s) => {
            const name = (s.name || '').toLowerCase();
            if (name.includes('ilimitad') || name.includes('unlimited') || s.limit_count === 0 || (s.limit_count == null && !(s.name || '').match(/\d+/))) return 1e9;
            const n = parseInt(s.limit_count, 10);
            if (!isNaN(n)) return n;
            const m = (s.name || '').match(/\d+/);
            return m ? parseInt(m[0], 10) : 0;
        };
        const sortedShopPlans = [...(state.subscriptions || [])].sort((a, b) => planSortKey(a) - planSortKey(b));
        html += `<h1>${t.shop_title}</h1>`;
        html += `<p class="text-muted" style="margin-bottom: 3.5rem; font-size: 1.1rem;">${t.select_plan_msg}</p>`;
        html += `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">`;
        sortedShopPlans.forEach(s => {
            html += `
                <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-radius: 24px; padding: 1.2rem;">
                    <div>
                        <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">${s.name}</h3>
                        <p class="text-muted" style="margin-bottom: 0.75rem; font-size: 0.8rem;">
                            ${t.valid_for_days.replace('{days}', s.validity_days || 30)}
                        </p>
                        <div style="font-size: 1.75rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.04em;">MXD ${s.price}</div>
                    </div>
                    <button class="btn-primary w-full" onclick="openPaymentModal('${s.id}')" style="padding: 0.75rem; font-size: 0.9rem;">${t.buy}</button>
                </div>
            `;
        });
        html += `</div>`;
    } else if (view === 'qr') {
        const compBlockHtml = state.currentCompetitionForStudent ? (() => {
            const comp = state.currentCompetitionForStudent;
            const reg = state.studentCompetitionRegistration;
            const eventName = (comp.name || '').substring(0, 40);
            const signInOpen = !!comp.is_sign_in_active;
            if (reg && reg.status === 'SUBMITTED' && !comp.decisions_published_at) {
                return `<div style="margin-bottom: 2rem; padding: 1rem; border-radius: 16px; background: var(--system-gray6); text-align: center;"><span style="font-size: 14px; font-weight: 600;">${t.reviewing_application}</span></div>`;
            }
            if (reg && comp.decisions_published_at) {
                const accepted = reg.status === 'APPROVED';
                const eventNameEsc = (comp.name || '').replace(/"/g, '&quot;');
                const msg = (accepted ? (t.competition_approved_message || 'Congratulations! You will compete in "{eventName}"') : (t.competition_declined_message || 'This time you cannot compete, but we hope to see you next time.')).replace('{eventName}', eventNameEsc);
                const cardBg = accepted ? 'linear-gradient(145deg, rgba(52, 199, 89, 0.12), rgba(52, 199, 89, 0.06))' : 'linear-gradient(145deg, rgba(142, 142, 147, 0.1), rgba(142, 142, 147, 0.04))';
                const cardBorder = accepted ? '1px solid rgba(52, 199, 89, 0.4)' : '1px solid rgba(142, 142, 147, 0.2)';
                const badgeBg = accepted ? 'var(--system-green)' : 'rgba(142, 142, 147, 0.2)';
                const badgeColor = accepted ? 'white' : 'var(--text-secondary)';
                return `
                <div style="margin-bottom: 2rem;">
                    <div style="background: ${cardBg}; border: ${cardBorder}; border-radius: 20px; padding: 1.5rem; text-align: center; max-width: 320px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                        <div style="margin-bottom: 1rem;">
                            <span style="display: inline-flex; align-items: center; justify-content: center; background: ${badgeBg}; color: ${badgeColor}; padding: 10px 24px; border-radius: 24px; font-weight: 800; font-size: 14px; letter-spacing: 0.04em; text-transform: uppercase;">${accepted ? '<i data-lucide="check-circle" size="18" style="margin-right: 8px; vertical-align: middle;"></i>' : ''}${accepted ? t.accepted : t.declined}</span>
                        </div>
                        <p style="font-size: 16px; line-height: 1.5; color: var(--text-primary); margin: 0; font-weight: 500;">${msg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                    </div>
                </div>`;
            }
            if (!signInOpen) {
                return `<div style="margin-bottom: 2rem; padding: 1rem; border-radius: 16px; background: var(--system-gray6); text-align: center;"><span style="font-size: 14px; font-weight: 600;">${eventName}</span><br><span style="font-size: 12px; color: var(--text-secondary);">${t.competition_reg_opens_soon || 'Registration opens soon'}</span></div>`;
            }
            return `<div style="margin-bottom: 2rem; display: flex; justify-content: center;">
                <button type="button" onclick="navigateToStudentJackAndJill('${comp.id}')" style="display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; max-width: 320px; padding: 18px 28px; border-radius: 18px; border: none; background: linear-gradient(135deg, var(--system-blue), #0051D5); color: white; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 24px rgba(0, 122, 255, 0.35); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 28px rgba(0, 122, 255, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(0, 122, 255, 0.35)'">
                    <i data-lucide="trophy" size="22"></i>
                    <span>${(t.register_for_event || 'Register for {eventName}').replace('{eventName}', eventName)}</span>
                </button>
            </div>`;
        })() : '';
        html += `
            <div class="text-center">
                <h1 style="margin-bottom: 0.5rem;">${t.qr_title}</h1>
                <p class="text-muted" style="margin-bottom: ${compBlockHtml ? '1rem' : '2rem'};">${t.qr_subtitle}</p>
                ${compBlockHtml}
                <div class="qr-outer" style="margin: 0 auto 1.5rem;"><div id="qr-code"></div></div>
                <div>
                    <div style="font-size: 0.8rem; margin-bottom: 1rem; letter-spacing: 0.05em; font-weight: 600;">
                        ${t.student_id}: <span style="color: var(--primary);">${state.currentUser.id}</span>
                    </div>
                    <div class="card" style="max-width: 280px; margin: 0 auto; padding: 1.2rem; border-radius: 20px;">
                    <div class="text-muted" style="font-size: 0.8rem; margin-bottom: 0.2rem; font-weight: 600; text-transform: uppercase;">${t.remaining_classes}</div>
                        <div style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.04em; color: var(--primary);">
                            ${(() => {
                                const packs = state.currentUser.active_packs || [];
                                const now = new Date();
                                const activePacks = packs.filter(p => new Date(p.expires_at) > now);
                                const hasUnlimited = state.currentUser.balance === null || activePacks.some(p => p.count == null || p.count === 'null');
                                return hasUnlimited ? '∞' : (state.currentUser.balance ?? 0);
                            })()}
                        </div>
                        ${(() => {
                            const packs = state.currentUser.active_packs || [];
                            const now = new Date();
                            const activePacks = packs.filter(p => new Date(p.expires_at) > now);
                            const nextExpiry = state.currentUser.package_expires_at || (activePacks.length > 0 ? activePacks.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at))[0].expires_at : null);
                            if (nextExpiry) {
                                const d = new Date(nextExpiry);
                                const days = window.getDaysRemaining(nextExpiry);
                                const isSoon = days !== null && days <= 5 && days > 0;
                                const isExpired = days !== null && days <= 0;
                                return `<div style="margin-top: 10px; font-size: 11px; font-weight: 600; color: var(--text-secondary);">${t.next_expiry_label}: <span style="color: ${isExpired ? 'var(--system-red)' : isSoon ? 'var(--system-orange)' : 'var(--primary)'};">${d.toLocaleDateString()}</span>${days !== null && days > 0 && days <= 31 ? ` (${days} ${t.days_left || 'days left'})` : ''}</div>`;
                            }
                            return '';
                        })()}
                    </div>

                    <div style="margin-top: 2rem; width: 100%; max-width: 320px; margin-left: auto; margin-right: auto; text-align: left;">
                        ${(() => {
                const allPacks = state.currentUser.active_packs || [];
                const now = new Date();
                const activePacks = allPacks.filter(p => new Date(p.expires_at) > now);
                const expiredPacks = allPacks.filter(p => new Date(p.expires_at) <= now).sort((a, b) => new Date(b.expires_at) - new Date(a.expires_at));
                const renderPackCard = (p, isExp) => {
                    const days = window.getDaysRemaining(p.expires_at);
                    const isSoon = !isExp && days > 0 && days <= 5;
                    const sc = isExp ? 'var(--system-red)' : (isSoon ? 'var(--system-orange)' : 'var(--system-blue)');
                    const bg = isExp ? 'var(--system-gray6)' : 'linear-gradient(145deg, var(--bg-card), var(--bg-body))';
                    const statusText = isExp ? 'Expirado' : (isSoon ? (days + 'd Restantes') : 'Activo');
                    return '<div class="card" style="padding: 1.2rem; border-radius: 22px; border: 1px solid var(--border); background: ' + bg + '; opacity: ' + (isExp ? 0.7 : 1) + ';">' +
                        '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">' +
                        '<div><div style="font-size: 15px; font-weight: 700;">' + (p.name || '').replace(/</g, '&lt;') + '</div>' +
                        '<div style="font-size: 11px; font-weight: 600; opacity: 0.5; text-transform: uppercase;">' + (p.created_at ? new Date(p.created_at).toLocaleDateString() : '') + '</div></div>' +
                        '<div style="background: ' + sc + '; color: white; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase;">' + statusText + '</div></div>' +
                        '<div style="display: flex; align-items: flex-end; justify-content: space-between;">' +
                        '<div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-secondary);">' +
                        '<i data-lucide="calendar" size="14" style="opacity: 0.6;"></i><span>' + t.expires_label + ': ' + new Date(p.expires_at).toLocaleDateString() + '</span></div>' +
                        '<div style="text-align: right;"><div style="font-size: 20px; font-weight: 800; color: ' + (isExp ? 'var(--text-secondary)' : 'var(--primary)') + ';">' + (p.count == null || p.count === 'null' ? '∞' : p.count) + '</div>' +
                        '<div style="font-size: 9px; font-weight: 700; opacity: 0.4; text-transform: uppercase;">Clases</div></div></div></div>';
                };
                let out = '<div style="text-transform: uppercase; font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px; letter-spacing: 0.05em; opacity: 0.6; padding: 0 10px;">' + (t.active_packs_label || 'Tus Paquetes Activos') + '</div>';
                out += '<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: ' + (expiredPacks.length > 0 ? '2rem' : '0') + ';">';
                if (activePacks.length === 0 && expiredPacks.length === 0) {
                    out += '<div style="background: var(--bg-card); padding: 1.5rem; border-radius: 24px; text-align: center; border: 1px dashed var(--border);"><div style="font-size: 13px; color: var(--text-secondary); opacity: 0.5;">No tienes paquetes activos</div></div>';
                } else {
                    out += activePacks.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at)).map(p => renderPackCard(p, false)).join('');
                }
                out += '</div>';
                if (expiredPacks.length > 0) {
                    out += '<div style="text-transform: uppercase; font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px; letter-spacing: 0.05em; opacity: 0.6; padding: 0 10px;">' + t.expired_classes_label + '</div>';
                    out += '<div style="display: flex; flex-direction: column; gap: 12px;">' + expiredPacks.map(p => renderPackCard(p, true)).join('') + '</div>';
                }
                return out;
            })()}
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
    } else if (view === 'student-competition-register') {
        const compId = state.competitionId;
        const studentId = state.currentUser?.id;
        const schoolId = state.currentUser?.school_id || state.currentSchool?.id;
        if (compId && studentId && schoolId && !state.studentCompetitionDetail) {
            (async () => {
                const { data: compData } = await supabaseClient.rpc('competition_get_by_id_for_student', { p_competition_id: compId, p_student_id: String(studentId), p_school_id: schoolId });
                state.studentCompetitionDetail = Array.isArray(compData) && compData.length > 0 ? compData[0] : null;
                const { data: regData } = await supabaseClient.rpc('competition_registration_get', { p_competition_id: compId, p_student_id: String(studentId) });
                state.studentCompetitionRegDetail = Array.isArray(regData) && regData.length > 0 ? regData[0] : null;
                if (state.studentCompetitionRegDetail && state.studentCompetitionRegDetail.answers) state.studentCompetitionAnswers = state.studentCompetitionRegDetail.answers;
                else state.studentCompetitionAnswers = state.studentCompetitionAnswers || {};
                renderView();
            })();
        }
        const comp = state.studentCompetitionDetail;
        const reg = state.studentCompetitionRegDetail;
        const questions = (comp && Array.isArray(comp.questions)) ? comp.questions : [];
        const isSubmitted = reg && reg.status !== 'DRAFT';
        const isPublished = comp && comp.decisions_published_at;
        const answers = state.studentCompetitionAnswers || {};

        html += `
            <div class="ios-header" style="display: flex; align-items: center; gap: 12px;">
                <button class="btn-icon" onclick="window.location.hash=''; state.currentView='qr'; state.competitionId=null; state.studentCompetitionDetail=null; state.studentCompetitionRegDetail=null; saveState(); renderView();" style="padding: 8px;"><i data-lucide="arrow-left" size="20"></i></button>
                <div class="ios-large-title">${t.jack_and_jill}</div>
            </div>
            <div style="padding: 1.2rem;">
                ${!comp ? `<p style="color: var(--text-secondary);">${t.loading}</p>` : `
                <div style="margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem;">${(comp.name || '').replace(/</g, '&lt;')}</h2>
                    <p style="font-size: 14px; color: var(--text-secondary);">${comp.starts_at ? new Date(comp.starts_at).toLocaleString() : ''}</p>
                    ${comp.next_steps_text ? `<div style="margin-top: 1rem; padding: 1rem; background: var(--system-gray6); border-radius: 12px; font-size: 14px; white-space: pre-wrap;">${(comp.next_steps_text || '').replace(/</g, '&lt;')}</div>` : ''}
                </div>
                ${isSubmitted ? `
                    ${isPublished && reg ? `<div style="text-align: center; padding: 1.5rem;"><span class="status-badge ${reg.status === 'APPROVED' ? 'status-approved' : 'status-declined'}" style="display: inline-block; padding: 10px 20px; border-radius: 20px; font-weight: 700; font-size: 16px;">${reg.status === 'APPROVED' ? t.accepted : t.declined}</span></div>` : `<p style="text-align: center; font-weight: 600;">${t.reviewing_application}</p>`}
                ` : `
                <form id="student-comp-form" onsubmit="return false;">
                    ${questions.map((q, i) => `
                        <div style="margin-bottom: 1rem;">
                            <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">${(q || '').replace(/</g, '&lt;')}</label>
                            <input type="text" name="q${i}" data-qidx="${i}" value="${(answers[i] || answers[String(i)] || '').replace(/"/g, '&quot;').replace(/</g, '&lt;')}" oninput="debouncedSaveCompetitionDraft()" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-primary);">
                        </div>
                    `).join('')}
                    ${comp.video_submission_enabled ? `
                    <div style="margin-bottom: 1rem;">
                        <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">${(comp.video_submission_prompt || t.competition_video_prompt_placeholder || 'Upload your demo video (2-3 minutes)').replace(/</g, '&lt;')}</label>
                        <div id="student-comp-video-upload-area">
                            <input type="file" id="student-comp-video-input" accept="video/mp4,video/quicktime,video/webm" onchange="handleCompetitionVideoSelect(this)" style="width: 100%; padding: 10px; font-size: 14px;">
                            <div id="student-comp-video-status" style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;"></div>
                            ${answers.video ? `<div style="margin-top: 8px; font-size: 13px; color: var(--system-green); font-weight: 600;"><i data-lucide="check-circle" size="14" style="vertical-align: middle;"></i> ${t.competition_video_uploaded || 'Video uploaded'}</div>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    <button type="button" class="btn-primary" id="student-comp-submit-btn" onclick="submitStudentCompetitionRegistration()" style="width: 100%; border-radius: 14px; height: 50px; font-size: 16px; font-weight: 600; margin-top: 1rem;">${t.submit_registration}</button>
                </form>
                `}
                `}
            </div>
            <div style="height: 80px;"></div>
        `;
    } else if (view === 'admin-students') {
        const comps = Array.isArray(state.competitions) ? state.competitions : [];
        const defaultComp = comps.find(c => c.is_active) || comps.sort((a, b) => new Date(b.starts_at || 0) - new Date(a.starts_at || 0))[0] || null;
        const pickedId = state.adminStudentsCompetitionId && comps.some(c => c.id === state.adminStudentsCompetitionId) ? state.adminStudentsCompetitionId : null;
        const currentComp = pickedId ? comps.find(c => c.id === pickedId) : defaultComp;
        const hasActiveEvent = comps.some(c => c.is_active);
        const adminUsername = (state.currentUser && state.currentUser.name) ? state.currentUser.name.replace(/\s*\(Admin\)\s*$/i, '').trim() : '';
        html += `
            ${!state.schoolAdminLinked ? `
            <div class="card" style="margin: 1.2rem 1.2rem 1rem; padding: 1.25rem; border-radius: 20px; border: 1px solid var(--border); background: linear-gradient(135deg, rgba(0,122,255,0.06) 0%, transparent 100%);">
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;"><i data-lucide="link" size="14" style="vertical-align: middle; margin-right: 6px;"></i> Link admin account (one-time)</div>
                <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">We will link &quot;${adminUsername || 'you'}&quot; to a new login so you can create events and use all features. Use the <strong>exact same password</strong> you used to log in here.</p>
                <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase;">Email (for your new login)</label>
                <input type="email" id="school-admin-link-email" placeholder="e.g. admin@myschool.com" autocomplete="off" value="" style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 14px; margin-bottom: 10px; box-sizing: border-box;" />
                <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase;">Current admin password (same as login)</label>
                <input type="password" id="school-admin-link-password" placeholder="Same password you used to open this dashboard" autocomplete="off" style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 14px; margin-bottom: 10px; box-sizing: border-box;" />
                <button type="button" class="btn-primary" onclick="window.linkSchoolAdminAccount()" style="width: 100%; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 700;">Link account</button>
            </div>
            ` : ''}
            <div class="ios-header" style="background: transparent;">
                <div class="ios-large-title">${t.nav_students}</div>
                <div style="margin-top: -5px; margin-bottom: 2rem; display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
                    <button class="btn-primary" onclick="createNewStudent()" style="border-radius: 12px; padding: 8px 16px; font-size: 14px; min-height: 36px; height: 36px;">
                        <i data-lucide="plus" size="14"></i> ${t.add_student}
                    </button>
                    ${(comps.length > 0 && (state.currentSchool?.jack_and_jill_enabled === true)) ? `<button class="btn-secondary" ${hasActiveEvent ? 'onclick="navigateToAdminJackAndJill(state.currentSchool?.id, null, \'registrations\')"' : 'disabled'} style="border-radius: 12px; padding: 8px 16px; font-size: 14px; min-height: 36px; height: 36px; ${!hasActiveEvent ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                        <i data-lucide="trophy" size="14"></i> ${t.jack_and_jill}
                    </button>` : ''}
                    ${(currentComp && state.currentSchool?.jack_and_jill_enabled === true) ? `
                    <div style="display: flex; flex-direction: column; gap: 6px; margin-left: 4px;">
                        ${comps.length > 1 ? `
                        <select onchange="state.adminStudentsCompetitionId=this.value; renderView();" style="padding: 6px 10px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 12px; font-weight: 600; max-width: 240px;">
                            ${comps.map(c => `<option value="${c.id}" ${c.id === currentComp.id ? 'selected' : ''}>${(c.name || '').replace(/</g, '&lt;').substring(0, 32)}${(c.name || '').length > 32 ? '…' : ''}</option>`).join('')}
                        </select>
                        ` : `<span style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">${t.competition_for_event}: ${(currentComp.name || '').replace(/</g, '&lt;').substring(0, 30)}${(currentComp.name || '').length > 30 ? '…' : ''}</span>`}
                        <div style="display: flex; align-items: center; gap: 16px; padding: 6px 12px; background: var(--system-gray6); border-radius: 12px;">
                            <label class="toggle-switch" style="font-size: 12px; font-weight: 600;">
                                <input type="checkbox" class="toggle-switch-input" ${currentComp.is_active ? 'checked' : ''} onchange="toggleCompetitionActiveFromStudents('${currentComp.id}', this.checked)">
                                <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                                <span class="toggle-switch-label">${t.competition_activate_event}</span>
                            </label>
                            <label class="toggle-switch" style="font-size: 12px; font-weight: 600;">
                                <input type="checkbox" class="toggle-switch-input" ${currentComp.is_sign_in_active ? 'checked' : ''} onchange="toggleCompetitionSignInFromStudents('${currentComp.id}', this.checked)">
                                <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                                <span class="toggle-switch-label">${t.competition_activate_signin}</span>
                            </label>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div style="position: sticky; top: 60px; z-index: 90; background: var(--bg-body); padding-bottom: 5px; opacity: 0.98; backdrop-filter: blur(10px);">
                <input type="text" class="ios-search-bar" placeholder="${t.search_students}" oninput="filterStudents(this.value)" style="margin-bottom: 1.5rem;">
            </div>
            <div class="ios-list" id="admin-student-list" style="margin-top: 0;">
                ${state.loading && state.students.length === 0 ? `
                    <div style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        <div class="spin" style="margin-bottom: 1rem; color: var(--system-blue);"><i data-lucide="loader-2" size="32"></i></div>
                        <p style="font-size: 15px; font-weight: 500;">${t.loading_students_msg}</p>
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
            
            <div style="padding: 0 1.2rem; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t.pending_payments}</span>
                <button type="button" onclick="fetchAllData()" style="background: var(--system-gray6); border: none; border-radius: 10px; padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 6px;" title="${t.refresh_btn}">
                    <i data-lucide="refresh-cw" size="14"></i> ${t.refresh_btn}
                </button>
            </div>
            <div class="ios-list">
                ${pending.length > 0 ? pending.map(req => {
            const studentName = (req.students && req.students.name) || (state.students.find(s => s.id === req.student_id)?.name) || t.unknown_student;
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
                    <span style="font-size: 15px; font-weight: 500; opacity: 0.6;">${t.no_pending_msg}</span>
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
                        <span style="font-size: 13px; font-weight: 500; opacity: 0.8;">${t.historical_total_label}: $${totalHistorical.toLocaleString()} </span>
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
            const studentName = (req.students && req.students.name) || (state.students.find(s => s.id === req.student_id)?.name) || t.unknown_student;
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
        }).join('') : `<div class="ios-list-item" style="color: var(--text-secondary); text-align: center; justify-content: center; padding: 2rem;">${t.no_data_msg}</div>`)}
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
        // Sort by id so new classes (pushed with highest id) appear at bottom for nicer UX
        const classesList = [...(Array.isArray(state.classes) ? state.classes : [])].sort((a, b) => (a.id || 0) - (b.id || 0));
        const planSortKey = (s) => {
            const name = (s.name || '').toLowerCase();
            if (name.includes('ilimitad') || name.includes('unlimited') || s.limit_count === 0 || (s.limit_count == null && !(s.name || '').match(/\d+/))) return 1e9;
            const n = parseInt(s.limit_count, 10);
            if (!isNaN(n)) return n;
            const m = (s.name || '').match(/\d+/);
            return m ? parseInt(m[0], 10) : 0;
        };
        const subscriptionsList = [...(Array.isArray(state.subscriptions) ? state.subscriptions : [])].sort((a, b) => planSortKey(a) - planSortKey(b));

        html += `
            <div class="ios-header">
                <div class="ios-large-title">${t.nav_settings}</div>
            </div>

            <div style="padding: 0 1.2rem; margin-top: 1.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                ${t.mgmt_classes_title}
            </div>
            <div class="ios-list" style="overflow: visible;">
                ${classesList.map(c => `
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
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px; position: relative; overflow: visible;">
                                <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t.day_label}</label>
                                <div class="custom-dropdown-container" style="overflow: visible;">
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
                                <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t.hour_label}</label>
                                <input type="time" value="${c.time || '09:00'}" onblur="scheduleTimeBlurSave(${c.id}, this)" onfocus="cancelTimeBlurSave(this)" style="background: transparent; border: none; font-size: 14px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; cursor: pointer; padding: 0;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px; opacity: 0.8;">
                                 <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t.class_location}</label>
                                 <input type="text" value="${c.location || ''}" oninput="debouncedUpdateClass(${c.id}, 'location', this.value)" placeholder="${t.location_placeholder}" style="background: transparent; border: none; font-size: 13px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; padding: 0;">
                            </div>
                            <div style="background: var(--system-gray6); border-radius: 12px; padding: 8px 12px; opacity: 0.8;">
                                 <label style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; opacity: 0.6;">${t.level_tag_label}</label>
                                 <input type="text" value="${c.tag || 'Clase'}" oninput="debouncedUpdateClass(${c.id}, 'tag', this.value)" placeholder="Ej: Principiante" style="background: transparent; border: none; font-size: 13px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none; padding: 0;">
                            </div>
                        </div>
                    </div>
                `).join('')}
                
                <div class="ios-list-item" onclick="addClass()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px;">
                    <i data-lucide="plus-circle" size="18" style="opacity: 0.5; margin-right: 8px;"></i> ${t.add_label} ${t.new_class_label}
                </div>
            </div>

            <!-- WEEKLY PREVIEW FOR ADMINS -->
            <div style="padding: 0 1.2rem; margin-top: 1.5rem;">
                <button onclick="window.toggleWeeklyPreview()" style="width: 100%; padding: 14px; border-radius: 16px; border: 1px solid var(--border); background: var(--system-gray6); color: var(--text-primary); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 14px;">
                    <i data-lucide="${state.showWeeklyPreview ? 'eye-off' : 'eye'}" size="16" style="opacity: 0.6;"></i>
                    ${state.showWeeklyPreview ? t.hide_weekly_btn : t.show_weekly_btn}
                </button>
            </div>

            ${state.showWeeklyPreview ? `
            <div style="padding: 0 1.2rem; margin-top: 2rem; margin-bottom: 0.8rem; display: flex; align-items: center; justify-content: space-between;" class="slide-in">
                <div style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                    ${t.weekly_preview_title}
                </div>
            </div>
            <div style="padding: 0 0.5rem; margin-bottom: 2rem;" class="slide-in">
                <div class="weekly-grid">
                    ${daysOrder.map(dayKey => {
            const dayAliases = { 'Mon': ['Mon', 'Mo', 'Monday'], 'Tue': ['Tue', 'Tu', 'Tuesday'], 'Wed': ['Wed', 'We', 'Wednesday'], 'Thu': ['Thu', 'Th', 'Thursday'], 'Fri': ['Fri', 'Fr', 'Friday'], 'Sat': ['Sat', 'Sa', 'Saturday'], 'Sun': ['Sun', 'Su', 'Sunday'] };
            const aliases = dayAliases[dayKey];
            const dayClasses = classesList.filter(c => aliases.includes(c.day)).sort((a, b) => a.time.localeCompare(b.time));

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
                ${t.plans_label}
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; padding: 0 1.2rem;">
                ${subscriptionsList.map(s => `
                    <div class="card ios-list-item" style="flex-direction: column; align-items: stretch; gap: 10px; padding: 12px;">
                         <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                                <i data-lucide="credit-card" size="14" style="opacity: 0.3; flex-shrink: 0;"></i>
                                <input type="text" value="${s.name}" onchange="updateSub('${s.id}', 'name', this.value)" style="border: none; background: transparent; font-size: 14px; font-weight: 600; width: 100%; color: var(--text-primary); outline: none;">
                            </div>
                            <button onclick="removeSubscription('${s.id}')" style="background: none; border: none; color: var(--text-secondary); opacity: 0.4; padding: 4px; cursor: pointer; flex-shrink: 0;">
                                <i data-lucide="trash-2" size="16"></i>
                            </button>
                        </div>
                         <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <div style="flex: 1; min-width: 60px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                <span style="color: var(--text-secondary); font-size: 10px; font-weight: 700; opacity: 0.6;">$</span>
                                <input type="number" value="${s.price}" onchange="updateSub('${s.id}', 'price', this.value)" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                            </div>
                            <div style="flex: 1; min-width: 50px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                <i data-lucide="layers" size="10" style="color: var(--text-secondary); opacity: 0.5;"></i>
                                <input type="number" value="${s.limit_count === 0 ? 0 : (s.limit_count || '')}" min="0" onchange="updateSub('${s.id}', 'limit_count', this.value === '' ? '0' : this.value)" placeholder="${t.limit_classes_placeholder || 'Clases (0 = Ilimitado)'}" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                            </div>
                            <div style="flex: 1; min-width: 56px; display:flex; align-items:center; background: var(--system-gray6); padding: 6px 10px; border-radius: 10px; gap: 4px;">
                                <i data-lucide="calendar" size="10" style="color: var(--text-secondary); opacity: 0.5;"></i>
                                <input type="number" value="${s.validity_days || 30}" onchange="updateSub('${s.id}', 'validity_days', this.value)" placeholder="Días" style="background: transparent; border: none; width: 100%; color: var(--text-primary); font-weight: 600; outline: none; font-size: 12px; padding: 0;">
                            </div>
                        </div>
                    </div>
                `).join('')}
                <div class="card ios-list-item" onclick="addSubscription()" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; grid-column: span 2;">
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
                    <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t.account_number_label}</span>
                    <input type="text" id="set-bank-cbu" value="${state.adminSettings.bank_cbu || ''}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                </div>
                <div class="ios-list-item" style="padding: 12px 16px;">
                    <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t.holder_name_label}</span>
                    <input type="text" id="set-bank-holder" value="${state.adminSettings.bank_holder || ''}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                </div>
                <div class="ios-list-item" style="padding: 12px 16px;">
                    <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">${t.asunto_label}</span>
                    <input type="text" id="set-bank-alias" value="${state.adminSettings.bank_alias || ''}" style="text-align: right; border: none; background: transparent; width: 60%; color: var(--text-secondary); font-size: 16px; outline: none;">
                </div>
                <div class="ios-list-item" onclick="saveBankSettings(this)" style="color: var(--text-primary); font-weight: 600; justify-content: center; cursor: pointer; padding: 14px; background: var(--system-gray6);">
                    <i data-lucide="save" size="18" style="opacity: 0.6; margin-right: 8px;"></i> ${t.save_bank_btn}
                </div>
            </div>

            <div style="padding: 0 1.2rem; margin-top: 2.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
                ${t.mgmt_admins_title}
            </div>
            <div class="ios-list">
                ${(Array.isArray(state.admins) ? state.admins : []).map(adm => `
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

            <div class="expandable-section" style="margin-top: 2rem; padding: 0 1.2rem;">
                <div class="expandable-section-header" onclick="state.additionalFeaturesExpanded=!state.additionalFeaturesExpanded; renderView();" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 0; cursor: pointer; border-bottom: 1px solid var(--border);">
                    <span style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t.additional_features}</span>
                    <i data-lucide="${state.additionalFeaturesExpanded ? 'chevron-up' : 'chevron-down'}" size="18" style="opacity: 0.5;"></i>
                </div>
                ${state.additionalFeaturesExpanded ? `
                <div class="expandable-section-content" style="padding: 1rem 0;">
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px;">${state.currentSchool?.jack_and_jill_enabled === true ? t.create_new_competition : ''}</div>
                    <button class="btn-primary" ${state.currentSchool?.jack_and_jill_enabled === true ? 'onclick="navigateToAdminJackAndJill(state.currentSchool?.id, null)"' : 'disabled'} style="width: 100%; border-radius: 14px; height: 48px; font-size: 15px; font-weight: 600; ${state.currentSchool?.jack_and_jill_enabled !== true ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                        <i data-lucide="trophy" size="16" style="margin-right: 8px;"></i> ${t.jack_and_jill}
                    </button>
                    ${state.currentSchool?.jack_and_jill_enabled !== true ? `<p style="font-size: 13px; color: var(--text-secondary); padding: 10px 0 0; margin: 0;">${t.jack_and_jill_upgrade_msg}</p>` : ''}
                </div>
                ` : ''}
            </div>

            <div style="height: 100px;"></div> <!-- Spacer for bottom nav padding -->
    `;
    } else if (view === 'admin-competition-jack-and-jill') {
        const schoolId = state.competitionSchoolId || state.currentSchool?.id;
        if (schoolId && state._competitionListSchoolId !== schoolId) {
            state._competitionListSchoolId = schoolId;
            window.fetchCompetitionList(schoolId);
        }
        const comps = Array.isArray(state.competitions) ? state.competitions : [];
        const current = state.currentCompetition;
        const formOpen = !!state.jackAndJillFormOpen;
        if (formOpen && current) state.competitionFormQuestions = Array.isArray(state.competitionFormQuestions) ? state.competitionFormQuestions : (Array.isArray(current.questions) ? [...current.questions] : []);
        else if (formOpen && !current) state.competitionFormQuestions = Array.isArray(state.competitionFormQuestions) ? state.competitionFormQuestions : [];

        html += `
            <div class="jandj-page" style="min-height: 100vh; background: var(--bg-body);">
            <div class="ios-header" style="display: flex; align-items: center; gap: 16px; padding: 14px 20px 18px; border-bottom: 1px solid var(--border);">
                <button type="button" onclick="window.location.hash=''; state.currentView='admin-settings'; saveState(); renderView();" style="width: 36px; height: 36px; border-radius: 50%; background: var(--system-gray6); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--system-blue);"><i data-lucide="chevron-left" size="22"></i></button>
                <h1 style="font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: var(--text-primary); margin: 0;">${t.jack_and_jill}</h1>
            </div>
            <div style="padding: 24px 20px 40px; max-width: 560px; margin: 0 auto;">
                ${!schoolId ? `<p style="color: var(--text-secondary); font-size: 15px;">${t.not_found_msg}</p>` : formOpen ? `
                <div class="jandj-form-card" style="background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                    <div style="padding: 28px 24px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
                            <h2 style="font-size: 22px; font-weight: 700; letter-spacing: -0.3px; color: var(--text-primary); margin: 0;">${current ? t.competition_edit_tab : t.add_new_event}</h2>
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <span id="comp-autosave-status" style="font-size: 13px; font-weight: 500; color: var(--text-secondary); min-width: 60px;"></span>
                                <button type="button" onclick="closeCompetitionForm()" style="padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-size: 15px; font-weight: 600; cursor: pointer;">${t.cancel}</button>
                            </div>
                        </div>
                        <input type="hidden" id="comp-id" value="${(current && current.id) || ''}">
                        <div style="margin-bottom: 28px;">
                            <label style="font-size: 14px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 12px; letter-spacing: 0.02em;">${t.competition_name}</label>
                            <input type="text" id="comp-name" value="${(current && current.name) || ''}" placeholder="${t.competition_name}" oninput="debouncedAutosaveCompetition()" style="width: 100%; min-width: 0; padding: 16px 18px; height: 50px; border-radius: 14px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 17px; outline: none; box-sizing: border-box; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--system-blue)'" onblur="this.style.borderColor='var(--border)'">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px;">
                            <div>
                                <label style="font-size: 14px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 12px; letter-spacing: 0.02em;">${t.competition_date}</label>
                                <input type="date" id="comp-date" value="${current && current.starts_at ? new Date(current.starts_at).toISOString().slice(0, 10) : ''}" onchange="debouncedAutosaveCompetition()" style="width: 100%; padding: 16px 18px; height: 50px; border-radius: 14px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 17px; outline: none; box-sizing: border-box; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--system-blue)'" onblur="this.style.borderColor='var(--border)'">
                            </div>
                            <div>
                                <label style="font-size: 14px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 12px; letter-spacing: 0.02em;">${t.competition_time}</label>
                                <input type="time" id="comp-time" value="${current && current.starts_at ? new Date(current.starts_at).toTimeString().slice(0, 5) : '19:00'}" onchange="debouncedAutosaveCompetition()" style="width: 100%; padding: 16px 18px; height: 50px; border-radius: 14px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 17px; outline: none; box-sizing: border-box; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--system-blue)'" onblur="this.style.borderColor='var(--border)'">
                            </div>
                        </div>
                        <div style="margin-bottom: 28px;">
                            <label style="font-size: 14px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 12px; letter-spacing: 0.02em;">${t.competition_questions}</label>
                            <div id="comp-questions-container"></div>
                            <button type="button" onclick="addCompetitionQuestion()" style="margin-top: 14px; padding: 16px 22px; border-radius: 14px; border: 2px dashed var(--border); background: transparent; color: var(--system-blue); font-size: 16px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; transition: background 0.2s, border-color 0.2s;" onmouseover="this.style.background='rgba(0,122,255,0.06)'; this.style.borderColor='var(--system-blue)'" onmouseout="this.style.background='transparent'; this.style.borderColor='var(--border)'"><i data-lucide="plus" size="20"></i>${t.competition_add_question}</button>
                        </div>
                        <div style="margin-bottom: 32px;">
                            <label style="font-size: 14px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 12px; letter-spacing: 0.02em;">${t.competition_next_steps}</label>
                            <textarea id="comp-next-steps" rows="4" placeholder="${t.competition_next_steps_placeholder || ''}" oninput="debouncedAutosaveCompetition()" style="width: 100%; min-height: 120px; padding: 16px 18px; border-radius: 14px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 16px; line-height: 1.5; resize: vertical; outline: none; box-sizing: border-box; font-family: inherit; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--system-blue)'" onblur="this.style.borderColor='var(--border)'">${(current && current.next_steps_text) || ''}</textarea>
                        </div>
                        <div style="margin-bottom: 28px;">
                            <label class="toggle-switch" style="justify-content: space-between; width: 100%; font-size: 15px; font-weight: 500; margin-bottom: 12px;">
                                <span class="toggle-switch-label">${t.competition_video_submission_toggle || 'Include video submission?'}</span>
                                <span style="display: flex;">
                                    <input type="checkbox" id="comp-video-enabled" class="toggle-switch-input" ${(current && current.video_submission_enabled) ? 'checked' : ''} onchange="debouncedAutosaveCompetition(); const p=document.getElementById('comp-video-prompt-wrap'); if(p)p.style.display=this.checked?'block':'none';">
                                    <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                                </span>
                            </label>
                            <div id="comp-video-prompt-wrap" style="display: ${(current && current.video_submission_enabled) ? 'block' : 'none'}; margin-top: 12px;">
                                <label style="font-size: 14px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 8px;">${t.competition_video_prompt_label || 'Video question text'}</label>
                                <input type="text" id="comp-video-prompt" value="${(current && current.video_submission_prompt) || ''}" placeholder="${t.competition_video_prompt_placeholder || 'Upload your demo video (2-3 minutes)'}" oninput="debouncedAutosaveCompetition()" style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 16px; box-sizing: border-box;">
                            </div>
                        </div>
                    </div>
                    <div style="padding: 20px 24px 28px; background: var(--system-gray6); border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 16px;">
                        <span id="comp-autosave-status-footer" style="font-size: 13px; font-weight: 500; color: var(--text-secondary);"></span>
                        <button type="button" onclick="closeCompetitionForm()" style="flex: 1; max-width: 200px; padding: 16px 24px; border-radius: 14px; border: none; background: var(--system-blue); color: white; font-size: 17px; font-weight: 600; cursor: pointer;">${t.competition_done}</button>
                    </div>
                </div>
                ` : `
                ${state.competitionTab === 'registrations' && state.competitionId ? (() => {
                    const regs = Array.isArray(state.competitionRegistrations) ? state.competitionRegistrations : [];
                    const cur = state.currentCompetition;
                    return `
                    <button type="button" onclick="state.competitionTab='edit'; state.competitionId=null; state.currentCompetition=null; state.competitionRegistrations=[]; renderView();" style="margin-bottom: 20px; padding: 10px 0; border: none; background: none; color: var(--system-blue); font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;"><i data-lucide="chevron-left" size="20"></i> Back to events</button>
                    <div style="background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                        ${cur && cur.decisions_published_at
                            ? `<button type="button" onclick="if(confirm(t('competition_confirm_publish'))) republishCompetitionDecisions('${state.competitionId}');" style="width: 100%; padding: 14px 20px; border: none; background: var(--system-gray6); color: var(--text-primary); font-size: 16px; font-weight: 600; cursor: pointer;">${t.competition_republish_decisions}</button>`
                            : `<button type="button" onclick="if(confirm(t('competition_confirm_publish'))) publishCompetitionDecisions('${state.competitionId}');" style="width: 100%; padding: 14px 20px; border: none; background: var(--system-blue); color: white; font-size: 16px; font-weight: 600; cursor: pointer;">${t.competition_publish_decisions}</button>`
                        }
                        <div style="padding: 8px 0;">
                            ${regs.length === 0 ? `<div style="padding: 32px 20px; text-align: center; color: var(--text-secondary); font-size: 15px;">No registrations yet.</div>` : regs.map(r => {
                                const canDecide = ['SUBMITTED', 'APPROVED', 'DECLINED'].includes(r.status || '');
                                return `
                                <div style="padding: 16px 20px; border-bottom: 1px solid var(--border);">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${canDecide ? '12px' : '0'};">
                                        <button type="button" data-action="openRegistrationAnswers" data-reg-id="${r.id}" style="background: none; border: none; padding: 0; font-size: 17px; font-weight: 600; color: var(--system-blue); cursor: pointer; text-align: left;">${((r.student_name || r.student_id || '') + '').replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 30)}</button>
                                        <span class="status-badge status-${(r.status || '').toLowerCase()}" style="font-size: 12px; padding: 5px 12px; border-radius: 20px; font-weight: 600;">${r.status === 'APPROVED' ? t.accepted : r.status === 'DECLINED' ? t.declined : r.status === 'SUBMITTED' ? t.pending : 'Draft'}</span>
                                    </div>
                                    ${canDecide ? `
                                    <div style="display: flex; gap: 10px;">
                                        <button type="button" style="flex:1; padding: 10px; border-radius: 10px; border: ${r.status === 'APPROVED' ? '2px solid var(--system-green)' : 'none'}; background: ${r.status === 'APPROVED' ? 'transparent' : 'var(--system-green)'}; color: ${r.status === 'APPROVED' ? 'var(--system-green)' : 'white'}; font-size: 15px; font-weight: 600; cursor: pointer;" onclick="competitionRegistrationDecide('${r.id}', 'APPROVED');">${t.competition_approve}</button>
                                        <button type="button" style="flex:1; padding: 10px; border-radius: 10px; border: ${r.status === 'DECLINED' ? '2px solid var(--system-red)' : '1px solid var(--border)'}; background: ${r.status === 'DECLINED' ? 'transparent' : 'var(--system-gray6)'}; color: ${r.status === 'DECLINED' ? 'var(--system-red)' : 'var(--text-primary)'}; font-size: 15px; font-weight: 600; cursor: pointer;" onclick="competitionRegistrationDecide('${r.id}', 'DECLINED');">${t.competition_decline}</button>
                                    </div>
                                    ` : ''}
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                    `;
                })() : `
                <section style="margin-bottom: 28px;">
                    <h2 style="font-size: 13px; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 16px 0;">Events</h2>
                    ${comps.length === 0 ? `
                    <p style="font-size: 17px; color: var(--text-secondary); padding: 32px 24px; text-align: center; margin: 0; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border);">${t.no_existing_events}</p>
                    ` : `
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${comps.map(c => `
                        <div style="background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                            <div style="padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                                <div>
                                    <div style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">${(c.name || '').replace(/</g, '&lt;').substring(0, 40)}${(c.name || '').length > 40 ? '…' : ''}</div>
                                    <div style="font-size: 15px; color: var(--text-secondary);">${c.starts_at ? new Date(c.starts_at).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <a href="#" data-action="openRegistrations" data-competition-id="${c.id}" style="font-size: 15px; font-weight: 600; color: var(--system-blue);">${t.competition_registrations}</a>
                                    <button type="button" data-action="copyCompetition" data-competition-id="${c.id}" title="${t.competition_copy || 'Copy'}" style="background: none; border: none; padding: 6px; cursor: pointer; color: var(--system-blue); opacity: 0.85; border-radius: 8px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.85'"><i data-lucide="copy" size="18"></i></button>
                                    <button type="button" data-action="deleteCompetition" data-competition-id="${c.id}" title="${t.competition_delete_confirm || 'Delete event'}" style="background: none; border: none; padding: 6px; cursor: pointer; color: var(--system-red); opacity: 0.8; border-radius: 8px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'"><i data-lucide="trash-2" size="18"></i></button>
                                </div>
                            </div>
                            <div style="padding: 14px 20px; background: var(--system-gray6); border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 14px;">
                                <label class="toggle-switch" style="justify-content: space-between; width: 100%; font-size: 15px; font-weight: 500;">
                                    <span class="toggle-switch-label">${t.competition_activate_event}</span>
                                    <span style="display: flex;">
                                        <input type="checkbox" class="toggle-switch-input" ${c.is_active ? 'checked' : ''} onchange="toggleCompetitionActiveFromStudents('${c.id}', this.checked)">
                                        <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                                    </span>
                                </label>
                                <label class="toggle-switch" style="justify-content: space-between; width: 100%; font-size: 15px; font-weight: 500;">
                                    <span class="toggle-switch-label">${t.competition_activate_signin}</span>
                                    <span style="display: flex;">
                                        <input type="checkbox" class="toggle-switch-input" ${c.is_sign_in_active ? 'checked' : ''} onchange="toggleCompetitionSignInFromStudents('${c.id}', this.checked)">
                                        <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
                                    </span>
                                </label>
                            </div>
                            <div style="padding: 12px 20px; border-top: 1px solid var(--border);">
                                <button type="button" onclick="openEditCompetition('${c.id}')" style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--text-primary); font-size: 15px; font-weight: 600; cursor: pointer;">${t.competition_edit_tab}</button>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                    `}
                </section>
                <button type="button" data-action="openCreateNewCompetition" style="width: 100%; padding: 20px 24px; border-radius: 16px; border: 2px dashed var(--border); background: transparent; color: var(--system-blue); font-size: 17px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px;">
                    <i data-lucide="plus" size="22"></i> ${t.add_new_event}
                </button>
                `}
                `}
            </div>
            <div style="height: 80px;"></div>
            </div>
        `;
        if (view === 'admin-competition-jack-and-jill' && formOpen) {
            const questions = Array.isArray(state.competitionFormQuestions) ? state.competitionFormQuestions : (current && Array.isArray(current.questions) ? current.questions : []);
            setTimeout(() => {
                const container = document.getElementById('comp-questions-container');
                if (container) {
                    container.innerHTML = questions.map((q, i) => `
                        <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: center;">
                            <span style="flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px; background: var(--system-gray6); color: var(--text-secondary); font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center;">${i + 1}</span>
                            <input type="text" value="${String(q || '').replace(/"/g, '&quot;').replace(/</g, '&lt;')}" data-qidx="${i}" oninput="updateCompetitionQuestion(${i}, this.value)" style="flex: 1; min-width: 0; padding: 14px 16px; height: 48px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 16px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--system-blue)'" onblur="this.style.borderColor='var(--border)'">
                            <button type="button" onclick="removeCompetitionQuestion(${i})" title="Remove question" style="flex-shrink: 0; padding: 10px; color: var(--text-secondary); border: none; background: transparent; cursor: pointer; border-radius: 8px; opacity: 0.7; transition: opacity 0.2s, color 0.2s;" onmouseover="this.style.opacity='1'; this.style.color='var(--system-red)'" onmouseout="this.style.opacity='0.7'; this.style.color='var(--text-secondary)'"><i data-lucide="trash-2" size="18"></i></button>
                        </div>
                    `).join('');
                    if (window.lucide) window.lucide.createIcons();
                }
            }, 0);
        }
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
            // Apple-style: No numbers, just a dot.
            badge.textContent = "";
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

        // Handle Multi-Batch Expiration: keep expired packs for display, but balance only counts active
        if (Array.isArray(s.active_packs) && s.active_packs.length > 0) {
            const activeOnly = s.active_packs.filter(p => new Date(p.expires_at) > now);
            const hasUnlimited = activeOnly.some(p => p.count == null || p.count === 'null');
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

window.scheduleTimeBlurSave = (classId, inputEl) => {
    if (inputEl._timeBlurT) clearTimeout(inputEl._timeBlurT);
    inputEl._timeBlurT = setTimeout(() => {
        inputEl._timeBlurT = null;
        if (inputEl.value && document.activeElement !== inputEl) updateClass(classId, 'time', inputEl.value);
    }, 400);
};
window.cancelTimeBlurSave = (inputEl) => {
    if (inputEl._timeBlurT) { clearTimeout(inputEl._timeBlurT); inputEl._timeBlurT = null; }
};

window.selectCustomOption = async (classId, field, value) => {
    // Close dropdown
    document.querySelectorAll('.custom-dropdown-list').forEach(el => el.classList.remove('open'));

    // Update data
    await window.updateClass(classId, field, value);
};

window.signUpStudent = async () => {
    const t = new Proxy(window.t, { get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop] });
    const name = document.getElementById('auth-name').value.trim();
    const usernameEl = document.getElementById('auth-username');
    const username = usernameEl ? usernameEl.value.trim() : '';
    const emailEl = document.getElementById('auth-email');
    const email = emailEl ? emailEl.value.trim() : '';
    const phone = document.getElementById('auth-phone').value.trim();
    const pass = document.getElementById('auth-pass').value.trim();
    const passConfirmEl = document.getElementById('auth-pass-confirm');
    const passConfirm = passConfirmEl ? passConfirmEl.value.trim() : '';

    if (!name || !username || !pass || !phone || !email) {
        alert(t('signup_require_fields'));
        return;
    }
    if (pass !== passConfirm) {
        alert(t('signup_passwords_dont_match'));
        return;
    }

    if (supabaseClient) {
        const { data: usernameTaken } = await supabaseClient.rpc('student_username_exists', {
            p_username: username,
            p_school_id: state.currentSchool.id
        });
        if (usernameTaken) {
            alert(t('username_exists_msg'));
            return;
        }
    }

    const newStudent = {
        id: "STUD-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
        name,
        username: username || null,
        email: email || null,
        phone,
        paid: false,
        package: null,
        balance: 0,
        school_id: state.currentSchool.id,
        created_at: new Date().toISOString()
    };

    let studentCreated = false;
    if (supabaseClient) {
        try {
            // Use username for Auth pseudo-email so it's unique per school (sign-in uses full name + password)
            const pseudoEmail = `${username.replace(/\s+/g, '_').toLowerCase()}+${state.currentSchool.id}@students.bailadmin.local`;
            const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
                email: pseudoEmail,
                password: pass
            });
            if (!signUpError && signUpData?.user) {
                const authUser = signUpData.user;
                // Ensure we have a session so auth.uid() is set for insert/RPC. signUp sometimes doesn't return session; signIn does.
                if (signUpData.session) {
                    await supabaseClient.auth.setSession({
                        access_token: signUpData.session.access_token,
                        refresh_token: signUpData.session.refresh_token
                    });
                } else {
                    const { data: signInData, error: signInErr } = await supabaseClient.auth.signInWithPassword({
                        email: pseudoEmail,
                        password: pass
                    });
                    if (signInErr || !signInData?.session) {
                        console.warn('No session after signUp; signIn failed:', signInErr?.message);
                    }
                }
                // Try RPC first (bypasses RLS, sets user_id) so we don't depend on table insert
                const { data: authRpcRow, error: authRpcError } = await supabaseClient.rpc('create_student_with_auth', {
                    p_user_id: authUser.id,
                    p_name: name,
                    p_username: username || null,
                    p_email: email || null,
                    p_phone: phone || null,
                    p_password: pass,
                    p_school_id: state.currentSchool.id
                });
                if (!authRpcError && authRpcRow) {
                    const created = typeof authRpcRow === 'object' ? authRpcRow : (typeof authRpcRow === 'string' ? JSON.parse(authRpcRow) : null);
                    if (created) {
                        newStudent.id = created.id;
                        newStudent.email = created.email ?? email;
                        newStudent.username = created.username ?? username;
                        newStudent.user_id = created.user_id;
                        studentCreated = true;
                    }
                }
                if (!studentCreated) {
                    const studentToInsert = { ...newStudent, user_id: authUser.id };
                    const { error: insertError } = await supabaseClient.from('students').insert([studentToInsert]);
                    if (!insertError) studentCreated = true;
                }
            }
            if (!studentCreated) {
                // Auth failed (rate limit, etc.) or both inserts failed: create student via legacy RPC (user_id stays NULL)
                const { data: rpcRow, error: rpcError } = await supabaseClient.rpc('create_student_legacy', {
                    p_name: name,
                    p_username: username || null,
                    p_email: email || null,
                    p_phone: phone || null,
                    p_password: pass,
                    p_school_id: state.currentSchool.id
                });
                if (!rpcError && rpcRow) {
                    const created = typeof rpcRow === 'object' ? rpcRow : (typeof rpcRow === 'string' ? JSON.parse(rpcRow) : null);
                    if (created) {
                        newStudent.id = created.id;
                        newStudent.email = created.email ?? email;
                        studentCreated = true;
                    }
                }
            }
            if (!studentCreated) {
                alert("Error creating account: " + (signUpError?.message || "Could not create profile. Try again."));
                return;
            }
            } catch (e) {
                try {
                    const { data: rpcRow, error: rpcError } = await supabaseClient.rpc('create_student_legacy', {
                        p_name: name,
                        p_username: username || null,
                        p_email: email || null,
                        p_phone: phone || null,
                        p_password: pass,
                        p_school_id: state.currentSchool.id
                    });
                if (!rpcError && rpcRow) {
                    const created = typeof rpcRow === 'object' ? rpcRow : (typeof rpcRow === 'string' ? JSON.parse(rpcRow) : null);
                    if (created) {
                        newStudent.id = created.id;
                        newStudent.email = created.email ?? email;
                        studentCreated = true;
                    }
                }
            } catch (_) {}
            if (!studentCreated) {
                alert("Unexpected signup error: " + e.message);
                return;
            }
        }
    } else {
        state.students.push(newStudent);
        studentCreated = true;
    }

    state.currentUser = { ...newStudent, role: 'student' };
    state.isAdmin = false;
    state.currentSchool = state.schools.find(s => s.id === newStudent.school_id) || state.currentSchool;
    state.currentView = 'qr';
    clearSchoolData();
    _lastFetchEndTime = 0;
    saveState();
    fetchAllData();
};

window.loginStudent = async () => {
    const userInput = document.getElementById('auth-name').value.trim();
    const passInput = document.getElementById('auth-pass').value.trim();
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });

    let student;
    if (supabaseClient) {
        try {
            // 1) Sign-in by usuario (username) + password
            if (userInput && passInput) {
                const { data: usernameRows, error: usernameErr } = await supabaseClient.rpc('get_student_by_username_credentials', {
                    p_username: userInput,
                    p_password: passInput,
                    p_school_id: state.currentSchool.id
                });
                if (!usernameErr && Array.isArray(usernameRows) && usernameRows.length > 0) {
                    student = usernameRows[0];
                    const usernameEmail = `${String(student.username).replace(/\s+/g, '_').toLowerCase()}+${state.currentSchool.id}@students.bailadmin.local`;
                    await supabaseClient.auth.signInWithPassword({ email: usernameEmail, password: passInput });
                }
                if (!student) {
                    const { data: nameRows, error: nameErr } = await supabaseClient.rpc('get_student_by_credentials', {
                        p_name: userInput,
                        p_password: passInput,
                        p_school_id: state.currentSchool.id
                    });
                    if (!nameErr && Array.isArray(nameRows) && nameRows.length > 0) student = nameRows[0];
                }
            }
            if (!student) {
                const usernameEmail = `${userInput.replace(/\s+/g, '_').toLowerCase()}+${state.currentSchool.id}@students.bailadmin.local`;
                const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
                    email: usernameEmail,
                    password: passInput
                });
                if (!authError && authData?.user) {
                    const { data: profile } = await supabaseClient
                        .from('students')
                        .select('*')
                        .eq('user_id', authData.user.id)
                        .eq('school_id', state.currentSchool.id)
                        .single();
                    if (profile) student = profile;
                }
            }
        } catch (e) {
            console.warn('Student login error:', e);
        }
    } else {
        student = state.students.find(s =>
            ((s.username && s.username.toLowerCase() === userInput.toLowerCase()) || s.name.toLowerCase() === userInput.toLowerCase()) && s.password === passInput
        );
    }

    if (student) {
        state.currentUser = { ...student, role: 'student' };
        state.isAdmin = false;
        state.currentSchool = state.schools.find(s => s.id === student.school_id) || { id: student.school_id, name: 'School' };
        state.currentView = 'qr';
        clearSchoolData();
        _lastFetchEndTime = 0;
        saveState();
        fetchAllData();
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

    let adminRow = null;
    if (supabaseClient) {
        try {
            const pseudoEmail = `${user.replace(/\s+/g, '_').toLowerCase()}+${state.currentSchool.id}@admins.bailadmin.local`;

            // 1) Try Supabase Auth (for admins who already have user_id set)
            const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
                email: pseudoEmail,
                password: pass
            });

            if (!authError && authData?.user) {
                const { data: row, error: adminError } = await supabaseClient
                    .from('admins')
                    .select('*')
                    .eq('user_id', authData.user.id)
                    .eq('school_id', state.currentSchool.id)
                    .single();
                if (!adminError && row) adminRow = row;
                // Signed in but no admin row by user_id: legacy admin, link this Auth user to their row
                if (!adminRow && user && pass) {
                    const { data: legacyRows, error: rpcError } = await supabaseClient.rpc('get_admin_by_credentials', {
                        p_username: user,
                        p_password: pass,
                        p_school_id: state.currentSchool.id
                    });
                    if (!rpcError && Array.isArray(legacyRows) && legacyRows.length > 0) {
                        adminRow = legacyRows[0];
                        await supabaseClient.rpc('link_admin_auth');
                    }
                }
            } else {
                // 2) Legacy: credentials OK but no Auth user yet – create one and link so is_school_admin() works
                const { data: legacyRows, error: rpcError } = await supabaseClient.rpc('get_admin_by_credentials', {
                    p_username: user,
                    p_password: pass,
                    p_school_id: state.currentSchool.id
                });
                if (!rpcError && Array.isArray(legacyRows) && legacyRows.length > 0) {
                    adminRow = legacyRows[0];
                    const { error: signUpErr } = await supabaseClient.auth.signUp({ email: pseudoEmail, password: pass });
                    if (signUpErr && signUpErr.message && signUpErr.message.includes('already registered')) {
                        const { error: signInAgain } = await supabaseClient.auth.signInWithPassword({ email: pseudoEmail, password: pass });
                        if (!signInAgain) await supabaseClient.rpc('link_admin_auth');
                        else adminRow = null;
                    } else if (!signUpErr) {
                        await supabaseClient.rpc('link_admin_auth');
                    } else {
                        adminRow = null;
                    }
                }
            }
        } catch (e) {
            console.warn('Admin login error:', e);
        }
    }

    if (adminRow) {
        state.currentUser = {
            name: adminRow.username + " (Admin)",
            role: "admin"
        };
        state.isAdmin = true;
        state.currentView = 'admin-students';
        saveState();
        await fetchAllData();
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

window.linkSchoolAdminAccount = async () => {
    const emailEl = document.getElementById('school-admin-link-email');
    const passEl = document.getElementById('school-admin-link-password');
    const email = (emailEl && emailEl.value && emailEl.value.trim()) || '';
    const password = (passEl && passEl.value) || '';
    const adminUsername = (state.currentUser && state.currentUser.name) ? state.currentUser.name.replace(/\s*\(Admin\)\s*$/i, '').trim() : '';
    const schoolId = state.currentSchool?.id;
    if (!email || !password) {
        alert('Please enter both email and your current admin password (the same one you used to log in to this dashboard).');
        return;
    }
    if (!email.includes('@')) {
        alert('Please enter a real email address (e.g. admin@myschool.com), not your username.');
        return;
    }
    if (!adminUsername || !schoolId) {
        alert('Could not detect admin or school. Try refreshing.');
        return;
    }
    if (!supabaseClient) {
        alert('Database connection not initialized.');
        return;
    }
    try {
        const { error: signUpErr } = await supabaseClient.auth.signUp({ email, password });
        if (signUpErr && signUpErr.message && !signUpErr.message.includes('already registered')) {
            alert('Could not create account: ' + (signUpErr.message || ''));
            return;
        }
        if (signUpErr && signUpErr.message && signUpErr.message.includes('already registered')) {
            const { error: signInErr } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (signInErr) {
                alert('That email is already used. Sign in with that email and password, or use a different email here.');
                return;
            }
        }
        const { data: linked, error: rpcErr } = await supabaseClient.rpc('link_school_admin_auth', {
            p_username: adminUsername,
            p_password: password,
            p_school_id: schoolId
        });
        if (rpcErr || !linked) {
            alert('Password did not match. Use the exact same password you used to log in to this dashboard (for ' + adminUsername + ').');
            return;
        }
        state.schoolAdminLinked = true;
        if (emailEl) emailEl.value = '';
        if (passEl) passEl.value = '';
        alert('Account linked. You can use this email and password to log in next time. All features (e.g. Jack and Jill) will work now.');
        await fetchAllData();
        renderView();
    } catch (e) {
        console.error('Link school admin:', e);
        alert('Error: ' + (e.message || 'Could not link account.'));
    }
};

window.linkPlatformAdminAccount = async () => {
    const passEl = document.getElementById('platform-link-password');
    const password = (passEl && passEl.value) || '';
    const platformUsername = (state.currentUser && state.currentUser.name) ? state.currentUser.name.replace(/\s*\(Dev\)\s*$/i, '').trim() : '';
    if (!password) {
        alert('Please enter your current Dev password.');
        return;
    }
    if (!platformUsername) {
        alert('Could not detect platform admin username.');
        return;
    }
    if (!supabaseClient) {
        alert('Database connection not initialized.');
        return;
    }
    const pseudoEmail = `${String(platformUsername).replace(/\s+/g, '_').toLowerCase()}@platform.bailadmin.local`;
    try {
        let { error: signInErr } = await supabaseClient.auth.signInWithPassword({ email: pseudoEmail, password });
        if (signInErr) {
            const { error: signUpErr } = await supabaseClient.auth.signUp({ email: pseudoEmail, password });
            if (signUpErr && !String(signUpErr.message || '').match(/already registered|already exists/i)) {
                alert('Could not create login: ' + (signUpErr.message || ''));
                return;
            }
            if (signUpErr && String(signUpErr.message || '').match(/already registered|already exists/i)) {
                signInErr = (await supabaseClient.auth.signInWithPassword({ email: pseudoEmail, password })).error;
            } else {
                signInErr = signUpErr;
            }
        }
        if (signInErr) {
            alert('Password did not match. Use the exact same password you used to log in here (' + platformUsername + ').');
            return;
        }
        const { data: linked, error: rpcErr } = await supabaseClient.rpc('link_platform_admin_auth', { p_username: platformUsername, p_password: password });
        if (rpcErr || !linked) {
            alert('Password did not match the one in the database. Use the exact same password for ' + platformUsername + '.');
            return;
        }
        state.platformAdminLinked = true;
        if (passEl) passEl.value = '';
        alert('Done! You can now always sign in with "' + platformUsername + '" and your password (no email needed).');
        await fetchPlatformData();
        renderView();
    } catch (e) {
        console.error('Link platform admin:', e);
        alert('Error: ' + (e.message || 'Could not enable username login.'));
    }
};

window.loginDeveloper = async (user, pass) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/554879e0-2f99-4513-aec0-55304c96fd3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:loginDeveloper:entry',message:'loginDeveloper called',data:{userPrefix:(user||'').substring(0,2)+'..',looksLikeEmail:!!(typeof user==='string'&&user.includes('@'))},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    if (!supabaseClient) {
        alert("Database connection not initialized.");
        return;
    }

    state.loading = true;
    renderView();

    // 1) Try Supabase Auth (email + password) if user looks like an email
    const looksLikeEmail = typeof user === 'string' && user.includes('@');
    if (looksLikeEmail) {
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: user,
            password: pass
        });
        if (!authError && authData?.user) {
            state.isPlatformDev = true;
            state.currentUser = { name: authData.user.email + " (Dev)", role: "platform-dev" };
            state.currentView = 'platform-dev-dashboard';
            state.loading = false;
            saveState();
            await fetchPlatformData();
            document.getElementById('dev-login-modal').classList.add('hidden');
            return;
        }
        if (authError) {
            state.loading = false;
            renderView();
            alert("That email isn't linked to a Dev account. Use your username (e.g. Omid7991) and password instead.");
            return;
        }
    }

    // 2) Legacy: check platform_admins table (username + password), then establish Supabase Auth session so is_platform_admin() works
    const { data: legacyRows, error: rpcError } = await supabaseClient.rpc('get_platform_admin_by_credentials', {
        p_username: user,
        p_password: pass
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/554879e0-2f99-4513-aec0-55304c96fd3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:loginDeveloper:afterRpc',message:'after get_platform_admin_by_credentials',data:{hasLegacyRows:!!(legacyRows&&legacyRows.length>0),rpcError:rpcError?String(rpcError.message):null},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    if (!rpcError && Array.isArray(legacyRows) && legacyRows.length > 0) {
        const platformUsername = legacyRows[0].username || user;
        const pseudoEmail = `${String(platformUsername).replace(/\s+/g, '_').toLowerCase()}@platform.bailadmin.local`;
        const errMsg = (e) => (e && e.message ? String(e.message) : '');
        try {
            let { error: signInErr } = await supabaseClient.auth.signInWithPassword({ email: pseudoEmail, password: pass });
            // #region agent log
            const _isInv = signInErr && (errMsg(signInErr).toLowerCase().includes('invalid') || errMsg(signInErr).includes('Invalid login'));
            fetch('http://127.0.0.1:7242/ingest/554879e0-2f99-4513-aec0-55304c96fd3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:loginDeveloper:afterSignIn',message:'after signInWithPassword',data:{signInErr:signInErr?errMsg(signInErr):null,isInvalidCreds:_isInv,pseudoEmail},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
            // #endregion
            const isInvalidCreds = _isInv;
            if (signInErr && isInvalidCreds) {
                const { error: signUpErr } = await supabaseClient.auth.signUp({ email: pseudoEmail, password: pass });
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/554879e0-2f99-4513-aec0-55304c96fd3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:loginDeveloper:afterSignUp',message:'after signUp',data:{signUpErr:signUpErr?errMsg(signUpErr):null},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
                // #endregion
                if (signUpErr && (errMsg(signUpErr).includes('already registered') || errMsg(signUpErr).includes('already exists'))) {
                    signInErr = (await supabaseClient.auth.signInWithPassword({ email: pseudoEmail, password: pass })).error;
                } else {
                    signInErr = signUpErr;
                }
            }
            if (!signInErr) await supabaseClient.rpc('link_platform_admin_auth', { p_username: platformUsername, p_password: pass });
        } catch (e) { console.warn('Platform dev Auth link:', e); }
        const { data: sessionData } = await supabaseClient.auth.getSession();
        // #region agent log
        const _hasSession = !!(sessionData?.session?.user);
        fetch('http://127.0.0.1:7242/ingest/554879e0-2f99-4513-aec0-55304c96fd3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:loginDeveloper:afterGetSession',message:'after getSession',data:{hasSession:_hasSession},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
        if (!sessionData?.session?.user) {
            state.loading = false;
            renderView();
            alert("Your username and password are correct, but we couldn't sign you in to the backend (create/delete schools need that).\n\nUse one of these:\n• Log in with the **email + password** you used in \"Link account\" (e.g. omid@bailadmin.lat).\n• Or use the \"Link account\" card on the dashboard to link this user to a new email and password.");
            return;
        }
        state.isPlatformDev = true;
        state.currentUser = { name: platformUsername + " (Dev)", role: "platform-dev" };
        state.currentView = 'platform-dev-dashboard';
        state.loading = false;
        saveState();
        document.getElementById('dev-login-modal').classList.add('hidden');
        await fetchPlatformData();
        renderView();
        return;
    }

    state.loading = false;
    renderView();
    alert("Invalid Developer credentials.");
};

window.renameSchool = async (schoolId) => {
    const t = typeof window.t === 'function' ? window.t : (key) => (DANCE_LOCALES[state.language] || DANCE_LOCALES.en)[key] || key;
    const schools = state.platformData?.schools || state.schools || [];
    const school = schools.find(s => s.id === schoolId);
    if (!school) return;
    const newName = prompt(t('rename_school_prompt') || t('enter_school_name'), school.name || '');
    if (newName == null || !newName.trim()) return;
    if (!supabaseClient) { alert("No database connection"); return; }
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData?.session?.user) {
        alert("Your Dev session is missing or expired. Log out and log in again with your Dev credentials.");
        return;
    }
    const { data, error } = await supabaseClient.rpc('school_update_by_platform', { p_school_id: schoolId, p_name: newName.trim() });
    if (error) {
        alert("Error: " + (error.message || 'Could not update school name'));
        return;
    }
    const updated = data && (typeof data === 'object' ? data : JSON.parse(data));
    if (state.platformData?.schools) {
        state.platformData.schools = state.platformData.schools.map(s => s.id === schoolId ? { ...s, name: updated?.name || newName } : s);
    }
    if (state.schools) {
        state.schools = state.schools.map(s => s.id === schoolId ? { ...s, name: updated?.name || newName } : s);
    }
    if (state.currentSchool?.id === schoolId) {
        state.currentSchool = { ...state.currentSchool, name: updated?.name || newName };
    }
    alert(t('rename_school_success') || 'School name updated.');
    renderView();
};

window.toggleSchoolJackAndJill = async (schoolId, enabled) => {
    if (!supabaseClient) { alert("No database connection"); return; }
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData?.session?.user) {
        alert("Your Dev session is missing or expired. Log in again with your Dev credentials.");
        return;
    }
    const { data, error } = await supabaseClient.rpc('school_update_jack_and_jill_enabled', { p_school_id: schoolId, p_enabled: !!enabled });
    if (error) {
        alert("Error: " + (error.message || 'Could not update feature'));
        return;
    }
    const updated = data && (typeof data === 'object' ? data : JSON.parse(data));
    if (state.platformData?.schools) {
        state.platformData.schools = state.platformData.schools.map(s => s.id === schoolId ? { ...s, jack_and_jill_enabled: !!enabled } : s);
    }
    if (state.schools) {
        state.schools = state.schools.map(s => s.id === schoolId ? { ...s, jack_and_jill_enabled: !!enabled } : s);
    }
    if (state.currentSchool?.id === schoolId) {
        state.currentSchool = { ...state.currentSchool, jack_and_jill_enabled: !!enabled };
    }
    renderView();
};

window.deleteSchool = async (schoolId, schoolNameParam) => {
    const t = DANCE_LOCALES[state.language] || DANCE_LOCALES.en;
    const schools = state.platformData?.schools || state.schools || [];
    const school = schools.find(s => s.id === schoolId);
    const schoolName = schoolNameParam != null ? String(schoolNameParam) : (school?.name || schoolId);
    if (!confirm(`${t.delete_school_confirm}\n\nSchool: ${schoolName}`)) return;

    try {
        if (!supabaseClient) {
            alert("No database connection");
            return;
        }
        const { data: sessionData } = await supabaseClient.auth.getSession();
        // #region agent log
        const _delHasSession = !!(sessionData?.session?.user);
        const _delLog = {location:'app.js:deleteSchool:sessionCheck',data:{hasSession:_delHasSession},hypothesisId:'del-H1'};
        console.log('[DEBUG deleteSchool session]', _delLog);
        fetch('http://127.0.0.1:7242/ingest/554879e0-2f99-4513-aec0-55304c96fd3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({..._delLog,message:'delete school session check',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (!sessionData?.session?.user) {
            alert("Your Dev session is missing or expired. Log out and log in again with your Dev credentials (username + password, or the email + password you used in \"Link account\") so you have permission to delete schools.");
            return;
        }

        // Use RPC to bypass RLS (platform admin user_id may not be linked for direct table delete)
        const { data: rpcResult, error } = await supabaseClient.rpc('school_delete_by_platform', { p_school_id: schoolId });
        const deletedRows = rpcResult?.deleted ? [{ id: schoolId }] : [];

        // #region agent log
        const _delResLog = {location:'app.js:deleteSchool:afterDelete',data:{error:error?String(error.message):null,deletedCount:deletedRows?deletedRows.length:0},hypothesisId:'del-H2'};
        console.log('[DEBUG deleteSchool result]', _delResLog);
        fetch('http://127.0.0.1:7242/ingest/554879e0-2f99-4513-aec0-55304c96fd3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({..._delResLog,message:'after school delete',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (error) {
            const msg = error.message || '';
            if (msg.includes('Permission denied') && msg.includes('platform admin')) {
                alert('Permission denied. Your platform admin account is not linked to this session.\n\n1. Use the "Enable username login" card on this dashboard to enter your password and link.\n2. Or log out and log in again with your username and password.');
            } else {
                alert(`Error deleting school: ${msg}`);
            }
        } else if (!deletedRows || deletedRows.length === 0) {
            alert('Permission denied. Your platform admin account is not linked to this session.\n\n1. Use the "Enable username login" card on this dashboard to enter your password and link.\n2. Or log out and log in again with your username and password.');
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
            const sessionLinked = !!(uid && admins.some(pa => pa.user_id === uid));
            state.platformAdminLinked = sessionLinked;
        }

        state.loading = false;
        renderView();
    } catch (err) {
        state.loading = false;
        console.error("Error fetching platform data:", err);
        renderView();
    }
}



window.createNewStudent = async () => {
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const name = prompt(t('enter_student_name'));
    const phone = prompt(t('enter_student_phone'));
    const email = prompt(t('enter_student_email') || 'Student email (optional):');
    const pass = prompt(t('enter_student_pass'));
    if (!name || !pass) return;

    if (supabaseClient) {
        const { data: rpcRow, error: rpcError } = await supabaseClient.rpc('create_student_legacy', {
            p_name: name,
            p_username: null,
            p_email: (email && email.trim()) || null,
            p_phone: (phone && phone.trim()) || null,
            p_password: pass,
            p_school_id: state.currentSchool.id
        });
        if (rpcError) { alert("Error: " + (rpcError.message || "Could not create student.")); return; }
        const created = typeof rpcRow === 'object' ? rpcRow : (typeof rpcRow === 'string' ? JSON.parse(rpcRow) : null);
        if (created) {
            state.students.push(created);
            renderView();
            alert(t('student_created'));
            return;
        }
    }
    const newStudent = {
        id: "STUD-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
        name: name,
        email: (email && email.trim()) || null,
        phone: (phone && phone.trim()) || null,
        password: pass,
        paid: false,
        package: null,
        balance: 0,
        school_id: state.currentSchool.id
    };
    state.students.push(newStudent);
    renderView();
    alert(t('student_created'));
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

window.logout = () => {
    state.currentUser = null;
    state.isAdmin = false;
    state.currentView = 'school-selection';
    state.currentSchool = null;
    state.lastActivity = Date.now();
    clearSchoolData();
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
        const prevSchoolId = state.currentSchool?.id;
        state.currentSchool = school;
        state.adminSettings = {};
        state.currentView = 'auth';
        if (prevSchoolId !== id) {
            clearSchoolData();
            _lastFetchEndTime = 0;
        }
        saveState();
        fetchAllData();
    }
};

window.backToSchoolSelection = () => {
    state.currentSchool = null;
    state.isAdmin = false;
    state.currentView = 'school-selection';
    clearSchoolData();
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
    state.currentView = 'platform-add-school';
    renderView();
};

window.submitNewSchoolWithAdmin = async () => {
    const schoolName = document.getElementById('new-school-name').value;
    const adminUser = document.getElementById('new-school-admin-user').value;
    const adminPass = document.getElementById('new-school-admin-pass').value;

    if (!schoolName || !adminUser || !adminPass) {
        alert("Please fill in all fields.");
        return;
    }

    if (!supabaseClient) {
        alert("Database connection not available. Refresh the page and try again.");
        return;
    }

    {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        // #region agent log
        const _hasSession = !!(sessionData?.session?.user);
        const _createLog = {location:'app.js:submitNewSchoolWithAdmin:sessionCheck',data:{hasSession:_hasSession},hypothesisId:'create-H1'};
        console.log('[DEBUG create school session]', _createLog);
        fetch('http://127.0.0.1:7242/ingest/554879e0-2f99-4513-aec0-55304c96fd3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({..._createLog,message:'create school session check',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (!sessionData?.session?.user) {
            alert("Your Dev session is missing or expired. Log out and log in again with your Dev credentials (username + password, or the email + password you used in \"Link account\") so you have permission to create schools.");
            return;
        }
        state.loading = true;
        renderView();

        try {
            // 1. Create School (use RPC to bypass RLS when platform admin user_id may not be linked)
            const { data: schoolRow, error: schoolError } = await supabaseClient.rpc('school_insert_by_platform', { p_name: schoolName });

            // #region agent log
            const _schoolLog = {location:'app.js:submitNewSchoolWithAdmin:schoolInsert',data:{schoolError:schoolError?String(schoolError.message):null,hasSchoolRow:!!schoolRow},hypothesisId:'create-H2'};
            console.log('[DEBUG create school insert]', _schoolLog);
            fetch('http://127.0.0.1:7242/ingest/554879e0-2f99-4513-aec0-55304c96fd3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({..._schoolLog,message:'after school insert',timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            if (schoolError) throw schoolError;
            const schoolId = schoolRow?.id;
            if (!schoolId) throw new Error('School was not created');

            // 2. Create Auth user for admin (pseudo-email) then insert admin with user_id (platform-only RPC for first admin)
            let adminUserId = null;
            const pseudoEmail = `${String(adminUser).replace(/\s+/g, '_').toLowerCase()}+${schoolId}@admins.bailadmin.local`;
            let sessBefore = null;
            try {
                const res = await supabaseClient.auth.getSession();
                sessBefore = res?.data?.session;
                const tempClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
                if (tempClient) {
                    const { data: signUpData, error: signUpErr } = await tempClient.auth.signUp({ email: pseudoEmail, password: adminPass });
                    if (!signUpErr && signUpData?.user) adminUserId = signUpData.user.id;
                }
            } catch (e) { console.warn('Admin Auth signUp:', e); } finally {
                if (sessBefore) await supabaseClient.auth.setSession({ access_token: sessBefore.access_token, refresh_token: sessBefore.refresh_token });
            }
            const adminPayload = { p_school_id: schoolId, p_username: adminUser.trim(), p_password: adminPass };
            if (adminUserId) adminPayload.p_user_id = adminUserId;
            let { error: adminError } = await supabaseClient.rpc('admin_insert_for_school_by_platform', adminPayload);
            if (adminError) {
                const res2 = await supabaseClient.rpc('admin_insert_for_school', adminPayload);
                adminError = res2.error;
            }
            // #region agent log
            const _adminLog = {location:'app.js:submitNewSchoolWithAdmin:adminInsert',data:{adminError:adminError?String(adminError.message):null},hypothesisId:'create-H3'};
            console.log('[DEBUG create admin insert]', _adminLog);
            fetch('http://127.0.0.1:7242/ingest/554879e0-2f99-4513-aec0-55304c96fd3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({..._adminLog,message:'after admin insert',timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            if (adminError) {
                const fallbackPayload = {
                    id: "ADM-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
                    username: adminUser.trim(),
                    password: adminPass,
                    school_id: schoolId
                };
                if (adminUserId) fallbackPayload.user_id = adminUserId;
                const fallback = await supabaseClient.from('admins').insert([fallbackPayload]);
                if (fallback.error) throw adminError;
            }

            // 3. Create Default "Clase Suelta" Pass
            const { error: subError } = await supabaseClient
                .from('subscriptions')
                .insert([{
                    id: "S-" + Date.now(),
                    name: 'Clase Suelta',
                    price: 150,
                    limit_count: 1,
                    school_id: schoolId
                }]);

            if (subError) throw subError;

            alert(`School "${schoolName}" and Admin "${adminUser}" created successfully!`);
            state.currentView = 'platform-dev-dashboard';
            await fetchPlatformData();
        } catch (err) {
            console.error("Creation Error:", err);
            const t = DANCE_LOCALES[state.language] || DANCE_LOCALES.en;
            const msg = err && (err.message || String(err));
            if (msg && msg.includes('Permission denied') && msg.includes('platform admin')) {
                alert('Permission denied. Your platform admin account is not linked to this session.\n\n1. Use the "Enable username login" card on this dashboard to enter your password and link.\n2. Or log out and log in again with your username and password.');
            } else if (msg && msg.includes('admins_username_key')) {
                alert(t.username_exists_msg);
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
    let pkg = state.subscriptions.find(p => p.name.trim().toLowerCase() === String(packageName).trim().toLowerCase());
    if (!pkg && packageName) {
        const numMatch = String(packageName).match(/\d+/);
        const inferredCount = numMatch ? parseInt(numMatch[0], 10) : 1;
        pkg = { name: packageName, limit_count: inferredCount, validity_days: 30 };
    }

    if (!student) {
        console.warn("activatePackage: student not found", studentId);
        return;
    }

    let newBalance;
    const incomingLimit = pkg ? parseInt(pkg.limit_count, 10) : 0;
    const effectiveLimit = isNaN(incomingLimit) ? 0 : incomingLimit;
    const isUnlimited = pkg && effectiveLimit === 0;

    if (!pkg) {
        newBalance = student.balance ?? 0;
    } else if (isUnlimited) {
        newBalance = null;
    } else if (student.balance === null) {
        newBalance = null;
    } else {
        newBalance = (student.balance || 0) + effectiveLimit;
    }

    const days = (pkg && pkg.validity_days && !isNaN(parseInt(pkg.validity_days, 10))) ? parseInt(pkg.validity_days, 10) : 30;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);

    const newPack = {
        id: "PACK-" + Date.now().toString(36).toUpperCase(),
        name: pkg ? pkg.name : packageName,
        count: isUnlimited ? null : effectiveLimit,
        expires_at: expiry.toISOString(),
        created_at: new Date().toISOString()
    };

    const activePacks = Array.isArray(student.active_packs) ? [...student.active_packs] : [];
    if (pkg && (effectiveLimit > 0 || isUnlimited)) activePacks.push(newPack);

    const updates = {
        package: pkg ? pkg.name : null,
        balance: newBalance,
        paid: !!pkg,
        active_packs: activePacks,
        package_expires_at: activePacks.length > 0 ? expiry.toISOString() : null
    };

    if (supabaseClient) {
        const { error: rpcError } = await supabaseClient.rpc('apply_student_package', {
            p_student_id: studentId,
            p_balance: updates.balance,
            p_active_packs: updates.active_packs,
            p_package_expires_at: updates.package_expires_at,
            p_package_name: updates.package,
            p_paid: updates.paid
        });
        if (rpcError) {
            const { error: tableError } = await supabaseClient.from('students').update(updates).eq('id', studentId);
            if (tableError) {
                console.error("Supabase update error:", tableError);
                alert("Error applying package: " + tableError.message);
                return;
            }
        }
    }

    student.package = updates.package;
    student.balance = updates.balance;
    student.paid = updates.paid;
    student.active_packs = updates.active_packs;
    student.package_expires_at = updates.package_expires_at;
    if (state.currentUser && state.currentUser.id === studentId) {
        state.currentUser = { ...state.currentUser, ...updates, role: 'student' };
        saveState();
    }
}

window.openPaymentModal = async (subId) => {
    const sub = state.subscriptions.find(s => s.id === subId);
    if (!sub) return;
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const modal = document.getElementById('payment-modal');
    const content = document.getElementById('payment-modal-content');

    // Load bank details on demand if missing (e.g. student or RPC not run yet)
    const needsBank = !state.adminSettings || (!state.adminSettings.bank_name && !state.adminSettings.bank_cbu);
    if (needsBank && supabaseClient && state.currentSchool) {
        content.innerHTML = `<p class="text-muted">${t('loading')}</p>`;
        modal.classList.remove('hidden');
        const { data: settingsJson } = await supabaseClient.rpc('get_school_admin_settings', { p_school_id: state.currentSchool.id });
        if (settingsJson && typeof settingsJson === 'object') state.adminSettings = settingsJson;
    }

    const bankName = state.adminSettings?.bank_name || 'Bank';
    const bankCbu = state.adminSettings?.bank_cbu || 'N/A';
    const bankAlias = state.adminSettings?.bank_alias || 'N/A';
    const bankHolder = state.adminSettings?.bank_holder || 'N/A';

    content.innerHTML = `
        <div class="payment-modal-header">
            <div class="payment-modal-icon">
                <i data-lucide="credit-card" size="28"></i>
            </div>
            <h2 class="payment-modal-title">${t('payment_instructions')}</h2>
            <div class="payment-modal-package">
                <span class="payment-modal-package-name">${sub.name}</span>
                <span class="payment-modal-package-price">MXD ${sub.price}</span>
            </div>
        </div>
        <div class="payment-modal-bank ios-list">
            <div class="ios-list-item payment-modal-bank-row">
                <span class="payment-modal-label">${t('bank_name_label')}</span>
                <span class="payment-modal-value">${bankName}</span>
            </div>
            <div class="ios-list-item payment-modal-bank-row">
                <span class="payment-modal-label">${t('account_number_label')}</span>
                <span class="payment-modal-value payment-modal-value-monospace">${bankCbu}</span>
            </div>
            <div class="ios-list-item payment-modal-bank-row">
                <span class="payment-modal-label">${t('holder_name_label')}</span>
                <span class="payment-modal-value">${bankHolder}</span>
            </div>
            <div class="ios-list-item payment-modal-bank-row">
                <span class="payment-modal-label">${t('asunto_label')}</span>
                <span class="payment-modal-value">${bankAlias}</span>
            </div>
        </div>
        <div class="payment-modal-actions">
            <button class="btn-primary w-full payment-modal-btn" onclick="submitPaymentRequest('${sub.id}', 'transfer')">
                <i data-lucide="check-circle" size="20"></i>
                ${t('i_have_paid')} (${t('transfer')})
            </button>
            <button class="btn-secondary w-full payment-modal-btn" onclick="submitPaymentRequest('${sub.id}', 'cash')">
                <i data-lucide="banknote" size="20"></i>
                ${t('pay_cash')}
            </button>
            <button class="btn-icon w-full payment-modal-btn payment-modal-close" onclick="document.getElementById('payment-modal').classList.add('hidden')">
                <i data-lucide="x" size="20"></i>
                ${t('close')}
            </button>
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

    if (supabaseClient) {
        // Students cannot insert into payment_requests (RLS); use RPC so request is created.
        const { error } = await supabaseClient.rpc('create_payment_request', {
            p_student_id: state.currentUser.id,
            p_sub_id: String(sub.id),
            p_sub_name: sub.name,
            p_price: sub.price,
            p_payment_method: method,
            p_school_id: state.currentSchool.id
        });
        if (error) {
            const msg = error.message || '';
            if (msg.includes('Could not find the function') || msg.includes('schema cache')) {
                alert("Payment requests are not set up. Please run the Supabase SQL migration:\n\nsupabase/migrations/20260210100000_login_credentials_rpc.sql\n\nin your project's SQL Editor (Dashboard → SQL Editor → New query, paste file contents, Run).");
            } else {
                alert("Error sending request: " + msg);
            }
            return;
        }
    }

    // Refresh local list
    await fetchAllData();

    // Show success message
    const content = document.getElementById('payment-modal-content');
    content.innerHTML = `
        <div class="payment-modal-header">
            <div class="payment-modal-icon" style="background: rgba(52, 199, 89, 0.15); color: var(--system-green);">
                <i data-lucide="check-circle" size="32"></i>
            </div>
            <h2 class="payment-modal-title">${t('request_sent_title')}</h2>
            <p class="text-muted" style="margin: 0 0 1.5rem 0; font-size: 0.95rem; line-height: 1.5;">${t('request_sent_msg')}</p>
            <button class="btn-primary w-full payment-modal-btn" onclick="document.getElementById('payment-modal').classList.add('hidden')">
                <i data-lucide="x" size="20"></i>
                ${t('close')}
            </button>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
};

window.processPaymentRequest = async (id, status) => {
    const req = state.paymentRequests.find(r => r.id === id);
    if (!req) return;

    if (supabaseClient) {
        const { error: rpcError } = await supabaseClient.rpc('update_payment_request_status', { p_request_id: id, p_status: status });
        if (rpcError) {
            const { error: tableError } = await supabaseClient.from('payment_requests').update({ status }).eq('id', id);
            if (tableError) {
                alert("Error processing: " + (tableError.message || rpcError.message));
                return;
            }
        }
        req.status = status;
        saveState();
        renderView();

        if (status === 'approved' && req.student_id && req.sub_name && req.school_id) {
            const { error: activateError } = await supabaseClient.rpc('activate_package_for_student', {
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
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    if (confirm(t('delete_payment_confirm'))) {
        const numId = typeof id === 'string' ? parseInt(id, 10) : id;
        if (supabaseClient) {
            // Prefer RPC so delete works for school admins when RLS would block direct delete (0 rows, no error).
            const { error: rpcError } = await supabaseClient.rpc('delete_payment_request', { p_request_id: numId });
            if (rpcError) {
                const { error: tableError } = await supabaseClient.from('payment_requests').delete().eq('id', numId);
                if (tableError) {
                    alert("Error deleting: " + (tableError.message || rpcError.message));
                    return;
                }
            }
        }
        state.paymentRequests = state.paymentRequests.filter(r => r.id != id);
        saveState();
        renderView();
        window._fetchAllDataNeeded = true;
        fetchAllData();
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
    if (supabaseClient && state.currentSchool?.id) {
        const { error: rpcError } = await supabaseClient.rpc('admin_setting_upsert', {
            p_school_id: state.currentSchool.id,
            p_key: String(key),
            p_value: String(value)
        });
        if (rpcError) {
            const { error: tableError } = await supabaseClient
                .from('admin_settings')
                .upsert({ school_id: state.currentSchool.id, key: String(key), value: String(value) }, { onConflict: 'school_id, key' });
            if (tableError) {
                console.error(`Error updating setting[${key}]: `, tableError);
                throw tableError;
            }
        }
    }
    state.adminSettings[key] = value;
    saveState();
};

window.createNewAdmin = async () => {
    const t = window.t;
    const username = prompt(t('enter_admin_user'));
    if (!username) return;
    const password = prompt(t('enter_admin_pass'));
    if (!password) return;

    if (supabaseClient && state.currentSchool?.id) {
        let userId = null;
        const pseudoEmail = `${String(username).replace(/\s+/g, '_').toLowerCase()}+${state.currentSchool.id}@admins.bailadmin.local`;
        try {
            const tempClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
            if (tempClient) {
                const { data: signUpData, error: signUpErr } = await tempClient.auth.signUp({ email: pseudoEmail, password });
                if (!signUpErr && signUpData?.user) userId = signUpData.user.id;
            }
        } catch (e) { console.warn('Admin Auth signUp:', e); }
        const payload = { p_school_id: state.currentSchool.id, p_username: username, p_password: password };
        if (userId) payload.p_user_id = userId;
        const { data: row, error: rpcError } = await supabaseClient.rpc('admin_insert_for_school', payload);
        if (rpcError) {
            const newId = "ADM-" + Math.random().toString(36).substr(2, 4).toUpperCase();
            const { error } = await supabaseClient.from('admins').insert([{ id: newId, username, password, school_id: state.currentSchool.id }]);
            if (error) { alert(t('error_creating_admin') + " " + (error.message || rpcError.message)); return; }
        }
        alert(t('admin_created'));
        await fetchAllData();
    }
};

window.removeAdmin = async (id) => {
    const t = window.t;
    if (!confirm(t('remove_admin_confirm'))) return;

    if (supabaseClient) {
        const { error: rpcError } = await supabaseClient.rpc('admin_delete_for_school', { p_admin_id: String(id) });
        if (rpcError) {
            const { error } = await supabaseClient.from('admins').delete().eq('id', id);
            if (error) { alert(t('error_removing_admin') + " " + (error.message || rpcError.message)); return; }
        }
        alert(t('admin_removed'));
        await fetchAllData();
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

// Pending class edits: flush after 3s of no typing to avoid refresh interrupting input
let _classUpdatePending = new Map();
let _classUpdateDebounceTimer = null;
const CLASS_UPDATE_DEBOUNCE_MS = 3000;

window.debouncedUpdateClass = (id, field, value) => {
    const cls = state.classes.find(c => c.id === id);
    if (!cls) return;
    state._lastClassEditAt = Date.now();
    const val = (field === 'price' ? parseFloat(value) : value);
    cls[field] = val;
    const key = id + '::' + field;
    _classUpdatePending.set(key, { id, field });
    if (_classUpdateDebounceTimer) clearTimeout(_classUpdateDebounceTimer);
    _classUpdateDebounceTimer = setTimeout(async () => {
        _classUpdateDebounceTimer = null;
        const toFlush = [..._classUpdatePending.values()];
        _classUpdatePending.clear();
        for (const { id: classId, field: fieldName } of toFlush) {
            const c = state.classes.find(x => x.id === classId);
            if (!c) continue;
            await window._doClassUpdateOnly(classId, fieldName, c[fieldName]);
        }
        if (toFlush.length > 0) { saveState(); renderView(); }
    }, CLASS_UPDATE_DEBOUNCE_MS);
};

window._doClassUpdateOnly = async (id, field, value) => {
    const cls = state.classes.find(c => c.id === id);
    if (!cls) return;
    const val = (field === 'price' ? parseFloat(value) : value);
    if (supabaseClient) {
        const { error: rpcError } = await supabaseClient.rpc('class_update_field', { p_id: id, p_field: field, p_value: String(val) });
        if (rpcError) {
            const { error } = await supabaseClient.from('classes').update({ [field]: val }).eq('id', id);
            if (error) { console.error(error); return; }
        }
    }
    cls[field] = val;
};

window.updateClass = async (id, field, value) => {
    const cls = state.classes.find(c => c.id === id);
    if (cls) {
        await window._doClassUpdateOnly(id, field, (field === 'price' ? parseFloat(value) : value));
        saveState();
        renderView();
    }
};

window.addClass = async () => {
    const schoolId = state.currentSchool?.id;
    if (supabaseClient && schoolId) {
        const { data: row, error: rpcError } = await supabaseClient.rpc('class_insert_for_school', {
            p_school_id: schoolId,
            p_name: 'New Class',
            p_day: 'Mon',
            p_time: '09:00',
            p_price: 150,
            p_tag: 'Beginner',
            p_location: 'Studio A'
        });
        if (rpcError) {
            const msg = (rpcError.message || '').toLowerCase();
            const hint = (msg.includes('could not find') || msg.includes('function') || msg.includes('row-level security'))
                ? '\n\nRun the Supabase migration (SQL Editor → paste supabase/migrations/20260210100000_login_credentials_rpc.sql and Run) so Add Class works for admins.'
                : '';
            alert("Error adding class: " + (rpcError.message || 'Unknown error') + hint);
            return;
        }
        if (row) {
            const created = typeof row === 'object' && !Array.isArray(row) ? row : (Array.isArray(row) ? row[0] : null);
            if (created) state.classes.push(created);
            else state.classes.push({ id: state.classes.length + 1, name: 'New Class', day: 'Mon', time: '09:00', price: 150, tag: 'Beginner', location: 'Studio A', school_id: schoolId });
        }
    } else {
        const newId = state.classes.length ? Math.max(...state.classes.map(c => c.id)) + 1 : 1;
        state.classes.push({ id: newId, name: 'New Class', day: 'Mon', time: '09:00', price: 150, tag: 'Beginner', location: 'Studio A', school_id: schoolId });
    }
    saveState();
    renderView();
};

window.removeClass = async (id) => {
    if (supabaseClient) {
        const { error: rpcError } = await supabaseClient.rpc('class_delete_for_school', { p_class_id: id });
        if (rpcError) {
            const { error } = await supabaseClient.from('classes').delete().eq('id', id);
            if (error) { alert("Error removing class: " + error.message); return; }
        }
    }
    state.classes = state.classes.filter(c => c.id !== id);
    saveState();
    renderView();
};

window.updateSub = async (id, field, value) => {
    const sub = state.subscriptions.find(s => s.id === id);
    if (sub) {
        let val;
        if (field === 'price') val = parseFloat(value);
        else if (field === 'limit_count') val = value === '' ? 0 : (parseInt(value, 10) || 0);
        else if (field === 'validity_days') val = parseInt(value, 10) || 30;
        else val = value;
        if (supabaseClient) {
            const { error: rpcError } = await supabaseClient.rpc('subscription_update_field', { p_id: String(id), p_field: field, p_value: String(val) });
            if (rpcError) {
                const { error } = await supabaseClient.from('subscriptions').update({ [field]: val }).eq('id', id);
                if (error) { console.error(error); return; }
            }
        }
        sub[field] = val;
        saveState();
    }
};


window.addSubscription = async () => {
    const schoolId = state.currentSchool?.id;
    if (supabaseClient && schoolId) {
        const { data: row, error: rpcError } = await supabaseClient.rpc('subscription_insert_for_school', {
            p_school_id: schoolId,
            p_name: 'New Plan',
            p_price: 50,
            p_limit_count: 10,
            p_validity_days: 30
        });
        if (rpcError) {
            const msg = (rpcError.message || '').toLowerCase();
            const hint = (msg.includes('could not find') || msg.includes('function') || msg.includes('row-level security'))
                ? '\n\nRun the Supabase migration (SQL Editor → paste supabase/migrations/20260210100000_login_credentials_rpc.sql and Run) so Add Plan works for admins.'
                : '';
            alert("Error adding plan: " + (rpcError.message || 'Unknown error') + hint);
            return;
        }
        if (row) {
            const created = typeof row === 'object' && !Array.isArray(row) ? row : (Array.isArray(row) ? row[0] : null);
            if (created) state.subscriptions.push(created);
            else state.subscriptions.push({ id: 'S' + Date.now(), name: 'New Plan', price: 50, limit_count: 10, validity_days: 30, school_id: schoolId });
        }
    } else {
        state.subscriptions.push({ id: 'S' + Date.now(), name: 'New Plan', price: 50, limit_count: 10, validity_days: 30, school_id: schoolId });
    }
    saveState();
    renderView();
};

window.removeSubscription = async (id) => {
    if (supabaseClient) {
        const { error: rpcError } = await supabaseClient.rpc('subscription_delete_for_school', { p_sub_id: String(id) });
        if (rpcError) {
            const msg = (rpcError.message || '').toLowerCase();
            const hint = (msg.includes('could not find') || msg.includes('function') || msg.includes('row-level security'))
                ? '\n\nRun the Supabase migration (SQL Editor → paste supabase/migrations/20260210100000_login_credentials_rpc.sql and Run) so Remove Plan works for admins.'
                : '';
            alert("Error removing plan: " + (rpcError.message || 'Unknown error') + hint);
            return;
        }
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
                        ${t('remaining_classes')}: <span style="color: var(--system-blue); font-weight: 700;">${(() => {
                        const packs = s.active_packs || [];
                        const now = new Date();
                        const activePacks = packs.filter(p => new Date(p.expires_at) > now);
                        const hasUnlimited = s.balance === null || activePacks.some(p => p.count == null || p.count === 'null');
                        return hasUnlimited ? '∞' : (s.balance ?? 0);
                    })()}</span>
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

    const t = window.t;
    if (!state.isAdmin || !state.currentSchool?.id) return;

    const adminUsername = (state.currentUser?.name || '').replace(/\s*\(Admin\)\s*$/i, '').trim();
    if (!adminUsername) return;

    const adminPassword = prompt(t('admin_pass_req') + '\n' + (t('password_label') || 'Password'));
    if (adminPassword == null) return;

    if (supabaseClient) {
        const { data: adminRows, error } = await supabaseClient.rpc('get_admin_by_credentials', {
            p_username: adminUsername,
            p_password: adminPassword,
            p_school_id: state.currentSchool.id
        });
        if (error || !Array.isArray(adminRows) || adminRows.length === 0) {
            alert(t('invalid_login') || 'Invalid admin password.');
            return;
        }
    } else {
        if (adminPassword !== (state.currentUser?.password)) {
            alert(t('invalid_login') || 'Invalid admin password.');
            return;
        }
    }

    const modal = document.getElementById('student-modal');
    const content = document.getElementById('student-modal-scroll') || document.getElementById('student-modal-content');

    content.innerHTML = `
        <div style="text-align: left; max-width: 100%; min-width: 0;">
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
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">${t('full_name_label')}</label>
                    <input type="text" id="edit-student-name" class="minimal-input" value="${(s.name || '').replace(/"/g, '&quot;')}" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">${t('username')}</label>
                    <input type="text" id="edit-student-username" class="minimal-input" value="${(s.username || '').replace(/"/g, '&quot;')}" placeholder="${t('username')}" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">${t('email_placeholder') || 'Email'}</label>
                    <input type="text" id="edit-student-email" class="minimal-input" value="${(s.email || '').replace(/"/g, '&quot;')}" placeholder="email@example.com" inputmode="email" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">${t('phone')}</label>
                    <input type="text" id="edit-student-phone" class="minimal-input" value="${(s.phone || '').replace(/"/g, '&quot;')}" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">${t('password_label')} (${t('leave_blank_keep') || 'leave blank to keep'})</label>
                    <input type="password" id="edit-student-password" class="minimal-input" placeholder="••••••••" autocomplete="new-password" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">${t('total_classes_label')}</label>
                    <input type="number" id="edit-student-balance" class="minimal-input" value="${s.balance === null ? '' : s.balance}" placeholder="Ilimitado" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.05em;">${t('pack_details_title')}</label>
                    <div style="display: flex; flex-direction: column; gap: 8px; background: var(--system-gray6); border-radius: 14px; padding: 4px;">
                        ${(s.active_packs || []).length > 0 ? s.active_packs.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at)).map(p => `
                            <div style="padding: 12px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 13px; font-weight: 700;">${p.name}</div>
                                    <div style="font-size: 10px; opacity: 0.6; font-weight: 600; text-transform: uppercase;">${(p.count == null || p.count === 'null') ? '∞' : p.count} Clases • ${t.expires_label}: ${new Date(p.expires_at).toLocaleDateString()}</div>
                                </div>
                                <button onclick="window.removeStudentPack('${s.id}', '${p.id}')" style="background: transparent; border: none; color: var(--system-red); padding: 8px; cursor: pointer; opacity: 0.5;">
                                    <i data-lucide="minus-circle" size="16"></i>
                                </button>
                            </div>
                        `).join('').replace(/border-bottom: 1px solid var\(--border\);:last-child/, 'border-bottom: none;') : `<div style="padding: 16px; font-size: 12px; opacity: 0.5; text-align: center;">${t('no_classes_msg')}</div>`}
                    </div>
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">${t('reg_date_label')}</label>
                    <div style="background: var(--system-gray6); padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
                        ${s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                </div>

                <div class="ios-input-group">
                    <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">${t('next_expiry_label')} (Main Timer)</label>
                    <input type="date" id="edit-student-expires" class="minimal-input" value="${s.package_expires_at ? new Date(s.package_expires_at).toISOString().split('T')[0] : ''}" style="background: var(--system-gray6); border: none; width: 100%; box-sizing: border-box;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 2.5rem;">
                <button class="btn-secondary" onclick="document.getElementById('student-modal').classList.add('hidden')" style="height: 50px; border-radius: 14px; font-weight: 600;">${t('cancel')}</button>
                <button class="btn-primary" onclick="window.saveStudentDetails('${s.id}')" style="height: 50px; border-radius: 14px; font-weight: 600;">${t('save_btn')}</button>
            </div>

            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border);">
                <button onclick="window.deleteStudent('${s.id}')" style="background: rgba(255, 59, 48, 0.05); color: var(--system-red); border: none; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 600; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i data-lucide="user-minus" size="14"></i> ${t('delete_perm_label')}
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
    const newUsername = document.getElementById('edit-student-username')?.value.trim() ?? '';
    const newEmail = document.getElementById('edit-student-email')?.value.trim() ?? '';
    const newPhone = document.getElementById('edit-student-phone').value.trim();
    const newPassword = document.getElementById('edit-student-password')?.value ?? '';
    const balanceVal = document.getElementById('edit-student-balance').value;
    const expiresVal = document.getElementById('edit-student-expires').value;

    const updates = {
        name: newName,
        username: newUsername || null,
        email: newEmail || null,
        phone: newPhone,
        balance: balanceVal === "" ? null : parseInt(balanceVal, 10),
        package_expires_at: expiresVal ? new Date(expiresVal).toISOString() : null
    };
    if (newPassword) updates.password = newPassword;

    if (!newName) {
        alert("Nombre is required.");
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

        const config = {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        const scanSuccess = (id) => {
            console.log("QR Scanned successfully. ID:", id);
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.pause(false);
            }
            window.handleScan(id);
        };

        // Try cameras in order: environment (back/rear) first, then user (front) → any available
        const constraints = [
            { facingMode: "environment" },
            { facingMode: "user" },
            { video: true }
        ];
        let lastErr;
        for (const c of constraints) {
            try {
                html5QrCode = new Html5Qrcode("reader");
                await html5QrCode.start(c, config, scanSuccess, () => { });
                return;
            } catch (err) {
                console.warn("Scanner start attempt failed:", c, err);
                lastErr = err;
                if (html5QrCode) {
                    try { await html5QrCode.stop(); } catch (_) {}
                    html5QrCode = null;
                }
            }
        }
        const msg = (lastErr?.message || String(lastErr)).toLowerCase();
        const friendlyMsg = msg.includes("not found") || msg.includes("notfound")
            ? (typeof window.t === 'function' ? window.t('camera_not_found') : "No camera found. Please connect a camera or use a device with a built-in camera.")
            : msg.includes("permission") || msg.includes("denied")
                ? (typeof window.t === 'function' ? window.t('camera_permission_denied') : "Camera access denied. Please allow camera in your browser settings.")
                : "Camera error: " + (lastErr?.message || lastErr);
        alert(friendlyMsg);
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

    const packs = student.active_packs || [];
    const now = new Date();
    const activePacks = packs.filter(p => new Date(p.expires_at) > now);
    const hasUnlimitedPack = activePacks.some(p => p.count == null || p.count === 'null');
    const isUnlimited = student.balance === null || hasUnlimitedPack;
    const hasValidPass = student.paid && (isUnlimited || (student.balance != null && student.balance > 0));
    const hasNoClasses = student.paid && !isUnlimited && (student.balance == null || student.balance < 1);

    if (hasNoClasses) {
        resultEl.innerHTML = `
            <div class="card" style="border-color: var(--system-orange); background: rgba(255, 149, 0, 0.1); padding: 1rem; text-align: center;">
                <h3 style="font-size: 1rem; margin:0;">${student.name}</h3>
                <p style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 0.75rem 0;">${t('no_classes_buy_package')}</p>
                <button class="btn-primary mt-2 w-full" onclick="cancelAttendance()">${t('close')}</button>
            </div>
        `;
    } else if (hasValidPass) {
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

    const packs = student.active_packs || [];
    const now = new Date();
    const activePacks = packs.filter(p => new Date(p.expires_at) > now);
    const hasUnlimitedPack = activePacks.some(p => p.count == null || p.count === 'null');
    const isUnlimited = student.balance === null || hasUnlimitedPack;

    if (!isUnlimited && student.balance !== null && student.balance < count) {
        alert(t('not_enough_balance'));
        return;
    }

    if (!isUnlimited && student.balance !== null) {
        const schoolId = student.school_id || state.currentSchool?.id;
        let updated = false;

        if (supabaseClient && schoolId) {
            const { error: rpcError } = await supabaseClient.rpc('deduct_student_classes', {
                p_student_id: String(studentId),
                p_school_id: schoolId,
                p_count: count
            });
            if (!rpcError) {
                updated = true;
                const now = new Date();
                const activeOnly = (student.active_packs || []).filter(p => new Date(p.expires_at) > now);
                const packs = student.active_packs.slice().sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
                let remaining = count;
                for (const pack of packs) {
                    if (remaining <= 0) break;
                    if (new Date(pack.expires_at) <= now) continue; // skip expired
                    const c = (pack.count || 0);
                    const deduct = Math.min(c, remaining);
                    pack.count = c - deduct;
                    remaining -= deduct;
                }
                student.active_packs = packs.filter(p => (p.count || 0) > 0 || new Date(p.expires_at) <= now);
                student.balance = (student.balance || 0) - count;
            }
        }

        if (!updated) {
            const now = new Date();
            const allPacks = Array.isArray(student.active_packs) ? [...student.active_packs] : [];
            const activePacks = allPacks.filter(p => new Date(p.expires_at) > now).sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
            let remainingToDeduct = count;

            if (activePacks.length > 0) {
                for (let i = 0; i < activePacks.length && remainingToDeduct > 0; i++) {
                    const pack = activePacks[i];
                    const c = pack.count || 0;
                    if (c >= remainingToDeduct) {
                        pack.count = c - remainingToDeduct;
                        remainingToDeduct = 0;
                    } else {
                        remainingToDeduct -= c;
                        pack.count = 0;
                    }
                }
                const expiredPacks = allPacks.filter(p => new Date(p.expires_at) <= now);
                const updatedPacks = [...activePacks.filter(p => (p.count || 0) > 0), ...expiredPacks];
                const newBalance = updatedPacks.filter(p => new Date(p.expires_at) > now).reduce((sum, p) => sum + (parseInt(p.count) || 0), 0);
                if (supabaseClient) {
                    const { error } = await supabaseClient.from('students').update({ balance: newBalance, active_packs: updatedPacks }).eq('id', studentId);
                    if (error) { alert("Error updating balance: " + error.message); return; }
                }
                student.balance = newBalance;
                student.active_packs = updatedPacks;
            } else {
                const newBalance = student.balance - count;
                if (supabaseClient) {
                    const { error } = await supabaseClient.from('students').update({ balance: newBalance }).eq('id', studentId);
                    if (error) { alert("Error updating balance: " + error.message); return; }
                }
                student.balance = newBalance;
            }
        }

        saveState();
        await fetchAllData();
    }

    const newRemaining = isUnlimited ? t('unlimited') : (student.balance ?? 0);
    resultEl.innerHTML = `
        <div class="card" style="border-color: var(--secondary); background: rgba(45, 212, 191, 0.1); padding: 1rem; text-align:center;">
             <i data-lucide="check-circle" size="32" style="color: var(--secondary)"></i>
             <div style="font-weight:700; color:var(--secondary)">${t('attendance_success')}</div>
             <div style="font-size:0.9rem; margin-top:0.25rem">${student.name} &minus;${count} ${count === 1 ? t('class_unit') : t('classes_unit')}</div>
             <div style="font-size:0.85rem; font-weight:600; color:var(--text-secondary); margin-top:0.5rem">${t('remaining_classes')}: ${newRemaining}</div>
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
        if (target.id === 'auth-pass' || target.id === 'auth-pass-confirm') {
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
        const view = btn.getAttribute('data-view');
        state.currentView = view;
        if (view !== 'admin-competition-jack-and-jill' && view !== 'student-competition-register') {
            window.location.hash = '';
        }
        saveState();
        renderView();
        if (view === 'qr' && state.currentUser && !state.isAdmin && state.currentUser.id && (state.currentUser.school_id || state.currentSchool?.id) && supabaseClient) {
            fetchAllData();
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
    lucide.createIcons();
});

// Admin toggle (Logo hold) & Logo Click Logout
let logoPressTimer;
let superAdminTimer;
let isLongPress = false;

const logoEl = document.querySelector('.logo');
logoEl.addEventListener('mousedown', () => {
    isLongPress = false;
    logoPressTimer = setTimeout(() => {
        isLongPress = true;
        state.isAdmin = !state.isAdmin;
        state.currentView = state.isAdmin ? 'admin-students' : 'schedule';
        renderView();
    }, 2000);
    superAdminTimer = setTimeout(() => {
        isLongPress = true;
        state.currentView = 'super-admin-dashboard';
        renderView();
    }, 5000);
});

logoEl.addEventListener('mouseup', () => {
    clearTimeout(logoPressTimer);
    clearTimeout(superAdminTimer);
});

logoEl.addEventListener('click', () => {
    if (!isLongPress) {
        window.logout();
    }
});

// Global User Activity Listeners (Auto-Logout)
['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
    window.addEventListener(evt, window.resetInactivityTimer, { passive: true });
});

// Initial Load
// --- SEED DATA (Temporary) ---


(function init() {
    const local = localStorage.getItem('dance_app_state');
    const saved = local ? JSON.parse(local) : {};
    if (local) {
        state.language = saved.language || 'en';
        state.theme = saved.theme || 'dark';
        if (saved.currentUser) state.currentUser = saved.currentUser;
        if (saved.isAdmin !== undefined) state.isAdmin = saved.isAdmin;
        if (saved.isPlatformDev !== undefined) state.isPlatformDev = saved.isPlatformDev;
        if (saved.currentView) state.currentView = saved.currentView;
        if (saved.scheduleView) state.scheduleView = saved.scheduleView;
        if (saved.lastActivity) state.lastActivity = saved.lastActivity;
        if (saved.currentSchool) state.currentSchool = saved.currentSchool;
        // Never show another school's data: if we have a logged-in student, force school to their school
        if (saved.currentUser?.school_id && !saved.isAdmin) {
            const match = saved.currentSchool && saved.currentSchool.id === saved.currentUser.school_id;
            state.currentSchool = match ? saved.currentSchool : { id: saved.currentUser.school_id, name: saved.currentSchool?.name || 'School' };
        }
    }

    // Check if session expired while away
    window.checkInactivity();

    // Hash routing: if URL has competition route, apply it and overwrite state
    if (window.location.hash) {
        parseHashRoute();
    }
    if (saved.currentView && saved.currentView.startsWith('admin-competition') && !window.location.hash) {
        state.competitionId = saved.competitionId || null;
        state.competitionSchoolId = saved.competitionSchoolId || null;
        state.competitionTab = saved.competitionTab || 'edit';
    }
    if (saved.currentView && saved.currentView === 'student-competition-register' && !window.location.hash) {
        state.competitionId = saved.competitionId || null;
    }
    // Student refresh fix: if student refreshes while on QR, avoid restoring competition form (hash would be empty)
    if (saved.currentUser && !saved.isAdmin && saved.currentView === 'student-competition-register' && !window.location.hash) {
        state.currentView = 'qr';
        state.competitionId = null;
        state.studentCompetitionDetail = null;
        state.studentCompetitionRegDetail = null;
    }

    // SECURITY: Never show admin views to students - prevents access to admin dashboard on reload or shared URLs
    const isStudent = state.currentUser && state.currentUser.school_id && state.currentUser.role !== 'admin' && state.currentUser.role !== 'platform-dev' && !state.isPlatformDev;
    const adminViews = ['admin-competition-jack-and-jill', 'admin-students', 'admin-scanner', 'admin-memberships', 'admin-revenue', 'admin-settings'];
    const isAdminView = adminViews.includes(state.currentView) || (state.currentView && state.currentView.startsWith('admin-'));
    if (isStudent && isAdminView) {
        state.isAdmin = false;
        state.currentView = (saved.currentView === 'qr' || saved.currentView === 'shop' || saved.currentView === 'schedule') ? saved.currentView : 'qr';
        state.competitionId = null;
        state.competitionSchoolId = null;
        state.competitionTab = 'edit';
        window.location.hash = '';
        if (local) saveState();
    }

    updateI18n();
    document.body.setAttribute('data-theme', state.theme);
    document.body.classList.toggle('dark-mode', state.theme === 'dark');
    renderView();
    if (window.lucide) lucide.createIcons();

    window.addEventListener('hashchange', () => {
        if (parseHashRoute()) {
            saveState();
            renderView();
        }
    });

    document.addEventListener('click', (e) => {
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
                renderView();
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

    // Fetch live data from Supabase
    fetchAllData();

    // Background Sync: Refresh every 2 minutes (less aggressive to avoid overwriting state / race conditions)
    setInterval(() => {
        const isFocussed = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '');
        const isModalOpen = document.querySelector('.modal:not(.hidden)');
        const isEditingClasses = state.currentView === 'admin-settings';
        const recentlyEditedClass = state._lastClassEditAt && (Date.now() - state._lastClassEditAt < 15000);

        if (state.currentUser && !isFocussed && !isModalOpen && !isEditingClasses && !recentlyEditedClass) {
            fetchAllData();
        }
    }, 120000);

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
