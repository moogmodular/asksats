/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}', './public/**/*.html'],
    daisyui: {
        themes: [
            {
                mytheme: {
                    primary: '#ff9900',
                    secondary: '#eae719',
                    accent: '#8d83d3',
                    neutral: '#231F2E',
                    'base-100': '#f5f5f4',
                    info: '#4196D2',
                    success: '#4DD58F',
                    warning: '#EA9C1F',
                    error: '#FB4170',
                },
            },
        ],
    },
    theme: {
        extend: {
            borderRadius: {
                global: '0rem',
                small: '0.5rem',
            },
            fontFamily: {
                ui: ['Montserrat'],
                editable: ['Roboto Mono'],
            },
            width: {
                'modal-width': '75vw',
            },
            height: {
                'modal-height': '55vh',
            },
        },
    },
    plugins: [require('@tailwindcss/typography'), require('daisyui')],
}
