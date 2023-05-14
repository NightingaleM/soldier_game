import {reactive} from 'vue';
import {GoldTargetInterface, SoldierGenerator} from '@/game/soldierGenerator';
import {SKILL_BOOK} from '@/game/skill';
import {JSON_with_bigInt} from '@/game/unit';

export class G {
  REF_G; // 被proxy代理过的 G实例， 应为 在vue中，视图是使用的代理过的proxy，如果直接使用为代理的实例，无法及时更新
  gold: GoldTargetInterface = {
    sum: 20000n, // 金币数
    addMultiple: 100n, // 增长倍率（%），默认为 100 指 100%
    cutMultiple: 100n, // 减少时倍率（%），默认为 100 指 100%
  };
  boss_list: any[] = [
    {
      hp: 1000000000000000n
    }
  ];
  currentBossIndex: number = 0; // 第几个boss
  s_list: SoldierGenerator[] = [];
  auto_save_timer = null;

  constructor() {

  }

  SET_REF_SELF(G) {
    this.REF_G = G;
    this.INIT_GAME();
    setTimeout(() => {
      this.AUTO_SAVE();
    }, 100);
  }

  LOAD_SAVE() {
    let saveInfo = localStorage.getItem('sg_lsg_s');
    if (!saveInfo) return;
    saveInfo = JSON.parse(saveInfo);
    const {gold, boss_list, currentBossIndex} = saveInfo;
    const {sum, addMultiple, cutMultiple} = gold;
    this.gold.sum = BigInt(sum);
    this.gold.addMultiple = BigInt(addMultiple);
    this.gold.cutMultiple = BigInt(cutMultiple);
    boss_list.forEach((item, index) => {
      this.boss_list[index].hp = BigInt(item.hp);
    });
    this.currentBossIndex = currentBossIndex;
  }

  INIT_GAME() {
    this.LOAD_SAVE();
    this.initSoldierList();
  }

  SAVE_IN_STORAGE() {
    const {gold, boss_list, currentBossIndex} = this;
    localStorage.setItem('sg_lsg_s', JSON_with_bigInt({
      gold, boss_list, currentBossIndex
    }));
  }

  AUTO_SAVE() {
    this.auto_save_timer = setTimeout(() => {
      this.SAVE_IN_STORAGE();
      this.s_list.forEach(item => {
        item.SAVE_IN_STORAGE();
      });
      this.AUTO_SAVE();
    }, 1000);
  }

  initSoldierList() {
    this.s_list.push(new SoldierGenerator({
      G: this.REF_G,
      GoldTarget: this.gold,
      cost: 100n,
      name: '普幸男',
      intro: '普通，但是幸运的男人。',
      atk: 1n,
      atk_increment: [9n, 36n, 196n],
      spd: 500,
      spd_increment: [20, 10, 5],
      skills: [SKILL_BOOK['exAtk'](this)]
    }));
    this.s_list.push(new SoldierGenerator({
      G: this.REF_G,
      GoldTarget: this.gold,
      cost: 1000n,
      name: '普幸女',
      intro: '普通，但是幸运的女人。',
      atk: 1n,
      atk_increment: [4n, 28n, 96n],
      spd: 5000,
      spd_increment: [40, 20, 15],
      skills: [SKILL_BOOK['allWordAtk'](this)]
    }));
    this.s_list.push(new SoldierGenerator({
      G: this.REF_G,
      GoldTarget: this.gold,
      cost: 30000n,
      name: '老师傅',
      intro: '知识丰富的老司机，成长到一定阶段愿意向其他士兵倾囊相授。',
      atk: 1n,
      atk_increment: [98n, 136n, 296n],
      spd: 2000,
      spd_increment: [20, 10, 5],
      skills: [SKILL_BOOK['teachOtherAtk'](this)]
    }));

  }

  addGold(num: bigint) {
    this.gold += num;
  }

  target() {
    return this.boss_list[this.currentBossIndex];
  }

  unlockSoldier(soldier: SoldierGenerator) {
    soldier.ATK(this.target());
  }

  getActiveSoldier() {
    return this.s_list.filter(item => item.active);
  }
}
