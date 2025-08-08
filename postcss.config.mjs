/**
 * POSTCSS CONFIGURATION
 * Processing pipeline for CSS files in the CrisisPM platform.
 * Configures Tailwind CSS and Autoprefixer for cross-browser compatibility.
 */
const config = {
  plugins: {
    /**
     * TAILWIND CSS PROCESSING
     * Processes Tailwind directives and generates utility classes based on usage.
     */
    tailwindcss: {},
    
    /**
     * AUTOPREFIXER
     * Automatically adds vendor prefixes to CSS properties for browser compatibility.
     * Uses browserslist configuration for target browser support.
     */
    autoprefixer: {},
  },
}

export default config