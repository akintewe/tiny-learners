import React, { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import { colors } from './src/theme';
import { StoreProvider, useStore } from './src/store';
import { initAudio } from './src/sound';
import { GameId, GAMES } from './src/levels';
import type { LevelProps } from './src/screens/types';
import { Home, Route } from './src/screens/Home';
import { Letters } from './src/screens/Letters';
import { Numbers } from './src/screens/Numbers';
import { FindLetter } from './src/screens/FindLetter';
import { CountQuiz } from './src/screens/CountQuiz';
import { Trace } from './src/screens/Trace';
import { MatchCase } from './src/screens/MatchCase';
import { FirstSound } from './src/screens/FirstSound';
import { MoreLess } from './src/screens/MoreLess';
import { Shapes } from './src/screens/Shapes';
import { Balloons } from './src/screens/Balloons';
import { LevelMap } from './src/screens/LevelMap';
import { LevelComplete } from './src/screens/LevelComplete';
import { Shop } from './src/screens/Shop';
import { ChooseAvatar } from './src/screens/ChooseAvatar';
import { Parent } from './src/screens/Parent';
import { Sleepy } from './src/screens/Sleepy';

initAudio();

const PLAY: Record<GameId, React.ComponentType<LevelProps>> = {
  trace: Trace,
  firstSound: FirstSound,
  findLetter: FindLetter,
  match: MatchCase,
  countQuiz: CountQuiz,
  balloons: Balloons,
  more: MoreLess,
  shapes: Shapes,
};

type Nav =
  | { to: 'home' | 'letters' | 'numbers' | 'parent' }
  | { to: 'map'; game: GameId }
  | { to: 'play'; game: GameId; level: number }
  | { to: 'done'; game: GameId; level: number }
  | { to: 'shop'; back: Nav };

function Router() {
  const { ready, limitReached, avatar, finishLevel } = useStore();
  const [nav, setNav] = useState<Nav>({ to: 'home' });
  const home = () => setNav({ to: 'home' });

  // Android back: play -> map -> home
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (nav.to === 'home') return false;
      if (nav.to === 'play' || nav.to === 'done') setNav({ to: 'map', game: nav.game });
      else if (nav.to === 'shop') setNav(nav.back);
      else setNav({ to: 'home' });
      return true;
    });
    return () => sub.remove();
  }, [nav]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;
  if (limitReached && nav.to !== 'parent') return <Sleepy onGrownUps={() => setNav({ to: 'parent' })} />;

  // maps and the shop need a character to show
  if ((nav.to === 'map' || nav.to === 'shop') && !avatar) return <ChooseAvatar onDone={() => setNav({ ...nav })} />;

  switch (nav.to) {
    case 'letters':
      return <Letters onBack={home} />;
    case 'numbers':
      return <Numbers onBack={home} />;
    case 'parent':
      return <Parent onBack={home} />;
    case 'map':
      return (
        <LevelMap
          game={nav.game}
          onBack={home}
          onShop={() => setNav({ to: 'shop', back: nav })}
          onPlay={(level) => setNav({ to: 'play', game: nav.game, level })}
        />
      );
    case 'play': {
      const Game = PLAY[nav.game];
      return (
        <Game
          key={`${nav.game}-${nav.level}`}
          level={nav.level}
          onBack={() => setNav({ to: 'map', game: nav.game })}
          onFinish={() => {
            finishLevel(nav.game, nav.level);
            setNav({ to: 'done', game: nav.game, level: nav.level });
          }}
        />
      );
    }
    case 'done':
      return <LevelComplete level={nav.level} onMap={() => setNav({ to: 'map', game: nav.game })} />;
    case 'shop':
      return <Shop onBack={() => setNav(nav.back)} />;
    default:
      return (
        <Home
          go={(r: Route) => {
            if (r === 'letters' || r === 'numbers' || r === 'parent' || r === 'home') setNav({ to: r });
            else if (r === 'shop') setNav({ to: 'shop', back: { to: 'home' } });
            else if (r in GAMES) setNav({ to: 'map', game: r as GameId });
          }}
        />
      );
  }
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold });

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        {/* Fonts are bundled with the app, so this is a brief blank on first launch. */}
        {fontsLoaded || fontError ? <Router /> : <View style={{ flex: 1, backgroundColor: colors.cream }} />}
      </StoreProvider>
    </SafeAreaProvider>
  );
}
