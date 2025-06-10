import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getUserData, updateUser } from '../../services/userService';
import BackButton from '../../components/BackButton';
import GenderModal from '../../components/GenderModal';
import LocationModal from '../../components/LocationModal';
import Footer from '../../components/Footer';

const pakistanCities = [
  'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Islamabad',
  'Quetta', 'Sialkot', 'Gujranwala', 'Sargodha', 'Bahawalpur', 'Sukkur', 'Larkana',
  'Sheikhupura', 'Gujrat', 'Jhang', 'Sahiwal', 'Rahim Yar Khan', 'Mardan', 'Kasur',
  'Okara', 'Mingora', 'Dera Ghazi Khan', 'Saidu Sharif', 'Nawabshah', 'Chiniot',
  'Narowal', 'Chaman', 'Bannu', 'Dera Ismail Khan', 'Muzaffarabad', 'Abbottabad',
  'Chitral', 'Skardu', 'Khuzdar', 'Kotli', 'Turbat'
];
const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: '', email: '', location: '', phoneNumber: '', gender: ''
  });
  const [errors, setErrors] = useState({});
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');

  const fetchUser = useCallback(async () => {
    setLoading(true);
    const res = await getUserData(user.id);
    if (res.success) {
      setUserData({
        name: res.data.name || '',
        email: res.data.email || '',
        location: res.data.location || '',
        phoneNumber: res.data.phoneNumber || '',
        gender: res.data.gender || '',
      });
    } else {
      Alert.alert('Error', res.msg || 'Failed to load profile');
    }
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const validate = () => {
    const e = {};
    if (!userData.name) e.name = 'Please enter your full name';
    if (!userData.email) e.email = 'Please enter your email';
    else if (!/\S+@\S+\.\S+/.test(userData.email)) e.email = 'Invalid email';
    if (!userData.phoneNumber) e.phoneNumber = 'Enter phone number';
    else if (!/^\d{10,11}$/.test(userData.phoneNumber.replace(/\D/g, '')))
      e.phoneNumber = '10–11 digits required';
    if (!userData.location) e.location = 'Select your city';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setUpdating(true);
    const res = await updateUser(user.id, userData);
    if (res.success) {
      Alert.alert('Success', 'Profile saved');
      setEditMode(false);
    } else {
      Alert.alert('Error', res.msg || 'Save failed');
    }
    setUpdating(false);
  };

  const handleLogout = () => {
    Alert.alert('Confirm', 'Logout now?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) Alert.alert('Error', 'Logout failed');
          else router.replace('/login');
        }
      }
    ]);
  };

  const renderField = (icon, label, key, placeholder, isDropdown = false, keyboardType = 'default') => (
    <View style={styles.card}>
      <View style={styles.fieldHeader}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.fieldLabel}>{label}</Text>
        {errors[key] && <Text style={styles.errorAsterisk}>*</Text>}
      </View>

      {editMode ? (
        isDropdown ? (
          <TouchableOpacity
            style={[
              styles.input,
              errors[key] && styles.inputError,
              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
            ]}
            onPress={() => key === 'gender' ? setShowGenderModal(true) : setShowLocationModal(true)}
          >
            <Text style={userData[key] ? styles.inputText : styles.inputPlaceholder}>
              {userData[key] || placeholder}
            </Text>
            <Ionicons name="chevron-down-outline" size={18} color={theme.colors.textLight} />
          </TouchableOpacity>
        ) : (
          <TextInput
            style={[styles.input, errors[key] && styles.inputError]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textLight}
            value={userData[key]}
            onChangeText={text => {
              setUserData(prev => ({ ...prev, [key]: text }));
              if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
            }}
            keyboardType={keyboardType}
            autoCapitalize="none"
          />
        )
      ) : (
        <View style={styles.valueBox}>
          <Text style={userData[key] ? styles.valueText : styles.inputPlaceholder}>
            {userData[key] || placeholder}
          </Text>
        </View>
      )}

      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <BackButton router={router} size={24} />
              <Text style={styles.title}>My Profile</Text>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </View>

            {/* Fields */}
            {renderField('person-outline', 'Full Name', 'name', 'Enter your name')}
            {renderField('location-outline', 'City', 'location', 'Select city', true)}
            {renderField('call-outline', 'Phone Number', 'phoneNumber', 'Enter phone', false, 'phone-pad')}
            {renderField('mail-outline', 'Email', 'email', 'Enter email', false, 'email-address')}
            {renderField('male-female-outline', 'Gender', 'gender', 'Select gender', true)}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, editMode ? styles.saveBtn : styles.editBtn]}
                onPress={editMode ? handleSave : () => setEditMode(true)}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name={editMode ? 'save-outline' : 'create-outline'}
                      size={18}
                      color="#fff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.btnText}>
                      {editMode ? 'Save Profile' : 'Edit Profile'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {editMode && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setEditMode(false);
                    fetchUser();
                    setErrors({});
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modals */}
      <GenderModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
        onSelect={gender => {
          setUserData(prev => ({ ...prev, gender }));
          setErrors(prev => ({ ...prev, gender: null }));
          setShowGenderModal(false);
        }}
        options={genderOptions}
      />
      <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={(location) => {
          setUserData(prev => ({ ...prev, location }));
          setErrors(prev => ({ ...prev, location: null }));
          setShowLocationModal(false);
        }}
        cities={pakistanCities.filter(city =>
          city.toLowerCase().includes(locationFilter.toLowerCase())
        )}
        filter={locationFilter}
        onFilterChange={setLocationFilter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: wp(4), paddingBottom: wp(8) },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  title: {
    fontSize: hp(3),
    fontWeight: '700',
    color: theme.colors.text,
  },
  logoutBtn: {
    padding: 6,
    backgroundColor: theme.colors.errorLight,
    borderRadius: 8,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  fieldLabel: {
    fontSize: hp(2),
    fontWeight: '600',
    color: theme.colors.text,
  },
  errorAsterisk: {
    marginLeft: 4,
    color: theme.colors.error,
    fontSize: hp(2),
  },

  input: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: wp(3),
    fontSize: hp(2),
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputText: {
    color: theme.colors.text,
    fontSize: hp(2),
  },
  inputPlaceholder: {
    color: theme.colors.textLight,
    fontSize: hp(2),
  },

  valueBox: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: wp(3),
  },
  valueText: {
    color: theme.colors.text,
    fontSize: hp(2),
  },

  errorText: {
    marginTop: hp(0.5),
    color: theme.colors.error,
    fontSize: hp(1.6),
  },

  actions: {
    marginTop: hp(3),
  },
  btn: {
    paddingVertical: hp(1.8),
    borderRadius: 12,
    alignItems: 'center',
  },
  editBtn: { backgroundColor: theme.colors.primary },
  saveBtn: { backgroundColor: '#e53935' },
  btnText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: hp(1.5),
    paddingVertical: hp(1.8),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelText: {
    color: theme.colors.textLight,
    fontSize: hp(2),
    fontWeight: '700',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
