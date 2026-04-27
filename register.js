//-------------SESSION REDIRECT-------------
if (localStorage.getItem('session')) {
    window.location.href = 'UserPage.html';
}

//-------------HELPERS-------------
const show = (id) => document.getElementById(id).style.display = 'flex';
const hide = (id) => document.getElementById(id).style.display = 'none';
const err  = (id, msg) => document.getElementById(id).textContent = msg;
const clearErr = (id) => document.getElementById(id).textContent = '';

//-------------TOGGLE FORMS-------------
document.getElementById('showLogin').addEventListener('click', () => {
    show('loginForm');
    hide('registerForm');
    clearErr('loginError');
});

document.getElementById('showRegister').addEventListener('click', () => {
    show('registerForm');
    hide('loginForm');
    clearErr('registerError');
});

document.getElementById('switchToRegister').addEventListener('click', () => {
    show('registerForm');
    hide('loginForm');
    clearErr('registerError');
});

document.getElementById('switchToLogin').addEventListener('click', () => {
    show('loginForm');
    hide('registerForm');
    clearErr('loginError');
});

//-------------REGISTER-------------
document.getElementById('registerBtn').addEventListener('click', () => {
    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm  = document.getElementById('regPasswordConfirm').value;

    clearErr('registerError');

    if (!name)               { err('registerError', 'Ingresa tu nombre.'); return; }
    if (!email)              { err('registerError', 'Ingresa tu correo.'); return; }
    if (!password)           { err('registerError', 'Ingresa una contraseña.'); return; }
    if (password.length < 6) { err('registerError', 'La contraseña debe tener al menos 6 caracteres.'); return; }
    if (password !== confirm) { err('registerError', 'Las contraseñas no coinciden.'); return; }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        err('registerError', 'Ya existe una cuenta con ese correo.');
        return;
    }

    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('session', JSON.stringify({ name, email }));
    console.log(`[REGISTRO] Nuevo usuario: ${name} | ${email} | ${new Date().toLocaleString('es-MX')}`);
    window.location.href = 'UserPage.html';
});

//-------------LOGIN-------------
document.getElementById('loginBtn').addEventListener('click', () => {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    clearErr('loginError');

    if (!email)    { err('loginError', 'Ingresa tu correo.'); return; }
    if (!password) { err('loginError', 'Ingresa tu contraseña.'); return; }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user  = users.find(u => u.email === email && u.password === password);

    if (!user) {
        err('loginError', 'Correo o contraseña incorrectos.');
        return;
    }

    localStorage.setItem('session', JSON.stringify({ name: user.name, email: user.email }));
    console.log(`[LOGIN] Usuario: ${user.name} | ${user.email} | ${new Date().toLocaleString('es-MX')}`);
    window.location.href = 'UserPage.html';
});

//-------------ENTER KEY SUPPORT-------------
document.getElementById('loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

document.getElementById('regPasswordConfirm').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('registerBtn').click();
});