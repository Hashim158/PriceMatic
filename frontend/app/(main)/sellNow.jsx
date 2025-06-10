import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { createSellingItem } from '../../services/sellingService';
import { getUserData, updateUser } from '../../services/userService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../../components/Footer';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../lib/supabase'; // Make sure this path is correct

const CONDITION_OPTIONS = ['New', 'Like New', 'Used', 'For Parts'];
const BRANDS = ['Samsung', 'Dawlance', 'Haier', 'Super Asia', 'PEL', 'TCL', 'Gree', 'Waves'];


const SellNow = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [images, setImages] = useState([]);
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [modelNo, setModelNo] = useState('');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState(CONDITION_OPTIONS[0]);
  const [yearOfPurchase, setYearOfPurchase] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const APPLIANCE_TYPES = ['Refrigerator', 'Washing Machine', 'Microwave', 'AC', 'Heater'];
  const [category, setCategory] = useState(APPLIANCE_TYPES[0]);


  useEffect(() => {
    const loadUser = async () => {
      if (user && user.id) {
        const res = await getUserData(user.id);
        if (res.success) {
          setName(res.data.name || '');
          setPhoneNumber(res.data.phoneNumber || '');
        }
      }
    };
    loadUser();
  }, [user]);

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
        //console.log(images);
      }
    } catch (error) {
      console.log('[ImagePicker]', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const validate = () => {
    const currentYear = new Date().getFullYear();
  
    if (!images.length) return 'Please select at least one image.';
    if (!brand.trim()) return 'Brand is required.';
    if (!price.trim()) return 'Price is required.';
    if (isNaN(parseFloat(price))) return 'Price must be a valid number.';
    if (!modelNo.trim()) return 'Model number is required.';
    if (!color.trim()) return 'Color is required.';
    if (!yearOfPurchase.trim()) return 'Year of purchase is required.';
    if (!/^\d{4}$/.test(yearOfPurchase)) return 'Year must be a valid 4-digit number.';
    if (parseInt(yearOfPurchase) > currentYear) return `Year of purchase cannot be greater than ${currentYear}.`;
    if (!description.trim()) return 'Description is required.';
    if (!name.trim()) return 'Your name is required.';
    if (!phoneNumber.trim()) return 'Phone number is required.';
  
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
      if (user && user.id) {
        await updateUser(user.id, {
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
        });

        await createSellingItem({
          pictures: images,
          brand: brand.trim(),
          price: parseFloat(price.trim()),
          description: description.trim(),
          modelNo: modelNo.trim(),
          color: color.trim(),
          condition,
          yearOfPurchase: yearOfPurchase.trim(),
          category, // ✅ pass selected category
          userId: user.id,  
        });
        

        Alert.alert('Success', 'Item listed successfully');
        router.back();
      } else {
        throw new Error('User not authenticated');
      }
    } catch (err) {
      console.log('[SellNow]', err);
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
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Sell Your Item</Text>
        <Text style={styles.subHeader}>Add details to list your item for sale</Text>
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

      {/* Item Details */}
      <View style={styles.section}>
        <View style={styles.sectionTitleWithIcon}>
          <Ionicons name="cube-outline" size={20} color="#007AFF" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Item Details</Text>
        </View>

        {/* Brand */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="pricetag-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Brand</Text>
          </View>
          <View style={styles.conditionContainer}>
            {BRANDS.map(b => (
              <Pressable
                key={b}
                style={[
                  styles.conditionButton,
                  brand === b && styles.conditionSelected
                ]}
                onPress={() => setBrand(b)}
              >
                <Text style={[
                  styles.conditionText,
                  brand === b && styles.conditionTextSelected
                ]}>
                  {b}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>


        {/* Price with AI Button */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="cash-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Price (PKR)</Text>
          </View>
          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Enter Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/applianceValuation',
                  params: {
                    brand: brand || '',
                    modelNo: modelNo || '',
                    condition: condition || '',
                    year: yearOfPurchase || '',
                  },
                })
              }
              style={styles.aiButton}
            >
              <Ionicons name="sparkles-outline" size={18} color="#007AFF" />
              <Text style={styles.aiButtonText}>Check with AI</Text>
            </Pressable>
          </View>
        </View>

        {/* Model No */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="barcode-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Model Number</Text>
          </View>
          <Input placeholder="Enter Model Number" value={modelNo} onChangeText={setModelNo} />
        </View>

        {/* Color */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="color-palette-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Color</Text>
          </View>
          <Input placeholder="Enter Color" value={color} onChangeText={setColor} />
        </View>

        {/* Year */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="calendar-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Year of Purchase</Text>
          </View>
          <Input
            placeholder="Enter Year"
            value={yearOfPurchase}
            onChangeText={setYearOfPurchase}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        {/* Category */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="list-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Category</Text>
          </View>
          <View style={styles.conditionContainer}>
            {APPLIANCE_TYPES.map(type => (
              <Pressable
                key={type}
                style={[
                  styles.conditionButton,
                  category === type && styles.conditionSelected
                ]}
                onPress={() => setCategory(type)}
              >
                <Text style={[
                  styles.conditionText,
                  category === type && styles.conditionTextSelected
                ]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>


        {/* Description */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="document-text-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Description</Text>
          </View>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe your item..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <View style={styles.sectionTitleWithIcon}>
          <Ionicons name="person-outline" size={20} color="#007AFF" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Your Contact Info</Text>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="person-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Name</Text>
          </View>
          <Input placeholder="Enter Name" value={name} onChangeText={setName} />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="call-outline" size={18} color="#007AFF" style={styles.labelIcon} />
            <Text style={styles.label}>Phone Number</Text>
          </View>
          <Input
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <Button
        title="List Item For Sale"
        loading={loading}
        onPress={onSubmit}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

export default SellNow;



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
  descriptionInput: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 10, 
    padding: 12, 
    height: 120, 
    textAlignVertical: 'top', 
    fontSize: 15,
  },
  conditionContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
  },
  conditionButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    marginBottom: 10, 
    width: '48%', 
    alignItems: 'center',
  },
  conditionSelected: { 
    backgroundColor: '#007AFF', 
    borderColor: '#007AFF',
  },
  conditionText: { 
    fontWeight: '500', 
    color: '#555',
  },
  conditionTextSelected: { 
    color: 'white',
  },
  submitButton: { 
    marginTop: 10, 
    height: 52,
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
  },priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef6ff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  aiButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#007AFF',
  },
  
  
});