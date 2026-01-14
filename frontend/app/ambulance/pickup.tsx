import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    Platform,
    Modal,
    TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '../../components/themed-text';
import { COLORS, SHADOWS } from '../../constants/theme';
import { api } from '../config/api.config';
import * as Location from 'expo-location';

export default function AmbulancePickupScreen() {
    const router = useRouter();
    const [ambulances, setAmbulances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

    // Booking Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAmbulance, setSelectedAmbulance] = useState<any>(null);
    const [patientName, setPatientName] = useState('');
    const [contactNumber, setContactNumber] = useState('');

    useEffect(() => {
        fetchAmbulances();
        getUserLocation();
    }, []);

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Default to Bangalore if permission denied
                setUserLocation({ lat: 12.9716, lon: 77.5946 });
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                lat: location.coords.latitude,
                lon: location.coords.longitude
            });
        } catch (error) {
            console.error('Error getting location:', error);
            // Default fallback
            setUserLocation({ lat: 12.9716, lon: 77.5946 });
        }
    };

    const fetchAmbulances = async () => {
        try {
            setLoading(true);
            const data = await api.getAmbulances();
            // Filter by available only
            const available = data.filter((a: any) => a.isAvailable);
            setAmbulances(available);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch ambulances');
        } finally {
            setLoading(false);
        }
    };

    const initiateBooking = (ambulance: any) => {
        if (!userLocation) {
            Alert.alert('Error', 'Waiting for location...');
            return;
        }
        setSelectedAmbulance(ambulance);
        setModalVisible(true);
    };

    const confirmBooking = async () => {
        if (!patientName || !contactNumber) {
            Alert.alert('Error', 'Please fill in all details');
            return;
        }

        try {
            setBookingLoading(true);

            const bookingData = {
                pickupLat: userLocation!.lat,
                pickupLon: userLocation!.lon,
                hospitalId: selectedAmbulance.hospital._id || selectedAmbulance.hospital,
                patientName,
                contactNumber
            };

            const result = await api.bookAmbulance(bookingData);

            setModalVisible(false);
            setPatientName('');
            setContactNumber('');

            Alert.alert('Success', 'Ambulance booked successfully!', [
                {
                    text: 'Track Live',
                    onPress: () => {
                        router.push({
                            pathname: '/tracking',
                            params: {
                                bookingId: result._id, // Using AmbulanceID as BookingID
                                vehicleNumber: result.ambulanceNumber,
                                role: 'user'
                            }
                        });
                    }
                }
            ]);

        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to book ambulance');
        } finally {
            setBookingLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name="ambulance" size={32} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <ThemedText style={styles.cardTitle}>{item.ambulanceNumber}</ThemedText>
                    <ThemedText style={styles.hospitalText}>{item.hospital?.name || 'HealthBridge Hospital'}</ThemedText>
                    <View style={styles.statusContainer}>
                        <View style={styles.activeDot} />
                        <ThemedText style={styles.statusText}>Available Now</ThemedText>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => initiateBooking(item)}
                    disabled={bookingLoading}
                >
                    <ThemedText style={styles.bookBtnText}>Book Now</ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Select Ambulance</ThemedText>
            </View>

            <FlatList
                data={ambulances}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<ThemedText style={styles.emptyText}>No ambulances available at the moment.</ThemedText>}
            />

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>Patient Details</ThemedText>
                        <ThemedText style={styles.modalSubtitle}>Please provide details for the ambulance crew.</ThemedText>

                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Patient Name</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter patient name"
                                value={patientName}
                                onChangeText={setPatientName}
                                placeholderTextColor={COLORS.textLight}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Contact Number</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter contact number"
                                value={contactNumber}
                                onChangeText={setContactNumber}
                                keyboardType="phone-pad"
                                placeholderTextColor={COLORS.textLight}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                                disabled={bookingLoading}
                            >
                                <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={confirmBooking}
                                disabled={bookingLoading}
                            >
                                {bookingLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <ThemedText style={styles.confirmText}>Confirm Booking</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
        zIndex: 10,
    },
    backBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    list: {
        padding: 20,
        gap: 16,
    },
    card: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 16,
        ...SHADOWS.small,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: COLORS.primary + '15', // 15% opacity
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    hospitalText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22C55E', // Green
    },
    statusText: {
        fontSize: 12,
        color: '#22C55E',
        fontWeight: '600',
    },
    bookBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        minWidth: 90,
        alignItems: 'center',
    },
    bookBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textLight,
        marginTop: 40,
        fontSize: 16,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end', // Bottom sheet style
        // Or 'center' for center modal
        // Let's do center for now as it's easier to layout
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: COLORS.white,
        width: '100%',
        borderRadius: 24,
        padding: 24,
        gap: 16,
        ...SHADOWS.medium,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 8,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginLeft: 4,
    },
    input: {
        backgroundColor: COLORS.background,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: COLORS.background,
    },
    confirmButton: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: COLORS.primary,
    },
    cancelText: {
        fontWeight: '600',
        color: COLORS.text,
    },
    confirmText: {
        fontWeight: 'bold',
        color: '#fff',
    },
});
