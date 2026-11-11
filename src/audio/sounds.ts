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
  | 'slotIn'
  | 'handFull'
  | 'fuse'
  | 'shrineBell'
  | 'springWater'
  | 'shopBell'
  | 'forgeHammer'
  | 'snore'
  | 'bardStrings'
  | 'tomePages'
  | 'altarHum'
  | 'pitRubble'
  | 'fairyChime'
  | 'campfire'
  | 'dragonRumble'
  | 'lakeRipple'
  | 'knightSteel'
  | 'wellDrop'
  | 'libraryPages'
  | 'vialClink'
  | 'treeCreak'
  | 'stoneChime'
  | 'reliquaryLock'
  | 'bannerCloth'
  | 'whisperWind'
  | 'crownMetal'
  | 'practiceSlash'
  | 'bowString'
  | 'waterDrop'
  | 'chestOpen'
  | 'lanternChime'
  | 'exchange'
  | 'voiceMerchant'
  | 'voiceSmith'
  | 'voiceGuardian'
  | 'voiceBard'
  | 'voiceFairy'
  | 'voiceKnight'
  | 'voiceAlchemist'
  | 'voiceFortune'
  | 'voiceWhisper'
  | 'voiceKyle'
  | 'voiceRine'
  | 'voiceNoah'
  | 'voiceGuide';

type SoundDef = {
  source: AudioSource;
  volume: number;
};

/**
 * 効果音全体の音量。BGM とのバランスはここで調整し、各音の volume は効果音どうしの比率を表す。
 * 効果音と BGM を同じ割合で上下するときは、ここではなく `gain.ts` の OUTPUT_GAIN を変える。
 */
export const SOUND_MASTER_VOLUME = 0.51;

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
  handFull: { source: require('../../assets/sounds/hand-full.wav'), volume: 0.7 },
  fuse: { source: require('../../assets/sounds/fuse.wav'), volume: 1 },
  shrineBell: { source: require('../../assets/sounds/shrine-bell.wav'), volume: 0.7 },
  springWater: { source: require('../../assets/sounds/spring-water.wav'), volume: 0.65 },
  shopBell: { source: require('../../assets/sounds/shop-bell.wav'), volume: 0.65 },
  forgeHammer: { source: require('../../assets/sounds/forge-hammer.wav'), volume: 0.75 },
  snore: { source: require('../../assets/sounds/snore.wav'), volume: 0.6 },
  bardStrings: { source: require('../../assets/sounds/bard-strings.wav'), volume: 0.6 },
  tomePages: { source: require('../../assets/sounds/tome-pages.wav'), volume: 0.6 },
  altarHum: { source: require('../../assets/sounds/altar-hum.wav'), volume: 0.6 },
  pitRubble: { source: require('../../assets/sounds/pit-rubble.wav'), volume: 0.7 },
  fairyChime: { source: require('../../assets/sounds/fairy-chime.wav'), volume: 0.55 },
  campfire: { source: require('../../assets/sounds/campfire.wav'), volume: 0.6 },
  dragonRumble: { source: require('../../assets/sounds/dragon-rumble.wav'), volume: 0.7 },
  lakeRipple: { source: require('../../assets/sounds/lake-ripple.wav'), volume: 0.6 },
  knightSteel: { source: require('../../assets/sounds/knight-steel.wav'), volume: 0.7 },
  wellDrop: { source: require('../../assets/sounds/well-drop.wav'), volume: 0.65 },
  libraryPages: { source: require('../../assets/sounds/library-pages.wav'), volume: 0.55 },
  vialClink: { source: require('../../assets/sounds/vial-clink.wav'), volume: 0.6 },
  treeCreak: { source: require('../../assets/sounds/tree-creak.wav'), volume: 0.6 },
  stoneChime: { source: require('../../assets/sounds/stone-chime.wav'), volume: 0.6 },
  reliquaryLock: { source: require('../../assets/sounds/reliquary-lock.wav'), volume: 0.65 },
  bannerCloth: { source: require('../../assets/sounds/banner-cloth.wav'), volume: 0.55 },
  whisperWind: { source: require('../../assets/sounds/whisper-wind.wav'), volume: 0.55 },
  crownMetal: { source: require('../../assets/sounds/crown-metal.wav'), volume: 0.6 },
  practiceSlash: { source: require('../../assets/sounds/practice-slash.wav'), volume: 0.65 },
  bowString: { source: require('../../assets/sounds/bow-string.wav'), volume: 0.65 },
  waterDrop: { source: require('../../assets/sounds/water-drop.wav'), volume: 0.6 },
  chestOpen: { source: require('../../assets/sounds/chest-open.wav'), volume: 0.7 },
  lanternChime: { source: require('../../assets/sounds/lantern-chime.wav'), volume: 0.6 },
  exchange: { source: require('../../assets/sounds/exchange.wav'), volume: 0.75 },
  voiceMerchant: { source: require('../../assets/sounds/voice-merchant.wav'), volume: 0.7 },
  voiceSmith: { source: require('../../assets/sounds/voice-smith.wav'), volume: 0.7 },
  voiceGuardian: { source: require('../../assets/sounds/voice-guardian.wav'), volume: 0.65 },
  voiceBard: { source: require('../../assets/sounds/voice-bard.wav'), volume: 0.65 },
  voiceFairy: { source: require('../../assets/sounds/voice-fairy.wav'), volume: 0.6 },
  voiceKnight: { source: require('../../assets/sounds/voice-knight.wav'), volume: 0.7 },
  voiceAlchemist: { source: require('../../assets/sounds/voice-alchemist.wav'), volume: 0.65 },
  voiceFortune: { source: require('../../assets/sounds/voice-fortune.wav'), volume: 0.65 },
  voiceWhisper: { source: require('../../assets/sounds/voice-whisper.wav'), volume: 0.55 },
  voiceKyle: { source: require('../../assets/sounds/voice-kyle.wav'), volume: 0.7 },
  voiceRine: { source: require('../../assets/sounds/voice-rine.wav'), volume: 0.65 },
  voiceNoah: { source: require('../../assets/sounds/voice-noah.wav'), volume: 0.65 },
  voiceGuide: { source: require('../../assets/sounds/voice-guide.wav'), volume: 0.65 },
};
