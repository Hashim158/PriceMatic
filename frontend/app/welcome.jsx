import { Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'

const Welcome = () => {
    const router = useRouter();
  return (
    <ScreenWrapper bg="white" >
        <StatusBar style="dark" />
        <View style={styles.container}>
                {/*Welcome Page*/}
                <Image style={styles.WelcomeImage} source={require('../assets/images/PriceMatic_logo.png')} />

                {/* title */}
                <View style={{gap: 20}}>
                    <Text style={styles.title}>PriceMatic</Text>
                    <Text style={styles.punchline}>Your Personal Assistant for Appliance Shopping.</Text>
                </View>

                {/* footer */}
                <View style={styles.footer}>
                <Button 
                    title="Getting Started"
                    buttonStyle={{marginHorizontal: wp(3)}}
                    onPress={()=> router.push('signUp')}
                />
                </View>
                <View style={styles.bottomtext}>
                    <Text style={styles.logintext}>
                        Already have an account!
                    </Text>
                    <Pressable onPress={()=> router.push('login')}>
                        <Text style={[styles.logintext, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>
                            Login
                        </Text>
                   </Pressable>
                </View>


        </View>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        marginHorizontal: wp(4),
        //backgroundColor: 'red'
    },
    WelcomeImage: {
        resizeMode:'contain',
        height: hp(50),
        width: hp(50),
        alignSelf: 'center',
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(5),
        textAlign: 'center',
        fontWeight: theme.fonts.extraBold,
        
    },
    punchline: {
        textAlign: 'center',
        paddingHorizontal: wp(10),
        fontSize: hp(2),
        color: theme.colors.text,
    },
    footer: {
        gap: 30,
        width:'100%'

    },
    bottomtext:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    logintext:{
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(2)
        
    }
})