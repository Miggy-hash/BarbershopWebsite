document.addEventListener("DOMContentLoaded", () => {
  const monthYearEl = document.getElementById("calendarMonthYear");
  const dailyDateEl = document.getElementById("dailyScheduleDate");
  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");

  let currentDate = new Date();

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function updateCalendar() {
  const monthYearText = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  monthYearEl.textContent = monthYearText;
  dailyDateEl.textContent = `${monthYearText}`;

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

    for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.textContent = day;
    dayDiv.className = "h-[90px] border border-black bg-white p-2 rounded hover:bg-gray-400 cursor-pointer";

        if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayDiv.classList.add("bg-blue-300"); 
       dailyDateEl.textContent = `${monthNames[month]} ${day}, ${year}`;
    }

      dayDiv.addEventListener("click", () => {
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