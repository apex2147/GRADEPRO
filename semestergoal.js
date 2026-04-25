// ─────────────────────────────────────────────
//  SEMESTER GOAL  —  GRADEPRO  (add to main.js or load separately on userpage.html)
//  Place this AFTER the existing main.js code.
// ─────────────────────────────────────────────

// ─── SEMESTER GOAL STATE ─────────────────────
const getSemesterGoal = () => parseFloat(localStorage.getItem(`semesterGoal_${currentSemester}`)) || null;
const saveSemesterGoal = (val) => localStorage.setItem(`semesterGoal_${currentSemester}`, val);

// ─── INJECT GOAL BUTTON INTO HEADER ──────────
// Placed before the username/nav area in the header
const headerNav = document.querySelector('header nav');
if (headerNav) {
    const semGoalBtn = document.createElement('button');
    semGoalBtn.className = 'goal-btn semester-goal-btn';
    semGoalBtn.id = 'semGoalBtn';
    semGoalBtn.innerHTML = '<i class="fa-solid fa-bullseye"></i> Meta del semestre';
    headerNav.insertBefore(semGoalBtn, headerNav.firstChild);
    semGoalBtn.addEventListener('click', openSemGoalModal);
}

// ─── SEMESTER GOAL MODAL ─────────────────────
const semGoalModal = document.createElement('div');
semGoalModal.className = 'modal';
semGoalModal.id = 'semGoalModal';
semGoalModal.innerHTML = `
<div class="modal-box">
    <h3 id="semGoalTitle">Meta del semestre</h3>
    <p id="semGoalMsg">Define el promedio que deseas obtener este semestre (mínimo 70).</p>
    <input type="number" id="semGoalInput" class="nombre" placeholder="Ej. 85" min="70" max="100" step="1">
    <div class="modal-buttons">
        <button id="confirmSemGoal">Guardar</button>
        <button id="cancelSemGoal">Cancelar</button>
    </div>
</div>`;
document.body.appendChild(semGoalModal);

document.getElementById('confirmSemGoal').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('semGoalInput').value);
    if (isNaN(val) || val < 70 || val > 100) {
        alert('La meta debe estar entre 70 y 100.');
        return;
    }
    saveSemesterGoal(val);
    document.getElementById('semGoalModal').classList.remove('open');
    renderSemesterWarning();
});

document.getElementById('cancelSemGoal').addEventListener('click', () => {
    document.getElementById('semGoalModal').classList.remove('open');
});

function openSemGoalModal() {
    const goal = getSemesterGoal();
    document.getElementById('semGoalTitle').textContent = goal ? `Meta actual: ${goal}` : 'Meta del semestre';
    document.getElementById('semGoalInput').value = goal || '';
    document.getElementById('semGoalMsg').textContent = goal
        ? 'Puedes cambiar tu meta de semestre (mínimo 70).'
        : 'Define el promedio que deseas obtener este semestre (mínimo 70).';
    document.getElementById('semGoalModal').classList.add('open');
}

// ─── SEMESTER WARNING BANNER ─────────────────
const semBanner = document.createElement('div');
semBanner.id = 'semWarningBanner';
semBanner.className = 'grade-warning';
semBanner.style.display = 'none';
// Insert after the main section header
const mainSection = document.querySelector('main section');
if (mainSection) mainSection.prepend(semBanner);

const renderSemesterWarning = () => {
    if (!currentSemester) return;
    const banner   = document.getElementById('semWarningBanner');
    if (!banner) return;

    const subjects = JSON.parse(localStorage.getItem(`subjects_${currentSemester}`)) || [];
    const graded   = subjects.filter(s => s.currentAvg !== null && s.currentAvg !== undefined);
    if (!graded.length) { banner.style.display = 'none'; return; }

    const semAvg   = graded.reduce((s, sub) => s + sub.currentAvg, 0) / graded.length;
    const goal     = getSemesterGoal();
    const messages = [];

    // Failing warning: avg < 70
    if (semAvg < 70) {
        messages.push(`<i class="fa-solid fa-triangle-exclamation"></i> <strong>¡Atención!</strong> Tu promedio del semestre es <strong>${semAvg.toFixed(1)}</strong>. Estás en riesgo de reprobar el semestre.`);
    } else if (semAvg < 75) {
        messages.push(`<i class="fa-solid fa-circle-exclamation"></i> Tu promedio del semestre (<strong>${semAvg.toFixed(1)}</strong>) está cerca del límite para aprobar.`);
    }

    // Goal warning
    if (goal) {
        const ungradedCount = subjects.length - graded.length;
        if (semAvg < goal) {
            if (ungradedCount > 0) {
                messages.push(`<i class="fa-solid fa-bullseye"></i> Tu promedio actual (<strong>${semAvg.toFixed(1)}</strong>) está por debajo de tu meta de <strong>${goal}</strong>. Tienes ${ungradedCount} materia(s) sin calificación aún.`);
            } else {
                messages.push(`<i class="fa-solid fa-bullseye"></i> No alcanzaste tu meta de <strong>${goal}</strong>. Tu promedio final del semestre es <strong>${semAvg.toFixed(1)}</strong>. ¿Deseas establecer una nueva meta? <button id="newSemGoalBtn" class="inline-btn">Nueva meta</button>`);
            }
        } else {
            messages.push(`<i class="fa-solid fa-circle-check"></i> ¡Vas en camino a tu meta de <strong>${goal}</strong>! Promedio actual: <strong>${semAvg.toFixed(1)}</strong>.`);
        }
    }

    if (messages.length) {
        banner.style.display = 'block';
        banner.innerHTML = messages.map(m => `<div class="warning-msg">${m}</div>`).join('');
        const btn = document.getElementById('newSemGoalBtn');
        if (btn) btn.addEventListener('click', openSemGoalModal);
    } else {
        banner.style.display = 'none';
    }
};

// Run on load and whenever semester changes
renderSemesterWarning();

// Hook into existing loadSemesterView if present
const _origLoadSemesterView = typeof loadSemesterView === 'function' ? loadSemesterView : null;
if (_origLoadSemesterView) {
    window.loadSemesterView = (name) => {
        _origLoadSemesterView(name);
        renderSemesterWarning();
    };
}
