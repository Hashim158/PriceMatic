import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Button from '../../components/Button';

const AddAppliance = () => {
  const [formData, setFormData] = useState({
    type: '',
    Price: '',
    rating: '',
    color: '',
    capacity: '',
    modelNumber: '',
    brand: '',
    image: '',
    features: '',
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    const required = ['type', 'Price', 'brand', 'modelNumber'];
    for (let field of required) {
      if (!formData[field]) {
        Alert.alert("Error", `Field '${field}' is required.`);
        return;
      }
    }

    setLoading(true);

    const appliance = {
      ...formData,
      image: [formData.image], // store as array
      features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
    };

    const result = await addAppliance(appliance);
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "Appliance added successfully.");
      router.back(); // or router.replace("/somewhere")
    } else {
      Alert.alert("Error", result.error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.heading}>Add New Appliance</Text>

      {[
        { label: 'Type', key: 'type' },
        { label: 'Price', key: 'Price' },
        { label: 'Rating', key: 'rating' },
        { label: 'Color', key: 'color' },
        { label: 'Capacity', key: 'capacity' },
        { label: 'Brand', key: 'brand' },
        { label: 'Model Number', key: 'modelNumber' },
        { label: 'Image URL', key: 'image' },
        { label: 'Features (comma-separated)', key: 'features' }
      ].map(item => (
        <TextInput
          key={item.key}
          style={styles.input}
          placeholder={item.label}
          value={formData[item.key]}
          onChangeText={(val) => handleChange(item.key, val)}
        />
      ))}

      <Button title="Submit" onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
};

export default AddAppliance;

const styles = StyleSheet.create({
  container: {
    padding: wp(5),
    backgroundColor: 'white',
    flexGrow: 1,
  },
  heading: {
    fontSize: hp(3),
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: hp(1.9),
    color: theme.colors.text,
  },
});
