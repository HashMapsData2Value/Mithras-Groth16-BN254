import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  SafeAreaView,
  Easing,
} from 'react-native';

import { styles } from './menu/MenuStyles';

import PublicScreen from './menu/PublicScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  onDeposit: () => void;
  onSpend: () => void;
  onMultiplier: () => void;
};

function ActionButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
      onPress={onPress}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

export function HomeMenuScreen({ onDeposit, onSpend, onMultiplier }: Props) {
  const scrollRef = React.useRef<ScrollView | null>(null);
  const [index, setIndex] = React.useState(0);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const cloud1X = React.useRef(new Animated.Value(0)).current;
  const cloud2X = React.useRef(new Animated.Value(0)).current;
  const cloud3X = React.useRef(new Animated.Value(0)).current;

  const goTo = (i: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: i * SCREEN_WIDTH, animated: true });
      setIndex(i);
    }
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setIndex(page);
  };

  // scrollX driven animations handle background parallax and fade

  React.useEffect(() => {
    // Keep clouds subtle and inside the planet by limiting translate range
    const a1 = Animated.loop(
      Animated.sequence([
        Animated.timing(cloud1X, { toValue: -12, duration: 8000, useNativeDriver: true }),
        Animated.timing(cloud1X, { toValue: 12, duration: 8000, useNativeDriver: true }),
      ])
    );
    const a2 = Animated.loop(
      Animated.sequence([
        Animated.timing(cloud2X, { toValue: -16, duration: 10000, useNativeDriver: true }),
        Animated.timing(cloud2X, { toValue: 16, duration: 10000, useNativeDriver: true }),
      ])
    );
    const a3 = Animated.loop(
      Animated.sequence([
        Animated.timing(cloud3X, { toValue: -8, duration: 7000, useNativeDriver: true }),
        Animated.timing(cloud3X, { toValue: 8, duration: 7000, useNativeDriver: true }),
      ])
    );
    a1.start();
    a2.start();
    a3.start();
    // no black-hole rotation — keep background elements static
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();

    };
  }, [cloud1X, cloud2X, cloud3X]);



  return (
    <SafeAreaView style={styles.container}>
      {/* Background layers (parallax/slide based on scrollX) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.bgLayer,
          {
            transform: [
              {
                translateX: scrollX.interpolate({ inputRange: [0, SCREEN_WIDTH], outputRange: [0, -80], extrapolate: 'clamp' }),
              },
            ],
            // slightly extend fade range so it eases out more gradually
            opacity: scrollX.interpolate({ inputRange: [0, SCREEN_WIDTH * 0.9], outputRange: [1, 0], extrapolate: 'clamp' }),
          },
        ]}
      >
        <View style={styles.sun} />
        <View style={styles.sunGlow} />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.bgLayer,
          {
            transform: [
              {
                // slide in from right when approaching Shielded, and slide left when moving to Settings
                translateX: scrollX.interpolate({ inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2], outputRange: [80, 0, -80], extrapolate: 'clamp' }),
              },
            ],
            // fade in around Shielded page then fade out when moving to Settings
            // widen the fade so transition feels smoother
            opacity: scrollX.interpolate({ inputRange: [SCREEN_WIDTH * 0.2, SCREEN_WIDTH, SCREEN_WIDTH * 1.8], outputRange: [0, 1, 0], extrapolate: 'clamp' }),
          },
        ]}
      >
        {/* dark overlay that stays behind content */}
        <Animated.View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#000', opacity: scrollX.interpolate({ inputRange: [SCREEN_WIDTH * 0.2, SCREEN_WIDTH, SCREEN_WIDTH * 1.8], outputRange: [0, 1, 0], extrapolate: 'clamp' }) }} />
        <View style={styles.blackHoleHalo} />
        <View style={styles.blackHole} />
        <View style={styles.blackHoleRing} />
      </Animated.View>

      {/* Full-screen pitch-black overlay when Shielded page is active.
          Placed inside the shielded bgLayer (below content) so it darkens
          the background but does not cover UI text. */}

      {/* Earth for Settings (page 2) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.bgLayer,
          {
            transform: [
              {
                translateX: scrollX.interpolate({ inputRange: [SCREEN_WIDTH, SCREEN_WIDTH * 2], outputRange: [80, 0], extrapolate: 'clamp' }),
              },
            ],
            // ease earth into view earlier for a gentler transition
            opacity: scrollX.interpolate({ inputRange: [SCREEN_WIDTH * 1.1, SCREEN_WIDTH * 2], outputRange: [0, 1], extrapolate: 'clamp' }),
          },
        ]}
      >
        <View style={styles.earth}>
          <View style={styles.earthLand1} />
          <View style={styles.earthLand2} />
          {/* More realistic, smaller clouds built from overlapping puffs */}
          <Animated.View style={[styles.cloudGroup, styles.cloudGroup1, { transform: [{ translateX: cloud1X }] }]}>
            <View style={[styles.cloudPuff, styles.puffLarge, { left: 6, top: 6 }]} />
            <View style={[styles.cloudPuff, styles.puffMed, { left: 28, top: 0 }]} />
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 56, top: 10 }]} />
          </Animated.View>

          <Animated.View style={[styles.cloudGroup, styles.cloudGroup2, { transform: [{ translateX: cloud2X }] }]}>
            <View style={[styles.cloudPuff, styles.puffMed, { left: 4, top: 10 }]} />
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 26, top: 0 }]} />
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 46, top: 12 }]} />
          </Animated.View>

          <Animated.View style={[styles.cloudGroup, styles.cloudGroup3, { transform: [{ translateX: cloud3X }] }]}>
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 0, top: 6 }]} />
            <View style={[styles.cloudPuff, styles.puffMed, { left: 18, top: 0 }]} />
            <View style={[styles.cloudPuff, styles.puffLarge, { left: 42, top: 8 }]} />
          </Animated.View>

          <Animated.View style={[styles.cloudGroup, styles.cloudGroup4, { transform: [{ translateX: cloud1X }] }]}>
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 8, top: 6 }]} />
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 26, top: 0 }]} />
            <View style={[styles.cloudPuff, styles.puffMed, { left: 44, top: 8 }]} />
          </Animated.View>

          <Animated.View style={[styles.cloudGroup, styles.cloudGroup5, { transform: [{ translateX: cloud2X }] }]}>
            <View style={[styles.cloudPuff, styles.puffMed, { left: 2, top: 8 }]} />
            <View style={[styles.cloudPuff, styles.puffMed, { left: 26, top: 2 }]} />
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 50, top: 12 }]} />
          </Animated.View>

          <Animated.View style={[styles.cloudGroup, styles.cloudGroup6, { transform: [{ translateX: cloud3X }] }]}>
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 6, top: 6 }]} />
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 22, top: 0 }]} />
            <View style={[styles.cloudPuff, styles.puffMed, { left: 40, top: 10 }]} />
          </Animated.View>

          <Animated.View style={[styles.cloudGroup, styles.cloudGroup7, { transform: [{ translateX: cloud1X }] }]}>
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 4, top: 4 }]} />
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 20, top: 0 }]} />
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 36, top: 6 }]} />
          </Animated.View>

          <Animated.View style={[styles.cloudGroup, styles.cloudGroup8, { transform: [{ translateX: cloud2X }] }]}>
            <View style={[styles.cloudPuff, styles.puffMed, { left: 2, top: 6 }]} />
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 26, top: 0 }]} />
            <View style={[styles.cloudPuff, styles.puffSmall, { left: 46, top: 8 }]} />
          </Animated.View>
        </View>
      </Animated.View>
      <Animated.ScrollView
        ref={scrollRef as any}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        contentContainerStyle={{ width: SCREEN_WIDTH * 3 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Public Addresses */}
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <Text style={styles.pageTitle}>Public Addresses</Text>
          <Text style={styles.pageSubtitle}>Addresses visible on-chain (public)</Text>
          <PublicScreen />
        </View>

        {/* Shielded Addresses */}
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <Text style={styles.pageTitle}>Shielded Addresses</Text>
          <Text style={styles.pageSubtitle}>Your private/stealth addresses</Text>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>No shielded addresses yet.</Text>
          </View>
        </View>

        {/* Settings (actions) */}
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>Account actions and advanced options</Text>
          <View style={styles.card}>
            <ActionButton label="Make My Algos Private (Deposit)" onPress={onDeposit} />
            <ActionButton label="Transfer Private Algos (Spend)" onPress={onSpend} />
            <ActionButton label="Multiplier (debug)" onPress={onMultiplier} />
            <ActionButton label="Make My Algos Public (Withdraw)" onPress={() => { }} />
          </View>
        </View>
      </Animated.ScrollView>

      <View style={styles.navbar}>
        <Pressable style={styles.navItem} onPress={() => goTo(0)}>
          <Text style={[styles.navLabel, index === 0 ? styles.navLabelActive : null]}>Public</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => goTo(1)}>
          <Text style={[styles.navLabel, index === 1 ? styles.navLabelActive : null]}>Shielded</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => goTo(2)}>
          <Text style={[styles.navLabel, index === 2 ? styles.navLabelActive : null]}>Settings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}