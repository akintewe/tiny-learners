import * as Speech from 'expo-speech';
import { duckMusic } from './sound';

let enabled = true;
let current = 0;

export function setSoundEnabled(v: boolean) {
  enabled = v;
  if (!v) Speech.stop();
}

export function speak(text: string) {
  if (!enabled) return;
  Speech.stop();
  duckMusic(true);
  // a stopped earlier phrase must not un-duck the music under this one
  const id = ++current;
  const done = () => {
    if (id === current) duckMusic(false);
  };
  Speech.speak(text, {
    language: 'en-US',
    rate: 0.8,
    pitch: 1.15,
    onDone: done,
    onStopped: done,
    onError: done,
  });
}
