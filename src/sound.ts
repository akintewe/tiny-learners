/* eslint-disable @typescript-eslint/no-require-imports -- bundled audio files are loaded with require() */
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

// Downloaded CC0 audio (Kenney sound packs, OpenGameArt music). Sources are listed in src/credits.ts.
const FILES = {
  tap: require('../assets/audio/tap.ogg'),
  correct: require('../assets/audio/correct.ogg'),
  wrong: require('../assets/audio/wrong.ogg'),
  star: require('../assets/audio/star.ogg'),
  pop: require('../assets/audio/pop.ogg'),
  stroke: require('../assets/audio/stroke.ogg'),
  buy: require('../assets/audio/buy.ogg'),
  levelup: require('../assets/audio/levelup.ogg'),
};

const MUSIC = {
  home: require('../assets/audio/music_home.mp3'),
  world1: require('../assets/audio/music_world1.ogg'),
  world2: require('../assets/audio/music_world2.mp3'),
  world3: require('../assets/audio/music_world3.mp3'),
  shop: require('../assets/audio/music_shop.ogg'),
};

export type Sfx = keyof typeof FILES;
export type Track = keyof typeof MUSIC;

const MUSIC_VOLUME = 0.25;
const MUSIC_DUCKED = 0.07;

let sfxOn = true;
let musicOn = true;
let appActive = true;
let track: Track = 'home';
const players: Partial<Record<Sfx, AudioPlayer>> = {};
const tracks: Partial<Record<Track, AudioPlayer>> = {};
let playing: AudioPlayer | null = null;

export function initAudio() {
  setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers' }).catch(
    () => {},
  );
  // create effect players up front so the first tap is not delayed
  (Object.keys(FILES) as Sfx[]).forEach((k) => {
    try {
      players[k] = createAudioPlayer(FILES[k]);
    } catch {}
  });
}

export function sfx(name: Sfx) {
  if (!sfxOn) return;
  const p = players[name];
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch {}
}

export function setSfxEnabled(v: boolean) {
  sfxOn = v;
}

function sync() {
  try {
    const want = musicOn && appActive ? track : null;
    const next = want ? (tracks[want] ??= makeTrack(want)) : null;
    if (playing && playing !== next) playing.pause();
    if (next && playing !== next) {
      next.seekTo(0);
      next.play();
    }
    playing = next;
  } catch {}
}

function makeTrack(t: Track) {
  const p = createAudioPlayer(MUSIC[t]);
  p.loop = true;
  p.volume = MUSIC_VOLUME;
  return p;
}

/** Switch the background music (each map world has its own). */
export function playMusic(t: Track) {
  if (t === track && playing) return;
  track = t;
  sync();
}

export function setMusicEnabled(v: boolean) {
  musicOn = v;
  sync();
}

export function setAppActive(v: boolean) {
  appActive = v;
  sync();
}

/** Lower the music while the voice is talking so the words are easy to hear. */
export function duckMusic(down: boolean) {
  if (playing) playing.volume = down ? MUSIC_DUCKED : MUSIC_VOLUME;
}
