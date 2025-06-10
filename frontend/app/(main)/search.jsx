import React, { useState, useEffect, useRef } from 'react'; // ✅ Added useRef
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { searchAppliances } from '../../services/applianceService';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';

const Search = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null); // ✅ Reference to TextInput

  const fetchSuggestions = async (text) => {
    setLoadingSuggestions(true);
    const result = await searchAppliances(text);
    if (result.success) {
      setSuggestions(result.data.slice(0, 6));
    }
    setLoadingSuggestions(false);
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  // ✅ Focus keyboard when screen opens
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300); // Slight delay ensures layout is rendered
    return () => clearTimeout(timer);
  }, []);

  const handleSelectSuggestion = (applianceId) => {
    Keyboard.dismiss();
    router.push({
      pathname: '/openApplianceDetail',
      params: { applianceId },
    });
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    router.push({
      pathname: '/search-results',
      params: { query },
    });
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={20}
    >
      <View style={[
        styles.searchBar,
        isFocused && styles.searchBarFocused
      ]}>
        <Ionicons 
          name="search-outline" 
          size={hp(2.2)} 
          color={theme.colors.textLight} 
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef} // ✅ Attach ref here
          value={query}
          onChangeText={setQuery}
          placeholder="Search by brand, model number or category"
          placeholderTextColor={theme.colors.textLight}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={hp(2.2)} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {loadingSuggestions && (
        <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
      )}

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSelectSuggestion(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.suggestionContent}>
              <Ionicons name="albums-outline" size={hp(2.2)} color={theme.colors.primary} style={styles.itemIcon} />
              <View>
                <Text style={styles.brandText}>
                  {item.brand}
                </Text>
                <Text style={styles.modelText}>
                  {item.modelNumber}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={hp(2)} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.suggestionList}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          query.length >= 2 && !loadingSuggestions ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={hp(5)} color={theme.colors.textLight} style={styles.emptyIcon} />
              <Text style={styles.noMatchText}>No matching results</Text>
              <Text style={styles.noMatchSubText}>Try different keywords or check spelling</Text>
            </View>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
};

export default Search;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(5),
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: hp(1.5),
    paddingHorizontal: wp(3),
    height: hp(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchBarFocused: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  searchIcon: {
    marginRight: wp(2),
  },
  input: {
    flex: 1,
    height: hp(6),
    fontSize: hp(1.8),
    color: theme.colors.text,
    padding: 0,
  },
  clearButton: {
    padding: wp(1),
  },
  loader: {
    marginTop: hp(2),
  },
  suggestionList: {
    marginTop: hp(1.5),
    paddingBottom: hp(5),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    backgroundColor: '#fff',
    borderRadius: hp(1),
    marginBottom: hp(1),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: wp(3),
  },
  brandText: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  modelText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: hp(5),
  },
  emptyIcon: {
    marginBottom: hp(1.5),
    opacity: 0.5,
  },
  noMatchText: {
    fontSize: hp(1.8),
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: hp(0.5),
  },
  noMatchSubText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});