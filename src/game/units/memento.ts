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


};
