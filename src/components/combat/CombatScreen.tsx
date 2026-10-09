import { useCallback, useState } from 'react';
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
import type { CombatSetup, CombatState, DamagePreview, EnemyUid } from '../../domain/combat';
import type { CombatResult } from '../../domain/run';
import { battleMusicFor } from '../../audio/music';
import { useMusic } from '../../hooks/useMusic';
import { useCombat } from '../../hooks/useCombat';
import { eventsDuration } from '../../hooks/useCombatEvents';
import { useCombatSounds } from '../../hooks/useCombatSounds';
import { useIsLandscape } from '../../hooks/useIsLandscape';
import { stackInstances } from '../../logic/cards';
import { deckAfterCombat, livingEnemies } from '../../logic/combat';
import { COLORS, COMBAT_LAYOUT, ITEM_BAR, MOTION, RADIUS, SPACING } from '../../theme';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { CardPileModal } from '../cards/CardPileModal';
import { CardView } from '../cards/CardView';
import { DeckButton } from '../cards/DeckButton';
import { SettingsButton } from '../settings/SettingsButton';
import { ItemBar } from '../items/ItemBar';
import { canPlayByTap, type DropTarget } from './cardDrop';
import { CombatFooter } from './CombatFooter';
import { CombatLog } from './CombatLog';
import { CombatResultOverlay } from './CombatResultOverlay';
import { ArteCutIn } from './effects/ArteCutIn';
import { DamageVignette } from './effects/DamageVignette';
import { EnemyRow } from './EnemyRow';
import { EnergyOrb } from './EnergyOrb';
import { Hand } from './Hand';
import { PlayerPanel } from './PlayerPanel';
import { landscapeFigures, portraitFigures, type Size } from './stageLayout';
import { useCardDrag } from './useCardDrag';

type Pile = 'draw' | 'discard' | 'exhaust';
type OpenPile = Pile | null;

const PILE_VIEW: Record<Pile, { title: string; note: string }> = {
  draw: { title: '山札', note: '残っているカードです。順番はシャッフルされます。' },
  discard: { title: '捨て札', note: '使ったカードと、ターン終了で捨てたカード。' },
  exhaust: { title: '廃棄札', note: 'この戦闘ではもう使えないカード（廃棄・パワーなど）。戦闘が終わればデッキに戻ります。' },
};

/** 捨て札・廃棄札は新しいものから並べる。 */
const pileCards = (state: CombatState, pile: Pile): CardInstance[] => {
  if (pile === 'draw') return state.drawPile;
  return [...(pile === 'discard' ? state.discardPile : state.exhaustPile)].reverse();
};

/** タップしたあと、使う相手の敵をタップで選んでいる最中のもの。 */
type Pending = { kind: 'card'; instanceId: string } | { kind: 'potion'; slot: number };

type CombatScreenProps = {
  setup: CombatSetup;
  seed: number;
  /** 背景画像と BGM を選ぶための地域。 */
  region: Region;
  onFinish: (result: CombatResult) => void;
};

const NO_SIZE: Size = { width: 0, height: 0 };

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
    drinkPotion,
    discardPotion,
    endTurn,
    togglePin,
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
  const effectsTime = eventsDuration(state.events);
  useCombatSounds(state.events);
  // 決着したら、勝敗の効果音が聞こえるようにフェードアウトする。
  useMusic(inProgress ? battleMusicFor(setup.rank, region) : null);

  const [cardWidth, setCardWidth] = useState(0);
  const {
    drag,
    hover,
    lifted,
    ghost,
    cardHandlers,
    potionHandlers,
    bindContainer,
    measureContainer,
    bindHand,
    bindEnemy,
  } = useCardDrag({
    hand: state.hand,
    enemies: state.enemies,
    potions: state.potions,
    cardWidth,
    onPlayCard: playCard,
    onDrinkPotion: drinkPotion,
  });

  const enemyCount = state.enemies.length;
  const figures = landscape
    ? landscapeFigures(stageSize, playerSlotSize, enemyCount)
    : portraitFigures(stageSize, enemyCount);

  const living = livingEnemies(state).map((enemy) => enemy.uid);
  // 選んでいる最中に、そのカードが使えなくなった（ターン終了など）・ポーションが無くなったら取り消し扱い。
  const activePending = isPendingValid(pending, state.hand, isPlayable, isDrinkable) ? pending : null;
  const pendingCardId = activePending?.kind === 'card' ? activePending.instanceId : null;

  let previews: DamagePreview[] = [];
  if (drag?.kind === 'card' && hover && hover.kind !== 'self') {
    previews = previewDamage(drag.instanceId, hover.kind === 'enemy' ? hover.uid : undefined);
  } else if (!drag && pendingCardId) {
    previews = living.flatMap((uid) =>
      previewDamage(pendingCardId, uid).filter((preview) => preview.uid === uid),
    );
  }

  const onDrink = (slot: number) => {
    if (potionNeedsTarget(slot)) setPending({ kind: 'potion', slot });
    else drinkPotion(slot);
  };
  // 手札のジェスチャーはこの関数ごと作られるので、戦闘の状態が変わらない間は同じ関数を渡す。
  const onTapCard = useCallback(
    (instanceId: string) => {
      const instance = state.hand.find((c) => c.instanceId === instanceId);
      if (!instance || !isPlayable(instanceId)) return;
      if (canPlayByTap(instance.card.target, livingEnemies(state).length)) {
        setPending(null);
        playCard(instanceId);
        return;
      }
      // もう一度タップしたら取りやめ。別のカードをタップしたら、そちらに持ち替える。
      setPending((prev) =>
        prev?.kind === 'card' && prev.instanceId === instanceId ? null : { kind: 'card', instanceId },
      );
    },
    [state, isPlayable, playCard],
  );
  const onSelectEnemy = (uid: EnemyUid) => {
    if (!activePending) return;
    setPending(null);
    if (activePending.kind === 'card') playCard(activePending.instanceId, uid);
    else drinkPotion(activePending.slot, uid);
  };
  const hint = drag && lifted ? dragHint(drag.kind, hover) : null;

  const itemBar = (
    <ItemBar
      relics={state.relics}
      potions={state.potions}
      events={state.events}
      onDiscardPotion={discardPotion}
      potionUse={{
        isDrinkable,
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
      highlighted={drag ? highlightedEnemies(hover, living) : activePending ? living : []}
      onSelect={activePending && !drag ? onSelectEnemy : undefined}
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
    />
  );
  const hintRow =
    activePending && !drag ? (
      <View style={styles.hintRow}>
        <Text style={styles.hint}>
          {activePending.kind === 'card' ? 'カードを使う敵をタップ' : 'ポーションを使う敵をタップ'}
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
      events={state.events}
      isPlayable={isPlayable}
      onTogglePin={togglePin}
      draggingId={drag?.kind === 'card' ? drag.instanceId : null}
      selectedId={pendingCardId}
      viewRef={bindHand}
      onCardWidth={setCardWidth}
      maxCardHeight={landscape ? windowHeight * COMBAT_LAYOUT.landscapeCardHeightRatio : undefined}
      {...cardHandlers}
      onTap={onTapCard}
      style={landscape ? styles.landscapeHand : styles.portraitHand}
    />
  );
  const footer = (
    <CombatFooter
      drawCount={state.drawPile.length}
      discardCount={state.discardPile.length}
      exhaustCount={state.exhaustPile.length}
      canEndTurn={inProgress}
      onEndTurn={endTurn}
      onOpenDraw={() => setOpenPile('draw')}
      onOpenDiscard={() => setOpenPile('discard')}
      onOpenExhaust={() => setOpenPile('exhaust')}
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
              <View style={styles.settings}>
                <SettingsButton />
              </View>
              {turnLabel}
              <View style={styles.deck}>
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
        <DamageVignette events={state.events} />
        <ArteCutIn events={state.events} agentName={setup.agent.name} />
        {drag && (
          <Animated.View style={[styles.ghost, { transform: ghost.getTranslateTransform() }]}>
            {drag.kind === 'card' ? (
              <CardView
                card={drag.card}
                width={cardWidth}
                selected={hover !== null}
                detailOnHold={false}
              />
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
            stacks={stackInstances(pileCards(state, openPile))}
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

function dragHint(kind: 'card' | 'potion', hover: DropTarget | null): string {
  if (hover) return '離して使う';
  return kind === 'card' ? 'もっと上まで持ち上げて離す' : '使う相手のほうへ動かして離す';
}

function isPendingValid(
  pending: Pending | null,
  hand: readonly { instanceId: string }[],
  isPlayable: (instanceId: string) => boolean,
  isDrinkable: (slot: number) => boolean,
): boolean {
  if (!pending) return false;
  if (pending.kind === 'potion') return isDrinkable(pending.slot);
  return hand.some((c) => c.instanceId === pending.instanceId) && isPlayable(pending.instanceId);
}

const styles = StyleSheet.create({
  portrait: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  landscape: { flex: 1, flexDirection: 'row', padding: SPACING.sm, gap: SPACING.md },
  /** 縦向きの手札は画面の左右いっぱいまで使う。 */
  portraitHand: { marginHorizontal: -SPACING.lg },
  landscapeHand: { flex: 1 },
  turnRow: { justifyContent: 'center' },
  settings: { position: 'absolute', left: 0, top: 0, bottom: 0, justifyContent: 'center' },
  /** 上に敵、左下にエージェント。斜めに向かい合って画面を広く使う。 */
  portraitStage: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.sm },
  playerSlot: { alignSelf: 'flex-start', width: `${COMBAT_LAYOUT.playerWidthRatio * 100}%` },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, height: 64 },
  deck: { position: 'absolute', right: 0 },
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
