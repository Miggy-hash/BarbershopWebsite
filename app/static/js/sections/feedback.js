document.addEventListener('DOMContentLoaded', () => {
    console.log('feedback.js loaded');

    // Configure Toastr positioning
    toastr.options = {
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
        closeButton: true,
        progressBar: true
    };

    // SocketIO connection
    const socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect', () => {
        console.log('Connected to SocketIO server');
    });

    // Handle new review event
    socket.on('new_review', (review_data) => {
        console.log('Received new_review event:', review_data);

        // Update average rating
        const avgRatingEl = document.querySelector('.text-6xl.lg\\:text-7xl.md\\:text-7xl');
        if (avgRatingEl) {
            avgRatingEl.textContent = review_data.average_rating.toFixed(1);
            console.log(`Updated average rating to ${review_data.average_rating.toFixed(1)}`);
        } else {
            console.warn('Average rating element not found');
        }

        // Update total reviews
        const totalReviewsEl = document.querySelector('.text-xs.lg\\:text-xs.md\\:text-\\[13px\\]');
        if (totalReviewsEl) {
            totalReviewsEl.textContent = `${review_data.total_reviews} reviews`;
            console.log(`Updated total reviews to ${review_data.total_reviews}`);
        } else {
            console.warn('Total reviews element not found');
        }

        // Update average stars with partial fill
        const avgStarsContainer = document.querySelector('.flex.items-center.gap-1');
        if (avgStarsContainer) {
            const avgRating = review_data.average_rating;
            const fullStars = Math.floor(avgRating); // Full stars (e.g., 4 for 4.8)
            const partialStarFraction = avgRating - fullStars; // Fractional part (e.g., 0.8)
            avgStarsContainer.innerHTML = Array.from({ length: 5 }, (_, i) => {
                if (i < fullStars) {
                    return `<img src="/static/icons/star.png" class="w-4 h-4">`; // Full star
                } else if (i === fullStars && partialStarFraction > 0) {
                    return `<img src="/static/icons/half-star.png" class="w-4 h-4" style="opacity: ${partialStarFraction}">`; // Partial star
                } else {
                    return `<img src="/static/icons/star(1).png" class="w-4 h-4">`; // Empty star
                }
            }).join('');
            console.log(`Updated average stars to ${avgRating} (full: ${fullStars}, partial: ${partialStarFraction})`);
        } else {
            console.warn('Average stars container not found');
        }

        // Update rating bars
        const barContainers = document.querySelectorAll('.flex-1.h-\\[10px\\].w-\\[100px\\].bg-gray-200');
        console.log(`Found ${barContainers.length} bar containers`);
        barContainers.forEach(el => {
            const rating = parseInt(el.dataset.rating);
            if (isNaN(rating)) {
                console.error(`Invalid data-rating for element:`, el);
                return;
            }
            const count = review_data.ratings_counts[rating] || 0;
            const total = review_data.total_reviews || 1;
            const pct = total > 0 ? (count / total * 100).toFixed(2) : 0;
            console.log(`Updating bar: rating=${rating}, count=${count}, total=${total}, pct=${pct}%`);
            const bar = el.querySelector('.bar');
            if (bar) {
                bar.dataset.count = count;
                bar.dataset.total = total;
                bar.style.width = `${pct}%`;
            } else {
                console.warn(`Bar element not found for rating ${rating}`);
            }
        });

        // Update comments
        const commentsContainer = document.querySelector('#comments-container, .space-y-4.max-h-\\[450px\\].overflow-y-auto');
        if (commentsContainer) {
            commentsContainer.innerHTML = ''; // Clear existing comments
            review_data.comments.forEach(comment => {
                const commentEl = document.createElement('article');
                commentEl.className = 'bg-white rounded-lg shadow p-3 relative';
                commentEl.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="avatar w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" data-name="${comment.name}">${comment.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="flex items-center gap-1">
                                ${Array.from({length: 5}, (_, i) => `<img src="/static/icons/star${i < comment.rating ? '' : '(1)'}.png" class="w-4 h-4">`).join('')}
                            </div>
                            <p class="text-sm font-montserrat text-gray-500 timestamp" data-date="${comment.date}">${moment(comment.date).fromNow()}</p>
                        </div>
                    </div>
                    <p class="mt-2 text-sm font-montserrat text-gray-600">${comment.text}</p>
                `;
                commentsContainer.appendChild(commentEl);
            });

            // Reapply avatar colors
            document.querySelectorAll('.avatar').forEach(el => {
                const name = el.dataset.name || '';
                const initial = name.trim().split(' ')[0].charAt(0).toUpperCase();
                el.textContent = initial;
                let hash = 0;
                for (let i = 0; i < name.length; i++) {
                    hash = name.charCodeAt(i) + ((hash << 5) - hash);
                }
                const colors = ['hsl(220, 70%, 40%)', 'hsl(140, 70%, 40%)', 'hsl(0, 70%, 40%)', 'hsl(260, 70%, 40%)', 'hsl(30, 70%, 40%)'];
                const colorIndex = Math.abs(hash) % colors.length;
                el.style.backgroundColor = colors[colorIndex];
            });

            // Reapply timestamps
            document.querySelectorAll('.timestamp').forEach(el => {
                const dateStr = el.dataset.date;
                if (dateStr) {
                    el.textContent = moment(dateStr).fromNow();
                }
            });
            console.log('Updated comment section');
        } else {
            console.error('Comments container not found. Selector tried: #comments-container, .space-y-4.max-h-\\[450px\\].overflow-y-auto');
        }
    });

    // Fixed color palette
    const colors = ['hsl(220, 70%, 40%)', 'hsl(140, 70%, 40%)', 'hsl(0, 70%, 40%)', 'hsl(260, 70%, 40%)', 'hsl(30, 70%, 40%)'];

    // Set bar widths on page load
    const barContainers = document.querySelectorAll('.flex-1.h-\\[10px\\].w-\\[100px\\].bg-gray-200');
    console.log(`Found ${barContainers.length} bar containers on page load`);
    barContainers.forEach(el => {
        const count = parseFloat(el.querySelector('.bar').dataset.count) || 0;
        const total = parseFloat(el.querySelector('.bar').dataset.total) || 0;
        const pct = total > 0 ? (count / total * 100).toFixed(2) : 0;
        console.log(`Bar: count=${count}, total=${total}, pct=${pct}%`);
        const bar = el.querySelector('.bar');
        if (bar) {
            bar.style.width = `${pct}%`;
        }
    });

    // Set avatars
    document.querySelectorAll('.avatar').forEach(el => {
        const name = el.dataset.name || '';
        const initial = name.trim().split(' ')[0].charAt(0).toUpperCase();
        el.textContent = initial;
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colorIndex = Math.abs(hash) % colors.length;
        el.style.backgroundColor = colors[colorIndex];
    });

    // Set timestamps with Moment.js
    document.querySelectorAll('.timestamp').forEach(el => {
        const dateStr = el.dataset.date;
        if (dateStr) {
            el.textContent = moment(dateStr).fromNow();
        }
    });

    // Initialize average stars on page load
    const avgStarsContainer = document.querySelector('.flex.items-center.gap-1');
    const avgRatingEl = document.querySelector('.text-6xl.lg\\:text-7xl.md\\:text-7xl');
    if (avgStarsContainer && avgRatingEl) {
        const avgRating = parseFloat(avgRatingEl.textContent) || 0;
        const fullStars = Math.floor(avgRating);
        const partialStarFraction = avgRating - fullStars;
        avgStarsContainer.innerHTML = Array.from({ length: 5 }, (_, i) => {
            if (i < fullStars) {
                return `<img src="/static/icons/star.png" class="w-4 h-4">`; // Full star
            } else if (i === fullStars && partialStarFraction > 0) {
                return `<img src="/static/icons/half-star.png" class="w-4 h-4" style="opacity: ${partialStarFraction}">`; // Partial star
            } else {
                return `<img src="/static/icons/star(1).png" class="w-4 h-4">`; // Empty star
            }
        }).join('');
        console.log(`Initialized average stars on page load: ${avgRating} (full: ${fullStars}, partial: ${partialStarFraction})`);
    } else {
        console.warn('Average stars container or rating element not found on page load');
    }

    // Star rating widgets
    const widgets = document.querySelectorAll('.rating-widget');
    const hollowStar = '/static/icons/star(1).png';
    const filledStar = '/static/icons/star.png';

    widgets.forEach(widget => {
        const stars = widget.querySelectorAll('.star');
        const isModal = widget.id === 'modalRatingWidget';
        console.log(`Initializing rating widget: ${widget.id}, stars found: ${stars.length}`);

        function paint(n) {
            stars.forEach(s => {
                const v = parseInt(s.dataset.value);
                const img = s.querySelector('img');
                img.src = v <= n ? filledStar : hollowStar;
            });
        }

        stars.forEach(s => {
            const v = parseInt(s.dataset.value);
            s.addEventListener('mouseenter', () => {
                paint(v);
            });
            s.addEventListener('mouseleave', () => {
                const current = parseInt(widget.dataset.rating) || 0;
                paint(current);
            });
            s.addEventListener('click', () => {
                console.log(`Clicked star ${v} in ${widget.id}`);
                widget.dataset.rating = v;
                const targetInput = isModal ? document.getElementById('modalRating') : document.getElementById('mainRating');
                if (targetInput) {
                    targetInput.value = v;
                    console.log(`Set ${targetInput.id} value to ${v}`);
                } else {
                    console.error(`Target input not found for ${widget.id}`);
                }
                paint(v);
            });
        });
    });

    // Auto-resize textarea
    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    document.querySelectorAll('textarea').forEach(ta => {
        ta.addEventListener('input', () => {
            console.log('Textarea input event triggered');
            autoResize(ta);
        });
    });

    // Modal handling
    const modal = document.getElementById('verificationModal');
    const closeBtn = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const submitBtn = document.getElementById('submitReviewBtn');

    if (submitBtn) {
        console.log('Submit button found');
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        newSubmitBtn.addEventListener('click', () => {
            console.log('Submit button clicked');
            const mainRating = document.getElementById('mainRating').value;
            const mainComment = document.getElementById('mainComment').value;
            console.log(`mainRating: ${mainRating}, mainComment: ${mainComment}`);

            if (parseInt(mainRating) === 0) {
                try {
                    toastr.error('Please select a rating', 'Error');
                } catch (e) {
                    console.error('Toastr error failed:', e);
                    alert('Please select a rating');
                }
                return;
            }

            // Pre-populate modal
            document.getElementById('modalRatingWidget').dataset.rating = mainRating;
            const modalStars = document.getElementById('modalRatingWidget').querySelectorAll('.star img');
            modalStars.forEach((img, idx) => {
                img.src = idx + 1 <= mainRating ? filledStar : hollowStar;
            });
            document.getElementById('modalComment').value = mainComment;

            // Populate date dropdown (today + 4 prior)
            const dropdown = document.getElementById('modalDate');
            dropdown.innerHTML = '';
            const today = new Date();
            for (let i = 4; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const formatted = `${date.toLocaleString('default', { month: 'long' })} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
                const option = document.createElement('option');
                option.value = formatted;
                option.textContent = formatted;
                dropdown.appendChild(option);
            }

            console.log('Opening verification modal');
            modal.classList.remove('hidden');
        });
    } else {
        console.error('Submit button not found');
    }

    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (confirmBtn) {
        console.log('Confirm button found');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        newConfirmBtn.addEventListener('click', async () => {
            console.log('Confirm button clicked');
            const full_name = document.getElementById('modalFullName').value.trim();
            const date = document.getElementById('modalDate').value;
            const rating = document.getElementById('modalRatingWidget').dataset.rating;
            const comment = document.getElementById('modalComment').value.trim();
            console.log(`Confirm data: full_name=${full_name}, date=${date}, rating=${rating}, comment=${comment}`);

            if (!full_name || !date || parseInt(rating) === 0) {
                console.log('Validation failed: incomplete fields');
                try {
                    toastr.error('Please complete all fields', 'Error');
                } catch (e) {
                    console.error('Toastr error failed:', e);
                    alert('Please complete all fields');
                }
                return;
            }

            try {
                const response = await fetch('/submit-review', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ full_name, date, rating, comment })
                });
                const data = await response.json();
                console.log('Fetch response:', data);

                if (data.success) {
                    try {
                        toastr.success(data.message, 'Success');
                    } catch (e) {
                        console.error('Toastr success failed:', e);
                        alert(data.message);
                    }
                    modal.classList.add('hidden');
                    // Reset main rating widget and textarea
                    const mainRatingWidget = document.getElementById('mainRatingWidget');
                    if (mainRatingWidget) {
                        mainRatingWidget.dataset.rating = 0;
                        const mainStars = mainRatingWidget.querySelectorAll('.star img');
                        mainStars.forEach(img => img.src = hollowStar);
                    }
                    const mainRatingInput = document.getElementById('mainRating');
                    if (mainRatingInput) {
                        mainRatingInput.value = 0;
                    }
                    const mainComment = document.getElementById('mainComment');
                    if (mainComment) {
                        mainComment.value = '';
                        autoResize(mainComment);
                    }
                    console.log('Reset mainRatingWidget and mainComment');
                } else {
                    try {
                        toastr.error(data.message, 'Error');
                    } catch (e) {
                        console.error('Toastr error failed:', e);
                        alert(data.message);
                    }
                }
            } catch (err) {
                console.error('Fetch error:', err);
                try {
                    toastr.error('Server error', 'Error');
                } catch (e) {
                    console.error('Toastr error failed:', e);
                    alert('Server error');
                }
            }
        });
    } else {
        console.error('Confirm button not found');
    }
});