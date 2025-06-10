import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getSupaBaseFileUrl } from '../services/imageService';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { hp, wp } from '../helpers/common';
import { useAuth } from '../contexts/AuthContext';

const SellingItemCard = ({ item, onPress, onEdit, onDelete, showActions = false }) => {
  const {user} = useAuth()
  const mainImage = item.pictures?.[0];
  const formattedPrice = item.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.imageContainer}>
        {mainImage ? (
          <Image
            source={getSupaBaseFileUrl(mainImage)}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Feather name="image" size={hp(5)} color="#C5C7D3" />
          </View>
        )}

        <View style={styles.priceTag}>
          <Text style={styles.priceText}>Rs. {formattedPrice}</Text>
        </View>

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

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>{item.brand}</Text>

        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}

        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Feather name="map-pin" size={hp(1.5)} color="#7B7F9E" />
          <Text style={styles.detailText}>
            {user?.location || 'Location not specified'}
          </Text>
        </View>

          <View style={styles.detailItem}>
            <Feather name="calendar" size={hp(1.5)} color="#7B7F9E" />
            <Text style={styles.detailText}>
              {new Date(item.created_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SellingItemCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: hp(20),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    bottom: hp(1.5),
    left: wp(3),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.7),
    borderRadius: 6,
  },
  priceText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: hp(1.8),
  },
  actionsOverlay: {
    position: 'absolute',
    top: hp(1.5),
    right: wp(3),
    flexDirection: 'row',
  },
  actionButton: {
    width: hp(4),
    height: hp(4),
    borderRadius: hp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(2),
  },
  editButton: {
    backgroundColor: 'rgba(35, 116, 225, 0.85)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
  },
  contentContainer: {
    padding: hp(2),
  },
  title: {
    fontWeight: '700',
    fontSize: hp(2.2),
    color: '#1E2033',
    marginBottom: hp(0.6),
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: hp(0.8),
  },
  categoryText: {
    fontSize: hp(1.5),
    color: '#0284c7',
    fontWeight: '600',
  },
  description: {
    color: '#4A4B57',
    fontSize: hp(1.7),
    lineHeight: hp(2.3),
    marginBottom: hp(1.5),
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(0.5),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: wp(1),
    color: '#7B7F9E',
    fontSize: hp(1.5),
  },
});
