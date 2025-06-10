import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import ScreenWrapper from "../../components/ScreenWrapper";
import Input from "../../components/Input";
import BrandCard from "../../components/BrandCard";
import PopularApplianceCard from "../../components/PopularApplianceCard";
import Loading from "../../components/Loading";
import Footer from "../../components/Footer";

import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { fetchBrands } from "../../services/brandsService";
import { fetchPopularAppliances } from "../../services/applianceService";
import OldAppliancesBanner from "../../components/OldAppliancesBanner";
import OldAppliancePriceBanner from "../../components/OldAppliancePriceBanner";
import CompareAppliancesBanner from "../../components/CompareAppliancesBanner";
import ApplianceReviewsBanner from "../../components/ApplianceReviewsBanner";

const Home = () => {
  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [popularAppliances, setPopularAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [brandsRes, appsRes] = await Promise.all([
          fetchBrands(),
          fetchPopularAppliances(),
        ]);

        if (brandsRes.success) setBrands(brandsRes.data);
        else Alert.alert("Error", "Failed to load brands.");

        if (appsRes.success) setPopularAppliances(appsRes.data);
        else Alert.alert("Error", "Failed to load popular appliances.");
      } catch (e) {
        console.log(e);
        Alert.alert("Error", "Failed to load data. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.loaderContainer}>
          <Loading />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appNameText}>PriceMatic</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/profile")}
          >
            <Ionicons
              name="person-circle-outline"
              size={hp(4.2)}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerText}>Find Your Perfect Appliance</Text>
          <Text style={styles.bannerSubText}>Great deals on top brands</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.inputContainer}>
        <Input
          placeholder="Search for Appliances"
          placeholderTextColor={theme.colors.textLight}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => router.push("/search")}
          returnKeyType="search"
          containerStyle={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.searchIcon}
          onPress={() => router.push("/search")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="search-outline"
            size={hp(3)}
            color={theme.colors.primaryDark}
          />
        </TouchableOpacity>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Brands */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse By Brand</Text>
              <TouchableOpacity onPress={() => router.push("/all-brands")}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {brands.length > 0 ? (
              <FlatList
                data={brands}
                numColumns={4}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <BrandCard item={item} router={router} />
                )}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContainer}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.emptyText}>No brands available</Text>
            )}
          </View>

          {/* Popular */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular New Appliances</Text>
              <TouchableOpacity onPress={() => router.push("/new-appliances")}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {popularAppliances.length > 0 ? (
              <FlatList
                data={popularAppliances}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <PopularApplianceCard item={item} router={router} />
                )}
                contentContainerStyle={styles.popularListContainer}
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <Text style={styles.emptyText}>No popular appliances available</Text>
            )}
          </View>

          {/* Other Sections */}
          <OldAppliancesBanner />
          <OldAppliancePriceBanner />
          <CompareAppliancesBanner />
          <ApplianceReviewsBanner />
        </View>
      </ScrollView>

      <Footer />
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    paddingBottom: hp(2),
  },
  header: {
    paddingTop: hp(0.5),
    paddingHorizontal: wp(5),
    paddingBottom: hp(0.5),
    backgroundColor: "white",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  appNameText: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  profileButton: {
    padding: hp(0.5),
  },
  bannerContainer: {
    marginHorizontal: wp(5),
    height: hp(12),
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    marginBottom: hp(1),
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    paddingHorizontal: wp(4),
  },
  bannerText: {
    color: "white",
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    marginBottom: hp(0.5),
  },
  bannerSubText: {
    color: "white",
    fontSize: hp(1.8),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(5),
    marginTop: hp(0.5),
    marginBottom: hp(1),
  },
  searchInput: {
    flex: 1,
    height: hp(6),
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.background,
  },
  searchIcon: {
    marginLeft: wp(2),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.textLight,
    borderRadius: theme.radius.xxl,
    height: hp(5.8),
    width: hp(5.8),
  },
  section: {
    marginBottom: hp(3),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
    marginHorizontal: wp(5),
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
  },
  listContainer: {
    paddingHorizontal: wp(3),
    paddingBottom: hp(1),
    flexGrow: 0,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: hp(2.5),
  },
  popularListContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(1),
  },
  emptyText: {
    textAlign: "center",
    color: theme.colors.textLight,
    marginVertical: hp(2),
    fontSize: hp(1.8),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
