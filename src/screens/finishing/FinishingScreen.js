import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useFinishingStore } from '../../store/finishingStore';
import { useOrderStore } from '../../store/orderStore';
import { Card } from '../../components/common';
import { FormButton, FormInput } from '../../components/forms';

const CHECKLIST_ITEMS = [
    { key: 'checking', label: 'Quality Checking', icon: 'search-outline', description: 'Inspect stitching quality & measurements' },
    { key: 'ironing', label: 'Ironing & Pressing', icon: 'flame-outline', description: 'Press and iron the garment' },
    { key: 'threadCutting', label: 'Thread Cutting', icon: 'cut-outline', description: 'Clean loose threads & finishing' },
    { key: 'qualityApproval', label: 'Quality Approval', icon: 'shield-checkmark-outline', description: 'Final quality check & approval' },
];

const FinishingScreen = ({ navigation }) => {
    const orders = useOrderStore((s) => s.orders);
    const finishingRecords = useFinishingStore((s) => s.finishingRecords);
    const getFinishing = useFinishingStore((s) => s.getFinishing);
    const toggleChecklist = useFinishingStore((s) => s.toggleChecklist);
    const markAsReady = useFinishingStore((s) => s.markAsReady);
    const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);

    const [selectedOrder, setSelectedOrder] = useState(orders[0]?.id || null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approverName, setApproverName] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    const finishing = getFinishing(selectedOrder);
    const allChecked = finishing.checking && finishing.ironing && finishing.threadCutting && finishing.qualityApproval;

    const handleToggle = (key) => {
        toggleChecklist(selectedOrder, key);
    };

    const handleMarkReady = () => {
        if (!approverName.trim()) {
            Alert.alert('Required', 'Please enter approver name');
            return;
        }
        markAsReady(selectedOrder, approverName);
        updateOrderStatus(selectedOrder, 'Ready');
        setShowApprovalModal(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        Alert.alert('✨ Order Ready!', 'This order has been marked as ready for delivery.');
    };

    const completedCount = CHECKLIST_ITEMS.filter(i => finishing[i.key]).length;
    const progressPercent = (completedCount / CHECKLIST_ITEMS.length) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Finishing</Text>
                <Text style={styles.headerSubtitle}>Quality check & prepare for delivery</Text>
            </View>

            {/* Order Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orderTabs}>
                {orders.map(order => (
                    <TouchableOpacity
                        key={order.id}
                        style={[styles.orderTab, selectedOrder === order.id && styles.orderTabActive]}
                        onPress={() => setSelectedOrder(order.id)}
                    >
                        <Text style={[styles.orderTabId, selectedOrder === order.id && styles.orderTabIdActive]}>{order.id}</Text>
                        <Text style={[styles.orderTabName, selectedOrder === order.id && styles.orderTabNameActive]} numberOfLines={1}>
                            {order.customerName}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Progress Circle */}
                <View style={styles.progressSection}>
                    <View style={styles.progressCircle}>
                        <Text style={styles.progressNumber}>{completedCount}/{CHECKLIST_ITEMS.length}</Text>
                        <Text style={styles.progressLabel}>Completed</Text>
                    </View>
                    <View style={styles.progressBarWrap}>
                        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                    </View>
                </View>

                {/* Checklist */}
                {CHECKLIST_ITEMS.map((item, idx) => (
                    <TouchableOpacity
                        key={item.key}
                        activeOpacity={0.7}
                        onPress={() => handleToggle(item.key)}
                    >
                        <Card style={[styles.checkItem, finishing[item.key] && styles.checkItemDone]}>
                            <View style={styles.checkRow}>
                                <TouchableOpacity
                                    style={[styles.checkbox, finishing[item.key] && styles.checkboxChecked]}
                                    onPress={() => handleToggle(item.key)}
                                >
                                    {finishing[item.key] && <Ionicons name="checkmark" size={16} color={COLORS.textOnPrimary} />}
                                </TouchableOpacity>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.checkLabel, finishing[item.key] && styles.checkLabelDone]}>{item.label}</Text>
                                    <Text style={styles.checkDesc}>{item.description}</Text>
                                </View>
                                <View style={[styles.checkIcon, { backgroundColor: finishing[item.key] ? COLORS.successLight : COLORS.bgElevated }]}>
                                    <Ionicons name={item.icon} size={18} color={finishing[item.key] ? COLORS.success : COLORS.textMuted} />
                                </View>
                            </View>
                        </Card>
                    </TouchableOpacity>
                ))}

                {/* Approval Info */}
                {finishing.isReady && (
                    <Card style={styles.approvalCard}>
                        <Ionicons name="ribbon-outline" size={24} color={COLORS.success} />
                        <View style={{ marginLeft: SIZES.md, flex: 1 }}>
                            <Text style={styles.approvalTitle}>Approved & Ready</Text>
                            <Text style={styles.approvalMeta}>By {finishing.approvedBy} on {finishing.approvedAt}</Text>
                        </View>
                    </Card>
                )}

                {/* Mark as Ready Button */}
                {!finishing.isReady && (
                    <View style={styles.readyBtnWrap}>
                        <FormButton
                            title="✨ Mark as Ready"
                            icon="checkmark-done-outline"
                            onPress={() => {
                                if (!allChecked) {
                                    Alert.alert('Incomplete', 'Please complete all checklist items first');
                                    return;
                                }
                                setShowApprovalModal(true);
                            }}
                            disabled={!allChecked}
                        />
                    </View>
                )}

                {/* Confetti Animation Placeholder */}
                {showConfetti && (
                    <View style={styles.confettiOverlay}>
                        <Text style={styles.confettiEmoji}>🎉</Text>
                        <Text style={styles.confettiText}>Order is Ready!</Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Approval Modal */}
            <Modal visible={showApprovalModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.primary} />
                            <Text style={styles.modalTitle}>Approve & Mark Ready</Text>
                            <Text style={styles.modalSubtitle}>This will mark the order as ready for delivery</Text>
                        </View>

                        <FormInput
                            label="Approved By"
                            value={approverName}
                            onChangeText={setApproverName}
                            placeholder="Enter your name"
                            icon="person-outline"
                            required
                        />

                        {/* Signature Area */}
                        <View style={styles.signatureArea}>
                            <Ionicons name="finger-print-outline" size={28} color={COLORS.textMuted} />
                            <Text style={styles.signatureText}>Digital Signature</Text>
                            <Text style={styles.signatureHint}>Tap to sign (simulated)</Text>
                        </View>

                        <View style={styles.modalActions}>
                            <FormButton
                                title="Cancel"
                                variant="outline"
                                onPress={() => setShowApprovalModal(false)}
                                size="medium"
                            />
                            <View style={{ width: SIZES.sm }} />
                            <FormButton
                                title="Approve"
                                icon="checkmark-circle-outline"
                                onPress={handleMarkReady}
                                size="medium"
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
    orderTabIdActive: { color: COLORS.primary },
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
    scrollContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.xxxl,
    },
    progressSection: {
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    progressCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    progressNumber: {
        fontSize: SIZES.title,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    progressLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    progressBarWrap: {
        width: '100%',
        height: 6,
        backgroundColor: COLORS.borderLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 6,
        backgroundColor: COLORS.success,
        borderRadius: 3,
    },
    checkItem: {
        marginBottom: SIZES.sm,
    },
    checkItemDone: {
        borderColor: COLORS.success + '40',
        backgroundColor: COLORS.successLight + '40',
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginRight: SIZES.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    checkLabel: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.medium,
    },
    checkLabelDone: {
        color: COLORS.success,
        textDecorationLine: 'line-through',
    },
    checkDesc: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    checkIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    approvalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.successLight,
        borderColor: COLORS.success + '30',
        marginTop: SIZES.md,
    },
    approvalTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.success,
        ...FONTS.semiBold,
    },
    approvalMeta: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        marginTop: 2,
    },
    readyBtnWrap: {
        marginTop: SIZES.xl,
    },
    confettiOverlay: {
        alignItems: 'center',
        marginTop: SIZES.lg,
    },
    confettiEmoji: {
        fontSize: 48,
    },
    confettiText: {
        fontSize: SIZES.subtitle,
        color: COLORS.success,
        ...FONTS.bold,
        marginTop: SIZES.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: COLORS.bgOverlay,
        justifyContent: 'center',
        paddingHorizontal: SIZES.xl,
    },
    modalContent: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusXl,
        padding: SIZES.xl,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: SIZES.xl,
    },
    modalTitle: {
        fontSize: SIZES.subtitle,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        marginTop: SIZES.md,
    },
    modalSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 4,
        textAlign: 'center',
    },
    signatureArea: {
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: SIZES.radiusMd,
        padding: SIZES.xl,
        alignItems: 'center',
        marginVertical: SIZES.md,
        backgroundColor: COLORS.bgElevated,
    },
    signatureText: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.medium,
        marginTop: SIZES.sm,
    },
    signatureHint: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: SIZES.md,
    },
});

export default FinishingScreen;
