<template>
  <img :src="logo" />
</template>

<script>
  export default {
    name: 'artistImage',
    props: ['logo'],
  };
</script>

<style scoped lang="scss">
  img {
    height: 75px;
    width: 75px;
    border-radius: 50%;
  }
</style>
