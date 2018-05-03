<template>
  <span class="price">Price {{ value }} ETH</span>
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
</style>
