<template>
  <div>
    <div class="spinner"></div>
  </div>

</template>

<script>
  export default {
    components: {},
    name: 'loadingSpinner'
  };
</script>

<style scoped lang="scss">

  $primary: #3e27d9;
  $body-bg: #f2f5fb;

  .spinner {
    width: 80px;
    height: 80px;

    border: 2px solid $body-bg;
    border-top: 3px solid $primary;
    border-radius: 100%;

    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;

    animation: spin 1s infinite linear;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
