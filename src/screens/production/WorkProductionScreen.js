import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useProductionStore } from '../../store/productionStore';
import { Card, LoadingOverlay, ErrorOverlay, EmptyState, ScreenWrapper } from '../../components/common';
import { FormInput, FormButton } from '../../components/forms';

const STAGES = [
    { key: 'production1', label: 'Production 1', subtitle: 'Base Stitching', icon: 'construct-outline', color: COLORS.slate },
    { key: 'production2', label: 'Production 2', subtitle: 'Aari / Embroidery', icon: 'flower-outline', color: COLORS.accent },
    { key: 'production3', label: 'Production 3', subtitle: 'Add-ons & Detailing', icon: 'sparkles-outline', color: COLORS.primary },
];

const WorkProductionScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const productionOrders = useProductionStore((s) => s.productionOrders);
    const productionStages = useProductionStore((s) => s.productionStages);
    const updateStage = useProductionStore((s) => s.updateStage);
    const startStage = useProductionStore((s) => s.startStage);
    const completeStage = useProductionStore((s) => s.completeStage);
    const updateProductionStatus = useProductionStore((s) => s.updateProductionStatus);
    const isLoading = useProductionStore((s) => s.isLoading);
    const error = useProductionStore((s) => s.error);
    const clearError = useProductionStore((s) => s.clearError);
    const [selectedOrder, setSelectedOrder] = useState(productionOrders[0]?.id || null);
    const [expandedStage, setExpandedStage] = useState(null);

    const currentStages = productionStages[selectedOrder] || {};

    const getStageData = (key) => currentStages[key] || { status: 'pending', notes: '' };

    const handleStageAction = async (stageKey, action) => {
        try {
            if (action === 'start') {
                await startStage(selectedOrder, stageKey);
            } else if (action === 'complete') {
                await completeStage(selectedOrder, stageKey);
            }
        } catch (error) {
            // Handled in store
        }
    };

    const handleNotesUpdate = async (stageKey, notes) => {
        try {
            await updateStage(selectedOrder, stageKey, { notes });
        } catch (error) {
            // Handled in store
        }
    };

    const handleFinishProduction = async () => {
        try {
            await updateProductionStatus(selectedOrder, 'status', 'Ready');
            await updateProductionStatus(selectedOrder, 'productionStage', 'ready');
            Alert.alert('Success', 'Production finished and marked as Ready.');
        } catch (error) {
            // Handled in store
        }
    };

    const getCompletionPercent = () => {
        let completed = 0;
        STAGES.forEach(s => {
            if (getStageData(s.key).status === 'completed') completed++;
        });
        return Math.round((completed / STAGES.length) * 100);
    };

    const isAllCompleted = STAGES.every(s => getStageData(s.key).status === 'completed');
    const isReady = productionOrders.find(o => o.id === selectedOrder)?.status === 'Ready';

    return (
        <ScreenWrapper useSafeTop>
            <LoadingOverlay visible={isLoading && !error} message="Processing..." />
            <ErrorOverlay
                visible={!!error}
                error={error}
                onRetry={() => { }}
                onClose={clearError}
            />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={isLoading}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Work Production</Text>
                <View style={{ width: 40 }} />
            </View>

            {productionOrders.length === 0 ? (
                <EmptyState
                    icon="construct-outline"
                    title="No orders in production"
                    subtitle="Orders will appear here once they move to production stages"
                />
            ) : (
                <>
                    {/* Order Selector */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.orderTabs}
                        keyboardShouldPersistTaps="handled"
                    >
                        {productionOrders.map(order => (
                            <TouchableOpacity
                                key={order.id}
                                style={[styles.orderTab, selectedOrder === order.id && styles.orderTabActive]}
                                onPress={() => setSelectedOrder(order.id)}
                                disabled={isLoading}
                            >
                                <Text style={[styles.orderTabId, selectedOrder === order.id && styles.orderTabIdActive]}>{order.id}</Text>
                                <Text style={[styles.orderTabName, selectedOrder === order.id && styles.orderTabNameActive]} numberOfLines={1}>
                                    {order.customerName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Overall Progress */}
                    <View style={styles.overallProgress}>
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressTitle}>Overall Progress</Text>
                            <Text style={styles.progressPercent}>{getCompletionPercent()}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${getCompletionPercent()}%` }]} />
                        </View>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[styles.stagesContent, { paddingBottom: insets.bottom + 100 }]}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Stepper */}
                        {STAGES.map((stage, idx) => {
                            const data = getStageData(stage.key);
                            const isExpanded = expandedStage === stage.key;
                            const isCompleted = data.status === 'completed';
                            const isInProgress = data.status === 'in_progress';

                            return (
                                <View key={stage.key}>
                                    {/* Connector Line */}
                                    {idx > 0 && (
                                        <View style={styles.connectorWrap}>
                                            <View style={[
                                                styles.connectorLine,
                                                getStageData(STAGES[idx - 1].key).status === 'completed' && styles.connectorCompleted,
                                            ]} />
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setExpandedStage(isExpanded ? null : stage.key)}
                                        disabled={isLoading}
                                    >
                                        <Card elevated style={[
                                            styles.stageCard,
                                            isCompleted && styles.stageCardCompleted,
                                            isInProgress && styles.stageCardActive,
                                        ]}>
                                            <View style={styles.stageHeader}>
                                                <View style={[styles.stageIconWrap, { backgroundColor: stage.color + '18' }]}>
                                                    {isCompleted ? (
                                                        <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                                                    ) : (
                                                        <Ionicons name={stage.icon} size={22} color={stage.color} />
                                                    )}
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.stageLabel}>{stage.label}</Text>
                                                    <Text style={styles.stageSubtitle}>{stage.subtitle}</Text>
                                                </View>
                                                <View style={styles.stageStatusWrap}>
                                                    {isCompleted && (
                                                        <View style={[styles.statusPill, { backgroundColor: COLORS.successLight }]}>
                                                            <Text style={[styles.statusPillText, { color: COLORS.success }]}>Done</Text>
                                                        </View>
                                                    )}
                                                    {isInProgress && (
                                                        <View style={[styles.statusPill, { backgroundColor: COLORS.warningLight }]}>
                                                            <Text style={[styles.statusPillText, { color: COLORS.warning }]}>Active</Text>
                                                        </View>
                                                    )}
                                                    {!isCompleted && !isInProgress && (
                                                        <View style={[styles.statusPill, { backgroundColor: COLORS.borderLight }]}>
                                                            <Text style={[styles.statusPillText, { color: COLORS.textMuted }]}>Pending</Text>
                                                        </View>
                                                    )}
                                                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
                                                </View>
                                            </View>

                                            {/* Expanded Content */}
                                            {isExpanded && (
                                                <View style={styles.stageExpanded}>
                                                    {/* Notes */}
                                                    <FormInput
                                                        label="Notes"
                                                        value={data.notes}
                                                        onChangeText={(v) => handleNotesUpdate(stage.key, v)}
                                                        placeholder="Add production notes..."
                                                        multiline
                                                        icon="document-text-outline"
                                                        editable={!isLoading}
                                                    />

                                                    {/* Image Upload Placeholder */}
                                                    <TouchableOpacity style={styles.uploadArea} disabled={isLoading}>
                                                        <Ionicons name="camera-outline" size={24} color={COLORS.textMuted} />
                                                        <Text style={styles.uploadText}>Upload Work Progress</Text>
                                                        <Text style={styles.uploadHint}>Tap to add photos</Text>
                                                    </TouchableOpacity>

                                                    {/* Action Buttons */}
                                                    <View style={styles.stageActions}>
                                                        {!isCompleted && !isInProgress && (
                                                            <FormButton
                                                                title="Start Stage"
                                                                icon="play-outline"
                                                                onPress={() => handleStageAction(stage.key, 'start')}
                                                                loading={isLoading}
                                                            />
                                                        )}
                                                        {isInProgress && (
                                                            <FormButton
                                                                title="Complete Stage"
                                                                icon="checkmark-outline"
                                                                onPress={() => handleStageAction(stage.key, 'complete')}
                                                                loading={isLoading}
                                                            />
                                                        )}
                                                    </View>
                                                </View>
                                            )}
                                        </Card>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}

                        {/* Finish Production Button */}
                        {isAllCompleted && !isReady && (
                            <View style={styles.finishSection}>
                                <FormButton
                                    title="Finish & Mark Ready"
                                    icon="checkmark-done-circle-outline"
                                    onPress={handleFinishProduction}
                                    loading={isLoading}
                                    style={styles.finishBtn}
                                />
                            </View>
                        )}
                        {isReady && (
                            <View style={styles.readyBadge}>
                                <Ionicons name="checkmark-done-circle" size={24} color={COLORS.success} />
                                <Text style={styles.readyText}>Production Completed</Text>
                            </View>
                        )}
                    </ScrollView>
                </>
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.sm,
        paddingBottom: SIZES.md,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    headerTitle: {
        fontSize: SIZES.subtitle,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    orderTabs: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.md,
    },
    orderTab: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        marginRight: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        minWidth: 90,
    },
    orderTabActive: {
        backgroundColor: COLORS.primaryMuted,
        borderColor: COLORS.primary,
    },
    orderTabId: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.medium,
    },
    orderTabIdActive: {
        color: COLORS.primary,
    },
    orderTabName: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        marginTop: 2,
    },
    orderTabNameActive: {
        color: COLORS.primary,
        ...FONTS.medium,
    },
    overallProgress: {
        marginHorizontal: SIZES.lg,
        marginBottom: SIZES.md,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.sm,
    },
    progressTitle: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.medium,
    },
    progressPercent: {
        fontSize: SIZES.body,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    progressBar: {
        height: 6,
        backgroundColor: COLORS.borderLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: 6,
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    stagesContent: {
        paddingHorizontal: SIZES.lg,
    },
    connectorWrap: {
        alignItems: 'center',
        height: 24,
    },
    connectorLine: {
        width: 2,
        flex: 1,
        backgroundColor: COLORS.border,
    },
    connectorCompleted: {
        backgroundColor: COLORS.success,
    },
    stageCard: {
        borderLeftWidth: 3,
        borderLeftColor: COLORS.border,
    },
    stageCardCompleted: {
        borderLeftColor: COLORS.success,
    },
    stageCardActive: {
        borderLeftColor: COLORS.primary,
    },
    stageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stageIconWrap: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.md,
    },
    stageLabel: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    stageSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 1,
    },
    stageStatusWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusPill: {
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusFull,
    },
    statusPillText: {
        fontSize: SIZES.caption,
        ...FONTS.semiBold,
    },
    stageExpanded: {
        marginTop: SIZES.md,
        paddingTop: SIZES.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    uploadArea: {
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: SIZES.radiusMd,
        padding: SIZES.lg,
        alignItems: 'center',
        marginVertical: SIZES.md,
        backgroundColor: COLORS.bgElevated,
    },
    uploadText: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.medium,
        marginTop: SIZES.sm,
    },
    uploadHint: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    stageActions: {
        marginTop: SIZES.sm,
    },
    finishSection: {
        marginTop: SIZES.lg,
        paddingBottom: SIZES.lg,
    },
    finishBtn: {
        backgroundColor: COLORS.success,
    },
    readyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SIZES.lg,
        padding: SIZES.md,
        backgroundColor: COLORS.successLight,
        borderRadius: SIZES.radiusMd,
    },
    readyText: {
        fontSize: SIZES.body,
        color: COLORS.success,
        ...FONTS.semiBold,
        marginLeft: 8,
    },
});

export default WorkProductionScreen;
