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
  DevSettings,
  Modal,
  TextInput,
} from 'react-native';

import { styles } from './menu/MenuStyles';
import { Alert } from 'react-native';
import { deployMithrasAppLocalnet } from '../blockchain/deploy';

import PublicScreen from './menu/PublicScreen';
import ShieldedScreen from './menu/ShieldedScreen';
import { AddBall } from './menu/AddBall';
import { getNextAddressIndex } from '../services/hdWallet';
import { wipeLocalDataExceptMnemonic } from '../services/appReset';
import { storage } from '../services/storage';

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
  const [confirm, setConfirm] = React.useState<{ visible: boolean; index: number | null; target?: 'public' | 'shielded' }>({ visible: false, index: null, target: undefined });
  const [setAppIdOpen, setSetAppIdOpen] = React.useState(false);
  const [mithrasAppIdDraft, setMithrasAppIdDraft] = React.useState('');
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const cloud1X = React.useRef(new Animated.Value(0)).current;
  const cloud2X = React.useRef(new Animated.Value(0)).current;
  const cloud3X = React.useRef(new Animated.Value(0)).current;
  // FAB animations will derive from `scrollX` so they move consistently with swipes

  const openSetAppId = () => {
    const network = storage.getString('network');
    if (network !== 'localnet') {
      Alert.alert('Localnet only', 'Switch to localnet network to set mithrasAppId manually.');
      return;
    }
    setMithrasAppIdDraft(storage.getString('mithrasAppId') ?? '');
    setSetAppIdOpen(true);
  };

  const saveSetAppId = () => {
    const network = storage.getString('network');
    if (network !== 'localnet') {
      Alert.alert('Localnet only', 'Switch to localnet network to set mithrasAppId manually.');
      return;
    }

    const raw = (mithrasAppIdDraft ?? '').trim();
    if (!/^[0-9]+$/.test(raw)) {
      Alert.alert('Invalid App ID', 'Enter a positive integer app id.');
      return;
    }
    try {
      const v = BigInt(raw);
      if (v <= 0n) throw new Error('non-positive');
    } catch {
      Alert.alert('Invalid App ID', 'Enter a valid positive integer app id.');
      return;
    }

    storage.set('mithrasAppId', raw);
    setSetAppIdOpen(false);
    Alert.alert('Saved', `mithrasAppId set to ${raw}`);
  };

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
          <PublicScreen confirm={confirm} setConfirm={setConfirm} />
          <Animated.View
            pointerEvents={index === 0 ? 'auto' : 'none'}
            style={{
              position: 'absolute',
              right: 16,
              bottom: 24,
              transform: [
                {
                  translateX: scrollX.interpolate({ inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH], outputRange: [40, 0, -40], extrapolate: 'clamp' }),
                },
                { scale: scrollX.interpolate({ inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH], outputRange: [0.96, 1, 0.96], extrapolate: 'clamp' }) },
              ],
              opacity: scrollX.interpolate({ inputRange: [-SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5], outputRange: [0, 1, 0], extrapolate: 'clamp' }),
            }}
          >
            <AddBall inverted style={styles.fabOverlay} onPress={async () => {
              try {
                const next = getNextAddressIndex();
                setConfirm({ visible: true, index: next, target: 'public' });
              } catch (e) {
                console.warn(e);
              }
            }} />
          </Animated.View>
        </View>

        {/* Shielded Addresses */}
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <Text style={styles.pageTitle}>Shielded Addresses</Text>
          <Text style={styles.pageSubtitle}>Your private/stealth addresses</Text>
          <ShieldedScreen confirm={confirm} setConfirm={setConfirm} />
          {/* Shielded FAB (animated) inside page so it moves with swipe */}
          <Animated.View
            pointerEvents={index === 1 ? 'auto' : 'none'}
            style={{
              position: 'absolute',
              right: 16,
              bottom: 24,
              transform: [
                {
                  translateX: scrollX.interpolate({ inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2], outputRange: [40, 0, -40], extrapolate: 'clamp' }),
                },
                { scale: scrollX.interpolate({ inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2], outputRange: [0.96, 1, 0.96], extrapolate: 'clamp' }) },
              ],
              opacity: scrollX.interpolate({ inputRange: [SCREEN_WIDTH - SCREEN_WIDTH * 0.5, SCREEN_WIDTH, SCREEN_WIDTH + SCREEN_WIDTH * 0.5], outputRange: [0, 1, 0], extrapolate: 'clamp' }),
            }}
          >
            <AddBall style={styles.fabOverlay} onPress={() => { setConfirm({ visible: true, index: null, target: 'shielded' }); }} />
          </Animated.View>
        </View>

        {/* Settings (actions) */}
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>Account actions and advanced options</Text>
          <View style={styles.card}>
            <ActionButton label="Make My Algos Private (Deposit)" onPress={onDeposit} />
            <ActionButton label="Transfer Private Algos (Spend)" onPress={onSpend} />
            <ActionButton label="Multiplier (debug)" onPress={onMultiplier} />
            <ActionButton
              label="Wipe local data (keep mnemonic)"
              onPress={() => {
                Alert.alert(
                  'Wipe local data?',
                  'This clears cached state (UTXOs, Merkle cache, network/appId settings, etc.) but keeps your mnemonic. The app will reload after wiping.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Wipe',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await wipeLocalDataExceptMnemonic();
                        } catch (e) {
                          Alert.alert('Wipe failed', String(e));
                          return;
                        }

                        // Give storage a tick to flush, then reload JS to fully reset in-memory state.
                        setTimeout(() => {
                          try {
                            DevSettings.reload();
                          } catch {
                            // If reload isn't available (e.g. some release builds), user can manually restart.
                          }
                        }, 200);
                      },
                    },
                  ],
                );
              }}
            />
            <ActionButton
              label="Deploy Mithras (localnet)"
              onPress={async () => {
                try {
                  const appId = await deployMithrasAppLocalnet();
                  Alert.alert('Deployed', `Mithras App ID: ${appId.toString()}`);
                } catch (e) {
                  Alert.alert('Deploy failed', String(e));
                }
              }}
            />
            <ActionButton label="Set Mithras App ID (localnet)" onPress={openSetAppId} />
            <ActionButton label="Make My Algos Public (Withdraw)" onPress={() => { }} />
          </View>
        </View>
      </Animated.ScrollView>

      <Modal
        transparent
        visible={setAppIdOpen}
        animationType="fade"
        onRequestClose={() => setSetAppIdOpen(false)}
      >
        <View style={localnetModalStyles.overlay}>
          <View style={localnetModalStyles.modalCard}>
            <Text style={localnetModalStyles.modalTitle}>Set Mithras App ID</Text>
            <Text style={localnetModalStyles.modalSubtitle}>Localnet only. Enter the deployed app id.</Text>
            <TextInput
              style={localnetModalStyles.modalInput}
              keyboardType="numeric"
              placeholder="App ID (e.g. 12345)"
              value={mithrasAppIdDraft}
              onChangeText={setMithrasAppIdDraft}
            />
            <View style={localnetModalStyles.actionsRow}>
              <Pressable style={[styles.actionButton, localnetModalStyles.actionButtonCompact]} onPress={() => setSetAppIdOpen(false)}>
                <Text style={styles.actionButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, localnetModalStyles.actionButtonCompact]} onPress={saveSetAppId}>
                <Text style={styles.actionButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>



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

const localnetModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.70)',
    paddingHorizontal: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    backgroundColor: '#07070A',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  modalTitle: {
    color: '#EDE7FF',
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  modalSubtitle: {
    color: '#C9B8FF',
    fontSize: 12,
    marginBottom: 12,
  },
  modalInput: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    color: '#EDE7FF',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  actionButtonCompact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
  },
});