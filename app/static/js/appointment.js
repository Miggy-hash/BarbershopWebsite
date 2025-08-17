

const barberAppointments = {
    emel: `
<!-- Calendar Section -->
<div class="bg-white border rounded-xl border-gray-300 shadow-lg p-4 md:w-[600px] w-full">
    <!-- Month Name & Navigation -->
    <div class="flex items-center justify-between mb-2">
        <button id="prevMonth" class="text-xl font-bold">&lt;</button>
        <div id="monthName" class="text-center text-lg font-bold"></div>
        <button id="nextMonth" class="text-xl font-bold">&gt;</button>
    </div>
    <!-- Day Names -->
    <div class="grid grid-cols-7 text-center font-semibold text-gray-700 mb-2 bg-gray-500 border border-gray-300">
        <div class="bg-gray-200 border border-gray-300">Mon</div>
        <div class="bg-gray-200 border border-gray-300">Tue</div>
        <div class="bg-gray-200 border border-gray-300">Wed</div>
        <div class="bg-gray-200 border border-gray-300">Thu</div>
        <div class="bg-gray-200 border border-gray-300">Fri</div>
        <div class="bg-gray-200 border border-gray-300">Sat</div>
        <div class="bg-gray-200 border border-gray-300">Sun</div>
    </div>
    <!-- Calendar Days -->
    <div id="calendar" class="grid grid-cols-7 gap-2 "></div>
</div>

<div class="bg-black text-white md:w-[450px] min-h-[400px] self-start p-6 rounded-xl shadow-md border-2 border-white">
    <h2 class="text-sm font-normal mb-4">Select appointment time:</h2>
    <h3 id="selectedDate" class="text-xl font-semibold mb-4">Wednesday - August 14, 2025</h3>
    
    <!-- Time Slot Buttons -->
    <div class="grid grid-cols-2 gap-3">
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="09:00">
            9:00 AM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="10:00">
           10:00 AM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="11:00">
            11:00 AM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="01:00">
           1:00 PM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="02:00">
            2:00 PM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="03:00">
           3:00 PM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="04:00">
            4:00 PM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="05:00">
            5:00 PM
        </button>
    </div>

    <!-- Proceed button OUTSIDE the grid -->
    <a id="proceedBtn"
        data-base-href="{{ url_for('routes.LOGIN') }}"
        href="{{ url_for('routes.LOGIN') }}"
        class="hidden mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded text-center">
        Proceed to Login
    </a>

    <!-- Notes -->
    <h4 class="font-light text-[10px] mt-2">•Please provide your FULL NAME.</h4>
    <h4 class="font-light text-[10px]">•See to it that you're 100% sure before booking an appointment.</h4>
    <h4 class="font-light text-[10px]">•15 minutes late will be canceled to accommodate next client/walk-in.</h4>
    <h4 class="font-light text-[10px]">•You can book your 6pm,7pm off hour appointment by messaging us on our FB page.</h4>
</div>`, 

    angelo: `
<!-- Calendar Section -->
<div class="bg-white border rounded-xl border-gray-300 shadow-lg p-4 md:w-[600px] w-full">
    <!-- Month Name & Navigation -->
    <div class="flex items-center justify-between mb-2">
        <button id="prevMonth" class="text-xl font-bold">&lt;</button>
        <div id="monthName" class="text-center text-lg font-bold"></div>
        <button id="nextMonth" class="text-xl font-bold">&gt;</button>
    </div>
    <!-- Day Names -->
    <div class="grid grid-cols-7 text-center font-semibold text-gray-700 mb-2 bg-gray-500 border border-gray-300">
        <div class="bg-gray-200 border border-gray-300">Mon</div>
        <div class="bg-gray-200 border border-gray-300">Tue</div>
        <div class="bg-gray-200 border border-gray-300">Wed</div>
        <div class="bg-gray-200 border border-gray-300">Thu</div>
        <div class="bg-gray-200 border border-gray-300">Fri</div>
        <div class="bg-gray-200 border border-gray-300">Sat</div>
        <div class="bg-gray-200 border border-gray-300">Sun</div>
    </div>
    <!-- Calendar Days -->
    <div id="calendar" class="grid grid-cols-7 gap-2 "></div>
</div>

<div class="bg-black text-white md:w-[450px] min-h-[400px] self-start p-6 rounded-xl shadow-md border-2 border-white">
    <h2 class="text-sm font-normal mb-4">Select appointment time:</h2>
    <h3 id="selectedDate" class="text-xl font-semibold mb-4">Wednesday - August 14, 2025</h3>
    
    <!-- Time Slot Buttons -->
    <div class="grid grid-cols-2 gap-3">
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="09:00">
            9:00 AM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="10:00">
           10:00 AM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="11:00">
            11:00 AM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="01:00">
           1:00 PM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="02:00">
            2:00 PM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="03:00">
           3:00 PM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="04:00">
            4:00 PM
        </button>
        <button class="appointment-btn border border-white py-2 px-4 rounded flex items-center justify-center gap-2" data-time="05:00">
            5:00 PM
        </button>
    </div>

    <!-- Proceed button OUTSIDE the grid -->
    <a id="proceedBtn"
        data-base-href="{{ url_for('routes.LOGIN') }}"
        href="{{ url_for('routes.LOGIN') }}"
        class="hidden mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded text-center">
        Proceed to Login
    </a>

    <!-- Notes -->
    <h4 class="font-light text-[10px] mt-2">•Please provide your FULL NAME.</h4>
    <h4 class="font-light text-[10px]">•See to it that you're 100% sure before booking an appointment.</h4>
    <h4 class="font-light text-[10px]">•15 minutes late will be canceled to accommodate next client/walk-in.</h4>
    <h4 class="font-light text-[10px]">•You can book your 6pm,7pm off hour appointment by messaging us on our FB page.</h4>
</div>`
};


// 🔹 Header template
const appointmentHeader = `
<div class="bg-white w-full h-[100px] flex flex-col items-center justify-center border-t-2 border-b-2 border-black">
    <h1 class="font-playfair font-semibold text-[35px] text-black">APPOINTMENT</h1>
    <h2 id="barberName" class="font-lato font-faustina text-[30px] text-black mt-[-18px]">Emel Calomos</h2>
</div>
`;

document.addEventListener("DOMContentLoaded", () => {
    const appointmentHeaderContainer = document.getElementById("appointmentHeader");
    const appointmentWrapper = document.getElementById("appointmentWrapper");
    const barberName = document.getElementById("barberName");
    const barberButtons = document.querySelectorAll(".barber-btn");

    // Inject the header once
    if (appointmentHeaderContainer) {
        appointmentHeaderContainer.innerHTML = appointmentHeader;
    }

    // 🔹 Load barber
    function loadBarber(barber) {
        appointmentWrapper.innerHTML = barberAppointments[barber];
        initCalendar();
        bindAppointmentButtons();
    }

    // Load default barber
    loadBarber("emel");

    // Barber switch buttons
    barberButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const barber = btn.dataset.barber;
            loadBarber(barber);
            if (barberName) {
                barberName.textContent = barber === "emel" ? "Emel Calomos" : "Angelo Paballa";
            }
        });
    });

    // 🔹 Calendar logic
    function initCalendar() {
        const calendar = document.getElementById("calendar");
        if (!calendar) return;

        const monthLabel = document.getElementById("monthLabel") || document.getElementById("monthName");
        const prevBtn = document.getElementById("prevMonth");
        const nextBtn = document.getElementById("nextMonth");
        let currentDate = new Date();

        function renderCalendar() {
            calendar.innerHTML = "";
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            if (monthLabel) monthLabel.textContent = `${monthNames[month]} ${year}`;

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < firstDay; i++) calendar.appendChild(document.createElement("div"));

            for (let day = 1; day <= daysInMonth; day++) {
                const dayDiv = document.createElement("div");
                dayDiv.textContent = day;
                dayDiv.className = "date-box border border-gray-400 rounded-md p-2 text-center cursor-pointer hover:bg-gray-200 transition";
                dayDiv.addEventListener("click", () => {
                    console.log(`Selected date: ${day} ${monthNames[month]} ${year}`);
                });
                calendar.appendChild(dayDiv);
            }
        }

        prevBtn?.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
        nextBtn?.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });

        renderCalendar();
    }

    // 🔹 Appointment button logic
    function bindAppointmentButtons() {
        const appointmentButtons = document.querySelectorAll(".appointment-btn");
        const proceedBtn = document.getElementById("proceedBtn");

        if (!appointmentButtons.length || !proceedBtn) return;

        appointmentButtons.forEach(button => {
            button.addEventListener("click", () => {
                appointmentButtons.forEach(btn => btn.classList.remove("bg-white", "text-black"));
                button.classList.add("bg-white", "text-black");
                proceedBtn.classList.remove("hidden");
                proceedBtn.style.display = "inline-block";
                const baseHref = proceedBtn.dataset.baseHref || "#";
                proceedBtn.href = `${baseHref}?time=${encodeURIComponent(button.dataset.time)}`;
            });
        });
    }

    // 🔹 Book Now buttons (inside DOMContentLoaded, AFTER loadBarber)
    const bookNowButtons = document.querySelectorAll(".book-now-btn");
    bookNowButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const barber = btn.dataset.barber; // "emel" or "angelo"
            if (appointmentHeaderContainer && !appointmentHeaderContainer.innerHTML.trim()) {
                appointmentHeaderContainer.innerHTML = appointmentHeader;
            }
            loadBarber(barber);
            if (barberName) barberName.textContent = barber === "emel" ? "Emel Calomos" : "Angelo Paballa";
            const appointmentSection = document.getElementById("appointmentSection");
            if (appointmentSection) appointmentSection.scrollIntoView({ behavior: "smooth" });
        });
    });

});


