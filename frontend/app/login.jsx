import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import { useRouter } from 'expo-router'
import BackButton from '../components/BackButton'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import Input from '../components/Input'
import Icon from '../assets/icons'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

const Login = () => {
  const router = useRouter();
  const emialRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  
  const onSubmit = async () => {
    // 1. basic front-end validation
    const email = emialRef.current?.trim();
    const password = passwordRef.current?.trim();
    if (!email || !password) {
      Alert.alert('Login', 'Please fill all the fields!');
      return;
    }
  
    setLoading(true);
    try {
      // 2. sign in via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
  
      // 3. redirect based on your admin flag
      //    here I assume you’ve created a real admin user with email "admin@you.com"
      if (email.toLowerCase() === 'admin@you.com') {
        router.replace('/adminDashboard');
      } else {
        router.replace('/home');
      }
    } catch (err) {
      console.log('[Login]', err);
      Alert.alert('Login Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* Welcome */}
        <View>
          <Text style={styles.welcomeText}>Hey,</Text>
          <Text style={styles.welcomeText}>Welcome Back</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please login to continue
          </Text>
          <Input 
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={value => emialRef.current = value}
          />
               <Input 
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder="Enter your Password"
            secureTextEntry={true}
            onChangeText={value => passwordRef.current = value}
          />
          <Text style={styles.forgotPassword}>
            Forgot Password?
          </Text>
          {/* Button */}
          <Button title={'Login'} loading={loading} onPress={onSubmit} />
        </View>
        {/* Footer */}
        <View style={styles.footer}>
            <Text style={styles.footerText}>
            Don't have an account?
            </Text>
            <Pressable onPress={()=> router.push('signUp')}>
                <Text style={[styles.footerText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>
                    Sign Up
                    </Text>
            </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
    backgroundColor: "white"
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: "bold", // Replace with valid value
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: "600", // Replace with valid value
    color: theme.colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
});
