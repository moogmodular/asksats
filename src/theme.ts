import { createTheme } from '@mui/material'

declare module '@mui/material/styles' {
    interface Palette {
        btcgrey: Palette['primary']
        white: Palette['primary']
    }

    // allow configuration using `createTheme`
    interface PaletteOptions {
        btcgrey?: PaletteOptions['primary']
        white?: PaletteOptions['primary']
    }
}

// Update the Button's color prop options
declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        btcgrey: true
        white: true
    }
}

declare module '@mui/material/IconButton' {
    interface IconButtonPropsColorOverrides {
        btcgrey: true
        white: true
    }
}

declare module '@mui/material/SvgIcon' {
    interface SvgIconPropsColorOverrides {
        btcgrey: true
        white: true
    }
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#ff9900',
        },
        secondary: {
            main: '#B37212',
        },
        warning: {
            main: '#ec3426',
        },
        success: {
            main: '#19FF65',
        },
        error: {
            main: '#ff1900',
        },
        info: {
            main: '#8C19FF',
        },
        btcgrey: {
            main: '#4d4d4e',
        },
        white: {
            main: '#ffffff',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 0 },
            },
            // variants: [
            //     {
            //         props: { variant: 'preview' },
            //         style: {
            //             borderTop: '1px solid #ccc',
            //             borderLeft: '1px solid #ccc',
            //         },
            //     },
            // ],
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: { borderRadius: 0 },
            },
        },
    },
})

export default theme
