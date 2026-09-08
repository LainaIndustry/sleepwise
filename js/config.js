/**
 * SleepWise - Site Configuration
 * 
 * Replace the placeholder values below with your actual information
 * before deploying the site.
 */

const SITE_CONFIG = {
    // Site Information
    siteName: 'SleepWise',
    domain: 'https://YOUR-DOMAIN.com',
    contactEmail: 'YOUR_EMAIL@example.com',
    ownerName: 'SleepWise Owner',
    
    // Google AdSense - Replace with your Publisher ID after approval
    // Format: ca-pub-XXXXXXXXXX
    adsensePublisherId: 'ca-pub-XXXXXXXXXX',
enableAdsense: true,
    
    // Google Analytics - Replace with your Measurement ID after setup
    // Format: G-XXXXXXXXXX
    analyticsId: 'G-XXXXXXXXXX',
enableAnalytics: true,
    
    // Social
    twitterHandle: '@SleepWise',
    
    // Features
    enableAnalytics: false, // Set to true after adding analyticsId
    enableAdsense: false,   // Set to true after adding adsensePublisherId
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SITE_CONFIG;
}
