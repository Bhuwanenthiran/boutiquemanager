import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme';

export const Card = ({ children, style, onPress, elevated = false }) => {
    const content = (
        <View style={[styles.card, elevated && SHADOWS.medium, style]}>
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

export const SectionHeader = ({ title, subtitle, actionText, onAction, icon }) => (
    <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
            <View style={styles.sectionTitleRow}>
                {icon && <Ionicons name={icon} size={20} color={COLORS.primary} style={{ marginRight: SIZES.sm }} />}
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
        {actionText && (
            <TouchableOpacity onPress={onAction} style={styles.sectionAction}>
                <Text style={styles.sectionActionText}>{actionText}</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
        )}
    </View>
);

export const StatusBadge = ({ status, size = 'medium' }) => {
    const getStatusStyle = () => {
        switch (status?.toLowerCase().replace(/\s/g, '_')) {
            case 'completed': case 'ready': case 'delivered':
                return { bg: COLORS.successLight, text: COLORS.success, dot: COLORS.success };
            case 'in_progress': case 'in_production': case 'stitching':
                return { bg: COLORS.warningLight, text: COLORS.warning, dot: COLORS.warning };
            case 'pending':
                return { bg: COLORS.slateLight, text: COLORS.slate, dot: COLORS.slate };
            case 'marking': case 'cutting':
                return { bg: COLORS.primaryMuted, text: COLORS.primary, dot: COLORS.primary };
            case 'cancelled': case 'on_hold':
                return { bg: COLORS.errorLight, text: COLORS.error, dot: COLORS.error };
            default:
                return { bg: COLORS.borderLight, text: COLORS.textSecondary, dot: COLORS.textMuted };
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

export const FloatingButton = ({ onPress, icon = 'add', label }) => (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.fabInner}>
            <Ionicons name={icon} size={24} color={COLORS.textOnPrimary} />
            {label && <Text style={styles.fabLabel}>{label}</Text>}
        </View>
    </TouchableOpacity>
);

export const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }) => (
    <View style={styles.emptyState}>
        <View style={styles.emptyIconWrap}>
            <Ionicons name={icon || 'folder-open-outline'} size={48} color={COLORS.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
        {actionLabel && (
            <TouchableOpacity style={styles.emptyAction} onPress={onAction}>
                <Text style={styles.emptyActionText}>{actionLabel}</Text>
            </TouchableOpacity>
        )}
    </View>
);

export const LoadingSkeleton = ({ width = '100%', height = 16, style }) => (
    <View style={[styles.skeleton, { width, height, borderRadius: height / 2 }, style]} />
);

export const Divider = ({ style }) => <View style={[styles.divider, style]} />;

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
