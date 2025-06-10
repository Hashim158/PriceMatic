import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  Pressable,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createAppliance } from '../../services/applianceService';
import ScreenWrapper from '../../components/ScreenWrapper';

// Fixed brand list
const FIXED_BRANDS = [
  { id: '0e197473-4917-4d2f-9a3e-2e0f1a82f1d1', name: 'Dawlance' },
  { id: '1273622c-56c0-48aa-8cc8-01046a9a83a7', name: 'Super Asia' },
  { id: '155eb565-f886-4d2b-ada5-18d3d5a95edc', name: 'Haier' },
  { id: '2b67ca50-dc23-4947-aecc-4e67d818d4f3', name: 'PEL' },
  { id: '747553ac-0046-4f5e-a6f9-6d9b2c542a7e', name: 'TCL' },
  { id: '9bae119e-ad00-40d0-ad4e-564dbe78cdc0', name: 'Samsung' },
  { id: 'c4bf121d-40b7-4d33-a0a0-55f35fbd81d4', name: 'Gree' },
  { id: 'd1410a0e-ad64-4ba1-a51b-d889758f1fc4', name: 'Waves' },
];
const APPLIANCE_TYPES = ['Refrigerator', 'Washing Machine', 'Microwave', 'AC', 'Heater'];

const AddAppliance = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [images, setImages] = useState([]);
  const [type, setType] = useState(APPLIANCE_TYPES[0]);
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('');
  const [color, setColor] = useState('');
  const [capacity, setCapacity] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState(FIXED_BRANDS[0].id);
  const [brandName, setBrandName] = useState(FIXED_BRANDS[0].name);
  const [features, setFeatures] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [useCustomBrand, setUseCustomBrand] = useState(false);
  const [brands] = useState(FIXED_BRANDS);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length) {
        if (images.length + result.assets.length > 5) {
          Alert.alert('Limit Exceeded', 'You can add a maximum of 5 images.');
          return;
        }
        setImages([...images, ...result.assets.map(a => a.uri)]);
      }
    } catch (error) {
      console.log('[ImagePicker]', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleFeatureChange = (text, index) => {
    const newFeatures = [...features];
    newFeatures[index] = text;
    setFeatures(newFeatures);
  };

  const addFeatureField = () => setFeatures([...features, '']);
  const removeFeatureField = index => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const selectBrand = brand => {
    setSelectedBrandId(brand.id);
    setBrandName(brand.name);
    setUseCustomBrand(false);
  };

  const enableCustomBrand = () => {
    setSelectedBrandId(null);
    setUseCustomBrand(true);
    setBrandName('');
  };

  const validate = () => {
    if (!images.length) return 'Please select at least one image.';
    if (!price.trim()) return 'Price is required.';
    if (!modelNumber.trim()) return 'Model number is required.';
    if (!color.trim()) return 'Color is required.';
    if (!capacity.trim()) return 'Capacity is required.';
    if (!selectedBrandId && !brandName.trim()) return 'Brand is required.';
    return null;
  };

  const onSubmit = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      Alert.alert('Validation Error', errorMsg);
      return;
    }
    setLoading(true);
    try {
      const filteredFeatures = features.filter(f => f.trim());
      const applianceData = {
        type,
        Price: price.trim(),
        rating: rating.trim() || null,
        color: color.trim(),
        capacity: capacity.trim(),
        brandId: selectedBrandId,
        modelNumber: modelNumber.trim(),
        brand: brandName.trim(),
        image: images,
        features: filteredFeatures,
      };
      await createAppliance(applianceData);
      Alert.alert('Success', 'Appliance added successfully');
      router.back();
    } catch (err) {
      console.log('[AddAppliance]', err);
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderImage = ({ item, index }) => (
    <View style={styles.thumbnailContainer}>
      <Image source={{ uri: item }} style={styles.thumbnail} contentFit="cover" />
      <Pressable
        style={styles.removeImageBtn}
        onPress={() => setImages(prev => prev.filter((_, i) => i !== index))}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close-circle" size={22} color="#FF3B30" />
      </Pressable>
    </View>
  );

  return (
    <ScreenWrapper bg="white" >  
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Add New Appliance</Text>
        <Text style={styles.subHeader}>Enter details for the new appliance</Text>
      </View>

      {/* Photos */}
      <View style={styles.section}>
        <View style={styles.sectionTitleWithIcon}>
          <Ionicons name="camera-outline" size={20} color="#007AFF" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Photos</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Add up to 5 photos</Text>
        <Pressable style={styles.imagePicker} onPress={pickImages}>
          {images.length > 0 ? (
            <FlatList
              data={images}
              keyExtractor={(uri, idx) => `${uri}-${idx}`}
              renderItem={renderImage}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageList}
            />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Ionicons name="cloud-upload-outline" size={36} color="#007AFF" />
              <Text style={styles.placeholderText}>Tap to add photos</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Appliance Details */}
      <View style={styles.section}>
        <View style={styles.sectionTitleWithIcon}>
          <Ionicons name="cube-outline" size={20} color="#007AFF" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Appliance Details</Text>
        </View>

        {/* Type */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="list-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Type</Text>
          </View>
          <View style={styles.typesContainer}>
            {APPLIANCE_TYPES.map(applianceType => (
              <Pressable
                key={applianceType}
                style={[
                  styles.typeButton,
                  type === applianceType && styles.typeSelected
                ]}
                onPress={() => setType(applianceType)}
              >
                <Text style={[
                  styles.typeText,
                  type === applianceType && styles.typeTextSelected
                ]}>
                  {applianceType}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Brand Selection */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="pricetag-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Brand</Text>
          </View>
          <View style={styles.brandsContainer}>
            {brands.map(brand => (
              <Pressable
                key={brand.id}
                style={[
                  styles.brandButton,
                  selectedBrandId === brand.id && styles.brandSelected
                ]}
                onPress={() => selectBrand(brand)}
              >
                <Text style={[
                  styles.brandText,
                  selectedBrandId === brand.id && styles.brandTextSelected
                ]}>
                  {brand.name}
                </Text>
              </Pressable>
            ))}
            
            {/* Add Custom Brand Button */}
          </View>
          
          {/* Custom Brand Input (visible only when "Other" is selected) */}
        </View>

        {/* Model Number */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="barcode-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Model Number</Text>
          </View>
          <Input placeholder="Enter Model Number" value={modelNumber} onChangeText={setModelNumber} />
        </View>

        {/* Price */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="cash-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Price ($)</Text>
          </View>
          <Input
            placeholder="Enter Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Color */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="color-palette-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Color</Text>
          </View>
          <Input placeholder="Enter Color" value={color} onChangeText={setColor} />
        </View>

        {/* Capacity */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="resize-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Capacity</Text>
          </View>
          <Input 
            placeholder="Enter Capacity (e.g., 10L, 2.5 cubic ft)" 
            value={capacity} 
            onChangeText={setCapacity} 
          />
        </View>

        {/* Rating */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="star-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Rating (Optional)</Text>
          </View>
          <Input 
            placeholder="Enter Rating (1-5)" 
            value={rating} 
            onChangeText={setRating} 
            keyboardType="decimal-pad"
            maxLength={3}
          />
        </View>

        {/* Features */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="list-circle-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Features</Text>
          </View>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureInputContainer}>
                <Input
                  placeholder={`Feature ${index + 1}`}
                  value={feature}
                  onChangeText={(text) => handleFeatureChange(text, index)}
                />
              </View>
              <Pressable
                style={styles.featureButton}
                onPress={() => removeFeatureField(index)}
              >
                <Ionicons name="remove-circle-outline" size={22} color="#FF3B30" />
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.addFeatureButton} onPress={addFeatureField}>
            <Ionicons name="add-circle-outline" size={18} color="#007AFF" />
            <Text style={styles.addFeatureText}>Add Feature</Text>
          </Pressable>
        </View>
      </View>

      <Button
        title="Add Appliance"
        loading={loading}
        onPress={onSubmit}
        style={styles.submitButton}
      />
    </ScrollView>
    </ScreenWrapper>

  );
};

export default AddAppliance;

const styles = StyleSheet.create({
  scrollView: { 
    backgroundColor: '#F8F8F8',
    flex: 1,
  },
  container: { 
    padding: 16, 
    paddingBottom: 40,
  },
  headerContainer: { 
    marginBottom: 24,
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 6,
  },
  subHeader: { 
    fontSize: 16, 
    color: '#666',
  },
  section: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 2, 
    elevation: 2,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 4, 
    color: '#333',
  },
  sectionSubtitle: { 
    fontSize: 14, 
    color: '#888', 
    marginBottom: 12,
  },
  imagePicker: { 
    minHeight: 140, 
    borderRadius: 10, 
    backgroundColor: '#f5f5f5', 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderStyle: 'dashed', 
    overflow: 'hidden',
  },
  imagePickerPlaceholder: { 
    height: 140, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  placeholderText: { 
    color: '#888', 
    marginTop: 8,
  },
  imageList: { 
    padding: 12,
  },
  thumbnailContainer: { 
    position: 'relative', 
    marginRight: 12,
  },
  thumbnail: { 
    width: 100, 
    height: 100, 
    borderRadius: 8, 
    backgroundColor: '#eee',
  },
  removeImageBtn: { 
    position: 'absolute', 
    top: -6, 
    right: -6, 
    backgroundColor: 'white', 
    borderRadius: 12,
    zIndex: 1,
  },
  formGroup: { 
    marginBottom: 16,
  },
  label: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: '#333', 
    marginBottom: 6,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelIcon: {
    marginRight: 6,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionIcon: {
    marginRight: 6,
  },
  typesContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
  },
  typeButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    marginBottom: 10, 
    width: '48%', 
    alignItems: 'center',
  },
  typeSelected: { 
    backgroundColor: '#007AFF', 
    borderColor: '#007AFF',
  },
  typeText: { 
    fontWeight: '500', 
    color: '#555',
  },
  typeTextSelected: { 
    color: 'white',
  },
  brandsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  brandButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  brandSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  brandText: {
    fontWeight: '500',
    color: '#555',
  },
  brandTextSelected: {
    color: 'white',
  },
  customBrandContainer: {
    marginTop: 10,
  },
  customBrandInput: {
    marginTop: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureInputContainer: {
    flex: 1,
  },
  featureButton: {
    marginLeft: 8,
    padding: 4,
  },
  addFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  addFeatureText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  submitButton: { 
    marginTop: 10, 
    height: 52,
  },
});