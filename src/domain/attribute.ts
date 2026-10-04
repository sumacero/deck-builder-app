/**
 * 攻撃の属性（斬・打・炎・氷・雷）。敵にはそれぞれ弱点の属性があり、
 * 弱点を突いた 1 ヒットごとにダウンゲージが減る。0 になると敵はダウンする。
 */
export type Attribute = 'slash' | 'blunt' | 'fire' | 'ice' | 'thunder';
