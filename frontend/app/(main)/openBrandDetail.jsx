import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchBrandDetails } from '../../services/brandsService';
import ApplianceCard from '../../components/ApplianceCard';
import Loading from '../../components/Loading';
import { hp, wp } from '../../helpers/common';

const BrandAppliancesPage = () => {
  const router = useRouter();
  const { brandId, brandName } = useLocalSearchParams();
  const [appliances, setAppliances] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getBrandsDetails();
  }, []);

  const getBrandsDetails = async () => {
    setLoading(true);
    try {
      const res = await fetchBrandDetails(brandId);
    
      if (res.success) {
        // Sort appliances by their type (category)
        const sortedData = res.data.sort((a, b) => {
          if (a.type < b.type) return -1;
          if (a.type > b.type) return 1;
          return 0;
        });
      
        setAppliances(sortedData);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(sortedData.map(item => item.type))];
        setCategories(uniqueCategories);
      } else {
        Alert.alert('Error', 'Failed to load appliances.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    getBrandsDetails();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const filteredAppliances = selectedCategory === 'All' 
    ? appliances 
    : appliances.filter(item => item.type === selectedCategory);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.selectedCategoryButton
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <Text 
        style={[
          styles.categoryButtonText,
          selectedCategory === item && styles.selectedCategoryButtonText
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No appliances found.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={getBrandsDetails}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.listHeader}>
      
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton size={hp(3)} router={router} />
          <Text style={styles.headerText}>{brandName} Appliances</Text>
        </View>
        
        {loading ? (
          <Loading />
        ) : (
          <FlatList
            data={filteredAppliances}
            renderItem={({ item }) => <ApplianceCard item={item} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={EmptyListComponent}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default BrandAppliancesPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerText: {
    fontSize: hp(2.5),
    fontWeight: '700',
    marginLeft: wp(2),
    color: '#333',
  },
  listHeader: {
    paddingHorizontal: wp(2),
    paddingTop: hp(1),
  },
  subHeader: {
    fontSize: hp(1.8),
    color: '#666',
    marginBottom: hp(1.5),
    lineHeight: hp(2.5),
  },
  categoriesList: {
    paddingBottom: hp(1),
  },
  categoryButton: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.7),
    marginRight: wp(2),
    backgroundColor: '#f5f5f5',
    borderRadius: hp(2.5),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategoryButton: {
    backgroundColor: '#0066cc',
    borderColor: '#0055aa',
  },
  categoryButtonText: {
    fontSize: hp(1.6),
    color: '#555',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: wp(2),
    paddingBottom: wp(2),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: hp(3),
  },
  emptyText: {
    fontSize: hp(2),
    color: '#777',
    marginBottom: hp(2),
  },
  retryButton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: '#0066cc',
    borderRadius: hp(1),
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: hp(1.6),
  },
});