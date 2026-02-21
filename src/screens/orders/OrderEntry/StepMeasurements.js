import React from 'react';
import { View, Text } from 'react-native';
import { FormInput } from '../../../components/forms';

const StepMeasurements = ({ form, handleMeasurementChange, updateForm, getMeasurementFieldList, styles }) => {
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
};

export default StepMeasurements;
