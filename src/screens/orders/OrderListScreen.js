import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS, getColors } from '../../theme';
import { useThemeStore } from '../../store/themeStore';
import { useOrderStore } from '../../store/orderStore';
import { Card, StatusBadge, FloatingButton, EmptyState } from '../../components/common';
import { SearchBar, FilterChip } from '../../components/forms';

const ORDER_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Production', value: 'in_production' },
    { label: 'Ready', value: 'ready' },
    { label: 'Delivered', value: 'delivered' },
];

const OrderListScreen = ({ navigation }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    const orders = useOrderStore((s) => s.orders);
    const filterStatus = useOrderStore((s) => s.filterStatus);
    const searchQuery = useOrderStore((s) => s.searchQuery);
    const setFilterStatus = useOrderStore((s) => s.setFilterStatus);
    const setSearchQuery = useOrderStore((s) => s.setSearchQuery);
    const getFilteredOrders = useOrderStore((s) => s.getFilteredOrders);

    const filteredOrders = getFilteredOrders();

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return C.error;
            case 'medium': return C.warning;
            case 'low': return C.success;
            default: return C.textMuted;
        }
    };

    const renderOrder = ({ item }) => (
        <Card
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                    <View>
                        <Text style={[styles.orderId, { color: C.textMuted }]}>{item.id}</Text>
                        <Text style={[styles.customerName, { color: C.textPrimary }]}>{item.customerName}</Text>
                    </View>
                </View>
                <StatusBadge status={item.status} size="small" />
            </View>

            <View style={[styles.cardBody, { borderTopColor: C.borderLight }]}>
                <View style={styles.detailRow}>
                    <Ionicons name="shirt-outline" size={14} color={C.textMuted} />
                    <Text style={[styles.detailText, { color: C.textSecondary }]}>{item.designName}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color={C.textMuted} />
                    <Text style={[styles.detailText, { color: C.textSecondary }]}>Due: {item.deliveryDate}</Text>
                </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: C.borderLight }]}>
                <View>
                    <Text style={[styles.amountLabel, { color: C.textMuted }]}>Total</Text>
                    <Text style={[styles.amountValue, { color: C.primary }]}>₹{item.totalAmount.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.balanceWrap}>
                    <Text style={[styles.balanceLabel, { color: C.textMuted }]}>Balance</Text>
                    <Text style={[styles.balanceValue, { color: C.textPrimary }, item.balanceAmount > 0 && { color: C.error }]}>
                        ₹{item.balanceAmount.toLocaleString('en-IN')}
                    </Text>
                </View>
                {item.tailorName && (
                    <View style={[styles.tailorBadge, { backgroundColor: C.primaryMuted }]}>
                        <Ionicons name="person-outline" size={12} color={C.primary} />
                        <Text style={[styles.tailorName, { color: C.primary }]}>{item.tailorName}</Text>
                    </View>
                )}
            </View>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: C.bg }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Orders</Text>
                <Text style={[styles.headerSubtitle, { color: C.textMuted }]}>{orders.length} total orders</Text>
            </View>

            {/* Search */}
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by customer, design, order ID..."
            />

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0, marginBottom: 12 }}
                contentContainerStyle={styles.filtersRow}
            >
                {ORDER_FILTERS.map((f) => (
                    <FilterChip
                        key={f.value}
                        label={f.label}
                        active={filterStatus === f.value}
                        onPress={() => setFilterStatus(f.value)}
                    />
                ))}
            </ScrollView>

            {/* Order List */}
            {filteredOrders.length === 0 ? (
                <EmptyState
                    icon="receipt-outline"
                    title="No orders found"
                    subtitle="Try adjusting your filters or add a new order"
                    actionLabel="Create Order"
                    onAction={() => navigation.navigate('OrderEntry')}
                />
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrder}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                />
            )}

            <FloatingButton
                icon="add"
                onPress={() => navigation.navigate('OrderEntry')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.xxxl + SIZES.lg,
        paddingBottom: SIZES.sm,
    },
    headerTitle: {
        fontSize: SIZES.heading,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    filtersRow: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.sm,
    },
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 100,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityDot: {
        width: 4,
        height: 32,
        borderRadius: 2,
        marginRight: SIZES.md,
    },
    orderId: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.medium,
        letterSpacing: 0.5,
    },
    customerName: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        marginTop: 1,
    },
    cardBody: {
        paddingVertical: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.xs,
    },
    detailText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginLeft: SIZES.sm,
        ...FONTS.regular,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    amountLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    amountValue: {
        fontSize: SIZES.bodyLg,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    balanceWrap: {
        marginLeft: SIZES.xl,
    },
    balanceLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    balanceValue: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    tailorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
        backgroundColor: COLORS.primaryMuted,
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusFull,
    },
    tailorName: {
        fontSize: SIZES.caption,
        color: COLORS.primary,
        ...FONTS.medium,
        marginLeft: 4,
    },
});

export default OrderListScreen;
