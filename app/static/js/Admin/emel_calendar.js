document.addEventListener("DOMContentLoaded", () => {
  const monthYearEl = document.getElementById("calendarMonthYear");
  const dailyDateEl = document.getElementById("dailyScheduleDate");
  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");
  const daysContainer = document.getElementById("calendarDays");
  const scheduleContainer = document.querySelector('.space-y-2');
  const appointmentDetails = document.getElementById("appointmentDetails");
  const addAppointmentBtn = document.getElementById("addAppointmentBtn");
  const removeAppointmentBtn = document.getElementById("removeAppointmentBtn");
  const addModal = document.getElementById("addAppointmentModal");
  const removeModal = document.getElementById("removeAppointmentModal");
  const confirmModal = document.getElementById("confirmRemoveModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const addModalClose = document.getElementById("addModalClose");
  const removeModalClose = document.getElementById("removeModalClose");
  const confirmModalClose = document.getElementById("confirmModalClose");
  const addAppointmentForm = document.getElementById("addAppointmentForm");
  const removeAppointmentForm = document.getElementById("removeAppointmentForm");
  const confirmRemoveBtn = document.getElementById("confirmRemoveBtn");
  const cancelRemoveBtn = document.getElementById("cancelRemoveBtn");
  const addDateSelect = document.getElementById("addDate");
  const removeDateSelect = document.getElementById("removeDate");
  let currentDate = new Date();
  let selectedCell = null;
  let activeSlot = null;
  let pendingDelete = null;
  let isCalendarUpdating = false;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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

  // Initialize Socket.IO
  const socket = io('http://127.0.0.1:5000', {
    transports: ['websocket']
}); // Adjust URL if needed

// ... (other code unchanged)

// Helper function to parse "Month DD, YYYY" to ISO format
function parseDateToISO(dateStr) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    // Check if date is in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        try {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day) {
                return dateStr; // Already in ISO format
            }
        } catch (err) {
            return null;
        }
    }
    // Handle Month DD, YYYY format
    const [monthName, day, year] = dateStr.split(' ');
    const month = monthNames.indexOf(monthName);
    if (month === -1 || !day || !year) {
        return null;
    }
    const cleanDay = parseInt(day.replace(',', '')); // Remove comma
    const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(cleanDay).padStart(2, '0')}`;
    return isoDate;
}

socket.on('slot_booked', (data) => {
    if (data.barber !== 'Emel Calomos') {
        return;
    }
    const eventDate = data.date.trim();
    const selectedDate = dailyDateEl.textContent.trim();
    const isoDate = parseDateToISO(eventDate);
    if (!isoDate) {
        return;
    }
    if (eventDate === selectedDate) {
        updateDailySchedule(eventDate);
    }
    updateCalendar();
});

socket.on('slot_deleted', (data) => {
    if (data.barber !== 'Emel Calomos') {
        return;
    }
    const eventDate = data.date.trim();
    const selectedDate = dailyDateEl.textContent.trim();
    const isoDate = parseDateToISO(eventDate);
    if (!isoDate) {
        return;
    }
    if (eventDate === selectedDate) {
        updateDailySchedule(eventDate);
    }
    // Remove redundant updateCalendar call here, handled by confirmRemoveBtn
});

// ... (rest of the code unchanged)

  // Populate date dropdowns
  function populateDateDropdown(selectElement) {
    selectElement.innerHTML = '';
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const formatted = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      const option = document.createElement('option');
      option.value = formatted;
      option.textContent = formatted;
      selectElement.appendChild(option);
    }
  }

  // Fetch booked times for a date and barber
async function fetchBookedTimes(date) {
    const isoDate = parseDateToISO(date); // Convert to YYYY-MM-DD
    if (!isoDate) {
        return {};
    }
    const endpoint = `/admin/${window.APPOINTMENT_ENDPOINT}/${encodeURIComponent(isoDate)}`;
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (err) {
        return {};
    }
}

  // Update time checkboxes for Add Appointment
async function updateAddTimeCheckboxes() {
    const date = addDateSelect.value;
    const isoDate = parseDateToISO(date); // Convert to YYYY-MM-DD
    if (!isoDate) {
        return;
    }
    const barber = document.getElementById('barber').value;
    const booked = await fetchBookedTimes(isoDate); // Use ISO date
    const checkboxes = document.querySelectorAll('#addTimeCheckboxes input[name="time"]');
    checkboxes.forEach(checkbox => {
        const isBooked = booked[checkbox.value] !== undefined && booked[checkbox.value] !== null;
        checkbox.disabled = isBooked; // Disable if booked
        checkbox.checked = false;
    });
}

  // Update time checkboxes for Remove Appointment
async function updateRemoveTimeCheckboxes() {
    const date = removeDateSelect.value;
    const booked = await fetchBookedTimes(date);
    const checkboxes = document.querySelectorAll('#removeTimeCheckboxes input[name="time"]');
    checkboxes.forEach(checkbox => {
        const isBooked = booked[checkbox.value] !== undefined && booked[checkbox.value] !== null;
        checkbox.disabled = !isBooked;
        checkbox.checked = false;
    });
}
function setupRemoveTimeInputs() {
    const inputs = document.querySelectorAll('#removeTimeCheckboxes input[name="time"]');
    inputs.forEach(input => {
        input.addEventListener('mousedown', (e) => {
        });
        input.addEventListener('click', (e) => {
        });
        input.addEventListener('change', (e) => {
        });
    });
}

  // Show modal
  function showModal(modal) {
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
  }

  // Hide modal
function hideModal(modal) {
    modal.style.display = 'none';
    modalOverlay.style.display = 'none'; // Always hide overlay
    // Remove blur from content
    const content = document.querySelector('main') || document.body;
    content.classList.remove('blur', 'blur-sm', 'blur-md', 'blur-lg'); // Remove Tailwind blur classes
}

  // Handle modal closes
  addModalClose.addEventListener('click', () => hideModal(addModal));
  removeModalClose.addEventListener('click', () => hideModal(removeModal));
  confirmModalClose.addEventListener('click', () => hideModal(confirmModal));
  cancelRemoveBtn.addEventListener('click', () => hideModal(confirmModal));

  // Prevent modal from closing on outside click
  modalOverlay.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Open modals
  addAppointmentBtn.addEventListener('click', () => {
    populateDateDropdown(addDateSelect);
    updateAddTimeCheckboxes();
    showModal(addModal);
  });
  removeAppointmentBtn.addEventListener('click', () => {
    populateDateDropdown(removeDateSelect);
    updateRemoveTimeCheckboxes();
    showModal(removeModal);
  });

  // Update time checkboxes on date change
  addDateSelect.addEventListener('change', updateAddTimeCheckboxes);
  removeDateSelect.addEventListener('change', updateRemoveTimeCheckboxes);

  // Handle single selection for remove time checkboxes
  document.querySelectorAll('#removeTimeCheckboxes input[name="time"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      document.querySelectorAll('#removeTimeCheckboxes input[name="time"]').forEach(cb => {
        if (cb !== checkbox) cb.checked = false;
      });
    });
  });

  let isSubmitting = false;

  // Handle Add Appointment form submission
addAppointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) {
        return;
    }
    isSubmitting = true;
    const formData = new FormData(addAppointmentForm);
    const times = formData.getAll('time');
    const data = {
        full_name: formData.get('full_name'),
        cellphone: formData.get('cellphone'),
        email: formData.get('email'),
        barber: formData.get('barber'),
        service: formData.get('service'),
        date: formData.get('date'),
        times: times
    };

    if (times.length === 0) {
        alert('Please select at least one available time slot.');
        isSubmitting = false;
        return;
    }

    try {
        const response = await fetch('/admin/add-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        if (result.success) {
            alert('Appointment(s) added successfully!');
            hideModal(addModal);
            // Update to the selected date
            const newDateStr = data.date; // e.g., "August 28, 2025"
            const [monthName, day, year] = newDateStr.split(' ');
            const monthIndex = monthNames.indexOf(monthName);
            currentDate.setFullYear(parseInt(year));
            currentDate.setMonth(monthIndex);
            currentDate.setDate(parseInt(day.replace(',', '')));
            dailyDateEl.textContent = newDateStr;
            const isoDate = parseDateToISO(newDateStr);
            try {
                await updateDailySchedule(newDateStr);
            } catch (err) {
            }
            try {
                await updateCalendar();
            } catch (err) {
            }
            socket.emit("slot_booked", {
                full_name: data.full_name,
                cellphone: data.cellphone,
                email: data.email,
                service: data.service,
                barber: data.barber,
                date: data.date,
                time: times[0]
            });
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (err) {
        alert('Failed to add appointment. Please try again.');
    } finally {
        isSubmitting = false;
    }
}, { once: true });

  // Handle Remove Appointment form submission
removeAppointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(removeAppointmentForm);
    const time = formData.get('time');
    const date = formData.get('date');
    if (!time) {
        alert('Please select a booked time slot to remove.');
        return;
    }
    const data = {
        barber: window.BARBER_NAME,
        date,
        time
    };
    pendingDelete = data;
    showModal(confirmModal);
});

  // Handle Confirm Remove
confirmRemoveBtn.addEventListener('click', async () => {
    if (!pendingDelete) return;

    try {
        const response = await fetch('/admin/remove-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingDelete),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        if (result.success) {
            alert('Appointment removed successfully!');
            hideModal(confirmModal);
            hideModal(removeAppointmentModal);
            // Update to the removed date
            const removedDateStr = pendingDelete.date; // e.g., "April 31, 2025"
            const [monthName, day, year] = removedDateStr.split(' ');
            const monthIndex = monthNames.indexOf(monthName);
            currentDate.setFullYear(parseInt(year));
            currentDate.setMonth(monthIndex);
            currentDate.setDate(parseInt(day.replace(',', '')));
            dailyDateEl.textContent = removedDateStr;
            const isoDate = parseDateToISO(removedDateStr);
            await updateDailySchedule(removedDateStr);
            if (!isCalendarUpdating) {
                isCalendarUpdating = true;
                await updateCalendar();
                isCalendarUpdating = false;
            }
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (err) {
        alert('Time slot is empty, select existing time slot!');
    }
    pendingDelete = null;
});

async function updateDailySchedule(date) {
    try {
        const isoDate = parseDateToISO(date);
        if (!isoDate) {
            return;
        }
        const endpoint = `/admin/${window.APPOINTMENT_ENDPOINT}/${encodeURIComponent(isoDate)}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const booked = await response.json();

        if (!scheduleContainer) {
            return;
        }

        let html = '';
        timeSlots.forEach(slot => {
            if (booked[slot['24h']]) {
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
                        <span class="text-sm text-black">Available</span>
                    </div>
                `;
            }
        });
        scheduleContainer.innerHTML = html;

        const bookedSlots = document.querySelectorAll('.time-slot.booked');
        bookedSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                try {
                    const appointment = JSON.parse(slot.dataset.appointment);
                    if (activeSlot === slot && !appointmentDetails.classList.contains('hidden')) {
                        appointmentDetails.classList.add('hidden');
                        activeSlot = null;
                    } else {
                        showAppointmentDetails(appointment);
                        activeSlot = slot;
                    }
                } catch (err) {
                    appointmentDetails.innerHTML = '<p class="text-red-600">Error loading appointment details</p>';
                    appointmentDetails.classList.remove('hidden');
                    activeSlot = slot;
                }
            });
        });
    } catch (err) {
    }
}

  function showAppointmentDetails(appointment) {
    if (!appointmentDetails) {
      return;
    }

    const elements = {
      fullName: document.getElementById('detailsFullName'),
      cellphone: document.getElementById('detailsCellphone'),
      email: document.getElementById('detailsEmail'),
      barber: document.getElementById('detailsBarber'),
      service: document.getElementById('detailsService'),
      time: document.getElementById('detailsTime'),
      date: document.getElementById('detailsDate')
    };

    for (const [key, element] of Object.entries(elements)) {
      if (!element) {
      }
    }

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

    appointmentDetails.classList.remove('hidden');
  }

  async function fetchAppointmentCounts(year, month) {
    try {
      const endpoint = `/admin/emel-appointments-count/${year}/${month + 1}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      return {};
    }
  }

async function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthYearText = `${monthNames[month]} ${year}`;
    monthYearEl.textContent = monthYearText;

    daysContainer.innerHTML = ""; // Clear existing content

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month, daysInMonth).getDay();
    const today = new Date();

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

        const isSelected = day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
        if (isSelected) {
            dayDiv.classList.add("bg-blue-200");
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
                selectedCell.classList.remove("ring-4", "ring-red-600");
                selectedCell.setAttribute("aria-selected", "false");
            }
            dayDiv.classList.add("ring-4", "ring-red-600");
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

  const todayIso = currentDate.toISOString().split('T')[0];
  updateDailySchedule(todayIso);
  updateCalendar();
});