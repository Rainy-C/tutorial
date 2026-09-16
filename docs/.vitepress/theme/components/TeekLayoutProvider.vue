<script setup lang="ts" name="TeekLayoutProvider">
import Teek from "vitepress-theme-teek";
import NotFound from "./404.vue";
</script>

<template>
  <Teek.Layout>
    <template #not-found>
      <NotFound />
    </template>
  </Teek.Layout>
</template>
