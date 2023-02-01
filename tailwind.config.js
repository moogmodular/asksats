/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}', './public/**/*.html'],
    theme: {
        extend: {
            colors: {
                primary: '#ff9900',
                secondary: '#B37212',
                warning: '#ec3426',
                success: '#19FF65',
                error: '#ff1900',
                info: '#8C19FF',
                btcgrey: '#4D4D4D',
            },
            borderRadius: {
                global: '0',
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
                'modal-height': '85vh',
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
}
