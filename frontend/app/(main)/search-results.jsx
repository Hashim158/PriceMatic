import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { searchAppliances } from '../../services/applianceService';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import ApplianceCard from '../../components/ApplianceCard'; // <- now using your restyled card

const SearchResults = () => {
  const { query = '' } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [appliances, setAppliances] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const result = await searchAppliances(query);
      if (result.success) {
        setAppliances(result.data);
      } else {
        Alert.alert('Error', 'Failed to load search results');
      }
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Results for: {query}</Text>

      {appliances.length === 0 ? (
        <Text style={styles.noResults}>No appliances found</Text>
      ) : (
        appliances.map((item) => (
            <ApplianceCard key={item.id} item={item} />
          ))          
      )}
    </ScrollView>
  );
};

export default SearchResults;

const styles = StyleSheet.create({
  container: {
    paddingBottom: hp(4),
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    marginBottom: hp(2),
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    color: theme.colors.text,
  },
  noResults: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: hp(5),
  },
});
