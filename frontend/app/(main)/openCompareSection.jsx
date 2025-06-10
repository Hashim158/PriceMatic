import { StatusBar, StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import { hp, wp } from '../../helpers/common';
import { FontAwesome } from '@expo/vector-icons';
import Button from '../../components/Button';
import Home from '../../assets/icons/Home';
import { fetchAllAppliance } from '../../services/applianceService';
import { theme } from '../../constants/theme';

const OpenCompareSection = () => {
    const [loading, setLoading] = useState(false);
    const { firstId, appliancedata, type } = useLocalSearchParams();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [secondId, setSecondId] = useState(null);
    const [chooseProduct1, setChooseProduct1] = useState(!!firstId);
    const [chooseProduct2, setChooseProduct2] = useState(false);
    const [product1, setProduct1] = useState(firstId ? { id: firstId, label: appliancedata } : null);
    const [modalTarget, setModalTarget] = useState(null);

    useEffect(() => {
        if (modalVisible) getAppliances();
    }, [modalVisible]);

    const onComparePress = () => {
        if (chooseProduct1 && chooseProduct2) {
            router.push({
                pathname: "/compare",
                params: { id1: product1.id, id2: secondId }
            });
        } else {
            Alert.alert("Selection Required", 'Please choose both products to compare.', [{ text: 'OK', style: 'default' }]);
        }
    };

    const getAppliances = async () => {
        setLoading(true);
        try {
            let category = type || '';
    
            if (modalTarget === 'second' && product1?.id) {
                // Find category from product1 to fetch similar ones
                const selected = products.find(p => p.id === product1.id);
                if (selected?.type) {
                    category = selected.type;
                }
            }
    
            const res = await fetchAllAppliance(category);
    
            if (res.success) {
                setProducts(res.data);
            } else {
                Alert.alert('Error', 'Failed to load appliances.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while fetching data.');
        }
        setLoading(false);
    };
    

    const openModal = (target) => {
        setModalTarget(target);
        setModalVisible(true);
    };

    const selectProduct = (product) => {
        if (modalTarget === 'first') {
            setProduct1({ id: product.id, label: `${product.brand} ${product.modelNumber}` });
            setChooseProduct1(true);
        } else {
            setSecondId(product.id);
            setSelectedProduct(`${product.brand} ${product.modelNumber}`);
            setChooseProduct2(true);
        }
        setModalVisible(false);
    };

    return (
        <ScreenWrapper bg={theme.colors.background || "#f8f9fa"}>
            <StatusBar style="dark" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <BackButton size={hp(3.5)} router={router} />
                    <Text style={styles.headerText}>Product Comparison</Text>
                </View>

                <View style={styles.compareContainer}>
                    <View style={styles.compareBox}>
                        <View style={styles.iconContainer}>
                            <Home size={hp(2.8)} />
                        </View>
                        <View style={styles.compareTextContainer}>
                            <Text style={styles.label}>Compare</Text>
                            <TouchableOpacity
                                style={[styles.inputBox, !chooseProduct1 && styles.inputBoxPlaceholder]}
                                onPress={() => openModal('first')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.selectedText, !chooseProduct1 && styles.placeholderText]} numberOfLines={1} ellipsizeMode="tail">
                                    {product1?.label || "Select Product 1"}
                                </Text>
                                <FontAwesome name="chevron-down" size={hp(1.8)} color={theme.colors.text || "#555"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.compareBox}>
                        <View style={styles.iconContainer}>
                            <Home size={hp(2.8)} strokeWidth={1.6} />
                        </View>
                        <View style={styles.compareTextContainer}>
                            <Text style={styles.label}>With</Text>
                            <TouchableOpacity
                                style={[styles.inputBox, !chooseProduct2 && styles.inputBoxPlaceholder]}
                                onPress={() => openModal('second')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.selectedText, !chooseProduct2 && styles.placeholderText]} numberOfLines={1} ellipsizeMode="tail">
                                    {selectedProduct || "Select Product 2"}
                                </Text>
                                <FontAwesome name="chevron-down" size={hp(1.8)} color={theme.colors.text || "#555"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Button title={'Compare Products'} loading={loading} onPress={onComparePress} style={styles.compareButton} />

                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select a Product</Text>
                                <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setModalVisible(false)}>
                                    <FontAwesome name="times" size={hp(2.2)} color="#555" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.divider} />
                            <FlatList
                                data={products.filter(item => modalTarget === 'first' ? item.id !== secondId : item.id !== product1?.id)}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.modalItem} onPress={() => selectProduct(item)} activeOpacity={0.7}>
                                        <Text style={styles.modalItemText}>{item.brand} {item.modelNumber}</Text>
                                        <FontAwesome name="chevron-right" size={hp(1.8)} color={theme.colors.primary || "#3478f6"} />
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.flatListContent}
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <FontAwesome name="inbox" size={hp(5)} color="#ccc" />
                                        <Text style={styles.emptyText}>No products available</Text>
                                    </View>
                                }
                            />
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScreenWrapper>
    );
};

export default OpenCompareSection;

const styles = StyleSheet.create({
    container: { flex: 1, padding: hp(2.5), backgroundColor: theme.colors.background || '#f8f9fa' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(3) },
    headerText: { fontSize: hp(2.8), fontWeight: '700', marginLeft: hp(1.5), color: theme.colors.text || '#222' },
    compareContainer: { marginBottom: hp(4) },
    compareBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: hp(2.2), borderRadius: 16, marginBottom: hp(2), borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    iconContainer: { width: hp(5), height: hp(5), borderRadius: hp(2.5), backgroundColor: theme.colors.primaryLight || '#ebf1fc', justifyContent: 'center', alignItems: 'center' },
    compareTextContainer: { marginLeft: hp(2), flex: 1 },
    label: { fontSize: hp(1.8), color: theme.colors.secondaryText || '#666', marginBottom: hp(0.7), fontWeight: '500' },
    inputBox: { backgroundColor: '#fff', paddingVertical: hp(1.4), paddingHorizontal: wp(3), borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    inputBoxPlaceholder: { borderStyle: 'dashed', borderColor: '#ccc' },
    selectedText: { fontSize: hp(2), color: theme.colors.text || '#222', fontWeight: '500', flex: 1 },
    placeholderText: { color: '#aaa', fontWeight: '400' },
    compareButton: { marginTop: hp(2) },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: hp(2.5), width: '100%', height: '75%', alignItems: 'center' },
    modalHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(1.5) },
    modalTitle: { fontSize: hp(2.4), fontWeight: 'bold', color: theme.colors.text || '#222' },
    modalCloseIcon: { padding: hp(1) },
    divider: { height: 1, backgroundColor: '#eee', width: '100%', marginBottom: hp(2) },
    flatListContent: { width: wp(100) - hp(5), paddingBottom: hp(2) },
    modalItem: { paddingVertical: hp(2), paddingHorizontal: wp(3), borderBottomWidth: 1, borderBottomColor: '#f0f0f0', width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalItemText: { fontSize: hp(2), color: theme.colors.text || '#333', fontWeight: '500' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: hp(6) },
    emptyText: { fontSize: hp(2), color: '#888', marginTop: hp(1.5) },
    closeButton: { backgroundColor: theme.colors.primary || '#3478f6', paddingVertical: hp(1.5), paddingHorizontal: wp(10), borderRadius: 12, marginTop: hp(2), shadowColor: theme.colors.primary || '#3478f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
    closeButtonText: { color: 'white', fontSize: hp(2), fontWeight: '600' }
});