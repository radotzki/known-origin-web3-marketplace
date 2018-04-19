<template>

  <div class="card" v-if="edition">
    <img class="card-img-top" :src="edition.lowResImg"/>
    <!--<asset-figure :edition="edition"></asset-figure>-->
    <div class="card-body">

      <edition-name-by-artist :edition="edition" :purchase="purchase"></edition-name-by-artist>

      <p class="card-text">{{ edition.description }}</p>

      <p class="card-text"><small class="text-muted">{{ availableAssetsForEdition(edition.edition).length }} available</small></p>
    </div>
    <ul class="list-group list-group-flush">
      <li class="list-group-item"><price-in-eth :value="edition.priceInEther"></price-in-eth></li>
    </ul>
    <div class="card-footer text-center" v-if="!purchase">
      <router-link :to="{ name: 'confirmPurchase', params: { artistCode: edition.edition.substring(0, 3), edition: edition.edition }}">
        View details
      </router-link>
    </div>
    <div class="card-footer" v-if="purchase">
      <confirm-purchase-button :edition="edition"></confirm-purchase-button>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import PriceInEth from './ui-controls/PriceInEth.vue';
  import EditionNameByArtist from './ui-controls/EditionNameByArtist.vue';
  import ConfirmPurchaseButton from './ui-controls/ConfirmPurchaseButton';
  import AssetFigure from './AssetFigure.vue';

  export default {
    name: 'galleryEdition',
    components: {PriceInEth, AssetFigure, EditionNameByArtist, ConfirmPurchaseButton},
    props: {
      edition: {
        required: true,
        type: Object
      },
      purchase: {
        type: Boolean
      },
    },
    computed: {
      ...mapGetters([
        'availableAssetsForEdition',
      ]),
    },
    methods: {
    }
  };
</script>

<style scoped>
</style>
