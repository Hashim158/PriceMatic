import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { getSellingItemById, updateSellingItem } from '../../services/sellingService';
import { getSupaBaseFileUrl } from '../../services/imageService';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';

const conditionOptions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const EditAd = () => {
  const { itemId } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState(null);
  
  // Form state
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [modelNo, setModelNo] = useState('');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState('');
  const [yearOfPurchase, setYearOfPurchase] = useState('');
  const [pictures, setPictures] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState(null);

  useEffect(() => {
    fetchItemDetails();
  }, [itemId]);

  const fetchItemDetails = async () => {
    try {
      if (!itemId) return;
      
      const itemData = await getSellingItemById(itemId);
      setItem(itemData);
      
      // Populate form fields
      setBrand(itemData.brand || '');
      setPrice(itemData.price?.toString() || '');
      setDescription(itemData.description || '');
      setModelNo(itemData.modelNo || '');
      setColor(itemData.color || '');
      setCondition(itemData.condition || '');
      setYearOfPurchase(itemData.yearOfPurchase?.toString() || '');
      setPictures(itemData.pictures || []);
      
      // Set selected condition for UI
      if (itemData.condition) {
        setSelectedCondition(itemData.condition);
      }
    } catch (error) {
      console.log('Error fetching item details:', error);
      Alert.alert('Error', 'Failed to load item details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant access to your photos to add images.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets[0]) {
      setPictures([...pictures, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index) => {
    const newPictures = [...pictures];
    newPictures.splice(index, 1);
    setPictures(newPictures);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      // Prepare updates object
      const updates = {
        brand,
        price: parseFloat(price),
        description,
        modelNo,
        color,
        condition: selectedCondition,
        yearOfPurchase,
        pictures,
      };
      
      await updateSellingItem(itemId, updates);
      
      Alert.alert(
        'Success',
        'Your listing has been updated successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.log('Error updating listing:', error);
      Alert.alert('Error', 'Failed to update your listing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const validateForm = () => {
    if (!brand.trim()) {
      Alert.alert('Missing Information', 'Please enter a brand name.');
      return false;
    }
    
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return false;
    }
    
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please provide a description.');
      return false;
    }
    
    if (pictures.length === 0) {
      Alert.alert('No Images', 'Please add at least one image of your item.');
      return false;
    }
    
    if (!selectedCondition) {
      Alert.alert('Missing Information', 'Please select the condition of your item.');
      return false;
    }
    
    return true;
  };

  const renderImagePreview = () => {
    return (
      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>Images</Text>
        <Text style={styles.sectionSubtitle}>Upload clear photos of your item</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
          {pictures.map((pic, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={pic.startsWith('sell/') ? getSupaBaseFileUrl(pic) : pic}
                style={styles.image}
                contentFit="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => handleRemoveImage(index)}
              >
                <Feather name="x" size={hp(2)} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
            <Feather name="plus" size={hp(4)} color={theme.colors.primary} />
            <Text style={styles.addImageText}>Add Image</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderConditionSelector = () => {
    return (
      <View style={styles.conditionContainer}>
        <Text style={styles.sectionTitle}>Condition</Text>
        <Text style={styles.sectionSubtitle}>Select the condition of your item</Text>
        
        <View style={styles.conditionOptions}>
          {conditionOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.conditionOption,
                selectedCondition === option && styles.selectedCondition
              ]}
              onPress={() => setSelectedCondition(option)}
            >
              <Text 
                style={[
                  styles.conditionText,
                  selectedCondition === option && styles.selectedConditionText
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={hp(2.5)} color="#1E2033" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Listing</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {renderImagePreview()}
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="Enter brand name"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Price (Rs.)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Enter price"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your item (material, features, etc.)"
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Model Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={modelNo}
              onChangeText={setModelNo}
              placeholder="Enter model number"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Color (Optional)</Text>
            <TextInput
              style={styles.input}
              value={color}
              onChangeText={setColor}
              placeholder="Enter color"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Year of Purchase (Optional)</Text>
            <TextInput
              style={styles.input}
              value={yearOfPurchase}
              onChangeText={setYearOfPurchase}
              placeholder="Enter year of purchase"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
            />
          </View>
        </View>
        
        {renderConditionSelector()}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Feather name="check" size={hp(2)} color="white" style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditAd;

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
  formSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: wp(5),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: hp(2.2),
    fontWeight: '700',
    color: '#1E2033',
    marginBottom: hp(0.8),
  },
  sectionSubtitle: {
    fontSize: hp(1.6),
    color: '#7B7F9E',
    marginBottom: hp(2),
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: '#1E2033',
    marginBottom: hp(1),
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
  imageSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: wp(5),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  imageList: {
    flexDirection: 'row',
    marginTop: hp(1),
  },
  imageContainer: {
    position: 'relative',
    marginRight: wp(3),
  },
  image: {
    width: hp(15),
    height: hp(15),
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: hp(1),
    right: hp(1),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: hp(3),
    height: hp(3),
    borderRadius: hp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: hp(15),
    height: hp(15),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
  },
  addImageText: {
    color: theme.colors.primary,
    marginTop: hp(1),
    fontSize: hp(1.6),
    fontWeight: '600',
  },
  conditionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: wp(5),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  conditionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: hp(1),
  },
  conditionOption: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginRight: wp(2),
    marginBottom: hp(2),
    backgroundColor: '#F7F8FA',
  },
  selectedCondition: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  conditionText: {
    fontSize: hp(1.8),
    color: '#4A4B57',
  },
  selectedConditionText: {
    color: 'white',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(3),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: hp(1.8),
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginRight: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#4A4B57',
    fontSize: hp(1.8),
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: hp(1.8),
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: wp(2),
  },
  saveButtonText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: '600',
  },
});