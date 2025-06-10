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

const SignUp = () => {
  const router = useRouter();
  const emialRef = useRef("");
  const passwordRef = useRef("");
  const NameRef = useRef("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async () => {
    if (!NameRef.current || !emialRef.current || !passwordRef.current) {
      Alert.alert('Signup', 'Please fill all the fields!');
      return;
    }
  
    let name = NameRef.current.trim();
    let email = emialRef.current.trim().toLowerCase();
    let password = passwordRef.current.trim();
  
    // ✅ Gmail-only validation
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      Alert.alert('Signup Error', 'Only Gmail addresses are allowed (e.g., user@gmail.com)');
      return;
    }
  
    try {
      setLoading(true);
  
      // ✅ Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users') // or 'profiles' or your user metadata table if different
        .select('email')
        .eq('email', email)
        .single();
  
      if (existingUser) {
        setLoading(false);
        Alert.alert('Signup Error', 'This Gmail address is already registered.');
        return;
      }
  
      // ✅ Proceed with signup
      const { data: { session }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
  
      setLoading(false);
  
      if (error) {
        Alert.alert('Sign up', error.message);
      }
  
    } catch (err) {
      console.log(err);
      setLoading(false);
      Alert.alert('Signup Error', 'Something went wrong. Please try again.');
    }
  };
  

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* Welcome */}
        <View>
          <Text style={styles.welcomeText}>Let's</Text>
          <Text style={styles.welcomeText}>Get Started</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please fill in details to create an account
          </Text>
          <Input 
            icon={<Icon name="user" size={26} strokeWidth={1.6} />}
            placeholder="Enter your name"
            onChangeText={value => NameRef.current = value}
          />
             <Input 
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={(value) => (emialRef.current = value)} // Assign to emailRef
            /> 
            <Input 
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder="Enter your Password"
            secureTextEntry={true} // Mask the password
            onChangeText={(value) => (passwordRef.current = value)} // Assign to passwordRef
            />

          {/* Button */}
          <Button title={'Sign Up'} loading={loading} onPress={onSubmit} />
        </View>
        {/* Footer */}
        <View style={styles.footer}>
            <Text style={styles.footerText}>
            Already have an account!
            </Text>
            <Pressable onPress={()=> router.push('login')}>
                <Text style={[styles.footerText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>
                    Login
                    </Text>
            </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default SignUp;

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
