import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { hp, wp } from "../helpers/common";
import { Image } from "expo-image";
import { getSupaBaseFileUrl } from "../services/imageService";

const PopularApplianceCard = ({ item, router }) => {
  const handlePress = () => {
    router.push({
      pathname: "/openApplianceDetail",
      params: { applianceId: item?.id },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          <Image
            source={getSupaBaseFileUrl(item.image[0])}
            style={styles.image}
          />
        </View>

        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.model}>{item.modelNumber}</Text>
        <Text style={styles.price}>PKR {item.Price}</Text>

        <View style={styles.rating}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Text
              key={index}
              style={[
                styles.star,
                index < item.rating ? styles.filledStar : styles.emptyStar,
              ]}
            >
              ★
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PopularApplianceCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: hp(2),
    marginHorizontal: wp(2),
    width: wp(42),
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderColor: "#eee",
    borderWidth: 1,
  },
  imageWrapper: {
    width: wp(34),
    height: hp(15),
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f8f9fb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1),
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  brand: {
    fontSize: hp(1.8),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
    textAlign: "center",
  },
  model: {
    fontSize: hp(1.6),
    color: "#777",
    marginBottom: 4,
    textAlign: "center",
  },
  price: {
    fontSize: hp(1.9),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  rating: {
    flexDirection: "row",
  },
  star: {
    fontSize: hp(1.8),
    marginHorizontal: 1,
  },
  filledStar: {
    color: "#f5c518",
  },
  emptyStar: {
    color: "#dcdcdc",
  },
});
