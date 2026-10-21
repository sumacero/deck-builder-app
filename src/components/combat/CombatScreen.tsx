import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { Region } from '../../domain/act';
import type { CardInstance } from '../../domain/card';
import type { CombatEvent, CombatSetup, CombatState, DamagePreview, EnemyUid, PlayerState } from '../../domain/combat';
import type { CombatResult } from '../../domain/run';
import { battleMusicFor } from '../../audio/music';
import { useMusic } from '../../hooks/useMusic';
import { useCombat } from '../../hooks/useCombat';
import { eventsDuration, useEnemyTurnBusy } from '../../hooks/useCombatEvents';
import { useCombatSounds } from '../../hooks/useCombatSounds';
import { useIsLandscape } from '../../hooks/useIsLandscape';
import { stackInstances } from '../../logic/cards';
import { deckAfterCombat, livingEnemies } from '../../logic/combat';
import { describeHandCard } from '../../logic/describe';
import { stackOf } from '../../logic/marks';
import { COLORS, COMBAT_LAYOUT, HAND_LAYOUT, ITEM_BAR, MOTION, RADIUS, SPACING } from '../../theme';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { CardPileModal } from '../cards/CardPileModal';
import { CardView } from '../cards/CardView';
import { DeckButton } from '../cards/DeckButton';
import { SettingsButton } from '../settings/SettingsButton';
import { ItemBar } from '../items/ItemBar';
import { type DropTarget } from './cardDrop';
import { CombatFooter, type CombatPile } from './CombatFooter';
import { CombatLog } from './CombatLog';
import { CombatResultOverlay } from './CombatResultOverlay';
import { ArteCutIn } from './effects/ArteCutIn';
import { DamageVignette } from './effects/DamageVignette';
import { EnemyRow } from './EnemyRow';
import { EnergyOrb } from './EnergyOrb';
import { PileTravel } from './effects/PileTravel';
import { Hand } from './Hand';
import { PlayerPanel } from './PlayerPanel';
import { landscapeFigures, portraitFigures, type Size } from './stageLayout';
import { useCardDrag } from './useCardDrag';

type Pile = 'draw' | 'discard' | 'exhaust';
type OpenPile = Pile | null;

const PILE_VIEW: Record<Pile, { title: string; note: string }> = {
  draw: { title: '山札', note: '残っているカードです。順番はシャッフルされます。' },
  discard: { title: '捨て札', note: '使ったカードと、ターン終了で捨てたカード。' },
  exhaust: { title: '廃棄札', note: 'この戦闘ではもう使えないカード（廃棄・パワー・重ねて消した札）。戦闘が終わればデッキに戻ります。' },
};

/** 捨て札・廃棄札は新しいものから並べる。 */
const pileCards = (state: CombatState, pile: Pile): CardInstance[] => {
  if (pile === 'draw') return state.drawPile;
  return [...(pile === 'discard' ? state.discardPile : state.exhaustPile)].reverse();
};

/** ポーションを使う相手の敵を、タップで選んでいる最中。カードは摘んで動かして使う。 */
type Pending = { kind: 'potion'; slot: number };

type CombatScreenProps = {
  setup: CombatSetup;
  seed: number;
  /** 背景画像と BGM を選ぶための地域。 */
  region: Region;
  onFinish: (result: CombatResult) => void;
};

const NO_SIZE: Size = { width: 0, height: 0 };
const NO_REVEALED: ReadonlySet<number> = new Set();

const sizeOf = (e: LayoutChangeEvent): Size => ({
  width: e.nativeEvent.layout.width,
  height: e.nativeEvent.layout.height,
});

/**
 * 戦闘画面。縦向きは上に敵・左下に自分・下に手札。
 * 横向きは左の列に所持品・自分・エナジー、右に敵と手札を置く。
 */
export function CombatScreen({ setup, seed, region, onFinish }: CombatScreenProps) {
  const {
    state,
    playCard,
    fuseInHand,
    resolveFuseAim,
    resolveHandRemoval,
    drinkPotion,
    discardPotion,
    endTurn,
    isPlayable,
    isDrinkable,
    potionNeedsTarget,
    previewDamage,
  } = useCombat(setup, seed);
  const landscape = useIsLandscape();
  const { height: windowHeight } = useWindowDimensions();
  const [openPile, setOpenPile] = useState<OpenPile>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [stageSize, setStageSize] = useState(NO_SIZE);
  const [playerSlotSize, setPlayerSlotSize] = useState(NO_SIZE);
  const inProgress = state.status === 'playerTurn';
  const enemyTurnBusy = useEnemyTurnBusy(state.events);
  const handRemoval = state.pendingHandRemoval;
  const choosingHand = Boolean(handRemoval) && inProgress && !enemyTurnBusy;
  const canAct = inProgress && !enemyTurnBusy && !state.pendingFuse && !handRemoval;
  const canPickFuse = inProgress && !enemyTurnBusy && Boolean(state.pendingFuse);
  const effectsTime = eventsDuration(state.events);
  useCombatSounds(state.events);
  // 決着したら、勝敗の効果音が聞こえるようにフェードアウトする。
  useMusic(inProgress ? battleMusicFor(setup.rank, region) : null);

  const [cardWidth, setCardWidth] = useState(0);
  const handView = useRef<View | null>(null);
  const pileViews = useRef<Partial<Record<CombatPile, View | null>>>({});
  const [shownTravels, setShownTravels] = useState<{ events: CombatEvent[]; ids: ReadonlySet<number> }>({
    events: state.events,
    ids: NO_REVEALED,
  });
  const revealedTravels = shownTravels.events === state.events ? shownTravels.ids : NO_REVEALED;
  const concealedIds = new Set<string>();
  for (const event of state.events) {
    if (event.kind === 'pileTravel' && event.to === 'hand' && !revealedTravels.has(event.id)) {
      concealedIds.add(event.card.instanceId);
    }
  }
  const revealTravel = (id: number) => {
    setShownTravels((prev) => {
      const ids = new Set(prev.events === state.events ? prev.ids : []);
      if (ids.has(id) && prev.events === state.events) return prev;
      ids.add(id);
      return { events: state.events, ids };
    });
  };
  const bindPile = useCallback((pile: CombatPile, node: View | null) => {
    pileViews.current[pile] = node;
  }, []);
  const {
    drag,
    hover,
    stackHover,
    lifted,
    ghost,
    cardHandlers,
    potionHandlers,
    bindContainer,
    measureContainer,
    bindHand,
    bindEnemy,
    bindPlayer,
  } = useCardDrag({
    hand: state.hand,
    enemies: state.enemies,
    potions: state.potions,
    cardWidth,
    picking: choosingHand,
    onPickCard: resolveHandRemoval,
    onPlayCard: (instanceId, target) => {
      if (!canAct) return;
      playCard(instanceId, target);
    },
    onFuse: (sourceId, targetId) => {
      if (!canAct) return;
      fuseInHand(sourceId, targetId);
    },
    onDrinkPotion: (slot, target) => {
      if (!canAct) return;
      drinkPotion(slot, target);
    },
  });
  const bindHandNode = useCallback(
    (node: View | null) => {
      handView.current = node;
      bindHand(node);
    },
    [bindHand],
  );

  const enemyCount = state.enemies.length;
  const figures = landscape
    ? landscapeFigures(stageSize, playerSlotSize, enemyCount)
    : portraitFigures(stageSize, enemyCount);

  const living = livingEnemies(state).map((enemy) => enemy.uid);
  // 選んでいる最中にポーションが無くなったら、取り消し扱い。
  const activePending = isPendingValid(pending, isDrinkable) ? pending : null;
  const fusePending = state.pendingFuse;
  const selectingEnemy = Boolean(fusePending || (activePending && !drag));
  const selectHighlight = fusePending
    ? fusePending.candidates
    : activePending
      ? living
      : [];

  let previews: DamagePreview[] = [];
  if (drag?.kind === 'card' && hover && hover.kind !== 'self') {
    previews = previewDamage(drag.instanceId, hover.kind === 'enemy' ? hover.uid : undefined);
  }

  const onDrink = (slot: number) => {
    if (!canAct) return;
    if (potionNeedsTarget(slot)) setPending({ kind: 'potion', slot });
    else drinkPotion(slot);
  };
  const onEndTurn = () => {
    setPending(null);
    endTurn();
  };
  const onSelectEnemy = (uid: EnemyUid) => {
    if (fusePending) {
      if (!canPickFuse || !fusePending.candidates.includes(uid)) return;
      resolveFuseAim(uid);
      return;
    }
    if (!canAct || !activePending) return;
    setPending(null);
    drinkPotion(activePending.slot, uid);
  };
  const hint =
    drag && lifted
      ? dragHint(drag.kind, hover, stackHover !== null, drag.kind === 'card' && drag.card.target === 'self')
      : null;
  const heldCard =
    drag?.kind === 'card' ? state.hand.find((card) => card.instanceId === drag.instanceId) : undefined;
  const stackTarget = stackHover
    ? state.hand.find((card) => card.instanceId === stackHover)
    : undefined;
  const stackForecast = heldCard && stackTarget ? forecastStack(heldCard, state.player) : null;

  const itemBar = (
    <ItemBar
      relics={state.relics}
      potions={state.potions}
      events={state.events}
      onDiscardPotion={discardPotion}
      potionUse={{
        isDrinkable: (slot) => canAct && isDrinkable(slot),
        onDrink,
        drag: potionHandlers,
        draggingSlot: drag?.kind === 'potion' ? drag.slot : null,
      }}
    />
  );
  const enemyRow = (
    <EnemyRow
      enemies={state.enemies}
      player={state.player}
      events={state.events}
      defeatDelay={effectsTime}
      agentId={setup.agent.id}
      figureSize={figures.enemy}
      compact={figures.compact}
      soloWidthRatio={landscape ? 0.5 : COMBAT_LAYOUT.soloEnemyWidthRatio}
      previews={previews}
      highlighted={drag ? highlightedEnemies(hover, living) : selectHighlight}
      onSelect={selectingEnemy ? onSelectEnemy : undefined}
      registerView={bindEnemy}
    />
  );
  const playerPanel = (
    <PlayerPanel
      agent={setup.agent}
      player={state.player}
      events={state.events}
      defeatDelay={effectsTime}
      figureSize={figures.player}
      highlighted={hover?.kind === 'self'}
      viewRef={bindPlayer}
    />
  );
  const fuseHint =
    fusePending?.kind === 'block'
      ? 'ブロックがある敵をタップ（半分にする）'
      : fusePending?.kind === 'multiHit'
        ? '連続攻撃の敵をタップ（回数を減らす）'
        : null;
  const removalHint = handRemoval
    ? handRemoval.mode === 'exhaust'
      ? `廃棄する札をタップ（あと ${handRemoval.left} 枚）`
      : `捨てる札をタップ（あと ${handRemoval.left} 枚）`
    : null;
  const hintRow =
    removalHint && choosingHand ? (
      <View style={styles.hintRow}>
        <Text style={styles.hint}>{removalHint}</Text>
      </View>
    ) : fuseHint && !drag ? (
      <View style={styles.hintRow}>
        <Text style={styles.hint}>{fuseHint}</Text>
      </View>
    ) : activePending && !drag ? (
      <View style={styles.hintRow}>
        <Text style={styles.hint}>
          ポーションを使う敵をタップ
        </Text>
        <Pressable
          onPress={() => setPending(null)}
          style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
        >
          <Text style={styles.cancelText}>やめる</Text>
        </Pressable>
      </View>
    ) : (
      hint && (
        <View style={[styles.hintRow, styles.passThrough]}>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      )
    );
  const energyOrb = <EnergyOrb energy={state.player.energy} maxEnergy={state.player.maxEnergy} />;
  const turnLabel = <Text style={styles.turn}>TURN {state.turn}</Text>;
  const hand = (
    <Hand
      cards={state.hand}
      player={state.player}
      events={state.events}
      concealedIds={concealedIds}
      locked={enemyTurnBusy}
      choosing={choosingHand}
      isPlayable={isPlayable}
      draggingId={drag?.kind === 'card' ? drag.instanceId : null}
      selectedId={null}
      viewRef={bindHandNode}
      onCardWidth={setCardWidth}
      maxCardHeight={landscape ? windowHeight * COMBAT_LAYOUT.landscapeCardHeightRatio : undefined}
      {...cardHandlers}
      style={landscape ? styles.landscapeHand : styles.portraitHand}
    />
  );
  const footer = (
    <CombatFooter
      drawCount={state.drawPile.length}
      discardCount={state.discardPile.length}
      exhaustCount={state.exhaustPile.length}
      canEndTurn={canAct}
      onEndTurn={onEndTurn}
      onOpenDraw={() => setOpenPile('draw')}
      onOpenDiscard={() => setOpenPile('discard')}
      onOpenExhaust={() => setOpenPile('exhaust')}
      onPileRef={bindPile}
      vertical={landscape}
    />
  );

  return (
    <SceneBackground region={region} scene="combat">
      <View
        ref={bindContainer}
        onLayout={measureContainer}
        style={landscape ? styles.landscape : styles.portrait}
      >
        {landscape ? (
          <>
            <View style={styles.side}>
              {itemBar}
              <View style={styles.sidePlayer} onLayout={(e) => setPlayerSlotSize(sizeOf(e))}>
                {playerPanel}
              </View>
              <View style={styles.sideBottom}>
                {energyOrb}
                {turnLabel}
                <DeckButton deck={setup.deck} />
                <SettingsButton />
              </View>
            </View>
            <View style={styles.main}>
              <View style={styles.landscapeStage} onLayout={(e) => setStageSize(sizeOf(e))}>
                {enemyRow}
                {hintRow}
              </View>
              <View style={styles.bottomRow}>
                {hand}
                <View style={styles.landscapeFooter}>{footer}</View>
              </View>
            </View>
          </>
        ) : (
          <>
            {itemBar}
            <View style={styles.turnRow}>
              <View style={styles.turnRowSide}>
                <SettingsButton />
              </View>
              {turnLabel}
              <View style={[styles.turnRowSide, styles.turnRowEnd]}>
                <DeckButton deck={setup.deck} />
              </View>
            </View>
            <View style={styles.portraitStage} onLayout={(e) => setStageSize(sizeOf(e))}>
              {enemyRow}
              <View style={styles.playerSlot}>{playerPanel}</View>
              {hintRow}
            </View>
            <View style={styles.infoRow}>
              {energyOrb}
              <CombatLog entries={state.log} />
            </View>
            {hand}
            {footer}
          </>
        )}
        <PileTravel
          events={state.events}
          hand={state.hand}
          player={state.player}
          cardWidth={cardWidth}
          handView={handView}
          pileViews={pileViews}
          onReveal={revealTravel}
        />
        <DamageVignette events={state.events} />
        <ArteCutIn events={state.events} agentName={setup.agent.name} />
        {drag && (
          <Animated.View style={[styles.ghost, { transform: ghost.getTranslateTransform() }]}>
            {drag.kind === 'card' ? (
              <>
                {stackForecast && (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.stackForecast,
                      { marginLeft: (cardWidth - HAND_LAYOUT.stackForecastWidth) / 2 },
                    ]}
                  >
                    <Text style={styles.stackForecastLabel}>
                      {stackForecast.name}（{stackForecast.stack} 段）
                    </Text>
                    <Text style={styles.stackForecastText}>{stackForecast.description}</Text>
                  </View>
                )}
                <CardView
                  card={drag.card}
                  width={cardWidth}
                  selected={hover !== null || stackHover !== null}
                  description={heldCard ? describeHandCard(heldCard, state.player) : undefined}
                  stack={heldCard ? stackOf(heldCard) : 1}
                  detailOnHold={false}
                />
              </>
            ) : (
              <View style={[styles.potionGhost, hover !== null && styles.potionGhostAimed]}>
                <Text style={styles.potionGhostIcon}>{drag.potion.icon}</Text>
              </View>
            )}
          </Animated.View>
        )}
        {openPile && (
          <CardPileModal
            title={PILE_VIEW[openPile].title}
            note={PILE_VIEW[openPile].note}
            stacks={stackInstances(pileCards(state, openPile), (instance) =>
              describeHandCard(instance, state.player),
            )}
            onClose={() => setOpenPile(null)}
          />
        )}
        {state.status !== 'playerTurn' && (
          <CombatResultOverlay
            status={state.status}
            turn={state.turn}
            hp={state.player.hp}
            maxHp={state.player.maxHp}
            appearDelay={effectsTime + MOTION.defeat + MOTION.resultExtraDelay}
            onContinue={() =>
              onFinish({
                status: state.status === 'won' ? 'won' : 'lost',
                playerHp: state.player.hp,
                playerMaxHp: state.player.maxHp,
                potions: state.potions,
                deck: deckAfterCombat(state, setup.deck),
                stats: state.stats,
              })
            }
          />
        )}
      </View>
    </SceneBackground>
  );
}

function highlightedEnemies(hover: DropTarget | null, living: EnemyUid[]): EnemyUid[] {
  switch (hover?.kind) {
    case 'enemy':
      return [hover.uid];
    case 'allEnemies':
      return living;
    default:
      return [];
  }
}

/** 重ねたあとに残る札（摘んでいた札）の、段が倍になった説明。 */
function forecastStack(source: CardInstance, player: PlayerState): { name: string; stack: number; description: string } {
  const stack = stackOf(source) * 2;
  return {
    name: source.card.name,
    stack,
    description: describeHandCard({ ...source, stack }, player),
  };
}

function dragHint(
  kind: 'card' | 'potion',
  hover: DropTarget | null,
  stacking: boolean,
  selfCard: boolean,
): string {
  if (stacking) return '離して重ねる';
  if (hover) return '離して使う';
  if (selfCard) return '自分の上で離す';
  return kind === 'card' ? 'もっと上まで持ち上げて離す' : '使う相手のほうへ動かして離す';
}

function isPendingValid(pending: Pending | null, isDrinkable: (slot: number) => boolean): boolean {
  return pending !== null && isDrinkable(pending.slot);
}

const styles = StyleSheet.create({
  portrait: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  landscape: { flex: 1, flexDirection: 'row', padding: SPACING.sm, gap: SPACING.md },
  /** 縦向きの手札は画面の左右いっぱいまで使う。 */
  portraitHand: { marginHorizontal: -SPACING.lg },
  landscapeHand: { flex: 1 },
  /** 左右の列を同じ幅にして、TURN を真ん中に置く。行の高さはボタンに合わせる。 */
  turnRow: { flexDirection: 'row', alignItems: 'center' },
  turnRowSide: { flex: 1, alignItems: 'flex-start' },
  turnRowEnd: { alignItems: 'flex-end' },
  /** 上に敵、下にエージェント。自分へのカード判定は下段を横いっぱいに使う。 */
  portraitStage: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.sm },
  playerSlot: { alignSelf: 'stretch' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, height: 64 },
  /** 所持品の説明欄が右の舞台の上に重なって見えるよう、右の列より手前に置く。 */
  side: {
    width: `${COMBAT_LAYOUT.landscapeSideRatio * 100}%`,
    gap: SPACING.sm,
    zIndex: 10,
    elevation: 10,
  },
  sidePlayer: { flex: 1, justifyContent: 'center' },
  sideBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  main: { flex: 1, gap: SPACING.xs },
  landscapeStage: { flex: 1, justifyContent: 'center' },
  bottomRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  landscapeFooter: { width: COMBAT_LAYOUT.landscapeFooterWidth, alignSelf: 'center' },
  turn: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
  },
  hintRow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.overlay,
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  passThrough: { pointerEvents: 'none' },
  hint: { color: COLORS.gold, fontSize: 13, fontWeight: '800' },
  cancel: {
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  cancelText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  ghost: { position: 'absolute', left: 0, top: 0, pointerEvents: 'none' },
  /** 持ち上げたカードの上。指はカードの下寄りにあるので、説明はここなら隠れない。 */
  stackForecast: {
    position: 'absolute',
    bottom: '100%',
    width: HAND_LAYOUT.stackForecastWidth,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.overlay,
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  stackForecastLabel: { color: COLORS.gold, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  stackForecastText: { color: COLORS.text, fontSize: 13, lineHeight: 18, textAlign: 'center' },
  potionGhost: {
    width: ITEM_BAR.potionGhostSize,
    height: ITEM_BAR.potionGhostSize,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  potionGhostAimed: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
  potionGhostIcon: { fontSize: 24 },
});
