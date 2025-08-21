document.addEventListener("DOMContentLoaded", () => {
  const monthYearEl = document.getElementById("calendarMonthYear");
  const dailyDateEl = document.getElementById("dailyScheduleDate");
  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");

  let currentDate = new Date();
  let selectedCell = null;

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


function updateCalendar() {
  const monthYearText = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  monthYearEl.textContent = monthYearText;
  dailyDateEl.textContent = `${monthYearText}`;
  selectedCell = null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month, daysInMonth).getDay();

  const daysContainer = document.getElementById("calendarDays");
  daysContainer.innerHTML = "";

  const today = new Date();
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate(); // Last day of previous month

  for (let i = firstDay; i > 0; i--) {
    const prevDayDiv = document.createElement("div");
    prevDayDiv.textContent = lastDayOfPrevMonth - i + 1;
    prevDayDiv.className = "h-[90px] border border-gray-600 bg-gray-900 text-gray-500 p-2 rounded";
    daysContainer.appendChild(prevDayDiv);
  }
  
    const appointmentsPerDay = {
      "2025-08-21": 5,
      "2025-08-25": 2
    };


    for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.textContent = day;
    dayDiv.className = "h-[90px] border border-black bg-gray-200 p-2 rounded hover:bg-gray-400 hover:text-black hover:border-black cursor-pointer";

        if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayDiv.classList.add("bg-green-200", "text-black"); 
       dailyDateEl.textContent = `${monthNames[month]} ${day}, ${year}`;
    }


    const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    if (appointmentsPerDay[dateKey]) {
      const badge = document.createElement("div");
      badge.className = "appointment-badge";

      const number = document.createElement("span");
      number.textContent = appointmentsPerDay[dateKey];

      const line = document.createElement("div");
      line.className = "appointment-line";

      badge.appendChild(number);
      badge.appendChild(line);

      dayDiv.classList.add("relative");
      dayDiv.appendChild(badge);
    }

      dayDiv.addEventListener("click", () => {
         if (selectedCell) {
            selectedCell.classList.remove("ring-4", "ring-blue-500");
            selectedCell.setAttribute("aria-selected", "false");
          }
          dayDiv.classList.add("ring-4", "ring-blue-500");
          dayDiv.setAttribute("aria-selected", "true");
            selectedCell = dayDiv;
        dailyDateEl.textContent = `${monthNames[month]} ${day}, ${year}`;
      });

    daysContainer.appendChild(dayDiv);
  }

    const nextDays = 6 - lastDay; // number of empty divs after last day
  for (let i = 1; i <= nextDays; i++) {
    const nextDayDiv = document.createElement("div");
    nextDayDiv.textContent = i;
    nextDayDiv.className = "h-[90px] border border-gray-600 bg-gray-900 text-gray-500 p-2 rounded";
    daysContainer.appendChild(nextDayDiv);
  }
}



 prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1); // Go back one month
  updateCalendar();
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1); // Go forward one month
  updateCalendar();
});

  updateCalendar();

});