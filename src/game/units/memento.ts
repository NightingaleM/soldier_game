/**
 * @file 游戏中的遗物
 * @description 游戏中的遗物列表，包括遗物的名称、介绍、类型、数量、最大数量、效果等
 * @description 遗物的效果是一个函数，接受一个对象，对象 S 为soldierGenerator 为士兵实例，对象 G 为 gameGenerator 为游戏实例
 * @description type 为遗物的类型，如果为 unique，则说明时独特遗物，在处理效果时将单独处理，其他的则统一在钩子中处理
 */
export const Mementos = {
  swift_gloves: {
    name: '迅捷手套',
    intro: '提高英雄攻击速度上限',
    type: 'unique',
    num: 0,
    max: 200,
    effect: function ({S, G}): number {
      return -this.num;
    }
  },
  agility_ring: {
    name: '灵巧之戒',
    intro: '提高英雄攻击速度成长',
    type: 'before_upgrade_spd',
    num: 0,
    max: 100,
    effect: function ({S, G}: { SoldierGenerator, G }): number {
      return S.getCurrentSPDIncrement() * this.num / 100;
    }
  },
  time_ship: {
    name: '时间穿梭引擎',
    intro: '可以在时间河流中畅游,每拥有一个可以多结算3分钟离线奖励',
    type: 'unique',
    num: 0,
    max: 200,
    effect: function (): number {
      return this.num * 3 * 60;
    }
  },
  time_gloves: {
    name: '时间手套',
    intro: '可以在时间河流中捞点东西，每拥有一个可以提高2%的离线奖励',
    type: 'unique',
    num: 0,
    max: 500,
    effect: function (): number {
      return +(this.num * 2 / 100).toFixed(4);
    }
  },

  // 生锈的铁钉
  rusty_nail: {
    name: '生锈的铁钉',
    intro: '每次攻击对敌人造成固定伤害',
    type: 'before_atk',
    numType: 'BigInt',
    num: 0n,
    max: Infinity,
    effect: function ({S, G}: { SoldierGenerator, G }): BigInt {
      return this.num;
    }
  },

  // 老鼠和蟑螂小弟
  mouse_and_cockroach: {
    name: '老鼠和蟑螂小弟',
    intro: '怎么也杀不完，干脆驯化成小弟了，每次攻击可以获取固定量的金币',
    type: 'after_atk',
    numType: 'BigInt',
    num: 0n,
    max: Infinity,
    effect: function ({S, G}: { SoldierGenerator, G }) {
      G.goldCoin.changeSum(BigInt(this.num));
    }
  },

  // 野兽内丹
  beast_essence: {
    name: '野兽内丹',
    intro: '每次升级攻击力时固定提高攻击力',
    type: 'before_upgrade_atk',
    numType: 'BigInt',
    num: 0n,
    max: Infinity,
    effect: function ({S, G}: { SoldierGenerator, G }) {
      return this.num;
    }
  }
};
