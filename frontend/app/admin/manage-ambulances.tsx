import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '../../components/themed-text';
import { COLORS, SHADOWS } from '../../constants/theme';
import { api } from '../config/api.config';

export default function ManageAmbulancesScreen() {
    const router = useRouter();
    const [ambulances, setAmbulances] = useState<any[]>([]);
    const [hospital, setHospital] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newAmbNumber, setNewAmbNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const hospitalData = await api.getMyHospital();
            setHospital(hospitalData.hospital);
            setAmbulances(hospitalData.ambulances || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAmbulance = async () => {
        if (!newAmbNumber) return;
        if (!hospital) {
            alert('Please register your hospital first from the dashboard.');
            return;
        }

        try {
            setSubmitting(true);
            await api.addAmbulance({
                ambulanceNumber: newAmbNumber,
                isAvailable: true,
                hospital: hospital._id
            });
            setModalVisible(false);
            setNewAmbNumber('');
            fetchData(); // Refresh list
        } catch (error) {
            console.error(error);
            alert('Failed to add ambulance');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAmbulance = async (id: string) => {
        Alert.alert('Delete Ambulance', 'Are you sure you want to delete this ambulance?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.deleteAmbulance(id);
                        Alert.alert('Success', 'Ambulance removed successfully');
                        fetchData();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete ambulance');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name="ambulance" size={24} color={COLORS.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                    <ThemedText style={styles.cardTitle}>{item.ambulanceNumber}</ThemedText>
                    <ThemedText style={[styles.statusParams, { color: item.isAvailable ? COLORS.success : COLORS.error }]}>
                        {item.isAvailable ? 'Ready' : 'On Mission'}
                    </ThemedText>
                </View>
            </View>
            <Pressable
                onPress={() => handleDeleteAmbulance(item._id)}
                style={styles.deleteButton}
            >
                <MaterialCommunityIcons name="delete" size={24} color={COLORS.error} />
            </Pressable>
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
            <FlatList
                data={ambulances}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<ThemedText style={styles.emptyText}>No ambulances added yet.</ThemedText>}
            />

            <TouchableOpacity style={[styles.fab, { backgroundColor: COLORS.secondary }]} onPress={() => setModalVisible(true)}>
                <MaterialCommunityIcons name="plus" size={32} color="#fff" />
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>Add New Ambulance</ThemedText>

                        <TextInput
                            style={styles.input}
                            placeholder="Ambulance Number (e.g. AMB-01)"
                            value={newAmbNumber}
                            onChangeText={setNewAmbNumber}
                            placeholderTextColor={COLORS.textLight}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmButton, { backgroundColor: COLORS.secondary }]} onPress={handleAddAmbulance} disabled={submitting}>
                                {submitting ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.confirmText}>Add Ambulance</ThemedText>}
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
    list: {
        padding: 20,
        gap: 12,
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
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.secondary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statusParams: {
        fontSize: 12,
        fontWeight: '600',
    },
    deleteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        cursor: 'pointer',
        pointerEvents: 'auto',
        zIndex: 999,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textLight,
        marginTop: 40,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: COLORS.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: COLORS.white,
        width: '100%',
        borderRadius: 24,
        padding: 24,
        gap: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.background,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
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
