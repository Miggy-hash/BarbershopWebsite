document.addEventListener("DOMContentLoaded", function() {
    const calendarEl = document.getElementById("calendar");
    const monthNameEl = document.getElementById("monthName");
    const prevBtn = document.getElementById("prevMonth");
    const nextBtn = document.getElementById("nextMonth");

    let today = new Date(); // Current date
    let displayedMonth = today.getMonth();
    let displayedYear = today.getFullYear();

    function renderCalendar(month, year) {
        calendarEl.innerHTML = "";

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun

        // Adjust so week starts on Monday
        const startDay = firstDay === 0 ? 6 : firstDay - 1;

        // Month Name
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'];
        monthNameEl.textContent = `${monthNames[month]} ${year}`;

        // Previous month's trailing days
        const prevDays = new Date(year, month, 0).getDate();
        for (let i = startDay; i > 0; i--) {
            const dayEl = document.createElement("div");
            dayEl.textContent = prevDays - i + 1;
            dayEl.className = "text-center cursor-pointer rounded-md hover:bg-blue-100 transition duration-150 aspect-square flex items-center justify-center";
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

            calendarEl.appendChild(dayEl);
        }

        // Fill remaining grid to keep layout consistent
        const totalCells = startDay + daysInMonth;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 0; i < remaining; i++) {
            const dayEl = document.createElement("div");
            dayEl.textContent = "";
            calendarEl.appendChild(dayEl);
        }
    }

    // Navigation
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
});
