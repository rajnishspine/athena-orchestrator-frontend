// AC Creations Footer Configuration
// Use this file to customize the footer for specific projects

const ACFooterConfig = {
    // Default configuration - Compact professional footer
    default: {
        height: '80px',
        logoSize: '120px',
        intensity: 1.0,
        speed: 1.0
    },
    
    // Preset configurations for different project types
    presets: {
        corporate: {
            height: '70px',
            logoSize: '100px',
            intensity: 0.6,
            speed: 0.8
        },
        
        creative: {
            height: '90px',
            logoSize: '140px',
            intensity: 1.2,
            speed: 1.1
        },
        
        minimal: {
            height: '60px',
            logoSize: '80px',
            intensity: 0.5,
            speed: 0.7
        },
        
        portfolio: {
            height: '85px',
            logoSize: '130px',
            intensity: 1.0,
            speed: 1.0
        },
        
        landing: {
            height: '75px',
            logoSize: '110px',
            intensity: 0.9,
            speed: 1.2
        }
    },
    
    // Color customization (advanced)
    customColors: {
        // Example: Override time-based colors with brand colors
        // Uncomment and modify as needed
        /*
        morning: {
            color1: [0.1, 0.2, 0.4],
            color2: [0.2, 0.3, 0.5],
            color3: [0.3, 0.4, 0.6],
            color4: [0.4, 0.5, 0.7]
        }
        */
    }
};

// Helper function to apply preset
function applyFooterPreset(presetName) {
    const preset = ACFooterConfig.presets[presetName];
    if (preset && window.ACCreationsShaderFooter) {
        return ACCreationsShaderFooter.create(preset);
    }
    console.warn(`Preset "${presetName}" not found. Using default configuration.`);
    return ACCreationsShaderFooter.create(ACFooterConfig.default);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ACFooterConfig, applyFooterPreset };
}

// Make available globally
window.ACFooterConfig = ACFooterConfig;
window.applyFooterPreset = applyFooterPreset;