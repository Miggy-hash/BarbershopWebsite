console.log("✅ appointment.js is loaded!");
document.addEventListener("DOMContentLoaded", function() {
    const calendarEl = document.getElementById("calendar");
    const monthNameEl = document.getElementById("monthName");
    const prevBtn = document.getElementById("prevMonth");
    const nextBtn = document.getElementById("nextMonth");
    const selectedDateEl = document.getElementById("selectedDate");

    let today = new Date(); // Current date
    let displayedMonth = today.getMonth();
    let displayedYear = today.getFullYear();
    let selectedDay = today.getDate(); // Default selected day is today

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function renderCalendar(month, year) {
        calendarEl.innerHTML = "";

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun

        // Adjust so week starts on Monday
        const startDay = firstDay === 0 ? 6 : firstDay - 1;

        // Update month name
        monthNameEl.textContent = `${monthNames[month]} ${year}`;

        // Previous month's trailing days
        const prevDays = new Date(year, month, 0).getDate();
        for (let i = startDay; i > 0; i--) {
            const dayEl = document.createElement("div");
            dayEl.textContent = prevDays - i + 1;
            dayEl.className = "text-gray-400 text-center cursor-pointer rounded-md aspect-square flex items-center justify-center";
            calendarEl.appendChild(dayEl);
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement("div");
            dayEl.textContent = i;
            dayEl.className = "text-center cursor-pointer rounded-md hover:bg-blue-100 transition duration-150 aspect-square flex items-center justify-center";

            // Highlight today
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayEl.classList.add("bg-blue-400", "text-white", "font-bold");
            }

            // Highlight selected day
            if (i === selectedDay && month === displayedMonth && year === displayedYear) {
                dayEl.classList.add("bg-blue-200");
            }

            // Click event to select day
            dayEl.addEventListener("click", () => {
                selectedDay = i;

                // Update the display in appointment section
                const clickedDate = new Date(year, month, i);
                const dayName = dayNames[clickedDate.getDay()];
                selectedDateEl.textContent = `${dayName} - ${monthNames[month]} ${i}, ${year}`;

                // Remove highlight from other days
                calendarEl.querySelectorAll("div").forEach(d => d.classList.remove("bg-blue-200"));

                // Highlight clicked day
                dayEl.classList.add("bg-blue-200");
            });

            calendarEl.appendChild(dayEl);
        }

        // Fill remaining grid for consistent layout
        const totalCells = startDay + daysInMonth;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 0; i < remaining; i++) {
            const dayEl = document.createElement("div");
            dayEl.textContent = "";
            calendarEl.appendChild(dayEl);
        }
    }

    // Navigation buttons
    prevBtn.addEventListener("click", () => {
        displayedMonth--;
        if (displayedMonth < 0) {
            displayedMonth = 11;
            displayedYear--;
        }
        renderCalendar(displayedMonth, displayedYear);
    });

    nextBtn.addEventListener("click", () => {
        displayedMonth++;
        if (displayedMonth > 11) {
            displayedMonth = 0;
            displayedYear++;
        }
        renderCalendar(displayedMonth, displayedYear);
    });

    // Initial render
    renderCalendar(displayedMonth, displayedYear);

    // Initialize the selected date display
    const todayName = dayNames[today.getDay()];
    selectedDateEl.textContent = `${todayName} - ${monthNames[displayedMonth]} ${today.getDate()}, ${displayedYear}`;
});

