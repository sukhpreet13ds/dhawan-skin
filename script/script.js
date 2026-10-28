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
});


