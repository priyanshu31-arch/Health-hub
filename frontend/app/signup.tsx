import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/app/config/api.config';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';

export default function SignupScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (data: any) => {
        setIsLoading(true);
        try {
            const res = await api.signup({
                name: data.name,
                email: data.email,
                password: data.password,
                hospitalName: data.hospitalName // Pass hospitalName if present
            });

            if (res.token) {
                await login(res.token, res.user);
                Alert.alert('Success', 'Account created successfully');
            }
        } catch (error: any) {
            console.error('Signup Error:', error);
            const msg = error.message || 'Signup failed';
            Alert.alert('Error', msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.accent, COLORS.secondary]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.content}>
                        <Animated.View
                            entering={FadeInDown.delay(200).duration(1000).springify()}
                            style={styles.header}
                        >
                            <Text style={styles.brand}>HealthBridge</Text>
                            <Text style={styles.subtitle}>Join Our Community</Text>
                        </Animated.View>

                        <Animated.View
                            entering={FadeInUp.delay(400).duration(1000).springify()}
                            style={styles.card}
                        >
                            <Text style={styles.welcomeText}>Create Account</Text>
                            <AuthForm
                                type="signup"
                                onSubmit={handleSignup}
                                isLoading={isLoading}
                                onToggle={() => router.push('/login')}
                            />
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    brand: {
        fontSize: 42,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 10,
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 18,
        color: '#e0e0e0',
        fontWeight: '500',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 15,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
});
