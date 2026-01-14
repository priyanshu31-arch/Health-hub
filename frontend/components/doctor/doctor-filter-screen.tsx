import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { COLORS, SHADOWS } from '../../constants/theme';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

type NavigationProp = {
  navigate: (screen: string) => void;
  goBack: () => void;
};

const DoctorFilterScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const initialFilter = 'Earliest available any location';
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);

  const filters = [
    { name: 'Earliest available any location', icon: 'calendar-clock' },
    { name: 'Nearest first', icon: 'map-marker' },
    { name: 'Most experienced', icon: 'trophy' },
    { name: 'Doctor fees - high to low', icon: 'sort-ascending' },
    { name: 'Doctor fees - low to high', icon: 'sort-descending' },
    { name: 'Specialization', icon: 'star' },
  ];

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Find Doctor</ThemedText>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={22} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search specialization or doctor..."
              placeholderTextColor={COLORS.textLight}
            />
          </View>
        </View>

        {/* Promo Banner */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.banner}
          >
            <View>
              <ThemedText style={styles.bannerTitle}>Consultation Available</ThemedText>
              <ThemedText style={styles.bannerSubtitle}>Book verified specialists today</ThemedText>
            </View>
            <MaterialCommunityIcons name="medical-bag" size={40} color={COLORS.primary} />
          </LinearGradient>
        </Animated.View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ThemedText style={styles.filterTitle}>Sort & Filter</ThemedText>

          {filters.map((filter, index) => (
            <Animated.View
              key={filter.name}
              entering={FadeInDown.delay(400 + index * 50).duration(600)}
            >
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFilter === filter.name && styles.filterOptionSelected
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedFilter(filter.name);
                }}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.filterIconBox,
                  { backgroundColor: selectedFilter === filter.name ? COLORS.primaryLight : COLORS.surface }
                ]}>
                  <MaterialCommunityIcons
                    name={filter.icon as any}
                    size={20}
                    color={selectedFilter === filter.name ? COLORS.primary : COLORS.textLight}
                  />
                </View>

                <ThemedText style={[
                  styles.filterText,
                  selectedFilter === filter.name && styles.filterTextActive
                ]}>
                  {filter.name}
                </ThemedText>

                <View
                  style={[
                    styles.radioButton,
                    selectedFilter === filter.name && styles.radioButtonSelected,
                  ]}
                >
                  {selectedFilter === filter.name && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.clearButton} onPress={() => setSelectedFilter(initialFilter)}>
          <ThemedText style={styles.clearText}>Reset</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => navigation.navigate('DoctorInfo')}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.applyGradient}
          >
            <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DoctorFilterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 24,
    ...SHADOWS.medium,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  filterSection: {
    padding: 20,
    marginTop: 10,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    color: COLORS.text,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  filterOptionSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: '#FFF5F7',
  },
  filterIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  filterText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    gap: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.large,
  },
  clearButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  applyButton: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  applyGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
});
