import React from 'react';
import { View, Text, StyleSheet, Animated, Easing, TextInput, TouchableOpacity, Modal, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AppAlert, { ErrorAlert } from '../../components/Alert';
import ScannerScreen from '../ScannerScreen';
import { generateMnemonicService, validateMnemonicService } from '../../services/mnemonics';
import AppIntroSlider from 'react-native-app-intro-slider';
import { setMnemonic } from '../../services/secureStorage';
import { setDefaultNetwork, setCustomNetwork, DefaultNetwork, validateSetNetwork, validateNetworkConfig } from '../../api/network';

type Props = {
  onDone: () => void;
};

type MnemonicEntryProps = {
  onSaved: () => void;
  onDone: () => void;
  generateMnemonic: () => Promise<string> | string;
  validateMnemonic: (m: string) => boolean;
  showAppAlert: (
    title: string | undefined,
    message: string,
    primaryText?: string,
    primaryAction?: (() => void) | null,
    secondaryText?: string | null,
    secondaryAction?: (() => void) | null,
    variant?: 'error' | 'ack'
  ) => void;
};

const MnemonicEntryTopLevel: React.FC<MnemonicEntryProps> = ({ onSaved, onDone, generateMnemonic, validateMnemonic, showAppAlert }) => {
  const [text, setText] = React.useState('');
  const [isValid, setIsValid] = React.useState<boolean | null>(null);
  const [showSaved, setShowSaved] = React.useState(false);

  React.useEffect(() => {
    const ok = validateMnemonic(text);
    setIsValid(ok);
  }, [text, validateMnemonic]);

  const onChange = (val: string) => {
    setText(val);
    const ok = validateMnemonic(val);
    setIsValid(ok);
  };

  const onGenerate = async () => {
    try {
      const m = await generateMnemonic();
      if (m) {
        setText(m);
        const ok = validateMnemonic(m);
        setIsValid(ok);
      } else {
        showAppAlert('Error', 'Failed to generate mnemonic', undefined, null, null, null, 'error');
      }
    } catch (e) {
      console.warn('Generate error', e);
      showAppAlert('Error', 'Failed to generate mnemonic', undefined, null, null, null, 'error');
    }
  };

  const confirmSave = async () => {
    try {
      await setMnemonic(text.trim());
      setShowSaved(true);
      setTimeout(() => {
        setShowSaved(false);
        onSaved();
      }, 900);
    } catch (e) {
      console.warn('Secure storage save failed', e);
      showAppAlert('Error', 'Failed to save mnemonic', undefined, null, null, null, 'error');
    }
  };

  const onSave = async () => {
    if (!isValid) {
      showAppAlert('Invalid', 'Please provide a valid 24-word mnemonic before saving.', undefined, null, null, null, 'error');
      return;
    }
    showAppAlert(
      'Important',
      'Access to your mnemonic is necessary to recover your funds if the app is wiped or your phone is lost. Please write it down on paper and store it securely.',
      'Done',
      () => {
        confirmSave();
      },
      'Return',
      null
    );
  };

  return (
    <View style={styles.actionsColumn}>
      <TextInput
        multiline
        value={text}
        onChangeText={onChange}
        placeholder="Enter or generate a 24-word mnemonic"
        style={[styles.mnemonicInput, isValid === null ? {} : isValid ? styles.inputValid : styles.inputInvalid]}
        placeholderTextColor="#9E8CFF"
      />
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.button, styles.glassButton, styles.generateButton]}
          onPress={onGenerate}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.glassButtonText}>Generate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.glassButton, styles.saveButton, isValid ? null : styles.glassButtonDisabled]}
          onPress={onSave}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={[styles.glassButtonText, !isValid ? styles.glassButtonTextDisabled : null]}>Save</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showSaved} animationType="fade">
        <View style={styles.savedOverlay} pointerEvents="none">
          <View style={styles.savedBubble}>
            <Text style={styles.savedText}>Mnemonic securely stored.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const AnimatedArrow: React.FC = () => {
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
          // move forward slowly
          Animated.timing(translate, { toValue: trackWidth - 16, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          // hold at end so direction is clear
          Animated.delay(700),
          // quickly reset back to start to indicate repeat (fast snap)
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

const AnimatedPsychedelic: React.FC = () => {
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

const AnimatedEyes: React.FC = () => {
  const lid = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        // close
        Animated.timing(lid, { toValue: 1, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        // hold closed longer so hands/eyelids stay covering
        Animated.delay(1100),
        // open
        Animated.timing(lid, { toValue: 0, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        // pause before next blink
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

export const IntroSliderScreen: React.FC<Props> = ({ onDone }) => {
  const slides = [
    {
      key: 'explain-1',
      title: 'Mithras',
      text: 'Welcome to Mithras Mobile, a privacy wallet built on top of the Algorand blockchain.',
    },
    {
      key: 'explain-2',
      title: 'Privacy & Cryptography',
      text: 'Mithras uses advanced cryptography (ZK-SNARKs and Stealth Addresses) to offer shielded pools.',
    },
    {
      key: 'explain-3',
      title: '',
      // text is rendered specially in renderItem to include the animated effect
    },
    {
      key: 'explain-4',
      title: 'Shielded Transfers',
      text: 'Funds deposited into the shielded pool can be transacted anonymously and confidentially to others in the shielded pool. Observers will only see encrypted transfers between stealth addresses.',
    },
    {
      key: 'network',
      title: 'Choose Network Configuration',
      text: 'Select which Algorand network you want to connect to: Mainnet, Testnet, or a Custom network.',
    },
    {
      key: 'mnemonic',
      title: 'Mnemonic',
      text: 'Generate a new 24-word mnemonic or type out an existing one.',
    },
    {
      key: 'scanner',
      title: 'Scanner',
      text: 'Scan the network for known Algorand addresses.',
    },
  ];

  const sliderRef = React.useRef<any>(null);
  const [networkConfirmed, setNetworkConfirmed] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const networkIndex = slides.findIndex((s) => s.key === 'network');

  const renderItem = ({ item }: { item: typeof slides[number] }) => (
    <View style={styles.slide}>
      <View style={styles.titleRow}>
        {item.key === 'explain-3' ? <AnimatedEyes /> : null}
        <Text style={styles.title}>{item.title}</Text>
      </View>
      {item.key === 'explain-3' ? (
        <Text style={styles.text}>
          {'A shielded pool is like a'}
          <AnimatedPsychedelic />
          {' within the blockchain.'}
        </Text>
      ) : (
        <Text style={styles.text}>{item.text}</Text>
      )}
      {item.key === 'explain-1' && <AnimatedArrow />}
      {item.key === 'network' && <NetworkConfig />}
      {item.key === 'mnemonic' && (
        <MnemonicEntryTopLevel
          onDone={onDone}
          onSaved={() => {
            const idx = slides.findIndex((s) => s.key === 'scanner');
            if (idx >= 0 && sliderRef.current && typeof sliderRef.current.goToSlide === 'function') {
              sliderRef.current.goToSlide(idx, true);
            } else {
              onDone();
            }
          }}
          generateMnemonic={generateMnemonicService}
          validateMnemonic={validateMnemonicService}
          showAppAlert={showAppAlert}
        />
      )}
      {item.key === 'scanner' && <ScannerScreen onScan={() => console.log('Scanner start')} />}
    </View>
  );


  

  // App-wide alert state and helper
  const [appAlert, setAppAlert] = React.useState<{
    title?: string;
    message: string;
    primaryText?: string;
    primaryAction?: (() => void) | null;
    secondaryText?: string | null;
    secondaryAction?: (() => void) | null;
    variant?: 'error' | 'ack';
  } | null>(null);

  const showAppAlert = (
    title: string | undefined,
    message: string,
    primaryText = 'OK',
    primaryAction: (() => void) | null = null,
    secondaryText: string | null = null,
    secondaryAction: (() => void) | null = null,
    variant: 'error' | 'ack' = 'ack'
  ) => {
    console.log('showAppAlert called:', title, message, 'variant=', variant);
    setAppAlert({ title, message, primaryText, primaryAction, secondaryText, secondaryAction, variant });
  };

  const hideAppAlert = () => setAppAlert(null);

  const NetworkConfig: React.FC = () => {
    const [isValidating, setIsValidating] = React.useState(false);
    // Start with no pre-selected network so user must choose explicitly
    const [selected, setSelected] = React.useState<'mainnet' | 'testnet' | 'custom' | null>(null);
    const [algodUrl, setAlgodUrl] = React.useState('');
    const [algodToken, setAlgodToken] = React.useState('');
    const [algodPort, setAlgodPort] = React.useState('');
    const [indexerUrl, setIndexerUrl] = React.useState('');
    const [indexerToken, setIndexerToken] = React.useState('');
    const [indexerPort, setIndexerPort] = React.useState('');
    const [mithrasAppId, setMithrasAppId] = React.useState('');

    const Option: React.FC<{ id: 'mainnet' | 'testnet' | 'custom'; label: string; desc?: string }> = ({ id, label, desc }) => {
      const isSel = selected === id;
      return (
        <TouchableOpacity
          onPress={() => setSelected(id)}
          style={[styles.networkOption, isSel ? styles.networkOptionSelected : null]}
          activeOpacity={0.85}
        >
          <View style={styles.networkOptionRow}>
            <View style={[styles.networkBullet, isSel ? styles.networkBulletSelected : null]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.networkLabel}>{label}</Text>
              {desc ? <Text style={styles.networkDesc}>{desc}</Text> : null}
            </View>
            {isSel ? <Text style={styles.networkCheck}>✓</Text> : null}
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ width: '100%', marginTop: 12 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
          <View>
            <Option id="mainnet" label="Mainnet" desc="Live network for real value." />
            <Option id="testnet" label="Testnet" desc="Sandbox network for testing." />
            <Option id="custom" label="Custom" desc="Specify your own node or RPC endpoint." />

            {selected === 'custom' && (
              <View style={{ marginTop: 12 }}>
                <TextInput
                  value={algodUrl}
                  onChangeText={setAlgodUrl}
                  placeholder="Algod URL"
                  placeholderTextColor="#9E8CFF"
                  style={[styles.mnemonicInput, { minHeight: 44 }]}
                />
                <TextInput
                  value={algodToken}
                  onChangeText={setAlgodToken}
                  placeholder="Algod Token (optional)"
                  placeholderTextColor="#9E8CFF"
                  style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]}
                />
                <TextInput
                  value={algodPort}
                  onChangeText={setAlgodPort}
                  placeholder="Algod Port (optional)"
                  placeholderTextColor="#9E8CFF"
                  style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]}
                />
                <TextInput
                  value={indexerUrl}
                  onChangeText={setIndexerUrl}
                  placeholder="Indexer URL"
                  placeholderTextColor="#9E8CFF"
                  style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]}
                />
                <TextInput
                  value={indexerToken}
                  onChangeText={setIndexerToken}
                  placeholder="Indexer Token (optional)"
                  placeholderTextColor="#9E8CFF"
                  style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]}
                />
                <TextInput
                  value={indexerPort}
                  onChangeText={setIndexerPort}
                  placeholder="Indexer Port (optional)"
                  placeholderTextColor="#9E8CFF"
                  style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]}
                />
                <TextInput
                  value={mithrasAppId}
                  onChangeText={setMithrasAppId}
                  placeholder="Mithras Application ID"
                  placeholderTextColor="#9E8CFF"
                  style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]}
                />
              </View>
            )}

            {selected ? (
              <View style={{ marginTop: 14, alignItems: 'center' }}>
                <TouchableOpacity
                  style={[styles.glassButton, { minWidth: 160 }]}
                  onPress={async () => {
                    try {
                      console.log('Network Continue pressed, selected=', selected);
                      setIsValidating(true);

                      // Validate candidate network/config before writing to storage
                      const cfg = selected === 'custom' ? {
                        algodUrl: algodUrl || '',
                        algodToken: algodToken || '',
                        algodPort: algodPort || '',
                        indexerUrl: indexerUrl || '',
                        indexerToken: indexerToken || '',
                        indexerPort: indexerPort || '',
                        mithrasAppId: mithrasAppId || '',
                      } : undefined;

                      console.log('Validating network config, cfg=', cfg);
                      const ok = true //await validateNetworkConfig(selected || 'mainnet', cfg as any);
                      console.log('validateNetworkConfig result=', ok);
                      setIsValidating(false);

                      if (!ok) {
                        console.log('Validation failed, will show app alert');
                        // clear the user's selection so nothing is checked by default
                        setSelected(null);
                        setNetworkConfirmed(false);
                        showAppAlert('Validation Failed', 'Network or Mithras Application ID could not be verified. Please check your settings and try again.', undefined, null, null, null, 'error');
                        return;
                      }

                      // Persist only after successful validation
                      if (selected === 'mainnet') {
                        await setDefaultNetwork(DefaultNetwork.Mainnet);
                      } else if (selected === 'testnet') {
                        await setDefaultNetwork(DefaultNetwork.Testnet);
                      } else {
                        await setCustomNetwork({
                          algodUrl: algodUrl || '',
                          algodToken: algodToken || '',
                          algodPort: algodPort || '',
                          indexerUrl: indexerUrl || '',
                          indexerToken: indexerToken || '',
                          indexerPort: indexerPort || '',
                          mithrasAppId: mithrasAppId || '',
                        });
                      }

                      setNetworkConfirmed(true);
                      const idx = slides.findIndex((s) => s.key === 'mnemonic');
                      if (idx >= 0 && sliderRef.current && typeof sliderRef.current.goToSlide === 'function') {
                        sliderRef.current.goToSlide(idx, true);
                      }
                    } catch (e) {
                      setIsValidating(false);
                      console.warn('Failed to save/validate network config', e);
                      showAppAlert('Error', 'Failed to save or validate network configuration', undefined, null, null, null, 'error');
                    }
                  }}
                >
                  <Text style={styles.glassButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {isValidating ? (
              <View style={styles.loadingOverlay} pointerEvents="auto">
                <ActivityIndicator size="large" color="#7C4DFF" />
                <Text style={styles.loadingOverlayText}>Checking network…</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };
  return (
    <>
      <AppIntroSlider
        ref={sliderRef}
        renderItem={renderItem}
        data={slides}
        onDone={onDone}
        renderNextButton={() => <View />}
        renderDoneButton={() => <View />}
        onSlideChange={(index: number, lastIndex: number) => {
          setCurrentSlide(index);
          // Prevent advancing past the network slide unless confirmed
          if (lastIndex === networkIndex && index > networkIndex && !networkConfirmed) {
            // snap back to network slide
            if (sliderRef.current && typeof sliderRef.current.goToSlide === 'function') {
              sliderRef.current.goToSlide(networkIndex, true);
            }
          }
        }}
      />
      {appAlert ? (
        appAlert.variant === 'error' ? (
          <ErrorAlert
            visible={!!appAlert}
            title={appAlert.title}
            message={appAlert.message}
            primaryAction={() => {
              hideAppAlert();
              if (appAlert && appAlert.primaryAction) appAlert.primaryAction();
            }}
            onRequestClose={hideAppAlert}
          />
        ) : (
          <AppAlert
            visible={!!appAlert}
            title={appAlert.title}
            message={appAlert.message}
            primaryText={appAlert.primaryText}
            primaryAction={() => {
              hideAppAlert();
              if (appAlert && appAlert.primaryAction) appAlert.primaryAction();
            }}
            secondaryText={appAlert.secondaryText || undefined}
            secondaryAction={() => {
              if (appAlert && appAlert.secondaryAction) appAlert.secondaryAction();
              hideAppAlert();
            }}
            onRequestClose={hideAppAlert}
          />
        )
      ) : null}
      {/* Alerts are rendered by the centralized AppAlert component above. */}
    </>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    color: '#7C4DFF',
    textShadowColor: '#7C4DFF',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.4,
  },
  titleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  text: {
    fontSize: 17,
    color: '#C9B8FF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  galactic: {
    color: '#9BE2FF',
    fontWeight: '700',
    fontSize: 22,
    textShadowColor: '#7C4DFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  arrow: {
    fontSize: 40,
    color: '#7C4DFF',
    textAlign: 'center',
    marginTop: 18,
    textShadowColor: '#7C4DFF',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  eyesRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  eyeWrapper: {
    width: 56,
    height: 36,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyesContainer: {
    width: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  eyeSclera: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  irisWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iris: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4DFFFF',
  },
  pupil: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
  eyelidTop: {
    position: 'absolute',
    top: 0,
    width: 44,
    left: (56 - 44) / 2,
    backgroundColor: '#7C4DFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  eyelidBottom: {
    position: 'absolute',
    bottom: 0,
    width: 44,
    left: (56 - 44) / 2,
    backgroundColor: '#7C4DFF',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  blindfold: {
    position: 'absolute',
    width: 180,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2E0066',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    top: -20,
    opacity: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  blindfoldText: {
    color: 'rgba(237,231,255,0.55)',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 2,
  },
  actions: {
    marginTop: 24,
    flexDirection: 'row',
  },
  button: {
    marginHorizontal: 8,
    minWidth: 110,
    paddingHorizontal: 6,
  },
  actionsColumn: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
  },
  mnemonicInput: {
    width: '100%',
    minHeight: 88,
    borderWidth: 2,
    borderColor: 'rgba(201,184,255,0.35)',
    backgroundColor: 'rgba(46,0,102,0.06)',
    color: '#EDE7FF',
    padding: 12,
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  inputValid: {
    borderColor: '#00C853',
  },
  inputInvalid: {
    borderColor: '#FF1744',
  },
  glassButton: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  generateButton: {
    backgroundColor: 'rgba(124,77,255,0.20)',
    borderColor: 'rgba(124,77,255,0.36)',
  },
  saveButton: {
    backgroundColor: 'rgba(0,200,83,0.18)',
    borderColor: 'rgba(0,200,83,0.30)',
  },
  glassButtonDisabled: {
    opacity: 0.7,
    backgroundColor: 'rgba(255,255,255,0.03)'
  },
  glassButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.6,
    fontSize: 15,
  },
  glassButtonTextDisabled: {
    color: 'rgba(255,255,255,0.72)',
  },
  networkOption: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  networkOptionSelected: {
    backgroundColor: 'rgba(124,77,255,0.22)',
    borderColor: 'rgba(124,77,255,0.36)',
  },
  networkOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkBullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  networkBulletSelected: {
    backgroundColor: '#FFFFFF',
  },
  networkLabel: {
    color: '#EDE7FF',
    fontWeight: '700',
    fontSize: 15,
  },
  networkDesc: {
    color: '#C9B8FF',
    fontSize: 12,
  },
  networkCheck: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginLeft: 12,
  },
  swipeTrack: {
    width: 84,
    height: 18,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.12)',
    overflow: 'hidden',
  },
  swipeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EDE7FF',
    margin: 2,
  },
  swipeText: {
    marginTop: 8,
    color: '#C9B8FF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 18,
    backgroundColor: 'rgba(46,0,102,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalMessage: {
    color: '#EDE7FF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginLeft: 8,
  },
  modalButtonText: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  modalCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalCancelText: {
    color: '#C9B8FF',
  },
  modalConfirm: {
    backgroundColor: 'rgba(124,77,255,0.95)',
  },
  modalConfirmText: {
    color: '#FFFFFF',
  },
  savedOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 24,
  },
  savedBubble: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: 'rgba(124,77,255,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  savedText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
  },
  loadingOverlayText: {
    marginTop: 12,
    color: '#EDE7FF',
    fontSize: 14,
  },

});

export default IntroSliderScreen;
