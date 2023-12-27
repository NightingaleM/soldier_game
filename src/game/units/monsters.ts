import {MonsterGenerator} from '@/game/generators/MonsterGenerator';
import {createBigInt as HP} from '@/game/utensil';
// 教学靶子
export const Dummy = (G) => (new MonsterGenerator({
  name: 'Dummy',
  hp: HP([1,6]), // 100,000
  G,
  intro: '放在角落教学用的破旧的靶子，几个螺丝已经冒出了头，一拳打上去不知道是谁伤谁呢。',
  beforeAttack: (self, G, {atkRes}) => {
  },
  afterAttack: (self, G, {atkRes}) => {
  },
  aliveEffect() {
  },
  afterDead: (self, {atkRes}) => {
    G.ADD_MEMENTO('rusty_nail');
  },
  beforeSetGold: (finalDamage) => ({goldValue: finalDamage < 0n ? -finalDamage : finalDamage}),
}));

// 一些老鼠和蟑螂
export const MouseAndCockroach = (G) => (new MonsterGenerator({
  name: 'MouseAndCockroach',
  hp: HP([5,8]),
  G,
  intro: '一些老鼠和蟑螂，看起来很恶心，但是也不是很强。',
  beforeAttack: (self, G, {atkRes}) => {
  },
  afterAttack: (self, G, {atkRes}) => {
  },
  aliveEffect: () => {
  },
  afterDead: (self, {atkRes}) => {
    G.goldCoin.changeSum(1000n);
    if (self.deadTimes > 10) {
      G.ADD_MEMENTO('mouse_and_cockroach');
    }
  },
  beforeSetGold: (finalDamage) => ({goldValue: finalDamage < 0n ? -finalDamage : finalDamage}),
}));

// 泥泞与森林
export const MudAndForest = (G) => (new MonsterGenerator({
  name: '泥泞与森林',
  hp: HP([6,9]),
  G,
  intro: '出发前往未知，雨后的森林满是泥泞。虽然前进速度缓慢，但是路上也有收获。',
  beforeAttack: (self, G, {atkRes}) => {
  },
  afterAttack: (self, G, {atkRes}) => {
  },
  activeEffect: () => {
    const fn = () => {
      this.aliveEffectTimer = setTimeout(() => {
        G.goldCoin.changeSum(BigInt(Math.random() * (Math.random() < 0.3 ? 333 : 33)));
        fn();
      }, 3000);
    };
    fn();
  },
  afterDead: (self, G, {atkRes}) => {
    console.log('穿过了森林');
    G.goldCoin.changeSum(1000000n);
    //  TODO: 随机获得一些资源（其他货币）
  },
  beforeSetGold: (finalDamage) => ({goldValue: finalDamage < 0n ? -finalDamage : finalDamage}),
}));


export const SakuraFluttercamel = (G) => (new MonsterGenerator({
  name: '桜花魔蝶',
  hp: HP([7,11]),
  G,
  intro: '妖异羽翼庇护，翩翩起舞的魔法蝴蝶，身披樱花幻彩，吸取梦境芬芳',
  beforeAttack: (self, G, {atkRes}) => {
  },
  afterAttack: (self, G, {atkRes}) => {
  },
  afterDead: (self, G, {atkRes}) => {
  },
  beforeSetGold: (finalDamage) => ({goldValue: finalDamage < 0n ? -finalDamage : finalDamage}),
}));

export const MoonshadowSwordLeopard = (G) => (new MonsterGenerator({
  name: '月影剑豹',
  hp: HP([7,13]),
  G,
  intro: '深蓝色皮毛，敏捷如影，爪牙如刃。在月光下猎杀猎物，以其锋利的牙齿和迅疾的攻击令人闻风丧胆。',
  beforeAttack: (self, G, {atkRes}) => {
  },
  afterAttack: (self, G, {atkRes}) => {
  },
  afterDead: (self, G, {atkRes}) => {
    G.ADD_MEMENTO('beast_essence')
  },
  beforeSetGold: (finalDamage) => ({goldValue: finalDamage < 0n ? -finalDamage : finalDamage}),
}));


export const GoldenGateScorpius = (G) => (new MonsterGenerator({
  name: '金阙魔蝎',
  hp: HP([7,13]),
  G,
  intro: '金光闪耀的外壳如同坚不可摧的堡垒。它的尾巴覆盖着毒刺，能够释放具有致命毒性的蝎尾之击',
  beforeAttack: (self, G, {atkRes}) => {
  },
  afterAttack: (self, G, {atkRes}) => {
  },
  afterDead: (self, G, {atkRes}) => {
  },
  beforeSetGold: (finalDamage) => ({goldValue: finalDamage < 0n ? -finalDamage : finalDamage}),
}));
