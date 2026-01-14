import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Switch } from 'react-native';

interface AuthFormProps {
    type: 'login' | 'signup';
    onSubmit: (data: any) => void;
    isLoading: boolean;
    onToggle: () => void;
}

export default function AuthForm({ type, onSubmit, isLoading, onToggle }: AuthFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isHospital, setIsHospital] = useState(false);
    const [hospitalName, setHospitalName] = useState('');

    const handleSubmit = () => {
        onSubmit({
            email,
            password,
            name,
            hospitalName: isHospital ? hospitalName : undefined,
            role: isHospital ? 'admin' : 'user'
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{type === 'login' ? 'Welcome Back' : 'Create Account'}</Text>

            {type === 'signup' && (
                <>
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Register as Hospital?</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#ffcccc" }}
                            thumbColor={isHospital ? "#D32F2F" : "#f4f3f4"}
                            onValueChange={setIsHospital}
                            value={isHospital}
                        />
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder={isHospital ? "Admin Name" : "Full Name"}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    {isHospital && (
                        <TextInput
                            style={styles.input}
                            placeholder="Hospital Name"
                            value={hospitalName}
                            onChangeText={setHospitalName}
                            autoCapitalize="words"
                        />
                    )}
                </>
            )}

            <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={[styles.button, isHospital && type === 'signup' ? styles.adminButton : null]}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>{type === 'login' ? 'Login' : (isHospital ? 'Register Hospital' : 'Sign Up')}</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onToggle} style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                    {type === 'login'
                        ? "Don't have an account? Sign Up"
                        : "Already have an account? Login"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        height: 50,
        backgroundColor: '#007AFF', // Standard Blue
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    adminButton: {
        backgroundColor: '#D32F2F', // Red for Admin
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    toggleContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    toggleText: {
        color: '#007AFF',
        fontSize: 14,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
    },
});
