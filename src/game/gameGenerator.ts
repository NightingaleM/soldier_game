import {reactive} from 'vue';
import {SoldierGenerator} from '@/game/soldierGenerator';
import {SKILL_BOOK} from '@/game/skill';
import {JSON_with_bigInt} from '@/game/unit';
import {chief, fakerJD, luckBoy, luckGirl, oldTeacher} from '@/game/soldiers';
import {GoldTargetInterface} from '@/game/game';

export class G {
  REF_G; // 被proxy代理过的 G实例， 应为 在vue中，视图是使用的代理过的proxy，如果直接使用为代理的实例，无法及时更新
  gold: GoldTargetInterface = {
    sum: 20000000n, // 金币数
    getAddMultiple: function () {// 增长倍率（%），默认为 100 指 100%
      return Object.values(this.addMultiples).reduce((a, b) => {
        return a + b;
      });
    },
    getCutMultiple: function () {// 减少时倍率, 计算方法为 100n / 总和，
      return Object.values(this.cutMultiples).reduce((a, b) => {
        return a + b;
      }, 0n);
    },
    addMultiples: {default: 1000n},
    cutMultiples: {default: 2000n}
  };
  boss_list: any[] = [
    {
      hp: 1000000000000000n
    }
  ];
  currentBossIndex: number = 0; // 第几个boss
  s_list: SoldierGenerator[] = [];
  auto_save_timer = null;
  time: number = 0;

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
    const {gold, boss_list, currentBossIndex, time} = saveInfo;
    const {sum, addMultiples, cutMultiples} = gold;
    this.gold.sum = BigInt(sum);
    this.gold.addMultiples = {};
    this.gold.cutMultiples = {};
    Object.keys(addMultiples).forEach(key => {
      this.gold.addMultiples[key] = BigInt(addMultiples[key]);
    });
    Object.keys(cutMultiples).forEach(key => {
      this.gold.cutMultiples[key] = BigInt(cutMultiples[key]);
    });


    this.time = time;
    boss_list.forEach((item, index) => {
      this.boss_list[index].hp = BigInt(item.hp);
    });
    this.currentBossIndex = currentBossIndex;
  }

  INIT_GAME() {
    this.LOAD_SAVE(); // 查看并加载历史数据
    this.initSoldierList(); // 初始化所有士兵，如果有离线收益，还需要等计算完所有离线收益后再开始攻击。
  }

  SAVE_IN_STORAGE() {
    this.time = new Date().getTime();
    const {gold, boss_list, currentBossIndex, time} = this;
    localStorage.setItem('sg_lsg_s', JSON_with_bigInt({
      gold, boss_list, currentBossIndex, time
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
    this.s_list.push(luckBoy(this.REF_G, this.gold));
    this.s_list.push(luckGirl(this.REF_G, this.gold));
    this.s_list.push(oldTeacher(this.REF_G, this.gold));
    this.s_list.push(fakerJD(this.REF_G, this.gold));
    this.s_list.push(chief(this.REF_G, this.gold));


    this.s_list.forEach(item => {
      item.CALC_OFFLINE_INCOME();
    });
    this.s_list.forEach(item => {
      if (item.active) {
        item.ATK();
      }
    });
  }

  addGold(num: bigint) {
    this.gold.sum += num;
  }

  target() {
    return this.boss_list[this.currentBossIndex];
  }

  unlockSoldier(soldier: SoldierGenerator) {
    return soldier.UNLOCK();
  }

  getActiveSoldier() {
    return this.s_list.filter(item => item.active);
  }
}
