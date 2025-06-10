import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';

import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import Loading from '../../components/Loading';
import ArrowDown from '../../assets/icons/ArrowDown';
import ArrowRight from '../../assets/icons/ArrowRight';

import { fetchApplianceDetails, fetchApplianceSpecs } from '../../services/applianceService';
import { getSupaBaseFileUrl } from '../../services/imageService';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OpenApplianceDetail = () => {
    const router = useRouter();
    const { applianceId } = useLocalSearchParams();

    const [appliance, setAppliance] = useState([]);
    const [specs, setSpecs] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        colors: false,
        features: false,
        specifications: false
    });

    useEffect(() => {
        getApplianceDetails();
    }, []);
    

    const getApplianceDetails = async () => {
        setLoading(true);
        const res = await fetchApplianceDetails(applianceId);
        if (res.success) {
            setAppliance(res.data[0]);
            getApplianceSpecs(res.data[0].type); // fetch correct table based on type
        } else {
            Alert.alert('Error', 'Failed to load appliance details.');
            setLoading(false);
        }
    };
    
    const getApplianceSpecs = async (category) => {
        const res = await fetchApplianceSpecs(applianceId, category);
        if (res.success) {
            setSpecs(res.data[0]);
        } else {
            Alert.alert('Error', 'Failed to load specifications.');
        }
        setLoading(false);
    };
    

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const onCompare = () => {
        let CompareData = appliance?.brand + " " + appliance?.modelNumber;
        router.push({
            pathname: "/openCompareSection",
            params: {firstId: appliance?.id, appliancedata: CompareData, type: appliance?.type}
        });
    };

    const onShowReviews = () => {
        router.push({
            pathname: "/openReviews",
            params: {reviewId: appliance?.id, headerData: appliance?.brand + ' ' + appliance?.type}
        });
    };

    const renderImage = ({ item, index }) => (
        <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => setCurrentImageIndex(index)}
            style={styles.imageContainer}
        >
            <Image
                source={getSupaBaseFileUrl(item)}
                style={styles.applianceImage}
                contentFit="contain"
                transition={300}
            />
        </TouchableOpacity>
    );

    const renderImageIndicator = () => {
        if (!appliance.image || appliance.image.length <= 1) return null;
        
        return (
            <View style={styles.pagination}>
                {appliance.image.map((_, index) => (
                    <View 
                        key={index} 
                        style={[
                            styles.paginationDot,
                            currentImageIndex === index && styles.paginationDotActive
                        ]}
                    />
                ))}
            </View>
        );
    };

    const formatKey = (key) =>
        key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());

    const renderSectionHeader = (title, section) => (
        <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(section)}
            activeOpacity={0.7}
        >
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={[
                styles.arrowContainer,
                expandedSections[section] && styles.arrowContainerActive
            ]}>
                <ArrowDown
                    width={hp(2.2)}
                    height={hp(2.2)}
                    color={expandedSections[section] ? theme.colors.primary : '#555'}
                />
            </View>
        </TouchableOpacity>
    );
    
    const renderActionButton = (title, icon, onPress) => (
        <TouchableOpacity
            style={styles.actionButton}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.actionButtonText}>{title}</Text>
            {icon}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <ScreenWrapper bg={theme.colors.background}>
                <View style={styles.loaderContainer}>
                    <Loading />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bg={theme.colors.background}>
            {/* Header */}
            <View style={styles.header}>
                <BackButton size={hp(2.6)} router={router} color={theme.colors.text} />
                <Text style={styles.headerText} numberOfLines={1}>
                    {appliance.brand} {appliance.type}
                </Text>
                <View style={styles.headerPlaceholder} />
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {/* Image Gallery */}
                <View style={styles.galleryContainer}>
                    <FlatList
                        data={appliance.image}
                        renderItem={renderImage}
                        keyExtractor={(_, index) => index.toString()}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const newIndex = Math.round(
                                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
                            );
                            setCurrentImageIndex(newIndex);
                        }}
                    />
                    {renderImageIndicator()}
                </View>

                {/* Product Details */}
                <View style={styles.productDetailsContainer}>
                    <View style={styles.ratingPriceRow}>
                        <View style={styles.ratingContainer}>
                            {Array(5)
                                .fill()
                                .map((_, index) => (
                                    <Text
                                        key={index}
                                        style={
                                            index < appliance.rating
                                                ? styles.starFilled
                                                : styles.starEmpty
                                        }
                                    >
                                        ★
                                    </Text>
                                ))}
                            <Text style={styles.ratingText}>
                                {appliance.rating}/5
                            </Text>
                        </View>
                        <Text style={styles.price}>PKR {appliance.Price}</Text>
                    </View>

                    <Text style={styles.productTitle}>
                        {appliance.brand} {appliance.type} {appliance.modelNumber}
                    </Text>
                    
                    <View style={styles.basicSpecsContainer}>
                        <Text style={styles.basicSpecs}>
                            {appliance.capacity} • {appliance.color}
                        </Text>
                    </View>
                </View>

                {/* Available Colors Section */}
                <View style={styles.card}>
                    {renderSectionHeader('Available Colors', 'colors')}
                    
                    {expandedSections.colors && (
                        <View style={styles.sectionContent}>
                            <View style={styles.colorsRow}>
                                {[appliance.color].map((color, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.8}
                                        style={[
                                            styles.colorCircle,
                                            { backgroundColor: color.toLowerCase() },
                                            index === 0 && styles.selectedColorCircle,
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Features Section */}
                <View style={styles.card}>
                    {renderSectionHeader('Key Features', 'features')}
                    
                    {expandedSections.features && (
                        <View style={styles.sectionContent}>
                            {appliance.features && appliance.features.length > 0 ? (
                                <View style={styles.featuresGrid}>
                                    {appliance.features.map((feature, index) => (
                                        <View key={index} style={styles.featureItem}>
                                            <Text style={styles.featureText}>{feature}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noDataText}>No features available</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Specifications Section */}
                <View style={styles.card}>
                    {renderSectionHeader('Specifications', 'specifications')}
                    
                    {expandedSections.specifications && (
                        <View style={styles.sectionContent}>
                            {specs && Object.keys(specs).length > 0 ? (
                                <View style={styles.specsTable}>
                                    {Object.entries(specs)
                                        .filter(([key]) => key !== 'id' && key !== 'applianceId')
                                        .map(([key, value], index) => (
                                            <View key={index} style={[
                                                styles.specRow,
                                                index % 2 === 0 && styles.specRowAlternate
                                            ]}>
                                                <Text style={styles.specLabel}>{formatKey(key)}</Text>
                                                <Text style={styles.specValue}>
                                                    {value === null || value === undefined ? 'N/A' : value.toString()}
                                                </Text>
                                            </View>
                                        ))}
                                </View>
                            ) : (
                                <Text style={styles.noDataText}>No specifications available</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    {renderActionButton('Compare Products', 
                        <ArrowRight width={hp(2.2)} height={hp(2.2)} color="#fff" />, 
                        onCompare
                    )}
                    
                    {renderActionButton('View Reviews', 
                        <ArrowRight width={hp(2.2)} height={hp(2.2)} color="#fff" />, 
                        onShowReviews
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default OpenApplianceDetail;

const styles = StyleSheet.create({
    // Layout
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: hp(4),
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.8),
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerText: {
        fontSize: hp(2.2),
        fontWeight: '600',
        color: theme.colors.text,
        flex: 1,
        textAlign: 'center',
    },
    headerPlaceholder: {
        width: hp(2.6),
    },
    
    // Image Gallery
    galleryContainer: {
        width: '100%',
        backgroundColor: 'white',
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: hp(35),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    applianceImage: {
        width: '90%',
        height: '90%',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp(1.5),
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D0D0D0',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: theme.colors.primary,
        width: 12,
        height: 8,
        borderRadius: 4,
    },
    
    // Product Details
    productDetailsContainer: {
        backgroundColor: 'white',
        padding: wp(5),
        marginBottom: hp(1.2),
    },
    ratingPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    price: {
        fontSize: hp(2.8),
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    productTitle: {
        fontSize: hp(2.3),
        fontWeight: '700',
        color: '#212121',
        marginBottom: hp(0.8),
    },
    basicSpecsContainer: {
        marginTop: hp(1),
    },
    basicSpecs: {
        fontSize: hp(1.8),
        color: '#555',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starFilled: {
        color: '#FFD700',
        fontSize: hp(2),
        marginRight: 1,
    },
    starEmpty: {
        color: '#E0E0E0',
        fontSize: hp(2),
        marginRight: 1,
    },
    ratingText: {
        marginLeft: wp(2),
        color: '#666',
        fontSize: hp(1.7),
    },
    
    // Section Cards
    card: {
        backgroundColor: 'white',
        borderRadius: wp(3),
        marginHorizontal: wp(4),
        marginBottom: hp(1.2),
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp(4),
    },
    sectionTitle: {
        fontSize: hp(2),
        fontWeight: '600',
        color: '#212121',
    },
    arrowContainer: {
        width: hp(3.5),
        height: hp(3.5),
        borderRadius: hp(1.75),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        transition: 'transform 0.3s',
    },
    arrowContainerActive: {
        backgroundColor: '#f0f7ff',
        transform: [{ rotate: '180deg' }],
    },
    sectionContent: {
        padding: wp(4),
        paddingTop: 0,
    },
    
    // Colors Section
    colorsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(3),
        paddingVertical: hp(1),
    },
    colorCircle: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColorCircle: {
        borderColor: theme.colors.primary,
    },
    
    // Features Section
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
    },
    featureItem: {
        backgroundColor: '#f7f9fc',
        borderRadius: wp(2),
        padding: wp(3),
        paddingVertical: hp(1.2),
        marginBottom: hp(1),
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
        width: '100%',
    },
    featureText: {
        fontSize: hp(1.8),
        color: '#444',
    },
    
    // Specifications Section
    specsTable: {
        width: '100%',
    },
    specRow: {
        flexDirection: 'row',
        paddingVertical: hp(1.4),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    specRowAlternate: {
        backgroundColor: '#fafafa',
    },
    specLabel: {
        flex: 1,
        fontSize: hp(1.8),
        fontWeight: '500',
        color: '#444',
        paddingRight: wp(2),
    },
    specValue: {
        flex: 1,
        fontSize: hp(1.8),
        color: '#666',
        textAlign: 'right',
    },
    
    // Action Buttons
    actionButtonsContainer: {
        marginTop: hp(1),
        paddingHorizontal: wp(4),
        gap: hp(1.2),
    },
    actionButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: wp(2.5),
        paddingVertical: hp(1.8),
        paddingHorizontal: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    actionButtonText: {
        fontSize: hp(2),
        fontWeight: '600',
        color: 'white',
    },
    
    // Other
    noDataText: {
        fontSize: hp(1.8),
        color: '#999',
        textAlign: 'center',
        padding: hp(2),
    },
});