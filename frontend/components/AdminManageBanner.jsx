import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AdminManageBanner = () => {
  const router = useRouter();

  const handleManagePress = () => {
    router.push('/adminAppliances'); // route to your management screen
  };

  return (
    <View style={styles.banner}>
      <Ionicons name="list-outline" size={28} color="#007BFF" />
      <View style={styles.textContainer}>
        <Text style={styles.heading}>Manage Appliances</Text>
        <Text style={styles.subtext}>
          View, edit or remove existing appliance listings.
        </Text>
      </View>
      <Pressable onPress={handleManagePress} style={styles.button}>
        <Text style={styles.buttonText}>Manage</Text>
      </Pressable>
    </View>
  );
};

export default AdminManageBanner;

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
