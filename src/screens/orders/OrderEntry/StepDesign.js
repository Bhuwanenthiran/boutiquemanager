import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../theme';
import { FormSelect } from '../../../components/forms';

const StepDesign = ({ form, handleDesignSelect, handleTailorSelect, updateForm, designs, tailors, styles }) => {
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

            {/* Design Gallery */}
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
};

export default StepDesign;
