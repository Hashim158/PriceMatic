// components/AdminApplianceCard.jsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { getSupaBaseFileUrl } from '../services/imageService';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const AdminApplianceCard = ({
  item,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const rating = Number(item.rating);
  const mainImage = item.image?.[0];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.cardContent}>
        {/* Image & Actions */}
        <View style={styles.imageContainer}>
          {mainImage ? (
            <Image
              source={ getSupaBaseFileUrl(mainImage) }
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Feather name="image" size={hp(5)} color="#C5C7D3" />
            </View>
          )}

          {rating > 4.5 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Top Rated</Text>
            </View>
          )}

          {showActions && (
            <View style={styles.actionsOverlay}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={onEdit}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="edit-2" size={hp(2)} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={onDelete}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="trash-2" size={hp(2)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {item.modelNumber}
          </Text>

          <View style={styles.detailsRow}>
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.rating}>
              ★ {isNaN(rating) ? 'N/A' : rating.toFixed(1)}
            </Text>
          </View>

          <Text style={styles.price}>PKR {item.Price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AdminApplianceCard;

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
  placeholderImage: {
    width: wp(30),
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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
  actionsOverlay: {
    position: 'absolute',
    top: hp(1),
    right: wp(1),
    flexDirection: 'row',
  },
  actionButton: {
    width: hp(4),
    height: hp(4),
    borderRadius: hp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(1),
  },
  editButton: {
    backgroundColor: 'rgba(35, 116, 225, 0.85)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
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
