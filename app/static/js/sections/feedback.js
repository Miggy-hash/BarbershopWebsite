document.addEventListener('DOMContentLoaded', () => {

    // Configure Toastr positioning
    toastr.options = {
        positionClass: 'toast-bottom-right', // Move to bottom-right
        timeOut: 2000,
        closeButton: true,
        progressBar: true
    };

    // Fixed color palette
    const colors = ['hsl(220, 70%, 40%)', 'hsl(140, 70%, 40%)', 'hsl(0, 70%, 40%)', 'hsl(260, 70%, 40%)', 'hsl(30, 70%, 40%)'];

    // Set bar widths
    document.querySelectorAll('.bar').forEach(el => {
        const count = parseFloat(el.dataset.count) || 0;
        const total = parseFloat(el.dataset.total) || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        el.style.width = `${pct}%`;
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

    // Star rating widgets
const widgets = document.querySelectorAll('.rating-widget');
    const hollowStar = '/static/icons/star(1).png';
    const filledStar = '/static/icons/star.png';

    widgets.forEach(widget => {
        const stars = widget.querySelectorAll('.star');
        const isModal = widget.id === 'modalRatingWidget';
        console.log(`Initializing rating widget: ${widget.id}, stars found: ${stars.length}`); // Debug log

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
                console.log(`Mouseenter star ${v} in ${widget.id}`); // Debug log
                paint(v);
            });
            s.addEventListener('mouseleave', () => {
                const current = parseInt(widget.dataset.rating) || 0;
                console.log(`Mouseleave, restoring rating ${current} in ${widget.id}`); // Debug log
                paint(current);
            });
            s.addEventListener('click', () => {
                console.log(`Clicked star ${v} in ${widget.id}`); // Debug log
                widget.dataset.rating = v;
                const targetInput = isModal ? document.getElementById('modalRating') : document.getElementById('mainRating');
                if (targetInput) {
                    targetInput.value = v;
                    console.log(`Set ${targetInput.id} value to ${v}`); // Debug log
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
        submitBtn.addEventListener('click', () => {
            console.log('Submit button clicked');
            const mainRating = document.getElementById('mainRating').value;
            const mainComment = document.getElementById('mainComment').value;
            console.log(`mainRating: ${mainRating}, mainComment: ${mainComment}`); // Debug log

            if (parseInt(mainRating) === 0) {
                toastr.error('Please select a rating', 'Error');
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

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    if (confirmBtn) {
        console.log('Confirm button found'); // Debug log
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        newConfirmBtn.addEventListener('click', async () => {
            console.log('Confirm button clicked'); // Debug log
            const full_name = document.getElementById('modalFullName').value.trim();
            const date = document.getElementById('modalDate').value;
            const rating = document.getElementById('modalRatingWidget').dataset.rating;
            const comment = document.getElementById('modalComment').value.trim();
            console.log(`Confirm data: full_name=${full_name}, date=${date}, rating=${rating}, comment=${comment}`); // Debug log

            if (!full_name || !date || parseInt(rating) === 0) {
                console.log('Validation failed: incomplete fields');
                try {
                    toastr.error('Please complete all fields', 'Error');
                } catch (e) {
                    console.error('Toastr error failed:', e);
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
                console.log('Fetch response:', data); // Debug log

                if (data.success) {
                    try {
                        toastr.success(data.message, 'Success');
                    } catch (e) {
                        console.error('Toastr success failed:', e);
                    }
                    modal.classList.add('hidden');
                    location.reload();
                } else {
                    try {
                        toastr.error(data.message, 'Error');
                    } catch (e) {
                        console.error('Toastr error failed:', e);
                    }
                }
            } catch (err) {
                console.error('Fetch error:', err);
                try {
                    toastr.error('Server error', 'Error');
                } catch (e) {
                    console.error('Toastr error failed:', e);
                }
            }
        });
    } else {
        console.error('Confirm button not found');
    }
});