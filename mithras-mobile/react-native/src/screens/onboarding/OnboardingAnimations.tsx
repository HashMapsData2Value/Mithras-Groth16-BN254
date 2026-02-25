import React from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import styles from './OnboardingStyles';

export const AnimatedArrow: React.FC = () => {
  const translate = React.useRef(new Animated.Value(0)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const trackWidth = 84;
  const animRef = React.useRef<any>(null);

  React.useEffect(() => {
    const showDelay = 6000; // ms before showing the hint
    Animated.timing(opacity, { toValue: 1, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true, delay: showDelay }).start();

    const startTimer = setTimeout(() => {
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(translate, { toValue: trackWidth - 16, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.delay(700),
          Animated.timing(translate, { toValue: 0, duration: 120, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.delay(300),
        ])
      );
      animRef.current.start();
    }, showDelay + 350);

    return () => {
      clearTimeout(startTimer);
      if (animRef.current) animRef.current.stop();
    };
  }, [translate, opacity]);

  return (
    <Animated.View style={{ alignItems: 'center', marginTop: 18, opacity }} pointerEvents="none">
      <View style={styles.swipeTrack}>
        <Animated.View style={[styles.swipeDot, { transform: [{ translateX: translate }] }]} />
      </View>
      <Text style={styles.swipeText}>Swipe</Text>
    </Animated.View>
  );
};

export const AnimatedPsychedelic: React.FC = () => {
  const t = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [t]);

  const leftX = t.interpolate({ inputRange: [0, 1], outputRange: [-6, -14] });
  const rightX = t.interpolate({ inputRange: [0, 1], outputRange: [6, 14] });
  const centerScale = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const leftOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] });
  const rightOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] });

  const psychadelicText = 'hidden dimension';

  return (
    <View style={{ width: '100%', height: 34, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.Text
        style={[
          styles.galactic,
          {
            position: 'absolute',
            color: '#FF4DA6',
            transform: [{ translateX: leftX }],
            opacity: leftOpacity,
          },
        ]}
      >
        {psychadelicText}
      </Animated.Text>

      <Animated.Text
        style={[
          styles.galactic,
          {
            position: 'absolute',
            color: '#4DFFFF',
            transform: [{ translateX: rightX }],
            opacity: rightOpacity,
          },
        ]}
      >
        {psychadelicText}
      </Animated.Text>

      <Animated.Text
        style={[
          styles.galactic,
          {
            position: 'absolute',
            color: '#EDE7FF',
            transform: [{ scale: centerScale }],
            opacity: 1,
          },
        ]}
      >
        {psychadelicText}
      </Animated.Text>
    </View>
  );
};

export const AnimatedEyes: React.FC = () => {
  const lid = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(lid, { toValue: 1, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(1100),
        Animated.timing(lid, { toValue: 0, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(1500),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [lid]);

  const lidScale = lid.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const topTranslate = lidScale.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] });
  const bottomTranslate = lidScale.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  const Eye = () => (
    <View style={styles.eyeWrapper}>
      <View style={styles.eyeSclera}>
        <View style={styles.irisWrapper} pointerEvents="none">
          <View style={styles.iris} />
          <View style={styles.pupil} />
        </View>
      </View>
      <Animated.View style={[styles.eyelidTop, { transform: [{ translateY: topTranslate }, { scaleY: lidScale }] }]} />
      <Animated.View style={[styles.eyelidBottom, { transform: [{ translateY: bottomTranslate }, { scaleY: lidScale }] }]} />
    </View>
  );

  const blindY = lid.interpolate({ inputRange: [0, 1], outputRange: [-10, 35] });

  return (
    <View style={styles.eyesContainer}>
      <View style={styles.eyesRow}>
        <Eye />
        <Eye />
      </View>
      <Animated.View style={[styles.blindfold, { transform: [{ translateY: blindY }] }]}>
        <Text style={styles.blindfoldText}>MITHRAS</Text>
      </Animated.View>
    </View>
  );
};

export default { AnimatedArrow, AnimatedPsychedelic, AnimatedEyes };
