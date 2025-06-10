import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
  Alert,
  ActivityIndicator,
  StatusBar,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSellingItemById } from '../../services/sellingService';
import { Image } from 'expo-image';
import { getSupaBaseFileUrl } from '../../services/imageService';
import { getUserData } from '../../services/userService';

const { width, height } = Dimensions.get('window');

// Fullscreen Image Viewer Component
const ImageViewer = ({ visible, images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollViewRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (visible && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: currentIndex * width, animated: false });
    }
  }, [visible, currentIndex]);

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentIndex) {
      setCurrentIndex(slideIndex);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scrollViewRef.current?.scrollTo({
        x: (currentIndex - 1) * width,
        animated: true,
      });
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.imageViewerContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        <View style={styles.imageViewerHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={styles.imageCounter}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>



        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.fullscreenScrollView}
        >
          {images.map((imageUrl, index) => (
            <View key={index} style={styles.fullscreenImageContainer}>
              <Image
                source={getSupaBaseFileUrl(imageUrl)}
                style={styles.fullscreenImage}
                contentFit="contain"
                transition={200}
              />
            </View>
          ))}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.navigationControls}>
            <TouchableOpacity
              style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
              disabled={currentIndex === 0}
              onPress={goToPrevious}
            >
              <Ionicons name="chevron-back" size={28} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, currentIndex === images.length - 1 && styles.navButtonDisabled]}
              disabled={currentIndex === images.length - 1}
              onPress={goToNext}
            >
              <Ionicons name="chevron-forward" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default function OpenOldAppliance() {
  const { OldApplianceId } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollViewRef = useRef(null);
  
  // State for fullscreen image viewer
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [initialViewerIndex, setInitialViewerIndex] = useState(0);

  useEffect(() => {
    if (OldApplianceId) {
      loadItem(OldApplianceId);
    }
  }, [OldApplianceId]);

  const loadItem = async (id) => {
    try {
      const data = await getSellingItemById(id);
      setItem(data);

      if (data?.userId) {
        const result = await getUserData(data.userId);
        if (result.success) {
          setUserData(result.data);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load appliance details');
    } finally {
      setLoading(false);
    }
  };

  const shareAppliance = async () => {
    if (!item) return;
    try {
      await Share.share({
        message: `Check out this ${item.brand} ${item.modelNo} for $${item.price}`,
        title: `${item.brand} ${item.modelNo}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share this appliance');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== activeImageIndex) {
      setActiveImageIndex(slideIndex);
    }
  };

  const scrollToImage = (index) => {
    setActiveImageIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  // Open fullscreen image viewer
  const openImageViewer = (index) => {
    setInitialViewerIndex(index);
    setImageViewerVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Item not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {item.pictures && item.pictures.length > 0 ? (
              item.pictures.map((pic, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  onPress={() => openImageViewer(index)}
                >
                  <Image
                    source={getSupaBaseFileUrl(pic)}
                    style={styles.image}
                    contentFit="cover"
                    transition={300}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={[styles.image, styles.noImage]}>
                <Ionicons name="image-outline" size={48} color="#cbd5e1" />
                <Text style={styles.noImageText}>No Image Available</Text>
              </View>
            )}
          </ScrollView>

          {item.pictures && item.pictures.length > 1 && (
            <View style={styles.pagination}>
              {item.pictures.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.paginationDot,
                    activeImageIndex === index && styles.paginationDotActive,
                  ]}
                  onPress={() => scrollToImage(index)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              {item.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              )}
              <Text style={styles.brand}>{item.brand}</Text>
              <Text style={styles.model}>{item.modelNo}</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>PKR {parseFloat(item.price).toFixed(2)}</Text>
            </View>
          </View>

          {/* Appliance Info */}
          <View style={styles.infoSection}> 
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#64748b" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Condition</Text>
                  <Text style={styles.infoValue}>{item.condition}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={18} color="#64748b" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Year</Text>
                  <Text style={styles.infoValue}>{item.yearOfPurchase}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="color-palette-outline" size={18} color="#64748b" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Color</Text>
                  <Text style={styles.infoValue}>{item.color}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={18} color="#64748b" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Listed</Text>
                  <Text style={styles.infoValue}>{formatDate(item.created_at)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>

          {/* Seller Info */}
          {userData && (
            <View style={styles.sellerSection}>
              <Text style={styles.sectionTitle}>Seller Information</Text>
              <View style={styles.sellerInfo}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerAvatarText}>
                    {userData.name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>{userData.name}</Text>
                  {userData.location && (
                    <View style={styles.sellerDetailRow}>
                      <Ionicons name="location-outline" size={16} color="#64748b" />
                      <Text style={styles.sellerDetailText}>{userData.location}</Text>
                    </View>
                  )}
                  {userData.phoneNumber && (
                    <View style={styles.sellerDetailRow}>
                      <Ionicons name="call-outline" size={16} color="#64748b" />
                      <Text style={styles.sellerDetailText}>{userData.phoneNumber}</Text>
                    </View>
                  )}
                  {userData.email && (
                    <View style={styles.sellerDetailRow}>
                      <Ionicons name="mail-outline" size={16} color="#64748b" />
                      <Text style={styles.sellerDetailText}>{userData.email}</Text>
                    </View>
                  )}
                  {userData.gender && (
                    <View style={styles.sellerDetailRow}>
                      <Ionicons name="person-outline" size={16} color="#64748b" />
                      <Text style={styles.sellerDetailText}>{userData.gender}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Action buttons */}
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={shareAppliance}>
          <Ionicons name="share-social-outline" size={22} color="#475569" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() =>
            router.push({
              pathname: '/contact',
              params: {
                sellingId: item.id,
                receiverId: item.userId,
              },
            })
          }
        >
          <Text style={styles.contactButtonText}>Contact Seller</Text>
          <Ionicons name="chevron-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Fullscreen Image Viewer Modal */}
      {item.pictures && item.pictures.length > 0 && (
        <ImageViewer
          visible={imageViewerVisible}
          images={item.pictures}
          initialIndex={initialViewerIndex}
          onClose={() => setImageViewerVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  imageContainer: {
    height: width * 0.85,
    backgroundColor: '#f1f5f9',
  },
  image: {
    width,
    height: width * 0.85,
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  noImageText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  brand: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  model: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 4,
  },
  priceContainer: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  descriptionSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  sellerSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 80, // Add extra space for fixed buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  sellerInfo: {
    flexDirection: 'row',
  },
  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sellerAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3b82f6',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  sellerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerDetailText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  shareButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
  },
  
  // Fullscreen Image Viewer Styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
  },
  imageCounter: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fullscreenScrollView: {
    flex: 1,
  },
  fullscreenImageContainer: {
    width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width,
    height: height * 0.8,
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  navButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(60, 60, 60, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  searchBarContainer: {
  padding: 16,
  paddingBottom: 0,
  backgroundColor: '#f8fafc',
},
searchBar: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f1f5f9',
  padding: 12,
  borderRadius: 10,
},
searchBarText: {
  fontSize: 16,
  color: '#94a3b8',
},

});