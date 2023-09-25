<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
</script>

<template>

  <header>
    <RouterLink to="/calculateTest">calculateTest</RouterLink>
  </header>
  <div class="main">
    <RouterView/>
  </div>
</template>

<style scoped>

</style>
