import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

const BRANDS = ['Samsung', 'Dawlance', 'Haier', 'Super Asia', 'PEL', 'TCL', 'Gree', 'Waves'];
const CONDITIONS = ['New', 'Like New', 'Used', 'For Parts'];
const APPLIANCE_TYPES = ['Refrigerator', 'Washing Machine', 'Microwave', 'AC', 'Heater'];
const WORKING_STATUSES = ['Fully functional', 'Minor issue', 'Not working'];

export default function ApplianceValuation() {
  const [formData, setFormData] = useState({
    brand: '',
    condition: '',
    applianceType: '',
    workingStatus: '',
    year: '',
    warrantyRemaining: '',
  });
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const validate = () => {
    const { brand, condition, applianceType, year, warrantyRemaining, workingStatus } = formData;
    const currentYear = new Date().getFullYear();
  
    if (!BRANDS.includes(brand)) return 'Please select a valid brand.';
    if (!CONDITIONS.includes(condition)) return 'Please select a valid condition.';
    if (!APPLIANCE_TYPES.includes(applianceType)) return 'Please select a valid appliance type.';
    if (!WORKING_STATUSES.includes(workingStatus)) return 'Please select a valid working status.';
    if (!/^\d{4}$/.test(year)) return 'Please enter a valid 4-digit year.';
    if (parseInt(year) > currentYear) return `Year of purchase cannot be greater than ${currentYear}.`;
    if (isNaN(parseInt(warrantyRemaining)) || parseInt(warrantyRemaining) < 0)
      return 'Warranty remaining must be a non-negative number.';
    
    return null;
  };
  
  const predictPrice = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation Error', err);
    setLoading(true);
    setPredictedPrice(null);
    try {
      const resp = await fetch('https://hare-evolved-gladly.ngrok-free.app/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: formData.brand,
          condition: formData.condition,
          appliance_type: formData.applianceType,
          working_status: formData.workingStatus,
          year: parseInt(formData.year, 10),
          warranty_remaining: parseInt(formData.warrantyRemaining, 10),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || 'Prediction failed');
      setPredictedPrice(data.predicted_price);
      setShowResult(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', e.message || 'Could not fetch price');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowResult(false);
    setFormData({
      brand: '',
      condition: '',
      applianceType: '',
      workingStatus: '',
      year: '',
      warrantyRemaining: '',
    });
  };

  const renderDropdown = (icon, label, options, field) => (
    <View style={styles.section}>
      <View style={styles.sectionTitleWithIcon}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>{label}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {options.map(opt => (
          <Pressable
            key={opt}
            onPress={() => setFormData(prev => ({ ...prev, [field]: opt }))}
            style={[
              styles.option,
              formData[field] === opt && styles.optionSelected,
            ]}
          >
            <Text style={formData[field] === opt ? styles.optionTextSelected : styles.optionText}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderResultsPage = () => (
    <View style={styles.resultsContainer}>
      <Ionicons name="checkmark-circle" size={60} color={theme.colors.primary} />
      <Text style={styles.resultsHeader}>Valuation Result</Text>
      <View style={styles.resultBox}>
        <Text style={styles.resultLabel}>Estimated Value</Text>
        <Text style={styles.resultPrice}>₨ {predictedPrice.toLocaleString()}</Text>
        <Text style={styles.resultDisclaimer}>
          *Actual value may vary based on market conditions
        </Text>
      </View>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Appliance Summary</Text>
        {Object.entries({
          Brand: formData.brand,
          Type: formData.applianceType,
          Condition: formData.condition,
          'Working Status': formData.workingStatus,
          Year: formData.year,
          Warranty: `${formData.warrantyRemaining} months`
        }).map(([label, value]) => (
          <View key={label} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{label}:</Text>
            <Text style={styles.summaryValue}>{value}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.newValuationTouchable} onPress={resetForm}>
        <Ionicons name="refresh-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.newValuationText}>Start New Valuation</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFormPage = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>Appliance Valuation</Text>

      {renderDropdown('pricetag-outline', 'Brand', BRANDS, 'brand')}
      {renderDropdown('cube-outline', 'Condition', CONDITIONS, 'condition')}
      {renderDropdown('hardware-chip-outline', 'Appliance Type', APPLIANCE_TYPES, 'applianceType')}
      {renderDropdown('construct-outline', 'Working Status', WORKING_STATUSES, 'workingStatus')}

      <View style={styles.section}>
        <View style={styles.sectionTitleWithIcon}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Year of Purchase</Text>
        </View>
        <Input
          placeholder="e.g. 2020"
          value={formData.year}
          onChangeText={text => setFormData(p => ({ ...p, year: text }))}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleWithIcon}>
          <Ionicons name="time-outline" size={20} color={theme.colors.primary} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Warranty Remaining (Months)</Text>
        </View>
        <Input
          placeholder="e.g. 6"
          value={formData.warrantyRemaining}
          onChangeText={text => setFormData(p => ({ ...p, warrantyRemaining: text }))}
          keyboardType="numeric"
        />
      </View>

      <Button
        title="Estimate Price"
        onPress={predictPrice}
        loading={loading}
        style={styles.estimateButton}
      />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        {showResult ? renderResultsPage() : renderFormPage()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  optionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    color: '#333',
  },
  optionTextSelected: {
    color: 'white',
  },
  estimateButton: {
    marginTop: 10,
    height: 52,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsHeader: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 6,
  },
  resultPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  resultDisclaimer: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  summaryBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 15,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
  },
  newValuationTouchable: {
    marginTop: 20,
    height: 52,
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newValuationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
