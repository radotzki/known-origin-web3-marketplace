<template>
  <span class="price">{{ value | to4Dp }} ETH</span>
</template>

<script>
  export default {
    name: 'priceInEth',
    props: ['value']
  };
</script>

<style scoped lang="scss">
  .price {
    color: #000;
  }
</style>
