import { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppSafeArea } from './components/AppSafeArea';
import { SpaceBackground } from './components/SpaceBackground';
import { HomeMenuScreen } from './screens/HomeMenuScreen';
import { DepositProofScreen } from './screens/proofs/DepositProofScreen';
import { MultiplierProofScreen } from './screens/proofs/MultiplierProofScreen';
import { SpendProofScreen } from './screens/proofs/SpendProofScreen';
import { hasMnemonic } from './services/secureStorage';
import { ConnectivityProvider } from './context/Connectivity';
import { hasNetwork } from './blockchain/network';

type Route = 'menu' | 'deposit' | 'spend' | 'multiplier';

export default function App() {
  const [route, setRoute] = useState<Route>('menu');
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [checkingIntro, setCheckingIntro] = useState<boolean>(true);

  useEffect(() => {
    // check secure storage for stored mnemonic; if none, show intro slider
    (async () => {
      try {
        const mnemonicPresent = await hasMnemonic();
        const networkPresent = hasNetwork()
        // if either the mnemonic or network is missing, show the intro/onboarding
        if (!mnemonicPresent || !networkPresent) setShowIntro(true);
      } catch (e) {
        // if storage unavailable or error, default to showing intro
        setShowIntro(true);
      } finally {
        setCheckingIntro(false);
      }
    })();
  }, []);

  const handleIntroDone = () => {
    setShowIntro(false);
  };

  return (
    <ConnectivityProvider>
      <AppSafeArea>
        <View style={styles.root}>
          <SpaceBackground />
          <View style={styles.container}>
            {checkingIntro ? null : showIntro ? (
              // lazy-load the intro screen to avoid adding a top-level dependency
              // note: dynamic import keeps bundler happy with optional usage
              (() => {
                const Intro = require('./screens/onboarding/IntroSliderScreen').default;
                return <Intro onDone={handleIntroDone} />;
              })()
            ) : route === 'menu' ? (
              <HomeMenuScreen
                onDeposit={() => setRoute('deposit')}
                onSpend={() => setRoute('spend')}
                onMultiplier={() => setRoute('multiplier')}
              />
            ) : route === 'deposit' ? (
              <DepositProofScreen onBack={() => setRoute('menu')} />
            ) : route === 'multiplier' ? (
              <MultiplierProofScreen onBack={() => setRoute('menu')} />
            ) : (
              <SpendProofScreen onBack={() => setRoute('menu')} />
            )}
          </View>
        </View>
      </AppSafeArea>
    </ConnectivityProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
