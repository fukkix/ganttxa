/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors (Deep Teal)
        'primary': '#00464a',
        'primary-container': '#006064',
        'primary-fixed': '#a6eff3',
        'primary-fixed-dim': '#8ad3d7',
        'on-primary': '#ffffff',
        'on-primary-container': '#8fd8dc',
        'on-primary-fixed': '#002021',
        'on-primary-fixed-variant': '#004f53',
        'inverse-primary': '#8ad3d7',

        // Secondary Colors (Blue Purple)
        'secondary': '#4858ab',
        'secondary-container': '#96a5ff',
        'secondary-fixed': '#dee0ff',
        'secondary-fixed-dim': '#bac3ff',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#27378a',
        'on-secondary-fixed': '#00105b',
        'on-secondary-fixed-variant': '#2f3f92',

        // Tertiary Colors (Deep Purple)
        'tertiary': '#4e2490',
        'tertiary-container': '#663fa9',
        'tertiary-fixed': '#ebdcff',
        'tertiary-fixed-dim': '#d4bbff',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#d8c1ff',
        'on-tertiary-fixed': '#260058',
        'on-tertiary-fixed-variant': '#572e99',

        // Surface Colors
        'background': '#f8fafb',
        'surface': '#f8fafb',
        'surface-dim': '#d8dadb',
        'surface-bright': '#f8fafb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f5',
        'surface-container': '#eceeef',
        'surface-container-high': '#e6e8e9',
        'surface-container-highest': '#e1e3e4',
        'surface-variant': '#e1e3e4',
        'surface-tint': '#14696d',

        // On Surface Colors
        'on-background': '#191c1d',
        'on-surface': '#191c1d',
        'on-surface-variant': '#3f4949',
        'inverse-surface': '#2e3132',
        'inverse-on-surface': '#eff1f2',

        // Outline Colors
        'outline': '#6f7979',
        'outline-variant': '#bec8c9',

        // Error Colors
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
      },
      borderRadius: {
        'DEFAULT': '0.125rem',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      fontFamily: {
        'headline': ['Manrope', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'label': ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Display sizes
        'display-lg': ['3.5rem', { lineHeight: '1.2', fontWeight: '800' }],
        'display-md': ['2.75rem', { lineHeight: '1.2', fontWeight: '800' }],
        'display-sm': ['2.25rem', { lineHeight: '1.3', fontWeight: '700' }],
        
        // Headline sizes
        'headline-lg': ['2rem', { lineHeight: '1.3', fontWeight: '700' }],
        'headline-md': ['1.75rem', { lineHeight: '1.4', fontWeight: '700' }],
        'headline-sm': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        
        // Body sizes
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        
        // Label sizes
        'label-lg': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '20px',
      },
      boxShadow: {
        'ambient': '0px 24px 48px rgba(0, 70, 74, 0.06)',
        'ambient-lg': '0px 32px 64px rgba(0, 70, 74, 0.08)',
      },
    },
  },
  plugins: [],
}
