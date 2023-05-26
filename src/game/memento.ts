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





};
