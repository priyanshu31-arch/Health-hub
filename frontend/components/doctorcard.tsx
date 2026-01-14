import { Image } from 'expo-image';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface DoctorCardProps {
  doctor: {
    id?: string;
    name: string;
    specialization: string;
    rating: number;
    image: any;
  };
  onPress?: () => void;
}

export default function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Animated.View entering={FadeInDown.springify().duration(600)}>
      <TouchableOpacity
        style={[styles.card, animatedStyle]}
        activeOpacity={0.9}
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={handlePress}
      >
        <View style={styles.imageContainer}>
          <Image source={doctor.image} style={styles.image} contentFit="cover" />
          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
            <ThemedText style={styles.ratingText}>{doctor.rating}</ThemedText>
          </View>
        </View>
        <View style={styles.info}>
          <ThemedText style={styles.name} numberOfLines={1}>{doctor.name}</ThemedText>
          <ThemedText style={styles.specialization}>{doctor.specialization}</ThemedText>
          <TouchableOpacity style={styles.bookButton}>
            <ThemedText style={styles.bookButtonText}>Book</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    width: 160,
    ...SHADOWS.medium,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 2,
  },
  ratingText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  specialization: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  bookButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
