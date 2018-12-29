<template>
     <span class="token-id">
         #{{ tokenId }}
    </span>
</template>

<script>
  export default {
    name: 'TokenIdBadge',
    props: ['tokenId']
  };
</script>

<style scoped lang="scss">
  .token-id {
    color: #000;
  }
</style>
