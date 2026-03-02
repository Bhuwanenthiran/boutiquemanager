import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useCatalogueStore } from '../../store/catalogueStore';
import { Card, EmptyState, StatusBadge, LoadingOverlay } from '../../components/common';
import { FormButton } from '../../components/forms';
import { formatDate } from '../../services/dateUtils';

const TABS = [
    { key: 'hold', label: 'Hold', icon: 'pause-circle-outline' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
    { key: 'alteration', label: 'Alterations', icon: 'build-outline' },
];

const CatalogueScreen = ({ navigation }) => {
    const activeTab = useCatalogueStore((s) => s.activeTab);
    const setActiveTab = useCatalogueStore((s) => s.setActiveTab);
    const holdOrders = useCatalogueStore((s) => s.holdOrders);
    const cancelledOrders = useCatalogueStore((s) => s.cancelledOrders);
    const alterations = useCatalogueStore((s) => s.alterations);
    const removeHoldOrder = useCatalogueStore((s) => s.removeHoldOrder);
    const restoreHoldOrder = useCatalogueStore((s) => s.restoreHoldOrder);
    const deleteCancelledOrder = useCatalogueStore((s) => s.deleteCancelledOrder);
    const deleteAlteration = useCatalogueStore((s) => s.deleteAlteration);
    const updateAlteration = useCatalogueStore((s) => s.updateAlteration);
    const isLoading = useCatalogueStore((s) => s.isLoading);

    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [modalItem, setModalItem] = useState(null);

    const confirmAction = (action, item) => {
        setModalAction(action);
        setModalItem(item);
        setShowModal(true);
    };

    const executeAction = async () => {
        try {
            if (modalAction === 'restore') {
                await restoreHoldOrder(modalItem.id);
                Alert.alert('Restored', 'Order has been restored successfully');
            } else if (modalAction === 'delete_hold') {
                await removeHoldOrder(modalItem.id);
            } else if (modalAction === 'delete_cancelled') {
                await deleteCancelledOrder(modalItem.id);
            } else if (modalAction === 'delete_alteration') {
                await deleteAlteration(modalItem.id);
            } else if (modalAction === 'complete_alteration') {
                await updateAlteration(modalItem.id, { status: 'completed' });
            }
        } catch (error) {
            // Handled in store
        }
        setShowModal(false);
    };

    const renderHoldItem = ({ item }) => (
        <Card elevated style={styles.catalogueCard}>
            <View style={styles.cardRow}>
                <View style={[styles.cardIconWrap, { backgroundColor: COLORS.warningLight }]}>
                    <Ionicons name="pause-circle-outline" size={22} color={COLORS.warning} />
                </View>
                <View style={{ flex: 1, marginLeft: SIZES.md }}>
                    <Text style={styles.cardTitle}>{item.customerName}</Text>
                    <Text style={styles.cardSubtitle}>{item.designName}</Text>
                    <Text style={styles.cardMeta}>Order: {item.orderId} • {formatDate(item.holdDate)}</Text>
                </View>
            </View>
            <View style={styles.reasonWrap}>
                <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.reasonText}>{item.reason}</Text>
            </View>
            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => confirmAction('restore', item)}
                    disabled={isLoading}
                >
                    <Ionicons name="refresh-outline" size={16} color={COLORS.success} />
                    <Text style={[styles.actionText, { color: COLORS.success }]}>Restore</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => confirmAction('delete_hold', item)}
                    disabled={isLoading}
                >
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                    <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );

    const renderCancelledItem = ({ item }) => (
        <Card elevated style={styles.catalogueCard}>
            <View style={styles.cardRow}>
                <View style={[styles.cardIconWrap, { backgroundColor: COLORS.errorLight }]}>
                    <Ionicons name="close-circle-outline" size={22} color={COLORS.error} />
                </View>
                <View style={{ flex: 1, marginLeft: SIZES.md }}>
                    <Text style={styles.cardTitle}>{item.customerName}</Text>
                    <Text style={styles.cardSubtitle}>{item.designName}</Text>
                    <Text style={styles.cardMeta}>Order: {item.orderId} • {formatDate(item.cancelledDate)}</Text>
                </View>
            </View>
            <View style={styles.reasonWrap}>
                <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.reasonText}>Reason: {item.reason}</Text>
            </View>
            <View style={styles.refundBar}>
                <Text style={styles.refundLabel}>Refund: ₹{item.refundAmount?.toLocaleString('en-IN') || '0'}</Text>
                <View style={[styles.refundBadge, { backgroundColor: item.refunded ? COLORS.successLight : COLORS.warningLight }]}>
                    <Text style={[styles.refundBadgeText, { color: item.refunded ? COLORS.success : COLORS.warning }]}>
                        {item.refunded ? 'Refunded' : 'Pending'}
                    </Text>
                </View>
            </View>
            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => confirmAction('delete_cancelled', item)}
                    disabled={isLoading}
                >
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                    <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );

    const renderAlterationItem = ({ item }) => (
        <Card elevated style={styles.catalogueCard}>
            <View style={styles.cardRow}>
                <View style={[styles.cardIconWrap, { backgroundColor: COLORS.slateLight }]}>
                    <Ionicons name="build-outline" size={22} color={COLORS.slate} />
                </View>
                <View style={{ flex: 1, marginLeft: SIZES.md }}>
                    <Text style={styles.cardTitle}>{item.customerName}</Text>
                    <Text style={styles.cardSubtitle}>{item.item} — {item.type}</Text>
                    <Text style={styles.cardMeta}>{formatDate(item.date)}</Text>
                </View>
                <StatusBadge status={item.status} size="small" />
            </View>
            {item.notes && (
                <View style={styles.reasonWrap}>
                    <Ionicons name="document-text-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.reasonText}>{item.notes}</Text>
                </View>
            )}
            <View style={styles.cardActions}>
                {item.status !== 'completed' && (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => confirmAction('complete_alteration', item)}
                        disabled={isLoading}
                    >
                        <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
                        <Text style={[styles.actionText, { color: COLORS.success }]}>Complete</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => confirmAction('delete_alteration', item)}
                    disabled={isLoading}
                >
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                    <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );

    const getCurrentData = () => {
        switch (activeTab) {
            case 'hold': return { data: holdOrders, renderItem: renderHoldItem, emptyIcon: 'pause-outline', emptyTitle: 'No hold orders' };
            case 'cancelled': return { data: cancelledOrders, renderItem: renderCancelledItem, emptyIcon: 'close-outline', emptyTitle: 'No cancelled orders' };
            case 'alteration': return { data: alterations, renderItem: renderAlterationItem, emptyIcon: 'build-outline', emptyTitle: 'No alterations' };
            default: return { data: [], renderItem: () => null, emptyIcon: 'ellipse', emptyTitle: 'No data' };
        }
    };

    const { data, renderItem, emptyIcon, emptyTitle } = getCurrentData();

    return (
        <View style={styles.container}>
            <LoadingOverlay visible={isLoading} message="Processing..." />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Catalogue</Text>
                <Text style={styles.headerSubtitle}>Hold, cancelled & alteration records</Text>
            </View>

            {/* Segmented Control */}
            <View style={styles.segmentedControl}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.segment, activeTab === tab.key && styles.segmentActive]}
                        onPress={() => setActiveTab(tab.key)}
                        disabled={isLoading}
                    >
                        <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? COLORS.primary : COLORS.textMuted} />
                        <Text style={[styles.segmentText, activeTab === tab.key && styles.segmentTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {data.length === 0 ? (
                <EmptyState icon={emptyIcon} title={emptyTitle} subtitle="Records will appear here when added" />
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Confirmation Modal */}
            <Modal visible={showModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconWrap}>
                            <Ionicons
                                name={modalAction?.includes('delete') ? 'trash-outline' : modalAction === 'restore' ? 'refresh-outline' : 'checkmark-circle-outline'}
                                size={32}
                                color={modalAction?.includes('delete') ? COLORS.error : COLORS.success}
                            />
                        </View>
                        <Text style={styles.modalTitle}>
                            {modalAction?.includes('delete') ? 'Delete Record?' : modalAction === 'restore' ? 'Restore Order?' : 'Mark Complete?'}
                        </Text>
                        <Text style={styles.modalDesc}>
                            {modalAction?.includes('delete') ? 'This action cannot be undone.' : 'Are you sure you want to proceed?'}
                        </Text>
                        <View style={styles.modalActions}>
                            <FormButton
                                title="Cancel"
                                variant="outline"
                                onPress={() => setShowModal(false)}
                                size="small"
                                disabled={isLoading}
                            />
                            <View style={{ width: SIZES.sm }} />
                            <FormButton
                                title={modalAction?.includes('delete') ? 'Delete' : 'Confirm'}
                                onPress={executeAction}
                                size="small"
                                loading={isLoading}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
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
    segmentedControl: {
        flexDirection: 'row',
        marginHorizontal: SIZES.lg,
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.xs,
        marginBottom: SIZES.md,
    },
    segment: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.sm + 2,
        borderRadius: SIZES.radiusSm,
    },
    segmentActive: {
        backgroundColor: COLORS.bgCard,
        ...SHADOWS.small,
    },
    segmentText: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.medium,
        marginLeft: 4,
    },
    segmentTextActive: {
        color: COLORS.primary,
        ...FONTS.semiBold,
    },
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 100,
    },
    catalogueCard: {
        marginBottom: SIZES.md,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIconWrap: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    cardSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        marginTop: 1,
    },
    cardMeta: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    reasonWrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusSm,
        padding: SIZES.md,
        marginTop: SIZES.md,
    },
    reasonText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        marginLeft: 6,
        flex: 1,
        lineHeight: 18,
    },
    refundBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SIZES.md,
        paddingTop: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    refundLabel: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.medium,
    },
    refundBadge: {
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusFull,
    },
    refundBadgeText: {
        fontSize: SIZES.caption,
        ...FONTS.semiBold,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: SIZES.md,
        paddingTop: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        marginLeft: SIZES.sm,
        borderRadius: SIZES.radiusFull,
        backgroundColor: COLORS.bgElevated,
    },
    actionText: {
        fontSize: SIZES.small,
        ...FONTS.medium,
        marginLeft: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: COLORS.bgOverlay,
        justifyContent: 'center',
        paddingHorizontal: SIZES.xxl,
    },
    modalContent: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusXl,
        padding: SIZES.xl,
        alignItems: 'center',
    },
    modalIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.bgElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    modalTitle: {
        fontSize: SIZES.subtitle,
        color: COLORS.textPrimary,
        ...FONTS.bold,
    },
    modalDesc: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: SIZES.sm,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: SIZES.xl,
    },
});

export default CatalogueScreen;
