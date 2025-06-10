// screens/AdminAppliances.jsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AdminApplianceCard from '../../components/AdminApplianceCard';
import {
  fetchAllAppliances,
  deleteAppliance,
} from '../../services/applianceService';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import ScreenWrapper from '../../components/ScreenWrapper';

const AdminAppliances = () => {
  const router = useRouter();
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // load list
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAppliances();
      setAppliances(data);
    } catch (err) {
      console.log('[AdminAppliances] fetchAll', err);
      Alert.alert('Error', err.message || 'Could not load appliances');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  // navigate to edit screen
  const handleEdit = (item) => {
    router.push({
      pathname: '/editAppliance',
      params: { applianceId: item.id },
    });
  };

  // navigate to create screen
  const handleAddNew = () => {
    router.push('/addAppliance');
  };

  // confirm & delete
  const handleDelete = (item) => {
    Alert.alert(
      'Confirm Delete',
      `Remove "${item.brand} ${item.modelNumber}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAppliance(item.id);
              Alert.alert('Success', 'Appliance removed successfully');
              load();
            } catch (err) {
              console.log('[AdminAppliances] delete', err);
              Alert.alert('Error', err.message || 'Delete failed');
            }
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="inbox" size={hp(10)} color={theme.colors.textLight} />
      <Text style={styles.emptyTitle}>No Appliances Found</Text>
      <Text style={styles.emptySubtitle}>
        Start adding inventory to your catalog
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleAddNew}
        activeOpacity={0.8}
      >
        <Text style={styles.emptyButtonText}>Add New Appliance</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Appliance Inventory</Text>
      <Text style={styles.headerSubtitle}>
        {appliances.length} {appliances.length === 1 ? 'item' : 'items'} in catalog
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScreenWrapper bg="white">
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <FlatList
        data={appliances}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.list,
          appliances.length === 0 && styles.emptyList,
        ]}
        ListHeaderComponent={appliances.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => (
          <AdminApplianceCard
            item={item}
            showActions={true}
            onPress={() => {
              router.push({
                pathname: '/openApplianceDetail',
                params: { applianceId: item.id },
              });
            }}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      {appliances.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddNew}
          activeOpacity={0.9}
        >
          <Feather name="plus" size={hp(3)} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
    </ScreenWrapper>
  );
};

export default AdminAppliances;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  list: {
    paddingBottom: hp(10),
  },
  emptyList: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#FFFFFF',
    marginBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: '#EEEFF3',
  },
  headerTitle: {
    fontSize: hp(2.4),
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: hp(0.5),
  },
  headerSubtitle: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: hp(2.4),
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  emptySubtitle: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginBottom: hp(4),
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: theme.radius.lg,
    elevation: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: hp(1.8),
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: hp(3),
    right: wp(5),
    backgroundColor: theme.colors.primary,
    width: hp(6.5),
    height: hp(6.5),
    borderRadius: hp(3.25),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});