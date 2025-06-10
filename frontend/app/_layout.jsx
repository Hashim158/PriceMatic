import { View, Text, LogBox } from 'react-native'
import React from 'react'
import { useState, useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserData } from '../services/userService'


LogBox.ignoreLogs(['Warning: TNodeChildrenRenderer','Warning: MemoizedTNodeRenderer','Warning: TRenderEngineProvider']);
const _layout=()=>{
  return(
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  )
}

const MainLayout = () => {
  const {setAuth, setUserData} = useAuth();
  const router = useRouter();

  useEffect(() => {
    // subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuth(session.user);
        updateUserData(session.user, session.user.email);
  
        // send your real admin user to the right place
        if (session.user.email?.toLowerCase() === 'Admin@you.com') {
          router.replace('/adminDashboard');
        } else {
          router.replace('/home');
        }
      } else {
        setAuth(null);
        router.replace('/welcome');
      }
    });
  
    // cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  

  const updateUserData = async (user,email) =>{
    let res = await getUserData(user?.id);
    if(res.success) setUserData({...res.data,email})
    //console.log('got user data: ',res);
  }


  return (
   <Stack 
   screenOptions={{
    headerShown: false
    }}
  >
    {/**  <Stack.Screen
      name="(main)/postDetails"
      options={{
        presentation: "modal",
        headerShown: false
        //animation: 'slide_from_bottom', // or 'fade_from_bottom', etc.
      }}
    />
 */}
  
  </Stack>
  );
};

export default _layout;