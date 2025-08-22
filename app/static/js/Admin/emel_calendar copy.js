document.addEventListener("DOMContentLoaded", () => {
  const monthYearEl = document.getElementById("calendarMonthYear");
  const dailyDateEl = document.getElementById("dailyScheduleDate");
  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");
  const daysContainer = document.getElementById("calendarDays");
  const scheduleContainer = document.querySelector('.space-y-2');

  let currentDate = new Date();
  let selectedCell = null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fixed time slots (matching backend)
  const timeSlots = [
    { '24h': '09:00', 'label': '9:00 AM' },
    { '24h': '10:00', 'label': '10:00 AM' },
    { '24h': '11:00', 'label': '11:00 AM' },
    { '24h': '13:00', 'label': '1:00 PM' },
    { '24h': '14:00', 'label': '2:00 PM' },
    { '24h': '15:00', 'label': '3:00 PM' },
    { '24h': '16:00', 'label': '4:00 PM' },
    { '24h': '17:00', 'label': '5:00 PM' },
  ];

  async function updateDailySchedule(date) {
    try {
      const response = await fetch(`/admin/emel-appointments/${encodeURIComponent(date)}`);
      const booked = await response.json();

      let html = '';
      timeSlots.forEach(slot => {
        if (booked[slot['24h']]) {
          html += `
            <div class="time-slot booked flex items-center justify-between p-3 rounded">
              <span class="font-medium">${slot.label}</span>
              <div class="text-right">
                <div class="text-sm font-semibold">${booked[slot['24h']].full_name}</div>
                <div class="text-xs text-gray-600">${booked[slot['24h']].service}</div>
              </div>
            </div>
          `;
        } else {
          html += `
            <div class="time-slot available flex items-center justify-between p-3 rounded">
              <span class="font-medium">${slot.label}</span>
              <span class="text-sm text-green-600">Available</span>
            </div>
          `;
        }
      });
      scheduleContainer.innerHTML = html;
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  }

  async function fetchAppointmentCounts(year, month) {
    try {
      const response = await fetch(`/admin/emel-appointments-count/${year}/${month + 1}`);
      return await response.json();
    } catch (err) {
      console.error("Failed to fetch appointment counts:", err);
      return {};
    }
  }

  async function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthYearText = `${monthNames[month]} ${year}`;
    monthYearEl.textContent = monthYearText;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month, daysInMonth).getDay();
    const today = new Date();

    daysContainer.innerHTML = "";

    const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
    for (let i = firstDay; i > 0; i--) {
      const prevDayDiv = document.createElement("div");
      prevDayDiv.textContent = lastDayOfPrevMonth - i + 1;
      prevDayDiv.className = "h-[90px] border border-gray-600 bg-gray-900 text-gray-500 p-2 rounded";
      daysContainer.appendChild(prevDayDiv);
    }

    const appointmentsPerDay = await fetchAppointmentCounts(year, month);

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = day;
      dayDiv.className = "h-[90px] border border-black bg-gray-200 p-2 rounded hover:bg-gray-400 hover:text-black hover:border-black cursor-pointer";

      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayDiv.classList.add("bg-green-200", "text-black");
        dailyDateEl.textContent = `${monthNames[month]} ${day}, ${year}`;
      }

      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      dayDiv.dataset.date = dateKey;

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

      dayDiv.addEventListener("click", async () => {
        if (selectedCell) {
          selectedCell.classList.remove("ring-4", "ring-blue-500");
          selectedCell.setAttribute("aria-selected", "false");
        }
        dayDiv.classList.add("ring-4", "ring-blue-500");
        dayDiv.setAttribute("aria-selected", "true");
        selectedCell = dayDiv;
        dailyDateEl.textContent = `${monthNames[month]} ${day}, ${year}`;
        await updateDailySchedule(dateKey);
      });

      daysContainer.appendChild(dayDiv);
    }

    const nextDays = 6 - lastDay;
    for (let i = 1; i <= nextDays; i++) {
      const nextDayDiv = document.createElement("div");
      nextDayDiv.textContent = i;
      nextDayDiv.className = "h-[90px] border border-gray-600 bg-gray-900 text-gray-500 p-2 rounded";
      daysContainer.appendChild(nextDayDiv);
    }
  }

  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
  });

  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
  });

  // Initial setup
  const todayIso = currentDate.toISOString().split('T')[0];
  updateDailySchedule(todayIso);
  updateCalendar();
});