import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Only initialize if not on web, or handle web specifically if needed
if (Platform.OS !== 'web') {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export async function scheduleBookingNotification(type: string, name: string) {
    if (Platform.OS === 'web') {
        console.log(`Notification (Web fallback): Your ${type} for ${name} has been confirmed!`);
        return;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Booking Confirmed! ✅",
                body: `Your ${type} for ${name} has been successfully booked.`,
                data: { data: 'booking-confirmed' },
            },
            trigger: null, // show immediately
        });
    } catch (error) {
        console.error('Error scheduling notification:', error);
    }
}
