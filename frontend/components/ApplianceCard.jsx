import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getSupaBaseFileUrl } from '../services/imageService';
import { Image } from 'expo-image';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { useRouter } from 'expo-router';

const ApplianceCard = ({ item }) => {
  const router = useRouter();
  const handlePress = () => {
    router.push({
      pathname: "/openApplianceDetail",
      params: { applianceId: item?.id },
    });
  };

  const rating = Number(item.rating);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.cardContent}>
        {/* Image */}
        <View style={styles.imageContainer}>
        <Image
          source={item.image?.[0] ? getSupaBaseFileUrl(item.image[0]) : null}
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

        {/* Info */}
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

export default ApplianceCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    marginBottom: hp(2),
    marginHorizontal: wp(4),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
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
});
