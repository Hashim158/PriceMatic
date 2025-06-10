import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { searchSellingItems } from '../../services/sellingService';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { getSupaBaseFileUrl } from '../../services/imageService';

export default function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const router = useRouter();

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length < 2) return setResults([]);
    const { success, data } = await searchSellingItems(text);
    if (success) setResults(data);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push({ pathname: '/openApplianceDetail', params: { OldApplianceId: item.id } })}
    >
      <Image
        source={getSupaBaseFileUrl(item.pictures?.[0])}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text style={styles.brand}>{item.brand} {item.modelNo}</Text>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={styles.meta}>{item.category} • {item.color}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search appliances..."
        style={styles.input}
        value={query}
        onChangeText={handleSearch}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No results found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  input: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  info: { flex: 1 },
  brand: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  price: { fontSize: 14, color: '#3b82f6' },
  meta: { fontSize: 12, color: '#64748b' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' },
});
