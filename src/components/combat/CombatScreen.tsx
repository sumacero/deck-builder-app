import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CombatSetup } from '../../domain/combat';
import type { CombatResult } from '../../domain/run';
import { useCombat } from '../../hooks/useCombat';
import { eventsDuration } from '../../hooks/useCombatEvents';
import { useCombatSounds } from '../../hooks/useCombatSounds';
import { stackInstances } from '../../logic/cards';
import { COLORS, MOTION, SPACING } from '../../theme';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { CardPileModal } from '../cards/CardPileModal';
import { DeckButton } from '../cards/DeckButton';
import { ItemBar } from '../items/ItemBar';
import { CombatFooter } from './CombatFooter';
import { CombatLog } from './CombatLog';
import { CombatResultOverlay } from './CombatResultOverlay';
import { DamageVignette } from './effects/DamageVignette';
import { EnemyPanel } from './EnemyPanel';
import { EnergyOrb } from './EnergyOrb';
import { Hand } from './Hand';
import { PlayerPanel } from './PlayerPanel';

type OpenPile = 'draw' | 'discard' | null;

type CombatScreenProps = {
  setup: CombatSetup;
  seed: number;
  /** 背景画像を選ぶための章 id。 */
  actId: string;
  onFinish: (result: CombatResult) => void;
};

export function CombatScreen({ setup, seed, actId, onFinish }: CombatScreenProps) {
  const { state, playCard, drinkPotion, endTurn, isPlayable, isDrinkable } = useCombat(setup, seed);
  const [openPile, setOpenPile] = useState<OpenPile>(null);
  const inProgress = state.status === 'playerTurn';
  const effectsTime = eventsDuration(state.events);
  useCombatSounds(state.events);

  return (
    <SceneBackground actId={actId} scene="combat">
      <View style={styles.container}>
        <ItemBar
          relics={state.relics}
          potions={state.potions}
          events={state.events}
          potionUse={{ isDrinkable, onDrink: drinkPotion }}
        />
        <View style={styles.turnRow}>
          <Text style={styles.turn}>TURN {state.turn}</Text>
          <View style={styles.deck}>
            <DeckButton deck={setup.deck} />
          </View>
        </View>
        <View style={styles.stage}>
          <View style={styles.enemySlot}>
            <EnemyPanel
              enemy={state.enemy}
              events={state.events}
              defeatDelay={effectsTime}
              agentId={setup.agent.id}
            />
          </View>
          <View style={styles.playerSlot}>
            <PlayerPanel
              agent={setup.agent}
              player={state.player}
              events={state.events}
              defeatDelay={effectsTime}
            />
          </View>
        </View>
        <View style={styles.infoRow}>
          <EnergyOrb energy={state.player.energy} maxEnergy={state.player.maxEnergy} />
          <CombatLog entries={state.log} />
        </View>
        <Hand cards={state.hand} isPlayable={isPlayable} onPlay={playCard} style={styles.hand} />
        <CombatFooter
          drawCount={state.drawPile.length}
          discardCount={state.discardPile.length}
          canEndTurn={inProgress}
          onEndTurn={endTurn}
          onOpenDraw={() => setOpenPile('draw')}
          onOpenDiscard={() => setOpenPile('discard')}
        />
        <DamageVignette events={state.events} />
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

const STAGE_SLOT_WIDTH = '60%';

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  /** 手札は画面の左右いっぱいまで使う。 */
  hand: { marginHorizontal: -SPACING.lg },
  turnRow: { justifyContent: 'center' },
  /** 右上に敵、左下にエージェント。斜めに向かい合って画面を広く使う。 */
  stage: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.sm },
  enemySlot: { alignSelf: 'flex-end', width: STAGE_SLOT_WIDTH },
  playerSlot: { alignSelf: 'flex-start', width: STAGE_SLOT_WIDTH },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, height: 64 },
  deck: { position: 'absolute', right: 0 },
  turn: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
  },
});
