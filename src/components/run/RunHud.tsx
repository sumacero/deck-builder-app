import { StyleSheet, Text, View } from 'react-native';
import type { RunState } from '../../domain/run';
import { COLORS, SPACING } from '../../theme';
import { DeckButton } from '../cards/DeckButton';
import { ItemBar } from '../items/ItemBar';
import { GoldBadge } from './GoldBadge';

type RunHudProps = {
  run: RunState;
};

/** 戦闘以外の画面の上部: 所持品、HP、ゴールド、デッキ。 */
export function RunHud({ run }: RunHudProps) {
  return (
    <View style={styles.hud}>
      <ItemBar relics={run.relics} potions={run.potions} />
      <View style={styles.status}>
        <Text style={styles.hp}>
          ❤️ {run.player.hp} / {run.player.maxHp}
        </Text>
        <View style={styles.right}>
          <GoldBadge gold={run.gold} />
          <DeckButton deck={run.deck} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: { gap: SPACING.sm, zIndex: 10 },
  status: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  right: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  hp: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
});
