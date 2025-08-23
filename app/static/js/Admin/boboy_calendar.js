document.addEventListener("DOMContentLoaded", () => {
  const monthYearEl = document.getElementById("calendarMonthYear");
  const dailyDateEl = document.getElementById("dailyScheduleDate");
  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");
  const daysContainer = document.getElementById("calendarDays");
  const scheduleContainer = document.querySelector('.space-y-2');
  const appointmentDetails = document.getElementById("appointmentDetails");
  let currentDate = new Date();
  let selectedCell = null;
  let activeSlot = null; // Track the currently active booked slot

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
      const response = await fetch(`/admin/boboy-appointments/${encodeURIComponent(date)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const booked = await response.json();

      let html = '';
      timeSlots.forEach(slot => {
        if (booked[slot['24h']]) {
          // Convert time to 12-hour format for display
          const [hours, minutes] = slot['24h'].split(':');
          const hourNum = parseInt(hours, 10);
          const ampm = hourNum >= 12 ? 'PM' : 'AM';
          const displayHour = hourNum % 12 || 12;
          const displayTime = `${displayHour}:${minutes} ${ampm}`;
          
          html += `
            <div class="time-slot booked flex items-center justify-between p-3 rounded" data-appointment='${JSON.stringify(booked[slot['24h']])}'>
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

      // Add click handlers to booked slots
      const bookedSlots = document.querySelectorAll('.time-slot.booked');
      bookedSlots.forEach(slot => {
        slot.addEventListener('click', () => {
          console.log('Raw data-appointment:', slot.dataset.appointment);
          try {
            const appointment = JSON.parse(slot.dataset.appointment);
            // Toggle visibility if clicking the same slot
            if (activeSlot === slot && !appointmentDetails.classList.contains('hidden')) {
              appointmentDetails.classList.add('hidden');
              activeSlot = null;
            } else {
              showAppointmentDetails(appointment);
              activeSlot = slot;
            }
          } catch (err) {
            console.error('Failed to parse data-appointment:', err);
            appointmentDetails.innerHTML = '<p class="text-red-600">Error loading appointment details</p>';
            appointmentDetails.classList.remove('hidden');
            activeSlot = slot;
          }
        });
      });
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  }

  function showAppointmentDetails(appointment) {
    // Check if appointmentDetails exists
    if (!appointmentDetails) {
      console.error('appointmentDetails div not found');
      return;
    }

    // Check DOM elements before updating
    const elements = {
      fullName: document.getElementById('detailsFullName'),
      cellphone: document.getElementById('detailsCellphone'),
      email: document.getElementById('detailsEmail'),
      barber: document.getElementById('detailsBarber'),
      service: document.getElementById('detailsService'),
      time: document.getElementById('detailsTime'),
      date: document.getElementById('detailsDate')
    };

    // Log missing elements
    for (const [key, element] of Object.entries(elements)) {
      if (!element) {
        console.error(`Element with ID 'details${key.charAt(0).toUpperCase() + key.slice(1)}' not found`);
      }
    }

    // Update only if elements exist
    if (elements.fullName) elements.fullName.textContent = appointment.full_name || 'N/A';
    if (elements.cellphone) elements.cellphone.textContent = appointment.cellphone || 'N/A';
    if (elements.email) elements.email.textContent = appointment.email || 'N/A';
    if (elements.barber) elements.barber.textContent = appointment.barber || 'N/A';
    if (elements.service) elements.service.textContent = appointment.service || 'N/A';
    if (elements.time) {
      const [hours, minutes] = (appointment.time || '00:00').split(':');
      const hourNum = parseInt(hours, 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      elements.time.textContent = `${displayHour}:${minutes} ${ampm}`;
    }
    if (elements.date) elements.date.textContent = appointment.date || 'N/A';

    // Show details div
    appointmentDetails.classList.remove('hidden');
  }

  async function fetchAppointmentCounts(year, month) {
    try {
      const response = await fetch(`/admin/boboy-appointments-count/${year}/${month + 1}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
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
      prevDayDiv.className = "h-[50px] w-[auto] sm:h-[65px] md:h-[60px] lg:h-[90px] border border-gray-600 bg-gray-900 text-gray-500 p-1 rounded text-sm sm:text-sm md:text-base lg:text-lg xl:text-xl";
      daysContainer.appendChild(prevDayDiv);
    }

    const appointmentsPerDay = await fetchAppointmentCounts(year, month);

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = day;
      dayDiv.className = "h-[50px] w-[auto] sm:h-[65px] md:h-[60px] lg:h-[90px] border border-black bg-gray-200 p-1 rounded cursor-pointer text-sm sm:text-sm md:text-base lg:text-lg xl:text-xl";

      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayDiv.classList.add("ring-4", "ring-red-500");
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
          selectedCell.classList.remove("ring-4", "ring-red-500");
          selectedCell.setAttribute("aria-selected", "false");
        }
        dayDiv.classList.add("ring-4", "ring-red-500");
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
      nextDayDiv.className = "h-[50px] w-[auto] sm:h-[65px] md:h-[60px] lg:h-[90px] border border-gray-600 bg-gray-900 text-gray-500 p-1 rounded text-sm sm:text-sm md:text-base lg:text-lg xl:text-xl";
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