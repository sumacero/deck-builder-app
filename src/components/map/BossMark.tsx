import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Encounter } from '../../domain/enemy';
import { bossPreparation } from '../../logic/describe';
import { encounterLeader } from '../../logic/encounter';
import { COLORS, RADIUS, SPACING } from '../../theme';

type BossMarkProps = {
  boss: Encounter;
};

/** マップの上部に常に出す、この章のボス。タップで大まかな困らせ方だけ出す。 */
export function BossMark({ boss }: BossMarkProps) {
  const [open, setOpen] = useState(false);
  const leader = encounterLeader(boss);
  const brief = bossPreparation(leader.id);
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        hitSlop={6}
        style={[styles.button, open && styles.open]}
        accessibilityRole="button"
        accessibilityLabel={`${leader.name}の情報`}
      >
        <Text style={styles.icon}>{leader.icon}</Text>
      </Pressable>
      {open && (
        <View style={styles.sheet}>
          <Text style={styles.name}>{leader.name}</Text>
          {brief && <Text style={styles.brief}>{brief}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 30 },
  button: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  open: { backgroundColor: COLORS.goldDark },
  icon: { fontSize: 20 },
  sheet: {
    marginTop: SPACING.xs,
    width: 220,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.panel,
    gap: SPACING.xs,
  },
  name: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
  brief: { color: COLORS.text, fontSize: 13, lineHeight: 18 },
});
