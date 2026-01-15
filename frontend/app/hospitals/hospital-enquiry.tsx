import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../../components/themed-text';
import { COLORS, SHADOWS } from '../../constants/theme';

import { api } from '../config/api.config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function HospitalEnquiryScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams();
    const { hospitalId, hospitalName } = params;

    const [beds, setBeds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBed, setSelectedBed] = useState<string | null>(null);
    const [patientName, setPatientName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (hospitalId) {
            fetchBeds();
        }
    }, [hospitalId]);

    const fetchBeds = async () => {
        try {
            setLoading(true);
            const data = await api.getHospitalDetails(hospitalId as string);
            // Filter only available beds
            const availableBeds = (data.beds || []).filter((b: any) => b.isAvailable);
            console.log('Fetched beds:', data.beds);
            console.log('Available beds:', availableBeds);
            setBeds(availableBeds);
            if (availableBeds.length === 0) {
                Alert.alert('Info', 'No available beds found for this hospital.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch hospital details');
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!user) {
            Alert.alert(
                'Login Required',
                'You must be logged in to book a consultation.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => router.push('/login') }
                ]
            );
            return;
        }

        if (!selectedBed || !patientName || !contactNumber) {
            Alert.alert('Missing Information', 'Please select a bed and fill in all patient details.');
            return;
        }

        try {
            setSubmitting(true);
            await api.bookBed({
                bookingType: 'bed',
                itemId: selectedBed,
                hospital: hospitalId as string,
                patientName,
                contactNumber
            });

            const bedDetails = beds.find(b => b._id === selectedBed);
            const bedInfo = bedDetails ? `Bed ${bedDetails.bedNumber}` : 'Selected Bed';

            Alert.alert(
                'Booking Confirmed!',
                `Successfully booked ${bedInfo} for ${patientName}.\n\n` +
                `Please arrive at ${hospitalName || 'the hospital'} within 2 hours.\n` +
                `A confirmation has been logged for contact: ${contactNumber}`,
                [
                    {
                        text: 'Return to Home',
                        onPress: () => router.replace('/(tabs)'),
                    },
                ]
            );
        } catch (error: any) {
            console.error(error);
            Alert.alert('Booking Failed', error.message || 'Could not complete booking.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Book Consultation</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.hospitalCard}>
                    <MaterialCommunityIcons name="hospital-building" size={40} color={COLORS.primary} />
                    <View style={{ flex: 1 }}>
                        <ThemedText style={styles.hospitalName}>{hospitalName}</ThemedText>
                        <ThemedText style={styles.hospitalId}>ID: {hospitalId}</ThemedText>
                    </View>
                </View>

                <ThemedText style={styles.sectionTitle}>Select a Bed</ThemedText>
                <ThemedText style={styles.subtitle}>Choose from available beds below:</ThemedText>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : beds.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="bed-empty" size={48} color={COLORS.textLight} />
                        <ThemedText style={styles.emptyText}>No beds available at this moment.</ThemedText>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {beds.map((bed) => (
                            <TouchableOpacity
                                key={bed._id}
                                style={[
                                    styles.bedCard,
                                    selectedBed === bed._id && styles.selectedBed
                                ]}
                                onPress={() => setSelectedBed(bed._id)}
                            >
                                <MaterialCommunityIcons
                                    name="bed"
                                    size={32}
                                    color={selectedBed === bed._id ? COLORS.white : COLORS.primary}
                                />
                                <ThemedText style={[
                                    styles.bedNumber,
                                    selectedBed === bed._id && styles.selectedText
                                ]}>
                                    {bed.bedNumber}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            <View style={styles.formSection}>
                <ThemedText style={styles.sectionTitle}>Patient Details</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Patient Name"
                    value={patientName}
                    onChangeText={setPatientName}
                    placeholderTextColor={COLORS.textLight}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contact Number"
                    value={contactNumber}
                    onChangeText={(text) => {
                        const numbersOnly = text.replace(/[^0-9]/g, '');
                        if (text !== numbersOnly && text.length > 0) {
                            Alert.alert('Invalid Input', 'Please enter numbers only');
                        }
                        if (numbersOnly.length <= 10) {
                            setContactNumber(numbersOnly);
                        } else {
                            Alert.alert('Limit Reached', 'Contact number cannot exceed 10 digits');
                        }
                    }}
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.bookButton,
                        submitting && styles.disabledButton
                    ]}
                    onPress={handleBooking}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <ThemedText style={styles.bookButtonText}>Confirm Booking</ThemedText>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: COLORS.white,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: COLORS.surface,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    content: {
        padding: 20,
    },
    hospitalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 16,
        gap: 16,
        marginBottom: 24,
        ...SHADOWS.small,
    },
    hospitalName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    hospitalId: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    bedCard: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        ...SHADOWS.small,
    },
    selectedBed: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    bedNumber: {
        marginTop: 8,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    selectedText: {
        color: COLORS.white,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        gap: 16,
    },
    emptyText: {
        color: COLORS.textLight,
        fontSize: 16,
    },
    footer: {
        padding: 20,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    bookButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    disabledButton: {
        backgroundColor: COLORS.textLight,
        opacity: 0.7,
    },
    bookButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    formSection: {
        padding: 20,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: 12,
    },
    input: {
        backgroundColor: COLORS.background,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
});
