import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { hp } from '../helpers/common';
import { theme } from '../constants/theme';

const Footer = () => {
  const router = useRouter();
  const segments = useSegments();

  // Get last part of the route (e.g., 'myAds' from ['/myAds'])
  const activeTab = segments[segments.length - 1] || 'home';

  const handleNavigation = (routeName) => {
    if (activeTab !== routeName) {
      router.push(`/${routeName}`);
    }
  };

  const navigationItems = [
    { name: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
    { name: 'myAds', icon: 'list-outline', activeIcon: 'list', label: 'My Ads' },
    { name: 'sellNow', icon: 'add-circle-outline', activeIcon: 'add-circle', label: 'Sell' },
    { name: 'chat', icon: 'chatbubble-outline', activeIcon: 'chatbubble', label: 'Chat' },
    { name: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
  ];

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footer}>
        {navigationItems.map((item) => {
          const isActive = activeTab.toLowerCase() === item.name.toLowerCase();
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.footerButton, isActive && styles.activeButton]}
              onPress={() => handleNavigation(item.name)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={item.name === 'sellNow' ? hp(3.2) : hp(2.4)}
                  color={isActive ? theme.colors.primary : theme.colors.textLight}
                />
                {item.name === 'sellNow' && <View style={styles.sellButtonHighlight} />}
              </View>
              <Text style={[styles.footerLabel, isActive && styles.activeLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.footerShadow} />
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footerContainer: {
    position: 'relative',
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: hp(1.5),
    paddingVertical: hp(0.7),
  },
  activeButton: {
    transform: [{ translateY: -2 }],
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sellButtonHighlight: {
    position: 'absolute',
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    backgroundColor: 'rgba(0,0,0,0.03)',
    zIndex: -1,
  },
  footerLabel: {
    fontSize: hp(1.35),
    fontWeight: '500',
    color: theme.colors.textLight,
  },
  activeLabel: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  footerShadow: {
    position: 'absolute',
    height: 15,
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
    zIndex: -1,
  },
});
