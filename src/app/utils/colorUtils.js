/**
 * Color utility functions for FlowCanvas
 */

/**
 * Generates a random RGB color
 * @returns {string} RGB color string in format "rgb(r, g, b)"
 */
export const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Converts RGB color to Hex format
 * @param {string} rgb - RGB color string
 * @returns {string} Hex color string
 */
export const rgbToHex = (rgb) => {
    if (!rgb || !rgb.startsWith('rgb')) return rgb;
    const match = rgb.match(/(\d+)/g);
    if (!match) return rgb;
    const [r, g, b] = match.map(Number);
    const toHex = (c) => ('0' + c.toString(16)).slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Converts RGB to RGBA with specified opacity
 * @param {string} rgb - RGB color string
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color string
 */
export const rgbToRgba = (rgb, opacity = 0.3) => {
    if (!rgb) return `rgba(173, 216, 230, ${opacity})`;
    if (rgb.startsWith('rgba')) return rgb;
    if (rgb.startsWith('rgb')) {
        return rgb.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    return rgb;
};
