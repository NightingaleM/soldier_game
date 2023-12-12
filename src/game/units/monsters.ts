import {MonsterGenerator} from '@/game/generators/MonsterGenerator';
// 教学靶子
export const Dummy = (G) => (new MonsterGenerator({
  name: 'Dummy',
  hp: 100000n,
  G,
  intro: '放在角落教学用的破旧的靶子，几个螺丝已经冒出了头，一拳打上去不知道是谁伤谁呢。',
  beforeAttack: (self, G, {atkRes}) => {
  },
  afterAttack: (self, G, {atkRes}) => {
  },
  afterDead: (self, G, {atkRes}) => {
    G.AddMemento('rusty_nail');
  },
  beforeSetGold: (finalDamage) => ({goldValue: finalDamage < 0n ? -finalDamage : finalDamage}),
}));

// 一些老鼠和蟑螂
export const MouseAndCockroach = (G) => (new MonsterGenerator({
  name: 'MouseAndCockroach',
  hp: 100000000n,
  G,
  intro: '一些老鼠和蟑螂，看起来很恶心，但是也不是很强。',
  beforeAttack: (self, G, {atkRes}) => {
  },
  afterAttack: (self, G, {atkRes}) => {
  },
  afterDead: (self, G, {atkRes}) => {
    G.goldCoin.changeSum(1000n);
    if(self.deadTimes> 10) {
      G.AddMemento('mouse_and_cockroach');
    }
  },
  beforeSetGold: (finalDamage) => ({goldValue: finalDamage < 0n ? -finalDamage : finalDamage}),
}));
