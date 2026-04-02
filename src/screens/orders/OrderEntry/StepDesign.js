import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../theme';
import { FormSelect } from '../../../components/forms';

// ─────────────────────────────────────────────
// Design category section configuration
// ─────────────────────────────────────────────
const DESIGN_SECTIONS = [
    {
        key: 'blousePattern',
        label: 'Blouse Pattern',
        icon: 'shirt-outline',
        dataKey: 'blousePatterns',
    },
    {
        key: 'frontNeck',
        label: 'Front Neck Outline',
        icon: 'arrow-up-circle-outline',
        dataKey: 'frontNeckDesigns',
    },
    {
        key: 'backNeck',
        label: 'Back Neck Outline',
        icon: 'arrow-down-circle-outline',
        dataKey: 'backNeckDesigns',
    },
    {
        key: 'aariDesign',
        label: 'Aari Design',
        icon: 'sparkles-outline',
        dataKey: 'aariDesigns',
    },
];

// ─────────────────────────────────────────────
// Single design card in the grid
// ─────────────────────────────────────────────
const DesignCard = ({ item, isSelected, onPress, styles }) => (
    <TouchableOpacity
        style={styles.designGridCard}
        onPress={onPress}
        activeOpacity={0.75}
    >
        <View style={[styles.designGridCardInner, isSelected && styles.designGridCardSelectedInner]}>
            <View style={[styles.designGridImage, isSelected && { backgroundColor: COLORS.primarySoft }]}>
                <Image
                    source={{ uri: item.image }}
                    style={{ width: 44, height: 44, borderRadius: 6 }}
                    resizeMode="cover"
                />
            </View>
            <Text style={[styles.designGridName, isSelected && { color: COLORS.primary }]} numberOfLines={2}>
                {item.name}
            </Text>
        </View>
        {isSelected && (
            <View style={styles.designGridCheck}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
            </View>
        )}
    </TouchableOpacity>
);

// ─────────────────────────────────────────────
// Category section with title + grid
// ─────────────────────────────────────────────
const DesignSection = ({ section, items, selectedId, onSelect, styles }) => {
    const isAllSelected = !!selectedId;
    return (
        <View style={styles.designSection}>
            {/* Section Header */}
            <View style={styles.designSectionHeader}>
                <View style={styles.designSectionTitleRow}>
                    <Ionicons name={section.icon} size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.designSectionTitle}>{section.label}</Text>
                </View>
                <Text style={[
                    styles.designSectionBadge,
                    isAllSelected
                        ? styles.designSectionBadgeSelected
                        : styles.designSectionBadgeRequired,
                ]}>
                    {isAllSelected ? '✓ Selected' : 'Required'}
                </Text>
            </View>

            {/* 3-column grid rendered without nested VirtualizedList */}
            <View style={styles.designGrid}>
                {items.map((item) => (
                    <DesignCard
                        key={item.id}
                        item={item}
                        isSelected={selectedId === item.id}
                        onPress={() => onSelect(section.key, item.id)}
                        styles={styles}
                    />
                ))}
            </View>
        </View>
    );
};

// ─────────────────────────────────────────────
// StepDesign — main component
// ─────────────────────────────────────────────
const StepDesign = ({
    form,
    handleDesignCategorySelect,
    handleTailorSelect,
    updateForm,
    designTemplates,
    tailors,
    styles,
}) => {
    // Guard: show nothing until templates load
    if (!designTemplates) {
        return (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <Text style={styles.stepDescription}>Loading design templates...</Text>
            </View>
        );
    }

    return (
        <View>
            <Text style={styles.stepDescription}>
                Select one design from each category to continue.
            </Text>

            {DESIGN_SECTIONS.map((section) => (
                <DesignSection
                    key={section.key}
                    section={section}
                    items={designTemplates[section.dataKey] || []}
                    selectedId={form.design[section.key]}
                    onSelect={handleDesignCategorySelect}
                    styles={styles}
                />
            ))}

            {/* Tailor assignment */}
            <FormSelect
                label="Assign Tailor"
                value={form.tailorId}
                options={tailors.map(t => ({ label: `${t.name} — ${t.specialty}`, value: t.id }))}
                onSelect={handleTailorSelect}
                icon="cut-outline"
            />

            {/* Priority */}
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
};

export default StepDesign;
