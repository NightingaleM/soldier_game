<template>

  <div class="head">
    <h4 class="gold">{{ g.goldCoin.sum.toLocaleString() }}</h4>
    <!--    <span>x {{ g.gold.getAddMultiple() }}%</span>    -->
    <div class="boss-box">
      <h4>{{ g.target().hp.toLocaleString() }}</h4>
    </div>
  </div>

  <div class="content">

    <div class="soldier-box" ref="soldierBoxRef">
      <ul>
        <li v-for="(item,key) in g.s_list"
            :class="[{unlock: item.active},{showing: currentShowingSoldierName === item.name}]"
            @click="setCurrentShowingSoldierName(item.name)"
            :id="item.name"
        >
          <div class="infos">
            <img src="" alt="">
            <div class="info-box">

              <h4>{{ item.name }} <span class="level">{{ item.level() }}级</span></h4>
              <p class="attr">攻击力：{{ item.atk.toLocaleString() }}</p>
              <p class="attr">攻击间隔：{{ item.spd / 1000 }}s</p>
              <div class="msg-box"></div>
              <button class="unlock" v-if="!item.active" @click.stop="unlockSoldier(item)">{{
                  item.cost.toLocaleString()
                }} - 解锁
              </button>
            </div>

          </div>
          <div class="option-skill-box">
            <template v-if="item.active">
              <div class="attr-option" @click.stop="toUploadAtk(item)">
                <p>
                  <span>Lv: {{ item.atk_level }}</span>
                  <span>升级攻击力 + {{ item.getCurrentATKIncrement().toLocaleString() }} </span>
                </p>
                <div class="cost">
                  升级花费：{{
                    (item.cost * (g.goldCoin.GOLD_CUT_MULTIPLE_NUMERATOR / g.goldCoin.getCutMultiple()) / 1000n).toLocaleString()
                  }}
                  <span>{{ item.cost.toLocaleString() }}</span>
                </div>
              </div>
              <div class="attr-option" @click.stop="toUploadSpd(item)">
                <p>
                  <span>Lv: {{ item.spd_level }}</span>
                  <span>升级攻击间隔 - {{ item.getCurrentSPDIncrement() / 1000 }} s</span>
                </p>
                <div class="cost">
                  升级花费：{{
                    (item.cost * (g.goldCoin.GOLD_CUT_MULTIPLE_NUMERATOR / g.goldCoin.getCutMultiple()) / 1000n).toLocaleString()
                  }}
                  <span>{{ item.cost.toLocaleString() }}</span>
                </div>
              </div>
            </template>
            <div v-for="skill in item.skills" :key="skill.name"
                 :class="['skill',{unlock: item.level() > skill.unlockLevel}]">
              <p>{{ skill.name }} <span class="unlock-level"
                                        v-if="item.level() <= skill.unlockLevel">{{ skill.unlockLevel }}级解锁</span>
              </p>
              <p>{{ skill.intro }}</p>
            </div>
          </div>

        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import {G} from '@/game/gameGenerator';
import {getCurrentInstance, onMounted, reactive, ref} from 'vue';
import {SoldierGenerator} from '@/game/generators/SoldierGenerator';

const internalInstance = getCurrentInstance();

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

const currentShowingSoldierName = ref('');

const setCurrentShowingSoldierName = (name) => {
  if (currentShowingSoldierName.value === name) {
    currentShowingSoldierName.value = '';
    return;
  }
  currentShowingSoldierName.value = name;
};


</script>
<style scoped lang="less">
.head {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: var(--color-background);

  .gold {
    color: gold;
    text-shadow: 0.3px 0.2px #6e5932;
    text-align: center;
    font-size: 24px;
    font-weight: bolder;
  }

  div.boss-box {
    h4 {
      color: #ff1515;
      text-shadow: 0.3px 0.2px #6e5932;
      text-align: center;
      font-size: 24px;
      font-weight: bolder;
    }
  }
}

div.content {


  div.soldier-box {
    ul {
      li {
        background-color: var(--paper-deep-yellow);
        color: #000;
        padding: 1rem;
        margin-bottom: 1rem;

        .infos {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          position: relative;

          img {
            width: 10rem;
            height: 10rem;
            margin-right: 2rem;
            background-color: #00bd7e;
          }

          .info-box {
            flex: 1;

            .attr {
              font-size: 12px;
            }

            button {
              right: 0;
              top: 50%;
              transform: translateY(-50%);
              position: absolute;
              outline: none;
              border: none;
              padding: .3rem 1rem;
              background-color: var(--paper-yellow);
            }

            .msg-box {
              position: absolute;
              width: 1rem;
              height: 100%;
              //border: 1px solid red;
              right: 25%;
              top: 0;
            }
          }
        }

        .option-skill-box {
          margin-top: .5rem;
          max-height: 0;
          transition: max-height 0.3s;
          overflow: hidden;

          .attr-option {
            //display: flex;
            //justify-content: space-between;
            //align-items: center;
            border: 1px solid var(--color-background);
            padding: 1rem 2rem;
            margin-bottom: 1rem;

            p {
              margin: 0;
              display: flex;

              span:first-child {
                margin-right: 3rem;
              }
            }

            .cost {
              span {
                text-decoration: line-through;
                font-size: 1.2rem;
              }
            }
          }

          .skill {
            opacity: 0.5;
            border-bottom: 1px dashed var(--paper-dark);

            &:last-child {
              border-bottom: none;
            }
          }

          .skill.unlock {
            opacity: 1
          }
        }
      }

      li.unlock {
        background-color: var(--paper-yellow);
      }

      li.showing {
        .option-skill-box {
          max-height: 50rem;
        }
      }
    }
  }
}
</style>
<style>
.msg {
  animation: msgAnimation 1s ease;
  position: absolute;
  width: max-content;
  text-align: center;
  left: 50%;
  transform: translate(-50%, 100%);
  /*display: flex;*/
  /*flex-direction: column;*/
  /*align-items: center;*/
  /*justify-content: center;*/
  /*text-align: center;*/
  /*top: 50%;*/
  /*left: 50%;*/
  /*transform: translate(-50%, -50%);*/
}

@keyframes msgAnimation {
  0% {
    opacity: 1;
    transform: translate(-50%, 100%);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, 0%);
  }
}

</style>
