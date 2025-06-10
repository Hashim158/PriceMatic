import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  RefreshControl,
  Alert,
  TouchableOpacity
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getUserSellingItems, deleteSellingItem } from '../../services/sellingService';
import SellingItemCard from '../../components/SellingItemCard';
import EmptyState from '../../components/EmptyState';
import { useRouter, useFocusEffect } from 'expo-router';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Footer from '../../components/Footer';

const MyAds = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAds = useCallback(async () => {
    try {
      if (!user?.id) return;
      const items = await getUserSellingItems(user.id);
      setAds(items);
    } catch (error) {
      console.log('Error loading ads:', error);
      Alert.alert('Error', 'Failed to load your ads. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchAds();
    }, [fetchAds])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAds();
  };

  const handleAddNewAd = () => router.push('/sellNow');
  const handleViewAd = (item) => router.push({ pathname: '/viewAd', params: { itemId: item.id } });
  const handleEditAd = (item) => router.push({ pathname: '/edit-ad', params: { itemId: item.id } });
  const handleDeleteAd = (item) => {
    Alert.alert(
      'Delete Ad',
      'Are you sure you want to delete this ad? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSellingItem(item.id);
              setAds(prev => prev.filter(ad => ad.id !== item.id));
              Alert.alert('Success', 'Your ad has been deleted.');
            } catch {
              Alert.alert('Error', 'Failed to delete your ad.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddNewAd}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={hp(2.2)} color="white" />
          <Text style={styles.addButtonText}>New Listing</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {ads.length === 0 ? (
        <EmptyState
          icon="tag"
          iconType="Feather"
          title="No listings yet"
          message="Start selling by creating your first listing"
          buttonTitle="Create Listing"
          onButtonPress={handleAddNewAd}
        />
      ) : (
        <FlatList
          data={ads}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <SellingItemCard
              item={item}
              onPress={() => handleViewAd(item)}
              onEdit={() => handleEditAd(item)}
              onDelete={() => handleDeleteAd(item)}
              showActions
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>

  );
};

export default MyAds;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.5),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: hp(2.6),
    fontWeight: '700',
    color: '#1E2033',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: wp(1.5),
    fontSize: hp(1.8),
    fontWeight: '600',
    color: 'white',
  },
  list: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(10),
  },
});