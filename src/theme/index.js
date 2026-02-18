// Atelier Boutique — Premium Design System
// Inspired by luxury tailoring studios: warm ivories, muted rose, gold accents

export const COLORS = {
    // Primary Palette — Warm & Luxurious
    primary: '#B8860B',        // Dark goldenrod — the thread of luxury
    primaryLight: '#D4A843',
    primarySoft: '#F5E6C8',
    primaryMuted: '#FDF2E0',

    // Accent — Muted Rose
    accent: '#C27A7A',
    accentLight: '#E8B4B4',
    accentSoft: '#FBE8E8',

    // Backgrounds
    bg: '#FDF6F0',             // Warm cream
    bgCard: '#FFFFFF',
    bgElevated: '#FFF9F4',
    bgOverlay: 'rgba(45, 35, 25, 0.4)',

    // Text
    textPrimary: '#2D2319',    // Dark warm brown
    textSecondary: '#7A6B5D',
    textMuted: '#A89888',
    textLight: '#C4B5A5',
    textOnPrimary: '#FFFFFF',

    // Status
    success: '#6B9E6B',
    successLight: '#E8F5E8',
    warning: '#D4A843',
    warningLight: '#FFF8E7',
    error: '#C27A7A',
    errorLight: '#FBE8E8',
    info: '#7A9EB8',
    infoLight: '#E8F0F8',

    // Borders & Dividers
    border: '#EDE5DC',
    borderLight: '#F5EFE8',
    divider: '#F0E8E0',

    // Shadows
    shadowColor: '#2D2319',

    // Special
    gold: '#B8860B',
    goldLight: '#F5E6C8',
    rose: '#C27A7A',
    roseLight: '#FBE8E8',
    sage: '#6B9E6B',
    sageLight: '#E8F5E8',
    slate: '#7A9EB8',
    slateLight: '#E8F0F8',
};

export const FONTS = {
    // Using system fonts with fallbacks for a refined feel
    light: { fontWeight: '300' },
    regular: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    semiBold: { fontWeight: '600' },
    bold: { fontWeight: '700' },
};

export const SIZES = {
    // Spacing
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,

    // Border Radius
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 20,
    radiusFull: 999,

    // Font Sizes
    caption: 11,
    small: 12,
    body: 14,
    bodyLg: 16,
    subtitle: 18,
    title: 22,
    heading: 28,
    hero: 34,
};

export const SHADOWS = {
    small: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    large: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
    },
    golden: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
};
