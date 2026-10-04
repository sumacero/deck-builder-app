import { createContext, type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import type { View } from 'react-native';
import type { QueuedRunEvent, RunEvent } from '../../../domain/runEvent';

export type SlotRect = { x: number; y: number; width: number; height: number };

/** 入手したものが飛んでいく先のスロット。 */
export const slotKey = {
  relic: (id: string) => `relic:${id}`,
  potion: (slot: number) => `potion:${slot}`,
  deck: 'deck',
} as const;

/** 入手の演出が飛んでいく先。演出が順番待ちの間は、スロットに先に入って見えないよう隠す。 */
export function targetSlotOf(event: RunEvent): string | null {
  switch (event.kind) {
    case 'relicGain':
      return slotKey.relic(event.relic.id);
    case 'potionGain':
      return slotKey.potion(event.slot);
    case 'cardGain':
      return slotKey.deck;
    default:
      return null;
  }
}

export type AcquireContextValue = {
  /** 飛んでくるのを待っていて、まだ見せないスロット。 */
  hidden: ReadonlySet<string>;
  /** スロットに何かが収まった回数。増えたらスロットが弾む。 */
  landCounts: ReadonlyMap<string, number>;
  registerSlot: (key: string, view: View | null) => void;
  /** スロットの画面上の位置。そのスロットが今の画面に無ければ null。 */
  measureSlot: (key: string) => Promise<SlotRect | null>;
  land: (key: string) => void;
  /** 最後に表示した所持金。画面が変わっても、前の画面の金額から数え上げる。 */
  recallGold: () => number | null;
  rememberGold: (gold: number) => void;
  /** 戦闘の外でポーションを捨てる。戦闘中は戦闘画面が自分の処理を渡す。 */
  discardPotion?: (slot: number) => void;
};

const NO_HIDDEN: ReadonlySet<string> = new Set();
const NO_LANDS: ReadonlyMap<string, number> = new Map();

export const AcquireContext = createContext<AcquireContextValue>({
  hidden: NO_HIDDEN,
  landCounts: NO_LANDS,
  registerSlot: () => {},
  measureSlot: () => Promise.resolve(null),
  land: () => {},
  recallGold: () => null,
  rememberGold: () => {},
});

export function measureView(view: View): Promise<SlotRect | null> {
  return new Promise((resolve) => {
    view.measureInWindow((x, y, width, height) => {
      resolve(width > 0 && height > 0 ? { x, y, width, height } : null);
    });
  });
}

type AcquireProviderProps = {
  queued: readonly QueuedRunEvent[];
  discardPotion: (slot: number) => void;
  children: ReactNode;
};

/** ラン中の画面に、入手演出の飛び先（スロット）と、所持金の数え上げの記憶を配る。 */
export function AcquireProvider({ queued, discardPotion, children }: AcquireProviderProps) {
  const slots = useRef(new Map<string, View>());
  const lastGold = useRef<number | null>(null);
  const [landCounts, setLandCounts] = useState<ReadonlyMap<string, number>>(NO_LANDS);

  const hidden = useMemo(() => {
    const keys = new Set<string>();
    for (const { event } of queued) {
      const key = event.kind === 'cardGain' ? null : targetSlotOf(event);
      if (key) keys.add(key);
    }
    return keys;
  }, [queued]);

  const registerSlot = useCallback((key: string, view: View | null) => {
    if (view) slots.current.set(key, view);
    else slots.current.delete(key);
  }, []);
  const measureSlot = useCallback((key: string) => {
    const view = slots.current.get(key);
    return view ? measureView(view) : Promise.resolve(null);
  }, []);
  const land = useCallback((key: string) => {
    setLandCounts((prev) => new Map(prev).set(key, (prev.get(key) ?? 0) + 1));
  }, []);
  const recallGold = useCallback(() => lastGold.current, []);
  const rememberGold = useCallback((gold: number) => {
    lastGold.current = gold;
  }, []);

  const value = useMemo(
    () => ({
      hidden,
      landCounts,
      registerSlot,
      measureSlot,
      land,
      recallGold,
      rememberGold,
      discardPotion,
    }),
    [hidden, landCounts, registerSlot, measureSlot, land, recallGold, rememberGold, discardPotion],
  );
  return <AcquireContext.Provider value={value}>{children}</AcquireContext.Provider>;
}
