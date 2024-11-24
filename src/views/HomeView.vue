<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import {markRaw, ref} from "vue";

class CC {
  #name = '11'
  get name() {
    return this.#name
  }
}

const reloadAll = () => {
  localStorage.clear()
  location.reload()
}

const c = markRaw(new CC())
</script>

<template>
  <main>
      {{c.name}}
    <RouterLink to="/calculateTest">calculateTest</RouterLink>
    <button @click="reloadAll">重置所有内容</button>
    <!--    <TheWelcome />-->
  </main>
</template>
