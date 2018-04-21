<template>
  <span class="token-id">{{ dotDotDot }}</span>
</template>

<script>
  export default {
    name: 'ethAddress',
    props: ['value'],
    computed: {
      dotDotDot: function () {
        if (this.value) {
          return this.value.substr(0, 8) + '...' + this.value.substr(this.value.length - 8, this.value.length);
        }
        return str;
      }
    }
  };
</script>

<style scoped>

</style>
