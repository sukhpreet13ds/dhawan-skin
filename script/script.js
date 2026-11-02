document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    // Handle Active Nav Item switching and animated border
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Update active state
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');

            // Close mobile menu if open
            if (navMenu && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                if (navToggle) {
                    const icon = navToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-xmark');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
    });

    // Mobile Hamburger Menu Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('open');
            const icon = navToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('open')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                if (navMenu.classList.contains('open')) {
                    navMenu.classList.remove('open');
                    const icon = navToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-xmark');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
    }

    // Concern Boxes click/touch active state support
    const concernBoxes = document.querySelectorAll('.concern-box');
    concernBoxes.forEach(box => {
        box.addEventListener('click', function(e) {
            concernBoxes.forEach(b => b.classList.remove('active-preview'));
            this.classList.add('active-preview');
        });
    });

    // FAQ Accordion Toggle
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.faq-item');
            const isOpen = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                const q = i.querySelector('.faq-question');
                if (q) q.setAttribute('aria-expanded', 'false');
            });

            // If it wasn't open, open it
            if (!isOpen) {
                item.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Appointment Form Submission Feedback
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitBtn = this.querySelector('.btn-submit-appointment');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Request Sent!';
                submitBtn.style.backgroundColor = '#2F6F5E';
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    appointmentForm.reset();
                }, 3000);
            }
        });
    }

    // Intersection Observer for section items scroll reveal (animate__fadeInUp)
    const animatedElements = document.querySelectorAll('.animate__animated.animate__fadeInUp');
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.08
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate__active');
                    // After animation finishes, mark as finished to release animation lock for hover effects
                    entry.target.addEventListener('animationend', () => {
                        entry.target.classList.add('animate__finished');
                    }, { once: true });
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        animatedElements.forEach(el => {
            el.classList.add('animate__active');
        });
    }

    // ==========================================================================
    // Treatments, Appointments & Checkout Booking Flow
    // ==========================================================================
    const CART_STORAGE_KEY = 'dhawan_booking_cart';

    function getBookingCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveBookingCart(cart) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }

    function formatCurrency(val) {
        return '₹ ' + Number(val).toLocaleString('en-IN') + '.00';
    }

    // Service definitions lookup map
    const CLINIC_CATALOG = {
        'acne-scars': { id: 'acne-scars', name: 'Acne Scars Treatment (CO₂ Fractional)', duration: '60 Min', price: 3000, category: 'SKIN', gender: 'ALL' },
        'pigmentation': { id: 'pigmentation', name: 'Laser for Pigmentation & Melasma', duration: '45 Min', price: 1600, category: 'SKIN', gender: 'ALL' },
        'hydrafacial': { id: 'hydrafacial', name: 'Hydrafacial Medical Rejuvenation', duration: '60 Min', price: 2500, category: 'SKIN', gender: 'ALL' },
        'dull-skin': { id: 'dull-skin', name: 'Dull Skin & Glow Chemical Peel', duration: '45 Min', price: 1800, category: 'SKIN', gender: 'ALL' },
        'burn-scars': { id: 'burn-scars', name: 'Burn Scars Resurfacing Therapy', duration: '60 Min', price: 2500, category: 'SKIN', gender: 'ALL' },
        'skin-tags': { id: 'skin-tags', name: 'Skin Tags & Warts RF Removal', duration: '30 Min', price: 1200, category: 'SKIN', gender: 'ALL' },
        'hair-fall': { id: 'hair-fall', name: 'Hair Fall Assessment & Clinical Care', duration: '45 Min', price: 1500, category: 'HAIR', gender: 'ALL' },
        'gfc-hair': { id: 'gfc-hair', name: 'GFC Hair Growth Therapy', duration: '45 Min', price: 3500, category: 'HAIR', gender: 'ALL' },
        'beard-shaping': { id: 'beard-shaping', name: "Men's Beard Shaping Laser", duration: '30 Min', price: 1800, category: 'HAIR', gender: 'MEN' },
        'laser-hair': { id: 'laser-hair', name: 'Laser Hair Reduction', duration: '45 Min', price: 2500, category: 'LASER', gender: 'WOMEN' },
        'tattoo-removal': { id: 'tattoo-removal', name: 'Laser Tattoo Removal', duration: '30 Min', price: 2000, category: 'LASER', gender: 'ALL' },
        'hifu-tightening': { id: 'hifu-tightening', name: 'HIFU Non-Surgical Skin Tightening', duration: '60 Min', price: 4500, category: 'LASER', gender: 'ALL' },
        'botox': { id: 'botox', name: 'Botox Expression Lines Care', duration: '45 Min', price: 10000, category: 'AESTHETICS', gender: 'ALL' },
        'volume-fillers': { id: 'volume-fillers', name: 'Dermal Fillers for Volume Loss', duration: '60 Min', price: 12000, category: 'AESTHETICS', gender: 'ALL' }
    };

    // --------------------------------------------------------------------------
    // A. Page: treatments.html Logic
    // --------------------------------------------------------------------------
    const treatServicesList = document.getElementById('treatServicesList');
    if (treatServicesList) {
        let activeGender = 'ALL';
        let activeCat = 'ALL';

        const genderButtons = document.querySelectorAll('#genderFilters .treat-filter-pill');
        const catButtons = document.querySelectorAll('#categoryFilters .treat-filter-pill');
        const treatCartText = document.getElementById('treatCartText');
        const bookButtons = document.querySelectorAll('.btn-book-service');

        function updateTreatmentsCartBar() {
            const cart = getBookingCart();
            const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
            if (treatCartText) {
                if (cart.length === 0) {
                    treatCartText.textContent = '0 services in cart';
                } else {
                    treatCartText.textContent = `${cart.length} service${cart.length > 1 ? 's' : ''} in cart (${formatCurrency(total)})`;
                }
            }

            // Sync Book Appointment button states
            bookButtons.forEach(btn => {
                const id = btn.getAttribute('data-id');
                const isBooked = cart.some(item => item.id === id);
                if (isBooked) {
                    btn.classList.add('booked');
                    btn.textContent = 'Booked ✓';
                } else {
                    btn.classList.remove('booked');
                    btn.textContent = 'Book Appointment';
                }
            });
        }

        function filterTreatments() {
            const items = document.querySelectorAll('.treat-service-item');
            const headers = document.querySelectorAll('.treat-service-category-title');

            const categoryVisibility = { SKIN: 0, HAIR: 0, LASER: 0 };

            items.forEach(item => {
                const itemGender = item.getAttribute('data-gender');
                const itemCat = item.getAttribute('data-cat');

                const matchesGender = (activeGender === 'ALL') || (itemGender === 'ALL') || (itemGender === activeGender);
                const matchesCat = (activeCat === 'ALL') || (itemCat === activeCat);

                if (matchesGender && matchesCat) {
                    item.style.display = 'flex';
                    if (categoryVisibility[itemCat] !== undefined) {
                        categoryVisibility[itemCat]++;
                    }
                } else {
                    item.style.display = 'none';
                }
            });

            // Toggle category header visibility
            headers.forEach(h => {
                const catHeader = h.getAttribute('data-cat-header');
                if (activeCat === 'ALL') {
                    h.style.display = categoryVisibility[catHeader] > 0 ? 'block' : 'none';
                } else {
                    h.style.display = (activeCat === catHeader && categoryVisibility[catHeader] > 0) ? 'block' : 'none';
                }
            });
        }

        // Gender filter pills
        genderButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                genderButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeGender = btn.getAttribute('data-gender') || 'ALL';
                filterTreatments();
            });
        });

        // Category filter pills
        catButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                catButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCat = btn.getAttribute('data-cat') || 'ALL';
                filterTreatments();
            });
        });

        // Book appointment buttons
        bookButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                const service = CLINIC_CATALOG[id];
                if (!service) return;

                let cart = getBookingCart();
                const existingIndex = cart.findIndex(item => item.id === id);

                if (existingIndex > -1) {
                    // Remove if already in cart
                    cart.splice(existingIndex, 1);
                } else {
                    // Add to cart
                    cart.push(service);
                }

                saveBookingCart(cart);
                updateTreatmentsCartBar();
            });
        });

        updateTreatmentsCartBar();
    }

    // --------------------------------------------------------------------------
    // B. Page: appointment.html Logic (Screenshot 2)
    // --------------------------------------------------------------------------
    const appointCartCard = document.getElementById('appointCartCard');
    if (appointCartCard) {
        const appointGenderButtons = document.querySelectorAll('#appointGenderFilters .treat-filter-pill');
        const accordionHeaders = document.querySelectorAll('.appoint-accordion-header');
        const appointCartItemsContainer = document.getElementById('appointCartItems');
        const cartBadgeCount = document.getElementById('cartBadgeCount');
        const appointCartTotal = document.getElementById('appointCartTotal');
        const proceedToBookingBtn = document.getElementById('proceedToBookingBtn');
        const addButtons = document.querySelectorAll('.btn-add-service');

        let appointGender = 'ALL';

        // Accordion toggle
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const card = header.closest('.appoint-accordion-card');
                if (card) {
                    card.classList.toggle('open');
                }
            });
        });

        // Gender filter
        function filterAppointmentRows() {
            const rows = document.querySelectorAll('.appoint-service-row');
            rows.forEach(row => {
                const rowGender = row.getAttribute('data-gender');
                if (appointGender === 'ALL' || rowGender === 'ALL' || rowGender === appointGender) {
                    row.style.display = 'flex';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        appointGenderButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                appointGenderButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                appointGender = btn.getAttribute('data-gender') || 'ALL';
                filterAppointmentRows();
            });
        });

        // Render Cart Sidebar
        function renderAppointmentCart() {
            const cart = getBookingCart();

            if (cartBadgeCount) {
                cartBadgeCount.textContent = cart.length;
            }

            const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
            if (appointCartTotal) {
                appointCartTotal.textContent = formatCurrency(total);
            }

            if (appointCartItemsContainer) {
                if (cart.length === 0) {
                    appointCartItemsContainer.innerHTML = '<div class="cart-empty-message">Your cart is currently empty. Please select a service.</div>';
                } else {
                    appointCartItemsContainer.innerHTML = cart.map(item => `
                        <div class="appoint-cart-item" data-id="${item.id}">
                            <div>
                                <h4 class="cart-item-name">${item.name}</h4>
                                <div class="cart-item-meta">${item.duration} &bull; ${formatCurrency(item.price)}</div>
                            </div>
                            <button type="button" class="cart-item-remove" data-id="${item.id}" title="Remove Service">&times;</button>
                        </div>
                    `).join('');

                    // Bind remove buttons
                    appointCartItemsContainer.querySelectorAll('.cart-item-remove').forEach(rmBtn => {
                        rmBtn.addEventListener('click', () => {
                            const id = rmBtn.getAttribute('data-id');
                            let currentCart = getBookingCart().filter(i => i.id !== id);
                            saveBookingCart(currentCart);
                            renderAppointmentCart();
                        });
                    });
                }
            }

            // Sync + ADD buttons
            addButtons.forEach(btn => {
                const id = btn.getAttribute('data-id');
                const isAdded = cart.some(i => i.id === id);
                if (isAdded) {
                    btn.classList.add('added');
                    btn.textContent = 'ADDED ✓';
                } else {
                    btn.classList.remove('added');
                    btn.textContent = '+ ADD';
                }
            });
        }

        // Add service button click
        addButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const service = CLINIC_CATALOG[id];
                if (!service) return;

                let cart = getBookingCart();
                const idx = cart.findIndex(i => i.id === id);

                if (idx > -1) {
                    cart.splice(idx, 1);
                } else {
                    cart.push(service);
                }

                saveBookingCart(cart);
                renderAppointmentCart();
            });
        });

        // Proceed to Booking validation
        if (proceedToBookingBtn) {
            proceedToBookingBtn.addEventListener('click', (e) => {
                const cart = getBookingCart();
                if (cart.length === 0) {
                    e.preventDefault();
                    alert('Please select at least one treatment before proceeding to booking.');
                }
            });
        }

        renderAppointmentCart();
    }

    // --------------------------------------------------------------------------
    // C. Page: checkout.html Logic (Screenshot 3)
    // --------------------------------------------------------------------------
    const finalCheckoutForm = document.getElementById('finalCheckoutForm');
    if (finalCheckoutForm) {
        const checkoutServicesList = document.getElementById('checkoutServicesList');
        const checkoutSubtotal = document.getElementById('checkoutSubtotal');
        const checkoutDuration = document.getElementById('checkoutDuration');
        const applyPromoBtn = document.getElementById('applyPromoBtn');
        const promoCodeInput = document.getElementById('promoCode');
        const promoFeedback = document.getElementById('promoFeedback');
        const checkoutDateInput = document.getElementById('checkoutDate');
        const bookingSuccessModal = document.getElementById('bookingSuccessModal');
        const modalBookingSummary = document.getElementById('modalBookingSummary');

        let discountPercent = 0;

        // Set default appointment date to tomorrow
        if (checkoutDateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const yyyy = tomorrow.getFullYear();
            const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
            const dd = String(tomorrow.getDate()).padStart(2, '0');
            checkoutDateInput.value = `${yyyy}-${mm}-${dd}`;
            checkoutDateInput.min = `${yyyy}-${mm}-${dd}`;
        }

        function renderCheckoutSummary() {
            const cart = getBookingCart();
            const baseSubtotal = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
            const totalDurationMin = cart.reduce((sum, item) => {
                const min = parseInt(item.duration, 10) || 45;
                return sum + min;
            }, 0);

            let finalTotal = baseSubtotal * (1 - discountPercent / 100);

            if (checkoutDuration) {
                checkoutDuration.textContent = `${totalDurationMin} Min`;
            }

            if (checkoutSubtotal) {
                checkoutSubtotal.textContent = formatCurrency(finalTotal);
            }

            if (checkoutServicesList) {
                if (cart.length === 0) {
                    checkoutServicesList.innerHTML = `
                        <div style="padding: 24px 0; color: #768783; font-size: 14px;">
                            No treatments currently selected. <a href="appointment.html" style="color: var(--button-color); font-weight: 600; text-decoration: underline;">Select Treatments</a>
                        </div>
                    `;
                } else {
                    checkoutServicesList.innerHTML = cart.map(item => `
                        <div class="summary-item">
                            <div>
                                <h4 class="summary-item-name">${item.name}</h4>
                                <div class="summary-item-duration"><i class="fa-regular fa-clock"></i> ${item.duration}</div>
                            </div>
                            <div class="summary-item-price">${formatCurrency(item.price)}</div>
                        </div>
                    `).join('');
                }
            }
        }

        // Promo code handler
        if (applyPromoBtn && promoCodeInput) {
            applyPromoBtn.addEventListener('click', () => {
                const code = promoCodeInput.value.trim().toUpperCase();
                if (!code) {
                    promoFeedback.style.color = '#c0392b';
                    promoFeedback.textContent = 'Please enter a promo code.';
                    return;
                }

                if (code === 'DHAWAN10' || code === 'GLOW' || code === 'FIRST') {
                    discountPercent = 10;
                    promoFeedback.style.color = '#1b7a4b';
                    promoFeedback.textContent = 'Code applied! 10% discount added to your appointment.';
                } else {
                    discountPercent = 0;
                    promoFeedback.style.color = '#c0392b';
                    promoFeedback.textContent = 'Invalid promo code. Please check and try again.';
                }
                renderCheckoutSummary();
            });
        }

        // Form submission
        finalCheckoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const cart = getBookingCart();
            if (cart.length === 0) {
                alert('Please select at least one treatment before confirming.');
                return;
            }

            const clientName = document.getElementById('checkoutName').value.trim();
            const clientMobile = document.getElementById('checkoutMobile').value.trim();
            const clientDate = document.getElementById('checkoutDate').value;
            const clientTime = document.getElementById('checkoutTime').value;

            const baseTotal = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
            const finalTotal = baseTotal * (1 - discountPercent / 100);

            if (modalBookingSummary) {
                modalBookingSummary.innerHTML = `
                    <p><strong>Patient Name:</strong> ${clientName}</p>
                    <p><strong>Phone:</strong> ${clientMobile}</p>
                    <p><strong>Date & Time:</strong> ${clientDate} at ${clientTime}</p>
                    <p><strong>Treatments:</strong> ${cart.map(c => c.name).join(', ')}</p>
                    <p><strong>Estimated Total:</strong> ${formatCurrency(finalTotal)} (Pay at clinic)</p>
                    <p><strong>Location:</strong> Muktsar Road, Guru Har Sahai, Distt. Ferozepur</p>
                `;
            }

            if (bookingSuccessModal) {
                bookingSuccessModal.classList.add('active');
            }

            // Clear the cart
            saveBookingCart([]);
        });

        renderCheckoutSummary();
    }
});


