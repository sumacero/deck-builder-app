import { useEffect, useState } from 'react';
import {
  Animated,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { CombatSetup, DamagePreview, EnemyUid } from '../../domain/combat';
import type { CombatResult } from '../../domain/run';
import { useBattleMusic } from '../../hooks/useBattleMusic';
import { useCombat } from '../../hooks/useCombat';
import { eventsDuration } from '../../hooks/useCombatEvents';
import { useCombatSounds } from '../../hooks/useCombatSounds';
import { useIsLandscape } from '../../hooks/useIsLandscape';
import { stackInstances } from '../../logic/cards';
import { livingEnemies } from '../../logic/combat';
import { COLORS, COMBAT_LAYOUT, MOTION, RADIUS, SPACING } from '../../theme';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { CardPileModal } from '../cards/CardPileModal';
import { CardView } from '../cards/CardView';
import { DeckButton } from '../cards/DeckButton';
import { ItemBar } from '../items/ItemBar';
import { canPlayByTap, type DropTarget } from './cardDrop';
import { CombatFooter } from './CombatFooter';
import { CombatLog } from './CombatLog';
import { CombatResultOverlay } from './CombatResultOverlay';
import { DamageVignette } from './effects/DamageVignette';
import { EnemyRow } from './EnemyRow';
import { EnergyOrb } from './EnergyOrb';
import { Hand } from './Hand';
import { PlayerPanel } from './PlayerPanel';
import { landscapeFigures, portraitFigures, type Size } from './stageLayout';
import { useCardDrag } from './useCardDrag';

type OpenPile = 'draw' | 'discard' | null;

type CombatScreenProps = {
  setup: CombatSetup;
  seed: number;
  /** 背景画像を選ぶための章 id。 */
  actId: string;
  onFinish: (result: CombatResult) => void;
};

/** カードをタップしたときに出す、使い方の案内の表示時間（ミリ秒）。 */
const TAP_HINT_MS = 1800;

const NO_SIZE: Size = { width: 0, height: 0 };

const sizeOf = (e: LayoutChangeEvent): Size => ({
  width: e.nativeEvent.layout.width,
  height: e.nativeEvent.layout.height,
});

/**
 * 戦闘画面。縦向きは上に敵・左下に自分・下に手札。
 * 横向きは左の列に所持品・自分・エナジー、右に敵と手札を置く。
 */
export function CombatScreen({ setup, seed, actId, onFinish }: CombatScreenProps) {
  const {
    state,
    playCard,
    drinkPotion,
    endTurn,
    isPlayable,
    isDrinkable,
    potionNeedsTarget,
    previewDamage,
  } = useCombat(setup, seed);
  const landscape = useIsLandscape();
  const { height: windowHeight } = useWindowDimensions();
  const [openPile, setOpenPile] = useState<OpenPile>(null);
  const [pendingPotion, setPendingPotion] = useState<number | null>(null);
  const [tapHint, setTapHint] = useState(false);
  const [stageSize, setStageSize] = useState(NO_SIZE);
  const [playerSlotSize, setPlayerSlotSize] = useState(NO_SIZE);
  const inProgress = state.status === 'playerTurn';
  const effectsTime = eventsDuration(state.events);
  useCombatSounds(state.events);
  useBattleMusic(setup.rank, !inProgress);

  const [cardWidth, setCardWidth] = useState(0);
  const { drag, hover, ghost, handlers, bindContainer, measureContainer, bindHand, bindEnemy } =
    useCardDrag({ hand: state.hand, enemies: state.enemies, cardWidth, onPlay: playCard });

  useEffect(() => {
    if (!tapHint) return;
    const timer = setTimeout(() => setTapHint(false), TAP_HINT_MS);
    return () => clearTimeout(timer);
  }, [tapHint]);

  const enemyCount = state.enemies.length;
  const figures = landscape
    ? landscapeFigures(stageSize, playerSlotSize, enemyCount)
    : portraitFigures(stageSize, enemyCount);

  const previews: DamagePreview[] =
    drag && hover && hover.kind !== 'self'
      ? previewDamage(drag.instanceId, hover.kind === 'enemy' ? hover.uid : undefined)
      : [];
  const living = livingEnemies(state).map((enemy) => enemy.uid);

  const onDrink = (slot: number) => {
    if (potionNeedsTarget(slot)) setPendingPotion(slot);
    else drinkPotion(slot);
  };
  const onTapCard = (instanceId: string) => {
    const instance = state.hand.find((c) => c.instanceId === instanceId);
    if (!instance || !isPlayable(instanceId)) return;
    if (canPlayByTap(instance.card.target, living.length)) playCard(instanceId);
    else setTapHint(true);
  };
  const hint = hintText({
    dragging: drag !== null,
    hover,
    needsEnemy: drag?.card.target === 'enemy' && living.length > 1,
    tapHint,
  });

  const itemBar = (
    <ItemBar
      relics={state.relics}
      potions={state.potions}
      events={state.events}
      potionUse={{ isDrinkable, onDrink }}
      popoverMinWidth={landscape ? COMBAT_LAYOUT.landscapePopoverWidth : undefined}
    />
  );
  const enemyRow = (
    <EnemyRow
      enemies={state.enemies}
      events={state.events}
      defeatDelay={effectsTime}
      agentId={setup.agent.id}
      figureSize={figures.enemy}
      compact={figures.compact}
      soloWidthRatio={landscape ? 0.5 : COMBAT_LAYOUT.soloEnemyWidthRatio}
      previews={previews}
      highlighted={highlightedEnemies(hover, living)}
      onSelect={
        pendingPotion === null
          ? undefined
          : (uid: EnemyUid) => {
              drinkPotion(pendingPotion, uid);
              setPendingPotion(null);
            }
      }
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
    pendingPotion !== null ? (
      <View style={styles.hintRow}>
        <Text style={styles.hint}>ポーションを使う敵をタップ</Text>
        <Pressable
          onPress={() => setPendingPotion(null)}
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
      isPlayable={isPlayable}
      draggingId={drag?.instanceId ?? null}
      viewRef={bindHand}
      onCardWidth={setCardWidth}
      maxCardHeight={landscape ? windowHeight * COMBAT_LAYOUT.landscapeCardHeightRatio : undefined}
      {...handlers}
      onTap={onTapCard}
      style={landscape ? styles.landscapeHand : styles.portraitHand}
    />
  );
  const footer = (
    <CombatFooter
      drawCount={state.drawPile.length}
      discardCount={state.discardPile.length}
      canEndTurn={inProgress}
      onEndTurn={endTurn}
      onOpenDraw={() => setOpenPile('draw')}
      onOpenDiscard={() => setOpenPile('discard')}
      vertical={landscape}
    />
  );

  return (
    <SceneBackground actId={actId} scene="combat">
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
        {drag && (
          <Animated.View style={[styles.ghost, { transform: ghost.getTranslateTransform() }]}>
            <CardView
              card={drag.card}
              width={cardWidth}
              selected={hover !== null}
              detailOnHold={false}
            />
          </Animated.View>
        )}
        {openPile && (
          <CardPileModal
            title={openPile === 'draw' ? '山札' : '捨て札'}
            note={openPile === 'draw' ? '残っているカードです。順番はシャッフルされます。' : '使ったカードと、ターン終了で捨てたカード。'}
            stacks={stackInstances(openPile === 'draw' ? state.drawPile : [...state.discardPile].reverse())}
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
                potions: state.potions,
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

function hintText(options: {
  dragging: boolean;
  hover: DropTarget | null;
  needsEnemy: boolean;
  tapHint: boolean;
}): string | null {
  if (options.dragging) {
    if (options.hover) return '離して使う';
    return options.needsEnemy ? '狙う敵の上で離す' : 'もっと上まで持ち上げて離す';
  }
  return options.tapHint ? '敵が複数いるときは、狙う敵へスワイプ' : null;
}

const styles = StyleSheet.create({
  portrait: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  landscape: { flex: 1, flexDirection: 'row', padding: SPACING.sm, gap: SPACING.md },
  /** 縦向きの手札は画面の左右いっぱいまで使う。 */
  portraitHand: { marginHorizontal: -SPACING.lg },
  landscapeHand: { flex: 1 },
  turnRow: { justifyContent: 'center' },
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
});
