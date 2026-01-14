import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import io from 'socket.io-client/dist/socket.io.js';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import { SOCKET_URL } from '../../config';

// Configure Socket - Should match your backend URL
// const SOCKET_URL = 'http://localhost:5000';

export default function TrackingScreen() {
    const { bookingId, role, patientName, vehicleNumber } = useLocalSearchParams();
    const router = useRouter();
    const mapRef = useRef<MapView>(null);

    const [location, setLocation] = useState({
        latitude: 12.9716, // Default Bangalore
        longitude: 77.5946,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const [remoteLocation, setRemoteLocation] = useState<any>(null);
    const [status, setStatus] = useState('Waiting for acknowledgement...');
    const [socket, setSocket] = useState<any>(null);
    const [isAcknowledged, setIsAcknowledged] = useState(false);

    useEffect(() => {
        // Init Socket
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket Connected');
            newSocket.emit('join_booking', bookingId);
        });

        newSocket.on('receive_location', (loc) => {
            console.log('Received Remote Location:', loc);
            setRemoteLocation(loc);
        });

        newSocket.on('receive_ack', (data) => {
            console.log('Received Ack:', data);
            setStatus(data.message);
            setIsAcknowledged(true);
            Alert.alert('Update', data.message);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Location Tracking
    useEffect(() => {
        let subscription: any;
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (loc) => {
                    const { latitude, longitude } = loc.coords;
                    setLocation(prev => ({ ...prev, latitude, longitude }));

                    if (socket) {
                        socket.emit('send_location', {
                            bookingId,
                            location: { latitude, longitude }
                        });
                    }
                }
            );
        })();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, [socket]);

    const sendAck = () => {
        if (socket) {
            socket.emit('send_ack', bookingId);
            setIsAcknowledged(true);
            setStatus('Acknowledged. Sharing location.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="arrow-back" size={24} color="black" onPress={() => router.back()} />
                <Text style={styles.headerTitle}>Live Tracking</Text>
            </View>

            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                region={location}
                showsUserLocation={true}
            >
                {/* My Location (Handled by showsUserLocation usually, but custom marker if needed) */}

                {/* Remote Location (Ambulance or User) */}
                {remoteLocation && (
                    <Marker
                        coordinate={remoteLocation}
                        title={role === 'admin' ? "Patient" : "Ambulance"}
                        description={role === 'admin' ? patientName as string : vehicleNumber as string}
                    >
                        <View style={styles.markerContainer}>
                            <Ionicons name={role === 'admin' ? "person" : "medical"} size={24} color={role === 'admin' ? "blue" : "red"} />
                        </View>
                    </Marker>
                )}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.statusText}>Status: {status}</Text>
                {role === 'admin' && !isAcknowledged && (
                    <TouchableOpacity style={styles.ackButton} onPress={sendAck}>
                        <Text style={styles.ackButtonText}>Acknowledge & Start Trip</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#fff',
        zIndex: 1,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    map: {
        flex: 1,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    ackButton: {
        backgroundColor: '#EF4444',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    ackButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    markerContainer: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc'
    }
});
