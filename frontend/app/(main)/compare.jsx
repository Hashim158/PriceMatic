import { StyleSheet, Text, View, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import BackButton from '../../components/BackButton';
import { hp, wp } from '../../helpers/common';
import ScreenWrapper from '../../components/ScreenWrapper';
import { fetchApplianceSpecs, fetchtwoApplianceDetails } from '../../services/applianceService';
import { Image } from 'expo-image';
import { getSupaBaseFileUrl } from '../../services/imageService';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

const Compare = () => {
    const { id1, id2 } = useLocalSearchParams();
    const [idOneDetails, setIdOneDetails] = useState(null);
    const [idTwoDetails, setIdTwoDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [idOneSpecs, setIdOneSpecs] = useState(null);
    const [idTwoSpecs, setIdTwoSpecs] = useState(null);
    const [activeSection, setActiveSection] = useState('all');

    useEffect(() => {
        if (id1 && id2) {
            fetchData();
        }
    }, [id1, id2]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [res1, res2] = await Promise.all([
                fetchtwoApplianceDetails(id1),
                fetchtwoApplianceDetails(id2),
            ]);
    
            if (res1.success && res2.success) {
                const data1 = res1.data[0] || res1.data;
                const data2 = res2.data[0] || res2.data;
                console.log(data1);
    
                setIdOneDetails(data1);
                setIdTwoDetails(data2);
    
                const [resp1, resp2] = await Promise.all([
                    fetchApplianceSpecs(id1, data1?.type),
                    fetchApplianceSpecs(id2, data2?.type),
                ]);
    
                if (resp1.success && resp2.success) {
                    console.log(resp1);
                    setIdOneSpecs(resp1.data[0]);
                    setIdTwoSpecs(resp2.data[0]);
                } else {
                    Alert.alert('Error', 'Failed to load specifications.');
                }
            } else {
                Alert.alert('Error', 'Failed to load appliance details.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while fetching data.');
        }
        setLoading(false);
    };
    
    const formatValue = (val) => {
        if (val === true || val === "true") return "Yes";
        if (val === false || val === "false") return "No";
        if (val === null || val === undefined || val === 'null') return "N/A";
        return val.toString();
      };
      

    // Function to highlight differences between specs
    const isDifferent = (spec1, spec2) => {
        if (spec1 && spec2 && spec1 !== spec2) {
            return true;
        }
        return false;
    };

    // Function to filter specs based on active section
    const filterSpecs = () => {
        if (activeSection === 'all') {
            return Object.keys(idOneSpecs || {}).filter(key => key !== 'id' && key !== 'applianceId');
        } else if (activeSection === 'differences') {
            return Object.keys(idOneSpecs || {})
                .filter(key => key !== 'id' && key !== 'applianceId')
                .filter(key => isDifferent(idOneSpecs[key], idTwoSpecs[key]));
        }
        return [];
    };

    if (loading) {
        return (
            <ScreenWrapper bg={theme.colors.background || "#f8f9fa"}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary || "#0000ff"} />
                    <Text style={styles.loadingText}>Loading comparison data...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bg={theme.colors.background || "#f8f9fa"}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <BackButton size={hp(3.2)} router={router} />
                        <View style={styles.headerTextContainer}>
                            {idOneDetails && idTwoDetails && (
                                <Text style={styles.headerText} numberOfLines={2} ellipsizeMode="tail">
                                    {idOneDetails.brand} {idOneDetails.modelNumber} VS {idTwoDetails.brand} {idTwoDetails.modelNumber}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Image Comparison */}
                    <View style={styles.imageContainer}>
                        {[idOneDetails, idTwoDetails].map((details, index) => (
                            <View key={index} style={styles.productContainer}>
                                <View style={styles.productImageWrapper}>
                                    <Image 
                                        source={getSupaBaseFileUrl(details?.image?.[0] || '')} 
                                        style={styles.image}
                                        contentFit="contain"
                                        transition={300}
                                    />
                                </View>
                                <View style={styles.productInfoContainer}>
                                    <Text style={styles.productBrand}>
                                        {details?.brand || 'N/A'} {details?.type || ''}
                                    </Text>
                                    <Text style={styles.productModel} numberOfLines={1} ellipsizeMode="tail">
                                        {details?.modelNumber || 'N/A'}
                                    </Text>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.priceCurrency}>PKR </Text>
                                        <Text style={styles.productPrice}>{details?.Price?.replace('$', '') || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Filter Options */}
                    {idOneSpecs && idTwoSpecs && (
                        <View style={styles.filterContainer}>
                            <TouchableOpacity 
                                style={[styles.filterButton, activeSection === 'all' && styles.activeFilterButton]}
                                onPress={() => setActiveSection('all')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.filterButtonText, activeSection === 'all' && styles.activeFilterText]}>
                                    All Specifications
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.filterButton, activeSection === 'differences' && styles.activeFilterButton]}
                                onPress={() => setActiveSection('differences')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.filterButtonText, activeSection === 'differences' && styles.activeFilterText]}>
                                    Key Differences
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Specifications Table */}
                    <View style={styles.comparisonContainer}>
                        <View style={styles.comparisonHeader}>
                            <Text style={styles.comparisonTitle}>
                                Product Specifications
                            </Text>
                            <View style={styles.comparisonSubtitle}>
                                <FontAwesome name="info-circle" size={hp(1.8)} color={theme.colors.secondary || "#666"} />
                                <Text style={styles.comparisonSubtitleText}>
                                    {activeSection === 'differences' ? 'Showing only differences' : 'Showing all specifications'}
                                </Text>
                            </View>
                        </View>

                        {idOneSpecs && idTwoSpecs && (
                            <View style={styles.specsContainer}>
                                {/* Table Header */}
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.headerValue, {textAlign: 'center'}]}>
                                        {idOneDetails?.brand || 'Product 1'}
                                    </Text>
                                    <Text style={styles.headerKey}>Specification</Text>
                                    <Text style={[styles.headerValue, {textAlign: 'center'}]}>
                                        {idTwoDetails?.brand || 'Product 2'}
                                    </Text>
                                </View>

                                {/* Table Rows */}
                                {filterSpecs().map((key, index) => {
                                    const different = isDifferent(idOneSpecs[key], idTwoSpecs[key]);
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                                    return (
                                        <View 
                                            key={key} 
                                            style={[
                                                styles.specRow, 
                                                index % 2 === 0 && styles.alternateRow,
                                                different && styles.differentRow
                                            ]}
                                        >
                                            <Text 
                                                style={[
                                                    styles.specValue, 
                                                    different && styles.highlightText
                                                ]}
                                                numberOfLines={2}
                                            >
                                                {formatValue(idOneSpecs[key])}
                                            </Text>
                                            <Text style={styles.specKey} numberOfLines={2} ellipsizeMode="tail">
                                                {formattedKey}
                                            </Text>
                                            <Text 
                                                style={[
                                                    styles.specValue, 
                                                    different && styles.highlightText
                                                ]}
                                                numberOfLines={2}
                                            >
                                                {formatValue(idTwoSpecs[key])}
                                            </Text>
                                        </View>
                                    );
                                })}


                                {/* Empty State */}
                                {filterSpecs().length === 0 && (
                                    <View style={styles.emptyContainer}>
                                        <FontAwesome name="exchange" size={hp(4)} color="#ccc" />
                                        <Text style={styles.emptyText}>
                                            No differences found between these products
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default Compare;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: hp(2.5),
        backgroundColor: theme.colors.background || '#f8f9fa',
        paddingBottom: hp(10),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(3),
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: wp(2),
    },
    headerText: {
        fontSize: hp(2.4),
        fontWeight: '700',
        color: theme.colors.text || '#222',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    
    // Product Images Section
    imageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(3),
    },
    productContainer: {
        width: wp(43),
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
    productImageWrapper: {
        height: hp(16),
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: hp(1.5),
    },
    image: {
        width: '100%',
        height: '100%',
    },
    productInfoContainer: {
        padding: hp(1.5),
        backgroundColor: theme.colors.card || '#f0f4f8',
    },
    productBrand: {
        fontSize: hp(1.8),
        fontWeight: 'bold',
        color: theme.colors.text || '#333',
    },
    productModel: {
        fontSize: hp(1.7),
        color: theme.colors.secondaryText || '#777',
        marginTop: hp(0.3),
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(0.8),
    },
    priceCurrency: {
        fontSize: hp(1.5),
        fontWeight: '600',
        color: theme.colors.primary || '#0a84ff',
        marginRight: 1,
    },
    productPrice: {
        fontSize: hp(1.9),
        color: theme.colors.primary || '#0a84ff',
        fontWeight: '700',
    },
    
    // Filter Section
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(2.5),
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: hp(0.5),
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 1,
    },
    filterButton: {
        flex: 1,
        paddingVertical: hp(1.2),
        alignItems: 'center',
        borderRadius: 8,
    },
    activeFilterButton: {
        backgroundColor: theme.colors.primary || '#0a84ff',
    },
    filterButtonText: {
        fontSize: hp(1.7),
        fontWeight: '500',
        color: theme.colors.secondaryText || '#555',
    },
    activeFilterText: {
        color: '#fff',
        fontWeight: '600',
    },
    
    // Comparison Section
    comparisonContainer: {
        marginTop: hp(0.5),
    },
    comparisonHeader: {
        marginBottom: hp(2),
    },
    comparisonTitle: {
        fontSize: hp(2.3),
        fontWeight: 'bold',
        color: theme.colors.text || '#222',
    },
    comparisonSubtitle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(0.8),
    },
    comparisonSubtitleText: {
        fontSize: hp(1.6),
        color: theme.colors.secondary || '#666',
        marginLeft: hp(0.8),
    },
    
    // Specs Table
    specsContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary || '#0a84ff',
        paddingVertical: hp(1.4),
        paddingHorizontal: wp(2),
    },
    headerKey: {
        fontSize: hp(1.7),
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        flex: 1.2,
    },
    headerValue: {
        fontSize: hp(1.7),
        fontWeight: '600',
        color: '#fff',
        flex: 1,
    },
    specRow: {
        flexDirection: 'row',
        paddingVertical: hp(1.4),
        paddingHorizontal: wp(2),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    alternateRow: {
        backgroundColor: theme.colors.backgroundAlt || '#f9f9f9',
    },
    differentRow: {
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.accent || '#4CAF50',
    },
    specKey: {
        fontSize: hp(1.7),
        fontWeight: '500',
        color: theme.colors.text || '#444',
        textAlign: 'center',
        flex: 1.2,
    },
    specValue: {
        fontSize: hp(1.6),
        color: theme.colors.secondaryText || '#555',
        textAlign: 'center',
        flex: 1,
    },
    highlightText: {
        fontWeight: '600',
        color: theme.colors.accent || '#4CAF50',
    },
    
    // Loading and Empty States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: hp(2),
        fontSize: hp(1.8),
        color: theme.colors.secondaryText || '#666',
    },
    emptyContainer: {
        padding: hp(4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: hp(1.5),
        fontSize: hp(1.8),
        color: '#888',
        textAlign: 'center',
    }
});