/**
 * Athena Frontend Configuration
 * Centralized configuration for all Athena pages
 */

const ATHENA_CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://10.0.33.97:8001',
    
    // Other configurations can be added here
    MAX_MESSAGE_LENGTH: 2000,
    CACHE_ENABLED: true,
    
    // You can override with environment-specific configs
    getApiUrl: function() {
        // Check if there's a saved URL in localStorage (from config panel)
        const savedUrl = localStorage.getItem('athena_api_url');
        return savedUrl || this.API_BASE_URL;
    }
};

// Make it available globally
window.ATHENA_CONFIG = ATHENA_CONFIG;

