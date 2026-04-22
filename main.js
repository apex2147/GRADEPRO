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
    const monthYearString = currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).replace(/^./, letter => letter.toUpperCase());
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

prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); updateCalendar(); });
nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); updateCalendar(); });
updateCalendar();

//-------------STATE-------------
let currentSemester = localStorage.getItem('currentSemester') || null;

//-------------REMINDERS-------------
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
let selectedDate = null;

const saveReminders = () => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
}

const updateSubjectDropdown = () => {
    const select = document.getElementById('subjectSelect');
    const subjects = JSON.parse(localStorage.getItem(`subjects_${currentSemester}`)) || [];
    select.innerHTML = '<option value="">Seleccionar materia...</option>';
    subjects.forEach(s => {
        const option = document.createElement('option');
        option.value = s.name;
        option.textContent = s.name;
        select.appendChild(option);
    });
}

const renderReminders = () => {
    const list = document.getElementById('remindersList');
    list.innerHTML = '';
    reminders.forEach((r, index) => {
        list.innerHTML += `
        <div class="reminder-item">
            <div class="reminder-info">
                <span class="reminder-subject">${r.subject || 'Sin materia'}</span>
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
    document.querySelectorAll('.date').forEach(dateEl => {
        dateEl.classList.remove('has-reminder');
    });

    const calYear = currentDate.getFullYear();
    const calMonth = currentDate.getMonth();

    reminders.forEach(r => {
        const [year, month, day] = r.date.split('-').map(Number);
        if (year === calYear && month - 1 === calMonth) {
            document.querySelectorAll('.date:not(.inactive)').forEach(dateEl => {
                if (parseInt(dateEl.textContent) === day) {
                    dateEl.classList.add('has-reminder');
                }
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
    document.getElementById('reminderInput').style.display = 'flex';
    document.getElementById('hwName').focus();
    updateSubjectDropdown();
});

document.getElementById('closeReminderInput').addEventListener('click', () => {
    document.getElementById('reminderInput').style.display = 'none';
    document.getElementById('hwName').value = '';
    document.getElementById('subjectSelect').value = '';
    selectedDate = null;
});

document.getElementById('saveReminder').addEventListener('click', () => {
    const name = document.getElementById('hwName').value.trim();
    const subject = document.getElementById('subjectSelect').value;
    if (!name || !selectedDate) return;
    reminders.push({ name, subject, date: selectedDate });
    saveReminders();
    renderReminders();
    updateCalendarDots();
    document.getElementById('hwName').value = '';
    document.getElementById('subjectSelect').value = '';
    document.getElementById('reminderInput').style.display = 'none';
    selectedDate = null;
});

document.getElementById('remindersList').addEventListener('click', (e) => {
    const index = e.target.closest('[data-index]')?.dataset.index;
    if (e.target.closest('.deleteReminder')) {
        reminders.splice(index, 1);
        saveReminders();
        renderReminders();
        updateCalendarDots();
    } else if (e.target.closest('.editReminder')) {
        const r = reminders[index];
        selectedDate = r.date;
        const [year, month, day] = r.date.split('-');
        document.getElementById('selectedDateLabel').textContent = `${day}-${month}-${year}`;
        document.getElementById('hwName').value = r.name;
        document.getElementById('reminderInput').style.display = 'flex';
        updateSubjectDropdown();
        document.getElementById('subjectSelect').value = r.subject;
        reminders.splice(index, 1);
        saveReminders();
        renderReminders();
        updateCalendarDots();
    }
});

const originalUpdateCalendar = updateCalendar;
const updateCalendarWithDots = () => {
    originalUpdateCalendar();
    updateCalendarDots();
}
prevBtn.addEventListener('click', updateCalendarDots);
nextBtn.addEventListener('click', updateCalendarDots);

renderReminders();
updateCalendarDots();



//-------------SEMESTRES-------------
const cursados = document.getElementById('cursados');
let semestres = 0;
const input = document.querySelector('.newSemester input[type="text"]');
const actual = document.querySelector('.actual');
const mainTitle = document.querySelector('main h2');
const addSubjectForm = document.querySelector('.newSubject');

const saveSemesters = () => {
    const data = [...document.querySelectorAll('.cursados .container')].map(c => ({
        name: c.querySelector('a').textContent,
        priority: c.classList.contains('priority')
    }));
    localStorage.setItem('semesters', JSON.stringify(data));
}

const updateActual = () => {
    const priority = document.querySelector('.container.priority');
    document.querySelectorAll('.container').forEach(c => c.style.display = 'flex');
    if (priority) {
        actual.innerHTML = `<a href="#" class="actualLink">${priority.querySelector('a').textContent}</a>`;
        priority.style.display = 'none';
    } else {
        actual.innerHTML = '';
    }
}

const updateSubjectForm = () => {
    addSubjectForm.style.display = currentSemester ? 'flex' : 'none';
}

const loadSemesterView = (name) => {
    currentSemester = name;
    localStorage.setItem('currentSemester', name);
    mainTitle.textContent = name;
    updateSubjectForm();
    loadSubjects();
}

const resetView = () => {
    currentSemester = null;
    localStorage.removeItem('currentSemester');
    mainTitle.textContent = 'Inicio';
    updateSubjectForm();
    loadSubjects();
}

const sortSemesters = () => {
    const containers = [...document.querySelectorAll('.cursados .container')];
    containers.sort((a, b) => a.querySelector('a').textContent.localeCompare(b.querySelector('a').textContent));
    containers.forEach(c => cursados.appendChild(c));
}

const loadSemesters = () => {
    const data = JSON.parse(localStorage.getItem('semesters')) || [];
    data.forEach(item => {
        semestres++;
        cursados.innerHTML += `
        <div class="container ${item.priority ? 'priority' : ''}" id="${semestres}">
            <a href="#" class="semesterLink">${item.name}</a>
            <div class="dropdown">
                <button class="opciones"><i class="fa-solid fa-ellipsis"></i></button>
                <div class="content">
                    <button class="prioridad"><i class="fa-solid fa-arrow-up-long"></i><span>Semestre Actual</span></button>
                    <button class="renameSemester"><i class="fa-solid fa-pen"></i><span>Renombrar</span></button>
                    <button class="borrar"><i class="fa-solid fa-trash"></i><span>Borrar</span></button>
                </div>
            </div>
        </div>`;
    });
    sortSemesters();
    updateActual();
}

const addSemester = () => {
    if (!input.value.trim()) return;
    semestres++;
    const newValue = input.value.trim();
    cursados.innerHTML += `
    <div class="container" id="${semestres}">
        <a href="#" class="semesterLink">${newValue}</a>
        <div class="dropdown">
            <button class="opciones"><i class="fa-solid fa-ellipsis"></i></button>
            <div class="content">
                <button class="prioridad"><i class="fa-solid fa-arrow-up-long"></i><span>Semestre Actual</span></button>
                <button class="renameSemester"><i class="fa-solid fa-pen"></i><span>Renombrar</span></button>
                <button class="borrar"><i class="fa-solid fa-trash"></i><span>Borrar</span></button>
            </div>
        </div>
    </div>`;
    input.value = '';
    sortSemesters();
    saveSemesters();
}

document.getElementById('addSemester').addEventListener('click', addSemester);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addSemester(); } });

//-------------MATERIAS-------------
const materias = document.querySelector('.materias');
let materiaCount = 0;
const inputMateria = document.querySelector('.newSubject input[type="text"]');

const saveSubjects = () => {
    if (!currentSemester) return;
    const data = [...document.querySelectorAll('.materias .m')].map(m => ({
        name: m.querySelector('a').textContent,
        color: m.style.backgroundColor || ''
    }));
    localStorage.setItem(`subjects_${currentSemester}`, JSON.stringify(data));
}

const loadSubjects = () => {
    materias.innerHTML = '';
    if (!currentSemester) return;
    const data = JSON.parse(localStorage.getItem(`subjects_${currentSemester}`)) || [];
    data.forEach(item => {
        materiaCount++;
        materias.innerHTML += `
        <div class="m" id="m${materiaCount}" style="background-color: ${item.color || '#202020'}">
            <a href="subject.html">${item.name}</a>
            <div class="dropdown">
                <button class="opciones"><i class="fa-solid fa-ellipsis"></i></button>
                <div class="content">
                    <button class="renameMateria"><i class="fa-solid fa-pen"></i><span>Renombrar</span></button>
                    <button class="borrarMateria"><i class="fa-solid fa-trash"></i><span>Borrar</span></button>
                </div>
            </div>
        </div>`;
    });
}

const addSubject = () => {
    if (!inputMateria.value.trim() || !currentSemester) return;
    materiaCount++;
    const newValue = inputMateria.value.trim();
    materias.innerHTML += `
    <div class="m" id="m${materiaCount}">
        <a href="subject.html">${newValue}</a>
        <div class="dropdown">
            <button class="opciones"><i class="fa-solid fa-ellipsis"></i></button>
            <div class="content">
                <button class="renameMateria"><i class="fa-solid fa-pen"></i><span>Renombrar</span></button>
                <button class="borrarMateria"><i class="fa-solid fa-trash"></i><span>Borrar</span></button>
            </div>
        </div>
    </div>`;
    inputMateria.value = '';
    saveSubjects();
}

document.getElementById('addSubject').addEventListener('click', addSubject);
inputMateria.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } });

//-------------MODAL-------------
let deleteCallback = null;
const modal = document.getElementById('modal');

const showModal = (callback) => {
    deleteCallback = callback;
    modal.classList.add('open');
    document.querySelectorAll('.content').forEach(d => d.style.display = 'none');
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

//-------------CLICKS-------------
document.addEventListener('click', (e) => {
    if (e.target.closest('.borrar')) {
        const container = e.target.closest('.container');
        showModal(() => {
            container.remove();
            saveSemesters();
            updateActual();
        });
    } else if (e.target.closest('.prioridad')) {
        document.querySelectorAll('.container').forEach(c => c.classList.remove('priority'));
        e.target.closest('.container').classList.toggle('priority');
        saveSemesters();
        updateActual();
    } else if (e.target.closest('.borrarMateria')) {
        const m = e.target.closest('.m');
        showModal(() => {
            m.remove();
            saveSubjects();
        });
    } else if (e.target.closest('.semesterLink')) {
        e.preventDefault();
        const name = e.target.closest('.semesterLink').textContent;
        loadSemesterView(name);
    } else if (e.target.closest('.actualLink')) {
        e.preventDefault();
        const name = e.target.closest('.actualLink').textContent;
        loadSemesterView(name);
    } else if (e.target.closest('.opciones')) {
        const content = e.target.closest('.dropdown').querySelector('.content');
        const isOpen = content.style.display === 'block';
        document.querySelectorAll('.content').forEach(d => d.style.display = 'none');
        content.style.display = isOpen ? 'none' : 'block';
    } else if (e.target.closest('.renameSemester')) {
        const container = e.target.closest('.container');
        const link = container.querySelector('a');
        const dropdown = container.querySelector('.dropdown');
        const currentName = link.textContent;
        link.style.display = 'none';
        dropdown.style.display = 'none';

        const inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.value = currentName;
        inputEl.classList.add('nombre');

        const confirmBtn = document.createElement('button');
        confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        confirmBtn.classList.add('guardar');
        confirmBtn.id = 'confirm';

        const cancelBtn = document.createElement('button');
        cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        cancelBtn.classList.add('guardar');
        cancelBtn.id = 'cancel';

        container.insertBefore(inputEl, dropdown);
        container.insertBefore(confirmBtn, dropdown);
        container.insertBefore(cancelBtn, dropdown);
        inputEl.focus();

        const cancelRename = () => {
            link.style.display = '';
            dropdown.style.display = '';
            inputEl.remove();
            confirmBtn.remove();
            cancelBtn.remove();
        }

        const confirmRename = () => {
            if (inputEl.value.trim()) {
                link.textContent = inputEl.value.trim();
                sortSemesters();
                saveSemesters();
                updateActual();
            }
            link.style.display = '';
            dropdown.style.display = '';
            inputEl.remove();
            confirmBtn.remove();
            cancelBtn.remove();
        }

        confirmBtn.addEventListener('click', (e) => { e.stopPropagation(); confirmRename(); });
        cancelBtn.addEventListener('click', (e) => { e.stopPropagation(); cancelRename(); });
        inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); confirmRename(); } if (e.key === 'Escape') { cancelRename(); } });

    } else if (e.target.closest('.renameMateria')) {
        const m = e.target.closest('.m');
        const link = m.querySelector('a');
        const dropdown = m.querySelector('.dropdown');
        const currentName = link.textContent;
        link.style.display = 'none';
        dropdown.style.display = 'none';

        const inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.value = currentName;
        inputEl.classList.add('nombre');

        const confirmBtn = document.createElement('button');
        confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        confirmBtn.classList.add('guardar');
        confirmBtn.id = 'confirm';

        const cancelBtn = document.createElement('button');
        cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        cancelBtn.classList.add('guardar');
        cancelBtn.id = 'cancel';

        m.insertBefore(inputEl, dropdown);
        m.insertBefore(confirmBtn, dropdown);
        m.insertBefore(cancelBtn, dropdown);
        inputEl.focus();

        const cancelRename = () => {
            link.style.display = '';
            dropdown.style.display = '';
            inputEl.remove();
            confirmBtn.remove();
            cancelBtn.remove();
        }

        const confirmRename = () => {
            if (inputEl.value.trim()) {
                link.textContent = inputEl.value.trim();
                saveSubjects();
            }
            link.style.display = '';
            dropdown.style.display = '';
            inputEl.remove();
            confirmBtn.remove();
            cancelBtn.remove();
        }

        confirmBtn.addEventListener('click', (e) => { e.stopPropagation(); confirmRename(); });
        cancelBtn.addEventListener('click', (e) => { e.stopPropagation(); cancelRename(); });
        inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); confirmRename(); } if (e.key === 'Escape') { cancelRename(); } });

    } else {
        document.querySelectorAll('.content').forEach(d => d.style.display = 'none');
    }
});

//-------------INIT-------------
loadSemesters();

const semesters = JSON.parse(localStorage.getItem('semesters')) || [];

if (semesters.length === 0) {
    resetView();
} else if (currentSemester) {
    const exists = semesters.find(s => s.name === currentSemester);
    if (exists) {
        mainTitle.textContent = currentSemester;
        loadSubjects();
    } else {
        resetView();
    }
} else {
    const priority = semesters.find(s => s.priority);
    if (priority) loadSemesterView(priority.name);
}

updateSubjectForm();