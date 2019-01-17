<template>
  <div class="mt-2 pt-4 text-center" v-if="isSoldOut">
    <p>
      Edition Sold Out
    </p>
    <p>
      Check out more work from this
      <router-link :to="{ name: 'artist', params: { artistAccount: edition.artistAccount } }">
        artist
      </router-link>
    </p>
  </div>
</template>

<script>
  export default {
    name: 'EditionSoldOut',
    components: {},
    props: {
      edition: {
        type: Object
      }
    },
    computed: {
      isSoldOut() {
        return this.edition.totalAvailable - this.edition.totalSupply <= 0;
      },
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card-flex.scss';

</style>


