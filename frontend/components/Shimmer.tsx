import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ShimmerProps {
    width: DimensionValue;
    height: DimensionValue;
    borderRadius?: number;
    style?: any;
}

const Shimmer = ({ width, height, borderRadius = 8, style }: ShimmerProps) => {
    const shimmerAnimatedValue = new Animated.Value(0);

    useEffect(() => {
        const startShimmer = () => {
            Animated.loop(
                Animated.timing(shimmerAnimatedValue, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                })
            ).start();
        };
        startShimmer();
    }, []);

    // If width is a percentage or not a number, we use a fallback for the animation distance
    const numericWidth = typeof width === 'number' ? width : 400;

    const translateX = shimmerAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-numericWidth, numericWidth],
    });

    return (
        <View
            style={[
                styles.container,
                { width: width as any, height: height as any, borderRadius },
                style,
            ]}
        >
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        width: numericWidth,
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E1E9EE',
        overflow: 'hidden',
    },
});

export default Shimmer;
