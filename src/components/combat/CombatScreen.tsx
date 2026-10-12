import { useState } from 'react';
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
import { describeFuseBurst, describeHandCard } from '../../logic/describe';
import { stackOf } from '../../logic/marks';
import { COLORS, COMBAT_LAYOUT, ITEM_BAR, MOTION, RADIUS, SPACING } from '../../theme';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { CardPileModal } from '../cards/CardPileModal';
import { CardView } from '../cards/CardView';
import { DeckButton } from '../cards/DeckButton';
import { SettingsButton } from '../settings/SettingsButton';
import { ItemBar } from '../items/ItemBar';
import { type DropTarget } from './cardDrop';
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
type Pending = { kind: 'potion'; slot: number };

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
    fuseInHand,
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
  const effectsTime = eventsDuration(state.events);
  useCombatSounds(state.events);
  // 決着したら、勝敗の効果音が聞こえるようにフェードアウトする。
  useMusic(inProgress ? battleMusicFor(setup.rank, region) : null);

  const [cardWidth, setCardWidth] = useState(0);
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
  } = useCardDrag({
    hand: state.hand,
    enemies: state.enemies,
    potions: state.potions,
    cardWidth,
    onPlayCard: playCard,
    onFuse: fuseInHand,
    onDrinkPotion: drinkPotion,
  });

  const enemyCount = state.enemies.length;
  const figures = landscape
    ? landscapeFigures(stageSize, playerSlotSize, enemyCount)
    : portraitFigures(stageSize, enemyCount);

  const living = livingEnemies(state).map((enemy) => enemy.uid);
  // ポーションの狙いを選んでいる最中に、そのポーションが無くなったら取り消し扱い。
  const activePending = pending && isDrinkable(pending.slot) ? pending : null;

  let previews: DamagePreview[] = [];
  if (drag?.kind === 'card' && hover && hover.kind !== 'self') {
    previews = previewDamage(drag.instanceId, hover.kind === 'enemy' ? hover.uid : undefined);
  }

  const onDrink = (slot: number) => {
    if (potionNeedsTarget(slot)) setPending({ kind: 'potion', slot });
    else drinkPotion(slot);
  };
  const onSelectEnemy = (uid: EnemyUid) => {
    if (!activePending) return;
    setPending(null);
    drinkPotion(activePending.slot, uid);
  };
  const hint = drag && lifted ? dragHint(drag.kind, hover, stackHover !== null) : null;
  const heldCard =
    drag?.kind === 'card' ? state.hand.find((card) => card.instanceId === drag.instanceId) : undefined;
  const underCard = stackHover ? state.hand.find((card) => card.instanceId === stackHover) : undefined;
  const stackPreview =
    heldCard && underCard
      ? previewStackedCard(heldCard, underCard, state.player)
      : null;

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
        <Text style={styles.hint}>ポーションを使う敵をタップ</Text>
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
      isPlayable={isPlayable}
      draggingId={drag?.kind === 'card' ? drag.instanceId : null}
      selectedId={null}
      viewRef={bindHand}
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
        <DamageVignette events={state.events} />
        <ArteCutIn events={state.events} agentName={setup.agent.name} />
        {drag && (
          <Animated.View style={[styles.ghost, { transform: ghost.getTranslateTransform() }]}>
            {drag.kind === 'card' ? (
              <CardView
                card={stackPreview?.card ?? drag.card}
                width={cardWidth}
                selected={hover !== null || stackHover !== null}
                description={
                  stackPreview?.description ??
                  (heldCard ? describeHandCard(heldCard, state.player) : undefined)
                }
                stack={stackPreview?.stack ?? (heldCard ? stackOf(heldCard) : 1)}
                detailOnHold={false}
              />
            ) : (
              <View style={[styles.potionGhost, hover !== null && styles.potionGhostAimed]}>
                <Text style={styles.potionGhostIcon}>{drag.potion.icon}</Text>
              </View>
            )}
          </Animated.View>
        )}
        {stackPreview && (
          <View pointerEvents="none" style={styles.stackPreview}>
            <Text style={styles.stackPreviewLabel}>こうなる</Text>
            <CardView
              card={stackPreview.card}
              description={stackPreview.description}
              stack={stackPreview.stack}
              size="md"
              detailOnHold={false}
            />
            {stackPreview.burst !== '' && (
              <Text style={styles.stackPreviewNote}>
                {stackPreview.consumed}は消える。{stackPreview.burst}
              </Text>
            )}
          </View>
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

function dragHint(kind: 'card' | 'potion', hover: DropTarget | null, stacking: boolean): string {
  if (stacking) return '離して重ねる';
  if (hover) return '離して使う';
  return kind === 'card' ? 'もっと上まで持ち上げて離す' : '使う相手のほうへ動かして離す';
}

type StackPreview = {
  card: CardInstance['card'];
  stack: number;
  description: string;
  consumed: string;
  burst: string;
};

/** 上に置こうとしている札が、重ねたあとにどうなるか。下の札は消えて、その印の効果が出る。 */
function previewStackedCard(
  top: CardInstance,
  under: CardInstance,
  player: CombatState['player'],
): StackPreview {
  const stack = stackOf(top) * 2;
  const next: CardInstance = { ...top, stack };
  return {
    card: top.card,
    stack,
    description: describeHandCard(next, player),
    consumed: under.card.name,
    burst: describeFuseBurst(under.card, stackOf(under)),
  };
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
  /** 上に敵、左下にエージェント。斜めに向かい合って画面を広く使う。 */
  portraitStage: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.sm },
  playerSlot: { alignSelf: 'flex-start', width: `${COMBAT_LAYOUT.playerWidthRatio * 100}%` },
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
  stackPreview: {
    position: 'absolute',
    top: '18%',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: SPACING.xs,
    zIndex: 30,
  },
  stackPreviewLabel: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
    backgroundColor: COLORS.overlay,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  stackPreviewNote: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: COLORS.overlay,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    maxWidth: 280,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
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
