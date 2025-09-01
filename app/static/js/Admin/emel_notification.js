document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('notification-list')) {
        console.log('Notification functionality not needed on this page');
        return;
    }

    const socket = io('http://127.0.0.1:5000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
    });
    const notificationList = document.getElementById('notification-list');
    const unreadCountSpan = document.getElementById('unread-count');
    const showMoreBtn = document.getElementById('show-more-btn');
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    let loadedNotifications = [];
    let limit = 6;
    let offset = 0;

    if (!notificationList) {
        console.error('Error: notification-list element not found in DOM');
        return;
    }
    if (!unreadCountSpan) {
        console.error('Error: unread-count element not found in DOM');
        return;
    }
    if (!notificationDropdown) {
        console.error('Error: notification-dropdown element not found in DOM');
        return;
    }
    if (!showMoreBtn) {
        console.warn('Warning: show-more-btn element not found in DOM');
    }
    if (!notificationBtn) {
        console.warn('Warning: notification-btn element not found in DOM');
    }

    socket.on('connect', () => {
        console.log('Socket.IO connected, socket ID:', socket.id);
        socket.emit('join', 'emel_calomos');
        console.log('Joined room: emel_calomos');
    });

    socket.on('reconnect', (attempt) => {
        console.log('Socket.IO reconnected after', attempt, 'attempts');
        socket.emit('join', 'emel_calomos');
        console.log('Rejoined room: emel_calomos');
    });

    socket.on('reconnect_attempt', (attempt) => {
        console.log('Socket.IO reconnect attempt:', attempt);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error.message);
    });

    socket.on('any', (event, ...args) => {
        console.log(`Received Socket.IO event: ${event}`, JSON.stringify(args, null, 2));
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
    });

    socket.on('slot_booked', (data) => {
        console.log('New appointment received:', JSON.stringify(data, null, 2));
        if (data.barber !== 'Emel Calomos') {
            console.log('Ignoring slot_booked for non-Emel barber:', data.barber);
            return;
        }
        data.id = data.id || `temp-${Date.now()}`;
        loadedNotifications.unshift(data);
        if (loadedNotifications.length > limit) loadedNotifications.pop();
        console.log('Current loadedNotifications:', JSON.stringify(loadedNotifications, null, 2));
        notificationList.innerHTML = ''; // Force UI refresh
        updateNotifications(loadedNotifications, parseInt(unreadCountSpan.textContent || 0) + (data.is_read ? 0 : 1));
    });

    socket.on('slot_deleted', (data) => {
        console.log('Appointment deleted:', JSON.stringify(data, null, 2));
        loadedNotifications = loadedNotifications.filter(n => n.id !== data.id);
        updateNotifications(loadedNotifications, parseInt(unreadCountSpan.textContent || 0));
    });

    function updateNotifications(notifications, unreadCount) {
        loadedNotifications = [...notifications];
        console.log('Updating notifications with:', JSON.stringify(notifications, null, 2));
        if (loadedNotifications.length === 0) {
            notificationList.innerHTML = '<p class="text-gray-400">No new appointments</p>';
            showMoreBtn && (showMoreBtn.style.display = 'none');
        } else {
            notificationList.innerHTML = loadedNotifications.map(n => {
                let createdAt;
                try {
                    createdAt = moment.parseZone(n.created_at).local();
                    if (!createdAt.isValid()) throw new Error('Invalid created_at');
                } catch (e) {
                    console.error('Error parsing created_at:', n.created_at, e);
                    createdAt = moment();
                }
                return `
                    <div class="notification-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}">
                        <div class="flex justify-between">
                            <div>
                                <p class="font-semibold">${n.full_name}</p>
                                <p class="text-sm">${n.service}</p>
                                <p class="text-sm">${n.date} at ${formatTime(n.time)}</p>
                            </div>
                            <div class="text-xs text-gray-400">${createdAt.fromNow()}</div>
                        </div>
                    </div>
                `;
            }).join('');
            showMoreBtn && (showMoreBtn.style.display = notifications.length < limit ? 'none' : 'block');
        }
        updateUnreadBadge(unreadCount);
        console.log('Notification list updated, unread count:', unreadCount);
    }

    function updateUnreadBadge(count) {
        if (unreadCountSpan) {
            unreadCountSpan.textContent = count;
            unreadCountSpan.style.display = count > 0 ? 'inline' : 'none';
        }
    }

    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${period}`;
    }

    function fetchNotifications() {
        fetch(`/admin/emel-notifications/${limit}/${offset}`)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched notifications:', JSON.stringify(data, null, 2));
                loadedNotifications = data.notifications;
                updateNotifications(data.notifications, data.unread_count);
            })
            .catch(error => console.error('Error fetching notifications:', error));
    }

    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            offset += limit;
            fetchNotifications();
        });
    }

    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            console.log('Notification button clicked, toggling dropdown');
            notificationDropdown.classList.toggle('show');
            fetch(`/admin/emel-mark-notifications-read`, { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    console.log('Notifications marked as read:', data);
                    loadedNotifications.forEach(n => n.is_read = true);
                    updateNotifications(loadedNotifications, 0);
                })
                .catch(error => console.error('Error marking notifications read:', error));
        });
    }

    document.addEventListener('click', (event) => {
        if (!notificationBtn.contains(event.target) && !notificationDropdown.contains(event.target)) {
            console.log('Clicked outside, closing dropdown');
            notificationDropdown.classList.remove('show');
        }
    });

    fetchNotifications();
}); 