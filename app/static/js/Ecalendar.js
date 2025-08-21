const calendarDays = document.getElementById('calendarDays');
const monthYear = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const proceedBtn = document.getElementById('proceedBtn-emel');
const timeSlotHeading = document.getElementById("timeSlot");
const hiddenDate = document.getElementById('hiddenDate');
const hiddenTime = document.getElementById('hiddenTime');

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = null;
let selectedTime = null;

// Initial setup
renderCalendar(currentMonth, currentYear);
updateHeadings(today);
initTimeSlotHandlers();

const todayIso = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
selectedDate = todayIso;
hiddenDate.value = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// Mark today as selected
const todayBox = calendarDays.querySelector(`.day[data-date="${todayIso}"]`);
if (todayBox) todayBox.classList.add('selected');

// Initial button update for today
updateBookedTimeSlots(todayIso);

updateHeadings(today);
checkIfReadyToProceed();

/* ----------------- HELPERS ----------------- */
function formatTimeLabel(t) {
    if (!t) return '';
    if (/am|pm/i.test(t)) return t.trim().toUpperCase();
    const [hStr, mStr = '00'] = t.split(':');
    let h = parseInt(hStr, 10);
    const mer = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mStr} ${mer}`;
}

function updateTimeSlotHeading(timeText) {
    if (timeText) timeSlotHeading.textContent = timeText;
    else timeSlotHeading.textContent = "-Select Time-";
}

function updateHeadings(date) {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const timeslotHeading = document.getElementById('selectedDate');
    const appointmentHeading = document.getElementById('selectedDateAppointment');

    if (timeslotHeading) timeslotHeading.textContent = date.toLocaleDateString('en-US', options);
    if (appointmentHeading) appointmentHeading.textContent = date.toLocaleDateString('en-US', options);
}

function checkIfReadyToProceed() {
    if (selectedDate && selectedTime) proceedBtn.classList.remove('hidden');
    else proceedBtn.classList.add('hidden');
}

/* ----------------- TIME SLOT HANDLERS ----------------- */
function initTimeSlotHandlers() {
    const appointmentBtns = document.querySelectorAll('.appointment-btn');

    appointmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return; // skip if disabled

            appointmentBtns.forEach(b => b.classList.remove('time'));
            btn.classList.add('time');

            selectedTime = btn.dataset.time; // keep 24-hour format for logic
            const formattedTime = formatTimeLabel(selectedTime);
            updateTimeSlotHeading(formattedTime);

            hiddenTime.value = selectedTime; // store 24-hour time for submission
            checkIfReadyToProceed();
        });
    });
}

/* ----------------- DYNAMIC BOOKED TIMES ----------------- */
async function updateBookedTimeSlots(date) {
    const barber = "Emel Calomos"; // adjust if needed
    try {
        const response = await fetch(`/emel-calendar/times/${encodeURIComponent(barber)}/${encodeURIComponent(date)}`);
        const bookedTimes = await response.json(); // array of 24-hour strings

        document.querySelectorAll('.appointment-btn').forEach(btn => {
            if (bookedTimes.includes(btn.dataset.time)) {
                btn.disabled = true;
                btn.classList.add('bg-gray-400', 'cursor-not-allowed');
                btn.title = "Already booked";
            } else {
                btn.disabled = false;
                btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
                btn.title = "";
            }
        });
    } catch (err) {
        console.error("Failed to fetch booked times:", err);
    }
}

/* ----------------- CALENDAR RENDER ----------------- */
function renderCalendar(month, year) {
    calendarDays.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
    monthYear.textContent = monthName + ' ' + year;

    for (let i = 0; i < firstDay; i++) {
        const emptyBox = document.createElement('div');
        emptyBox.classList.add('day', 'invisible');
        calendarDays.appendChild(emptyBox);
    }

    for (let day = 1; day <= lastDate; day++) {
        const dayBox = document.createElement('div');
        dayBox.textContent = day;
        dayBox.classList.add('day', 'text-center');

        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayBox.classList.add('today');
        }

        const isoMonth = String(month + 1).padStart(2, '0');
        const isoDay = String(day).padStart(2, '0');
        const isoDate = `${year}-${isoMonth}-${isoDay}`;
        dayBox.dataset.date = isoDate;

        dayBox.addEventListener('click', async () => {
            document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
            dayBox.classList.add('selected');

            selectedDate = isoDate;

            const wordedDate = new Date(year, month, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            hiddenDate.value = wordedDate;

            updateHeadings(new Date(year, month, day));

            // reset time selection
            document.querySelectorAll('.appointment-btn').forEach(b => b.classList.remove('time'));
            selectedTime = null;
            updateTimeSlotHeading(null);
            hiddenTime.value = '';

            // fetch booked times for this date
            await updateBookedTimeSlots(isoDate);

            checkIfReadyToProceed();
        });

        calendarDays.appendChild(dayBox);
    }
}

/* ----------------- MONTH NAVIGATION ----------------- */
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});
