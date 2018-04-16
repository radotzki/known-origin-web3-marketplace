<template>
  <span>
    <figure class="thumbnail">
      <span class="edition-type">{{ edition.type }} artwork</span>
      <img :src="edition.lowResImg"/>
    </figure>

    <div class="edition-run-container">
      <span class="edition-run" v-if="!isAsset">1 of {{ assetsForEdition(edition.edition).length }}</span>
      <span class="edition-run" v-if="isAsset"><token-id :value="edition.id"></token-id></span>
    </div>

    <div v-if="isAsset && edition.purchased != 0 || !isAsset && availableAssetsForEdition(edition.edition).length == 0" class="sold-bar">
        <h3>SOLD</h3>
    </div>
  </span>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import TokenId from './ui-controls/TokenId';

  export default {
    name: 'assetFigure',
    components: {
      TokenId
    },
    props: ['edition', 'isAsset'],
    computed: {
      ...mapGetters([
        'assetsForEdition',
        'availableAssetsForEdition'
      ]),
    }
  };
</script>

<style scoped lang="scss">
  $white: #FDFDFD;
  $sold: red;

  .edition-run-container {
    padding-top: 3px;
    padding-left: 5px;
    margin-top: 5px;
  }


  h3 {
    padding-left: 0px;
    margin-bottom: 0px;
    padding-top: 5px;
    padding-bottom: 5px;
    color: $white;
    text-align: center;
  }

  .sold-bar {
    background-color: $sold;
    margin-top: 5px;
    margin-bottom: 0px;
    opacity: 0.6;
    color: $white;
  }
</style>
