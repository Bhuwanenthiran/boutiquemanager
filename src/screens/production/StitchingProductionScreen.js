import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useProductionStore } from '../../store/productionStore';
import { StatusBadge, Card, SectionHeader, EmptyState, LoadingOverlay, ErrorCard, ErrorOverlay, ScreenWrapper } from '../../components/common';
import { SearchBar, FilterChip } from '../../components/forms';

const OrderCard = React.memo(({ item, isLoading, cycleStatus }) => {
    const isReady = item.status === 'Ready';

    const getStageIcon = (stage) => {
        switch (stage) {
            case 'marking': return 'pencil-outline';
            case 'cutting': return 'cut-outline';
            case 'stitching': return 'construct-outline';
            case 'pending': return 'time-outline';
            default: return 'ellipse-outline';
        }
    };

    const getStageColor = (stage) => {
        switch (stage) {
            case 'marking': return COLORS.slate;
            case 'cutting': return COLORS.warning;
            case 'stitching': return COLORS.primary;
            default: return COLORS.textMuted;
        }
    };

    const statusActions = ['Pending', 'Marking', 'Cutting', 'In Production', 'Ready'];
    const stageColor = getStageColor(item.productionStage);

    return (
        <Card elevated style={styles.taskCard}>
            {/* Card Header */}
            <View style={styles.taskHeader}>
                <View style={styles.taskHeaderLeft}>
                    <View style={[styles.stageIcon, { backgroundColor: stageColor + '18' }]}>
                        <Ionicons name={getStageIcon(item.productionStage)} size={18} color={stageColor} />
                    </View>
                    <View>
                        <Text style={styles.taskId}>{item.id}</Text>
                        <Text style={styles.taskCustomer}>{item.customerName}</Text>
                    </View>
                </View>
                <StatusBadge status={item.status} size="small" />
            </View>

            {/* Design Info */}
            <View style={styles.taskInfo}>
                <View style={styles.taskInfoItem}>
                    <Ionicons name="shirt-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.taskInfoText}>{item.designName}</Text>
                </View>
                <View style={styles.taskInfoItem}>
                    <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.taskInfoText}>{item.tailorName || 'Unassigned'}</Text>
                </View>
            </View>

            {/* Production Stages Mini */}
            <View style={styles.stagesRow}>
                {['Marking', 'Cutting', 'Stitching'].map((stage, idx) => {
                    const stageKey = stage.toLowerCase();
                    const isActive = item.productionStage === stageKey ||
                        (item.productionStage === 'in_production' && stageKey === 'stitching');
                    const isDone = statusActions.indexOf(item.status) > statusActions.indexOf(stage === 'Stitching' ? 'In Production' : stage);
                    return (
                        <View key={stage} style={styles.miniStage}>
                            <View style={[
                                styles.miniStageDot,
                                isDone && { backgroundColor: COLORS.success },
                                isActive && { backgroundColor: COLORS.primary },
                            ]} />
                            <Text style={[
                                styles.miniStageLabel,
                                isActive && { color: COLORS.primary, ...FONTS.semiBold },
                                isDone && { color: COLORS.success },
                            ]}>{stage}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Actions */}
            <View style={styles.taskActions}>
                {/* Info Display (Simplified) */}
                <View style={styles.taskFooterLeft}>
                    <Ionicons 
                        name={isReady ? "checkmark-done-circle" : "time-outline"} 
                        size={16} 
                        color={isReady ? COLORS.success : COLORS.textMuted} 
                    />
                    <Text style={[styles.taskFooterText, isReady && { color: COLORS.success }]}>
                        {isReady ? 'Finished' : 'In Progress'}
                    </Text>
                </View>

                {/* Status Cycle / Finish Button */}
                {!isReady && (
                    <TouchableOpacity
                        style={styles.statusCycleBtn}
                        onPress={() => cycleStatus(item.id, item.status)}
                        disabled={isLoading}
                    >
                        <Ionicons name="arrow-forward-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.statusCycleText}>
                            {item.status === 'In Production' ? 'Finish & Mark Ready' : 'Next Stage'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </Card>
    );
});

const StitchingProductionScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const productionOrders = useProductionStore((s) => s.productionOrders);
    const tailors = useProductionStore((s) => s.tailors);
    const filterTailor = useProductionStore((s) => s.filterTailor);
    const setFilterTailor = useProductionStore((s) => s.setFilterTailor);
    const updateProductionStatus = useProductionStore((s) => s.updateProductionStatus);
    const getFilteredProduction = useProductionStore((s) => s.getFilteredProduction);
    const isLoading = useProductionStore((s) => s.isLoading);
    const error = useProductionStore((s) => s.error);
    const clearError = useProductionStore((s) => s.clearError);
    const init = useProductionStore((s) => s.init);

    const filteredOrders = getFilteredProduction();

    const onRefresh = async () => {
        await init();
    };

    const cycleStatus = async (orderId, currentStatus) => {
        const statusActions = ['Pending', 'Marking', 'Cutting', 'In Production', 'Ready'];
        const idx = statusActions.indexOf(currentStatus);
        
        // If already at the end or not found, do nothing
        if (idx === -1 || idx === statusActions.length - 1) return;

        const nextStatus = statusActions[idx + 1];
        const nextStage = nextStatus.toLowerCase().replace(/\s/g, '_');

        try {
            await updateProductionStatus(orderId, 'status', nextStatus);
            await updateProductionStatus(orderId, 'productionStage', nextStage);
        } catch (error) {
            // Error overlay handled by store state
        }
    };

    const renderOrderCard = ({ item }) => (
        <OrderCard
            item={item}
            cycleStatus={cycleStatus}
            isLoading={isLoading}
        />
    );

    return (
        <ScreenWrapper useSafeTop>
            <LoadingOverlay visible={isLoading && productionOrders.length > 0 && !error} message="Updating status..." />
            <ErrorOverlay
                visible={!!error && productionOrders.length > 0}
                error={error}
                onRetry={onRefresh}
                onClose={clearError}
            />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Production</Text>
                <Text style={styles.headerSubtitle}>{productionOrders.length} active orders</Text>
            </View>

            {/* Tailor Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0, marginBottom: 12 }}
                contentContainerStyle={styles.filtersRow}
                keyboardShouldPersistTaps="handled"
            >
                <FilterChip
                    label="All Tailors"
                    active={filterTailor === 'all'}
                    onPress={() => setFilterTailor('all')}
                    disabled={isLoading}
                />
                {tailors.map(t => (
                    <FilterChip
                        key={t.id}
                        label={t.name}
                        active={filterTailor === t.id}
                        onPress={() => setFilterTailor(t.id)}
                        disabled={isLoading}
                    />
                ))}
            </ScrollView>

            {isLoading && productionOrders.length === 0 ? (
                <View style={{ flex: 1, padding: SIZES.lg }}>
                    <Text style={{ color: COLORS.textMuted, textAlign: 'center' }}>Loading production...</Text>
                </View>
            ) : error && productionOrders.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ErrorCard
                        title="Failed to load Production"
                        message={error}
                        onRetry={onRefresh}
                    />
                </View>
            ) : filteredOrders.length === 0 ? (
                <EmptyState
                    icon="construct-outline"
                    title="No production orders"
                    subtitle="Orders in production will appear here"
                />
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    refreshing={isLoading}
                    onRefresh={onRefresh}
                    initialNumToRender={5}
                    windowSize={5}
                    maxToRenderPerBatch={5}
                    removeClippedSubviews={Platform.OS === 'android'}
                />
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
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
        paddingBottom: 20,
    },
    taskCard: {
        marginBottom: SIZES.md,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    taskHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stageIcon: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.md,
    },
    taskId: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.medium,
        letterSpacing: 0.5,
    },
    taskCustomer: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    taskInfo: {
        flexDirection: 'row',
        marginBottom: SIZES.md,
    },
    taskInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SIZES.lg,
    },
    taskInfoText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginLeft: 5,
        ...FONTS.regular,
    },
    stagesRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusMd,
        paddingVertical: SIZES.md,
        marginBottom: SIZES.md,
    },
    miniStage: {
        alignItems: 'center',
    },
    miniStageDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.border,
        marginBottom: 4,
    },
    miniStageLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    taskActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    taskFooterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taskFooterText: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.medium,
        marginLeft: 6,
    },
    statusCycleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryMuted,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusFull,
    },
    statusCycleText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        ...FONTS.medium,
        marginLeft: 4,
    },
});

export default StitchingProductionScreen;
