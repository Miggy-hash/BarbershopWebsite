document.addEventListener('DOMContentLoaded', () => {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationList = document.getElementById('notificationList');
    const showMoreBtn = document.getElementById('showMoreBtn');
    const unreadCountSpan = document.getElementById('unreadCount');
    let offset = 0;
    const limit = 6; // Initial load
    let loadedNotifications = [];

    // Initialize Socket.IO with room
    const socket = io('http://127.0.0.1:5000', {
        transports: ['websocket']
    });
    socket.emit('join', 'emel_calomos'); // Join barber's room

    // Toggle dropdown
    notificationBtn.addEventListener('click', async () => {
        notificationDropdown.classList.toggle('show');
        if (notificationDropdown.classList.contains('show')) {
            // Clear existing notifications
            loadedNotifications = [];
            offset = 0;
            notificationList.innerHTML = '';
            await fetchNotifications(limit, offset);
            // Mark all as read
            await markNotificationsRead();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
            notificationDropdown.classList.remove('show');
        }
    });

    // Fetch notifications
    async function fetchNotifications(limit, offset) {
        try {
            const response = await fetch(`/admin/emel-notifications/${limit}/${offset}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            updateNotifications(data.notifications, data.unread_count);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            notificationList.innerHTML = '<p class="text-red-600">Error loading notifications</p>';
        }
    }

    // Update notification list and badge
    function updateNotifications(notifications, unreadCount) {
        loadedNotifications = [...loadedNotifications, ...notifications];
        if (loadedNotifications.length === 0) {
            notificationList.innerHTML = '<p class="text-gray-400">No new appointments</p>';
            showMoreBtn.style.display = 'none';
        } else {
            notificationList.innerHTML = loadedNotifications.map(n => `
                <div class="notification-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}">
                    <div class="flex justify-between">
                        <div>
                            <p class="font-semibold">${n.full_name}</p>
                            <p class="text-sm">${n.service}</p>
                            <p class="text-sm">${n.date} at ${formatTime(n.time)}</p>
                        </div>
                        <div class="text-xs text-gray-400">${moment(n.created_at).fromNow()}</div>
                    </div>
                </div>
            `).join('');
            showMoreBtn.style.display = notifications.length < limit ? 'none' : 'block';
        }
        updateUnreadBadge(unreadCount);
    }

    // Format time to 12-hour
    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hourNum = parseInt(hours, 10);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const displayHour = hourNum % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    // Update unread badge
    function updateUnreadBadge(count) {
        if (count > 0) {
            unreadCountSpan.textContent = count;
            unreadCountSpan.classList.remove('hidden');
        } else {
            unreadCountSpan.classList.add('hidden');
        }
    }

    // Mark notifications as read
    async function markNotificationsRead() {
        try {
            const response = await fetch('/admin/emel-mark-notifications-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            updateUnreadBadge(0); // Clear badge
            // Update loaded notifications to read
            loadedNotifications.forEach(n => n.is_read = true);
            notificationList.querySelectorAll('.notification-item').forEach(item => {
                item.classList.remove('unread');
            });
        } catch (err) {
            console.error('Error marking notifications read:', err);
        }
    }

    // Handle Show More
    showMoreBtn.addEventListener('click', async () => {
        offset += limit;
        await fetchNotifications(10, offset); // Load next 10
    });

    // Handle new appointment
    socket.on('new_appointment', (data) => {
        if (data.barber !== 'Emel Calomos') return;
        loadedNotifications.unshift(data); // Add to top
        if (loadedNotifications.length > 10) loadedNotifications.pop(); // Keep max 10
        updateNotifications(loadedNotifications, parseInt(unreadCountSpan.textContent || 0) + 1);
    });

    // Initial fetch
    fetchNotifications(limit, 0);
});