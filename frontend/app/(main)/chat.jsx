import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getAllConversationPairsForUser } from '../../services/chatService';
import { getSellingItemById } from '../../services/sellingService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';

const ChatScreen = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [applianceChats, setApplianceChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplianceChatData = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const conversationPairs = await getAllConversationPairsForUser(user.id);
      const results = await Promise.allSettled(
        conversationPairs
          .filter(pair => pair?.sellingId) // Skip null or undefined sellingIds
          .map(async ({ sellingId, receiverId }) => {
            try {
              const appliance = await getSellingItemById(sellingId);
              return { appliance, receiverId };
            } catch {
              return null;
            }
          })
      );
      
      const valid = results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);
      setApplianceChats(valid);
    } catch (e) {
      console.log(e);
      setError('Unable to load conversations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchApplianceChatData();
  }, [fetchApplianceChatData]);

  useFocusEffect(
    useCallback(() => {
      fetchApplianceChatData();
    }, [fetchApplianceChatData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplianceChatData(true);
  };

  const navigateToChat = (applianceId, receiverId) => {
    router.push({ pathname: '/contact', params: { sellingId: applianceId, receiverId } });
  };

  const formatPrice = (price) =>
    price != null
      ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price)
      : 'N/A';

  const renderItem = ({ item }) => {
    const { appliance, receiverId } = item;
    if (!appliance) return null;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigateToChat(appliance.id, receiverId)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {appliance.brand} - {appliance.modelNo}
          </Text>
          <Text style={styles.cardSubtitle}>
            Rs. {formatPrice(appliance.price)} • {appliance.condition || 'N/A'}
          </Text>
        </View>
        <View style={styles.iconWrapper}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = useMemo(() => () => (
    <View style={styles.empty}>
      <Ionicons name="chatbubble-outline" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>No Conversations Yet</Text>
      <Text style={styles.emptyText}>
        Once you start a chat, it’ll appear here.
      </Text>
    </View>
  ), []);

  const ErrorState = () => (
    <View style={styles.empty}>
      <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchApplianceChatData()}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Conversations</Text>
        {!loading && applianceChats.length > 0 && (
          <TouchableOpacity onPress={() => fetchApplianceChatData()}>
            <Ionicons name="refresh-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : error ? (
        <ErrorState />
      ) : (
        <FlatList
          data={applianceChats}
          keyExtractor={item => `${item.appliance.id}-${item.receiverId}`}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            applianceChats.length === 0 && styles.listEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: hp(2.5),
    fontWeight: '700',
    color: theme.colors.text,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: hp(1), color: theme.colors.textLight },
  list: { padding: wp(4) },
  listEmpty: { flexGrow: 1 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(1.5),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: hp(2),
    fontWeight: '600',
    color: theme.colors.text,
  },
  cardSubtitle: {
    marginTop: hp(0.5),
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  iconWrapper: {
    width: hp(4),
    height: hp(4),
    borderRadius: hp(2),
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
  emptyTitle: {
    marginTop: hp(2),
    fontSize: hp(2),
    fontWeight: '600',
    color: theme.colors.text,
  },
  emptyText: {
    marginTop: hp(1),
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  errorText: {
    marginTop: hp(1),
    fontSize: hp(1.8),
    color: theme.colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: hp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(8),
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  retryText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
});

export default ChatScreen;
