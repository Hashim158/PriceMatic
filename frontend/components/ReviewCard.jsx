import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { hp, wp } from "../helpers/common";
import { getSupaBaseFileUrl } from "../services/imageService";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const ReviewCard = ({
  image,
  title,
  model,
  reviewer,
  date,
  rating,
  reviewText,
  onPress,
}) => {
  const scaleValue = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const handlePressIn = () => {
    scaleValue.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scaleValue.value = withTiming(1, { duration: 150 });
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const applianceId = model?.replace("Appliance ID: ", "");

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View entering={FadeInUp.duration(400).springify()}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.userInfoContainer}>
                <View style={styles.userIconContainer}>
                  <Text style={styles.userInitial}>
                    {reviewer?.[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
                <View style={styles.reviewerDetails}>
                  <Text style={styles.reviewerName}>{reviewer || "Anonymous"}</Text>
                  <Text style={styles.reviewDate}>{formattedDate}</Text>
                </View>
              </View>
              <View style={styles.ratingContainer}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Text
                    key={index}
                    style={index < rating ? styles.starFilled : styles.starEmpty}
                  >
                    ★
                  </Text>
                ))}
              </View>
            </View>

            {/* Title and Text */}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.reviewText} numberOfLines={4} ellipsizeMode="tail">
              {reviewText}
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
              {image && (
                <Image
                  source={getSupaBaseFileUrl(image[0] || "default.jpg")}
                  style={styles.applianceImage}
                  contentFit="cover"
                  transition={300}
                />
              )}
              <View style={styles.applianceInfo}>
                <Text style={styles.applianceId}>
                  <Feather name="tag" size={12} color="#666" /> {applianceId}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: wp(4),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardContent: {
    padding: wp(4),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userIconContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "#5E72E4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2),
  },
  userInitial: {
    color: "#fff",
    fontSize: hp(1.8),
    fontWeight: "600",
  },
  reviewerDetails: {
    justifyContent: "center",
  },
  reviewerName: {
    fontSize: hp(1.8),
    fontWeight: "600",
    color: "#333",
  },
  reviewDate: {
    fontSize: hp(1.5),
    color: "#888",
    marginTop: hp(0.2),
  },
  ratingContainer: {
    flexDirection: "row",
  },
  starFilled: {
    color: "#FFD700",
    fontSize: hp(2),
    marginLeft: wp(0.7),
  },
  starEmpty: {
    color: "#E0E0E0",
    fontSize: hp(2),
    marginLeft: wp(0.7),
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: "700",
    color: "#1A1F36",
    marginBottom: hp(1.5),
  },
  reviewText: {
    fontSize: hp(1.8),
    lineHeight: hp(2.5),
    color: "#4F566B",
    marginBottom: hp(2),
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: "#F0F2F5",
  },
  applianceImage: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(2),
    backgroundColor: "#f5f5f5",
  },
  applianceInfo: {
    marginLeft: wp(3),
  },
  applianceId: {
    fontSize: hp(1.6),
    color: "#666",
    fontWeight: "500",
  },
});
