const calendarDays = document.getElementById('calendarDays');
const monthYear = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const proceedBtn = document.getElementById('proceedBtn-emel');
const timeSlotHeading = document.getElementById("timeSlot");

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = null;

// Initial setup
renderCalendar(currentMonth, currentYear);
updateHeadings(today);
initTimeSlotHandlers();

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
  if (timeText) {
    timeSlotHeading.textContent = timeText;   // e.g. "9:00 AM"
  } else {
    timeSlotHeading.textContent = "-Select Time-"; // default
  }
}

function updateHeadings(date) {
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const timeslotHeading = document.getElementById('selectedDate');
  const appointmentHeading = document.getElementById('selectedDateAppointment');

  if (timeslotHeading) {
    timeslotHeading.textContent = date.toLocaleDateString('en-US', options);
  }
  if (appointmentHeading) {
    appointmentHeading.textContent = date.toLocaleDateString('en-US', options);
  }
}

/* ----------------- TIME SLOT HANDLERS ----------------- */
function initTimeSlotHandlers() {
  const appointmentBtns = document.querySelectorAll('.appointment-btn');

  appointmentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Reset all highlights
      appointmentBtns.forEach(b => b.classList.remove('time'));
      // Highlight clicked one
      btn.classList.add('time');

      // Update the <h4 id="timeSlot">
      const timeValue = btn.dataset.time || btn.textContent.trim();
      updateTimeSlotHeading(formatTimeLabel(timeValue));

      // Show proceed button
      if (proceedBtn) proceedBtn.classList.remove('hidden');
    });
  });
}

/* ----------------- CALENDAR RENDER ----------------- */
function renderCalendar(month, year) {
  calendarDays.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  monthYear.textContent = monthName + ' ' + year;

  // Empty boxes for previous month
  for (let i = 0; i < firstDay; i++) {
    const emptyBox = document.createElement('div');
    emptyBox.classList.add('day', 'invisible');
    calendarDays.appendChild(emptyBox);
  }

  // Days of the month
  for (let day = 1; day <= lastDate; day++) {
    const dayBox = document.createElement('div');
    dayBox.textContent = day;
    dayBox.classList.add('day', 'text-center');

    // Highlight today
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayBox.classList.add('today');
    }

    // Click listener
    dayBox.addEventListener('click', () => {
      // Only the clicked day stays highlighted.
      document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
      dayBox.classList.add('selected');

      // Reset selected date
      selectedDate = new Date(year, month, day);
      updateHeadings(selectedDate);

      // Reset time slot selection
      document.querySelectorAll('.appointment-btn').forEach(b => b.classList.remove('selected'));
      updateTimeSlotHeading(null); // back to "-Select Time-"

      // Hide proceed button until time is chosen
      if (proceedBtn) proceedBtn.classList.add('hidden');

      console.log('Selected date:', selectedDate);
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
