/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}', './public/**/*.html'],
    theme: {
        extend: {
            borderRadius: {
                global: '0.5rem',
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
