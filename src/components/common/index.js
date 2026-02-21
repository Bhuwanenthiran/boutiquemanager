import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS, getColors } from '../../theme';
import { useThemeStore } from '../../store/themeStore';

export const Card = ({ children, style, onPress, elevated = false }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    const content = (
        <View style={[
            styles.card,
            { backgroundColor: C.bgCard, borderColor: C.borderLight },
            elevated && SHADOWS.medium,
            style
        ]}>
            {children}
        </View>
    );
    if (onPress) {
        return (
            <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
                {content}
            </TouchableOpacity>
        );
    }
    return content;
};

export const SectionHeader = ({ title, subtitle, actionText, onAction, icon }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
                <View style={styles.sectionTitleRow}>
                    {icon && <Ionicons name={icon} size={20} color={C.primary} style={{ marginRight: SIZES.sm }} />}
                    <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>{title}</Text>
                </View>
                {subtitle && <Text style={[styles.sectionSubtitle, { color: C.textMuted }]}>{subtitle}</Text>}
            </View>
            {actionText && (
                <TouchableOpacity onPress={onAction} style={styles.sectionAction}>
                    <Text style={[styles.sectionActionText, { color: C.primary }]}>{actionText}</Text>
                    <Ionicons name="chevron-forward" size={14} color={C.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

export const StatusBadge = ({ status, size = 'medium' }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    const getStatusStyle = () => {
        switch (status?.toLowerCase().replace(/\s/g, '_')) {
            case 'completed': case 'ready': case 'delivered':
                return { bg: C.successLight, text: C.success, dot: C.success };
            case 'in_progress': case 'in_production': case 'stitching':
                return { bg: C.warningLight, text: C.warning, dot: C.warning };
            case 'pending':
                return { bg: C.slateLight, text: C.slate, dot: C.slate };
            case 'marking': case 'cutting':
                return { bg: C.primaryMuted, text: C.primary, dot: C.primary };
            case 'cancelled': case 'on_hold':
                return { bg: C.errorLight, text: C.error, dot: C.error };
            default:
                return { bg: C.borderLight, text: C.textSecondary, dot: C.textMuted };
        }
    };
    const s = getStatusStyle();
    const isSmall = size === 'small';

    return (
        <View style={[styles.badge, { backgroundColor: s.bg }, isSmall && styles.badgeSmall]}>
            <View style={[styles.badgeDot, { backgroundColor: s.dot }, isSmall && styles.badgeDotSmall]} />
            <Text style={[styles.badgeText, { color: s.text }, isSmall && styles.badgeTextSmall]}>
                {status?.replace(/_/g, ' ')}
            </Text>
        </View>
    );
};

export const FloatingButton = ({ onPress, icon = 'add', label }) => {
    const insets = useSafeAreaInsets();
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <TouchableOpacity
            style={[styles.fab, { bottom: SIZES.xl + insets.bottom }]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={[styles.fabInner, { backgroundColor: C.primary }]}>
                <Ionicons name={icon} size={24} color={C.textOnPrimary} />
                {label && <Text style={[styles.fabLabel, { color: C.textOnPrimary }]}>{label}</Text>}
            </View>
        </TouchableOpacity>
    );
};

export const ScreenWrapper = ({ children, style, useSafeBottom = true }) => {
    const insets = useSafeAreaInsets();
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={[
            { flex: 1, backgroundColor: C.bg },
            useSafeBottom && { paddingBottom: insets.bottom },
            style
        ]}>
            {children}
        </View>
    );
};

export const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: C.primaryMuted }]}>
                <Ionicons name={icon || 'folder-open-outline'} size={48} color={C.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: C.textSecondary }]}>{title}</Text>
            {subtitle && <Text style={[styles.emptySubtitle, { color: C.textMuted }]}>{subtitle}</Text>}
            {actionLabel && (
                <TouchableOpacity style={[styles.emptyAction, { backgroundColor: C.primary }]} onPress={onAction}>
                    <Text style={[styles.emptyActionText, { color: C.textOnPrimary }]}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export const LoadingSkeleton = ({ width = '100%', height = 16, style }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    return (
        <View style={[styles.skeleton, { width, height, borderRadius: height / 2, backgroundColor: C.borderLight }, style]} />
    );
};

export const Divider = ({ style }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    return <View style={[styles.divider, { backgroundColor: C.divider }, style]} />;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.base,
        marginBottom: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOWS.small,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        marginTop: SIZES.sm,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: SIZES.subtitle,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        letterSpacing: 0.3,
    },
    sectionSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        marginTop: 2,
        ...FONTS.regular,
    },
    sectionAction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionActionText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        ...FONTS.medium,
        marginRight: 2,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.xs + 2,
        borderRadius: SIZES.radiusFull,
    },
    badgeSmall: {
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
    },
    badgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: SIZES.xs + 2,
    },
    badgeDotSmall: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginRight: SIZES.xs,
    },
    badgeText: {
        fontSize: SIZES.small,
        ...FONTS.medium,
        textTransform: 'capitalize',
    },
    badgeTextSmall: {
        fontSize: SIZES.caption,
    },
    fab: {
        position: 'absolute',
        bottom: SIZES.xl,
        right: SIZES.lg,
        zIndex: 100,
    },
    fabInner: {
        backgroundColor: COLORS.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        ...SHADOWS.golden,
    },
    fabLabel: {
        color: COLORS.textOnPrimary,
        fontSize: SIZES.small,
        ...FONTS.semiBold,
        marginLeft: SIZES.xs,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.xxxl * 2,
        paddingHorizontal: SIZES.xl,
    },
    emptyIconWrap: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    emptyTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textSecondary,
        ...FONTS.semiBold,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
        textAlign: 'center',
        marginTop: SIZES.sm,
        lineHeight: 20,
    },
    emptyAction: {
        marginTop: SIZES.lg,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.xl,
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusFull,
    },
    emptyActionText: {
        color: COLORS.textOnPrimary,
        fontSize: SIZES.body,
        ...FONTS.semiBold,
    },
    skeleton: {
        backgroundColor: COLORS.borderLight,
        opacity: 0.6,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginVertical: SIZES.md,
    },
});
