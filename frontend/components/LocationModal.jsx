import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

const LocationModal = ({
  visible,
  onClose,
  cities,
  onSelect,
  filter,
  onFilterChange
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select City</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search cities..."
            value={filter}
            onChangeText={onFilterChange}
            autoCapitalize="none"
          />
          <ScrollView style={styles.list}>
            {cities.length > 0 ? (
              cities.map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => onSelect(city)}
                  style={styles.option}
                >
                  <Text style={styles.optionText}>{city}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noResults}>No cities found</Text>
            )}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LocationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    width: '90%',
    borderRadius: 16,
    maxHeight: '80%'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center'
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12
  },
  list: {
    maxHeight: 300
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937'
  },
  noResults: {
    textAlign: 'center',
    padding: 16,
    color: '#888'
  },
  cancel: {
    marginTop: 16,
    alignItems: 'center'
  },
  cancelText: {
    fontSize: 16,
    color: '#666'
  }
});
