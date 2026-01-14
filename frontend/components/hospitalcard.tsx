import { Image } from 'expo-image';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface HospitalCardProps {
  hospital: {
    _id?: string;
    name: string;
    location: string;
    rating: number;
    image: any;
  };
  onPress?: () => void;
}

export default function HospitalCard({ hospital, onPress }: HospitalCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Animated.View entering={FadeInDown.springify().duration(600).delay(200)}>
      <TouchableOpacity
        style={[styles.card, animatedStyle]}
        activeOpacity={0.9}
        onPressIn={() => (scale.value = withSpring(0.97))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={handlePress}
      >
        <Image source={hospital.image} style={styles.image} contentFit="cover" />
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <ThemedText style={styles.name} numberOfLines={1}>{hospital.name}</ThemedText>
            <View style={styles.rating}>
              <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
              <ThemedText style={styles.ratingText}>{hospital.rating}</ThemedText>
            </View>
          </View>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.textLight} />
            <ThemedText style={styles.location} numberOfLines={1}>{hospital.location}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    width: 280,
    ...SHADOWS.medium,
    marginVertical: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.surface,
  },
  info: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 13,
    color: COLORS.textLight,
    flex: 1,
  },
});
