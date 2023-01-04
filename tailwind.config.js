/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}', './public/**/*.html'],
    theme: {
        extend: {
            borderRadius: {
                global: '1rem',
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
            backgroundImage: {
                sidebar: "url('/bg_image_2.jpg')",
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
}
