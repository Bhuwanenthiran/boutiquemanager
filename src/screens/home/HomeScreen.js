import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useOrderStore } from '../../store/orderStore';
import { useProductionStore } from '../../store/productionStore';
import { useStoreManagementStore } from '../../store/storeManagementStore';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const orders = useOrderStore((s) => s.orders);
    const productionOrders = useProductionStore((s) => s.productionOrders);
    const inventory = useStoreManagementStore((s) => s.inventory);

    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const inProduction = orders.filter(o => ['In Production', 'Marking', 'Cutting'].includes(o.status)).length;
    const readyOrders = orders.filter(o => o.status === 'Ready').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const lowStockItems = inventory.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length;

    const quickActions = [
        { icon: 'add-circle-outline', label: 'New Order', color: COLORS.primary, screen: 'OrderEntry' },
        { icon: 'cut-outline', label: 'Production', color: COLORS.accent, screen: 'StitchingProduction' },
        { icon: 'checkmark-done-outline', label: 'Finishing', color: COLORS.success, screen: 'Finishing' },
        { icon: 'storefront-outline', label: 'Store', color: COLORS.slate, screen: 'StoreManagement' },
    ];

    const recentOrders = orders.slice(0, 4);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Ready': return COLORS.success;
            case 'In Production': return COLORS.warning;
            case 'Pending': return COLORS.slate;
            case 'Marking': case 'Cutting': return COLORS.primary;
            default: return COLORS.textMuted;
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back</Text>
                        <Text style={styles.title}>Atelier Boutique</Text>
                    </View>
                    <TouchableOpacity style={styles.notifBtn}>
                        <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
                        <View style={styles.notifDot} />
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: COLORS.primaryMuted }]}>
                        <View style={[styles.statIcon, { backgroundColor: COLORS.primarySoft }]}>
                            <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.statValue}>{orders.length}</Text>
                        <Text style={styles.statLabel}>Total Orders</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: COLORS.warningLight }]}>
                        <View style={[styles.statIcon, { backgroundColor: '#FFF0CC' }]}>
                            <Ionicons name="construct-outline" size={20} color={COLORS.warning} />
                        </View>
                        <Text style={styles.statValue}>{inProduction}</Text>
                        <Text style={styles.statLabel}>In Production</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: COLORS.successLight }]}>
                        <View style={[styles.statIcon, { backgroundColor: '#D4EDDA' }]}>
                            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
                        </View>
                        <Text style={styles.statValue}>{readyOrders}</Text>
                        <Text style={styles.statLabel}>Ready</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: COLORS.slateLight }]}>
                        <View style={[styles.statIcon, { backgroundColor: '#D0E2F0' }]}>
                            <Ionicons name="time-outline" size={20} color={COLORS.slate} />
                        </View>
                        <Text style={styles.statValue}>{pendingOrders}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </ScrollView>

                {/* Revenue Card */}
                <View style={styles.revenueCard}>
                    <View style={styles.revenueHeader}>
                        <View>
                            <Text style={styles.revenueLabel}>Total Revenue</Text>
                            <Text style={styles.revenueValue}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.revenueBadge}>
                            <Ionicons name="trending-up" size={14} color={COLORS.success} />
                            <Text style={styles.revenueBadgeText}>+12%</Text>
                        </View>
                    </View>
                    <View style={styles.revenueBar}>
                        <View style={[styles.revenueBarFill, { width: '72%' }]} />
                    </View>
                    <Text style={styles.revenueSubtext}>₹{(totalRevenue * 0.28).toLocaleString('en-IN', { maximumFractionDigits: 0 })} pending collection</Text>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    {quickActions.map((action, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.actionCard}
                            onPress={() => navigation.navigate(action.screen)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                                <Ionicons name={action.icon} size={24} color={action.color} />
                            </View>
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Alerts */}
                {lowStockItems > 0 && (
                    <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate('StoreManagement')} activeOpacity={0.8}>
                        <View style={styles.alertIconWrap}>
                            <Ionicons name="warning-outline" size={20} color={COLORS.warning} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.alertTitle}>Low Stock Alert</Text>
                            <Text style={styles.alertDesc}>{lowStockItems} item{lowStockItems > 1 ? 's' : ''} need restocking</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}

                {/* Recent Orders */}
                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>Recent Orders</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {recentOrders.map((order) => (
                    <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.7}
                        onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}>
                        <View style={styles.orderTop}>
                            <View>
                                <Text style={styles.orderId}>{order.id}</Text>
                                <Text style={styles.orderCustomer}>{order.customerName}</Text>
                            </View>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]}>
                                <Text style={styles.statusText}>{order.status}</Text>
                            </View>
                        </View>
                        <View style={styles.orderBottom}>
                            <View style={styles.orderMeta}>
                                <Ionicons name="shirt-outline" size={13} color={COLORS.textMuted} />
                                <Text style={styles.orderMetaText}>{order.designName}</Text>
                            </View>
                            <Text style={styles.orderAmount}>₹{order.totalAmount.toLocaleString('en-IN')}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scrollContent: {
        paddingBottom: SIZES.xxxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.xxxl + SIZES.lg,
        paddingBottom: SIZES.base,
    },
    greeting: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
        letterSpacing: 0.5,
    },
    title: {
        fontSize: SIZES.heading,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        letterSpacing: -0.5,
        marginTop: 2,
    },
    notifBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    notifDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.error,
        borderWidth: 2,
        borderColor: COLORS.bgCard,
    },
    statsRow: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
    },
    statCard: {
        width: (width - SIZES.lg * 2 - SIZES.md * 3) / 2.2,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.base,
        marginRight: SIZES.md,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    statValue: {
        fontSize: SIZES.title,
        color: COLORS.textPrimary,
        ...FONTS.bold,
    },
    statLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        marginTop: 2,
    },
    revenueCard: {
        marginHorizontal: SIZES.lg,
        backgroundColor: COLORS.textPrimary,
        borderRadius: SIZES.radiusXl,
        padding: SIZES.lg,
        marginVertical: SIZES.sm,
    },
    revenueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    revenueLabel: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        ...FONTS.regular,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    revenueValue: {
        fontSize: SIZES.hero,
        color: COLORS.textOnPrimary,
        ...FONTS.bold,
        marginTop: 4,
        letterSpacing: -1,
    },
    revenueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(107, 158, 107, 0.2)',
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusFull,
    },
    revenueBadgeText: {
        color: COLORS.success,
        fontSize: SIZES.caption,
        ...FONTS.semiBold,
        marginLeft: 4,
    },
    revenueBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        marginTop: SIZES.lg,
        marginBottom: SIZES.sm,
    },
    revenueBarFill: {
        height: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    revenueSubtext: {
        fontSize: SIZES.caption,
        color: COLORS.textLight,
        ...FONTS.regular,
    },
    sectionTitle: {
        fontSize: SIZES.subtitle,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        paddingHorizontal: SIZES.lg,
        marginTop: SIZES.lg,
        marginBottom: SIZES.md,
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: SIZES.lg,
    },
    seeAll: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        ...FONTS.medium,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SIZES.lg,
        justifyContent: 'space-between',
    },
    actionCard: {
        width: (width - SIZES.lg * 2 - SIZES.md) / 2,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.base,
        marginBottom: SIZES.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOWS.small,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    actionLabel: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        ...FONTS.medium,
    },
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.warningLight,
        marginHorizontal: SIZES.lg,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginTop: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.warning + '30',
    },
    alertIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.warning + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.md,
    },
    alertTitle: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    alertDesc: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        marginTop: 1,
    },
    orderCard: {
        backgroundColor: COLORS.bgCard,
        marginHorizontal: SIZES.lg,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.base,
        marginBottom: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOWS.small,
    },
    orderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SIZES.sm,
    },
    orderId: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.medium,
        letterSpacing: 0.5,
    },
    orderCustomer: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        marginTop: 2,
    },
    statusDot: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.xs + 1,
        borderRadius: SIZES.radiusFull,
    },
    statusText: {
        fontSize: SIZES.caption,
        color: COLORS.textOnPrimary,
        ...FONTS.semiBold,
    },
    orderBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    orderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderMetaText: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginLeft: 6,
    },
    orderAmount: {
        fontSize: SIZES.bodyLg,
        color: COLORS.primary,
        ...FONTS.bold,
    },
});

export default HomeScreen;
