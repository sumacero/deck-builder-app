import type { SoundId } from './sounds';

type SceneCue = {
  se: SoundId;
  /** その場に人がいるときだけ。効果音の少しあとに鳴らす。 */
  voice?: SoundId;
};

/**
 * 場所を開いたときの効果音と声。
 * 人がいない場所は効果音だけ。結末の文章で鳴らし直さないよう、場所の id を鍵にする。
 */
export const SCENE_CUES: Record<string, SceneCue> = {
  shop: { se: 'shopBell', voice: 'voiceMerchant' },
  rest: { se: 'campfire' },
  treasure: { se: 'chestOpen' },
  blessing: { se: 'lanternChime', voice: 'voiceGuide' },
  'old-shrine': { se: 'shrineBell' },
  'healing-spring': { se: 'springWater' },
  'blood-merchant': { se: 'vialClink', voice: 'voiceMerchant' },
  'wandering-smith': { se: 'forgeHammer', voice: 'voiceSmith' },
  'sleeping-guardian': { se: 'snore', voice: 'voiceGuardian' },
  'wandering-bard': { se: 'bardStrings', voice: 'voiceBard' },
  'cursed-tome': { se: 'tomePages' },
  'fusion-altar': { se: 'altarHum' },
  pitfall: { se: 'pitRubble' },
  'fairy-ring': { se: 'fairyChime', voice: 'voiceFairy' },
  'abandoned-camp': { se: 'campfire' },
  'dragon-hoard': { se: 'dragonRumble' },
  'mirror-lake': { se: 'lakeRipple' },
  'knight-trial': { se: 'knightSteel', voice: 'voiceKnight' },
  'wishing-well': { se: 'wellDrop' },
  'ancient-library': { se: 'libraryPages' },
  'traveling-alchemist': { se: 'vialClink', voice: 'voiceAlchemist' },
  'grasping-tree': { se: 'treeCreak' },
  'wayside-fortune': { se: 'stoneChime', voice: 'voiceFortune' },
  'roadside-stone': { se: 'stoneChime' },
  'sealed-reliquary': { se: 'reliquaryLock' },
  'abandoned-banner': { se: 'bannerCloth' },
  'abyss-whisper': { se: 'whisperWind', voice: 'voiceWhisper' },
  'fallen-crown': { se: 'crownMetal' },
  'cinder-practice': { se: 'practiceSlash', voice: 'voiceKyle' },
  'wildfire-stage': { se: 'practiceSlash', voice: 'voiceKyle' },
  'falling-ember-wing': { se: 'practiceSlash', voice: 'voiceKyle' },
  'dew-footing': { se: 'bowString', voice: 'voiceRine' },
  'thorn-stage': { se: 'bowString', voice: 'voiceRine' },
  'restring-signal': { se: 'bowString', voice: 'voiceRine' },
  'mist-basin': { se: 'waterDrop', voice: 'voiceNoah' },
  'returning-stage': { se: 'waterDrop', voice: 'voiceNoah' },
  'double-reflection-wing': { se: 'waterDrop', voice: 'voiceNoah' },
  'basin-oracle': { se: 'waterDrop', voice: 'voiceNoah' },
};

export function sceneCue(id: string): SceneCue | null {
  return SCENE_CUES[id] ?? null;
}
