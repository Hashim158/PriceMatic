import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { createReview } from '../../services/applianceService';
import BackButton from '../../components/BackButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';

const WriteReviewSection = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { Id, applianceDetail } = useLocalSearchParams();

  const inputRefTitle = useRef(null);
  const inputRefReview = useRef(null);
  const titleRef = useRef('');
  const reviewRef = useRef('');
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState(0);

  const onReview = async () => {
    if (!titleRef.current || !reviewRef.current || rate === 0) {
      Alert.alert('Error', 'Please fill in all fields and select a rating.');
      return;
    }
    const data = {
      userId: user?.id,
      applianceId: Id,
      title: titleRef.current,
      text: reviewRef.current,
      rating: rate,
      name: user.name,
    };
    setLoading(true);
    const res = await createReview(data);
    setLoading(false);

    if (res.success) {
      inputRefTitle.current?.clear();
      inputRefReview.current?.clear();
      titleRef.current = '';
      reviewRef.current = '';
      setRate(0);
      router.back();
    } else {
      Alert.alert('Error', res.msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenWrapper bg="white">
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <View style={styles.container}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={styles.list}
            >
              <View style={styles.header}>
                <BackButton size={hp(3.5)} router={router} />
                <Text style={styles.headerText}>Write a Review</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appliance</Text>
                <TouchableOpacity style={styles.inputStyle}>
                  <Text
                    style={styles.placeholder}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {applianceDetail || 'Select an appliance'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Review Title</Text>
                <Input
                  inputRef={inputRefTitle}
                  placeholder="Example: Durable and Energy Efficient!"
                  onChangeText={value => (titleRef.current = value)}
                  containerStyle={styles.inputStyle}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Write a Review</Text>
                <Input
                  inputRef={inputRefReview}
                  placeholder="Share your experience..."
                  onChangeText={value => (reviewRef.current = value)}
                  containerStyle={styles.textAreaStyle}
                  multiline
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rating</Text>
                <View style={styles.ratingContainer}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setRate(index + 1)}
                    >
                      <Text
                        style={
                          index < rate ? styles.starFilled : styles.starEmpty
                        }
                      >
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <Loading />
                </View>
              ) : (
                <View style={styles.buttonContainer}>
                  <Button
                    title="Submit Review"
                    loading={loading}
                    onPress={onReview}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </SafeAreaView>
  );
};

export default WriteReviewSection;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background || '#f9f9f9',
  },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingBottom: hp(3),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: hp(2.4),
    fontWeight: '700',
    color: '#222',
    marginLeft: wp(2),
  },
  section: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(1),
  },
  inputStyle: {
    height: hp(6),
    borderRadius: theme.radius.md,
    backgroundColor: '#fff',
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  textAreaStyle: {
    height: hp(14),
    borderRadius: theme.radius.md,
    backgroundColor: '#fff',
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(1),
    marginBottom: hp(2),
  },
  starFilled: {
    fontSize: hp(3),
    color: '#FFD700',
    marginHorizontal: wp(1),
  },
  starEmpty: {
    fontSize: hp(3),
    color: '#ccc',
    marginHorizontal: wp(1),
  },
  buttonContainer: {
    marginTop: hp(3),
    marginHorizontal: wp(5),
  },
  placeholder: {
    fontSize: hp(2),
    color: '#888',
  },
  list: {
    paddingBottom: hp(8),
  },
  loadingContainer: {
    marginTop: hp(4),
    alignItems: 'center',
  },
});
