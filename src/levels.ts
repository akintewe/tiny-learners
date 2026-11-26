import type { Track } from './sound';
import type { CandyName } from './assets/candy';
import { colors } from './theme';

export type GameId = 'trace' | 'firstSound' | 'findLetter' | 'match' | 'countQuiz' | 'balloons' | 'more' | 'shapes';

export const LEVELS_PER_GAME = 12;
export const LEVELS_PER_WORLD = 4;
export const LEVEL_BONUS = 3; // stars for finishing a level

export const GAMES: Record<GameId, { title: string; color: string; rounds: number }> = {
  trace: { title: 'Trace it!', color: colors.grape, rounds: 3 },
  firstSound: { title: 'First sound', color: colors.sun, rounds: 5 },
  findLetter: { title: 'Find it!', color: colors.berry, rounds: 5 },
  match: { title: 'Match it!', color: colors.tangerine, rounds: 5 },
  countQuiz: { title: 'Count it!', color: colors.tangerine, rounds: 5 },
  balloons: { title: 'Pop!', color: colors.sky, rounds: 1 },
  more: { title: 'Which is more?', color: colors.grass, rounds: 5 },
  shapes: { title: 'Shapes', color: colors.berry, rounds: 5 },
};

export type World = {
  name: string;
  sky: string; // background of this stretch of the map
  ground: string;
  music: Track;
  deco: CandyName[]; // candy scattered beside the path
  node: string; // level stop color
};

// Bottom of the map is level 1. Every 4 levels is a new world with its own look and music.
export const WORLDS: World[] = [
  {
    name: 'Cupcake Meadow',
    sky: '#FFE3F1',
    ground: '#FFC6E0',
    music: 'world1',
    deco: ['lollipopRed', 'creamPink', 'heart', 'lollipopFruitRed', 'candyRed', 'cherry'],
    node: colors.berry,
  },
  {
    name: 'Chocolate Hills',
    sky: '#F6E6D3',
    ground: '#E3C4A0',
    music: 'world2',
    deco: ['lollipopWhiteRed', 'creamChoco', 'candyYellow', 'lollipopFruitYellow', 'heart', 'creamMocca'],
    node: colors.tangerine,
  },
  {
    name: 'Lollipop Lane',
    sky: '#DDF6EC',
    ground: '#B5EBD3',
    music: 'world3',
    deco: ['lollipopGreen', 'creamVanilla', 'candyGreen', 'lollipopWhiteGreen', 'candyBlue', 'lollipopFruitGreen'],
    node: colors.grass,
  },
];

export function worldOf(level: number): World {
  return WORLDS[Math.min(WORLDS.length - 1, Math.floor(level / LEVELS_PER_WORLD))];
}

// Cartoons shown after a level, in turn. All from LottieFiles (credits in src/credits.ts).
export const CARTOONS = [
  require('../assets/lottie/unicorn-rainbow.json'),
  require('../assets/lottie/dino-teal.json'),
  require('../assets/lottie/squirrel.json'),
  require('../assets/lottie/llama-party.json'),
  require('../assets/lottie/bear-wave.json'),
  require('../assets/lottie/dino-green.json'),
  require('../assets/lottie/boy-jump.json'),
  require('../assets/lottie/dino-mint.json'),
];
