import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchApplianceDetails, updateAppliance } from '../../services/applianceService';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';

const EditAppliance = () => {
  const { applianceId } = useLocalSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [appliance, setAppliance] = useState({
    type: '',
    price: '',
    rating: '',
    color: '',
    capacity: '',
    modelNumber: '',
    brand: '',
    features: [],
  });
  const [featuresText, setFeaturesText] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (applianceId) loadDetails();
  }, [applianceId]);

  const loadDetails = async () => {
    try {
      const result = await fetchApplianceDetails(applianceId);
      if (result.success && result.data.length > 0) {
        const data = result.data[0];
        setAppliance({
          type: data.type || '',
          price: data.Price || '', // Still mapping from DB "Price"
          rating: data.rating || '',
          color: data.color || '',
          capacity: data.capacity || '',
          modelNumber: data.modelNumber || '',
          brand: data.brand || '',
          features: data.features || [],
        });
        setFeaturesText(data.features?.join(', ') || '');
      } else {
        Alert.alert('Error', 'Unable to load appliance details.');
        router.back();
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let valid = true;
  
    if (!appliance.type.trim()) {
      newErrors.type = 'Type is required';
      valid = false;
    }
  
    const rawPrice = appliance.price.replace(/[^0-9.]/g, '');
    if (!rawPrice || isNaN(Number(rawPrice))) {
      newErrors.price = 'Valid price is required';
      valid = false;
    } else {
      appliance.price = rawPrice; // Optional normalization
    }
    if (appliance.rating) {
      const ratingNum = parseFloat(appliance.rating);
      if (isNaN(ratingNum)) {
        newErrors.rating = 'Rating must be numeric';
        valid = false;
      } else if (ratingNum > 5) {
        newErrors.rating = 'Rating cannot be more than 5';
        valid = false;
      } else if (ratingNum < 0) {
        newErrors.rating = 'Rating cannot be negative';
        valid = false;
      }
    }
    
  
    if (!appliance.brand.trim()) {
      newErrors.brand = 'Brand is required';
      valid = false;
    }
  
    if (!appliance.modelNumber.trim()) {
      newErrors.modelNumber = 'Model Number is required';
      valid = false;
    }
  
    setErrors(newErrors);
    return valid;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const updates = {
        ...appliance,
        Price: appliance.price.replace(/[^0-9.]/g, ''),
        features: featuresText.split(',').map(f => f.trim()).filter(f => f),
      };
      delete updates.price;
      await updateAppliance(applianceId, updates);
      Alert.alert('Success', 'Appliance updated successfully.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Failed to update appliance.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (label, key, placeholder, keyboardType = 'default', multiline = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        keyboardType={keyboardType}
        value={appliance[key]}
        onChangeText={text => setAppliance({ ...appliance, [key]: text })}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {errors[key] && <Text style={styles.error}>{errors[key]}</Text>}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenWrapper bg="white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={hp(2.5)} color="#1E2033" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Appliance</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            {renderField('Type', 'type', 'Refrigerator, Washing Machine')}
            {renderField('Brand', 'brand', 'Samsung, Haier')}
            {renderField('Model Number', 'modelNumber', 'XYZ123')}
            {renderField('Price (Rs.)', 'price', '10000', 'numeric')}
            {renderField('Rating (1-5)', 'rating', '4.5', 'numeric')}
            {renderField('Color', 'color', 'Red, Silver')}
            {renderField('Capacity', 'capacity', '200L')}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Features (comma separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Energy saving, Smart control"
                placeholderTextColor="#A0A0A0"
                value={featuresText}
                onChangeText={setFeaturesText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={isSaving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="check" size={hp(2)} color="#fff" style={styles.icon} />
                  <Text style={styles.saveText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
};

export default EditAppliance;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: hp(2.4),
    fontWeight: '700',
    color: '#1E2033',
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 30,
  },
  content: {
    padding: wp(5),
    paddingBottom: hp(10),
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: wp(5),
    marginBottom: hp(2),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: '#1E2033',
    marginBottom: hp(0.5),
  },
  input: {
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderRadius: 8,
    padding: hp(1.5),
    fontSize: hp(1.8),
    color: '#1E2033',
  },
  textArea: {
    height: hp(12),
    paddingTop: hp(1.5),
  },
  error: {
    color: '#EF4444',
    fontSize: hp(1.5),
    marginTop: hp(0.5),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(3),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderRadius: 8,
    paddingVertical: hp(1.8),
    alignItems: 'center',
    marginRight: wp(2),
  },
  cancelText: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: '#4A4B57',
  },
  saveButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: hp(1.8),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: 'white',
  },
  icon: {
    marginRight: wp(2),
  },
});
