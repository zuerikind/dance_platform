
// --- TRANSLATIONS ---
const translations = {
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
        auth_title: "Elevate Your Dance",
        student_signup: "New Student",
        admin_login: "Staff Login",
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
        phone: "Phone Number"
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
        auth_title: "Eleva tu Baile",
        student_signup: "Nuevo Alumno",
        admin_login: "Personal",
        enter_name: "¿Cómo te llamas?",
        signup_btn: "Unirme Ahora",
        logout: "Cerrar Sesión",
        admin_subtitle: "Gestiona tu academia",
        classes_subtitle: "Próximas sesiones y talleres",
        username: "Usuario",
        password: "Password",
        login_btn: "Entrar",
        invalid_login: "Credenciales inválidas",
        remaining_classes: "Clases Restantes",
        unlimited: "Ilimitado",
        already_account: "¿Ya tienes cuenta?",
        no_account: "¿No tienes cuenta?",
        sign_in: "Entrar",
        sign_up: "Registrarse",
        student_login: "Acceso Alumno",
        phone: "Teléfono"
    }
};

const APP_VERSION = '1.6';

// --- MOCK DATA ---
const initialState = {
    version: APP_VERSION,
    currentUser: null,
    classes: [
        { id: 1, name: "Contemporary Flow", day: "Mon", time: "18:00", price: 15, tag: "Level 1" },
        { id: 2, name: "Urban Hip Hop", day: "Tue", time: "19:30", price: 20, tag: "Level 2" },
        { id: 3, name: "Salsa & Bachata", day: "Thu", time: "20:00", price: 18, tag: "All Levels" }
    ],
    subscriptions: [
        { id: "S1", name: "10 Class Pass", price: 120, duration: "Valid for 3 months", limit: 10 },
        { id: "S2", name: "Unlimited Access", price: 180, duration: "Billed monthly", limit: null }
    ],
    students: [
        { id: "STUD-A1B2", name: "Elena Martinez", phone: "+1 234 567 890", password: "password123", paid: true, package: "Unlimited Access", balance: null },
        { id: "STUD-C3D4", name: "Marcus Stone", phone: "+1 987 654 321", password: "password123", paid: false, package: null, balance: 0 }
    ],
    language: 'en',
    currentView: 'auth',
    authMode: 'login', // 'login' or 'signup'
    theme: 'dark',
    isAdmin: false
};

let localData = localStorage.getItem('dance_app_state');
let state;

if (localData) {
    state = JSON.parse(localData);
    if (state.version !== APP_VERSION) {
        // Migration: Preserve all studio data (students, classes, subscriptions)
        const preservedStudents = (state.students || []).map(s => ({
            ...s,
            password: s.password || "password123",
            phone: s.phone || "No Phone"
        }));

        state = {
            ...initialState,
            students: preservedStudents.length > 0 ? preservedStudents : initialState.students,
            classes: (state.classes && state.classes.length > 0) ? state.classes : initialState.classes,
            subscriptions: (state.subscriptions && state.subscriptions.length > 0) ? state.subscriptions : initialState.subscriptions,
            language: state.language || 'en',
            theme: state.theme || 'dark'
        };
        saveState();
    }
} else {
    state = initialState;
}

// --- LOGIC ---
function saveState() {
    localStorage.setItem('dance_app_state', JSON.stringify(state));
}

function updateI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[state.language][key];
    });
    document.getElementById('lang-text').textContent = state.language.toUpperCase();
}

function renderView() {
    const root = document.getElementById('app-root');
    const view = state.currentView;
    const t = translations[state.language];

    let html = `<div class="container slide-in">`;

    if (view === 'auth') {
        const isSignup = state.authMode === 'signup';
        html += `
            <div class="text-center slide-in" style="padding-top: 4rem;">
                <div style="margin-bottom: 3rem;">
                    <div style="width: 80px; height: 80px; background: var(--text); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <i data-lucide="sparkles" size="40" style="color: var(--background)"></i>
                    </div>
                </div>
                <h1 style="margin-bottom: 0.5rem; letter-spacing: -0.04em;">${t.auth_title}</h1>
                <p class="text-muted" style="margin-bottom: 3rem; font-size: 1.1rem;">Precision in every step.</p>
                
                <div class="card" style="max-width: 440px; margin: 0 auto; border-radius: 30px; border: 1px solid var(--border);">
                    <h3 style="margin-bottom: 2rem; font-weight: 600; font-size: 1.5rem;">${isSignup ? t.student_signup : t.student_login}</h3>
                    <div style="display:flex; flex-direction:column; gap:1rem;">
                        <input type="text" id="auth-name" class="glass-input" placeholder="${t.username}">
                        ${isSignup ? `<input type="text" id="auth-phone" class="glass-input" placeholder="${t.phone}">` : ''}
                        <input type="password" id="auth-pass" class="glass-input" placeholder="${t.password}">
                        
                        <button class="btn-primary w-full" onclick="${isSignup ? 'signUpStudent()' : 'loginStudent()'}" style="justify-content:center; padding: 1.2rem; font-size: 1rem; margin-top: 0.5rem;">
                            ${isSignup ? t.signup_btn : t.sign_in}
                        </button>

                        <button class="btn-icon w-full" onclick="switchAuthMode()" style="justify-content:center; font-size:0.9rem; color:var(--accent); font-weight: 500;">
                            ${isSignup ? t.already_account : t.no_account} ${isSignup ? t.sign_in : t.sign_up}
                        </button>
                    </div>
                </div>

                <div style="margin-top: 4rem;">
                    <button class="btn-icon" onclick="showAdminFields()" id="admin-show-btn" style="margin: 0 auto; color: var(--text-muted);">
                        Staff Access
                    </button>
                    <div id="admin-fields" class="hidden" style="margin-top:1rem; display:flex; flex-direction:column; gap:1rem; max-width: 320px; margin-left: auto; margin-right: auto;">
                        <input type="text" id="admin-user" class="glass-input" placeholder="${t.username}" style="padding: 0.8rem;">
                        <input type="password" id="admin-pass" class="glass-input" placeholder="${t.password}" style="padding: 0.8rem;">
                        <button class="btn-primary w-full" onclick="loginAdminWithCreds()" style="justify-content:center; padding:0.8rem;">
                            ${t.login_btn}
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else if (view === 'schedule') {
        html += `<h1 style="margin-bottom: 0.5rem;">${t.schedule_title}</h1>`;
        html += `<p class="text-muted" style="margin-bottom: 3.5rem; font-size: 1.1rem;">${t.classes_subtitle}</p>`;
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">`;
        state.classes.forEach(c => {
            html += `
                <div class="card" style="padding: 2rem; border-radius: 24px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 1.5rem;">
                        <span style="background: var(--text); color: var(--background); padding: 0.4rem 1rem; border-radius: 40px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${c.tag || 'Class'}</span>
                        <span style="font-weight: 600; font-size: 1.1rem;">$${c.price}</span>
                    </div>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; letter-spacing: -0.02em;">${c.name}</h3>
                    <div class="text-muted" style="display:flex; align-items:center; gap:0.5rem; font-size: 1rem;">
                        <i data-lucide="calendar" size="16"></i> ${c.day} • <i data-lucide="clock" size="16"></i> ${c.time}
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    } else if (view === 'shop') {
        html += `<h1>${t.shop_title}</h1>`;
        html += `<p class="text-muted" style="margin-bottom: 3.5rem; font-size: 1.1rem;">Select your preferred membership plan.</p>`;
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;">`;
        state.subscriptions.forEach(s => {
            html += `
                <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-radius: 24px;">
                    <div>
                        <h3 style="font-size: 1.6rem; margin-bottom: 1rem;">${s.name}</h3>
                        <p class="text-muted" style="margin-bottom: 2rem; min-height: 40px;">${s.duration}</p>
                        <div style="font-size: 3rem; font-weight: 700; margin-bottom: 2rem; letter-spacing: -0.04em;">$${s.price}</div>
                    </div>
                    <button class="btn-primary w-full" onclick="buySubscription('${s.id}')" style="justify-content:center; padding: 1.2rem; font-size: 1rem;">${t.buy}</button>
                </div>
            `;
        });
        html += `</div>`;
    } else if (view === 'qr') {
        html += `
            <div class="text-center">
                <h1 style="margin-bottom: 0.5rem;">${t.qr_title}</h1>
                <p class="text-muted" style="margin-bottom: 2rem;">${t.qr_subtitle}</p>
                <div class="qr-outer"><div id="qr-code"></div></div>
                <div style="margin-top: 2rem;">
                    <div class="card" style="display:inline-block; padding: 1rem 2rem; border-radius: 50px; margin-bottom: 1rem;">
                        <span class="text-muted">${t.student_id}:</span> <strong>${state.currentUser.id}</strong>
                    </div>
                    <div class="card" style="max-width: 320px; margin: 0 auto; padding: 1.5rem; border-radius: 24px;">
                        <div class="text-muted" style="font-size: 0.9rem; margin-bottom: 0.5rem;">${t.remaining_classes}</div>
                        <div style="font-size: 2.5rem; font-weight: 700; letter-spacing: -0.04em; color: var(--primary);">
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
        html += `<h1 style="margin-bottom: 4rem; text-align: center;">${t.admin_title}</h1>`;
        state.students.forEach(s => {
            html += `
                <div class="card" style="padding: 2.5rem; border-radius: 30px;">
                    <div style="display:grid; grid-template-columns: 1fr auto; align-items: start; gap: 2rem;">
                        <div>
                            <div style="display:flex; align-items:center; gap:1rem; margin-bottom: 0.5rem;">
                                <h3 style="font-size: 1.8rem; font-weight: 700; letter-spacing: -0.03em;">${s.name}</h3>
                                <span style="background: ${s.paid ? 'rgba(45, 212, 191, 0.1)' : 'rgba(251, 113, 133, 0.1)'}; color: ${s.paid ? 'var(--secondary)' : 'var(--danger)'}; padding: 0.2rem 0.8rem; border-radius: 40px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">${s.paid ? 'Active' : 'Unpaid'}</span>
                            </div>
                            <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 0.5rem;">${s.id}</p>
                            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.5rem;"><i data-lucide="phone" size="14"></i> ${s.phone || 'No Phone'}</p>
                            
                            <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem;">
                                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                                    <span class="text-muted" style="font-size: 0.8rem; font-weight: 600;">Membership Plan</span>
                                    <select class="glass-input" onchange="activatePackage('${s.id}', this.value)" style="padding: 0.8rem 1.2rem; border-radius: 12px;">
                                        <option value="">No Active Plan</option>
                                        ${state.subscriptions.map(sub => `<option value="${sub.name}" ${s.package === sub.name ? 'selected' : ''}>${sub.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                                    <span class="text-muted" style="font-size: 0.8rem; font-weight: 600;">Classes Left</span>
                                    <div style="display:flex; align-items:center; background: var(--background); padding: 0.8rem 1.2rem; border-radius: 12px; border: 1px solid var(--border);">
                                        <input type="number" value="${s.balance === null ? '' : s.balance}" placeholder="∞" onchange="updateBalance('${s.id}', this.value)" style="width: 100%; border:none; background:transparent; color: var(--primary); font-size:1.2rem; font-weight: 700; text-align: left; outline:none;">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-end;">
                            <button class="btn-primary" onclick="togglePayment('${s.id}')" style="justify-content: center; font-size: 0.8rem; padding: 0.6rem 1.5rem;">
                                ${s.paid ? 'Mark Unpaid' : 'Mark Paid'}
                            </button>
                            <button class="btn-icon" onclick="deleteStudent('${s.id}')" style="color: var(--danger); opacity: 0.3; margin-top: auto;">
                                <i data-lucide="trash-2" size="20"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } else if (view === 'admin-scanner') {
        html += `
            <div class="text-center">
                <h1>${t.nav_scan}</h1>
                <p class="text-muted" style="margin-bottom: 4rem;">Verify student entrance precision.</p>
                <div class="card" style="max-width: 440px; margin: 0 auto; border-radius: 30px;">
                    <div style="width: 120px; height: 120px; background: var(--background); border-radius: 30px; margin: 0 auto 2rem; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                         <i data-lucide="camera" size="48"></i>
                    </div>
                    <button class="btn-primary w-full" onclick="startScanner()" style="justify-content:center; padding: 1.5rem; font-size: 1.1rem;">
                        Initiate Portal Scan
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
                    <h3 style="font-size: 1.4rem;">Classes</h3>
                    <button class="btn-primary" onclick="addClass()" style="padding: 0.5rem 1.2rem; font-size: 0.8rem;">
                        <i data-lucide="plus" size="14"></i> Add
                    </button>
                </div>
                <div class="mt-4">
        `;
        state.classes.forEach(c => {
            html += `
                <div class="settings-group" style="margin-bottom: 1rem;">
                    <input type="text" class="glass-input" value="${c.name}" onchange="updateClass(${c.id}, 'name', this.value)" placeholder="Name">
                    <input type="text" class="glass-input" value="${c.day || ''}" onchange="updateClass(${c.id}, 'day', this.value)" placeholder="Day">
                    <input type="text" class="glass-input" value="${c.time || ''}" onchange="updateClass(${c.id}, 'time', this.value)" placeholder="Time">
                    <button class="btn-icon" onclick="removeClass(${c.id})" style="color: var(--danger)"><i data-lucide="trash-2" size="18"></i></button>
                </div>
            `;
        });
        html += `</div></div>`;

        html += `
            <div class="card" style="border-radius: 24px; margin-top: 2rem;">
                <div class="settings-header" style="margin-bottom: 2rem;">
                    <h3 style="font-size: 1.4rem;">Plans</h3>
                    <button class="btn-primary" onclick="addSubscription()" style="padding: 0.5rem 1.2rem; font-size: 0.8rem;">
                        <i data-lucide="plus" size="14"></i> Add
                    </button>
                </div>
                <div class="mt-4">
        `;
        state.subscriptions.forEach(s => {
            html += `
                <div class="settings-group" style="grid-template-columns: 2fr 1fr auto; margin-bottom: 1rem;">
                    <input type="text" class="glass-input" value="${s.name}" onchange="updateSub('${s.id}', 'name', this.value)" placeholder="Plan Name">
                    <input type="number" class="glass-input" value="${s.price}" onchange="updateSub('${s.id}', 'price', this.value)" placeholder="$">
                    <button class="btn-icon" onclick="removeSubscription('${s.id}')" style="color: var(--danger)"><i data-lucide="trash-2" size="18"></i></button>
                </div>
            `;
        });
        html += `</div></div>`;
    }

    html += `<div class="text-center" style="font-size: 0.75rem; color: var(--text-muted); padding: 4rem 0; letter-spacing: 0.1em; opacity: 0.5;">DANCESTEP INDUSTRIAL v${APP_VERSION}</div>`;
    html += `</div>`;
    root.innerHTML = html;
    lucide.createIcons();

    // Global UI Updates
    document.getElementById('logout-btn').classList.toggle('hidden', state.currentUser === null);
    document.getElementById('student-nav').classList.toggle('hidden', state.currentUser === null || state.isAdmin);
    document.getElementById('admin-nav').classList.toggle('hidden', state.currentUser === null || !state.isAdmin);
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

window.signUpStudent = () => {
    const name = document.getElementById('auth-name').value.trim();
    const phone = document.getElementById('auth-phone').value.trim();
    const pass = document.getElementById('auth-pass').value.trim();
    const t = translations[state.language];

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
        balance: 0
    };
    state.students.push(newStudent);
    state.currentUser = { ...newStudent, role: 'student' };
    state.isAdmin = false;
    state.currentView = 'qr';
    saveState();
    renderView();
};

window.loginStudent = () => {
    const name = document.getElementById('auth-name').value.trim();
    const pass = document.getElementById('auth-pass').value.trim();
    const t = translations[state.language];

    const student = state.students.find(s =>
        s.name.toLowerCase() === name.toLowerCase() && s.password === pass
    );

    if (student) {
        state.currentUser = { ...student, role: 'student' };
        state.isAdmin = false;
        state.currentView = 'schedule';
        saveState();
        renderView();
    } else {
        alert(t.invalid_login);
    }
};

window.deleteStudent = (id) => {
    if (confirm("Are you sure you want to remove this student? All their progress will be lost.")) {
        state.students = state.students.filter(s => s.id !== id);
        saveState();
        renderView();
    }
};

window.loginAdminWithCreds = () => {
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    const t = translations[state.language];

    if (user === "Omid" && pass === "royal") {
        state.currentUser = { name: "Omid (Admin)", role: "admin" };
        state.isAdmin = true;
        state.currentView = 'admin-students';
        saveState();
        renderView();
    } else {
        alert(t.invalid_login);
    }
};

window.logout = () => {
    state.currentUser = null;
    state.isAdmin = false;
    state.currentView = 'auth';
    saveState();
    renderView();
};

window.togglePayment = (id) => {
    const student = state.students.find(s => s.id === id);
    if (student) {
        student.paid = !student.paid;
        saveState();
        renderView();
    }
};

window.activatePackage = (studentId, packageName) => {
    const student = state.students.find(s => s.id === studentId);
    const pkg = state.subscriptions.find(p => p.name === packageName);
    if (student) {
        student.package = packageName;
        student.balance = pkg ? pkg.limit : 0;
        student.paid = !!pkg;
        saveState();
        renderView();
    }
};

window.updateBalance = (studentId, value) => {
    const student = state.students.find(s => s.id === studentId);
    if (student) {
        student.balance = value === "" ? null : parseInt(value);
        saveState();
        renderView();
    }
};

window.updateClass = (id, field, value) => {
    const cls = state.classes.find(c => c.id === id);
    if (cls) { cls[field] = field === 'price' ? parseFloat(value) : value; saveState(); }
};

window.addClass = () => {
    const newId = state.classes.length ? Math.max(...state.classes.map(c => c.id)) + 1 : 1;
    state.classes.push({ id: newId, name: "New Class", day: "Mon", time: "09:00", price: 10, tag: "Beginner" });
    saveState();
    renderView();
};

window.removeClass = (id) => {
    state.classes = state.classes.filter(c => c.id !== id);
    saveState();
    renderView();
};

window.updateSub = (id, field, value) => {
    const sub = state.subscriptions.find(s => s.id === id);
    if (sub) { sub[field] = field === 'price' ? parseFloat(value) : value; saveState(); }
};

window.addSubscription = () => {
    const newId = "S" + (state.subscriptions.length + 1);
    state.subscriptions.push({ id: newId, name: "New Plan", price: 50, duration: "30 days" });
    saveState();
    renderView();
};

window.removeSubscription = (id) => {
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

        // Stop any existing instance
        if (html5QrCode) {
            await html5QrCode.stop().catch(() => { });
        }

        html5QrCode = new Html5Qrcode("reader");

        const config = {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (id) => {
                handleScan(id);
                stopScanner();
            },
            (errorMessage) => {
                // Ignore frequent "No QR code detected" logs
            }
        ).catch(err => {
            console.error("Scanner start error:", err);
            // Fallback to any available camera if environment fails
            html5QrCode.start({ facingMode: "user" }, config, (id) => {
                handleScan(id);
                stopScanner();
            });
        });
    } catch (err) {
        console.error("Scanner setup error:", err);
        alert("Camera access denied or error: " + err);
    }
};

window.stopScanner = async () => {
    if (html5QrCode && html5QrCode.isScanning) {
        await html5QrCode.stop().then(() => {
            document.getElementById('scanner-modal').classList.add('hidden');
        }).catch(err => console.error(err));
    } else {
        document.getElementById('scanner-modal').classList.add('hidden');
    }
};

window.handleScan = (id) => {
    const student = state.students.find(s => s.id === id);
    const resultEl = document.getElementById('scan-result');
    const t = translations[state.language];

    // Check if student has valid pass (unlimited OR balance > 0)
    const hasValidPass = student && student.paid && (student.balance === null || student.balance > 0);

    if (hasValidPass) {
        // Decrement balance if it's a limited pass
        if (student.balance !== null) {
            student.balance -= 1;
            saveState();
        }

        resultEl.innerHTML = `< div class="card slide-in" style = "border-color: var(--secondary); background: rgba(45, 212, 191, 0.1)" >
            <h2 style="color: var(--secondary)">${t.scan_success}</h2>
            <p style="margin-top:0.5rem">${student.name}</p>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.5rem;">
                ${t.remaining_classes}: ${student.balance === null ? t.unlimited : student.balance}
            </p>
        </div > `;
    } else {
        resultEl.innerHTML = `< div class="card slide-in" style = "border-color: var(--danger); background: rgba(251, 113, 133, 0.1)" >
            <h2 style="color: var(--danger)">${t.scan_fail}</h2>
            <p style="margin-top:0.5rem">${student ? student.name : 'Not Found'}</p>
            ${student && student.package ? `<p style="font-size:0.8rem; color:var(--danger)">No classes remaining</p>` : ''}
        </div > `;
    }
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
        renderView();
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
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
document.querySelector('.logo').addEventListener('mousedown', () => {
    logoPressTimer = setTimeout(() => {
        state.isAdmin = !state.isAdmin;
        state.currentView = state.isAdmin ? 'admin-students' : 'schedule';
        renderView();
    }, 2000);
});
document.querySelector('.logo').addEventListener('mouseup', () => clearTimeout(logoPressTimer));

updateI18n();
document.body.setAttribute('data-theme', state.theme);
document.body.classList.toggle('dark-mode', state.theme === 'dark');
renderView();
if (window.lucide) lucide.createIcons();
