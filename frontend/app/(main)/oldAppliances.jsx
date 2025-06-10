import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllSellingItems } from '../../services/sellingService';
import OldApplianceCard from '../../components/OldApplianceCard';
import { useRouter } from 'expo-router';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const APPLIANCE_TYPES = ['All', 'Refrigerator', 'Washing Machine', 'Microwave', 'AC', 'Heater'];
const CONDITION_OPTIONS = ['All', 'New', 'Like New', 'Used', 'For Parts'];

const OldAppliances = () => {
  const { user } = useAuth();
  const [appliances, setAppliances] = useState([]);
  const [filteredAppliances, setFilteredAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minPriceInput, setMinPriceInput] = useState('0');
  const [maxPriceInput, setMaxPriceInput] = useState('1000');
  const [brandFilter, setBrandFilter] = useState('');
  const [availableBrands, setAvailableBrands] = useState([]);

  useEffect(() => {
    loadAppliances();
  }, []);

  useEffect(() => {
    // Apply filters whenever they change
    applyFilters();
  }, [selectedCategory, selectedCondition, minPrice, maxPrice, brandFilter]);

  // Extract unique brands from appliances
  useEffect(() => {
    if (appliances.length > 0) {
      const brands = [...new Set(appliances.map(item => item.brand))].filter(Boolean);
      setAvailableBrands(brands);
    }
  }, [appliances]);

  const loadAppliances = async () => {
    try {
      setError(null);
      const data = await getAllSellingItems();
      const filteredData = data.filter(item => item.userId !== user?.id);
      setAppliances(filteredData);
      setFilteredAppliances(filteredData); // Initially show all appliances
      
      // Find the max price to set slider
      if (filteredData.length > 0) {
        const highestPrice = Math.max(...filteredData.map(item => parseFloat(item.price) || 0));
        const roundedHighestPrice = Math.ceil(highestPrice);
        setMaxPrice(roundedHighestPrice);
        setMaxPriceInput(roundedHighestPrice.toString());
      }
    } catch (err) {
      console.log('Failed to load appliances:', err);
      setError('Failed to load appliances. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appliances];
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by condition
    if (selectedCondition !== 'All') {
      filtered = filtered.filter(item => item.condition === selectedCondition);
    }
    
    // Filter by price range
    filtered = filtered.filter(item => {
      const price = parseFloat(item.price) || 0;
      return price >= minPrice && price <= maxPrice;
    });
    
    // Filter by brand (if provided)
    if (brandFilter.trim() !== '') {
      const searchTerm = brandFilter.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.brand && item.brand.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredAppliances(filtered);
  };

  const handlePriceSubmit = () => {
    // Convert input strings to numbers and apply
    const min = parseFloat(minPriceInput) || 0;
    const max = parseFloat(maxPriceInput) || 1000;
    
    // Ensure min <= max
    if (min > max) {
      setMinPrice(max);
      setMaxPrice(max);
      setMinPriceInput(max.toString());
      setMaxPriceInput(max.toString());
    } else {
      setMinPrice(min);
      setMaxPrice(max);
    }
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedCondition('All');
    setMinPrice(0);
    setMinPriceInput('0');
    const highestPrice = Math.max(...appliances.map(item => parseFloat(item.price) || 0));
    const roundedHighestPrice = Math.ceil(highestPrice || 1000);
    setMaxPrice(roundedHighestPrice);
    setMaxPriceInput(roundedHighestPrice.toString());
    setBrandFilter('');
    setFilteredAppliances(appliances);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppliances();
  };

  const handleAppliancePress = (item) => {
    router.push({
      pathname: "openOldAppliance",
      params: { OldApplianceId: item?.id }
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    if (!showFilters) {
      // Reset input fields to current values when opening modal
      setMinPriceInput(minPrice.toString());
      setMaxPriceInput(maxPrice.toString());
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading appliances...</Text>
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAppliances}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Available Appliances</Text>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={toggleFilters}
        >
          <Ionicons name="filter" size={22} color="#3b82f6" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filter Pills */}
      {(selectedCategory !== 'All' || 
        selectedCondition !== 'All' || 
        brandFilter.trim() !== '' ||
        minPrice > 0 || 
        maxPrice < Math.max(...appliances.map(item => parseFloat(item.price) || 0))) && (
        <View style={[styles.filterPillsContainer, styles.filterPillsContent]}>
          {selectedCategory !== 'All' && (
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>Category: {selectedCategory}</Text>
              <TouchableOpacity 
                onPress={() => setSelectedCategory('All')} 
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Ionicons name="close-circle" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          )}
          
          {selectedCondition !== 'All' && (
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>Condition: {selectedCondition}</Text>
              <TouchableOpacity 
                onPress={() => setSelectedCondition('All')} 
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Ionicons name="close-circle" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          )}
          
          {brandFilter.trim() !== '' && (
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>Brand: {brandFilter}</Text>
              <TouchableOpacity 
                onPress={() => setBrandFilter('')} 
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Ionicons name="close-circle" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          )}
          
          {(minPrice > 0 || maxPrice < Math.max(...appliances.map(item => parseFloat(item.price) || 0))) && (
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>Price: PKR{minPrice} - PKR{maxPrice}</Text>
              <TouchableOpacity 
                onPress={() => {
                  setMinPrice(0);
                  setMinPriceInput('0');
                  const highestPrice = Math.max(...appliances.map(item => parseFloat(item.price) || 0));
                  setMaxPrice(Math.ceil(highestPrice));
                  setMaxPriceInput(Math.ceil(highestPrice).toString());
                }} 
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Ionicons name="close-circle" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.filterPill, styles.resetPill]} 
            onPress={resetFilters}
          >
            <Text style={[styles.filterPillText, styles.resetPillText]}>Reset All</Text>
          </TouchableOpacity>
        </ View>
      )}

      <FlatList
        data={filteredAppliances}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <OldApplianceCard 
            item={item} 
            onPress={() => handleAppliancePress(item)} 
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No appliances match your filters</Text>
            <TouchableOpacity 
              style={styles.resetFiltersButton} 
              onPress={resetFilters}
            >
              <Text style={styles.resetFiltersText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleFilters}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Appliances</Text>
              <TouchableOpacity onPress={toggleFilters}>
                <Ionicons name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipGroup}>
                    {APPLIANCE_TYPES.map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.chip,
                          selectedCategory === type && styles.chipSelected
                        ]}
                        onPress={() => setSelectedCategory(type)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedCategory === type && styles.chipTextSelected
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Condition Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Condition</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipGroup}>
                    {CONDITION_OPTIONS.map(condition => (
                      <TouchableOpacity
                        key={condition}
                        style={[
                          styles.chip,
                          selectedCondition === condition && styles.chipSelected
                        ]}
                        onPress={() => setSelectedCondition(condition)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedCondition === condition && styles.chipTextSelected
                          ]}
                        >
                          {condition}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Brand Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Brand</Text>
        
                {availableBrands.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandChips}>
                    <View style={styles.chipGroup}>
                      {availableBrands.map(brand => (
                        <TouchableOpacity
                          key={brand}
                          style={[
                            styles.chip,
                            brandFilter === brand && styles.chipSelected
                          ]}
                          onPress={() => setBrandFilter(brand)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              brandFilter === brand && styles.chipTextSelected
                            ]}
                          >
                            {brand}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.priceInputContainer}>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.priceInputLabel}>Min Price (PKR)</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={minPriceInput}
                      onChangeText={setMinPriceInput}
                      keyboardType="numeric"
                      placeholder="0"
                      onBlur={handlePriceSubmit}
                      returnKeyType="done"
                    />
                  </View>
                  <View style={styles.priceInputDivider} />
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.priceInputLabel}>Max Price (PKR)</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={maxPriceInput}
                      onChangeText={setMaxPriceInput}
                      keyboardType="numeric"
                      placeholder="1000"
                      onBlur={handlePriceSubmit}
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => {
                  handlePriceSubmit();
                  toggleFilters();
                }}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};

export default OldAppliances;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for footer
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 16,
  },
  resetFiltersButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetFiltersText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginRight: 10,
    marginBottom: 10,
  },
  chipSelected: {
    backgroundColor: '#3b82f6',
  },
  chipText: {
    color: '#64748b',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  brandInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  brandChips: {
    marginTop: 8,
  },
  // Price Input Styles (New)
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  priceInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#334155',
  },
  priceInputDivider: {
    width: 20,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  resetButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 10,
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Filter Pills
  filterPillsContainer: {
    paddingHorizontal: 8,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  
  filterPillsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 10,
    paddingHorizontal: 8,
    rowGap: 10,
    columnGap: 10,
  },
  
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  filterPillText: {
    color: '#3b82f6',
    fontWeight: '500',
    fontSize: 13,
    marginRight: 6,
  },
  resetPill: {
    backgroundColor: '#fee2e2',
  },
  resetPillText: {
    color: '#ef4444',
  },
});