import {MonsterGenerator} from '@/game/generators/MonsterGenerator';
import {createBigInt as HP} from '@/utils/bigint';
// 教学靶子
export const Dummy = (G) => (new MonsterGenerator({
  name: 'Dummy',
  hp: HP([1,5]), // 100,000
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
  hp: HP([2,7]),
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
  hp: HP([5,8]),
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

// 森林猛兽
export const ForestMonster = (G) => (new MonsterGenerator({
  name: '森林猛兽',
  hp: HP([1,10]),
  G,
  intro: '不常见的猛兽，杀死可能有些好东西呢。',
  beforeAttack: (self, G, {atkRes}) => {
  },
  afterAttack: (self, G, {atkRes}) => {
  },
  afterDead: (self, G, {atkRes}) => {
    G.ADD_MEMENTO('beast_essence')
  },
  beforeSetGold: (finalDamage) => ({goldValue: finalDamage < 0n ? -finalDamage : finalDamage}),
}));
