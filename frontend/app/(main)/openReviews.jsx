import { StyleSheet, Text, View, FlatList, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import BackButton from "../../components/BackButton";
import { hp, wp } from "../../helpers/common";
import ScreenWrapper from "../../components/ScreenWrapper";
import { fetchApplianceDetails, fetchReview } from "../../services/applianceService";
import ReviewCard from "../../components/ReviewCard";
import { getUserData } from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button";
import { supabase } from "../../lib/supabase";

const OpenReviews = () => {
    const { user } = useAuth();
    const { reviewId, headerData } = useLocalSearchParams();
    const [reviews, setReviews] = useState([]);
    const [appliance, setAppliance] = useState(null);
    const router = useRouter();

    useEffect(() => {
        getReviews();
        getApplianceDetails();
        
        const reviewChannel = supabase
            .channel("review")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "review" }, handleReviewEvent)
            .subscribe();

        return () => {
            supabase.removeChannel(reviewChannel);
        };
    }, []);

    const handleReviewEvent = async (payload) => {
        if (payload.eventType === "INSERT" && payload?.new?.id) {
            let newReview = { ...payload.new };
            const res = await getUserData(newReview.userId);
            newReview.user = res.success ? res.data : {};
            setReviews((prevReviews) => [newReview, ...prevReviews]);
        }
    };

    const onWriteReview = () => {
        if (!appliance) {
            Alert.alert("Error", "Appliance details not loaded yet.");
            return;
        }
        router.push({
            pathname: "/writeReviewSection",
            params: {
                Id: appliance?.id,
                applianceDetail: `${appliance?.brand} ${appliance?.type} ${appliance?.modelNumber}`
            }
        });
    };

    const getReviews = async () => {
        try {
            const res = await fetchReview(reviewId);
            if (res.success && res.data.length > 0) {
                setReviews(res.data);
            } else {
                Alert.alert("No Reviews", "No reviews found.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to load reviews.");
        }
    };

    const getApplianceDetails = async () => {
        try {
            const res = await fetchApplianceDetails(reviewId);
            if (res.success) {
                setAppliance(res.data[0]);
            } else {
                Alert.alert("Error", "Failed to load appliances.");
            }
        } catch (error) {
            Alert.alert("Error", "Could not fetch appliance details.");
        }
    };

    return (
        <ScreenWrapper bg="#f8f8f8">
            <View style={styles.header}>
                <BackButton size={hp(3.5)} router={router} />
                <Text style={styles.headerText}>{headerData}</Text>
            </View>

            {reviews.length > 0 ? (
                <FlatList
                    data={reviews}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <ReviewCard
                            image={appliance?.image}
                            title={item.title}
                            model={`Appliance ID: ${item.applianceId}`}
                            reviewer={item?.name || "Unknown"}
                            date={new Date(item.created_at).toDateString()}
                            rating={parseInt(item.rating) || 0}
                            reviewText={item.text}
                        />
                    )}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <Text style={styles.noReviewText}>Loading reviews...</Text>
            )}
            
            <View style={styles.footer}>
                <Button title={'Write review'} onPress={onWriteReview} />
            </View>
        </ScreenWrapper>
    );
};

export default OpenReviews;

const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: hp(2),
      paddingHorizontal: wp(4),
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    headerText: {
      fontSize: hp(2.4),
      fontWeight: "700",
      marginLeft: wp(3),
      color: "#222",
    },
    listContainer: {
      paddingTop: hp(2),
      paddingHorizontal: wp(4),
      paddingBottom: hp(10), // so content doesn't get hidden by footer
    },
    noReviewText: {
      textAlign: "center",
      fontSize: hp(2),
      color: "#888",
      marginTop: hp(6),
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#fff",
      paddingVertical: hp(2),
      paddingHorizontal: wp(5),
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 10,
    },
  });
  