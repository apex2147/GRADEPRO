function navigateTo(url) {
    window.location.href = url;
}
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
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}
const updateAssignmentDropdown = () => {
    const select = document.getElementById('subjectSelect');
    const data = getSubjectData();
    select.innerHTML = '<option value="">Seleccionar actividad...</option>';
    data.assignments
        .filter(a => a.weight > 0 && !(a.sent) && (a.score === null || a.score === ''))
        .forEach(a => {
            const option = document.createElement('option');
            option.value = a.name;
            option.textContent = `${a.name} (${a.weight}%)`;
            select.appendChild(option);
        });
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

const renderReminders = () => {
    const list = document.getElementById('remindersList');
    list.innerHTML = '';
    [...reminders]
        .map((r, index) => ({ ...r, originalIndex: index }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach((r) => {
            const index = r.originalIndex;
            const isActivity = r.type === 'actividad';
            list.innerHTML += `
            <div class="reminder-item">
                <div class="reminder-info">
                    <span class="reminder-subject">${isActivity ? r.subjectName : r.name}</span>
                    ${isActivity ? `<span class="reminder-name">${r.subject}</span>` : ''}
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

//-------------REMINDER TYPE TOGGLE-------------
let reminderType = 'libre';

document.querySelectorAll('.reminder-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.reminder-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        reminderType = btn.dataset.type;
        const select = document.getElementById('subjectSelect');
        if (reminderType === 'actividad') {
            select.style.display = 'block';
            document.getElementById('hwName').placeholder = 'Nota opcional...';
            updateAssignmentDropdown();
        } else {
            select.style.display = 'none';
            select.value = '';
            document.getElementById('hwName').placeholder = 'Descripción...';
        }
    });
});

datesElement.addEventListener('click', (e) => {
    const dateEl = e.target.closest('.date');
    if (!dateEl || dateEl.classList.contains('inactive')) return;
    const day = dateEl.textContent.trim().padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    selectedDate = `${year}-${month}-${day}`;
    document.getElementById('selectedDateLabel').textContent = `${parseInt(day)} ${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][currentDate.getMonth()]} ${year}`;
    document.getElementById('dateInput').value = `${year}-${month}-${day}`;

    const isOpen = document.getElementById('reminderInput').classList.contains('open');
    if (!isOpen) {
        document.getElementById('reminderInput').classList.add('open');
        document.getElementById('hwName').focus();
        reminderType = 'libre';
        document.querySelectorAll('.reminder-type-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.reminder-type-btn[data-type="libre"]').classList.add('active');
        document.getElementById('subjectSelect').style.display = 'none';
        document.getElementById('hwName').placeholder = 'Descripción...';
    }
});

document.getElementById('addReminderBtn')?.addEventListener('click', () => {
    selectedDate = null;
    document.getElementById('selectedDateLabel').textContent = '';
    document.getElementById('hwName').value = '';
    document.getElementById('subjectSelect').value = '';
    document.getElementById('dateInput').value = '';
    document.getElementById('reminderInput').classList.add('open');
    document.getElementById('hwName').focus();
    reminderType = 'libre';
    document.querySelectorAll('.reminder-type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.reminder-type-btn[data-type="libre"]').classList.add('active');
    document.getElementById('subjectSelect').style.display = 'none';
    document.getElementById('hwName').placeholder = 'Descripción...';
});

document.getElementById('closeReminderInput').addEventListener('click', () => {
    document.getElementById('reminderInput').classList.remove('open');
    document.getElementById('hwName').value = '';
    document.getElementById('subjectSelect').value = '';
    document.getElementById('dateInput').value = '';
    selectedDate = null;
});

document.getElementById('saveReminder').addEventListener('click', () => {
    const name     = document.getElementById('hwName').value.trim();
    const dateInputVal = document.getElementById('dateInput').value;
    const date     = selectedDate || dateInputVal;
    const subject  = document.getElementById('subjectSelect').value;
    if (!date) return;
    if (reminderType === 'libre' && !name) return;
    if (reminderType === 'actividad' && !subject) return;
    reminders.push({ name, subject, date, type: reminderType, subjectName: currentSubject });
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

document.getElementById('closeGoalWarning')?.addEventListener('click', () => {
    document.getElementById('goalWarningModal').classList.remove('open');
});

//-------------ASIDE-------------
const semNameEl = document.getElementById('semesterName');
if (semNameEl) semNameEl.textContent = currentSemester || '';

const renderAside = () => {
    const delSemDiv = document.getElementById('del_semestre');
    const currentSubjectDisplay = document.getElementById('currentSubjectDisplay');
    if (!delSemDiv) return;

    // Show active subject above the line, same style as .actual in userpage
    if (currentSubjectDisplay) {
        currentSubjectDisplay.innerHTML = `<a href="#" class="actualLink">${currentSubject}</a>`;
    }

    const subjects = JSON.parse(localStorage.getItem(`subjects_${currentSemester}`)) || [];
    delSemDiv.innerHTML = '';

    subjects.forEach((s, idx) => {
        if (s.name === currentSubject) return;
        delSemDiv.insertAdjacentHTML('beforeend', `
        <div class="container" style="background-color:${s.color || '#202020'}" data-idx="${idx}">
            <a href="#" class="subjectLink" data-name="${s.name}">${s.name}</a>
            <div class="aside-actions">
                <button class="aside-rename-btn guardar" data-idx="${idx}" title="Renombrar"><i class="fa-solid fa-pen"></i></button>
                <button class="aside-delete-btn guardar" data-idx="${idx}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`);
    });
};

// Navigate to subject
document.getElementById('del_semestre').addEventListener('click', (e) => {
    // Navigate
    const link = e.target.closest('.subjectLink');
    if (link) {
        e.preventDefault();
        localStorage.setItem('currentSubject', link.dataset.name);
        navigateTo('subject.html');
        return;
    }

    const idx = parseInt(e.target.closest('[data-idx]')?.dataset.idx);
    if (isNaN(idx)) return;
    const subjects = JSON.parse(localStorage.getItem(`subjects_${currentSemester}`)) || [];

    // Rename
    if (e.target.closest('.aside-rename-btn')) {
        const oldName = subjects[idx].name;
        const newName = prompt('Nuevo nombre para la materia:', oldName)?.trim();
        if (!newName || newName === oldName) return;
        // Rename subjectData key
        const oldKey = `subjectData_${currentSemester}_${oldName}`;
        const newKey = `subjectData_${currentSemester}_${newName}`;
        const oldData = localStorage.getItem(oldKey);
        if (oldData) { localStorage.setItem(newKey, oldData); localStorage.removeItem(oldKey); }
        subjects[idx].name = newName;
        localStorage.setItem(`subjects_${currentSemester}`, JSON.stringify(subjects));
        // Update currentSubject if it was the active one
        if (oldName === currentSubject) localStorage.setItem('currentSubject', newName);
        navigateTo('subject.html');
        return;
    }

    // Delete
    if (e.target.closest('.aside-delete-btn')) {
        showModal(() => {
            const name = subjects[idx].name;
            localStorage.removeItem(`subjectData_${currentSemester}_${name}`);
            subjects.splice(idx, 1);
            localStorage.setItem(`subjects_${currentSemester}`, JSON.stringify(subjects));
            // If deleted subject was active, go to first remaining or back
            if (name === currentSubject) {
                if (subjects.length > 0) {
                    localStorage.setItem('currentSubject', subjects[0].name);
                    navigateTo('subject.html');
                } else {
                    navigateTo('UserPage.html');
                }
            } else {
                renderAside();
            }
        });
        return;
    }
});

// Add new subject
document.getElementById('addSubjectBtn').addEventListener('click', () => {
    const input = document.getElementById('newSubjectInput');
    const name = input.value.trim();
    if (!name) return;
    const subjects = JSON.parse(localStorage.getItem(`subjects_${currentSemester}`)) || [];
    if (subjects.find(s => s.name === name)) { alert('Ya existe una materia con ese nombre.'); return; }
    subjects.push({ name, color: '#202020' });
    localStorage.setItem(`subjects_${currentSemester}`, JSON.stringify(subjects));
    input.value = '';
    renderAside();
});

document.getElementById('newSubjectInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('addSubjectBtn').click(); }
});

renderAside();

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

const neededGradesRow = document.createElement('div');
neededGradesRow.className = 'subject-semester-line needed-grades-row';
neededGradesRow.id = 'neededGradesRow';
neededGradesRow.innerHTML = `Exámenes: <strong>—</strong> <span style="color:#59636e">|</span> Evidencias: <strong>—</strong>`;
sectionHeader.after(neededGradesRow);

//-------------GOAL DISPLAY-------------
const goalDisplay = document.createElement('div');
goalDisplay.className = 'goal-display';
goalDisplay.id = 'goalDisplay';
goalDisplay.innerHTML = `
<div class="avg-display" id="avgDisplay">Calif. final: <strong id="avgValue">—</strong></div>
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
    const gradedSum = active
        .filter(a => a.score !== null && a.score !== '')
        .reduce((s, a) => s + (parseFloat(a.score) * a.weight), 0);
    return gradedSum / totalWeight;
};

const calcRequiredScore = (assignments, goal) => {
    const active         = assignments.filter(a => a.weight > 0);
    const graded         = active.filter(a => a.score !== null && a.score !== '');
    const totalWeight    = active.reduce((s, a) => s + a.weight, 0);
    const ungradedWeight = totalWeight - graded.reduce((s, a) => s + a.weight, 0);
    const gradedSum      = graded.reduce((s, a) => s + (parseFloat(a.score) * a.weight), 0);
    if (ungradedWeight <= 0) {
        const finalAvg = totalWeight > 0 ? gradedSum / totalWeight : 0;
        return finalAvg >= goal ? null : -1;
    }
    return ((goal * totalWeight) - gradedSum) / ungradedWeight;
};

const calcRequiredByGroup = (assignments, goal) => {
    const exams = assignments.filter(a => a.isExam && a.weight > 0);
    const acts  = assignments.filter(a => !a.isExam && a.weight > 0);

    const totalWeight = assignments.filter(a => a.weight > 0).reduce((s, a) => s + a.weight, 0);
    if (!totalWeight) return { exams: null, acts: null };

    const gradedSum = assignments.filter(a => a.weight > 0 && a.score !== null && a.score !== '')
        .reduce((s, a) => s + (parseFloat(a.score) * a.weight), 0);

    const ungradedExams = exams.filter(a => a.score === null || a.score === '');
    const ungradedActs  = acts.filter(a => a.score === null || a.score === '');

    const ungradedExamWeight = ungradedExams.reduce((s, a) => s + a.weight, 0);
    const ungradedActWeight  = ungradedActs.reduce((s, a) => s + a.weight, 0);

    // Use overall current average as assumption for the other group
    const gradedAssignments = assignments.filter(a => a.weight > 0 && a.score !== null && a.score !== '');
    const gradedWeight = gradedAssignments.reduce((s, a) => s + a.weight, 0);
    const overallAvg = gradedWeight > 0
        ? gradedAssignments.reduce((s, a) => s + (parseFloat(a.score) * a.weight), 0) / gradedWeight
        : 0;

    let reqExams = null;
    if (ungradedExamWeight > 0) {
        const actsContribution = ungradedActWeight * overallAvg;
        const needed = ((goal * totalWeight) - gradedSum - actsContribution) / ungradedExamWeight;
        reqExams = needed;
    } else {
        const examSum = exams.reduce((s, a) => s + (a.score !== null && a.score !== '' ? parseFloat(a.score) * a.weight : 0), 0);
        const examWeight = exams.reduce((s, a) => s + a.weight, 0);
        reqExams = examWeight > 0 && (examSum / examWeight) >= goal ? null : -1;
    }

    let reqActs = null;
    if (ungradedActWeight > 0) {
        const examsContribution = ungradedExamWeight * overallAvg;
        const needed = ((goal * totalWeight) - gradedSum - examsContribution) / ungradedActWeight;
        reqActs = needed;
    } else {
        const actSum = acts.reduce((s, a) => s + (a.score !== null && a.score !== '' ? parseFloat(a.score) * a.weight : 0), 0);
        const actWeight = acts.reduce((s, a) => s + a.weight, 0);
        reqActs = actWeight > 0 && (actSum / actWeight) >= goal ? null : -1;
    }

    return { exams: reqExams, acts: reqActs };
};

const formatRequired = (val, hasRemaining) => {
    if (!hasRemaining && val === null) return '✓ Completo';
    if (!hasRemaining && val === -1)   return 'No alcanzada';
    if (val === null) return '—';
    if (val === -1)   return 'No alcanzada';
    if (val > 100)    return 'Meta no alcanzable';
    if (val <= 0)     return '¡Ya asegurada!';
    return val.toFixed(1);
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
            const i = assignments.indexOf(a);
            const hasGrade = a.score !== null && a.score !== undefined && a.score !== '';
            const gradeVal = hasGrade ? parseFloat(a.score).toFixed(1) : '';
            const pointsVal = hasGrade ? ((parseFloat(a.score) * a.weight) / 100).toFixed(1) : '';
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
                    <div class="hw-grade-group">
                        <input class="hw-grade-input nombre grade-input" data-index="${i}" type="number" min="0" max="100" step="0.1" placeholder="Calif." value="${gradeVal}">
                        <span class="hw-grade-sep">/</span>
                        <input class="hw-grade-input nombre points-input" data-index="${i}" type="number" min="0" max="${a.weight}" step="0.1" placeholder="Pts." value="${pointsVal}">
                        <span class="hw-pts-label">de ${a.weight}</span>
                    </div>
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
    const a = data.assignments[idx];

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
            <button class="guardar confirmEdit" data-index="${idx}"><i class="fa-solid fa-check"></i></button>
            <button class="guardar cancelEdit" data-index="${idx}"><i class="fa-solid fa-xmark"></i></button>
        </div>`;

        row.querySelector('.confirmEdit').addEventListener('click', () => {
            const newName   = document.getElementById(`editName_${idx}`).value.trim();
            const newWeight = parseFloat(document.getElementById(`editWeight_${idx}`).value);
            if (!newName || isNaN(newWeight) || newWeight <= 0) return;
            const d2 = getSubjectData();
            const otherWeight = d2.assignments.reduce((s, x, i) => i !== idx && x.weight > 0 ? s + x.weight : s, 0);
            if (otherWeight + newWeight > 100) { alert(`El peso total excedería 100%. Tienes ${100 - otherWeight}% disponible.`); return; }
            d2.assignments[idx] = { ...d2.assignments[idx], name: newName, weight: newWeight };
            saveSubjectData(d2);
            renderAssignments();
        });

        row.querySelector('.cancelEdit').addEventListener('click', renderAssignments);
    }
});

//-------------GRADE/POINTS LIVE INPUT-------------
tareasDiv.addEventListener('input', (e) => {
    const idx = parseInt(e.target.dataset.index);
    if (isNaN(idx)) return;

    const data = getSubjectData();
    const a = data.assignments[idx];
    const row = e.target.closest('.hw-item');
    const gradeInput  = row.querySelector('.grade-input');
    const pointsInput = row.querySelector('.points-input');

    if (e.target.classList.contains('grade-input')) {
        const grade = parseFloat(gradeInput.value);
        if (gradeInput.value !== '' && !isNaN(grade) && grade >= 0 && grade <= 100) {
            pointsInput.value = ((grade * a.weight) / 100).toFixed(1);
            data.assignments[idx].score = grade;
            if (!data.assignments[idx].sent && grade > 0) data.assignments[idx].sent = true;
        } else if (gradeInput.value === '') {
            pointsInput.value = '';
            data.assignments[idx].score = null;
        }
    } else if (e.target.classList.contains('points-input')) {
        const points = parseFloat(pointsInput.value);
        if (!isNaN(points) && points > a.weight) { pointsInput.value = a.weight; return; }
        if (pointsInput.value !== '' && !isNaN(points) && points >= 0 && points <= a.weight) {
            const grade = (points / a.weight) * 100;
            gradeInput.value = grade.toFixed(1);
            data.assignments[idx].score = grade;
            if (!data.assignments[idx].sent && points > 0) data.assignments[idx].sent = true;
        } else if (pointsInput.value === '') {
            gradeInput.value = '';
            data.assignments[idx].score = null;
        }
    }

    saveSubjectData(data);

    const sentBtn = row.querySelector('.hw-sent-btn');
    if (sentBtn) {
        const sent = data.assignments[idx].sent;
        sentBtn.className = `hw-sent-btn ${sent ? 'sent' : 'not-sent'}`;
        sentBtn.innerHTML = sent
            ? '<i class="fa-solid fa-check"></i> Entregada'
            : '<i class="fa-solid fa-xmark"></i> No entregada';
    }

    renderGradeSummary(data);
    renderGoalStatus(data);
    renderWarnings(data);
    updateSubjectInSemester(data);
});

//-------------GRADE SUMMARY-------------
const renderGradeSummary = (data) => {
    const summary = document.getElementById('gradeSummary');
    if (!summary) return;
    const active = data.assignments.filter(a => a.weight > 0);
    if (!active.length) { summary.innerHTML = ''; return; }

    const avg       = calcCurrentAverage(active);
    const avgEl = document.getElementById('avgValue');
    if (avgEl) avgEl.textContent = avg !== null ? avg.toFixed(1) : '—';
    const projected = calcProjectedGrade(active);
    const submRate  = calcSubmissionRate(data.assignments);
    const hasSecond = submRate >= 70;
    const acts      = data.assignments.filter(a => !a.isExam && a.weight > 0);

    const secondHtml = acts.length >= 3
        ? `<div class="summary-item ${hasSecond ? 'success' : 'danger'}">
               2da oportunidad: <strong>${hasSecond ? 'Sí aplica' : `Sin derecho (${submRate.toFixed(0)}% entregado)`}</strong>
           </div>` : '';

    const goalStatusHtml = (() => {
        if (!data.goal) return '';
        const req = calcRequiredScore(active, data.goal);
        let statusText = '';
        let cls = '';
        if (req === null)    { statusText = '¡Ya asegurada!';                           cls = 'success'; }
        else if (req === -1) { statusText = 'No alcanzada';                              cls = 'danger';  }
        else if (req > 100)  { statusText = 'Meta no alcanzable';                        cls = 'danger';  }
        else if (req <= 0)   { statusText = '¡Ya asegurada!';                           cls = 'success'; }
        else                 { statusText = `Necesitas ${req.toFixed(1)} en lo que falta`; cls = 'info'; }
            return `<div class="summary-item ${cls}">Meta ${data.goal}: <strong>${statusText}</strong></div>`;
        })();

    summary.innerHTML = `
    <div class="summary-grid">
        <div class="summary-item">Predicción final <strong>${projected !== null ? projected.toFixed(1) : '—'}</strong></div>
        <div class="summary-item">Evidencias entregadas <strong>${submRate.toFixed(0)}%</strong></div>
        ${secondHtml}
        ${goalStatusHtml}
    </div>`;
};

//-------------GOAL STATUS-------------
const renderGoalStatus = (data) => {
    const input  = document.getElementById('goalInlineInput');
    const status = document.getElementById('goalStatus');
    if (!input || !status) return;
    if (!data.goal) { input.value = ''; status.textContent = ''; return; }
    input.value = data.goal;

    const active = data.assignments.filter(a => a.weight > 0);
    const { exams: reqExams, acts: reqActs } = calcRequiredByGroup(active, data.goal);

    const examsUngraded = active.filter(a => a.isExam && (a.score === null || a.score === '')).length > 0;
    const actsUngraded  = active.filter(a => !a.isExam && (a.score === null || a.score === '')).length > 0;

    const examsStr = formatRequired(reqExams, examsUngraded);
    const actsStr  = formatRequired(reqActs, actsUngraded);

    const goalLost = (reqExams !== null && (reqExams > 100 || reqExams === -1)) || 
                 (reqActs !== null && (reqActs > 100 || reqActs === -1));

    if (goalLost && !data.goalLost) {
        data.goal = 70;
        data.goalLost = true;
        saveSubjectData(data);
        input.value = 70;

        // Show custom warning modal
        document.getElementById('goalWarningText').innerHTML =
            `Necesitas:<br>Exámenes: <strong>${examsStr}</strong><br>Evidencias: <strong>${actsStr}</strong>`;
        document.getElementById('goalWarningModal').classList.add('open');
    }

    status.textContent = goalLost
        ? 'Meta ajustada a 70'
        : '';
    status.className = goalLost ? 'goal-status goal-lost' : 'goal-status goal-warn';

    // Update needed grades row
    const neededEl = document.getElementById('neededGradesRow');
    if (neededEl) {
        neededEl.innerHTML = `
        Exámenes: <strong>${examsStr}</strong>
        <span style="color:#59636e">|</span>
        Evidencias: <strong>${actsStr}</strong>`;
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

    if (graded.length >= 1) {
        const projected = calcProjectedGrade(active);
        const submRate  = calcSubmissionRate(data.assignments);

        if (projected !== null && projected < 70) {
            messages.push(`danger|<i class="fa-solid fa-triangle-exclamation"></i> <strong>¡Peligro!</strong> Tu proyección mínima es <strong>${projected.toFixed(1)}</strong>. Esta materia está en riesgo.`);
        } else if (projected !== null && projected < 75) {
            messages.push(`warn|<i class="fa-solid fa-circle-exclamation"></i> Tu proyección (<strong>${projected.toFixed(1)}</strong>) está cerca del límite para aprobar.`);
        }

        const examsTotal      = active.filter(a => a.isExam);
        const examGradedW     = examsTotal.filter(a => a.score !== null && a.score !== '').reduce((s, a) => s + a.weight, 0);
        const examTotalW      = examsTotal.reduce((s, a) => s + a.weight, 0);
        const mostExamsGraded = examTotalW > 0 && (examGradedW / examTotalW) >= 0.9;

        const acts2    = active.filter(a => !a.isExam);
        if (mostExamsGraded && submRate < 70 && acts2.length >= 3) {
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
neededGradesRow.after(warningBanner);

//-------------INIT-------------
renderAssignments();