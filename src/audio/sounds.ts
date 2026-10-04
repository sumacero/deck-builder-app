import type { AudioSource } from 'expo-audio';

export type SoundId =
  | 'cardPlay'
  | 'hit'
  | 'heavyHit'
  | 'guard'
  | 'blockGain'
  | 'playerHurt'
  | 'potion'
  | 'relic'
  | 'victory'
  | 'defeat'
  | 'upgrade'
  | 'heal'
  | 'mapSelect'
  | 'coin'
  | 'slotIn';

type SoundDef = {
  source: AudioSource;
  volume: number;
};

/** 音源は scripts/generate-sounds.mjs で合成している（npm run sounds）。 */
export const SOUNDS: Record<SoundId, SoundDef> = {
  cardPlay: { source: require('../../assets/sounds/card-play.wav'), volume: 0.6 },
  hit: { source: require('../../assets/sounds/hit.wav'), volume: 0.9 },
  heavyHit: { source: require('../../assets/sounds/heavy-hit.wav'), volume: 1 },
  guard: { source: require('../../assets/sounds/guard.wav'), volume: 0.7 },
  blockGain: { source: require('../../assets/sounds/block-gain.wav'), volume: 0.5 },
  playerHurt: { source: require('../../assets/sounds/player-hurt.wav'), volume: 0.8 },
  potion: { source: require('../../assets/sounds/potion.wav'), volume: 0.7 },
  relic: { source: require('../../assets/sounds/relic.wav'), volume: 0.5 },
  victory: { source: require('../../assets/sounds/victory.wav'), volume: 0.7 },
  defeat: { source: require('../../assets/sounds/defeat.wav'), volume: 0.8 },
  upgrade: { source: require('../../assets/sounds/upgrade.wav'), volume: 0.8 },
  heal: { source: require('../../assets/sounds/heal.wav'), volume: 0.6 },
  mapSelect: { source: require('../../assets/sounds/map-select.wav'), volume: 0.6 },
  coin: { source: require('../../assets/sounds/coin.wav'), volume: 0.5 },
  slotIn: { source: require('../../assets/sounds/slot-in.wav'), volume: 0.7 },
};
