import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashLoader({ onFinish }: { onFinish: () => void }) {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.9));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Keep splash on screen for a bit
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }).start(onFinish);
            }, 1200);
        });
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <LinearGradient
                colors={['#5f33e1', '#3b1c9e']}
                style={styles.gradient}
            >
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.iconPlaceholder}>
                        <Text style={styles.iconText}>F</Text>
                    </View>
                    <Text style={styles.logoText}>FINO</Text>
                </Animated.View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconPlaceholder: {
        width: 48,
        height: 48,
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    iconText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#5f33e1',
    },
    logoText: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
    },
});
