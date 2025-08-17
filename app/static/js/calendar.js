const calendarDays = document.getElementById('calendarDays');
const monthYear = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let today = new Date();
updateHeadings(today);
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDateAppointment = null;
let selectedDate = null;

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
            document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
            dayBox.classList.add('selected');

            selectedDate = new Date(year, month, day);
            const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };

            const timeslotHeading = document.getElementById('selectedDate');
            const appointmentHeading = document.getElementById('selectedDateAppointment');

            if (timeslotHeading) {
                timeslotHeading.textContent = selectedDate.toLocaleDateString('en-US', options);
            }
            if (appointmentHeading) {
                appointmentHeading.textContent = selectedDate.toLocaleDateString('en-US', options);
            }

            console.log('Selected date:', selectedDate);
        });

        calendarDays.appendChild(dayBox);
    }
}

// Attach month navigation listeners **outside the function**
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

// Initial render
renderCalendar(currentMonth, currentYear);


document.addEventListener('DOMContentLoaded', () => {
    const appointmentBtns = document.querySelectorAll('.appointment-btn');
    const proceedBtn = document.getElementById('proceedBtn-emel');

    appointmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            appointmentBtns.forEach(b => b.classList.remove('date'));
            btn.classList.add('date');
            proceedBtn.classList.remove('hidden');

            const selectedTime = btn.dataset.time;
            console.log('Selected time:', selectedTime);
        });
    });
});