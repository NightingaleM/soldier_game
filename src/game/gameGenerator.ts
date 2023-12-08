import {reactive} from 'vue';
import {SoldierGenerator} from '@/game/generators/SoldierGenerator';
import {CurrencyGenerator} from '@/game/generators/CurrencyGenerator';
import {SKILL_BOOK} from '@/game/units/skill';
import {JSON_with_bigInt} from '@/game/utensil';
import {chief, fakerJD, luckBoy, luckGirl, oldTeacher} from '@/game/units/soldiers';
import {Mementos} from '@/game/units/memento';
import {GoldCoin} from "@/game/units/currencys";

export class G {
  REF_G; // 被proxy代理过的 G实例， 应为 在vue中，视图是使用的代理过的proxy，如果直接使用为代理的实例，无法及时更新
  boss_list: any[] = [
    {
      hp: 1000000000000000000n
    }
  ];
  offline_income = {
    getOfflineIncome: () => {
      // 默认 0.3 的离线加成，外加遗物加成
      // @ts-ignore
      return (0.3 + this.memento_list?.time_gloves.effect() ?? 0);
    },
    getMaxTime: () => {
      // @ts-ignore
      return (2 * 60 * 60 + this.memento_list?.time_ship.effect() ?? 0) * 1000;
    }
  };

  memento_list = {
    before_upgrade_spd: [],
    before_upgrade_atk: [],
    before_append_gold: [],
    before_invest_gold: [],
    before_atk: [],
    after_atk: [],
  };
  current_boss_index: number = 0; // 第几个boss
  s_list: SoldierGenerator[] = [];
  // 金币-货币
  goldCoin:CurrencyGenerator

  auto_save_timer = null;
  time: number = 0;
  // 是否显示关闭游戏的提示
  closeMSG: boolean = false;
  constructor() {

  }
  INIT_GAME() {
    this.INIT_CURRENCY(); // 加载货币数据
    this.LOAD_MEMENTO(); // 加载遗物数据，遗物数据的历史数据加载将在这里完成
    this.LOAD_SAVE(); // 查看并加载历史数据
    this.initSoldierList(); // 初始化所有士兵，如果有离线收益，还需要等计算完所有离线收益后再开始攻击。
  }
  INIT_CURRENCY(){
    this.goldCoin = GoldCoin(this.REF_G)
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
    const {boss_list, current_boss_index, time} = saveInfo;
    this.time = time;
    boss_list.forEach((item, index) => {
      this.boss_list[index].hp = BigInt(item.hp);
    });
    this.current_boss_index = current_boss_index;
  }

  LOAD_MEMENTO() {
    let saveInfo = localStorage.getItem('sg_lsg_s');
    let mementos;
    if (saveInfo) {
      // 查看是否有遗物保存信息
      mementos = JSON.parse(saveInfo).mementos;
    }
    Object.keys(Mementos).forEach(key => {
      const item = Mementos[key];
      item.num = mementos?.[key] ?? 0;
      if (item.type === 'unique') { // 如果是独特遗物则直接放在memento_list第一层
        this.memento_list[key] = item;
      } else {
        if (!this.memento_list[item.type]) {
          this.memento_list[item.type] = [];
        }
        this.memento_list[item.type].push(item);
      }
    });

  }

  SAVE_IN_STORAGE() {
    this.time = new Date().getTime();

    // 保存遗物信息，只需要保存数量 num 即可
    const mementos = {};
    Object.keys(Mementos).forEach(key => {
      mementos[key] = Mementos[key].num;
    });

    const {gold, boss_list, current_boss_index, time} = this;
    localStorage.setItem('sg_lsg_s', JSON_with_bigInt({
      gold, boss_list, current_boss_index, time, mementos,
    }));
  }

  AUTO_SAVE() {
    this.auto_save_timer = setTimeout(() => {
      this.SAVE_IN_STORAGE();
      this.s_list.forEach(item => {
        item.SAVE_IN_STORAGE();
      });
      this.goldCoin.SAVE_IN_STORAGE()
      this.AUTO_SAVE();
    }, 1000);
  }

  initSoldierList() {
    this.s_list.push(luckBoy(this.REF_G));
    this.s_list.push(luckGirl(this.REF_G));
    this.s_list.push(oldTeacher(this.REF_G));
    this.s_list.push(fakerJD(this.REF_G));
    this.s_list.push(chief(this.REF_G));


    this.s_list.forEach(item => {
      item.CALC_OFFLINE_INCOME();
    });
    this.s_list.forEach(item => {
      if (item.active) {
        item.ATK();
      }
    });


  }

  target() {
    return this.boss_list[this.current_boss_index];
  }

  unlockSoldier(soldier: SoldierGenerator) {
    return soldier.UNLOCK();
  }

  getActiveSoldier() {
    return this.s_list.filter(item => item.active);
  }
}
