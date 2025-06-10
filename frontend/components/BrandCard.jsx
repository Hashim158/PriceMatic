import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import { Image } from "expo-image";
import { getSupaBaseFileUrl } from "../services/imageService";
import { fetchBrandDetails } from "../services/brandsService";


const textStyles = {
  color: theme.colors.dark,
  fontSize: hp(1.75),
};

const BrandCard = ({
  item, // Pass individual brand object here
  hasShadow = true,
  router, // Pass the navigation/router object here
}) => {
  if (!item) {
    return <Text>Loading...</Text>; // Handle missing `item`
  }

  const shadowStyles = {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  };

  const handlePress = async () => {
    try {
      const res = await fetchBrandDetails(item?.id);
      if (res.success && res.data.length > 0) {
        router.push({
          pathname: "/openBrandDetail",
          params: { brandId: item?.id, brandName: item?.name },
        });
      } else {
        alert('No appliances available for this brand.');
      }
    } catch (error) {
      console.log("Navigation error:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, hasShadow && shadowStyles]}
      onPress={handlePress}
      activeOpacity={0.8} // Add feedback on press
    >
      <View style={styles.content}>
        {/* Brand Logo */}
        {item?.logoImage && (
          <Image
            source={getSupaBaseFileUrl(item.logoImage)}
            style={styles.logo}
            contentFit="contain"
          />
        )}
        {/* Brand Name */}
        {item?.name && <Text style={styles.brandName}>{item.name}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default BrandCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 0,
    borderRadius: theme.radius.xxl * 1.1,
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
    marginHorizontal: hp(0.5),
  },
  content: {
    alignItems: "center",
  },
  logo: {
    height: hp(8), // Adjust size for the logo
    width: hp(8),
    marginBottom: 8,
  },
  brandName: {
    fontSize: hp(1.4),
    color: theme.colors.dark,
    fontWeight: "600",
    textAlign: "center",
  },
});
