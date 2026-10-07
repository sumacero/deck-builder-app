import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RunState } from '../../domain/run';
import type { RestActions } from '../../hooks/useRun';
import { canUpgrade, stackCards, upgradeCard } from '../../logic/cards';
import { hasUpgradableCard, restHealAmount } from '../../logic/rest';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { CardPickerModal } from '../cards/CardPickerModal';
import { DeckButton } from '../cards/DeckButton';
import { SettingsButton } from '../settings/SettingsButton';
import { HpBar } from '../combat/HpBar';
import { ScreenScroll } from '../layout/ScreenScroll';

type RestScreenProps = {
  run: RunState;
  actions: RestActions;
};

/** 休憩所。休んで HP を回復するか、カードを 1 枚強化するかを選ぶ。 */
export function RestScreen({ run, actions }: RestScreenProps) {
  const [picking, setPicking] = useState(false);
  const heal = restHealAmount(run);
  const upgradable = hasUpgradableCard(run);

  return (
    <ScreenScroll contentStyle={styles.root}>
      <View style={styles.corner}>
        <SettingsButton />
        <DeckButton deck={run.deck} />
      </View>
      <Text style={styles.fire}>🔥</Text>
      <Text style={styles.title}>休憩所</Text>
      <View style={styles.hp}>
        <HpBar hp={run.player.hp} maxHp={run.player.maxHp} block={0} />
      </View>

      <View style={styles.options}>
        <RestOption
          icon="💤"
          label="休む"
          detail={`HP を ${heal} 回復する`}
          onPress={actions.rest}
        />
        <RestOption
          icon="⚒️"
          label="鍛える"
          detail={upgradable ? 'カードを 1 枚強化する' : '強化できるカードがない'}
          disabled={!upgradable}
          onPress={() => setPicking(true)}
        />
      </View>

      {picking && (
        <CardPickerModal
          title="強化するカードを選ぶ"
          stacks={stackCards(run.deck.filter(canUpgrade))}
          confirmLabel="強化する"
          preview={upgradeCard}
          onConfirm={(card) => actions.smith(card.id)}
          onCancel={() => setPicking(false)}
        />
      )}
    </ScreenScroll>
  );
}

type RestOptionProps = {
  icon: string;
  label: string;
  detail: string;
  disabled?: boolean;
  onPress: () => void;
};

function RestOption({ icon, label, detail, disabled = false, onPress }: RestOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.option, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={styles.optionIcon}>{icon}</Text>
      <Text style={styles.optionLabel}>{label}</Text>
      <Text style={styles.optionDetail}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  corner: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  fire: { fontSize: 56 },
  title: { color: COLORS.gold, fontSize: 26, fontWeight: '800', letterSpacing: 4 },
  hp: { width: '70%' },
  options: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.lg,
  },
  option: {
    /** 説明文（「カードを 1 枚強化する」）が 1 文字だけ次の行に落ちない幅。 */
    flex: 1,
    maxWidth: 160,
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  optionIcon: { fontSize: 32 },
  optionLabel: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  optionDetail: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
});
