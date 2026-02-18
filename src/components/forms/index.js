import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';

export const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, error, icon, required, editable = true }) => (
    <View style={styles.inputGroup}>
        {label && (
            <View style={styles.labelRow}>
                {icon && <Ionicons name={icon} size={14} color={COLORS.primary} style={{ marginRight: 6 }} />}
                <Text style={styles.label}>{label}</Text>
                {required && <Text style={styles.required}>*</Text>}
            </View>
        )}
        <View style={[styles.inputWrap, error && styles.inputError, !editable && styles.inputDisabled]}>
            <TextInput
                style={[styles.input, multiline && styles.inputMultiline]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textLight}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                textAlignVertical={multiline ? 'top' : 'center'}
                editable={editable}
            />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

export const FormButton = ({ title, onPress, variant = 'primary', icon, disabled, loading, size = 'medium' }) => {
    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';
    const isSmall = size === 'small';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isPrimary && styles.buttonPrimary,
                isOutline && styles.buttonOutline,
                isGhost && styles.buttonGhost,
                isSmall && styles.buttonSmall,
                disabled && styles.buttonDisabled,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {icon && <Ionicons name={icon} size={isSmall ? 16 : 18} color={isPrimary ? COLORS.textOnPrimary : COLORS.primary} style={{ marginRight: SIZES.sm }} />}
            <Text style={[
                styles.buttonText,
                isPrimary && styles.buttonTextPrimary,
                isOutline && styles.buttonTextOutline,
                isGhost && styles.buttonTextGhost,
                isSmall && styles.buttonTextSmall,
            ]}>
                {loading ? 'Loading...' : title}
            </Text>
        </TouchableOpacity>
    );
};

export const FormSelect = ({ label, value, options, onSelect, icon, required }) => {
    const [open, setOpen] = React.useState(false);
    const selectedLabel = options.find(o => o.value === value)?.label || 'Select...';

    return (
        <View style={styles.inputGroup}>
            {label && (
                <View style={styles.labelRow}>
                    {icon && <Ionicons name={icon} size={14} color={COLORS.primary} style={{ marginRight: 6 }} />}
                    <Text style={styles.label}>{label}</Text>
                    {required && <Text style={styles.required}>*</Text>}
                </View>
            )}
            <TouchableOpacity style={styles.selectWrap} onPress={() => setOpen(!open)} activeOpacity={0.8}>
                <Text style={[styles.selectText, !value && { color: COLORS.textLight }]}>{selectedLabel}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
            {open && (
                <View style={styles.dropdown}>
                    {options.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[styles.dropdownItem, value === opt.value && styles.dropdownItemActive]}
                            onPress={() => { onSelect(opt.value); setOpen(false); }}
                        >
                            <Text style={[styles.dropdownText, value === opt.value && styles.dropdownTextActive]}>{opt.label}</Text>
                            {value === opt.value && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

export const FormToggle = ({ label, value, onToggle, description }) => (
    <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>{label}</Text>
            {description && <Text style={styles.toggleDesc}>{description}</Text>}
        </View>
        <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: COLORS.border, true: COLORS.primarySoft }}
            thumbColor={value ? COLORS.primary : COLORS.textLight}
        />
    </View>
);

export const SearchBar = ({ value, onChangeText, placeholder = 'Search...' }) => (
    <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
            style={styles.searchInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textLight}
        />
        {value ? (
            <TouchableOpacity onPress={() => onChangeText('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
        ) : null}
    </View>
);

export const FilterChip = ({ label, active, onPress }) => (
    <TouchableOpacity
        style={[styles.chip, active && styles.chipActive]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: SIZES.base,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    label: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.medium,
    },
    required: {
        color: COLORS.error,
        marginLeft: 4,
        fontSize: SIZES.body,
    },
    inputWrap: {
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    inputDisabled: {
        opacity: 0.6,
    },
    input: {
        paddingHorizontal: SIZES.base,
        paddingVertical: SIZES.md,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.regular,
    },
    inputMultiline: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: SIZES.caption,
        color: COLORS.error,
        marginTop: 4,
        ...FONTS.regular,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.md + 2,
        paddingHorizontal: SIZES.xl,
        borderRadius: SIZES.radiusMd,
        marginVertical: SIZES.xs,
    },
    buttonPrimary: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.golden,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    buttonGhost: {
        backgroundColor: 'transparent',
    },
    buttonSmall: {
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.base,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: SIZES.body,
        ...FONTS.semiBold,
    },
    buttonTextPrimary: {
        color: COLORS.textOnPrimary,
    },
    buttonTextOutline: {
        color: COLORS.primary,
    },
    buttonTextGhost: {
        color: COLORS.primary,
    },
    buttonTextSmall: {
        fontSize: SIZES.small,
    },
    selectWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SIZES.base,
        paddingVertical: SIZES.md,
    },
    selectText: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.regular,
    },
    dropdown: {
        marginTop: SIZES.xs,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
        maxHeight: 200,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.base,
        paddingVertical: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    dropdownItemActive: {
        backgroundColor: COLORS.primaryMuted,
    },
    dropdownText: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.regular,
    },
    dropdownTextActive: {
        color: COLORS.primary,
        ...FONTS.medium,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SIZES.md,
        marginBottom: SIZES.sm,
    },
    toggleLabel: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.medium,
    },
    toggleDesc: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        marginHorizontal: SIZES.lg,
        marginVertical: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        marginLeft: SIZES.sm,
        paddingVertical: SIZES.xs,
        ...FONTS.regular,
    },
    chip: {
        paddingHorizontal: SIZES.base,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusFull,
        backgroundColor: COLORS.bgElevated,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: SIZES.sm,
    },
    chipActive: {
        backgroundColor: COLORS.primaryMuted,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        ...FONTS.medium,
    },
    chipTextActive: {
        color: COLORS.primary,
    },
});
