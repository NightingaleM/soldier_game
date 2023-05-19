<template>

  <div class="head">
    <span class="gold">金币: {{ g.gold.sum.toLocaleString() }}</span>
    <span>x {{ g.gold.getAddMultiple() }}%</span>
  </div>
  <h4>HP: {{ g.target().hp.toLocaleString() }}</h4>

  <ul>
    <li v-for="(item,key) in g.s_list" :class="[{active: item.active}]">
      <h4>{{ item.name }}</h4>
      <template v-if="item.active">
        <div>
          <p><span>LEVEL: {{ item.atk_level }}</span>ATK: {{ item.atk }}</p>
          <button @click="toUploadAtk(item)">
            + {{ item.getCurrentATKIncrement() }} | {{ item.cost }}
          </button>
        </div>
        <div>
          <p><span>LEVEL: {{ item.spd_level }}</span>SPD: {{ item.spd / 1000 }}s</p>
          <button @click="toUploadSpd(item)">
            - {{ item.getCurrentSPDIncrement() / 1000 }} s |
            {{item.cost}} - {{ item.cost * (GOLD_CUT_MULTIPLE_NUMERATOR / g.gold.getCutMultiple()) / 1000n }}
          </button>
        </div>
      </template>
      <button v-else @click="unlockSoldier(item)">解锁</button>
      <div v-for="skill in item.skills">
        <p>{{ skill.name }} -- {{ item.level() > skill.unlockLevel ? 'unlock' : 'lock' }}</p>
        <p>{{ skill.intro }}</p>
      </div>
    </li>
  </ul>
</template>
<script setup lang="ts">
import {G} from '@/game/gameGenerator';
import {getCurrentInstance, reactive, ref} from 'vue';
import {GOLD_CUT_MULTIPLE_NUMERATOR, SoldierGenerator} from '@/game/soldierGenerator';

const internalInstance = getCurrentInstance();
// 操作数据后更新视图


const g = reactive(new G());
g.SET_REF_SELF(g);

const unlockSoldier = (soldier: SoldierGenerator) => {
  g.unlockSoldier(soldier);
};

const toUploadAtk = (item: any) => {
  item.UPGRADE_ATK();
  internalInstance?.ctx?.$forceUpdate();
};

const toUploadSpd = (item: any) => {
  item.UPGRADE_SPD();
  internalInstance?.ctx?.$forceUpdate();
};

</script>
<style scoped lang="less">
ul {
  li {
    background-color: var(--paper-deep-yellow);
    color: #000;
    padding: 1rem;
  }

  li.active {
    background-color: var(--paper-yellow);
  }
}
</style>
