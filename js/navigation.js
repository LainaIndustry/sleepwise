/**
 * SleepWise - Navigation
 * Mobile menu, dropdowns, and keyboard navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
    
    // Mobile menu toggle
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function() {
            const isOpen = mainNav.classList.toggle('open');
            this.setAttribute('aria-expanded', isOpen);
        });
        
        // Close menu on link click (mobile)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('open');
                if (navToggle) {
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
    
    // Dropdown toggles
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const menu = this.nextElementSibling;
            
            this.setAttribute('aria-expanded', !isExpanded);
            if (menu) {
                menu.setAttribute('aria-hidden', isExpanded);
            }
            
            // Close other dropdowns
            dropdownToggles.forEach(other => {
                if (other !== this) {
                    other.setAttribute('aria-expanded', 'false');
                    const otherMenu = other.nextElementSibling;
                    if (otherMenu) {
                        otherMenu.setAttribute('aria-hidden', 'true');
                    }
                }
            });
        });
    });
    
    // Keyboard navigation for dropdowns
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.setAttribute('aria-expanded', 'false');
                const menu = this.nextElementSibling;
                if (menu) {
                    menu.setAttribute('aria-hidden', 'true');
                }
                this.focus();
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-dropdown')) {
            dropdownToggles.forEach(toggle => {
                toggle.setAttribute('aria-expanded', 'false');
                const menu = toggle.nextElementSibling;
                if (menu) {
                    menu.setAttribute('aria-hidden', 'true');
                }
            });
        }
    });
    
    // Handle window resize - close mobile menu on desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1024 && mainNav) {
            mainNav.classList.remove('open');
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });
});
