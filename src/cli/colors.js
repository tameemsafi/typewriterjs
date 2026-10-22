export const PALETTES = {
  dark: {
    green: '#34d399',
    blue: '#60a5fa',
    pink: '#f472b6',
    amber: '#fbbf24',
    yellow: '#fbbf24',
    red: '#f87171',
    purple: '#a78bfa',
    dim: '#64748b',
  },
  light: {
    green: '#059669',
    blue: '#2563eb',
    pink: '#db2777',
    amber: '#b45309',
    yellow: '#b45309',
    red: '#dc2626',
    purple: '#7c3aed',
    dim: '#94a3b8',
  },
};

export const THEMES = {
  dark: {
    background: '#111827',
    bar: '#0f172a',
    border: '#1f2937',
    text: '#f8fafc',
    muted: '#94a3b8',
    labelBackground: '#1e293b',
    labelText: '#fbbf24',
    cursor: '#34d399',
    code: '#34d399',
  },
  light: {
    background: '#ffffff',
    bar: '#f1f5f9',
    border: '#e2e8f0',
    text: '#0f172a',
    muted: '#64748b',
    labelBackground: '#f1f5f9',
    labelText: '#b45309',
    cursor: '#059669',
    code: '#059669',
  },
};

/**
 * Turn a hex color such as #34d399 or #fff into red, green and blue values
 *
 * @param {String} hex Hex color
 * @return {Array|null} Red, green and blue values, or null when the color is not valid
 */
export const hexToRgb = (hex) => {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());

  if(!match) {
    return null;
  }

  const digits = match[1].length === 3
    ? match[1].split('').map(digit => digit + digit).join('')
    : match[1];

  return [0, 2, 4].map(start => parseInt(digits.slice(start, start + 2), 16));
};

/**
 * Get a hex color from a palette name such as "green", or from a hex value
 *
 * @param {String} value Palette name or hex color
 * @param {Object} palette Palette to use
 * @return {String|null}
 */
export const resolveColor = (value, palette) => {
  const name = value.trim().toLowerCase();

  if(palette[name]) {
    return palette[name];
  }

  return hexToRgb(name) ? name : null;
};
