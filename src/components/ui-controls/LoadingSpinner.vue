<template>
  <div class="text-center text-blue">
    <p>
      <br />
      <font-awesome-icon :icon="['fas', 'sync']" size="6x" spin></font-awesome-icon>
    </p>
    <p>
      <br />
      <span class="loading">Loading...</span>
    </p>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    components: {FontAwesomeIcon},
    name: 'loadingSpinner'
  };
</script>

<style scoped>

</style>
