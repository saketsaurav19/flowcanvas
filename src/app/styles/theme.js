/**
 * Design system and theme configuration for FlowCanvas
 */

export const theme = {
    colors: {
        primary: {
            main: '#2563eb',
            hover: '#1d4ed8',
            light: '#3b82f6',
            dark: '#1e40af',
        },
        secondary: {
            main: '#10b981',
            hover: '#059669',
            light: '#34d399',
            dark: '#047857',
        },
        accent: {
            main: '#8b5cf6',
            hover: '#7c3aed',
            light: '#a78bfa',
            dark: '#6d28d9',
        },
        background: {
            primary: '#ffffff',
            secondary: '#f9fafb',
            tertiary: '#f3f4f6',
            dark: '#1f2937',
        },
        text: {
            primary: '#111827',
            secondary: '#6b7280',
            light: '#9ca3af',
            white: '#ffffff',
        },
        border: {
            light: '#e5e7eb',
            medium: '#d1d5db',
            dark: '#9ca3af',
        },
        status: {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
        },
    },

    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        xxl: '3rem',
    },

    borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
    },

    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },

    transitions: {
        fast: '150ms ease-in-out',
        medium: '300ms ease-in-out',
        slow: '500ms ease-in-out',
    },

    typography: {
        fontFamily: {
            sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },
};

export default theme;
