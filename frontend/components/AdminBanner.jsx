import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AdminBanner = () => {
  const router = useRouter();

  const handleAddPress = () => {
    // Optional: Scroll to AddAppliance or navigate
     router.push('/addAppliance'); // if you use routing
  };

  return (
    <View style={styles.banner}>
      <Ionicons name="alert-circle-outline" size={28} color="#007BFF" />
      <View style={styles.textContainer}>
        <Text style={styles.heading}>New Appliance Listing</Text>
        <Text style={styles.subtext}>
          Add a new appliance to make it visible for pricing and review.
        </Text>
      </View>
      <Pressable onPress={handleAddPress} style={styles.button}>
        <Text style={styles.buttonText}>Add</Text>
      </Pressable>
    </View>
  );
};

export default AdminBanner;

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9F5FF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  subtext: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
