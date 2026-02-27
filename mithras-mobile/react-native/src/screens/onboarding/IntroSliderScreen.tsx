import React from 'react';
import { View, Text } from 'react-native';
import ScannerScreen from './ScannerSlide';
import AppIntroSlider from 'react-native-app-intro-slider';
import { NetworkConfig } from './NetworkConfigSlide';
import AppAlert, { ErrorAlert } from '../../components/Alert';
import { useConnectivity } from '../../context/Connectivity';
import { AnimatedArrow, AnimatedEyes } from './OnboardingAnimations';
import styles from './OnboardingStyles';
import { MnemonicEntryTopLevel } from './MnemonicSlide';

type Props = {
  onDone: () => void;
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
      text: 'Scan your chosen network for funded Algorand addresses.',
    },
  ];

  const sliderRef = React.useRef<any>(null);
  const [networkConfirmed, setNetworkConfirmed] = React.useState(false);
  const [mnemonicConfirmed, setMnemonicConfirmed] = React.useState(false);
  const [layoutMode, setLayoutMode] = React.useState<'center' | 'top'>('center');
  const { isConnected } = useConnectivity();
  // removed unused currentSlide state
  const networkIndex = slides.findIndex((s) => s.key === 'network');
  const mnemonicIndex = slides.findIndex((s) => s.key === 'mnemonic');

  const renderItem = ({ item }: { item: typeof slides[number] }) => (
    <View style={item.key === 'network' ? (layoutMode === 'top' ? styles.slideTop : styles.networkSlideCentered) : styles.slide}>
      <View style={styles.titleRow}>
        {item.key === 'explain-3' ? <AnimatedEyes /> : null}
        <Text style={[styles.title, item.key === 'network' ? styles.titleSmall : item.key === 'mnemonic' ? styles.titleSmall : null]}>
          {item.title}
        </Text>
      </View>
      {item.key === 'explain-3' ? (
        <Text style={styles.text}>{'A shielded pool is like a secret pocket within the blockchain.'}</Text>
      ) : (
        <Text style={styles.text}>{item.text}</Text>
      )}
      {item.key === 'explain-1' && <AnimatedArrow />}
      {item.key === 'network' && (
        <NetworkConfig
          showAppAlert={showAppAlert}
          onConfirmed={(v: boolean) => setNetworkConfirmed(v)}
          goToMnemonic={() => {
            const idx = slides.findIndex((s) => s.key === 'mnemonic');
            if (idx >= 0 && sliderRef.current && typeof sliderRef.current.goToSlide === 'function') {
              sliderRef.current.goToSlide(idx, true);
            }
          }}
          onLayoutModeChange={setLayoutMode}
        />
      )}
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
          showAppAlert={showAppAlert}
          onConfirmed={(v: boolean) => setMnemonicConfirmed(v)}
        />
      )}
      {item.key === 'scanner' && <ScannerScreen onDone={onDone} />}
    </View>
  );

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
    setAppAlert({ title, message, primaryText, primaryAction, secondaryText, secondaryAction, variant });
  };

  const hideAppAlert = () => setAppAlert(null);

  // connectivity now provided app-wide via ConnectivityProvider

  return (
    <>
      {/* Connectivity banner */}
      {!isConnected && (
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            zIndex: 999,
            alignItems: 'center',
          }}
        >
          <View style={{ backgroundColor: '#FF1744', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>No internet connection</Text>
          </View>
        </View>
      )}

      <AppIntroSlider
        ref={sliderRef}
        renderItem={renderItem}
        data={slides}
        onDone={onDone}
        renderNextButton={() => <View />}
        renderDoneButton={() => <View />}
        onSlideChange={(index: number, lastIndex: number) => {
          // Prevent advancing past the network slide unless confirmed
          if (lastIndex === networkIndex && index > networkIndex && !networkConfirmed) {
            // snap back to network slide
            if (sliderRef.current && typeof sliderRef.current.goToSlide === 'function') {
              sliderRef.current.goToSlide(networkIndex, true);
            }
            return;
          }
          // Prevent advancing past the mnemonic slide unless confirmed
          if (lastIndex === mnemonicIndex && index > mnemonicIndex && !mnemonicConfirmed) {
            if (sliderRef.current && typeof sliderRef.current.goToSlide === 'function') {
              sliderRef.current.goToSlide(mnemonicIndex, true);
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
      {/* pass connectivity into Scanner slide via renderItem; nothing else required here */}
    </>
  );
};

export default IntroSliderScreen;
