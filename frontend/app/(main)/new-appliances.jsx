import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { fetchAllPopularAppliances } from '../../services/applianceService';
import { getSupaBaseFileUrl } from '../../services/imageService';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';

const ApplianceCard = ({ item }) => {
    const router = useRouter();
    const rating = Number(item.rating);
  
    const handlePress = () => {
      router.push({
        pathname: '/openApplianceDetail',
        params: { applianceId: item?.id },
      });
    };
  
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={handlePress}>
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            <Image
              source={item?.image?.[0] ? getSupaBaseFileUrl(item.image[0]) : null}
               style={styles.image}
              contentFit="cover"
              transition={300}
            />
            {rating > 4.5 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>Top Rated</Text>
              </View>
            )}
          </View>
  
          <View style={styles.info}>
            <Text style={styles.brand}>{item.brand}</Text>
            <Text style={styles.name} numberOfLines={1}>{item.modelNumber}</Text>
  
            <View style={styles.detailsRow}>
              <Text style={styles.type}>{item.type}</Text>
              <Text style={styles.rating}>★ {isNaN(rating) ? 'N/A' : rating.toFixed(1)}</Text>
            </View>
  
            <Text style={styles.price}>PKR {item.Price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No appliances found</Text>
    <Text style={styles.emptySubText}>Check back later for new arrivals</Text>
  </View>
);

const PopularAppliances = () => {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAppliances = async () => {
      try {
        const res = await fetchAllPopularAppliances();
        if (res.success) {
          setAppliances(res.data);
         // console.log(res.data);
        } else {
          setError(res.error || 'Failed to fetch appliances');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.log('Failed to fetch appliances:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAppliances();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text style={styles.errorSubText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Popular Appliances</Text>
      </View>

      <FlatList
        data={appliances}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ApplianceCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: hp(2),
    paddingHorizontal: wp(4),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  heading: {
    fontSize: hp(2.4),
    fontWeight: '700',
    color: theme.colors.primary,
  },
  viewAllText: {
    fontSize: hp(1.6),
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: hp(2),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    marginBottom: hp(2),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    height: hp(15),
  },
  imageContainer: {
    position: 'relative',
    width: wp(30),
  },
  image: {
    width: wp(30),
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  badgeContainer: {
    position: 'absolute',
    top: hp(1),
    left: wp(1),
    backgroundColor: theme.colors.primary,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.4),
    borderRadius: theme.radius.full,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: hp(1.2),
    fontWeight: '600',
  },
  info: {
    flex: 1,
    padding: wp(3),
    justifyContent: 'center',
  },
  brand: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: '500',
    marginBottom: hp(0.2),
  },
  name: {
    fontSize: hp(1.8),
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  type: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    backgroundColor: '#F5F5F7',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: theme.radius.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: hp(1.5),
    fontWeight: '600',
    color: '#FDCC0D',
  },
  price: {
    fontSize: hp(2),
    fontWeight: '700',
    color: theme.colors.primary,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: hp(4),
  },
  emptyText: {
    fontSize: hp(2),
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  emptySubText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: hp(2),
  },
  errorText: {
    fontSize: hp(2),
    fontWeight: '600',
    color: theme.colors.error || '#FF3B30',
    marginBottom: hp(1),
  },
  errorSubText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});

export default PopularAppliances;
