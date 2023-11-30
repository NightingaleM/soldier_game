import {SoldierGenerator} from '@/game/soldierGenerator';
import {SKILL_BOOK} from '@/game/skill';
import {G} from '@/game/gameGenerator';
import {GoldTargetInterface} from '@/game/game.d.ts';

export const luckBoy = (REF_G: G, gold: GoldTargetInterface) => (new SoldierGenerator({
  G: REF_G,
  GoldTarget: gold,
  cost: 100n,
  name: '普通的男人',
  intro: '普通，但是幸运的男人。',
  atk: 1n,
  atk_increment: [9n, 36n, 196n],
  spd: 5000,
  spd_increment: [20, 10, 5],
  skills: [SKILL_BOOK['exAtk'](REF_G)]
}));


export const luckGirl = (REF_G: G, gold: GoldTargetInterface) => (new SoldierGenerator({
  G: REF_G,
  GoldTarget: gold,
  cost: 1000n,
  name: '普通的女人',
  intro: '普通，但是幸运的女人。',
  atk: 1n,
  atk_increment: [4n, 28n, 96n],
  spd: 5000,
  spd_increment: [40, 20, 15],
  skills: [SKILL_BOOK['allWordAtk'](REF_G)]
}));


export const oldTeacher = (REF_G: G, gold: GoldTargetInterface) => (new SoldierGenerator({
  G: REF_G,
  GoldTarget: gold,
  cost: 30000n,
  name: '老师傅',
  intro: '知识丰富的老司机，成长到一定阶段愿意向其他士兵倾囊相授。',
  atk: 1n,
  atk_increment: [98n, 136n, 296n],
  spd: 2000,
  spd_increment: [20, 10, 5],
  skills: [SKILL_BOOK['teachOtherAtk'](REF_G)]
}));


export const fakerJD = (REF_G: G, gold: GoldTargetInterface) => (new SoldierGenerator({
  G: REF_G,
  GoldTarget: gold,
  cost: 100000n,
  name: 'DJ',
  intro: '天天打碟，烦不烦啊？',
  atk: 100n,
  atk_increment: [198n, 436n, 896n],
  spd: 2000,
  spd_increment: [13, 8, 5],
  skills: [SKILL_BOOK['ferment'](REF_G), SKILL_BOOK['fakeDJ'](REF_G)]
}));

export const chief = (REF_G: G, gold: GoldTargetInterface) => (new SoldierGenerator({
    G: REF_G,
    GoldTarget: gold,
    cost: 100n,
    name: '领袖',
    intro: '带我们一起走向胜利。',
    atk: 9000n,
    atk_increment: [1000n, 3500n, 10000n],
    spd: 8000,
    spd_increment: [20, 10, 5],
    skills: [SKILL_BOOK['equalityWord'](REF_G), SKILL_BOOK['commonProsperity'](REF_G)]
  }))
;

