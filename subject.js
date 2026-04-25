//-------------CALENDARIO-------------
const monthYeartElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentDate = new Date();

const updateCalendar = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();
    const monthYearString = currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).replace(/^./, l => l.toUpperCase());
    monthYeartElement.textContent = monthYearString;

    let datesHTML = '';
    for (let i = firstDayIndex; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
        const isToday = prevDate.toDateString() === new Date().toDateString();
        datesHTML += `<div class="date inactive ${isToday ? 'active' : ''}">${prevDate.getDate()}</div>`;
    }
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const activeClass = date.toDateString() === new Date().toDateString() ? 'active' : '';
        datesHTML += `<div class="date ${activeClass}">${i}</div>`;
    }
    for (let i = 1; i <= 42 - (firstDayIndex + totalDays); i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        const isToday = nextDate.toDateString() === new Date().toDateString();
        datesHTML += `<div class="date inactive ${isToday ? 'active' : ''}">${nextDate.getDate()}</div>`;
    }
    datesElement.innerHTML = datesHTML;
}

prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); updateCalendar(); updateCalendarDots(); });
nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); updateCalendar(); updateCalendarDots(); });
updateCalendar();

//-------------STATE-------------
const currentSemester = localStorage.getItem('currentSemester') || '';
const currentSubject  = localStorage.getItem('currentSubject')  || '';

//-------------REMINDERS-------------
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
let selectedDate = null;

const saveReminders = () => localStorage.setItem('reminders', JSON.stringify(reminders));

const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
}

const updateAssignmentDropdown = () => {
    const select = document.getElementById('subjectSelect');
    const data = getSubjectData();
    select.innerHTML = '<option value="">Seleccionar actividad...</option>';
    data.assignments.filter(a => a.weight > 0).forEach(a => {
        const option = document.createElement('option');
        option.value = a.name;
        option.textContent = `${a.name} (${a.weight}%)`;
        select.appendChild(option);
    });
    const freeOpt = document.createElement('option');
    freeOpt.value = 'libre';
    freeOpt.textContent = 'Recordatorio libre';
    select.appendChild(freeOpt);
}

const renderReminders = () => {
    const list = document.getElementById('remindersList');
    list.innerHTML = '';
    reminders.forEach((r, index) => {
        list.innerHTML += `
        <div class="reminder-item">
            <div class="reminder-info">
                <span class="reminder-subject">${r.subject || 'Libre'}</span>
                <span class="reminder-name">${r.name}</span>
                <span class="reminder-date">${formatDate(r.date)}</span>
            </div>
            <div class="reminder-actions">
                <button class="editReminder" data-index="${index}"><i class="fa-solid fa-pen"></i></button>
                <button class="deleteReminder" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;
    });
    updateCalendarDots();
}

const updateCalendarDots = () => {
    document.querySelectorAll('.date').forEach(d => d.classList.remove('has-reminder'));
    const calYear = currentDate.getFullYear();
    const calMonth = currentDate.getMonth();
    reminders.forEach(r => {
        const [year, month, day] = r.date.split('-').map(Number);
        if (year === calYear && month - 1 === calMonth) {
            document.querySelectorAll('.date:not(.inactive)').forEach(dateEl => {
                if (parseInt(dateEl.textContent) === day) dateEl.classList.add('has-reminder');
            });
        }
    });
}

datesElement.addEventListener('click', (e) => {
    const dateEl = e.target.closest('.date');
    if (!dateEl || dateEl.classList.contains('inactive')) return;
    const day = dateEl.textContent.trim().padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    selectedDate = `${year}-${month}-${day}`;
    document.getElementById('selectedDateLabel').textContent = `${day}-${month}-${year}`;
    document.getElementById('dateInput').value = `${year}-${month}-${day}`;
    document.getElementById('reminderInput').classList.add('open');
    document.getElementById('hwName').focus();
    updateAssignmentDropdown();
});

document.getElementById('addReminderBtn')?.addEventListener('click', () => {
    selectedDate = null;
    document.getElementById('selectedDateLabel').textContent = '';
    document.getElementById('hwName').value = '';
    document.getElementById('subjectSelect').value = '';
    document.getElementById('dateInput').value = '';
    document.getElementById('reminderInput').classList.add('open');
    document.getElementById('hwName').focus();
    updateAssignmentDropdown();
});

document.getElementById('closeReminderInput').addEventListener('click', () => {
    document.getElementById('reminderInput').classList.remove('open');
    document.getElementById('hwName').value = '';
    document.getElementById('subjectSelect').value = '';
    document.getElementById('dateInput').value = '';
    selectedDate = null;
});

document.getElementById('saveReminder').addEventListener('click', () => {
    const name = document.getElementById('hwName').value.trim();
    const subject = document.getElementById('subjectSelect').value;
    const dateInputVal = document.getElementById('dateInput').value;
    const date = selectedDate || dateInputVal;
    if (!name || !date) return;
    reminders.push({ name, subject, date });
    saveReminders();
    renderReminders();
    document.getElementById('hwName').value = '';
    document.getElementById('subjectSelect').value = '';
    document.getElementById('dateInput').value = '';
    document.getElementById('reminderInput').classList.remove('open');
    selectedDate = null;
});

document.getElementById('remindersList').addEventListener('click', (e) => {
    const index = e.target.closest('[data-index]')?.dataset.index;
    if (e.target.closest('.deleteReminder')) {
        reminders.splice(index, 1);
        saveReminders();
        renderReminders();
    } else if (e.target.closest('.editReminder')) {
        const r = reminders[index];
        selectedDate = r.date;
        const [year, month, day] = r.date.split('-');
        document.getElementById('selectedDateLabel').textContent = `${day}-${month}-${year}`;
        document.getElementById('hwName').value = r.name;
        document.getElementById('dateInput').value = r.date;
        document.getElementById('reminderInput').classList.add('open');
        updateAssignmentDropdown();
        document.getElementById('subjectSelect').value = r.subject;
        reminders.splice(index, 1);
        saveReminders();
        renderReminders();
    }
});

renderReminders();
updateCalendarDots();

//-------------MODAL-------------
let deleteCallback = null;
const modal = document.getElementById('modal');

const showModal = (callback) => {
    deleteCallback = callback;
    modal.classList.add('open');
}

document.getElementById('confirmDelete').addEventListener('click', (e) => {
    e.stopPropagation();
    if (deleteCallback) deleteCallback();
    modal.classList.remove('open');
    deleteCallback = null;
});

document.getElementById('cancelDelete').addEventListener('click', (e) => {
    e.stopPropagation();
    modal.classList.remove('open');
    deleteCallback = null;
});

//-------------ASIDE-------------
const semNameEl = document.getElementById('semesterName');
if (semNameEl) semNameEl.textContent = currentSemester || '';

const delSemDiv = document.getElementById('del_semestre');
if (delSemDiv) {
    const subjects = JSON.parse(localStorage.getItem(`subjects_${currentSemester}`)) || [];
    delSemDiv.innerHTML = '';
    subjects.forEach(s => {
        const isActive = s.name === currentSubject;
        delSemDiv.insertAdjacentHTML('beforeend', `
        <div class="container${isActive ? ' active-subject' : ''}" style="background-color:${s.color || '#202020'}">
            <a href="subject.html" class="subjectLink" data-name="${s.name}">${s.name}</a>
        </div>`);
    });
    delSemDiv.addEventListener('click', (e) => {
        const link = e.target.closest('.subjectLink');
        if (!link) return;
        e.preventDefault();
        localStorage.setItem('currentSubject', link.dataset.name);
        window.location.href = 'subject.html';
    });
}

//-------------SUBJECT DATA-------------
const DEFAULT_EXAMS = [
    { name: 'Primer Parcial',        weight: 10, score: null, sent: false, isExam: true },
    { name: 'Examen Medio Término',  weight: 15, score: null, sent: false, isExam: true },
    { name: 'Segundo Parcial',       weight: 10, score: null, sent: false, isExam: true },
    { name: 'Examen Ordinario',      weight: 25, score: null, sent: false, isExam: true },
];

const getSubjectData = () => {
    const saved = JSON.parse(localStorage.getItem(`subjectData_${currentSemester}_${currentSubject}`));
    if (saved) return saved;
    return { assignments: [...DEFAULT_EXAMS], goal: null, goalLost: false };
};

const saveSubjectData = (data) =>
    localStorage.setItem(`subjectData_${currentSemester}_${currentSubject}`, JSON.stringify(data));

//-------------DOM REFS-------------
const sectionHeader = document.querySelector('main .header');
const tareasDiv     = document.querySelector('.tareas');
const lineDiv       = document.querySelector('main .line');
const mainTitle     = document.querySelector('main h2');

//-------------SUBJECT + SEMESTER NAME IN MAIN-------------
if (mainTitle) mainTitle.textContent = currentSubject || 'Materia';

const semesterSubLine = document.createElement('div');
semesterSubLine.className = 'subject-semester-line';
semesterSubLine.innerHTML = `<span class="subject-sem-label">${currentSemester}</span>`;
sectionHeader.after(semesterSubLine);

//-------------GOAL DISPLAY-------------
const goalDisplay = document.createElement('div');
goalDisplay.className = 'goal-display';
goalDisplay.id = 'goalDisplay';
goalDisplay.innerHTML = `
<label class="goal-label"><i class="fa-solid fa-bullseye"></i> Meta</label>
<input type="number" id="goalInlineInput" class="goal-inline-input nombre" placeholder="70–100" min="70" max="100" step="1">
<span class="goal-status" id="goalStatus"></span>`;
sectionHeader.appendChild(goalDisplay);

//-------------ASSIGNMENT FORM-------------
const oldForm = document.querySelector('.newHW');
if (oldForm) oldForm.remove();

const formWrapper = document.createElement('div');
formWrapper.className = 'newHW-wrapper';
formWrapper.innerHTML = `
<div class="hw-tabs">
    <button class="hw-tab active" data-tab="assignment">Evidencia</button>
    <button class="hw-tab" data-tab="exam">Examen</button>
</div>
<div id="assignmentFields" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
    <input class="nombre" type="text" id="hwNameInput" placeholder="Nombre (AF, PIA, EV...)">
    <input class="nombre" type="number" id="hwWeightInput" placeholder="% valor" min="1" max="100" step="1">
    <button class="guardar" id="addHWBtn" type="button"><i class="fa-solid fa-plus"></i></button>
</div>
<div id="examFields" style="display:none;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
    <input class="nombre" type="text" id="examNameInput" placeholder="Nombre del examen">
    <input class="nombre" type="number" id="examWeightInput" placeholder="% valor" min="1" max="100" step="1">
    <button class="guardar" id="addExamBtn" type="button"><i class="fa-solid fa-plus"></i></button>
</div>
<div class="grade-summary" id="gradeSummary"></div>`;
lineDiv.after(formWrapper);

//-------------TABS-------------
document.querySelectorAll('.hw-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.hw-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isAssignment = tab.dataset.tab === 'assignment';
        document.getElementById('assignmentFields').style.display = isAssignment ? 'flex' : 'none';
        document.getElementById('examFields').style.display       = isAssignment ? 'none' : 'flex';
    });
});

//-------------CALCULATIONS-------------
const calcTotalPoints = (assignments) => {
    return assignments.filter(a => a.weight > 0 && a.score !== null && a.score !== '')
        .reduce((s, a) => s + (parseFloat(a.score) * a.weight / 100), 0);
}

const calcCurrentAverage = (assignments) => {
    const graded = assignments.filter(a => a.score !== null && a.score !== '' && a.weight > 0);
    if (!graded.length) return null;
    const totalWeight = graded.reduce((s, a) => s + a.weight, 0);
    const weightedSum = graded.reduce((s, a) => s + (parseFloat(a.score) * a.weight), 0);
    return totalWeight > 0 ? weightedSum / totalWeight : null;
};

const calcProjectedGrade = (assignments) => {
    const active = assignments.filter(a => a.weight > 0);
    const totalWeight = active.reduce((s, a) => s + a.weight, 0);
    if (!totalWeight) return null;
    const gradedWeight   = active.filter(a => a.score !== null && a.score !== '').reduce((s, a) => s + a.weight, 0);
    const ungradedWeight = totalWeight - gradedWeight;
    const gradedSum      = active.filter(a => a.score !== null && a.score !== '').reduce((s, a) => s + (parseFloat(a.score) * a.weight), 0);
    return (gradedSum + (0 * ungradedWeight)) / totalWeight;
};

const calcRequiredScore = (assignments, goal) => {
    const active         = assignments.filter(a => a.weight > 0);
    const graded         = active.filter(a => a.score !== null && a.score !== '');
    const totalWeight    = active.reduce((s, a) => s + a.weight, 0);
    const ungradedWeight = totalWeight - graded.reduce((s, a) => s + a.weight, 0);
    if (ungradedWeight <= 0) return null;
    const gradedSum = graded.reduce((s, a) => s + (parseFloat(a.score) * a.weight), 0);
    return ((goal * totalWeight) - gradedSum) / ungradedWeight;
};

const calcSubmissionRate = (assignments) => {
    const acts = assignments.filter(a => !a.isExam && a.weight > 0);
    if (!acts.length) return 100;
    const total = acts.reduce((s, a) => s + a.weight, 0);
    const sent  = acts.filter(a => a.sent).reduce((s, a) => s + a.weight, 0);
    return total > 0 ? (sent / total) * 100 : 100;
};

//-------------RENDER ASSIGNMENTS-------------
const renderAssignments = () => {
    const data        = getSubjectData();
    const assignments = data.assignments;
    tareasDiv.innerHTML = '';

    const totalPoints = calcTotalPoints(assignments);
    const totalWeight = assignments.filter(a => a.weight > 0).reduce((s, a) => s + a.weight, 0);

    tareasDiv.insertAdjacentHTML('beforeend', `
    <div class="points-header">
        <span>Puntos acumulados: <strong>${totalPoints.toFixed(1)} / ${totalWeight}</strong></span>
        <span>Peso asignado: <strong>${totalWeight}% / 100%</strong></span>
    </div>`);

    const exams = assignments.filter(a => a.isExam && a.weight > 0);
    const acts  = assignments.filter(a => !a.isExam && a.weight > 0);

    const renderGroup = (items, label) => {
        if (!items.length) return;
        tareasDiv.insertAdjacentHTML('beforeend', `<div class="hw-group-label">${label}</div>`);
        items.forEach(a => {
            const i        = assignments.indexOf(a);
            const hasScore = a.score !== null && a.score !== undefined && a.score !== '';
            const scorePart = hasScore
                ? `<span class="hw-score">${parseFloat(a.score).toFixed(1)}</span>`
                : `<span class="hw-score pending">—</span>`;
            const sentPart = !a.isExam
                ? `<button class="hw-sent-btn ${a.sent ? 'sent' : 'not-sent'}" data-index="${i}">
                    ${a.sent ? '<i class="fa-solid fa-check"></i> Entregada' : '<i class="fa-solid fa-xmark"></i> No entregada'}
                  </button>`
                : '';
            tareasDiv.insertAdjacentHTML('beforeend', `
            <div class="hw-item" data-index="${i}">
                <div class="hw-main">
                    <span class="hw-name">${a.name}</span>
                    <span class="hw-weight">${a.weight}%</span>
                    ${scorePart}
                    ${sentPart}
                </div>
                <div class="hw-actions">
                    <button class="editHW guardar" data-index="${i}"><i class="fa-solid fa-pen"></i></button>
                    <button class="deleteHW guardar" data-index="${i}"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`);
        });
    };

    if (!exams.length && !acts.length) {
        tareasDiv.insertAdjacentHTML('beforeend', '<p class="empty-msg">No hay actividades registradas aún.</p>');
    } else {
        if (exams.length) renderGroup(exams, 'Exámenes');
        if (acts.length)  renderGroup(acts,  'Evidencias de Aprendizaje');
    }

    renderGradeSummary(data);
    renderGoalStatus(data);
    renderWarnings(data);
    updateSubjectInSemester(data);
    updateAssignmentDropdown();
};

//-------------SENT TOGGLE-------------
tareasDiv.addEventListener('click', (e) => {
    if (e.target.closest('.hw-sent-btn')) {
        const btn = e.target.closest('.hw-sent-btn');
        const idx = parseInt(btn.dataset.index);
        const data = getSubjectData();
        data.assignments[idx].sent = !data.assignments[idx].sent;
        saveSubjectData(data);
        renderAssignments();
        return;
    }

    const idx = parseInt(e.target.closest('[data-index]')?.dataset.index);
    if (isNaN(idx)) return;
    const data = getSubjectData();
    const a    = data.assignments[idx];

    if (e.target.closest('.deleteHW')) {
        showModal(() => {
            data.assignments.splice(idx, 1);
            saveSubjectData(data);
            renderAssignments();
        });
    } else if (e.target.closest('.editHW')) {
        const row = e.target.closest('.hw-item');
        row.innerHTML = `
        <div class="hw-edit-row">
            <input class="nombre" type="text" value="${a.name}" id="editName_${idx}" placeholder="Nombre">
            <input class="nombre" type="number" value="${a.weight}" min="1" max="100" id="editWeight_${idx}" placeholder="% valor">
            <input class="nombre" type="number" value="${a.score !== null ? a.score : ''}" min="0" max="100" step="0.1" placeholder="Calificación" id="editScore_${idx}">
            <button class="guardar confirmEdit" data-index="${idx}"><i class="fa-solid fa-check"></i></button>
            <button class="guardar cancelEdit"  data-index="${idx}"><i class="fa-solid fa-xmark"></i></button>
        </div>`;

        row.querySelector('.confirmEdit').addEventListener('click', () => {
            const newName   = document.getElementById(`editName_${idx}`).value.trim();
            const newWeight = parseFloat(document.getElementById(`editWeight_${idx}`).value);
            const newScore  = document.getElementById(`editScore_${idx}`).value;
            if (!newName || isNaN(newWeight) || newWeight <= 0) return;
            const d2 = getSubjectData();
            const otherWeight = d2.assignments.reduce((s, x, i) => i !== idx && x.weight > 0 ? s + x.weight : s, 0);
            if (otherWeight + newWeight > 100) { alert(`El peso total excedería 100%. Tienes ${100 - otherWeight}% disponible.`); return; }
            d2.assignments[idx] = { ...d2.assignments[idx], name: newName, weight: newWeight, score: newScore !== '' ? parseFloat(newScore) : null };
            saveSubjectData(d2);
            renderAssignments();
        });

        row.querySelector('.cancelEdit').addEventListener('click', renderAssignments);
    }
});

//-------------GRADE SUMMARY-------------
const renderGradeSummary = (data) => {
    const summary = document.getElementById('gradeSummary');
    if (!summary) return;
    const active = data.assignments.filter(a => a.weight > 0);
    if (!active.length) { summary.innerHTML = ''; return; }

    const avg       = calcCurrentAverage(active);
    const projected = calcProjectedGrade(active);
    const submRate  = calcSubmissionRate(data.assignments);
    const hasSecond = submRate >= 70;
    const acts      = data.assignments.filter(a => !a.isExam && a.weight > 0);

    let goalHtml = '';
    if (data.goal) {
        const req = calcRequiredScore(active, data.goal);
        if (req === null || req <= 0) {
            goalHtml = `<div class="summary-item success">Meta ${data.goal}: <strong>¡Ya asegurada!</strong></div>`;
        } else if (req > 100) {
            goalHtml = `<div class="summary-item danger">Meta ${data.goal}: <strong>Ya no alcanzable</strong></div>`;
        } else {
            goalHtml = `<div class="summary-item info">Para meta ${data.goal} necesitas: <strong>${req.toFixed(1)}</strong> en lo que falta</div>`;
        }
    }

    const secondHtml = acts.length >= 3
        ? `<div class="summary-item ${hasSecond ? 'success' : 'danger'}">
               2da oportunidad: <strong>${hasSecond ? 'Sí aplica' : `No aplica (${submRate.toFixed(0)}% entregado)`}</strong>
           </div>` : '';

    summary.innerHTML = `
    <div class="summary-grid">
        <div class="summary-item">Promedio actual <strong>${avg !== null ? avg.toFixed(1) : '—'}</strong></div>
        <div class="summary-item">Proyección mínima <strong>${projected !== null ? projected.toFixed(1) : '—'}</strong></div>
        <div class="summary-item">Evidencias entregadas <strong>${submRate.toFixed(0)}%</strong></div>
        ${secondHtml}
        ${goalHtml}
    </div>`;
};

//-------------GOAL STATUS-------------
const renderGoalStatus = (data) => {
    const input  = document.getElementById('goalInlineInput');
    const status = document.getElementById('goalStatus');
    if (!input || !status) return;
    if (!data.goal) { input.value = ''; status.textContent = ''; return; }
    input.value = data.goal;
    const req = calcRequiredScore(data.assignments.filter(a => a.weight > 0), data.goal);
    if (req === null || req <= 0) {
        status.textContent = '¡Meta asegurada!';
        status.className = 'goal-status goal-ok';
    } else if (req > 100) {
        status.textContent = 'Meta perdida';
        status.className = 'goal-status goal-lost';
        if (!data.goalLost) {
            const newGoal = prompt('Ya no puedes alcanzar tu meta. ¿Quieres establecer una nueva? (mínimo 70)');
            const parsed = parseFloat(newGoal);
            if (!isNaN(parsed) && parsed >= 70 && parsed <= 100) {
                data.goal = parsed;
                data.goalLost = false;
                saveSubjectData(data);
                input.value = parsed;
            } else {
                data.goalLost = true;
                saveSubjectData(data);
            }
        }
    } else {
        status.textContent = `Necesitas ${req.toFixed(1)} en lo que resta`;
        status.className = 'goal-status goal-warn';
    }
};

document.addEventListener('change', (e) => {
    if (e.target.id !== 'goalInlineInput') return;
    const val = parseFloat(e.target.value);
    if (isNaN(val) || val < 70 || val > 100) { e.target.value = ''; alert('La meta debe estar entre 70 y 100.'); return; }
    const data = getSubjectData();
    data.goal = val;
    data.goalLost = false;
    saveSubjectData(data);
    renderGoalStatus(data);
    renderWarnings(data);
    renderGradeSummary(data);
});

//-------------WARNINGS-------------
const renderWarnings = (data) => {
    const banner = document.getElementById('warningBanner');
    if (!banner) return;
    const active    = data.assignments.filter(a => a.weight > 0);
    const graded    = active.filter(a => a.score !== null && a.score !== '');
    const messages  = [];

    if (graded.length >= 3) {
        const projected = calcProjectedGrade(active);
        const submRate  = calcSubmissionRate(data.assignments);

        if (projected !== null && projected < 70) {
            messages.push(`danger|<i class="fa-solid fa-triangle-exclamation"></i> <strong>¡Peligro!</strong> Tu proyección mínima es <strong>${projected.toFixed(1)}</strong>. Esta materia está en riesgo.`);
        } else if (projected !== null && projected < 75) {
            messages.push(`warn|<i class="fa-solid fa-circle-exclamation"></i> Tu proyección (<strong>${projected.toFixed(1)}</strong>) está cerca del límite para aprobar.`);
        }

        if (submRate < 70 && data.assignments.filter(a => !a.isExam && a.weight > 0).length >= 3) {
            messages.push(`warn|<i class="fa-solid fa-file-circle-xmark"></i> Solo has entregado el <strong>${submRate.toFixed(0)}%</strong> de evidencias. Sin llegar al 70% irás a tercera oportunidad.`);
        }

        if (data.goal && !data.goalLost) {
            const req = calcRequiredScore(active, data.goal);
            if (req !== null && req > 100) {
                messages.push(`warn|<i class="fa-solid fa-bullseye"></i> Ya no es posible alcanzar tu meta de <strong>${data.goal}</strong>.`);
            }
        }
    }

    if (messages.length) {
        banner.style.display = 'flex';
        banner.innerHTML = messages.map(m => {
            const [type, html] = m.split('|');
            return `<div class="warning-msg${type === 'danger' ? ' danger-msg' : ''}">${html}</div>`;
        }).join('');
    } else {
        banner.style.display = 'none';
        banner.innerHTML = '';
    }
};

//-------------ADD ASSIGNMENT-------------
document.getElementById('addHWBtn').addEventListener('click', () => {
    const nameInput   = document.getElementById('hwNameInput');
    const weightInput = document.getElementById('hwWeightInput');
    const name        = nameInput.value.trim();
    const weight      = parseFloat(weightInput.value);
    if (!name || isNaN(weight) || weight <= 0) return;

    const data        = getSubjectData();
    const totalWeight = data.assignments.filter(a => a.weight > 0).reduce((s, a) => s + a.weight, 0);
    if (totalWeight + weight > 100) { alert(`No puedes exceder 100%. Tienes ${100 - totalWeight}% disponible.`); return; }

    data.assignments.push({ name, weight, score: null, sent: false, isExam: false });
    saveSubjectData(data);
    nameInput.value = '';
    weightInput.value = '';
    renderAssignments();
});

document.getElementById('addExamBtn').addEventListener('click', () => {
    const nameInput   = document.getElementById('examNameInput');
    const weightInput = document.getElementById('examWeightInput');
    const name        = nameInput.value.trim();
    const weight      = parseFloat(weightInput.value);
    if (!name || isNaN(weight) || weight <= 0) return;

    const data        = getSubjectData();
    const totalWeight = data.assignments.filter(a => a.weight > 0).reduce((s, a) => s + a.weight, 0);
    if (totalWeight + weight > 100) { alert(`No puedes exceder 100%. Tienes ${100 - totalWeight}% disponible.`); return; }

    data.assignments.push({ name, weight, score: null, sent: false, isExam: true });
    saveSubjectData(data);
    nameInput.value = '';
    weightInput.value = '';
    renderAssignments();
});

['hwNameInput', 'hwWeightInput'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); document.getElementById('addHWBtn').click(); }
    });
});

['examNameInput', 'examWeightInput'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); document.getElementById('addExamBtn').click(); }
    });
});

//-------------SYNC TO SEMESTER-------------
const updateSubjectInSemester = (data) => {
    const avg      = calcCurrentAverage(data.assignments.filter(a => a.weight > 0));
    const subjects = JSON.parse(localStorage.getItem(`subjects_${currentSemester}`)) || [];
    const idx      = subjects.findIndex(s => s.name === currentSubject);
    if (idx !== -1) {
        subjects[idx].currentAvg = avg;
        localStorage.setItem(`subjects_${currentSemester}`, JSON.stringify(subjects));
    }
};

//-------------WARNING BANNER-------------
const warningBanner = document.createElement('div');
warningBanner.className = 'grade-warning';
warningBanner.id = 'warningBanner';
warningBanner.style.display = 'none';
semesterSubLine.after(warningBanner);

//-------------INIT-------------
renderAssignments();