import { StyleSheet, Text, View } from 'react-native';
import type { DamagePreview } from '../../domain/combat';
import { COLORS, RADIUS, SPACING } from '../../theme';

type DamagePreviewBadgeProps = {
  preview: DamagePreview;
};

/** カードを離したらこの敵が受ける実ダメージ。ブロックで防がれる分と、倒せるかも示す。 */
export function DamagePreviewBadge({ preview }: DamagePreviewBadgeProps) {
  return (
    <View style={[styles.badge, preview.lethal && styles.lethal]}>
      <Text style={styles.damage}>-{preview.hpLoss}</Text>
      {preview.blocked > 0 && <Text style={styles.blocked}>🛡️{preview.blocked}</Text>}
      {preview.lethal && <Text style={styles.lethalText}>撃破</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.overlay,
    borderColor: COLORS.damageText,
    borderWidth: 1.5,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  lethal: { borderColor: COLORS.gold },
  damage: { color: COLORS.damageText, fontSize: 18, fontWeight: '900' },
  blocked: { color: COLORS.block, fontSize: 12, fontWeight: '800' },
  lethalText: { color: COLORS.gold, fontSize: 12, fontWeight: '900' },
});
