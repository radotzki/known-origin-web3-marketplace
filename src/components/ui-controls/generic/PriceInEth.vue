<template>
  <span class="price">{{ value | to4Dp }} ETH</span>
</template>

<script>
  export default {
    name: 'priceInEth',
    props: {
      value: {
        type: String
      }
    }
  };
</script>

<style scoped lang="scss">
  .price {
    color: #000;
  }
</style>
