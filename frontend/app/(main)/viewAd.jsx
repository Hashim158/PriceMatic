import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { getSellingItemById, deleteSellingItem } from '../../services/sellingService';
import { getSupaBaseFileUrl } from '../../services/imageService';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const ViewAd = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { itemId } = route.params;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const itemData = await getSellingItemById(itemId);
        console.log(itemData);
        setItem(itemData);
      } catch (error) {
        Alert.alert('Error', 'Failed to load the ad details.');
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [itemId]);

  const handleDelete = () => {
    Alert.alert('Delete Ad', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await deleteSellingItem(item.id);
            Alert.alert('Deleted', 'Ad successfully deleted.');
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete the ad.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${item.brand} for Rs. ${item.price}`,
        title: `${item.brand}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share the item.');
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < item.pictures.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const isOwner = user?.id === item?.userId;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#64748b' }}>Ad not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {item.pictures?.length > 0 ? (
          <>
            <Image
              source={getSupaBaseFileUrl(item.pictures[currentImageIndex])}
              style={styles.image}
              contentFit="cover"
            />
            <View style={styles.imageNav}>
              <TouchableOpacity
                onPress={handlePrevImage}
                disabled={currentImageIndex === 0}
                style={[styles.navBtn, currentImageIndex === 0 && styles.navDisabled]}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.counter}>
                {currentImageIndex + 1} / {item.pictures.length}
              </Text>
              <TouchableOpacity
                onPress={handleNextImage}
                disabled={currentImageIndex === item.pictures.length - 1}
                style={[
                  styles.navBtn,
                  currentImageIndex === item.pictures.length - 1 && styles.navDisabled,
                ]}
              >
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={48} color="#94a3b8" />
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{item.brand}</Text>
            <Text style={styles.price}>Rs. {parseFloat(item.price).toFixed(2)}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
              <Ionicons name="share-social-outline" size={20} color="#1e293b" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            {isOwner && (
              <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="trash-outline" size={20} color="#b91c1c" />
                <Text style={[styles.actionText, { color: '#b91c1c' }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>{item.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.grid}>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Condition</Text>
              <Text style={styles.value}>{item.condition}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{item.category}</Text>
            </View>
            {item.size && (
              <View style={styles.detailItem}>
                <Text style={styles.label}>Size</Text>
                <Text style={styles.value}>{item.size}</Text>
              </View>
            )}
            {item.color && (
              <View style={styles.detailItem}>
                <Text style={styles.label}>Color</Text>
                <Text style={styles.value}>{item.color}</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Text style={styles.label}>Listed</Text>
              <Text style={styles.value}>
                {item.created_at && !isNaN(new Date(item.created_at))
                  ? new Date(item.created_at).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Date not available'}
              </Text>
            </View>

          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionText}>{user.location || 'Not specified'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ViewAd;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: width * 0.85,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 8,
    color: '#94a3b8',
  },
  imageNav: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 30,
  },
  navDisabled: {
    opacity: 0.4,
  },
  counter: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'center',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  brand: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    marginLeft: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#0c4a6e',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});
