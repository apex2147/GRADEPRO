const mainHeader = document.querySelector('main .header');

if (mainHeader) {
    const semGoalDisplay = document.createElement('div');
    semGoalDisplay.className = 'goal-display';
    semGoalDisplay.id = 'semGoalDisplay';
    semGoalDisplay.innerHTML = `
    <span class="avg-display">Promedio: <strong id="semAvgValue">—</strong></span>
    <label class="goal-label"><i class="fa-solid fa-bullseye"></i> Meta</label>
    <input type="number" id="semGoalInput" class="goal-inline-input nombre" placeholder="70–100" min="70" max="100" step="1">
    <span class="goal-status" id="semGoalStatus"></span>`;
    mainHeader.appendChild(semGoalDisplay);
}

document.addEventListener('change', (e) => {
    if (e.target.id !== 'semGoalInput') return;
    const val = parseFloat(e.target.value);
    if (isNaN(val) || val < 70 || val > 100) {
        e.target.value = '';
        alert('La meta debe estar entre 70 y 100.');
        return;
    }
    saveSemesterGoal(val);
    renderSemesterGoalStatus();
    renderSemesterWarning();
});

const renderSemesterGoalStatus = () => {
    const input  = document.getElementById('semGoalInput');
    const status = document.getElementById('semGoalStatus');
    const avgEl  = document.getElementById('semAvgValue');
    if (!input || !status) return;

    const subjects = JSON.parse(localStorage.getItem(`subjects_${currentSemester}`)) || [];
    const graded   = subjects.filter(s => s.currentAvg !== null && s.currentAvg !== undefined);
    const semAvg   = graded.length
        ? graded.reduce((s, sub) => s + sub.currentAvg, 0) / graded.length
        : null;

    if (avgEl) avgEl.textContent = semAvg !== null ? semAvg.toFixed(1) : '—';

    const goal = getSemesterGoal();
    if (!goal) { input.value = ''; status.textContent = ''; return; }
    input.value = goal;

    if (semAvg === null) {
        status.textContent = 'Sin calificaciones aún';
        status.className = 'goal-status goal-warn';
        return;
    }

    const ungraded = subjects.length - graded.length;
    if (semAvg >= goal) {
        status.textContent = '¡Meta en camino!';
        status.className = 'goal-status goal-ok';
    } else if (ungraded > 0) {
        const needed = ((goal * subjects.length) - graded.reduce((s, sub) => s + sub.currentAvg, 0)) / ungraded;
        status.textContent = `Necesitas ${needed.toFixed(1)} en las materias restantes`;
        status.className = 'goal-status goal-warn';
    } else {
        status.textContent = 'Meta no alcanzada';
        status.className = 'goal-status goal-lost';
    }
};