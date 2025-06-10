import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchBrands } from '../../services/brandsService';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';

const AllBrands = () => {
  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBrands = async () => {
    try {
      const res = await fetchBrands();
      if (res.success) {
        setBrands(res.data);
      } else {
        console.log("Failed to fetch brands:", res.error);
      }
    } catch (error) {
      console.log("Error loading brands:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleBrandPress = (brandId) => {
    router.push({
      pathname: '/openBrandDetail',
      params: { brandId },
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBrands();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.header}>
        <Text style={styles.heading}>Brands Directory</Text>
        <Text style={styles.subheading}>Explore our featured partners</Text>
      </View>

      <FlatList
        data={brands}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleBrandPress(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <Text style={styles.brandName}>{item.name}</Text>
              {item.category && (
                <Text style={styles.brandCategory}>{item.category}</Text>
              )}
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No brands available</Text>
          </View>
        }
      />
    </View>
  );
};

export default AllBrands;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: wp(5),
    paddingTop: hp(4),
    paddingBottom: hp(2),
    backgroundColor: theme.colors.background,
  },
  heading: {
    fontSize: hp(3),
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: hp(1.8),
    color: theme.colors.secondary,
    marginTop: hp(0.5),
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hp(2.5),
    marginBottom: hp(2),
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  brandName: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: theme.colors.text,
  },
  brandCategory: {
    fontSize: hp(1.6),
    color: theme.colors.secondary,
    marginTop: hp(0.5),
  },
  cardArrow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: hp(2.5),
    fontWeight: '300',
    color: theme.colors.primary,
  },
  emptyContainer: {
    paddingVertical: hp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.secondary,
  },
});