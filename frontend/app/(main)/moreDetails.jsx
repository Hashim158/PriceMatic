import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useAuth } from '../../contexts/AuthContext';

const MoreDetails = () => {
  const { user, setAuth } = useAuth();
  //console.log(user.name);

  return (
    <View>
      <Text>MoreDetails</Text>
    </View>
  )
}

export default MoreDetails;

const styles = StyleSheet.create({})