import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useOrderStore } from '../../store/orderStore';
import { FormInput, FormSelect, FormButton } from '../../components/forms';
import { Card } from '../../components/common';

const STEPS = ['Customer', 'Design', 'Measurements', 'Payment & Delivery'];

const OrderEntryScreen = ({ navigation }) => {
    const [step, setStep] = useState(0);
    const customers = useOrderStore((s) => s.customers);
    const designs = useOrderStore((s) => s.designs);
    const tailors = useOrderStore((s) => s.tailors);
    const measurementFields = useOrderStore((s) => s.measurementFields);
    const addOrder = useOrderStore((s) => s.addOrder);
    const saveDraft = useOrderStore((s) => s.saveDraft);
    const draftOrder = useOrderStore((s) => s.draftOrder);

    const [form, setForm] = useState(draftOrder || {
        customerId: '',
        customerName: '',
        phone: '',
        designId: '',
        designName: '',
        category: '',
        measurements: {},
        deliveryDate: '',
        totalAmount: '',
        advanceAmount: '',
        notes: '',
        tailorId: '',
        tailorName: '',
        priority: 'medium',
    });

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleCustomerSelect = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            updateForm('customerId', customerId);
            updateForm('customerName', customer.name);
            updateForm('phone', customer.phone);
        }
    };

    const handleDesignSelect = (designId) => {
        const design = designs.find(d => d.id === designId);
        if (design) {
            updateForm('designId', designId);
            updateForm('designName', design.name);
            updateForm('category', design.category);
            // Reset measurements when design changes
            const fields = measurementFields[design.category] || measurementFields.Default;
            const emptyMeasurements = {};
            fields.forEach(f => { emptyMeasurements[f] = ''; });
            updateForm('measurements', emptyMeasurements);
        }
    };

    const handleTailorSelect = (tailorId) => {
        const tailor = tailors.find(t => t.id === tailorId);
        if (tailor) {
            updateForm('tailorId', tailorId);
            updateForm('tailorName', tailor.name);
        }
    };

    const handleMeasurementChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            measurements: { ...prev.measurements, [field]: value },
        }));
    };

    const canProceed = () => {
        switch (step) {
            case 0: return form.customerName.length > 0;
            case 1: return form.designId.length > 0;
            case 2: return true;
            case 3: return form.totalAmount.length > 0 && form.deliveryDate.length > 0;
            default: return false;
        }
    };

    const handleSubmit = () => {
        const totalAmt = parseFloat(form.totalAmount) || 0;
        const advanceAmt = parseFloat(form.advanceAmount) || 0;
        const order = {
            ...form,
            totalAmount: totalAmt,
            advanceAmount: advanceAmt,
            balanceAmount: totalAmt - advanceAmt,
            status: 'Pending',
            productionStage: 'pending',
        };
        addOrder(order);
        Alert.alert('Success', 'Order created successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() },
        ]);
    };

    const handleSaveDraft = () => {
        saveDraft(form);
        Alert.alert('Saved', 'Draft saved successfully!');
    };

    const getMeasurementFieldList = () => {
        if (form.category && measurementFields[form.category]) {
            return measurementFields[form.category];
        }
        return measurementFields.Default;
    };

    const renderStepContent = () => {
        switch (step) {
            case 0: // Customer
                return (
                    <View>
                        <Text style={styles.stepDescription}>Select an existing customer or enter new details</Text>
                        <FormSelect
                            label="Existing Customer"
                            value={form.customerId}
                            options={customers.map(c => ({ label: c.name, value: c.id }))}
                            onSelect={handleCustomerSelect}
                            icon="person-outline"
                        />
                        <View style={styles.dividerWrap}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or enter manually</Text>
                            <View style={styles.dividerLine} />
                        </View>
                        <FormInput
                            label="Customer Name"
                            value={form.customerName}
                            onChangeText={(v) => updateForm('customerName', v)}
                            placeholder="Enter customer name"
                            icon="person-outline"
                            required
                        />
                        <FormInput
                            label="Phone Number"
                            value={form.phone}
                            onChangeText={(v) => updateForm('phone', v)}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                            icon="call-outline"
                        />
                    </View>
                );

            case 1: // Design
                return (
                    <View>
                        <Text style={styles.stepDescription}>Choose a design template for this order</Text>
                        <FormSelect
                            label="Design"
                            value={form.designId}
                            options={designs.map(d => ({ label: `${d.name} (${d.category})`, value: d.id }))}
                            onSelect={handleDesignSelect}
                            icon="color-palette-outline"
                            required
                        />

                        {/* Design Preview Cards */}
                        <Text style={styles.galleryLabel}>Design Gallery</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
                            {designs.map((design) => (
                                <TouchableOpacity
                                    key={design.id}
                                    style={[styles.designCard, form.designId === design.id && styles.designCardSelected]}
                                    onPress={() => handleDesignSelect(design.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.designImagePlaceholder, form.designId === design.id && { backgroundColor: COLORS.primarySoft }]}>
                                        <Ionicons
                                            name="shirt-outline"
                                            size={28}
                                            color={form.designId === design.id ? COLORS.primary : COLORS.textMuted}
                                        />
                                    </View>
                                    <Text style={[styles.designName, form.designId === design.id && { color: COLORS.primary }]} numberOfLines={1}>
                                        {design.name}
                                    </Text>
                                    <Text style={styles.designCategory}>{design.category}</Text>
                                    {form.designId === design.id && (
                                        <View style={styles.selectedCheck}>
                                            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <FormSelect
                            label="Assign Tailor"
                            value={form.tailorId}
                            options={tailors.map(t => ({ label: `${t.name} — ${t.specialty}`, value: t.id }))}
                            onSelect={handleTailorSelect}
                            icon="cut-outline"
                        />

                        <FormSelect
                            label="Priority"
                            value={form.priority}
                            options={[
                                { label: '🔴 High Priority', value: 'high' },
                                { label: '🟡 Medium Priority', value: 'medium' },
                                { label: '🟢 Low Priority', value: 'low' },
                            ]}
                            onSelect={(v) => updateForm('priority', v)}
                            icon="flag-outline"
                        />
                    </View>
                );

            case 2: // Measurements
                return (
                    <View>
                        <Text style={styles.stepDescription}>
                            Enter measurements for {form.designName || 'the selected design'} (in inches)
                        </Text>
                        <View style={styles.measurementGrid}>
                            {getMeasurementFieldList().map((field) => (
                                <View key={field} style={styles.measurementItem}>
                                    <FormInput
                                        label={field}
                                        value={form.measurements[field] || ''}
                                        onChangeText={(v) => handleMeasurementChange(field, v)}
                                        placeholder="0"
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            ))}
                        </View>
                        <FormInput
                            label="Special Notes"
                            value={form.notes}
                            onChangeText={(v) => updateForm('notes', v)}
                            placeholder="Any special instructions..."
                            multiline
                            icon="document-text-outline"
                        />
                    </View>
                );

            case 3: // Payment & Delivery
                return (
                    <View>
                        <Text style={styles.stepDescription}>Enter payment details and delivery date</Text>

                        <FormInput
                            label="Delivery Date"
                            value={form.deliveryDate}
                            onChangeText={(v) => updateForm('deliveryDate', v)}
                            placeholder="YYYY-MM-DD"
                            icon="calendar-outline"
                            required
                        />

                        <Card style={styles.paymentCard}>
                            <View style={styles.paymentHeader}>
                                <Ionicons name="wallet-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.paymentTitle}>Payment Details</Text>
                            </View>

                            <FormInput
                                label="Total Amount"
                                value={form.totalAmount}
                                onChangeText={(v) => updateForm('totalAmount', v)}
                                placeholder="₹ 0"
                                keyboardType="decimal-pad"
                                required
                            />
                            <FormInput
                                label="Advance Amount"
                                value={form.advanceAmount}
                                onChangeText={(v) => updateForm('advanceAmount', v)}
                                placeholder="₹ 0"
                                keyboardType="decimal-pad"
                            />

                            {form.totalAmount && (
                                <View style={styles.balanceSummary}>
                                    <View style={styles.balanceRow}>
                                        <Text style={styles.balanceLabel}>Total</Text>
                                        <Text style={styles.balanceValue}>₹{parseFloat(form.totalAmount || 0).toLocaleString('en-IN')}</Text>
                                    </View>
                                    <View style={styles.balanceRow}>
                                        <Text style={styles.balanceLabel}>Advance</Text>
                                        <Text style={[styles.balanceValue, { color: COLORS.success }]}>−₹{parseFloat(form.advanceAmount || 0).toLocaleString('en-IN')}</Text>
                                    </View>
                                    <View style={[styles.balanceRow, styles.balanceFinal]}>
                                        <Text style={styles.balanceFinalLabel}>Balance Due</Text>
                                        <Text style={styles.balanceFinalValue}>
                                            ₹{((parseFloat(form.totalAmount || 0)) - (parseFloat(form.advanceAmount || 0))).toLocaleString('en-IN')}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </Card>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Order</Text>
                <TouchableOpacity onPress={handleSaveDraft} style={styles.draftBtn}>
                    <Ionicons name="bookmark-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.draftText}>Draft</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                {STEPS.map((s, idx) => (
                    <View key={idx} style={styles.progressStep}>
                        <View style={[
                            styles.progressDot,
                            idx < step && styles.progressDotCompleted,
                            idx === step && styles.progressDotActive,
                        ]}>
                            {idx < step ? (
                                <Ionicons name="checkmark" size={12} color={COLORS.textOnPrimary} />
                            ) : (
                                <Text style={[styles.progressNum, idx === step && { color: COLORS.textOnPrimary }]}>{idx + 1}</Text>
                            )}
                        </View>
                        <Text style={[styles.progressLabel, idx === step && styles.progressLabelActive]}>{s}</Text>
                        {idx < STEPS.length - 1 && (
                            <View style={[styles.progressLine, idx < step && styles.progressLineCompleted]} />
                        )}
                    </View>
                ))}
            </View>

            {/* Step Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentInner}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.stepTitle}>{STEPS[step]}</Text>
                {renderStepContent()}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                {step > 0 && (
                    <FormButton
                        title="Back"
                        variant="outline"
                        icon="arrow-back-outline"
                        onPress={() => setStep(step - 1)}
                        size="medium"
                    />
                )}
                <View style={{ flex: 1, marginLeft: step > 0 ? SIZES.sm : 0 }}>
                    {step < STEPS.length - 1 ? (
                        <FormButton
                            title="Continue"
                            icon="arrow-forward-outline"
                            onPress={() => setStep(step + 1)}
                            disabled={!canProceed()}
                        />
                    ) : (
                        <FormButton
                            title="Create Order"
                            icon="checkmark-circle-outline"
                            onPress={handleSubmit}
                            disabled={!canProceed()}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.xxxl + SIZES.sm,
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
    draftBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryMuted,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusFull,
    },
    draftText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        ...FONTS.medium,
        marginLeft: 4,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
    },
    progressStep: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    progressDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    progressDotActive: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.golden,
    },
    progressDotCompleted: {
        backgroundColor: COLORS.success,
    },
    progressNum: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.semiBold,
    },
    progressLabel: {
        fontSize: 9,
        color: COLORS.textMuted,
        ...FONTS.medium,
        marginTop: 4,
        textAlign: 'center',
    },
    progressLabelActive: {
        color: COLORS.primary,
        ...FONTS.semiBold,
    },
    progressLine: {
        position: 'absolute',
        top: 13,
        left: '60%',
        right: '-40%',
        height: 2,
        backgroundColor: COLORS.border,
        zIndex: 0,
    },
    progressLineCompleted: {
        backgroundColor: COLORS.success,
    },
    content: {
        flex: 1,
    },
    contentInner: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.md,
    },
    stepTitle: {
        fontSize: SIZES.title,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        marginBottom: SIZES.sm,
    },
    stepDescription: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginBottom: SIZES.lg,
        lineHeight: 20,
    },
    dividerWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SIZES.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginHorizontal: SIZES.md,
    },
    galleryLabel: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.medium,
        marginTop: SIZES.md,
        marginBottom: SIZES.sm,
    },
    galleryRow: {
        paddingVertical: SIZES.sm,
    },
    designCard: {
        width: 110,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginRight: SIZES.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
    },
    designCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryMuted,
    },
    designImagePlaceholder: {
        width: 56,
        height: 56,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.bgElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    designName: {
        fontSize: SIZES.caption,
        color: COLORS.textPrimary,
        ...FONTS.medium,
        textAlign: 'center',
    },
    designCategory: {
        fontSize: 10,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    selectedCheck: {
        position: 'absolute',
        top: 6,
        right: 6,
    },
    measurementGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -SIZES.xs,
    },
    measurementItem: {
        width: '50%',
        paddingHorizontal: SIZES.xs,
    },
    paymentCard: {
        backgroundColor: COLORS.bgElevated,
        marginTop: SIZES.sm,
        borderColor: COLORS.primarySoft,
        borderWidth: 1,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    paymentTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        marginLeft: SIZES.sm,
    },
    balanceSummary: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginTop: SIZES.md,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.sm,
    },
    balanceLabel: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.regular,
    },
    balanceValue: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.medium,
    },
    balanceFinal: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SIZES.sm,
        marginBottom: 0,
    },
    balanceFinalLabel: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    balanceFinalValue: {
        fontSize: SIZES.bodyLg,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    bottomBar: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        backgroundColor: COLORS.bgCard,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        ...SHADOWS.medium,
    },
});

export default OrderEntryScreen;
