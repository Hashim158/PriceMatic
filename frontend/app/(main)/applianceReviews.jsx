import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { hp, wp } from "../../helpers/common";
import { fetchAllReviewsWithDetails } from "../../services/applianceService";
import ReviewCard from "../../components/ReviewCard";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


const ApplianceReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const router = useRouter();


  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAllReviewsWithDetails();
      if (response.success) {
        setReviews(response.data);
      } else {
        setError(response.error || "Failed to load reviews.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      console.log("Review loading error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [loadReviews])
  );

  const handleRetry = () => loadReviews();

  const renderReviewItem = ({ item }) => (
    <ReviewCard
      image={item.appliances?.image || []}
      title={item.title}
      model={`Model: ${item.appliances?.modelNumber || "N/A"}`}
      reviewer={item.users?.name || "Anonymous"}
      date={item.created_at}
      rating={parseInt(item.rating || "0", 10)}
      reviewText={item.text}
      onPress={() =>
        router.push({
          pathname: "/openApplianceDetail",
          params: { applianceId: item.appliances?.id },
        })
      }
      
    />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-ellipses-outline" size={48} color="#aaa" />
      <Text style={styles.emptyText}>No reviews yet</Text>
      <Text style={styles.emptySubtext}>Be the first to leave a review!</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#5E72E4" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📋 Appliance Reviews</Text>
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReviewItem}
        ListEmptyComponent={renderEmptyList}
        refreshing={loading}
        onRefresh={loadReviews}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    fontSize: hp(3),
    fontWeight: "700",
    color: "#1E293B",
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
    paddingBottom: hp(1),
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(6),
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize: hp(2),
    marginTop: hp(1.5),
    color: "#555",
  },
  listContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(10),
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp(12),
  },
  emptyText: {
    fontSize: hp(2.2),
    fontWeight: "600",
    color: "#333",
    marginTop: hp(1),
  },
  emptySubtext: {
    fontSize: hp(1.9),
    color: "#777",
    marginTop: hp(0.5),
  },
  errorText: {
    fontSize: hp(2.4),
    fontWeight: "700",
    color: "#e74c3c",
    marginTop: hp(2),
  },
  errorSubtext: {
    fontSize: hp(1.9),
    color: "#555",
    textAlign: "center",
    marginTop: hp(0.5),
  },
  retryButton: {
    marginTop: hp(2),
    backgroundColor: "#5E72E4",
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.4),
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: hp(2),
    fontWeight: "600",
  },
});

export default ApplianceReviews;
