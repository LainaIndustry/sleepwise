/**
 * SleepWise - Cookie Consent
 * Lightweight cookie consent with localStorage preference
 */

document.addEventListener('DOMContentLoaded', function() {
    const cookieBanner = document.getElementById('cookie-consent');
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');
    
    if (!cookieBanner) return;
    
    // Check if user has already made a choice
    const cookiePreference = localStorage.getItem('cookieConsent');
    
    if (cookiePreference === 'accepted' || cookiePreference === 'rejected') {
        cookieBanner.classList.remove('visible');
        return;
    }
    
    // Show banner after a short delay
    setTimeout(() => {
        cookieBanner.classList.add('visible');
    }, 500);
    
    // Accept
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.classList.remove('visible');
            
            // Load analytics if enabled
            if (window.SITE_CONFIG && window.SITE_CONFIG.enableAnalytics && window.SITE_CONFIG.analyticsId) {
                loadAnalytics(window.SITE_CONFIG.analyticsId);
            }
            
            // Load AdSense if enabled
            if (window.SITE_CONFIG && window.SITE_CONFIG.enableAdsense && window.SITE_CONFIG.adsensePublisherId) {
                loadAdsense(window.SITE_CONFIG.adsensePublisherId);
            }
        });
    }
    
    // Reject
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'rejected');
            cookieBanner.classList.remove('visible');
        });
    }
    
    function loadAnalytics(analyticsId) {
        if (document.querySelector('script[src*="analytics"]')) return;
        
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
        script.async = true;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', analyticsId);
        window.gtag = gtag;
    }
    
    function loadAdsense(publisherId) {
        if (document.querySelector('script[src*="adsbygoogle"]')) return;
        
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-ad-client', publisherId);
        document.head.appendChild(script);
    }
});
