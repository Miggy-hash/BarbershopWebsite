document.addEventListener('DOMContentLoaded', () => {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationList = document.getElementById('notificationList');
    const showMoreBtn = document.getElementById('showMoreBtn');
    const unreadCountSpan = document.getElementById('unreadCount');
    let offset = 0;
    const limit = 6;
    let loadedNotifications = [];

    const socket = io('http://127.0.0.1:5000', { // Update to 'http://192.168.100.94:5000' if needed
        transports: ['websocket']
    });
    socket.emit('join', 'emel_calomos');

    notificationBtn.addEventListener('click', async () => {
        console.log('Notification button clicked');
        notificationDropdown.classList.toggle('show');
        if (notificationDropdown.classList.contains('show')) {
            loadedNotifications = [];
            offset = 0;
            notificationList.innerHTML = '';
            await fetchNotifications(limit, offset);
            await markNotificationsRead();
        }
    });

    document.addEventListener('click', (e) => {
        if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
            notificationDropdown.classList.remove('show');
        }
    });

    async function fetchNotifications(limit, offset) {
        try {
            const response = await fetch(`/admin/emel-notifications/${limit}/${offset}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            console.log('Fetched notifications:', data);
            updateNotifications(data.notifications, data.unread_count);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            notificationList.innerHTML = '<p class="text-red-600">Error loading notifications</p>';
        }
    }

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

    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hourNum = parseInt(hours, 10);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const displayHour = hourNum % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    function updateUnreadBadge(count) {
        console.log('Updating unread badge with count:', count);
        if (count > 0) {
            unreadCountSpan.textContent = count;
            unreadCountSpan.classList.remove('hidden');
        } else {
            unreadCountSpan.classList.add('hidden');
        }
    }

    async function markNotificationsRead() {
        try {
            const response = await fetch('/admin/emel-mark-notifications-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            console.log('Notifications marked as read');
            loadedNotifications.forEach(n => n.is_read = true);
            notificationList.querySelectorAll('.notification-item').forEach(item => {
                item.classList.remove('unread');
            });
            updateUnreadBadge(0);
        } catch (err) {
            console.error('Error marking notifications read:', err);
        }
    }

    showMoreBtn.addEventListener('click', async () => {
        offset += limit;
        await fetchNotifications(limit, offset);
    });

    socket.on('new_appointment', (data) => {
        if (data.barber !== 'Emel Calomos') return;
        console.log('New appointment received:', data);
        loadedNotifications.unshift(data);
        if (loadedNotifications.length > 10) loadedNotifications.pop();
        updateNotifications(loadedNotifications, parseInt(unreadCountSpan.textContent || 0) + 1);
    });

    fetchNotifications(limit, 0);
});