import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A reusable empty state component that shows when there's no content to display
 * 
 * @param {Object} props - Component props
 * @param {string} props.icon - Ionicons name for the icon to display
 * @param {string} props.title - Title text to display
 * @param {string} props.message - Message text to display
 * @param {string} props.buttonTitle - Text to display on the button
 * @param {Function} props.onButtonPress - Function to call when the button is pressed
 * @returns {JSX.Element} The EmptyState component
 */
const EmptyState = ({ 
  icon, 
  title, 
  message, 
  buttonTitle, 
  onButtonPress 
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={80} color="#bdbdbd" style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {buttonTitle && onButtonPress && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onButtonPress}
        >
          <Text style={styles.buttonText}>{buttonTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#0000ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default EmptyState;