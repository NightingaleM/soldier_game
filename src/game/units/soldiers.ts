import {SoldierGenerator} from '@/game/generators/SoldierGenerator';
import {SKILL_BOOK} from '@/game/units/skill';
import {G} from '@/game/gameGenerator';


const spdSequenceGenerator = (initialValue) => {
  let sequence = [initialValue];
  return function (level) {
    if (level <= sequence.length) {
      return sequence[level - 1];
    }
    for (let i = sequence.length + 1; i <= level; i++) {
      sequence.push(sequence[i - 2] * (1 - 0.01 * (i - 1)));
    }
    return sequence[level - 1];
  };
};

const atkSequenceGenerator = (initialValue:bigint) => {
  let sequence:bigint[] = [initialValue];
  return function (level) {
    if (level <= sequence.length) {
      return sequence[level - 1];
    }
    for (let i = sequence.length + 1; i <= level; i++) {
      sequence.push(sequence[i - 2] + BigInt(Math.floor(i / 5)));
    }
    // 暂时抑制攻击增长
    // const ex = 1n + BigInt(Math.floor(level / 50));
    return sequence[level - 1]
  };
};


// 小孩
export const child = (REF_G: G) => (new SoldierGenerator({
  G: REF_G,
  unlockCost: 1n,
  name: '小孩',
  intro: '小孩，活力旺盛的小孩,可以成长的小孩',
  atk: 1n,
  atk_increment: atkSequenceGenerator(1n),
  spd: 5000,
  spd_increment: spdSequenceGenerator(50),
  // TODO: atk_increment 根据激活次数来提高基础值，如，第二次重生，则基础值为2。
  skills: []
}));

export const luckBoy = (REF_G: G) => (new SoldierGenerator({
  G: REF_G,
  unlockCost: 100n,
  name: '普通的男人',
  intro: '普通，但是幸运的男人。',
  atk: 10n,
  atk_increment: atkSequenceGenerator(10n),
  spd: 5000,
  spd_increment: spdSequenceGenerator(30),
  skills: [SKILL_BOOK['exAtk'](REF_G)]
}));


export const luckGirl = (REF_G: G) => (new SoldierGenerator({
  G: REF_G,
  unlockCost: 100n,
  name: '普通的女人',
  intro: '普通，但是幸运的女人。',
  atk: 5n,
  atk_increment: atkSequenceGenerator(8n),
  spd: 2500,
  spd_increment: spdSequenceGenerator(40),
  skills: [SKILL_BOOK['allWordAtk'](REF_G)]
}));


export const oldTeacher = (REF_G: G) => (new SoldierGenerator({
  G: REF_G,
  unlockCost: 80000n,
  name: '老师傅',
  intro: '知识丰富的老司机，成长到一定阶段愿意向其他士兵倾囊相授。',
  atk: 1000n,
  atk_increment: atkSequenceGenerator(198n),
  spd: 2000,
  spd_increment: spdSequenceGenerator(40),
  skills: [SKILL_BOOK['teachOtherAtk'](REF_G)]
}));


export const fakerJD = (REF_G: G) => (new SoldierGenerator({
  G: REF_G,
  unlockCost: 100000n,
  name: 'DJ',
  intro: '天天打碟，烦不烦啊？',
  atk: 10000n,
  atk_increment: atkSequenceGenerator(1989n),
  spd: 2000,
  spd_increment: spdSequenceGenerator(40),
  skills: [SKILL_BOOK['ferment'](REF_G), SKILL_BOOK['fakeDJ'](REF_G)]
}));

export const chief = (REF_G: G) => (new SoldierGenerator({
  G: REF_G,
  unlockCost: 300000n,
  name: '领袖',
  intro: '带我们一起走向胜利。',
  atk: 100000n,
  atk_increment: atkSequenceGenerator(80000n),
  spd: 10000,
  spd_increment: spdSequenceGenerator(40),
  skills: [SKILL_BOOK['equalityWord'](REF_G), SKILL_BOOK['commonProsperity'](REF_G)]
}));
