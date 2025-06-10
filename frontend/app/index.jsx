import { View, Text, Button } from 'react-native'
import React from 'react'
import { router, useRouter } from 'expo-router'
import ScreenWrapper from '../components/ScreenWrapper';
import Loading from '../components/Loading';

const Index = () => {
    const router = useRouter();
  return (
    <ScreenWrapper>
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <Loading />
      </View>
    </ScreenWrapper>
  )
}

export default Index