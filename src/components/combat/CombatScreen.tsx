import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CombatSetup, DamagePreview, EnemyUid } from '../../domain/combat';
import type { CombatResult } from '../../domain/run';
import { useBattleMusic } from '../../hooks/useBattleMusic';
import { useCombat } from '../../hooks/useCombat';
import { eventsDuration } from '../../hooks/useCombatEvents';
import { useCombatSounds } from '../../hooks/useCombatSounds';
import { stackInstances } from '../../logic/cards';
import { livingEnemies } from '../../logic/combat';
import { COLORS, MOTION, RADIUS, SPACING } from '../../theme';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { CardPileModal } from '../cards/CardPileModal';
import { CardView } from '../cards/CardView';
import { DeckButton } from '../cards/DeckButton';
import { ItemBar } from '../items/ItemBar';
import type { DropTarget } from './cardDrop';
import { CombatFooter } from './CombatFooter';
import { CombatLog } from './CombatLog';
import { CombatResultOverlay } from './CombatResultOverlay';
import { DamageVignette } from './effects/DamageVignette';
import { EnemyRow } from './EnemyRow';
import { EnergyOrb } from './EnergyOrb';
import { Hand } from './Hand';
import { PlayerPanel } from './PlayerPanel';
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
  const [openPile, setOpenPile] = useState<OpenPile>(null);
  const [pendingPotion, setPendingPotion] = useState<number | null>(null);
  const [tapHint, setTapHint] = useState(false);
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

  const previews: DamagePreview[] =
    drag && hover && hover.kind !== 'self'
      ? previewDamage(drag.instanceId, hover.kind === 'enemy' ? hover.uid : undefined)
      : [];
  const highlighted = highlightedEnemies(
    hover,
    livingEnemies(state).map((enemy) => enemy.uid),
  );

  const onDrink = (slot: number) => {
    if (potionNeedsTarget(slot)) setPendingPotion(slot);
    else drinkPotion(slot);
  };
  const hint = hintText({
    dragging: drag !== null,
    hover,
    needsEnemy: drag?.card.target === 'enemy' && livingEnemies(state).length > 1,
    tapHint,
  });

  return (
    <SceneBackground actId={actId} scene="combat">
      <View
        ref={bindContainer}
        onLayout={measureContainer}
        style={styles.container}
      >
        <ItemBar
          relics={state.relics}
          potions={state.potions}
          events={state.events}
          potionUse={{ isDrinkable, onDrink }}
        />
        <View style={styles.turnRow}>
          <Text style={styles.turn}>TURN {state.turn}</Text>
          <View style={styles.deck}>
            <DeckButton deck={setup.deck} />
          </View>
        </View>
        <View style={styles.stage}>
          <EnemyRow
            enemies={state.enemies}
            events={state.events}
            defeatDelay={effectsTime}
            agentId={setup.agent.id}
            previews={previews}
            highlighted={highlighted}
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
          <View style={styles.playerSlot}>
            <PlayerPanel
              agent={setup.agent}
              player={state.player}
              events={state.events}
              defeatDelay={effectsTime}
              highlighted={hover?.kind === 'self'}
            />
          </View>
          {pendingPotion !== null ? (
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
          )}
        </View>
        <View style={styles.infoRow}>
          <EnergyOrb energy={state.player.energy} maxEnergy={state.player.maxEnergy} />
          <CombatLog entries={state.log} />
        </View>
        <Hand
          cards={state.hand}
          isPlayable={isPlayable}
          draggingId={drag?.instanceId ?? null}
          viewRef={bindHand}
          onCardWidth={setCardWidth}
          {...handlers}
          onTap={() => setTapHint(true)}
          style={styles.hand}
        />
        <CombatFooter
          drawCount={state.drawPile.length}
          discardCount={state.discardPile.length}
          canEndTurn={inProgress}
          onEndTurn={endTurn}
          onOpenDraw={() => setOpenPile('draw')}
          onOpenDiscard={() => setOpenPile('discard')}
        />
        <DamageVignette events={state.events} />
        {drag && (
          <Animated.View
            style={[styles.ghost, { transform: ghost.getTranslateTransform() }]}
          >
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
  return options.tapHint ? 'カードは上へスワイプして使う' : null;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  /** 手札は画面の左右いっぱいまで使う。 */
  hand: { marginHorizontal: -SPACING.lg },
  turnRow: { justifyContent: 'center' },
  /** 上に敵、左下にエージェント。斜めに向かい合って画面を広く使う。 */
  stage: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.sm },
  playerSlot: { alignSelf: 'flex-start', width: '60%' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, height: 64 },
  deck: { position: 'absolute', right: 0 },
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
