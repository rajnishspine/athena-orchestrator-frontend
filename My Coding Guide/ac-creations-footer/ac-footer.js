class ACCreationsShaderFooter {
    constructor(options = {}) {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.mouse = { x: 0.5, y: 0.5 };
        this.time = 0;
        this.isWebGLSupported = false;
        this.currentHour = new Date().getHours();
        
        // Configuration options for reusability
        this.config = {
            height: options.height || '200px', // Updated from 80px to 200px
            logoSize: options.logoSize || '300px', // Updated from 120px to 300px
            intensity: options.intensity || 1.0,
            speed: options.speed || 1.0,
            customColors: options.customColors || null,
            container: options.container || document.body
        };
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.checkWebGLSupport();
        
        if (this.isWebGLSupported) {
            console.log('WebGL supported, initializing shader experience');
            this.initWebGL();
        } else {
            console.log('WebGL not supported, using CSS fallback');
            this.initCSSFallback();
        }
        
        this.setupEventListeners();
        this.setupCustomCursor();
        this.setupLogoSwitching();
    }

    setupCanvas() {
        // Find the footer container or create one
        let footerContainer = this.config.container;
        if (footerContainer === document.body) {
            footerContainer = document.querySelector('.ac-creations-footer');
        }
        
        if (!footerContainer) {
            console.warn('Footer container not found');
            return;
        }
        
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'shaderCanvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '1';
        this.canvas.style.pointerEvents = 'none';
        
        // Insert canvas into footer container, not body
        footerContainer.insertBefore(this.canvas, footerContainer.firstChild);
        
        this.resizeCanvas();
    }

    checkWebGLSupport() {
        try {
            const testCanvas = document.createElement('canvas');
            const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
            this.isWebGLSupported = !!gl;
            
            if (gl) {
                // Test if we can create a basic shader
                const vs = gl.createShader(gl.VERTEX_SHADER);
                const fs = gl.createShader(gl.FRAGMENT_SHADER);
                this.isWebGLSupported = !!(vs && fs);
            }
        } catch (e) {
            console.warn('WebGL check failed:', e);
            this.isWebGLSupported = false;
        }
    }

    initWebGL() {
        try {
            this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
            
            if (!this.gl) {
                throw new Error('Failed to get WebGL context');
            }

            this.createShaderProgram();
            this.setupGeometry();
            this.render();
            
        } catch (error) {
            console.error('WebGL initialization failed:', error);
            this.initCSSFallback();
        }
    }

    getTimeBasedColors() {
        const hour = new Date().getHours();
        
        // Sophisticated, footer-appropriate color palettes
        // Following your philosophy: "simplification as kindness"
        if (hour >= 6 && hour < 12) {
            // Morning: Gentle awakening - soft, welcoming
            return {
                color1: [0.15, 0.25, 0.45], // Deep navy (trust)
                color2: [0.25, 0.35, 0.55], // Soft blue (calm)
                color3: [0.35, 0.45, 0.65], // Medium blue (professional)
                color4: [0.45, 0.55, 0.75], // Light blue (approachable)
                isDark: true
            };
        } else if (hour >= 12 && hour < 18) {
            // Afternoon: Confident professionalism
            return {
                color1: [0.2, 0.3, 0.5], // Professional blue
                color2: [0.3, 0.4, 0.6], // Trustworthy blue
                color3: [0.25, 0.35, 0.55], // Reliable blue
                color4: [0.35, 0.45, 0.65], // Approachable blue
                isDark: true
            };
        } else if (hour >= 18 && hour < 22) {
            // Evening: Warm sophistication - your brand colors
            return {
                color1: [0.25, 0.15, 0.4], // Deep purple (creativity)
                color2: [0.35, 0.25, 0.5], // Rich purple (innovation)
                color3: [0.2, 0.25, 0.45], // Purple-blue (depth)
                color4: [0.3, 0.35, 0.55], // Soft purple-blue (warmth)
                isDark: true
            };
        } else {
            // Night: Deep elegance - signature AC Creations
            return {
                color1: [0.2, 0.1, 0.35], // Deep purple (sophistication)
                color2: [0.15, 0.2, 0.4], // Dark blue (trust)
                color3: [0.25, 0.15, 0.4], // Rich purple (creativity)
                color4: [0.2, 0.25, 0.45], // Purple-blue (balance)
                isDark: true
            };
        }
    }

    createShaderProgram() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            varying vec2 v_position;
            
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                v_position = a_position;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            uniform vec3 u_color1;
            uniform vec3 u_color2;
            uniform vec3 u_color3;
            uniform vec3 u_color4;
            
            varying vec2 v_uv;
            varying vec2 v_position;

            // Simple noise function (clean, no grain)
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                
                vec2 u = f * f * (3.0 - 2.0 * f);
                
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            void main() {
                vec2 uv = v_uv;
                vec2 pos = v_position;
                
                // Simple, clean flowing gradient
                float n1 = noise(pos * 3.0 + u_time * 0.1);
                float n2 = noise(pos * 2.0 - u_time * 0.05);
                float flow = (n1 + n2) * 0.5;
                
                // Mouse influence (clean, no ripples)
                vec2 mousePos = (u_mouse - 0.5) * 2.0;
                float mouseDist = length(pos - mousePos);
                float mouseEffect = 1.0 - smoothstep(0.0, 1.5, mouseDist);
                flow += mouseEffect * 0.3;
                
                // Time-based color mixing
                float mixer1 = sin(flow * 2.0 + u_time * 0.2) * 0.5 + 0.5;
                float mixer2 = cos(flow * 2.5 - u_time * 0.15) * 0.5 + 0.5;
                float mixer3 = sin(u_time * 0.1 + flow) * 0.5 + 0.5;
                
                // Blend the four time-based colors
                vec3 blend1 = mix(u_color1, u_color2, mixer1);
                vec3 blend2 = mix(u_color3, u_color4, mixer2);
                vec3 gradient = mix(blend1, blend2, mixer3);
                
                // Subtle brightness variation for breathing effect
                gradient *= 0.8 + 0.2 * (sin(flow * 4.0 + u_time * 0.5) * 0.5 + 0.5);
                
                gl_FragColor = vec4(gradient, 1.0);
            }
        `;

        // Create and compile shaders
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            throw new Error('Failed to create shaders');
        }

        // Create program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            const error = this.gl.getProgramInfoLog(this.program);
            console.error('Shader program failed to link:', error);
            throw new Error('Shader linking failed: ' + error);
        }

        this.gl.useProgram(this.program);

        // Get uniform locations
        this.uniforms = {
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
            color1: this.gl.getUniformLocation(this.program, 'u_color1'),
            color2: this.gl.getUniformLocation(this.program, 'u_color2'),
            color3: this.gl.getUniformLocation(this.program, 'u_color3'),
            color4: this.gl.getUniformLocation(this.program, 'u_color4')
        };

        console.log('Shader program created successfully');
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const error = this.gl.getShaderInfoLog(shader);
            console.error('Shader compilation error:', error);
            console.error('Source:', source);
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    setupGeometry() {
        // Create a full-screen quad
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        // Get the footer container dimensions
        const footerContainer = this.canvas.parentElement;
        if (!footerContainer) return;
        
        const rect = footerContainer.getBoundingClientRect();
        // Ensure canvas doesn't exceed viewport width
        const maxWidth = Math.min(rect.width, window.innerWidth);
        
        this.canvas.width = maxWidth * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        
        // Set the display size to match the container but not exceed viewport
        this.canvas.style.width = maxWidth + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    setupEventListeners() {
        // Mouse movement
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = event.clientX / window.innerWidth;
            this.mouse.y = 1.0 - (event.clientY / window.innerHeight);
        });

        // Touch support
        window.addEventListener('touchmove', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            this.mouse.x = touch.clientX / window.innerWidth;
            this.mouse.y = 1.0 - (touch.clientY / window.innerHeight);
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    setupCustomCursor() {
        const cursor = document.getElementById('cursor');
        if (!cursor) return;
        
        window.addEventListener('mousemove', (event) => {
            cursor.style.left = event.clientX + 'px';
            cursor.style.top = event.clientY + 'px';
        });
    }

    setupLogoSwitching() {
        const logoImage = document.getElementById('logoImage');
        if (!logoImage) return;

        // Update logo based on time of day every minute
        const updateLogo = () => {
            const colors = this.getTimeBasedColors();
            
            // Robust path detection system
            let logoPrefix = this.detectLogoPath();
            
            // Logo Logic Explanation:
            // - "Light Background.png" = BLACK logo (for use on light backgrounds)
            // - "Dark Background.png" = WHITE logo (for use on dark backgrounds)  
            // Since all our gradients are dark (isDark: true), we use the WHITE logo (Dark Background.png)
            const logoSrc = colors.isDark ? 
                `${logoPrefix}AC Creations Logo Dark Background.png` : 
                `${logoPrefix}AC Creations Logo Light Background.png`;
            
            logoImage.src = logoSrc;
            
            // Error handling: if logo fails to load, try alternative paths
            logoImage.onerror = () => {
                this.handleLogoLoadError(logoImage, colors.isDark);
            };
        };

        updateLogo(); // Set initial logo
        setInterval(updateLogo, 60000); // Update every minute
    }

    detectLogoPath() {
        // Try multiple detection methods for robust path finding
        
        // Method 1: Check CSS link href patterns
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        for (let link of cssLinks) {
            if (link.href.includes('ac-footer.css')) {
                if (link.href.includes('/ac-creations-footer/ac-footer.css')) {
                    return 'ac-creations-footer/';
                } else if (link.getAttribute('href') === 'ac-footer.css') {
                    return ''; // Same directory
                } else if (link.getAttribute('href') === '../ac-footer.css') {
                    return '../';
                }
            }
        }
        
        // Method 2: Check script src patterns  
        const scripts = document.querySelectorAll('script');
        for (let script of scripts) {
            if (script.src && script.src.includes('ac-footer.js')) {
                if (script.src.includes('/ac-creations-footer/ac-footer.js')) {
                    return 'ac-creations-footer/';
                } else if (script.getAttribute('src') === 'ac-footer.js') {
                    return '';
                } else if (script.getAttribute('src') === '../ac-footer.js') {
                    return '../';
                }
            }
        }
        
        // Method 3: Check if we can find existing logo images in the DOM
        const existingLogos = document.querySelectorAll('img[src*="AC Creations Logo"]');
        for (let logo of existingLogos) {
            const src = logo.getAttribute('src');
            if (src.includes('/ac-creations-footer/')) {
                return 'ac-creations-footer/';
            } else if (src.startsWith('../')) {
                return '../';
            } else if (!src.includes('/')) {
                return '';
            }
        }
        
        // Method 4: Try to detect based on current page location
        const currentPath = window.location.pathname;
        if (currentPath.includes('/ac-creations-footer/')) {
            return '';
        } else if (currentPath.includes('/integration-examples/')) {
            return '../';
        }
        
        // Default: Assume external project structure
        return 'ac-creations-footer/';
    }

    handleLogoLoadError(logoImage, isDark) {
        // Fallback paths to try when logo doesn't load
        const fallbackPaths = [
            '', // Same directory
            'ac-creations-footer/', // External project
            '../', // Subfolder
            './ac-creations-footer/', // Relative path
            '/ac-creations-footer/', // Root path
            'assets/', // Common assets folder
            'images/', // Common images folder
            'logo/', // Common logo folder
        ];
        
        const logoName = isDark ? 
            'AC Creations Logo Dark Background.png' : 
            'AC Creations Logo Light Background.png';
        
        // Try each fallback path
        let attemptIndex = 0;
        const tryNextPath = () => {
            if (attemptIndex >= fallbackPaths.length) {
                // All paths failed, use a data URL as final fallback
                logoImage.src = this.getFallbackLogoDataUrl(isDark);
                console.warn('AC Creations Footer: Logo files not found. Please ensure AC Creations logo PNG files are in the correct location.');
                return;
            }
            
            const testPath = fallbackPaths[attemptIndex] + logoName;
            attemptIndex++;
            
            // Test if this path works
            const testImage = new Image();
            testImage.onload = () => {
                logoImage.src = testPath;
                logoImage.onerror = null; // Remove error handler
            };
            testImage.onerror = tryNextPath;
            testImage.src = testPath;
        };
        
        tryNextPath();
    }

    getFallbackLogoDataUrl(isDark) {
        // Simple SVG logo as final fallback
        const color = isDark ? '#ffffff' : '#000000';
        const svgLogo = `
            <svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
                <text x="100" y="35" font-family="Arial, sans-serif" font-size="18" font-weight="bold" 
                      text-anchor="middle" fill="${color}">AC Creations</text>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svgLogo)}`;
    }

    initCSSFallback() {
        console.log('Using CSS fallback for animated gradient');
        const colors = this.getTimeBasedColors();
        
        // Convert RGB arrays to CSS color strings
        const css1 = `rgb(${Math.floor(colors.color1[0]*255)}, ${Math.floor(colors.color1[1]*255)}, ${Math.floor(colors.color1[2]*255)})`;
        const css2 = `rgb(${Math.floor(colors.color2[0]*255)}, ${Math.floor(colors.color2[1]*255)}, ${Math.floor(colors.color2[2]*255)})`;
        const css3 = `rgb(${Math.floor(colors.color3[0]*255)}, ${Math.floor(colors.color3[1]*255)}, ${Math.floor(colors.color3[2]*255)})`;
        const css4 = `rgb(${Math.floor(colors.color4[0]*255)}, ${Math.floor(colors.color4[1]*255)}, ${Math.floor(colors.color4[2]*255)})`;
        
        this.config.container.style.background = `linear-gradient(45deg, ${css1}, ${css2}, ${css3}, ${css4})`;
        this.config.container.style.backgroundSize = '400% 400%';
        this.config.container.style.animation = 'gradientShift 12s ease-in-out infinite';
    }

    render() {
        if (!this.isWebGLSupported || !this.gl || !this.program) {
            return;
        }

        this.time += 0.016; // ~60fps

        // Get current time-based colors
        const colors = this.getTimeBasedColors();

        // Clear the canvas
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Set uniforms
        this.gl.uniform1f(this.uniforms.time, this.time);
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.uniforms.mouse, this.mouse.x, this.mouse.y);
        
        // Set time-based color uniforms
        this.gl.uniform3f(this.uniforms.color1, colors.color1[0], colors.color1[1], colors.color1[2]);
        this.gl.uniform3f(this.uniforms.color2, colors.color2[0], colors.color2[1], colors.color2[2]);
        this.gl.uniform3f(this.uniforms.color3, colors.color3[0], colors.color3[1], colors.color3[2]);
        this.gl.uniform3f(this.uniforms.color4, colors.color4[0], colors.color4[1], colors.color4[2]);

        // Draw the quad
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        // Continue the animation loop
        requestAnimationFrame(() => this.render());
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ACCreationsShaderFooter;
}

// Auto-initialize when page loads (for direct HTML usage)
document.addEventListener('DOMContentLoaded', () => {
    // Only auto-initialize if not being used as a module
    if (!window.ACCreationsShaderFooter) {
        window.ACCreationsShaderFooter = ACCreationsShaderFooter;
        
        try {
            new ACCreationsShaderFooter();
        } catch (error) {
            console.error('Failed to initialize AC Creations shader footer:', error);
        }
    }
});

// Graceful error handling
window.addEventListener('error', (event) => {
    console.error('JavaScript error occurred:', event.error);
});

// Static method for easy initialization
ACCreationsShaderFooter.create = function(options) {
    return new ACCreationsShaderFooter(options);
};