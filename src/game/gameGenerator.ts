import { reactive } from 'vue';
import { SoldierGenerator } from '@/game/generators/SoldierGenerator';
import { CurrencyGenerator } from '@/game/generators/CurrencyGenerator';
import { SKILL_BOOK } from '@/game/units/skill';
import { JSON_with_bigInt } from '@/game/utensil';
import * as Heroes from '@/game/units/Heroes';
import { Mementos } from '@/game/units/memento';
import { GoldCoin } from '@/game/units/currencys';
import * as Monsters from '@/game/units/monsters';

export class G {
  REF_G; // 被proxy代理过的 G实例， 应为 在vue中，视图是使用的代理过的proxy，如果直接使用为代理的实例，无法及时更新
  boss_list: any[] = [];
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
  reloadTimes = 0;

  memento_list = {
    before_upgrade_spd: {},
    before_upgrade_atk: {},
    before_append_gold: {},
    before_invest_gold: {},
    before_atk: {},
    after_atk: {},
  };

  // 未分类的遗物列表
  memento_list_unique = {};

  current_boss_index: number = 0; // 第几个boss
  s_list = {};
  // 金币-货币
  goldCoin: CurrencyGenerator;

  auto_save_timer = null;
  time: number = 0;
  timers = {};
  // 是否显示关闭游戏的提示
  closeMSG: boolean = false;

  constructor() {

  }

  SET_REF_SELF(G) {
    this.REF_G = G;
    this.INIT_GAME();
    setTimeout(() => {
      this.AUTO_SAVE();
    }, 100);
  }

  INIT_GAME() {
    this.INIT_CURRENCY(); // 加载货币数据
    this.INIT_MONSTER();
    this.LOAD_MEMENTO(); // 加载遗物数据，遗物数据的历史数据加载将在这里完成
    this.LOAD_SAVE(); // 查看并加载历史数据
    this.INIT_SOLDIER(); // 初始化所有士兵，如果有离线收益，还需要等计算完所有离线收益后再开始攻击。
    this.INIT_GLOBAL_EFFECT();
  }

  INIT_CURRENCY() {
    this.goldCoin = GoldCoin(this.REF_G);
  }

  INIT_MONSTER() {
    Object.keys(Monsters).forEach(key => {
      this.boss_list.push(Monsters[key](this.REF_G))
    })
  }

  LOAD_SAVE() {
    let saveInfo = localStorage.getItem('sg_lsg_s');
    if (!saveInfo) return;
    saveInfo = JSON.parse(saveInfo);
    const { time, current_boss_index } = saveInfo;
    this.time = time;
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
      if (item?.numType === 'BigInt') {
        item.num = BigInt(item.num);
      }
      if (item.type === 'unique') { // 如果是独特遗物则直接放在memento_list第一层
        this.memento_list[key] = item;
        this.memento_list_unique[key] = item;
      } else {
        if (!this.memento_list[item.type]) {
          this.memento_list[item.type] = {};
        }
        this.memento_list[item.type][key] = item;
        this.memento_list_unique[key] = item;
      }
    });
  }

  ADD_MEMENTO(name) {
    const type = Mementos[name].type;
    if (type === 'unique') {
      //   如果是独特遗物且获取量没有超过上限，则数量+1
      if (this.memento_list[name].num < Mementos[name].max) {
        this.memento_list[name].num++;
        this.memento_list_unique[name].num++;
      } else {
        //   TODO: 超出上限，转化成其他货币
      }
    } else {
      // 如果不是独特遗物，则直接放入数组
      if (this.memento_list[type][name].num < this.memento_list[type][name].max) {
        this.memento_list[type][name].num++;
        this.memento_list_unique[name].num++;
      } else {
        //   TODO: 超出上限，转化成其他货币
      }
    }
  }

  SAVE_IN_STORAGE() {
    this.time = new Date().getTime();

    // 保存遗物信息，只需要保存数量 num 即可
    const mementos = {};
    Object.keys(Mementos).forEach(key => {
      mementos[key] = Mementos[key].num;
    });

    const { current_boss_index, time } = this;
    localStorage.setItem('sg_lsg_s', JSON_with_bigInt({
      current_boss_index, time, mementos,
    }));
  }

  AUTO_SAVE() {
    this.auto_save_timer = setTimeout(() => {
      this.SAVE_IN_STORAGE();
      Object.values(this.s_list).forEach(item => {
        item.SAVE_IN_STORAGE();
      });
      this.boss_list.forEach(item => {
        item.SAVE_IN_STORAGE();
      });
      this.goldCoin.SAVE_IN_STORAGE();
      this.AUTO_SAVE();
    }, 1000);
  }

  INIT_SOLDIER() {
    //  分三次是为了正确触发一些英雄技能
    Object.keys(Heroes).forEach(key => {
      this.s_list.push(Heroes[key](this.REF_G))
    })

    Object.values(this.s_list).forEach(item => {
      item.CALC_OFFLINE_INCOME();
    });

    Object.values(this.s_list).forEach(item => {
      if (item.active) {
        item.ATK();
      }
    });


  }

  INIT_GLOBAL_EFFECT() {
    this.getActiveSoldier().forEach(s => {
      s.skills.filter(item => {
        return (item.type === 'global') && (s.level() >= item.unlockLevel);
      }).forEach(item => {
        this.timers[`${s.name}_${item.id}`] = item.effect({ skill: item, G: this, S: s });
      });
    });
    this.target()?.aliveEffect();


  }

  target() {
    return this.boss_list[this.current_boss_index];
  }

  nextTarget() {
    // TODO: 如果是最后一个怪物的话，需要判断是否需要重置
    if (this.current_boss_index === this.boss_list.length - 1) {
      this.reloadWord()
    } else {
      this.current_boss_index++;
      return this.target();
    }
  }

  reloadWord() {
    this.reloadTimes++
    this.current_boss_index = 0

    this.goldCoin = GoldCoin(this.REF_G);

    this.s_list.forEach(s => {
      s.RELOAD()
    })
    this.boss_list.forEach(b => {
      b.RELOAD()
    })
  }

  unlockSoldier(soldier: SoldierGenerator) {
    return soldier.UNLOCK();
  }

  getActiveSoldier() {
    return Object.values(this.s_list).filter(item => item.active);
  }
}
