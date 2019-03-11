<template>
  <div  v-if="isOnSale">
      Available {{(edition.startDate || Date.now()) | moment("from", "now")}}
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'EditionNotOnSaleYet',
    components: {},
    props: {
      edition: {
        type: Object
      }
    },
    computed: {
      ...mapGetters('kodaV2', [
        'isStartDateInTheFuture',
      ]),
      isOnSale() {
        return this.edition && this.isStartDateInTheFuture(this.edition.startDate);
      },
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card-flex.scss';

</style>


