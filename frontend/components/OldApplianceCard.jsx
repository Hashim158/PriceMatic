import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { getSupaBaseFileUrl } from '../services/imageService';
import { getUserData } from '../services/userService';
import { hp, wp } from '../helpers/common';
import { useAuth } from '../contexts/AuthContext';

const OldApplianceCard = ({ item, onPress, onToggleSave, isSaved }) => {
  const mainImage = item.pictures?.[0];
  const imageCount = item.pictures?.length || 0;
  const { user } = useAuth();

  const [userLocation, setUserLocation] = useState('Local');

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (item?.userId) {
        const res = await getUserData(item.userId);
        if (res.success && res.data?.location) {
          setUserLocation(res.data.location);
        }
      }
    };

    fetchUserLocation();
  }, [item?.userId]);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => onPress(item)}
        activeOpacity={0.95}
      >
        {/* Left side - Image */}
        <View style={styles.imageWrapper}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => onToggleSave && onToggleSave(item)}
          >
            <Ionicons name="star" size={18} color="white" style={styles.starIcon} />
          </TouchableOpacity>

          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>new</Text>
            </View>
          )}

          <Image
            source={mainImage ? getSupaBaseFileUrl(mainImage) : null}
            style={styles.image}
            contentFit="cover"
            placeholder="L7F+IW00xuDgYOX-V9bbYI?*xtWB~Vx]R+jZ"
            transition={300}
          />

          <View style={styles.imageCountBadge}>
            <Ionicons name="images" size={14} color="white" />
            <Text style={styles.imageCountText}>{imageCount}</Text>
          </View>
        </View>

        {/* Right side - Content */}
        <View style={styles.contentContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.title} numberOfLines={2}>
              {item.brand} {item.modelNo}
            </Text>
          </View>

          <Text style={styles.price}>
            PKR {parseFloat(item.price).toLocaleString()} 
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={18} color="#64748b" />
              <Text style={styles.infoText}>{item.yearOfPurchase}</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="pulse-outline" size={18} color="#64748b" />
              <Text style={styles.infoText}>{item.condition}</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="flash-outline" size={18} color="#64748b" />
              <Text style={styles.infoText}>{item.category || "Electronics"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={18} color="#64748b" />
              <Text style={styles.infoText}>{userLocation}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default OldApplianceCard;

// Styles remain unchanged

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: wp(2),
    marginBottom: hp(1.5),
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: wp(4),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  imageWrapper: {
    width: wp(30),
    height: wp(30),
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
  },
  favoriteButton: {
    position: 'absolute',
    top: hp(1),
    left: wp(1),
    zIndex: 10,
    backgroundColor: '#ef4444',
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    marginLeft: 0.5,
  },
  newBadge: {
    position: 'absolute',
    top: wp(14),
    right: 0,
    backgroundColor: '#2563eb',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    zIndex: 2,
    borderTopLeftRadius: wp(2),
    borderBottomLeftRadius: wp(2),
  },
  newBadgeText: {
    color: 'white',
    fontSize: wp(3.2),
    fontWeight: '600',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: hp(1),
    left: wp(1),
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  imageCountText: {
    color: 'white',
    fontSize: wp(3.2),
    marginLeft: wp(1),
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: wp(3),
    justifyContent: 'space-between',
  },
  titleSection: {
    flexDirection: 'row',
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    paddingRight: wp(8),
  },
  heartButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  price: {
    fontSize: hp(2.4),
    fontWeight: '700',
    color: '#334155',
    marginTop: hp(0.5),
    marginBottom: hp(1),
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: hp(0.8),
  },
  infoText: {
    fontSize: hp(1.7),
    color: '#64748b',
    marginLeft: wp(1),
  },
});